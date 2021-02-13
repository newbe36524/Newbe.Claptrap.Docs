---
title: '「Claptrap Design」(Claptrap Design)'
description: '「Claptrap Design」(Claptrap Design)'
---

## Claptrap Design は、Claptrap の高いカスタマイズ性を実現します

Claptrap は高いカスタマイズ性を提供します。開発者は、Claptrap オブジェクトにカスタマイズされた Event Loader/ Event Saver/ State Loader / State Saver / EventNotification Method などの一連のコンポーネントを設定できます。このカスタマイズはすべて、Claptrap Design オブジェクトに具体的に反映できます。

Claptrap Design は、Claptrap のすべての詳細を決定する設計図のようなもので、一般的に：

1. イベントを処理するために、どのような Event Loader / Event Saver を使用します。
2. State スナップショットはどのくらいの頻度で保存されます。
3. Minion 、もしそうなら、マスターは誰です。
4. イベントの種類と、対応する Event Handler の種類。

これらの詳細は、アプリケーションの起動時に、タイプ スキャン、プロパティ タグ、一貫したインターフェイス、構成ファイルなど、さまざまな方法で構成されます。これにより、完全な Claptrap Design が形成されます。また、Claptrap Design は起動時に妥当性を検証し、Claptrap Design が基本的に使用可能であることを確認します。これにより、"Event 対応の Handler を書き忘れた" などの低レベルのエラーは発生しません。

すべての Claptrap Design は IClaptrapDesignStore などのメモリ オブジェクトに一元的に保存され、Claptrap Factory が Claptrap を構築して取得できます。

開発者は、IClaptrapDesignStore のすべてのデータに基づいて、人間が読み取るテキストまたはグラフィックスを構成して、現在のシステム内の Claptrap の相互関係と構成の詳細を高レベルで理解しやすくすることもできます。

---

以下は、理解を支援するストーリーテリングの説明です。あまり気にする必要はありません。

Claptrap Design は、Claptrap Factory が Claptrap を生産するための重要な基礎です。特定の種類の Claptrap に必要なカスタムデバイスが Design に記録されます。たとえば：多機能タスク プロセッサのタスク実行モジュールの決定、ハンドヘルド メモのデバイス モデルの決定、メモリ回復コントローラの回復戦略の決定などです。

Claptrap Design の設計は、Claptrap が稼働することを決定する前に、最終製品がニーズを満たしていることを確認する上で重要な要素です。

## ICON

![claptrap](/images/claptrap_icons/claptrap_design.svg)
