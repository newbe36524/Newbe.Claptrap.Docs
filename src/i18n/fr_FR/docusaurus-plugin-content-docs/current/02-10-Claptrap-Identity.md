---
title: 'Identité Claptrap'
description: 'Identité Claptrap'
---


## Claptrap Identity est l’identité unique qui localise un Claptrap

C’est une structure.Il contient plusieurs fields：

Code de type Claptrap, code de classification Claptrap.Le code classifié est un code défini par le développeur.Généralement lié à l’entreprise associée à Claptrap.Il est important de noter qu’il n’y a pas d’association forcée entre Claptrap et son Minion Claptrap Type Code, mais habituellement pendant le développement, Minion Claptrap Type Code devrait être conçu dans le cadre de son Master Claptrap, qui est plus convivial pour les entreprises.

Id, Claptrap Business ID.C’est l’identité de l’entreprise.En règle générale, c’est la clé principale de l’entreprise.Dans le code et la documentation réels, Claptrap Identity apparaît en nom complet, et lorsque les ID apparaissent, ils se réfèrent généralement aux cartes d’identité d’entreprise.

## Claptrap Identity Il s’agit d’un design indépendant de la plate-forme

Par conséquent, lors de la combinaison avec une plate-forme spécifique, il est nécessaire de clarifier son point de liaison.

L’incarnation de Claptrap Identity à Orléans.

Claptrap Type Code：à Orléans, habituellement chaque Claptrap est placé pour fonctionner dans ClaptrapBoxGrain.À ce stade, claptrap type code est généralement marqué sur une classe ou une interface comme une balise de propriété.

Id：à Orléans, Grain lui-même est livré avec un PrimaryKey.En conséquence, le PrimaryKey est également réutilisé directement dans ClaptrapBoxGrain sous le nom de Claptrap ID.
