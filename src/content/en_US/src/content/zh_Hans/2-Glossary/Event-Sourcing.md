---
title: 'Event Sourcing'
metaTitle: 'Event Sourcing'
metaDescription: 'Event Sourcing'
---

The event-tracing mode is a kind of software design idea.This kind of design idea is usually different from the traditional system design idea based on addition and deletion (CRUD).CruD applications often have some limitations：

1. In general, CRUD applications take the practice of operating data storage directly.Such an implementation can result in performance bottlenecks due to inadequate database optimization, and this can be difficult to scale applications.
2. There is often some data in a particular area that requires attention to the handling of concurrency issues to prevent errors in data updates.This often requires the introduction of related techniques such as locks, transactions, etc. to avoid such problems.But this can also lead to performance losses.
3. Unless additional auditing is added, the history of data changes is generally untraceable.Because the data store is usually saved in the final state of the data.

In contrast to the CRUD approach, event tracing avoids the limitations of the above description by design.The next step is to outline the basic working method of event tracing around the "transfer" business scenario mentioned above.

Use the CRUD approach to "transfer".

!["Transfer" using CRUD](/images/20190226-006.gif)

"Transfer" in the form of event traceability.

!["Transfer" using an event-tracing approach](/images/20190227-001.gif)

As shown in the figure above, the balance changes involved in the transfer business are stored in an event-based manner through the event-tracing model.Also realizes the business itself, which brings some benefits：

- Through the event, you can restore the balance of any stage of the account, which to a certain extent to achieve the tracking of the account balance.
- Because the events of both accounts are handled independently.Therefore, the processing speed of the two accounts does not affect each other.For example, the transfer of Account B may be slightly delayed due to additional processing, but Account A can still be transferred out.
- You can subscribe to events to do some asynchronous processing of your business.For example：Update statistics in the database, send SMS notifications, and other asynchronous operations.

Of course, the introduction of the event tracing mode also introduced some of the related technical problems of event tracing.For example：Events can consume large amounts of storage, eventual consistency has to be applied, events are immutable, refactoring can be difficult, and so on.These related issues are described in more detail in some articles.Readers can read the extended reading for further understanding and evaluation.

> Reference
> 
> - [Event Sourcing Pattern](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/dn589792%28v%3dpandp.10%29)
> - [Event Sourcing Pattern - Chinese translated](https://www.infoq.cn/article/event-sourcing)
