---
date: 2019-03-08
title: Newbe.Claptrap Project Weekly 1 - Pas encore de roues, courir avec des roues d’abord
---

Newbe.Claptrap Project Weekly 1, la première semaine du code a écrit un peu.Mais surtout envisager la faisabilité théorique.

<!-- more -->

## C’est quoi l’hebdomadaire ?

Les œuvres open source réussies ne peuvent être séparées de la participation active des contributeurs communautaires.En tant que nouveau projet de roue, le co-fondateur du projet, Moon Landing, a un compte：

« Je sais que vous n’avez pas la capacité de coder très bien, et vous aurez un compte rendu hebdomadaire de vos idées. »Laissez les autres voir la valeur du projet.En attendant que de plus en plus de gens découvrent la valeur du projet, donnera naturellement plus d’attention, même dans le développement du projet impliqué.Il faut donc écrire un hebdomadaire.Le rapport hebdomadaire est mieux axé sur l’explication du concept du projet et sur la façon de résoudre les problèmes pratiques à travers le projet.Bien sûr, vous pouvez également inclure un certain contenu sur la façon dont le projet est conçu, mais attention à la modération, généralement les gens ne prêtent pas trop d’attention à la façon dont le projet est mis en œuvre.Concentrez-vous davantage sur la valeur du projet.Remember：projet ne réussit que s’il génère de la valeur. "

Ainsi, l’auteur ne peut écrire qu’un hebdomadaire, à peine capable de maintenir une vie comme celle-ci.

## La roue a un échantillon de roue

Le nouveau cycle devrait avoir l’apparence d’un nouveau cycle, « ouverture de projet » introduit la théorie de base et les principes de travail liés à ce cadre.Étant donné que le contenu théorique pertinent n’est pas familier au lecteur qui vient d’entrer en contact, cette section énumère le contenu le plus critique de la section précédente ci-dessous pour stimuler la mémoire du lecteur.

L’attribut i.：'état de l’acteur est changé en appelant acteur à l’extérieur.

![Mettre à jour le statut d’acteur](/images/20190226-001.gif)

L’acteur en a un pour faire 1：statut d’acteur n’est pas partagé à l’extérieur.

![Partager le statut d’acteur](/images/20190226-003.gif)

Le long métrage Actor complète 2：lire l’État acteur à l’extérieur.

![Lire le statut d’acteur](/images/20190226-002.gif)

Acteur long métrage II：'acteur travaille « à fil unique » et ne peut traiter qu’une seule demande à la fois.

![L’acteur est appelé dans un synthé](/images/20190226-004.gif)

L’attribut acteur est 2-to：même état de lecture ne peut pas être un « fil unique ».

![Lire Acteur en même temps](/images/20190226-005.gif)

Le cadre définit le type Acteur, Claptrap：qui génère des événements à travers des modèles d’événements et change son propre état à travers des événements.

![Claptrap](/images/20190228-001.gif)

Le cadre définit le type Acteur, Minion：par rapport à Claptrap, sbire ne génère pas d’événements, mais lit les événements correspondant à Claptrap pour changer son état.Plusieurs Sbires sont autorisés pour un Claptrap.

![Minion](/images/20190228-002.gif)

Terminez l’entreprise de « transfert » avec Claptrap et Minion.

![Claptrap & Minion](/images/20190228-003.gif)

> Moon fall grand homme célèbre averti 1：monde n’existe pas « solution miracle ».Un cadre ne résoudra pas tous les problèmes. Le célèbre dicton de Moon Landing 2：complexité de l’entreprise n’est pas réduit par des changements de conception de système, il n’est déplacé d’un endroit à l’autre.

## Sans roue, courez d’abord avec une roue

Maintenant, nous avons les concepts de Claptrap et Minion.Ensuite, combinez certains scénarios d’affaires pour expérimenter si le cadre peut répondre à une grande variété de besoins d’affaires.

> De beaux moyens techniques ne peuvent pas faire face aux besoins réels et aux changements, qui ne peuvent être que des vases techniques. La lune tombe juste après avoir appris le Sebotan XII Quantum Computer Instruction Set

### Le scénario d’affaires

C’est un simple e-commerce system：

1. Un seul cristal vert est vendu, et pour des raisons de description, le produit est nommé « Forgive Crystal ».
2. Les utilisateurs peuvent utiliser le solde de leur compte pour acheter des cristaux pardon.Le solde est rechargé par un système de paiement externe.Recharger une partie, pour le moment, n’est pas un scénario d’affaires à considérer.
3. Chaque utilisateur a également une intégrale, qui, par coïncidence, est également vert, de sorte que le crédit est nommé « Forgive Points ».
4. Il existe de nombreuses façons de gagner des points de pardon, tels que l’inscription des utilisateurs：, inviter d’autres utilisateurs à s’inscrire, inviter les utilisateurs à faire un achat, que l’invité peut également obtenir, pardonner est l’exploitation minière, en réalité pour obtenir le pardon, et ainsi de suite, qui peut avoir besoin d’être en ligne avec les activités ultérieures pour augmenter continuellement la méthode d’acquisition.
5. Forgive Points peut déduire une partie du montant qui doit être payé lorsque vous faites un achat de Forgive Crystal.
6. Les points de pardon sont susceptibles d’avoir d’autres utilisations à l’avenir.
7. Le mode de paiement pour acheter Forgive Crystal est susceptible d’être plus que l’équilibre et pardonner les points à l’avenir.

Ce qui précède est une description des exigences de ce système de commerce électronique.La demande changera certainement à l’avenir.

### Sensibilisation aux fonctionnalités

Système de commerce électronique, le scénario d’affaires le plus important est naturellement lié à la transaction de scénarios d’affaires de marchandises.Quelle que soit la complexité des autres scénarios d’exigences, les scénarios d’affaires liés au trading seront forcément les premiers à nécessiter une analyse et une résolution.

Donc, tout d’abord, nous allons utiliser le scénario « User Confirmation purchase forgiveness crystal » pour décrire en termes simples ce que le programme doit faire：

1. Vous devez vérifier que le solde de l’utilisateur est suffisant
2. Si l’utilisateur sélectionne un crédit, vous devez vérifier que le crédit de l’utilisateur est suffisant
3. Vous devez vérifier que l’inventaire est suffisant
4. Le solde de l’utilisateur doit être déduit
5. L’inventaire doit être déduit
6. Si l’utilisateur sélectionne un crédit, le crédit de l’utilisateur doit être déduit

Si vous implémentez ces six points en exploitant directement la fiche de données, il devrait être très simple pour la plupart des développeurs.Vous pouvez compléter l’entreprise en ouvrant une transaction de base de données avec au moins un verrou de niveau row qui vérifie et met à jour les données.Donc, maintenant que vous utilisez ce cadre pour la mise en œuvre, vous devez implémenter les six mêmes points clés basés sur le fait fondamental que « la complexité de l’entreprise ne diminue pas. »

### Le prophète n’est pas encore appelé

Tout d’abord, sur la base de pas beaucoup de discussion, l’auteur autour de certains des concepts principaux mentionnés ci-dessus, conçu le Claptrap：

| Concept                   | Nommé en anglais          | Abréviation |
| ------------------------- | ------------------------- | ----------- |
| Pardonnez le cristal      | Sku                       | S (en)      |
| Points de pardon          | UserPoint (userpoint)     | P           |
| Le solde de l’utilisateur | UserBalance (userbalance) | B           |

### Dessiner la roue selon la libellule

Suivant la conception du processus du scénario d’entreprise précédent de « transfert », la logique de l’achat est conçue de la même manière ici.Comme le montre la figure below：

![Conception de chaîne](/images/20190307-001.gif)

Analyser cette design：

Conformément à l’ordre de logique d’entreprise, effectuer l’inspection des stocks, la déduction des stocks, le bilan, la déduction de solde, la vérification de crédit, les étapes d’entreprise de déduction de crédit.

Notez l’heure à partir de l’existence de la ligne d’appel entre Client et Claptrap S, et ce n’est qu’au début, c’est-à-dire que le client n’a besoin que d’un peu d’attente pour obtenir une réponse.

Claptrap S peut continuer à répondre aux nouvelles demandes après avoir pousse l’événement au Minion S.S’assurer que plusieurs utilisateurs font un achat en même temps garantit que l’article n’est pas survendu et que la réponse est assez courte.

Le point d’entrée de toute la logique commerciale est S, qui garantit que l’utilisateur paie tout en verrouiller l’inventaire, en évitant la situation où l’utilisateur paie pour les marchandises.

Pour des raisons de forme, ce design **de « Chain-Like Design »**.

### Même matériau, roues différentes

Il y a un autre design.Comme le montre la figure below：

![Conception d’arbre](/images/20190307-002.gif)

Analyser cette design：

Un nouveau Claptrap W (Quel étonnant que je reçois un cristal pardonné) a été introduit comme le point d’entrée pour l’entreprise, qui Claptrap W mis en œuvre en appelant d’autres Claptrap.

Minion S, P, et B ne sont plus impliqués dans le contrôle du flux de l’entreprise car ils sont déjà contrôlés par Claptrap W, par rapport à la conception dans la section précédente.

Et en raison de Minion W, cette conception peut également faire des appels partiels à Minion, de sorte qu’il peut également prendre deux formes.

![Conception d’arbre](/images/20190307-003.gif)

![Conception d’arbre](/images/20190307-004.gif)

Pour des raisons de forme, ce design **« Tree-Like Design »**.

Ensuite, il ya un choix, et comme il ya un choix, alors voici l’utilisation de « WhyNot analyse comparative » enregistrée dans le « Moon Boss Software Development Tricks 32 » pour décider quelle conception à use：

| Options              | Pourquoi pas?                                                                                                                                                                                                                                                                                                   | Pourquoi!Non!                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Conception de chaîne |                                                                                                                                                                                                                                                                                                                 | Le contrôle du processus de flux d’affaires est connecté via Minion, une conception étroitement couplée.C’est l’équivalent du contexte des opérations de Minion et Claptrap cette fois.Une question évidente：Si le client a choisi de payer des points est une logique qui est jugée soit dans Minion B ou Claptrap P, mais de toute façon il n’a pas de sens.<br/>conception peut être particulièrement difficile à gérer lorsqu’il s’agit de défaillances de processus.Par exemple, si le client n’a pas assez de points dans la dernière étape, il peut avoir besoin de faire marche arrière progressivement, ce qui peut être très difficile. |
| Conception d’arbre   | Cette conception réunit le contenu de contrôle de processus de base de l’entreprise dans une paire de Claptrap W et Minion W connexes.Il s’agit d’une performance très de cohésion.<br/>basé sur cette conception, il est facile de construire des processus plus complexes basés sur Claptrap S, P et B. |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |

En fait, il est facile pour les lecteurs de constater que le tableau de comparaison et d’analyse WhyNot pour ce choix est en fait à sens unique.Il s’agit évidemment de choisir une conception d’arbre.

> « Moon boss software development tricks 32 », est le grand homme d’atterrissage sur la lune dans le processus de développement quotidien du processus de développement logiciel utilisé dans certaines petites méthodes de collecte et de généralisation.La plupart de ces méthodes ne sont pas de nouvelles inventions.Les atterrissages de lune ont simplement mis ces méthodes ensemble, et afin d’éclairer ceux qui plus tard, il y a de petites manières de rendre les choses plus ordonnées en analysant et en jugeant quelques problèmes.En plus de la méthode d’analyse comparative WhyNot, il existe la description plus connue des exigences de 5W1H;

> WhyPas méthode d’analyse comparative, est simplement de choisir plusieurs sujets pour la comparaison côte à côte, respectivement, la liste de la « devrait le choisir » et « ne devrait pas le choisir » raisons, puis faire un jugement complet, puis prendre une méthode de décision.Elle s’applique particulièrement à la méthode utilisée par plusieurs personnes en litige au sujet d’une option, qui garantit que les motifs de la déclaration sont consignés séparément sous la forme d’un formulaire, ce qui garantit qu’il ne manque pas de justifications.Sur la base de la méthode, d’autres variantes telles que la « mesure du poids de la raison » et « le droit des gens de parler mesure » sont également dérivées.Cette méthode a une certaine connexion et différence avec les méthodes de comparaison telles que la « méthode de différence » et la « méthode de comparaison des différences », ainsi que la « méthode de sélection des probabilités » et la « méthode de sélection de l’expérience ».Le nom de cette méthode est dit être le premier des atterrissages sur la lune et est un terrier syntaxe.Parmi les Chinois, le « Pourquoi pas? » peut être utilisé. « Une telle contre-question pour indiquer la raison du choix d’un objet, vous pouvez utiliser le « Pourquoi!Non! « Cette phrase de prière représente la raison pour laquelle nous ne choisissons pas un objet. WhyNot est en fait une traduction directe des quatre mots pourquoi pas.

### Les bonnes roues semblent bonnes, aussi

Les lecteurs qui voient pour la première fois l’analyse comparative de WhyNot peuvent avoir questions：n’y a-t-il aucune raison de choisir la conception de la chaîne?

Il convient d’expliquer que whyNot analyse comparative est l’analyse de scènes fixes, donc si la scène change, les résultats de l’analyse va changer.C’est-à**dans certains scénarios, la conception de la chaîne a sa nécessité et**.

Donc, avant d’expliquer, nous prenons une approche différente de l’interprétation de la relation entre la conception de la chaîne et la conception des：

- Fusionner Claptrap avec le Minion correspondant
- Avec « Parce que... Alors... » la phrase remplace l’appel solide dans le dessin

![Conception de chaîne](/images/20190307-001.gif)

Ensuite, la conception de la chaîne combinée avec l’image ci-dessus peut être exprimée：

- Parce que S, donc B
- Parce que B, donc P

La sémantique élargie peut être：

- Le solde est en outre déduit parce que l’inventaire est déduit de l’achat
- Le solde est déduit à la suite de l’achat, de sorte que d’autres points sont déduits

![Conception d’arbre](/images/20190307-002.gif)

La conception de l’arbre ci-dessus peut être exprimée comme：

- Parce que W, donc S
- Parce que W, donc B
- Parce que W, donc P

La sémantique élargie peut être：

- L’inventaire a été déduit en raison de l’achat
- Le solde a été déduit en raison de l’achat
- Les points sont déduits à cause de l’achat

Même si l’auteur ici expliqué pas très clairement, mais le lecteur peut encore observer « en raison de l’achat et la déduction du solde, afin de déduire davantage de points » cette phrase n’est pas tout à fait raisonnable, les deux en affaires ne devrait pas réellement avoir des avant-effets évidents.

C’est aussi pourquoi la conception de la chaîne ne fonctionne pas dans ce scenario：si la relation d’appel entre les deux n’a pas de pré-conséquences évidentes, les deux sont conçus comme des relations en chaîne pour les rappels.Ce qui est susceptible d’être obtenu est une conception déraisonnable.

Donc, l’around：**si vous voulez appliquer une conception de chaîne.Il doit y avoir des pré-conséquences raisonnables entre les deux.**

Toutefois, dans le processus d’analyse de la demande, les causes et les conséquences préexistants actuelles peuvent ne pas être raisonnables plus tard.Le scénario d’affaires changeable et la stabilité incomplète des exigences ont conduit au fait que la conception des arbres peut gérer plus de problèmes.

Les lecteurs peuvent essayer de concevoir certaines des exigences restantes dans le scénario d’affaires ci-dessus.

En outre, le lecteur peut repenser la conception du scénario de « transfert » utilisé dans l’ouverture, avec une conception d’arbre est plus approprié.

## C’est en fait une nouvelle roue

Dans l’ouverture, nous avons fait une simple comparaison du mode Acteur avec le modèle CRUD.Maintenant, il ya un autre type de conception qui est plus couramment mentionné, qui est « conception axée sur le domaine ».

Le concept de conception axée sur le domaine n’est pas beaucoup introduit ici, et les lecteurs qui sont relativement peu familiers avec ce contenu peuvent se référer à Microsoft MVP M. Tang Xuehua article[« Domain Model of Domain-Driven Design](http://www.cnblogs.com/netfocus/archive/2011/10/10/2204949.html)

Ainsi, lorsque le lecteur comprend la conception axée sur le domaine, combinez le Claptrap W, S, P, et B mentionné plus tôt dans cet article.Peut-être Claptrap S, P, B est la racine globale?Peut-être Claptrap W est un service d’application?L’auteur pense que le modèle Actor est en fait une sorte de développement ultérieur de l'：

- La conception axée sur le domaine ne tient pas compte des synthés d’affaires dans le modèle de conception, et le modèle Actor, en tant qu’ensemble de modèles de programmation synthé, compense cette partie de l’écart.
- La grande majorité des cadres axés sur le domaine (comme l’auteur le sait) utilisent encore le processus général de « restauration des racines agrégées du stockage et de les sauver après l’opération ».Le cadre acteur, dans le cas d’Orléans, garde l’acteur activé en mémoire pendant un certain temps, ce qui signifie que la racine globale peut être continuellement modifiée en mémoire sans avoir besoin de restaurations répétées de l’entrepôt.

En général, le lecteur peut modéliser l’idée de conception axée sur le domaine, puis essayer de concevoir la racine agrégée originale et le service d’application en tant qu’acteur, théoriquement essayer de voir si le domaine qu’ils connaissent peut être implémenté avec Actor.Peut-être que les lecteurs peuvent trouver quelque chose de différent.

Cependant, en raison de l’acteur et les modèles d’approvisionnement d’événements, l’approche de conception n’est pas exactement la même que le modèle axé sur le domaine, et il ya d’autres choses à noter qui seront rassemblées plus tard.

## La conclusion

Grâce à la conception d’un scénario d’affaires, cet article espère faire savoir au lecteur comment utiliser les concepts théoriques de ce cadre pour réaliser des affaires.Il contient certaines des hypothèses de l’auteur, de sorte qu’il peut prendre plus de temps au lecteur pour comprendre.

En raison de l’expérience de travail limitée de l’auteur et du manque de connaissance du domaine de l’industrie, il est impossible de juger avec précision si le concept de conception du cadre est conforme aux caractéristiques d’une industrie particulière.Si vous avez des questions qui nécessitent de l’aide, veuillez communiquer avec cette équipe de projet.

Les amis intéressés sont invités à suivre le projet et à participer au projet.

<!-- md Footer-Newbe-Claptrap.md -->
