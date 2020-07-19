---
title: 'Claptrap'
metaTitle: 'Claptrap'
metaDescription: 'Claptrap'
---

> [当前查看的版本是由机器翻译自简体中文，并进行人工校对的结果。若文档中存在任何翻译不当的地方，欢迎点击此处提交您的翻译建议。](https://crwd.in/newbeclaptrap)

En un mot, Claptrap . . . [Acteur](/zh_Hans/2-Glossary/Actor-Pattern) + [Traçage d’événements](/zh_Hans/2-Glossary/Event-Sourcing)

![Claptrap](/images/20190228-001.gif)

Claptrap est un acteur spécial défini dans ce cadre.除了 Actor 的基础特性之外，Claptrap 还被定义为具有以下特性：

**L’État est contrôlé par l’événement**。Le statut de l’acteur est maintenu à l’intérieur de l’acteur.Il en va de même pour Claptrap, mais changer l’état de Claptrap, en plus de l’acteur, le limite à changer uniquement par des événements.Cela combine le modèle de traçabilité de l’événement avec le modèle Actor.La justesse et la traçabilité de l’état de l’acteur sont assurées par le mode de traçabilité des événements.Ces événements qui modifient l’état de Claptrap sont générés par Claptrap lui-même.L’événement peut se produire en raison d’un appel externe ou à cause d’un mécanisme de déclenchement de classe à l’intérieur de Claptrap.

> Claptrap 是 newbe36524 曾经玩过的一款老游戏中的经典角色。[点击此处了解](https://zh.moegirl.org/%E5%B0%8F%E5%90%B5%E9%97%B9)

---

Ce qui suit est une description basée sur l’histoire de Claptrap pour aider à la compréhension.Je m’en fiche.

Claptrap est un robot fonctionnel simple à structure.Bien qu’il puisse accomplir une grande variété de tâches, il a quelques limites.

Claptrap est un robot à thread unique qui ne peut effectuer qu’une seule tâche à la fois.Si vous souhaitez lui donner plusieurs tâches, il sera géré un par un dans l’ordre dans lequel les choses sont planifiées.

Le travail de Claptrap est probablement comme ça.Lorsqu’il acceptera une tâche, il examinera d’abord s’il peut le faire à 100 pour cent.S’il peut le faire à 100 pour cent, puis l’écrire dans son mémo et le terminer.Ensuite, passez à la prochaine chose.

La première chose que Claptrap fait tous les matins est de trouver votre auto perdu.Remets le bâton de toi-même hier.Tout d’abord, il va essayer de voir s’il ya la belle image d’hier, s’il ya, il va ré-incarneler l’apparition d’hier.Ensuite, lisez le mémo dans votre main ce qui s’est passé après la séance photo d’hier, et restaurer progressivement votre mémoire.Cela réussira à vous trouver.

Claptrap est un robot standardisé.Ils sont tous produits sur la chaîne de production de l’usine claptrap.L’usine assemble un robot Claptrap à l’aide de composants standardisés basés sur la conception claptrap.Ces composantes nécessaires comprennent, entre autres,：Mémoire, mémos portatifs, processeurs de tâches multifonctions et imprimantes mémoire.

Mémoire.Claptrap est équipé d’une mémoire de taille personnalisée qui contient les données d’état de la machine actuelle.En raison de la perte de puissance volatile des données de mémoire, si Claptrap perd de l’énergie, les données dans la mémoire sont perdues.

Processeur de tâches polyvalents.En fonction des considérations de coût, chaque Claptrap est équipé d’un processeur de tâches polyvalent qui est adapté à des tâches spéciales.Par exemple,：Claptrap, dédié au feu, inclut essentiellement des fonctions liées à l’incendie dans leurs processeurs multitâches.Mais il ne peut pas gérer les tâches domestiques.

Mémo de poche.Claptrap utilise un mémo portatif pour enregistrer tous les détails de la tâche avant de faire chaque tâche pour s’assurer que chaque détail de la tâche est exact.

Imprimante mémoire.Les données dans la mémoire peuvent être imprimées dans un format physique qui peut être persisté, et plus dans la production réelle est la mémoire d’ADN.En raison de la perte de puissance volatile des données de mémoire, les données en mémoire après le redémarrage ne peuvent être récupérées qu’une par une par le biais d’enregistrements de mémo.Mais comme les données mémo sont susceptibles d’être importantes, la récupération sera lente.Avec l’aide d’une imprimante mémoire, vous pouvez imprimer complètement l’état de mémoire à un moment donné, ce qui accélère la récupération de données de mémoire lorsque vous redémarrez la récupération.
