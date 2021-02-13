---
title: 'Claptrap Identity'
description: 'Claptrap Identity'
---


## Claptrap Identity 是定位一個 Claptrap 的唯一標識

它是一個結構體。其包含有以下幾個主要的欄位：

Claptrap Type Code，Claptrap 分類代碼。分類代碼是由開發者自行定義的代碼。通常和對應 Claptrap 所關聯的業務有關。值得特別注意的是， Claptrap 及其 Minion 的 Claptrap Type Code 之間沒有強制的關聯關係，但通常在開發過程中，Minion 的 Claptrap Type Code 應該被設計為其 Master Claptrap 的部分，這樣更有利於業務上的理解。

Id， Claptrap 業務 Id。這是業務的 Id。通常來說是業務的主鍵。在實際的代碼、文檔中，Claptrap Identity 都會以全稱的方式出現，而出現 Id 時，通常是指業務 Id。

## Claptrap Identity 這是與運行平台無關的設計

因而在與具體的平台結合時，需要明確其結合點。

Claptrap Identity 在 Orleans 中的體現。

Claptrap Type Code：在 Orleans 中，通常每個 Claptrap 都會被放置在 ClaptrapBoxGrain 中運行。此時，Claptrap Type Code 通常會以屬性標記的方式，標記在類或者介面上。

Id：在 Orleans 中， Grain 本身就帶有一個 PrimaryKey 。因而，在 ClaptrapBoxGrain 中也直接重用了該 PrimaryKey 作為 Claptrap Id。
