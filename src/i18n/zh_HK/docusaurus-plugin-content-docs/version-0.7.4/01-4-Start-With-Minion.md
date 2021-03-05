---
title: '第四步——利用Minion，商品下单'
description: '第四步——利用Minion，商品下单'
---

通過本篇閱讀，您便可以開始嘗試使用 Claptrap 實現業務了。

<!-- more -->

:::caution 该文档仅适用于 0.7 及以下版本，若想要查看最新版本内容，请点击右上角进行切换。 :::

## 開篇摘要

本篇，我通过实现“商品下单”的需求来了解一下如何在已有的项目样例中使用 Minion 来完成异步的业务处理。

首先，先了解一下本篇需要涉及的业务用例：

1. 用户可以进行下单操作，下单时将使用当前购物车中的所有 SKU 形成一个订单。
2. 下单后将会扣除相关 SKU 的库存。如果某一 SKU 库存不足，则下单失败。
3. 下单操作仅到扣减库存成功为止，后续步骤不需要本样例讨论范围。因此，本样例在成功下单之后会在数据库中生成一条订单记录，表示订单创建结束。

本篇虽然重点在于 Minion 的使用，不过由于需要使用到一个新的 OrderGrain 对象，因此还是需要使用到前一篇“定义 Claptrap”的相关知识。

Minion 是一种特殊的 Claptrap，它与其 MasterClaptrap 之间的关系如下图所示：

![Minion](/images/20190228-002.gif)

其主体开发流程和 Claptrap 类似，只是有所删减。对比如下：

| 步骤                          | Claptrap | Minion |
| --------------------------- | -------- | ------ |
| 定义 ClaptrapTypeCode         | √        | √      |
| 定义 State                    | √        | √      |
| 定义 Grain 接口                 | √        | √      |
| 實現 Grain                    | √        | √      |
| 注册 Grain                    | √        | √      |
| 定義 EventCode                | √        |        |
| 定義 Event                    | √        |        |
| 實現 EventHandler             | √        | √      |
| 註冊 EventHandler             | √        | √      |
| 实现 IInitialStateDataFactory | √        | √      |

这个删减的原因是由于 Minion 是 Claptrap 的事件消费者，所以事件相关的定义不需要处理。但是其他的部分仍然是必须的。

> 本篇开始，我们将不再罗列相关代码所在的具体文件位置，希望读者能够自行在项目中进行查找，以便熟练的掌握。

## 实现 OrderGrain

基于前一篇“定义 Claptrap”相关的知识，我们此处实现一个 OrderGrain 用来表示订单下单操作。为节约篇幅，我们只罗列其中关键的部分。

### OrderState

订单状态的定义如下：

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

1. OrderCreated 表示订单是否已经创建，避免重复创建订单
2. UserId 下单用户 Id
3. Skus 订单包含的 SkuId 和订单量

### OrderCreatedEvent

订单创建事件的定义如下：

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
            var cartGrain = _grainFactory.GetGrain<ICartGrain>(input.CartId);
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
            var evt = this.CreateEvent(new OrderCreatedEvent
            {
                UserId = input.UserId,
                Skus = items
            });
            await Claptrap.HandleEventAsync(evt);
        }
    }
}
```

1. OrderGrain 实现订单的创建核心逻辑，其中的 CreateOrderAsync 方法完成购物车数据获取，库存扣减相关的动作。
2. OrderCreatedEvent 执行成功后将会更新 State 中相关的字段，此处就不再列出了。

## 通过 Minion 向数据库保存订单数据

从系列开头到此，我们从未提及数据库相关的操作。因为当您在使用 Claptrap 框架时，绝大多数的操作都已经被“事件的写入”和“状态的更新”代替了，故而完全不需要亲自编写数据库操作。

不过，由于 Claptrap 通常是对应单体对象（一个订单，一个 SKU，一个购物车）而设计的，因而无法获取全体（所有订单，所有 SKU，所有购物车）的数据情况。此时，就需要将状态数据持久化到另外的持久化结构中（数据库，文件，缓存等）以便完成全体情况的查询或其他操作。

在 Claptrap 框架中引入了 Minion 的概念来解决上述的需求。

接下来，我们就在样例中引入一个 OrderDbGrain （一个 Minion）来异步完成 OrderGrain 的订单入库操作。

## 定义 ClaptrapTypeCode

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

+         public const string OrderDbGrain = "db_order_claptrap_newbe";

          #endregion
      }
  }
```

Minion 是一种特殊的 Claptrap，换言之，它也是一种 Claptrap。而 ClaptrapTypeCode 对于 Claptrap 来说是必需的，因而需要增加此定义。

## 定义 State

由于本样例只需要向数据库写入一条订单记录就可以了，并不需要在 State 中任何数据，因此该步骤在本样例中其实并不需要。

## 定义 Grain 接口

```cs
+ using HelloClaptrap.Models;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.IActor
+ {
+     [ClaptrapMinion(ClaptrapCodes.OrderGrain)]
+     [ClaptrapState(typeof(NoneStateData), ClaptrapCodes.OrderDbGrain)]
+     public interface IOrderDbGrain : IClaptrapMinionGrain
+     {
+     }
+ }
```

1. ClaptrapMinion 用来标记该 Grain 是一个 Minion，其中的 Code 指向其对应的 MasterClaptrap。
2. ClaptrapState 用来标记 Claptrap 的 State 数据类型。前一步，我们阐明该 Minion 并不需要 StateData，因此使用 NoneStateData 这一框架内置类型来代替。
3. IClaptrapMinionGrain 是区别于 IClaptrapGrain 的 Minion 接口。如果一个 Grain 是 Minion ，则需要继承该接口。
4. ClaptrapCodes.OrderGrain 和 ClaptrapCodes.OrderDbGrain 是两个不同的字符串，希望读者不是星际宗师。

> 星际宗师：因为星际争霸比赛节奏快，信息量大，选手很容易忽视或误判部分信息，因此经常发生“选手看不到发生在眼皮底下的关键事件”的搞笑失误。玩家们由此调侃星际玩家都是瞎子（曾经真的有一场盲人和职业选手的对决），段位越高，瞎得越严重，职业星际选手清一色的盲人。

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
+     [ClaptrapEventHandler(typeof(OrderCreatedEventHandler), ClaptrapCodes.OrderCreated)]
+     public class OrderDbGrain : ClaptrapBoxGrain<NoneStateData>, IOrderDbGrain
+     {
+         public OrderDbGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
+             : base(claptrapGrainCommonService)
+         {
+         }
+
+         public async Task MasterEventReceivedAsync(IEnumerable<IEvent> events)
+         {
+             foreach (var @event in events)
+             {
+                 await Claptrap.HandleEventAsync(@event);
+             }
+         }
+
+         public Task WakeAsync()
+         {
+             return Task.CompletedTask;
+         }
+     }
+ }
```

1. MasterEventReceivedAsync 是定义自 IClaptrapMinionGrain 的方法，表示实时接收来自 MasterClaptrap 的事件通知。此处暂不展开说明，按照上文模板实现即可。
2. WakeAsync 是定义自 IClaptrapMinionGrain 的方法，表示 MasterClaptrap 主动唤醒 Minion 的操作。此处暂不展开说明，按照上文模板实现即可。
3. 当读者查看源码时，会发现该类被单独定义在一个程序集当中。这只是一种分类办法，可以理解为将 Minion 和 MasterClaptrap 分别放置在两个不同的项目中进行分类。实际上放在一起也没有问题。

## 注册 Grain

此处，由于我们将 OrderDbGrain 定义在单独的程序集，因此，需要额外的注册这个程序集。如下所示：

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
              var logger = NLogBuilder.ConfigureNLog("nlog.config").GetCurrentClassLogger();
              try
              {
                  logger.Debug("init main");
                  CreateHostBuilder(args).Build().Run();
              }
              catch (Exception exception)
              {
                  //NLog: catch setup errors
                  logger.Error(exception, "Stopped program because of exception");
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
                  .ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); })
                  .UseClaptrap(
                      builder =>
                      {
                          builder
                              .ScanClaptrapDesigns(new[]
                              {
                                  typeof(ICartGrain).Assembly,
                                  typeof(CartGrain).Assembly,
+                                 typeof(OrderDbGrain).Assembly
                              })
                              .ConfigureClaptrapDesign(x =>
                                  x.ClaptrapOptions.EventCenterOptions.EventCenterType = EventCenterType.OrleansClient);
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
+     public class OrderCreatedEventHandler
+         : NormalEventHandler<NoneStateData, OrderCreatedEvent>
+     {
+         private readonly IOrderRepository _orderRepository;
+
+         public OrderCreatedEventHandler(
+             IOrderRepository orderRepository)
+         {
+             _orderRepository = orderRepository;
+         }
+
+         public override async ValueTask HandleEvent(NoneStateData stateData,
+             OrderCreatedEvent eventData,
+             IEventContext eventContext)
+         {
+             var orderId = eventContext.State.Identity.Id;
+             await _orderRepository.SaveAsync(eventData.UserId, orderId, JsonConvert.SerializeObject(eventData.Skus));
+         }
+     }
+ }
```

1. IOrderRepository 是直接操作存储层的接口，用于订单的增删改查。此处调用该接口实现订单数据库的入库操作。

## 註冊 EventHandler

实际上为了节约篇幅，我们已经在“实现 Grain”章节的代码中进行注册。

## 实现 IInitialStateDataFactory

由于 StateData 没有特殊定义，因此也不需要实现 IInitialStateDataFactory。

## 修改 Controller

样例中，我们增加了 OrderController 用来下单和查询订单。读者可以在源码进行查看。

读者可以使用以下步骤进行实际的效果测试：

1. POST `/api/cart/123` {"skuId":"yueluo-666","count":30} 向 123 号购物车加入 30 单位的 yueluo-666 号浓缩精华。
2. POST `/api/order` {"userId":"999","cartId":"123"} 以 999 userId 的身份，从 123 号购物车进行下单。
3. GET `/api/order` 下单成功后可以，通过该 API 查看到下单完成的订单。
4. GET `/api/sku/yueluo-666` 可以通过 SKU API 查看下单后的库存余量。

## 小結

至此，我们就完成了“商品下单”这个需求的基础内容。通过该样例可以初步了解多个 Claptrap 可以如何合作，以及如何使用 Minion 完成异步任务。

不过，还有一些问题，我们将在后续展开讨论。

您可以从以下地址来获取本文章对应的源代码：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
