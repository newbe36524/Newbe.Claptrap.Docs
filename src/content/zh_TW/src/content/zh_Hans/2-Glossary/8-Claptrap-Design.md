---
title: 'Claptrap 設計圖 (Claptrap Design)'
metaTitle: 'Claptrap 設計圖 (Claptrap Design)'
metaDescription: 'Claptrap 設計圖 (Claptrap Design)'
---

> [當前查看的版本是由機器翻譯自簡體中文，並進行人工校對的結果。若文檔中存在任何翻譯不當的地方，歡迎點擊此處提交您的翻譯建議。](https://crwd.in/newbeclaptrap)

## Claptrap Design 实现 Claptrap 的高可定制性

Claptrap 擁有較高的可定製性。开发者可以为 Claptrap 对象设置自定义的 Event Loader/ Event Saver/ State Loader / State Saver / EventNotification Method 等等一系列组件。而这一切的自定义，都可以具体反映到 Claptrap Design 对象上。

Claptrap Design 就像一个设计图，决定了 Claptrap 的每个细节，常见的包括：

1. 採用什麼樣的 Event Loader / Event Saver 來處理事件。
2. 多久保存一次 State 快照。
3. Minion ，如果是，那么 Master 是谁。
4. 有多少種事件,對應的 Event Handler 分別是什麼。

这些细节都会在应用程序启动时，将会通过类型扫描、属性标记、连贯接口、配置文件等等多种方式进行配置。從而形成完整的 Claptrap Design。並且,啟動時會對 Claptrap Design 進行合理性的驗證,確保 Claptrap Design 都是基本可用的。从而不会出现类似于“忘记编写 Event 对应的 Handler”这样低级的错误。

所有的 Claptrap Design 都会被集中保存在 IClaptrapDesignStore 这样一个内存对象中，以便 Claptrap Factory 在构建 Claptrap 检索。

开发者也可以基于 IClaptrapDesignStore 中的所有数据，来构成可供人类阅读的文本或者图形，以便更容易地从高层面来了解当前系统中 Claptrap 之间的相互关系和配置细节，源于代码却高于代码。

---

以下是關於故事化描述,用於輔助理解。不必太過在意。

Claptrap Design 是Claptrap Factory進行Claptrap生產的重要依據。在 Design 中記錄了對特定種類 Claptrap 所需要配備的定制化裝置。例如：決定多功能任務處理器中的任務執行模組；決定手持型備忘錄的設備型號；決定記憶體恢復控制器的恢復策略。

在決定 Claptrap 投產之前，設計好 Claptrap Design 是確保最終產物符合需求的重要一環。

## ICON

![claptrap](/images/claptrap_icons/claptrap_design.svg)
