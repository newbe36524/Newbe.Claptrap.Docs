---
title: 'Minimal Competing Resources'
description: 'Minimal Competing Resources'
---


Minimal Competiing Resources is a concept that is important when using the Claptrap framework.Understanding this concept helps developers to better design Claptrap's State and avoid the wrong design.

## What is the Minimal Competing Resources.

In analogy with the concept of "resource competition" in multi-thread programming, here is proposed the "Minimum Competing Resources" concept in a business system.With this concept, it's easy to find design points for how to apply Newbe.Claptrap.

In the case of e-commerce, for example, each commodity is a "Minimal Competing Resources".Note that this is not to say that all goods are a "Minimal Competing Resources".Because, if 10,000 goods are numbered, then the rush to buy goods 1 and goods 2, there is no competition.Therefore, each commodity is a Minimal Competing Resources.

Here are some examples available:

- In a business system that allows only single-ended logins, a user's login ticket is the Minimal Competing Resources.
- In a configuration system, each configuration item is the Minimal Competing Resources.
- In a stock market, each buy or sell order is Minimal Competing Resources.

In some scenarios, Minimal Competing Resources is also known as the "Minimum Concurrent Unit"

## Claptrap's State should be at least larger than or equal to the range of "Minimal Competing Resources".

Combined with the example of e-commerce snapping, if all goods are designed in the same Claptrap State (greater than range of Minimal Competing Resources).Well, different users buy goods to influence each other, because, the Actor pattern based on the Claptrap is the queuing processing request.That is to say, assuming that each item needs to process 10ms, it also takes 10000\* 10 ms to process all the purchase requests as soon as you want.But if each item is numbered, each item is designed as a separate Claptrap State.Well, since they are not related to each other.Selling all the goods would theoretically only cost 10ms.

It is therefore easy to conclude that if Claptrap's State is larger than the Minimal Competing Resources, the system will not have a correctness issue, but there may be some performance penalties. In addition, if Claptrap's State is smaller than the Minimal Competing Resources, the relationship between Claptrap becomes difficult and risky.Because this is equivalent to splitting a Minimal Competing Resource into multiple parts, and Minimal Competing Resources usually needs to be dealt with in a single transaction, which goes back to the very common problem of distributed transactions in distributed parts that are difficult to handle.
