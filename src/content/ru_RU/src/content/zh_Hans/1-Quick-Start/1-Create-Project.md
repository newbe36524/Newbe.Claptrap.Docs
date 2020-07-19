---
title: 'Первый шаг - создать проект и реализовать простую корзину'
metaTitle: '第一步——创建项目，实现简易购物车'
metaDescription: 'Первый шаг - создать проект и реализовать простую корзину'
---

Давайте внедрим простое требование «корзины электронной коммерции», чтобы увидеть, как развиваться с помощью Newbe.Claptrap.

> [当前查看的版本是由机器翻译自简体中文，并进行人工校对的结果。若文档中存在任何翻译不当的地方，欢迎点击此处提交您的翻译建议。](https://crwd.in/newbeclaptrap)

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

> 通常来说，我们建议将`D:\Repo\HelloClaptrap`创建为 Git 仓库文件夹。通过版本控制来管理您的源码。

## Компиляция и запуск

Как только проект будет создан, вы можете составить решение с вашим любимым IDE открытым.

После компиляции запустите проекты в Интернете и BackendServer с функцией Startup на IDE.(VS необходимо запустить сервисную консоль, и если вы используете IIS Express, вам нужно, чтобы разработчик посмотрел соответствующий номер порта для доступа к веб-странице)

Как только начало завершено, вы можете`http://localhost:36525/swagger`Адрес для просмотра API описание образца элемента.Это включает в себя три основных API：

- `Получить` `/api/Cart/{id}` Получите товары и количества в конкретной корзине для покупок ID
- `Поместить` `/api/Cart/{id}` Добавить новый товар к покупке указанного идентификатора
- `Удалить` `/api/Cart/{id}` Удалите определенный товар из корзины указанного идентификатора

Вы можете попробовать сделать несколько звонков в API через кнопку Try It Out на интерфейсе.

> - [如何在 VS 中同时启动多个项目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [如何在 Rider 中同时启动多个项目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [使用华为云加速 nuget 还原速度](https://mirrors.huaweicloud.com/)

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

| Файл                             | Номер строки |
| -------------------------------- | ------------ |
| КартКонтроллер                   | 30           |
| КартКонтроллер                   | 34           |
| КартГрейн                        | 24           |
| КартГрейн                        | 32           |
| Обработчик событий AddItemToCart | 14           |
| Обработчик событий AddItemToCart | 28           |

> [通过 Go To File 可以助您快速定位文件所在](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## Начало отладки

Далее мы берем запрос, чтобы увидеть, как весь код работает.

Во-первых, давайте отправим запрос POST через интерфейс чванства и попытаемся добавить элементы в корзину.

### Старт картКонтроллера

Первым спасательным кругом является код контроллера для слоя Web API：

```cs
(HttpPost){id}")]
публичная задача async<IActionResult> AddItemAsync (int id, [FromBody] Ввод ввода AddItem)
{
    вар картгрейн s _grainFactory.GetGrain<ICartGrain>(id. ToString ();
    Вар пунктов s ждут cartgrain.AddItemAsync (вход. SkuId, вход. Граф);
    возвращение Json (предметы);
}
```

В этом коде мы передаем`_grainFactory`для создания`ИКартГрейн`Экземпляр.

Этот экземпляр по существу является прокси, который указывает на определенное зерно в Backend Server.

Входящий идентификатор можно считать уникальным идентификатором для экземпляра местоположения.В этом бизнес-контексте его можно понимать как "корзина ID" или "идентификатор пользователя" (если у каждого пользователя есть только одна корзина).

Продолжить с отладкой и перейти к следующему шагу, давайте посмотрим, как внутри ICartGrain работ.

### КартГрейн Старт

Следующей точкой остановки является код CartGrain.：

```cs
публичная задача async<Dictionary<string, int>> AddItemAsync (строка skuId, int кол)
{
    var evt s.this. Создать вент (новый AddItem ToCartevent)
    {
        Граф - Граф,
        SkuId skuId,
    });
    ждут Claptrap.HandleEventAsync (evt);
    Возвращение StateData.Items;
}
```

此处便是框架实现的核心，如下图所示的关键内容：

![Claptrap](/images/20190228-001.gif)

具体说到业务上，代码已经运行到了一个具体的购物车对象。

可以通过调试器看到传入的 skuId 和 count 都是从 Controller 传递过来的参数。

在这里您可以完成以下这些操作：

- Изменить данные в Claptrap с событиями
- Читать данные, сохраненные в Claptrap

这段代码中，我们创建了一个`AddItemToCartEvent`对象来表示一次对购物车的变更。

然后将它传递给 Claptrap 进行处理了。

Claptrap 接受了事件之后就会更新自身的 State 数据。

最后我们将 StateData.Items 返回给调用方。（实际上 StateData.Items 是 Claptrap.State.Data.Items 的一个快捷属性。因此实际上还是从 Claptrap 中读取。）

通过调试器，可以看到 StateData 的数据类型如下所示：

```cs
общественный класс CartState : IStateData
{
    публичный словарь<string, int> Предметы ... . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
}
```

这就是样例中设计的购物车状态。我们使用一个`Dictionary`来表示当前购物车中的 SkuId 及其对应的数量。

继续调试，进入下一步，让我们看看 Claptrap 是如何处理传入的事件的。

### AddItemToCart Запуск обработчика событий

再次命中断点的是下面这段代码：

```cs
общественный класс AddItemCartEvent Обработчик
    : НормальныйСевент Хэндлер<CartState, AddItemToCartEvent>
{
    публичное переопределение ValueTask HandleEvent (CartState StateData, AddItemToCartEvent EventData,
        IEventContext EventContext)
    {
        Элементы Var . . . stateData.Items? новый словарь<string, int>();
        если (элементы. TryGetValue (eventData.SkuId, из var itemCount))
        {
            itemCount s eventData.count;
        }
        Еще
        // {
        itemCount - eventData.Count;
        // }

        Элементы[eventData.SkuId] s itemCount;
        StateData.Items . . .
        возвращение нового ValueTask ();
    }
}
```

这段代码中，包含有两个重要参数，分别是表示当前购物车状态的`CartState`和需要处理的事件`AddItemToCartEvent`。

我们按照业务需求，判断状态中的字典是否包含 SkuId，并对其数量进行更新。

继续调试，代码将会运行到这段代码的结尾。

此时，通过调试器，可以发现，stateData.Items 这个字典虽然增加了一项，但是数量却是 0 。原因其实就是因为上面被注释的 else 代码段，这就是第一次添加购物车总是失败的 BUG 成因。

在这里，不要立即中断调试。我们继续调试，让代码走完，来了解整个过程如何结束。

实际上，继续调试，断点将会依次命中 CartGrain 和 CartController 对应方法的方法结尾。

## На самом деле это трехуровневая архитектура!

绝大多数的开发者都了解三层架构。其实，我们也可以说 Newbe.Claptrap 其实就是一个三层架构。下面我们通过一个表格来对比一下：

| Традиционные трехъярусные        | Ньюб.Клэптрап     | Описание                                                                                                                          |
| -------------------------------- | ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| Презентация Презентационный слой | Слой контроллера  | Используется для стыковки внешних систем для обеспечения внешней совместимости                                                    |
| Уровень делового бизнеса         | Зерновой слой     | Бизнес-обработка на основе входящих бизнес-параметров (образец на самом деле не пишет суждения, необходимо судить о подсчете > 0) |
| Слой настойчивости               | Слой EventHandler | Обновление бизнес-результатов                                                                                                     |

当然上面的类似只是一种简单的描述。具体过程中，不需要太过于纠结，这只是一个辅助理解的说法。

## У вас также есть BUG, чтобы исправить

接下来我们重新回过头来修复前面的“首次加入商品不生效”的问题。

### Это основа для рассмотрения модульного тестирования

在项目模板中存在一个项目`HelloClaptrap.Actors.Tests`，该项目包含了对主要业务代码的单元测试。

我们现在已经知道，`AddItemToCartEventHandler`中注释的代码是导致 BUG 存在的主要原因。

我们可以使用`dotnet test`运行一下测试项目中的单元测试，可以得到如下两个错误:

```bash
В общей сложности 1 тестовый файл соответствовал шаблону syd dh'fydd.
  X AddFirstOne [130ms]
  Сообщение об ошибке:
   D'Value будет 10, но нашел 0.
  Стек След:
     на FluentS. Execution.LateTestBoundFramework.Throw (String Message)
   на FluentS. Execution.TestFramework Provider.T. Бросьте
   на FluentS. Execution.DefaultKStrategy.HandleFailure (String Message)
   На FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   На FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   на FluentS. Execution.Ax. Scope.FailWith (Строка сообщение, объект?args)
   на FluentS.Numeric.NumericS'1.Be (T ожидается, строка, потому что, объект' becauseArgs)
   На HelloClaptrap.Actors.Tests.Cart.Events.AddItemCartEventHandler.AddFirstOne () в D:\Repo?HelloClaptrap?HelloClaptrap?HelloClaptrap?HelloClaptrap.Actors.Tests?Cart?Events?AddToCartEventHandlerTest.cs: линия 32
   На HelloClaptrap.Actors.Tests.Cart.Events.AddItemCartEventHandler.AddFirstOne () в D:\Repo?HelloClaptrap?HelloClaptrap?HelloClaptrap?HelloClaptrap.Actors.Tests?Cart?Events?AddToCartEventHandlerTest.cs: линия 32
   в NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter'1.GetResult ()
   в NUnit.Framework.Internal.AsyncToSyncAdapter.Await (Func'1 Invoke)
   в NUnit.Framework.Internal.Команды.TestMethodCommand.RunTestMethod (Контекст TestExecution)
   в NUnit.Framework.Internal.Command.TestMethod Command.Execute (контекст testExecution)
   на NUnit.Framework.Internal.Execution SimpleWorkItem.PerformWork ()

  X RemoveOne [2ms]
  Сообщение об ошибке:
   D'Value будет 90, но нашел 100.
  Стек След:
     на FluentS. Execution.LateTestBoundFramework.Throw (String Message)
   на FluentS. Execution.TestFramework Provider.T. Бросьте
   на FluentS. Execution.DefaultKStrategy.HandleFailure (String Message)
   На FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   На FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   на FluentS. Execution.Ax. Scope.FailWith (Строка сообщение, объект?args)
   на FluentS.Numeric.NumericS'1.Be (T ожидается, строка, потому что, объект' becauseArgs)
   На HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemCartEventhandlerHandler.RemoveOne () в D:\Repo?HelloClaptrap?HelloClap.Actors.Tests?Cart?Events\RMoveItem от HandlerTest.cs CartEvent: линия 40
   На HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemCartEventhandlerHandler.RemoveOne () в D:\Repo?HelloClaptrap?HelloClap.Actors.Tests?Cart?Events\RMoveItem от HandlerTest.cs CartEvent: линия 40
   в NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter'1.GetResult ()
   в NUnit.Framework.Internal.AsyncToSyncAdapter.Await (Func'1 Invoke)
   в NUnit.Framework.Internal.Команды.TestMethodCommand.RunTestMethod (Контекст TestExecution)
   в NUnit.Framework.Internal.Command.TestMethod Command.Execute (контекст testExecution)
   на NUnit.Framework.Internal.Execution SimpleWorkItem.PerformWork ()


Тестовый запуск не удался.
Всего тестов: 7
     Пройдено: 5
     Не удалось: 2

```

我们看一下其中一个出错的单元测试的代码：

```cs
[Test]
публичная async Задача AddFirstOne ()
{
    использование var mocker - AutoMock.GetStrict ();

    ждут использования var обработчик s-mocker. Создать<AddItemToCartEventHandler>();
    var state s новый CartState ();
    var evt новый AddItemToCartEventEvent
    {
        SkuId skuId1,
        Граф s 10
    };
    ждать обработчика. HandleEvent (состояние, evt, по умолчанию);

    Государства. Элементы.Граф.Вниз.) Будьте (1);
    var (ключ, значение) s состояние. Элементы.Одинократный ();
    Ключ. "Что") Будьте (evt. Скуид);
    Значение. "Что") Будьте (evt. Граф);
}
```

`AddItemToCartEventHandler`是该测试主要测试的组件，由于 stateData 和 event 都是通过手动构建的，因此开发者可以很容易就按照需求构建出需要测试的场景。不需要构建什么特殊的内容。

现在，只要将`AddItemToCartEventHandler`中那段被注释的代码还原，重新运行这个单元测试。单元测试便就通过了。BUG 也就自然的修复了。

当然，上面还有另外一个关于删除场景的单元测试也是失败的。开发者可以按照上文中所述的“断点”、“单元测试”的思路，来修复这个问题。

## Данные сохранились.

您可以尝试重新启动 Backend Server 和 Web， 您将会发现，您之前操作的数据已经被持久化的保存了。

我们将会在后续的篇章中进一步介绍。

## Сводка

通过本篇，我们初步了解了一下，如何创建一个基础的项目框架来实现一个简单的购物车场景。

这里还有很多内容我们没有详细的说明：项目结构、部署、持久化等等。您可以进一步阅读后续的文章来了解。
