---
title: 'Claptrap Box'
description: 'Claptrap Box'
---


## Claptrap Box 使 Claptrap 能夠運行在更多框架之上

Claptrap 是基於 Actor 模式實現的一種物件。其僅具備處理事件和狀態控制相關的能力。因此，在實際場景中，往往需要依託於具體的運行環境來承載它，或者需要根據業務來設計對外的業務介面。

最典型的用例，就是與 Orleans 的 Grain 進行結合。Grain 是 Orleans 的虛擬 Actor 實現，而 Claptrap 也是 Actor。在 Claptrap 和 Grain 結合時，我們選擇將 Claptrap 封裝在 Grain 內部。這樣，我們就使得 Claptrap 這種結合了事件溯源的 Actor 運行在 Grain 中，這就可以充分利用 Orleans 支援分散式的特點。當我們將 Claptrap 放入到 Grain 中運行時，可以將 Grain 看做是一個盒子，這種物件的組合方式非常類似於設計模式中的門面模式，Grain 為 Claptrap 提供了一個門面與外部進行通信，遮罩內部細節的同時也使得外部更理解其交互方式。此處我們將這種「將 Claptrap 載入到特定門面物件中執行的方式」稱為 Claptrap Box 模式，而其中的門面物件被稱為 Claptrap Box 。有了這種方式的存在，才使得 Claptrap 能夠應用於更加複雜的平臺和業務。在 Orleans 中，這種 Claptrap Box 則被稱為 ClaptrapBoxGrain。

由於 Claptrap Box 的存在，Claptrap 即使脫離了 Orleans 也可以保持事件溯源和 Actor 模式的基本條件。例如在簡單的控制台程式中，開發者仍然可以使用 NormalClaptrapBox 來作為門面物件。然而這就失去了 Orleans 分散式的優勢。

依託 Claptrap Box 概念的存在，使得 Claptrap 能夠在更多的基礎平臺和框架之上運行。雖然目前僅有 Orleans / Akka.net / 無承載 等可以選用的門面物件。

---

以下是關於故事化描述，用於輔助理解。不必太過在意。

Claptrap 是一種可定製化程度很高的機器人。為了能夠讓 Claptrap 在更繽紛複雜的環境下運行，需要針對不同的實際環境設計一些可以裝載 Claptrap 的載具，以便它們能夠完美地運行。例如：在海底工作的 Claptrap 需要配備足夠承受水壓的載具;在沼澤工作的 Claptrap 需要配備防陷防潮的載具;在火山口附近工作的 Claptrap 則需要配備耐高溫材料製成的載具。這一系列的載具，我們統稱為 Claptrap Box 。這是因為這些載具都有一個共同的特點，它們都是全包裹式的盒裝，當然形狀各異，但是我們統稱為 Box 。有了這些載具，Claptrap 便可以良好的運行在各種不同的環境中。

## ICON

![claptrap](/images/claptrap_icons/claptrap_box.svg)
