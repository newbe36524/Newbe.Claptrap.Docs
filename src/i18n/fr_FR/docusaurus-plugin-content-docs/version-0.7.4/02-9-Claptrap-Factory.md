---
title: 'Usine Claptrap'
description: 'Usine Claptrap'
---


## Claptrap Factory assemble Claptrap

Claptrap a un haut degré de personnalisation.Les développeurs peuvent spécifier une gamme de composants pour l’objet Claptrap, tels que le chargeur d’événements personnalisé/économiseur d’événements/chargeur d’état/économiseur d’état/ méthode de notification d’événements.Afin de s’adapter à cette personnalisation, il est nécessaire d’utiliser un bon schéma pour réaliser l’assemblage d’objets Claptrap.

Le cadre actuel est fait avec Autofac comme assembleur.La raison principale est que Autofac prend en charge des fonctionnalités telles que Delegate Factory / Decorator / Generic Type / Module qui sont plus riches que System.DesignEdencyInjection.

## Claptrap Factory contrôle le cycle de vie de Claptrap

Parce que Claptrap Factory est un producteur de Claptrap, il est également généralement responsable des capacités de contrôle du cycle de vie au niveau claptrap.Dans l’usine Claptrap basée à Autofac, ce contrôle du cycle de vie se reflète dans l’utilisation des objets LifetimeScope d’Autofac pour contrôler l’ensemble du processus de chargement, de création et de déchargement.

---

Ce qui suit est une description révélatrice pour faciliter la compréhension.Ne t’inquiète pas trop.

Claptrap Factory est l’emplacement principal pour la production Claptrap.Il effectuera l’assemblage personnalisé de chaque claptrap d’usine selon un design donné de Claptrap, qui a un taux de passage de produit très élevé et la performance.

## Icône

![claptrap claptrap](/images/claptrap_icons/claptrap_factory.svg)
