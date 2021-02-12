---
title: "Step two - Simple business, empty shopping cart."
description: "Step two - Simple business, empty shopping cart."
---

With this reading, you're ready to try using Claptrap to implement your business.

<!-- more -->

## Summary

In this article, I learned how to add a business implementation to an existing project sample by implementing the need to "empty the shopping cart".

Mainly consists of the following these steps：

1. Define EventCode.
2. Define Event.
3. Implement EventHandler.
4. Register EventHandler
5. Modify the Grain interface.
6. Implement grain.
7. Modify the Controller.

This is a process from down-up, and the development of the actual coding process can also be achieved top-down.

## Define Event Code.

EventCode is the unique encoding of each event in the Claptrap system.It plays an important role in the identification and serialization of events.

Open`ClaptrapCodes`classes in the`HelloCladaptrap.Models`project.

Add EventCode for "Empty Shopping Cart Events."

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

## Define Event.

Event is the key to the events sourcing.Used to change the State in Claptrap.And Event is persisted at the persistence layer.

Create the`RemoveAllItemsFromCartEvent`class under the`Cart/Events`folder of the`HelloCladaptrap.Models`project.

Add the following code.：

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

Because in this simple business scenario, emptying a shopping cart does not require specific parameters.Therefore, just create an empty type.

The `IEventData`interface is an empty interface that represents an event in the frame, for use when generaltype inference.

## Implement EventHandler.

EventHandler is used to update events to the State of Claptrap.For example, in this business scenario, EventHandler is responsible for emptying the contents of the State shopping cart.

Create the`RemoveAllItemsFromCartEventHandler`class under the`Cart/Events`folder of the`HelloCladaptrap.Actors`project.

Add the following code.：

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

Here are some common problems.：

1. What is NormalEventHandler?

   NormalEventHandler is a simple base class defined by the framework for easy implementation of Handler. The first generic parameter is the State type for Claptrap.In conjunction with the previous document, our cart State type is CartState. The second generic parameter is the Event type that Handler needs to handle.

2. Why with`stateData.Items = null;`without`stateData.Items.Clear ();`

   stateData is the object saved in the memory, and Clear does not narrow the own memory that the dictionary already occupies.Of course, there will not be a several hundred thousand item for a shopping cart in general.But in fact the key is that when updating the State, it is important to note that Clatrap is a kind of object resident in memory, which increases the consumption of memory when the number increases.As a result, keep less data in the State as far as possible.

3. What is ValueTask?

   Can pass this.[Understanding The Whys, Whats, and Whens of ValueTask](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)Learn.

Once the EventHandler implementation is complete, don't forget to unit test it.It's not listed here.

## Sign up for EventHandler.

Once you have implemented and tested EventHandler, you can register EventHandler to associate with EventCode and Claptrap.

打开 `HelloClaptrap.Actors` 项目的 CartGrain 类。

Mark with Attribute.

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

After the association, if the event for EventCode is generated in this grain, the event is handled by the specified EventHandler.

## Modify the Grain interface.

Modify the definition of the Grain interface to provide external interoperability with Claptrap.

Open it.`HelloClaptrap.IActors.`The project.`ICartGrain.`Interface.

Add interfaces and Attributes.

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

Two parts have been added.：

1. marked.`ClaptrapEvent.`to associate the event with Grain.Note that here is the previous step.`Claptrap Event Handler.`is different.Event is marked here, and eventHandler is marked in the previous step.
2. Added the RemoveAllItemsAsync method to indicate business behavior of "emptying shopping carts".It is important to note that grain's method definition has certain limitations.Details can be found.[Developing a Grain](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## Implement grain.

Next, follow the previous interface modification, to modify the corresponding implementation class.

Open it.`HelloClap.Actors.`Project.`Cart.`under the folder.`CartGrain.`Class.

Add the corresponding implementation.

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

The corresponding implementation of the interface method has been added.There are a few points to be aware of.：

1. Be sure to increase.`if (StateData.Items?? Any() ! . . . . . . . . . . . . . . .`This line of judgment.This can significantly reduce the overhead of storage.

   The event is persistent when executing`Clatrap.HandleEventAsync (evt)`.And as far as the scene here is concerned, if there is otherwise nothing in the shopping cart, emptying or lasting this event is just an increase in overhead, without the actual meaning. Thus, an increase in judgment prior to this can reduce the useless consumption of the storage.

2. Be sure to judge the State as well as whether the incoming parameter meets the conditions for the execution of the event.

   This is different from the one described in the previous point.The previous emphasis on "don't produce meaningless events", and this emphasis on "don't produce events that can not be consume by event handler". In the event-sourcing pattern, the completion of the business is based on the persistence of the event as the basis for the completion of the business determination.That is to say that the event can be thought of as long as it is in storage, it can be considered that this event has been completed. And in EventHandler, you can only accept events that are read out from the persistence layer.At this time, the event can no longer be modified in accordance with the immutability of the event, so be sure to ensure that the event can be consumed by EventHandler.So, it is particularly important to judge before`Clatrap.HandleEventAsync (evt)`. Therefore, a unit test must be realized to ensure that the production of the Event and the processing logic of EventHandler are already covered.

3. Some of the ways to use to some TAP libraries are needed here, see[Task-based asynchronous mode](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap)

## Modify the Controller.

Once all the previous steps have been completed, you have completed all the parts of Claptrap.But because Clatrap could not directly provide interoperability with external programs.Therefore, it is also necessary to add an API on the Controller layer for the operation of "emptying the cart" externally.

Open the`CartController`class under the`Controllers`folder of the`HelloCladaptrap.Web`project.

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

## Summary

At this point, we complete all the contents of this simple requirement of "emptying the cart".

You can get the source code for this article from the following address.：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
