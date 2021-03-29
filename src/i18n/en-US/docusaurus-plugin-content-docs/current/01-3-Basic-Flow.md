---
title: "Step 3 - Understand the project structure"
description: "Step 3 - Understand the project structure"
---

Next to the [Step 2 - Create Project](01-3-Basic-Flow.md) , let's look at the project structure created using the Newbe.Claptrap project template.

<!-- more -->

## The solution structure

Use Visual Studio or Rider to open a solution at the root of the`helloClaptrap .sln`.

The solution contains several solution folders, each of which is as follows：

| The solution folder | Description                                                                                                                                                                                                      |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0_Infrastructure    | Infrastructure.Here you can place some commonly used models, common class libraries, and so on.They are usually referenced by multiple other projects                                                            |
| 1_Business          | Business logic.Here you can place some core business-related class libraries.For example, storage tiers, business tiers, and so on.In particular, specific implementations of Actor can generally be placed here |
| 2_Application       | Application.Here you can place running applications that can include some WebApi, Grpc services, Actor run processes, and so on                                                                                  |
| SolutionItems       | Some solution-level files, such as nuget.config, tye.yml, Directory.Build.props, and so on                                                                                                                       |

These are just the simplest solution structures included in the project demonstration.In actual development, you often need to join, warehouse interfaces, unit testing, back-office services and other content.Developers can position them according to team rules.

## Learn about calling links

Now, I understand the process of running Newbe.Claptrap with a simple call.

Let's look at the `called GET/AuctionItems/{itemId}`.

### API layer

When the API is called, the first natural entry is the`Controller`.Among the corresponding project templates is`AuctionItemsController`under the`HelloClaptrap.WebApi`project, and the following sections related to this API are：

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

This code indicates that：

1. `GetStatus`first created`ClaptrapIdentity`, which is the[Claptrap Identity](https://claptrap.newbe.pro/zh_Hans/docs/02-10-Claptrap-Identity), which is used to locate a specific`Claptrap`
2. Next call`_actorProxyFactory`to get an Actor's proxy.This is implemented by an interface provided by Dapr.
3. Call the`GetStatusAsync`for the created`auctionItemActor`agent, so that you can call the method for the corresponding Claptrap instance.
4. The results returned from Claptrap are wrapped and returned as API results.

This is a simple representation of the API layer：method that calls Actor by creating an Actor proxy.The API layer is actually the inlet layer of the system.You can more than just expose the API in a Restful way.It's perfectly possible to use Grpc or something else.

### Claptrap layer

It is at the heart of writing business code, which, like Controller in MVC, serves the core purpose of business logic control.

Next, let's look at how the Claptrap layer works in both read-only and write ways.

#### Claptrap layer read-only operations

Let's take a look at how the Claptrap layer works.With the IDE's Find Implementation feature, you'll find`AuctionItemActor`for the implementation class for the`IAuctionItemActor`project in the`HelloClaptrap.Actors`project, and here are some of the sections related to the`GetStatusAsync`method：

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

This code indicates that：

1. `Attribute` are marked on the `AuctionItemActor` , which provide an important basis for system scanning `Claptrap` components.Features will be explained in more detail in subsequent articles.
2. `The AuctionItemActor` inherited `ClaptrapBoxActor<AuctionItemState>`.Inheriting the class also adds the core support of the event sourcing to `Actor`.
3. The `AuctionItemActor` Constructor introduces a `ActorHost` and `IClatrapActorCommonService`.Where `ActorHost` is a parameter provided by the Dapr SDK that represents basic information such as the ID and type of the current Actor. `IClaptrapActorCommonService` is the service interface provided by the Claptrap framework, and all of Claptrap's behavior is implemented by changing the relevant types in the interface.
4. `GetStatusAsync` read data directly from State in Claptrap.Because of the event sourcing mechanism, developers can always think that State in Claptrap is always in the correct, up-to-date, and available state.You can always trust State data in Claptrap, without thinking about how you interact with the persistence layer.

#### Claptrap layer writes

Claptrap read-only operations are operations that call Actor without a change to the Claptrap state.The written operations indicates that Actor modifies the state of Claptrap.Because of the event sourcing mechanism, to modify the state of Claptrap, you must modify it through events.It is possible to know how to produce an event to modify the State of the Clatrapp through the `TryBidding` method：

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

This code indicates that：

1. Data can be validated through Claptrap State before generating events to determine whether to generate the next event.This is necessary because it keeps out unnecessary events.It is necessary in terms of operational logic, persistence space, or execution efficiency.
2. Once the necessary verification has been made, you can `this. CreateEvent` to create an event.This is an extension method that builds some of the underlying information about Event.Developers only need to care about the custom business data section.For `NewBidderEvent` is the business data that developers need to be concerned about.
3. Once the event creation is complete, you can save and execute the `handleEventAsync` the Claptrap object.In this method Claptrap will persist the event and call Handler to update Claptrap's State.The following describes how to write Handler
4. After calling `HandleEventAsync` , if there are no errors, the event has been successfully persisted.And you can think that State in Claptrap has been updated correctly.Therefore, the latest data can now be read from State and returned to the caller.

### Handler layer

The Handler layer is responsible for executing the business logic of the event and updating the data to State.Because both Event and State are objects in memory, so.Handler's code implementation is generally very simple.Here's the handler `triggered when the` NewBidderEvent is triggered.

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

This code indicates that：

1. `NewBidderEventHandler` inherited `NormalEventHandler` as the base class, which was added primarily to simplify handler implementations.Its generic parameters are the State type corresponding to Claptrap and the EventData type for Event.
2. Handler implements the HandleEvent `method inherited from the` normaleventhandler `the` class.The primary purpose in this method is to update State.

In addition to the obvious code above, there are some important operating mechanisms for Handler that must be explained here：

1. Handler requires a tag on the corresponding Actor type to be used.This is `role played by Claptrap Event Handler, ClaptrapCodes.NewBidderEvent` in AuctionItemActor.
2. Handler implements `IDispose` and `IAsyncDispose` interfaces.This indicates that Handler will be created on demand when handling events.You can refer to the instructions in The Life Cycle of Objects in the TODO Claptrap System.
3. Because of the event sourcing mechanism, developers should take into account the idempotentness of `logic in the handleEvent` method when writing Handler.In other words, you must ensure that the same parameters `handleEvent` the handleEvent method and get exactly the same results.Otherwise, unexpected results can occur when the practice is traced.You can refer to the instructions in HOW TODO Events and States Work.

With the Handler layer, you can update State through events.

## Summary

In this article, we cover the main project structure levels and key components in the Claptrap project.By understanding these components, developers have been able to understand how to expose APIs, generate events, and update status.This is also the simplest necessary step to use Claptrap.

Next, we'll show you how to use Minion.

<!-- md Footer-Newbe-Claptrap.md -->
