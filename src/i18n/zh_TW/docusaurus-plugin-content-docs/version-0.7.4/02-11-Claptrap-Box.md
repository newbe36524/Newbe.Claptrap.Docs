---
title: 'Claptrap Box'
description: 'Claptrap Box'
---


## Claptrap Box 使 Claptrap 能够运行在更多框架之上

Claptrap 是基于 Actor 模式实现的一种对象。其仅具备处理事件和状态控制相关的能力。因此，在实际场景中，往往需要依托于具体的运行环境来承载它，或者需要根据业务来设计对外的业务接口。

最典型的用例，就是与 Orleans 的 Grain 进行结合。Grain 是 Orleans 的虚拟 Actor 实现，而 Claptrap 也是 Actor。在 Claptrap 和 Grain 结合时，我们选择将 Claptrap 封装在 Grain 内部。这样，我们就使得 Claptrap 这种结合了事件溯源的 Actor 运行在 Grain 中，这就可以充分利用 Orleans 支持分布式的特点。当我们将 Claptrap 放入到 Grain 中运行时，可以将 Grain 看做是一个盒子，这种对象的组合方式非常类似于设计模式中的门面模式，Grain 为 Claptrap 提供了一个门面与外部进行通信，屏蔽内部细节的同时也使得外部更理解其交互方式。此处我们将这种“将 Claptrap 装入到特定门面对象中运行的方式”称为 Claptrap Box 模式，而其中的门面对象被称为 Claptrap Box 。有了这种方式的存在，才使得 Claptrap 能够应用于更加复杂的平台和业务。在 Orleans 中，这种 Claptrap Box 则被称为 ClaptrapBoxGrain。

由于 Claptrap Box 的存在，Claptrap 即使脱离了 Orleans 也可以保持事件溯源和 Actor 模式的基本条件。例如在简单的控制台程序中，开发者仍然可以使用 NormalClaptrapBox 来作为门面对象。然而这就失去了 Orleans 分布式的优势。

依托 Claptrap Box 概念的存在，使得 Claptrap 能够在更多的基础平台和框架之上运行。虽然目前仅有 Orleans / Akka.net / 无承载 等可以选用的门面对象。

---

以下是關於故事化描述，用於輔助理解。不必太過在意。

Claptrap 是一种可定制化程度很高的机器人。为了能够让 Claptrap 在更缤纷复杂的环境下运行，需要针对不同的实际环境设计一些可以装载 Claptrap 的载具，以便它们能够完美地运行。例如：在海底工作的 Claptrap 需要配备足够承受水压的载具；在沼泽工作的 Claptrap 需要配备防陷防潮的载具；在火山口附近工作的 Claptrap 则需要配备耐高温材料制成的载具。这一系列的载具，我们统称为 Claptrap Box 。这是因为这些载具都有一个共同的特点，它们都是全包裹式的盒装，当然形状各异，但是我们统称为 Box 。有了这些载具，Claptrap 便可以良好的运行在各种不同的环境中。

## ICON

![claptrap](/images/claptrap_icons/claptrap_box.svg)
