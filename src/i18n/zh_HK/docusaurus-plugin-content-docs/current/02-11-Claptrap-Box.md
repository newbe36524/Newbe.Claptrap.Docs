---
title: 'Claptrap Box'
description: 'Claptrap Box'
---


## Claptrap Box enables Claptrap to run on more frameworks.

Claptrap is an object implemented based on the Actor pattern.It has only the ability to deal with event and state control.Therefore, in the actual scenario, it is often necessary to rely on the specific operating environment to host it, or need to design the external business interface according to the business.

The most typical use case is to combine with the Grain of Orleans.Grain is the virtual Actor implementation of Orleans, and Claptrap is an actor.When Claptrap and Grain are combined, we choose to encase Claptrap inside Grain.In this way, we have The Actor, which combines event souring, running in Grain, which takes full advantage of Orleans' distributed features.When we put Claptrap into grain, we can think of Grain as a box, and the combination of objects is very similar to the facade pattern in design pattern, where Grain provides Claptrap with a facade to communicate with the outside, masking internal details while making the outside more aware of how it interacts.Here we call this "how Claptrap works in a specific facade object" as The Claptrap Box pattern, where the facade object is called Claptrap Box.This approach allows Claptrap to be applied to more complex platforms and businesses.In Orleans, this Claptrap Box is called ClaptrapBoxGrain.

Due to the existence of Claptrap Box, Claptrap can maintain the basic conditions of the event sourcing and the Actor pattern even if detached from the Orleans.For example, in a simple console program, developers can still use NormalClaptrapBox as a facade object.This, however, loses the advantage of Orleans distributed.

The existence of the Claptrap Box concept enables Claptrap to operate on more basic platforms and frameworks.Although currently only Orleans / Akka.net / no bearer, etc. are available for selection of face objects.

---

The following is a story-based description to aid understanding.Don't care too much.

Claptrap is a highly customizable robot.In order for Claptrap to operate in a more complex environment, you need to design loaded loads for different real-world environments so that they work perfectly.For example, Claptrap which works on the seafloor, needs to be equipped with a load bearing water pressure; Claptrap, which works in a swamp, needs to be equipped with a trap-proof moisture-proof carrier; the Claptrap, which works near the crater, needs to be equipped with a carrier made of high temperature resistant materials.This series of vehicles, collectively known as Claptrap Box.This is because these carriers all have a common feature that they are all fully packaged boxes, of course, in different shapes, but we collectively refer to box.With these vehicles, Claptrap works well in a variety of different environments.

## ICON

![claptrap](/images/claptrap_icons/claptrap_box.svg)
