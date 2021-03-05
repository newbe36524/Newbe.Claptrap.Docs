---
title: "Step 3 - Define Claptrap and manage inventory of goods."
description: "Step 3 - Define Claptrap and manage inventory of goods."
---

With this reading, you're ready to try using Claptrap to implement your business.

<!-- more -->

:::caution 该文档仅适用于 0.7 及以下版本，若想要查看最新版本内容，请点击右上角进行切换。 :::

## Summary

本篇，我通过实现“管理库存”的需求来了解一下如何在已有的项目样例中定义一个 Claptrap。

结合前一篇的基本步骤，定义 Claptrap 只要而外增加一些步骤就可以了。完整的步骤如下所示，其中标记为“新内容”的部分属于本篇的区别于前篇的新内容：

1. Define ClaptrapTypeCode (new)
1. Define State (new)
1. Define Grain interface (new)
1. Implement Grain (new)
1. Sign up for Grain (new)
1. Define EventCode.
1. Define Event.
1. Implement EventHandler.
1. Sign up for EventHandler.
1. Implement the IInitialStateDataFactory (new)
1. Modify the Controller.

这是一个从下向上的过程，实际的编码过程中开发也可以有所调整。

本篇实现的业务用例：

1. Implement SKU (Stocking Unit) objects that represent stock data.
2. Can update and read SKUs.

## Define ClaptrapTypeCode

ClaptrapTypeCode 是一个 Claptrap 的唯一编码。其在 State 的识别，序列化等方面起到了重要的作用。

打开`HelloClaptrap.Models`项目中的`ClaptrapCodes`类。

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

+         public const string SkuGrain = "sku_claptrap_newbe";
+         private const string SkuEventSuffix = "_e_" + SkuGrain;

          #endregion
      }
  }
```

## Definition of State

State 在 Actor 模式中代表了 Actor 对象当前的数据表现。

由于 Claptrap 是基于事件溯源模式的 Actor。因此定义恰好的 State 非常重要。

在该示例当中，我们只需要记录当前 SKU 的库存即可，因此，State 的设计非常的简单。

在 HelloClaptrap.Models 项目添加 Sku 文件夹，并在该文件夹下创建 SkuState 类。

添加如下代码：

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Sku
+ {
+     public class SkuState : IStateData
+     {
+         public int Inventory { get; set; }
+     }
+ }
```

Inventory 表示当前 SKU 的库存。

`IStateData`接口是框架中表示 State 的空接口，用于在泛型推断时使用。

## Define Grain interface

定义 Grain 接口的定义，才能够提供外部与 Claptrap 的互操作性。

在 HelloClaptrap.IActors 项目中添加 ISkuGrain 接口。

添加接口以及 Attribute。

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models;
+ using HelloClaptrap.Models.Sku;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.IActor
+ {
+     [ClaptrapState(typeof(SkuState), ClaptrapCodes.SkuGrain)]
+     public interface ISkuGrain : IClaptrapGrain
+     {
+         /// <summary>
+         /// Get latest inventory of this sku
+         /// </summary>
+         /// <returns></returns>
+         Task<int> GetInventoryAsync();
+
+         /// <summary>
+         /// Update inventory by add diff, diff could be negative number
+         /// </summary>
+         /// <param name="diff"></param>
+         /// <returns>Inventory after updating</returns>
+         Task<int> UpdateInventoryAsync(int diff);
+     }
+ }
```

其中增加了以下内容：

1. `ClapState`has been marked to associate State with Grain.
2. The interface inherited`IClaptrapGrain`, a framework defined by Grain interface, which is the one that Orleans must inherit.
3. The GetInventoryAsync method has been added to mean "Get current inventory".
4. An UpdateInventoryAsync method has been added for "Update current inventory".`diff &gt; <code>` indicates stock increase,`diff < 0`indicates stock reduction.
5. It is important to note that grain's method definition has certain limitations.Details can be found.[Developing a Grain](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## Implement grain.

定义好 ISkuGrain 之后，便可以添加代码进行实现。

在 HelloClaptrap.Actors 项目新建 Sku 文件夹，并在该文件夹中添加 SkuGrain 类。

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

其中增加了以下内容：

1. Inherit`ClaptrapBoxGrain<SkuState>`and implements`ISkuGrain`,`ClaptrapBoxGrain`is the frame defined Grain base class in which generic parameters represent the corresponding State type.
2. Implement the GetInventoryAsync method, read current stock from StateData.
3. Implement the UpdateInventoryAsync method, add business judgement code and throw an exception if the conditions of the operation are not met.
4. UpdateInventoryAsync ends with NotImplementated Exception, because the current event is not defined and needs to wait for the next code to be implemented.
5. BizException is a custom exception that can be added yourself.It is also possible to use a method for actual development without a drop exception to indicate business interruption, or to change the status code or other return value.

## Sign up for Grain

Claptrap 对应的 Grain 需要在应用程序启动时进行注册，这样框架才能扫描发现。

由于示例代码采用的是程序集范围内扫描，因此实际上不需要进行修改。

这里指出发生注册的位置：

打开`HelloClaptrap.BackendServer`项目的`Program`类。

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
                  .ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); })
                  .UseClaptrap(
                      builder =>
                      {
+                         builder
+                             .ScanClaptrapDesigns(new[]
+                             {
+                                 typeof(ICartGrain).Assembly,
+                                 typeof(CartGrain).Assembly,
+                             });
                      },
                      builder => { builder.RegisterModule<RepositoryModule>(); })
                  .UseOrleansClaptrap()
                  .UseOrleans(builder => builder.UseDashboard(options => options.Port = 9000))
                  .ConfigureLogging(logging =>
                  {
                      logging.ClearProviders();
                      logging.SetMinimumLevel(LogLevel.Trace);
                  })
                  .UseNLog();
      }
  }
```

因为 ISkuGrain 和 SkuGrain 分别于 ICartGrain 和 CartGrain 属于同一程序集，因而此处不需要修改。

## Define EventCode.

前面我们已经实现了 Claptrap 的主要部分，但唯独没有完成更新库存的操作。这是因为更新库存是需要对 State 进行更新的。而我们都知道 Claptrap 是基于事件溯源的 Actor 模式，对 State 的更新需要通过事件才能完成。故而由这里开始，我们来通过事件更新库存。

EventCode 是 Claptrap 系统每个事件的唯一编码。其在事件的识别，序列化等方面起到了重要的作用。

打开 HelloClaptrap.Models 项目中的 ClaptrapCodes 类。

添加“更新库存”的 EventCode。

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
+         public const string SkuInventoryUpdate = "inventoryUpdate" + SkuEventSuffix;

          #endregion
      }
  }
```

## Define Event.

Event 是事件溯源的关键。用于改变 Claptrap 中的 State。并且 Event 会被持久化在持久层。

在 HelloClaptrap.Models 项目的 Sku/Events 文件夹下创建 InventoryUpdateEvent 类。

添加如下代码：

```cs
+ using Newbe.Claptrap;
+
+ namespace Hello Claptrap.Models.Sku. vents
+ File
+ public class InventoryUpdateEvent : IIEventData
+ online
+ public int Diff LOget; set; }
+ public int NewInventories but it is also available on the web site; set; }
+ }
+ }
```

1. Diff indicates the amount of this stock updated,`diff >` indicates stock increase,`diff < 0`means stock reduction.
2. The New Inventory indicates an updated inventory.Here a suggestion is given in advance, but due to space problems, there is no discussion：suggesting that State updated data be included in the event.

## Implement EventHandler.

EventHandler 用于将事件更新到 Claptrap 的 State 上。

在 HelloClaptrap.Actors 项目的 Sku/Events 文件夹下创建 InventoryUpdateEventHandler 类。

添加如下代码：

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Models.Sku.Events;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Sku.Events
+ {
+     public class InventoryUpdateEventHandler
+         : NormalEventHandler<SkuState, InventoryUpdateEvent>
+     {
+         public override ValueTask HandleEvent(SkuState stateData,
+             InventoryUpdateEvent eventData,
+             IEventContext eventContext)
+         {
+             stateData.Inventory = eventData.NewInventory;
+             return new ValueTask();
+         }
+     }
+ }
```

1. Since the event already contains updated inventories, it is sufficient to assign the StateData directly.

## Register EventHandler

实现并测试完 EventHandler 之后，便可以将 EventHandler 进行注册，以便与 EventCode 以及 Claptrap 进行关联。

打开`HelloClaptrap.Actors`项目的`SkuGrain`类。

使用 Attribute 进行标记，并修改 UpdateInventoryAsync 执行事件。

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
+     [ClaptrapEventHandler(typeof(InventoryUpdateEventHandler), ClaptrapCodes.SkuInventoryUpdate)]
      public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      {
          public SkuGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
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

-             throw new NotImplementedException();
+             var evt = this.CreateEvent(new InventoryUpdateEvent
+             {
+                 Diff = diff,
+                 NewInventory = newInventory
+             });
+             await Claptrap.HandleEventAsync(evt);
+             return StateData.Inventory;
          }
      }
  }
```

## Implementing the IInitialStateDataFactory

前面我们已经完成了库存的查询和更新。不过通常来说库存有一个初始数额，我们本节在补充这部分逻辑。

在 HelloClaptrap.Actors 项目的 Sku 文件夹下创建 SkuStateInitHandler 类。

```cs
+ using Systems. Threading.Tasks;
+ using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Repository;
+ using Newbe.Clapptrap;
+
+ namespace Claptrap.Actors. ku
+ online
+ public class SkuStateInitHandler: IInitialStateDataFactory
+ online
+ private readonly ISkuRepository _skuRepository; 
 +
+
+ public SkuStateInitHandler(
+ ISkuRepository sku Repository)
+ 56
+ _skuRepository = skuRepository;
+ }
+
+ public async Task<IStateData> Create(IClaptrapIdentity identity)
+ 56
+ var skuId = identity. d;
+ var inventory = await _sku Repository. etInitInventoryAsync (SkuId);
+ var re = new SkuState
+ {
+ Inventory = inventory
+ };
+ return re;
+ }
+ }
+ }
```

1. `IInitialStateDataFactory`will be called when Claptrap is first activated to create State initials.
2. Injecting`ISkuRepository`to read the initial amount of Sku inventory from the database, specific code is not listed here, and reader can view the implementation in sample repository.

除了实现代码之外，还需要进行注册才会被调用。

打开`HelloClaptrap.Actors`项目的`SkuGrain`类。

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
+     [ClaptrapStateInitialFactoryHandler(typeof(SkuStateInitHandler))]
      [ClaptrapEventHandler(typeof(InventoryUpdateEventHandler), ClaptrapCodes.SkuInventoryUpdate)]
      public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      {
          public SkuGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
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

              var evt = this.CreateEvent(new InventoryUpdateEvent
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

## Modify the Controller.

前面的所有步骤完成之后，就已经完成了 Claptrap 的所有部分。但由于 Claptrap 无法直接提供与外部程序的互操作性。因此，还需要在在 Controller 层增加一个 API 以便外部进行“读取库存”的操作。

在 HelloClaptrap.Web 项目的 Controllers 文件夹下新建 SkuController 类。

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.IActor;
+ using Microsoft.AspNetCore.Mvc;
+ using Orleans;
+
+ namespace HelloClaptrap.Web.Controllers
+ {
+     [Route("api/[controller]")]
+     public class SkuController : Controller
+     {
+         private readonly IGrainFactory _grainFactory;
+
+         public SkuController(
+             IGrainFactory grainFactory)
+         {
+             _grainFactory = grainFactory;
+         }
+
+         [HttpGet("{id}")]
+         public async Task<IActionResult> GetItemsAsync(string id)
+         {
+             var skuGrain = _grainFactory.GetGrain<ISkuGrain>(id);
+             var inventory = await skuGrain.GetInventoryAsync();
+             return Json(new
+             {
+                 skuId = id,
+                 inventory = inventory,
+             });
+         }
+     }
+ }
```

1. Add an API to read stock specific to SkuId.By implementing the sample code, you can pass`yueluo-123`to receive stock amount of 666.The unexpected SkuId will throw an exception.
1. There are no outgoing API created here because this example will perform stock operations on next order shopping, which is not required here.

## Summary

至此，我们就完成了“管理商品库存”这个简单需求的所有内容。

您可以从以下地址来获取本文章对应的源代码：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
