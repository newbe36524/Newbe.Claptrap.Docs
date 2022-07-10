---
title: "Шаг третий - понимание структуры проекта"
description: "Шаг третий - понимание структуры проекта"
---

Далее в следующей статье [Шаг 2 - Создание проекта](01-3-Basic-Flow.md) , давайте поймем структуру проекта, созданную с помощью шаблона проекта Newbe.Claptrap.

<!-- more -->

## Структура решения

Используйте Visual Studio или Rider, чтобы открыть решение, расположенное в корневом`проекта, и .sln`.

Решение содержит несколько папок решения, каждая из которых выглядит следующим образом：

| Папка решения    | описание                                                                                                                                                                                                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0_Infrastructure | инфраструктуры.Здесь можно разместить некоторые распространенные модели, библиотеки открытых классов и многое другое.На них обычно ссылаются несколько других проектов                                                                      |
| 1_Business       | Бизнес-логика.Здесь можно разместить некоторые библиотеки классов, связанные с основным бизнесом.Например, уровень хранилища, бизнес-уровень и т. д.В частности, конкретные реализации Actor, как правило, также могут быть размещены здесь |
| 2_Application    | приложения.Здесь размещаются запущенные приложения, которые могут содержать webApi, службы Grpc, процессы запуска Actor и многое другое                                                                                                     |
| SolutionItems    | Некоторые файлы, общие для уровня решения, такие как nuget.config, tye.yml, Directory.Build.props и т.д                                                                                                                                     |

Это только для самых простых структур решения, включенных в демонстрацию проекта.Фактическая разработка часто требует присоединения, складских интерфейсов, модульных тестов, фоновых служб и т.д.Разработчики могут разумно расставить их в соответствии с правилами команды.

## Узнайте о ссылках вызова

Теперь я понимаю процесс, запущенный Newbe.Claptrap, с помощью простой ссылки вызова.

Давайте поймем процесс, `вызовом GET/AuctionItems/{itemId}`вызовом.

### Уровень API

После вызова API первым естественным, в который входит, является`Controller`.Шаблоном соответствующего проекта является`AuctionItemsController`в рамках проекта`HelloClaptrap.WebApi`, который перехватывает разделы, связанные с этим API：

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

Этот код указывает,：

1. `GetStatus`впервые создал`ClaptrapIdentity`,[Claptrap Identity](https://claptrap.newbe.pro/zh_Hans/docs/02-10-Claptrap-Identity)для поиска конкретного`Claptrap`
2. Затем вызовите`_actorProxyFactory`, чтобы получить прокси-сервер Actor.Это реализация интерфейса, предоставленного Dapr.
3. Вызовите`GetStatusAsync`для созданного агентаAuctionItemActor , чтобы можно было вызвать соответствующий метод экземпляра Claptrap.
4. Результаты, возвращаемые из Claptrap, оберняются как возвращаемые результаты API.

Это одно из способов, с помощью которого уровень API может：простое проявление, создав прокси-сервер Actor.Уровень API на самом деле является входным уровнем системы.API можно использовать не только с помощью Restful.Использование Grpc или иным образом вполне вполне вполне может.

### Слой Claptrap

Лежит в основе написания бизнес-кода, который, как и Controller в MVC, служит основной целью управления бизнес-логикой.

Далее мы читаем только для чтения и записываем, чтобы увидеть, как работает слой Claptrap.

#### Операции уровня Claptrap только для чтения

Далее вы поймите, как работает слой Claptrap.Функция поиска реализации IDE позволяет найти`IAuctionItemActor`соответствующий класс реализации в проекте`HelloClaptrap.Actors``AuctionItemActor`, а также некоторые：, связанные с методом`GetStatusAsync`

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

Этот код указывает,：

1. `несколько Attribute` были помечены на AuctionItemActor , которые `обеспечивают важную основу для сканирования системы компонентов <code>Claptrap` .Соответствующие функции подробно описаны в последующих статьях.
2. `Auction ItemActor` унаследовал `ClaptrapBoxActor<AuctionItemState>`.Наследование этого класса также добавляет `поддержку` отслеживания событий для клиентов Actor.
3. `конструктор AuctionItemActor` вводит `ActorHost` и `IClaptrapActorCommonService`.Где `ActorHost` — это параметры, предоставляемые пакетом SDK Dapr для представления основных сведений, таких как идентификатор и тип текущего Actor. `IClaptrapActorCommonService` является сервисным интерфейсом, предоставляемым платформой Claptrap, и все поведение Claptrap реализуется путем изменения связанных типов в интерфейсе.
4. `GetStatusAsync` данные непосредственно через State в Claptrap.Из-за наличия механизма отслеживания событий разработчики всегда могут думать, что State в Claptrap всегда находится в правильном, актуальном и доступном состоянии.Вы всегда можете доверять данным State в Claptrap, не беспокоясь о том, как взаимодействовать с уровнем сохраняемого.

#### Операция записи уровня Claptrap

Операция Claptrap только для чтения — это действие, которое вызывает Actor, которое не приводит к изменению состояния Claptrap.Операции записи заслуживают того, чтобы Actor изменял состояние Claptrap.Из-за механизма отслеживания событий для изменения состояния Claptrap необходимо изменить его с помощью события.Вы `, чтобы узнать` как создать событие для изменения State Claptrap с помощью метода TryBidding：

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

Этот код указывает,：

1. Данные могут быть проверены с помощью Claptrap State перед созданием события, чтобы решить, хотите ли вы создать следующее событие.Это необходимо, поскольку это может отгородиться от ненужных событий.Это необходимо как с точки зрения логики выполнения, пространства сохраняемого пространства, так и эффективности выполнения.
2. После необходимой проверки, вы можете `this. CreateEvent` создать событие.Это метод расширения, в котором строится некоторая базовая информация о Event.Разработчики просто заботятся о пользовательских разделах бизнес-данных.Например `NewBidderEvent` бизнес-данными, которые разработчики должны заботиться о.
3. После создания события его можно сохранить и `с помощью` HandleEventAsync объекта Claptrap.В этом методе Claptrap сохраняет событие и вызывает Handler для обновления State Claptrap.Ниже описано, как написать Handler
4. После вызова `HandleEventAsync` , если ошибки не были, событие успешно затянулось.И можно считать, что State в Claptrap был правильно обновлен.Таким образом, последние данные могут быть прочитаны из State и возвращены вызывающему объекту.

### Слой Хэндлера

Уровень Handler отвечает за выполнение бизнес-логики событий и обновление данных в State.Поскольку Event и State являются объектами в памяти.Реализация кода Handler, как правило, очень проста.Ниже приведен `, вызываемый при` newBidderEvent.

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

Этот код указывает,：

1. `NewBidderEventHandler` унаследовал `NormalEventHandler` в качестве базового класса, который был добавлен в первую очередь для упрощения реализации Handler.Его универсальными параметрами являются тип State для Claptrap и тип EventData для Event.
2. Handler реализует метод `HandleEvent` , `от базового класса` класса.Этот метод в основном предназначен для обновления State.

В дополнение к очевидному содержанию кода выше, есть некоторые важные механизмы работы о Handler, которые должны быть описаны здесь：

1. Handler требует тегов на соответствующем типе Actor для использования.`в AuctionItemActor [ClaptrapEvent Hhandler (NewBidder Event Handler, ClaptrapCodes.NewBidderEvent)]` играет эту роль.
2. Handler реализует `интерфейсы IDispose` и `IAsyncDispose` интерфейсы.Это означает, что Handler будет создан по требованию при обработке события.Вы можете обратиться к описанию жизненного цикла каждого объекта в системе TODO Claptrap.
3. Из-за наличия механизма отслеживания событий разработчики должны в полной мере учитывать `в` HandleEvent при написании Handler.Другими словами, необходимо убедиться, что те же параметры `, что` HandleEvent должен получить точно такой же результат.В противном случае неожиданные результаты могут произойти при отслеживании практики.Вы можете обратиться к инструкциям в разделе Как работают события и состояния TODO.

С помощью уровня Handler можно реализовать операцию обновления State с помощью событий.

## Сделать небольшой узел

В этой статье мы рассмотрели основные иерархии структуры проекта и ключевые компоненты проекта Claptrap.Зная эти компоненты, разработчики смогли понять, как предоставляется API, создаются события и обновляется состояние.Это самый простой шаг, необходимый для использования Claptrap.

Далее мы покажем, как использовать Minion.

<!-- md Footer-Newbe-Claptrap.md -->
