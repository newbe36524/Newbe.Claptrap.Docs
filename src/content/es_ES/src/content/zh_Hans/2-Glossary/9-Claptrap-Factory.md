---
title: 'Claptrap 工厂 （Claptrap Factory）'
metaTitle: 'Claptrap 工厂 （Claptrap Factory）'
metaDescription: 'Claptrap 工厂 （Claptrap Factory）'
---

> [当前查看的版本是由机器翻译自简体中文，并进行人工校对的结果。若文档中存在任何翻译不当的地方，欢迎点击此处提交您的翻译建议。](https://crwd.in/newbeclaptrap)

Claptrap 拥有较高的可定制性。开发者可以为 Claptrap 对象指定自定义的 Event Loader/ Event Saver/ State Loader / State Saver / EventNotification Method 等等一系列组件。而正因为需要适应这种可定制性。因此，需要选用良好的方案来实现 Claptrap 对象的装配。

目前框架选用的是 Autofac 作为装配器来完成。主要原因是因为 Autofac 支持 Delegate Factory / Decorator / Generic Type / Module 等等一些相较于 System.DepenedencyInjection 更丰富的特性。

---

以下是关于故事化描述，用于辅助理解。不必太过在意。

Claptrap Factory 是进行 Claptrap 生产的主要场所。它将依照给定的 Claptrap Design 对每一个出厂的 Claptrap 进行定制化装配。它拥有着极高的产品合格率和工作效能。

## ICON

![claptrap](/images/claptrap_icons/claptrap_factory.svg)
