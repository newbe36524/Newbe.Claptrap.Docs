---
title: "第三步——定义Claptrap，管理商品库存"
description: "第三步——定义Claptrap，管理商品库存"
---

通过本篇阅读，您便可以开始尝试使用 Claptrap 实现业务了。

<!-- more -->

## 开篇摘要

本篇，我通过实现“管理库存”的需求来了解一下如何在已有的项目样例中定义一个 Claptrap。

结合前一篇的基本步骤，定义 Claptrap 只要而外增加一些步骤就可以了。完整的步骤如下所示，其中标记为“新内容”的部分属于本篇的区别于前篇的新内容：

1. 定义 ClaptrapTypeCode (新内容)
1. 定义 State (新内容)
1. 定义 Grain 接口 (新内容)
1. 实现 Grain (新内容)
1. 注册 Grain (新内容)
1. 定义 EventCode
1. 定义 Event
1. 实现 EventHandler
1. 注册 EventHandler
1. 实现 IInitialStateDataFactory (新内容)
1. 修改 Controller

这是一个从下向上的过程，实际的编码过程中开发也可以有所调整。

本篇实现的业务用例：

1. 实现表示库存数据的 SKU（Stock keeping Unit） 对象。
2. 能够对 SKU 进行更新和读取。

## 定义 ClaptrapTypeCode

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

## 定义 State

State 在 Actor 模式中代表了 Actor 对象当前的数据表现。

由于 Claptrap 是基于事件溯源模式的 Actor。因此定义恰好的 State 非常重要。

在该示例当中，我们只需要记录当前 SKU 的库存即可，因此，State 的设计非常的简单。

Добавьте`папку Sku`в проект HelloClaptrap.Models и создайте класс`SkuState`.

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

## 定义 Grain 接口

定义 Grain 接口的定义，才能够提供外部与 Claptrap 的互操作性。

Добавьте`интерфейс ISkuGrain в`HelloClaptrap.IActors`HelloClaptrap.`IActors.

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

1. 标记了`ClaptrapState`，使得 State 与 Grain 进行关联。
2. 接口继承了`IClaptrapGrain`，这是框架定义的 Grain 接口，这是依托于 Orleans 运行必须继承的接口。
3. 增加了 GetInventoryAsync 方法，表示“获取当前库存”。
4. 增加了 UpdateInventoryAsync 方法，表示“增量更新当前库存”。`diff > 0` 表示增加库存，`diff < 0`表示减少库存。
5. 需要注意的是 Grain 的方法定义有一定限制。详细可以参见[《Developing a Grain》](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## 实现 Grain

定义好 ISkuGrain 之后，便可以添加代码进行实现。

Созда`йте новую папку Sku`в проекте HelloClaptrap.Actors и добавьте в эту папку класс`SkuGrain`.

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

1. 继承`ClaptrapBoxGrain<SkuState>`并实现`ISkuGrain`，`ClaptrapBoxGrain`是框架定义的 Grain 基类，其中的泛型参数表示对应的 State 类型。
2. 实现 GetInventoryAsync 方法，从 StateData 中读取当前的库存。
3. 实现 UpdateInventoryAsync 方法，添加业务判断代码，若不满足业务操作的条件则抛出异常。
4. UpdateInventoryAsync 的最后我们现在抛出 NotImplementedException ，因为当前事件还没有定义，需要等待后续的代码实现。
5. BizException 是一个自定义异常，可以自行添加。实际开发中也可以不使用抛出异常的方式表示业务中断，改用状态码或者其他返回值也是可以的。

## 注册 Grain

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

## 定义 EventCode

前面我们已经实现了 Claptrap 的主要部分，但唯独没有完成更新库存的操作。这是因为更新库存是需要对 State 进行更新的。而我们都知道 Claptrap 是基于事件溯源的 Actor 模式，对 State 的更新需要通过事件才能完成。故而由这里开始，我们来通过事件更新库存。

EventCode 是 Claptrap 系统每个事件的唯一编码。其在事件的识别，序列化等方面起到了重要的作用。

Откройте`класс ClaptrapCodes в`HelloClaptrap.Models`HelloClaptrap.`models.

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

## 定义 Event

Event 是事件溯源的关键。用于改变 Claptrap 中的 State。并且 Event 会被持久化在持久层。

Создайте класс`InventoryUpdateEvent` в папке`Sku/Events проекта HelloClaptrap.Models`.

添加如下代码：

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Sku.Events
+ {
+     public class InventoryUpdateEvent : IEventData
+     {
+         public int Diff { get; set; }
+         public int NewInventory { get; set; }
+     }
+ }
```

1. Diff 表示此次更新库存的数额，`diff > 0` 表示增加库存，`diff < 0`表示减少库存。
2. NewInventory 表示更新之后的库存。此处，提前给出一个建议，但由于篇幅问题，不展开讨论：建议在事件中包含 State 的更新后数据。

## 实现 EventHandler

EventHandler 用于将事件更新到 Claptrap 的 State 上。

Создайте`класс Inventory Update EvenentHandler в папке  Sku/Events`проекта HelloClaptrap.Actors  .

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

1. 因为事件中已经包含了更新后的库存，故而直接对 StateData 进行赋值即可。

## 注册 EventHandler

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

## 实现 IInitialStateDataFactory

前面我们已经完成了库存的查询和更新。不过通常来说库存有一个初始数额，我们本节在补充这部分逻辑。

在 HelloClaptrap.Actors 项目的 Sku 文件夹下创建 SkuStateInitHandler 类。

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Repository;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Sku
+ {
+     public class SkuStateInitHandler : IInitialStateDataFactory
+     {
+         private readonly ISkuRepository _skuRepository;
+
+         public SkuStateInitHandler(
+             ISkuRepository skuRepository)
+         {
+             _skuRepository = skuRepository;
+         }
+
+         public async Task<IStateData> Create(IClaptrapIdentity identity)
+         {
+             var skuId = identity.Id;
+             var inventory = await _skuRepository.GetInitInventoryAsync(skuId);
+             var re = new SkuState
+             {
+                 Inventory = inventory
+             };
+             return re;
+         }
+     }
+ }
```

1. `IInitialStateDataFactory`会在 Claptrap 初次激活时被调用，用来创建 State 的初始值。
2. 注入`ISkuRepository`从数据库中读取 Sku 对应的库存初始数额，具体的代码此处不进行罗列，读者可以查看样例仓库中的实现。

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

## 修改 Controller

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

1. 新增 API 读取特定 SkuId 的库存。按照样例代码的实现，可以传入`yueluo-123`得到库存数额为 666。不存在的 SkuId 将会抛出异常。
1. 此处没有创建更新库存的对外 API，因为本示例将在下篇进行下单购物时进行库存操作，此处暂不需要 API。

## 小结

至此，我们就完成了“管理商品库存”这个简单需求的所有内容。

您可以从以下地址来获取本文章对应的源代码：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
