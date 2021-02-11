---
title: '狀態 (State)'
description: '狀態 (State)'
---

State 在 Actor 模式中代表了 Actor 物件當前的數據表現。而在 Claptrap 僅僅只是在此之上增加了一個限制："State 只能通過事件溯源的方式進行更新"。由於事件溯源的可靠性，Claptrap 中的 State 也就擁有了更好的可靠性。

## State 的版本號

在 Claptrap 中的 State 有一個名為 Version 的屬性，它表示 State 當前的版本。版本號是一個從 0 開始的自增數位，會在每次處理一個事件之後進行自增。

版本號為 0 的 State 是 Claptrap 的初始狀態，也可以被稱為創世狀態。初始狀態可以根據業務需要進行定製。

Claptrap 和 Minion 對於版本號的處理也有一些區別。

對於 Claptrap 而言，Claptrap 是事件的生產者，因此，事件的版本號本身就是由 Claptrap 進行賦予的。例如，在一次事件的處理過程中，以下這些事情將會依次發生：

1. State Version = 1000
2. 開始處理 Event ，其 Version = State Version + 1 = 1001
3. Event 處理完畢，更新 State Version = 1001

對於 Minion 而言，由於它是 Claptrap 事件的消費者。因此版本號的處理略有不同。例如，在一次事件的處理過程中，以下事件將會依次發生：

1. State Version = 1000
2. 讀取到了 Event Version 為 1001 的事件
3. Event 處理完畢，更新 State Version = 1001

State 的版本號和 Event 的版本號相互依存，相互驗證，是事件有序性的關鍵。如果在處理過程中，出現 State 的版本號和 Event 的版本號不匹配的情況，將會是嚴重的問題。通常來說，出現版本號不匹配，只有兩種情況：

1. 持久化層中的事件出現了丟失
2. 框架惡性 BUG

## ICON

![claptrap](/images/claptrap_icons/state.svg)
