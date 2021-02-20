---
date: 2021-02-17
title: 使用 Tye 辅助开发 k8s 应用竟如此简单（六）
tags:
  - Newbe.Claptrap
  - Tye
---

续上篇，这篇我们来进一步探索 Tye 更多的使用方法。本篇我们将进一步研究 Tye 与分布式应用程序运行时 Dapr 如何碰撞出更精彩的火花。

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## 巧了，巧了，真是巧了

今天正值 dapr 1.0 发布的日子。如果你暂时还不了解什么是 dapr。

那不如通过以下简短的视频来了解一下什么是 dapr：

<https://www.bilibili.com/video/BV1xz4y167XA/>

简单来说， dapr 为开发者提供了一个开发云原生应用所需构件的一个抽象层。透过这个抽象层，开发者可以节约很多基础设施上所需要投入的精力，进一步得到自我解放。

## 安装 Dapr runtime

为了在开发环境运行 dapr runtime。 需要先在开发机上进行一些简单的安装。

开发者可以通过 dapr 文档库中的 get started 章节来了解如何在本地初始化开发环境：

<https://docs.dapr.io/getting-started/>

当然，你也可以通过社区提供的中文文档库来了解相关过程:

<https://dapr-cn.gitee.io/getting-started/>

> dapr 中文社区致力于为中文用户提供更加易读的 dapr 文档中文译制内容。现在，我们仍然需要更多志同道合的伙伴一同献力，协作奋进。如果您有意愿，欢迎前往项目首页进行了解：<https://github.com/dapr-cn/docs>

## 创建测试应用

首先，我们创建一个和 [《使用 Tye 辅助开发 k8s 应用竟如此简单（二）》](011-Try-Tye-2) 中提到一样的测试用例。

即，包含两个服务的测试应用。

然后，修改`tye.yml`以加入 dapr 扩展：

```yml tye.yml
name: tyetest
extensions:
  - name: dapr
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
  - name: tyetest2
    project: TyeTest2/TyeTest2.csproj
```

运行`tye run`，便可以在 tye dashboard 中查看成功运行的服务实例和 dapr 实例：

![dapr instance](/images/20210217-001.png)

使用 swagger 页面，可以正常的访问服务。

同时，按照 dapr http 访问服务也是可以的：

```http
GET http://localhost:5295/v1.0/invoke/tyetest/method/WeatherForecast
```

使用以上方式访问得到的结果和 swagger 得到的一样。其中 5295 端口就是上图中所示的 dapr http 终结点。可以通过日志查看到这个信息：

```bash tyetest.log
[tyetest-dapr_6432571f-b]:C:\Users\Administrator/.dapr/bin/daprd.exe -app-id tyetest -app-port 5290 -dapr-grpc-port 5294 --dapr-http-port 5295 --metrics-port 5296 --placement-host-address localhost:5289
```

这便是使用 tye 简化 dapr 应用开发的简易示例。

## 来点复杂的例子

下面，我们来尝试运行 Newbe.Claptrap 的最新模板项目，体验一下 Tye 与 dapr 结合的强力效果。

### 安装项目模板

进入 nuget.org 查询最新的 Newbe.Claptrap.Template 版本，并且使用界面上的命令行安装项目模板：

<https://www.nuget.org/packages/Newbe.Claptrap.Template/>

```bash install.sh
dotnet new --install Newbe.Claptrap.Template::0.9.4
```

### 使用模板创建项目

创建一个文件夹，然后在文件夹中运行以下命令以创建项目：

```bash new.sh
dotnet new newbe.claptrap --name HelloClaptrap
```

### 部署辅助组件

新建好的项目中存在一个`docker-compose.yml`文件，用于开发者部署 seq 和 zipkin 等等辅助组件。

将此文件移动到单独的位置，使用`docker-compose up -d`便可以顺利启动服务。

当然，开发者也可以自行采用其他方式部署，或者不要部署。这并非必要的内容。

### 启动项目

在解决方案文件夹，使用`tye run`便可以顺利启动项目。启动之后可以在 tye dashboard 上查看到项目模板包含的所有项目：

![newbe.claptrap service](/images/20210217-002.png)

进入`helloclaptrap-webapi`服务的 swagger 页面。调用`​/AuctionItems​/{itemId}​/status`API：

![newbe.claptrap AuctionItems​](/images/20210217-003.png)

这就说明服务已经全部启动成功了。

这实际上是一个拍卖竞价的样例项目。更多的细节可以前往 <https://claptrap.newbe.pro> 进行了解。

调用之后可以在 Jaeger UI 上查看到服务之间的调用关系和性能细节：

![newbe.claptrap AuctionItems​](/images/20210217-004.png)

## 小结

本篇，我们尝试了 Tye 和 Dapr 的联动操作。初步体验了一下 dapr 的特性。

开发者如果想要了解更多关于 dapr 的内容，欢迎阅读官网文档进行了解。

至此，本系列也就告一段落。如果您觉得本系列内容对您有所帮助，欢迎转发、评论、收藏文章以及项目。

本系列所有测试代码，均可以在以下仓库查看：

<https://github.com/newbe36524/Newbe.Demo/tree/master/src/BlogDemos/Newbe.Tye>

<!-- md Footer-Newbe-Claptrap.md -->
