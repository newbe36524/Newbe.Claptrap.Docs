---
title: 'Actor Pattern'
metaTitle: 'Actor Pattern'
metaDescription: 'Actor Pattern'
---

Actor Pattern is a kind of concurrent programing patternIt is convenient and efficeint to solve some system concurrency problems.The concurrency problem here is talking about that it would curror error if there are multiple request to modify the same data as the time.It would raise if you are using multiple-thread programing.For exmaple, just set up 100 thread to call `++` operator on the same `int` variable without mutex lock.Final result of that variable should be less than 100 in common.Let`s take a look at how actor pattern could handle this problem.

First of all, you can consider an Actor as an normal object here.In some object-oriented language(java/C#), a actor cound be considered as a object create by `new` operator.And it includes some special features:

**It own it`s own state**。All object could contains some properties or fields, it is normal in object-oriented language.In actor pattern, all these properties or fields could be descibed as ``actor`s state``.The state of actor should be matained by itself.

There are two points:

Firstly, state of actor must be change by itself. If you want to change the state, you have to call the method of actor.

![更新Actor状态](/images/20190226-001.gif)

Secondly, state of actor is matained in actor, it is unable to share to any other object.In particularly, 'non-sharing' mentioned here also emphasizes that it cannot change the state of the actor through the change of an external properties.This is mainly to distinguish it from some programming languages with the "object reference" language feature.For example: There is a `public` property in a `class` in C#, and it is a reference type, you can change the property if you get this object.It is not allowed to do so in actor pattern.

![共享Actor状态](/images/20190226-003.gif)

But it is still allow to retrive data out of the state by method.

![读取Actor状态](/images/20190226-002.gif)

**Single thread**。Actor could only accept one call at a time.这里所述的线程不完全是指计算机中的线程，是为了凸显“Actor 同一时间只能处理一个请求的特性”而使用的词语。假如当前 Actor 正在接受一个调用，那么剩余的调用都会阻塞，直到调用结束，下一个请求才允许被进入。这其实类似于一个同步锁的机制。通过这种机制就避免了对 Actor 内部状态进行修改时，存在并发问题的可能。具体一点说明：如果使用 100 个线程对一个 Actor 进行并发调用，让 Actor 对状态中的一个`int`变量进行`++`操作。最终这个状态的数值一定是 100。

![并发调用Actor](/images/20190226-004.gif)

不过单线程也不是绝对的，在不存在并发问题的请求情况下，允许并发处理。例如读取 Actor 中的状态，这通常不会有并发问题，那么此时就允许进行并发操作。

![并发读取Actor](/images/20190226-005.gif)
