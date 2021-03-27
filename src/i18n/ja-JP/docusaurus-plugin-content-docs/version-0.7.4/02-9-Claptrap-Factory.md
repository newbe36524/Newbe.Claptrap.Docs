---
title: 'Claptrap ファクトリ (Claptrap Factory)'
description: 'Claptrap ファクトリ (Claptrap Factory)'
---


## Claptrap Factory は Claptrap を組み立てます

Claptrap は高いカスタマイズ性を提供します。開発者は、Claptrap オブジェクトにカスタマイズされた Event Loader/ Event Saver/ State Loader / State Saver / EventNotification Method などの一連のコンポーネントを指定できます。このカスタマイズ性に対応するためには、Claptrap オブジェクトのアセンブリを実装するための適切なスキームが必要です。

現在、フレームワークは Autofac をアセンブラーとして選択しています。主な理由は、Autofac が Delegate Factory / Decorator / Generic Type / Module など、System.DepenedencyInjection よりも豊富な機能をサポートしているためです。

## Claptrap Factory は Claptrap のライフサイクルを制御します

Claptrap Factory は Claptrap のプロデューサであるため、通常は Claptrap レベルのライフサイクル制御機能も担当します。Autofac ベースの実装の Claptrap Factory では、このライフサイクル制御は、Autofac の LifetimeScope オブジェクトを使用してマウント、作成、およびアンロード全体を制御するプロセスに表されます。

---

以下は、理解を支援するストーリーテリングの説明です。あまり気にする必要はありません。

Claptrap Factory は、Claptrap の生産を行う主要な場所です。これは、特定のClaptrap Designに従って、非常に高い製品歩留まりと作業効率で、各工場出荷時のClaptrapのカスタムアセンブリを実行します。

## ICON

![claptrap](/images/claptrap_icons/claptrap_factory.svg)
