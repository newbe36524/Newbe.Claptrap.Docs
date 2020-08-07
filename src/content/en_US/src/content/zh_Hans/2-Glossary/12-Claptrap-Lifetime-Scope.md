---
title: 'Claptrap Lifetime Scope'
metaTitle: 'Claptrap Lifetime Scope'
metaDescription: 'Claptrap Lifetime Scope'
---

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)

The Claptrap life cycle is illustrated in two broad categories according to the author's view.：Run-time lifecycle and design-time lifecycle.

## The runtime lifecycle.

The runtime lifecycle is the life cycle behavior of each object in memory during the operation of the Claptrap system.For example.：In a Web system, each Web request is typically assigned as a lifecycle, and the Claptrap system has a similar lifecycle design.These lifecycles have an impact on developers' component extensions or business development.The runtime lifecycle of the Claptrap framework is divided into.：Process, Claptrap, and Event Handler.

Process-level.An object designed as a life cycle at the process level is a singleton object in the general sense.Each running Claptrap process has its own singleton object.Typically, in a Claptrap framework, for example, each persistent layer target corresponds to a batch processor (Batch Saver Event) to increase the speed at which events are written to the persistent layer.They have only one instance throughout the life cycle of the process, one-to-one corresponding to the corresponding persistence layer, so that events can be merged to write to the persistence layer, improving write performance.In general, objects that are designed to be process-level lifecycles have one or more of the following characteristics.：

1. You only need to run the logic or code once throughout the process lifecycle.This can usually be done with Lazy and a singleton.
2. Only a single object is required throughout the process life cycle.For example, Claptrap Design Store, Claptrap Options, and so on.
3. There can only be a single object throughout the process life cycle.For example, Orleans Client.

Claptrap level.Objects in the Claptrap-level lifecycle are created with the activation of Claptrap and are released with the inactivation of Claptrap.These objects are usually strongly associated with a Claptrap Identity.For example, Claptrap Design, Event Saver, Event Loader, State Saver, State Loader, and so on associated with this Claptrap Identity.

Event processor level (Event Handler).Event processor-level lifecycle objects are created as the event processor is created and released with the event processor release.This level of lifecycle is similar to the Web request lifecycle in response to the Web.Typically, unit of work for a unified database transaction falls to this level.

## Design-time life cycle.

Design-time lifecycles are the lifecycles of business objects for Claptrap.This has nothing to do with whether the program is running or not, or even whether or not the program is used.To give a specific example, orders in a regular e-commerce system.The active business time limit for an order is generally no more than three to six months.When this time limit is exceeded, the order data cannot be modified.Here, this "three to six months" time limit is called the design time life cycle of an order.In a Claptrap system, if an object has exceeded its design-time lifecycle, it manifests itself as "there is no longer a need to activate this Claptrap business."The following inferences can be obtained from this.：

1. The events that Claptrap has stored are meaningless, and deleting them frees up free space.
2. The business code for the Claptrap no longer needs maintenance and you can choose to remove the reference or remove the code.

Therefore, the shorter the design life cycle of Claptrap, it is more conducive to reducing resource footprint and code maintenance costs, and vice versa, increasing storage costs and maintenance difficulties.Therefore, when designing Claptrap systems, there is a tendency to use a shorter design-time life cycle.And this noun, also directly reflects the actual entirely by "design" to determine. Next, let's list some common design-time life cycle classification.

### Business boundary demarcation.

This is the most common division.The business objects are divided based on the requirements of domain modeling.And these business objects often have a fixed lifecycle.As in the previous "order" is a common example of dividing the life cycle by business boundaries.When dividing using this method, you only need to note that Claptrap meets the basic requirement that "the minimum competitive resource range is greater than or equal to".Developers can experience this division with an example of a "train ticketing system".

### Conditional boundary demarcation.

In general, the business boundary-based division method has been able to divide a reasonable life cycle.However, if you are simply divided along business boundaries, you may have design-time lifecycle-to-permanent objects.Suppose these objects have very dense event operations.Then the number of events generated will be unusually large.To do this, we introduce human-controlled ways to shorten the design-time life cycle.This division is based on specific conditions.It is therefore called conditional boundary demarcation.And the most classic of these is the use of "time limit" to divide.

Here we illustrate this division by using the shopping cart object in the Quick Start example.First, a shopping cart is a user-related object, and as long as the user has been in the system, it is possible to be activated, that is, its design life cycle is "permanent".Therefore, you cannot delete related events, and they must be permanently saved to ensure that the shopping cart data is correct.But if we don't care about the events that a shopping cart caused a year ago.We can manually divide individual users' shopping carts by year.At the same time, we can make a "status copy" in a shopping cart for two adjacent years.This extends the previous year's state data, resulting in a shorter design life cycle for the user's shopping cart, and it does not affect the business.We can use a classic Chinese legend story, "The Fool's Move Mountain", to understand this time-based design life cycle classification.In the story, fools are mortals, and although they cannot live forever (shorter design-time life cycles), the spirit of fools (longer design-time life cycles) can continue with future generations, and thus can complete the great cause of mountain migration.When each generation of "fools" is replaced, the "state copy" (spiritual continuation) mentioned above occurs.This results in a shorter design-time life cycle, enabling a longer or even permanent design-time life cycle.
