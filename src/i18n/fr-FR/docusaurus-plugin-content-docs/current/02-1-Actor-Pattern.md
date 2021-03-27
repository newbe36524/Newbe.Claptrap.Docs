---
title: "Mode acteur"
description: "Mode acteur"
---

Le modèle Actor est un modèle de programmation standard.Grâce à l’application de ce modèle de programmation, certains systèmes peuvent résoudre le problème de la complexité.Le problème avec le syndicat mentionné ici est que lorsqu’un ordinateur traite logiquement les mêmes données, il peut causer des données incorrectes en raison de multiples demandes simultanées.Il s’agit d’un problème que vous devez rencontrer lorsque vous êtes une programmation multicœur.Pour donner un exemple simple, si vous utilisez 100 threads dans un verrou non synchrone pour effectuer une opération s. . . sur une variable int dans la mémoire.Ensuite, le résultat de cette variable est souvent inférieur à 100.Voici comment le modèle Actor évite ce problème.

Tout d’abord, pour la facilité de compréhension, le lecteur peut penser à l’acteur comme un objet ici.在面向对象的语言（Java、C#等）当中，可以认为 Actor 就是通过 new 关键词创建出来的对象。Mais cet objet a quelques particularités characteristics：

**a un État qui appartient à**.Les objets peuvent tous avoir leurs propres propriétés, ce qui est une caractéristique de base des langues orientées objet.在 Actor 模式中，这些属性都被统称为 Actor 的状态（State） 。L’état de l’acteur est maintenu par l’acteur lui-même.

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
