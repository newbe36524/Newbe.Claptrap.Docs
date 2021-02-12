---
title: '部署'
description: '火车售票系统-部署'
---


<!--
## 在线体验

该样例已经被部署在 <http://ticketing.newbe.pro> 网站上。

### 限时开放（还在备案）

由于运营成本的原因，该系统仅在以下特定的时段开放：

| 日期   | 时段        |
| ------ | ----------- |
| 工作日 | 12:00-14:00 |
| 工作日 | 20:00-22:00 |
| 周末   | 19:00-23:00 |

每次重新开放时，系统将会被重置，上一次开放的所有数据将被清空。

#### swagger 文档

为了更有效的抢票，开发者可以根据 swagger 文档给出的 API 开发自动抢票工具。文档地址<http://ticketing.newbe.pro/swagger> -->

## 独立部署

开发者也可以使用源码在本地的 docker 环境进行独立部署。只需要按照以下的步骤进行操作即可。

1. 确保本地已经正确安装了 docker 环境，并且能够使用 docker-compose / git
2. 签出项目源码 <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. 在 src/Newbe.Claptrap.Ticketing 文件夹运行 docker-compose build 命令来完成项目编译
4. 在 src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLite 文件夹运行 docker-compose up -d 来启动所有服务
5. 访问 `http://localhost:10080` 即可打开界面。

总结起来，脚本如下：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-compose build
cd Docker/LocalClusterSQLite
docker-compose up -d
```

以上步骤是运行以 SQLite 为数据库的方法，代码库中还包含了其他若干种部署模式，只需要分别运行不同文件夹中的 up.cmd 即可：

| 文件夹                 | 说明                |
| ------------------- | ----------------- |
| LocalClusterMongodb | MongoDb 多节点负载均衡版本 |
| LocalClusterSQLite  | SQLite 单节点版本      |
| Tencent             | “在线体验”中部署的版本      |

> - 如果您当前正在中国大陆，并且遇到下载 netcore 镜像缓慢的问题，可以尝试使用[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
> - 开发者也可以选择[PWD](https://labs.play-with-docker.com/)上部署该进行测试
> - 在不同部署模式间切换是，注意先运行 docker-compose down 来关闭上一次部署
> - 不同部署模式的 Web 端口可能不同，具体需要查看 docker-compose.yml 中的设置
