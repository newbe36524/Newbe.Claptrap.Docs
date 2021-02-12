---
title: 'Claptrap Identity'
description: 'Claptrap Identity'
---


## Claptrap Identity 是定位一个 Claptrap 的唯一标识

它是一个结构体。其包含有以下几个主要的字段：

Claptrap Type Code，Claptrap 分类代码。分类代码是由开发者自行定义的代码。通常和对应 Claptrap 所关联的业务有关。值得特别注意的是， Claptrap 及其 Minion 的 Claptrap Type Code 之间没有强制的关联关系，但通常在开发过程中，Minion 的 Claptrap Type Code 应该被设计为其 Master Claptrap 的部分，这样更有利于业务上的理解。

Id, Claptrap 业务 Id。这是业务的 Id。通常来说是业务的主键。在实际的代码、文档中，Claptrap Identity 都会以全称的方式出现，而出现 Id 时，通常是指业务 Id。

## Claptrap Identity 这是与运行平台无关的设计

因而在与具体的平台结合时，需要明确其结合点。

Claptrap Identity 在 Orleans 中的体现。

Claptrap Type Code：在 Orleans 中，通常每个 Claptrap 都会被放置在 ClaptrapBoxGrain 中运行。此时，Claptrap Type Code 通常会以属性标记的方式，标记在类或者接口上。

Id：在 Orleans 中，Grain 本身就带有一个 PrimaryKey 。因而，在 ClaptrapBoxGrain 中也直接重用了该 PrimaryKey 作为 Claptrap Id。
