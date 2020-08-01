---
title: 'Claptrap 工廠 (Claptrap Factory)'
metaTitle: 'Claptrap 工廠 (Claptrap Factory)'
metaDescription: 'Claptrap 工廠 (Claptrap Factory)'
---

> [當前查看的版本是由機器翻譯自簡體中文，並進行人工校對的結果。若文檔中存在任何翻譯不當的地方，歡迎點擊此處提交您的翻譯建議。](https://crwd.in/newbeclaptrap)

## Claptrap Factory 组装 Claptrap

Claptrap 擁有較高的可定製性。開發者可以為 Claptrap 物件指定自訂的 Event Loader/ Event Saver/ State Loader / State Saver / EventNotification Method 等等一系列元件。为了适应这种可定制性，故而需要选用良好的方案来实现 Claptrap 对象的装配。

目前框架選用的是 Autofac 作為裝配器來完成。主要原因是 Autofac 支持 Delegate Factory / Decorator / Generic Type / Module 等等一些相较于 System.DepenedencyInjection 更丰富的特性。

## Claptrap Factory 控制 Claptrap 生命周期

由于 Claptrap Factory 是 Claptrap 的生产者，因此一般也负责 Claptrap 级的生命周期控制功能。在基于 Autofac 实现的 Claptrap Factory，这种生命周期控制就体现在使用 Autofac 的 LifetimeScope 对象来控制整个装载、创建和卸载的过程。

---

以下是关于故事化描述，用于辅助理解。不必太过在意。

Claptrap Factory 是进行 Claptrap 进行生产的主要场所。它将依照给定的 Claptrap Design 对每一个出厂的 Claptrap 执行定制化装配，而它拥有着极高的产品合格率和工作效能。

## ICON

![claptrap](/images/claptrap_icons/claptrap_factory.svg)
