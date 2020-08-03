---
title: '狀態 (State)'
metaTitle: '狀態 (State)'
metaDescription: '狀態 (State)'
---

> [當前查看的版本是由機器翻譯自簡體中文，並進行人工校對的結果。若文檔中存在任何翻譯不當的地方，歡迎點擊此處提交您的翻譯建議。](https://crwd.in/newbeclaptrap)

State 在 Actor 模式中代表了 Actor 物件當前的數據表現。而在 Claptrap 僅僅只是在此之上增加了一個限制："State 只能通過事件溯源的方式進行更新"。由于事件溯源的可靠性，Claptrap 中的 State 也就拥有了更好的可靠性。

## State 的版本号

在 Claptrap 中的 State 有一个名为 Version 的属性，它表示 State 当前的版本。版本号是一个从 0 开始的自增数字，会在每次处理一个事件之后进行自增。

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
