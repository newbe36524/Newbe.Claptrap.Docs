---
title: 'クアプラップデザインフィギュア(クアプラップデザイン)'
metaTitle: 'クアプラップデザインフィギュア(クアプラップデザイン)'
metaDescription: 'クアプラップデザインフィギュア(クアプラップデザイン)'
---

> [現在表示されているバージョンは、機械が簡体字中国語から翻訳され、手動校正の結果です。ドキュメントに不適切な翻訳がある場合は、こちらをクリックして翻訳提案を提出してください。](https://crwd.in/newbeclaptrap)

## Claptrap Design 实现 Claptrap 的高可定制性

Claptrapは高いカスタマイズ性を有する。开发者可以为 Claptrap 对象设置自定义的 Event Loader/ Event Saver/ State Loader / State Saver / EventNotification Method 等等一系列组件。而这一切的自定义，都可以具体反映到 Claptrap Design 对象上。

Claptrap Design 就像一个设计图，决定了 Claptrap 的每个细节，常见的包括：

1. イベントを処理するためにどのような Event Loader / Event Saver が使用されます。
2. State スナップショットを保存する頻度。
3. Minion ，如果是，那么 Master 是谁。
4. イベントの数と、対応するイベント Handler がそれぞれ何を持っているか。

这些细节都会在应用程序启动时，将会通过类型扫描、属性标记、连贯接口、配置文件等等多种方式进行配置。これにより、完全なクアプラップデザインを形成します。そして、Claptrap Designは起動時に正当化され、Claptrap Designが基本的に利用可能であることを確認します。从而不会出现类似于“忘记编写 Event 对应的 Handler”这样低级的错误。

所有的 Claptrap Design 都会被集中保存在 IClaptrapDesignStore 这样一个内存对象中，以便 Claptrap Factory 在构建 Claptrap 检索。

开发者也可以基于 IClaptrapDesignStore 中的所有数据，来构成可供人类阅读的文本或者图形，以便更容易地从高层面来了解当前系统中 Claptrap 之间的相互关系和配置细节，源于代码却高于代码。

---

以下は、理解を補助するストーリー化された説明です。あまり気にする必要はありません。

Claptrap Designは、Claptrap FactoryによるClaptrapの生産のための重要な基盤です。特定の種類の Claptrap に必要なカスタマイズされたデバイスは、デザインで文書化されています。たとえば、次のようにします。：多機能タスク プロセッサのタスク実行モジュールを決定し、ハンドヘルド メモのデバイス モデルを決定し、メモリ回復コントローラの回復戦略を決定します。

Claptrap Design の設計は、Claptrap の生産開始を決定する前に、最終製品がニーズに確実に適合することを保証する重要なリンクです。

## ICON

![claptrap.](/images/claptrap_icons/claptrap_design.svg)
