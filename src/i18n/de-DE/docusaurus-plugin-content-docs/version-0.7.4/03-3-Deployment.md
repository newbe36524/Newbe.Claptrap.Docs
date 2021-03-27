---
title: 'Einsatz'
description: 'Zugticketsystem - Bereitstellung'
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

## Eigenständige Bereitstellung

Entwickler können den Quellcode auch für die unabhängige Bereitstellung in der lokalen Docker-Umgebung verwenden.Folgen Sie einfach diesen Schritten.

1. Stellen Sie sicher, dass die Docker-Umgebung lokal ordnungsgemäß installiert ist und dass Sie docker-compose/git verwenden können.
2. Schauen Sie sich die Projektquelle code <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. Führen Sie den Befehl docker-compose build im Ordner src/Newbe.Claptrap.Ticketing aus, um die Projektkompilierung abzuschließen.
4. Führen Sie docker-compose up-d im Ordner src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLite aus, um alle Dienste zu starten.
5. Zugriff `http://localhost:10080` , um die Schnittstelle zu öffnen.

Zusammenfassend ist das Skript so follows：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-compose build
cd Docker/LocalClusterSQLite
docker-compose up -d
```

Die obigen Schritte sind eine Möglichkeit, SQLite als Datenbank auszuführen, und die Codebasis enthält mehrere andere Bereitstellungsmodi, die nur in separaten Ordnern ausgeführt werden müssen, um：

| Ordner              | Beschreibung                                        |
| ------------------- | --------------------------------------------------- |
| LocalClusterMongodb | MongoDb Multi-Node Load Balancing Version           |
| LocalClusterSQLite  | SQLite Single-Node-Version                          |
| Tencent             | Die in der Online-Erfahrung bereitgestellte Version |

> - Wenn Sie derzeit chinesisches Festland sind und netcore-Images langsam herunterladen, können Sie versuchen,[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
> - Entwickler können auch[,](https://labs.play-with-docker.com/)Test im PWD-Netzwerk bereitzustellen
> - Beim Wechseln zwischen verschiedenen Bereitstellungsmodi ist darauf zu achten, dass docker-compose zuerst ausgeführt wird, um die letzte Bereitstellung zu schließen.
> - Webports können je nach den Einstellungen in docker-compose.yml vom Bereitstellungsmodus bis zum Bereitstellungsmodus variieren.
