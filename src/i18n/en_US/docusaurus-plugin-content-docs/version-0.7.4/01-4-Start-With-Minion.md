---
title: 'Step 4 - Order using Minion, products'
description: 'Step 4 - Order using Minion, products'
---

With this reading, you're ready to try using Claptrap to implement your business.

<!-- more -->

:::caution 该文档仅适用于 0.7 及以下版本，若想要查看最新版本内容，请点击右上角进行切换。 :::

## Summary

本篇，我通过实现“商品下单”的需求来了解一下如何在已有的项目样例中使用 Minion 来完成异步的业务处理。

首先，先了解一下本篇需要涉及的业务用例：

1. The user can make the order when placing the order will form an order using all SKU in the current cart.
2. The order will deduct the relevant SKU inventory.Order failed if a SKU stock was not available.
3. The order operation is only conducted until the stock deduction is successful, and the next step does not require a sample discussion.The sample will therefore generate an order record in the database after successfully placing the order, indicating the end of the order creation.

本篇虽然重点在于 Minion 的使用，不过由于需要使用到一个新的 OrderGrain 对象，因此还是需要使用到前一篇“定义 Claptrap”的相关知识。

Minion 是一种特殊的 Claptrap，它与其 MasterClaptrap 之间的关系如下图所示：

![Minion](/images/20190228-002.gif)

其主体开发流程和 Claptrap 类似，只是有所删减。对比如下：

| Step                                      | Claptrap | Minion |
| ----------------------------------------- | -------- | ------ |
| Define ClaptrapTypeCode                   | √        | √      |
| Definition of State                       | √        | √      |
| Define Grain interface                    | √        | √      |
| Implement grain.                          | √        | √      |
| Sign up for Grain                         | √        | √      |
| Define EventCode.                         | √        |        |
| Define Event.                             | √        |        |
| Implement EventHandler.                   | √        | √      |
| Sign up for EventHandler.                 | √        | √      |
| Implementing the IInitialStateDataFactory | √        | √      |

这个删减的原因是由于 Minion 是 Claptrap 的事件消费者，所以事件相关的定义不需要处理。但是其他的部分仍然是必须的。

> At the beginning of this chapter, we will no longer list the specific document locations where the relevant code is located, in the hope that the reader will be able to find himself in the project for proficiency.

## Implementing OrderGrain

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

1. OrderCreated indicates whether an order has been created and avoid creating orders again.
2. User Id under UserId
3. SkuId and orders included in Skus orders

### OrderCreatedEvent

订单创建事件的定义如下：

```cs
Using Systems. Generic;
using Newbe.Claptrap;

namespace HelloClaptrap.Models.Order. Events
FU
    Public class OrderCreatedEvent : IEventData
    F.
        Public string UserId. set; }
        public Dictionary<string, int> Skus Filet; set; }
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

1. OrderGrain implements the core logic of order creation, in which CreateOrderAsync methods complete cart data acquisition, stock deduct related actions.
2. The relevant fields in the State will be updated when OrderCreedEvent is executed successfully, and are no longer listed here.

## Save order data via Minion to database

从系列开头到此，我们从未提及数据库相关的操作。因为当您在使用 Claptrap 框架时，绝大多数的操作都已经被“事件的写入”和“状态的更新”代替了，故而完全不需要亲自编写数据库操作。

不过，由于 Claptrap 通常是对应单体对象（一个订单，一个 SKU，一个购物车）而设计的，因而无法获取全体（所有订单，所有 SKU，所有购物车）的数据情况。此时，就需要将状态数据持久化到另外的持久化结构中（数据库，文件，缓存等）以便完成全体情况的查询或其他操作。

在 Claptrap 框架中引入了 Minion 的概念来解决上述的需求。

接下来，我们就在样例中引入一个 OrderDbGrain （一个 Minion）来异步完成 OrderGrain 的订单入库操作。

## Define ClaptrapTypeCode

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

## Definition of State

由于本样例只需要向数据库写入一条订单记录就可以了，并不需要在 State 中任何数据，因此该步骤在本样例中其实并不需要。

## Define Grain interface

```cs
+ Using HelloClaptrap.Models;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap. rleans;
+
+ namespace HelloClaptrap.IActor
+ LO
+ [ClaptrapCodes. rderGrain]
+ [ClaptrapState(typeof(NoneStateData), ClaptrapCodes. rderDbGrain]
+ public interface IorderDbGrain: IClaptrapMinionGrain
+ {
+ }
+ }
```

1. ClaptrapMinion is used to mark Grain as a Minion, where Code points to its corresponding MasterClaptrap.
2. ClaptrapState is used to mark the State data type of Claptrap.As a previous step, we clarify that Minion does not require StateData, and therefore use the NoneStateData inline type instead.
3. IClapMinionGrain is a Minion Interface distinguished from IClapGrain.If a Grain is Minion, you need to inherit this interface.
4. ClaptrapCodes.OrderGrain and ClaptrapCods. OrderDbGrain are two different strings, hoping that the reader is not an intersteller.

> The interstealer：is frequently mocked because of the fast rhythm of the interstellation competition and the volume of information, and the ease with which the player ignores or misjudges part of the information.The players are all blind (there was a real battle between blind and professional players). The higher the range, the more blind, the more blind the professional star-players were.

## Implement grain.

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

1. MasterEventReceivedAsync is a method defined from IClaptrapMinionGrain that it receives notification of events from MasterClaptrap in real time.This will be done on the basis of the above template.
2. WakeAsync is a method defined from IClaptrapMinionGrain, representing MasterClaptrap active wake-up of Minion.This will be done on the basis of the above template.
3. When readers view the source code, they find that the class is defined separately in a set of programs.This is only a classification, which can be understood as placing Minion and MasterClaptrap in two separate projects.In fact, there is no problem.

## Sign up for Grain

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

## Implement EventHandler.

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

1. IOrderRepository is the interface to operate the storage layer directly, which is used for order additions and deletions.Use this interface to implement the order database access operation.

## Register EventHandler

实际上为了节约篇幅，我们已经在“实现 Grain”章节的代码中进行注册。

## Implementing the IInitialStateDataFactory

由于 StateData 没有特殊定义，因此也不需要实现 IInitialStateDataFactory。

## Modify the Controller.

样例中，我们增加了 OrderController 用来下单和查询订单。读者可以在源码进行查看。

读者可以使用以下步骤进行实际的效果测试：

1. POST `/api/cart/123` {"skuId":"yueluo-66", "count":30} added 30 units of yueluo-666 to 123 shopping cart.
2. POST `/api/order` {"userId":"999", "cartId":"123"} use as 999 userId to place orders from the shopping cart.
3. GET `/api/order` will be able to view orders completed with the API when orders are successfully placed.
4. GET `/api/sku/yueluo-666` can view the balance of the order over the SKU API.

## Summary

至此，我们就完成了“商品下单”这个需求的基础内容。通过该样例可以初步了解多个 Claptrap 可以如何合作，以及如何使用 Minion 完成异步任务。

不过，还有一些问题，我们将在后续展开讨论。

您可以从以下地址来获取本文章对应的源代码：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
