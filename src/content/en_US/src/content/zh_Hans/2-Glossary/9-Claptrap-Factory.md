---
title: 'Claptrap Factory'
metaTitle: 'Claptrap Factory'
metaDescription: 'Claptrap Factory'
---

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)

## Claptrap Factory assembles Claptrap.

Claptrap has a high degree of customization.Developers can specify a custom set of components for the Claptrap object, such as Event Loader/Event Saver/State Saver/State Saver/EventNotification Method, and so on.In order to adapt to this customization, a good solution is needed to achieve the assembly of Claptrap objects.

The current framework is done using Autofac as an assembler.The main reason is that Autofac supports some of the more rich features of System.Depenedency Injection, such as Delegate Factory/Decorator/Generic Type/Module.

## Claptrap Factory controls the Claptrap lifecycle.

Because Claptrap Factory is a producer of Claptrap, it is also generally responsible for the life cycle control function at the Claptrap level.At The Autofac-based Claptrap Factory, this lifecycle control is reflected in the process of using Autofac's LifetimeScope object to control the entire load, creation, and unloading process.

---

The following is a story-based description to aid understanding.Don't care too much.

Claptrap Factory is the primary site for Claptrap production.It will be customized for each factory-made Claptrap according to the given Claptrap Design, and it has a very high product pass rate and job efficiency.

## ICON.

![Claptrap.](/images/claptrap_icons/claptrap_factory.svg)
