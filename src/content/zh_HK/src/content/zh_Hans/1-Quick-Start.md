---
title: '快速入門'
metaTitle: 'Newbe.Claptrap 快速入門'
metaDescription: 'Newbe.Claptrap 快速入門'
---

> [当前查看的版本是由机器翻译自简体中文，并进行人工校对的结果。若文档中存在任何翻译不当的地方，欢迎点击此处提交您的翻译建议。](https://crwd.in/newbeclaptrap)

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
