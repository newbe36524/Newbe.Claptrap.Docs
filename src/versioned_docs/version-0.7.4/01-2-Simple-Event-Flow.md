---
title: "第二步——简单业务，清空购物车"
description: "第二步——简单业务，清空购物车"
---

通过本篇阅读，您便可以开始尝试使用 Claptrap 实现业务了。

<!-- more -->

## 开篇摘要

本篇，我通过实现“清空购物车”的需求来了解一下如何在已有的项目样例中增加一个业务实现。

主要包含有以下这些步骤：

1. 定义 EventCode
2. 定义 Event
3. 实现 EventHandler
4. 注册 EventHandler
5. 修改 Grain 接口
6. 实现 Grain
7. 修改 Controller

这是一个从下向上的过程，实际的编码过程中开发也可以自上而下进行实现。

## 定义 Event Code

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

## 定义 Event

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

## 实现 EventHandler

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

1. NormalEventHandler 是什么？

   NormalEventHandler 是框架定义的一个简单基类，用于方便实现 Handler。
   其中第一个泛型参数是 Claptrap 对应的 State 类型。结合前篇文档中，我们的购物车 State 类型就是 CartState。
   第二个泛型参数是该 Handler 需要处理的 Event 类型。

2. 为什么用`stateData.Items = null;`而不用`stateData.Items.Clear();`

   stateData 是保存在内存中的对象，Clear 不会缩小字典已占用的自身内存。当然，一般一个购物车也不会有数十万商品。但其实关键是在于，更新 State 时，需要注意的是 Claptrap 是一种常驻于内存中的对象，数量增加时会加剧内存的消耗。因此，尽可能在 State 中保持更少的数据。

3. ValueTask 是什么？

   可以通过这篇[《Understanding the Whys, Whats, and Whens of ValueTask》](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)进行了解。

EventHandler 实现完成之后，不要忘记对其进行单元测试。这里就不罗列了。

## 注册 EventHandler

实现并测试完 EventHandler 之后，便可以将 EventHandler 进行注册，以便与 EventCode 以及 Claptrap 进行关联。

打开 HelloClaptrap.Actors 项目的 CartGrain 类。

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

## 修改 Grain 接口

修改 Grain 接口的定义，才能够提供外部与 Claptrap 的互操作性。

打开`HelloClaptrap.IActors`项目的`ICartGrain`接口。

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

1. 标记了`ClaptrapEvent`，使得事件与 Grain 进行关联。注意，这里与前一步的`ClaptrapEventHandler`是不同的。此处标记的是 Event，上一步标记的是 EventHandler。
2. 增加了 RemoveAllItemsAsync 方法，表示“清空购物车”的业务行为。需要注意的是 Grain 的方法定义有一定限制。详细可以参见[《Developing a Grain》](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## 实现 Grain

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

1. 一定要增加`if (StateData.Items?.Any() != true)`这行判断。因为这可以明显的减小存储的开销。

   事件在当执行`Claptrap.HandleEventAsync(evt)`便会持久化。而就此处的场景而言，如果购物车中原本就没有内容，清空或者持久化这个事件只是增加开销，而没有实际的意义。
   因此，在此之前增加判断可以减小存储的无用消耗。

2. 一定要判断 State 以及传入参数是否满足事件执行的条件。

   这与上一点所描述的内容侧重不同。上一点侧重表明“不要产生没有意义的事件”，这一点表明“绝不产生 EventHandler 无法消费的事件”。
   在事件溯源模式中，业务的完成是以事件的持久化完成作为业务确定完成的依据。也就是说事件只要入库了，就可以认为这个事件已经完成了。
   而在 EventHandler 中，只能接受从持久化层读出的事件。此时，按照事件的不可变性，已经无法再修改事件，因此一定要确保事件是可以被 EventHandler 消费的。所以，在`Claptrap.HandleEventAsync(evt)`之前进行判断尤为重要。
   因此，一定要实现单元测试来确保 Event 的产生和 EventHandler 的处理逻辑已经被覆盖。

3. 此处需要使用到一些 TAP 库中的一些方法，可以参见[基于任务的异步模式](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap)

## 修改 Controller

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

## 小结

至此，我们就完成了“清空购物车”这个简单需求的所有内容。

您可以从以下地址来获取本文章对应的源代码：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
