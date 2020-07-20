---
title: 'ステップ2 - シンプルなビジネス、ショッピングカートを空にします。'
metaTitle: 'ステップ2 - シンプルなビジネス、ショッピングカートを空にします。'
metaDescription: 'ステップ2 - シンプルなビジネス、ショッピングカートを空にします。'
---

この読み取りでは、Claptrap を使用してビジネスを開始できます。

> [現在表示されているバージョンは、機械が簡体字中国語から翻訳され、手動校正の結果です。ドキュメントに不適切な翻訳がある場合は、こちらをクリックして翻訳提案を提出してください。](https://crwd.in/newbeclaptrap)

<!-- more -->

## 概要を開始します。

この記事では、"ショッピング カートを空にする" という要件を実装することで、既存のプロジェクト サンプルにビジネス実装を追加する方法について説明します。

主に、次の手順が含まれています。：

1. EventCode を定義します。
2. イベントを定義します。
3. EventHandler を実装します。
4. EventHandler に登録します。
5. Grain インターフェイスを変更します。
6. Grainを実装。
7. Controller を変更します。

これはボトムアップのプロセスであり、実際のコーディング プロセスの開発はトップダウンで実装できます。

## イベント コードを定義します。

EventCode は、Claptrap システムの各イベントの唯一のエンコーディングです。イベントの識別、シリアル化に重要な役割を果たします。

開きます。`HelloClaptrap.Models.`プロジェクト内。`ClaptrapCodes.`クラス。

"ショッピング カート イベントを空にする" の EventCode を追加します。

```cs
  namespace HelloClaptrap.Models.
  {
      public static class ClaptrapCodes.
      {
          public const string CartGrain = "cart_claptrap_newbe";
          プリヴァトコンスト string CartEventSuffix = "_e_" + CartGrain;
          public const string AddItemToCart = "addItem" + CartEventSuffix;
          public const string RemoveItemFromCart = "removeItem" + CartEventSuffix;
+ public const string RemoveAllItemsFromCart = "remoeAllItems" + CartEventSuffix;
      }
  }
```

## イベントを定義します。

Event は、イベントのトレースの鍵です。Claptrap でステートを変更するために使用します。Event は永続化レイヤーに永続化されます。

」`HelloClaptrap.Models.`プロジェクト。`カート/Events.`フォルダの下に作成します。`RemoveAllItemsFromCartEvent。`クラス。

次のようなコードを追加します。：

```cs
@ using Newbe.Claptrap;
+
+namespace HelloClaptrap.Models.Cart.Events.
+ {
+ public class RemoveAllItemsFromCartEvent : IEventData.
+     {
+     }
+ }
```

この単純なビジネス シナリオでは、ショッピング カートを空にする場合は、特定のパラメータは必要ありません。したがって、空の型を作成するだけです。

`IEventData。`インターフェイスは、ジェネリックが推論されるときに使用されるイベントを表すフレームワーク内の空のインターフェイスです。

## EventHandler を実装します。

`EventHandler.`イベントを Claptrap に更新するために使用されます。`ステート。`上。たとえば、このビジネス シナリオでは、EventHandler はステート カートのコンテンツを空にする責任があります。

」`HelloClaptrap.Actors.`プロジェクト。`カート/Events.`フォルダの下に作成します。`RemoveAllItemsFromCartEventHandler.`クラス。

次のようなコードを追加します。：

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Cart;
+ using HelloClaptrap.Models.Cart.Events;
@ using Newbe.Claptrap;
+
+namespace HelloClaptrap.Actors.Cart.Events.
+ {
+ public class RemoveAllItemsFromCartEventHandler.
+ : NormalEventHandler.<CartState, RemoveAllItemsFromCartEvent>
+     {
+ public override ValueTask HandleEvent (CartState stateData,
+ RemoveAllItemsFromCartEvent eventData,
+ IEventContext eventContext)
+         {
+ stateData.Items = null;
+ return new ValueTask();
+         }
+     }
+ }
```

ここではいくつかの一般的な問題があります。：

1. ノルマル・ヴェント・ハンドラーとは?

   NormalEventHandler は、Handler の実装を容易にするためのフレームワーク定義の単純な基本クラスです。 最初のジェネリック 引数は、Claptrap に対応する State 型です。前のドキュメントと組み合わせると、ショッピング カートの状態タイプは CartState です。 2 番目のジェネリック パラメーターは、Handler が処理する必要がある Event 型です。

2. なぜ使用される。`stateData.Items = null;`使用せずに。`stateData.Items.Clear();`

   stateData はメモリに保持されるオブジェクトであり、Clear はディクショナリが占有する自身のメモリを縮小しません。もちろん、一般的なショッピングカートは、商品の数十万を持っていることはありません。しかし、実際には、State を更新する際には、Claptrap がメモリに常駐するオブジェクトであり、数が増えるとメモリの消費量が増加することに注意してください。したがって、できるだけ少ないデータを State で保持します。

3. ValueTaskとは何ですか?

   この1を介して行うことができます。["ウンダースタンディング the Whys, Whats, and Whens of ValueTask"](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)理解を取る。

EventHandler 実装が完了したら、単体テストすることを忘れないでください。ここにはリストはありません。

## EventHandler に登録します。

EventHandler を実装してテストしたら、EventHandler を登録して、EventCode と Claptrap に関連付けることができます。

開きます。`HelloClaptrap.Actors.`プロジェクト。`カートグライン`クラス。

タグは Attribute で使用します。

```cs
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Cart.
  {
      [ClaptrapEventHandler(typeof(AddItemToArtEventHandler), ClaptrapCodes.AddItemToCart]
      [ClaptrapEventHandler(typeof(RemoveItemFromCartEventHandler),ClaptrapCodes.RemoveItemFromCart]
+ [ClaptrapEventHandler (typeof(RemoveAllItemsFromCartEventHandler), ClaptrapCodes.RemoveAllItemsFromCart)]
      public class CartGrain : ClaptrapBoxGrain.<CartState>、ICartGrain.
      {
          public CartGrain(
              IClaptrapGrainCommonService claptrapGrainCommonService)
              : ベース (claptrapGrainCommonService)
          {
          }

....
```

`ClaptrapEventHandlerAttribute。`は、EventHandler、EventCode、ClaptrapGrain の 3 つの関連付けを実装するために Grain の実装クラスにタグ付けできるフレームワーク定義の Attribute です。

関連付けの後、この Grain で生成された対応する EventCode のイベントは、指定された EventHandler によって処理されます。

## Grain インターフェイスを変更します。

Grain インターフェイスの定義を変更して、Claptrap との外部相互運用性を提供します。

開きます。`HelloClaptrap.IActors.`プロジェクト。`ICartGrain`インターフェイス。

Attribute と同様にインターフェイスを追加します。

```cs
  using System.Collections.Generic;
  using System.Threading.Tasks;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Cart;
  using HelloClaptrap.Models.Cart.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.IActor.
  {
      [ClaptrapState(typeof(CartState),ClaptrapCodes.CartGrain) ]
      [ClaptrapEvent(typeof(AddItemToCartEvent), ClaptrapCodes.AddItemToCart]に
      [ClaptrapEvent (typeof(RemoveItemFromCartEvent), ClaptrapCodes.RemoveItemFromCart]]
+ [ClaptrapEvent (typeof(RemoveAllItemsFromCartEvent), ClaptrapCodes.RemoveAllItemsFromCart]]
      public interface ICartGrain : IClaptrapGrain.
      {
          Task.<Dictionary<string, int>> AddItemAsync (string skuId, int count);
          Task.<Dictionary<string, int>> RemoveItemAsync (string skuId, int count);
          Task.<Dictionary<string, int>> GetItemsAsync();
+ Task RemoveAllItemsAsync();
      }
  }
```

内容の2つの部分が追加されました。：

1. マーク。`ClaptrapEvent.`を使用して、イベントを Grain に関連付けます。注意してください、ここでは前のステップで。`ClaptrapEventHandler.`異なっている。ここでマークされたのは Event で、前のステップでは EventHandler がマークされます。
2. RemoveAllItemsAsync メソッドが追加され、"ショッピング カートを空にする" というビジネス行動を表します。Grain のメソッド定義には一定の制限があります。詳細は参照できます。[デベロピン a Grain](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## Grainを実装。

次に、前の手順のインターフェイスに従って、対応する実装クラスを変更します。

開きます。`HelloClaptrap.Actors.`プロジェクト内。`カート`フォルダの下。`カートグライン`クラス。

対応する実装を追加します。

```cs
  using システム;
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

  namespace HelloClaptrap.Actors.Cart.
  {
      [ClaptrapEventHandler(typeof(AddItemToArtEventHandler), ClaptrapCodes.AddItemToCart]
      [ClaptrapEventHandler(typeof(RemoveItemFromCartEventHandler),ClaptrapCodes.RemoveItemFromCart]
      [ClaptrapEventHandler (typeof(RemoveAllItemsFromCartEventHandler), ClaptrapCodes.RemoveAllItemsFromCart)]
      public class CartGrain : ClaptrapBoxGrain.<CartState>、ICartGrain.
      {
          public CartGrain(
              IClaptrapGrainCommonService claptrapGrainCommonService)
              : ベース (claptrapGrainCommonService)
          {
          }

+ public Task RemoveAllItemsAsync()
+         {
+ if (StateData.Items?) Any() != true)
+             {
+ return Task.CompletedTask;
+             }
+
+ var removeAllItemsFromCartEvent = new RemoveAllItemsFromCartEvent();
+ var evt – this. CreateEvent (removeAllItemsFromCartEvent);
+ return Claptrap.handleEventAsync (evt);
+         }
      }
  }
```

インターフェイス メソッドの対応する実装が追加されました。注意すべき点は、次のとおりです。：

1. 増やすようにしてください。`if (StateData.Items?) Any() != true)`この行は判断します。これは、ストレージのオーバーヘッドを大幅に削減できるためです。

   イベントが実行されます。`Claptrap.HandleEventAsync(evt)`それは持続します。そして、ここでのシナリオでは、ショッピング カートにコンテンツがない場合、イベントを空にするか永続化するか、または実際の意味なしでオーバーヘッドを増加させるだけです。 したがって、その前に判断を増やすことは、ストレージの無駄な消費を減らすことができます。

2. State と、渡されたパラメーターがイベント実行の条件を満たしているかどうかを判断することが重要です。

   これは、前のポイントで説明した内容とは異なります。前のポイントは、「意味のないイベントを生成しない」という点に焦点を当て、「EventHandler が消費できないイベントを決して発生させないでください」と示しました。 イベント トレーサビリティ モデルでは、ビジネスの完了は、ビジネス決定の基礎としてイベントの永続化によって完了されます。つまり、イベントがライブラリに格納されている限り、イベントは完了したと見なすことができます。 EventHandler では、永続化レイヤーから読み取ったイベントのみを受け入れることができます。この時点では、イベントの不変性に応じてイベントを変更できないため、イベントが EventHandler によって消費されることを確認することが重要です。だから、で。`Claptrap.HandleEventAsync(evt)`以前の判断は特に重要です。 したがって、単体テストを実装して、Event の生成と EventHandler の処理ロジックが上書きされるようにすることが重要です。

3. ここでは、いくつかの TAP ライブラリで使用するメソッドをいくつか参照してください。[タスク ベースの非同期モード。](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap)

## Controller を変更します。

Claptrap のすべての部分は、前のすべての手順が完了すると完了しました。しかし、Claptrap は外部プログラムとの相互運用性を直接提供できないためです。したがって、外部で "ショッピング カートを空にする" 操作のために、Controller 層に API を追加する必要があります。

開きます。`HelloClaptrap.Web.`プロジェクト。`アクサー`フォルダの下。`CartController`クラス。

```cs
  using System.Threading.Tasks;
  using HelloClaptrap.IActor;
  using Microsoft.AspNetCore.Mvc;
  using Orleans;

  namespace HelloClaptrap.web.Controllers.
  {
      [ルート("api/[controller]")]
      public class CartController : Controller.
      {
          プリヴァト・readonly IGrainFactory _grainFactory;

          public CartController(
              IGrainFactory grainFactory)
          {
              _grainFactory = grainFactory;
          }

+ [HttpPost("{id}/clean")]
+ public async Task.<IActionResult> RemoveAllItemAsync (int id)
+         {
+var cartGrain + _grainFactory.GetGrain.<ICartGrain>(id. ToString();
+ await cartGrain.RemoveAllItemsAsync();
+ return Json ("clean success") )
+         }
      }
  }
```

## 小結び目

これで、単純な要件である「カートを空にする」のすべてを完了しました。

この記事に対応するソースコードは、以下のアドレスから入手できます。：

- [Github。](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [ジギエ](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
