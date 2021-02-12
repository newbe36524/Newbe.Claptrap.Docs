---
date: 2020-07-20
title: Construire un système de billetterie de train facile, Newbe.Claptrap Framework Use Case, First Step - Business Analysis
---

Le cadre Newbe.Claptrap est idéal pour résoudre les systèmes d’affaires avec des problèmes de complicité.Le système de billetterie des trains est un cas d’utilisation de scénario très typique.

Dans cette série, nous allons passer en travers de l’entreprise, le code, les tests et les aspects de déploiement de la façon d’utiliser le cadre Newbe.Claptrap pour construire un système de billetterie de train simple.

<!-- more -->

## Vantardise frappe d’abord le projet

Définissons d’abord les limites d’affaires et les exigences de performance requises pour ce système simple de billetterie ferroviaire.

### Frontières d’affaires

Le système ne contient que la partie restante de la gestion des billets du billet.C’est-à-dire, interroger les sièges restants, commander un billet pour réduire le siège.

La production d’informations sur les commandes, le paiement, le contrôle de la circulation, la demande de contrôle du vent, etc. ne sont pas incluses dans le champ d’application de cette discussion.

### Cas d’utilisation commerciale

- Vérifiez les billets restants et être en mesure de vérifier le nombre de billets disponibles entre les deux stations et le nombre de sièges restants.
- Vérifiez les billets restants correspondant au nombre de voyages, peut interroger le nombre donné de fois, entre les stations combien de sièges restent.
- Prise en charge de la sélection des sièges, les clients peuvent choisir un nombre donné de voitures et de sièges, et commander des billets.

### Exigences de performance

- Le coût moyen de la requête des billets restants et de la commande ne doit pas dépasser 20ms.Ce temps inclut uniquement le temps de traitement côté service, c’est-à-dire la transmission du réseau de pages, le rendu des pages, et ainsi de suite ne sont pas des parties de la préoccupation du cadre.
- Les requêtes résiduelles peuvent avoir un retard, mais pas plus de 5 secondes.Le retard signifie qu’il peut y avoir une requête pour les billets, mais aucun billet n’est autorisé à être commandé.

## Analyse difficile

### Gestion résiduelle des billets

La difficulté de la gestion résiduelle des billets de train réside dans la particularité du reste de l’inventaire des billets.

Les marchandises ordinaires de commerce électronique, SKU comme la plus petite unité, chaque SKU est indépendant les uns des autres, ne s’affectent pas les uns les autres.

Pour：je vends actuellement 10.000 ronds-points Armstrong de la planète Sebotan, rouge et blanc, respectivement.Ensuite, lorsque l’utilisateur sous les ordres, tant que le contrôle de rouge et blanc deux éléments d’inventaire n’est pas survendu.Il n’y a pas de relation entre eux.

Toutefois, les billets restants pour le train sont différents, car les billets restants seront touchés par la fin des billets vendus.Voici un modèle logique simple pour obtenir un regard détaillé sur cette particularité.

Supposons maintenant qu’il y ait un train qui traverse quatre gares, a, b, c, d, et en même temps, nous simplifions le scénario, en supposant qu’il n’y ait qu’un seul siège dans le trajet.

Donc, avant que l’on achète un billet, la situation de billet restant pour ce nombre de billets est aussi follows：

| Début et fin | Le montant des billets restants |
| ------------ | ------------------------------- |
| a,b          | 1                               |
| a,c          | 1                               |
| a,d          | 1                               |
| b,c          | 1                               |
| b,d          | 1                               |
| c,d          | 1                               |

Si un client a maintenant acheté un billet a,c.Donc, puisqu’il n’y a qu’un seul siège, il n’y a pas d’autre billet que c,d.Le reste de la situation de vote devient le：

| Début et fin | Le montant des billets restants |
| ------------ | ------------------------------- |
| a,b          | 0                               |
| a,c          | 0                               |
| a,d          | 0                               |
| b,c          | 0                               |
| b,d          | 0                               |
| c,d          | 1                               |

Pour le dire plus directement, si un client achète un, d pour l’ensemble du billet, tous les billets restants seront changés en 0.Parce que le passager est toujours dans ce siège.

C’est la particularité des billets de train：le même siège dans le même train, le nombre de billets restants à chaque point de départ sera affecté par le début et la fin du billet vendu.

S’étendant un peu, il est facile de conclure qu’il n’y a pas un tel effet entre les différents sièges dans le même trajet.

### Enquête résiduelle sur les billets

Comme mentionné dans la section précédente, en raison de la particularité de l’inventaire résiduel des billets.Pour le même trajet a, b, c, d, il ya 6 options de billets possibles.

Et il est facile de conclure que la méthode de calcul du nombre de types choisis est en fait de sélectionner deux combinaisons dans les sites n, c’est-à-dire .c(n, 2).

Donc, s’il ya une voiture passant par 34 stations, la combinaison possible est c (34,2) s 561.

Comment traiter de nombreux types de requêtes qui peuvent exister efficacement est également un problème que le système doit résoudre.

## Conception logique de Claptrap

Mode acteur est un modèle de conception qui est intrinsèquement adapté pour résoudre les problèmes avec des problèmes.Le cadre Newbe.Claptrap basé sur ce concept peut naturellement gérer les difficultés mentionnées ci-dessus.

### Ressources concurrentielles minimales

Par rapport au concept de « concurrence des ressources » dans la programmation multicœur, l’auteur met de l’avant le concept de « ressource concurrentielle minimale » dans le système d’affaires.Ce concept permet de trouver facilement des points de conception pour la façon d’appliquer Newbe.Claptrap.

Par exemple, dans l’exemple de l’auteur de la vente de canons de gyration Abstrom, chaque élément de la même couleur est une « ressource concurrentielle minimale ».

Notez que cela ne veut pas dire que tous les articles de la même couleur sont une « ressource concurrentielle minimale ».Parce que, si vous comptez 10.000 articles, alors la ruée vers l’achat des première et deuxième marchandises, il n’y a pas de concurrence en soi.Par conséquent, chaque produit est une ressource concurrentielle minimale.

Ainsi, dans le cas des billets de train, la plus petite ressource：le même siège dans le même train.

Comme mentionné ci-dessus, le même siège dans le même train, dans le choix des différents points de départ et de fin, c’est que la situation de billet restante il ya une relation concurrentielle.Plus précisément, par exemple, l’auteur veut acheter des billets pour a,c, tandis que les lecteurs veulent acheter des billets pour a,b.Ensuite, nous avons une relation concurrentielle, et nous n’aurons qu’une seule personne qui pourra acheter avec succès cette « ressource concurrentielle minimale ».

Voici quelques exemples que l’auteur pense être available：

- Dans un système d’entreprise qui ne permet que les connexions unifaches, le ticket de connexion d’un utilisateur est la ressource la moins compétitive
- Dans un système de configuration, chaque élément de configuration est la ressource la moins compétitive
- Dans un marché boursier, chaque ordre d’achat ou de vente est la ressource la moins compétitive

> Il s’agit des propres hypothèses de l’auteur, aucune référence à d’autres documents, s’il ya des informations similaires ou des noms peuvent soutenir le contenu, mais aussi l’espoir que les lecteurs peuvent laisser une description de message.

### Ressources concurrentielles minimales avec Claptrap

Les « ressources concurrentielles minimales » sont mentionnées parce que la distinction entre les ressources les moins compétitives est une base importante pour la conception du système lors de la conception de l’État de Claptrap.

Voici une conclusion : l’état：**Claptrap devrait être au moins supérieur ou égal à la « ressource concurrentielle minimale ».**

Combiné avec l’exemple de l’Absterrand swing acceleration gun, si tous les éléments de la même couleur sont conçus dans le même État Claptrap (plus grand que la ressource compétitive minimale).Ensuite, différents utilisateurs achètent des éléments qui s’affectent les uns les autres parce que Claptrap est basé sur le modèle Acteur qui fait la queue pour traiter les demandes.C’est-à-dire, en supposant que chaque article doit traiter 10ms, alors il est jusqu’à 10000 pour traiter toutes les demandes d’achat.Toutefois, si chaque élément est numéroté, chaque élément est conçu comme un état Claptrap distinct.Donc, parce qu’ils ne sont pas liés les uns aux autres.La vente de toutes les marchandises ne nécessiterait théoriquement que 10ms.

Cela：**si l’État de Claptrap est plus grand que la plage minimale de ressources concurrentielles, le système n’aura pas de problème avec la justesse, mais il peut y avoir des pertes de performances.**

En outre, comme mentionné précédemment dans l’exemple de la billetterie des trains, le même siège sur le même train est la ressource la moins compétitive, de sorte que nous pouvons concevoir cette entité commerciale comme l’État de Claptrap.Mais que faire si la gamme de conception est plus petite que cela?

Pour：nous avons conçu l’État de Claptrap comme un ticket résiduel pour le même siège sur le même train à différents points de départ.Ensuite, il y a une question très traditionnelle de：« Comment assurer la justesse des données dans un système distribué ».Pour ce point, l’auteur ne peut pas élargir, parce que l’auteur ne peut pas dire clairement, il suffit d’abandonner à la hâtive une conclusion：**« Si l’État de Claptrap est inférieur à la portée des plus petites ressources concurrentielles, la relation entre Claptrap deviendra difficile à traiter, il ya des risques. »**

### Conception de corps de Claptrap

Ensuite, combinez les théories décrites ci-dessus.Nous avons jeté la conception directement.

![Conception du système de billetterie ferroviaire](/images/20200720-001.png)

#### Concevoir chaque siège sur la même conduite qu’un Claptrap-SeatGrain

L’État de Claptrap contient une information de base

| Type                                     | Nom                     | Description                                                                                                                                                                                            |
| ---------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| IList&lt;int&gt;             | Stations                | La liste id des stations d’itinéraire, en commençant par la station d’origine et se terminant par le terminal.Vérification au moment de l’achat du billet principal.                                   |
| Dictionnaire&lt;int, int&gt; | StationDic (en)         | Le dictionnaire inverse de l’index qui adage l’id de la station.Les stations sont une liste d’index-ids, et le dictionnaire est le dictionnaire id-index correspondant, afin d’accélérer les requêtes. |
| Liste&lt;string&gt;          | RequestIds (requestids) | Propriétés clés.À chaque intervalle, l’id de billet acheté.Par exemple, un index de 0 représente un id de billet de la station 0 à la station 1.S’il est vide, il n’y a pas de billet d’abonnement.    |

Avec la conception de cette structure de données, deux entreprises peuvent être mises en œuvre.

##### Vérifiez qu’il peut être acheté

En passant dans deux identifiants de station, vous pouvez savoir si cela appartient à ce SeatGrain.Et interrogez tous les segments d’intervalle correspondant aux points de départ et de fin.Il suffit de juger si tous les segments des RequestIds n’ont pas d’iD de billet.Sinon, il peut être acheté.S’il y a déjà une pièce d’identité d’achat de billet sur n’importe quelle section, l’achat n’est plus possible.

Par exemple, la situation actuelle avec les stations est de 10, 11, 12, 13. RequestIds, d’autre part, sont 0,1,0.

Donc, si vous achetez un billet de 10>12, ce n’est pas possible parce que la deuxième gamme de RequestIds a déjà été achetée.

Toutefois, si vous voulez>10- 11 billets, vous pouvez, parce que personne dans la première gamme de RequestIds n’a pas encore de les acheter.

##### Acheter

Il suffit de placer les points de départ et de fin sur tous les paramètres du segment d’intervalle dans RequestIds.

##### Cas de test unitaires

Les liens suivants vous permettent de visualiser la mise en œuvre du code de ce qui précède algorithm：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/blob/master/src/Newbe.Claptrap.Ticketing/Newbe.Claptrap.Ticketing.Actors.Tests/TicketingTest.cs)
- [Gitee ( Gitee )](https://gitee.com/yks/Newbe.Claptrap.Examples/blob/master/src/Newbe.Claptrap.Ticketing/Newbe.Claptrap.Ticketing.Actors.Tests/TicketingTest.cs)

#### Concevoir le billet restant pour tous les sièges sur le même trajet qu’un Claptrap-TrainGran

L’État de Claptrap contient quelques informations de base

| Type                                             | Nom                   | Description                                                                                                                                                                                                                                                                         |
| ------------------------------------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IReadOnlyList&lt;int&gt;             | Stations              | La liste id des stations d’itinéraire, en commençant par la station d’origine et se terminant par le terminal.Valider sur la requête principale.                                                                                                                                    |
| IDictionary&lt;StationTuple, int&gt; | SeatCount (SeatCount) | Propriétés clés.StationTuple représente un point de départ.La collection contient les billets restants pour tous les points de départ et de fin possibles.Par exemple, selon ce qui précède, si le trajet passe à travers 34 emplacements, le dictionnaire contient 561 paires clés |

Sur la base de la structure de données ci-dessus, vous n’avez qu’à synchroniser les informations correspondantes avec le grain une fois chaque commande SeatGrain terminée.

Par exemple, si a,c a un achat de billet, les billets restants pour a,c/a,b/b,c seront réduits d’un.

Cela peut être réalisé avec le mécanisme Minion intégré dans ce cadre.

Il convient de mentionner qu’il s’agit d’une conception plus grande que la « ressource concurrentielle minimale ».Parce que le scénario de requête n’a pas besoin d’être absolument rapide dans ce scénario d’affaires.Cette conception réduit la complexité du système.

## Résumé

Dans cet article, à travers l’analyse d’entreprise, nous avons mis au point une combinaison de gestion résiduelle des billets de train et Newbe.Claptrap.

Nous nous concentrerons ensuite sur la conception de cet article, en expliquant comment développer, tester et déployer.

En fait, le code source du projet a été construit, et les lecteurs peuvent obtenir le：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples)
- [Gitee ( Gitee )](https://gitee.com/yks/Newbe.Claptrap.Examples)

Merci spécial[wangjunjx8868](https://github.com/wangjunjx8868)interface créée avec Blazor pour cet exemple.

<!-- md Footer-Newbe-Claptrap.md -->
