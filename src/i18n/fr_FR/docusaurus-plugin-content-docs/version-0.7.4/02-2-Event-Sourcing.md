---
title: 'Sourcing événement'
description: 'Sourcing événement'
---

Le modèle de traçabilité des événements est une sorte d’idée de conception logicielle.Ce type d’idée de conception est généralement différent de l’idée traditionnelle de conception du système qui est principalement basée sur le contrôle add-delete et la correction (CRUD).Les applications CRUD ont souvent des limitations：

1. En général, les applications CRUD prennent la pratique d’exploiter directement le stockage de données.Cette implémentation peut entraîner des goulots d’étranglement des performances en raison d’une optimisation insuffisante de la base de données, et il peut être plus difficile d’mettre à l’échelle votre application.
2. Dans des domaines spécifiques, il y a souvent des problèmes de données qui nécessitent une attention particulière pour prévenir les erreurs dans les mises à jour des données.Cela nécessite souvent l’introduction de « verrous », « transactions » et d’autres technologies connexes pour éviter de tels problèmes.Toutefois, cela peut également entraîner des pertes de performance.
3. À moins que des vérifications supplémentaires ne soient ajoutées, l’historique des modifications apportées aux données n’est généralement pas traçable.Parce que l’état final des données est généralement stocké dans le magasin de données.

Contrairement aux pratiques crud, l’approvisionnement en événements évite les limitations décrites ci-dessus par la conception.Ensuite, décrivez les façons sous-jacentes dont l’approvisionnement en cas d’événement fonctionne autour du scénario d’affaires de « transfert » mentionné ci-dessus.

Utilisez la crudding pour réaliser des « transferts ».

![« Transfert » selon la méthode CRUD](/images/20190226-006.gif)

Le « transfert » est réalisé à l’aide du traçage des événements.

![« Transfert » avec l’approvisionnement d’événements](/images/20190227-001.gif)

Comme le montre la figure ci-dessus, les changements de solde impliqués dans l’activité de transfert sont stockés sous forme d’événements via le modèle de traçabilité des événements.L’entreprise elle-même est également réalisée, ce qui apporte benefits：

- Grâce à l’événement, vous pouvez restaurer le solde du compte à n’importe quelle étape, ce qui, dans une certaine mesure, pour atteindre le suivi du solde du compte.
- Parce que les événements pour les deux comptes sont traités indépendamment.Par conséquent, la vitesse de traitement des deux comptes ne s’affecte pas mutuellement.Par exemple, le transfert du compte B peut être légèrement retardé en raison de la nécessité d’un traitement supplémentaire, mais le compte A peut toujours être transféré.
- Vous pouvez faire quelques affaires de traitement asynchrone en vous abonnant à des événements.Par：autres actions asynchrones telles que la mise à jour des statistiques dans la base de données, l’envoi de notifications SMS, et ainsi de suite.

Bien sûr, l’introduction du mode d’approvisionnement des événements a introduit quelques problèmes techniques liés à l’approvisionnement en événements.Par：le stockage consommé par un événement peut être important, la cohérence éventuelle doit être appliquée, les événements sont immuables, la refactorisation peut être difficile, et ainsi de suite.Ces questions sont décrites plus en détail dans certains articles.Les lecteurs peuvent lire les lectures étendues ultérieures pour la compréhension et l’évaluation.

> Ressources
> 
> - [Modèle d’approvisionnement d’événements](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/dn589792%28v%3dpandp.10%29)
> - [Événement Sourcing Pattern traduction chinoise](https://www.infoq.cn/article/event-sourcing)
