---
title: '配信が無効となりました'
description: '配信が無効となりました'
---

この Class Chartp でビジネスを始めるために、これを読んでみてください。

<!-- more -->

:::caution 该文档仅适用于 0.7 及以下版本，若想要查看最新版本内容，请点击右上角进行切换。 :::

## 投稿のまとめ

本篇，我通过实现“商品下单”的需求来了解一下如何在已有的项目样例中使用 Minion 来完成异步的业务处理。

首先，先了解一下本篇需要涉及的业务用例：

1. ユーザーは注文を行うことができ、注文を行うと、現在のショッピングカートにあるすべてのSKUによる注文が作成されます。
2. 注文になった後にSKUによる在庫が差し引かれます。SKU が在庫不足の場合、注文は失敗します。
3. 注文操作は在庫が減少するまでのみ有効であり、今後の手順については議論を必要としません。注文は正常に作成されたあと、データベースに登録されたすべての注文レコードを生成し、注文作成が終了します。

本篇虽然重点在于 Minion 的使用，不过由于需要使用到一个新的 OrderGrain 对象，因此还是需要使用到前一篇“定义 Claptrap”的相关知识。

Minion 是一种特殊的 Claptrap，它与其 MasterClaptrap 之间的关系如下图所示：

![Minion](/images/20190228-002.gif)

其主体开发流程和 Claptrap 类似，只是有所删减。对比如下：

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

这个删减的原因是由于 Minion 是 Claptrap 的事件消费者，所以事件相关的定义不需要处理。但是其他的部分仍然是必须的。

> この章から、あるファイルの場所を一覧に組み込んでみて、熟練のマスタリーに応じてプログラム内で確認していきましょう。

## 実装のOrderGrain

基于前一篇“定义 Claptrap”相关的知识，我们此处实现一个 OrderGrain 用来表示订单下单操作。为节约篇幅，我们只罗列其中关键的部分。

### OrderState

订单状态的定义如下：

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

订单创建事件的定义如下：

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

从系列开头到此，我们从未提及数据库相关的操作。因为当您在使用 Claptrap 框架时，绝大多数的操作都已经被“事件的写入”和“状态的更新”代替了，故而完全不需要亲自编写数据库操作。

不过，由于 Claptrap 通常是对应单体对象（一个订单，一个 SKU，一个购物车）而设计的，因而无法获取全体（所有订单，所有 SKU，所有购物车）的数据情况。此时，就需要将状态数据持久化到另外的持久化结构中（数据库，文件，缓存等）以便完成全体情况的查询或其他操作。

在 Claptrap 框架中引入了 Minion 的概念来解决上述的需求。

接下来，我们就在样例中引入一个 OrderDbGrain （一个 Minion）来异步完成 OrderGrain 的订单入库操作。

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

Minion 是一种特殊的 Claptrap，换言之，它也是一种 Claptrap。而 ClaptrapTypeCode 对于 Claptrap 来说是必需的，因而需要增加此定义。

## state を定義します。

由于本样例只需要向数据库写入一条订单记录就可以了，并不需要在 State 中任何数据，因此该步骤在本样例中其实并不需要。

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

此处，由于我们将 OrderDbGrain 定义在单独的程序集，因此，需要额外的注册这个程序集。如下所示：

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

实际上为了节约篇幅，我们已经在“实现 Grain”章节的代码中进行注册。

## 実装IInitialStateDataFactory

由于 StateData 没有特殊定义，因此也不需要实现 IInitialStateDataFactory。

## Controller の変更

样例中，我们增加了 OrderController 用来下单和查询订单。读者可以在源码进行查看。

读者可以使用以下步骤进行实际的效果测试：

1. POST `/api/cart/123` {"skuId":"yueluo-666","count"30} は123便に 30単位の yueluo-666 を圧縮しました。
2. POST `/api/order` {"userId":"999","cartId"123"} カートから999 userId として発注されました。
3. GET `/api/order` による注文は、この API で注文された注文が表示されます。
4. GET `/api/sku/yueluo-666` はSKU API で注文された在庫数を閲覧することができます。

## ミニ投稿

至此，我们就完成了“商品下单”这个需求的基础内容。通过该样例可以初步了解多个 Claptrap 可以如何合作，以及如何使用 Minion 完成异步任务。

不过，还有一些问题，我们将在后续展开讨论。

您可以从以下地址来获取本文章对应的源代码：

- [GitHub](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
