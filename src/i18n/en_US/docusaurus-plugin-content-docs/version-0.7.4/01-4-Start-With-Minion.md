---
title: 'Step 4 - Order using Minion, products'
description: 'Step 4 - Order using Minion, products'
---

With this reading, you're ready to try using Claptrap to implement your business.

<!-- more -->

## Summary

At this point, I will learn how to use Minion in existing project examples to complete asynchronous business handling.

首先，先了解一下本篇需要涉及的业务用例：

1. The user can make the order when placing the order will form an order using all SKU in the current cart.
2. The order will deduct the relevant SKU inventory.Order failed if a SKU stock was not available.
3. The order operation is only conducted until the stock deduction is successful, and the next step does not require a sample discussion.The sample will therefore generate an order record in the database after successfully placing the order, indicating the end of the order creation.

While the focus is on Minion use, the need to use a new OrderGrain object requires the use of knowledge related to the previous “Definition Claptrap”.

Minion is a special Claptrap with relations between MasterClaptrap as shown below：

![Minion](/images/20190228-002.gif)

Its main development process is similar to Claptrap but has been reduced.Compare the following：

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

This deletion is due to the fact that Minion is a Claptrap event consumer, the definition of event does not need to be processed.But the rest is still necessary.

> At the beginning of this chapter, we will no longer list the specific document locations where the relevant code is located, in the hope that the reader will be able to find himself in the project for proficiency.

## Implementing OrderGrain

Based on the knowledge associated with the previous "Definition Clap" we implement an OrderGrain here to represent order action.In order to save space, we have only listed key elements.

### OrderState

Order status defined below：

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

Order creation events defined below：

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

From the beginning of the series, we have never mentioned the operation of the database.Since when you are using the Claptrap framework, most operations have been replaced by "Event Write" and "Status Update", so there is no need to write the database operation in person.

However, because Claptrap is usually designed as a counterpart object (a order, a SKU, a shopping cart) it is not possible to obtain data for all (all orders, all SKU, all carts).At this point, the status data will need to be perpetuated into another durable structure (databases, documents, caching, etc.) in order to complete general queries or other operations.

A Minion concept has been introduced in the Claptrap framework to address these needs.

Next, we'll introduce an OrderDbGrain (a Minion) in the sample to asynchronize the OrderGrain purchase order.

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

Minion is a special Claptrap, in other words, also a Claptrap.ClaptrapTypeCode is necessary for Claptrap and needs to be added.

## Definition of State

Since the sample simply needs to write an order record to the database and does not require any data in the State, this step is not required in the sample.

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

Here, additional registration is required as we define OrderDbGrain in in a separate set of programs.As shown below：

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

In fact, in order to save space, we are already registered in the code of the “Implementing Grain” section.

## Implementing the IInitialStateDataFactory

There is no need to implement the IInitialStateDataFactor because State Data does not have a special definition.

## Modify the Controller.

In the sample, we added the OrderController to place orders and queries.Readers can view them on their source code.

Readers can use the following steps to actually test effects：

1. POST `/api/cart/123` {"skuId":"yueluo-66", "count":30} added 30 units of yueluo-666 to 123 shopping cart.
2. POST `/api/order` {"userId":"999", "cartId":"123"} use as 999 userId to place orders from the shopping cart.
3. GET `/api/order` will be able to view orders completed with the API when orders are successfully placed.
4. GET `/api/sku/yueluo-666` can view the balance of the order over the SKU API.

## Summary

By then, we have completed the basic element of the need for a “commodity order”.This example provides an initial idea of how multiple Claptrap can work together and how to use Minion to perform asynchronous tasks.

There are, however, a number of issues, and we will be following up.

You can get the source code for this article from the following address.：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
