---
title: "Étape 2 - Créer un projet"
description: "Étape 2 - Créer un projet"
---

Au cours de article [première étape - Développement environnement](01-1-Preparation.md) , continuons à apprendre à créer un projet Newbe.Claptrap.

<!-- more -->

## Installer le modèle de projet

Ouvrez la console pour exécuter les commandes suivantes pour installer le dernier projet templates：

```bash
dotnet new --install Newbe.Claptrap.Template
```

Une fois installé, vous pouvez afficher le modèle de projet installé dans les résultats d’installation.

![newbe.claptrap.template installé](/images/20200709-001.png)

## Créer un projet

Sélectionnez un emplacement, créez un dossier, et cet exemple choisit de créer un dossier appelé`HelloClaptrap`sous`D:\Répoque`.Le dossier agira comme le dossier de code pour le nouveau projet.

Ouvrez la console et passez l’annuaire de travail`D:\Repo/HelloClaptrap`.Vous pouvez ensuite créer un environnement de projet en exécutant les éléments commands：

```bash
dotnet new newbe.claptrap --name HelloClaptrap
```

> En général, nous recommandons`D:\Repo, helloClaptrap`un dossier entrepôt Git.Gérez votre code source grâce au contrôle de la version.

## Démarrer le projet

Ensuite, nous utilisons la ligne de commande pour démarrer le projet.Passez la ligne de commande`C :\Rles epos/HelloClaptrap-HelloClaptrap`, exécutez les command：

```bash
tye exécuter
```

Après le démarrage, vous pouvez voir tous les éléments contenus dans le modèle de projet sur le tye dashboard：

![service newbe.claptrap](/images/20210217-002.png)

> L’adresse du tableau de bord tye est généralement <http://localhost:8000>, et si le port est occupé, d’autres ports sont automatiquement utilisés, et vous pouvez afficher les invites sur la ligne de commande pour obtenir l’adresse spécifique actuelle.

Nous pouvons trouver l’adresse d’exploitation du service`sur l’interface indiquée ci-`-dessus.Par exemple, comme indiqué dans la figure ci-dessus, son adresse de point de terminaison est<http://localhost:14285>.

Par conséquent, nous utilisons le navigateur pour ouvrir l’adresse pour afficher l’interface fanfaronnade.

Sur la page fanfaronnade, essayez d’appeler`/AuctionItems/{itemId}/status`API：

![newbe.claptrap AuctionItems Newbe.claptrap AuctionItems Newbe.claptrap AuctionItems newbe](/images/20210217-003.png)

Le retour du service à 200 indique que les composantes du service actuel ont commencé normalement.

## Découvrez le projet

Les projets créés à l’aide de modèles de projet sont en fait un programme qui simule les enchères.

Les enchères aux enchères sont un scénario d’affaires typique qui peut avoir un scénario d’affaires dans lequel une demande doit être traitée.L’utilisation de Newbe.Claptrap peut simplement résoudre le problème.Nous continuerons d’utiliser ce scénario d’affaires pour la démonstration dans les documents ultérieurs, alors voici une description simple du scénario d’affaires.

### Règles d’affaires

Les règles commerciales sont à peu près aussi follows：

1. Chaque article de vente aux enchères `un`
2. Les ventes aux enchères ne peuvent être vendues aux enchères que pour une période de temps
3. L’article de vente aux enchères a un prix d’enchères de départ
4. Tous les enchérisseurs ont une utilisation unique `'`
5. Les enchérisseurs peuvent enchérir indéfiniment sur un article d’enchères pendant la période d’enchères, et tant que leur enchère est supérieure à l’enchère maximale actuelle, elle peut être comptée comme une offre valide et devenir l’enchérisseur actuel pour l’enchère.
6. Les détails de toutes les offres réussies, y compris le temps d’offre, le montant de l’offre, le soumissionnaire, doivent être enregistrés.

L’état des objets vendus aux enchères est aussi follows：

- `0 prévu` 'attente pour commencer le tournage
- `1 OnSell` enchères
- `2 Vendu` a été abattu
- `3 Invendus` streaming

### Conception de l’API

Pour l’effet de démonstration le plus simple, cet exemple conçoit l’API ：

- `GET/AuctionItems/{itemId}/status` l’état actuel des enchères de la vente aux enchères spécifiée
- `GET/AuctionItems/{itemId}` détails de l’article d’enchères spécifié
- `post/AuctionItems` pour des objets de vente aux enchères désignés

Utilisons un scénario simple pour faire l’expérience des effets de ces API.

#### Recherchez les articles de vente aux enchères actuellement aux enchères

Étant donné que l’état des enchères est influencé par le temps, afin que les développeurs trouvent des objets d’enchères dans divers États à tout moment, des algorithmes basés sur le temps sont utilisés pour générer des enchères dans tous les États.

Les développeurs peuvent utiliser les appels 0/1/2/3 four itemId`GET/AuctionItems/{itemId}/status`l’état actuel de la vente aux enchères.

Il ya au moins une vente aux enchères avec `1 OnSell` sur.Pour plus de commodité ultérieure, supposons que son itemId est 1.

#### Voir les détails de la vente aux enchères

En `GET/AuctionItems/{itemId}` pouvez trouver les détails de l’article de vente aux enchères.Par exemple, si nous interrogeons avec itemId pour 1, nous pouvons obtenir les résultats suivants :

```json
{
  « état »: {
    « enchèresRecords »: nul,
    « basePrice »: 10,
    « startTime »: « 2021-02-27T12:59:12.673013+08:00 »,
    « fin Temps »: « 2021-02-27T16:59:12.673013+08:00 »
  }
}
```

Les résultats ci-dessus montrent que：

- La vente aux enchères commence à basePrice 10
- La période d’enchères est le startTime - endTime période de temps
- Le dossier actuel des enchères est vide

La période peut changer en fonction de l’heure de début du projet en raison du temps qu’il faut pour démarrer le modèle de projet.

#### Essayez d’enchérir

Ensuite, nous appelons`POST / AuctionItems`pour essayer d’enchérir sur l’article de vente aux enchères actuellement en vente aux enchères, et appeler et passer dans les paramètres comme follows：

```json
{
  « userId »: 1,
  « prix »: 36524,
  « itemId »: 1
}
```

Les paramètres sont décrits below：

- Enchérisseur userId est 1
- Offre 36524
- L’article de vente aux enchères Id 1

Ça va results：

```json
{
  « succès »: vrai,
  « userId »: 1,
  « auctionItemStatus »: 1,
  « nowPrice »: 36524
}
```

Les résultats du retour montrent que：

- L’offre de succès a été couronnée de succès
- Enchérisseur userId est 1
- La dernière offre est 36524
- L’état actuel de la vente aux enchères `1 OnSell`

Vous pouvez `dernières enchères à l{itemId}` utilisant le GET/AuctionItems/：

```json
{
  "state": {
    "biddingRecords": {
      "36524": {
        "userId": 1,
        "price": 36524,
        "biddingTime": "2021-02-27T07:31:09.8954519+00:00"
      }
    },
    "basePrice": 10,
    "startTime": "2021-02-27T12:59:12.673013+08:00",
    "endTime": "2021-02-27T16:59:12.673013+08:00"
  }
}
```

Les résultats ci-dessus montrent que：

- Les enregistrements d’enchères ont été mis à jour pour inclure les derniers détails de la vente aux enchères.

Cela complète la présentation d’enchères la plus simple.

Les développeurs peuvent expérimenter avec des états et des paramètres plus différents pour expérimenter l’utilisation sous-jacente des API ci-dessus.Par exemple, une enchère est inférieure à l’enchère la plus élevée actuelle, une enchère pour un élément non-remake, et ainsi de suite.

## Arrêter le projet

Si vous souhaitez arrêter un projet de modèle qui est actuellement en cours d’exécution.Vous pouvez arrêter un programme en cours d’exécution en appuyant sur`Ctrl``C`sur le panneau de commande où vous venez d’exécuter`course de tye`.

## Résumé

Dans cet article, nous avons appris les étapes de base pour l’installation et l’utilisation de modèles de projet.

Ensuite, nous couvrirons les principaux éléments contenus dans le modèle de projet.

<!-- md Footer-Newbe-Claptrap.md -->
