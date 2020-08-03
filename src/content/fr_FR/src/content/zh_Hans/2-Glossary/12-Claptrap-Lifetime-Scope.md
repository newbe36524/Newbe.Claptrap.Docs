---
title: 'Cycle de vie Claptrap'
metaTitle: 'Cycle de vie Claptrap'
metaDescription: 'Cycle de vie Claptrap'
---

> [La version actuellement vue est le résultat d’une correction simplifiée et manuelle traduite par la machine.S’il y a une mauvaise traduction dans le document, veuillez cliquer ici pour soumettre votre proposition de traduction.](https://crwd.in/newbeclaptrap)

Le cycle de vie de Claptrap est illustré en deux grandes catégories selon le point de vue de l’auteur.：Cycle de vie en cours d’exécution et cycle de vie de conception-temps.

## Cycle de vie de l’exécution.

Le cycle de vie de l’exécution est le comportement du cycle de vie de chaque objet en mémoire pendant le fonctionnement du système Claptrap.Par exemple.：Dans un système Web, chaque demande Web est généralement affectée en tant que cycle de vie, et le système Claptrap a une conception similaire au cycle de vie.Ces cycles de vie ont un impact sur les extensions de composants ou le développement des activités des développeurs.Le cycle de vie de l’exécution du cadre Claptrap est divisé en.：Processus, Claptrap et Gestionnaire d’événements.

Niveau de processus.Un objet conçu comme un cycle de vie au niveau du processus est un objet singleton au sens général.Chaque processus Claptrap en cours d’exécution a son propre objet singleton.En règle générale, dans un cadre Claptrap, par exemple, chaque cible de couche persistante correspond à un processeur de lot (Batch Saver Event) pour augmenter la vitesse à laquelle les événements sont écrits sur la couche persistante.Ils n’ont qu’une seule instance tout au long du cycle de vie du processus, un à un correspondant à la couche de persistance correspondante, de sorte que les événements peuvent être fusionnés pour écrire à la couche de persistance, améliorant les performances d’écriture.En général, les objets conçus pour être des cycles de vie au niveau du processus présentent une ou plusieurs des caractéristiques suivantes.：

1. Vous n’avez besoin d’exécuter la logique ou le code qu’une seule fois tout au long du cycle de vie du processus.Cela peut généralement être fait avec Lazy et un singleton.
2. Un seul objet est requis tout au long du cycle de vie du processus.Par exemple, Claptrap Design Store, Options Claptrap, et ainsi de suite.
3. Il ne peut y avoir qu’un seul objet tout au long du cycle de vie du processus.Par exemple, Orléans Client.

Niveau Claptrap.Les objets du cycle de vie au niveau Claptrap sont créés avec l’activation de Claptrap et sont libérés avec l’inactivation de Claptrap.Ces objets sont généralement fortement associés à une identité Claptrap.Par exemple, Claptrap Design, Event Saver, Event Loader, State Saver, State Loader, et ainsi de suite associés à cette identité Claptrap.

Niveau du processeur d’événements (Gestionnaire d’événements).Les objets du cycle de vie au niveau du processeur d’événements sont créés au fur et à mesure que le processeur d’événements est créé et libéré avec la version du processeur d’événements.Ce niveau de cycle de vie est similaire au cycle de vie des demandes Web en réponse au Web.En règle générale, l’unité de travail d’une transaction de base de données unifiée tombe à ce niveau.

## Cycle de vie de conception-temps.

Les cycles de vie du temps de conception sont les cycles de vie des objets métier pour Claptrap.Cela n’a rien à voir avec la question de savoir si le programme est en cours d’exécution ou non, ou même si oui ou non le programme est utilisé.Pour donner un exemple précis, les commandes dans un système de commerce électronique régulier.Le délai d’affaires actif pour une commande n’est généralement pas supérieur à trois à six mois.Lorsque ce délai est dépassé, les données de commande ne peuvent pas être modifiées.Ici, ce délai de « trois à six mois » s’appelle le cycle de vie de temps de conception d’une commande.Dans un système Claptrap, si un objet a dépassé son cycle de vie en temps de conception, il se manifeste comme « il n’est plus nécessaire d’activer cette entreprise Claptrap ».Les inférences suivantes peuvent être obtenues à partir de cela.：

1. Les événements que Claptrap a stockés sont dénués de sens, et leur suppression libère de l’espace libre.
2. Le code métier du Claptrap n’a plus besoin d’être maintenance et vous pouvez choisir de supprimer la référence ou de supprimer le code.

Par conséquent, plus le cycle de vie de la conception de Claptrap est court, plus il est propice à la réduction de l’empreinte des ressources et des coûts d’entretien du code, et vice versa, l’augmentation des coûts de stockage et des difficultés d’entretien.Par conséquent, lors de la conception des systèmes Claptrap, il ya une tendance à utiliser un cycle de vie plus court de conception-temps.Et ce nom, reflète également directement le réel entièrement par « conception » pour déterminer. Ensuite, énumérons une classification commune du cycle de vie de conception-temps.

### Délimitation des frontières commerciales.

C’est la division la plus courante.Les objets métier sont divisés en fonction des exigences de modélisation de domaine.Et ces objets d’affaires ont souvent un cycle de vie fixe.Comme dans l’ordre précédent est un exemple courant de diviser le cycle de vie par les frontières des entreprises.Lorsque vous divisez à l’aide de cette méthode, vous n’avez qu’à noter que Claptrap répond à l’exigence de base selon laquelle « la plage de ressources compétitive minimale est supérieure ou égale à celle-ci ».Les développeurs peuvent découvrir cette division avec un exemple de « système de billetterie de train ».

### Délimitation conditionnelle des limites.

En général, la méthode de division axée sur les limites des entreprises a été en mesure de diviser un cycle de vie raisonnable.Toutefois, si vous êtes simplement divisé le long des frontières de l’entreprise, vous pouvez avoir des objets de vie de conception-temps-temps-permanent.Supposons que ces objets ont des opérations d’événements très denses.Ensuite, le nombre d’événements générés sera exceptionnellement important.Pour ce faire, nous introduisons des moyens contrôlés par l’homme de raccourcir le cycle de vie de conception-temps.Cette division est basée sur des conditions spécifiques.C’est donc ce qu’on appelle la délimitation conditionnelle des frontières.Et le plus classique d’entre eux est l’utilisation de « limite de temps » pour diviser.

Ici, nous illustrons cette division en utilisant l’objet panier d’achat dans l’exemple Démarrage rapide.Tout d’abord, un panier d’achat est un objet lié à l’utilisateur, et tant que l’utilisateur a été dans le système, il est possible d’être activé, c’est-à-dire, son cycle de vie de conception est « erti permanent ».Par conséquent, vous ne pouvez pas supprimer les événements connexes et les enregistrer de façon permanente pour vous assurer que les données du panier d’achat sont correctes.Mais si nous ne nous soucions pas des événements qu’un panier a causé il ya un an.Nous pouvons diviser manuellement les paniers d’achat des utilisateurs par année.En même temps, nous pouvons faire une « copie de statut » dans un panier d’achat pendant deux années adjacentes.Cela prolonge les données d’état de l’année précédente, ce qui entraîne un cycle de vie de conception plus court pour le panier d’achat de l’utilisateur, et cela n’affecte pas l’entreprise.Nous pouvons utiliser une histoire classique de légende chinoise, « The Fool’s Move Mountain », pour comprendre cette classification du cycle de vie de conception basée sur le temps.Dans l’histoire, les imbéciles sont des mortels, et bien qu’ils ne puissent pas vivre éternellement (cycles de vie plus courts de conception-temps), l’esprit des imbéciles (cycles de vie plus longs de conception-temps) peut continuer avec les générations futures, et peut ainsi compléter la grande cause de la migration de montagne.Lorsque chaque génération de « imbéciles » est remplacée, la « copie d’État » (continuation spirituelle) mentionnée ci-dessus se produit.Il en résulte un cycle de vie plus court, permettant un cycle de vie plus long, voire permanent, de conception-temps.
