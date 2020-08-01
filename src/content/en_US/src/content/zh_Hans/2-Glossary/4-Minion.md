---
title: 'Minion'
metaTitle: 'Minion'
metaDescription: 'Minion'
---

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)

![Minion](/images/20190228-002.gif)

Minion is a special Claptrap defined by this framework.it's an adjustment based on Claptrap.It has the following features：

**Read event from the corresponding Claptrap**。Like Claptrap, minion's state is controlled by events.The difference is that Minion, like its literal meaning, always gets events from the corresponding Claptrap, changing its state.Therefore, it can asynchronously handle subsequent actions after The Claptrap-generated event.

> Minion is from a game of luck played by newbe36524[The Legend of furnace stone](https://zh.moegirl.org/%E7%82%89%E7%9F%B3%E4%BC%A0%E8%AF%B4), where "随从" is described in the English version as "minion".

---

The following is a story-based description of Minion to aid understanding.Don't care too much.

For more complex tasks, a single Claptrap can be difficult to complete.Therefore, when designing this type of Claptrap, a few younger brothers are added to the Claptrap as needed to assist it with the task at hand.These little brothers are called Minions.Minion's essence is also a Claptrap robot, but they reduce the handheld memo device compared to the full version of Claptrap.This is why it works slightly differently from Claptrap.

Minions can only complete tasks by collaborating with Claptrap, and they cannot decide whether to do a task.So a handheld memo that records the details of the task as long as claptrap holds it.当 Claptrap 完成一件任务时，它会通知他的 Minion 们关于此次任务的细节。这样 Minion 便可以同步的获得任务内容，并借此来更新自己的记忆。以下我们来通过一个例子来解释这种工作模式。

假设我们现在在某个小区投放了一台 Claptrap 机器人来作为门卫机器人。它的工作职责包括有以下这些：

1. Responsible for inspecting and releasing vehicles in the concierge
2. Responsible for dealing with all kinds of inquiries from passers-by

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

1. Assist in sharing the original query class tasks
2. Assist ingup statistics, notifications, and more that can be handled asynchronously
3. Assist inge with other Claptraps to accomplish larger tasks
