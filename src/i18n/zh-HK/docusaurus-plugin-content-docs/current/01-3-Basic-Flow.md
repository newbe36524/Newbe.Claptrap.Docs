---
title: "第三步-了解项目结构"
description: "第三步-了解项目结构"
---

接上一篇 [第二步-创建项目](01-3-Basic-Flow.md) ，我们本篇了解一下使用 Newbe.Claptrap 的项目模板创建的项目结构。

<!-- more -->

## 解决方案结构

使用 Visual Studio 或者 Rider 打开位于项目根目录的解决方案`HelloClaptrap.sln`。

解决方案中包含有若干个解决方案文件夹，其中分别的内容如下：

| 解决方案文件夹          | 说明                                                             |
| ---------------- | -------------------------------------------------------------- |
| 0_Infrastructure | 基础设施。这里可以放置一些常用的模型，公共类库等内容。他们通常被多个其他项目所引用                      |
| 1_Business       | 业务逻辑。这里可以放置一些核心业务相关的类库。例如存储层、业务层等等。特别的，Actor 的具体实现一般也可以放置在此处   |
| 2_Application    | 应用程序。这里放置运行的应用程序，可以包含一些 WebApi、Grpc 服务、Actor 运行进程等等            |
| SolutionItems    | 一些解决方案级别通用的文件，例如 nuget.config、tye.yml、Directory.Build.props 等等 |

以上只是为了项目演示所包含的最简解决方案结构。实际开发中往往还需要加入，仓储接口，单元测试，后台服务等等其他的一些内容。开发者可以根据团队规则进行合理摆放。

## 了解调用链路

现在，我通过一个简单的调用链路来理解 Newbe.Claptrap 运行的过程。

我们来了解一下调用 `GET /AuctionItems/{itemId}`所引发的过程。

### API 层

调用 API 后，首先进入的自然是 MVC 中的`Controller`。对应项目模板中的便是`HelloClaptrap.WebApi`项目下的`AuctionItemsController`，以下截取与此 API 相关的部分：

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

这段代码表明：

1. `GetStatus`首先创建了`ClaptrapIdentity`这便是[Claptrap Identity](https://claptrap.newbe.pro/zh_Hans/docs/02-10-Claptrap-Identity)，用于定位一个具体的`Claptrap`
2. 接下来调用`_actorProxyFactory`获取一个 Actor 的代理。这是由 Dapr 提供的接口实现。
3. 调用创建好的`auctionItemActor`代理对应的`GetStatusAsync`，这样便可以调用对应的 Claptrap 实例的方法。
4. 将从 Claptrap 返回的结果进行包装并作为 API 的返回结果。

这就是 API 层对简单的一种表现形式：通过创建 Actor 代理，调用 Actor 的方法。API 层实际上一般就是该系统的入口层。不仅仅可以使用 Restful 的方式公开 API。使用 Grpc 或者其他的方式也是完全可以的。

### Claptrap 层

是编写业务代码的核心所在，这就和 MVC 中的 Controller 一样，起到了业务逻辑控制的核心目的。

接下来，我们按照只读和写入两个方面来观察一下 Claptrap 层是如何进行工作的。

#### Claptrap 层只读操作

接下来了解一下 Claptrap 层是如何运行的。通过 IDE 的“查找实现”功能，便可以找到`IAuctionItemActor`对应的实现类在`HelloClaptrap.Actors`项目中的`AuctionItemActor`，以下是与`GetStatusAsync`方法有关的部分：

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
            var now = _clock.UtcNow;
            if (now < StateData.StartTime)
            {
                return AuctionItemStatus.Planned;
            }

            if (now > StateData.StartTime && now < StateData.EndTime)
            {
                return AuctionItemStatus.OnSell;
            }

            return StateData.BiddingRecords?.Any() == true ? AuctionItemStatus.Sold : AuctionItemStatus.UnSold;
        }
    }
}
```

这段代码表明：

1. `AuctionItemActor` 上标记了若干个 `Attribute` ，这些 `Attribute` 为系统扫描 `Claptrap` 组件提供了重要的依据。后续的文章中将会详细解释相应的功能。
2. `AuctionItemActor` 继承了 `ClaptrapBoxActor<AuctionItemState>`。继承该类也就为 `Actor` 添加了事件溯源的核心支持。
3. `AuctionItemActor` 构造函数引入了 `ActorHost` 和 `IClaptrapActorCommonService`。其中 `ActorHost` 是由 Dapr SDK 提供的参数，用于表示当前 Actor 的 Id 和类型等基本信息。 `IClaptrapActorCommonService` 则是 Claptrap 框架提供的服务接口，Claptrap 所有的行为都是通过改接口中相关的类型实现。
4. `GetStatusAsync` 通过 Claptrap 中的 State 直接读取数据。由于事件溯源机制的存在，所以开发者可以始终认为 Claptrap 中的 State 永远都处于正确、最新且可用的状态。你可以永远相信 Claptrap 中的 State 的数据，不用考虑如何和持久化层进行交互。

#### Claptrap 层写入操作

Claptrap 只读操作是指调用 Actor 不会产生对 Claptrap 状态产生变化的操作。写入操作则值得是 Actor 会对 Claptrap 的状态进行修改。由于事件溯源机制的存在，想要修改 Claptrap 的状态，就必须通过事件才可以修改。可以通过 `TryBidding` 方法了解如何产生一个事件来修改 Claptrap 的 State：

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

            if (input.Price <= GetTopPrice())
            {
                return Task.FromResult(CreateResult(false));
            }

            return HandleCoreAsync();

            async Task<TryBiddingResult> HandleCoreAsync()
            {
                var dataEvent = this.CreateEvent(new NewBidderEvent
                {
                    Price = input.Price,
                    UserId = input.UserId
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
                    UserId = input.UserId,
                    AuctionItemStatus = status
                };
            }

            decimal GetTopPrice()
            {
                return StateData.BiddingRecords?.Any() == true
                    ? StateData.BiddingRecords.First().Key
                    : StateData.BasePrice;
            }
        }
    }
}
```

这段代码表明：

1. 在生成事件之前可以通过 Claptrap State 对数据进行验证，以决定要不要产生下一步的事件。这是非常有必要的，因为这样可以将没必要产生的事件拒之门外。不论从运行逻辑、持久化空间还是执行效率方面都是非常必要的。
2. 经过了必要的验证后，便可以通过 `this.CreateEvent` 创建一个事件。这是一个扩展方法，其中对 Event 的一些基础信息进行了构建。而开发者只需要关心自定义的业务数据部分即可。例如 `NewBidderEvent` 就是开发者需要关心的业务数据。
3. 事件创建完成之后，便可以通过 Claptrap 对象的 `HandleEventAsync` 方法保存并执行这个方法。在这个方法当中 Claptrap 将会把事件进行持久化，并且调用 Handler 来更新 Claptrap 的 State。下文将会描述如何编写 Handler
4. 调用过 `HandleEventAsync` 之后，如果没有任何错误，则表明事件已经成功持久化了。并且可以认为 Claptrap 中的 State 已经正确更新。故而，此时可以从 State 中读取最新的数据返回给调用方。

### Handler 层

Handler 层负责执行事件的业务逻辑，并且将数据更新到 State 中。由于 Event 和 State 都是内存中的对象，因此。Handler 的代码实现一般非常的简单。下面就是当触发 `NewBidderEvent` 时所调用的 Handler。

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

            records.Add(eventData.Price, new BiddingRecord
            {
                Price = eventData.Price,
                BiddingTime = _clock.UtcNow,
                UserId = eventData.UserId
            });
            stateData.BiddingRecords = records;
            return ValueTask.CompletedTask;
        }
    }
}
```

这段代码表明：

1. `NewBidderEventHandler` 继承了 `NormalEventHandler` 作为基类，这主要是为了简化 Handler 的实现而添加的辅助类。其泛型参数分别是对应 Claptrap 的 State 类型和 Event 的 EventData 类型。
2. Handler 实现了继承自基类 `NormalEventHandler` 的 `HandleEvent` 方法。在这个方法中主要是为了对 State 进行更新。

除了以上显而易见的代码内容之外，还有一些关于 Handler 重要的运行机制必须在此处说明：

1. Handler 需要对应的 Actor 类型上标记才会被使用。AuctionItemActor 中 `[ClaptrapEventHandler(typeof(NewBidderEventHandler), ClaptrapCodes.NewBidderEvent)]` 就起到了这个作用。
2. Handler 实现了 `IDispose` 和 `IAsyncDispose` 接口。这表明，Handler 将会在处理事件时按需创建。您可以参见《TODO Claptrap 系统中各对象生命周期》中的说明。
3. 由于事件溯源机制的存在，开发者在编写 Handler 时要充分考虑 `HandleEvent` 方法中逻辑的幂等性。换句话说，您必须确保相同的参数传入 `HandleEvent` 方法后得到的结果应该完全一样。否则，当进行实践溯源时将会发生意想不到的结果。您可以参见《TODO 事件与状态的工作原理》中的说明。

有了 Handler 层，便可以通过事件实现对 State 的更新操作。

## 小結

本篇，我们介绍了 Claptrap 项目中主要的项目结构层次和关键组件。通过对这些组件的了解，开发者已经能够掌握如何公开 API、生成事件和更新状态。这也就是最简单的使用 Claptrap 的必要步骤。

下一步，我们将介绍如何使用 Minion。

<!-- md Footer-Newbe-Claptrap.md -->
