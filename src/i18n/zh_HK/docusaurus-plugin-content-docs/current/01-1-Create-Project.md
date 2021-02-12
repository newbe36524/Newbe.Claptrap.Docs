---
title: '第一步——建立項目，實現簡易購物車'
description: '第一步——建立項目，實現簡易購物車'
---

等我哋嚟了解一下點樣用Newbe.Claptrap開發實現一個簡單嘅“電商購物車”。

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

> 通常黎講，我哋建議將`D:\Repo\HelloClaptrap`標記做 Git 倉庫嘅文件夾。通過版本控制來管理你嘅源代碼。

## 建置與執行

项目创建完成之后，您可以用您偏爱的 IDE 打开解决方案进行编译。

建置完成之後，通過 IDE 上面嘅“執行”功能，同時啟動 Web 和 BackendServer 哩兩個項目。（VS 需要以控制台方式啟動服務，如果使用 IIS Express，需要開發者看一下對應的端口號來訪問 Web 頁面）

啟動完成之後，就可以通過`http://localhost:36525/swagger`地址嚟睇例子項目嘅 API 描述啦。其中包括了三個主要的 API：

- `GET` `/api/Cart/{id}` 獲取特定 id 購物車中的商品和數量
- `POST` `/api/Cart/{id}` 添加新的商品到指定 id 的購物商品
- `DELETE` `/api/Cart/{id}` 從指定 id 的購物車中移除特定的商品

您可以通過界面上的 Try It Out 按鈕來嘗試對 API 進行幾次呼叫。

> - [如何在 VS 中同時執行多個項目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [如何在 Rider 中同時執行多個項目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [使用華為雲加速 nuget 還原速度](https://mirrors.huaweicloud.com/)

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

> [通過 Go To File 可以助你快速定位文件所在](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## 開始debug

接下來，我們通過一個請求來了解一下整個源代碼運作過程。

首先，我們先通過 swagger 界面來發送一個 POST 請求，嘗試為購物車增加商品。

### CartController Start

首先係命中Web API 層breakpoint嘅 Controller 代碼：

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

呢度就係框架實現嘅核心，圖中所示就係關鍵內容：

![Claptrap](/images/20190228-001.gif)

具體講到業務上，程式已經運行到了一個具體的購物車Object。

可以通過偵錯工具睇到傳入嘅 skuId 同 count 都係由 Controller 傳遞過來嘅參數。

去到呢一步，你可以完成以下呢哋動作：

- 通過事件對 Claptrap 中的數據進行修改
- 讀取 Claptrap 中保存的數據

這段Codeode入面，我地建立咗一個`AddItemToCartEvent`Object嚟表示一次對購物車嘅變更。

然後將佢傳遞俾 Claptrap 進行處理了。

Claptrap 接受咗事件之後就會更新自身嘅 State 數據。

最後我地將 StateData.Items 返回番俾Caller。（實際上 StateData.Items 係 Claptrap.State.Data.Items 嘅一個快捷屬性。因此實際上仲係響 Claptrap 入面讀取。）

通過偵錯工具，可以睇到 StateData 嘅數據類型如下所示：

```cs
public class CartState : IStateData
{
    public Dictionary<string, int> Items { get; set; }
}
```

呢個就係範例中設計購物車嘅狀態。我地用`Dictionary`嚟表示呢個購物車中嘅 SkuId 同對應數量。

繼續debug，進入下一步，等我們睇睇 Claptrap 係點樣處理傳入嘅事件。

### AddItemToCartEventHandler Start

呢次命中嘅reakpoint係下面呢段源代碼

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

這段code入面，包含咗兩個重要參數，分別係表示當前購物車狀態嘅`CartState`同需要處理嘅事件`AddItemToCartEvent`。

我地按照業務需求，判斷狀態入面嘅字典係咪包含 SkuId，並對佢嘅數量進行更新。

繼續debug，直至執行到呢度結尾。

呢個時候，通過偵錯工作可以發現，stateData.Items 字典入面雖然增加了一項，但數量仲會係 0 。原因其實就係因為上面被comment 嘅 else 呢部分，亦都係第一次添加購物車唔得嘅成因。

去到呢度，唔好結束debugger。我地繼續落去等佢行完，嚟了解成個過程點去結束。

實際上，繼續行落去，Breakpoint會依次命中reakpoint會依次命中喺 CartGrain 同 CartController 對應方法嘅method結尾。

## 其實係三層架構！

絕大多數嘅開發者都了解三層架構。其實，我地亦可以話 Newbe.Claptrap 就係一個三層架構。下面我們通過一個表格對比一下：

| 傳統三層             | Newbe.Claptrap | 说明                                           |
| ---------------- | -------------- | -------------------------------------------- |
| Presentation 展示層 | Controller 層   | 用來與外部的系統進行連接，提供對外的互操作能力                      |
| Business 業務層     | Grain 層        | 根據業務對傳入的業務參數進行業務處理（範例中其實沒寫判斷，需要判斷 count > 0） |
| Persistence 持久化層 | EventHandler 層 | 對業務結果進行更新                                    |

當然上面只係一種簡單嘅描述。具體過程唔需要太過深究，因為只係一個輔助理解嘅說法。

## 咪住先，你仲有一個 BUG而搞掂呀

跟往落嚟，我地重新番到去“首次加入商品不生效”呢個問題上。

### 这是一个考虑单元测试的框架

在項目模板入面存在一個項目`HelloClaptrap.Actors.Tests`，而呢個項目包含咗對主要業務嘅unit test。

我地而家已經知道，`AddItemToCartEventHandler`入面Comment咗既代碼就係導致 BUG 存在嘅主要原因。

我地可以用`dotnet test`運行一下測試項目中嘅unit test，可以得到呢兩個錯誤:

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

我地睇一下其中一個出錯嘅unit test：

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

`AddItemToCartEventHandler`係該測試主要測試嘅組件，由於 stateData 同埋 event 都係通過手動構建，因此開發者可以好容易咁按照需求構建出需要測試嘅場景。而唔需要建置咩古靈精怪嘅內容。

而家，只要將`AddItemToCartEventHandler`果段被Comment嘅Code還原，重新執行呢個unit test。unit test就會通過了。BUG 亦都會自然咁消失咗。

當然，上面仲有另外一個關於刪除場景的單元測試係失敗既。開發者可以按照上文中所述嘅“breakpoint”、“unit test”嘅思路，嚟修復呢個問題。

## 數據已經持久化了

您可以嘗試重新啟動 Backend Server 同埋 Web， 你會發現之前執行嘅數據已經被持久化保存了。

我地將會喺後續篇章進一步介紹。

## 小結

通過本篇，我們初步了解了一下，如何創建一個基礎的項目框架來實現一個簡單的購物車場景。

這裡還有很多內容我們沒有詳細的說明：項目結構、部署、持久化等等。你可以進一步閱讀後續的文章來了解。
