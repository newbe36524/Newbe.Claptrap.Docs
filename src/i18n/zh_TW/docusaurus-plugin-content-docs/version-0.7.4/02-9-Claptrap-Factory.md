---
title: 'Claptrap 工廠 (Claptrap Factory)'
description: 'Claptrap 工廠 (Claptrap Factory)'
---


## Claptrap Factory 組裝 Claptrap

Claptrap 擁有較高的可定製性。開發者可以為 Claptrap 物件指定自訂的 Event Loader/ Event Saver/ State Loader / State Saver / EventNotification Method 等等一系列元件。為了適應這種可定製性，故而需要選用良好的方案來實現 Claptrap 物件的裝配。

目前框架選用的是 Autofac 作為裝配器來完成。主要原因是 Autofac 支援 Delegate Factory / Decorator / Generic Type / Module 等等一些相較於 System.Depenedency Injection 更豐富的特性。

## Claptrap Factory 控制 Claptrap 生命週期

由於 Claptrap Factory 是 Claptrap 的生產者，因此一般也負責 Claptrap 級的生命週期控制功能。在基於 Autofac 實現的 Claptrap Factory，這種生命週期控制就體現在使用 Autofac 的 Lifetime Scope 物件來控制整個裝載、創建和卸載的過程。

---

以下是關於故事化描述，用於輔助理解。不必太過在意。

Claptrap Factory 是進行 Claptrap 進行生產的主要場所。它將依照給定的 Claptrap Design 對每一個出廠的 Claptrap 執行客製化裝配，而它擁有著極高的產品合格率和工作效能。

## ICON

![claptrap](/images/claptrap_icons/claptrap_factory.svg)
