---
title: '快速入门'
metaTitle: 'Newbe.Claptrap 快速入门'
metaDescription: 'Newbe.Claptrap 快速入门'
---

> [当前查看的版本是由机器翻译自简体中文，并进行人工校对的结果。若文档中存在任何翻译不当的地方，欢迎点击此处提交您的翻译建议。](https://crwd.in/newbeclaptrap)

本系列，我们将通过一个简化的电商小应用来了解如使用 Newbe.Claptrap 来开发一个服务端系统。

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
