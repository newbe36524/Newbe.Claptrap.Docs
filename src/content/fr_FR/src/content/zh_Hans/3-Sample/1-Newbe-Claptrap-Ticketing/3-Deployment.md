---
title: 'Déploiement.'
metaTitle: 'Système de billetterie de train - déploiement.'
metaDescription: 'Système de billetterie de train - déploiement.'
---

> [La version actuellement vue est le résultat d’une correction simplifiée et manuelle traduite par la machine.S’il y a une mauvaise traduction dans le document, veuillez cliquer ici pour soumettre votre proposition de traduction.](https://crwd.in/newbeclaptrap)


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

## Déployer indépendamment.

Les développeurs peuvent également utiliser le code source pour un déploiement indépendant dans l’environnement docker local.Il suffit de suivre les étapes ci-dessous.

1. Assurez-vous que l’environnement docker est correctement installé localement et que le docker-compose/git est disponible.
2. Consultez la source du projet <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. Exécutez la commande de génération docker-composer dans le dossier src/Newbe.Claptrap.Ticketing pour terminer la compilation de projets.
4. Exécutez le dossier docker-compose up-d dans le dossier src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLite pour démarrer tous les services.
5. Accédez au `http://localhost:10080` pour ouvrir l’interface.

Pour résumer, le script est aussi follows：

```bash
Git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.examples/src/newbe.Claptrap.ticketing
docker-composer build
cd Docker/LocalClusterSQLite
docker-compose up -d.
```

Les étapes ci-dessus sont un moyen d’exécuter SQLite en tant que base de données, et la base de code contient plusieurs autres modes de déploiement qui nécessitent uniquement up.cmd dans différents dossiers pour：

| Dossier.                  | Description.                                         |
| ------------------------- | ---------------------------------------------------- |
| Mongodb de cluster local. | Version d’équilibrage de charge multi-nœuds MongoDb. |
| LocalCluster SQLite.      | Version à nœud unique SQLite.                        |
| Tencent.                  | Version déployée dans l’expérience en ligne.         |

> - Si vous êtes actuellement chinois continent et connaissent le téléchargement lent de l’image netcore, essayez d’utiliser[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
> - Les développeurs peuvent également choisir de déployer le test[le](https://labs.play-with-docker.com/)PWD.
> - Passez d’un mode de déploiement à l’autre, veillez à exécuter docker-composer vers le bas en premier pour fermer le dernier déploiement.
> - Les ports Web peuvent varier d’un modèle de déploiement à un mode de déploiement, selon les paramètres de docker-compose.yml.
