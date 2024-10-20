---
date: 2021-02-16
title: 使用 Tye 辅助开发 k8s 应用竟如此简单（四）
tags:
  - Newbe.Claptrap
  - Tye
---

续上篇，这篇我们来进一步探索 Tye 更多的使用方法。本篇我们来了解一下如何在 Tye 中如何进行日志的统一管理。

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## 必不可少的日志管理

对应用进行日志记录和分析是诊断排查线上问题的重要手段。而简单基于控制台或者文件的直接记录既不利于开发者直接读取也不利于大规模分析。

因此，开发者往往会选择一些诸如`Exceptionless`或者`ELK`之类的日志管理方案，来实现线上环境的日志管理。

但是，我们仍然缺少一个在开发环境小巧可用、部署简易、最小资源占用、可视化良好的日志管理方案。

故而，本案例，让我们来使用`Tye`中已经扩展可用的`Seq`工具，来作为开发环境的日志管理和可视化工具。

## 创建测试应用

```bash create-tye-seq-test.sh
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln ./TyeTest.sln add ./TyeTest/TyeTest.csproj
tye init
```

通过以上命令，我们创建了一个测试的 API 项目，并且创建出了 tye.yml 文件。

直接使用`tye run`命令启动应用，我们其实可以在 tye dashboard 中查看到查看到以控制台方式输出的日志：

![console log](/images/20210216-001.png)

缺陷也非常明显，这种方式非常不利于阅读和分析。

## 启用 Seq 记录和查看日志

打开 tye.yml ，加入 seq 的扩展配置:

```yml tye.yml
name: tyetest
extensions:
  - name: seq
    logPath: ./.logs
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
```

从上面的配置可以看出：

1. 只是增加了一个 extensions 节点。在其中设置了一个 seq 的子节点并配置了日志存储的位置。

使用`tye run`启动后，可以在 dashboard 中查看到启动好的 seq 服务。

![seq service](/images/20210216-002.png)

打开 seq 便可以看到 seq 的查询界面：

![seq search](/images/20210216-003.png)

使用浏览器调用一下 swagger 界面中的 API。便可以在 seq 中查看到最新的日志。

![seq logs](/images/20210216-004.png)

这便是使用 seq 最简单的一种方式。

seq 的搜索方式是非常类似于 SQL 的流式查询语句，开发者可以通过以下链接学习如何使用 UI 进行查询：

<https://docs.datalust.co/docs/the-seq-query-language>

## 我不想每次都重新部署 Seq

我们都知道， Tye 在停止运行时会尝试停止此次所有部署的容器，Seq 也是以容器的方式运行，因此，每次停止 Tye 时，容器都会被自动移除。这其实有点浪费时间。

因此，此处在进一步介绍如何在本地长久部署一个 Seq 实现重复利用。

实际上，根据 Tye 中的代码，如果服务中已经存在一个名称为`seq`的服务，那么就会自动使用该服务，而跳过创建步骤。

故此，我们只要本地部署一个 seq 服务，然后在`tye.yml`添加这个服务即可。

Seq 可以使用 Windows 安装包或者使用 docker 的方式进行安装。本示例将使用 docker 进行安装：

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

使用`docker-compose up -d`方式长久启动 seq。那么就可以在 <http://localhost:5380> 查看到 seq dashboard。

然后，我们修改`tye.yml`:

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

> tye 源码关于 seq 创建方式的判断位置：
> <https://github.com/dotnet/tye/blob/master/src/Microsoft.Tye.Extensions/Seq/SeqExtensions.cs#L15>
> docker 方式安装 seq：
> <https://docs.datalust.co/docs/getting-started-with-docker>
> Windows 直接安装 seq:
> <https://docs.datalust.co/docs/getting-started>

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
