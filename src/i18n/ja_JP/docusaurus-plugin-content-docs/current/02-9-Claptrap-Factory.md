---
title: 'Claptrap Factory'
description: 'Claptrap Factory'
---


## Claptrap Factory assembles Claptrap.

Claptrap has a high degree of customization.Developers can specify a custom set of components for the Claptrap object, such as Event Loader/Event Saver/State Saver/State Saver/Event Notification Method, and so on.In order to adapt to this customizable nature, good options are needed for the assembly of Claptrap objects.

The current framework is selected by Autofac as an assembler.The main reason is that Autofac supports the Delegate Factory/Decorator/Generic Type/Module and more features that are richer compared to the System.Dependencynjection.

## Claptrap Factory controls the Claptrap lifetime scope.

Since the Clatraptrap Factory is a producer of Claptrap, it is generally also responsible for the lifetime scope control functions of Clatrap level.With the Autofac-based Claptrap Factory, this lifetime scope control is reflected in the process of controlling the entire loading, creation and offloading using Autovac's LifetimeScope objects.

---

The following is a story-based description to aid understanding.Don't care too much.

The Claprap Factory is the main place for the production of Claptrap.It will perform a customized assembly of each of the factory's Claptraps in accordance with the given Claptrap Design, and it has an extremely high product pass rate and work effectiveness.

## ICON

![claptrap](/images/claptrap_icons/claptrap_factory.svg)
