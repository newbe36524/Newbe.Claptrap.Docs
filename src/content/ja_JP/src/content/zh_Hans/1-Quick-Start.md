---
title: 'クイックスタート'
metaTitle: 'Newbe.Claptrap クイックスタート'
metaDescription: 'Newbe.Claptrap クイックスタート'
---

> [現在表示されているバージョンは、機械が簡体字中国語から翻訳され、手動校正の結果です。ドキュメントに不適切な翻訳がある場合は、こちらをクリックして翻訳提案を提出してください。](https://crwd.in/newbeclaptrap)

このシリーズでは、Newbe.Claptrap の使用など、合理化された E コマース の小さなアプリケーションを通じて、サービス側のシステムの開発について説明します。

```cs
namespace HelloClaptrap.Models.
{
    public static class ClaptrapCodes.
    {
        public const string CartGrain = "cart_claptrap_newbe";
        プリヴァトコンスト string CartEventSuffix = "_e_" + CartGrain;
        public const string AddItemToCart = "addItem" + CartEventSuffix;
        public const string RemoveItemFromCart = "removeItem" + CartEventSuffix;
+ public const string RemoveAllItemsFromCart = "remoeAllItems" + CartEventSuffix;
    }
}
```
