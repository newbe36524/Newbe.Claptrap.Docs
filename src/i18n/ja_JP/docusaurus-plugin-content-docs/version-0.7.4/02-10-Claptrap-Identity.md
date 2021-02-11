---
title: 'Claptrap Identity'
description: 'Claptrap Identity'
---


## Claptrap Identity は、Claptrap を検索するための一意の ID です

構造体です。これは、次のいくつかの主要なフィールドが含まれています：

Claptrap Type Code,Claptrap分類コード。分類コードは、開発者が独自に定義するコードです。通常、対応する Claptrap に関連付けられているビジネスに関連しています。特に、Claptrap とその Minion の Claptrap Type Code の間には強制的な相関関係はありませんが、通常、開発中は、Minion の Claptrap Type Code を Master Claptrap の一部として設計する必要があります。

Id, Claptrap ビジネス Id.これはビジネスの Id です。通常、ビジネスの主キーです。実際のコードやドキュメントでは、Claptrap Identity はフルネームで表示され、Id が表示される場合は通常、ビジネス Id を参照します。

## Claptrap Identity これは、実行プラットフォームに依存しない設計です

したがって、特定のプラットフォームと組み合わせると、その結合点を明確にする必要があります。

Orleans における Claptrap Identity の表現。

Claptrap Type Code：Orleansでは、通常、各ClaptrapはClaptrapBoxGrainに配置して実行されます。この時点で、Claptrap Type Code は、通常、クラスまたはインターフェイスにプロパティ タグとしてマークされます。

Id：Orleans では、Grain 自体に PrimaryKey があります。したがって、PrimaryKey は ClaptrapBoxGrain で Claptrap Id として直接再利用されます。
