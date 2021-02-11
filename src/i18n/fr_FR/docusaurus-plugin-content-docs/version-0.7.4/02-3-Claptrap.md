---
title: 'Claptrap'
description: 'Claptrap'
---

Autrement dit, Claptrap ['](02-1-Actor-Pattern) [événement trace](02-2-Event-Sourcing)

![Claptrap](/images/20190228-001.gif)

Claptrap est un acteur spécial défini dans ce cadre.En plus des caractéristiques sous-jacentes de l’acteur, Claptrap est défini comme ayant les：

**état est contrôlé par l’événement**.L’état de l’acteur est maintenu au sein de l’Acteur.Il en va de même pour Claptrap, mais changer l’état de Claptrap le limite aux événements, en plus de l’acteur.Cela combine le modèle d’approvisionnement de l’événement avec le modèle Acteur.La justesse et la traçabilité de l’état de l’acteur sont garanties par le mode d’approvisionnement en événements.Ces événements qui changent l’État de Claptrap sont générés par Claptrap lui-même.Des événements peuvent se produire entre les appels externes et les mécanismes de déclenchement de classe à l’intérieur de Claptrap.

> Claptrap est un personnage classique dans un vieux jeu que newbe36524 a joué.[cliquez ici pour](https://zh.moegirl.org/%E5%B0%8F%E5%90%B5%E9%97%B9)

---

Ce qui suit est une description storytized de Claptrap pour aider à comprendre.Ne t’inquiète pas trop.

Claptrap est une structure simple et un robot de fonction simple.Bien qu’il puisse accomplir une variété de tâches, il a certaines limites.

Claptrap est un robot à fil unique qui ne peut effectuer qu’une seule tâche à la fois.Si vous voulez lui donner plusieurs tâches, il sera manipulé un par un dans l’ordre dans lequel les choses sont arrangées.

Le travail de Claptrap est probablement comme ça.Lorsqu’il acceptera une tâche, il examinera d’abord si elle est réalisable à 100 p. 100.S’ll peut le faire à 100 pour cent, écrivez-le dans son mémo et finissez-le.Ensuite, passez à la prochaine chose.

La première chose que Claptrap fait tous les matins est de trouver son moi perdu.Reviens le grand moi que tu étais hier.Tout d’abord, il va essayer de voir s’il ya de belles photos d’hier, le cas échéant, il va regraver l’apparition d’hier.Ensuite, lisez le mémo dans votre main ce qui s’est passé après la séance photo d’hier et de restaurer progressivement votre mémoire.De cette façon, le succès de la récupération de leurs propres.

Claptrap est un robot standardisé.Ils sont tous produits sur la chaîne de production de l’usine Claptrap.L’usine assemble un robot Claptrap à l’aide de composants standardisés conformément à la conception Claptrap.Ces composants nécessaires comprennent：mémoire, des mémos portatifs, des processeurs de tâches multifonctions et des imprimantes mémoire.

Mémoire.Claptrap est équipé d’une mémoire personnalisée pour contenir les données d’état actuelles pour l’ensemble de la machine.En raison de la coupure de courant des données de mémoire, si Claptrap perd de la puissance, les données en mémoire sont perdues.

Processeur de tâches multifonctionnel.Pour des raisons de coût, chaque Claptrap est équipé d’un processeur multitâle qui est personnalisé pour des tâches spéciales.Pour：Claptrap, qui se spécialise dans la lutte contre les incendies, inclut essentiellement des fonctionnalités liées au feu dans leurs processeurs de tâches multifonctions.Mais il ne peut pas gérer les tâches domestiques.

Notes de poche.Avant chaque tâche, Claptrap enregistre tous les détails de la tâche avec une note de service tenue à la main pour s’assurer que chaque détail de la tâche est exact.

Imprimante mémoire.Les données en mémoire peuvent être imprimées dans un format physique qui peut être persisté, et plus de mémoires d’ADN sont utilisées dans la production réelle.En raison de la coupure de courant des données de mémoire, les données en mémoire ne peuvent être récupérées qu’une par une par des enregistrements de mémo après le redémarrage.Mais comme les données des notes de service sont susceptibles d’être importantes, il sera lent à se rétablir.À l’aide d’une imprimante mémoire, vous pouvez imprimer l’état de mémoire à un certain moment, ce qui accélère la récupération des données mémoire lorsque vous redémarrez la récupération.

## Icône

![claptrap claptrap](/images/claptrap_icons/claptrap.svg)
