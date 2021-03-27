---
title: 'Claptrap 设计图 （Claptrap Design）'
description: 'Claptrap 设计图 （Claptrap Design）'
---

## Claptrap Design 实现 Claptrap 的高可定制性

Claptrap 拥有较高的可定制性。开发者可以为 Claptrap 对象设置自定义的 Event Loader/ Event Saver/ State Loader / State Saver / EventNotification Method 等等一系列组件。而这一切的自定义，都可以具体反映到 Claptrap Design 对象上。

Claptrap Design 就像一个设计图，决定了 Claptrap 的每个细节，常见的包括：

1. 采用什么样的 Event Loader / Event Saver 来处理事件。
2. 多久保存一次 State 快照。
3. Minion ，如果是，那么 Master 是谁。
4. 有多少种事件，对应的 Event Handler 分别是什么。

这些细节都会在应用程序启动时，将会通过类型扫描、属性标记、连贯接口、配置文件等等多种方式进行配置。从而形成完整的 Claptrap Design。并且，启动时会对 Claptrap Design 进行合理性的验证，确保 Claptrap Design 都是基本可用的。从而不会出现类似于“忘记编写 Event 对应的 Handler”这样低级的错误。

所有的 Claptrap Design 都会被集中保存在 IClaptrapDesignStore 这样一个内存对象中，以便 Claptrap Factory 在构建 Claptrap 检索。

开发者也可以基于 IClaptrapDesignStore 中的所有数据，来构成可供人类阅读的文本或者图形，以便更容易地从高层面来了解当前系统中 Claptrap 之间的相互关系和配置细节，源于代码却高于代码。

---

以下是关于故事化描述，用于辅助理解。不必太过在意。

Claptrap Design 是 Claptrap Factory 进行 Claptrap 生产的重要依据。在 Design 中记录了对特定种类 Claptrap 所需要配备的定制化装置。例如：决定多功能任务处理器中的任务执行模组；决定手持型备忘录的设备型号；决定内存恢复控制器的恢复策略。

在决定 Claptrap 投产之前，设计好 Claptrap Design 是确保最终产物符合需求的重要一环。

## ICON

![claptrap](/images/claptrap_icons/claptrap_design.svg)
