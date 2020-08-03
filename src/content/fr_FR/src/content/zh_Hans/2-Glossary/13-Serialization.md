---
title: 'Sérialisation'
metaTitle: 'Sérialisation'
metaDescription: 'Sérialisation'
---

> [La version actuellement vue est le résultat d’une correction simplifiée et manuelle traduite par la machine.S’il y a une mauvaise traduction dans le document, veuillez cliquer ici pour soumettre votre proposition de traduction.](https://crwd.in/newbeclaptrap)

Étant donné que les événements et les états doivent être transférés et stockés dans le système Claptrap, les événements et les états doivent être sérialisés pour être en mesure de gérer une grande variété de scénarios de transport et de stockage.

## Comment sélectionner un schéma de sérialisation.

Les méthodes de sérialisation facultatives sont disponibles de diverses façons, généralement.：JSON, MessagePack, Protobuf, etc.Les schémas de sérialisation dans les projets réels peuvent être envisagés sur les points suivants.：

1. Lisibilité.S’il y a des exigences plus élevées en matière de lisibilité, plus vous devez envisager des scénarios de sérialisation basés sur le texte.
2. Efficacité de transfert, utilisation de l’espace de stockage.S’il existe des exigences plus élevées en matière d’efficacité de transfert et d’espace de stockage, les scénarios de sérialisation basés sur des binaires doivent être envisagés.

Dans le système Claptrap, parce que chaque Claptrap a une personnalisation totalement indépendante, les développeurs peuvent choisir différents scénarios de sérialisation pour différents Claptraps.Cependant, la seule chose à noter est qu’une fois que le schéma de sérialisation est sélectionné, il est difficile de changer, il doit donc être soigneusement considéré à l’étape de la conception.

## Sérialisation et indépendance des transporteurs.

Dans le cadre Claptrap, le stockage, le transport et la sérialisation sont indépendants les uns des autres.En d’autres termes, vous pouvez utiliser la sérialisation jSON, qui est plus lisible, lorsqu’elle est transférée, et la sérialisation binaire qui est plus propice à l’utilisation du stockage, et vice versa.

## Sérialisation et la contrainte du transporteur.

La manière dont la sérialisation est également limitée face à un vecteur particulier d’édition de stockage ou de transport.Par exemple.：Actuellement à l’aide d’une base de données qui ne prend pas en charge les binaires pour le stockage direct comme une couche persistante d’événements, il devient peu pratique de choisir d’enregistrer des événements par la sérialisation binaire.Par conséquent, avant de sélectionner un schéma de sérialisation, la priorité doit être donnée au scénario de transport et de stockage.

Actuellement, tous les schémas de sérialisation pris en charge sont publiés sur nuget sous le nom de « Newbe.Claptrap.DataSerializer. »
