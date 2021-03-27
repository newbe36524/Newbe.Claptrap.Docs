---
title: 'Boîte Claptrap'
description: 'Boîte Claptrap'
---


## Claptrap Box permet à Claptrap de s’exécuter sur plus de frameworks

Claptrap est un objet implémenté en fonction du modèle Actor.Il n’a que la capacité de gérer les événements et les problèmes liés au contrôle de l’État.Par conséquent, dans le scénario réel, ont souvent besoin de s’appuyer sur l’environnement d’exploitation spécifique pour le transporter, ou besoin de concevoir l’interface d’entreprise externe en fonction de l’entreprise.

Le cas d’utilisation le plus typique est de combiner avec grain d’Orléans.Grain est une mise en œuvre acteur virtuel pour Orléans, et Claptrap est acteur.Lorsque Claptrap et Grain ont été combinés, nous avons choisi d’encapsuler Claptrap à l’intérieur de Grain.De cette façon, nous faisons claptrap, un acteur retracé événement, courir dans grain, qui tire parti du soutien d’Orléans pour les fonctionnalités distribuées.Lorsque nous mettons Claptrap dans le grain pour courir, nous pouvons penser à Grain comme une boîte qui combine des objets très similaires au modèle de visage en mode design, et Grain fournit Claptrap avec un visage pour communiquer avec l’extérieur, protégeant les détails internes tout en rendant l’extérieur plus compréhensif de la façon dont il interagit.Ici, nous nous référons à ce « comment Claptrap est monté pour exécuter dans un objet visage particulier » comme claptrap box mode, où l’objet du visage est appelé Claptrap Box.Cette approche permet à Claptrap d’être appliqué à des plateformes et des entreprises plus complexes.À Orléans, cette Claptrap Box s’appelle ClaptrapBoxGrain.

En raison de Claptrap Box, Claptrap peut maintenir les conditions de base de l’approvisionnement événement et le mode Acteur, même si elle est détachée d’Orléans.Par exemple, dans un programme de console simple, les développeurs peuvent toujours utiliser NormalClaptrapBox comme objet de visage.Toutefois, cela perd l’avantage d’Orléans distribué.

Le concept Claptrap Box permet à Claptrap de fonctionner sur des plateformes et des frameworks plus sous-jacents.Bien qu’actuellement seulement Orléans / Akka.net / non scellés, etc peuvent être sélectionnés objets visage.

---

Ce qui suit est une description révélatrice pour faciliter la compréhension.Ne t’inquiète pas trop.

Claptrap est un robot hautement personnalisable.Afin que Claptrap fonctionne dans des environnements plus colorés et complexes, certains transporteurs qui peuvent être chargés avec Claptrap doivent être conçus pour différents environnements du monde réel afin qu’ils puissent fonctionner parfaitement.Par exemple,：Claptrap travaillant sur le fond marin doit être équipé d’un véhicule suffisant pour résister à la pression de l’eau, Claptrap travaillant dans un marais doit être équipé d’un transporteur étanche à l’humidité, et Claptrap travaillant près du cratère doit être équipé d’un transporteur fait de matériaux résistants à la température élevée.Cette série de transporteurs, nous appelons collectivement Claptrap Box.C’est parce que ces transporteurs ont tous une caractéristique commune, ils sont tous plein-paquet boîte, bien sûr, différentes formes, mais nous appelons collectivement boîte.Avec ces transporteurs, Claptrap peut bien fonctionner dans une variété d’environnements.

## Icône

![claptrap claptrap](/images/claptrap_icons/claptrap_box.svg)
