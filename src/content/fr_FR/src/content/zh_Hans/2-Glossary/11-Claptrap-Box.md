---
title: 'Claptrap Box.'
metaTitle: 'Claptrap Box.'
metaDescription: 'Claptrap Box.'
---

> [La version actuellement vue est le résultat d’une correction simplifiée et manuelle traduite par la machine.S’il y a une mauvaise traduction dans le document, veuillez cliquer ici pour soumettre votre proposition de traduction.](https://crwd.in/newbeclaptrap)

## Claptrap Box permet à Claptrap de fonctionner sur plus de cadres.

Claptrap est un objet implémenté basé sur le modèle Actor.Il n’a que la capacité de gérer l’événement et le contrôle de l’état liés.Par conséquent, dans le scénario réel, il est souvent nécessaire de s’appuyer sur l’environnement d’exploitation spécifique pour l’héberger, ou besoin de concevoir l’interface commerciale externe en fonction de l’entreprise.

Le cas d’utilisation le plus typique est de combiner avec le grain d’Orléans.Grain est la mise en œuvre de l’acteur virtuel d’Orléans, et Claptrap est un acteur.Lorsque Claptrap et Grain sont combinés, nous choisissons d’envelopper Claptrap à l’intérieur du grain.De cette façon, nous avons The Actor, qui combine le traçage d’événements, en cours d’exécution dans grain, qui tire pleinement parti des caractéristiques distribuées d’Orléans.Lorsque nous mettons Claptrap dans le grain, nous pouvons penser à grain comme une boîte, et la combinaison d’objets est très similaire au motif de façade en mode de conception, où grain fournit Claptrap avec une façade pour communiquer avec l’extérieur, masquant les détails internes tout en rendant l’extérieur plus conscient de la façon dont il interagit.Ici, nous appelons cela « comment Claptrap fonctionne dans un objet de façade spécifique » comme le modèle Claptrap Box, où l’objet de façade est appelé Claptrap Box.Cette approche permet à Claptrap d’être appliquée à des plates-formes et des entreprises plus complexes.À Orléans, cette claptrap box s’appelle Claptrap BoxGrain.

Grâce à The Claptrap Box, Claptrap peut maintenir les conditions de base du traçage des événements et du mode Acteur même s’il est séparé d’Orléans.Par exemple, dans un programme de console simple, les développeurs peuvent toujours utiliser NormalClaptrapBox comme objet de façade.Cela, cependant, perd l’avantage d’Orléans distribué.

L’existence du concept Claptrap Box permet à Claptrap d’opérer sur des plates-formes et des cadres plus basiques.Bien qu’actuellement seulement Orléans / Akka.net / pas de porteur, etc sont disponibles pour la sélection des objets de visage.

---

Ce qui suit est une description basée sur l’histoire pour aider à comprendre.Je m’en fiche.

Claptrap est un robot hautement personnalisable.Pour que Claptrap fonctionne dans un environnement plus complexe, vous devez concevoir des charges chargées pour différents environnements du monde réel afin qu’ils fonctionnent parfaitement.Par exemple.：Claptrap travaillant sur le fond marin nécessite un transporteur suffisant pour résister à la pression de l’eau; Claptrap travaillant dans un marais nécessite un véhicule à l’épreuve des pièges; et Claptrap travaillant près du cratère nécessite un transporteur fait de matériaux à haute température.Cette série de véhicules, collectivement connu sous le nom Claptrap Box.C’est parce que ces transporteurs ont tous une caractéristique commune, ils sont tous des boîtes entièrement emballées, bien sûr, dans des formes différentes, mais nous nous référons collectivement à la boîte.Avec ces véhicules, Claptrap fonctionne bien dans une variété d’environnements différents.

## Icône.

![Claptrap.](/images/claptrap_icons/claptrap_box.svg)
