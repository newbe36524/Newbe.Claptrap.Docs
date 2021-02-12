---
title: 'ステップ2 - シンプルなビジネス、ショッピングカートを空にします'
description: 'ステップ2 - シンプルなビジネス、ショッピングカートを空にします'
---

この記事では、Claptrap を使用してビジネスを開始できます。

<!-- more -->

## オープダイジェスト

この記事では、"ショッピング カートを空にする" という要件を実装することで、既存のプロジェクト サンプルにビジネス実装を追加する方法について説明します。

主に次の手順が含まれます：

1. EventCode を定義します
2. Event を定義します
3. EventHandler を実装します
4. EventHandler を登録します
5. Grain インターフェイスを変更します
6. Grain を実装します
7. Controllerを変更します

これは下から上へのプロセスであり、実際のコーディング プロセスの開発もトップダウンで実装できます。

## Event Code を定義します

EventCode は、Claptrap システムの各イベントの一意のエンコーディングです。これは、イベントの識別、シリアル化などにおいて重要な役割を果たします。

`HelloClaptrap.Models`プロジェクトの`ClaptrapCodes`します。

[ショッピング カート イベントを空にする] の EventCode を追加します。

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

## Event を定義します

Event は、イベントのトレーサビリティの鍵です。Claptrap の State を変更するために使用します。また、Event は永続化レイヤーに永続化されます。

`RemoveAllItemsFromCartEvent`クラスは、`HelloClaptrap.Models  プロジェクトの Cart/Events`フォルダの下に します。

次のようなコードを追加します：

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

この単純なビジネス シナリオでは、ショッピング カートを空にする特定のパラメーターは必要ありません。したがって、空の型を作成するだけです。

`IEventData`インターフェイスは、ジェネリック推論で使用されるフレームワーク内のイベントを表す空のインターフェイスです。

## EventHandler を実装します

EventHandlerはイベントを Claptrap の state への更新に使用します。たとえば、今回のビジネス シナリオでは、EventHandler が State ショッピング カートの内容を空にする責任があります。

`HelloClaptrap.Actors`プロジェクトの`Cart/Events`フォルダの下に`RemoveAllItemsFromCartEventHandler`します。

次のようなコードを追加します：

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

ここでは、いくつかの一般的な質問があります：

1. NormalEventHandlerとは何ですか?

   NormalEventHandler は、Handler の実装を容易にするフレームワーク定義の単純な基本クラスです。 最初のジェネリック パラメーターは、Claptrap に対応する State 型です。前のドキュメントと組み合わせると、ショッピング カート State の種類は CartState です。 2 番目のジェネリック パラメーターは、Handler が処理する必要がある Event 型です。

2. `stateData.Items = null を使用する理由。`stateData.Items.Clear() を`せずに、`

   stateData はメモリに保持されるオブジェクトであり、Clear はディクショナリが占有している自身のメモリを縮小しません。もちろん、一般的に1つのショッピングカートには数十万の商品はありません。ただし、State を更新する場合、Claptrap はメモリに常駐するオブジェクトであり、量が増するとメモリの消費が増加する可能性があります。したがって、State ではできるだけ少ないデータを保持します。

3. ValueTaskとは何ですか?

   この記事[understanding the Whys, Whats, and Whens of ValueTask"](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)できます。

EventHandler の実装が完了したら、単体テストを行うのを忘れないでください。ここではリストしません。

## EventHandler を登録します

EventHandler を実装してテストしたら、EventCode と Claptrap に関連付ける前に EventHandler を登録できます。

`HelloClaptrap.Actors`プロジェクトの`CartGrain`します。

タグに Attribute を使用します。

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

`ClaptrapEventHandlerAttribute`は、EventHandler 、 EventCode 、および ClaptrapGrain の 3 つの関連付けを実現するために Grain の実装クラスにタグ付けできるフレームワーク定義の Attribute です。

関連付け後、この Grain で発生した EventCode に対応するイベントは、指定された EventHandler によって処理されます。

## Grain インターフェイスを変更します

Grain インターフェイスの定義を変更して、外部と Claptrap の相互運用性を提供します。

打开 HelloClaptrap.IActors 项目的 ICartGrain 接口。

インターフェイスと Attribute を追加します。

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

これには 2 つの部分が追加されます：

1. イベントを grain`関連付けるには、`ClaptrapEvent ファイルをマークします。ここでは、 ClaptrapEventHandler`前の手順とは`異なります。ここでマークされたのは Event で、前のステップは EventHandler でマークされています。
2. RemoveAllItemsAsync メソッドが追加され、"ショッピング カートを空にする" というビジネス動作を表します。Grain のメソッド定義には制限があります。詳細については、[Developing a Grain を参照](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## Grain を実装します

次に、前の手順のインターフェイスの変更に従って、対応する実装クラスを変更します。

`HelloClaptrap.Actors`プロジェクトの`Cart`フォルダの下にある`CartGrain`します。

対応する実装を追加します。

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

インターフェイス メソッドの対応する実装が追加されます。注意すべき点は次：

1. `if (StateData.Items?. Any() != true)`行で判断できます。これにより、ストレージのオーバーヘッドが大幅に削減されます。

   イベントは、`Claptrap.HandleEventAsync(evt)`に永続化されます。ここでのシナリオでは、ショッピング カートにコンテンツがない場合、イベントを空にしたり永続化したりすると、オーバーヘッドが増加し、実用的な意味はありません。 したがって,それまで判定を増やすことで,メモリの無駄な消費を減らすことができます.

2. State と渡された引数がイベント実行の条件を満たしているかどうかを判断してください。

   これは、前のポイントで説明した内容とは異なります。前のポイントは、「意味のないイベントを生成しない」という意味に焦点を合わし、「EventHandler が消費できないイベントを生成しない」ことを示しています。 イベント トレーサビリティ パターンでは、ビジネスの完了は、ビジネスの決定の完了の基礎として、イベントの永続的な完了に基づいています。つまり、イベントがライブラリ化されている限り、イベントは完了したと見なされます。 EventHandler では、永続化レイヤーから読み取ったイベントのみを受け入れることができます。この時点では、イベントの不変性に応じてイベントを変更できないため、EventHandler でイベントを消費することを確認してください。したがって、`claptrap.HandleEventAsync(evt)`を実行する前に判断することが特に重要です。 したがって、Event の生成と EventHandler の処理ロジックが上書きされていることを確認するために、単体テストを実装する必要があります。

3. ここでは、いくつかの TAP ライブラリで使用する必要があるメソッドについては、「タスク ベースの非同期[」を参照してください](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap)

## Controllerを変更します

前のすべての手順が完了すると、Claptrap のすべての部分が完了します。ただし、Claptrap は外部プログラムとの相互運用性を直接提供できません。したがって、外部で 「ショッピング カートを空にする」ための API を Controller 層に追加する必要があります。

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

## 小さな結び目

これで、ショッピング カートを空にする単純な要件がすべて完了しました。

この記事のソース コードは、次のアドレスから入手できます：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
