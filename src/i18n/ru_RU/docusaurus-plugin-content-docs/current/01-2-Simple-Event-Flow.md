---
title: "Шаг 2 - простой бизнес, опустошить корзину"
description: "Шаг 2 - простой бизнес, опустошить корзину"
---

Прочитав эту статью, вы можете начать экспериментировать с Claptrap для достижения бизнеса.

<!-- more -->

## Краткое изыску

В этой статье я понимаю, как добавить бизнес-реализацию в существующий пример проекта, реализуя потребность в "опустошенных корзинах".

В основном включает в себя следующие шаги：

1. Определите EventCode
2. Определите Event
3. Реализация EventHandler
4. Подпишитесь на EventHandler
5. Измените интерфейс Grain
6. Реализация Grain
7. Измените Controller

Это процесс снизу вверх, и фактическая разработка процесса кодирования также может быть реализована снизу вверх.

## Определите Event Code

EventCode является единственной кодировкой для каждого события в системе Claptrap.Он играет важную роль в распознании событий, сериализации и т.д.

Откройте`класс ClaptrapCodes в`HelloClaptrap.Models`HelloClaptrap.`models.

Добавьте EventCode для события корзины.

```cs
  namespace HelloClaptrap.Models
  {
      public static class ClaptrapCodes
      {
          public const string CartGrain = "cart_claptrap_newbe";
          private const string CartEventSuffix = "_e_" + CartGrain;
          public const string AddItemToCart = "addItem" + CartEventSuffix;
          public const string RemoveItemFromCart = "removeItem" + CartEventSuffix;
+         public const string RemoveAllItemsFromCart = "remoeAllItems" + CartEventSuffix;
      }
  }
```

## Определите Event

Event является ключом к отслеживанию событий.Используется для изменения State в Claptrap.И Event будет длиться на постоянном уровне.

Создайте`класс RemoveAllItemsFromCartEvent`в папке`Cart/Events`проекта HelloClaptrap.Models .

Добавьте код ниже：

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Cart.Events
+ {
+     public class RemoveAllItemsFromCartEvent : IEventData
+     {
+     }
+ }
```

Поскольку в этом простом бизнес-сценарии для очистки корзины не требуются определенные параметры.Таким образом, просто создайте пустой тип.

`интерфейс IEventData`пустым интерфейсом в платформе, который представляет события и используется при выводе универсальных шаблонов.

## Реализация EventHandler

EventHandler 用于将事件更新到 Claptrap 的 State 上。Например, в этом бизнес-сценарии EventHandler отвечает за очистку содержимого корзины State.

Создайте`класс RemoveAllItemsFromCartEventHandler  в папке Cart/Events`проекта HelloClaptrap.Actors .

Добавьте код ниже：

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Cart;
+ using HelloClaptrap.Models.Cart.Events;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Cart.Events
+ {
+     public class RemoveAllItemsFromCartEventHandler
+         : NormalEventHandler<CartState, RemoveAllItemsFromCartEvent>
+     {
+         public override ValueTask HandleEvent(CartState stateData,
+             RemoveAllItemsFromCartEvent eventData,
+             IEventContext eventContext)
+         {
+             stateData.Items = null;
+             return new ValueTask();
+         }
+     }
+ }
```

Вот некоторые распространенные проблемы：

1. Что такое NormalEventHandler?

   NormalEventHandler — это простой базовый класс, определенный платформой для облегчения реализации Handler. Первым универсальным параметром является тип State, соответствующий Claptrap.В сочетании с предыдущим документом наш тип корзины покупок State является CartState. Вторым универсальным параметром является тип Event, с которым должен работать Handler.

2. Зачем`stateData.Items = null;`вместо`stateData.Items.Clear ();`

   stateData — это объект, сохраненный в памяти, и Clear не уменьшает объем собственной памяти, занимаемой словарем.Конечно, в целом в одной корзине не будет сотен тысяч товаров.Но дело в том, что при обновлении State важно отметить, что Claptrap является объектом, резидентным в памяти, что увеличивает потребление памяти при увеличении объема.Таким образом, оставайтесь как можно меньше данных в State.

3. Что такое ValueTask?

   Вы можете узнать[этой статье, Understanding the Whys, Whats, and Whens of ValueTask](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)Whens.

После завершения реализации EventHandler не забудьте протестировать ее модульно.Здесь нет перечисления.

## Подпишитесь на EventHandler

После реализации и тестирования EventHandler можно зарегистрировать EventHandler для связи с EventCode и Claptrap.

Откройте`класс CartGrain для проекта`HelloClaptrap.actors`,`HelloClaptrap.Actors.

Используйте Attribute для маркировки.

```cs
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Cart
  {
      [ClaptrapEventHandler(typeof(AddItemToCartEventHandler), ClaptrapCodes.AddItemToCart)]
      [ClaptrapEventHandler(typeof(RemoveItemFromCartEventHandler), ClaptrapCodes.RemoveItemFromCart)]
+     [ClaptrapEventHandler(typeof(RemoveAllItemsFromCartEventHandler), ClaptrapCodes.RemoveAllItemsFromCart)]
      public class CartGrain : ClaptrapBoxGrain<CartState>, ICartGrain
      {
          public CartGrain(
              IClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

          ....
```

ClaptrapEventHandlerAttribute 是框架定义的一个 Attribute，可以标记在 Grain 的实现类上，以实现 EventHandler 、 EventCode 和 ClaptrapGrain 三者之间的关联。

После ассоциации события, соответствующие EventCode, созданные в этом Grain, обрабатываются указанным EventHandler.

## Измените интерфейс Grain

Измените определение интерфейса Grain, чтобы обеспечить внешнюю совместимость с Claptrap.

打开 HelloClaptrap.IActors 项目的 ICartGrain 接口。

Добавьте интерфейс и Attribute.

```cs
  using System.Collections.Generic;
  using System.Threading.Tasks;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Cart;
  using HelloClaptrap.Models.Cart.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.IActor
  {
      [ClaptrapState(typeof(CartState), ClaptrapCodes.CartGrain)]
      [ClaptrapEvent(typeof(AddItemToCartEvent), ClaptrapCodes.AddItemToCart)]
      [ClaptrapEvent(typeof(RemoveItemFromCartEvent), ClaptrapCodes.RemoveItemFromCart)]
+     [ClaptrapEvent(typeof(RemoveAllItemsFromCartEvent), ClaptrapCodes.RemoveAllItemsFromCart)]
      public interface ICartGrain : IClaptrapGrain
      {
          Task<Dictionary<string, int>> AddItemAsync(string skuId, int count);
          Task<Dictionary<string, int>> RemoveItemAsync(string skuId, int count);
          Task<Dictionary<string, int>> GetItemsAsync();
+         Task RemoveAllItemsAsync();
      }
  }
```

Добавлены две части содержимого：

1. Событие`claptrapEvent`, чтобы события были связаны с Grain.Обратите внимание, что здесь отличается от`ClaptrapEventHandler,`предыдущий шаг.Здесь отмечен Event, а на этом прошлом шаге — EventHandler.
2. Добавлен метод RemoveAllItemsAsync, который представляет бизнес-поведение «опустошает корзину».Обратите внимание, что существует определенное ограничение на определение метода Grain.Более подробную информацию можно найти в разделе[Developing a Grain](https://dotnet.github.io/orleans/Documentation/grains/index.html).

## Реализация Grain

Затем измените соответствующий класс реализации в соответствии с изменениями интерфейса, которые были внесены на следующий шаг.

Откройте класс`CartGrain в папке Cart`в``HelloClaptrap.actors .

Добавьте соответствующую реализацию.

```cs
  using System;
  using System.Collections.Generic;
  using System.Linq;
  using System.Threading.Tasks;
  using HelloClaptrap.Actors.Cart.Events;
  using HelloClaptrap.IActor;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Cart;
  using HelloClaptrap.Models.Cart.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Cart
  {
      [ClaptrapEventHandler(typeof(AddItemToCartEventHandler), ClaptrapCodes.AddItemToCart)]
      [ClaptrapEventHandler(typeof(RemoveItemFromCartEventHandler), ClaptrapCodes.RemoveItemFromCart)]
      [ClaptrapEventHandler(typeof(RemoveAllItemsFromCartEventHandler), ClaptrapCodes.RemoveAllItemsFromCart)]
      public class CartGrain : ClaptrapBoxGrain<CartState>, ICartGrain
      {
          public CartGrain(
              IClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

+         public Task RemoveAllItemsAsync()
+         {
+             if (StateData.Items?.Any() != true)
+             {
+                 return Task.CompletedTask;
+             }
+
+             var removeAllItemsFromCartEvent = new RemoveAllItemsFromCartEvent();
+             var evt = this.CreateEvent(removeAllItemsFromCartEvent);
+             return Claptrap.HandleEventAsync(evt);
+         }
      }
  }
```

Добавлена соответствующая реализация метода интерфейса.Вот несколько вещей, чтобы отметить：

1. Не забудьте добавить`if (StateData.Items?. Any() !|true)`этой строке суждения.Это значительно уменьшает накладные расходы на хранение.

   Событие затя`при выполнении Claptrap.HandleEventAsync (evt)`время выполнения.В случае здесь, если в корзине изначально нет содержимого, очистка или уве существование этого события просто увеличивает накладные расходы, но не имеет практического смысла. Таким образом, увеличение суждения до этого может уменьшить бесполезное потребление хранилища.

2. Обязательно определите State и соответствие входящих параметров условиям выполнения события.

   Это отличается от того, что описано в верхней точке.В верхней части в центре в себе говорится, что "не производить бессмысленных событий", что свидетельствует о том, что "никогда не будет событий, которые Эвент Хандлер не может потреблять". В режиме отслеживания событий завершение бизнеса основано на завершении бизнес-определения на основе завершения сохраняемости событий.Это означает, что событие считается завершенным до тех пор, пока событие было зачислено на склад. В EventHandler события, считываемые только из слоя сохраняемого, принимаются.На этом этапе события больше не могут быть изменены в соответствии с неизменяемостью события, поэтому убедитесь, что событие может быть использовано EventHandler.Поэтому`, прежде чем Claptrap.HandleEventAsync (evt)`, чтобы сделать это. Поэтому важно реализовать модульные тесты, чтобы убедиться, что логика производства Event и обработки EventHandler перезаписана.

3. Некоторые методы, описанные в некоторых библиотеках TAP, можно найти здесь, в[асинхронный режим на основе задач](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap)

## Измените Controller

После завершения всех предыдущих шагов все части Claptrap завершены.Но поскольку Claptrap не может напрямую обеспечить взаимодействие с внешними программами.Поэтому необходимо добавить API на уровень Controller, чтобы "очистить корзину" снаружи.

Откройте класс`CartController` Controllers`helloClaptrap.web`.

```cs
  using System.Threading.Tasks;
  using HelloClaptrap.IActor;
  using Microsoft.AspNetCore.Mvc;
  using Orleans;

  namespace HelloClaptrap.Web.Controllers
  {
      [Route("api/[controller]")]
      public class CartController : Controller
      {
          private readonly IGrainFactory _grainFactory;

          public CartController(
              IGrainFactory grainFactory)
          {
              _grainFactory = grainFactory;
          }

+         [HttpPost("{id}/clean")]
+         public async Task<IActionResult> RemoveAllItemAsync(int id)
+         {
+             var cartGrain = _grainFactory.GetGrain<ICartGrain>(id.ToString());
+             await cartGrain.RemoveAllItemsAsync();
+             return Json("clean success");
+         }
      }
  }
```

## Сделать небольшой узел

На этом мы завершили все, что требуется для простого требования "очистить корзину".

Исходный код для этой статьи можно получить по следующему адресу：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
