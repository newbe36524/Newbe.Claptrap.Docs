---
title: 'Événements'
description: 'Événements'
---

Claptrap est un modèle d’acteur basé sur l’événement.Les événements jouent naturellement un rôle vital.

Pour faire fonctionner Claptrap, vous devez lui transmettre des événements.Les événements sont également les seuls paramètres qui modifient l’état Claptrap.Par conséquent, lorsque vous construisez un système avec Claptrap, toutes les opérations du système sont converties en événements et passées dans Claptrap.Les événements ont les characteristics：

## Les événements sont commandés

Chaque événement contient un numéro de série unique.Dans ce cadre, ce numéro de série est appelé numéro de version.Le numéro de version de l’événement est une séquence qui s’incrément par 1 à partir de 1.L’ordre de l’événement garantit qu’il n’y a pas de problème avec le calcul de l’état.Il s’agit d’une garantie importante de la fiabilité des données de l’État.

L’ordre des événements reflète directement l’ordre dans lequel Claptrap exécute des événements.En raison de la nécessité d’assurer cette commande, Claptrap doit gérer les événements au cas par cas lors de l’exécution d’événements.Cela s’inscrit naturellement dans la nature à fil unique du motif Actor.

## Les événements sont modifiés imm

Une fois qu’un événement se produit, il est imm changeable.La traçabilité des événements rend les données fiables précisément en raison de l’immuabilité de l’événement.Parce que tant que vous lisez l’événement, vous pouvez restaurer l’état après qu’un événement est exécuté.Mais l’immuabilité n’est pas une limitation physique.Vous pouvez toujours modifier les données d’événements dans le stockage physique.Veuillez toutefois noter qu’il s’agit d’un comportement dangereux et fortement peu conseillé.Contactons le « principe ouvert et étroit » dans le mode design, le classique peut se résumer comme « ouvert à l’expansion, fermé à la modification ».Pourquoi devrions-nous mettre l’accent sur « fermé à la modification »?Du point de vue de l’auteur, la raison de la modification de la fermeture est en fait en raison de la nature inconnue provoquée par la modification.En raison du code exécuté dans le passé, les données qui en résultent.Ils ont tous formé un certain degré de fermeture.Ils ont été validés par des tests existants.Si vous essayez de les modifier, vous devrez ajuster les tests, ce qui aggrave encore les modifications, ce qui n’est pas une bonne chose.La nature immédicale de l’événement est une sorte de nature, mais aussi une sorte d’exigence.

Que se passe-t-il si un BUG provoque des données d’événements incorrectes dans le passé et doit être corrigé maintenant ?Le conseil de l’auteur n’est pas d’essayer de modifier les événements existants.De nouveaux événements et algorithmes doivent être annexés pour corriger l’état actuel.N’ajustez pas l’ancien contenu.L’auteur pense que c’est plus conforme au principe d’ouverture et de fermeture.Les développeurs peuvent le faire à leur discrétion.

## L’événement est permanent

Les événements sont des paramètres importants pour s’assurer que l’état Claptrap est correct.Par conséquent, vous devez vous assurer que l’événement est enregistré en permanence.Toutefois, il ne s’agit pas d’un cas absolu, et si les conditions suivantes sont remplies, alors l’événement permet：

1. Il y a un instantané permanent de l’État avant que l’événement ne soit perdu
2. Le Claptrap correspondant est mort et ne sera plus jamais activé

Inversement, si les conditions ci-dessus ne sont pas remplies, il est important de s’assurer que les événements dans l’environnement de production sont correctement préservés dans la couche de persistance et qu’il existe des moyens appropriés de tolérance aux catastrophes.

## Icône

![claptrap claptrap](/images/claptrap_icons/event.svg)
