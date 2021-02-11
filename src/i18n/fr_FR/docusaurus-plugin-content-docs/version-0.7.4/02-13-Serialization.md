---
title: 'Sérialisation'
description: 'Sérialisation'
---


Étant donné que les événements et les états doivent être transmis et stockés dans un système Claptrap, les événements et les états doivent être sérialisés pour gérer une grande variété de scénarios de transport et de stockage.

## Comment choisir un schéma de sérialisation

Il existe une variété d’options de sérialisation, généralement：JSON, MessagePack, Protobuf, et plus encore.Les scénarios sérialisés du projet réel peuvent être envisagés en fonction des éléments points：

1. Lisibilité.S’il y a des exigences plus élevées en matière de lisibilité, plus vous devriez envisager une sérialisation textuelle.
2. Efficacité de transmission, utilisation de l’espace de stockage.S’il y a des exigences plus élevées pour l’efficacité du transport et l’espace de stockage, la sérialisation plus binaire devrait être envisagée.

Dans le système Claptrap, parce que chaque Claptrap est entièrement personnalisable, les développeurs peuvent choisir différents schémas de sérialisation pour différents Claptrap.Cependant, la seule chose à noter est que le schéma de sérialisation est difficile à modifier une fois sélectionné, de sorte qu’il doit être soigneusement examiné à l’étape de la conception.

## Sérialisation et indépendance du transporteur

Dans le cadre claptrap, le stockage, le transport et la sérialisation sont indépendants les uns des autres.En d’autres termes, vous pouvez utiliser une sérialisation JSON plus lisible pendant la transmission, choisir une sérialisation binaire plus propice à l’utilisation du stockage, et vice versa.

## Sérialisation et contraintes de transporteur

La sérialisation sera également limitée face à des vecteurs spécifiques de stockage ou de transport.Par example：vous utilisez actuellement une base de données qui ne prend pas en charge le stockage direct binaire comme une couche persistante pour les événements, puis le choix d’enregistrer des événements par sérialisation binaire devient imparable.Par conséquent, avant de choisir un schéma de sérialisation, vous devez hiérarchiser les scénarios de transport et de stockage.

Actuellement, tous les schémas de sérialisation pris en charge sont publiés sur nuget sous le nom de « Newbe.Claptrap.DataSerializer ».
