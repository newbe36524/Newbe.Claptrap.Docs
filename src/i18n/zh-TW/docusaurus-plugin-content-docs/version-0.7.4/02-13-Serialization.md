---
title: '序列化(Serialization)'
description: '序列化(Serialization)'
---


由於在 Claptrap 系統中需要對事件和狀態進行傳輸與存儲，因此需要對事件和狀態進行序列化，這樣才能夠應對種類繁多的傳輸和存儲方案。

## 如何選擇序列化方案

可選的序列化方式多種多樣，典型的就如：JSON、MessagePack、Protobuf 等等。實際專案中序列化的方案可以基於以下幾點進行考慮：

1. 可讀性。如果對可讀性有越高的要求，則越應該考慮以文本為主的序列化方案。
2. 傳輸效率、存儲空間利用率。如果對於傳輸效率和存儲空間有越高的要求，則越應該考慮以二進位為主的序列化方案。

在 Claptrap 系統中，由於每個 Claptrap 都有完全獨立的可定制性，因而開發者可以為不同的 Claptrap 選擇不同的序列化方案。但唯一需要注意的就是，序列化方案一旦選定就很難變更，故需在設計階段就慎重考慮。

## 序列化與載體的獨立性

在 Claptrap 框架中，儲存、傳輸和序列化是相互獨立。換言之，可以在傳輸時使用更利於閱讀的 JSON 序列化，在存儲時選擇更有利於存儲利用率的二進位序列化，反之亦然。

## 序列化與載體的制約性

在面對特定的存儲或者傳輸的載體時，序列化的方式也將受到限制。例如：當前正在使用一種不支援二進位直接儲存的資料庫來作為事件的持久層，那麼選擇想要通過二進位序列化來保存事件就將變得不可行。故而，在選擇序列化方案之前，需要優先確定傳輸和存儲方案。

目前,所有支援的序列化方案均以"Newbe.Claptrap.DataSerializer.\*"的名稱發佈在 nuget 上。