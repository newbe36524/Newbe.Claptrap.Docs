---
title: 'Step two - Simple business, empty shopping cart.'
metaTitle: 'Step two - Simple business, empty shopping cart.'
metaDescription: 'Step two - Simple business, empty shopping cart.'
---

With this reading, you're ready to try using Claptrap to implement your business.

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)

<!-- more -->

## The opening summary.

In this article, I learned how to add a business implementation to an existing project sample by implementing the need to "empty the shopping cart".

The main includethese of these steps.：

1. Define EventCode.
2. Define Event.
3. Implement EventHandler.
4. Sign up for EventHandler.
5. Modify the Grain interface.
6. Implement grain.
7. Modify the Controller.

This is a bottom-up process, and the actual coding process can also be developed from top to bottom.

## Define Event Code.

EventCode is the unique encoding of each event in the Claptrap system.It plays an important role in the identification and serialization of events.

Open it.`HelloClap.Models.`Project.`Claptrap Codes.`Class.

Add EventCode for "Empty Shopping Cart Events."

```cs
  Namespace HelloClaptrap.Models.
  {
      public static class ClaptrapCodes.
      {
          public const string CartGrain s "cart_claptrap_newbe";
          Private const string CartEventSuffix . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
          public const string AddItemToCart - "addItem" s cartEventSuffix;
          public const string RemoveItem FromCart - "removeItem" s cartEventSuffix;
public const string Remove AllItems FromCart s "remoeAllItems" s."
      }
  }
```

## Define Event.

Event is the key to the origin of events.Used to change the State in Claptrap.And Event is persisted at the persistence layer.

In.`HelloClap.Models.`The project.`Cart/Events.`Create under the folder.`Remove AllItems from Cart Event.`Class.

Add the following code.：

```cs
susing Newbe.Claptrap;
+
Snamespace HelloClaptrap.Models.Cart.Events.
+ {
public class remove AllAllItems FromCartEvent: IEventData.
+     {
+     }
+ }
```

Because in this simple business scenario, emptying a shopping cart does not require specific parameters.Therefore, just create an empty type.

`IEventData.`An interface is an empty interface in a framework that represents events and is used when generic inferences.

## Implement EventHandler.

`Event Handler.`Used to update events to Claptrap.`State.`on.For example, in this business scenario, EventHandler is responsible for emptying the contents of the State shopping cart.

In.`HelloClap.Actors.`The project.`Cart/Events.`Create under the folder.`Remove All Items From Cart Event Handler.`Class.

Add the following code.：

```cs
susing System.Threading.Tasks;
- Hello UsingClaptrap.Models.Cart;
- HelloClaptrap.Models.Cart.Events;
susing Newbe.Claptrap;
+
Snamespace HelloClaptrap.Actors.Cart.Events.
+ {
public class class Remove AllItems From CartEvent Handler.
: NormalEventHandler.<CartState, RemoveAllItemsFromCartEvent>
+     {
public override ValueTask HandleEvent (CartState StateData,
RemoveAllItems FromCart Event EventData,
IEventContext EventContext)
+         {
statedata.Items snull;
return new ValueTask();
+         }
+     }
+ }
```

Here are some common problems.：

1. What is Normal Event Handler?

   NormalEventHandler is a simple base class defined by the framework for easy implementation of Handler. The first generic parameter is the State type for Claptrap.In conjunction with the previous document, our cart State type is CartState. The second generic parameter is the Event type that Handler needs to handle.

2. Why use it.`StateData.Items snull;`Not.`StateData.Items.Clear();`

   StateData is an object that is kept in memory, and Clear does not reduce the dictionary's own memory.Of course, there are usually no shopping carts with hundreds of thousands of items.But the point is, when updating State, it's important to note that Claptrap is a memory-based object that increases in number and increases memory consumption.Therefore, keep as little data as possible in State.

3. What is ValueTask?

   Can pass this.[Understanding The Whys, Whats, and Whens of ValueTask](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)Learn.

Once the EventHandler implementation is complete, don't forget to unit test it.It's not listed here.

## Sign up for EventHandler.

Once you have implemented and tested EventHandler, you can register EventHandler to associate with EventCode and Claptrap.

Open it.`HelloClap.Actors.`The project.`CartGrain.`Class.

Mark with Attribute.

```cs
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  Namespace HelloClaptrap.Actors.Cart.
  {
      (Claptrap Event Handler(Typeof (AddItemToCartEvent Handler), ClaptrapCodes.AddItemToCart)
      (Claptrap Event Handler( RemoveitemFromCartEvent Handler), ClaptrapCodes.RemoveItemFromCart)
- "Claptrap Event Handler (Typeof (Remove AllItems From Cart Event Handler), ClaptrapCodes.RemoveAllFromItems Cart)
      public class CartGrain : ClaptrapBoxGrain.<CartState>, ICartGrain.
      {
          public CartGrain ()
              IClaptrapGrainCommon Service ClapGrainGrainCommonService
              : base (claptrapGrain Common Service)
          {
          }

....
```

`Claptrap Event Handler Handler.`Is an attribute defined by the framework that can be marked on grain's implementation class to achieve the association between EventHandler, EventCode, and ClaptrapGrain.

After the association, if the event for EventCode is generated in this grain, the event is handled by the specified EventHandler.

## Modify the Grain interface.

Modify the definition of the Grain interface to provide external interoperability with Claptrap.

Open it.`HelloClaptrap.IActors.`The project.`ICartGrain.`Interface.

Add interfaces and Attributes.

```cs
  Using System.Collections.Generic;
  Using System.Threading.Tasks;
  Using HelloClaptrap.Models;
  Using HelloClaptrap.Models.Cart;
  Using HelloClaptrap.Models.Cart.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  Namespace HelloClaptrap.IActor.
  {
      (ClaptrapState(typeof, ClaptrapCodes.CartGrain))
      (ClaptrapEvent(Typeof(AddItemToCartEvent), ClaptrapCodes.AddItemToCart)
      (ClaptrapEvent(Typeof (RemoveItemFromCartEventEvent), ClaptrapCodes.RemoveItemFromCart)
- "ClaptrapEvent (Typeof (Remove AllItems from CartEventEvent), ClaptrapCodes.RemoveAllItemsfromCart)
      public interface ICartGrain : IClaptrapGrain.
      {
          Task.<Dictionary<string, int>> AddItemAsync (string skuId, int count);
          Task.<Dictionary<string, int>> Remove ItemAsync (string skuId, int count);
          Task.<Dictionary<string, int>> GetItemsAsync ();
Task AllItemsAsync ();
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
  Using System;
  Using System.Collections.Generic;
  Using System.Linq;
  Using System.Threading.Tasks;
  Using HelloClaptrap.Actors.Cart.Events;
  Using HelloClaptrap.IActor;
  Using HelloClaptrap.Models;
  Using HelloClaptrap.Models.Cart;
  Using HelloClaptrap.Models.Cart.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  Namespace HelloClaptrap.Actors.Cart.
  {
      (Claptrap Event Handler(Typeof (AddItemToCartEvent Handler), ClaptrapCodes.AddItemToCart)
      (Claptrap Event Handler( RemoveitemFromCartEvent Handler), ClaptrapCodes.RemoveItemFromCart)
      (Claptrap Event Handler(TypeofAllItems From Cart Event Handler), ClaptrapCodes.RemoveAllItems From Cart)
      public class CartGrain : ClaptrapBoxGrain.<CartState>, ICartGrain.
      {
          public CartGrain ()
              IClaptrapGrainCommon Service ClapGrainGrainCommonService
              : base (claptrapGrain Common Service)
          {
          }

public Task Remove AllItemsAsync ()
+         {
if (StateData.Items?. Any() ! . . . . . . . . . . . . . . .
+             {
Return Task.CompletedTask;
+             }
+
the var removeAllItems FromCartEvent s new RemoveAllItems FromCartEvent ();
svar evt s.this. CreateEvent (removeAllItems From CartEvent);
return Claptrap.HandleEventAsync (evt);
+         }
      }
  }
```

The corresponding implementation of the interface method has been added.There are a few points to be aware of.：

1. Be sure to increase.`if (StateData.Items?? Any() ! . . . . . . . . . . . . . . .`This line of judgment.This can significantly reduce the overhead of storage.

   The event is executed when.`Claptrap.HandleEventAsync (evt)`will persist.In the case of the scene here, if there is nothing in the shopping cart, emptying or persisting the event just adds to the overhead, but doesn't make sense. Therefore, adding judgment prior to this can reduce the useless consumption of storage.

2. It is important to determine whether State and the incoming parameters meet the criteria for event execution.

   This is different from the emphasis described in the previous point.The previous emphasis on "don't produce meaningless events" suggests that "there will never be events that EventHandler cannot consume". In the event-tracing mode, the completion of the business is based on the persistence of the event as the basis for the completion of the business determination.This means that as long as the event is in stock, it can be considered that the event has been completed. In EventHandler, you can only accept events read from the persistence layer.At this point, the event can no longer be modified as the event is immutable, so it is important to ensure that the event can be consumed by EventHandler.So, in.`Claptrap.HandleEventAsync (evt)`It is especially important to make a judgment before. Therefore, it is important to implement unit testing to ensure that event generation and EventHandler's processing logic are overwritten.

3. Here are some methods in the TAP library that you can use, see .[Task-based asynchronous pattern.](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap)

## Modify the Controller.

Once all the previous steps have been completed, you have completed all the parts of Claptrap.However, Claptrap is unable to provide interoperability with external programs directly.Therefore, you also need to add an API to the Controller layer for external "emptying the shopping cart".

Open it.`HelloClap.Web.`The project.`Controllers.`under the folder.`CartController.`Class.

```cs
  Using System.Threading.Tasks;
  Using HelloClaptrap.IActor;
  using Microsoft.AspNetCore.Mvc;
  Using Orleans;

  Namespace HelloClaptrap.Web.Controllers.
  {
      Route ("api/[controller]")]
      public class CartController : Controller.
      {
          Private readonly Igrain Factory _grainFactory;

          public CartController (public CartController)
              IGrain FactorY Grain Factory)
          {
              _grainFactory - grain factory;
          }

httppost ("{id}/clean")
public async Task.<IActionResult> RemoveAllItemAsync (int id)
+         {
the var cartgrain s _grainFactory.GetGrain.<ICartGrain>(id. ToString ();
await cartgrain.RemoveAllItemsAsync ();
return Json ("clean success");
+         }
      }
  }
```

## Summary

At this point, we've done everything we need to "empty your shopping cart."

You can get the source code for this article from the following address.：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
