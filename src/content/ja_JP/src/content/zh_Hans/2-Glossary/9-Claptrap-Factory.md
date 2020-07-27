---
title: 'クアプラップファクトリー(クアプラップファクトリー)'
metaTitle: 'クアプラップファクトリー(クアプラップファクトリー)'
metaDescription: 'クアプラップファクトリー(クアプラップファクトリー)'
---

> [現在表示されているバージョンは、機械が簡体字中国語から翻訳され、手動校正の結果です。ドキュメントに不適切な翻訳がある場合は、こちらをクリックして翻訳提案を提出してください。](https://crwd.in/newbeclaptrap)

Claptrapは高いカスタマイズ性を有する。開発者は、Claptrap オブジェクトにカスタムの Event Loader/ Event Saver / State Loader / State Saver / EventNotification Method などの一連のコンポーネントを指定できます。そして、このカスタマイズ性に適応する必要があるからです。したがって、Claptrap オブジェクトのアセンブリを実装するには、適切なオプションが必要です。

現在のフレームは、アセンブラーとして Autofac を使用して行われます。主な理由は、Autofac が Delegate Factory / Decorator / Generic Type / Module など、System.DepenedencyInjection よりも豊富な機能をサポートしているためです。

---

以下は、理解を補助するストーリー化された説明です。あまり気にする必要はありません。

Claptrap Factoryは、Claptrapの生産のための主要な会場です。これは、特定のClaptrapデザインに従って、各工場出荷時のClaptrapをカスタマイズします。それは非常に高いプロダクトの修飾率および仕事の有効性を有する。

## ICON.

![claptrap.](/images/claptrap_icons/claptrap_factory.svg)
