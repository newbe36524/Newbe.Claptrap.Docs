---
title: 'Шаг 1 - Создайте проект и реализуйте простую корзину'
description: 'Шаг 1 - Создайте проект и реализуйте простую корзину'
---

Давайте перейдем к простой "электронной коммерции корзины" требования, чтобы понять, как использовать Newbe.Claptrap для разработки.

<!-- more -->

## Бизнес-потребности

Реализуйте простую потребность в "электронной коммерции корзины", которая реализует несколько простых бизнес-：

- Получает товары и количество в текущей корзине
- Добавьте товар в корзину
- Удалите определенный товар из корзины

## Установите шаблон проекта

Во-первых, необходимо убедиться, что установлено . NetCore SDK 3.1 。[вы можете нажать здесь, чтобы получить последнюю версию](https://dotnet.microsoft.com/download).

После установки пакета SDK откройте консоль, чтобы выполнить следующую команду для установки последнего шаблона проекта：

```bash
dotnet new --install Newbe.Claptrap.Template
```

После установки можно просмотреть установленный шаблон проекта в результатах установки.

![Newbe.claptrap.template установлен](/images/20200709-001.png)

## Создайте проект

Выберите расположение, создайте папку, и в этом примере выберите папку с именем`HelloClaptrap`в разделе`D:\Repo`.Папка будет служить папкой кода для нового проекта.

Откройте консоль и переключите рабочий каталог на`D:\Repo\HelloClaptrap`.Затем можно создать проект, выполнив следующую команду：

```bash
dotnet new newbe.claptrap --name HelloClaptrap
```

> Как правило, рекомендуется`папку\RGit в качестве папки репозитория Git для`D:  epo\HelloClaptrap.Управляйте исходным кодом с помощью системы управления версиями.

## Компиляция и запуск

После создания проекта можно скомпилировать его с помощью решения открытия IDE, которое вы предпочитают.

После завершения компиляции запустите как веб-, так и BackendServer с помощью функции «Запуск» в интегрированной среде разработки.(VS требует консольного запуска службы, и если вы используете IIS Express, разработчик должен посмотреть на соответствующий номер порта, чтобы получить доступ к веб-странице)

После завершения запуска можно просмотреть`http://localhost:36525/swagger`API для примеров проектов, написав адрес.К ним относятся три основных API：

- `GET` `/api/Cart/{id}` для получения товаров и количества в определенной id-корзине
- `,` `новый товар в покупку с указанным идентификатором{id}` /API/Cart/ ,000.00
- `delete` `/api/Cart/{id}` удаляет определенные элементы из корзины с указанным идентификатором

Вы можете попробовать несколько вызовов API с помощью кнопки Try It Out на интерфейсе.

> - [Как запустить несколько проектов одновременно в VS](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Как запустить несколько проектов одновременно в Rider](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Ускорьте восстановление nuget с помощью облака Huawei](https://mirrors.huaweicloud.com/)

## Добавить товар в первый раз, без эффекта?

Да, вы правы.Бизнес-реализация в шаблоне проекта имеет ошибку.

Далее мы откроем проект, чтобы устранить и устранить эти ошибки, добавив несколько точек останова.

И, позиционив ошибку, вы можете понять процесс передачи кода платформы.

## Добавьте точку останова

Ниже приведены инструкции по увеличению точки останова в соответствии с различными инструкциями по интегрированной среде разработки, и вы можете выбрать среду IDE, к которую вы привыкли для работы.

Если у вас нет интегрированной среды разработки в данный период, вы также можете пропустить этот раздел и прочитать его непосредственно позже.

### Visual Studio

Запустите два проекта одновременно в соответствии с методом запуска, упомянутым выше.

Импорт точек останова：открыть окно «Точки останова», нажмите кнопку и выберите`breakpoints .xml`файл.Соответствующее местоположение операции можно найти на следующих двух скриншотах.

![Open Breakpoints Window](/images/20200709-002.png)

![Import Breakpoints](/images/20200709-003.png)

### Rider

Запустите два проекта одновременно в соответствии с методом запуска, упомянутым выше.

Rider в настоящее время не имеет функции импорта точек останова.Поэтому необходимо вручную создать точку останова в следующих местах：

| файл                      | Номер строки |
| ------------------------- | ------------ |
| CartController            | 30           |
| CartController            | 34           |
| CartGrain                 | 24           |
| CartGrain                 | 32           |
| AddItemToCartEventHandler | 14           |
| AddItemToCartEventHandler | 28           |

> [Go To File поможет вам быстро определить, где находятся файлы](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## Начните отладку

Далее мы поймем весь процесс выполнения кода с помощью запроса.

Во-первых, мы отправим запрос POST через интерфейс swagger, чтобы попытаться добавить товар в корзину.

### CartController Start

Первой точкой прерывания жизни является код Controller на уровне веб-API：

```cs
[HttpPost("{id}")]
public async Task<IActionResult> AddItemAsync(int id, [FromBody] AddItemInput input)
{
    var cartGrain = _grainFactory.GetGrain<ICartGrain>(id.ToString());
    var items = await cartGrain.AddItemAsync(input.SkuId, input.Count);
    return Json(items);
}
```

В этом коде мы создаем`_grainFactory`экземпляр ICartGrain`из`кодов.

Этот экземпляр по своей природе является прокси-сервером, который указывает на конкретный Grain в Backend Server.

Входящий идентификатор можно считать экземпляром привязки с помощью уникального идентификатора.В этом деловом контексте это можно понимать как идентификатор корзины покупок или идентификатор пользователя, если на пользователя имеется только одна корзина.

Перейдем к отладке и перейдем к следующему шагу, давайте посмотрим, как работает интерьер ICartGrain.

### CartGrain Start

Следующей точкой прерывания жизни является код CartGrain：

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

Здесь лежит суть реализации платформы, ключевое, как показано на следующем рисунке：

![Claptrap](/images/20190228-001.gif)

В частности, в бизнесе код был запущен для конкретного объекта корзины покупок.

Передаваемые skuId и count можно увидеть через отладчик, которые передаются из Controller.

Здесь вы можете сделать следующее：

- Данные в Claptrap изменяются событиями
- Чтение данных, сохраненных в Claptrap

В этом коде мы создали`AddItemToCartEvent,`для представления изменения корзины.

Затем он передается Claptrap для обработки.

Claptrap обновляет свои данные State после того, как он принял событие.

Наконец, мы возвращаем StateData.Items вызывающему объекту.(На самом деле StateData.Items является быстрым свойством Claptrap.State.Data.Items.)Таким образом, на самом деле он по-прежнему считывается из Claptrap. ）

С помощью отладчика можно увидеть, что тип данных StateData выглядит следующим образом：

```cs
public class CartState : IStateData
{
    public Dictionary<string, int> Items { get; set; }
}
```

Это состояние корзины, разработанное в примере.Мы используем`Dictionary`SkuId в текущей корзине и соответствующее количество.

Перейдите к отладке и перейдем к следующему шагу, давайте посмотрим, как Claptrap обрабатывает входящие события.

### AddItemToCartEventHandler Start

Опять же, точка прерывания жизни является следующим кодом：

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

Этот код содержит два важных параметра:`CartState`, который представляет текущее состояние корзины, и события, которые необходимо обработать`AddItemToCartEvent`.

Мы согласно бизнес-требованиям, чтобы определить, содержит ли словарь в состоянии SkuId, и обновить его количество.

Продолжайте отладку, и код будет выполняться до конца этого кода.

На этом этапе с помощью отладчика можно обнаружить, что словарь stateData.Items, хотя и добавляет один элемент, имеет количество 0.Причина на самом деле из-за фрагмента кода else, который был аннотирован выше, и именно поэтому ошибки, которые всегда терпят неудачу при первом добавлении корзины.

Здесь не прерывайте отладку сразу.Давайте продолжим отладку, чтобы код закончился, чтобы понять, как заканчивается весь процесс.

На самом деле, продолжая отладку, точка останова, в свою очередь, попадает в конец метода, соответствующего методу CartGrain и CartController.

## Это на самом деле трехуровневая архитектура!

Подавляющее большинство разработчиков знают трехуровневую архитектуру.В самом деле, мы также можем сказать, что Newbe.Claptrap на самом деле трехуровневая архитектура.Давайте сравним это с таблицей：

| Традиционные три этажа           | Newbe.Claptrap     | описание                                                                                                                                          |
| -------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Уровень отображения Presentation | Слой Controller    | Используется для стыковки с внешними системами, чтобы обеспечить внешнюю совместимость                                                            |
| Бизнес-уровень Business          | Слой Grain         | Бизнес-обработка входящих бизнес-параметров в соответствии с бизнесом (в примере на самом деле не написано суждение, необходимо судить count > 0) |
| Слой сохраняемости Persistence   | Слой Эвента Хандле | Обновление бизнес-результатов                                                                                                                     |

Конечно, вышеупомянутое подобное является простым описанием.В конкретном процессе, не нужно слишком запутаться, это просто вспомогательное понимание.

## У вас также есть ошибка, которая будет исправлена

Далее мы вернулись, чтобы исправить предыдущий вопрос о том, что "первое присоединение не вступает в силу".

### Это платформа для рассмотрения модульных тестов

В шаблоне проекта существует проект`HelloClaptrap.Actors.Tests`, содержащий модульные тесты основного бизнес-кода.

Теперь мы знаем,`, аннотированная в AddItEmToCartEvent`, является основной причиной существования ошибки.

Мы можем`модульные тесты в тестовом проекте с помощью`dotnet test, чтобы получить две ошибки:

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

Давайте посмотрим на код одного из ошибок модульного теста：

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

`AddItemToCartEvent Handler`является компонентом основного теста, и поскольку stateData и event построены вручную, разработчики могут легко создавать сценарии, которые необходимо протестировать по мере необходимости.Нет необходимости создавать что-то особенное.

Теперь просто восстан`овите аннотированную часть кода в addItEmToCart Eent`, чтобы повторно запустить модульный тест.Модульные тесты были пройсуты.Ошибки также были исправлены естественным образом.

Конечно, есть еще один модульный тест на сцене удаления, который также завершается неудачей.Разработчики могут исправить эту проблему, следуя идеям "точки останова" и "модульного тестирования", описанным выше.

## Данные уже сохраняются

Вы можете попробовать перезапустить Backend Server и Web, и вы обнаружите, что данные, с которыми вы ранее работали, были сохранены.

Мы рассмотрим это далее в последующих главах.

## Сделать небольшой узел

В этой статье мы предварительно узнали, как создать базовую структуру проекта для реализации простого сценария корзины покупок.

Есть много вещей, которые мы не：, структуру проекта, развертывание, долговечность и т.д.Вы можете прочитать последующие статьи, чтобы узнать больше.
