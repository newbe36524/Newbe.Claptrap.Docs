---
title: "第一步-开发环境准备"
description: "第一步-开发环境准备"
---

Newbe.Claptrap 框架依托于一些关键性的基础组件和一些可选的辅助组件。本篇我们来介绍一下如何准备一个开发环境。

<!-- more -->

## 必要组件

这些组件是使用本框架进行开发是必须要安装的组件。

### Docker Desktop

Docker Desktop 是以下所有组件运行的基础。开发可以通过以下链接下载对应操作系统的版本并进行安装：

<https://www.docker.com/products/docker-desktop>

安装完毕后，可以在控制台中使用以下命令验证安装效果：

```bash
PS C:\Repos\newbe\Newbe.Claptrap.Docs\src> docker --version
Docker version 20.10.2, build 2291f61
```

中国大陆用户，需要为 Docker Desktop 配置好加速镜像。这将有助于后续环境的安装。

### dotnet SDK

本框架依赖于 net 5 SDK 和 runtime。开发者可以通过以下链接下载最新的 SDK 并按照提示进行安装：

<https://dotnet.microsoft.com/download/dotnet/5.0>

安装完毕后，可以在控制台中使用以下命令验证安装效果：

```bash
PS C:\Repos\newbe\Newbe.Claptrap.Docs\src> dotnet --version
5.0.103
```

### Tye

Tye 是有微软开发提供的一款简化分布式应用开发的辅助命令行工具。

开发者可以在以下链接中找到最新的安装命令行脚本：

<https://www.nuget.org/packages/Microsoft.Tye>

安装完毕后，可以在控制台中使用以下命令验证安装效果：

```bash
PS C:\Repos\newbe\Newbe.Claptrap.Docs\src> tye --version
0.6.0-alpha.21070.5+a42e4463943e3136dbd1de38474d8d62b802797c
```

### Dapr

Dapr 是 Newbe.Claptrap 运行的基石。可以通过以下官方文档了解开发环境的安装方式：

<https://docs.dapr.io/getting-started/>

中文用户也可以通过以下链接查看中文介绍：

<https://dapr-cn.gitee.io/getting-started/>

安装完毕后，可以在控制台中使用以下命令验证安装效果：

```bash
PS C:\Repos\newbe\Newbe.Claptrap.Docs\src> dapr --version
CLI version: 1.0.0
Runtime version: 1.0.0
```

### 数据库

Newbe.Claptrap 目前支持 `SQLite`/`Mysql`/`PostgreSQL`/`Mongodb` 多种数据库。

开发者可以选择已经部署好的应用实例，也可以通过以下链接获取本项目开发时使用的`docker-compose.yml`文件以部署数据库：

<https://github.com/newbe36524/Newbe.Claptrap/tree/master/src/Docker/Database>

## 可选组件

这些组件是使用本框架进行开发时可选的组件。只有当需要使用到特定特性时才需要使用到。不过，我们仍然建议开发者安装这些组件。这样有助于开发者更有效的了解系统的运行情况。

### Grafana

Grafana 可以将系统的监控数据以图表的形式展示出来，是一个非常优秀的开源方案。

开发者可以使用以下链接中提供的`docker-compose.yml`来创建一个用于本项目的 Grafana 实例:

<https://github.com/newbe36524/Newbe.Claptrap/tree/master/src/Docker/Monitor>

### Jaeger

Jaeger 是一款分布式链路监控工具，可以帮助开发者进一步了解服务间的关系和性能细节。

开发者可以通过以下链接提供的`docker-compose.yml`来构建一个用于本项目的 Jaeger 实例：

<https://github.com/newbe36524/Newbe.Claptrap/tree/master/src/Newbe.Claptrap.Template/HelloClaptrap>

也可以从本项目的项目模板中找到这个`docker-compose.yml`文件。关于项目模板的详细介绍，将在下节进行说明。

### Seq

Seq 是一款高效的分布式日志管理工具，可以帮助开发者对多个应用程序的日志进行收集和可视化。

开发者可以通过以下链接提供的`docker-compose.yml`来构建一个用于本项目的 Seq 实例：

<https://github.com/newbe36524/Newbe.Claptrap/tree/master/src/Newbe.Claptrap.Template/HelloClaptrap>

也可以从本项目的项目模板中找到这个`docker-compose.yml`文件。关于项目模板的详细介绍，将在下节进行说明。

## 小结

本篇，我们初步了解了如何为 Newbe.Claptrap 项目初始化一个基础可用的开发环境。

下一篇，我们将使用该环境以及项目模板，创建第一个 Newbe.Claptrap 项目。
