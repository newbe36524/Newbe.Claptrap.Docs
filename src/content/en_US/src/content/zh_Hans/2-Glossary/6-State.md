---
title: 'State'
metaTitle: 'State'
metaDescription: 'State'
---

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)

State represents the current data representation of the Actor object in the Actor pattern.Claptrap just adds a limit to this.："State can only be updated in an event-traced manner."由于事件溯源的可靠性，Claptrap 中的 State 也就拥有了更好的可靠性。

## State 的版本号

在 Claptrap 中的 State 有一个名为 Version 的属性，它表示 State 当前的版本。版本号是一个从 0 开始的自增数字，会在每次处理一个事件之后进行自增。

State Claptrap with version number 0 is the initial state of Claptrap and can also be called the Genesis state.The initial status can be customized to the business needs.

There are some differences between Claptrap and Minion's handling of version numbers.

For Claptrap, Claptrap is the producer of the event, so the version number of the event itself is given by Claptrap.For example, during the processing of an event, the following things will occur in turn.：

1. State Version . . . 1000.
2. Start working with Event, whose Version is state Version s 1 s 1001.
3. Event is finished, and the State Version is updated for 1001.

For Minion, because it is a consumer of The Claptrap event.Therefore, the processing of the version number is slightly different.For example, during the processing of an event, the following events occur in turn.：

1. State Version . . . 1000.
2. Read the event that Event Version is 1001.
3. Event is finished, and the State Version is updated for 1001.

State's version number and Event's version number are interdependent and mutually verified, which is key to event ordering.If there is a mismatch between The State's version number and Event's version number during processing, this can be a serious problem.In general, there is a version number mismatch, in two cases.：

1. Events in the persistence layer are missing.
2. Frame malignant BUG.

## ICON

![Claptrap.](/images/claptrap_icons/state.svg)
