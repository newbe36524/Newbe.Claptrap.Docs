---
title: 'Quick start'
metaTitle: 'Newbe.Claptrap Quick Start'
metaDescription: 'Newbe.Claptrap Quick Start'
---

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)

This series, we will learn about the development of a service-end system through a simplified e-commerce small application such as the use of Newbe.Claptrap.

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
