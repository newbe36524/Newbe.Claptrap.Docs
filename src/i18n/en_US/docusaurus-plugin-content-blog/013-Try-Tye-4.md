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

Here, the main changes are:

1. You no longer need to specify this location for log storage in extensions, because this is the time for an external seq service, and it no longer means to specify this parameter.
2. Added a service called`seq`, where`external: true`specifies it as an external service.Therefore, no attempt is made to create this service at startup.

In this way the results obtained after starting with`tye run`are consistent with the previous effect.However, it is not going to restart a new seq instance every time.Instead use the seq instances that we deploy manually.A great acceleration of the speed of the start of the process.

> tye source code on the seq creation location： <https://github.com/dotnet/tye/blob/master/src/Microsoft.Tye.Extensions/Seq/SeqExtensions.cs#L15> docker way to install seq： <https://docs.datalust.co/docs/getting-started-with-docker> Windows directly install seq: <https://docs.datalust.co/docs/getting-started>

## Finally, send it to the K8S to try it out

Note that it's the same as the previous article about mongo. seq is not actively created when`tye deploy`is used.Instead it will try to use the service discovery mechanism to find a service called`seq`.This is actually a bit similar to the manual creation of the Seq instance in the previous section.

So, if you want to deploy`extensions`containing seq tye.yml.Please make sure that there is a service named seq in the k8s cluster so that the log can be exported properly.

## Summary

This article, we have successfully completed the unified management of the log by using the seq extension in Tye.At the same time you also practiced how to add a binding for the external service in the tye.

In fact, Tye not only provides seq extension log extensions, it also provides a more well-known`Elasticsearch``Kibana`scenario.

Developers can view the relevant actions at the following links:

<https://github.com/dotnet/tye/blob/master/docs/recipes/logging_elastic.md>

Next, we will further study the realization of distributed tracking in Tye.

<!-- md Footer-Newbe-Claptrap.md -->
