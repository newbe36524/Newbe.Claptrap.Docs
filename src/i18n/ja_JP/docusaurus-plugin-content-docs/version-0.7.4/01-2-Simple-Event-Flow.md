---
title: "ステップ 2 - ショッピングカートをクリアする"
description: "ステップ 2 - ショッピングカートをクリアする"
---

この Class Chartp でビジネスを始めるために、これを読んでみてください。

<!-- more -->

:::caution 该文档仅适用于 0.7 及以下版本，若想要查看最新版本内容，请点击右上角进行切换。 :::

## 投稿のまとめ

本篇，我通过实现“清空购物车”的需求来了解一下如何在已有的项目样例中增加一个业务实现。

主要包含有以下这些步骤：

1. Eventのコード
2. Event の定義
3. EventHandlerの実装
4. EventHandlerに登録
5. Grain インターフェースの変更
6. Grain 実装
7. Controller の変更

这是一个从下向上的过程，实际的编码过程中开发也可以自上而下进行实现。

## Event Code の定義

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

## Event の定義

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

## EventHandlerの実装

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

1. NormalEventHandlerとは何ですか？

   NormalEventHandlerはフレームワークが定義される単純な Handlers を実装する。 最初のジェネリック引数は Claptrap 対応する state 型である。より詳細な情報ではなく カートリッジは CartStateという形で行きました 2 番目のパラメーターは、Handlerに処理された Event 型である。

2. `stateData.Items = null;`では`stateData.Items.Clear()` を使用してください。

   state はメモリに保存されたオブジェクトであり、Clear は辞書が使用している内部メモリを小さくしません。普通は一般にカートには 数十万もの商品がありません実際にはstate を更新すべきなのは Claptrap はメモリに常駐しているオブジェクトであり、追加で保持されるということの主な違いである。例えばState で 可能なだけ少ないデータで

3. Value Taskって何？

   [Winderstanding the Whys, Whats, and Whens of ValueTask](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)を使って学べます。

EventHandler 实现完成之后，不要忘记对其进行单元测试。这里就不罗列了。

## EventHandlerに登録

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

## Grain インターフェースの変更

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

1. `ClaptrapEvent`にイベントのGrainでリンクするようにマークされました。ここも、直前の`ClaptrapEventHandler`とは違います。この例では、EventHandler(EventHandler)を配置します。
2. RemoveAllItemsAsyncメソッドを追加し、ショッピングカートをクリアするビジネス行動を示します。Grain メソッドの定義は、特定の制限があることに注意してください。詳細は、[Developing a Grain を参照してください](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## Grain 実装

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

1. 配列を`if (StateData.Items?.Any()!= true)`増やす必要があります。そこを記憶そのものからコストを減らすからです

   イベントは`Claptrap.HandleEventAsync (evt)`を実行すると常に永続化されます。このシーンはここには内容が無いかなく、カートの中身がなくなり、コストを要しないことでもあります。 それ以前は、セーブデータのコストを削減します。

2. state や渡されたパラメーターがイベント実行条件を満たすかどうかを判断します。

   これは上にある方の注意部分とは異なりますまず大きな意味はないイベントであることは否定的です “EventHandlerが出現しない” ということが示されています イベントソース モードにおいて、業務の完了は、事前のインプレッションとして業務の決定に基づく。イベントがある限りライブラリーになればそれで十分だとわかるようになります。 EventHandler中では、イベントのみをインポートすることができます。この時点では、イベントが変わらないため、イベントを変更することはできず、すぐにEventHandlerへのイベントがあることを保証する必要があります。つまり、`Claptrap.HandleEventAsync（evt）`での判断が大切です。 ですから Event 生成と EventHandler のロジックが覆われるように 単体テストを実装する必要があります

3. ここでは、いくつかのTAPライブラリにあるいくつかのメソッドが存在します。簡単に[タスクベースの非同期モード](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap) を参照できます。

## Controller の変更

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

## ミニ投稿

至此，我们就完成了“清空购物车”这个简单需求的所有内容。

您可以从以下地址来获取本文章对应的源代码：

- [GitHub](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
