---
title: 'Ressources concurrentielles minimales'
description: 'Ressources concurrentielles minimales'
---


Un concept qui est important lors de l’utilisation du cadre Claptrap pour des ressources concurrentielles minimales.Comprendre ce concept peut aider les développeurs à mieux concevoir l’état de Claptrap et éviter la mauvaise conception.

## Quelle est la ressource concurrentielle minimale

Le concept de « concurrence des ressources » dans la programmation multicœur est présenté ici comme le concept de « ressource concurrentielle minimale » dans les systèmes d’entreprise.Ce concept permet de trouver facilement des points de conception pour la façon d’appliquer Newbe.Claptrap.

Par exemple, dans le cas du commerce électronique, chaque article est une « ressource concurrentielle minimale ».Notez que cela ne veut pas dire que toutes les marchandises sont une « ressource concurrentielle minimale ».Parce que, si vous comptez 10.000 articles, alors la ruée vers l’achat des première et deuxième marchandises, il n’y a pas de concurrence en soi.Par conséquent, chaque produit est une ressource concurrentielle minimale.

Voici quelques exemples available：

- Dans un système d’entreprise qui ne permet que les connexions unifaches, le ticket de connexion d’un utilisateur est la ressource la moins compétitive
- Dans un système de configuration, chaque élément de configuration est la ressource la moins compétitive
- Dans un marché boursier, chaque ordre d’achat ou de vente est la ressource la moins compétitive

Dans certains scénarios, la plus petite ressource concurrentielle est également connue sous le nom d’unité simultanée minimale

## L’État de Claptrap devrait être au moins supérieur ou égal à la portée des « ressources concurrentielles minimales ».

Combiné avec des exemples de snap-up e-commerce, si tous les éléments sont conçus dans le même État Claptrap (plus grand que la ressource concurrentielle minimale).Ensuite, différents utilisateurs achètent des éléments qui s’affectent les uns les autres parce que Claptrap est basé sur le modèle Acteur qui fait la queue pour traiter les demandes.C’est-à-dire, en supposant que chaque article doit traiter 10ms, alors il est jusqu’à 10000 pour traiter toutes les demandes d’achat.Toutefois, si chaque élément est numéroté, chaque élément est conçu comme un état Claptrap distinct.Donc, parce qu’ils ne sont pas liés les uns aux autres.La vente de toutes les marchandises ne nécessiterait théoriquement que 10ms.

Il est donc facile de conclure que si l’État de Claptrap est plus grand que la plage minimale de ressources concurrentielles, le système n’aura pas de problème avec la justesse, mais il peut y avoir des pertes de performance. En outre, si l’État de Claptrap est inférieur à la plage minimale de ressources concurrentielles, la relation entre Claptrap devient difficile à gérer et risquée.Étant donné que cela équivaut à diviser une ressource concurrentielle minimale en pièces, et que la ressource concurrentielle minimale doit habituellement être traitée en une seule transaction, cela revient au problème des transactions distribuées, qui est très courante dans la distribution, difficile à traiter.
