---
title: 'Instantané d’état'
metaTitle: 'Instantané d’état'
metaDescription: 'Instantané d’état'
---

> [La version actuellement vue est le résultat d’une correction simplifiée et manuelle traduite par la machine.S’il y a une mauvaise traduction dans le document, veuillez cliquer ici pour soumettre votre proposition de traduction.](https://crwd.in/newbeclaptrap)

## State Snapshot accélère la vitesse de restauration de l’état.

Un Claptrap actif dont l’état est l’état actuel des données les plus récentes.Ceci est restauré à partir de la couche de persistance en traçant l’origine des événements.Parfois, le nombre d’événements peut être très important.Il faudra plus de temps pour restaurer l’État à travers les événements.Par conséquent, un instantané d’état est fourni dans le cadre Claptrap pour maintenir l’état d’un Claptrap particulier après une certaine condition.Cette condition est généralement la suivante.：

1. Plusieurs événements ont été exécutés.
2. Chez Claptrap Deactive.
3. Dans une certaine période de temps.

La présence d’instantanés d’événements augmente la vitesse à laquelle les états sont restaurés à partir de la couche persistante.Si un instantané existe dans le calque persistant, une restauration d’état est généralement effectuée aux étapes suivantes.：

1. Lisez l’instantané d’état.
2. En commençant par le numéro de version correspondant à l’instantané d’état, lisez tous les événements en arrière pour les mises à jour d’état.
3. Mettez à jour l’état jusqu’à ce que le calque persistant n’ait plus d’événements.

Toutefois, s’il n’y a pas d’instantanés, l’étape de restauration change à ce qui suit.：

1. Créez l’état initial à l’aide d’une méthode définie par l’utilisateur.
2. Lisez tous les événements de la bibliothèque d’événements pour mettre à jour l’état.
3. Mettez à jour l’état jusqu’à ce que le calque persistant n’ait plus d’événements.

Mais.La présence d’instantanés apporte également une certaine spécialité.Combiné avec les étapes de travail ci-dessus, il est facile de voir qu’une fois qu’un instantané est formé.：

1. La méthode personnalisée de l’utilisateur ne sera plus exécutée.
2. Les événements inférieurs au numéro de version instantané ne seront plus exécutés.

Actuellement, le cadre ne peut contenir qu’un seul instantané final pour chaque id.
