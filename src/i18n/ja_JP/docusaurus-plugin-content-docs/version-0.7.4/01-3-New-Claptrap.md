---
title: "ステップ 3 - 商品在庫管理"
description: "ステップ 3 - 商品在庫管理"
---

この Class Chartp でビジネスを始めるために、これを読んでみてください。

<!-- more -->

:::caution 该文档仅适用于 0.7 及以下版本，若想要查看最新版本内容，请点击右上角进行切换。 :::

## 投稿のまとめ

本篇，我通过实现“管理库存”的需求来了解一下如何在已有的项目样例中定义一个 Claptrap。

结合前一篇的基本步骤，定义 Claptrap 只要而外增加一些步骤就可以了。完整的步骤如下所示，其中标记为“新内容”的部分属于本篇的区别于前篇的新内容：

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

这是一个从下向上的过程，实际的编码过程中开发也可以有所调整。

本篇实现的业务用例：

1. SKUの表示 (Stock keeping Unit) オブジェクト。
2. SKUの更新し、読み込みが可能である。

## ClaptrapTypes の定義

ClaptrapTypeCode 是一个 Claptrap 的唯一编码。其在 State 的识别，序列化等方面起到了重要的作用。

打开`HelloClaptrap.Models`项目中的`ClaptrapCodes`类。

添加 SKU 的 ClaptrapTypeCode。

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

State 在 Actor 模式中代表了 Actor 对象当前的数据表现。

由于 Claptrap 是基于事件溯源模式的 Actor。因此定义恰好的 State 非常重要。

在该示例当中，我们只需要记录当前 SKU 的库存即可，因此，State 的设计非常的简单。

在 HelloClaptrap.Models 项目添加 Sku 文件夹，并在该文件夹下创建 SkuState 类。

添加如下代码：

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

Inventory 表示当前 SKU 的库存。

`IStateData`接口是框架中表示 State 的空接口，用于在泛型推断时使用。

## Grain インターフェースの定義

定义 Grain 接口的定义，才能够提供外部与 Claptrap 的互操作性。

在 HelloClaptrap.IActors 项目中添加 ISkuGrain 接口。

添加接口以及 Attribute。

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

其中增加了以下内容：

1. `ClaptrapState`をタグ付けすると、State と Grain で関連づけられます。
2. このインターフェースは`IClaptrapGrain`を継承しました。これはOrileans 命令書に則って名前を継承さなければなりません。
3. GetInventoryAsyncメソッドを追加しました。 "が最も必要なときに示す"。
4. 更新: UpdateInventoryAsync の追加では、「インクリメント更新」のようにしてください。`diff > 0` は、在庫の増加を表します。`diff < 0`は、在庫を減らします。
5. Grain メソッドの定義は、特定の制限があることに注意してください。詳細は、[Developing a Grain を参照してください](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## Grain 実装

定义好 ISkuGrain 之后，便可以添加代码进行实现。

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

其中增加了以下内容：

1. `ClaptrapBox<SkuState>。`それは、命の恩義、`ClasskuGrain`、`ClaptrapBox`をフレームワークによって定義する、ジェネレーションされたクラインのパラメータです。
2. GetInventoryAsync メソッドを実装し StateData から現在の在庫を読み込みます。
3. UpdateInventoryAsync メソッドを実装し、ビジネスを行うと思われる場合には例外がスローされます。
4. UpdateInventoryAsyncの最後に、NotmplementedException は定義されていないので、現在のイベントはすでに定義されていないのが原因です。
5. BizのException は例外です。自分で追加することができます。実際には、ビジネスに異常をスローするものではなく、ステータスコードなどの返しにいくらかの値を使うこともある。

## Grain に登録

Claptrap 对应的 Grain 需要在应用程序启动时进行注册，这样框架才能扫描发现。

由于示例代码采用的是程序集范围内扫描，因此实际上不需要进行修改。

这里指出发生注册的位置：

打开`HelloClaptrap.BackendServer`项目的`Program`类。

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

因为 ISkuGrain 和 SkuGrain 分别于 ICartGrain 和 CartGrain 属于同一程序集，因而此处不需要修改。

## Eventのコード

前面我们已经实现了 Claptrap 的主要部分，但唯独没有完成更新库存的操作。这是因为更新库存是需要对 State 进行更新的。而我们都知道 Claptrap 是基于事件溯源的 Actor 模式，对 State 的更新需要通过事件才能完成。故而由这里开始，我们来通过事件更新库存。

EventCode 是 Claptrap 系统每个事件的唯一编码。其在事件的识别，序列化等方面起到了重要的作用。

打开 HelloClaptrap.Models 项目中的 ClaptrapCodes 类。

添加“更新库存”的 EventCode。

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

Event 是事件溯源的关键。用于改变 Claptrap 中的 State。并且 Event 会被持久化在持久层。

在 HelloClaptrap.Models 项目的 Sku/Events 文件夹下创建 InventoryUpdateEvent 类。

添加如下代码：

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

EventHandler 用于将事件更新到 Claptrap 的 State 上。

在 HelloClaptrap.Actors 项目的 Sku/Events 文件夹下创建 InventoryUpdateEventHandler 类。

添加如下代码：

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

实现并测试完 EventHandler 之后，便可以将 EventHandler 进行注册，以便与 EventCode 以及 Claptrap 进行关联。

打开`HelloClaptrap.Actors`项目的`SkuGrain`类。

使用 Attribute 进行标记，并修改 UpdateInventoryAsync 执行事件。

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

前面我们已经完成了库存的查询和更新。不过通常来说库存有一个初始数额，我们本节在补充这部分逻辑。

在 HelloClaptrap.Actors 项目的 Sku 文件夹下创建 SkuStateInitHandler 类。

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

除了实现代码之外，还需要进行注册才会被调用。

打开`HelloClaptrap.Actors`项目的`SkuGrain`类。

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

前面的所有步骤完成之后，就已经完成了 Claptrap 的所有部分。但由于 Claptrap 无法直接提供与外部程序的互操作性。因此，还需要在在 Controller 层增加一个 API 以便外部进行“读取库存”的操作。

在 HelloClaptrap.Web 项目的 Controllers 文件夹下新建 SkuController 类。

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

至此，我们就完成了“管理商品库存”这个简单需求的所有内容。

您可以从以下地址来获取本文章对应的源代码：

- [GitHub](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
