---
date: 2021-01-30
title: Développer des applications k8s avec Tye Aid est aussi simple que cela (I)
tags:
  - Newbe.Claptrap
  - Tye
---

Une nouvelle version de Newbe.Claptrap a récemment été développée, utilisant Tye pour faciliter le développement d’applications k8s.Jetons un bref coup d’oeil à la façon dont il est utilisé dans cette série.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## Installer Tye

Tout d’abord, assurez-vous que le netcore 2.1 ou au-dessus de la version du dotnet SDK est installé correctement.

Tye est actuellement en développement, de sorte que seule la version de prévisualisation peut être installé pour une utilisation en ce moment.Le lien ci-dessous vous permet de rechercher la dernière version et de copier l’installation CLI sur l’interface.

<https://www.nuget.org/packages/Microsoft.Tye/>

```bash
installation de l’outil dotnet --global Microsoft.Tye --version 0.6.0-alpha.21070.5
```

Une fois installé, exécutez tye dans la console et vous pouvez voir les results：

```bash
PS C:\tools\Cmder> tye
tye:
  Developer tools and publishing for microservices.

Usage:
  tye [options] [command]

Options:
  --no-default      Disable default options from environment variables
  -?, -h, --help    Show help and usage information
  --version         Show version information

Commands:
  init <path>        create a yaml manifest
  run <path>         run the application
  build <path>       build containers for the application
  push <path>        build and push application containers to registry
  deploy <path>      deploy the application
  undeploy <path>    delete deployed application
```

## Créer et exécuter un projet de test

Ensuite, nous créons une application netcore pour tester le scénario de déploiement.Choisissez un emplacement approprié pour exécuter les commandes suivantes pour créer un test project：

```bash
dotnet nouveau sln -n TyeTest
dotnet nouveau webapi -n TyeTest
dotnet sln .\TyeTest.sln ajouter .\TyeTest\TyeTest.csproj
```

De cette façon, nous obtenons une solution de test et un projet WebApi.Nous pouvons exécuter la commande suivante pour démarrer ce service locally：

```bash
dotnet exécuter - projet .\TyeTest\TyeTest.csproj
```

Après le lancement, vous pouvez ouvrir le navigateur<https://localhost:5001/swagger/index.html>pour voir l’interface fanfaronnade de démarrage.

## Utilisez tye pour exécuter l’application localement

Ensuite, nous allons fermer l’application précédemment en cours d’exécution et utiliser tye à la place pour lancer l’application de test localement.

Dans l’annuaire des solutions, utilisez la console pour exécuter les commands：

```bash
tye exécuter
```

Après avoir couru, vous pouvez obtenir le results：

```bash
PS C:\Repos\TyeTest> tye run
Loading Application Details...
Launching Tye Host...

[12:11:30 INF] Exécution de l’application de C:\Repos\T.sln
.sln  yeTest\TyeTest.sln  [12:11:30 INF] Tableau de bord en cours d’exécution sur http://127.0.0.1:8000
[12:11:30 INF] Projets de construction
[12:11:32 INF] Service de lancement tyetest_9dd91ae4-f: C:\Repos\TyeTest\TyeTest\bin\Debug\net5.0\TyeTest.exe
[12:11:32 INF] tyetest_9dd91ae4-f fonctionnant sur l’id de processus 24552 lié à http://localhost:14099, https://localhost:14100
[12:11:32 INF] Replica tyetest_9dd91ae4-f se déplace vers un état prêt
[ 12:11:32 INF] Processus sélectionné 24552.
[12:11:33 INF] Écoute des événements de pipe d’événement pour tyetest_9dd91ae4-f sur l’id de processus 24552
```

Suivez les conseils ci-dessus pour <http://127.0.0.1:8000> tableau de bord tye qui a commencé avec succès sur l’ordinateur.Ouvrez le tableau de bord à l’aide de votre navigateur pour voir une liste d’applications qui ont été déployées.Comme le montre la figure below：

![tableau de bord tye](/images/20210131-001.png)

Tableau de bord montre que le testeur a commencé et est lié à <http://localhost:14099> et <https://localhost:14100>.Dans la pratique, dans l’auto-test, les deux ports sont choisis au hasard, il y aura donc des différences.

En ouvrant fanfaronnade avec les liaisons https exposées ci-dessus, nous pouvons voir le même effet`exécuter dotnet`previously：<https://localhost:14100/swagger>

## Déployer un k8 sur place

Ensuite, nous utiliserons Tye pour déployer l’application sur k8s.Donc, pour atteindre cet effet, vous devez d’abord préparer un k8s.

Il existe une variété de façons de déployer k8s sur une machine de développement, et cette expérience utilise un bureau Docker plus k8s scénario, soit à cause de quelque chose d’autre ou parce qu’il ya plus ou moins de problèmes avec l’utilisation d’autres scénarios.Les développeurs spécifiques peuvent choisir.

Le scénario k8s du Bureau Docker est bien couvert dans les liens ci-dessous et est recommandé pour les développeurs de se référer à：

Docker Desktop lance kubernetes<https://www.cnblogs.com/weschen/p/12658839.html>

En plus des k8s ontogene, ce laboratoire nécessite également l’installation de l’entrée et de la barre de nginx, qui peuvent également être installées en référence à l’article ci-dessus.

## Déployer l’application sur k8s

Mais lorsque k8s est configuré, nous pouvons utiliser tye pour publier rapidement l’application à k8s pour la visualisation.

### Connectez-vous au registre docker

Tout d’abord, vous devez configurer le registre docker pour le docker local.Parce que l’image docker du projet est emballée et poussée vers un registre docker pendant le processus de publication avec tye.

Les développeurs peuvent choisir parmi une variété de façons d’obtenir leur propre registre docker：

- Référentiel Nexus OSS
- Alibaba Cloud, Tencent Cloud, DaoCloud, et plus encore ont le registre docker gratuit
- Docker hub, si le réseau est bon

Utilisez`connexion docker`pour vous connecter à votre registre docker.

### tye init crée tye.yml

Dans le catalogue de solutions, exécutez la commande suivante pour créer un profil tye.yml :

```bash
tye init
```

Après l’exécution, les fichiers suivants seront créés dans la solution：

```yml
nom: tyetest
services:
  - nom: tyetest
    projet: TyeTest/TyeTest.csproj
```

C’est le fichier tye.yml le plus simple.

### Modifier tye.yml

Nous ajoutons une ligne de configurations sur le registre docker dans tye.yml pour spécifier où l’image intégrée sera poussée：

```yml
nom: tyetest
registry: registry.cn-hangzhou.aliyuncs.com/newbe36524
services:
  - nom: tyetest
    projet: TyeTest/TyeTest.csproj
```

Par exemple, ici l’auteur utilise le registre docker du nœud Hangzhou d’Alibaba Cloud, l’espace nominatif est newbe36524.Ajoutez donc un registre line`: registry.cn-hangzhou.aliyuncs.com/newbe36524`.

Cela équivaut, s’il est construit, à une image d’étiquette`registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0`et poussé dans le cloud Alibaba.

### Télécharger l’image de base netcore à l’avance

Parce que cette fois, nous publions un programme netcore, ils vont être construits avec des images netcore, donc pour une construction plus lisse, il est recommandé que vous utilisez l’outil d’accélération pour télécharger l’image sous-jacente localement à l’avance.

例如，笔者在此次的使用中使用的 net5 TFM 的应用程序，因此，就需要在本地先拉好 mcr.microsoft.com/dotnet/aspnet:5.0 作为基础镜像。

Depuis la source du miroir sous-jacent netcore a maintenant été migré de docker hub à mcr.microsoft.com.故而，建议使用 Newbe.McrMirror 进行加速下载。

Les méthodes d’utilisation détaillées peuvent être：<https://github.com/newbe36524/Newbe.McrMirror>

Si le développeur ne sait pas quelle est l’image sous-jacente qu’il doit actuellement tirer, il peut également essayer l’étape suivante pour publier directement, afficher le contenu d’image sous-jacent utilisé dans le processus, puis tirer.

### Utiliser tye déployer

Maintenant que tout est prêt, vous pouvez publier en continuant à exécuter les commandes suivantes dans le catalogue de solutions :

```bash
tye déployer
```

Vous pouvez obtenir les résultats suivants :

```bash
PS C:\Repos\TyeTest> tye deploy
Loading Application Details...
Verifying kubectl installation...
Verifying kubectl connection to cluster...
Processing Service 'tyetest'...
    Applying container defaults...
    Compiling Services...
    Publishing Project...
    Building Docker Image...
            #1 [internal] définition de la construction de charge de Dockerfile
            #1 sha256:a3872c76e0ccfd4bade43ecac3349907e0d110092c3c3ca8c61f1d360689bad7e2
            #1 transfert dockerfile: 144B fait
            #1 FAIT 0.0s

            #2 [internal] charge .dockerignore
            #2 sha256:9e3b70115b86134ab4be5a3ce629a55cd6060936130c89 b906677d1958215910
            #2 contexte de transfert: 2B fait
            #2 FAIT 0,0s métadonnées de charge

            #3 [internal] pour mcr.microsoft.com/dotnet/aspnet:5.0
            #3 sha256:3b35130338ebb888f84ec0aa58f64d182f10a676a62507200f5903996d93690
            #3 DONE 0.0s

            #7 [1/3] FROM mcr.microsoft.com/dotnet/aspnet:5.0
            #7 sha256:31acc33a1535ed7869167d21032ed94a0e9b41bbf02055dc5f04524507860176
            #7 DONE 0.0s

            #5 [internal] contexte de construction de
            #5 sha256:2a74f859befdf852c0e7cf66b6b7e71ec4ddeedd37d3bb6e4840d441d712a20
            #5 contexte de transfert: 3.87Mb 0.0s done
            #5 DONE 0.1s

            #4 [2/3] WO RKDIR /app
            #4 sha256:56abde746b4f39a24525b2b730b2dfb6d9688bcf704d367c86a4753aefff33f6
            #4 CACHED

            #6 [3/3] COPY . /app
            #6 sha256:4a3b76a4eea70c858830bad519b2d8faf5b6969a820b7e38994c2116d3bacab2
            #6 DONE 0.0s

            #8 exporting to image
            #8 sha256:e8c613e07b0b7ff33893b694f7759a10d42e180f2b4dc349fb57dc6b71dcab00
            #8 exportant des couches 0.0s fait
            #8 image d’écriture sha256:8867f4e2ed6ccddb509e9c39e86c736188a77 8f348d6487d6d2e7a1b5919c1fdb
            #8 image d’écriture sha256:8867f4e2ed6ccddb509e9c39e86c736188a78f348d6487d6d2e7a1b5919c1fdb fait
            #8 nom à registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0 fait
            #8 FAIT 0,1s
        Créé Docker Image: 'registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0'
    Pousser docker image...
        Image docker poussée: 'registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0'

    Validating Secrets...
    Generating Manifests...
Deploying Application Manifests...
    Applying Kubernetes Manifests...
        Verifying kubectl installation...
        Verifying kubectl connection to cluster ...
        sortie d’écriture à 'C:\Users\Administrator\AppData\Local\Temp\tmp2BC2.tmp'.
        application déployée 'tyetest'.
temps écoulé: 00:00:12:99
```

À partir du journal de sortie, nous pouvons voir que l’application a été publiée avec succès.Et avec k8s tableau de bord ou k9s, nous pouvons tous voir que l’application a été déployée avec succès et démarré.

```bash
tyetest-674865dcc4-mxkd5 ●● 1/1 Δ 0 Running Δ 10.1.0.73 docker-desktop 3m46s
```

Il convient de noter qu’il existe plusieurs conditions préalables pour s’assurer que cette：

- Vous devez vous assurer que votre kubectl local est configuré correctement.En général, si vous utilisez docker desktop, il est déjà configuré
- Vous devez vous assurer que la connexion docker a réussi.Les développeurs peuvent tester si les images suivantes peuvent être poussées manuellement avant d’exécuter le déploiement
- Si la vitesse de téléchargement de l’image MCR n’est pas idéale, n’oubliez pas de l’accélérer avec Newbe.McRMirror

## Créer et utiliser l’entrée

À ce stade, nous avons fini de publier l’application.Toutefois, comme l’entrée de nginx n’est pas configurée, le service peut déjà s’exécuter à l’intérieur des k8, mais n’est pas accessible à l’extérieur.C’est-à-dire que l’utilisation d’un navigateur sur votre ordinateur n’est toujours pas ouverte.Nous devons donc également configurer l’entrée pour le service.Amis qui n’ont pas installé d’entrée pour k8s, il est recommandé d’examiner les sections précédentes sur l’installation k8s.

Ici, nous nous tournons sur tye.yml pour ajouter la configuration liée à l’entrée：

```yml
nom: tyetest
registry: registry.cn-hangzhou.aliyuncs.com/newbe36524
services:
  - nom: tyetest
    project: TyeTest/TyeTest.csproj
ingress:
  - nom: tyetest-ingress
    bindings:
      - name: https
        protocol: https
    rules:
      - host: www.yueluo.pro
        service: tyetest
```

Nous avons ajouté une configuration d’entrée de sorte que lorsque le trafic vient de l’entrée et le nom de domaine est`www.yueluo.pro`, il est transmis au service tyetest.Cela permet un accès externe aux services internes k8s.

Tout d’abord,`exécuter tye` commande pour voir l’effet localement.Après avoir exécuté la commande, vous pouvez voir ce qui suit dans le dashboard：

![tableau de bord tye2](/images/20210131-002.png)

Où, https://localhost:8310'est l’adresse d’entrée de l’entrée.Étant donné que nous utilisons la liaison de noms de domaine, il existe deux façons d’y accéder pour vérifier l'：

- Ajouter une relation de cartographie www.yueluo.pro> 127.0.0.1 dans les hôtes
- Utilisez http pour demander un accès direct au fichier.

Ici, nous utilisons le fichier de demande http pour accéder à la：

```http
GET https://localhost:8310/WeatherForecast
hôte: www.yueluo.pro
```

De cette façon, nous avons réussi à valider les résultats de la liaison.

Notez que les ports qui s’y trouvent ne sont pas configurés en tant que ports fixes, de sorte que chaque fois que le développeur doit prêter attention aux changements qui se produisent.

## Déployer l’entrée vers les k8

Ensuite, arrêtez d`exéteindre les`, exécutez`déploiement de tye`et publiez des entrées et des applications vers les k8.

Notez que le déploiement de l’entrée peut prendre des dizaines de secondes, vous devez donc attendre.

Une fois le déploiement terminé, vous pouvez afficher les résultats du déploiement à l’intermédiaire de tableaux de bord k8 ou k9.

En outre, vous pouvez utiliser la demande http suivante pour vérifier les résultats de votre deployment：

```http
GET https://localhost/WeatherForecast
hôte: www.yueluo.pro
```

Le résultat est le même qu’avant.

## Désinstaller l’application à partir de k8s

Désinstallez l’application,`simple, tye undeploy`.

```bash
PS C:\Repos\TyeTest> tye undeploy
De chargement des détails de l’application ...
Trouvé 3 ressources (s).
Suppression du 'Service' 'tyetest' ...
Suppression 'Deployment' 'tyetest' ...
Suppression 'Ingress' 'tyetest-ingress' ...
Time Elapsed: 00:00:02:87
```

## Résumé

Dans cet article, nous avons brièvement décrit les étapes simples de la façon d’exécuter ou de déployer une application à l’aide de tye.Il existe de nombreuses options qui peuvent être étendues et personnalisées dans la pratique.Les amis intéressés peuvent https://github.com/dotnet/tye dans le contenu.

Ensuite, nous déploierons des applications multi-instances un peu plus complexes.

<!-- md Footer-Newbe-Claptrap.md -->
