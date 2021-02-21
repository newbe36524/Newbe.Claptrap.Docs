---
title: 'Déploiement'
description: 'Système de billetterie des trains - déploiement'
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

## Déploiement autonome

Les développeurs peuvent également utiliser le code source pour un déploiement indépendant dans l’environnement docker sur place.Il suffit de suivre ces étapes.

1. Assurez-vous que l’environnement docker est correctement installé localement et que vous pouvez utiliser docker-composer/git
2. Consultez la source du projet code <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. Exécutez la commande de build docker-composer dans le dossier src/Newbe.Claptrap.Ticketing pour compléter la compilation du projet
4. Exécutez docker-composer up-d dans le dossier src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLite pour démarrer tous les services
5. Accédez `http://localhost:10080` pour ouvrir l’interface.

En résumé, le script est aussi follows：

```bash
clone git https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-composer build
cd Docker/LocalClusterSQLite
docker-composer up -d
```

Les étapes ci-dessus sont un moyen d’exécuter SQLite comme une base de données, et la base de code contient plusieurs autres modes de déploiement qui n’ont qu’à courir up.cmd dans des dossiers distincts pour：

| Dossier             | Description                                         |
| ------------------- | --------------------------------------------------- |
| LocalClusterMongodb | MongoDb version d’équilibrage de charge multi-nœuds |
| LocalClusterSQLite  | VERSION SQLite mono-nœud                            |
| Tencent ( Tencent ) | La version déployée dans l’expérience en ligne      |

> - Si vous êtes actuellement chinois continent et connaissent lent téléchargement d’images netcore, vous pouvez essayer[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
> - Les développeurs peuvent également[de déployer](https://labs.play-with-docker.com/)test sur le réseau PWD
> - Passer d’un mode de déploiement à l’autre, c’est faire attention à exécuter docker-composer en premier pour fermer le dernier déploiement
> - Les ports Web peuvent varier d’un mode de déploiement à l’autre, selon les paramètres de docker-composer.yml
