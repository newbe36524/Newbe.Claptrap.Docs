---
title: '第一步——创建项目，实现简易购物车'
description: '第一步——创建项目，实现简易购物车'
---

让我们来实现一个简单的“电商购物车”需求来了解一下如何使用 Newbe.Claptrap 进行开发。

<!-- more -->

:::caution 该文档仅适用于 0.7 及以下版本，若想要查看最新版本内容，请点击右上角进行切换。 :::

## 业务需求

实现一个简单的“电商购物车”需求，这里实现几个简单的业务：

- 获取当前购物车中的商品和数量
- 向购物车中添加商品
- 从购物车中移除特定的商品

## 安装项目模板

首先，需要确保已经安装了 .NetCore SDK 3.1 。[可以点击此处来获取最新的版本进行安装](https://dotnet.microsoft.com/download)。

SDK 安装完毕后，打开控制台运行以下命令来安装最新的项目模板：

```bash
dotnet new --install Newbe.Claptrap.Template
```

安装完毕后，可以在安装结果中查看到已经安装的项目模板。

![newbe.claptrap.template安装完毕](/images/20200709-001.png)

## 创建项目

选择一个位置，创建一个文件夹，本示例选择在`D:\Repo`下创建一个名为`HelloClaptrap`的文件夹。该文件夹将会作为新项目的代码文件夹。

打开控制台，并且将工作目录切换到`D:\Repo\HelloClaptrap`。然后运行以下命令便可以创建出项目：

```bash
dotnet new newbe.claptrap --name HelloClaptrap
```

> 通常来说，我们建议将`D:\Repo\HelloClaptrap`创建为 Git 仓库文件夹。通过版本控制来管理您的源码。

## 编译与启动

项目创建完成之后，您可以用您偏爱的 IDE 打开解决方案进行编译。

编译完成后，通过 IDE 上“启动”功能，同时启动 Web 和 BackendServer 两个项目。（VS 需要以控制台方式启动服务，如果使用 IIS Express，需要开发者看一下对应的端口号来访问 Web 页面）

启动完成后，便可以通过`http://localhost:36525/swagger`地址来查看样例项目的 API 描述。其中包括了三个主要的 API：

- `GET` `/api/Cart/{id}` 获取特定 id 购物车中的商品和数量
- `POST` `/api/Cart/{id}` 添加新的商品到指定 id 的购商品
- `DELETE` `/api/Cart/{id}` 从指定 id 的购物车中移除特定的商品

您可以通过界面上的 Try It Out 按钮来尝试对 API 进行几次调用。

> - [如何在 VS 中同时启动多个项目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [如何在 Rider 中同时启动多个项目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [使用华为云加速 nuget 还原速度](https://mirrors.huaweicloud.com/)

## 第一次添加商品，没有效果？

是的，您说的没错。项目模板中的业务实现是存在 BUG 的。

接下来我们来打开项目，通过添加一些断点来排查并解决这些 BUG。

并且通过对 BUG 的定位，您可以了解框架的代码流转过程。

## 添加断点

以下根据不同的 IDE 说明需要增加断点的位置，您可以选择您习惯的 IDE 进行操作。

如果您当前手头没有 IDE，也可以跳过本节，直接阅读后面的内容。

### Visual Studio

按照上文提到的启动方式，同时启动两个项目。

导入断点：打开“断点”窗口，点击按钮，从项目下选择`breakpoints.xml`文件。可以通过以下两张截图找到对应的操作位置。

![Open Breakpoints Window](/images/20200709-002.png)

![Import Breakpoints](/images/20200709-003.png)

### Rider

按照上文提到的启动方式，同时启动两个项目。

Rider 目前没有断点导入功能。因此需要手动的在以下位置创建断点：

| 文件                        | 行号 |
| ------------------------- | -- |
| CartController            | 30 |
| CartController            | 34 |
| CartGrain                 | 24 |
| CartGrain                 | 32 |
| AddItemToCartEventHandler | 14 |
| AddItemToCartEventHandler | 28 |

> [通过 Go To File 可以助您快速定位文件所在](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## 开始调试

接下来，我们通过一个请求来了解一下整个代码运行的过程。

首先，我们先通过 swagger 界面来发送一个 POST 请求，尝试为购物车添加商品。

### CartController Start

首先命中断点是 Web API 层的 Controller 代码：

```cs
[HttpPost("{id}")]
public async Task<IActionResult> AddItemAsync(int id, [FromBody] AddItemInput input)
{
    var cartGrain = _grainFactory.GetGrain<ICartGrain>(id.ToString());
    var items = await cartGrain.AddItemAsync(input.SkuId, input.Count);
    return Json(items);
}
```

在这段代码中，我们通过`_grainFactory`来创建一个`ICartGrain`实例。

这实例本质是一个代理，这个代理将指向 Backend Server 中的一个具体 Grain。

传入的 id 可以认为是定位实例使用唯一标识符。在这个业务上下文中，可以理解为“购物车 id”或者“用户 id”（如果每个用户只有一个购物车的话）。

继续调试，进入下一步，让我们来看看 ICartGrain 内部是如何工作的。

### CartGrain Start

接下来命中断点的是 CartGrain 代码：

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

此处便是框架实现的核心，如下图所示的关键内容：

![Claptrap](/images/20190228-001.gif)

具体说到业务上，代码已经运行到了一个具体的购物车对象。

可以通过调试器看到传入的 skuId 和 count 都是从 Controller 传递过来的参数。

在这里您可以完成以下这些操作：

- 通过事件对 Claptrap 中的数据进行修改
- 读取 Claptrap 中保存的数据

这段代码中，我们创建了一个`AddItemToCartEvent`对象来表示一次对购物车的变更。

然后将它传递给 Claptrap 进行处理了。

Claptrap 接受了事件之后就会更新自身的 State 数据。

最后我们将 StateData.Items 返回给调用方。（实际上 StateData.Items 是 Claptrap.State.Data.Items 的一个快捷属性。因此实际上还是从 Claptrap 中读取。）

通过调试器，可以看到 StateData 的数据类型如下所示：

```cs
public class CartState : IStateData
{
    public Dictionary<string, int> Items { get; set; }
}
```

这就是样例中设计的购物车状态。我们使用一个`Dictionary`来表示当前购物车中的 SkuId 及其对应的数量。

继续调试，进入下一步，让我们看看 Claptrap 是如何处理传入的事件的。

### AddItemToCartEventHandler Start

再次命中断点的是下面这段代码：

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

这段代码中，包含有两个重要参数，分别是表示当前购物车状态的 CartState 和需要处理的事件 AddItemToCartEvent。

我们按照业务需求，判断状态中的字典是否包含 SkuId，并对其数量进行更新。

继续调试，代码将会运行到这段代码的结尾。

此时，通过调试器，可以发现，stateData.Items 这个字典虽然增加了一项，但是数量却是 0 。原因其实就是因为上面被注释的 else 代码段，这就是第一次添加购物车总是失败的 BUG 成因。

在这里，不要立即中断调试。我们继续调试，让代码走完，来了解整个过程如何结束。

实际上，继续调试，断点将会依次命中 CartGrain 和 CartController 对应方法的方法结尾。

## 这其实就是三层架构！

绝大多数的开发者都了解三层架构。其实，我们也可以说 Newbe.Claptrap 其实就是一个三层架构。下面我们通过一个表格来对比一下：

| 传统三层             | Newbe.Claptrap | 说明                                           |
| ---------------- | -------------- | -------------------------------------------- |
| Presentation 展示层 | Controller 层   | 用来与外部的系统进行对接，提供对外的互操作能力                      |
| Business 业务层     | Grain 层        | 根据业务对传入的业务参数进行业务处理（样例中其实没写判断，需要判断 count > 0） |
| Persistence 持久化层 | EventHandler 层 | 对业务结果进行更新                                    |

当然上面的类似只是一种简单的描述。具体过程中，不需要太过于纠结，这只是一个辅助理解的说法。

## 您还有一个待修复的 BUG

接下来我们重新回过头来修复前面的“首次加入商品不生效”的问题。

### 这是一个考虑单元测试的框架

在项目模板中存在一个项目`HelloClaptrap.Actors.Tests`，该项目包含了对主要业务代码的单元测试。

我们现在已经知道，`AddItemToCartEventHandler`中注释的代码是导致 BUG 存在的主要原因。

我们可以使用`dotnet test`运行一下测试项目中的单元测试，可以得到如下两个错误:

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

我们看一下其中一个出错的单元测试的代码：

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

`AddItemToCartEventHandler`是该测试主要测试的组件，由于 stateData 和 event 都是通过手动构建的，因此开发者可以很容易就按照需求构建出需要测试的场景。不需要构建什么特殊的内容。

现在，只要将`AddItemToCartEventHandler`中那段被注释的代码还原，重新运行这个单元测试。单元测试便就通过了。BUG 也就自然的修复了。

当然，上面还有另外一个关于删除场景的单元测试也是失败的。开发者可以按照上文中所述的“断点”、“单元测试”的思路，来修复这个问题。

## 数据已经持久化了

您可以尝试重新启动 Backend Server 和 Web， 您将会发现，您之前操作的数据已经被持久化的保存了。

我们将会在后续的篇章中进一步介绍。

## 小结

通过本篇，我们初步了解了一下，如何创建一个基础的项目框架来实现一个简单的购物车场景。

这里还有很多内容我们没有详细的说明：项目结构、部署、持久化等等。您可以进一步阅读后续的文章来了解。
