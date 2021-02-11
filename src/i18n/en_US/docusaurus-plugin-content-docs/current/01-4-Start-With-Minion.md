---
title: 'Step 4 - Use Minions to place orders for goods'
description: 'Step 4 - Use Minions to place orders for goods'
---

With this reading, you're ready to try using Claptrap to implement your business.

<!-- more -->

## Summary

In this article, I learned how to use Minion in an existing project sample to complete asynchronous business processing by implementing the requirements of "ordering goods".

First, take a look at the business use cases involved in this article：

1. The user can place an order, which will be placed using all SKUs in the current shopping cart to form an order.
2. The inventory of the relevant SKU will be deducted after the order is made.If an SKU is out of stock, the order fails.
3. Ordering is only until the inventory deduction is successful, and the next steps do not require the scope of this sample discussion.Therefore, after this example is successfully placed, an order record is generated in the database to indicate the end of the order creation.

Although this article focuses on the use of Minion, it does require knowledge of the previous "Defining Claptrap" because of the need to use a new OrderGrain object.

Minion is a special Claptrap, and its relationship to MasterClaptrap is shown in the following image：

![Minion](/images/20190228-002.gif)

Its main development process is similar to Claptrap's, with only a few cuts.Compare the following：

| Steps                              | Claptrap | Minion |
| ---------------------------------- | -------- | ------ |
| Define ClaptrapTypeCode            | √        | √      |
| Define State                       | √        | √      |
| Define the Grain interface         | √        | √      |
| Implement grain.                   | √        | √      |
| Sign up for Grain                  | √        | √      |
| Define EventCode.                  | √        |        |
| Define Event.                      | √        |        |
| Implement EventHandler.            | √        | √      |
| Sign up for EventHandler.          | √        | √      |
| Implement IInitialStateDataFactory | √        | √      |

The reason for this reduction is that because Minion is an event consumer for Claptrap, the definition of event-related does not need to be handled.But other parts are still necessary.

> At the beginning of this article, we will no longer list the specific file location of the relevant code, hoping that readers will be able to find their own in the project, in order to master.

## Implement OrderGrain

Based on the knowledge related to the previous "Defining Claptrap", we implement an OrderGrain here to represent the order order operation.To save space, we list only the key parts of it.

### OrderState

The status of the order is defined：

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

1. OrderCreated indicates whether the order has been created and avoids creating the order repeatedly
2. UserId under the single user ID
3. Skus orders contain SkuIds and order quantities

### OrderCreatedEvent

The order creation event is defined as follows：

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

1. OrderGrain implements the core logic of order creation, where the CreateOrderAsync method completes shopping cart data acquisition and inventory deduction-related actions.
2. The relevant fields in State will be updated after orderCreatedEvent has been successfully executed and are no longer listed here.

## Save order data to the database through Minion

From the beginning of the series to this, we never mentioned database-related operations.Because when you're using the Claptrap framework, the vast majority of operations have been replaced by "write to events" and "state updates," you don't need to write database operations yourself at all.

However, since Claptrap is usually designed for a single object (one order, one SKU, one shopping cart), it is not possible to obtain all (all orders, all SKUs, all shopping carts) data.At this point, you need to persist the state data into another persistence structure (database, file, cache, etc.) in order to complete queries or other operations for the entire situation.

The concept of Minion was introduced into the Claptrap framework to address these requirements.

Next, we introduce an OrderDbGrain (a Minion) in the sample to asynchronously complete OrderGrain's order-in operation.

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

+ public const string OrderDbGrain = "db_order_claptrap_newbe";

          #endregion
      }
  }
```

Minion is a special Claptrap, in other words, it is also a Claptrap.ClaptrapTypeCode is required for Claptrap and needs to be added to this definition.

## Define State

Because this sample only needs to write an order record to the database and does not require any data in State, this step is not actually required in this sample.

## Define the Grain interface

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

1. ClaptrapMinion is used to mark the Grain as a Minion, where Code points to its corresponding MasterClaptrap.
2. ClaptrapState is used to mark Claptrap's State data type.In the previous step, we made it clear that the Minion does not need StateData, so use NoneStateData instead of the built-in type of the framework.
3. IClaptrapMinionGrain is the Minion interface that differs from IClaptrapGrain.If a Grain is Minion, you need to inherit the interface.
4. ClaptrapCodes.OrderGrain and ClaptrapCodes.OrderDbGrain are two different strings, and I hope the reader is not an interstellar patrist.

> Star Master：Because of the fast pace of StarCraft competition, the amount of information, players can easily ignore or misjudge some of the information, so often "players do not see the key events that occur under the nose" funny mistakes.Players thus joke that interstellar players are blind (there was really a blind and professional duel), the higher the segment, the more serious the blind, professional interstellar players are blind.

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

1. MasterEventReceivedAsync is a method defined from IClaptrapMinionGrain that means receiving event notifications from MasterClaptrap in real time.Don't expand the description here, just follow the template above.
2. WakeAsync is the method defined from IClaptrapMinionGrain, which represents masterClaptrap's active wake-up of Minion.Don't expand the description here, just follow the template above.
3. When the reader views the source code, they find that the class is defined separately in an assembly.This is just a classification method that can be understood as classifying Minion and MasterClaptrap in two different projects.It's actually no problem to put it together.

## Sign up for Grain

Here, because we define OrderDbGrain in a separate assembly, additional registration is required for this assembly.As follows：

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

1. IOrderRepository is an interface that operates directly on the storage tier for the addition and deletion of orders.The interface is called here to implement the incoming operation of the order database.

## Register EventHandler

In fact, to save space, we've registered in the code for the "Implement Grain" section.

## Implement IInitialStateDataFactory

Because StateData has no special definition, there is no need to implement IInitialStateDataFactory.

## Modify the Controller.

In the example, we added OrderController to place orders and query orders.Readers can view it at the source code.

Readers can use the following steps to perform a real-world：

1. POST `/api/cart/123` ""skuId": "yueluo-666", "count":30" add 30 units of yueluo-666 concentrate to the 123 shopping cart.
2. POST `/api/order` "userId": "999", "cartId": "123"" as 999 userId, from the 123 shopping cart to place an order.
3. Get `/api/order` can be viewed through the API after the order has been placed successfully.
4. GET `/api/sku/yueluo-666` the SKU API can view the inventory balance after the order has been ordered.

## Summary

At this point, we have completed the "commodity order" this requirement of the basic content.This sample gives you a first look at how multiple Claptraps can work together and how to use Minion to accomplish asynchronous tasks.

However, there are a number of issues that we will discuss later.

You can get the source code for this article from the following address.：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
