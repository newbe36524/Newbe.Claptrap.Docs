---
title: 'クアプラップデザインフィギュア(クアプラップデザイン)'
metaTitle: 'クアプラップデザインフィギュア(クアプラップデザイン)'
metaDescription: 'クアプラップデザインフィギュア(クアプラップデザイン)'
---

> [現在表示されているバージョンは、機械が簡体字中国語から翻訳され、手動校正の結果です。ドキュメントに不適切な翻訳がある場合は、こちらをクリックして翻訳提案を提出してください。](https://crwd.in/newbeclaptrap)

Claptrapは高いカスタマイズ性を有する。開発者は、Claptrap オブジェクトにカスタムの Event Loader/ Event Saver / State Loader / State Saver / EventNotification Method などの一連のコンポーネントを指定できます。そして、すべてのカスタマイズは、Claptrap Design オブジェクトに固有のことができます。

Claptrap Design は、Claptrap の各詳細を決定するデザイン図のようなもので、いくつかの一般的な詳細があります。：

1. イベントを処理するためにどのような Event Loader / Event Saver が使用されます。
2. State スナップショットを保存する頻度。
3. Minion かどうか、もしそうなら、マスターは誰です。
4. イベントの数と、対応するイベント Handler がそれぞれ何を持っているか。

これらの詳細は、アプリケーションの起動時に、タイプ スキャン、プロパティ タグ、コヒーレント インターフェイス、プロファイルなどを使用して構成されます。これにより、完全なクアプラップデザインを形成します。そして、Claptrap Designは起動時に正当化され、Claptrap Designが基本的に利用可能であることを確認します。"Event に対応する Handler を書くのを忘れた" などの低レベルのエラーは表示されません。

すべての Claptrap Design は、Claptrap Factory が Claptrap を構築している間に参照できるように、IClaptrapDesignStore などのメモリオブジェクトに一元的に保存されます。

開発者は、IClaptrapDesignStore のすべてのデータに基づいて、人間が読むことができるテキストやグラフィックスを生成し、現在のシステムにおける Claptrap の相互関係と構成の詳細を、コードよりもコードよりも高いレベルで簡単に把握できます。

---

以下は、理解を補助するストーリー化された説明です。あまり気にする必要はありません。

Claptrap Designは、Claptrap FactoryによるClaptrapの生産のための重要な基盤です。特定の種類の Claptrap に必要なカスタマイズされたデバイスは、デザインで文書化されています。たとえば、次のようにします。：多機能タスク プロセッサのタスク実行モジュールを決定し、ハンドヘルド メモのデバイス モデルを決定し、メモリ回復コントローラの回復戦略を決定します。

Claptrap Design の設計は、Claptrap の生産開始を決定する前に、最終製品がニーズに確実に適合することを保証する重要なリンクです。

## ICON.

![claptrap.](/images/claptrap_icons/claptrap_design.svg)
