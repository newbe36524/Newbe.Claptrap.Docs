---
title: 'Первый шаг - создать проект и реализовать простую корзину'
metaTitle: 'Первый шаг - создать проект и реализовать простую корзину'
metaDescription: 'Первый шаг - создать проект и реализовать простую корзину'
---

Давайте внедрим простое требование «корзины электронной коммерции», чтобы увидеть, как развиваться с помощью Newbe.Claptrap.

> [Рассматриваемая в настоящее время версия является результатом машинного перевода китайского упрощенного и ручного корректуры.Если в документе есть неправильный перевод, пожалуйста, нажмите здесь, чтобы представить свое предложение о переводе.](https://crwd.in/newbeclaptrap)

<!-- more -->

## Потребности бизнеса

Реализуйте простое требование «электронной коммерции корзину» где несколько простых бизнес：

- Получите товары и количества в текущей корзине
- Добавить товары в корзину
- Удалите определенные элементы из корзины

## Установка шаблонов проектов

Во-первых, вы должны убедиться, что вы установили . NetCore SDK 3.1.[Вы можете нажать здесь для последней версии для установки](https://dotnet.microsoft.com/download)。

После установки SDK откройте консоль и запустите следующие команды для установки последних шаблонов проектов：

```bash
dotnet новый - новый installbe.Claptrap.Template
```

После установки можно увидеть шаблоны проекта, которые уже были установлены в результатах установки.

![Установлен шаблон Newbe.claptrap](/images/20200709-001.png)

## Создание проекта

Выберите местоположение для создания папки, и в этом примере выбирается`D:\REpo`Создание имени под названием`HelloClaptrap`папку .Папка будет использоваться в качестве папки кода для новых проектов.

Откройте консоль и переключите рабочий каталог на`D:\Rэпо-HelloClaptrap`。Затем запустите следующую команду для создания проекта：

```bash
dotnet newbe.claptrap - название HelloClaptrap
```

> В общем, мы рекомендуем вам.`D:\Repo.HelloClaptrap.`Создайте папку в виде склада Git.Управляйте исходным кодом с помощью управления версиями.

## Компиляция и запуск

Как только проект будет создан, вы можете составить решение с вашим любимым IDE открытым.

После компиляции запустите проекты в Интернете и BackendServer с функцией Startup на IDE.(VS необходимо запустить сервисную консоль, и если вы используете IIS Express, вам нужно, чтобы разработчик посмотрел соответствующий номер порта для доступа к веб-странице)

Как только начало завершено, вы можете`http://localhost:36525/swagger`Адрес для просмотра API описание образца элемента.Это включает в себя три основных API：

- `Получить` `/api/Cart/{id}` Получите товары и количества в конкретной корзине для покупок ID
- `Поместить` `/api/Cart/{id}` Добавить новый товар к покупке указанного идентификатора
- `Удалить` `/api/Cart/{id}` Удалите определенный товар из корзины указанного идентификатора

Вы можете попробовать сделать несколько звонков в API через кнопку Try It Out на интерфейсе.

> - [Как начать несколько проектов одновременно в VS](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Как начать несколько проектов в Райдер в то же время](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Используйте Облако Huawei для ускорения nuget восстановить скорость](https://mirrors.huaweicloud.com/)

## Сначала добавить продукт, никакого эффекта?

Да, Вы правы.В шаблоне проекта есть BUGS в реализации бизнеса.

Далее давайте откроем проект и устранение неполадок и разявим эти ошибки, добавив некоторые точки разрыва.

И, найдя BUG, вы можете понять процесс потока кода фреймворка.

## Добавление точек разрыва

Следующие необходимо увеличить расположение точек разрыва на основе различных инструкций IDE, и вы можете выбрать IDE вы привыкли работать.

Если у вас в настоящее время нет IDE под рукой, вы также можете пропустить этот раздел и прочитать непосредственно, что следует.

### Визуальная студия

Начните оба проекта в одно и то же время, как упоминалось выше.

Пункты безубыточности импорта：Откройте окно Breakpoint, нажмите кнопку, выберите из-под элемента`брейк-пойнты.xml`Файл.Соответствующее операционное местоположение можно найти на двух скриншотах ниже.

![Окно моментов открытых точек](/images/20200709-002.png)

![Пункты безубыточности импорта](/images/20200709-003.png)

### Всадника

Начните оба проекта в одно и то же время, как упоминалось выше.

Райдер в настоящее время не имеет функцию импорта брейк-пойнта.Поэтому необходимо вручную создавать точки разрыва в следующих местах：

| Файл                      | Номер строки |
| ------------------------- | ------------ |
| CartController            | 30           |
| CartController            | 34           |
| CartGrain                 | 24           |
| CartGrain                 | 32           |
| AddItemToCartEventHandler | 14           |
| AddItemToCartEventHandler | 28           |

> [Go To File позволяет быстро определить, где находятся ваши файлы](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## Начало отладки

Далее мы берем запрос, чтобы увидеть, как весь код работает.

Во-первых, давайте отправим запрос POST через интерфейс чванства и попытаемся добавить элементы в корзину.

### Старт картКонтроллера

Первым спасательным кругом является код контроллера для слоя Web API：

```cs
[HttpPost("{id}")]
public async Task<IActionResult> AddItemAsync(int id, [FromBody] AddItemInput input)
{
    var cartGrain = _grainFactory.GetGrain<ICartGrain>(id.ToString());
    var items = await cartGrain.AddItemAsync(input.SkuId, input.Count);
    return Json(items);
}
```

В этом коде мы передаем`_grainFactory`для создания`ИКартГрейн`Экземпляр.

Этот экземпляр по существу является прокси, который указывает на определенное зерно в Backend Server.

Входящий идентификатор можно считать уникальным идентификатором для экземпляра местоположения.В этом бизнес-контексте его можно понимать как "корзина ID" или "идентификатор пользователя" (если у каждого пользователя есть только одна корзина).

Продолжить с отладкой и перейти к следующему шагу, давайте посмотрим, как внутри ICartGrain работ.

### КартГрейн Старт

Следующей точкой остановки является код CartGrain.：

```cs
public async Task<Dictionary<string, int>> AddItemAsync(string skuId, int count)
{
    var evt = this.CreateEvent(new AddItemToCartEvent
    {
        Count = count,
        SkuId = skuId,
    });
    await Claptrap.HandleEventAsync(evt);
    return StateData.Items;
}
```

Вот ядро реализации фреймворка, как показано на следующем изображении.：

![Клэптрап](/images/20190228-001.gif)

В частности, код был запущен к определенному объекту корзины.

Вы можете видеть через отлада, что как входящие skuId, так и подсчет являются параметрами, передаваемыми от контроллера.

Здесь вы можете сделать эти вещи.：

- Изменить данные в Claptrap с событиями
- Читать данные, сохраненные в Claptrap

В этом коде мы создаем его.`Событие AddItemToCart.`Объект для представления изменения корзины.

Затем он передается в Claptrap для обработки.

Claptrap обновляет данные о состоянии после принятия события.

Наконец, мы возвращаем вызывающему абоненту StateData.Items.(На самом деле, StateData.Items является быстрым свойством для Claptrap.State.Data.Items.)Так что это на самом деле все еще читать из Claptrap. )

Из отладальщика видно, что типы данных StateData показаны ниже.：

```cs
public class CartState : IStateData
{
    public Dictionary<string, int> Items { get; set; }
}
```

Это состояние корзины, разработанной в образце.Мы используем один.`Словарь.`представлять SkuId в текущей корзине и соответствующем количестве.

Продолжить отладку и перейти к следующему шагу, чтобы увидеть, как Claptrap обрабатывает входящие события.

### AddItemToCart Запуск обработчика событий

Опять же, точка прерывания этого кода ниже.：

```cs
public class AddItemToCartEventHandler
    : NormalEventHandler<CartState, AddItemToCartEvent>
{
    public override ValueTask HandleEvent(CartState stateData, AddItemToCartEvent eventData,
        IEventContext eventContext)
    {
        var items = stateData.Items ?? new Dictionary<string, int>();
        if (items.TryGetValue(eventData.SkuId, out var itemCount))
        {
            itemCount += eventData.Count;
        }
        // else
        // {
        //     itemCount = eventData.Count;
        // }

        items[eventData.SkuId] = itemCount;
        stateData.Items = items;
        return new ValueTask();
    }
}
```

Этот код содержит два важных параметра, представляющих текущее состояние корзины.`Картгосударство.`и события, которые должны быть обработаны.`Событие AddItemToCart.`。

Мы определяем, содержит ли словарь в государстве подводную гору SkuId в соответствии с бизнес-потребностями, и обновляем его номер.

Продолжайте отладку, и код будет работать до конца этого кода.

На данный момент, через отладок, вы можете видеть, что словарь stateData.Items увеличился на один, но число 0.Причина на самом деле из-за другого фрагмента выше, что является причиной BUG, который всегда не может добавить корзину в первый раз.

Здесь не прерывайте отладку немедленно.Давайте идти вперед и пусть код пройти, чтобы увидеть, как весь процесс заканчивается.

В самом деле, продолжая отладку, точка разрыва попадает в конце cartGrain и CartController методы в свою очередь.

## На самом деле это трехуровневая архитектура!

Подавляющее большинство разработчиков понимают трехуровневую архитектуру.В самом деле, мы можем также сказать, что Newbe. Claptrap на самом деле трехуровневая архитектура.Давайте сравним это в таблице.：

| Традиционные трехъярусные        | Ньюб.Клэптрап     | Описание                                                                                                                          |
| -------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Презентация Презентационный слой | Слой контроллера  | Используется для стыковки внешних систем для обеспечения внешней совместимости                                                    |
| Уровень делового бизнеса         | Зерновой слой     | Бизнес-обработка на основе входящих бизнес-параметров (образец на самом деле не пишет суждения, необходимо судить о подсчете > 0) |
| Слой настойчивости               | Слой EventHandler | Обновление бизнес-результатов                                                                                                     |

Конечно, приведенная выше аналогия является простым описанием.В конкретном процессе нет необходимости слишком запутывается, это всего лишь вспомогательное понимание заявления.

## У вас также есть BUG, чтобы исправить

Затем мы возвращаемся и исправить предыдущий "Первый присоединиться Продукты не принимают эффект" вопрос.

### Это основа для рассмотрения модульного тестирования

В шаблоне проекта есть проект.`HelloClaptrap.Actors.Tests.`Проект содержит модульные тесты основного бизнес-кода.

Теперь мы знаем, что`Обработчик событий AddItem ToCart.`Код в комментариях является основной причиной BUG.

Мы можем им воспользоваться.`Тест дотнета.`При запуске модульных тестов в тестовом проекте вы получаете две ошибки:

```bash
A total of 1 test files matched the specified pattern.
  X AddFirstOne [130ms]
  Error Message:
   Expected value to be 10, but found 0.
  Stack Trace:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
   at FluentAssertions.Execution.TestFrameworkProvider.Throw(String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
   at FluentAssertions.Execution.AssertionScope.FailWith(Func`1 failReasonFunc)
   at FluentAssertions.Execution.AssertionScope.FailWith(Func`1 failReasonFunc)
   at FluentAssertions.Execution.AssertionScope.FailWith(String message, Object[] args)
   at FluentAssertions.Numeric.NumericAssertions`1.Be(T expected, String because, Object[] becauseArgs)
   at HelloClaptrap.Actors.Tests.Cart.Events.AddItemToCartEventHandlerTest.AddFirstOne() in D:\Repo\HelloClaptrap\HelloClaptrap\HelloClaptrap.Actors.Tests\Cart\Events\AddItemToCartEventHandlerTest.cs:line 32
   at HelloClaptrap.Actors.Tests.Cart.Events.AddItemToCartEventHandlerTest.AddFirstOne() in D:\Repo\HelloClaptrap\HelloClaptrap\HelloClaptrap.Actors.Tests\Cart\Events\AddItemToCartEventHandlerTest.cs:line 32
   at NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter`1.GetResult()
   at NUnit.Framework.Internal.AsyncToSyncAdapter.Await(Func`1 invoke)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.RunTestMethod(TestExecutionContext context)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.Execute(TestExecutionContext context)
   at NUnit.Framework.Internal.Execution.SimpleWorkItem.PerformWork()

  X RemoveOne [2ms]
  Error Message:
   Expected value to be 90, but found 100.
  Stack Trace:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
   at FluentAssertions.Execution.TestFrameworkProvider.Throw(String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
   at FluentAssertions.Execution.AssertionScope.FailWith(Func`1 failReasonFunc)
   at FluentAssertions.Execution.AssertionScope.FailWith(Func`1 failReasonFunc)
   at FluentAssertions.Execution.AssertionScope.FailWith(String message, Object[] args)
   at FluentAssertions.Numeric.NumericAssertions`1.Be(T expected, String because, Object[] becauseArgs)
   at HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemFromCartEventHandlerTest.RemoveOne() in D:\Repo\HelloClaptrap\HelloClaptrap\HelloClaptrap.Actors.Tests\Cart\Events\RemoveItemFromCartEventHandlerTest.cs:line 40
   at HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemFromCartEventHandlerTest.RemoveOne() in D:\Repo\HelloClaptrap\HelloClaptrap\HelloClaptrap.Actors.Tests\Cart\Events\RemoveItemFromCartEventHandlerTest.cs:line 40
   at NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter`1.GetResult()
   at NUnit.Framework.Internal.AsyncToSyncAdapter.Await(Func`1 invoke)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.RunTestMethod(TestExecutionContext context)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.Execute(TestExecutionContext context)
   at NUnit.Framework.Internal.Execution.SimpleWorkItem.PerformWork()


Test Run Failed.
Total tests: 7
     Passed: 5
     Failed: 2

```

Давайте посмотрим на код для одного из неисправных модульных тестов.：

```cs
[Test]
public async Task AddFirstOne()
{
    using var mocker = AutoMock.GetStrict();

    await using var handler = mocker.Create<AddItemToCartEventHandler>();
    var state = new CartState();
    var evt = new AddItemToCartEvent
    {
        SkuId = "skuId1",
        Count = 10
    };
    await handler.HandleEvent(state, evt, default);

    state.Items.Count.Should().Be(1);
    var (key, value) = state.Items.Single();
    key.Should().Be(evt.SkuId);
    value.Should().Be(evt.Count);
}
```

`Обработчик событий AddItem ToCart.`является основным компонентом тестирования этого теста, и так как как StateData и event построены вручную, разработчикам легко создавать сценарии, которые необходимо тестировать по мере необходимости.Нет необходимости строить что-то особенное.

Теперь, до тех пор, как это будет.`Обработчик событий AddItem ToCart.`Восстановите код прокомментировали и перезахоите модульный тест.Модульные тесты проходят.ОШИБКИ ТАКЖЕ ЕСТЕСТВЕННО ИСПРАВЛЕНЫ.

Конечно, есть еще один модульный тест сценария удаления выше, что не удается.Разработчики могут решить эту проблему, следуя описанным выше идеям «точка разрыва» и «модульный тест».

## Данные сохранились.

Вы можете попробовать перезапустить сервер Backend и Веб, и вы обнаружите, что данные, над которыми вы работали раньше, были сохраняются.

Мы рассмотрим его дальше в более поздней главе.

## Сводка

В этой статье мы имеем предварительное понимание того, как создать базовую структуру проекта для реализации простого сценария корзины.

Есть много вещей, которые мы не должны подробно объяснять.：Структура проекта, развертывание, настойчивость и многое другое.Вы можете прочитать далее, чтобы узнать больше.
