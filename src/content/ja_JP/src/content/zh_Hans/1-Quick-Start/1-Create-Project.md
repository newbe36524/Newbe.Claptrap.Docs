---
title: '最初のステップ - 簡単なショッピングカートのためのプロジェクトを作成する'
metaTitle: '最初のステップ - 簡単なショッピングカートのためのプロジェクトを作成する | Newbe.Claptrap'
metaDescription: '最初のステップ - 簡単なショッピングカートのためのプロジェクトを作成する'
---

Newbe.Claptrap を使用して開発する方法を見つけるために、単純な「Eコマース カート」のニーズを実装しましょう。

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

> 通常、我々は、`D:\Rエポ=ハロークアプラップ`Git ウェアハウス フォルダとして作成します。バージョン管理を使用してソースを管理します。

## コンパイルと起動

プロジェクトの作成が完了したら、好みの IDE でソリューションを開いてコンパイルできます。

コンパイルが完了したら、IDE のスタートアップ機能を使用して、Web プロジェクトと BackendServer の両方のプロジェクトを起動します。(VS はコンソールでサービスを開始する必要があり、IIS Express を使用している場合は、開発者が対応するポート番号を見て Web ページにアクセスする必要があります)

起動が完了すると、`http://localhost:36525/swagger`サンプル プロジェクトの API の説明を表示するアドレス。これには、3 つの主要な API が含まれます。：

- `GET` `/api/Cart/{id}` 特定の ID ショッピング カート内の商品と数量を取得する
- `POST` `/api/Cart/{id}` 指定された ID の購入に新しい商品を追加する
- `DELETE` `/api/Cart/{id}` 指定した id のショッピング カートから特定のアイテムを削除する

インターフェイスの [Try It Out] ボタンを使用して、API を数回呼び出すことができます。

> - [VS で複数のプロジェクトを同時に開始する方法](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [ライダーで同時に複数のプロジェクトを開始する方法](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Huawei Cloud で nuget の復元速度を高速化](https://mirrors.huaweicloud.com/)

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

> [Go To File を使用すると、ファイルをすばやく配置できます。](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

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

この時点で、コードは特定のショッピング カート オブジェクトに実行されます。

デバッガーを使用すると、着信 skuId と count の両方が Controller から渡されたパラメーターです。

ここでは、次の操作を実行できます。：

- イベントによる Claptrap のデータの変更
- Claptrap に保存されたデータの読み取り

このコードでは、`AddItemToCartEvent`オブジェクトは、ショッピング カートへの一度の変更を表します。

次に、処理のために Claptrap に渡します。

Claptrap はイベントを受け入れると、独自の State データを更新します。

最後に、StateData.Items を呼び出し元に返します。(実際には、StateData.Items は Claptrap.State.Data.Items のショートカット プロパティです。だから、実際にはClaptrapから読み取られます。 )

デバッガーを使用すると、StateData のデータ型が次のようになります。：

```cs
パブリッククラスCartState : IStateData
{
    public Dictionary<string, int> Items { get; set;
}
```

これは、サンプルで設計されたショッピング カートの状態です。我々は1つを使用する`ディセリー`は、現在のショッピング カートの SkuId とそれに対応する数量を表します。

デバッグを続行し、次の手順に進み、Claptrap が着信イベントを処理する方法を見てみましょう。

### AddItemToCartEventHandler Start

ブレークポイントを再びヒットするのは、次のコードです。：

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

このコードには、現在のショッピング カートの状態を表す 2 つの重要なパラメーターが含まれています。`カートステート`処理が必要なイベント`AddItemToCartEvent`。

ビジネス ニーズに応じて、状態のディクショナリに SkuId が含まれているかどうかを判断し、その数を更新します。

デバッグを続行すると、コードはこのコードの末尾まで実行されます。

この時点で、デバッガーを使用すると、stateData.Items という辞書は 1 つ追加されますが、数は 0 です。理由は、上記の else スニペットがコメントされているためであり、ショッピング カートを初めて追加すると、常に失敗したバグの原因です。

ここでは、デバッグをすぐに中断しないでください。デバッグを続行し、コードを終了して、プロセス全体がどのように終了するかを確認します。

実際には、デバッグを続行し、ブレークポイントは、CartGrain と CartController の対応するメソッドを使用するメソッドによって終了します。

## これは実際には3層アーキテクチャです!

ほとんどの開発者は、3 層アーキテクチャを理解しています。実際、Newbe.Claptrap は実際には 3 層アーキテクチャであると言えます。では、表を見てみましょう。：

| 伝統的な3つの層        | Newbe.Claptrap    | 説明                                                                                 |
| --------------- | ----------------- | ---------------------------------------------------------------------------------- |
| プレザートショーケースレイヤー | アトローラー層           | 外部システムとのドッキングに使用され、外部相互運用能力を提供します。                                                 |
| ビジネスビジネス層       | グレインレイヤー          | ビジネスに基づいて、着信ビジネス パラメータをビジネス処理します (サンプルでは、実際には判断が書かれていない場合は、カウントを判断する必要があります)。 > 0) |
| パーシストレンス永続化層    | EventHandler レイヤー | ビジネス結果の更新                                                                          |

もちろん、上記の類似は単純な説明にすぎません。特定のプロセスでは、あまりにももつれする必要はありません、これは単に理解の補助的な声明です。

## また、修正するバグがあります。

次に、先ほどの「初めての商品への参加が有効でない」という問題を修正します。

### これは、単体テスト フレームワークを考慮します。

プロジェクト テンプレートにプロジェクトが存在する`ハロープラップ.アクトース・テストス`プロジェクトには、主要なビジネス コードの単体テストが含まれています。

我々はすでに知っている`AddItemToCartEventHandler`にコメントされたコードは、バグが存在する主な理由です。

我々は使用することができます`dotnet テスト`テスト プロジェクトで単体テストを実行すると、次の 2 つのエラーが表示されます。

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

間違った単体テストのコードの 1 つを見てみましょう。：

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

`AddItemToCartEventHandler`は、このテストの主要なテストコンポーネントであり、stateData と event は手動で構築されているため、開発者は必要に応じてテストする必要があるシナリオを簡単に構築できます。特別な何かを構築する必要はありません。

今、ちょうど次の`AddItemToCartEventHandler`コメントされたコードの段落は復元され、単体テストが再実行されます。単体テストが合格しました。バグも自然に修正されました。

もちろん、シーンの削除に関する別の単体テストも失敗しました。開発者は、上記の「ブレークポイント」と「単体テスト」の考え方に従って、この問題を修正できます。

## データは永続化されました。

Backend Server と Web を再起動すると、以前に操作したデータが永続化されていることがわかります。

今後の章で詳しく解説します。

## 小結び目

この記事では、単純なショッピング カート シナリオを実装するための基本的なプロジェクト フレームワークを作成する方法について説明します。

詳しく説明する必要はない：プロジェクト構造、展開、永続化など。あなたはさらに、次の記事を読むことができます。
