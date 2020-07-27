---
title: 'Claptrap 工廠 (Claptrap Factory)'
metaTitle: 'Claptrap 工廠 (Claptrap Factory)'
metaDescription: 'Claptrap 工廠 (Claptrap Factory)'
---

> [當前查看的版本是由機器翻譯自簡體中文,並進行人工校對的結果。若文檔中存在任何翻譯不當的地方,歡迎點擊此處提交您的翻譯建議。](https://crwd.in/newbeclaptrap)

Claptrap 擁有較高的可定製性。開發者可以為 Claptrap 物件指定自訂的 Event Loader/ Event Saver/ State Loader / State Saver / EventNotification Method 等等一系列元件。而正因為需要適應這種可定製性。因此,需要選用良好的方案來實現 Claptrap 物件的裝配。

目前框架選用的是 Autofac 作為裝配器來完成。主要原因是因為 Autofac 支援 Delegate Factory / Decorator / Generic Type / Module 等等一些相較於 System.Depenedency Injection 更豐富的特性。

---

以下是關於故事化描述,用於輔助理解。不必太過在意。

Claptrap Factory 是進行 Claptrap 生產的主要場所。它將依照給定的 Claptrap Design 對每一個出廠的 Claptrap 進行客製化裝配。它擁有著極高的產品合格率和工作效能。

## ICON。

![claptrap。](/images/claptrap_icons/claptrap_factory.svg)
