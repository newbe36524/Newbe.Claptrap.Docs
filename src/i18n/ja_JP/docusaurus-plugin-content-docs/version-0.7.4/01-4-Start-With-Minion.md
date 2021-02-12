---
title: '配信が無効となりました'
description: '配信が無効となりました'
---

この Class Chartp でビジネスを始めるために、これを読んでみてください。

<!-- more -->

## 投稿のまとめ

この本は、既存のプロジェクトケースを使用して注文を行う必要性を理解し、非同期のビジネス処理を完了する方法について学ぶことができます。

まずは、本プログラムの関連例を示します。：

1. ユーザーは注文を行うことができ、注文を行うと、現在のショッピングカートにあるすべてのSKUによる注文が作成されます。
2. 注文になった後にSKUによる在庫が差し引かれます。SKU が在庫不足の場合、注文は失敗します。
3. 注文操作は在庫が減少するまでのみ有効であり、今後の手順については議論を必要としません。注文は正常に作成されたあと、データベースに登録されたすべての注文レコードを生成し、注文作成が終了します。

この論文はMinion で使用されていますが、新しいOrderGrain オブジェクトが必要です。そのため、前の論文に「Claptrap」という専門的な知識が必要です。

Minion は要りの Claptrap です。その MasterClaptrap との関係はこちらから：

![ミニオン](/images/20190228-002.gif)

主要な開発プロセスは Claptrap と同じく、削除された。適用先：

| ステップ                       | Claptrap | ミニオン |
| -------------------------- | -------- | ---- |
| ClaptrapTypes の定義          | √        | √    |
| state を定義します。              | √        | √    |
| Grain インターフェースの定義          | √        | √    |
| Grain 実装                   | √        | √    |
| Grain に登録                  | √        | √    |
| Eventのコード                  | √        |      |
| Event の定義                  | √        |      |
| EventHandlerの実装            | √        | √    |
| EventHandlerに登録            | √        | √    |
| 実装IInitialStateDataFactory | √        | √    |

これを削除すると、マイコンは Mintion が Claptrap の顧客によって行われるので、イベントに関する定義は処理されません。でも他の部分は必須です

> この章から、あるファイルの場所を一覧に組み込んでみて、熟練のマスタリーに応じてプログラム内で確認していきましょう。

## 実装のOrderGrain

ご注文を表す「Claptrap」という定義について記載された知識から、注文を表すOrderGrain を実装しました。保存費用の部分については重要な一部のみ示しています。

### OrderState

注文ステータスを定義：

```cs
using System.Collections.Generic;
using Newbe.Claptrap;

namespace ハロークラップ.Models rder
{
    public class OrderState : IStateData
    {
        public bool OrderCreated { get; set; }
        public string UserId { get; set; set; }
        public Dictionary<string, int> Skus { get; set; }
    }

```

1. 注文が既に作成されているか、重複注文の作成を避けてください
2. ユーザー ID のユーザー ID
3. Skus注文にSkuId と注文があります。

### OrderCreatedEvent

注文作成イベントは以下のように設定されます：

```cs
using System.Collections.Generic;
using Newbe.Claptrap;

namespace Helloe Claptrap.Models.Order. vents
{
    public class OrderCreatedEvent : IEventData
    {
        public string UserId { get; set; }
        public Dictionary<string, int> Skus { get; set; }
    }

```

### システム設定

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
            var cartGrain = _grainFactory.GetGrain<ICartGrain>(input.CartId);
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
            var evt = this.CreateEvent(new OrderCreatedEvent
            {
                UserId = input.UserId,
                Skus = items
            });
            await Claptrap.HandleEventAsync(evt);
        }
    }
}
```

1. 注文処理における注文に関するコアロジックを実装します。CreateOrderAsync はカートデータを取り込み、在庫減算に関係する処理を裏付けています。
2. OrderCreatedEvent 実装の成功後に、State に関連したフィールドを更新します。これは、今後は表示されません。

## Minion から注文データをデータベースに保存する

指定されたコレクションからは、データベースへの参照の無い操作があります。Claptrap フレームワークを使用する時、ほとんどのアクションが「イベント書き込み」と「状態の更新」が行われているため、完全にデータベース操作を行う必要はなくなりました。

クラプスは基本的にシングルボディオブジェクトに対応するものであるといいます(注文・SKU、ショッピングカートなどのすべての注文・ボディ内のデータへのアクセス。すべての注文・SKU、すべての注文による注文データ。これによりstateデータの永続化は、さまざまな永続化オブジェクト（データベース、ファイル、キャッシュなど）に行われる。

Claptrap フレームワークで Minion の概念を導入した。

次に、OrderbGrain (1つの Minion)を使用して注文を非同期してライブラリでの注文処理を検査します。

## ClaptrapTypes の定義

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

+         public const string OrderDbGrain = "db_order_claptrap_newbe";

          #endregion
      }
  }
```

Mineは非常に特殊なクラプです これはClaptrapの一種で Claptrap のことですClaptrapTypes は Claptrap の順番に必要です。

## state を定義します。

このサンプルでは、state にデータをデータベースに書き込むだけで何も行えません。したがって、この例では、実際には必要はありません。

## Grain インターフェースの定義

```cs
+using HelloClaptrap.Model;
+ using Newbe.Claptrap;
+ using Newbe.Class.クラッパ。 rleans;
+
+ namespace HelloClaptrap.IActor
+ {
+ [ClaptrapMinion(ClaptrapCodes) rderGrain)]
+ [ClaptrapStates : typeof(NoneStateData), Class: RderbGrain)]
+ public interface IOrderDbGrain : IClaptrapMinion
+ {
+ }
+ }
```

1. クラプト意識は Grain は Minium に対応する クラスのコードに対応する Claptraps です。
2. ClaptrapState は Claptrap の State データの型を指定できます。前のステップでは、MineDataはStateDataを必要としないことが分かり、NoneStateデータというフレームワークの型を置き換えることを示した。
3. IClaptrapMinionGrain との違いは、IClaptrapGrain の Minion ポートの違いである。Grain が Minion なら、インターフェースを引き継ぐ必要があります。
4. ClaptrapCodes.OrderGrain と ClaptrapCodes.OrderbGrain は二つの文字列です。読者が星宗師ではないことを希望します。

> 星間宗師：星間争覇の試合速度による ピリオットやゲーマーの質素な情報などにより容易な情報を持っているため、選手は目の前後の肝心なイベントが発生しないと、おかしい。プレイヤーたちはのひらめき(今まで本気で目隠し者とプロの対決）を放ち、能力が高い程、目立った選手の無色の盲人を目指していた。

## Grain 実装

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
+     [ClaptrapEventHandler(typeof(OrderCreatedEventHandler), ClaptrapCodes.OrderCreated)]
+     public class OrderDbGrain : ClaptrapBoxGrain<NoneStateData>, IOrderDbGrain
+     {
+         public OrderDbGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
+             : base(claptrapGrainCommonService)
+         {
+         }
+
+         public async Task MasterEventReceivedAsync(IEnumerable<IEvent> events)
+         {
+             foreach (var @event in events)
+             {
+                 await Claptrap.HandleEventAsync(@event);
+             }
+         }
+
+         public Task WakeAsync()
+         {
+             return Task.CompletedTask;
+         }
+     }
+ }
```

1. MasterEventReceivedAsync は IClaptrapMinionGrain メソッドであり、MasterClaptrap からイベント通知を受け取ります。上記で実装されていないノートはテンプレートで実装されています。
2. WakeAsync は IClaptrapMinionGrain メソッドによって定義されており、マスターClaptrap よりアクティブな操作であることを示します。上記で実装されていないノートはテンプレートで実装されています。
3. これを聞いた人がソースを読んでいれば、そのクラスは単一のアプリケーションコンポーネントとして定義されるでしょう。これは、Minion と MasterClap を 2 つのカテゴリーに配置したカテゴリのいずれかのカテゴリのいずれかに置けるための方法です。実際は全く問題ないものでした

## Grain に登録

このディレクトリはシステム別のアプリケーションセットとしてOrderbGrain を定義しているので、コードを追加登録する必要があります。：

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
              var logger = NLogBuilder.ConfigureNLog("nlog.config").GetCurrentClassLogger();
              try
              {
                  logger.Debug("init main");
                  CreateHostBuilder(args).Build().Run();
              }
              catch (Exception exception)
              {
                  //NLog: catch setup errors
                  logger.Error(exception, "Stopped program because of exception");
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
                  .ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); })
                  .UseClaptrap(
                      builder =>
                      {
                          builder
                              .ScanClaptrapDesigns(new[]
                              {
                                  typeof(ICartGrain).Assembly,
                                  typeof(CartGrain).Assembly,
+                                 typeof(OrderDbGrain).Assembly
                              })
                              .ConfigureClaptrapDesign(x =>
                                  x.ClaptrapOptions.EventCenterOptions.EventCenterType = EventCenterType.OrleansClient);
                      },
                      builder => { builder.RegisterModule<RepositoryModule>(); })
                  .UseOrleansClaptrap()
                  .UseOrleans(builder => builder.UseDashboard(options => options.Port = 9000))
                  .ConfigureLogging(logging =>
                  {
                      logging.ClearProviders();
                      logging.SetMinimumLevel(LogLevel.Trace);
                  })
                  .UseNLog();
      }
  }
```

## EventHandlerの実装

```cs
+ using System.Threading.Tasks;
+ using Hellop.Models.Order.Events;
+ using Helloptrap.Repository;
+ using Newbe.Claptrap;
+ using Newtonsoft.Json;
+
+ namespace Helptrap.Actors.Actors.Dbrap.Order. vents
+ {
+ public class OrderCreatedEventHandler
+ : NormalEventHandler<NoneStateData, OrderCreatedEvent>
+ {
+ private readonly IorderRepository Repository;
+
+ public OrderCreatedEventHandler(
+ IorderRepositorderRepository)
+ {
+ _orderRepository = ordsitory;
+ }
+
+ public override asyncValueTask HandleEvent(NoneStateData,
+ 注文用CreatedEvent Data,
+ IEvent Context)
+ {
+ var orderId = eventContext。 tate.Identity.Id;
+ await _orderRepository.SaveAsync(eventData.UserId, orderId, JsonConvert. erializeObject(eventData.Skus));
+ }
+ }
+ }
```

1. IKriderRepositorはストレージ上のインターフェイスを直接実装し、注文の詳細削除に利用する。このインターフェイスは、データベースへのオープンデータベース操作を実装する。

## EventHandlerに登録

実際のところ Grain' 章の章の一部を達成したのがわかりました。

## 実装IInitialStateDataFactory

StateData はIInitialStateDataFactoryを実装すべきではないからである。

## Controller の変更

サンプルの場合、注文とクエリのため、OrderController を加えました。読者はソースから参照できます。

読者の方は、この手順で実際の効果テストに使用できます：

1. POST `/api/cart/123` {"skuId":"yueluo-666","count"30} は123便に 30単位の yueluo-666 を圧縮しました。
2. POST `/api/order` {"userId":"999","cartId"123"} カートから999 userId として発注されました。
3. GET `/api/order` による注文は、この API で注文された注文が表示されます。
4. GET `/api/sku/yueluo-666` はSKU API で注文された在庫数を閲覧することができます。

## ミニ投稿

ここで「もの注文に対する要望のベース」が完成しましたこの例では、複数のクラスの Claptrap が協調の方法を把握し、Minion 処理を非同期タスクにする方法について知ることができます。

しかし、他にも疑問があります。議論をここにもなります。

この記事に対応するソースコードを取得することができます：

- [GitHub](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
