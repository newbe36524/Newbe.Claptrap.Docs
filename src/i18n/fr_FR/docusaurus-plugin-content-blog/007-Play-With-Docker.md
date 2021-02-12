---
date: 2020-08-16
title: Jeune veuf yo, abandonnez-vous ce serveur de réseau public 4G 8 cœurs gratuit, ou est-ce la plate-forme expérimentale Docker prête à l’emploi ?
---

Les enfants font des choix, les adultes le veulent tous.Donc, nous allons jeter un oeil à la façon d’obtenir un serveur gratuit 8-core 4G docker plate-forme expérimentale.

<!-- more -->

## Jouer avec Docker

Ouvrez la<https://labs.play-with-docker.com/>accéder à la plate-forme Play With Docker. Inscrivez-vous à un compte DockerHub et vous pouvez accéder à ce site et facilement obtenir un serveur réseau public 4G 8 cœurs. Jetons un coup d’oeil à la façon d’utiliser ce serveur pour certaines opérations Docker.

## Déployer Nginx

Dans cet exemple, nous déployons un nginx et exposons le service à une adresse réseau publique.

### Connectez-vous et créez une instance

Cette étape est très simple, avec peu d’explications, et une fois la création réussie terminée, vous pouvez voir l’interface indiquée ci-dessous.

![L’interface](/images/20200816-001.png)

### Tirez sur le miroir

En exécutant la commande suivante, vous pouvez tirer la dernière image nginx.

```bash
docker tirer nginx
```

Pull est très rapide parce que ce nœud d’instance est déployé à l’étranger, de sorte que vous pouvez le télécharger très rapidement sans mettre en place un miroir.

### Démarrer le conteneur nginx

En exécutant la commande suivante, vous pouvez démarrer un conteneur nginx

```bash
docker run --nom nginx-test -p 8080:80 -d nginx
```

### Accès du public

Une fois le déploiement terminé, un nouveau bouton apparaît automatiquement sur l’interface pour indiquer que l’adresse réseau publique peut désormais être déployée avec succès, comme le montre le：

![Le bouton pour l’accès du public](/images/20200816-002.png)

En un clic, vous pouvez accéder au service nginx de votre navigateur que vous venez de déployer avec succès.

Si vous générez un bouton, vous pouvez également cliquer sur « OPEN PORT » pour sélectionner un port ouvert.

## Déployer un système de billetterie ferroviaire

Il suffit de déployer un nginx simple n’est évidemment pas assez amusant.Je vais donc déployer un système un peu plus complexe.

Il s’agit d’un système de démonstration composé de sept conteneurs, en référence aux instructions du système de billetterie des trains[-](https://claptrap.newbe.pro/zh_Hans/3-Sample/1-Newbe-Claptrap-Ticketing/3-Deployment)de déploiement, et l’exécution de la commande suivante pour démarrer une simulation de billetterie de train system：

```bash
clone git https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-composer build
cd Docker/LocalClusterMongodb
docker-composer -d
```

Une fois le script en cours d’exécution, ouvrez port 10080 via OPEN PORT pour voir le système de simulation des billets de train qui vient d’être déployé. ![Interface système de billetterie simulée](/images/20200816-003.png)

<!-- md Footer-Newbe-Claptrap.md -->
