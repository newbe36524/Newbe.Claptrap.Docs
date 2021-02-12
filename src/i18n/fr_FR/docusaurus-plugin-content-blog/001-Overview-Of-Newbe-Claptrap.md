---
date: 2019-02-28
title: Newbe.Claptrap - Un cadre de développement côté service avec « approvisionnement événementiel » et « Mode Acteur » comme théories de base
---

Cet article est une introduction au contenu principal du projet Newbe.Claptrap, à travers lequel les lecteurs peuvent obtenir une compréhension générale du contenu du projet.

<!-- more -->

## Les roues sont dérivées de la demande

Avec le développement rapide des applications Internet, des théories techniques pertinentes et des moyens de mise en œuvre sont constamment créés.Une série de mots clés tels que Cloud Native Architecture, MicroServer Architecture et DevOps sont de plus en plus aux yeux des ingénieurs.En résumé, l’émergence de ces nouvelles théories et technologies est de résoudre certains des points de douleur technique dans l’Internet applications：

**des exigences d’évolutivité de capacité plus élevées**.Sur la base du succès commercial, le nombre d’utilisateurs d’applications Internet, la pression du système et le nombre d’appareils matériels augmenteront considérablement au fil du temps.Cela exige l’application de l’évolutivité de la capacité dans la province.Cette évolutivité de la capacité est souvent décrite comme « les applications doivent prendre en charge l’échelle horizontale ».

**exigences plus élevées en matière de stabilité du système**.L’application s’exécute en permanence pour assurer le progrès continu des activités commerciales, que toute personne associée à cette application aimerait voir.Mais il est généralement très difficile de le faire.Applications Internet d’aujourd’hui face à de nombreux concurrents du même genre, si ce n’est assez solide à cet égard, alors il est susceptible de perdre une partie de la faveur de l’utilisateur.

**exigences plus élevées en matière d’évolutivité fonctionnelle**.« Embrasser le changement », un mot qui vient dans les gens quand ils mentionnent « gestion de projet agile » contenu lié.Ce mot reflète pleinement l’importance pour les applications Internet d’aujourd’hui de réussir et d’avoir un succès fonctionnel.Il reflète également la demande mobile de produits dans l’environnement Internet actuel d’un côté.En tant qu’ingénieur systèmes, cela devrait être envisagé au début de l’application.

**plus grande facilité d’utilisation du développement exige**.La facilité de développement qui appartient ici se réfère au degré de difficulté à développer le système d’application lui-même.Plus il est facile à développer, plus il est testable et déployable d’appliquer sa propre structure de code.

**exigences de performance plus élevées**.Les exigences de rendement mentionnées ici sont spécifiquement les exigences de rendement à mesure que la capacité du système augmente.Évitez les problèmes de performances en un seul point dans votre système et donnez à votre application une fonctionnalité évolutive horizontalement.En général, lorsque des problèmes de performances se produisent, c’est souvent le moyen le plus facile de les résoudre en ajoutant des appareils physiques.Sous différentes capacités système, le système d’optimisation des performances du système est généralement différent.Par conséquent, la sélection de solutions techniques combinées avec le scénario d’application a toujours été un problème que les ingénieurs système doivent considérer.

Ce projet est basé sur les caractéristiques fonctionnelles du système ci-dessus des exigences résumé un ensemble de cadre de développement.Il contient des pierres angulaires théoriques pertinentes, des bibliothèques de développement et des protocoles techniques.

> Il n’y a pas de solution miracle au monde.Un cadre ne résoudra pas tous les problèmes. La lune est tombée sur le ne voulant pas être nommé

## De la demande

Lors de l’explication des systèmes distribués, le scénario d’entreprise simple de « transfert de compte » est souvent utilisé pour correspondre à la description.Voici un regard sur ce scénario d’affaires.

Supposons que nous avons besoin de construire un système d’affaires avec un système de compte.Chaque compte a un solde.Vous devez maintenant effectuer une opération de transfert pour transférer 300 du solde du compte A au compte B.En outre, sur la base des exigences de base de la section ci-dessus, nous devons tenir compte des éléments suivants lors de la mise en œuvre de scenario：

- Vous devez faire face à une augmentation de la capacité du système.Il ne peut y avoir que 1000 utilisateurs initiaux au début de l’application.Grâce à une bonne promotion des applications et à l’afflux de comptes bots, le nombre d’utilisateurs a augmenté de trois ordres de grandeur en un mois, c’est-à-dire à un million de niveaux.
- La stabilité et la récupérabilité du système doivent être prises en compte.Réduisez au minimum le temps moyen de défaillance du système dans son ensemble, et même les défaillances du système devraient être aussi faciles à récupérer que possible.C’est-à-dire pour éviter un seul point d’échec.
- L’évolutivité de l’entreprise doit être prise en considération.Une certaine logique d’entreprise peut devoir être ajoutée later：limiter le montant du transfert quotidien en fonction du niveau de compte, notification SMS après le transfert est réussie, le transfert de soutien d’un certain montant de transfert secret libre, compte spécifique pour atteindre le « T1 » sur le compte.
- Vous devez tenir compte de la testabilité de votre code.Le code d’entreprise et le code système du système peuvent être bien séparés, et la justesse et les performances du code d’entreprise et du code système peuvent d’abord être vérifiées au moyen de tests unitaires.

## La théorie des roues

Cette section présentera une partie du contenu théorique qui est étroitement intégré à ce cadre afin de faciliter la compréhension par le lecteur du travail du cadre dans le processus de suivi.

### Mode acteur

Le modèle Actor est un modèle de programmation standard.Grâce à l’application de ce modèle de programmation, certains systèmes peuvent résoudre le problème de la complexité.Le problème avec le syndicat mentionné ici est que lorsqu’un ordinateur traite logiquement les mêmes données, il peut causer des données incorrectes en raison de multiples demandes simultanées.Il s’agit d’un problème que vous devez rencontrer lorsque vous êtes une programmation multicœur.Pour donner un exemple simple, si vous utilisez 100 threads dans un verrou non synchrone pour effectuer une opération s. . . sur une variable int dans la mémoire.Ensuite, le résultat de cette variable est souvent inférieur à 100.Voici comment le modèle Actor évite ce problème.

Tout d’abord, pour la facilité de compréhension, le lecteur peut penser à l’acteur comme un objet ici.Dans les langues orientées objet (Java, C#, et ainsi de suite), l’acteur peut être considéré comme un objet créé``le nouveau mot clé.Mais cet objet a quelques particularités characteristics：

**a un État qui appartient à**.Les objets peuvent tous avoir leurs propres propriétés, ce qui est une caractéristique de base des langues orientées objet.En mode Acteur, ces propriétés sont collectivement appelées l’État d’acteur.L’état de l’acteur est maintenu par l’acteur lui-même.

Cela met en évidence deux points：

Tout d’abord, l’état de l’acteur ne peut être changé par lui-même, et pour changer l’état de l’acteur de l’extérieur, il ne peut être changé en appelant acteur.

![Mettre à jour le statut d’acteur](/images/20190226-001.gif)

Deuxièmement, l’état de l’acteur n’est maintenu qu’au sein de l’acteur et n’est partagé avec aucun objet autre que l’acteur actuel.Le non-partage ici souligne également qu’il ne peut pas changer l’état interne de l’acteur par un changement dans une propriété extérieure.Il s’agit principalement de le distinguer des langages de programmation avec des caractéristiques linguistiques de « référence d’objet ».例如：在 C#的 class 的 public 属性，假如是引用类型，那么在外部获得这个 class 之后是可以改变 class 中的属性的。Mais ce n’est pas autorisé en mode Acteur.

![Partager le statut d’acteur](/images/20190226-003.gif)

Toutefois, la lecture des données de l’intérieur acteur à l’extérieur est toujours autorisé.

![Lire le statut d’acteur](/images/20190226-002.gif)

**un seul filet**.L’acteur n’accepte généralement qu’un seul appel à la fois.Les threads décrits ici ne sont pas exactement des threads dans l’ordinateur et sont utilisés pour mettre en évidence les « attributs que l’acteur ne peut gérer qu’une seule demande à la fois. »Si Actor accepte actuellement un appel, les appels restants sont bloqués jusqu’à ce que l’appel se termine et que la prochaine demande soit autorisée.Ceci est en fait similaire à un mécanisme de synchronisation des verrous.Ce mécanisme évite la possibilité d’un problème avec la présence d’un problème lors de la modification de l’état interne de l’acteur.具体一点说明：如果使用 100 个线程对一个 Actor 进行并发调用，让 Actor 对状态中的一个 int 变量进行 ++ 操作。La valeur finale pour cet état doit être de 100.

![L’acteur est appelé dans un synthé](/images/20190226-004.gif)

Toutefois, le threading unique n’est pas absolu, permettant le traitement 2000 en l’absence d’une demande de problème.Par exemple, lisez l’état dans Actor, qui n’a généralement pas de problème avec le symp, de sorte que la même opération est autorisée en ce moment.

![Lire Acteur en même temps](/images/20190226-005.gif)

> Lorsqu’ils lisent sur la nature à fil unique de l’acteur, les lecteurs se demandent souvent si cela peut causer des problèmes de performance parce que l’acteur lui-même le gère trop lentement.Sur ce point, j’espère que les lecteurs continueront à s’accrocher à cette question et à la lire plus tard dans la recherche de réponses.

### Mode de traçabilité des événements

Le modèle de traçabilité des événements est une sorte d’idée de conception logicielle.Ce type d’idée de conception est généralement différent de l’idée traditionnelle de conception du système qui est principalement basée sur le contrôle add-delete et la correction (CRUD).Les applications CRUD ont souvent des limitations：

1. En général, les applications CRUD prennent la pratique d’exploiter directement le stockage de données.Cette implémentation peut entraîner des goulots d’étranglement des performances en raison d’une optimisation insuffisante de la base de données, et il peut être plus difficile d’mettre à l’échelle votre application.
2. Dans des domaines spécifiques, il y a souvent des problèmes de données qui nécessitent une attention particulière pour prévenir les erreurs dans les mises à jour des données.Cela nécessite souvent l’introduction de « verrous », « transactions » et d’autres technologies connexes pour éviter de tels problèmes.Toutefois, cela peut également entraîner des pertes de performance.
3. À moins que des vérifications supplémentaires ne soient ajoutées, l’historique des modifications apportées aux données n’est généralement pas traçable.Parce que l’état final des données est généralement stocké dans le magasin de données.

Contrairement aux pratiques crud, l’approvisionnement en événements évite les limitations décrites ci-dessus par la conception.Ensuite, décrivez les façons sous-jacentes dont l’approvisionnement en cas d’événement fonctionne autour du scénario d’affaires de « transfert » mentionné ci-dessus.

Utilisez la crudding pour réaliser des « transferts ».

![« Transfert » selon la méthode CRUD](/images/20190226-006.gif)

Le « transfert » est réalisé à l’aide du traçage des événements.

![« Transfert » avec l’approvisionnement d’événements](/images/20190227-001.gif)

Comme le montre la figure ci-dessus, les changements de solde impliqués dans l’activité de transfert sont stockés sous forme d’événements via le modèle de traçabilité des événements.L’entreprise elle-même est également réalisée, ce qui apporte benefits：

- Grâce à l’événement, vous pouvez restaurer le solde du compte à n’importe quelle étape, ce qui, dans une certaine mesure, pour atteindre le suivi du solde du compte.
- Parce que les événements pour les deux comptes sont traités indépendamment.Par conséquent, la vitesse de traitement des deux comptes ne s’affecte pas mutuellement.Par exemple, le transfert du compte B peut être légèrement retardé en raison de la nécessité d’un traitement supplémentaire, mais le compte A peut toujours être transféré.
- Vous pouvez faire quelques affaires de traitement asynchrone en vous abonnant à des événements.Par：autres actions asynchrones telles que la mise à jour des statistiques dans la base de données, l’envoi de notifications SMS, et ainsi de suite.

Bien sûr, l’introduction du mode d’approvisionnement des événements a introduit quelques problèmes techniques liés à l’approvisionnement en événements.Par：le stockage consommé par un événement peut être important, la cohérence éventuelle doit être appliquée, les événements sont immuables, la refactorisation peut être difficile, et ainsi de suite.Ces questions sont décrites plus en détail dans certains articles.Les lecteurs peuvent lire les lectures étendues ultérieures pour la compréhension et l’évaluation.

> La complexité de l’entreprise n’est pas réduite par des changements dans la conception du système, elle est simplement déplacée d’un endroit à l’autre. Dites toujours que la lune tombe sur votre propre nourriture

## Laissez tourner les roues

Sur la base de la compréhension générale du lecteur de la théorie dans la section précédente, cette section présentera comment ce cadre fonctionne à la lumière du scénario d’entreprise de « transfert » décrit ci-dessus.Tout d’abord, le lecteur doit comprendre les deux noms de ce cadre.

### Claptrap

![Claptrap](/images/20190228-001.gif)

Claptrap est un acteur spécial défini dans ce cadre.En plus des deux caractéristiques mentionnées ci-dessus, Claptrap est défini comme ayant les features：

**état est contrôlé par l’événement**.L’état de l’acteur est maintenu au sein de l’Acteur.Il en va de même pour Claptrap, mais changer l’état de Claptrap le limite aux seuls événements, en plus des modifications au sein de Actor.Cela combine le modèle d’approvisionnement de l’événement avec le modèle Acteur.La justesse et la traçabilité de l’état de l’acteur sont garanties par le mode d’approvisionnement en événements.Ces événements qui changent l’État de Claptrap sont générés par Claptrap lui-même.Des événements peuvent se produire entre les appels externes et les mécanismes de déclenchement de classe à l’intérieur de Claptrap.

### Minion

![Minion](/images/20190228-002.gif)

Minion est un acteur spécial tel que défini dans ce cadre.est un ajustement effectué sur la base de Claptrap.Il a les characteristics：

**pouvez lire l’événement à partir du claptrap correspondant**.Comme Claptrap, l’état du sbire est contrôlé par des événements.La différence est que Minion, comme il le fait littéralement, obtient toujours des événements du Claptrap correspondant, changeant son propre état.Par conséquent, il peut gérer Claptrap asynchronement après que l’événement est généré.

### Mise en œuvre de l'

Maintenant, avec les bases de la précédente, voici comment ce cadre implémente le scénario de « transfert » ci-dessus.Le diagramme suivant commence par un coup d’œil à la processes：

![Claptrap & Minion](/images/20190228-003.gif)

Comme le montre le chiffre ci-dessus, l’ensemble du processus est le processus général de mise en œuvre du scénario d’affaires dans ce cadre.En outre, il ya certaines choses qui doivent être notés：

- L’appel entre Client et Claptrap dans la figure n’attend que la première étape, ce qui signifie que le client peut obtenir une réponse plus rapidement sans avoir à attendre la fin de l’ensemble du processus.
- Claptrap A peut accepter les demandes à nouveau après avoir traité ses propres demandes et envoyé des événements au Minion A, ce qui augmente le débit de Claptrap A.
- Minion ne se suffit pas de gérer les agents d’appel entre Claptrap.Dans Minion, vous pouvez également faire des choses comme：, envoyer des messages texte, mettre à jour les statistiques de base de données, et plus encore, en fonction de vos besoins d’entreprise.
- Minion peut également avoir son propre état, en gardant certaines des données dans son propre état afin qu’il puisse interroger à l’extérieur de lui-même sans avoir à interroger à partir du Claptrap correspondant.Par example：les dernières 24 heures des modifications de transfert du compte pour une requête rapide.

### Capacité d’affaires

Comme nous l’avons mentionné précédemment, ce cadre doit construire une architecture système qui peut s’écheller horizontalement afin de faire face à la croissance continue de la capacité d’affaires.À ce stade, le framework utilise actuellement le[open source orléans de Microsoft pour](https://github.com/dotnet/orleans)implémenter la sortie d’applications et d’appareils physiques.Bien sûr, quand il s’agit de stockage de données, il est lié à une série de problèmes, tels que le regroupement de bases de données.Ce sont les détails de l’application technique, pas le contenu de la conception de la théorie du cadre.Par conséquent, seul ce cadre peut être réduit en fonction de l’architecture open source ci-dessus.Questions pratiques pendant le processus de demande, les lecteurs peuvent chercher des réponses dans le contenu ultérieur du projet.

## Lecture prolongée

Ce qui suit a eu un impact profond sur ce cadre.Les lecteurs peuvent améliorer leur compréhension du cadre en lisant ce qui suit.

- [Ray, un cadre distribué, traçable sur l’événement, axé sur l’événement et, en fin de compte, cohérent et performant, construit sur Actor Framework Orleans](https://github.com/RayTale/Ray)
- [Modèle d’approvisionnement d’événements](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/dn589792%28v%3dpandp.10%29)
- [Événement Sourcing Pattern traduction chinoise](https://www.infoq.cn/article/event-sourcing)
- [Orléans - Modèle d’acteur virtuel distribué](https://github.com/dotnet/orleans)
- [Tissu de service](https://docs.microsoft.com/zh-cn/azure/service-fabric/)
- [ENode 1.0 - Idées et implémentations de Saga](http://www.cnblogs.com/netfocus/p/3149156.html)

<!-- md Footer-Newbe-Claptrap.md -->
