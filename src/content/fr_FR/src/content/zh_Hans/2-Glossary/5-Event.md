---
title: 'Événements'
metaTitle: 'Événements'
metaDescription: 'Événements'
---

> [La version actuellement vue est le résultat d’une correction simplifiée et manuelle traduite par la machine.S’il y a une mauvaise traduction dans le document, veuillez cliquer ici pour soumettre votre proposition de traduction.](https://crwd.in/newbeclaptrap)

Claptrap est un modèle d’acteur basé sur l’événement.Les événements jouent naturellement un rôle crucial.

Vous devez transmettre des événements si vous voulez manipuler Claptrap.Les événements sont également les seuls paramètres qui modifient l’état de Claptrap.Par conséquent, lorsque vous construisez un système avec Claptrap, toutes les opérations du système sont converties en événements et passées dans Claptrap.Les événements ont ces caractéristiques.：

## Les événements sont ordonnés.

Chaque événement contient un numéro de série unique.Dans ce cadre, ce numéro de série est appelé numéro de version.Le numéro de version de l’événement est une séquence qui incrémente 1 par un.L’ordre de l’événement garantit que l’état est calculé sans concurrence.Il s’agit d’une garantie importante de fiabilité des données de l’État.

L’ordre des événements reflète directement la séquence dans laquelle Claptrap exécute des événements.Et en raison de la nécessité d’assurer cet ordre, Claptrap doit gérer les événements sur une base incident par événement.Cela se trouve avoir un ajustement naturel avec la nature à un seul filet du modèle de l’acteur.

## Les événements sont immuables.

Une fois qu’un événement est produit, il est immuable.L’origine des événements, en raison de l’immuabilité des événements, rend les données fiables.Parce que tant que l’événement est lu, il est possible de restaurer l’état après l’exécution d’un événement.Mais l’immuabilité n’est pas une limitation physique.Vous pouvez toujours modifier les données d’événements dans le stockage physique.S’il vous plaît noter, cependant, que c’est dangereux et extrêmement unre recommandé comportement.Portons-nous au " principe ouvert et proche " du mode design, qui peut se résumer à « ouvert à l’expansion, fermé à la modification ».Pourquoi devrait-on mettre l’accent sur la « fermeture à la modification »?De l’avis de l’auteur, la raison de la fermeture de la modification est en fait due à la nature inconnue provoquée par la modification.En raison de l’exécution passée du code, les données sont générées.Ils ont tous formé un certain degré de fermeture.Ils ont été validés par des tests existants.Si vous essayez de les modifier, vous devez obligé d’ajuster les tests, ce qui exacerbe davantage les modifications, ce qui n’est pas une bonne chose.La nature immuable des événements est une exigence.

Alors que se passe-t-il si les données d’événements générées par le passé sont incorrectes en raison d’un BOGUE et que le bogue doit être corrigé dès maintenant ?Le conseil de l’auteur n’est pas d’essayer de modifier les événements existants.De nouveaux événements et algorithmes doivent être ajoutés pour corriger l’état actuel.N’ajustez pas le contenu ancien.L’auteur pense que cela est plus conforme au principe de l’ouverture et de la fermeture.Les développeurs sont à leur discrétion.

## L’événement est permanent.

Les événements sont un paramètre important pour assurer la justesse de l’état claptrap.Par conséquent, vous devez vous assurer que l’événement est enregistré de façon permanente.Toutefois, il ne s’agit pas d’un cas absolu, et si les conditions suivantes sont remplies, l’événement est autorisé à être perdu.：

1. Il y a un instantané permanent de l’État avant que l’événement ne soit perdu.
2. Le Claptrap correspondant est mort et ne sera plus jamais activé.

Inversement, si les conditions ci-dessus ne sont pas remplies, il est important de s’assurer que les événements dans l’environnement de production sont correctement préservés dans la couche de persistance et qu’il existe des analyses appropriées de tolérance aux catastrophes.

## Icône.

![Claptrap.](/images/claptrap_icons/event.svg)
