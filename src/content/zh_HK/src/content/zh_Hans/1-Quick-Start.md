---
title: '快速入門'
metaTitle: 'Newbe.Claptrap 快速入門'
metaDescription: 'Newbe.Claptrap 快速入門'
---

> [當前查看的版本是由機器翻譯自簡體中文，並進行人工校對的結果。若文檔中存在任何翻譯不當的地方，歡迎點擊此處提交您的翻譯建議。](https://crwd.in/newbeclaptrap)

哩個系列，我哋將會通過一個簡化嘅電商小應用嚟了解点點樣去用 Newbe.Claptrap 嚟開發一個伺服端系統。

```cs
namespace HelloClaptrap.Models
{
    public static class ClaptrapCodes
    {
        public const string CartGrain = "cart_claptrap_newbe";
        private const string CartEventSuffix = "_e_" + CartGrain;
        public const string AddItemToCart = "addItem" + CartEventSuffix;
        public const string RemoveItemFromCart = "removeItem" + CartEventSuffix;
+        public const string RemoveAllItemsFromCart = "remoeAllItems" + CartEventSuffix;
    }
}
```
