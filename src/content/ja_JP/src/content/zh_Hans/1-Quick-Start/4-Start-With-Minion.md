---
title: 'ステップ4 - ミニオンを使用して、商品を注文します。'
metaTitle: 'ステップ4 - ミニオンを使用して、商品を注文します。'
metaDescription: 'ステップ4 - ミニオンを使用して、商品を注文します。'
---

この記事を読んで、Claptrap を使用してビジネスを実装する方法を試す準備ができます。

> [現在表示されているバージョンは、簡体字中国語から機械翻訳され、手動校正の結果です。ドキュメントに不適切な翻訳がある場合は、ここをクリックして翻訳提案を送信してください。](https://crwd.in/newbeclaptrap)

<!-- more -->

## 概要を開始します。

この記事では、既存のプロジェクト サンプルで Minion を使用して非同期ビジネス処理を実行する方法について説明します。

まず、この記事でカバーする必要があるビジネス ユース ケースについて説明します：

1. ユーザーは、現在のショッピング カート内のすべての SKU を使用して注文を作成するときに注文を行うことができます。
2. 関連する SKU の在庫は、注文後に差し引かれます。SKU 在庫が不足している場合、注文は失敗します。
3. 注文操作は、在庫の控除が成功するまでのみ行い、次の手順では、このサンプルのスコープは必要ありません。したがって、このサンプルでは、注文が正常に行った後、注文の作成が終了したことを示す注文レコードがデータベースに生成されます。

この記事では Minion の使用に重点を置いていますが、新しい OrderGrain オブジェクトを使用する必要があるため、前の「Claptrap の定義」に関する知識を使用する必要があります。

Minion は、次の図に示すように、MasterClaptrap との関係を持つ特殊なクラップ：

![ミニオン](/images/20190228-002.gif)

プリンシパル開発プロセスは Claptrap に似ていますが、制限があります。比較は次の通りです：

| ステップ。                            | クアプトラック | ミニオン |
| -------------------------------- | ------- | ---- |
| ClaptrapTypeCode を定義します。         | ○。      | ○。   |
| State を定義します。                    | ○。      | ○。   |
| Grain インターフェイスを定義します。            | ○。      | ○。   |
| グラインを実装します。                      | ○。      | ○。   |
| グラインにサインアップします。                  | ○。      | ○。   |
| EventCode を定義します。                | ○。      |      |
| イベントを定義します。                      | ○。      |      |
| EventHandler を実装します。             | ○。      | ○。   |
| EventHandler にサインアップします。         | ○。      | ○。   |
| IInitialStateDataFactory を実装します。 | ○。      | ○。   |

この削減は、Minion が Claptrap のイベント コンシューマーであり、イベント関連の定義を処理する必要がためです。しかし、他の部分はまだ必要です。

> この記事では、関連するコードが存在する特定のファイルの場所をリストアップしなくなり、読者が熟練した方法でプロジェクト内を検索できるようにします。

## OrderGrain を実装します。

前の「Claptrap の定義」に関連する知識に基づいて、注文注文アクションを表す OrderGrain を実装します。スペースを節約するために、重要な部分のみをリストします。

### OrderState

注文ステータスの定義は次のとおりです：

```cs
using System.Collections.Generic;
using Newbe.Claptrap;

namespace HelloClaptrap.Models.Order
#
    public class OrderState : IStateData
    {
        public bool OrderCreated { get; set; }
        public string UserId = get; set; #
        public Dictionary<string, int> Skus  _

_ _
```

1. OrderCreated は、注文が作成されているかどうかを示し、注文の作成を繰り返し回避します。
2. UserId はシングル ユーザー Id を指定します。
3. Skus 注文には、SkuId と注文の量が含まれます。

### OrderCreatedEvent。

注文作成イベントは、次のように定義されます：

```cs
using System.Collections.Generic;
using Newbe.Claptrap;

namespace HelloClaptrap.Models.Order.Events
{
    public class OrderCreatedEvent : IEventData
    {
        public string UserId = get; set; }
        public Dictionary<string, int> Skus = get; set; _
    }

```

### OrderGrain。

```cs
using System.Threading.Tasks;
using HelloClaptrap.Actors.Order.Events;
ハロークラプ.IActor;
は、using HelloClaptrap.Models;
は、using HelloClaptrap.Models.Order;
using HelloClaptrap.Models.Order.Events;
using Newbe.Claptrap;
using Newbe.Claptrap.Orleans;
のオーランス;

namespace HelloClaptrap.Actors.Order
{
    _claptrapEventHandler(typeof)、 ClaptrapCodes.OrderCreated)]
    public class OrderGrain : ClaptrapBoxGrain<OrderState>, IOrderGrain
    #
        private readonly IGrainFactory _grainFactory;

        public OrderGrain( iClaptrapGrainCommonService claptrapGrainCommonService,
            iGrainFactory grainFactory)
            : base (claptrapGrainCommonService)
        {
            _grainFactory = grainFactory;
        }

        public async Task CreateOrderAsync (createOrderInput input)
        =
            varderid = Claptrap.state. y.Id;
            // throw exception if order already created
            if (StateData.OrderCreated)
            @
                throw new BizException($"order with order id already created : {orderId}");
            ]

            // get items from cart
            var cartGrain = _grainFactory.GetGrain<ICartGrain>(input. CartId;
            var items = await cartGrain.GetItemsAsync();

            // update inventory for each sku
            foreach (var (skuId, count) in items)
            {
                var skuGrain = _grainFactory.GetGrain<ISkuGrain>(skuId);
                await skuGrain.UpdateInventoryAsync(-count);
            }

            // remove all items from cart
            await cartGrain.Re. moveAllItemsAsync ();

            // create a order
            var evt = this. CreateEvent(new OrderCreatedEvent
            =
                UserId = input. ユーザーId,
                Skus = items
            });
            await Claptrap.HandleEventAsync (evt);
        ]
    }
]
```

1. OrderGrain は、CreateOrderAsync メソッドがショッピング カート データの取得と在庫控除に関連するアクションを完了する注文作成コア ロジックを実装します。
2. OrderCreatedEvent の実行が成功すると、State の関連フィールドが更新され、ここには表示されなくなる。

## Minion を使用して、注文データをデータベースに保存します。

シリーズの先頭からこのまで、データベース関連の操作については言及しなかった。Claptrap フレームワークを使用する場合、ほとんどの操作は "イベントの書き込み" と "状態の更新" に置き換えられるため、データベース操作を自分で記述する必要はありません。

ただし、Claptrap は通常、モノリシック オブジェクト (注文、SKU、ショッピング カート) に対応するように設計されているため、すべての (すべての注文、すべての SKU、すべてのショッピング カート) のデータを取得することはできません。この時点で、状態データを別の永続構造 (データベース、ファイル、キャッシュなど) に永続化して、全体のクエリやその他の操作を完了する必要があります。

上記の要件に対処するために、Claptrap フレームワークに Minion の概念が導入されました。

次に、OrderGrain の注文入庫操作を非同期的に完了するために、サンプルに OrderDbGrain (Minion) を導入します。

## ClaptrapTypeCode を定義します。

```cs
  namespace HelloClaptrap.Models
  @
      public static class ClaptrapCodes
      @
          #region Cart

          public const string CartGrain = "cart_claptrap_newbe";
          private const string CartEventSuffix = "_e_" + CartGrain;
          public const string AddItemToCart = "addItem" + CartEventSuffix;
          public const s. tring RemoveItemFromCart – "removeItem" + CartEventSuffix;
          public const string Remove AllItemsFromCart = "remoeAllItems" + CartEventSuffix;

          #endregion

          #region Sku

          public const string SkuGrain = "sku_claptrap_newbe";
          private const string SkuEventSuffix = "_e_" + SkuGrain;
          public const string SkuInventoryUpdate = "inventoryUpdate" + SkuEventSuffix;

          #endregion

          #region order

          public const string OrderGrain = "order_claptrap_newbe";
          private const string OrderEventSuffix = "_e_" + OrderGrain;
          public const string OrderCreated = "orderCreated" + OrderEventSuffix;

+ public const string OrderDbGrain = "db_order_claptrap_newbe";

          #endregion
      ]
  ]
```

Minionは特別なClaptrap、つまりClaptrapの一種です。ClaptrapTypeCode は Claptrap に必要であり、この定義を増やす必要があります。

## State を定義します。

このサンプルでは、データベースに注文レコードを書き込むだけで済み、State にデータを含む必要がしないため、このサンプルではこの手順は必要ありません。

## Grain インターフェイスを定義します。

```cs
+ using HelloClaptrap.Models;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.IActor
+ +
+ [ClaptrapMinion(ClaptrapCodes.OrderGrain)]
+ [ClaptrapState(typeof(NoneStateData), ClaptrapCodes.OrderDbGrain)»
+ public interface IOrderDbGrain : IClaptrapMinionGrain
+ {
+ } }
+ }
```

1. ClaptrapMinion は、コードが対応する MasterClaptrap を指す Minion である Grain をマークするために使用されます。
2. ClaptrapState が Claptrap の State データ型をマークするために使用します。前の手順では、Minion が StateData を必要としないため、NoneStateData というフレームワーク内の型を使用して置き換えることを明らかにしました。
3. IClaptrap MinionGrainは、IClaptrapGrainと区別するMinionインターフェイスだ。Grain が Minion の場合は、インターフェイスを継承する必要があります。
4. ClaptrapCodes.OrderGrainとClaptrapCodes.OrderDbGrainは、読者が星間家主ではないことを願う2つの異なる文字列です。

> スターマスター：スタークラフトはペースが速く、情報量が多いため、競技者は情報の一部を無視したり誤算したりしにくいため、「競技者は目の前で起こる重要な出来事を見ることができない」という面白いミスが頻繁に発生します。したがって、プレイヤーは、スタープレーヤーが盲目(かつて盲目とプロの対決を持っていた)であり、セグメントが高いほど、より深刻なブラインド、プロのスターランナーは盲目です。

## グラインを実装します。

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
+ #
+ [ClaptrapEventHandler(typeof(OrderCreatedEvent Handler), ClaptrapCodes.OrderCreated)*
+ public class OrderDbGrain : ClaptrapBoxGrain<NoneStateData>, IOrderDbGrain
+ {
+ public OrderDbGrain(IClaptrapGrainCommonService)。 claptrapGrainCommonService)
+ : base(claptrapGrainCommonService)
+ {
+ }
+
+ public async Task MasterReceivedAsync(IEnumerable<IEvent> events)
+ {
+ foreach(var @event in events)
+ {
+ await Claptrap.handleEventAsync(@event)
+
+ +
+
+ public Task WakeAsync()
+ {
+ return Task.CompletedTask;
+ }
+ }
+ }
```

1. MasterEventReceivedAsync は、IClaptrapMinionGrain から定義されたメソッドで、MasterClaptrap からのイベント通知をリアルタイムで受信します。ここでは説明を展開しないが、上記のテンプレートに従って実装できます。
2. WakeAsync は、IClaptrap MinionGrain から、MasterClaptrap が Minion をアクティブにウェイクアップする操作を表すメソッドです。ここでは説明を展開しないが、上記のテンプレートに従って実装できます。
3. 読者がソースを見ると、クラスがアセンブリ内で個別に定義されているのが分かります。これは、Minion と MasterClaptrap をそれぞれ 2 つの異なるプロジェクトに配置して分類すると理解できる分類方法です。実際に一緒に入れても問題はありません。

## グラインにサインアップします。

ここでは、OrderDbGrain を別のアセンブリに定義するため、このアセンブリには追加の登録が必要です。次に示：

```cs
  using システム;
  は、using Autofac;
  は、using HelloClaptrap.Actors.Cart;
  は、using HelloClaptrap.Actors.DbGrains.Order;
  は、using HelloClaptrap.IActor;
  は、using HelloClaptrap.Repository;
  、マイクロソフト.AspNetCore.Hosting を参照してください。
  using Microsoft.Extensions.Hosting;
  マイクロソフト・エクテンシオンズ・ログリング;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Bootstrapper;
  は、NLog.Web を読み込む。
  オーランス;

  namespace HelloClaptrap.BackendServer
  {
      public class Program
      {
          public static void Main(string[] args)
          {
              var logger = NLogBuilder.ConfigureNLog(以下「nlog.config」)。 GetCurrentClassLogger();
              try
              {
                  logger. デバグ ("init main");
                  クリートHostBuilder(args)。 ブイルド(). Run ();
              _
              catch (exception exception)
              {
                  //NLog: catch setup errors
                  logger. Error (exception, "Stopped program because of exception");
                  トロー;

              finally
              {
                  // Ensure to flush and stop internal timers/threads before application-exit (avoid segmentation fault on Linux)
                  NLog.LogManager.Shutdown();
              }
          }

          publicstatic IBuilder CreateHostHostel(string==args)=>
              Host.CreateDefaultBuilder(args)が
                  。 ConfigureWebHostDefaults (webBuilder => = webBuilder.UseStartup<Startup>(); ;)
                  。 UseClaptrap (
                      ブイルダー =>
                      {
                          ブイルダー
                              . ScanClaptrapDesigns(new[]
                              _
                                  typeof(ICartGrain). Assembly、
                                  typeof (カートグラフ) です。 Assembly,
+ typeof (OrderDbGrain). Assembly
                              })
                              . ConfigureClaptrapDesign (x =>
                                  x.ClaptrapOptions.EventCenterOptions.EventCenterType = EventCenterType.OrleansClient;
                      ] をクリック
                      、builder => { builder です。 レギステルモドゥル<RepositoryModule>(); ))
                  。 UseOrleansClaptrap()
                  . UseOrleans (ブイルダー => ブイルダー. UseDashboard(options => options. ポート = 9000))
                  。 ConfigureLogging (logging =>
                  =
                      logging. クリアプロビダーズ();
                      logging. SetMinimumLevel (LogLevel.Trace);
                  })
                  . UseNLog();
      ]
  ]
```

## EventHandler を実装します。

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

1. IOrderRepository は、ストレージ層を直接操作するためのインターフェイスであり、注文の追加と削除の変更に使用されます。ここでは、注文データベースの入庫操作を実装するためにインターフェイスを呼び出します。

## EventHandler にサインアップします。

実際、スペースを節約するために、「Grain の実装」セクションのコードに登録しました。

## IInitialStateDataFactory を実装します。

StateData には特別な定義があるため、IInitialStateDataFactory を実装する必要はありません。

## Controller を変更します。

例として、OrderController を使用して注文を発注し、注文を照会します。読者はソースで表示できます。

読者は、次の手順を使用して、実際の効果テストを行うことができます：

1. POST `/api/cart/123` {skuId': "yueluo-666"、"count":30} は、30 ユニットの yueluo-666 濃縮エッセンスを 123 番カートに追加します。
2. POST `/api/order` {"userId": "999"、"cartId": "123"} は 999 userId として、ショッピング カート 123 から注文します。
3. GET `/api/order` 注文が成功すると、その API を使用して注文が完了した注文を表示できます。
4. GET `/api/sku/yueluo-666` SKU API 経由で注文後の在庫残高を確認できます。

## 小さな結び目。

これまでのところ、我々は「商品注文」の需要の基礎を完了しました。このサンプルでは、複数の Claptrap が連携する方法と、Minion を使用して非同期タスクを実行する方法の概要を示します。

しかし、まだいくつかの問題があり、我々は後で議論します。

この記事のソース コードは、次のアドレスから入手できます：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
