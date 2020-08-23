---
title: 'Déploiement.'
metaTitle: 'Système de billetterie de train - déploiement.'
metaDescription: 'Système de billetterie de train - déploiement.'
---

> [La version actuellement vue est le résultat d’une correction simplifiée et manuelle traduite par la machine.S’il y a une mauvaise traduction dans le document, veuillez cliquer ici pour soumettre votre proposition de traduction.](https://crwd.in/newbeclaptrap)

## Expérience en ligne.

Cet échantillon a été déployé sur le site Web de <http://ticketing.newbe.pro> .

### 限时开放（还在备案）

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

Les étapes ci-dessus sont un moyen d’exécuter la base de données SQLite, et la base de code contient plusieurs autres modes de déploiement qui nécessitent l’exécution up.cmd dans différents dossiers pour：

| Dossier.                  | Description.                                         |
| ------------------------- | ---------------------------------------------------- |
| Mongodb de cluster local. | Version d’équilibrage de charge multi-nœuds MongoDb. |
| LocalCluster SQLite.      | Version à nœud unique SQLite.                        |
| Tencent.                  | Version déployée dans l’expérience en ligne.         |

> - Si vous êtes actuellement chinois continent et connaissent le téléchargement lent de l’image netcore, essayez d’utiliser[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
> - Les développeurs peuvent également choisir de déployer le test[le](https://labs.play-with-docker.com/)PWD.
> - Passez d’un mode de déploiement à l’autre, veillez à exécuter docker-composer vers le bas en premier pour fermer le dernier déploiement.
> - Les ports Web peuvent varier d’un modèle de déploiement à un mode de déploiement, selon les paramètres de docker-compose.yml.
