---
title: 'Step 4 - Use Minion to place an order for a product.'
metaTitle: 'Step 4 - Use Minion to place an order for a product.'
metaDescription: 'Step 4 - Use Minion to place an order for a product.'
---

With this article, you can start trying to do business with Claptrap.

> [The version currently viewed is the result Chinese Simplified machine translates self-checking and manually proofreads.If there is any improper translation in the document, please click here to submit your translation suggestions.](https://crwd.in/newbeclaptrap)

<!-- more -->

## Opening summary.

In this article, I learned how Minion can be used to complete asynchronous business processing in existing project samples by implementing the requirements of "commodity ordering".

First, take a look at the business use cases that need to be covered in this article：

1. The user can place an order, which forms an order using all SKUs in the current shopping cart.
2. Inventory of the relevant SKUs will be deducted after the order is made.If an SKU is out of stock, the order fails.
3. The order operation is only successful until the inventory is deducted successfully, and the next steps do not require the scope of this sample discussion.Therefore, this example generates an order record in the database after a successful order is placed, indicating the end of the order creation.

Although the focus of this article is on the use of Minion, because of the need to use a new OrderGrain object, you still need to use the previous article "Defining Claptrap" related knowledge.

Minion is a special kind of Claptrap, and its relationship to MasterClaptrap is shown in the following：

![Minion.](/images/20190228-002.gif)

Its main development process is similar to Claptrap's, with only a few limitations.The comparison is as follows：

| Steps.                                 | Claptrap. | Minion. |
| -------------------------------------- | --------- | ------- |
| Define ClaptrapTypeCode.               | √.        | √.      |
| Define State.                          | √.        | √.      |
| Define the Grain interface.            | √.        | √.      |
| Implement Grain.                       | √.        | √.      |
| Sign up for Grain.                     | √.        | √.      |
| Define EventCode.                      | √.        |         |
| Define Event.                          | √.        |         |
| Implement Event Handler.               | √.        | √.      |
| Sign up for EventHandler.              | √.        | √.      |
| Implement IInitial State Data Factory. | √.        | √.      |

The reason for this deletion is that because Minion is claptrap's event consumer, event-related definitions do not need to be processed.But the rest is still necessary.

> At the beginning of this article, we will no longer list the specific file locations where the relevant code is located, and we hope that the reader will be able to find out for themselves in the project so that they can master it.

## Implement OrderGrain.

Based on the previous "Defining Claptrap" knowledge, we implemented an OrderGrain here to represent the order-ordering operation.To save space, we list only the key parts of it.

### OrderState.

The status of the order is defined as follows：

```cs
Systems.Collections.Generic;
. Newbe.Claptrap;

namespace HelloClaptrap.Models.Order
s
    public class Order State : IStateData
    s
        public bool OrderCreated s get; set; s
        public user stringId s get; set; s
        public Dictionary<string, int> Skus sned; set; s

s.
```

1. OrderCreated indicates whether an order has been created, avoiding the creation of the order repeatedly.
2. UserId places an order for a user Id.
3. Skus orders contain SkuIds and order volumes.

### OrderCreatedEvent.

Order creation events are defined as follows：

```cs
Systems.Collections.Generic;
. Newbe.Claptrap;

namespace HelloClaptrap.Models.Order.Events

    public class OrderCreatedEvent : IEventData
    . . .
        public string UserId . . . set; . . .
        Public Dictionary<string, int> Skus

    . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

### OrderGrain.

```cs
Using System.Threading.Tasks;
The United States, Hello Claptrap.Actors.Order.Events;
The 1990s, HelloClaptrap.IActor;
The United States Ofsing HelloClaptrap.Models;
.Models.Order;
.HelloClaptrap.Models.Order.Events;
.Claptrap;
Newbe.Claptrap.Orleans;
Orleans;

Namespace HelloClaptrap.Actors.Order

    (OrderCreatedEventHandler, ClaptrapCodes.OrderCreated)
    Public Class Order Grain : ClaptrapBox Grain<OrderState>, IOrder Grain
    _grainFactory
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

        Public OrderGrain ( IClaptrapGrainCommonService Claptrap Grain Common Services,
            IGrain Factory GrainFactory)
            : base (claptrapGrainCommonService)
        s
            _grainFactory s grainfactory;
        s

        public async Task CreateOrder Agent Async (CreateOrderInput)
        s
            var orderid s claptrap.state.Identity. y.Id;
            // throw exception if order already created
            if (StateData.OrderCreated)

                new bizException ($"order with order id already created: {orderId}");


            // get items from cart
            var cartGrain _grainFactory.GetGrain<ICartGrain>(input. CartId);
            var items - await cartGrain.GetItemsAsync();

            // update inventory for
            foreach (skuId, count) in items)

                var skuGrain , _grainFactory.GetGrain<ISkuGrain>(skuId);
                await skuGrain.UpdateInventoryAsync (-count);
            . .

            // Remove all items from cart
            await cartGrain.Re. moveAllItemsAsync();

            // create a
            var evt . . . this. CreateEvent (new OrderCreatedEvent
            userid
                input. UserId,
                Skus - items
            ) );
            .HandleEventAsync (evt);
        s
    s

```

1. OrderGrain implements the core logic of order creation, where the CreateOrderAsync method completes shopping cart data acquisition, inventory deduction related actions.
2. The relevant fields in State will be updated after OrderCreatedEvent's successful execution, which is no longer listed here.

## Save order data to the database through Minion.

From the beginning of the series to this, we have never mentioned database-related operations.Because when you're using the Claptrap framework, the vast majority of operations have been replaced by Writes to Events and State Updates, so you don't need to write your own database operations.

However, because Claptrap is usually designed for unit objects (one order, one SKU, one shopping cart), it is not possible to obtain data for all (all orders, all SKUs, all carts).At this point, state data needs to be persisted into another persistent structure (database, file, cache, etc.) in order to complete queries or other operations for the whole situation.

The concept of Minion was introduced into the Claptrap framework to address these requirements.

Next, we introduce an OrderDbGrain (a Minion) in the sample to complete OrderGrain's order entry operation asynchronously.

## Define ClaptrapTypeCode.

```cs
  namespace HelloClaptrap.Models

      public static class ClaptrapCodes

          #region Cart

          public and const string CartGrain s "cart_claptrap_newbe";
          private const string CartEventSuffix, """""""""""""""""""""""""""""""""""
          """"""""""""""""""""""""""""""""""""""""
          """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" Tring RemoveItemFromCart - "RemoveItem" - CartEventSuffix;
          Public publicity const String Remove AllItems FrommCart , "Remoe AllItems" , CartEventSuffix;

          #endregion

          #region Sku

          public publicity and skuGrain - "sku_claptrap_newbe";
          the private const string SkuEventSuffix . . . . . . . . . . . . . . . . . . . . . . . . .
          public publicity and skuInventoryUpdate , "inventoryUpdate" , SkuEventSuffix;

          #endregion

          #region Order

          public order orderGrain , "order_claptrap_newbe";
          the private private const string OrderEventSuffix . . . ."""""""""""""""""""""""""""""""""""""""""""""""""""""""""
          the public public and the public and the order ordercreated , "ordercreated" , and orderEventSuffix;

the public and the public and the public to string OrderDbGrain , "db_order_claptrap_newbe";

          #endregion
      . . .
  . .
```

Minion is a special kind of Claptrap, in other words, it is also a kind of Claptrap.ClaptrapTypeCode is required for Claptrap and therefore needs to be added.

## Define State.

Because this sample only needs to write an order record to the database and does not require any data in State, this step is not actually required in this sample.

## Define the Grain interface.

```cs
Using HelloClaptrap.Models;
. . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . .
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
2. ClaptrapState is used to mark the State data type of Claptrap.In the previous step, we clarified that the Minion does not require StateData, so we use NoneStateData as a built-in type of framework instead.
3. IClaptrapMinionGrain is a Minion interface that differs from IClaptrapGrain.If a Grain is Minion, you need to inherit the interface.
4. ClaptrapCodes.OrderGrain and ClaptrapCodes.OrderDbGrain are two different strings, and hopefully the reader is not an interstellar master.

> Star Master：Because StarCraft is fast-paced and has a large amount of information, it is easy for players to ignore or misjudge some of the information, so often "players do not see the key events that occur under the nose" funny mistakes.Players thus joke that interstellar players are blind (there was once a real showdown between blind and professional players), the higher the segment, the more serious the blindness, professional interstellar players are blind.

## Implement Grain.

```cs
Using Systems.Collections.Generic;
. . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
sing HelloClaptrap.IActor;
. . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . .
,
, namespace HelloClaptrap.Actors.DbGrains.Order
,
, and ClaptrapEventHandler , ClaptrapCodes . OrderCreated)
and public class OrderDbGrain : ClaptrapBoxGrain<NoneStateData>, IOrderDbGrain
,
, public OrderDbGrain (IClaptrapGrain CommonService). claptrapGrainCommonService)
+ : base(claptrapGrainCommonService)
+ {
+ }
+
+ public async Task MasterEventReceivedAsync(IEnumerable<IEvent> events)
+ {
+ foreach (var @event in events)
+ {
+ await Claptrap.HandleEventAsync(@event);

,
,
,  , public WakeAsync ()
,
, return Task.CompletedTask,
,
,
.
```

1. MasterEventReceivedAsync is a method defined from IClaptrapMinionGrain that means receiving event notifications from MasterClaptrap in real time.Without expanding the description here, follow the template above.
2. WakeAsync is a method defined from IClaptrapMinionGrain, which represents MasterClaptrap's active wake-up of Minion.Without expanding the description here, follow the template above.
3. When the reader views the source code, they find that the class is defined separately in an assembly.This is just a classification that can be understood as placing Minion and MasterClaptrap in two different projects.It's actually no problem putting it together.

## Sign up for Grain.

Here, because we define OrderDbGrain in a separate assembly, we need to register the assembly additionally.As follows,：

```cs
  Using System;
  using Autofac;
  . Hening HelloClaptrap.Actors.Cart;
  .HelloClaptrap.Actors.DbGrains.Order;
  .IActor;
  s general service, HelloClaptrap.Repository;
  .AspNetCore.Hosting;
  .Extensions.Hosting;
  .Extensions.Logging;
  .Claptrap;
  newbe.Claptrap.Bootstrapper;
  NLog.Web;
  Orleans;

  namespace HelloClaptrap.BackendServer

      public program program

          public static void main (string)

              var logger , NLogBuilder.ConfigureNLog ("nlog.config"). GetCurrentClassLogger ();
              try
              .
                  logger. Debug ("init main");
                  CreateHostBuilder (args). Build(). Run ();

              catch (exception exception)

                  //NLog: catch setup errors
                  logger. Error (exception, "Stopped program because of exception");
                  throw;

              finally

                  // Ensure to flush and stop internal timers/threads before application-exit
                  NLog.LogManager.Shutdown();
              . . .
          . . .

          publicity static IHostBuilder (string)>
              . CreateDefaultBuilder (args)
                  . ConfigureWebHostDefaults (webBuilder> . . . . . . . . .<Startup>. . . . . . . . . . . . . . . . . . . . . . . . . .
                  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . UseClaptrap (
                      Builders>

                          Builder
                              . ScanClaptrapDesigns (new)

                                  typeof (ICartGrain). Assembly,
                                  typeof (CartGrain). Assembly,
and Typeof (OrderDbGrain). Assembly
                              )
                              . ConfigureClaptrapDesign (x .>
                                  x. Claptrap Options. EventCenter Options. EventCenterType . . . EventCenterType.Orleans Client);
                      ,
                      builder> builder. RegisterModule<RepositoryModule>(); )
                  . UseOrleans Claptrap()
                  . UseOrleans (builders -> builders. UseDashboards (options> options. Port s 9000))
                  . ConfigureLogging (logging )>
                  .
                      logging. ClearProviders ();
                      logging. SetMinimumLevel (LogLevel.Trace);
                  )
                  . UseNLog();
      . . .
  . .
```

## Implement Event Handler.

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

1. IOrderRepository is an interface that operates directly on the storage tier for add-on and delete of orders.The interface is called here to implement the storage operation of the order database.

## Sign up for EventHandler.

In fact, to save space, we've registered in the code for the "Implement Grain" section.

## Implement IInitial State Data Factory.

Because StateData does not have a special definition, there is no need to implement IInitial StateData Factory.

## Modify controller.

In the sample, we added OrderController to place orders and query orders.Readers can view it in source code.

Readers can use the following steps to test the actual：

1. POST `/api/cart/123` "skuId": "yueluo-666", "count": 30" to the 123 shopping cart to add 30 units of yueluo-666 concentrate.
2. POST `/api/order` ( "userId": "999", "cartId": "123") as 999 userId, from the 123 shopping cart to place an order.
3. GET `/api/order` the order can be viewed through the API after the order has been successfully placed.
4. GET `/api/sku/yueluo-666` can view the inventory balance after the order is made through the SKU API.

## Summary.

At this point, we have completed the "goods order" this demand for the basic content.This sample provides an initial understanding of how multiple Claptraps can work together and how Minion can be used to accomplish asynchronous tasks.

However, there are still some issues that we will discuss later.

You can obtain the source code for this article from the following：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
