---
title: 'Einsatz.'
metaTitle: 'Zugticketsystem - Bereitstellung.'
metaDescription: 'Zugticketsystem - Bereitstellung.'
---

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

## Online-Erfahrung.

Dieses Beispiel wurde auf der <http://ticketing.newbe.pro> -Website bereitgestellt.

### Offen für eine begrenzte Zeit.

Aufgrund der Betriebskosten ist das System nur für folgende spezifische periods：

| Datum.      | Zeit.        |
| ----------- | ------------ |
| Tage.       | 12:00-14:00。 |
| Tage.       | 20:00-22:00。 |
| Wochenende. | 19:00-23:00。 |

Jedes Mal, wenn es wieder geöffnet wird, wird das System zurückgesetzt und alle Daten von der letzten Öffnung werden geleert.

#### Swagger-Dokumentation.

Um beim Ticketing effektiver zu sein, können Entwickler automatische Ticketing-Tools auf der Grundlage der APIs entwickeln, die in der Swagger-Dokumentation angegeben sind.Dokumentadresse<http://ticketing.newbe.pro/swagger>

## Stellen Sie unabhängig bereit.

Entwickler können den Quellcode auch für die unabhängige Bereitstellung in der lokalen Docker-Umgebung verwenden.Folgen Sie einfach den Schritten unten.

1. 确保本地已经正确安装了 docker 环境，并且能够使用 docker-compose / git
2. Sehen Sie sich die Projektquelle <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. 在 src/Newbe.Claptrap.Ticketing 文件夹运行 docker-compose build 命令来完成项目编译
4. 在 src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLite 文件夹运行 docker-compose up -d 来启动所有服务
5. Greifen Sie auf die `http://localhost:10080` zu, um die Schnittstelle zu öffnen.

总结起来，脚本如下：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/Newbe.Claptrap.Ticketing
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
