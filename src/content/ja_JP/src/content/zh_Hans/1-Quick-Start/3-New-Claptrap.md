---
title: 'ステップ3 - Claptrapを定義し、商品在庫を管理します。'
metaTitle: 'ステップ3 - Claptrapを定義し、商品在庫を管理します。'
metaDescription: 'ステップ3 - Claptrapを定義し、商品在庫を管理します。'
---

この記事を読んで、Claptrap を使用してビジネスを実装する方法を試す準備ができます。

> [現在表示されているバージョンは、簡体字中国語から機械翻訳され、手動校正の結果です。ドキュメントに不適切な翻訳がある場合は、ここをクリックして翻訳提案を送信してください。](https://crwd.in/newbeclaptrap)

<!-- more -->

## 概要を開始します。

この記事では、在庫管理の要件を実装して、既存のプロジェクト サンプルで Claptrap を定義する方法について説明します。

前の基本的な手順と組み合わせると、Claptrap を定義する必要があります。完全な手順は次のようになりますが、"新しいコンテンツ" というラベルの付いたセクションは、前の記事とは異なる新しいコンテンツ：

1. ClaptrapTypeCode の定義 (新しいコンテンツ)
1. ステートの定義 (新しいコンテンツ)
1. Grain インターフェイスの定義 (新しいコンテンツ)
1. グレーインの実装 (新しいコンテンツ)
1. グラインにサインアップする (新しいコンテンツ)
1. EventCode を定義します。
1. イベントを定義します。
1. EventHandler を実装します。
1. EventHandler にサインアップします。
1. IInitialStateDataFactory の実装 (新しいコンテンツ)
1. Controller を変更します。

これは下から上向きのプロセスであり、実際のコーディング プロセスで開発することもできます。

この記事で実装されるビジネス ユース ケース：

1. インベントリ データを表す SKU (Stock keeping Unit) オブジェクトを実装します。
2. SKU を更新および読み取る機能。

## ClaptrapTypeCode を定義します。

ClaptrapTypeCode は、Claptrap の唯一のエンコーディングです。これは、State の認識、シリアル化などに重要な役割を果たします。

プロジェクト`の<code>ClaptrapCode`s  クラスを</code>開きます。

SKU の ClaptrapTypeCode を追加します。

```cs
  namespace HelloClaptrap.Models
  {
      public static class ClaptrapCodes
      {
          public const string CartGrain = "cart_claptrap_newbe";
          private const string CartEventSuffix = "_e_" + CartGrain;
          public const string AddItemToCart = "addItem" + CartEventSuffix;
          public const string RemoveItemFromCart = "remov. eItem" + CartEventSuffix;

          #region Sku

+ public const string SkuGrain = "sku_claptrap_newbe";
+ private const string SkuEventSuffix = "_e_" + SkuGrain;

          #endregion
      ]
  ]
```

## State を定義します。

State は、アキューラ モードでアキューラ オブジェクトの現在のデータ表現を表します。

Claptrap はイベント トレーサビリティ パターンに基づくアキューラです。したがって、適切な State を定義することが重要です。

この例では、現在の SKU の在庫を記録するだけで済むため、State の設計は非常に簡単です。

[`HelloClaptrap.Models`プロジェクトに`Sku`フォルダを追加し、そのフォルダの下に`SkuState クラスを`します。

次のようなコードを追加します：

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Sku
+ {
+ public class SkuState : IStateData
+ {
+ public int Inventory = get; set; }
+ }
+ }
```

Inventory は、現在の SKU のインベントリを表します。

`IStateData`インターフェイスは、ジェネリック推論で使用するフレームワーク内の State を表す空のインターフェイスです。

## Grain インターフェイスを定義します。

外部と Claptrap の相互運用性を提供するには、Grain インターフェイスの定義を定義します。

`HelloClaptrap.IActors`プロジェクトに`ISkuGrain インターフェイスを`します。

インターフェイスと Attribute を追加します。

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models;
+ using HelloClaptrap.Models.Sku;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.IActor
+ #
+ [ClaptrapState(typeof(スクステート),. ClaptrapCodes.SkuGrain)*
+ public interface ISkuGrain : IClaptrapGrain
+ {
+ /// <summary>
+ /// Get latest inventory of this sku
+ /// </summary>
+ /// <returns></returns>
+。         Task<int> GetInventoryAsync();
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

これには、次の項目が追加されます：

1. ClaptrapState`マークを付`State を Grain に関連付けます。
2. インターフェイスは、`の実行に依存するフレームワーク定義の Grain インターフェイスである  IClaptrapGrain`を継承します。
3. GetInventoryAsync メソッドが追加され、"現在のインベントリの取得" が表されます。
4. UpdateInventoryAsync メソッドが追加され、"現在のインベントリの増分更新" が表されます。`diff > 0` 在庫の増加を示し、`diff < 0`在庫の減少を示します。
5. Grain のメソッド定義には一定の制限があります。詳細については、[「Developing a Grain」の記事を](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## グラインを実装します。

ISkuGrain を定義したら、実装するコードを追加できます。

`HelloClaptrap.Actors`プロジェクトに新しい`Sku`フォルダを作成し、そのフォルダーに`SkuGrain クラスを`します。

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

これには、次の項目が追加されます：

1. `ClaptrapBoxGrain<SkuState>`を継承し、`ISkuGrain`を実装すると、`ClaptrapBoxGrain`は、ジェネリック パラメーターが対応する State 型を表すフレームワーク定義の Grain 基本クラスです。
2. StateData から現在のインベントリを読み取る GetInventoryAsync メソッドを実装します。
3. UpdateInventoryAsync メソッドを実装し、ビジネス判断コードを追加し、ビジネス アクションの条件が満たされていない場合に例外をスローします。
4. UpdateInventoryAsync の最後には、現在のイベントがまだ定義されていないので、後続のコードの実装を待つ必要があるため、NotImplementedException をスローします。
5. BizException は、自分で追加できるカスタム例外です。実際の開発では、ビジネスの中断を示す例外をスローしたり、代わりにステータス コードまたはその他の戻り値を使用したりすることもできます。

## グラインにサインアップします。

Claptrap に対応する Grain は、フレームワークが検出をスキャンできるように、アプリケーションの起動時に登録する必要があります。

サンプル コードはアセンブリ全体のスキャンを受け取るため、実際には変更する必要はありません。

ここでは、登録が発生した場所を示します：

HelloClaptrap.BackendServer`プロジェクトのプロ`プログラム`クラスを`します。

```cs
  using システム;
  は、using Autofac;
  は、using HelloClaptrap.Actors.Cart;
  は、using HelloClaptrap.IActor;
  は、using HelloClaptrap.Repository;
  、マイクロソフト.AspNetCore.Hosting を参照してください。
  、using Microsoft.Extensions.Hosting;
  using Microsoft.Extensions.Logging;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Bootstrapper;
  は、NLog.Web を呼び出します。
  のオーランス;

  namespace HelloClaptrap.BackendServer
  {
      public class Program
      #

          public static IHostBuilder CreateHostBuilder(string[] args) —>
              Host.CreateDefaultBuilder(args)
                  . ConfigureWebHostDefaults (webBuilder => { webBuilder.UseStartup<Startup>(); })
                  。 UseClaptrap (
                      ブイルダー =>
                      =
+ builder
+ . ScanClaptrapDesigns(new[]
+ {
+ typeof(ICartGrain). Assembly,
+ typeof (CartGrain). Assembly,
+ });
                      ] を
                      、 builder => { builder. レギステルモドゥル<RepositoryModule>(); ))
                  。 UseOrleansClaptrap()
                  . UseOrleans (builder => builder. UseDashboard(options => options. ポート = 9000))
                  。 ConfigureLogging (logging =>
                  =
                      logging. クリアプロビダーズ();
                      logging. SetMinimumLevel (LogLevel.Trace);
                  })
                  。 UseNLog();
      ]
  ]
```

ISkuGrain と SkuGrain は、それぞれ ICartGrain と CartGrain で同じアセンブリに属しているため、ここで変更する必要はありません。

## EventCode を定義します。

前述のように、Claptrap の主要部分を実装しましたが、インベントリの更新は完了しませんでした。これは、在庫の更新に State を更新する必要があるためです。Claptrap はイベント のトレーサビリティに基づくアキューラ モードであり、State の更新はイベントを通じて完了する必要があります。だから、ここで開始し、我々はイベントを介して在庫を更新します。

EventCode は、Claptrap システムのイベントごとに一意のエンコーディングです。これは、イベントの識別、シリアル化などに重要な役割を果たしています。

プロジェクト`の<code>ClaptrapCode`s  クラスを</code>開きます。

[インベントリの更新] の EventCode を追加します。

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
+ public const string SkuInventoryUpdate = "inventoryUpdate" + SkuEventSuffix;

          #endregion
      ]
  ]
```

## イベントを定義します。

Event は、イベントのトレーサビリティの鍵です。Claptrap の State を変更するために使用します。また、Event は永続化レイヤーに永続化されます。

`HelloClaptrap.Models`プロジェクトの`Sku/Events`フォルダーの下に`InventoryUpdateEvent クラスを`します。

次のようなコードを追加します：

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Sku.Events
+ {
+ public class InventoryUpdateEvent : IEventData
+ {
+ public int Diff = get; set; }
+ public int NewInventory = get

; set;
```

1. Diff は今回の更新在庫の金額を示し、`diff > 0` は在庫の増加を示し、`diff < 0`は在庫削減を示す.
2. NewInventory は、更新後のインベントリを表します。ここでは、事前に推奨事項を示しますが、長さのためにディスカッションは展開されません：イベントに State の更新されたデータを含める必要があります。

## EventHandler を実装します。

`EventHandler`Claptrap の`State にイベントを更新するために`されています。

`HelloClaptrap.Actors`プロジェクトの`Sku/Events`フォルダの下に`InventoryUpdateEventHandler`します。

次のようなコードを追加します：

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Models.Sku.Events;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Sku.Events
+ #
+ public class InventoryUpdateEventHandler
+ : NormalEventHandler<SkuState, InventoryUpdateEvent>
+ {
+ public override ValueTask HandleEvent(skuState stateData,
+ InventoryUpdateevent eventdata,
+ IEvent Eventcontext)
>
+ stateData.Inventory = eventData.NewInventory;
+ return new ValueTask();
+ }
+ }
+ }
```

1. 更新されたインベントリがイベントに既に含まれているため、StateData に直接値を割り当てる必要があります。

## EventHandler にサインアップします。

EventHandler を実装してテストしたら、EventHandler を登録して EventCode と Claptrap に関連付けることができます。

HelloClaptrap.Actors`プロジェクトの skuGrain`クラス`開`します。

Attribute でマークし、UpdateInventoryAsync 実行イベントを変更します。

```cs
  using System.Threading.Tasks;
+ using HelloClaptrap.Actors.Sku.Events;
  ハロークラプ.IActor;
  は、using HelloClaptrap.Models;
  は、using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Models.Sku.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Sku
  @
+ [ClaptrapEventHandler(typeof(InventoryUpdateEvent Handler), ClaptrapCodes.SkuInventoryUpdate
      public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      {
          public SkuGrain(iClaptrapGrainCommon Service claptrapGrainCommonService)
              : base( claptrapGrainCommonService)
          {
          }

          public Task<int> GetInventoryAsync()
          {
              return Task.FromResult(stateData.Inventory);
          }

          public async Task<int> UpdateInventoryAsync(int diff)
          {
              if (diff =0)
              =
                  throw new BizException ("diff can't be 0");
              _

              var old = StateData.Inventory;
              var newInventory = old + diff;
              if (newInventory < 0)
              @
                  throw new BizException(
                      $"failed to update inventory. It will be less than 0 if add diff amount. current : {old} , diff : {diff}");
              ]

- throw new NotImplementedException();
+ var evt = this. CreateEvent (new InventoryUpdateEvent
+ {
+ Diff = diff,
+ NewInventory = newInventory
+ });
+ await Claptrap.HandleEventAsync (evt);
+ return StateData.Inventory;
          ]
      }
  ]
```

## IInitialStateDataFactory を実装します。

以前は、インベントリのクエリと更新が完了しました。ただし、通常、在庫には初期金額があり、このセクションではロジックのこの部分を補足します。

`HelloClaptrap.Actors`プロジェクトの`Sku`フォルダの下に`SkuStateInitHandler クラスを`します。

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Repository;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Sku
+ #
+ public class SkuStateInitHandler : IInitialStateDataFactory
+ {
+ private readonly ISkuRepository _skuRepository;
+
+ public SkuStateInitHandler (
+ ISkuRepository skuRepository)
= = =
+ _skuRepository = sk. uRepository;
+
+
+ public async Task<IStateData> Create(IClaptrapIdentity identity)
+ {
+ var skuId = identity. Id;
+ var inventory = await _skuRepository.GetInitInventoryAsync (skuId);
+ var re = new SkuState
+ {
+ Inventory = inventory
+ } ;
+ return re;
+ }
+ }
+ }
```

1. `IInitialStateDataFactory`は、Claptrap が最初にアクティブ化されたときに呼び出され、State の初期値を作成するために使用されます。
2. インジェクション`ISkuRepository`データベースから Sku の対応する在庫初期金額を読み取り、特定のコードをここにリストし、読者はサンプル リポジトリの実装を表示できます。

コードを実装するだけでなく、呼び出されるには登録が必要です。

HelloClaptrap.Actors`プロジェクトの skuGrain`クラス`開`します。

```cs
  using System.Threading.Tasks;
  は、using HelloClaptrap.Actors.Sku.Events;
  ハロークラプ.IActor;
  は、using HelloClaptrap.Models;
  は、using HelloClaptrap.Models.Sku;
  using HelloClaptrap.Models.Sku.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Sku
  #
+ [ClaptrapStateInitialFactory Handler(typeof)]
      [ClaptrapEvent Handler(イヴェントライ・イベント・ハンドラー), ClaptrapCodes.SkuInventoryUpdate
      public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      =
          public SkuGrain ( iClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

          public Task<int> getInventoryAsync()
          {
              return Task.FromResult (stateData.Inventory);


          public async task<int> UpdateInventoryAsync (int diff)
          {
              if (diff == 0)
              =
                  throw new BizException("diff can't be 0") )
              }

              var old = StateData.Inventory;
              var newInventory = old + diff;
              if (newInventory < 0)
              =
                  throwdata.inventory;  var newInventory = old + diff;  if (newinventory  0)  {  throwdata.inventory; on (
                      $"failed to update inventory. It will be less than 0 if add diff amount. current : {old} , diff : {diff}");
              ]

              var evt = this. CreateEvent(new InventoryUpdateEvent
              {
                  Diff = diff,
                  NewInventory = newInventory
              });
              await Claptrap.HandleEventAsync (evt);
              レターンステート.Inventory;
          ]
      }
  ]
```

## Controller を変更します。

前のすべての手順が完了すると、Claptrap のすべての部分が完了します。ただし、Claptrap は外部プログラムとの相互運用性を直接提供できません。したがって、外部で "インベントリの読み取り" 操作を行うには、Controller 層に API を追加する必要があります。

HelloClaptrap.</code>Web`プロジェクトの<code>Controllers`フォルダの下に、新しい`SkuController クラスを`します。

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.IActor;
+ using マイクロソフト.AspNetCore.Mvc;
+ using Orleans;
+
+ namespace HelloClaptrap.web.Controllers
+ #
+ [route(以下「api/[controller]」)]
+ public class SkuController : Controller
+ {
+ private readonly IGrainFactory _grainFactory;
+
+ public SkuController (
+ IGrainFactory grainFactory)
+ {
+ _grainFactory = grainFactory;
+ } +
+
+ [httpGet("{id}")]
+ public async Task<IActionResult> GetItemsAsync(string id)
+ {
+ var skugrain = _grainFac. トーリー GetGrain<ISkuGrain>(id);
+ var inventory = await skuGrain.GetInventoryAsync();
+ return Json (new
+ {
+ skuId = id,
+ inventory = inventory,
+ });
+ }
+ }
+ }
```

1. 新しい API は、特定の SkuId のインベントリを読み取ります。サンプル コードの実装では、`yueluo-123`666 の在庫を受け取ります。存在しない SkuId は例外をスローします。
1. この例では、次の注文時に在庫操作が行われるため、インベントリを更新する外部 API は作成されません。

## 小さな結び目。

これまでのところ、私たちは「商品在庫の管理」という単純な要件のすべてを完了しました。

この記事のソース コードは、次のアドレスから入手できます：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
