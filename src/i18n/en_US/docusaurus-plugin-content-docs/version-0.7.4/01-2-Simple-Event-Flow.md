---
title: "Step two - Simple business, empty shopping cart."
description: "Step two - Simple business, empty shopping cart."
---

With this reading, you're ready to try using Claptrap to implement your business.

<!-- more -->

:::caution 该文档仅适用于 0.7 及以下版本，若想要查看最新版本内容，请点击右上角进行切换。 :::

## Summary

本篇，我通过实现“清空购物车”的需求来了解一下如何在已有的项目样例中增加一个业务实现。

主要包含有以下这些步骤：

1. Define EventCode.
2. Define Event.
3. Implement EventHandler.
4. Register EventHandler
5. Modify the Grain interface.
6. Implement grain.
7. Modify the Controller.

这是一个从下向上的过程，实际的编码过程中开发也可以自上而下进行实现。

## Define Event Code.

EventCode 是 Claptrap 系统每个事件的唯一编码。其在事件的识别，序列化等方面起到了重要的作用。

打开`HelloClaptrap.Models`项目中的`ClaptrapCodes`类。

添加“清空购物车事件”的 EventCode。

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

Event 是事件溯源的关键。用于改变 Claptrap 中的 State。并且 Event 会被持久化在持久层。

在 HelloClaptrap.Models 项目的 Cart/Events 文件夹下创建 RemoveAllItemsFromCartEvent 类。

添加如下代码：

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

由于在这个简单的业务场景中，清空购物车不需要特定的参数。因此，只要创建空类型即可。

`IEventData`接口是框架中表示事件的空接口，用于在泛型推断时使用。

## Implement EventHandler.

EventHandler 用于将事件更新到 Claptrap 的 State 上。例如此次的业务场景，那么 EventHandler 就负责将 State 购物车中的内容清空即可。

在 HelloClaptrap.Actors 项目的 Cart/Events 文件夹下创建 RemoveAllItemsFromCartEventHandler 类。

添加如下代码：

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

这里有一些常见的问题：

1. What is NormalEventHandler?

   NormalEventHandler is a simple base class defined by the framework for easy implementation of Handler. The first generic parameter is the State type for Claptrap.In conjunction with the previous document, our cart State type is CartState. The second generic parameter is the Event type that Handler needs to handle.

2. Why with`stateData.Items = null;`without`stateData.Items.Clear ();`

   stateData is the object saved in the memory, and Clear does not narrow the own memory that the dictionary already occupies.Of course, there will not be a several hundred thousand item for a shopping cart in general.But in fact the key is that when updating the State, it is important to note that Clatrap is a kind of object resident in memory, which increases the consumption of memory when the number increases.As a result, keep less data in the State as far as possible.

3. What is ValueTask?

   Can pass this.[Understanding The Whys, Whats, and Whens of ValueTask](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)Learn.

EventHandler 实现完成之后，不要忘记对其进行单元测试。这里就不罗列了。

## Sign up for EventHandler.

实现并测试完 EventHandler 之后，便可以将 EventHandler 进行注册，以便与 EventCode 以及 Claptrap 进行关联。

打开 `HelloClaptrap.Actors` 项目的 CartGrain 类。

使用 Attribute 进行标记。

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

关联之后，如果在此 Grain 中产生的对应 EventCode 的事件将会由指定的 EventHandler 进行处理。

## Modify the Grain interface.

修改 Grain 接口的定义，才能够提供外部与 Claptrap 的互操作性。

打开 HelloClaptrap.IActors 项目的 ICartGrain 接口。

添加接口以及 Attribute。

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

其中增加了两部分内容：

1. marked.`ClaptrapEvent.`to associate the event with Grain.Note that here is the previous step.`Claptrap Event Handler.`is different.Event is marked here, and eventHandler is marked in the previous step.
2. Added the RemoveAllItemsAsync method to indicate business behavior of "emptying shopping carts".It is important to note that grain's method definition has certain limitations.Details can be found.[Developing a Grain](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## Implement grain.

接下来按照上一步的接口修改，来修改相应的实现类。

打开 HelloClaptrap.Actors 项目中的 Cart 文件夹下的 CartGrain 类。

添加对应的实现。

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

增加了对接口方法的对应实现。需要注意的有以下几点：

1. Be sure to increase.`if (StateData.Items?? Any() ! . . . . . . . . . . . . . . .`This line of judgment.This can significantly reduce the overhead of storage.

   The event is persistent when executing`Clatrap.HandleEventAsync (evt)`.And as far as the scene here is concerned, if there is otherwise nothing in the shopping cart, emptying or lasting this event is just an increase in overhead, without the actual meaning. Thus, an increase in judgment prior to this can reduce the useless consumption of the storage.

2. Be sure to judge the State as well as whether the incoming parameter meets the conditions for the execution of the event.

   This is different from the one described in the previous point.The previous emphasis on "don't produce meaningless events", and this emphasis on "don't produce events that can not be consume by event handler". In the event-sourcing pattern, the completion of the business is based on the persistence of the event as the basis for the completion of the business determination.That is to say that the event can be thought of as long as it is in storage, it can be considered that this event has been completed. And in EventHandler, you can only accept events that are read out from the persistence layer.At this time, the event can no longer be modified in accordance with the immutability of the event, so be sure to ensure that the event can be consumed by EventHandler.So, it is particularly important to judge before`Clatrap.HandleEventAsync (evt)`. Therefore, a unit test must be realized to ensure that the production of the Event and the processing logic of EventHandler are already covered.

3. Some of the ways to use to some TAP libraries are needed here, see[Task-based asynchronous mode](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap)

## Modify the Controller.

前面的所有步骤完成之后，就已经完成了 Claptrap 的所有部分。但由于 Claptrap 无法直接提供与外部程序的互操作性。因此，还需要在在 Controller 层增加一个 API 以便外部进行“清空购物车”的操作。

打开 HelloClaptrap.Web 项目的 Controllers 文件夹下的 CartController 类。

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

至此，我们就完成了“清空购物车”这个简单需求的所有内容。

您可以从以下地址来获取本文章对应的源代码：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
