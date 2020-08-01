---
title: 'Minion'
metaTitle: 'Minion'
metaDescription: 'Minion'
---

> [La version actuellement vue est le résultat d’une correction simplifiée et manuelle traduite par la machine.S’il y a une mauvaise traduction dans le document, veuillez cliquer ici pour soumettre votre proposition de traduction.](https://crwd.in/newbeclaptrap)

![Minion](/images/20190228-002.gif)

Minion est un Claptrap spécial défini par ce cadre.c’est un ajustement basé sur Claptrap.Il a les caractéristiques suivantes：

**Lire l’événement du Claptrap correspondant**。Comme Claptrap, l’état du sbire est contrôlé par des événements.La différence est que Minion, comme son sens littéral, obtient toujours des événements de la Claptrap correspondant, en changeant son état.Par conséquent, il peut gérer asynchronement les actions suivantes après l’événement généré par Claptrap.

> Le mot Minion vient d’un jeu de chance joué par newbe36524.[La légende de la pierre de four](https://zh.moegirl.org/%E7%82%89%E7%9F%B3%E4%BC%A0%E8%AF%B4), où « entourage » est décrit dans la version anglaise comme « minion ».

---

Ce qui suit est une description basée sur l’histoire de Minion pour aider à la compréhension.Je m’en fiche.

Pour des tâches plus complexes, un seul Claptrap peut être difficile à accomplir.Par conséquent, lors de la conception de ce type de Claptrap, quelques jeunes frères sont ajoutés au Claptrap au besoin pour l’aider avec la tâche à accomplir.Ces petits frères s’appellent Minions.L’essence de Minion est également un robot Claptrap, mais ils réduisent le dispositif de mémo de poche par rapport à la version complète de Claptrap.C’est pourquoi il fonctionne légèrement différemment de Claptrap.

Les sbires ne peuvent accomplir des tâches qu’en collaborant avec Claptrap, et ils ne peuvent pas décider s’ils doivent effectuer une tâche.Donc, un mémo de poche qui enregistre les détails de la tâche tant que claptrap le tient.当 Claptrap 完成一件任务时，它会通知他的 Minion 们关于此次任务的细节。这样 Minion 便可以同步的获得任务内容，并借此来更新自己的记忆。以下我们来通过一个例子来解释这种工作模式。

假设我们现在在某个小区投放了一台 Claptrap 机器人来作为门卫机器人。它的工作职责包括有以下这些：

1. Responsable de l’inspection et de la libération des véhicules dans le concierge
2. Responsable de traiter toutes sortes de demandes de renseignements de passants

我们现在知道，Claptrap 机器人在工作的时候只能同时处理一件事情。也就是说，假如它正在为某台车辆进行检查和放行，那么它就无法处理路人的询问。同样地，假如它正在接受路人的询问，那么它就无法处理车辆的检查和放行。这么做效率并不高。因此，我们为这台 Claptrap 增加一台 Minion 来协助其完成接受路人询问的任务。

具体的工作方式是这样的：每天，Claptrap 都会对小区周围的情况进行检查并且将具体的信息全部都记录在手持型备忘录当中。并且它会将这些任务的细节通知给它的 Minion 。于是 Minion 就也知道了关于这个小区的所有细节，因此它就能够轻松的应付路人的询问了。

通过这样的合作，就能使得 Claptrap 更加高效的专注于车辆的检查和放行，而路人的询问则交给 Minion 来处理就可以了。

不过，对于一些细节还需要进行补充解释以便读者理解：

为什么不直接增加一台新的 Claptrap 来直接处理路人的询问呢？一台新的 Claptrap 意味着一个新的主体，它能够独立的完成任务，这样会增加管理的成本。但是如果只是新增一台 Minion ，它则可以由它所属的 Claptrap 来负责管理，相较而言更容易管理。当然为了增加一点代入感，还可以这么理解：Minion 相比于常规的 Claptrap 缺少了手持型备忘录这个设备。这个设备的成本占总硬件成本的 99%。减少成本来完成相同的任务，何乐不为呢？

Claptrap 将任务细节通知给 Minion 的成本会不会很高？不会的。Claptrap 和 Minion 一般都是团伙作业，随着现在无线网络技术的不断改善，这种成本将会越来越小。5G 赋能，未来可期。

现在，我们在额外考虑一个场景：假如物业经理希望 Claptrap 每天定时汇报小区的车辆出入情况。同样，为了增加代入感，我们不妨假设这个小区非常忙碌，一天 24 小时都有车辆进进出出。因此如果让它拿出时间来汇报车辆出入情况的话，由于 Claptrap 的单线程特性，那么很可能小区门口就堵成长安街了。

有了前面的经验，我们同样可以为这台 Claptrap 配备一台新的 Minion 来处理向物业经理汇报的这个任务。因为 Claptrap 在进行车辆出去检查的时候会将相关的细节通知给 Minion。所以 Minion 也就知道了关于今日车辆出入情况的所有细节，做出报表，那就是分分钟的事情。

我们再来增加一个场景：我们需要普查一下人口数量。那么只需要在小区门卫 Claptrap 检查出入人员时，对人员的信息进行记录。同样的，我们添加一台 Minion 来专门汇总那些核的数据，并且将上级部门。正巧，上级部门也是通过一台 Claptrap 机器人来接收下级的数据汇报，并且正好其也有一台 Minion 用来汇总下级汇报上来的数据，并且汇报给它的上级。就这样 Claptrap1 -> Minion1 -> Claptrap2 -> Minion2 -> Claptrap3 …… 一层一层的向上。于是我们就完成了全国乃至全球的数据汇总。

因此，我们可以总结一下。有了 Minion 的加持，可以为 Claptrap 更好的完成至少三类事情：

1. Aide au partage des tâches de classe de requête d’origine
2. Aider les statistiques d’ingup, les notifications, et plus qui peuvent être traitées de manière asynchrone
3. Assister à d’autres Claptraps pour accomplir des tâches plus importantes
