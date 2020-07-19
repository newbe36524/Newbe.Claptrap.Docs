---
title: '第一步——建立項目，實現簡易購物車'
metaTitle: '第一步——创建项目，实现简易购物车'
metaDescription: '第一步——建立項目，實現簡易購物車'
---

等我哋嚟了解一下點樣用Newbe.Claptrap開發實現一個簡單嘅“電商購物車”。

> [当前查看的版本是由机器翻译自简体中文，并进行人工校对的结果。若文档中存在任何翻译不当的地方，欢迎点击此处提交您的翻译建议。](https://crwd.in/newbeclaptrap)

<!-- more -->

## 業務需求

實現一個簡單嘅“電商購物車”需求，呢度需要實現幾個簡單嘅業務：

- 拎到依家購物車裏面嘅商品同數量
- 將商品dum入購物車
- 响購物車入面tick走特定嘅商品

## 安裝項目模板

首先，需要確保已經安裝咗 .NetCore SDK 3.1 。[可以clickclick呢度攞到最新嘅版本進行安裝](https://dotnet.microsoft.com/download)。

SDK 安裝完畢之後，打開控制台run以下呢個命令安裝最新嘅項目模板：

```bash
dotnet new --install Newbe.Claptrap.Template
```

安裝完之後，可以响安裝結果入面睇到已經安裝的咗嘅項目模板。

![newbe.claptrap.template安裝完成](/images/20200709-001.png)

## 建立項目

選擇一個位置，建立一個文件夾，呢個例選擇响`D:\Repo`下創建一個叫做`HelloClaptrap`嘅文件夾。果個文件夾將會用作新項目的code folder。

打開控制台，並且將工作目錄切換到`D:\Repo\HelloClaptrap`。然後運行下面嘅命令就可以建立出項目：

```bash
dotnet new newbe.claptrap --name HelloClaptrap
```

> 通常来说，我们建议将`D:\Repo\HelloClaptrap`创建为 Git 仓库文件夹。通过版本控制来管理您的源码。

## 建置與執行

項目創建完成之後，你可以用自己偏愛的 IDE 打開解決方案嚟進行建置。

建置完成之後，通過 IDE 上面嘅“執行”功能，同時啟動 Web 和 BackendServer 哩兩個項目。（VS 需要以控制台方式啟動服務，如果使用 IIS Express，需要開發者看一下對應的端口號來訪問 Web 頁面）

啟動完成之後，就可以通過`http://localhost:36525/swagger`地址嚟睇例子項目嘅 API 描述啦。其中包括了三個主要的 API：

- `GET` `/api/Cart/{id}` 獲取特定 id 購物車中的商品和數量
- `POST` `/api/Cart/{id}` 添加新的商品到指定 id 的購物商品
- `DELETE` `/api/Cart/{id}` 從指定 id 的購物車中移除特定的商品

您可以通過界面上的 Try It Out 按鈕來嘗試對 API 進行幾次呼叫。

> - [如何在 VS 中同时启动多个项目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [如何在 Rider 中同时启动多个项目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [使用华为云加速 nuget 还原速度](https://mirrors.huaweicloud.com/)

## 點解第一次禁添加商品無效果既？

係，你講得無錯。項目模板嘅業務實現係存在 BUG 的。

接下來我們來打開項目，通過添加一些斷點來排查並解決這些 BUG。

並且通過對 BUG 的定位，你可以了解框架的代碼流轉過程。

## 添加Breakpoint

以下根據不同的 IDE 說明需要增加中斷點位置，你可以選擇您習慣的 IDE 進行操作。

如果唔係喺有IDE嘅環境下，你可以跳過本節，直接閱讀後面嘅內容。

### Visual Studio

按照上文提到嘅執行方式，同時執行兩個項目。

導入中斷點：打開“中斷點”窗口，點擊按鈕，從項目下選擇`breakpoints.xml`文件。可以通過以下兩張截圖找到對應的操作位置。

![Open Breakpoints Window](/images/20200709-002.png)

![Import Breakpoints](/images/20200709-003.png)

### Rider

按照上文提到嘅啟動方式，同時執行兩個項目。

Rider 目前無提供中斷點導入功能。因此需要手動喺以下嘅位置建立中斷點：

| 檔案                        | 行  |
| ------------------------- | -- |
| CartController            | 30 |
| CartController            | 34 |
| CartGrain                 | 24 |
| CartGrain                 | 32 |
| AddItemToCartEventHandler | 14 |
| AddItemToCartEventHandler | 28 |

> [通过 Go To File 可以助您快速定位文件所在](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## 開始debug

接下來，我們通過一個請求來了解一下整個源代碼運作過程。

首先，我們先通過 swagger 界面來發送一個 POST 請求，嘗試為購物車增加商品。

### CartController Start

首先命中斷點是 Web API 層的 Controller 代碼：

```cs
[HttpPost("{id}")]
public async Task<IActionResult> AddItemAsync(int id, [FromBody] AddItemInput input)
{
    var cartGrain = _grainFactory.GetGrain<ICartGrain>(id.ToString());
    var items = await cartGrain.AddItemAsync(input.SkuId, input.Count);
    return Json(items);
}
```

在這段源代碼中，我們通過`_grainFactory`來建立一個`ICartGrain`實體。

這實體本質是一個代理，這個代理將指向 Backend Server 中的一個具體 Grain。

傳入的 id 可以認為是定位實例使用唯一標識符。在這個業務上下文中，可以理解為“購物車 id”或者“用戶 id”（如果每個用戶只有一個購物車的話）。

繼續偵錯，進入下一步，讓我們來看看 ICartGrain 內部是如何工作的。

### CartGrain Start

接下來命中斷點的是 CartGrain 源代碼：

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

- 通過事件對 Claptrap 中的數據進行修改
- 讀取 Claptrap 中保存的數據

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

这段代码中，包含有两个重要参数，分别是表示当前购物车状态的`CartState`和需要处理的事件`AddItemToCartEvent`。

我们按照业务需求，判断状态中的字典是否包含 SkuId，并对其数量进行更新。

继续调试，代码将会运行到这段代码的结尾。

此时，通过调试器，可以发现，stateData.Items 这个字典虽然增加了一项，但是数量却是 0 。原因其实就是因为上面被注释的 else 代码段，这就是第一次添加购物车总是失败的 BUG 成因。

在这里，不要立即中断调试。我们继续调试，让代码走完，来了解整个过程如何结束。

实际上，继续调试，断点将会依次命中 CartGrain 和 CartController 对应方法的方法结尾。

## 其實係三層架構！

绝大多数的开发者都了解三层架构。其实，我们也可以说 Newbe.Claptrap 其实就是一个三层架构。下面我们通过一个表格来对比一下：

| 傳統三層             | Newbe.Claptrap | 说明                                           |
| ---------------- | -------------- | -------------------------------------------- |
| Presentation 展示層 | Controller 層   | 用來與外部的系統進行連接，提供對外的互操作能力                      |
| Business 業務層     | Grain 層        | 根據業務對傳入的業務參數進行業務處理（範例中其實沒寫判斷，需要判斷 count > 0） |
| Persistence 持久化層 | EventHandler 層 | 對業務結果進行更新                                    |

当然上面的类似只是一种简单的描述。具体过程中，不需要太过于纠结，这只是一个辅助理解的说法。

## 咪住先，你仲有一個 BUG而搞掂呀

接下来我们重新回过头来修复前面的“首次加入商品不生效”的问题。

### 呢個係一個考慮單元測試嘅框架

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

## 數據已經持久化了

您可以尝试重新启动 Backend Server 和 Web， 您将会发现，您之前操作的数据已经被持久化的保存了。

我们将会在后续的篇章中进一步介绍。

## 小結

通过本篇，我们初步了解了一下，如何创建一个基础的项目框架来实现一个简单的购物车场景。

这里还有很多内容我们没有详细的说明：项目结构、部署、持久化等等。您可以进一步阅读后续的文章来了解。
