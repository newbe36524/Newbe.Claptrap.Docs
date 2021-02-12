---
title: "ステップ 3 - 商品在庫管理"
description: "ステップ 3 - 商品在庫管理"
---

この Class Chartp でビジネスを始めるために、これを読んでみてください。

<!-- more -->

## 投稿のまとめ

本は、既存のプロジェクト用サンプルの中でClaptrapをどのように定義するか学習したいと思います。というセクションを使って、在庫の管理を行う必要があるかもしれません。

前の章における基本的なステップは、Claptrapの外観を追加する方法を定義する。ステップの完全なステップは以下のように記されているものは「新コンテンツ」の部分が、前編の新内容と区別されたものになります：

1. クラップ クラスの定義（新しい ClaptrapType）
1. state の定義
1. Grain インターフェースの定義 (新規)
1. Grain の実装(新着情報)
1. Grain (新規コンテンツ) 登録
1. Eventのコード
1. Event の定義
1. EventHandlerの実装
1. EventHandlerに登録
1. 実装された IInitialStateDataFactory (新規コンテンツ)
1. Controller の変更

これは 下向のプロセスであり、実際の符号化により開発が修正されたこともある。

この記事での実装は、例です：

1. SKUの表示 (Stock keeping Unit) オブジェクト。
2. SKUの更新し、読み込みが可能である。

## ClaptrapTypes の定義

ClaptrapTypes は Claptrap の唯一のコーディングです。state の識別、シリアライズ化学等において重要な役割を果たしている。

`HelloClaptrap.Models`プロジェクトで`ClaptrapCodes`クラスを開きます。

SKU の ClaptrapTypeCodeを追加

```cs
  namespace HelloClaptrap。 Odels
  {
      public class ClaptrapCodes
      {
          public const string CartGrain = "cart_claptrap_newbe";
          private const string CartEventSuffix = "_e_" + CartGrain;
          public const string AddItemToCart = "addItem" + CartEventSuffix;
          public const string RemoveItemFromCart = "removeItem" + CartEventSuffix;

          #region Sku

+ public const string SkuGrain = "sku_claptrap_newbe";
+ private const string SkuEventSuffix = "_e_" + SkuGrain;

          #endregion
      }

```

## state を定義します。

State はActor のオブジェクトの現在のデータ表現を表します。

クラプトはストーリーベースのイベントのソースモードで使用されていたActorである。この定義はそれで State は重要です

この例では、現在の SKUの在庫を記録する必要があるので、State は簡単である。

`HelloClaptrap.Models`プロジェクトに`Sku`フォルダを追加し、そのフォルダの下に`SkuState`します。

以下のコードを追加：

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models ku
+ {
+ public class SkuState : IStateData
+ {
+ public int Inventory { get; set; }
+ }
+ }
```

現在のSKU の在庫を示すInventory

`IStateData`接口是框架中表示 State 的空接口，用于在泛型推断时使用。

## Grain インターフェースの定義

Grain インターフェイスの定義として、Claptrap との相互運用性を提供していることを定義します。

`HelloClaptrap.IActors`プロジェクトに`ISkuGrain`します。

インタフェースと属性を追加します。

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models;
+ using HelloClaptrap.Models.Sku;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.IActor
+ {
+     [ClaptrapState(typeof(SkuState), ClaptrapCodes.SkuGrain)]
+     public interface ISkuGrain : IClaptrapGrain
+     {
+         /// <summary>
+         /// Get latest inventory of this sku
+         /// </summary>
+         /// <returns></returns>
+         Task<int> GetInventoryAsync();
+
+         /// <summary>
+         /// Update inventory by add diff, diff could be negative number
+         /// </summary>
+         /// <param name="diff"></param>
+         /// <returns>Inventory after updating</returns>
+         Task<int> UpdateInventoryAsync(int diff);
+     }
+ }
```

：は次の内容を足します

1. `ClaptrapState`をタグ付けすると、State と Grain で関連づけられます。
2. このインターフェースは`IClaptrapGrain`を継承しました。これはOrileans 命令書に則って名前を継承さなければなりません。
3. GetInventoryAsyncメソッドを追加しました。 "が最も必要なときに示す"。
4. 更新: UpdateInventoryAsync の追加では、「インクリメント更新」のようにしてください。`diff > 0` は、在庫の増加を表します。`diff < 0`は、在庫を減らします。
5. Grain メソッドの定義は、特定の制限があることに注意してください。詳細は、[Developing a Grain を参照してください](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## Grain 実装

関数を定義すると、ISkuGrainが渡すことによって実装できます。

`HelloClaptrap.Actors`プロジェクトの新しい`Sku`フォルダを作成し、そのフォルダに`SkuGrain`します。

```cs
+ using System;
+ using System.Threading.Tasks;
+ using HelloClaptrap.IActor;
+ using HelloClaptrap.Models;
+ using HelloClaptrap.Models.Sku;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.Actors.Sku
+ {
+     public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
+     {
+         public SkuGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
+             : base(claptrapGrainCommonService)
+         {
+         }
+
+         public Task<int> GetInventoryAsync()
+         {
+             return Task.FromResult(StateData.Inventory);
+         }
+
+         public async Task<int> UpdateInventoryAsync(int diff)
+         {
+             if (diff == 0)
+             {
+                 throw new BizException("diff can`t be 0");
+             }
+
+             var old = StateData.Inventory;
+             var newInventory = old + diff;
+             if (newInventory < 0)
+             {
+                 throw new BizException(
+                     $"failed to update inventory. It will be less than 0 if add diff amount. current : {old} , diff : {diff}");
+             }
+
+             throw new NotImplementedException();
+         }
+     }
+ }
```

：は次の内容を足します

1. `ClaptrapBox<SkuState>。`それは、命の恩義、`ClasskuGrain`、`ClaptrapBox`をフレームワークによって定義する、ジェネレーションされたクラインのパラメータです。
2. GetInventoryAsync メソッドを実装し StateData から現在の在庫を読み込みます。
3. UpdateInventoryAsync メソッドを実装し、ビジネスを行うと思われる場合には例外がスローされます。
4. UpdateInventoryAsyncの最後に、NotmplementedException は定義されていないので、現在のイベントはすでに定義されていないのが原因です。
5. BizのException は例外です。自分で追加することができます。実際には、ビジネスに異常をスローするものではなく、ステータスコードなどの返しにいくらかの値を使うこともある。

## Grain に登録

クラップトの機能に対応した Grain は起動時に登録する必要があります。これにより、スキャンするためのフレームワークがスキャンできます。

サンプルコードは、そのプログラムセットの中でスキャンされているため、変更する必要はありません。

ここは、登録の場所を指定して下さい：

`HelloClaptrap.BackendServer`プロジェクト`Program`クラスを開きます。

```cs
  using System;
  using Autofac;
  using HelloClaptrap.Actors.Cart;
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

          public static IHostBuilder CreateHostBuilder(string[] args) =>
              Host.CreateDefaultBuilder(args)
                  .ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); })
                  .UseClaptrap(
                      builder =>
                      {
+                         builder
+                             .ScanClaptrapDesigns(new[]
+                             {
+                                 typeof(ICartGrain).Assembly,
+                                 typeof(CartGrain).Assembly,
+                             });
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

これはISkuGrainとSkugrain がICartGrain と CartGrain の同じプロジェクトセットであるため、変更する必要はありません。

## Eventのコード

Claptrap の主要部分は、既に実装されましたが、在庫更新をしていないアクションです。在庫更新はstate の更新時に行われているためです。Claptrap はイベントのソースと分かっている Actor の呼び出しに基づいて説明書かれており、stateの更新はイベントの実行を必要とします。この時 私たちが商品の在庫を更新するようになりました。

EventCode はクラスの秘密コードです。これは事件の識別、順序化といった面で重要である。

`HelloClaptrap.Models`プロジェクトの`ClaptrapCodes`します。

在庫更新を行うためのEventCodeを追加します。

```cs
  namespace HelloClaptrap。 dels
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
+ public const string SkuInventoryUpdate = "inventoryUpdate" + SkuEventSuffix;

          #endregion
      }

```

## Event の定義

イベントバックスタルの鍵です。Claptrap 内の state を変えるためのStateです。この処理では永続化されて永続的に維持されます。

`HelloClaptrap.Models`プロジェクトの`Sku/Events`フォルダの下に`InventoryUpdateEvent`します。

以下のコードを追加：

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Sku. vents
+ {
+ public class InventoryUpdateEvent : IEventData
+ {
+ public int Diff { get; set; }
+ public int NewInventory { get; set; }
+ }
+ }
```

1. Diffは在庫を更新した金額を表します。`diff > 0` 在庫の増加を表します。`diff < 0`は在庫を減らします。
2. NewInventory の更新後に在庫を表示します。ここで事前に提案したいと思っていますが、State をインスパイアするイベントに関してコメントを書くための推奨はありません：

## EventHandlerの実装

EventHandlerはイベントを Claptrap の state への更新に使用します。

`HelloClaptrap.Actors`プロジェクトの`Sku/Events`フォルダの下に`InventoryUpdateEventHandler`します。

以下のコードを追加：

```cs
+ using System.Threading.Tasks;
+ using Hellop.Models.Sku;
+ using HelloClaptrap.Models.Sku.Events;
+ using Newbe.Claptrap;
+
+ namespace Helptrap.Actors.Sku. vent s
+ {
+ public class InventoryUpdateEventHandler
+ : NormalEventHandler<SkuState, InventoryUpdateEvent>
+ {
+ public override ValueTask HandleEvent(SkuState state, state,
+ InventoryUpdateEeventData,
+ IEvent Context）
+ {
+ stateData. nventory = eventData. ewInventory;
+ return new ValueTask();
+ }
+ }
+ }
```

1. イベント中に更新後の在庫ありとしていたため直接Stateデータへの割り当てという形で示している。

## EventHandlerに登録

EventHandlerをテストするにはEventHandlerを設定してください。そして、EventのHandlerはEventのクラスとClassifptrapを実行することができます。

`HelloClaptrap.Actors`プロジェクトの中の`SkuGrain`クラスを開きます。

Attributes でラベル付けし、UpdateInventoryAsync イベントとしておきましょう。

```cs
  using System.Threading.Tasks;
+ using HelloClaptrap.Actors.Sku.Events;
  using HelloClaptrap.IActor;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Models.Sku.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Sku
  {
+     [ClaptrapEventHandler(typeof(InventoryUpdateEventHandler), ClaptrapCodes.SkuInventoryUpdate)]
      public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      {
          public SkuGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

          public Task<int> GetInventoryAsync()
          {
              return Task.FromResult(StateData.Inventory);
          }

          public async Task<int> UpdateInventoryAsync(int diff)
          {
              if (diff == 0)
              {
                  throw new BizException("diff can`t be 0");
              }

              var old = StateData.Inventory;
              var newInventory = old + diff;
              if (newInventory < 0)
              {
                  throw new BizException(
                      $"failed to update inventory. It will be less than 0 if add diff amount. current : {old} , diff : {diff}");
              }

-             throw new NotImplementedException();
+             var evt = this.CreateEvent(new InventoryUpdateEvent
+             {
+                 Diff = diff,
+                 NewInventory = newInventory
+             });
+             await Claptrap.HandleEventAsync(evt);
+             return StateData.Inventory;
          }
      }
  }
```

## 実装IInitialStateDataFactory

以前、在庫確認とアップデートが完了しました。しかし 通常、在庫は最初の金額で、このセクションはロジックを補充します。

HelloClaptrap.Actors プロジェクトの Sku フォルダに SkuStateInitHandler クラスを作成します。

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Repository;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Sku
+ {
+     public class SkuStateInitHandler : IInitialStateDataFactory
+     {
+         private readonly ISkuRepository _skuRepository;
+
+         public SkuStateInitHandler(
+             ISkuRepository skuRepository)
+         {
+             _skuRepository = skuRepository;
+         }
+
+         public async Task<IStateData> Create(IClaptrapIdentity identity)
+         {
+             var skuId = identity.Id;
+             var inventory = await _skuRepository.GetInitInventoryAsync(skuId);
+             var re = new SkuState
+             {
+                 Inventory = inventory
+             };
+             return re;
+         }
+     }
+ }
```

1. `IInitialStateDataFactory`は、アプリケーションの最初のアクティブ時に呼び出され、State を作成する時に呼び出されるはずです。
2. `ISkuReposiitory`はデータベースから Sku の初期量を読めます。ここに記載されていないリポジトリで実装内容を一覧参照する、特別なコードです。

コードが後で呼び出すことができるように、登録をする必要があります。

`HelloClaptrap.Actors`プロジェクトの中の`SkuGrain`クラスを開きます。

```cs
  using System.Threading.Tasks;
  using HelloClaptrap.Actors.Sku.Events;
  using HelloClaptrap.IActor;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Sku;
  using HelloClaptrap.Models.Sku.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Sku
  {
+     [ClaptrapStateInitialFactoryHandler(typeof(SkuStateInitHandler))]
      [ClaptrapEventHandler(typeof(InventoryUpdateEventHandler), ClaptrapCodes.SkuInventoryUpdate)]
      public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      {
          public SkuGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

          public Task<int> GetInventoryAsync()
          {
              return Task.FromResult(StateData.Inventory);
          }

          public async Task<int> UpdateInventoryAsync(int diff)
          {
              if (diff == 0)
              {
                  throw new BizException("diff can`t be 0");
              }

              var old = StateData.Inventory;
              var newInventory = old + diff;
              if (newInventory < 0)
              {
                  throw new BizException(
                      $"failed to update inventory. It will be less than 0 if add diff amount. current : {old} , diff : {diff}");
              }

              var evt = this.CreateEvent(new InventoryUpdateEvent
              {
                  Diff = diff,
                  NewInventory = newInventory
              });
              await Claptrap.HandleEventAsync(evt);
              return StateData.Inventory;
          }
      }
  }
```

## Controller の変更

前の手順すべてが完成した後、その前の手順でクラス全員の Claptrap を表示します。Claptrapにより外部プログラムとの相互運用性を提供できないため。そこでコントロールは Controller レイヤーに API を追加する必要があるので、在庫を読み取ります（在庫を参照）。

HelloClaptrap.Web プロジェクトの Controllers フォルダに SkuController を作成します。

```cs
+ using System.Threading.Tasks;
+ using Hellop.IActor;
+ using Microsoft.AspNetCore.Mvc;
+ using Orleans;
+
+ namespace Helptrap.Web. ontrollers
+ {
+ [Route("api/[controller]")]
+ public class SkuController : Controller
+ {
+ private readonly IGrainFactory
+
+ public SkuController(
+ IGrainFactory )
+ {
+ _grainy Factory = grainFactory;
+ }
+
+ [HttpGet("{id}")]
+ public Task Task<IActionResult> GetItemsAsyc(string id)
+ {
+ var skuGrain = _grainFactoryy etGrain<ISkuGrain>(id);
+ var inventory = ait skuGrain. etInventoryAsync();
+ return Json(new
+ {
+ skuId = id, )
+ inventory = inventory,
+ });
+ }
+ }
+ }
```

1. APIの追加 SkuId の在庫数を読み取ります。サンプルコードを書いて、`yueluo-123`で在庫が666になるようにしてください。SkuId は存在しません。例外をスローします。
1. 在庫の追加は生成されませんでした API は下に注文されたがだ、これが在庫処理になるため、ここからはまだAPIを必要としません。

## ミニ投稿

ですから 私達はシンプル商品在庫を管理できる というものを すべて終了しました

この記事に対応するソースコードを取得することができます：

- [GitHub](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
