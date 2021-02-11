---
title: 'Conception'
description: 'Système de billetterie des trains - conception'
---


## Analyse d’entreprise

### Frontières d’affaires

Le système ne contient que la partie restante de la gestion des billets du billet.C’est-à-dire, interroger les sièges restants, commander un billet pour réduire le siège.

La production d’informations sur les commandes, le paiement, le contrôle de la circulation, la demande de contrôle du vent, etc. ne sont pas incluses dans le champ d’application de cette discussion.

### Cas d’utilisation commerciale

- Vérifiez les billets restants et être en mesure de vérifier le nombre de billets disponibles entre les deux stations et le nombre de sièges restants.
- Vérifiez les billets restants correspondant au nombre de voyages, peut interroger le nombre donné de fois, entre les stations combien de sièges restent.
- Prise en charge de la sélection des sièges, les clients peuvent choisir un nombre donné de voitures et de sièges, et commander des billets.

## Mettre en œuvre une analyse difficile

### Gestion résiduelle des billets

La difficulté de la gestion résiduelle des billets de train réside dans la particularité du reste de l’inventaire des billets.

Les marchandises ordinaires de commerce électronique, SKU comme la plus petite unité, chaque SKU est indépendant les uns des autres, ne s’affectent pas les uns les autres.

Les billets restants pour le train sont différents, car ils seront affectés par la vente de billets à partir de la fin du terme.Voici un modèle logique simple pour obtenir un regard détaillé sur cette particularité.

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

Si un client a maintenant acheté un billet a,c.Donc, comme il n’y a qu’un seul siège, il n’y a pas d’autres billets que c,d.Le reste de la situation de vote devient le：

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

## Conception de corps de Claptrap

![Conception du système de billetterie ferroviaire](/images/20200720-001.png)

### Concevoir chaque siège sur la même conduite qu’un Claptrap-SeatGrain

L’État de Claptrap contient une information de base

| Type                                     | Nom                     | Description                                                                                                                                                                                            |
| ---------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| IList&lt;int&gt;             | Stations                | La liste id des stations d’itinéraire, en commençant par la station d’origine et se terminant par le terminal.Vérification au moment de l’achat du billet principal.                                   |
| Dictionnaire&lt;int, int&gt; | StationDic (en)         | Le dictionnaire inverse de l’index qui adage l’id de la station.Les stations sont une liste d’index-ids, et le dictionnaire est le dictionnaire id-index correspondant, afin d’accélérer les requêtes. |
| Liste&lt;string&gt;          | RequestIds (requestids) | Propriétés clés.À chaque intervalle, l’id de billet acheté.Par exemple, un index de 0 représente un id de billet de la station 0 à la station 1.S’il est vide, il n’y a pas de billet d’abonnement.    |

Avec la conception de cette structure de données, deux entreprises peuvent être mises en œuvre.

#### Vérifiez qu’il peut être acheté

En passant dans deux identifiants de station, vous pouvez savoir si cela appartient à ce SeatGrain.Et interrogez tous les segments d’intervalle correspondant aux points de départ et de fin.Il suffit de juger si tous les segments des RequestIds n’ont pas d’iD de billet.Sinon, il peut être acheté.S’il y a déjà une pièce d’identité d’achat de billet sur n’importe quelle section, l’achat n’est plus possible.

Par exemple, la situation actuelle avec les stations est de 10, 11, 12, 13. RequestIds, d’autre part, sont 0,1,0.

Donc, si vous achetez un billet de 10>12, ce n’est pas possible parce que la deuxième gamme de RequestIds a déjà été achetée.

Toutefois, si vous voulez>10- 11 billets, vous pouvez, parce que personne dans la première gamme de RequestIds n’a pas encore de les acheter.

#### Acheter

Il suffit de placer les points de départ et de fin sur tous les paramètres du segment d’intervalle dans RequestIds.

### Concevoir le billet restant pour tous les sièges sur le même trajet qu’un Claptrap-TrainGran

L’État de Claptrap contient quelques informations de base

| Type                                             | Nom                   | Description                                                                                                                                                                                                                                                                         |
| ------------------------------------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IReadOnlyList&lt;int&gt;             | Stations              | La liste id des stations d’itinéraire, en commençant par la station d’origine et se terminant par le terminal.Valider sur la requête principale.                                                                                                                                    |
| IDictionary&lt;StationTuple, int&gt; | SeatCount (SeatCount) | Propriétés clés.StationTuple représente un point de départ.La collection contient les billets restants pour tous les points de départ et de fin possibles.Par exemple, selon ce qui précède, si le trajet passe à travers 34 emplacements, le dictionnaire contient 561 paires clés |

Sur la base de la structure de données ci-dessus, vous n’avez qu’à synchroniser les informations correspondantes avec le grain une fois chaque commande SeatGrain terminée.

Par exemple, si a,c a un achat de billet, les billets restants pour a,c/a,b/b,c seront réduits d’un.

Cela peut être réalisé avec le mécanisme Minion intégré dans ce cadre.

Il convient de mentionner qu’il s’agit d’une conception plus grande que la « ressource concurrentielle minimale ».Parce que le scénario de requête n’a pas besoin d’être absolument rapide dans ce scénario d’affaires.Cette conception réduit la complexité du système.

## Id

![Id système de billetterie de train](/images/20200813-001.png)
