---
date: 2020-08-16
title: 年轻的樵夫哟，你掉的是这个免费8核4G公网服务器，还是这个随时可用的Docker实验平台？
---

小孩子才做选择，成年人全都要。那么我们现在就来看看如何获得一台免费的 8 核 4G 公网 Docker 实验平台服务器。

<!-- more -->

## Play With Docker

直接打开<https://labs.play-with-docker.com/>即可访问 Play With Docker 平台。 注册一个 DockerHub 账号便可以访问这个站点，轻松地获得一台 8 核 4G 的公网服务器。 接下来我们就来了解一下如何使用这台服务器进行一些 Docker 的操作。

## 部署 Nginx

本示例，我们部署一个 nginx ，并且通过将服务公开在一个公网地址上。

### 登录并创建实例

这一步非常简单，不多说明，成功创建完成之后便可以看到如下所示的界面。

![操作界面](/images/20200816-001.png)

### 拉取镜像

运行以下命令，便可以拉取最新的 nginx 镜像。

```bash
docker pull nginx
```

拉取速度非常快速，因为这个实例节点是部署在国外的，因此无需设置镜像也可以极速下载。

### 启动 nginx 容器

运行以下命令，便可以启动一个 nginx container

```bash
docker run --name nginx-test -p 8080:80 -d nginx
```

### 公网访问

部署完成之后，界面上会自动出现一个新的按钮，表示当前可以已经部署成功的公网地址，如下图所示：

![公网访问的按钮](/images/20200816-002.png)

点击按钮便可以在浏览器中访问刚刚部署成功的 nginx 服务。

如果生成按钮，也可以点击“OPEN PORT”来选择开放的端口。

## 部署火车票售票系统

如果只是部署一个简单的 nginx 显然不够快乐。因此，我来部署一个稍微复杂一点的系统。

这是一个由 7 个容器构成的演示系统，参考[《火车票售票系统-部署》](https://claptrap.newbe.pro/zh_Hans/3-Sample/1-Newbe-Claptrap-Ticketing/3-Deployment)的说明，运行以下命令来启动一个模拟的火车票售票系统：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-compose build
cd Docker/LocalClusterMongodb
docker-compose up -d
```

脚本运行完成之后，通过“OPEN PORT”打开 10080 端口，便可以查看刚刚部署完成的火车票模拟售票系统。 ![模拟售票系统界面](/images/20200816-003.png)

<!-- md Footer-Newbe-Claptrap.md -->
