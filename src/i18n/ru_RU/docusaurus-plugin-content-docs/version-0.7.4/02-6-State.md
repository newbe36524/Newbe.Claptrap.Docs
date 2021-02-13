---
title: '状态 （State）'
description: '状态 （State）'
---

State 在 Actor 模式中代表了 Actor 对象当前的数据表现。而在 Claptrap 仅仅只是在此之上增加了一个限制：“State 只能通过事件溯源的方式进行更新”。由于事件溯源的可靠性，Claptrap 中的 State 也就拥有了更好的可靠性。

## State 的版本号

在 Claptrap 中的 State 有一个名为 Version 的属性，它表示 State 当前的版本。版本号是一个从 0 开始的自增数字，会在每次处理一个事件之后进行自增。

版本号为 0 的 State 是 Claptrap 的初始状态，也可以被称为创世状态。初始状态可以根据业务需要进行定制。

Claptrap 和 Minion 对于版本号的处理也有一些区别。

对于 Claptrap 而言，Claptrap 是事件的生产者，因此，事件的版本号本身就是由 Claptrap 进行赋予的。例如，在一次事件的处理过程中，以下这些事情将会依次发生：

1. State Version = 1000
2. 开始处理 Event ，其 Version = State Version + 1 = 1001
3. Event 处理完毕，更新 State Version = 1001

对于 Minion 而言，由于它是 Claptrap 事件的消费者。因此版本号的处理略有不同。例如，在一次事件的处理过程中，以下事件将会依次发生：

1. State Version = 1000
2. 读取到了 Event Version 为 1001 的事件
3. Event 处理完毕，更新 State Version = 1001

State 的版本号和 Event 的版本号相互依存，相互验证，是事件有序性的关键。如果在处理过程中，出现 State 的版本号和 Event 的版本号不匹配的情况，将会是严重的问题。通常来说，出现版本号不匹配，只有两种情况：

1. 持久化层中的事件出现了丢失
2. 框架恶性 BUG

## ICON

![claptrap](/images/claptrap_icons/state.svg)
