---
date: 2019-03-08
title: Newbe.Claptrap Project Weekly 1 - No wheels yet, run with wheels first
---

Newbe.Claptrap Project Weekly 1, the first week of the code wrote a little.But mainly consider the theoretical feasibility.

<!-- more -->

## What's the weekly newspaper?

Successful open source works can not be separated from the active participation of community contributors.As a newly launched wheel project, the co-founder of the project, Moon Landing, has an account：

"I know you don't have the ability to code very well, and you'll have a weekly account of your ideas."Let others see the value of the project.Waiting for more and more people to discover the value of the project, will naturally give more attention, even in the development of the project involved.So you have to write a weekly newspaper.The weekly report is best focused on explaining the concept of the project and how to solve practical problems through the project.Of course, you can also include some content about how the project is designed, but pay attention to moderation, usually people do not pay too much attention to how the project is implemented.Focus more on the value of the project.Remember：project succeeds only if it generates value. ”

So the author can only write a weekly newspaper, barely able to maintain a life like this.

## The wheel has a wheel sample

The new round should have the appearance of a new round, "project opening" introduced the basic theory and working principles related to this framework.Given that the relevant theoretical content is unfamiliar to the reader who has just come into contact, this section lists the most critical content of the previous section below to stimulate the reader's memory.

Actor attribute i.：the state of Actor is changed by calling Actor externally.

![Update Actor state](/images/20190226-001.gif)

Actor feature one to make up 1：the status of Actor is not shared externally.

![Share Actor State](/images/20190226-003.gif)

The Actor feature complements 2：can read the Actor state externally.

![Read The Actor state](/images/20190226-002.gif)

Actor feature II：actor works "single-threaded" and can only process one request at a time.

![Call Actor Concurrently](/images/20190226-004.gif)

The Actor attribute is 2-to：the same read state can not be a "single thread."

![Read Actor Concurrently](/images/20190226-005.gif)

The framework defines the Actor type, Claptrap：Actor that generates events through event patterns and changes its own state through events.

![Claptrap](/images/20190228-001.gif)

The framework defines the Actor type, Minion：compared to Claptrap, minion does not generate events but reads events corresponding to Claptrap to change its state.Multiple Minions are allowed for one Claptrap.

![Minion](/images/20190228-002.gif)

Complete the "transfer" business with Claptrap and Minion.

![Claptrap & Minion](/images/20190228-003.gif)

> Moon fall big man famously warned 1：the world does not exist "silver bullet".One framework will not solve all the problems. Moon Landing's famous saying 2：Business complexity is not reduced by system design changes, it is only moved from one place to another.

## Without a wheel, run with a wheel first

Now we have the concepts of Claptrap and Minion.Next, combine some business scenarios to experiment with whether the framework can handle a wide variety of business needs.

> Beautiful technical means can not cope with the real needs and changes, that can only be technical vases. The moon falls just after learning the Sebotan XII Quantum Computer Instruction Set

### The business scenario

It's a simple e-commerce system：

1. Only one green crystal is sold, and for the sake of description, the product is named "Forgive Crystal".
2. Users can use the balance in their account to purchase forgive crystals.The balance is recharged through an external payment system.Recharge part, for the time being, is not a business scenario to consider.
3. Each user also has an integral, which, coincidentally, is also green, so the credit is named "Forgive Points".
4. There are many ways to earn forgiveness points, such as：user registration, inviting other users to register, inviting users to make a purchase, which the invitee can also get, forgiving is mining, in reality to get forgiveness, and so on, which may need to be in line with subsequent activities to continuously increase the acquisition method.
5. Forgive Points can deduct a portion of the amount that needs to be paid when you make a purchase of Forgive Crystal.
6. Forgive points are likely to have other uses in the future.
7. The payment method for buying Forgive Crystal is likely to be more than balance and forgive points in the future.

The above is a description of the requirements of this e-commerce system.Demand is sure to change in the future.

### Feature awareness

E-commerce system, the most important business scenario is naturally related to the transaction of goods business scenarios.No matter how complex the other requirements scenarios may be, trading-related business scenarios are bound to be the first to require analysis and resolution.

So first, we'll use the "User Confirmation purchase forgiveness crystal" scenario to describe in simple terms what the program needs to do：

1. You need to check that the user's balance is sufficient
2. If the user selects a credit credit, you need to check that the user's credit is sufficient
3. You need to check that the inventory is sufficient
4. The user's balance needs to be deducted
5. Inventory needs to be deducted
6. If the user selects a credit credit, the user's credit needs to be deducted

If you implement these six points by directly operating the data sheet, it should be very simple for most developers.You can complete the business by opening a database transaction with at least a row-level lock that checks and updates the data.So now that you're using this framework for implementation, you need to implement the same six key points based on the basic fact that "business complexity doesn't decrease."

### The prophet is not yet called

First of all, on the premise of not much discussion, the author around some of the above-mentioned main concepts, designed the following Claptrap：

| Concepts            | Named in English | Abbreviation |
| ------------------- | ---------------- | ------------ |
| Forgive the crystal | Sku              | S            |
| Forgive points      | UserPoint        | P            |
| The user balance    | UserBalance      | B            |

### Draw the wheel according to the dragonfly

Following the process design of the previous "transfer" business scenario, the logic of the purchase is designed in the same way here.As shown in the figure below：

![Chain design](/images/20190307-001.gif)

Analyze this design：

In accordance with the order of business logic, complete the inventory inspection, inventory deduction, balance check, balance deduction, credit check, credit deduction business steps.

Note the time the call line between Client and Claptrap S exists, and only at the beginning, that is, the client needs only a little wait to get a response.

Claptrap S can continue to respond to new requests after it pushes the event to Minion S.Ensuring that multiple users make a purchase at the same time ensures that the item is not oversold and that the response is short enough.

The entry point of the entire business logic is S, which ensures that the user pays while locking up inventory, avoiding the situation where the user pays for the goods.

For shape reasons, this design is **"Chain-Like Design"**.

### Same material, different wheels

There is another design.As shown in the figure below：

![Tree design](/images/20190307-002.gif)

Analyze this design：

A new Claptrap W (What a amazing that I get a forgiven-crystal) was introduced as the entry point for the business, which Claptrap W implemented by calling other Claptrap.

Minion S, P, and B are no longer involved in the flow control of the business as they are already controlled by Claptrap W, as compared to the design in the previous section.

And because of Minion W, this design can also make partial calls to Minion, so it can also take two forms.

![Tree design](/images/20190307-003.gif)

![Tree design](/images/20190307-004.gif)

For shape reasons, this design is **"Tree-Like Design"**.

Then there is a choice, and since there is a choice, then here is the use of "WhyNot comparative analysis" recorded in the "Moon Boss's Software Development Tricks 32" to decide which design to use：

| Options      | Why not?                                                                                                                                                                                                                                                                   | Why!No!                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Chain design |                                                                                                                                                                                                                                                                            | Control of the business flow process is connected via Minion, a tightly coupled design.This is equivalent to the context of Minion and Claptrap's operations this time.One obvious question：Whether the customer has chosen to pay points is a logic that is judged either in Minion B or Claptrap P, but either way it doesn't make sense.<br/>design can be particularly difficult to handle when dealing with process failures.For example, if the customer does not have enough points in the last step, they may need to roll back gradually, which can be very difficult. |
| Tree design  | This design brings the core process control content of the business together in a pair of related Claptrap W and Minion W.This is a highly cohesion performance.<br/>based on this design, it is easy to build more complex processes based on Claptrap S, P, and B. |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

In fact, it is easy for readers to find that the WhyNot comparison and analysis table for this choice is actually one-way street.It's obviously about choosing a tree design.

> "Moon boss software development tricks 32", is the moon landing big man in the daily development process of the software development process used in some small methods of collection and generalization.Most of these methods are not new inventions.The Moon landings simply put these methods together, and in order to enlighten the those who later, there are small ways to make things more orderly when analyzing and judging some problems.In addition to the WhyNot comparative analysis method, there are the more well-known "5W1H requirements description";

> WhyNot comparative analysis method, simply is to choose multiple subjects for side-by-side comparison, respectively, list the "should choose it" and "should not choose it" reasons, and then make a comprehensive judgment and then make a decision method.It is particularly applicable to the method used by multiple persons in dispute over an option, which ensures that the reasons for the statement are recorded separately in the form of a form, ensuring that there is no shortage of justifications.On the basis of method, some other variants such as "reason weight measurement" and "people's right to speak measurement" are also derived.This method has some connection and difference with the comparison methods such as "difference method" and "difference comparison method", as well as "probability selection method" and "experience selection method".The name of this method is said to be the first of the moon landings and is a syntax terrier.Among Chinese, the "Why not?" can be used. "Such a counter-question to indicate the reason for choosing an object, you can use the "Why!No! "This prayer sentence represents the reason for not choosing an object. WhyNot is actually a direct translation of the four words why not.

### Good wheels look good, too

Readers who first see WhyNot's comparative analysis may have questions：is there no reason to choose chain design?

It should be explained that whyNot comparative analysis is the analysis of fixed scenes, so if the scene changes, the results of the analysis will change.That is,**in certain scenarios, chain design has its necessity and**.

So before we explain, we take a different approach to interpreting the relationship between chain design and tree：

- Merge Claptrap with the corresponding Minion
- With "Because... So..." the sentence replaces the solid call in the drawing

![Chain design](/images/20190307-001.gif)

Then the chain design combined with the image above can be expressed as：

- Because S, so B
- Because B, so P

The expanded semantics can be：

- The balance is further deducted because inventory is deducted from the purchase
- The balance is deducted as a result of the purchase, so further points are deducted

![Tree design](/images/20190307-002.gif)

The tree design above can be expressed as：

- Because W, so S
- Because W, so B
- Because W, so P

The expanded semantics can be：

- The inventory was deducted because of the purchase
- The balance was deducted because of the purchase
- Points are deducted because of the purchase

Even if the author here explained not very clearly, but the reader can still observe "because of the purchase and deduction of the balance, so to further deduct points" this sentence is not quite reasonable, the two in business should not actually have obvious fore-effects.

This is also why chain design does not work in this scenario：if the call relationship between the two has no obvious pre-consequences, the two are designed as chain relationships for call-backs.What is likely to be obtained is an unreasonable design.

So the other way around：**if you want to apply a chain design.There must be reasonable pre-consequences between the two.**

However, in the process of demand analysis, the current pre-existing causes and consequences may not be reasonable later.The changeable business scenario and the incomplete stability of requirements have led to the fact that tree design can handle more problems.

Readers can try to design some of the remaining requirements in the business scenario above.

In addition, the reader can rethink the design of the "transfer" scenario used in the opening, with a tree design is more appropriate.

## It's actually a new wheel

In the opening, we made a simple comparison of the Actor mode with the CRUD pattern.Now there is another type of design that is more commonly mentioned, which is "domain-driven design".

The concept of domain-driven design is not much introduced here, and readers who are relatively unfamiliar with this content can refer to Microsoft MVP Mr. Tang Xuehua's article["Domain Model of Domain-Driven Design](http://www.cnblogs.com/netfocus/archive/2011/10/10/2204949.html)

So, when the reader understands the domain-driven design, combine the Claptrap W, S, P, and B mentioned earlier in this article.Maybe Claptrap S, P, B is the aggregate root?Maybe Claptrap W is an app service?The author thinks that the Actor model is actually a kind of further development of domain-driven：

- Domain-driven design does not take business synths into account within the design model, and the Actor pattern, as a set of synth programming models, makes up for this part of the gap.
- The vast majority of the domain-driven frameworks (as the author knows) still use the general process of "restoring aggregate roots from storage and saving them after operation".The Actor framework, in the case of Orleans, keeps the activated Actor in memory for a period of time, meaning that the aggregate root can be continuously modified in memory without the need for repeated restores from the warehouse.

In general, the reader can model the idea of domain-driven design, and then try to design the original aggregate root and application service as Actor, theoretically trying to see if the domain they are familiar with can be implemented with Actor.Perhaps readers can find something different.

However, because of the Actor and event sourcing patterns, the design approach is not exactly the same as the domain-driven model, and there are other things to note that will be collated later.

## The conclusion

Through the design of a business scenario, this article hopes to let the reader know how to use the theoretical concepts of this framework to achieve business.It contains some of the author's assumptions, so it may take the reader more time to understand.

Due to the author's limited work experience and lack of knowledge of the industry field, it is impossible to give an accurate judgment on whether the design concept of the framework conforms to the characteristics of a particular industry.If you have any questions that require assistance, please contact this project team.

Friends interested in this are welcome to follow the project and participate in the project.

<!-- md Footer-Newbe-Claptrap.md -->
