---
title: Why Newbe.Claptrap
description: Newbe.Claptrap - A service-side development framework with "event sourcing" and "Actor pattern" as the basic theories
---

This article is an introduction to the main content of the Newbe.Claptrap project, readers can get a general understanding of the project content as reading.

<!-- more -->

## Wheels are derived from demand

With the rapid development of Internet applications, relevant technical theories and means of implementation are constantly being created.A series of keywords such as Cloud Native Architecture, Microservice Architecture, and DevOps are increasingly in the eyes of engineers.In summary, the emergence of these new theories and technologies is to solve some of the technical pain points in Internet applications:

**higher capacity scalability requirements**.On the basis of commercial success, the number of users of Internet applications, system pressure and the number of hardware devices will increase significantly over time.This requires the application of capacity scalability.This capacity scalability is often described as "applications need to be support to scale out."

**higher system stability requirements**.The application runs continuously to ensure the continued progress of business activities, which anyone associated with this application would like to see.But it's usually very difficult to do that.Today's Internet applications in the face of many competitors of the same kind, if not sound enough in this regard, then it is likely to lose some of the user's favor.

**higher functional scalability requirements**."Embracing Change", when people refer to the content related to "agile project management", will involve a word that will come to it.This word fully reflects how important it is for today's Internet applications to be successful and to be functionally successful.It also reflects the changeable demand of products in the current Internet environment from one side.As a systems engineer, this should be considered at the beginning of the application.

**higher development easy-to-use requirements**.The ease of development that belongs here refers to the degree of difficulty in developing the application system itself.To be more easily developed, it is necessary to make a corresponding effort in applying its own code structure, auditability, and deployability.

**higher performance requirements**.The performance requirements mentioned here are specific to the performance requirements when the system capacity is increased.Avoid single-point performance issues in your system and give your application a scale-out feature.In general, when performance problems occur, it is often the easiest way to solve them by adding physical devices.And the optimization of system performance is usually different under different system capacities.Therefore, the selection of technical solutions combined with the application scenario has always been a problem that system engineers need to consider.

This project is based on the above system functional features of the requirements summarized a set of development framework.This contains relevant theoretical cornerstones, development libraries, and technical protocols.

> There is no "silver bullet" in the world as well.A set of frameworks can't solve all the problems. -- A man not named YUELUO

## From demand

When explaining the distributed system, it is often used to the simple business scenario of "account transfer" to accompany the description.Here's a look at this business scenario.

Suppose we need to build a business system with an account system.Each account has a balance.You now need to perform a transfer operation to transfer 300 of the balance of Account A to Account B.In addition, based on the basic requirements of the section above, we need to consider the following when implementing this scenario:

- You need to deal with a surge in system capacity.There may be only 1000 initial users at the beginning of the application.Thanks to good application promotion and the influx of bot accounts, the number of users has increased by three orders of magnitude in a month, that is, to a million levels.
- The stability and recoverability of the system need to be considered.Reduce the average fault time of the system as much as possible, even if a system failure should be as easy to recover as possible.That is, to avoid a single point of failure.
- Business scalability needs to be considered.Some business logic may need to be added later: limit the daily transfer amount according to the account level, SMS notification after the transfer is successful, transfer support a certain amount of secret-free transfer, specific account to achieve the "T+1" to the account.
- You need to consider the testability of your code.The business code and system code of the system can be well separated, and the correctness and performance of the business code and system code can be initially verified by means of unit testing.

## The theory of wheels

This section will introduce some of the theoretical content that is closely integrated with this framework to facilitate the reader's understanding of the framework's work in the follow-up process.

### Actor Pattern

Actor Pattern is a kind of concurrent programing pattern.It is convenient and efficeint to solve some system concurrency problems.The concurrency problem here is talking about that it would make a error if there are multiple request to modify the same data as the time.It would raise if you are using multiple-thread programing.For exmaple, just set up 100 thread to call ++ operator on the same int variable without mutex lock.Final result of that variable should be less than 100 in common.Let`s take a look at how actor pattern could handle this problem.

First of all, you can consider an Actor as an normal object here.In some object-oriented language(java/C#), a actor could be considered as a object create by `new` operator.And it includes some special features:

**It own it`s own state**。All object could contains some properties or fields, it is normal in object-oriented language.In Actor mode, these properties are collectively referred to as the State of Actor.The state of actor should be matained by itself.

There are two points:

Firstly, state of actor must be change by itself. If you want to change the state, you have to call the method of actor.

![Update Actor state](/images/20190226-001.gif)

Secondly, state of actor is matained in actor, it is unable to share to any other object.In particularly, 'non-sharing' mentioned here also emphasizes that it cannot change the state of the actor through the change of an external properties.This is mainly to distinguish it from some programming languages with the "object reference" language feature.For example the public property of the class：in C#, if this class is referenced, the property in the class can be changed when obtained externally.It is not allowed to do so in actor pattern.

![Share Actor State](/images/20190226-003.gif)

But it is still allow to retrive data out of the state by method.

![Read The Actor state](/images/20190226-002.gif)

**Single thread**。Actor could only accept one call at a time.The threads described here refer not exactly to threads in the computer, and the words used to highlight the "feature of Actor that can only handle one request at a time" are used.If the current Actor is accepting a call, the remaining calls are blocked until the end of the call, and the next request is not allowed to enter.This is actually similar to a mechanism for a synchronous lock.This mechanism avoids the possibility of concurrency issues when modifying the internal state of actor.具体一点说明：如果使用 100 个线程对一个 Actor 进行并发调用，让 Actor 对状态中的一个 int 变量进行 ++ 操作。The final value for this state must be 100.

![Call Actor Concurrently](/images/20190226-004.gif)

However, single threads are not absolute, allowing concurrent processing in the absence of concurrent requests.For example, reading the state in the Actor, which usually does not have concurrency issues, allows concurrent operations at this time.

![Read Actor Concurrently](/images/20190226-005.gif)

> When reading about actor's single-threaded nature, readers often think about whether this can cause performance problems because Actor himself is handling it too slowly.On this point, I hope that readers will continue to hold on to this question and read it later in the search for answers.

### Event traceability mode

The event sourcing pattern is a kind of software design idea.This kind of design idea is usually different from the traditional system design idea based on addition and deletion (CRUD).CRUD applications often have some limitations：

1. In general, CRUD applications take the practice of operating data storage directly.Such an implementation can result in performance bottlenecks due to inadequate database optimization, and this can be difficult to scale applications.
2. There is often some data in a particular area that requires attention to the handling of concurrency issues to prevent errors in data updates.This often requires the introduction of related techniques such as locks, transactions, etc. to avoid such problems.But this can also lead to performance losses.
3. Unless additional auditing is added, the history of data changes is generally untraceable.Because the data store is usually saved in the final state of the data.

In contrast to the CRUD approach, event sourcing avoids the limitations of the above description by design.The next step is to outline the basic working method of event sourcing around the "transfer" business scenario mentioned above.

Use the CRUD approach to "transfer".

!["Transfer" using CRUD](/images/20190226-006.gif)

"Transfer" in the form of event sourcing.

!["Transfer" using an event-souring approach](/images/20190227-001.gif)

As shown in the figure above, the balance changes involved in the transfer business are stored in an event-based manner through the event-sourcing pattern.Also realizes the business itself, which brings some benefits：

- Through the event, you can restore the balance of any stage of the account, which to a certain extent to achieve the tracking of the account balance.
- Because the events of both accounts are handled independently.Therefore, the processing speed of the two accounts does not affect each other.For example, the transfer of Account B may be slightly delayed due to additional processing, but Account A can still be transferred out.
- You can subscribe to events to do some asynchronous processing of your business.For example：Update statistics in the database, send SMS notifications, and other asynchronous operations.

Of course, the introduction of the event sourcing pattern also introduced some of the related technical problems of event sourcing.For example：Events can consume large amounts of storage, eventual consistency has to be applied, events are immutable, refactoring can be difficult, and so on.These related issues are described in more detail in some articles.Readers can read the extended reading for further understanding and evaluation.

> Business complexity is not reduced by changes in system design, it is simply moved from one place to another. Always say the moon falls on your own food

## Let the wheels turn

Based on the reader's general understanding of the theory in the previous section, this section will introduce how this framework works in the light of the "transfer" business scenario described above.First the reader needs to understand the two nouns of this framework.

### Claptrap

![Claptrap](/images/20190228-001.gif)

Claptrap is a special actor defined in this framework.In addition to the two features mentioned above, Claptrap is defined as having the following characteristics：

**The state is controlled by the event**。The state of the Actor is maintained inside the Actor.The same is true of Claptrap, but changing the state of Claptrap limits it to only events, in addition to modifications within Actor.This combines the event sourcing pattern with the Actor pattern.The correctness and traceability of the Actor state are ensured by the event sourcing mode.These events that change the state of Claptrap are generated by Claptrap itself.The event can occur because of an external call or because of a class trigger mechanism inside Claptrap.

### Minion

![Minion](/images/20190228-002.gif)

Minion is a special actor as defined in this framework.it's an adjustment based on Claptrap.It has the following features：

**Read event from the corresponding Claptrap**。Like Claptrap, minion's state is controlled by events.The difference is that Minion, like its literal meaning, always gets events from the corresponding Claptrap, changing its state.Therefore, it can asynchronously handle subsequent actions after The Claptrap-generated event.

### Business implementation

Now with the basics of the previous, here's how this framework implements the "transfer" scenario above.The following diagram begins with a look at the main processes：

![Claptrap & Minion](/images/20190228-003.gif)

As shown in the figure above, the entire process is the general process of implementing the business scenario in this framework.In addition, there are some things that need to be noted：

- The call between Client and Claptrap in the figure waits only for the first stage, which means that Client can get a response faster without having to wait for the entire process to end.
- Claptrap A can accept requests again after processing its own requests and sending events to Minion A, which increases the throughput of Claptrap A.
- Minion does more than just handle call agents between Claptrap.In Minion, you can also do things like：, send text messages, update database statistics, and more, depending on your business needs.
- Minion can also have its own state, keeping some of the data in its own state so that it can query externally from itself without having to query from the corresponding Claptrap.For example：the last 24 hours of the account's transfer changes for quick query.

### Business capacity

As mentioned earlier, this framework needs to build a system architecture that can scale horizontally in order to cope with the continued growth of business capacity.At this point, the framework is currently using open source[Dapr](https://dapr.io/)enable application and physical device downscailation.

Of course, when it comes to data storage, it is bound to involve a series of problems, such as database clustering.These are the details of the technical application, not the content of the framework theory design.Therefore, only this framework can be scaled down based on the above open source architecture.

Practical questions during the application process, readers can seek answers in subsequent project content.

## Everything is ready

I believe you have a preliminary understanding of the framework.现在，进入[Newbe.Claptrap 快速入门](01-0-Quick-Start) 开始尝试该项目吧。
