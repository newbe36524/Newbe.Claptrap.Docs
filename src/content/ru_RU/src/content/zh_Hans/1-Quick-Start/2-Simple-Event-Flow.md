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
  Название HelloClaptrap.Модели.
  {
      публичный статический класс ClaptrapCodes.
      {
          публичная конст строка CartGrain 'cart_claptrap_newbe);
          Частная констная строка CartEventSuffix. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
          публичная строка AddItemToCart - "addItem" s cartEventSuffix;
          публичная строка конде RemoveItem FromCart - "removeItem" s cartEventSuffix;
публичная строка Const Удалить AllItems FromCart s "remoeAllItems" s ".
      }
  }
```

## Определите событие.

Событие является ключом к происхождению событий.Используется для изменения государства в Claptrap.И событие сохраняется на уровне настойчивости.

В.`HelloClap.Модели.`Проект.`Корзина/События.`Создайте под папкой.`Удалите AllItems из мероприятия по корзине.`Класса.

Добавьте следующий код.：

```cs
susing Newbe.Claptrap;
+
Snamespace HelloClaptrap.Models.Cart.Events.
+ {
общественный класс удалить AllAllItems fromCartevent: IEventData.
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
susing System.Threading.Задачи;
- Привет UsingClaptrap.Models.Cart;
- HelloClaptrap.Models.Cart.Events;
susing Newbe.Claptrap;
+
Snamespace HelloClaptrap.Actors.Cart.Events.
+ {
класс общественного класса Удалить AllItems из cartevent обработчик.
: NormalEventHandler.<CartState, RemoveAllItemsFromCartEvent>
+     {
публичное переопределение ValueTask HandleEvent (CartState StateData,
УдалитеAllItems из событий eventDataCart,
IEventContext EventContext)
+         {
statedata.Items snull;
возвращение нового ValueTask ();
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
  с помощью Newbe.Claptrap;
  с помощью Newbe.Claptrap.Orleans;

  Namespace HelloClaptrap.Actors.Cart.
  {
      (Обработчик событий Claptrap (Типоф (AddItemToCartEvent Обработчик), ClaptrapCodes.AddItemToCart)
      (Обработчик событий Claptrap ( RemoveitemFromCartEvent Обработчик), ClaptrapCodes.RemoveItemFromCart)
- "Обработчик событий Claptrap (Typeof (Удалите AllItems из обработчика событий корзины), ClaptrapCodes.RemoveAllFromItems Корзина)
      общественный класс CartGrain : ClaptrapBoxGrain.<CartState>, ICartGrain.
      {
          публичная карт-зерайн ()
              IClaptrapGrainCommon Сервис ClapGrainGrainCommonService
              : база (claptrapGrain Общая служба)
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
  Использование System.Collections.Generic;
  Использование System.Threading.Задачи;
  Использование HelloClaptrap.Models;
  Использование HelloClaptrap.Models.Cart;
  Использование HelloClaptrap.Models.Cart.Events;
  с помощью Newbe.Claptrap;
  с помощью Newbe.Claptrap.Orleans;

  Название HelloClaptrap.IActor.
  {
      (ClaptrapState (типоф, ClaptrapCodes.CartGrain))
      (ClaptrapEvent (Типоф (AddItemToCartEvent), ClaptrapCodes.AddItemToCart)
      (ClaptrapEvent (Типоф (RemoveItemFromCartEventEvent), ClaptrapCodes.RemoveItemFromCart)
- "ClaptrapEvent (Типоф (Удалите AllItems из CartEventEvent), ClaptrapCodes.RemoveAllItemsfromCart)
      публичный интерфейс ICartGrain : IClaptrapGrain.
      {
          Задача.<Dictionary<string, int>> AddItemAsync (строка skuId, int отсчет);
          Задача.<Dictionary<string, int>> Удалить ItemAsync (строка skuId, int кол);
          Задача.<Dictionary<string, int>> GetItemsAsync ();
Задача AllItemsAsync ();
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
  Использование системы;
  Использование System.Collections.Generic;
  Использование System.Linq;
  Использование System.Threading.Задачи;
  Использование HelloClaptrap.Actors.Cart.Events;
  Использование HelloClaptrap.IActor;
  Использование HelloClaptrap.Models;
  Использование HelloClaptrap.Models.Cart;
  Использование HelloClaptrap.Models.Cart.Events;
  с помощью Newbe.Claptrap;
  с помощью Newbe.Claptrap.Orleans;

  Namespace HelloClaptrap.Actors.Cart.
  {
      (Обработчик событий Claptrap (Типоф (AddItemToCartEvent Обработчик), ClaptrapCodes.AddItemToCart)
      (Обработчик событий Claptrap ( RemoveitemFromCartEvent Обработчик), ClaptrapCodes.RemoveItemFromCart)
      (Обработчик событий Claptrap (TypeofAllItems от обработчика событий корзины), ClaptrapCodes.RemoveAllItems из корзины)
      общественный класс CartGrain : ClaptrapBoxGrain.<CartState>, ICartGrain.
      {
          публичная карт-зерайн ()
              IClaptrapGrainCommon Сервис ClapGrainGrainCommonService
              : база (claptrapGrain Общая служба)
          {
          }

Публичная задача Удалить AllItemsAsync ()
+         {
если (StateData.Items?. Любой...) ... . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
+             {
Задача возврата.ЗавершенаТаск;
+             }
+
var removeAllItems FromCartEvent's new RemoveAllItems FromCartEvent ();
svar evt s.this. Создатьevent (удалитьAllItems из cartevent);
возвращение Claptrap.HandleEventAsync (evt);
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
  Использование System.Threading.Задачи;
  Использование HelloClaptrap.IActor;
  с помощью Microsoft.AspNetCore.Mvc;
  Использование Орлеана;

  Namespace HelloClaptrap.Web.Controllers.
  {
      Маршрут ("api/[controller]")]
      общественный класс CartController : Контроллер.
      {
          Частный readonly Igrain завод _grainFactory;

          общественный cartController (общественный cartController)
              IGrain Факторы Зерновой завод)
          {
              _grainFactory - зерновой завод;
          }

httppost ("{id}/чистый")
публичная async Task.<IActionResult> УдалитьAllItemAsync (int id)
+         {
вар cartgrain s _grainFactory.GetGrain.<ICartGrain>(id. ToString ();
ждут cartgrain.RemoveAllItemsAsync ();
возвращение Json ("чистый успех");
+         }
      }
  }
```

## Сводка

На данный момент, мы сделали все, что нужно, чтобы "очистить вашу корзину".

Исходный код этой статьи можно получить по следующему адресу.：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Гити](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
