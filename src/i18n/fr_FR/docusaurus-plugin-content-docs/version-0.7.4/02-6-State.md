---
title: 'Statut (État)'
description: 'Statut (État)'
---

L’état représente les performances de données actuelles de l’objet Acteur en mode Acteur.Claptrap ajoute simplement une limite à cette：« L’État ne peut être mis à jour que par l’approvisionnement en événements.En raison de la fiabilité de la traçabilité des événements, State in Claptrap a également une meilleure fiabilité.

## Le numéro de version de l’Etat

State in Claptrap a une propriété appelée Version qui représente la version actuelle de l’État.Le numéro de version est un numéro auto-ajouté qui commence à 0 et s’auto-augmente après chaque événement est traité.

L’état avec la version numéro 0 est l’état initial de Claptrap et peut également être appelé un état de Genèse.L’état initial peut être personnalisé en fonction des besoins de l’entreprise.

Claptrap et Minion ont également quelques différences dans la façon dont les numéros de version sont traités.

Pour Claptrap, Claptrap est le producteur de l’événement, de sorte que le numéro de version de l’événement lui-même est donné par Claptrap.Par exemple, lors du traitement d’un événement, les choses suivantes se produiront dans turn：

1. Version d’État = 1000
2. Démarrer le traitement de l’événement, dont la version d’état version s 1 s 1001
3. L’événement est traité, mettre à jour state version s 1001

Pour Minion, parce que c’est un consommateur d’événements Claptrap.Par conséquent, le numéro de version est traité légèrement différemment.Par exemple, lors du traitement d’un événement, les événements suivants se produiront：

1. Version d’État = 1000
2. Un événement avec Event Version 1001 a été lu
3. L’événement est traité, mettre à jour state version s 1001

Le numéro de version de l’État et le numéro de version de l’événement sont interdépendants et mutuellement validés, ce qui est la clé de l’ordre d’événement.S’il y a un décalage entre le numéro de version de l’État et le numéro de version de l’événement pendant le traitement, cela peut être un problème grave.En général, il y a un décalage de numéro de version, et il n’y a que deux cas：

1. Les événements de la couche de persistance ont été perdus
2. Cadre malin BUG

## Icône

![claptrap claptrap](/images/claptrap_icons/state.svg)
