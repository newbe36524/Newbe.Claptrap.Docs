---
title: 'Instantané d’état'
description: 'Instantané d’état'
---

## L’instantané d’état accélère la vitesse de restauration d’état

Un Claptrap actif dont l’État est l’état actuel des dernières données.Ceci est restauré à partir de la couche de persistance par l’approvisionnement d’événement.Parfois, le nombre d’événements peut être très important.Restaurer l’État à travers les événements prendra plus de temps.Par conséquent, un instantané d’état est fourni dans le cadre Claptrap pour persister l’état d’un Claptrap particulier après une certaine condition.Cette condition est habituellement la following：

1. Après plusieurs événements ont été exécutés.
2. Chez Claptrap Deactive.
3. Sur une période de temps.

La présence d’instantanés d’événements augmente la vitesse à laquelle les états sont restaurés à partir de la couche persistante.Si un instantané existe dans une couche persistante, la restauration d’un état est généralement effectuée en suivant：

1. Lisez l’instantané de l’état.
2. Commencez par le numéro de version de l’instantané d’état et relisez tous les événements pour les mises à jour de l’état.
3. Mettez à jour l’état jusqu’à ce que la couche de persistance n’ait pas d’événements restants.

Toutefois, s’il n’y a pas d’instantané, l’étape de restauration devient la：

1. Créez un état initial grâce à une méthode définie par l’utilisateur.
2. Lisez tous les événements de la bibliothèque d’événements pour les mises à jour de statut.
3. Mettez à jour l’état jusqu’à ce que la couche de persistance n’ait pas d’événements restants.

Mais.L’existence d’instantanés apporte également une certaine spécialité.Combiné avec les étapes ci-dessus, il est facile de voir qu’une fois qu’un instantané est：

1. La méthode personnalisée de l’utilisateur ne sera plus exécutée.
2. Les événements plus petits que le numéro de version instantanée ne seront pas exécutés à nouveau.

Actuellement, le framework ne peut contenir qu’un seul instantané final pour chaque ID.
