---
title: "Шаг 3 - Определите Claptrap и управляйте запасами товаров"
description: "Шаг 3 - Определите Claptrap и управляйте запасами товаров"
---

Прочитав эту статью, вы можете начать экспериментировать с Claptrap для достижения бизнеса.

<!-- more -->

## Краткое изыску

В этой статье я понимаю, как определить Claptrap в существующем примере проекта, реализуя потребность в управлении запасами.

В сочетании с основными шагами из предыдущих статей, определение Claptrap просто добавить несколько шагов.Полный шаг выглядит следующим образом, и раздел, помеченный как "Новое содержимое", отличается от нового содержимого предыдущих статей：

1. Определение ClaptrapTypeCode (новое содержимое)
1. Определение State (новое содержимое)
1. Определение интерфейса Grain (новое содержимое)
1. Реализация Grain (новое содержимое)
1. Подпишитесь на Grain (новый контент)
1. Определите EventCode
1. Определите Event
1. Реализация EventHandler
1. Подпишитесь на EventHandler
1. Реализация IInitialStateDataFactory (новый контент)
1. Измените Controller

Это процесс снизу вверх, и фактическая разработка процесса кодирования также может быть скорректирована.

Бизнес-варианты использования, реализованные в этой статье：

1. Реализует объект SKU (Stock keeping Unit), который представляет данные инвентаризации.
2. Возможность обновления и чтения номеров SKU.

## Определите ClaptrapTypeCode

ClaptrapTypeCode является единственным кодированием Claptrap.Он играет важную роль в идентификации, сериализации и т.д. State.

Откройте`класс ClaptrapCodes в`HelloClaptrap.Models`HelloClaptrap.`models.

Добавьте ClaptrapTypeCode для номера SKU.

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

## Определите State

State представляет текущую производительность данных объекта Actor в режиме Actor.

Поскольку Claptrap — это Actor, основанный на режиме отслеживания событий.Поэтому очень важно определить State, который является хорошим.

В этом примере нам просто нужно записать запасы текущего номера SKU, поэтому дизайн State очень прост.

Добавьте`папку Sku`в проект HelloClaptrap.Models и создайте класс`SkuState`.

Добавьте код ниже：

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

Inventory представляет запасы текущего номера SKU.

`интерфейс IStateData`является пустым интерфейсом в кадре, который представляет State и используется при обобщении выводов.

## Определите интерфейс Grain

Определение интерфейса Grain обеспечивает внешнюю совместимость с Claptrap.

Добавьте`интерфейс ISkuGrain в`HelloClaptrap.IActors`HelloClaptrap.`IActors.

Добавьте интерфейс и Attribute.

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

Это добавляет следующее：

1. Помечена`ClaptrapState`так что State связана с Grain.
2. Интерфейс наследует`IClaptrapGrain`, интерфейс Grain, определенный платформой, который зависит от интерфейса, который должен быть унаследован от запуска Orleans.
3. Добавлен метод GetInventoryAsync, что означает "получение текущих запасов".
4. Добавлен метод UpdateInventoryAsync, что означает "добавочное обновление текущих запасов".`diff > 0` указывает на увеличение запасов,`diff < 0`означает сокращение запасов.
5. Обратите внимание, что существует определенное ограничение на определение метода Grain.Более подробную информацию можно найти в разделе[Developing a Grain](https://dotnet.github.io/orleans/Documentation/grains/index.html).

## Реализация Grain

После определения ISkuGrain можно добавить код для реализации.

Созда`йте новую папку Sku`в проекте HelloClaptrap.Actors и добавьте в эту папку класс`SkuGrain`.

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

Это добавляет следующее：

1. Наследование`ClaptrapBoxGrain<SkuState>`и реализация`ISkuGrain`,`ClaptrapBoxGrain`— это базовый класс Grain, определенный платформой, где универсальные параметры представляют соответствующий тип State.
2. Реализуйте метод GetInventoryAsync для чтения текущих запасов из StateData.
3. Реализуйте метод UpdateInventoryAsync, добавьте код бизнес-суждения и выпустите исключение, если условия бизнес-операции не будут выполнены.
4. UpdateInventoryAsync В конце мы бросаем NotImplemented Exceltion сейчас, потому что текущее событие еще не определено и необходимо дождаться последующей реализации кода.
5. BizException — это пользовательское исключение, которое можно добавить самостоятельно.Фактическая разработка также может быть использована для представления прерывания бизнеса без выбросов, и это хорошо, чтобы перейти на коды состояния или другие возвращаемые значения.

## Зарегистрируйтесь в Grain

Соответствующий Grain для Claptrap должен быть зарегистрирован при запуске приложения, чтобы платформа могли сканировать обнаружение.

Поскольку пример кода использует сканирование в области сборки, на самом деле нет необходимости изменять его.

Укажите, где произошла регистрация：

Откройте`program для проекта HelloClaptrap.BackendServer`,`program`.

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

Поскольку ISkuGrain и SkuGrain принадлежат к одной сборке в ICartGrain и CartGrain соответственно, никаких изменений здесь не требуется.

## Определите EventCode

Ранее мы реализовали основную часть Claptrap, но только не завершили операцию обновления запасов.Это связано с тем, что для обновления запасов требуется обновление State.И мы все знаем, что Claptrap является шаблоном Actor, основанным на источнике событий, и обновление State требует событий.Таким образом, начиная с этого момента, давайте обновим наш инвентарь с помощью событий.

EventCode является единственной кодировкой для каждого события в системе Claptrap.Он играет важную роль в распознании событий, сериализации и т.д.

Откройте`класс ClaptrapCodes в`HelloClaptrap.Models`HelloClaptrap.`models.

Добавьте EventCode для обновления запасов.

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

## Определите Event

Event является ключом к отслеживанию событий.Используется для изменения State в Claptrap.И Event будет длиться на постоянном уровне.

Создайте класс`InventoryUpdateEvent` в папке`Sku/Events проекта HelloClaptrap.Models`.

Добавьте код ниже：

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

1. Diff представляет сумму этого обновленного запаса,`diff > 0` указывает на увеличение запасов,`diff < 0`указывает на сокращение запасов.
2. NewInventory представляет запасы после обновления.Здесь дается предложение заранее, но из-за нехватки времени обсуждение не：рекомендуется включить обновленные данные State в событие.

## Реализация EventHandler

EventHandler 用于将事件更新到 Claptrap 的 State 上。

Создайте`класс Inventory Update EvenentHandler в папке  Sku/Events`проекта HelloClaptrap.Actors  .

Добавьте код ниже：

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

1. Поскольку обновленные запасы уже включены в событие, StateData может быть назначена напрямую.

## Подпишитесь на EventHandler

После реализации и тестирования EventHandler можно зарегистрировать EventHandler для связи с EventCode и Claptrap.

Откройте`класс SkuGrain`проекта HelloClaptrap.actors`HelloClaptrap.actors`.

Используйте Attribute для пометки и изменения updateInventoryAsync для выполнения событий.

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

## Реализация IInitialStateDataFactory

Ранее мы завершили запросы и обновления запасов.Но, как правило, запасы имеют начальную сумму, и мы дополняем эту часть логики в этом разделе.

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

1. `IInitialStateDataFactory`вызывается при первой активации Claptrap для создания начального значения State.
2. Инъекция`ISkuRepository`считывает начальную сумму запасов, соответствующую Sku из базы данных, и конкретный код не указан здесь, и читатель может просмотреть реализацию в примере репозитория.

В дополнение к коду реализации требуется регистрация для вызова.

Откройте`класс SkuGrain`проекта HelloClaptrap.actors`HelloClaptrap.actors`.

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

## Измените Controller

После завершения всех предыдущих шагов все части Claptrap завершены.Но поскольку Claptrap не может напрямую обеспечить взаимодействие с внешними программами.Поэтому необходимо добавить API на уровень Controller для внешнего "чтения запасов".

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

1. Новый API считывает запасы определенного SkuId.В соответствии с реализацией примеров кода можно передать`yueluo-123`получить сумму запаса 666.Несуществующий SkuId создает исключение.
1. Внешний API для обновленных запасов не создается здесь, так как в этом примере будут проводиться операции инвентаризации при следующем заказе на покупку, и API не требуется здесь.

## Сделать небольшой узел

На этом мы завершили все, что требуется для простого требования «Управление товарными запасами».

Исходный код для этой статьи можно получить по следующему адресу：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
