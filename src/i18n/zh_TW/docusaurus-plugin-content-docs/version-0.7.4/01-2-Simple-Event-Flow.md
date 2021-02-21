---
title: "第二步——簡單業務，清空購物車。"
description: "第二步——簡單業務，清空購物車。"
---

通過本篇閱讀，您便可以開始嘗試使用 Claptrap 實現業務了。

<!-- more -->

:::caution 该文档仅适用于 0.7 及以下版本，若想要查看最新版本内容，请点击右上角进行切换。 :::

## 開篇摘要

本篇，通過實現"清空購物車"的需求來瞭解一下如何在已有的項目範例中增加一個業務的實現。

主要包含有以下這些步驟：

1. 定義 EventCode
2. 定義 Event
3. 實現 EventHandler
4. 註冊 EventHandler
5. 修改 Grain 介面
6. 實現 Grain
7. 修改 Controller

這是一個從下向上的過程，實際的編碼過程中開發也可以自上而下進行實現。

## 定義 Event Code

EventCode 是 Claptrap 系統每個事件的唯一編碼。其在事件的識別，序列化等方面起到了重要的作用。

打開`HelloClaptrap.Models`專案中的`ClaptrapCodes`類。

添加「清空購物車事件」的 EventCode。

```cs
  namespace HelloClaptrap.Models
  {
      public static class ClaptrapCodes
      {
          public const string CartGrain = "cart_claptrap_newbe";
          private const string CartEventSuffix = "_e_" + CartGrain;
          public const string AddItemToCart = "addItem" + CartEventSuffix;
          public const string RemoveItemFromCart = "removeItem" + CartEventSuffix;
+         public const string RemoveAllItemsFromCart = "remoeAllItems" + CartEventSuffix;
      }
  }
```

## 定義 Event

Event 是事件溯源的關鍵。用於改變 Claptrap 中的 State。並且 Event 會被持久化在持久層。

在 HelloClaptrap.Models 项目的 Cart/Events 文件夹下创建 RemoveAllItemsFromCartEvent 类。

添加如下代碼：

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Cart.Events
+ {
+     public class RemoveAllItemsFromCartEvent : IEventData
+     {
+     }
+ }
```

由於在這個簡單的業務場景中，清空購物車不需要特定的參數。因此，只要創建空類型即可。

`IEventData`介面是框架中表示事件的空介面，用於在泛型推斷時使用。

## 實現 EventHandler

EventHandler 用于将事件更新到 Claptrap 的 State 上。例如此次的業務場景，那麼 EventHandler 就負責將 State 購物車中的內容清空即可。

在 HelloClaptrap.Actors 项目的 Cart/Events 文件夹下创建 RemoveAllItemsFromCartEventHandler 类。

添加如下代碼：

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Cart;
+ using HelloClaptrap.Models.Cart.Events;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Cart.Events
+ {
+     public class RemoveAllItemsFromCartEventHandler
+         : NormalEventHandler<CartState, RemoveAllItemsFromCartEvent>
+     {
+         public override ValueTask HandleEvent(CartState stateData,
+             RemoveAllItemsFromCartEvent eventData,
+             IEventContext eventContext)
+         {
+             stateData.Items = null;
+             return new ValueTask();
+         }
+     }
+ }
```

這裡有一些常見的問題：

1. NormalEventHandler 是什麼?

   NormalEventHandler 是框架定義的一個簡單基類，用於方便實現 Handler。 其中第一個泛型參數是 Claptrap 對應的 State 類型。結合前篇文檔中，我們的購物車 State 類型就是 CartState。 第二個泛型參數是該 Handler 需要處理的 Event 類型。

2. 為什麼用`stateData.Items = null;`而不用`stateData.Items.Clear();`

   stateData 是保存在記憶體中的物件，Clear 不會縮小字典已佔用的自身記憶體。當然，一般一個購物車也不會有數十萬商品。但其實關鍵是在於，更新 State 時，需要注意的是 Claptrap 是一種常駐於記憶體中的物件，數量增加時會加劇記憶體的消耗。因此，盡可能在 State 中保持更少的數據。

3. ValueTask 是甚麼?

   可以通過這篇[《Understanding the Whys, Whats, and Whens of ValueTask》](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)進行瞭解。

EventHandler 實現完成之後，不要忘記對其進行單元測試。這裡就不羅列了。

## 註冊 EventHandler

實現並測試完 EventHandler 之後，便可以將 EventHandler 進行註冊，以便與 EventCode 以及 Claptrap 進行關聯。

打开 `HelloClaptrap.Actors` 项目的 CartGrain 类。

使用 Attribute 進行標記。

```cs
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Cart
  {
      [ClaptrapEventHandler(typeof(AddItemToCartEventHandler), ClaptrapCodes.AddItemToCart)]
      [ClaptrapEventHandler(typeof(RemoveItemFromCartEventHandler), ClaptrapCodes.RemoveItemFromCart)]
+     [ClaptrapEventHandler(typeof(RemoveAllItemsFromCartEventHandler), ClaptrapCodes.RemoveAllItemsFromCart)]
      public class CartGrain : ClaptrapBoxGrain<CartState>, ICartGrain
      {
          public CartGrain(
              IClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

          ....
```

ClaptrapEventHandlerAttribute 是框架定义的一个 Attribute，可以标记在 Grain 的实现类上，以实现 EventHandler 、 EventCode 和 ClaptrapGrain 三者之间的关联。

關聯之後，如果在此 Grain 中產生的對應 EventCode 的事件將會由指定的 EventHandler 進行處理。

## 修改 Grain 介面

修改 Grain 介面的定義，才能夠提供外部與 Claptrap 的互通性。

打开 HelloClaptrap.IActors 项目的 ICartGrain 接口。

添加介面以及 Attribute。

```cs
  using System.Collections.Generic;
  using System.Threading.Tasks;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Cart;
  using HelloClaptrap.Models.Cart.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.IActor
  {
      [ClaptrapState(typeof(CartState), ClaptrapCodes.CartGrain)]
      [ClaptrapEvent(typeof(AddItemToCartEvent), ClaptrapCodes.AddItemToCart)]
      [ClaptrapEvent(typeof(RemoveItemFromCartEvent), ClaptrapCodes.RemoveItemFromCart)]
+     [ClaptrapEvent(typeof(RemoveAllItemsFromCartEvent), ClaptrapCodes.RemoveAllItemsFromCart)]
      public interface ICartGrain : IClaptrapGrain
      {
          Task<Dictionary<string, int>> AddItemAsync(string skuId, int count);
          Task<Dictionary<string, int>> RemoveItemAsync(string skuId, int count);
          Task<Dictionary<string, int>> GetItemsAsync();
+         Task RemoveAllItemsAsync();
      }
  }
```

其中增加了兩部分內容：

1. 標記了`ClaptrapEvent`，使得事件與 Grain 進行關聯。注意，這裡與前一步的`ClaptrapEventHandler`是不同的。此處標記的是 Event，上一步標記的是 EventHandler。
2. 增加了 RemoveAllItemsAsync 方法，表示「清空購物車」的業務行為。需要注意的是 Grain 的方法定義有一定限制。詳細可以參見[《Developing a Grain》](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## 實現 Grain

接下來按照上一步的介面修改，來修改相應的實現類。

打开 HelloClaptrap.Actors 项目中的 Cart 文件夹下的 CartGrain 类。

添加對應的實現。

```cs
  using System;
  using System.Collections.Generic;
  using System.Linq;
  using System.Threading.Tasks;
  using HelloClaptrap.Actors.Cart.Events;
  using HelloClaptrap.IActor;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Cart;
  using HelloClaptrap.Models.Cart.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Cart
  {
      [ClaptrapEventHandler(typeof(AddItemToCartEventHandler), ClaptrapCodes.AddItemToCart)]
      [ClaptrapEventHandler(typeof(RemoveItemFromCartEventHandler), ClaptrapCodes.RemoveItemFromCart)]
      [ClaptrapEventHandler(typeof(RemoveAllItemsFromCartEventHandler), ClaptrapCodes.RemoveAllItemsFromCart)]
      public class CartGrain : ClaptrapBoxGrain<CartState>, ICartGrain
      {
          public CartGrain(
              IClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

+         public Task RemoveAllItemsAsync()
+         {
+             if (StateData.Items?.Any() != true)
+             {
+                 return Task.CompletedTask;
+             }
+
+             var removeAllItemsFromCartEvent = new RemoveAllItemsFromCartEvent();
+             var evt = this.CreateEvent(removeAllItemsFromCartEvent);
+             return Claptrap.HandleEventAsync(evt);
+         }
      }
  }
```

增加了對介面方法的對應實現。需要注意的有以下幾點：

1. 一定要增加`if (StateData.Items?. Any() != true)`這行判斷。因為這可以明顯的減小存儲的開銷。

   事件在當執行`Claptrap.HandleEventAsync(evt)`便會持久化。而就此處的場景而言，如果購物車中原本就沒有內容，清空或者持久化這個事件只是增加開銷，而沒有實際的意義。 因此，在此之前增加判斷可以減小存儲的無用消耗。

2. 一定要判斷 State 以及傳入參數是否滿足事件執行的條件。

   這與上一點所描述的內容側重不同。上一點側重表明"不要產生沒有意義的事件"，這一點表明"絕不產生 EventHandler 無法消費的事件"。 在事件溯源模式中，業務的完成是以事件的持久化完成作為業務確定完成的依據。也就是說事件只要入庫了，就可以認為這個事件已經完成了。 而在 EventHandler 中，只能接受從持久化層讀出的事件。此時，按照事件的不可變性，已經無法再修改事件，因此一定要確保事件是可以被 EventHandler 消費的。所以，在`Claptrap.HandleEventAsync(evt)`之前進行判斷尤為重要。 因此，一定要實現單元測試來確保 Event 的產生和 EventHandler 的處理邏輯已經被覆蓋。

3. 此處需要使用到一些 TAP 庫中的一些方法，可以參見[基於任務的非同步模式。](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap)

## 修改 Controller

前面的所有步驟完成之後，就已經完成了 Claptrap 的所有部分。但由於 Claptrap 無法直接提供與外部程式的互通性。因此，還需要在在 Controller 層增加一個 API 以便外部進行「清空購物車」的操作。

打开 HelloClaptrap.Web 项目的 Controllers 文件夹下的 CartController 类。

```cs
  using System.Threading.Tasks;
  using HelloClaptrap.IActor;
  using Microsoft.AspNetCore.Mvc;
  using Orleans;

  namespace HelloClaptrap.Web.Controllers
  {
      [Route("api/[controller]")]
      public class CartController : Controller
      {
          private readonly IGrainFactory _grainFactory;

          public CartController(
              IGrainFactory grainFactory)
          {
              _grainFactory = grainFactory;
          }

+         [HttpPost("{id}/clean")]
+         public async Task<IActionResult> RemoveAllItemAsync(int id)
+         {
+             var cartGrain = _grainFactory.GetGrain<ICartGrain>(id.ToString());
+             await cartGrain.RemoveAllItemsAsync();
+             return Json("clean success");
+         }
      }
  }
```

## 小結

至此，我們就完成了"清空購物車"這個簡單需求的所有內容。

你可以從以下位址來獲取本文章對應的原始程式碼：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
