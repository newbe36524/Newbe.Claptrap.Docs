---
title: "ステップ3 - プロジェクト構造を理解する"
description: "ステップ3 - プロジェクト構造を理解する"
---

前の記事「 [ステップ 2 - プロジェクトの作成](01-3-Basic-Flow.md) 」に進み、Newbe.Claptrap のプロジェクト テンプレートを使用して作成されたプロジェクト構造について説明します。

<!-- more -->

## ソリューション構造

Visual Studio または Rider を使用して、プロジェクトのルートにあるソリューション`HelloClaptrap を開.sln`。

ソリューションには、次のようないくつかのソリューション フォルダが含まれています：

| ソリューション フォルダー    | 説明                                                                                                     |
| ---------------- | ------------------------------------------------------------------------------------------------------ |
| 0_Infrastructure | インフラストラクチャ。ここでは、一般的に使用されるモデル、パブリック クラス ライブラリなどを配置できます。通常、他の複数のプロジェクトによって参照されます                         |
| 1_Business       | ビジネス ロジック。ここでは、コア ビジネス関連のクラス ライブラリをいくつか配置できます。たとえば、ストレージ層、ビジネス層などです。特別な、アクタの具体的な実装は、一般的にここに配置することができます |
| 2_Application    | アプリケーション。ここでは、WebApi、Grpc サービス、アクタ実行プロセスなどを含む実行中のアプリケーションを配置します                                        |
| SolutionItems    | nuget.config、tye.yml、Directory.Build.props など、ソリューション レベルで共通するファイルもあります                                |

これらは、プロジェクト デモに含まれる最も単純なソリューション構造のみを目的としています。実際の開発では、多くの場合、追加、倉庫インターフェイス、単体テスト、バックグラウンド サービスなど、他のコンテンツも必要です。開発者は、チームルールに従って合理的に配置することができます。

## 呼び出しリンクについて

次に、リンクを呼び出す簡単な方法で、Newbe.Claptrap が実行するプロセスについて説明します。

GET /AuctionItems/ `呼び出しによって発生{itemId}`を見ていく。

### API レイヤー

API が呼び出された後、最初に入力されるのは、MVC の`Controller`。対応するプロジェクト テンプレートには、`HelloClaptrap.WebApi`プロジェクトの`AuctionItemsController`があり、この API に関連するセクションを以下に切り取：

```cs AuctionItemsController.cs
using System.Threading.Tasks;
using Dapr.Actors;
using Dapr.Actors.Client;
using HelloClaptrap.IActor;
using HelloClaptrap.Models;
using Microsoft.AspNetCore.Mvc;
using Newbe.Claptrap;
using Newbe.Claptrap.Dapr;

namespace HelloClaptrap.WebApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuctionItemsController : ControllerBase
    {
        private readonly IActorProxyFactory _actorProxyFactory;

        public AuctionItemsController(
            IActorProxyFactory actorProxyFactory)
        {
            _actorProxyFactory = actorProxyFactory;
        }

        [HttpGet("{itemId}/status")]
        public async Task<IActionResult> GetStatus(int itemId = 1)
        {
            var id = new ClaptrapIdentity(itemId.ToString(),
                ClaptrapCodes.AuctionItemActor);
            var auctionItemActor = _actorProxyFactory.GetClaptrap<IAuctionItemActor>(id);
            var status = await auctionItemActor.GetStatusAsync();
            var result = new
            {
                status
            };
            return Ok(result);
        }
    }
}
```

このコードは：、

1. `は`、`ClaptrapIdentity`を最初に作成しました  これは、[Claptrap Identity](https://claptrap.newbe.pro/zh_Hans/docs/02-10-Claptrap-Identity)で、特定の`Claptrap`
2. 次に、`_actorProxyFactory`呼び出して、アクタのプロキシを取得します。これは、Dapr によって提供されるインターフェイスによって実装されます。
3. 作成された`auctionItemActor`エージェントに対応する`GetStatusAsync`を呼び出して、対応する Claptrap インスタンスのメソッドを呼び出すことができます。
4. Claptrap から返される結果はラップされ、API から返されます。

これは、API レイヤーの単純な表現です：エージェントを作成してアクタを呼び出す方法です。API レイヤーは、実際には、通常、システムの入り口レイヤーです。Restful の方法で API を公開するだけでなく、API を公開できます。Grpc またはその他の方法を使用することも完全に問題はありません。

### Claptrap レイヤー

は、MVC の Controller と同様に、ビジネス ロジック制御の中心的な目的であるビジネス コードを記述するためのコアです。

次に、読み取り専用と書き込みの 2 つの側面に従って、Claptrap レイヤーがどのように機能するかを確認します。

#### Claptrap レイヤーの読み取り専用操作

次に、Claptrap レイヤーの動作について説明します。ide の「実装の検索」機能を使用すると、`<code>HelloClaptrap.Actors`プロジェクト</code>の`AuctionItemActor`で、`の GetStatusAsync`メソッドに関連するセクションを参照してください：

```cs AuctionItemActor.cs
using System.Linq;
using System.Threading.Tasks;
using Dapr.Actors.Runtime;
using HelloClaptrap.Actors.AuctionItem.Events;
using HelloClaptrap.IActor;
using HelloClaptrap.Models;
using HelloClaptrap.Models.AuctionItem;
using HelloClaptrap.Models.AuctionItem.Events;
using Newbe.Claptrap;
using Newbe.Claptrap.Dapr;

namespace HelloClaptrap.Actors.AuctionItem
{
    [Actor(TypeName = ClaptrapCodes.AuctionItemActor)]
    [ClaptrapStateInitialFactoryHandler(typeof(AuctionItemActorInitialStateDataFactory))]
    [ClaptrapEventHandler(typeof(NewBidderEventHandler), ClaptrapCodes.NewBidderEvent)]
    public class AuctionItemActor : ClaptrapBoxActor<AuctionItemState>, IAuctionItemActor
    {
        private readonly IClock _clock;

        public AuctionItemActor(
            ActorHost actorHost,
            IClaptrapActorCommonService claptrapActorCommonService,
            IClock clock) : base(actorHost, claptrapActorCommonService)
        {
            _clock = clock;
        }

        public Task<AuctionItemStatus> GetStatusAsync()
        {
            return Task.FromResult(GetStatusCore());
        }

        private AuctionItemStatus GetStatusCore()
        {
            var now = _clock. UtcNow;
            if (now < StateData.StartTime)
            {
                return AuctionItemStatus.Planned;
            }

            if (now > StateData.StartTime && now < StateData.EndTime)
            {
                return AuctionItemStatus.OnSell;
            }

            return StateData.BiddingRecords?. Any() == true ? AuctionItemStatus.Sold : AuctionItemStatus.UnSold;
        }
    }
}
```

このコードは：、

1. `auctionItemActor` には、 `Attribute`</code> がシステムスキャン  Claptrap</code> コンポーネントをスキャンするための重要な基礎を提供するいくつかの `<code>Attribute  がマークされています。機能の詳細については、次の記事で説明します。</li>
<li><code>AuctionItemActor` は `ClaptrapBoxActor を継承<AuctionItemState>`。このクラスを継承すると、 `Actor` イベント トレーサビリティのコア サポートも追加されます。
3. `AuctionItemActor` コンストラクターでは、 `ActorHost` および `IClaptrapActorCommonService`。ここで `ActorHost` は Dapr SDK によって提供されるパラメータで、現在のアクタの Id や型などの基本情報を表します。 `IClaptrapActorCommonService` は、Claptrap フレームワークによって提供されるサービス インターフェイスであり、Claptrap のすべての動作は、インターフェイス内の関連する型を変更して実装されます。
4. `GetStatusAsync` Claptrap の State を介してデータを直接読み取ることができます。イベント トレーサビリティ メカニズムが存在するため、開発者は、Claptrap の State が常に正しい、最新、および使用可能な状態にあると常に考え続けることができます。永続化レイヤーと対話する方法に関係なく、Claptrap の State のデータを常に信頼できます。

#### Claptrap レイヤーの書き込み操作

Claptrap 読み取り専用操作は、アクタを呼び出しても Claptrap の状態が変化しない操作です。書き込み操作では、Actor が Claptrap の状態を変更する価値があります。イベント トレーサビリティ メカニズムが存在する場合、Claptrap の状態を変更するには、イベントを使用して変更する必要があります。Claptrap の State `を変更するイベントを生成する方法については、TryBidding` メソッドを使用：

```cs AuctionItemActor.cs
using System.Linq;
using System.Threading.Tasks;
using Dapr.Actors.Runtime;
using HelloClaptrap.Actors.AuctionItem.Events;
using HelloClaptrap.IActor;
using HelloClaptrap.Models;
using HelloClaptrap.Models.AuctionItem;
using HelloClaptrap.Models.AuctionItem.Events;
using Newbe.Claptrap;
using Newbe.Claptrap.Dapr;

namespace HelloClaptrap.Actors.AuctionItem
{
    [Actor(TypeName = ClaptrapCodes.AuctionItemActor)]
    [ClaptrapStateInitialFactoryHandler(typeof(AuctionItemActorInitialStateDataFactory))]
    [ClaptrapEventHandler(typeof(NewBidderEventHandler), ClaptrapCodes.NewBidderEvent)]
    public class AuctionItemActor : ClaptrapBoxActor<AuctionItemState>, IAuctionItemActor
    {
        private readonly IClock _clock;

        public AuctionItemActor(
            ActorHost actorHost,
            IClaptrapActorCommonService claptrapActorCommonService,
            IClock clock) : base(actorHost, claptrapActorCommonService)
        {
            _clock = clock;
        }

        public Task<TryBiddingResult> TryBidding(TryBiddingInput input)
        {
            var status = GetStatusCore();

            if (status != AuctionItemStatus.OnSell)
            {
                return Task.FromResult(CreateResult(false));
            }

            if (input. Price <= GetTopPrice())
            {
                return Task.FromResult(CreateResult(false));
            }

            return HandleCoreAsync();

            async Task<TryBiddingResult> HandleCoreAsync()
            {
                var dataEvent = this. CreateEvent(new NewBidderEvent
                {
                    Price = input. Price,
                    UserId = input. UserId
                });
                await Claptrap.HandleEventAsync(dataEvent);
                return CreateResult(true);
            }

            TryBiddingResult CreateResult(bool success)
            {
                return new()
                {
                    Success = success,
                    NowPrice = GetTopPrice(),
                    UserId = input. UserId,
                    AuctionItemStatus = status
                };
            }

            decimal GetTopPrice()
            {
                return StateData.BiddingRecords?. Any() == true
                    ? StateData.BiddingRecords.First(). Key
                    : StateData.BasePrice;
            }
        }
    }
}
```

このコードは：、

1. イベントを生成する前に、Claptrap State を使用してデータを検証して、次のイベントを生成する必要が決まります。これは、不要なイベントをシャット アウトするために必要です。実行ロジック、永続化スペース、または実行効率の面で非常に必要です。
2. 必要な検証が完了したら、 `this. CreateEvent` イベントを作成します。これは、Event の基になる情報の一部が構築される拡張メソッドです。開発者は、カスタマイズされたビジネス データの一部のみを気にする必要があります。たとえば、 `NewBidderEvent` 開発者が気にする必要があるビジネス データです。
3. イベントの作成が完了したら、Claptrap オブジェクトの `HandleEventAsync` メソッドを使用してメソッドを保存して実行できます。このメソッドでは、Claptrap はイベントを永続化し、Handler を呼び出して Claptrap の State を更新します。Handler の記述方法については、以下で説明します
4. `HandleEventAsync` 呼び出された後、エラーがない場合、イベントは正常に永続化されました。また、Claptrap の State が正しく更新されたと考える場合があります。したがって、この時点では、State から最新のデータを読み取って呼び出し元に返すことができます。

### Handler レイヤー

Handler 層は、イベントのビジネス ロジックを実行し、データを State に更新します。Event と State はどちらもメモリ内のオブジェクトであるためです。Handler のコード実装は、一般的に非常に単純です。次に、 `NewBidderEvent` されたときに呼び出される Handler を示します。

```cs NewBidderEventHandler.cs
using System.Threading.Tasks;
using HelloClaptrap.Models.AuctionItem;
using HelloClaptrap.Models.AuctionItem.Events;
using Newbe.Claptrap;

namespace HelloClaptrap.Actors.AuctionItem.Events
{
    public class NewBidderEventHandler
        : NormalEventHandler<AuctionItemState, NewBidderEvent>
    {
        private readonly IClock _clock;

        public NewBidderEventHandler(
            IClock clock)
        {
            _clock = clock;
        }

        public override ValueTask HandleEvent(AuctionItemState stateData,
            NewBidderEvent eventData,
            IEventContext eventContext)
        {
            if (stateData.BiddingRecords == null)
            {
                stateData.InitBiddingRecords();
            }

            var records = stateData.BiddingRecords;

            records. Add(eventData.Price, new BiddingRecord
            {
                Price = eventData.Price,
                BiddingTime = _clock. UtcNow,
                UserId = eventData.UserId
            });
            stateData.BiddingRecords = records;
            return ValueTask.CompletedTask;
        }
    }
}
```

このコードは：、

1. `NewBidderEventHandler` は、 `NormalEventHandler` を基本クラスとして継承し、主に Handler の実装を簡略化するために追加された補助クラスです。ジェネリック パラメーターは、それぞれ Claptrap の State 型と Event に対応する EventData 型です。
2. Handler は、基本クラス `NormalEventHandler` から継承された `HandleEvent メソッドを実装` しています。この方法では、主に State を更新します。

上記の明白なコードに加えて、Handler に関するいくつかの重要な実行メカニズムは、ここで説明する必要があります：

1. Handler を使用するには、対応するアクタ タイプのタグが必要です。これは、 AuctionItemActor の `[ClaptrapEventHandler(typeof(NewBidderEventHandler), ClaptrapCodes.NewBidderEvent)]` で行います。
2. Handler は、 `IDispose` および `IAsyncDispose インターフェイスを` します。これは、Handler がイベントを処理するときにオンデマンドで作成することを示しています。TODO Claptrap システムの各オブジェクトのライフサイクルの説明を参照してください。
3. イベント トレーサビリティ メカニズムが存在する場合、開発者は Handler を記述する際に、 `HandleEvent` メソッドのロジックのべき等性を十分に考慮する必要があります。つまり、同じパラメーターを HandleEvent メソッド `渡した` 結果がまったく同じであることを確認する必要があります。それ以外の場合、実用的なトレーサビリティを行うと、予期しない結果が発生します。「TODO イベントと状態のしくみ」の説明を参照してください。

Handler レイヤーを使用すると、イベントを使用して State の更新操作を実装できます。

## 小さな結び目

この記事では、Claptrap プロジェクトの主要なプロジェクト構造レベルと主要コンポーネントについて説明します。これらのコンポーネントを理解すると、開発者は API を公開し、イベントを生成し、ステータスを更新する方法を習得できます。これは、Claptrap を使用する最も簡単な手順です。

次に、Minion の使用方法について説明します。

<!-- md Footer-Newbe-Claptrap.md -->
