---
title: '第四步——利用Minion，商品下單'
description: '第四步——利用Minion，商品下單'
---

通過本篇閱讀，您便可以開始嘗試使用 Claptrap 實現業務了。

<!-- more -->

:::caution 该文档仅适用于 0.7 及以下版本，若想要查看最新版本内容，请点击右上角进行切换。 :::

## 開篇摘要

本篇，我通過實現"商品下單"的需求來瞭解一下如何在已有的項目樣例中使用 Minion 來完成異步的業務處理。

首先，先瞭解一下本篇需要涉及的業務用例：

1. 用戶可以進行下單操作，下單時將使用當前購物車中的所有 SKU 形成一個訂單。
2. 下單後將會扣除相關 SKU 的庫存。如果某一 SKU 庫存不足，則下單失敗。
3. 下單操作僅到扣減庫存成功為止，後續步驟不需要本樣例討論範圍。因此，本樣例在成功下單之後會在資料庫中生成一條訂單記錄，表示訂單創建結束。

本篇雖然重點在於 Minion 的使用，不過由於需要使用到一個新的 OrderGrain 物件，因此還是需要使用到前一篇「定義 Claptrap」的相關知識。

Minion 是一種特殊的 Claptrap，它與其 MasterClaptrap 之間的關係如下圖所示：

![Minion](/images/20190228-002.gif)

其主體開發流程和 Claptrap 類似，只是有所刪減。對比如下：

| 步驟                           | Claptrap | Minion |
| ---------------------------- | -------- | ------ |
| 定義 ClaptrapTypeCode          | √        | √      |
| 定義 State                     | √        | √      |
| 定義 Grain 介面                  | √        | √      |
| 實現 Grain                     | √        | √      |
| 註冊 Grain                     | √        | √      |
| 定義 EventCode                 | √        |        |
| 定義 Event                     | √        |        |
| 實現 EventHandler              | √        | √      |
| 註冊 EventHandler              | √        | √      |
| 實現 IInitial StateDataFactory | √        | √      |

這個刪減的原因是由於 Minion 是 Claptrap 的事件消費者，所以事件相關的定義不需要處理。但是其他的部分仍然是必須的。

> 本篇開始，我們將不再羅列相關代碼所在的具體檔位置，希望讀者能夠自行在專案中進行查找，以便熟練的掌握。

## 實現 OrderGrain

基於前一篇"定義 Claptrap"相關的知識，我們此處實現一個 OrderGrain 用來表示訂單下單操作。為節約篇幅，我們只羅列其中關鍵的部分。

### OrderState

訂單狀態的定義如下：

```cs
using System.Collections.Generic;
using Newbe.Claptrap;

namespace HelloClaptrap.Models.Order
{
    public class OrderState : IStateData
    {
        public bool OrderCreated { get; set; }
        public string UserId { get; set; }
        public Dictionary<string, int> Skus { get; set; }
    }
}
```

1. OrderCreated 表示訂單是否已經創建，避免重複創建訂單
2. UserId 下單用戶 Id
3. Skus 訂單包含的 SkuId 和訂單量

### OrderCreatedEvent

訂單建立事件的定義如下：

```cs
using System.Collections.Generic;
using Newbe.Claptrap;

namespace HelloClaptrap.Models.Order.Events
{
    public class OrderCreatedEvent : IEventData
    {
        public string UserId { get; set; }
        public Dictionary<string, int> Skus { get; set; }
    }
}
```

### OrderGrain

```cs
using System.Threading.Tasks;
using HelloClaptrap.Actors.Order.Events;
using HelloClaptrap.IActor;
using HelloClaptrap.Models;
using HelloClaptrap.Models.Order;
using HelloClaptrap.Models.Order.Events;
using Newbe.Claptrap;
using Newbe.Claptrap.Orleans;
using Orleans;

namespace HelloClaptrap.Actors.Order
{
    [ClaptrapEventHandler(typeof(OrderCreatedEventHandler), ClaptrapCodes.OrderCreated)]
    public class OrderGrain : ClaptrapBoxGrain<OrderState>, IOrderGrain
    {
        private readonly IGrainFactory _grainFactory;

        public OrderGrain(IClaptrapGrainCommonService claptrapGrainCommonService,
            IGrainFactory grainFactory)
            : base(claptrapGrainCommonService)
        {
            _grainFactory = grainFactory;
        }

        public async Task CreateOrderAsync(CreateOrderInput input)
        {
            var orderId = Claptrap.State.Identity.Id;
            // throw exception if order already created
            if (StateData.OrderCreated)
            {
                throw new BizException($"order with order id already created : {orderId}");
            }

            // get items from cart
            var cartGrain = _grainFactory.GetGrain<ICartGrain>(input. CartId);
            var items = await cartGrain.GetItemsAsync();

            // update inventory for each sku
            foreach (var (skuId, count) in items)
            {
                var skuGrain = _grainFactory.GetGrain<ISkuGrain>(skuId);
                await skuGrain.UpdateInventoryAsync(-count);
            }

            // remove all items from cart
            await cartGrain.RemoveAllItemsAsync();

            // create a order
            var evt = this. CreateEvent(new OrderCreatedEvent
            {
                UserId = input. UserId,
                Skus = items
            });
            await Claptrap.HandleEventAsync(evt);
        }
    }
}
```

1. OrderGrain 實現訂單的創建核心邏輯，其中的 CreateOrderAsync 方法完成購物車數據獲取，庫存扣減相關的動作。
2. OrderCreatedEvent 執行成功後將會更新 State 中相關的欄位，此處就不再列出了。

## 通過 Minion 向資料庫保存訂單數據

從系列開頭到此，我們從未提及資料庫相關的操作。因為當您在使用 Claptrap 框架時，絕大多數的操作都已經被「事件的寫入」和「狀態的更新」 代替了，故而完全不需要親自編寫資料庫操作。

不過，由於 Claptrap 通常是對應單體物件（一個訂單，一個 SKU，一個購物車）而設計的，因而無法獲取全體（所有訂單，所有 SKU，所有購物車）的數據情況。此時，就需要將狀態數據持久化到另外的持久化結構中（資料庫，檔，緩存等）以便完成全體情況的查詢或其他操作。

在 Claptrap 框架中引入了 Minion 的概念來解決上述的需求。

接下來，我們就在樣例中引入一個 OrderDbGrain （一個 Minion）來異步完成 OrderGrain 的訂單入庫操作。

## 定義 ClaptrapTypeCode

```cs
  namespace HelloClaptrap.Models
  {
      public static class ClaptrapCodes
      {
          #region Cart

          public const string CartGrain = "cart_claptrap_newbe";
          private const string CartEventSuffix = "_e_" + CartGrain;
          public const string AddItemToCart = "addItem" + CartEventSuffix;
          public const string RemoveItemFromCart = "removeItem" + CartEventSuffix;
          public const string RemoveAllItemsFromCart = "remoeAllItems" + CartEventSuffix;

          #endregion

          #region Sku

          public const string SkuGrain = "sku_claptrap_newbe";
          private const string SkuEventSuffix = "_e_" + SkuGrain;
          public const string SkuInventoryUpdate = "inventoryUpdate" + SkuEventSuffix;

          #endregion

          #region Order

          public const string OrderGrain = "order_claptrap_newbe";
          private const string OrderEventSuffix = "_e_" + OrderGrain;
          public const string OrderCreated = "orderCreated" + OrderEventSuffix;

+ public const string OrderDbGrain = "db_order_claptrap_newbe";

          #endregion
      }
  }
```

Minion 是一種特殊的 Claptrap，換言之，它也是一種 Claptrap。而 ClaptrapTypeCode 對於 Claptrap 來說是必需的，因而需要增加此定義。

## 定義 State

由於本樣例只需要向資料庫寫入一條訂單記錄就可以了，並不需要在 State 中任何數據，因此該步驟在本樣例中其實並不需要。

## 定義 Grain 介面

```cs
+ using HelloClaptrap.Models;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.IActor
+ {
+ [ClaptrapMinion(ClaptrapCodes.OrderGrain)]
+ [ClaptrapState(typeof(NoneStateData), ClaptrapCodes.OrderDbGrain)]
+ public interface IOrderDbGrain : IClaptrapMinionGrain
+ {
+ }
+ }
```

1. ClaptrapMinion 用來標記該 Grain 是一個 Minion，其中的 Code 指向其對應的 MasterClaptrap。
2. ClaptrapState 用來標記 Claptrap 的 State 資料類型。前一步，我們闡明該 Minion 並不需要 StateData，因此使用 None StateData 這一框架內置類型來代替。
3. IClaptrapMinionGrain 是區別於 IClaptrapGrain 的 Minion 介面。如果一個 Grain 是 Minion ，則需要繼承該介面。
4. ClaptrapCodes.OrderGrain 和 ClaptrapCodes.OrderDbGrain 是兩個不同的字串，希望讀者不是星際宗師。

> 星際宗師：因為星際爭霸比賽節奏快，資訊量大，選手很容易忽視或誤判部分資訊，因此經常發生"選手看不到發生在眼皮底下的關鍵事件"的搞笑失誤。玩家們由此調侃星際玩家都是瞎子（曾經真的有一場盲人和職業選手的對決），段位越高，瞎得越嚴重，職業星際選手清一色的盲人。

## 實現 Grain

```cs
+ using System.Collections.Generic;
+ using System.Threading.Tasks;
+ using HelloClaptrap.Actors.DbGrains.Order.Events;
+ using HelloClaptrap.IActor;
+ using HelloClaptrap.Models;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.Actors.DbGrains.Order
+ {
+ [ClaptrapEventHandler(typeof(OrderCreatedEventHandler), ClaptrapCodes.OrderCreated)]
+ public class OrderDbGrain : ClaptrapBoxGrain<NoneStateData>, IOrderDbGrain
+ {
+ public OrderDbGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
+ : base(claptrapGrainCommonService)
+ {
+ }
+
+ public async Task MasterEventReceivedAsync(IEnumerable<IEvent> events)
+ {
+ foreach (var @event in events)
+ {
+ await Claptrap.HandleEventAsync(@event);
+ }
+ }
+
+ public Task WakeAsync()
+ {
+ return Task.CompletedTask;
+ }
+ }
+ }
```

1. MasterEventReceivedAsync 是定義自 IClaptrapMinionGrain 的方法，表示即時接收來自 MasterClaptrap 的事件通知。此處暫不展開說明，按照上文範本實現即可。
2. WakeAsync 是定義自 IClaptrapMinionGrain 的方法，表示 MasterClaptrap 主動喚醒 Minion 的操作。此處暫不展開說明，按照上文範本實現即可。
3. 當讀者查看源碼時，會發現該類被單獨定義在一個程式集當中。這隻是一種分類辦法，可以理解為將 Minion 和 MasterClaptrap 分別放置在兩個不同的專案中進行分類。實際上放在一起也沒有問題。

## 註冊 Grain

此處，由於我們將 OrderDbGrain 定義在單獨的程式集，因此，需要額外的註冊這個程式集。如下所示：

```cs
  using System;
  using Autofac;
  using HelloClaptrap.Actors.Cart;
  using HelloClaptrap.Actors.DbGrains.Order;
  using HelloClaptrap.IActor;
  using HelloClaptrap.Repository;
  using Microsoft.AspNetCore.Hosting;
  using Microsoft.Extensions.Hosting;
  using Microsoft.Extensions.Logging;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Bootstrapper;
  using NLog.Web;
  using Orleans;

  namespace HelloClaptrap.BackendServer
  {
      public class Program
      {
          public static void Main(string[] args)
          {
              var logger = NLogBuilder.ConfigureNLog("nlog.config"). GetCurrentClassLogger();
              try
              {
                  logger. Debug("init main");
                  CreateHostBuilder(args). Build(). Run();
              }
              catch (Exception exception)
              {
                  //NLog: catch setup errors
                  logger. Error(exception, "Stopped program because of exception");
                  throw;
              }
              finally
              {
                  // Ensure to flush and stop internal timers/threads before application-exit (Avoid segmentation fault on Linux)
                  NLog.LogManager.Shutdown();
              }
          }

          public static IHostBuilder CreateHostBuilder(string[] args) =>
              Host.CreateDefaultBuilder(args)
                  . ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); })
                  . UseClaptrap(
                      builder =>
                      {
                          builder
                              . ScanClaptrapDesigns(new[]
                              {
                                  typeof(ICartGrain). Assembly,
                                  typeof(CartGrain). Assembly,
+ typeof(OrderDbGrain). Assembly
                              })
                              . ConfigureClaptrapDesign(x =>
                                  x.ClaptrapOptions.EventCenterOptions.EventCenterType = EventCenterType.OrleansClient);
                      },
                      builder => { builder. RegisterModule<RepositoryModule>(); })
                  . UseOrleansClaptrap()
                  . UseOrleans(builder => builder. UseDashboard(options => options. Port = 9000))
                  . ConfigureLogging(logging =>
                  {
                      logging. ClearProviders();
                      logging. SetMinimumLevel(LogLevel.Trace);
                  })
                  . UseNLog();
      }
  }
```

## 實現 EventHandler

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Order.Events;
+ using HelloClaptrap.Repository;
+ using Newbe.Claptrap;
+ using Newtonsoft.Json;
+
+ namespace HelloClaptrap.Actors.DbGrains.Order.Events
+ {
+ public class OrderCreatedEventHandler
+ : NormalEventHandler<NoneStateData, OrderCreatedEvent>
+ {
+ private readonly IOrderRepository _orderRepository;
+
+ public OrderCreatedEventHandler(
+ IOrderRepository orderRepository)
+ {
+ _orderRepository = orderRepository;
+ }
+
+ public override async ValueTask HandleEvent(NoneStateData stateData,
+ OrderCreatedEvent eventData,
+ IEventContext eventContext)
+ {
+ var orderId = eventContext.State.Identity.Id;
+ await _orderRepository.SaveAsync(eventData.UserId, orderId, JsonConvert.SerializeObject(eventData.Skus));
+ }
+ }
+ }
```

1. IOrderRepository 是直接操作存儲層的介面，用於訂單的增刪改查。此處調用該介面實現訂單資料庫的入庫操作。

## 註冊 EventHandler

實際上為了節約篇幅，我們已經在"實現 Grain"章節的代碼中進行註冊。

## 實現 IInitial StateDataFactory

由於 StateData 沒有特殊定義，因此也不需要實現 IInitial StateDataFactory。

## 修改 Controller

樣例中，我們增加了 OrderController 用來下單和查詢訂單。讀者可以在源碼進行查看。

讀者可以使用以下步驟進行實際的效果測試：

1. POST `/api/cart/123` {"skuId"："yueluo-666"，"count"：30} 向 123 號購物車加入 30 單位的 yueluo-666 號濃縮精華。
2. POST `/api/order` {"userId"："999"，"cartId"："123"} 以 999 userId 的身份，從 123 號購物車進行下單。
3. GET `/api/order` 下單成功後可以，通過該 API 查看到下單完成的訂單。
4. GET `/api/sku/yueluo-666` 可以通過 SKU API 查看下單後的庫存餘量。

## 小結

至此，我們就完成了"商品下單"這個需求的基礎內容。通過該樣例可以初步瞭解多個 Claptrap 可以如何合作，以及如何使用 Minion 完成異步任務。

不過，還有一些問題，我們將在後續展開討論。

你可以從以下位址來獲取本文章對應的原始程式碼：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
