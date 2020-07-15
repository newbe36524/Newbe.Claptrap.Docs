---
title: 'Sourcing d’événements'
metaTitle: 'Sourcing d’événements'
metaDescription: 'Sourcing d’événements'
---

Le mode de traçage d’événements est une sorte d’idée de conception de logiciel.Ce genre d’idée de conception est généralement différent de l’idée traditionnelle de conception de système basée sur l’addition et la suppression (CRUD).Les applications CruD ont souvent certaines limites：

1. En général, les applications CRUD prennent directement la pratique de l’exploitation du stockage de données.Une telle implémentation peut entraîner des goulots d’étranglement des performances en raison d’une optimisation inadéquate des bases de données, ce qui peut être difficile à mettre à l’échelle des applications.
2. Il y a souvent des données dans un domaine particulier qui nécessitent une attention particulière au traitement des problèmes de concurrence pour prévenir les erreurs dans les mises à jour de données.Cela nécessite souvent l’introduction de techniques connexes telles que les serrures, les transactions, etc. pour éviter de tels problèmes.Mais cela peut aussi conduire à des pertes de performance.
3. À moins que des vérifications supplémentaires ne soient ajoutées, l’historique des modifications de données est généralement introuvable.Étant donné que le magasin de données est généralement enregistré dans l’état final des données.

Contrairement à l’approche CRUD, le traçage des événements évite les limites de la description ci-dessus par conception.L’étape suivante consiste à décrire la méthode de travail de base du suivi des événements autour du scénario d’entreprise de « transfert » mentionné ci-dessus.

Utilisez l’approche CRUD pour « ransfére ».

![« Transfert » à l’aide de CRUD](/images/20190226-006.gif)

« ransfér » sous forme de traçabilité des événements.

![« Transfert » à l’aide d’une approche de traçage d’événements](/images/20190227-001.gif)

Comme le montre la figure ci-dessus, les changements d’équilibre impliqués dans l’activité de transfert sont stockés d’une manière basée sur des événements à travers le modèle de traçage des événements.Réalise également l’entreprise elle-même, ce qui apporte quelques avantages：

- Grâce à l’événement, vous pouvez rétablir le solde de n’importe quelle étape du compte, qui dans une certaine mesure pour atteindre le suivi du solde du compte.
- Parce que les événements des deux comptes sont traités indépendamment.Par conséquent, la vitesse de traitement des deux comptes ne s’affecte pas l’un l’autre.Par exemple, le transfert du compte B peut être légèrement retardé en raison d’un traitement supplémentaire, mais le compte A peut toujours être transféré.
- Vous pouvez vous abonner à des événements pour effectuer un traitement asynchrone de votre entreprise.Par exemple,：Mettez à jour les statistiques de la base de données, envoyez des notifications SMS et d’autres opérations asynchrones.

Bien sûr, l’introduction du mode de traçage des événements a également introduit certains des problèmes techniques connexes de traçage des événements.Par exemple,：Les événements peuvent consommer de grandes quantités de stockage, la cohérence éventuelle doit être appliquée, les événements sont immuables, la refactorisation peut être difficile, et ainsi de suite.Ces questions connexes sont décrites plus en détail dans certains articles.Les lecteurs peuvent lire la lecture étendue pour mieux comprendre et évaluer.

> Ressources
> 
> - [Modèle d’approvisionnement d’événements](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/dn589792%28v%3dpandp.10%29)
> - [Traduit par Event Sourcing Pattern Chinois](https://www.infoq.cn/article/event-sourcing)
