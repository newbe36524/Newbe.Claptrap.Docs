---
title: 'Claptrap Factory'
metaTitle: 'Claptrap Factory'
metaDescription: 'Claptrap Factory'
---

> [La version actuellement vue est le résultat d’une correction simplifiée et manuelle traduite par la machine.S’il y a une mauvaise traduction dans le document, veuillez cliquer ici pour soumettre votre proposition de traduction.](https://crwd.in/newbeclaptrap)

## Claptrap Factory assemble Claptrap.

Claptrap a un haut degré de personnalisation.Les développeurs peuvent spécifier un ensemble personnalisé de composants pour l’objet Claptrap, tels que la méthode Event Loader/Event Saver/State Saver/State Saver/EventNotification, etc.Afin de s’adapter à cette personnalisation, une bonne solution est nécessaire pour réaliser l’assemblage des objets Claptrap.

Le cadre actuel est fait en utilisant Autofac comme assembleur.La raison principale est que Autofac prend en charge certaines des fonctionnalités les plus riches de System.Depenedency Injection, tels que Delegate Factory /Decorator/Generic Type/Module.

## Claptrap Factory contrôle le cycle de vie de Claptrap.

Comme Claptrap Factory est un producteur de Claptrap, il est également généralement responsable de la fonction de contrôle du cycle de vie au niveau claptrap.Chez Autofac-based Claptrap Factory, ce contrôle du cycle de vie se reflète dans le processus d’utilisation de l’objet LifetimeScope d’Autofac pour contrôler l’ensemble du processus de chargement, de création et de déchargement.

---

Ce qui suit est une description basée sur l’histoire pour aider à comprendre.Je m’en fiche.

Claptrap Factory est le site principal de la production de Claptrap.Il sera personnalisé pour chaque claptrap fabriqué en usine selon le Claptrap Design donné, et il a un taux de réussite de produit très élevé et l’efficacité de l’emploi.

## Icône.

![Claptrap.](/images/claptrap_icons/claptrap_factory.svg)
