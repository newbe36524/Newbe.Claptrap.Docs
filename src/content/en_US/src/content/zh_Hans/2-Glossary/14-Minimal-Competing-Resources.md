---
title: 'Minimal Competitive Resources'
metaTitle: 'Minimal Competitive Resources'
metaDescription: 'Minimal Competitive Resources'
---

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)

A concept that is important when using the Claptrap framework for minimal competitive resources.Understanding this concept helps developers better design Claptrap's State and avoid the wrong design.

## What is the smallest competitive resource.

The concept of "resource competition" in analogy-multithreaded programming, where the concept of "minimum competitive resources" is proposed in a business system.With this concept, it's easy to find design points for how to apply Newbe.Claptrap.

In the case of e-commerce, for example, each commodity is a "minimal competitive resource".Note that this is not to say that all goods are a "minimal competitive resource".Because, if 10,000 goods are numbered, then the rush to buy goods 1 and 2 goods, there is no competition in itself.Therefore, each commodity is a minimum competitive resource.

Here are some examples available：

- In a business system that allows only single-ended logins, a user's login ticket is the least competitive resource.
- In a configuration system, each configuration item is the least competitive resource.
- In a stock market, each buy or sell order is the smallest competitive resource.

In some scenarios, the smallest competitive resource is also known as the "Minimum Concurrent Unit"

## Claptrap's State should be at least larger than or equal to the range of "minimum competitive resources."

Combined with the example of an e-commerce snap, if all goods are designed in the same Claptrap State (greater than the smallest competitive resource)."Then, different users buy items that affect each other because the Actor pattern based on Claptrap is queued to process requests."That is, assuming that each item needs to process 10ms, then the fastest need s 10000 s 10 ms to process all purchase requests.But if each item is numbered, each item is designed as a separate Claptrap State.So because they're unrelated.Selling all the goods would theoretically only cost 10ms.

It is therefore easy to conclude that if Claptrap's State is larger than the minimum competitive resource, the system will not have a correctness issue, but there may be some performance penalties. In addition, if Claptrap's State is smaller than the minimum competitive resource, the relationship between Claptrap becomes difficult and risky.Because this is equivalent to splitting a minimum competitive resource into multiple parts, and the smallest competitive resource usually needs to be dealt with in a single transaction, which goes back to the very common problem of distributed transactions in distributed parts that are difficult to handle.
