---
date: 2020-06-18
title: De combien de mémoire avez-vous besoin pour 100 000 utilisateurs en ligne simultanés ? - Expérience d’extension horizontale du cadre Newbe.Claptrap
---

Le projet Newbe.Claptrap est un cadre de développement côté service que l’auteur construit sur la base théorique`d’une`réactive, d’un mode acteur``et d'`une`de traçabilité des événements.Dans cet article, nous examinerons la capacité du cadre à s’écheller horizontalement.

<!-- more -->

## Un synthé d’information précédent

Après une longue période, nous nous réunissons à nouveau aujourd’hui.Tout d’abord, j’aimerais vous présenter les dernières project：

[Pour les lecteurs pour la première fois de ce cadre, vous pouvez lire la théorie de base et comment il fonctionne ici.](001-Overview-Of-Newbe-Claptrap)

Récemment, nous avons également écrit quelques articles d’échauffement et des outils, les lecteurs peuvent en apprendre davantage sur les：

- [Parlez de l’application de la programmation réactive du côté du service, de l’optimisation des opérations de base de données, de 20 secondes à 0,5 seconde](008-Reactive-In-Server-1)
- [Newbe.Claptrap Project Weekly 1 - Pas encore de roues, courir avec des roues d’abord](006-Newbe-Claptrap-Weekly-1)

## Le sujet d’aujourd’hui

Aujourd’hui, faisons un aperçu de laboratoire pour valider le cadre Newbe.Claptrap et comment s’adapter au nombre croissant d’utilisateurs en ligne sous forme d’extensions horizontales.

## Description des besoins de l’entreprise

Examinons d’abord le scénario d’affaires à mettre en œuvre today：

- L’utilisateur se connecte via l’API et génère un jeton JWT
- La validité du jeton JWT est vérifiée lorsque l’utilisateur appelle l’API
- L’émission de jetons JWT n’est pas effectuée à l’aide de la clé publique et privée JWS régulière, mais est hashed pour chaque utilisateur utilisant secrètement séparément
- Vérifiez la quantité de mémoire que les différents utilisateurs en ligne doivent consommer
- Il ne faut pas plus de 200 ms pour que l’utilisateur se connecte au jeton de build
- Le temps de validation de Tokn ne doit pas dépasser 10 ms

### Vantardise frappe d’abord le projet

L’auteur n’a donc pas cherché le « nombre d’utilisateurs en ligne » directement lié à la définition théorique afin d’éviter les différences dans votre compréhension.L’auteur d’abord selon leur propre compréhension de souligner：nombre d’utilisateurs en ligne à la fin signifie quel genre d’exigences techniques?

#### Les utilisateurs non en ligne qui sont en ligne ne devraient pas être affectés par le nombre d’utilisateurs qui sont déjà en ligne

Si un utilisateur se connecte, il faut 100 ms.Donc, si le nombre d’utilisateurs en ligne aujourd’hui est de dix ou un million.Cette connexion ne prend pas beaucoup plus de 100 ms.

Bien sûr, le matériel physique limité est sûr de ralentir ou même de le rendre plus facile ou même mal pour les nouveaux utilisateurs de se connecter lorsque le nombre d’utilisateurs en ligne dépasse un seuil, comme deux millions.

Toutefois, en augmentant la machine physique, ce seuil peut être relevé, et nous pouvons considérer la conception d’expansion horizontale comme un succès.

#### Pour tout utilisateur en ligne, la rétroaction des performances du système doit être la même

Par exemple, les utilisateurs qui sont déjà en ligne doivent consommer 100 ms pour interroger les détails de leur commande.Ensuite, la consommation moyenne de requêtes de commande par un utilisateur doit être stable à 100 ms.

Bien sûr, vous devez exclure les problèmes de performances à haute concentration comme le claquement.La discussion principale ici est l’augmentation régulière quotidienne de la capacité.(Nous parlerons de « claquer » séparément plus tard)

Le point spécifique peut être compris de cette façon.Disons que nous faisons un produit cloud note.

Donc, si l’ajout de machines physiques augmente le nombre d’utilisateurs qui utilisent des produits de note cloud en même temps, sans sacrifier l’expérience de performance d’un seul utilisateur, nous pensons que la conception horizontale de mise à l’échelle est un succès.

Dans cette expérience, si l’utilisateur est déjà connecté, le temps de vérifier la validité du JWT est d’environ 0,5 ms.

## Appelez la relation de synchronisation

![Diagramme de synchronisation](/images/20200621-001.png)

Brève description：

1. Les demandes de connexion client sont communiquées couche par couche à UserGrain
2. UserGrain activera en interne un Claptrap pour maintenir les données d’état dans UserGrain.Inclut le nom d’utilisateur, le mot de passe et le secret pour la signature JWT.
3. Les builds et validations JWT suivants utiliseront directement les données d’UserGrain.Parce que les données d’UserGrain sont « mises en cache » dans la mémoire pendant un certain temps.Ainsi, la construction et la validation JWT qui suit seront très rapides.La quantité mesurée est d’environ 0,5 ms.

## Conception de structure physique

![Conception de structure physique](/images/20200618-001.png)

Comme le montre la figure ci-dessus, il s’agit de la composante physique du test：

| Nom                     | Description                                                                                                                                          |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| WebAPI (en)             | Exposez à l’extérieur appelez l’interface WebAPI.Fournit une interface pour se connecter et vérifier les jetons.                                     |
| Cluster Orléans         | Le processus de base de l’hébergement grain.                                                                                                         |
| Porte d’Orléans         | Le Cluster Orléans est essentiellement le même, mais le WebAPI ne peut communiquer qu’avec Gateway                                                   |
| Tableau de bord Orléans | La passerelle d’Orléans est fondamentalement la même, mais une présentation de tableau de bord a été ajoutée pour voir l’ensemble du cluster Orléans |
| Consul                  | Découverte et maintenance de grappes pour les clusters Orléans                                                                                       |
| Claptrap DB             | Utilisé pour contenir des données d’événement et d’état pour le cadre Newbe.Claptrap                                                                 |
| Afflux DB & Grafana     | Utilisé pour surveiller les données de Performance Metrics liées à Newbe.Claptrap                                                                    |

Le nombre de nœuds cluster Orléans dans cette expérience est en fait le nombre total de Cluster plus Gateway plus Dashboard.Les divisions ci-dessus se distinguent en fait par des différences dans les paramètres de fonction.

Les nœuds physiques qui testent la fonction extension horizontale sont principalement The Orleans Cluster et The Orleans Gateway.L’utilisation de la mémoire pour les conditions suivantes sera testée séparément.

| Tableau de bord Orléans | Porte d’Orléans | Cluster Orléans |
| ----------------------- | --------------- | --------------- |
| 1                       | 0               | 0               |
| 1                       | 1               | 1               |
| 1                       | 3               | 5               |

Cette expérience utilise des tests de déploiement par Windows Docker Desktop en conjonction avec WSL 2.

Les structures physiques ci-dessus sont en fait conçues en fonction des circonstances les plus complexes de l’expérience.En fait, si le scénario d’affaires est assez simple, la structure physique peut être recadrée.Vous pouvez voir les instructions dans la FAQ ci-dessous pour plus de détails.

## Les données de test réelles

Ci-dessous, testez différentes tailles de cluster et numéros d’utilisateur

### 0 Cluster Gateway 0

Par défaut, lorsque vous démarrez le nœud dashboard, le portainer vous permet de voir que le conteneur consomme environ 200 Mo de mémoire, comme le montre le：

![L’empreinte mémoire initiale](/images/20200621-002.png)

La console de test fait 30 000 demandes au WebAPI.Chaque lot de 100 demandes est envoyé par lots.

Après une attente d’environ deux minutes, regardez à nouveau la mémoire, environ 9,2 Go, comme le montre le：

![30 000 utilisateurs](/images/20200621-003.png)

Par conséquent, nous estimons simplement la quantité de mémoire que chaque utilisateur en ligne doit consommer est approximativement (9,2 x 1024-200)/30000 x 0,3 Mo.

En outre, vous pouvez voir quelques data：

Utilisation du processeur

![Utilisation du processeur](/images/20200621-004.png)

Débit du réseau

![Débit du réseau](/images/20200621-005.png)

Tableau de bord Orléans.Les 30 000 activations totales dans le coin supérieur gauche représentent le nombre d’UserGrains actuellement en mémoire, et les trois autres sont des grains utilisés par Dashboard.

![Tableau de bord Orléans](/images/20200621-006.png)

Le temps de traitement moyen pour les événements visionnant Newbe.Claptrap à Grafana est d’environ 100-600 ms.Ce test est principalement une condition de mémoire, avec un temps de traitement de 30s, de sorte que la taille de l’échantillon est petite.Nous le testerons plus en détail dans un article ultérieur sur le temps de traitement.

![Le temps de traitement moyen](/images/20200621-007.png)

Le temps moyen qu’il faut pour enregistrer des événements à Grafana pour voir Newbe.Claptrap est d’environ 50-200 ms.La durée pendant qu’un événement est enregistré est une partie importante du traitement des événements.

![30 000 utilisateurs](/images/20200621-009.png)

Le nombre total d’événements traités à Grafana pour voir Newbe.Claptrap.L’un d’eux est enregistré 30 000 fois, de sorte que le nombre total d’événements est de 30 000.

![Le nombre total d’événements traités](/images/20200621-008.png)

### 1 Cluster Gateway 1

Ensuite, nous testons pour deux nœuds supplémentaires.

Encore une fois, le nombre de nœuds cluster Orléans est en fait le nombre total de Cluster plus Gateway plus Dashboard.Par conséquent, par rapport au dernier test, le nombre de nœuds dans le test est de 3.

L’utilisation de mémoire testée est aussi follows：

| Le nombre d’utilisateurs | La mémoire moyenne du nœud | Consommation totale de mémoire |
| ------------------------ | -------------------------- | ------------------------------ |
| 10000                    | 1,8 Go                     | 1,8\*3 = 5,4 Go              |
| 20000                    | 3,3 Go                     | 3,3 \*3 = 9,9 Go             |
| 30000                    | 4,9 Go                     | 4,9\*3 = 14,7 Go             |

Ainsi, dans le cas de 30 000 utilisateurs, l’utilisateur moyen consomme environ (14,7 x 1024-200 x 3)/30000 x 0,48 Mo

Pourquoi le nombre de nœuds a-t-il augmenté et la consommation moyenne de mémoire a-t-elle augmenté?L’auteur spécule qu’il n’y a pas eu de validation：nœuds ont augmenté, et que la communication entre les nœuds nécessite effectivement une mémoire supplémentaire, donc en moyenne il augmente.

### 3 Cluster Gateway 5

Ajoutons encore des nœuds.Les points récapitulatifs sont 1 (tableau de bord) et 3 (cluster) et 5 (passerelle) et 9 nœuds

L’utilisation de mémoire testée est aussi follows：

| Le nombre d’utilisateurs | La mémoire moyenne du nœud | Consommation totale de mémoire |
| ------------------------ | -------------------------- | ------------------------------ |
| 20000                    | 1,6 Go                     | 1,6 \*9 = 14,4 Go            |
| 30000                    | 2 Go                       | 2\*9 = 18 Go                 |

Ainsi, dans le cas de 30 000 utilisateurs, l’utilisateur moyen consomme environ (18 x 1024-200 x 9)/30000 x 0,55 Mo

### De combien de mémoire 100 000 utilisateurs ont-ils besoin ?

Tous les tests ci-dessus sont dans le nombre de 30.000 utilisateurs, qui est un nombre spécial.Étant donné que le nombre d’utilisateurs continue d’augmenter, la mémoire dépassera l’équilibre de mémoire du testeur.(S’il vous plaît parrainer deux 16G)

Si vous continuez à augmenter le nombre d’utilisateurs, vous commencerez à utiliser la mémoire virtuelle du système d’exploitation.Bien qu’il puisse fonctionner, il est moins efficace.La connexion d’origine peut n’avoir besoin que de 100 ms.Les utilisateurs qui utilisent la mémoire virtuelle ont besoin de 2 s.

Par conséquent, dans le cas de vitesses plus lentes, il peut ne pas être très logique de vérifier combien de mémoire est nécessaire.

Toutefois, cela ne signifie pas que vous ne serez pas en mesure de continuer à vous connecter, comme c’est le cas pour le cas de 1-plus1, lorsque les 100 000 utilisateurs sont connectés.(Il ya 100.000 utilisateurs en ligne en même temps, ajouter un peu de mémoire, pas mal d’argent.))

![100 000 utilisateurs](/images/20200621-010.png)

## Instructions de construction source

Le code pour ce test peut être trouvé dans la base de code de l’échantillon à la fin de l’article.Pour faciliter l’expérimentation des lecteurs par eux-mêmes, docker-composer est principalement utilisé pour la construction et le déploiement.

Ainsi, la seule exigence environnementale pour un testeur est d’installer Docker Desktop correctement.

Vous pouvez obtenir le dernier exemple de code à partir de l’un des addresses：

- <https://github.com/newbe36524/Newbe.Claptrap.Examples>
- <https://gitee.com/yks/Newbe.Claptrap.Examples>

### Démarrer rapidement

Utilisez la console `le dossier src/Newbe.Claptrap.Auth/LocalCluster` .Vous pouvez démarrer tous les composants localement en exécutant les commands：

```
docker-composer jusqu’à -d
```

Vous devez tirer quelques images publiques hébergées sur Dockerhub le long du chemin, et assurez-vous que les accélérateurs sont configurés correctement localement afin que vous puissiez construire rapidement.[pouvez être mis en place en lisant ce document](https://www.runoob.com/docker/docker-mirror-acceleration.html)

Après un lancement réussi,`composants peuvent être` le site docker ps.

```bash
PS>docker ps
CONTAINER ID        IMAGE                                                                            COMMAND                  CREATED             STATUS              PORTS                                                                                                                              NAMES
66470e5393e2        registry.cn-hangzhou.aliyuncs.com/newbe36524/newbe-claptrap-auth-webapi          "dotnet Newbe.Claptr…"   4 hours ago         Up About an hour    0.0.0.0:10080->80/tcp                                                                                                              localcluster_webapi_1
3bbaf5538ab9        registry.cn-hangzhou.aliyuncs.com/newbe36524/newbe-claptrap-auth-backendserver   "dotnet Newbe.Claptr…"   4 hours ago         Up About an hour    80/tcp, 443/tcp, 0.0.0.0:19000->9000/tcp, 0.0.0.0:32785->11111/tcp, 0.0.0.0:32784->30000/tcp                                       localcluster_dashboard_1
3f60f51e4641        registry.cn-hangzhou.aliyuncs.com/newbe36524/newbe-claptrap-auth-backendserver   "dotnet Newbe.Claptr…"   4 hours ago         Up About an hour    80/tcp, 443/tcp, 9000/tcp, 0.0.0.0:32787->11111/tcp, 0.0.0.0:32786->30000/tcp                                                      localcluster_cluster_gateway_1
7d516ada2b26        registry.cn-hangzhou.aliyuncs.com/newbe36524/newbe-claptrap-auth-backendserver   "dotnet Newbe.Claptr…"   4 hours ago         Up About an hour    80/tcp, 443/tcp, 9000/tcp, 30000/tcp, 0.0.0.0:32788->11111/tcp                                                                     localcluster_cluster_core_1
fc89fcd973f9        grafana/grafana                                                                  "/run.sh"                4 hours ago         Up 6 seconds        0.0.0.0:23000->3000/tcp                                                                                                            localcluster_grafana_1
1f10ed0eb25f        postgres                                                                         "docker-entrypoint.s…"   4 hours ago         Up About an hour    0.0.0.0:32772->5432/tcp                                                                                                            localcluster_claptrap_db_1
d5d2bec74311        adminer                                                                          "entrypoint.sh docke…"   4 hours ago         Up About an hour    0.0.0.0:58080->8080/tcp                                                                                                            localcluster_adminer_1
4c4be69f2f41        bitnami/consul                                                                   "/opt/bitnami/script…"   4 hours ago         Up About an hour    8300-8301/tcp, 8500/tcp, 8301/udp, 8600/tcp, 8600/udp                                                                              localcluster_consulnode3_1
88811d3aa0d2        influxdb                                                                         "/entrypoint.sh infl…"   4 hours ago         Up 6 seconds        0.0.0.0:29086->8086/tcp                                                                                                            localcluster_influxdb_1
d31c73b62a47        bitnami/consul                                                                   "/opt/bitnami/script…"   4 hours ago         Up About an hour    8300-8301/tcp, 8500/tcp, 8301/udp, 8600/tcp, 8600/udp                                                                              localcluster_consulnode2_1
72d4273eba2c        bitnami/consul                                                                   "/opt/bitnami/script…"   4 hours ago         Up About an hour    0.0.0.0:8300-8301->8300-8301/tcp, 0.0.0.0:8500->8500/tcp, 0.0.0.0:8301->8301/udp, 0.0.0.0:8600->8600/tcp, 0.0.0.0:8600->8600/udp   localcluster_consulnode1_1
```

Une fois le démarrage terminé, vous pouvez afficher l’interface pertinente à travers les liens ci-dessous

| Adresse                  | Description                                                                       |
| ------------------------ | --------------------------------------------------------------------------------- |
| <http://localhost:19000> | Le tableau de bord Orléans voit l’état des nœuds dans le cluster Orléans          |
| <http://localhost:10080> | Adresse de base de l’API Web, cette fois à l’aide de l’adresse de base API testée |
| <http://localhost:23000> | Adresse Grafana pour afficher les mesures de performance liées à Newbe.Claptrap   |

### Construction de source

Utilisez la console `le dossier src/Newbe.Claptrap.Auth` .En exécutant les commandes suivantes, vous pouvez créer le code locally：

```bash
./LocalCluster/pullimage.cmd
docker-composer construire
```

Après avoir attendu la fin de la build, l’image pertinente est générée localement.Ensuite, vous pouvez essayer de lancer l’application localement pour la première time：

Utilisez la console `le dossier src/Newbe.Claptrap.Auth/LocalCluster` .Vous pouvez démarrer le conteneur en exécutant la commande suivante :

```bash
docker-composer jusqu’à -d
```

## FAQ

### Pourquoi le code et les détails de configuration ne sont-ils pas décrits dans l’article ?

Cet article est destiné à montrer au lecteur la faisabilité expérimentale de ce scénario, et comment écrire du code en utilisant le cadre Newbe.Claptrap, qui n’est pas l’objectif principal de cet article et n’est donc pas mentionné.

L’autre point, bien sûr, c’est que le cadre n’est pas finalisé, que tout est susceptible de changer et que les détails du code n’ont que peu d’importance.

Cependant, il peut être expliqué à l’avance que l’écriture：est très simple, parce que les exigences commerciales de cet exemple sont très simples, de sorte que le contenu du code n’est pas beaucoup.Tout peut être trouvé dans le référentiel d’échantillons.

### Le jeton de stockage avec Redis peut également implémenter les exigences ci-dessus, pourquoi choisir ce cadre ?

À l’heure actuelle, l’auteur n’a pas toutes les raisons de convaincre le lecteur doit utiliser quel régime, ici est seulement de fournir un régime réalisable, quant à la réelle devrait choisir quel régime, devrait avoir le lecteur de considérer, après tout, si l’outil ou la nécessité d’essayer de savoir.

### Si c’est jusqu’à 100 utilisateurs en ligne, comment puis-je recadrer le système?

Les seuls composants requis sont Orleans Dashboard, WebAPI et Claptrap Db.Tous les autres composants ne sont pas essentiels.Et si vous modifiez le code, Orleans Dashboard et WebAPI peuvent être fusionnés.

Ainsi, le plus petit est un processus plus une base de données.

### Pourquoi Grafana n’a pas de rapport ?

Grafana doit créer manuellement DataSource et importer Dashboard après son premier lancement.

Les paramètres liés à cette expérience sont aussi follows：

Datasource

- URL： http://influxdb:8086
- Base： base de données métriques
- Claptrap： 'utilisateur
- Mot de passe： claptrap

[Cliquez ici pour le fichier de définition du tableau de bord](https://github.com/newbe36524/Newbe.Claptrap/blob/develop/src/Docker/Monitor/grafana/claptrap.json)

### Quelle est la configuration physique du testeur ?

Il n’y a pas de mémoire gratuite dédiée et 16 Go de mémoire ont été utilisés avant le début des tests.Ce qui suit est les données de figure de la machine d’essai (ordures étrangères, environ 3500 yuans)：

Processeur Intel Xeon (Xeon) E5-2678 v3 s 2.50GHz 12 noyau 24 threads carte mère HUANANZHI X99-AD3 GAMING (Wellsburg) graphiques Nvidia GeForce GTX 75 0 Ti Ti ( 2 Go / Nvidia ) 32 Go de mémoire ( Samsung DDR3L 1600MHz ) 2013 Senior memory main hard drive Kingston SA400S37240G ( 240 Go / SSD )

Si vous avez une meilleure configuration physique, je crois que vous pouvez obtenir de meilleures données.

### Même 0,3 Mo par utilisateur est trop élevé

Le cadre est encore en cours d’optimisation.L’avenir sera meilleur.

<!-- md Footer-Newbe-Claptrap.md -->
