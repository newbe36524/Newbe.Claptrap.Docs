---
title: 'Conception.'
metaTitle: 'Système de billetterie de train - conception.'
metaDescription: 'Système de billetterie de train - conception.'
---

> [La version actuellement vue est le résultat d’une correction simplifiée et manuelle traduite par la machine.S’il y a une mauvaise traduction dans le document, veuillez cliquer ici pour soumettre votre proposition de traduction.](https://crwd.in/newbeclaptrap)

## Analyse d’entreprise.

### Frontières d’affaires.

Le système ne contient que la partie restante de la gestion des billets du billet.Autrement dit, interrogez les sièges restants, commandez des billets pour réduire les sièges.

La génération d’informations sur les commandes, le paiement, le contrôle de la circulation, le contrôle des vents de demande, etc. ne sont pas inclus dans la portée de la présente discussion.

### Cas d’utilisation des affaires.

- Vérifiez les billets restants pour connaître le nombre de voyages disponibles entre les deux stations et le nombre de sièges restants.
- Interrogez la mise en jeu du billet correspondant au nombre de trains, peut interroger le nombre donné de trains, entre les gares il ya combien de sièges restants.
- La sélection des sièges est prise en charge, et les clients peuvent choisir un nombre donné de voitures et de sièges et passer une commande pour acheter un billet.

## Implémentez une analyse de yiter difficile.

### Gestion résiduelle des billets.

La difficulté de la gestion des billets de train excédentaire réside dans la particularité du reste de l’inventaire des billets.

Marchandises ordinaires de commerce électronique, avec les SKU comme la plus petite unité, chaque SKU est indépendant les uns des autres et ne s’affecte pas les uns les autres.

Les billets de train sont différents parce que les billets restants seront affectés par le début et la fin des billets vendus.Voici un modèle logique simple pour jeter un regard détaillé sur cette particularité.

Maintenant, supposons qu’il y a un certain nombre de voitures qui passent par quatre stations, a, b, c, d, et en même temps, nous simplifions le scénario, en supposant qu’il n’y a qu’un seul siège dans la rangée.

Donc, avant que quelqu’un achète un billet, les billets restants pour ce trajet sont aussi follows：

| De la fin. | Le montant des billets restants. |
| ---------- | -------------------------------- |
| a,b.       | 1。                               |
| a, c.      | 1。                               |
| a, d.      | 1。                               |
| b,c.       | 1。                               |
| b,d.       | 1。                               |
| c, d.      | 1。                               |

Si un client a maintenant acheté un billet, c.Donc, puisqu’il n’y a qu’un seul siège, a, b et b, c n’ont pas de billets restants.Les votes restants deviennent les：suivants

| De la fin. | Le montant des billets restants. |
| ---------- | -------------------------------- |
| a,b.       | 0。                               |
| a, c.      | 0。                               |
| a, d.      | 1。                               |
| b,c.       | 0。                               |
| b,d.       | 1。                               |
| c, d.      | 1。                               |

Pour le dire plus franchement, si un client achète un, d, tous les billets restants deviendront 0.Parce que le passager était toujours assis sur le siège.

C’est la nature particulière du billet de train：le même siège du même train, le nombre de billets restants à chaque point d’extrémité sera affecté par le point de départ du billet vendu.

S’étendant un peu, il est facile de conclure qu’il n’y a pas un tel effet entre les différents sièges dans la même voiture.

### Demandes de billets restantes.

Comme mentionné dans la section précédente, en raison de la particularité de l’inventaire des billets restants.Pour le même train a, b, c, d, il ya 6 options de billets possibles.

Et il est facile de conclure que le nombre de types sélectionnés est effectivement calculé en sélectionnant une combinaison de 2 dans les sites n, qui est c (n, 2).

Donc, s’il ya une voiture qui passe à travers 34 stations, la combinaison possible est c (34,2) s 561.

Comment traiter les nombreux types de requêtes qui peuvent exister efficacement est également un problème que le système doit résoudre.

## Conception de corps de Claptrap.

![Conception du système de billetterie de train.](/images/20200720-001.png)

### Chaque siège du même train est conçu comme un Claptrap- SeatGrain.

L’état du Claptrap contient une information de base.

| Type.                                    | Nom.        | Description                                                                                                                                                                                                                           |
| ---------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IList&lt;int&gt;             | Stations.   | La liste des ids pour la station de chemin commence avec la station d’origine et se termine avec le terminal.Vérification au moment de l’achat majeur.                                                                                |
| Dictionnaire&lt;int, int&gt; | StationDic. | Dictionnaire inverse de l’index de l’id de la station routière.Les stations sont une liste d’ids d’index, et le dictionnaire est le dictionnaire id-index correspondant afin d’accélérer la requête.                                  |
| Liste&lt;string&gt;          | RequestIds. | Propriétés clés.À chaque intervalle, le billet id pour l’achat d’achat.Par exemple, l’index est 0, ce qui signifie que le billet id de la station 0 à la station 1.S’il est vide, il n’y a pas de billet d’abonnement pour le moment. |

Avec cette conception de structure de données, vous pouvez implémenter deux entreprises.

#### Vérifiez qu’il est disponible à l’achat.

En passant en deux ids de station, vous pouvez savoir si cela appartient à ce SeatGrain.Et interrogez tous les segments d’intervalle pour les points de départ et de fin.Il suffit de dire si cela n’a pas d’id de billet pour tous les segments que vous dites de RequestIds.Si ce n’est pas le cas, cela signifie qu’il peut être acheté.Si vous avez une pièce d’identité sur l’un des paragraphes, vous ne pouvez pas.

Par exemple, la situation actuelle des stations est de 10, 11, 12, 13. RequestIds, d’autre part, est de 0,1,0.

Donc, si vous voulez acheter un billet pour 10->12, non pas parce que la deuxième gamme de RequestIds a déjà été acheté.

Toutefois, si vous souhaitez acheter un billet pour 10->11, vous pouvez, parce que la première gamme de RequestIds n’est pas encore disponible.

#### Acheter.

Vous pouvez affecter l’ingon de démarrage à l’ID de billet sur tous les paramètres d’intervalle dans RequestIds.

### Les billets restants pour tous les sièges du même train sont conçus comme un Claptrap-TrainGran.

L’état du Claptrap contient quelques informations de base.

| Type.                                            | Nom.             | Description                                                                                                                                                                                                                                     |
| ------------------------------------------------ | ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IReadOnlyList&lt;int&gt;             | Stations.        | La liste des ids pour la station de chemin commence avec la station d’origine et se termine avec le terminal.Valider s’asseoir sur la requête principale.                                                                                       |
| IDictionary&lt;StationTuple, int&gt; | Compte de siège. | Propriétés clés.Station Tuple représente un point de départ.La collection contient toutes les billetteries possibles pour le début et la fin.Par exemple, si la voiture passe par 34 emplacements, le dictionnaire contient 561 paires de clés. |

En fonction de la structure de données ci-dessus, vous n’avez qu’à synchroniser les informations correspondantes au Grain chaque fois que Le SeatGrain termine le passage de la commande.

Par exemple, si a, c a un achat de billet, les billets restants pour a, c/a, b/b, c seront réduits d’un.

Cela peut être fait ici avec l’aide du mécanisme Minion intégré dans ce cadre.

Il convient de mentionner qu’il s’agit d’une conception plus vaste que les « ressources les moins compétitives ».Parce que le scénario de requête n’a pas besoin de vitesse absolue dans ce scénario d’entreprise.Cette conception réduit la complexité du système.

## Id.

![Id du système de billetterie de train.](/images/20200813-001.png)
