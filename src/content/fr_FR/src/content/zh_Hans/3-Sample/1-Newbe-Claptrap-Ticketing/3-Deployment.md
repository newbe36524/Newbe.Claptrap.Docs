---
title: 'Déploiement.'
metaTitle: 'Système de billetterie de train - déploiement.'
metaDescription: 'Système de billetterie de train - déploiement.'
---

> [La version actuellement vue est le résultat d’une correction simplifiée et manuelle traduite par la machine.S’il y a une mauvaise traduction dans le document, veuillez cliquer ici pour soumettre votre proposition de traduction.](https://crwd.in/newbeclaptrap)

## Expérience en ligne.

Cet échantillon a été déployé sur le site Web de <http://ticketing.newbe.pro> .

### Ouvert pour une durée limitée.

En raison des coûts d’exploitation, le système n’est disponible que pour les periods：spécifiques suivants

| Date.     | Heure.       |
| --------- | ------------ |
| Jours.    | 12:00-14:00。 |
| Jours.    | 20:00-22:00。 |
| Week-end. | 19:00-23:00。 |

Chaque fois qu’il rouvre, le système sera réinitialisé et toutes les données de la dernière ouverture seront vidées.

#### Documentation swagger.

Pour être plus efficaces dans la billetterie, les développeurs peuvent développer des outils de billetterie automatique s’appuyant sur les API données dans la documentation fanfaronnade.<http://ticketing.newbe.pro/swagger>d’adresse de document

## Déployer indépendamment.

Les développeurs peuvent également utiliser le code source pour un déploiement indépendant dans l’environnement docker local.Il suffit de suivre les étapes ci-dessous.

1. 确保本地已经正确安装了 docker 环境，并且能够使用 docker-compose / git
2. Consultez la source du projet <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. 在 src/Newbe.Claptrap.Ticketing 文件夹运行 docker-compose build 命令来完成项目编译
4. 在 src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLite 文件夹运行 docker-compose up -d 来启动所有服务
5. Accédez au `http://localhost:10080` pour ouvrir l’interface.

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
