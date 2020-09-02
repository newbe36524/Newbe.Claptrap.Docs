---
title: 'Deployment'
metaTitle: 'Train ticketing system - deployment'
metaDescription: 'Train ticketing system - deployment'
---

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)


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

## Deploy independently.

Developers can also use the source code for independent deployment in the local docker environment.Just follow the steps below.

1. Make sure that the docker environment is properly installed locally and that the docker-compose/git is available.
2. Check out the project source <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. Run the docker-compose build command in the src/Newbe.Claptrap.Ticketing folder to complete project compilation.
4. Run the docker-compose up-d in the src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLite folder to start all services.
5. Access the `http://localhost:10080` to open the interface.

To sum up, the script is as follows：

```bash
Git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.examples/src/newbe.Claptrap.ticketing
docker-compose build
cd Docker/LocalClusterSQLite
docker-compose up -d.
```

The above steps are a way to run SQLite as a database, and the code base contains several other deployment modes that require only up.cmd in different folders to：

| Folder.                | Description.                                   |
| ---------------------- | ---------------------------------------------- |
| Local Cluster Mongodb. | MongoDb multi-node load balancing version.     |
| LocalCluster SQLite.   | SQLite single-node version.                    |
| Tencent.               | The version deployed in the Online Experience. |

> - If you are currently Chinese mainland and are experiencing slow download of the netcore image, try using[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
> - Developers can also choose to deploy the test[the PWD](https://labs.play-with-docker.com/).
> - Switch between different deployment modes, be careful to run docker-compose down first to close the last deployment.
> - Web ports may vary from deployment pattern to deployment mode, depending on the settings in docker-compose.yml.
