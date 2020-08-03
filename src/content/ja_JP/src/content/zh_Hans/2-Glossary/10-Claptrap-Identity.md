---
title: 'Claptrap Identity.'
metaTitle: 'Claptrap Identity.'
metaDescription: 'Claptrap Identity.'
---

> [現在表示されているバージョンは、機械が簡体字中国語から翻訳され、手動校正の結果です。ドキュメントに不適切な翻訳がある場合は、こちらをクリックして翻訳提案を提出してください。](https://crwd.in/newbeclaptrap)

## Claptrap Identity は、Claptrap をターゲットにする一意の ID です。

これは、構造体です。以下の主要なフィールドが含まれています。：

Claptrap Type Code、Claptrap分類コード。分類コードは、開発者自身によって定義されるコードです。通常、Claptrap に関連するビジネスに関連しています。特に、Claptrap と Minion の Claptrap Type Code の間には強制的な相関関係はありませんが、通常、Minion の Claptrap Type Code は、ビジネス理解を容易にするため、Master Claptrap のセクションとして設計する必要があります。

Id、ClaptrapビジネスID。これはビジネスの ID です。通常、ビジネスの主キーです。実際のコード、ドキュメントでは、Claptrap Identity はフルネームで表示され、Id は通常ビジネス ID を参照します。

## Claptrap Identity これは、プラットフォームの実行に関係のない設計です。

したがって、特定のプラットフォームと組み合わせる場合、その結合ポイントを明確にする必要があります。

オルリアンスに登場するClaptrap Identity。

Claptrap Type Code。：Orleansでは、通常、ClaptrapBoxGrainで実行するためにすべてのClaptrapが配置されます。この時点で、Claptrap Type Code は、通常、クラスまたはインターフェイスに属性タグを付けます。

ID。：Orleans では、Grain 自体には PrimaryKey が付属しています。その結果、ClaptrapIdとしてPrimaryKeyもClaptrapBoxGrainで直接再利用された。
