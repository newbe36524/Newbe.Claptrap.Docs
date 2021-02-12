---
title: 'Шаг 4 - Используйте Минион, чтобы сделать заказ на товар'
description: 'Шаг 4 - Используйте Минион, чтобы сделать заказ на товар'
---

Прочитав эту статью, вы можете начать экспериментировать с Claptrap для достижения бизнеса.

<!-- more -->

## Краткое изыску

В этой статье я понимаю, как Minion используется в существующих примерах проектов для асинхронной бизнес-обработки, реализуя потребность в заказе на товар.

Во-первых, давайте сначала поймем бизнес-варианты использования, которые должны быть задействованы в этой статье：

1. Пользователь может выполнить операцию заказа, которая будет сформирована с помощью всех номеров SKU в текущей корзине.
2. Запасы соответствующего номера SKU будут вычтены после того, как заказ будет размет.Если запасов номера SKU недостаточно, не удается выйти из ордера.
3. Операция по разметию ордеров не требует обсуждения в этом примере до успешного вычета запасов.Таким образом, после успешного заказа в этом примере создается запись заказа в базе данных, что указывает на завершение создания заказа.

Хотя основное внимание в этой статье уделяется использованию Minion, необходимо использовать знания, связанные с определением Claptrap в предыдущих статьях, поскольку требуется новый объект OrderGrain.

Minion — это особый Claptrap, связь которого с его MasterClaptrap показана на рисунке ниже：

![Minion](/images/20190228-002.gif)

Его основной процесс разработки аналогичен Claptrap, за исключением того, что он был сокращен.Сравнение выглядит следующим образом：

| шаги                                | Claptrap | Minion |
| ----------------------------------- | -------- | ------ |
| Определите ClaptrapTypeCode         | √        | √      |
| Определите State                    | √        | √      |
| Определите интерфейс Grain          | √        | √      |
| Реализация Grain                    | √        | √      |
| Зарегистрируйтесь в Grain           | √        | √      |
| Определите EventCode                | √        |        |
| Определите Event                    | √        |        |
| Реализация EventHandler             | √        | √      |
| Подпишитесь на EventHandler         | √        | √      |
| Реализация IInitialStateDataFactory | √        | √      |

Причина этого сокращения заключается в том, что определение, связанное с событием, не требует обработки, поскольку Минон является потребителем событий Claptrap.Но другие части по-прежнему являются необходимостью.

> Начиная с этой статьи, мы больше не будем перечислены конкретные местоположения файлов, в которых находится соответствующий код, и надеемся, что читатели смогут найти их в проекте самостоятельно, чтобы быть квалифицированными.

## Реализация OrderGrain

Основываясь на предыдущих знаниях, связанных с определением Claptrap, мы реализуем OrderGrain здесь для представления операции заказа.Чтобы сэкономить время, мы перечислили только ключевые из них.

### OrderState

Статус заказа определяется следующим образом：

```cs
using System.Collections.Generic;
using Newbe.Claptrap;

namespace HelloClaptrap.Models.Order
{
    public class OrderState : IStateData
    {
        public bool OrderCreated { get; set; }
        public string UserId { get; set; }
        public Dictionary<string, int> Skus { get; set; }
    }
}
```

1. OrderCreated указывает, был ли создан ордер, избегая его повторного создания
2. UserId разместит идентификатор пользователя
3. Заказ Skus содержит SkuId и объем заказа

### OrderCreatedEvent

События создания ордеров определяются следующим образом：

```cs
using System.Collections.Generic;
using Newbe.Claptrap;

namespace HelloClaptrap.Models.Order.Events
{
    public class OrderCreatedEvent : IEventData
    {
        public string UserId { get; set; }
        public Dictionary<string, int> Skus { get; set; }
    }
}
```

### OrderGrain

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
            var cartGrain = _grainFactory.GetGrain<ICartGrain>(input. CartId);
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
            var evt = this. CreateEvent(new OrderCreatedEvent
            {
                UserId = input. UserId,
                Skus = items
            });
            await Claptrap.HandleEventAsync(evt);
        }
    }
}
```

1. OrderGrain реализует основную логику создания ордера, в которой метод CreateOrderAsync завершает получение данных корзины покупок и действие, связанное с вычетом запасов.
2. Соответствующие поля в State обновляются после успешного выполнения OrderCreatedEvent, и они больше не перечислены здесь.

## Сохраните данные заказа в базе данных через Minion

С начала серии до сих пор мы никогда не упоминали о операциях, связанных с базой данных.Поскольку при использовании платформы Claptrap подавляющее большинство операций уже заменяется записью событий и обновлением состояния, нет необходимости писать операции базы данных лично.

Однако, поскольку Claptrap обычно предназначен для монолитных объектов (один заказ, один номер SKU, одна корзина покупок), данные не могут быть получены для всех (все заказы, все номера SKU, все корзины покупок).На этом этапе данные о состоянии должны быть увекчены в другую структуру сохраняемого хранения (базы данных, файлы, кэши и т. д.) для выполнения всех запросов или других операций.

Концепция Minion была введена в структуру Claptrap для решения вышеуказанных потребностей.

Далее мы введем OrderDbGrain (Minion) в примере для асинхронного завершения операции складации заказов OrderGrain.

## Определите ClaptrapTypeCode

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

+ public const string OrderDbGrain = "db_order_claptrap_newbe";

          #endregion
      }
  }
```

Minion является особым типом Claptrap, другими словами, это также своего рода Claptrap.ClaptrapTypeCode является обязательным для Claptrap, поэтому это определение должно быть добавлено.

## Определите State

Поскольку этот пример требует только одной записи заказа в базу данных и не требует данных в State, этот шаг на самом деле не требуется в этом примере.

## Определите интерфейс Grain

```cs
+ using HelloClaptrap.Models;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.IActor
+ {
+ [ClaptrapMinion(ClaptrapCodes.OrderGrain)]
+ [ClaptrapState(typeof(NoneStateData), ClaptrapCodes.OrderDbGrain)]
+ public interface IOrderDbGrain : IClaptrapMinionGrain
+ {
+ }
+ }
```

1. ClaptrapMinion используется для пометки того, что Grain является Minion, где Код указывает на соответствующий MasterClaptrap.
2. Тип данных State, используемый ClaptrapState для пометки Claptrap.На этом предыдущих шагах мы разъяснили, что Minion не требует StateData, поэтому вместо этого используется встроенный тип платформы NoneStateData.
3. IClaptrapMinionGrain является интерфейсом Minion, который отличается от IClaptrapGrain.Если Grain является Minion, необходимо наследовать интерфейс.
4. ClaptrapCodes.OrderGrain и ClaptrapCodes.OrderDbGrain - это две разные строки, которые, надеюсь, читатели не являются межзвездными патриархами.

> Звездный патриарх：Из-за быстрого темпа и большого объема информации, игроки могут легко игнорировать или неправильно судить часть информации, так что часто случаются веселые ошибки, что "игроки не видят ключевых событий, которые происходят под глазами".Таким образом, игроки флиртовали с межзвездными игроками, которые были слепыми (когда-то действительно было противостояние слепых и профессиональных игроков), и чем выше сегмент, тем серьезнее они были, и профессиональные звездные игроки были слепыми.

## Реализация Grain

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
+ [ClaptrapEventHandler(typeof(OrderCreatedEventHandler), ClaptrapCodes.OrderCreated)]
+ public class OrderDbGrain : ClaptrapBoxGrain<NoneStateData>, IOrderDbGrain
+ {
+ public OrderDbGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
+ : base(claptrapGrainCommonService)
+ {
+ }
+
+ public async Task MasterEventReceivedAsync(IEnumerable<IEvent> events)
+ {
+ foreach (var @event in events)
+ {
+ await Claptrap.HandleEventAsync(@event);
+ }
+ }
+
+ public Task WakeAsync()
+ {
+ return Task.CompletedTask;
+ }
+ }
+ }
```

1. MasterEventReceivedAsync — это метод, определенный из IClaptrapMinionGrain, который означает получение уведомлений о событиях от MasterClaptrap в режиме реального времени.Не разворачивайте инструкции здесь, следуйте шаблону выше, чтобы реализовать их.
2. WakeAsync — это метод, определенный из IClaptrapMinionGrain, который представляет действия MasterClaptrap для активного пробуждения Минона.Не разворачивайте инструкции здесь, следуйте шаблону выше, чтобы реализовать их.
3. Когда читатель просматривает исходный код, он обнаруживает, что класс определяется отдельно в сборке.Это всего лишь таксономия, которая может быть ис понята как размещение Minion и MasterClaptrap в двух разных проектах для классификации.На самом деле, это не проблема, чтобы положить его вместе.

## Зарегистрируйтесь в Grain

Здесь, поскольку мы определяем OrderDbGrain в отдельной сборке, требуется дополнительная регистрация этой сборки.Как показано ниже：

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
              var logger = NLogBuilder.ConfigureNLog("nlog.config"). GetCurrentClassLogger();
              try
              {
                  logger. Debug("init main");
                  CreateHostBuilder(args). Build(). Run();
              }
              catch (Exception exception)
              {
                  //NLog: catch setup errors
                  logger. Error(exception, "Stopped program because of exception");
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
                  . ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); })
                  . UseClaptrap(
                      builder =>
                      {
                          builder
                              . ScanClaptrapDesigns(new[]
                              {
                                  typeof(ICartGrain). Assembly,
                                  typeof(CartGrain). Assembly,
+ typeof(OrderDbGrain). Assembly
                              })
                              . ConfigureClaptrapDesign(x =>
                                  x.ClaptrapOptions.EventCenterOptions.EventCenterType = EventCenterType.OrleansClient);
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

## Реализация EventHandler

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Order.Events;
+ using HelloClaptrap.Repository;
+ using Newbe.Claptrap;
+ using Newtonsoft.Json;
+
+ namespace HelloClaptrap.Actors.DbGrains.Order.Events
+ {
+ public class OrderCreatedEventHandler
+ : NormalEventHandler<NoneStateData, OrderCreatedEvent>
+ {
+ private readonly IOrderRepository _orderRepository;
+
+ public OrderCreatedEventHandler(
+ IOrderRepository orderRepository)
+ {
+ _orderRepository = orderRepository;
+ }
+
+ public override async ValueTask HandleEvent(NoneStateData stateData,
+ OrderCreatedEvent eventData,
+ IEventContext eventContext)
+ {
+ var orderId = eventContext.State.Identity.Id;
+ await _orderRepository.SaveAsync(eventData.UserId, orderId, JsonConvert.SerializeObject(eventData.Skus));
+ }
+ }
+ }
```

1. IOrderRepository — это интерфейс, который непосредственно работает на уровне хранилища для проверки заказов на добавление и удаление.Интерфейс вызывается здесь для реализации операции склада базы данных заказов.

## Подпишитесь на EventHandler

На самом деле, чтобы сэкономить время, мы зарегистрировались в коде главы Реализация Grain.

## Реализация IInitialStateDataFactory

Поскольку StateData не имеет специального определения, реализация IInitialStateDataFactory также не требуется.

## Измените Controller

В примере мы добавили OrderController для разметия заказов и запроса заказов.Читатели могут просматривать исходный код.

Читатели могут использовать следующие шаги для фактического тестирования эффективности：

1. POST `/api/cart/123` {"skuId": "yueluo-666", "count:30} добавить в корзину 123 концентрированную сущность 30 единиц yueluo-666.
2. POST `/api/order` {"userId": "999", "cartId": "123"} в качестве 999 userId для заказов из корзины 123.
3. GET `/api/order` после успешного заказа, через который можно просмотреть заказы, выполненные при заказе.
4. GET `/api/sku/yueluo-666` можно просмотреть запасы после разметия ордера через API SKU.

## Сделать небольшой узел

На этом мы завершили "заказ на товар" в соответствии с базовым содержанием спроса.В этом примере можно получить предварительное представление о том, как несколько Claptrap могут сотрудничать и как использовать Minion для выполнения асинхронных задач.

Тем не менее, есть еще несколько вопросов, которые мы обсудим по последующей деятельности.

Исходный код для этой статьи можно получить по следующему адресу：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
