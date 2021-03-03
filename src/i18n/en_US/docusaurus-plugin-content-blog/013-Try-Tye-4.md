---
date: 2021-02-16
title: Developing k8s apps with the Tye help is so simple (IV)
tags:
  - Newbe.Claptrap
  - Tye
---

In the last article, let's explore Tye's more ways of using it.This article we come to find out how to perform the unified management of logs in Tye.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## Essential log management

Logging and analyzing applications is an important means to diagnose problems online.Simple console or file-based direct records are not conducive to developers' direct reading or large-scale analysis.

As a result, developers often choose log management scenarios such as`Exceptionless`or`ELK`to implement log management for online environments.

However, we still lack a log management scenario that is small and available in a development environment, easy to deploy, minimal resource footprint, and well-visualized.

So, in this case, let's use the`Seq`tool that has been extended in`Tye`as a log management and visualization tool for the development environment.

## Create a test app

```bash create-tye-seq-test.sh
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln ./TyeTest.sln add ./TyeTest/TyeTest.csproj
tye init
```

With the above command, we have created a testing API project, and a tye.yml file was created.

Start the app directly with `tye run`command, and we can actually see in the tye dashboard the logs that are output in the console:

![console log](/images/20210216-001.png)

The defect is also very apparent, and this way is very detrimental to reading and analysis.

## Enable Seq logging and viewing logs

Open tye.yml and add the extended configuration of seq:

```yml tye.yml
name: tyetest
extensions:
  - name: seq
    logPath: ./.logs
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
```

As can be seen from the configuration above:

1. Just add an extension node.A child node of seq is set up in it and the location of the log store is configured.

After starting with`tye run`, you can view the start good seq service in dashboard.

![seq service](/images/20210216-002.png)

Open seq then you can see the query interface of seq:

![seq search](/images/20210216-003.png)

Use your browser to call up the API in the swagger interface.You can see the latest logs in seq.

![seq logs](/images/20210216-004.png)

This is the easiest way to use seq.

seq is searched in a very SQL-like way, and developers can learn how to query using the UI at the following link:

<https://docs.datalust.co/docs/the-seq-query-language>

## I don't want to redeploy the Seq every time.

As we all know, Tye tries to stop all deployed containers when it stops running, and Seq runs as a container, so the container is automatically removed each time Tye is stopped.It's a bit of a waste of time.

Therefore, here is a further introduction to how to deploy a Seq for reuse locally for a long time.

In fact, according to the code in Tye, if a service with the name`seq`already exists in the service, the service is automatically used and the creation steps are skipped.

So all we have to do is deploy an seq service locally and add it at `tye.yml`.

Seq can be installed using a Windows installation package or as a docker container.This example will use docker to install:

```yml docker-compose.yml
version: '3.3'

services:
  seq:
    image: datalust/seq
    restart: always
    environment:
      ACCEPT_EULA: Y
    ports:
      - 5380:80
      - 5341:5341
    volumes:
      - ./.seqlogs:/data
```

Use`docker-compose up -d to`seq in a long-term manner.Then you can view the seq dashboard at <http://localhost:5380>.

We then modify the`tye.yml`:

```yml tye.yml
name: tyetest
extensions:
  - name: seq
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
  - name: seq
    external: true
    bindings:
      - name: http
        containerPort: 5341
```

这里，主要的改动有：

1. 不再需要在 extensions 中指定日志存储此位置，因为这个时候时候的是外部的 seq 服务，指定这个参数已经没有意义了。
2. 添加了一个名为`seq`的服务，其中`external: true`指定了其为一个外部服务。故而启动时不会尝试去创建这个服务。

这样使用`tye run`启动后得到的结果和先前效果是一致的。但是，不会在每次都重新启动一个新的 seq 实例。而是使用我们手动部署的 seq 实例。极大加快的启动速度。

> tye 源码关于 seq 创建方式的判断位置： <https://github.com/dotnet/tye/blob/master/src/Microsoft.Tye.Extensions/Seq/SeqExtensions.cs#L15> docker 方式安装 seq： <https://docs.datalust.co/docs/getting-started-with-docker> Windows 直接安装 seq: <https://docs.datalust.co/docs/getting-started>

## 最后，发到 K8S 里面试一下

注意，和前面的 mongo 一样。 seq 并不会在使用`tye deploy`时主动创建。而是会尝试使用服务发现机制去寻找名为`seq`的服务。这其实和上节中手动创建 Seq 实例有点类似。

因此，如果要部署`extensions`包含 seq 的 tye.yml。请确保 k8s 集群中存在名称为 seq 的服务，这样日志才能正常输出。

## 小结

本篇，我们已经顺利完成了使用 Tye 中的 seq 扩展来实现日志的统一管理。同时也顺便练习了如何在 tye 中将为外部服务添加绑定。

实际上，Tye 不仅仅提供了 seq 扩展日志扩展，其也提供了更加广为人知的`Elasticsearch`+`Kibana`方案。

开发者可以通过以下链接查看相关的操作方法：

<https://github.com/dotnet/tye/blob/master/docs/recipes/logging_elastic.md>

下一篇，我们将进一步研究在 Tye 中实现对分布式链路追踪的实现。

<!-- md Footer-Newbe-Claptrap.md -->
