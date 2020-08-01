---
title: 'Claptrap Design'
metaTitle: 'Claptrap Design'
metaDescription: 'Claptrap Design'
---

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)

## Claptrap Design 实现 Claptrap 的高可定制性

Claptrap has a high degree of customization.开发者可以为 Claptrap 对象设置自定义的 Event Loader/ Event Saver/ State Loader / State Saver / EventNotification Method 等等一系列组件。而这一切的自定义，都可以具体反映到 Claptrap Design 对象上。

Claptrap Design 就像一个设计图，决定了 Claptrap 的每个细节，常见的包括：

1. What event Loader / Event Saver is used to handle the event.
2. How often do you save a State snapshot.
3. Minion ，如果是，那么 Master 是谁。
4. How many events are there, and what is the corresponding Event Handler.

这些细节都会在应用程序启动时，将会通过类型扫描、属性标记、连贯接口、配置文件等等多种方式进行配置。This results in a complete Claptrap Design.Also, Claptrap Design is validated for reasonableness at startup to ensure that Claptrap Design is basically available.从而不会出现类似于“忘记编写 Event 对应的 Handler”这样低级的错误。

所有的 Claptrap Design 都会被集中保存在 IClaptrapDesignStore 这样一个内存对象中，以便 Claptrap Factory 在构建 Claptrap 检索。

开发者也可以基于 IClaptrapDesignStore 中的所有数据，来构成可供人类阅读的文本或者图形，以便更容易地从高层面来了解当前系统中 Claptrap 之间的相互关系和配置细节，源于代码却高于代码。

---

The following is a story-based description to aid understanding.Don't care too much.

Claptrap Design Design is an important basis for Claptrap Factory's Claptrap production.The customized devices required for a particular type of Claptrap are documented in Design.For example.：Decide on the task execution module in the multifunction task processor, decide the device model for the handheld memo, and decide the recovery strategy of the memory recovery controller.

Designing Claptrap Design is an important part of ensuring that the final product meets your needs before deciding to go into production.

## ICON

![Claptrap.](/images/claptrap_icons/claptrap_design.svg)
