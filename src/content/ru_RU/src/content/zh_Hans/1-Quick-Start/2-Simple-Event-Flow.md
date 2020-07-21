---
title: 'Шаг второй - Простой бизнес, пустая корзина.'
metaTitle: 'Шаг второй - Простой бизнес, пустая корзина.'
metaDescription: 'Шаг второй - Простой бизнес, пустая корзина.'
---

С помощью этого чтения, вы готовы попробовать использовать Claptrap для реализации вашего бизнеса.

> [Рассматриваемая в настоящее время версия является результатом машинного перевода китайского упрощенного и ручного корректуры.Если в документе есть неправильный перевод, пожалуйста, нажмите здесь, чтобы представить свое предложение о переводе.](https://crwd.in/newbeclaptrap)

<!-- more -->

## Резюме открытия.

В этой статье я узнал, как добавить бизнес-реализацию к существующей выборке проекта, реализовав необходимость «опустошить корзину».

В основном входят эти шаги.：

1. Определите EventCode.
2. Определите событие.
3. Реализация EventHandler.
4. Подпишитесь на EventHandler.
5. Измените интерфейс Grain.
6. Реализация зерна.
7. Измените контроллер.

Это процесс снизу вверх, и фактический процесс кодирования также может быть разработан сверху вниз.

## Определите код событий.

EventCode — это уникальное кодирование каждого события в системе Claptrap.Он играет важную роль в выявлении и сериализации событий.

Откройте.`HelloClap.Модели.`Проекта.`Коды Клэптрапа.`Класса.

Добавить EventCode для "Пустые события корзины магазинов".

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

## Определите событие.

Событие является ключом к происхождению событий.Используется для изменения государства в Claptrap.И событие сохраняется на уровне настойчивости.

В.`HelloClap.Модели.`Проект.`Корзина/События.`Создайте под папкой.`Удалите AllItems из мероприятия по корзине.`Класса.

Добавьте следующий код.：

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

Потому что в этом простом бизнес-сценарии опорожнение корзины не требует определенных параметров.Поэтому просто создайте пустой тип.

`IEventData.`Интерфейс — это пустой интерфейс в рамоке, который представляет события и используется при общих выводах.

## Реализация EventHandler.

`Обработчик событий.`Используется для обновления событий в Claptrap.`Государства.`На.Например, в этом бизнес-сценарии EventHandler несет ответственность за опорожнение содержимого корзины госпока.

В.`HelloClap.Actors.`Проект.`Корзина/События.`Создайте под папкой.`Удалите все элементы из корзины Обработчик событий.`Класса.

Добавьте следующий код.：

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

Вот некоторые общие проблемы.：

1. Что такое нормальный обработчик событий?

   NormalEventHandler — это простой базовый класс, определяемый платформой для легкой реализации Обработчика. Первым общим параметром является тип состояния для Claptrap.В сочетании с предыдущим документом, наш тип состояния корзины является CartState. Вторым общим параметром является тип события, который должен обрабатывать обработчик.

2. Зачем его использовать.`StateData.Items snull;`Не.`StateData.Items.Clear ();`

   StateData — это объект, который хранится в памяти, и Clear не уменьшает собственную память словаря.Конечно, Есть, как правило, нет корзины с сотнями тысяч предметов.Но дело в том, что при обновлении State важно отметить, что Claptrap является объектом на основе памяти, который увеличивает количество и увеличивает потребление памяти.Таким образом, сохранить как можно меньше данных, насколько это возможно в государстве.

3. Что такое ValueTask?

   Может пройти это.[Понимание Почему, Что, и когда ValueTask](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)Узнать.

После завершения реализации EventHandler не забудьте протестировать ее.Здесь его нет.

## Подпишитесь на EventHandler.

После того как вы реализовали и протестировали EventHandler, вы можете зарегистрировать EventHandler, чтобы связаться с EventCode и Claptrap.

Откройте.`HelloClap.Actors.`Проект.`КартГрейн.`Класса.

Марк с атрибутом.

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

`Обработчик событий Claptrap.`Является атрибутом, определяемым рамками, которые могут быть отмечены в классе реализации зерна для достижения связи между EventHandler, EventCode и ClaptrapGrain.

После объединения, если событие для EventCode генерируется в этом зерне, событие обрабатывается указанным EventHandler.

## Измените интерфейс Grain.

Измените определение интерфейса Grain, чтобы обеспечить внешнюю совместимость с Claptrap.

Откройте.`HelloClaptrap.IActors.`Проект.`ИКартГрейн.`Интерфейс.

Добавьте интерфейсы и атрибуты.

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

Добавлены две части.：

1. Отмечены.`КлэптрапЕвент.`ассоциировать событие с зерном.Обратите внимание, что вот предыдущий шаг.`Обработчик событий Claptrap.`отличается.Событие отмечено здесь, и eventHandler отмечен в предыдущем шаге.
2. Добавлен метод RemoveAllItemsAsync, чтобы указать деловое поведение «пустых корзин».Важно отметить, что определение метода зерна имеет определенные ограничения.Подробности можно найти.[Разработка зерна](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## Реализация зерна.

Затем следуйте предыдущей модификации интерфейса, чтобы изменить соответствующий класс реализации.

Откройте.`HelloClap.Actors.`Проекта.`Корзину.`под папкой.`КартГрейн.`Класса.

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

Добавлена соответствующая реализация метода интерфейса.Есть несколько моментов, чтобы быть в курсе.：

1. Обязательно увеличьте.`если (StateData.Items?? Любой...) ... . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .`Эта линия суждения.Это может значительно сократить накладные расходы на хранение.

   Событие выполняется, когда.`Claptrap.HandleEventAsync (evt)`будет сохраняться.В случае сцены здесь, если нет ничего в корзину, опорожнения или сохранения события просто добавляет к накладным расходам, но не имеет смысла. Таким образом, добавление суждения до этого может уменьшить бесполезное потребление хранения.

2. Важно определить, соответствуют ли состояние и входящие параметры критериям выполнения событий.

   Это отличается от акцента, описанного в предыдущем пункте.Предыдущий акцент на "не производить бессмысленные события" предполагает, что "никогда не будет событий, которые EventHandler не может потреблять". В режиме отслеживания событий завершение бизнеса основано на сохранении события в качестве основы для завершения определения бизнеса.Это означает, что до тех пор, пока событие находится на складе, можно считать, что событие завершено. В EventHandler можно принимать события, читаемые только из слоя настойчивости.На этом этапе событие больше не может быть изменено, так как событие неизменимое, поэтому важно обеспечить, чтобы событие можно было использовать EventHandler.Итак, в.`Claptrap.HandleEventAsync (evt)`Это особенно важно, чтобы сделать суждение раньше. Поэтому важно реализовать модульное тестирование, чтобы убедиться, что генерация событий и логика обработки EventHandler перезаписаны.

3. Вот некоторые методы в библиотеке TAP, которые можно использовать, см.[Асинхронный шаблон на основе задач.](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap)

## Измените контроллер.

После того, как все предыдущие шаги были завершены, вы завершили все части Claptrap.Тем не менее, Claptrap не в состоянии обеспечить совместимость с внешними программами напрямую.Поэтому также необходимо добавить API в слой Контроллера для внешнего "опустошения корзины".

Откройте.`HelloClap.Web.`Проект.`Контроллеры.`под папкой.`КартКонтроллер.`Класса.

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

## Сводка

На данный момент, мы сделали все, что нужно, чтобы "очистить вашу корзину".

Исходный код этой статьи можно получить по следующему адресу.：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Гити](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
