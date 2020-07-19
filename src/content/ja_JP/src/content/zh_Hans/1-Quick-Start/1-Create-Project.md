---
title: '最初のステップ - 簡単なショッピングカートのためのプロジェクトを作成する'
metaTitle: '第一步——创建项目，实现简易购物车'
metaDescription: '最初のステップ - 簡単なショッピングカートのためのプロジェクトを作成する'
---

Newbe.Claptrap を使用して開発する方法を見つけるために、単純な「Eコマース カート」のニーズを実装しましょう。

> [当前查看的版本是由机器翻译自简体中文，并进行人工校对的结果。若文档中存在任何翻译不当的地方，欢迎点击此处提交您的翻译建议。](https://crwd.in/newbeclaptrap)

<!-- more -->

## ビジネス要件

シンプルな「Eコマースカート」の需要を実現し、ここでいくつかの簡単なビジネスを実現：

- 現在のショッピング カート内の商品と数量を取得する
- ショッピング カートにアイテムを追加する
- ショッピング カートから特定のアイテムを削除する

## プロジェクト テンプレートのインストール

まず、. NetCore SDK 3.1.[最新バージョンをインストールするには、ここをクリックしてください。](https://dotnet.microsoft.com/download)。

SDK のインストールが完了したら、コンソールを開いて次のコマンドを実行して、最新のプロジェクト テンプレートをインストールします。：

```bash
dotnet new --install Newbe.Claptrap.Template
```

インストールが完了したら、インストール結果で既にインストールされているプロジェクト テンプレートを表示できます。

![newbe.claptrap.template のインストールが完了しました](/images/20200709-001.png)

## プロジェクトの作成

場所を選択し、フォルダを作成し、この例では、`D:\Rエポ`次に、という名前の名前を作成します。`ハロープラップ`フォルダ。フォルダは、新しいプロジェクトのコード フォルダとして機能します。

コンソールを開き、作業ディレクトリを`D:\Rエポ=ハロークアプラップ`。次に、次のコマンドを実行してプロジェクトを作成します。：

```bash
dotnet newbe.claptrap --name HelloClaptrap
```

> 通常来说，我们建议将`D:\Repo\HelloClaptrap`创建为 Git 仓库文件夹。通过版本控制来管理您的源码。

## コンパイルと起動

プロジェクトの作成が完了したら、好みの IDE でソリューションを開いてコンパイルできます。

コンパイルが完了したら、IDE のスタートアップ機能を使用して、Web プロジェクトと BackendServer の両方のプロジェクトを起動します。(VS はコンソールでサービスを開始する必要があり、IIS Express を使用している場合は、開発者が対応するポート番号を見て Web ページにアクセスする必要があります)

起動が完了すると、`http://localhost:36525/swagger`サンプル プロジェクトの API の説明を表示するアドレス。これには、3 つの主要な API が含まれます。：

- `GET` `/api/Cart/{id}` 特定の ID ショッピング カート内の商品と数量を取得する
- `POST` `/api/Cart/{id}` 指定された ID の購入に新しい商品を追加する
- `DELETE` `/api/Cart/{id}` 指定した id のショッピング カートから特定のアイテムを削除する

インターフェイスの [Try It Out] ボタンを使用して、API を数回呼び出すことができます。

> - [如何在 VS 中同时启动多个项目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [如何在 Rider 中同时启动多个项目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [使用华为云加速 nuget 还原速度](https://mirrors.huaweicloud.com/)

## 初めて商品を追加し、効果なし?

はい、あなたは正しいです。プロジェクト テンプレートのビジネス実装にはバグがあります。

次に、プロジェクトを開き、ブレークポイントを追加してこれらのバグをトラブルシューティングして解決します。

また、バグを見つからると、フレームワークのコード フロー プロセスを理解できます。

## ブレークポイントの追加

次の IDE の説明に基づいてブレークポイントを追加する必要がある場所に応じて、慣れ親しんだ IDE を選択できます。

現在手元に IDE がない場合は、このセクションをスキップして、後で直接お読みください。

### Visual Studio

上記の起動方法に従って、2 つのプロジェクトを同時に開始します。

ブレークポイントのインポート：[ブレークポイント] ウィンドウを開き、ボタンをタップして項目の下から選択します。`breakpoints.xml`ファイル。対応する操作位置は、次の 2 つのスクリーンショットから確認できます。

![オープンブレイクポイントウィンドウ](/images/20200709-002.png)

![インポートブレクポイント](/images/20200709-003.png)

### ライダー

上記の起動方法に従って、2 つのプロジェクトを同時に開始します。

現在、ライダーにはブレークポイントのインポート機能がありません。したがって、次の場所にブレークポイントを手動で作成する必要があります。：

| ファイル                      | 行番号 |
| ------------------------- | --- |
| カートコントローラ                 | 30  |
| カートコントローラ                 | 34  |
| カートグライン                   | 24  |
| カートグライン                   | 32  |
| AddItemToCartEventHandler | 14  |
| AddItemToCartEventHandler | 28  |

> [通过 Go To File 可以助您快速定位文件所在](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## デバッグの開始

次に、1 つの要求でコード全体の実行プロセスについて説明します。

まず、swagger インターフェイスを使用して POST 要求を送信し、ショッピング カートに商品を追加します。

### カートコントローラスタート

ブレークポイントへの最初のヒットは、Web API レイヤーの Controller コードです。：

```cs
[HttpPost("{id}")]
パブリック async Task<IActionResult> AddItemAsync (int id, [FromBody] AddItemInput input)
{
    バーカートグライン – _grainFactory.GetGrain<ICartGrain>(id. ToString();
    var items = await cartGrain.AddItemAsync (input.) スクイド、インチ。 カウント);
    return Json (items);
}
```

このコードでは、`_grainFactory`作成`アイカートグライン`インスタンス。

このインスタンスの性質上、Backend Server の特定の Grain を指すエージェントです。

渡された id は、ターゲット インスタンスが一意の識別子を使用していると考えることができます。このビジネス コンテキストでは、各ユーザーに 1 つのショッピング カートしかない場合は、"ショッピング カート ID" または "ユーザー ID" と見なすことができます。

デバッグを続け、次のステップに進み、ICartGrain の内部がどのように機能するかを見てみましょう。

### カートグラインスタート

次にブレークポイントにヒットするのは CartGrain コードです。：

```cs
パブリック async Task<Dictionary<string, int>> AddItemAsync (string skuId, int count)
{
    var evt = this. CreateEvent (new AddItemToCartEvent)
    {
        カウント = count,
        SkuId = skuId,
    });
    await Claptrap.handleEventAsync (evt);
    return StateData.Items;
}
```

此处便是框架实现的核心，如下图所示的关键内容：

![Claptrap](/images/20190228-001.gif)

具体说到业务上，代码已经运行到了一个具体的购物车对象。

可以通过调试器看到传入的 skuId 和 count 都是从 Controller 传递过来的参数。

在这里您可以完成以下这些操作：

- イベントによる Claptrap のデータの変更
- Claptrap に保存されたデータの読み取り

这段代码中，我们创建了一个`AddItemToCartEvent`对象来表示一次对购物车的变更。

然后将它传递给 Claptrap 进行处理了。

Claptrap 接受了事件之后就会更新自身的 State 数据。

最后我们将 StateData.Items 返回给调用方。（实际上 StateData.Items 是 Claptrap.State.Data.Items 的一个快捷属性。因此实际上还是从 Claptrap 中读取。）

通过调试器，可以看到 StateData 的数据类型如下所示：

```cs
パブリッククラスCartState : IStateData
{
    public Dictionary<string, int> Items { get; set;
}
```

这就是样例中设计的购物车状态。我们使用一个`Dictionary`来表示当前购物车中的 SkuId 及其对应的数量。

继续调试，进入下一步，让我们看看 Claptrap 是如何处理传入的事件的。

### AddItemToCartEventHandler Start

再次命中断点的是下面这段代码：

```cs
パブリッククラス AddItemToCartEventHandler
    : ノルマル・ヴェント・ハンドラー<CartState, AddItemToCartEvent>
{
    public override ValueTask HandleEvent (CartState stateData, AddItemToCartEvent eventData,
        IEventContext eventContext)
    {
        var items = stateData.Items ?? ニューディセクションリー<string, int>();
        if (items. TryGetValue (eventData.SkuId, out var itemCount))
        {
            itemCount += eventData.Count;
        }
        エルゼ
        // {
        itemCount = eventData.Count;
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

## これは実際には3層アーキテクチャです!

绝大多数的开发者都了解三层架构。其实，我们也可以说 Newbe.Claptrap 其实就是一个三层架构。下面我们通过一个表格来对比一下：

| 伝統的な3つの層        | Newbe.Claptrap    | 説明                                                                                 |
| --------------- | ----------------- | ---------------------------------------------------------------------------------- |
| プレザートショーケースレイヤー | アトローラー層           | 外部システムとのドッキングに使用され、外部相互運用能力を提供します。                                                 |
| ビジネスビジネス層       | グレインレイヤー          | ビジネスに基づいて、着信ビジネス パラメータをビジネス処理します (サンプルでは、実際には判断が書かれていない場合は、カウントを判断する必要があります)。 > 0) |
| パーシストレンス永続化層    | EventHandler レイヤー | ビジネス結果の更新                                                                          |

当然上面的类似只是一种简单的描述。具体过程中，不需要太过于纠结，这只是一个辅助理解的说法。

## また、修正するバグがあります。

接下来我们重新回过头来修复前面的“首次加入商品不生效”的问题。

### これは、単体テスト フレームワークを考慮します。

在项目模板中存在一个项目`HelloClaptrap.Actors.Tests`，该项目包含了对主要业务代码的单元测试。

我们现在已经知道，`AddItemToCartEventHandler`中注释的代码是导致 BUG 存在的主要原因。

我们可以使用`dotnet test`运行一下测试项目中的单元测试，可以得到如下两个错误:

```bash
A total of 1 test files matched the specified pattern.
  X AddFirstOne [130ms]
  エラー メッセージ:
   Expected value to be 10, but found 0.
  スタックトレース:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw (String message)
   at FluentAssertions.Execution.TestFrameworkProvider.Throw (String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.Handle Failure (String message)
   at FluentAssertions.Execution.AssertionScope.FailWith (Func'1 failReason Func)
   at FluentAssertions.Execution.AssertionScope.FailWith (Func'1 failReason Func)
   at FluentAssertions.Execution.AssertionScope.FailWith (String message, Object[] args)
   at FluentAssertions.Numeric.NumericAssertions'1.Be (T expected, String because, Object[] becauseArgs)
   at HelloClaptrap.Actors.Tests.Cart.Events.AddItemToCartEventHandlerTest.AddFirstOne() in D.\Repo_HelloClaptrap_HelloClaptrap.Actors.Tests_Cart_Events_AddItemToCartEventHandlerTest.cs:line 32
   at HelloClaptrap.Actors.Tests.Cart.Events.AddItemToCartEventHandlerTest.AddFirstOne() in D.\Repo_HelloClaptrap_HelloClaptrap.Actors.Tests_Cart_Events_AddItemToCartEventHandlerTest.cs:line 32
   at NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter'1.GetResult()
   at NUnit.Framework.Internal.AsyncToSyncAdapter.Await (Func'1 invoke)
   at NUnit.Framework.Internal.Commands.TestMethodCommand. RunTestMethod (TestExecutionContext context)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.Execute (TestExecutionContext context)
   at NUnit.Framework.Internal.Execution.SimpleWorkItem.PerformWork()

  XレmoveOne [2ms]
  エラー メッセージ:
   Expected value to be 90, but found 100.
  スタックトレース:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw (String message)
   at FluentAssertions.Execution.TestFrameworkProvider.Throw (String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.Handle Failure (String message)
   at FluentAssertions.Execution.AssertionScope.FailWith (Func'1 failReason Func)
   at FluentAssertions.Execution.AssertionScope.FailWith (Func'1 failReason Func)
   at FluentAssertions.Execution.AssertionScope.FailWith (String message, Object[] args)
   at FluentAssertions.Numeric.NumericAssertions'1.Be (T expected, String because, Object[] becauseArgs)
   at HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemFromCartEventHandlerTest.RemoveOne() in D:\Repo_HelloClaptrap_HelloClaptrap_HelloClaptrap.Actors.Tests_Cart_Events\RemoveItemFromCartEventHandlerTest.cs:line 40
   at HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemFromCartEventHandlerTest.RemoveOne() in D:\Repo_HelloClaptrap_HelloClaptrap_HelloClaptrap.Actors.Tests_Cart_Events\RemoveItemFromCartEventHandlerTest.cs:line 40
   at NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter'1.GetResult()
   at NUnit.Framework.Internal.AsyncToSyncAdapter.Await (Func'1 invoke)
   at NUnit.Framework.Internal.Commands.TestMethodCommand. RunTestMethod (TestExecutionContext context)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.Execute (TestExecutionContext context)
   at NUnit.Framework.Internal.Execution.SimpleWorkItem.PerformWork()


テストランファイル。
Total tests: 7
     パス: 5
     ファイレド: 2

```

我们看一下其中一个出错的单元测试的代码：

```cs
[Test]
public async Task AddFirstOne()
{
    using var mocker – AutoMock.GetStrict();

    await using var handler @ mocker. クリエイト<AddItemToCartEventHandler>();
    var state = new CartState();
    バーのevt – new AddItemToCartEvent
    {
        SkuId = "skuId1",
        カウント = 10
    };
    アwait handler. HandleEvent (state, evt, default);

    ステート. Items.Count.Should(). Be(1);
    var (key, value) = state. Items.Single();
    キー ショアド()。 Be (evt. SkuId;
    私は値を見る。 ショアド()。 Be (evt. カウント);
}
```

`AddItemToCartEventHandler`是该测试主要测试的组件，由于 stateData 和 event 都是通过手动构建的，因此开发者可以很容易就按照需求构建出需要测试的场景。不需要构建什么特殊的内容。

现在，只要将`AddItemToCartEventHandler`中那段被注释的代码还原，重新运行这个单元测试。单元测试便就通过了。BUG 也就自然的修复了。

当然，上面还有另外一个关于删除场景的单元测试也是失败的。开发者可以按照上文中所述的“断点”、“单元测试”的思路，来修复这个问题。

## データは永続化されました。

您可以尝试重新启动 Backend Server 和 Web， 您将会发现，您之前操作的数据已经被持久化的保存了。

我们将会在后续的篇章中进一步介绍。

## 小結び目

通过本篇，我们初步了解了一下，如何创建一个基础的项目框架来实现一个简单的购物车场景。

这里还有很多内容我们没有详细的说明：项目结构、部署、持久化等等。您可以进一步阅读后续的文章来了解。
