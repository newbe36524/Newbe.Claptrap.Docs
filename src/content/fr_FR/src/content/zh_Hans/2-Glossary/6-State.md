---
title: 'État'
metaTitle: 'État'
metaDescription: 'État'
---

> [La version actuellement vue est le résultat d’une correction simplifiée et manuelle traduite par la machine.S’il y a une mauvaise traduction dans le document, veuillez cliquer ici pour soumettre votre proposition de traduction.](https://crwd.in/newbeclaptrap)

L’État représente la représentation de données actuelle de l’objet Acteur dans le modèle Acteur.Claptrap ajoute juste une limite à cela.：« L’État ne peut être mis à jour que d’une manière retracée par l’événement. »State in Claptrap a une meilleure fiabilité grâce à la fiabilité de la traçabilité des événements.

## Numéro de version de l’État.

State in Claptrap a une propriété appelée Version, qui représente la version actuelle de l’État.Un numéro de version est un nombre auto-croissant qui commence à 0 et s’augmente chaque fois qu’un événement est traité.

Claptrap d’état avec le numéro de version 0 est l’état initial de Claptrap et peut également être appelé l’état de genèse.Le statut initial peut être adapté aux besoins de l’entreprise.

Il y a quelques différences entre claptrap et la manipulation des numéros de version par Minion.

Pour Claptrap, Claptrap est le producteur de l’événement, de sorte que le numéro de version de l’événement lui-même est donné par Claptrap.Par exemple, pendant le traitement d’un événement, les choses suivantes se produiront à tour de rôle.：

1. Version d’état . . . 1000.
2. Commencez à travailler avec Event, dont la version est état Version s 1 s 1001.
3. L’événement est terminé et la version d’état est mise à jour pour 1001.

Pour Minion, parce que c’est un consommateur de l’événement Claptrap.Par conséquent, le traitement du numéro de version est légèrement différent.Par exemple, lors du traitement d’un événement, les événements suivants se produisent à tour de rôle.：

1. Version d’état . . . 1000.
2. Lisez l’événement que Event Version est 1001.
3. L’événement est terminé et la version d’état est mise à jour pour 1001.

Le numéro de version de l’État et le numéro de version de l’événement sont interdépendants et mutuellement vérifiés, ce qui est essentiel à la commande d’événements.S’il y a un décalage entre le numéro de version de l’État et le numéro de version de l’événement pendant le traitement, cela peut être un problème grave.En général, il y a un décalage de nombre de version, dans deux cas.：

1. Les événements de la couche de persistance sont manquants.
2. Cadre bug malin.

## Icône.

![Claptrap.](/images/claptrap_icons/state.svg)
