---
title: 'ステップ4 - ミネオンを使用して、商品が注文されます'
description: 'ステップ4 - ミネオンを使用して、商品が注文されます'
---

この記事では、Claptrap を使用してビジネスを開始できます。

<!-- more -->

:::caution 该文档仅适用于 0.7 及以下版本，若想要查看最新版本内容，请点击右上角进行切换。 :::

## オープダイジェスト

この記事では、"商品注文" の要件を実装して、既存のプロジェクト サンプルで Minion を使用して非同期ビジネス処理を実行する方法について説明します。

まず、この記事で取り上必要なビジネス ユース ケースの詳細について：

1. ユーザーは、現在のショッピング カート内のすべての SKU を使用して 1 つの注文を形成する注文操作を実行できます。
2. 関連する SKU の在庫は、注文後に差し引かれます。SKU の在庫が不足している場合、注文は失敗します。
3. 注文操作は、在庫の控除が成功するまでのみ行い、次の手順ではこのサンプル の説明は必要ありません。したがって、この例では、注文が成功すると、注文の作成が終了したことを示す注文レコードがデータベースに生成されます。

本編ではMinionの使用に重点を置いていますが,新しいOrderGrainオブジェクトを使用する必要があるため,前編の「Claptrapの定義」に関する知識が必要である.

Minion は、次の図に示すように、MasterClaptrap との関係を持つ特殊なクラス：

![Minion](/images/20190228-002.gif)

本体開発プロセスは Claptrap に似ていますが、省略されています。比較は次の通りです：

| ステップ                            | Claptrap | Minion |
| ------------------------------- | -------- | ------ |
| ClaptrapTypeCode を定義します         | √        | √      |
| State を定義します                    | √        | √      |
| Grain インターフェイスを定義します            | √        | √      |
| Grain を実装します                    | √        | √      |
| Grain にサインアップします                | √        | √      |
| EventCode を定義します                | √        |        |
| Event を定義します                    | √        |        |
| EventHandler を実装します             | √        | √      |
| EventHandler を登録します             | √        | √      |
| IInitialStateDataFactory を実装します | √        | √      |

この削減の理由は、Minion が Claptrap のイベント コンシューマーであるため、イベント関連の定義を処理する必要がないためです。しかし、他の部分はまだ必要です。

> この記事では、関連するコードが存在する特定のファイルの場所を一示し、読者が自分でプロジェクトを検索し、熟練できるようにすることを期待します。

## OrderGrain を実装します

前の「Claptrap の定義」に関する知識に基づいて、OrderGrain を使用して注文操作を表します。スペースを節約するために、我々はこれらの重要な部分だけをリストします。

### OrderState

注文ステータスは次のように定義されます：

```cs
using System.Collections.Generic;
using Newbe.Claptrap;

namespace HelloClaptrap.Models.Order
{
    public class OrderState : IStateData
    {
        public bool OrderCreated { get; set; }
        public string UserId { get; set; }
        public Dictionary<string, int> Skus { get; set; }
    }
}
```

1. OrderCreated は、注文が既に作成されているかどうかを示し、注文の重複作成を回避します
2. UserId はユーザー Id を注文します
3. Skus 注文には、SkuId と注文ボリュームが含まれます

### OrderCreatedEvent

注文作成イベントは次のように定義されます：

```cs
using System.Collections.Generic;
using Newbe.Claptrap;

namespace HelloClaptrap.Models.Order.Events
{
    public class OrderCreatedEvent : IEventData
    {
        public string UserId { get; set; }
        public Dictionary<string, int> Skus { get; set; }
    }
}
```

### OrderGrain

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
            var cartGrain = _grainFactory.GetGrain<ICartGrain>(input. CartId);
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
            var evt = this. CreateEvent(new OrderCreatedEvent
            {
                UserId = input. UserId,
                Skus = items
            });
            await Claptrap.HandleEventAsync(evt);
        }
    }
}
```

1. OrderGrain は、CreateOrderAsync メソッドがショッピング カート データの取得と在庫控除に関連するアクションを完了する注文の作成のコア ロジックを実装します。
2. OrderCreatedEvent の実行が成功すると、State の関連フィールドが更新されます。

## Minion を使用して、注文データをデータベースに保存します

シリーズの冒頭から現在まで、データベース関連の操作については触って説明しません。Claptrap フレームワークを使用する場合、ほとんどの操作は "イベントの書き込み" と "状態の更新" に置き換えられるため、データベース操作を自分で記述する必要はありません。

ただし、Claptrap は通常、モノリシック オブジェクト (注文、SKU、ショッピング カート) に対応するように設計されているため、全体 (すべての注文、すべての SKU、すべてのショッピング カート) のデータを取得できません。このとき,状態データを別の永続化構造(データベース,ファイル,キャッシュなど)に永続化して,全体の状況に対する問い合わせやその他の操作を行う必要がある.

上記の要件に対処するために、Claptrap フレームワークに Minion の概念が導入されました。

次に、サンプルに OrderDbGrain (Minion) を導入して、OrderGrain の注文の入庫を非同期に完了します。

## ClaptrapTypeCode を定義します

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

+ public const string OrderDbGrain = "db_order_claptrap_newbe";

          #endregion
      }
  }
```

Minion は特別な Claptrap であり、言い換えると一種の Claptrap です。ClaptrapTypeCode は Claptrap に必要であるため、この定義を追加する必要があります。

## State を定義します

この例では、データベースに注文レコードを書き込むだけで十分であり、State にデータは必要ないため、この例ではこの手順は必要ありません。

## Grain インターフェイスを定義します

```cs
+ using HelloClaptrap.Models;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.IActor
+ {
+ [ClaptrapMinion(ClaptrapCodes.OrderGrain)]
+ [ClaptrapState(typeof(NoneStateData), ClaptrapCodes.OrderDbGrain)]
+ public interface IOrderDbGrain : IClaptrapMinionGrain
+ {
+ }
+ }
```

1. ClaptrapMinion は、Grain が Minion であることをマークするために使用され、Code は対応する MasterClaptrap を指します。
2. ClaptrapState は、Claptrap の State データ型をマークするために使用されます。前の手順では、Minion が StateData を必要としないため、代わりにフレームワークの組み込み型である NoneStateData を使用することを明確にしました。
3. IClaptrapMinionGrain は、IClaptrapGrain と区別される Minion インタフェースです。Grain が Minion の場合は、インターフェイスを継承する必要があります。
4. ClaptrapCodes.OrderGrain と ClaptrapCodes.OrderDbGrain は 2 つの異なる文字列であり、読者がスターマスターではないことを願っています。

> 星間宗師：星間争いのペースが速く、情報量が多いため、選手は情報の一部を見落としたり誤認したりしやすいため、「選手は目の前で起こる重要な出来事を見ることができない」という面白いミスがしばしば発生します。プレイヤーは、スタープレーヤーが盲目(本当にブラインドとプロの対決を持っていた)であり、より高いレベル、より深刻なブラインド、プロのスター選手の明確なブラインドです。

## Grain を実装します

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
+ [ClaptrapEventHandler(typeof(OrderCreatedEventHandler), ClaptrapCodes.OrderCreated)]
+ public class OrderDbGrain : ClaptrapBoxGrain<NoneStateData>, IOrderDbGrain
+ {
+ public OrderDbGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
+ : base(claptrapGrainCommonService)
+ {
+ }
+
+ public async Task MasterEventReceivedAsync(IEnumerable<IEvent> events)
+ {
+ foreach (var @event in events)
+ {
+ await Claptrap.HandleEventAsync(@event);
+ }
+ }
+
+ public Task WakeAsync()
+ {
+ return Task.CompletedTask;
+ }
+ }
+ }
```

1. MasterEventReceivedAsync は、IClaptrapMinionGrain からイベント通知をリアルタイムで受信するように定義するメソッドです。ここでは説明を省略し、上記のテンプレートに従って実装します。
2. WakeAsync は、IClaptrapMinionGrain から Minion をアクティブにウェイクアップする操作を表すメソッドです。ここでは説明を省略し、上記のテンプレートに従って実装します。
3. 読者がソースを表示すると、クラスがアセンブリ内で個別に定義されている場合があります。これは、Minion と MasterClaptrap を 2 つの異なるプロジェクトに配置して分類する分類方法に過言ではありません。実際に一緒に入れても問題ありません。

## Grain にサインアップします

ここでは、OrderDbGrain を別々のアセンブリで定義しているため、このアセンブリを追加で登録する必要があります。次のようになります：

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
              var logger = NLogBuilder.ConfigureNLog("nlog.config"). GetCurrentClassLogger();
              try
              {
                  logger. Debug("init main");
                  CreateHostBuilder(args). Build(). Run();
              }
              catch (Exception exception)
              {
                  //NLog: catch setup errors
                  logger. Error(exception, "Stopped program because of exception");
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
                  . ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); })
                  . UseClaptrap(
                      builder =>
                      {
                          builder
                              . ScanClaptrapDesigns(new[]
                              {
                                  typeof(ICartGrain). Assembly,
                                  typeof(CartGrain). Assembly,
+ typeof(OrderDbGrain). Assembly
                              })
                              . ConfigureClaptrapDesign(x =>
                                  x.ClaptrapOptions.EventCenterOptions.EventCenterType = EventCenterType.OrleansClient);
                      },
                      builder => { builder. RegisterModule<RepositoryModule>(); })
                  . UseOrleansClaptrap()
                  . UseOrleans(builder => builder. UseDashboard(options => options. Port = 9000))
                  . ConfigureLogging(logging =>
                  {
                      logging. ClearProviders();
                      logging. SetMinimumLevel(LogLevel.Trace);
                  })
                  . UseNLog();
      }
  }
```

## EventHandler を実装します

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Order.Events;
+ using HelloClaptrap.Repository;
+ using Newbe.Claptrap;
+ using Newtonsoft.Json;
+
+ namespace HelloClaptrap.Actors.DbGrains.Order.Events
+ {
+ public class OrderCreatedEventHandler
+ : NormalEventHandler<NoneStateData, OrderCreatedEvent>
+ {
+ private readonly IOrderRepository _orderRepository;
+
+ public OrderCreatedEventHandler(
+ IOrderRepository orderRepository)
+ {
+ _orderRepository = orderRepository;
+ }
+
+ public override async ValueTask HandleEvent(NoneStateData stateData,
+ OrderCreatedEvent eventData,
+ IEventContext eventContext)
+ {
+ var orderId = eventContext.State.Identity.Id;
+ await _orderRepository.SaveAsync(eventData.UserId, orderId, JsonConvert.SerializeObject(eventData.Skus));
+ }
+ }
+ }
```

1. IOrderRepository は、注文の追加と削除のチェックに使用されるストレージ層を直接操作するインターフェイスです。このインターフェイスは、注文データベースの入庫操作を実装するためにここで呼び出されます。

## EventHandler を登録します

実際には、スペースを節約するために、「Grain の実装」セクションのコードに登録しました。

## IInitialStateDataFactory を実装します

StateData には特別な定義がないため、IInitialStateDataFactory を実装する必要はありません。

## Controllerを変更します

この例では、OrderController を使用して注文を注文し、注文を照会するために追加しました。読者は、ソースコードを表示することができます。

読者は、次の手順を使用して、実際の効果テストを：

1. POST `/api/cart/123` {"skuId": "yueluo-666","count":30} は、123 カートに 30 単位の yueluo-666 濃縮エッセンスを追加します。
2. POST `/api/order` {"userId":"999","cartId":"123"} は、ショッピング カート 123 から 999 userId として注文します。
3. GET `/api/order` 注文が成功した後、API を使用して注文が完了した注文を表示できます。
4. GET `/api/sku/yueluo-666` SKU API を使用して、注文後の在庫残高を表示できます。

## 小さな結び目

これで、"商品注文" という要件の基礎が完成しました。このサンプルでは、複数の Claptrap がどのように連携するか、および Minion を使用して非同期タスクを実行する方法を暫定的に把握できます。

ただし、いくつかの問題があり、後で説明します。

この記事のソース コードは、次のアドレスから入手できます：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
