---
title: "第三步-瞭解項目結構"
description: "第三步-瞭解項目結構"
---

接上一篇 [第二步-創建專案](01-3-Basic-Flow.md) ，我們本篇瞭解一下使用 Newbe.Claptrap 的專案範本創建的專案結構。

<!-- more -->

## 解決方案結構

使用 Visual Studio 或 Rider 開啟位於專案根目錄的解決方案`HelloClaptrap.sln`。

解決方案中包含有若干個解決方案資料夾，其中分別的內容如下：

| 解決方案資料夾          | 说明                                                             |
| ---------------- | -------------------------------------------------------------- |
| 0_Infrastructure | 基礎設施。這裡可以放置一些常用的模型，公共類庫等內容。他們通常被多個其他專案所引用                      |
| 1_Business       | 業務邏輯。這裡可以放置一些核心業務相關的類庫。例如存儲層、業務層等等。特別的，Actor 的具體實現一般也可以放置在此處   |
| 2_Application    | 應用程式。這裡放置運行的應用程式，可以包含一些 WebApi、Grpc 服務、Actor 運行進程等等            |
| SolutionItems    | 一些解決方案等級通用的檔案，例如 nuget.config、tye.yml、Directory.Build.props 等等 |

以上只是為了專案演示所包含的最簡解決方案結構。實際開發中往往還需要加入，倉儲介面，單元測試，後台服務等等其他的一些內容。開發者可以根據團隊規則進行合理擺放。

## 瞭解調用鏈路

現在，我通過一個簡單的調用鏈路來理解 Newbe.Claptrap 運行的過程。

我們來瞭解一下調用 `GET /AuctionItems/{itemId}`所引發的過程。

### API 層

呼叫 API 後，首先進入的自然是 MVC 中的`Controller`。對應項目樣本中的便是`HelloClaptrap.WebApi`專案下的`AuctionItemsController`，以下截取與此 API 相關的部分：

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

這段程式碼表明：

1. `GetStatus`首先創建了`ClaptrapIdentity`這便是[Claptrap Identity](https://claptrap.newbe.pro/zh_Hans/docs/02-10-Claptrap-Identity)，用於定位一個具體的`Claptrap`
2. 接下來調用`_actorProxyFactory`獲取一個 Actor 的代理。這是由 Dapr 提供的介面實現。
3. 呼叫創建好的`auctionItemActor`代理對應的`GetStatusAsync`，這樣便可以調用對應的 Claptrap 實例的方法。
4. 將從 Claptrap 返回的結果進行包裝並作為 API 的返回結果。

這就是 API 層對簡單的一種表現形式：通過創建 Actor 代理，調用 Actor 的方法。API 層實際上一般就是該系統的入口層。不僅僅可以使用 Restful 的方式公開 API。使用 Grpc 或者其他的方式也是完全可以的。

### Claptrap 層

是編寫業務代碼的核心所在，這就和 MVC 中的 Controller 一樣，起到了業務邏輯控制的核心目的。

接下來，我們按照唯讀和寫入兩個方面來觀察一下 Claptrap 層是如何進行工作的。

#### Claptrap 層唯讀操作

接下來瞭解一下 Claptrap 層是如何運行的。通過 IDE 的「查找實現」功能，便可以找到`IAuctionItemActor`對應的實現類在`HelloClaptrap.Actors`專案中的`AuctionItemActor`，以下是與`GetStatusAsync`方法有關的部分：

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

這段程式碼表明：

1. `AuctionItemActor` 上標記了若干個 `Attribute` ，這些 `Attribute` 為系統掃描 `Claptrap` 元件提供了重要的依據。後續的文章中將會詳細解釋相應的功能。
2. `AuctionItemActor` 繼承了 `ClaptrapBoxActor<AuctionItemState>`。繼承該類也就為 `Actor` 添加了事件溯源的核心支援。
3. `AuctionItemActor` 建構函數引入了 `ActorHost` 和 `IClaptrapActorCommonService`。其中 `ActorHost` 是由 Dapr SDK 提供的參數，用於表示當前 Actor 的 Id 和類型等基本資訊。 `IClaptrapActorCommonService` 則是 Claptrap 框架提供的服務介面，Claptrap 所有的行為都是通過改介面中相關的類型實現。
4. `GetStatusAsync` 通過 Claptrap 中的 State 直接讀取數據。由於事件溯源機制的存在，所以開發者可以始終認為 Claptrap 中的 State 永遠都處於正確、最新且可用的狀態。你可以永遠相信 Claptrap 中的 State 的數據，不用考慮如何和持久化層進行交互。

#### Claptrap 層寫入操作

Claptrap 只讀操作是指調用 Actor 不會產生對 Claptrap 狀態產生變化的操作。寫入操作則值得是 Actor 會對 Claptrap 的狀態進行修改。由於事件溯源機制的存在，想要修改 Claptrap 的狀態，就必須通過事件才可以修改。可以通過 `TryBidding` 方法瞭解如何產生一個事件來修改 Claptrap 的 State：

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

這段程式碼表明：

1. 在生成事件之前可以通過 Claptrap State 對資料進行驗證，以決定要不要產生下一步的事件。這是非常有必要的，因為這樣可以將沒必要產生的事件拒之門外。不論從運行邏輯、持久化空間還是執行效率方面都是非常必要的。
2. 經過了必要的驗證后，便可以通過 `this. CreateEvent` 創建一個事件。這是一個擴展方法，其中對 Event 的一些基礎資訊進行了構建。而開發者只需要關心自定義的業務數據部分即可。例如 `NewBidderEvent` 就是開發者需要關心的業務數據。
3. 事件創建完成之後，便可以通過 Claptrap 物件的 `HandleEventAsync` 方法保存並執行這個方法。在這個方法當中 Claptrap 將會把事件進行持久化，並且調用 Handler 來更新 Claptrap 的 State。下文將會描述如何編寫 Handler
4. 調用過 `HandleEventAsync` 之後，如果沒有任何錯誤，則表明事件已經成功持久化了。並且可以認為 Claptrap 中的 State 已經正確更新。故而，此時可以從 State 中讀取最新的數據返回給調用方。

### Handler 層

Handler 層負責執行事件的業務邏輯，並且將數據更新到 State 中。由於 Event 和 State 都是記憶體中的物件，因此。Handler 的代碼實現一般非常的簡單。下面就是當觸發 `NewBidderEvent` 時所調用的 Handler。

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

這段程式碼表明：

1. `NewBidderEventHandler` 繼承了 `NormalEventHandler` 作為基類，這主要是為了簡化 Handler 的實現而添加的輔助類。其泛型參數分別是對應 Claptrap 的 State 類型和 Event 的 EventData 類型。
2. Handler 實現了繼承自基類 `NormalEventHandler` 的 `HandleEvent` 方法。在這個方法中主要是為了對 State 進行更新。

除了以上顯而易見的代碼內容之外，還有一些關於 Handler 重要的運行機制必須在此處說明：

1. Handler 需要對應的 Actor 類型上標記才會被使用。AuctionItemActor 中 `[ClaptrapEventHandler（typeof（NewBidderEventHandler）， ClaptrapCodes.NewBidderEvent）]` 就起到了這個作用。
2. Handler 實現了 `IDispose` 和 `IAsyncDispose` 介面。這表明，Handler 將會在處理事件時按需創建。您可以參見《TODO Claptrap 系統中各物件生命週期》中的說明。
3. 由於事件溯源機制的存在，開發者在編寫 Handler 時要充分考慮 `HandleEvent` 方法中邏輯的冪等性。換句話說，您必須確保相同的參數傳入 `HandleEvent` 方法後得到的結果應該完全一樣。否則，當進行實踐溯源時將會發生意想不到的結果。您可以參見《TODO 事件與狀態的工作原理》中的說明。

有了 Handler 層，便可以通過事件實現對 State 的更新操作。

## 小結

本篇，我們介紹了 Claptrap 專案中主要的專案結構層次和關鍵元件。通過對這些元件的瞭解，開發者已經能夠掌握如何公開 API、生成事件和更新狀態。這也就是最簡單的使用 Claptrap 的必要步驟。

下一步，我們將介紹如何使用 Minion。

<!-- md Footer-Newbe-Claptrap.md -->
