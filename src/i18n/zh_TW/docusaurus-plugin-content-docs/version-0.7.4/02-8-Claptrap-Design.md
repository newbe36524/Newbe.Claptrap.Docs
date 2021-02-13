---
title: 'Claptrap 設計圖 (Claptrap Design)'
description: 'Claptrap 設計圖 (Claptrap Design)'
---

## Claptrap Design 實現 Claptrap 的高可定製性

Claptrap 擁有較高的可定製性。開發者可以為 Claptrap 物件設定自訂的 Event Loader/ Event Saver/ State Loader / State Saver / EventNotification Method 等等一系列元件。而這一切的自定義，都可以具體反映到 Claptrap Design 物件上。

Claptrap Design 就像一個設計圖，決定了 Claptrap 的每個細節，常見的包括：

1. 採用什麼樣的 Event Loader / Event Saver 來處理事件。
2. 多久保存一次 State 快照。
3. Minion ，如果是，那麼 Master 是誰。
4. 有多少種事件，對應的 Event Handler 分別是什麼。

這些細節都會在應用程式啟動時，將會通過類型掃描、屬性標記、連貫介面、配置檔等等多種方式進行配置。從而形成完整的 Claptrap Design。並且，啟動時會對 Claptrap Design 進行合理性的驗證，確保 Claptrap Design 都是基本可用的。從而不會出現類似於「忘記編寫 Event 對應的 Handler」這樣低級的錯誤。

所有的 Claptrap Design 都會被集中保存在 IClaptrapDesignStore 這樣一個記憶體物件中，以便 Claptrap Factory 在構建 Claptrap 檢索。

開發者也可以基於 IClaptrapDesignStore 中的所有數據，來構成可供人類閱讀的文本或者圖形，以便更容易地從高層面來瞭解當前系統中 Claptrap 之間的相互關係和配置細節，源於代碼卻高於代碼。

---

以下是關於故事化描述，用於輔助理解。不必太過在意。

Claptrap Design 是Claptrap Factory進行Claptrap生產的重要依據。在 Design 中記錄了對特定種類 Claptrap 所需要配備的定制化裝置。例如：決定多功能任務處理器中的任務執行模組；決定手持型備忘錄的設備型號；決定記憶體恢復控制器的恢復策略。

在決定 Claptrap 投產之前，設計好 Claptrap Design 是確保最終產物符合需求的重要一環。

## ICON

![claptrap](/images/claptrap_icons/claptrap_design.svg)
