---
title: "ステップ 3 - Claptrap を定義し、商品在庫を管理します"
description: "ステップ 3 - Claptrap を定義し、商品在庫を管理します"
---

この記事では、Claptrap を使用してビジネスを開始できます。

<!-- more -->

:::caution 该文档仅适用于 0.7 及以下版本，若想要查看最新版本内容，请点击右上角进行切换。 :::

## オープダイジェスト

この記事では、"在庫管理" 要件を実装して、既存のプロジェクト サンプルで Claptrap を定義する方法について説明します。

前の記事の基本的な手順と組み合わせて、Claptrap を定義するには、いくつかの手順を追加します。完全な手順は、"新しいコンテンツ" とマークされたセクションが、前の記事とは異なる新しいコンテンツに属する：

1. ClaptrapTypeCodeの定義(新規コンテンツ)
1. State の定義 (新規コンテンツ)
1. Grain インターフェイスの定義 (新しいコンテンツ)
1. Grain の実装 (新しいコンテンツ)
1. Grain の登録 (新規コンテンツ)
1. EventCode を定義します
1. Event を定義します
1. EventHandler を実装します
1. EventHandler を登録します
1. IInitialStateDataFactory の実装 (新規コンテンツ)
1. Controllerを変更します

これは下から上へのプロセスであり、実際のコーディング プロセスの開発も調整できます。

この記事で実装したビジネス ユース ケース：

1. インベントリ データを表す SKU(Stock keeping Unit) オブジェクトを実装します。
2. SKU を更新および読み取る機能。

## ClaptrapTypeCode を定義します

ClaptrapTypeCode は、Claptrap の一意のエンコーディングです。これは、State の認識、シリアル化などにおいて重要な役割を果たします。

`HelloClaptrap.Models`プロジェクトの`ClaptrapCodes`します。

SKU の ClaptrapTypeCode を追加します。

```cs
  namespace HelloClaptrap.Models
  {
      public static class ClaptrapCodes
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
  }
```

## State を定義します

ステートは、アクタ モードでアクタ オブジェクトの現在のデータ表現を表します。

Claptrap はイベント トレーサビリティ モードに基づくアクタです。したがって、適切な State を定義することが重要です。

この例では、現在の SKU のインベントリを記録するだけで済むため、State の設計は非常に単純です。

在 HelloClaptrap.Models 项目添加 Sku 文件夹，并在该文件夹下创建 SkuState 类。

次のようなコードを追加します：

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Sku
+ {
+ public class SkuState : IStateData
+ {
+ public int Inventory { get; set; }
+ }
+ }
```

Inventory は、現在の SKU のインベントリを表します。

`IStateData`インターフェイスは、ジェネリック推論で使用されるフレームワーク内の State を表す空のインターフェイスです。

## Grain インターフェイスを定義します

外部と Claptrap の相互運用性を提供するために、Grain インターフェイスの定義を定義します。

在 HelloClaptrap.IActors 项目中添加 ISkuGrain 接口。

インターフェイスと Attribute を追加します。

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models;
+ using HelloClaptrap.Models.Sku;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.IActor
+ {
+ [ClaptrapState(typeof(SkuState), ClaptrapCodes.SkuGrain)]
+ public interface ISkuGrain : IClaptrapGrain
+ {
+ /// <summary>
+ /// Get latest inventory of this sku
+ /// </summary>
+ /// <returns></returns>
+         Task<int> GetInventoryAsync();
+
+ /// <summary>
+ /// Update inventory by add diff, diff could be negative number
+ /// </summary>
+ /// <param name="diff"></param>
+ /// <returns>Inventory after updating</returns>
+ Task<int> UpdateInventoryAsync(int diff);
+ }
+ }
```

次の項目が追加されます：

1. [`ClaptrapState`がマークされ、State が Grain に関連付けられます。
2. インターフェイスは`IClaptrapGrain`を継承します。
3. GetInventoryAsync メソッドが追加され、"現在のインベントリの取得" が示されます。
4. UpdateInventoryAsync メソッドが追加され、"現在のインベントリの増分更新" が表示されます。`diff > 0` 在庫増加を表し、diff`0 < 在庫`減少を示します。
5. Grain のメソッド定義には制限があります。詳細については、[Developing a Grain を参照](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## Grain を実装します

ISkuGrain を定義したら、実装用のコードを追加できます。

在 HelloClaptrap.Actors 项目新建 Sku 文件夹，并在该文件夹中添加 SkuGrain 类。

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

次の項目が追加されます：

1. `ClaptrapBoxGrain<SkuState>`を継承し、`ISkuGrain`を実装します。`ClaptrapBoxGrain`は、ジェネリックパラメータが対応する State 型を表すフレームワーク定義の Grain 基本クラスです。
2. StateData から現在のインベントリを読み取る GetInventoryAsync メソッドを実装します。
3. UpdateInventoryAsync メソッドを実装し、ビジネス判断コードを追加し、ビジネス アクションの条件を満たさない場合に例外をスローします。
4. UpdateInventoryAsync の最後に NotImplementedException をスローします。
5. BizException は、自分で追加できるカスタム例外です。実際の開発では、例外をスローせずに業務の中断を表す場合も、状態コードまたはその他の戻り値を使用できます。

## Grain にサインアップします

Claptrap の対応する Grain は、フレームワークが検出をスキャンするために、アプリケーションの起動時に登録する必要があります。

サンプル コードはアセンブリ 全体のスキャンを使用するため、実際に変更する必要はありません。

ここでは、登録が発生した場所を示します：

`HelloClaptrap.BackendServer`プロジェクトの`Program`します。

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
                  . ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); })
                  . UseClaptrap(
                      builder =>
                      {
+ builder
+ . ScanClaptrapDesigns(new[]
+ {
+ typeof(ICartGrain). Assembly,
+ typeof(CartGrain). Assembly,
+ });
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

ISkuGrain と SkuGrain はそれぞれ ICartGrain と CartGrain で同じアセンブリに属しているため、ここで変更する必要はありません。

## EventCode を定義します

以前は Claptrap の主要部分を実装しましたが、インベントリの更新は完了していません。これは、インベントリを更新するために State を更新する必要があるためです。Claptrap はイベント トレーサビリティ ベースのアクタ モードであり、State の更新はイベントによって完了する必要があります。だから、ここで開始し、我々はイベントを介して在庫を更新します。

EventCode は、Claptrap システムの各イベントの一意のエンコーディングです。これは、イベントの識別、シリアル化などにおいて重要な役割を果たします。

打开 HelloClaptrap.Models 项目中的 ClaptrapCodes 类。

[インベントリの更新] の EventCode を追加します。

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
+ public const string SkuInventoryUpdate = "inventoryUpdate" + SkuEventSuffix;

          #endregion
      }
  }
```

## Event を定義します

Event は、イベントのトレーサビリティの鍵です。Claptrap の State を変更するために使用します。また、Event は永続化レイヤーに永続化されます。

在 HelloClaptrap.Models 项目的 Sku/Events 文件夹下创建 InventoryUpdateEvent 类。

次のようなコードを追加します：

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Sku.Events
+ {
+ public class InventoryUpdateEvent : IEventData
+ {
+ public int Diff { get; set; }
+ public int NewInventory { get; set; }
+ }
+ }
```

1. Diff は今回の更新在庫額を示し、`diff > 0` は在庫増加、`diff < 0`は在庫削減を示す.
2. NewInventory は、更新されたインベントリを表します。ここでは、事前に推奨事項を提供しますが、スペースの問題のため、ディスカッションは行わされません：イベントに State の更新されたデータを含めるように提案します。

## EventHandler を実装します

EventHandler 用于将事件更新到 Claptrap 的 State 上。

在 HelloClaptrap.Actors 项目的 Sku/Events 文件夹下创建 InventoryUpdateEventHandler 类。

次のようなコードを追加します：

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Models.Sku.Events;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Sku.Events
+ {
+ public class InventoryUpdateEventHandler
+ : NormalEventHandler<SkuState, InventoryUpdateEvent>
+ {
+ public override ValueTask HandleEvent(SkuState stateData,
+ InventoryUpdateEvent eventData,
+ IEventContext eventContext)
+ {
+ stateData.Inventory = eventData.NewInventory;
+ return new ValueTask();
+ }
+ }
+ }
```

1. 更新されたインベントリはイベントに既に含まれているため、StateData に直接割り当てる必要があります。

## EventHandler を登録します

EventHandler を実装してテストしたら、EventCode と Claptrap に関連付ける前に EventHandler を登録できます。

HelloClaptrap.Actors`プロジェクトの``SkuGrain  クラスを`開きます。

Attribute でタグ付けし、UpdateInventoryAsync 実行イベントを変更します。

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
+ [ClaptrapEventHandler(typeof(InventoryUpdateEventHandler), ClaptrapCodes.SkuInventoryUpdate)]
      public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      {
          public SkuGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
              : base( claptrapGrainCommonService)
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

- throw new NotImplementedException();
+ var evt = this. CreateEvent(new InventoryUpdateEvent
+ {
+ Diff = diff,
+ NewInventory = newInventory
+ });
+ await Claptrap.HandleEventAsync(evt);
+ return StateData.Inventory;
          }
      }
  }
```

## IInitialStateDataFactory を実装します

在庫の照会と更新は、前に完了しました。ただし、通常、在庫には初期金額があり、このセクションではロジックのこの部分を補足します。

在 HelloClaptrap.Actors 项目的 Sku 文件夹下创建 SkuStateInitHandler 类。

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Repository;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Sku
+ {
+ public class SkuStateInitHandler : IInitialStateDataFactory
+ {
+ private readonly ISkuRepository _skuRepository;
+
+ public SkuStateInitHandler(
+ ISkuRepository skuRepository)
+ {
+ _skuRepository = skuRepository;
+ }
+
+ public async Task<IStateData> Create(IClaptrapIdentity identity)
+ {
+ var skuId = identity. Id;
+ var inventory = await _skuRepository.GetInitInventoryAsync(skuId);
+ var re = new SkuState
+ {
+ Inventory = inventory
+ };
+ return re;
+ }
+ }
+ }
```

1. `IInitialStateDataFactory`は、Claptrap が最初にアクティブ化されたときに呼び出され、State の初期値を作成します。
2. 注入`ISkuRepository`Skuに対応する在庫初期金額をデータベースから読み出し、具体的なコードはここでは記載しないが、読者はサンプルウェアハウスの実装を見ることができる。

コードの実装に加えて、呼び出される前に登録が必要です。

HelloClaptrap.Actors`プロジェクトの``SkuGrain  クラスを`開きます。

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
+ [ClaptrapStateInitialFactoryHandler(typeof(SkuStateInitHandler))]
      [ClaptrapEventHandler(typeof(InventoryUpdateEventHandler), ClaptrapCodes.SkuInventoryUpdate)]
      public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      {
          public SkuGrain( IClaptrapGrainCommonService claptrapGrainCommonService)
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

              var evt = this. CreateEvent(new InventoryUpdateEvent
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

## Controllerを変更します

前のすべての手順が完了すると、Claptrap のすべての部分が完了します。ただし、Claptrap は外部プログラムとの相互運用性を直接提供できません。したがって、Controller 層に API を追加して、外部で "インベントリの読み取り" 操作を行う必要があります。

在 HelloClaptrap.Web 项目的 Controllers 文件夹下新建 SkuController 类。

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.IActor;
+ using Microsoft.AspNetCore.Mvc;
+ using Orleans;
+
+ namespace HelloClaptrap.Web.Controllers
+ {
+ [Route("api/[controller]")]
+ public class SkuController : Controller
+ {
+ private readonly IGrainFactory _grainFactory;
+
+ public SkuController(
+ IGrainFactory grainFactory)
+ {
+ _grainFactory = grainFactory;
+ }
+
+ [HttpGet("{id}")]
+ public async Task<IActionResult> GetItemsAsync(string id)
+ {
+ var skuGrain = _grainFactory.GetGrain<ISkuGrain>(id);
+ var inventory = await skuGrain.GetInventoryAsync();
+ return Json(new
+ {
+ skuId = id,
+ inventory = inventory,
+ });
+ }
+ }
+ }
```

1. 新しい API は、特定の SkuId のインベントリを読み取ります。サンプル コードの実装に応じて、`yueluo-123`666 の在庫金額を取得できます。存在しない SkuId は例外をスローします。
1. この例では、次の注文の購入時にインベントリ操作を実行するため、インベントリを更新する外部 API は作成されません。

## 小さな結び目

これで、"商品在庫の管理" という単純な要件がすべて完了しました。

この記事のソース コードは、次のアドレスから入手できます：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
