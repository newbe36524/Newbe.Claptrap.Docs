---
title: "第三步——定義Claptrap，管理商品庫存"
description: "第三步——定義Claptrap，管理商品庫存"
---

通過本篇閱讀，您便可以開始嘗試使用 Claptrap 實現業務了。

<!-- more -->

## 開篇摘要

本篇，我通過實現"管理庫存"的需求來瞭解一下如何在已有的項目樣例中定義一個 Claptrap。

結合前一篇的基本步驟，定義 Claptrap 只要而外增加一些步驟就可以了。完整的步驟如下所示，其中標記為「新內容」的部分屬於本篇的區別於前篇的新內容：

1. 定義 ClaptrapTypeCode （新內容）
1. 定義 State （新內容）
1. 定義 Grain 介面 （新內容）
1. 實現 Grain （新內容）
1. 註冊 Grain （新內容）
1. 定義 EventCode
1. 定義 Event
1. 實現 EventHandler
1. 註冊 EventHandler
1. 實作 IInitialStateDataFactory （新內容）
1. 修改 Controller

這是一個從下向上的過程，實際的編碼過程中開發也可以有所調整。

本篇實現的業務用例：

1. 實現表示庫存資料的 SKU（Stock keeping Unit） 物件。
2. 能夠對 SKU 進行更新和讀取。

## 定義 ClaptrapTypeCode

ClaptrapTypeCode 是一個 Claptrap 的唯一編碼。其在 State 的識別，序列化等方面起到了重要的作用。

打開`HelloClaptrap.Models`專案中的`ClaptrapCodes`類。

添加 SKU 的 ClaptrapTypeCode。

```cs
  namespace HelloClaptrap.Models
  {
      public static class ClaptrapCodes
      {
          public const string CartGrain = "cart_claptrap_newbe";
          private const string CartEventSuffix = "_e_" + CartGrain;
          public const string AddItemToCart = "addItem" + CartEventSuffix;
          public const string RemoveItemFromCart = "removeItem" + CartEventSuffix;

          #region Sku

+ public const string SkuGrain = "sku_claptrap_newbe";
+ private const string SkuEventSuffix = "_e_" + SkuGrain;

          #endregion
      }
  }
```

## 定義 State

State 在 Actor 模式中代表了 Actor 物件當前的數據表現。

由於 Claptrap 是基於事件溯源模式的 Actor。因此定義恰好的 State 非常重要。

在該示例當中，我們只需要記錄當前 SKU 的庫存即可，因此，State 的設計非常的簡單。

在`HelloClaptrap.Models`專案添加`Sku`資料夾，並在該資料夾下創建`SkuState`類。

添加如下代碼：

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Sku
+ {
+ public class SkuState : IStateData
+ {
+ public int Inventory { get; set; }
+ }
+ }
```

Inventory 表示當前 SKU 的庫存。

`IStateData`介面是框架中表示 State 的空介面，用於在泛型推斷時使用。

## 定義 Grain 介面

定義 Grain 介面的定義，才能夠提供外部與 Claptrap 的互通性。

在`HelloClaptrap.IActors`專案中添加`ISkuGrain`介面。

添加介面以及 Attribute。

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models;
+ using HelloClaptrap.Models.Sku;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.IActor
+ {
+ [ClaptrapState(typeof(SkuState), ClaptrapCodes.SkuGrain)]
+ public interface ISkuGrain : IClaptrapGrain
+ {
+ /// <summary>
+ /// Get latest inventory of this sku
+ /// </summary>
+ /// <returns></returns>
+         Task<int> GetInventoryAsync();
+
+ /// <summary>
+ /// Update inventory by add diff, diff could be negative number
+ /// </summary>
+ /// <param name="diff"></param>
+ /// <returns>Inventory after updating</returns>
+ Task<int> UpdateInventoryAsync(int diff);
+ }
+ }
```

其中增加了以下內容：

1. 標記了`ClaptrapState`，使得 State 與 Grain 進行關聯。
2. 介面繼承了`IClaptrapGrain`，這是框架定義的 Grain 介面，這是依託於 Orleans 運行必須繼承的介面。
3. 增加了 GetInventoryAsync 方法，表示「獲取當前庫存」。
4. 增加了 UpdateInventoryAsync 方法，表示"增量更新當前庫存"。`diff > 0` 表示增加庫存，`diff < 0`表示減少庫存。
5. 需要注意的是 Grain 的方法定義有一定限制。詳細可以參見[《Developing a Grain》](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## 實現 Grain

定義好 ISkuGrain 之後，便可以添加代碼進行實現。

在`HelloClaptrap.Actors`專案新建`Sku`資料夾，並在該資料夾中添加`SkuGrain`類。

```cs
+ using System;
+ using System.Threading.Tasks;
+ using HelloClaptrap.IActor;
+ using HelloClaptrap.Models;
+ using HelloClaptrap.Models.Sku;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.Actors.Sku
+ {
+     public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
+     {
+         public SkuGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
+             : base(claptrapGrainCommonService)
+         {
+         }
+
+         public Task<int> GetInventoryAsync()
+         {
+             return Task.FromResult(StateData.Inventory);
+         }
+
+         public async Task<int> UpdateInventoryAsync(int diff)
+         {
+             if (diff == 0)
+             {
+                 throw new BizException("diff can`t be 0");
+             }
+
+             var old = StateData.Inventory;
+             var newInventory = old + diff;
+             if (newInventory < 0)
+             {
+                 throw new BizException(
+                     $"failed to update inventory. It will be less than 0 if add diff amount. current : {old} , diff : {diff}");
+             }
+
+             throw new NotImplementedException();
+         }
+     }
+ }
```

其中增加了以下內容：

1. 繼承`ClaptrapBoxGrain<SkuState>`並實現`ISkuGrain`，`ClaptrapBoxGrain`是框架定義的 Grain 基類，其中的泛型參數表示對應的 State 類型。
2. 實現 GetInventoryAsync 方法，從 StateData 中讀取當前的庫存。
3. 實現 UpdateInventoryAsync 方法，添加業務判斷代碼，若不滿足業務操作的條件則拋出異常。
4. UpdateInventoryAsync 的最後我們現在拋出 NotImplementedException ，因為當前事件還沒有定義，需要等待後續的代碼實現。
5. BizException 是一個自定義異常，可以自行添加。實際開發中也可以不使用拋出異常的方式表示業務中斷，改用狀態碼或者其他返回值也是可以的。

## 註冊 Grain

Claptrap 對應的 Grain 需要在應用程式啟動時進行註冊，這樣框架才能掃描發現。

由於示例代碼採用的是程式集範圍內掃描，因此實際上不需要進行修改。

這裡指出發生註冊的位置：

打開`HelloClaptrap.BackendServer`專案的`Program`類。

```cs
  using System;
  using Autofac;
  using HelloClaptrap.Actors.Cart;
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

          public static IHostBuilder CreateHostBuilder(string[] args) =>
              Host.CreateDefaultBuilder(args)
                  . ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); })
                  . UseClaptrap(
                      builder =>
                      {
+ builder
+ . ScanClaptrapDesigns(new[]
+ {
+ typeof(ICartGrain). Assembly,
+ typeof(CartGrain). Assembly,
+ });
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

因為ISkuGrain和SkuGrain分別於ICartGrain和CartGrain屬於同一程式集，因而此處不需要修改。

## 定義 EventCode

前面我們已經實現了 Claptrap 的主要部分，但唯獨沒有完成更新庫存的操作。這是因為更新庫存是需要對 State 進行更新的。而我們都知道 Claptrap 是基於事件溯源的 Actor 模式，對 State 的更新需要通過事件才能完成。故而由這裡開始，我們來通過事件更新庫存。

EventCode 是 Claptrap 系統每個事件的唯一編碼。其在事件的識別，序列化等方面起到了重要的作用。

打開`HelloClaptrap.Models`專案中的`ClaptrapCodes`類。

添加「更新庫存」的 EventCode。

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
+ public const string SkuInventoryUpdate = "inventoryUpdate" + SkuEventSuffix;

          #endregion
      }
  }
```

## 定義 Event

Event 是事件溯源的關鍵。用於改變 Claptrap 中的 State。並且 Event 會被持久化在持久層。

在`HelloClaptrap.Models`專案的`Sku/Events`資料夾下創建`InventoryUpdateEvent`類。

添加如下代碼：

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Sku.Events
+ {
+ public class InventoryUpdateEvent : IEventData
+ {
+ public int Diff { get; set; }
+ public int NewInventory { get; set; }
+ }
+ }
```

1. Diff 表示此次更新庫存的數額，`diff > 0` 表示增加庫存，`diff < 0`表示減少庫存。
2. NewInventory 表示更新之後的庫存。此處，提前給出一個建議，但由於篇幅問題，不展開討論：建議在事件中包含 State 的更新後數據。

## 實現 EventHandler

EventHandler 用于将事件更新到 Claptrap 的 State 上。

在`HelloClaptrap.Actors`專案的`Sku/Events`資料夾下創建`InventoryUpdateEventHandler`類。

添加如下代碼：

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Models.Sku.Events;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Sku.Events
+ {
+ public class InventoryUpdateEventHandler
+ : NormalEventHandler<SkuState, InventoryUpdateEvent>
+ {
+ public override ValueTask HandleEvent(SkuState stateData,
+ InventoryUpdateEvent eventData,
+ IEventContext eventContext)
+ {
+ stateData.Inventory = eventData.NewInventory;
+ return new ValueTask();
+ }
+ }
+ }
```

1. 因為事件中已經包含了更新后的庫存，故而直接對 StateData 進行賦值即可。

## 註冊 EventHandler

實現並測試完 EventHandler 之後，便可以將 EventHandler 進行註冊，以便與 EventCode 以及 Claptrap 進行關聯。

打開`HelloClaptrap.Actors`專案的`SkuGrain`類。

使用 Attribute 進行標記，並修改 UpdateInventory Async 執行事件。

```cs
  using System.Threading.Tasks;
+ using HelloClaptrap.Actors.Sku.Events;
  using HelloClaptrap.IActor;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Models.Sku.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Sku
  {
+ [ClaptrapEventHandler(typeof(InventoryUpdateEventHandler), ClaptrapCodes.SkuInventoryUpdate)]
      public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      {
          public SkuGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
              : base( claptrapGrainCommonService)
          {
          }

          public Task<int> GetInventoryAsync()
          {
              return Task.FromResult(StateData.Inventory);
          }

          public async Task<int> UpdateInventoryAsync(int diff)
          {
              if (diff == 0)
              {
                  throw new BizException("diff can`t be 0");
              }

              var old = StateData.Inventory;
              var newInventory = old + diff;
              if (newInventory < 0)
              {
                  throw new BizException(
                      $"failed to update inventory. It will be less than 0 if add diff amount. current : {old} , diff : {diff}");
              }

- throw new NotImplementedException();
+ var evt = this. CreateEvent(new InventoryUpdateEvent
+ {
+ Diff = diff,
+ NewInventory = newInventory
+ });
+ await Claptrap.HandleEventAsync(evt);
+ return StateData.Inventory;
          }
      }
  }
```

## 實現 IInitial StateDataFactory

前面我們已經完成了庫存的查詢和更新。不過通常來說庫存有一個初始數額，我們本節在補充這部分邏輯。

在 HelloClaptrap.Actors 项目的 Sku 文件夹下创建 SkuStateInitHandler 类。

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Repository;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Sku
+ {
+ public class SkuStateInitHandler : IInitialStateDataFactory
+ {
+ private readonly ISkuRepository _skuRepository;
+
+ public SkuStateInitHandler(
+ ISkuRepository skuRepository)
+ {
+ _skuRepository = skuRepository;
+ }
+
+ public async Task<IStateData> Create(IClaptrapIdentity identity)
+ {
+ var skuId = identity. Id;
+ var inventory = await _skuRepository.GetInitInventoryAsync(skuId);
+ var re = new SkuState
+ {
+ Inventory = inventory
+ };
+ return re;
+ }
+ }
+ }
```

1. `IInitialStateDataFactory`會在 Claptrap 初次啟動時被調用，用來創建 State 的初始值。
2. 注入`ISkuRepository`從資料庫中讀取 Sku 對應的庫存初始數額，具體的代碼此處不進行羅列，讀者可以查看樣例倉庫中的實現。

除了實現代碼之外，還需要進行註冊才會被調用。

打開`HelloClaptrap.Actors`專案的`SkuGrain`類。

```cs
  using System.Threading.Tasks;
  using HelloClaptrap.Actors.Sku.Events;
  using HelloClaptrap.IActor;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Sku;
  using HelloClaptrap.Models.Sku.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Sku
  {
+ [ClaptrapStateInitialFactoryHandler(typeof(SkuStateInitHandler))]
      [ClaptrapEventHandler(typeof(InventoryUpdateEventHandler), ClaptrapCodes.SkuInventoryUpdate)]
      public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      {
          public SkuGrain( IClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

          public Task<int> GetInventoryAsync()
          {
              return Task.FromResult(StateData.Inventory);
          }

          public async Task<int> UpdateInventoryAsync(int diff)
          {
              if (diff == 0)
              {
                  throw new BizException("diff can`t be 0");
              }

              var old = StateData.Inventory;
              var newInventory = old + diff;
              if (newInventory < 0)
              {
                  throw new BizException(
                      $"failed to update inventory. It will be less than 0 if add diff amount. current : {old} , diff : {diff}");
              }

              var evt = this. CreateEvent(new InventoryUpdateEvent
              {
                  Diff = diff,
                  NewInventory = newInventory
              });
              await Claptrap.HandleEventAsync(evt);
              return StateData.Inventory;
          }
      }
  }
```

## 修改 Controller

前面的所有步驟完成之後，就已經完成了 Claptrap 的所有部分。但由於 Claptrap 無法直接提供與外部程式的互通性。因此，還需要在在 Controller 層增加一個 API 以便外部進行「讀取庫存」 的操作。

在`HelloClaptrap.Web`專案的`Controllers`資料夾下新建`SkuController`類。

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.IActor;
+ using Microsoft.AspNetCore.Mvc;
+ using Orleans;
+
+ namespace HelloClaptrap.Web.Controllers
+ {
+ [Route("api/[controller]")]
+ public class SkuController : Controller
+ {
+ private readonly IGrainFactory _grainFactory;
+
+ public SkuController(
+ IGrainFactory grainFactory)
+ {
+ _grainFactory = grainFactory;
+ }
+
+ [HttpGet("{id}")]
+ public async Task<IActionResult> GetItemsAsync(string id)
+ {
+ var skuGrain = _grainFactory.GetGrain<ISkuGrain>(id);
+ var inventory = await skuGrain.GetInventoryAsync();
+ return Json(new
+ {
+ skuId = id,
+ inventory = inventory,
+ });
+ }
+ }
+ }
```

1. 新增 API 讀取特定 SkuId 的庫存。按照樣例代碼的實現，可以傳入`yueluo-123`得到庫存數額為 666。不存在的 SkuId 將會拋出異常。
1. 此處沒有創建更新庫存的對外 API，因為本示例將在下篇進行下單購物時進行庫存操作，此處暫不需要 API。

## 小結

至此，我們就完成了"管理商品庫存"這個簡單需求的所有內容。

你可以從以下位址來獲取本文章對應的原始程式碼：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
