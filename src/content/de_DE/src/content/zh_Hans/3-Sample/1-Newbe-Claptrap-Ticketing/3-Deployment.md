---
title: 'Einsatz.'
metaTitle: 'Zugticketsystem - Bereitstellung.'
metaDescription: 'Zugticketsystem - Bereitstellung.'
---

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)


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

1. Stellen Sie sicher, dass die Docker-Umgebung lokal ordnungsgemäß installiert ist und dass der docker-compose/git verfügbar ist.
2. Sehen Sie sich die Projektquelle <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. Führen Sie den Befehl docker-compose build im Ordner src/Newbe.Claptrap.Ticketing aus, um die Projektkompilierung abzuschließen.
4. Führen Sie den Ordner docker-compose up-d im Ordner src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLite aus, um alle Dienste zu starten.
5. Greifen Sie auf die `http://localhost:10080` zu, um die Schnittstelle zu öffnen.

总结起来，脚本如下：

```bash
Git-Klon https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.examples/src/newbe.Claptrap.ticketing
docker-compose build
cd Docker/LocalClusterSQLite
docker-compose up -d.
```

以上步骤是运行以 SQLite 为数据库的方法，代码库中还包含了其他若干种部署模式，只需要分别运行不同文件夹中的 up.cmd 即可：

| 文件夹                 | 说明                |
| ------------------- | ----------------- |
| LocalClusterMongodb | MongoDb 多节点负载均衡版本 |
| LocalClusterSQLite  | SQLite 单节点版本      |
| Tencent             | “在线体验”中部署的版本      |

> - Wenn Sie derzeit chinesisches Festland sind und einen langsamen Download des Netcore-Images erleben, versuchen Sie es mit[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
> - Entwickler können den Test auch[der PWD-](https://labs.play-with-docker.com/)bereitstellen.
> - Wechseln Sie zwischen verschiedenen Bereitstellungsmodi, und achten Sie darauf, docker-compose zuerst auszuführen, um die letzte Bereitstellung zu schließen.
> - Webports können je nach den Einstellungen in docker-compose.yml vom Bereitstellungsmuster bis zum Bereitstellungsmodus variieren.
