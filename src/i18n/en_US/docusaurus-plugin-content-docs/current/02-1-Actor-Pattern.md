---
title: 'Actor Pattern'
description: 'Actor Pattern'
---

Actor Pattern is a kind of concurrent programing pattern.It is convenient and efficeint to solve some system concurrency problems.The concurrency problem here is talking about that it would curror error if there are multiple request to modify the same data as the time.It would raise if you are using multiple-thread programing.举个简单的例子，假如在不加同步锁的情况下，使用 100 个线程并发对内存中的一个 int 变量执行 ++ 操作。Final result of that variable should be less than 100 in common.Let`s take a look at how actor pattern could handle this problem.

First of all, you can consider an Actor as an normal object here.In some object-oriented language(java/C#), a actor cound be considered as a object create by `new` operator.And it includes some special features:

**It own it`s own state**。All object could contains some properties or fields, it is normal in object-oriented language.在 Actor 模式中，这些属性都被统称为 Actor的状态（State） 。The state of actor should be matained by itself.

There are two points:

Firstly, state of actor must be change by itself. If you want to change the state, you have to call the method of actor.

![Update Actor state](/images/20190226-001.gif)

Secondly, state of actor is matained in actor, it is unable to share to any other object.In particularly, 'non-sharing' mentioned here also emphasizes that it cannot change the state of the actor through the change of an external properties.This is mainly to distinguish it from some programming languages with the "object reference" language feature.For example: There is a `public` property in a `class` in C#, and it is a reference type, you can change the property if you get this object.It is not allowed to do so in actor pattern.

![Share Actor State](/images/20190226-003.gif)

But it is still allow to retrive data out of the state by method.

![Read The Actor state](/images/20190226-002.gif)

**Single thread**。Actor could only accept one call at a time.The threads described here refer not exactly to threads in the computer, and the words used to highlight the "feature of Actor that can only handle one request at a time" are used.If the current Actor is accepting a call, the remaining calls are blocked until the end of the call, and the next request is not allowed to enter.This is actually similar to a mechanism for a synchronous lock.This mechanism avoids the possibility of concurrency issues when modifying the internal state of actor.A specific description：If you use 100 threads to make a concurrent call to an Actor, let the Actor`Int` variable to perform`++` operation.The final value for this state must be 100.

![Call Actor Concurrently](/images/20190226-004.gif)

However, single threads are not absolute, allowing concurrent processing in the absence of concurrent requests.For example, reading the state in the Actor, which usually does not have concurrency issues, allows concurrent operations at this time.

![Read Actor Concurrently](/images/20190226-005.gif)
