---
title: "ステップ 2 - ショッピングカートをクリアする"
description: "ステップ 2 - ショッピングカートをクリアする"
---

この Class Chartp でビジネスを始めるために、これを読んでみてください。

<!-- more -->

## 投稿のまとめ

本「カートを切り換える」要求を使って、既存のプロジェクトサンプルに新しいビジネス実装を追加する方法を確認できます。

主なプロセスは以下のステップです：

1. Eventのコード
2. Event の定義
3. EventHandlerの実装
4. EventHandlerに登録
5. Grain インターフェースの変更
6. Grain 実装
7. Controller の変更

これは、下方向からのプロセスであり、実際のコーディング処理は開発されうる。

## Event Code の定義

EventCode はクラスの秘密コードです。これは事件の識別、順序化といった面で重要である。

`HelloClaptrap.Models`プロジェクトで`ClaptrapCodes`クラスを開きます。

カートのイベントを追加|EventCodeを追加します。

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

イベントバックスタルの鍵です。Claptrap 内の state を変えるためのStateです。この処理では永続化されて永続的に維持されます。

`RemoveAllItemsFromCartEvent`クラスは、`HelloClaptrap.Models  プロジェクトの Cart/Events`フォルダの下に します。

以下のコードを追加：

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

このシンプルなビジネスシーンからショッピングカートを一掃する必要があるので、特定のパラメーターはありません空の型を作成するだけです。

`IEventData`接口是框架中表示事件的空接口，用于在泛型推断时使用。

## EventHandlerの実装

EventHandlerはイベントを Claptrap の state への更新に使用します。例えばこのビジネスシーンのケースは、State カートの中身を消去するため、

`HelloClaptrap.Actors`プロジェクトの`Cart/Events`フォルダの下に`RemoveAllItemsFromCartEventHandler`します。

以下のコードを追加：

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

よくある質問：

1. NormalEventHandlerとは何ですか？

   NormalEventHandlerはフレームワークが定義される単純な Handlers を実装する。 最初のジェネリック引数は Claptrap 対応する state 型である。より詳細な情報ではなく カートリッジは CartStateという形で行きました 2 番目のパラメーターは、Handlerに処理された Event 型である。

2. `stateData.Items = null;`では`stateData.Items.Clear()` を使用してください。

   state はメモリに保存されたオブジェクトであり、Clear は辞書が使用している内部メモリを小さくしません。普通は一般にカートには 数十万もの商品がありません実際にはstate を更新すべきなのは Claptrap はメモリに常駐しているオブジェクトであり、追加で保持されるということの主な違いである。例えばState で 可能なだけ少ないデータで

3. Value Taskって何？

   [Winderstanding the Whys, Whats, and Whens of ValueTask](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)を使って学べます。

EventHandlerは完成したら、単体テストを忘れずに完了します。一覧に一覧が表示されません．

## EventHandlerに登録

EventHandlerをテストするにはEventHandlerを設定してください。そして、EventのHandlerはEventのクラスとClassifptrapを実行することができます。

打开 `HelloClaptrap.Actors` 项目的 CartGrain 类。

Attributeで印付ける

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

そして、 Grain から発生したイベントったら EventCode は EventHandlerが使用されるでしょう。

## Grain インターフェースの変更

Grain インターフェイスの定義を編集し、Claptrap との相互運用性を表示します。

打开`HelloClaptrap.IActors`项目的`ICartGrain`接口。

インタフェースと属性を追加します。

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

2つ目を追加しました：

1. `ClaptrapEvent`にイベントのGrainでリンクするようにマークされました。ここも、直前の`ClaptrapEventHandler`とは違います。この例では、EventHandler(EventHandler)を配置します。
2. RemoveAllItemsAsyncメソッドを追加し、ショッピングカートをクリアするビジネス行動を示します。Grain メソッドの定義は、特定の制限があることに注意してください。詳細は、[Developing a Grain を参照してください](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## Grain 実装

上でどのようなインターフェースでも変更して、対応するクラスを変更します。

`HelloClaptrap.Actors`プロジェクトの`Cart`フォルダの下にある`CartGrain`します。

対応する実装の追加

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

本番環境へ導入する場合の実装も向上する。注意が必要なのは下記はいくつかありました：

1. 配列を`if (StateData.Items?.Any()!= true)`増やす必要があります。そこを記憶そのものからコストを減らすからです

   イベントは`Claptrap.HandleEventAsync (evt)`を実行すると常に永続化されます。このシーンはここには内容が無いかなく、カートの中身がなくなり、コストを要しないことでもあります。 それ以前は、セーブデータのコストを削減します。

2. state や渡されたパラメーターがイベント実行条件を満たすかどうかを判断します。

   これは上にある方の注意部分とは異なりますまず大きな意味はないイベントであることは否定的です “EventHandlerが出現しない” ということが示されています イベントソース モードにおいて、業務の完了は、事前のインプレッションとして業務の決定に基づく。イベントがある限りライブラリーになればそれで十分だとわかるようになります。 EventHandler中では、イベントのみをインポートすることができます。この時点では、イベントが変わらないため、イベントを変更することはできず、すぐにEventHandlerへのイベントがあることを保証する必要があります。つまり、`Claptrap.HandleEventAsync（evt）`での判断が大切です。 ですから Event 生成と EventHandler のロジックが覆われるように 単体テストを実装する必要があります

3. ここでは、いくつかのTAPライブラリにあるいくつかのメソッドが存在します。簡単に[タスクベースの非同期モード](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap) を参照できます。

## Controller の変更

前の手順すべてが完成した後、その前の手順でクラス全員の Claptrap を表示します。Claptrapにより外部プログラムとの相互運用性を提供できないため。そこでコントロールするには Controller の上に API を追加する必要があります。

`elloClaptrap.Web`プロジェクトの`Controllers`フォルダの下にある`CartController`します。

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

それでは、 「カートをクリア」こそ全てが完成しました。

この記事に対応するソースコードを取得することができます：

- [GitHub](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
