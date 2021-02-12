---
title: '第一步——建立項目，實現簡易購物車'
description: '第一步——創建項目,實現簡易購物車'
---

讓我們來實現一個簡單的“電商購物車”需求來了解一下如何使用 Newbe.Claptrap 進行開發。

<!-- more -->

## 業務需求

實現一個簡單的“電商購物車”需求，這裏實現幾個簡單的業務：

- 取得當前購物車中的商品和數量
- 向購物車中加入商品
- 從購物車中移除特定的商品

## 安裝項目模板

首先，需要確保已經安裝了 .NetCore SDK 3.1 。[可以點擊此處來獲取最新的版本進行安裝](https://dotnet.microsoft.com/download)。

SDK 安裝完畢後，打開控制台運行以下命令來安裝最新的項目模板：

```bash
dotnet new --install Newbe.Claptrap.Template
```

安裝完畢後，可以在安裝結果中查看到已經安裝的項目模板。

![newbe.claptrap.template安裝完成](/images/20200709-001.png)

## 建立項目

選擇一個位置，建立一個文件夾，本範例選擇在`D:\Repo`下創建一個名為`HelloClaptrap`的文件夾。該文件夾將會作為新項目的源代碼文件夾。

打開控制台，並且將工作目錄切換到`D:\Repo\HelloClaptrap`。然後運行以下命令便可以建立出項目：

```bash
dotnet new newbe.claptrap --name HelloClaptrap
```

> 通常來說，我們建議將`D:\Repo\HelloClaptrap`標記為 Git 倉庫文件夾。通過版本控制來管理您的源代碼。

## 建置與執行

項目創建完成之後，您可以用您偏愛的 IDE 打開解決方案進行建置。

建置完成後，通過 IDE 上“執行”功能，同時啟動 Web 和 BackendServer 兩個項目。（VS 需要以控制台方式啟動服務，如果使用 IIS Express，需要開發者看一下對應的端口號來訪問 Web 頁面）

啟動完成後，便可以通過`http://localhost:36525/swagger`地址來查看樣例項目的 API 描述。其中包括了三個主要的 API：

- `GET` `/api/Cart/{id}` 獲取特定 id 購物車中的商品和數量
- `POST` `/api/Cart/{id}` 添加新的商品到指定 id 的購物商品
- `DELETE` `/api/Cart/{id}` 從指定 id 的購物車中移除特定的商品

您可以通過界面上的 Try It Out 按鈕來嘗試對 API 進行幾次呼叫。

> - [如何在 VS 中同時執行多個項目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [如何在 Rider 中同時執行多個項目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [使用华为云加速 nuget 還原速度](https://mirrors.huaweicloud.com/)

## 第一次添加商品，没有效果？

是的，你說的沒錯。項目模板中的業務實現是存在 BUG 的。

接下來我們來打開項目，通過添加一些斷點來排查並解決這些 BUG。

並且通過對 BUG 的定位，您可以了解框架的代碼流轉過程。

## 添加中斷點

以下根據不同的 IDE 說明需要增加中斷點的位置，您可以選擇您習慣的 IDE 進行操作。

如果您當前手頭沒有 IDE，也可以跳過本節，直接閱讀後面的內容。

### Visual Studio

按照上文提到的執行方式，同時執行兩個項目。

導入中斷點：打開“中斷點”窗口，點擊按鈕，從項目下選擇`breakpoints.xml`文件。可以通過以下兩張截圖找到對應的操作位置。

![Open Breakpoints Window](/images/20200709-002.png)

![Import Breakpoints](/images/20200709-003.png)

### Rider

按照上文提到的啟動方式，同時執行兩個項目。

Rider 目前沒有中斷點導入功能。因此需要手動的在以下位置建立中斷點：

| 檔案                        | 列編號 |
| ------------------------- | --- |
| CartController            | 30  |
| CartController            | 34  |
| CartGrain                 | 24  |
| CartGrain                 | 32  |
| AddItemToCartEventHandler | 14  |
| AddItemToCartEventHandler | 28  |

> [通過 Go To File 可以助你快速定位文件所在](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## 開始除錯

接下來，我們通過一個請求來了解一下整個源代碼運行的過程。

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

此處便是框架實現的核心，如下圖所示的關鍵內容：

![Claptrap](/images/20190228-001.gif)

具體說到業務上，代碼已經運行到了一個具體的購物車物件。

可以通過調試器看到傳入的 skuId 和 count 都是從 Controller 傳遞過來的參數。

在這裡您可以完成以下這些操作：

- 通過事件對 Claptrap 中的數據進行修改
- 讀取 Claptrap 中保存的數據

這段代碼中,我們建立了一個`AddItemToCartEvent`物件來表示一次對購物車的變更。

然後將它傳遞給 Claptrap 進行處理了。

Claptrap 接受了事件之後就會更新自身的 State 數據。

最後我們將 StateData.Items 傳回給呼叫者。(實際上 StateData.Items 是 Claptrap.State.Data.Items 的一個快捷屬性。因此實際上還是從 Claptrap 中讀取。 )

通過除錯器，可以看到 StateData 的資料類型是這樣的：

```cs
public class CartState : IStateData
{
    public Dictionary<string, int> Items { get; set; }
}
```

這就是範例中設計的購物車狀態。我們使用一個`Dictionary`來表示當前購物車中的 SkuId 及其對應的數量。

繼續調試,進入下一步,讓我們看看 Claptrap 是如何處理傳入的事件的。

### AddItemToCartEventHandler Start

再次命中斷點的是下面這段代碼：

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

這段代碼中，包含有兩個重要參數，分別是表示當前購物車狀態的`CartState`與需要處理的事件`AddItemToCartEvent`。

我們按照業務需求，判斷狀態中的字典是否包含 SkuId，並對其數量進行更新。

繼續調試，代碼將會運行到這段代碼的結尾。

此時，透過除錯器，可以發現,stateData.Items 這個字典雖然增加了一項，但是數量卻是 0 。原因其實就是因為上面被註釋的 else 代碼段，這就是第一次添加購物車總是失敗的 BUG 成因。

在這裡，不要立即中斷調試。我們繼續調試，讓代碼走完，來瞭解整個過程如何結束。

實際上，繼續調試，斷點將會依次命中 CartGrain 和 CartController 對應方法的方法結尾。

## 這其實就是三層架構！

絕大多數的開發者都瞭解三層架構。其實，我們也可以說 Newbe.Claptrap 其實就是一個三層架構。下面我們通過一個表格來對比一下：

| 傳統三層             | Newbe.Claptrap | 说明                                           |
| ---------------- | -------------- | -------------------------------------------- |
| Presentation 展示層 | Controller 層   | 用來與外部的系統進行連接，提供對外的互操作能力                      |
| Business 業務層     | Grain 層        | 根據業務對傳入的業務參數進行業務處理（範例中其實沒寫判斷，需要判斷 count > 0） |
| Persistence 持久化層 | EventHandler 層 | 對業務結果進行更新                                    |

當然上面的類似只是一種簡單的描述。具體過程中，不需要太過於糾結，這隻是一個輔助理解的說法。

## 你還有一個待修復的 BUG

接下來我們重新回過頭來修復前面的"首次加入商品不生效"的問題。

### 這是一個考慮單元測試的框架

在項目樣本中存在一個項目`HelloClaptrap.Actors.Tests`，該專案包含了對主要業務代碼的單元測試。

我們現在已經知道，`AddItemToCartEventHandler`中註釋的代碼是導致 BUG 存在的主要原因。

我們可以使用`dotnet test`執行一下測試專案中的單元測試，可以得到如下兩個錯誤:

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

我們看一下其中一個出錯的單元測試的代碼：

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

`AddItemToCartEventHandler`是該測試主要測試的元件，由於 stateData 和 event 都是通過手動構建的, 因此開發者可以很容易就按照需求構建出需要測試的場景。不需要構建什麼特殊的內容。

現在，只要將`AddItemToCartEventHandler`中那段被註釋的代碼還原，重新運行這個單元測試。單元測試便就通過了。BUG 也就自然的修復了。

當然，上面還有另外一個關於刪除場景的單元測試也是失敗的。開發者可以按照上文中所述的"斷點"、"單元測試"的思路，來修復這個問題。

## 數據已經持久化了

你可以嘗試重新啟動 Backend Server 和 Web，你將會發現，你之前操作的數據已經被持久化的保存了。

我們將會在後續的篇章中進一步介紹。

## 小結

通過本篇，我們初步瞭解了一下，如何創建一個基礎的專案框架來實現一個簡單的購物車場景。

這裏還有很多內容我們沒有詳細的說明：項目結構、部署、持久化等等。您可以進一步閱讀後續的文章來瞭解。
