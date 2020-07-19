---
title: 'The first step - create a project and implement a simple shopping cart'
metaTitle: '第一步——创建项目，实现简易购物车'
metaDescription: 'The first step - create a project and implement a simple shopping cart'
---

Let's implement a simple "e-commerce cart" requirement to see how to develop using Newbe.Claptrap.

> [当前查看的版本是由机器翻译自简体中文，并进行人工校对的结果。若文档中存在任何翻译不当的地方，欢迎点击此处提交您的翻译建议。](https://crwd.in/newbeclaptrap)

<!-- more -->

## Business needs

Realize a simple "e-commerce shopping cart" requirement, where a few simple business：

- Get items and quantities in your current shopping cart
- Add items to your shopping cart
- Remove specific items from your shopping cart

## Install project templates

First, you need to make sure that you have installed the . NetCore SDK 3.1.[You can click here for the latest version for installation](https://dotnet.microsoft.com/download)。

Once the SDK is installed, open the console and run the following commands to install the latest project templates：

```bash
dotnet new --install Newbe.Claptrap.Template
```

Once installed, you can see the project templates that have already been installed in the installation results.

![Newbe.claptrap template installed](/images/20200709-001.png)

## Create a project

Select a location to create a folder, and this example selects the`D:\Repo` and Create a directory named `HelloClaptrap`.The folder will be used as a code folder for new projects.

Open the console and switch the work directory to`D:\Repo\HelloClaptrap`。Then run the following command to create a project：

```bash
dotnet new newbe.claptrap --name HelloClaptrap
```

> 通常来说，我们建议将`D:\Repo\HelloClaptrap`创建为 Git 仓库文件夹。通过版本控制来管理您的源码。

## Compilation and startup

Once the project is created, you can compile the solution with your favorite IDE.

Once compiled, start both web and BackendServer projects with the Startup feature on the IDE.(VS needs to start the service as console, and if you use IIS Express, you need the developer to look at the port number to access the web page)

If it is started, you can visiti `http://localhost:36525/swagger` to view the API description of the sample.This includes three mainly APIs：

- `GET` `/api/Cart/{id}` Get items and quantities in a specific id shopping cart
- `POST` `/api/Cart/{id}` Add a new item to the purchase of the specified id
- `DELETE` `/api/Cart/{id}` Remove a specific item from the shopping cart of the specified id

You can try to make several calls to the API through click the Try It Out button on the UI.

> - [如何在 VS 中同时启动多个项目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [如何在 Rider 中同时启动多个项目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [使用华为云加速 nuget 还原速度](https://mirrors.huaweicloud.com/)

## It is no effect when add product at first time?

Yes, you're right.There are BUGS in the business implementation in the project template.

Next, let's open the project and troubleshoot and resolve these bugs by adding some breakpoints.

And by locating the BUG, you could understand the framework's code flow process.

## Add breakpoints

The following instructions about adding the location of breakpoints base on different IDE, and you can choose the IDE you are used to operating.

If you don't currently have an IDE on hand, you can also skip this section and read directly what follows.

### Visual Studio

Start both projects at the same time, as mentioned above.

Import breakpoints：Open the Breakpoint window, click the button, select `breakpoints.xml` file under project.You can find the location in the two screenshots below.

![Open Breakpoints Window](/images/20200709-002.png)

![Import Breakpoints](/images/20200709-003.png)

### Rider

Start both projects at the same time, as mentioned above.

Rider does not currently have a breakpoint importing feature.Therefore, you need to manually create breakpoints at the following locations：

| File                        | Line No. |
| --------------------------- | -------- |
| CartController              | 30       |
| CartController              | 34       |
| CartGrain                   | 24       |
| CartGrain                   | 32       |
| AddItemToCart Event Handler | 14       |
| AddItemToCart Event Handler | 28       |

> [通过 Go To File 可以助您快速定位文件所在](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## Start debugging

Next, we take a request to see how the entire code runs.

First, let's send a POST request through the swagger interface and try adding items to the shopping cart.

### CartController Start

The first lifeline is the Controller code for the Web API layer：

```cs
[HttpPost("{id}")]
public async Task<IActionResult> AddItemAsync(int id, [FromBody] AddItemInput input)
{
    var cartGrain = _grainFactory.GetGrain<ICartGrain>(id.ToString());
    var items = await cartGrain.AddItemAsync(input.SkuId, input.Count);
    return Json(items);
}
```

In this code, we pass`_grainFactory`to create a`ICartGrain`Instance.

This instance is essentially a proxy that points to a specific grain in Backend Server.

The incoming id can be considered a unique identifier for the location instance.In this business context, it can be understood as "cart id" or "user id" (if each user has only one shopping cart).

Continue with debugging and move on to the next step, let's see how the inside of ICartGrain works.

### CartGrain Start

The next stop point is the CartGrain code.：

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

- Modify the data in Claptrap with events
- Read data saved in Claptrap

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

### AddItemToCart Event Handler Start

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

这段代码中，包含有两个重要参数，分别是表示当前购物车状态的`CartState`和需要处理的事件`AddItemToCartEvent`。

我们按照业务需求，判断状态中的字典是否包含 SkuId，并对其数量进行更新。

继续调试，代码将会运行到这段代码的结尾。

此时，通过调试器，可以发现，stateData.Items 这个字典虽然增加了一项，但是数量却是 0 。原因其实就是因为上面被注释的 else 代码段，这就是第一次添加购物车总是失败的 BUG 成因。

在这里，不要立即中断调试。我们继续调试，让代码走完，来了解整个过程如何结束。

实际上，继续调试，断点将会依次命中 CartGrain 和 CartController 对应方法的方法结尾。

## This is actually a three-tier architecture!

绝大多数的开发者都了解三层架构。其实，我们也可以说 Newbe.Claptrap 其实就是一个三层架构。下面我们通过一个表格来对比一下：

| Traditional three-tiered | Newbe.Claptrap     | Description                                                                                                                  |
| ------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Presentation Layer       | Controller Layer   | Used to dock external systems to provide external interoperability                                                           |
| Business Tier            | Grain Layer        | Business processing based on incoming business parameters (sample does not actually write judgment, need to judge count > 0) |
| Persistence Layer        | EventHandler Layer | Update business results                                                                                                      |

当然上面的类似只是一种简单的描述。具体过程中，不需要太过于纠结，这只是一个辅助理解的说法。

## You also have a BUG to fix

接下来我们重新回过头来修复前面的“首次加入商品不生效”的问题。

### This is a framework for considering unit testing

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

## The data has been persisted.

您可以尝试重新启动 Backend Server 和 Web， 您将会发现，您之前操作的数据已经被持久化的保存了。

我们将会在后续的篇章中进一步介绍。

## Summary

通过本篇，我们初步了解了一下，如何创建一个基础的项目框架来实现一个简单的购物车场景。

这里还有很多内容我们没有详细的说明：项目结构、部署、持久化等等。您可以进一步阅读后续的文章来了解。
