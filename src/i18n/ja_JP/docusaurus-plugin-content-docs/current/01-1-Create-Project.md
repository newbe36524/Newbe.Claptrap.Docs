---
title: '最初のステップ - 簡単なショッピングカートを実装するアイテムを作成します'
description: '最初のステップ - 簡単なショッピングカートを実装するアイテムを作成します'
---

Newbe.Claptrap を使用して開発する方法を理解するために、単純な "電子ショッピング カート" 要件を実装します。

<!-- more -->

## ビジネス ニーズ

単純な「電子ショッピングカート」の要件を実装し、ここでいくつかの簡単なビジネス：

- 現在のショッピング カート内のアイテムと数量を取得します
- ショッピング カートにアイテムを追加します
- ショッピング カートから特定のアイテムを削除します

## プロジェクト テンプレートをインストールします

まず、. NetCore SDK 3.1 。[をクリックすると、インストールする最新バージョンの](https://dotnet.microsoft.com/download)。

SDK のインストールが完了したら、コンソールを開いて次のコマンドを実行して、最新のプロジェクト テンプレートをインストールします：

```bash
dotnet new --install Newbe.Claptrap.Template
```

インストールが完了したら、インストール結果に既にインストールされているプロジェクト テンプレートを表示できます。

![newbe.claptrap.templateのインストールが完了しました](/images/20200709-001.png)

## プロジェクトを作成します

場所を選択してフォルダを作成し、この例では、`D:\Repo`の下に`HelloClaptrap`という名前のフォルダを作成します。このフォルダは、新しいプロジェクトのコード フォルダとして機能します。

コンソールを開き、作業ディレクトリを`D:\Repo\HelloClaptrap に切り替`。次に、次のコマンドを実行して、プロジェクトの：

```bash
dotnet new newbe.claptrap --name HelloClaptrap
```

> 一般に、`D:\Repo\HelloClaptrap`Git リポジトリ フォルダとして作成します。バージョン管理でソースを管理します。

## コンパイルと起動

プロジェクトの作成が完了したら、お気に入りの IDE でソリューションを開いてコンパイルできます。

コンパイルが完了したら、IDE のスタートアップ機能を使用して、Web プロジェクトと BackendServer プロジェクトの両方を起動します。(VS はコンソールでサービスを開始する必要があり、IIS Express を使用している場合は、開発者が Web ページにアクセスするために対応するポート番号を確認する必要があります)

起動が完了したら、サンプル`http://localhost:36525/swagger`を使用してサンプル プロジェクトの API の説明を表示できます。これには、3 つの主要な API アプリケーションが：

- `GET` `/api/Cart/{id}` 特定の id ショッピング カート内のアイテムと数量を取得します
- `POST` `/api/Cart/{id}` 指定した id の購入に新しいアイテムを追加します
- `DELETE` `/api/Cart/{id}` 指定された id のショッピング カートから特定のアイテムを削除します

インターフェイスの Try It Out ボタンを使用して、API へのいくつかの呼び出しを試すことができます。

> - [VS で複数のプロジェクトを同時に開始する方法](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [ライダーで同時に複数のプロジェクトを開始する方法](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Huawei クラウドを使用して nuget の復元を高速化します](https://mirrors.huaweicloud.com/)

## 初めて商品を追加する場合、効果はありませんか?

はい、あなたは正しいです。プロジェクト テンプレートのビジネス実装にバグがあります。

次に、プロジェクトを開き、ブレークポイントを追加してバグのトラブルシューティングと解決を行います。

また、BUG をターゲットにすると、フレームワークのコード フロー プロセスを理解できます。

## ブレークポイントを追加します

以下は、IDE の説明に応じてブレークポイントを増やす必要がある場所に応じて、慣れ慣れた IDE を選択して操作できます。

現在 IDE がない場合は、このセクションをスキップして、後で直接読むこともできます。

### Visual Studio

上記のスタートアップ方法に従って、両方のプロジェクトを同時に開始します。

ブレークポイントのインポート：[ブレークポイント] ウィンドウを開き、ボタンをクリックして、プロジェクトの下から`breakpoints ファイル.xml`します。対応するアクションの場所は、次の 2 つのスクリーンショットで確認できます。

![Open Breakpoints Window](/images/20200709-002.png)

![Import Breakpoints](/images/20200709-003.png)

### Rider

上記のスタートアップ方法に従って、両方のプロジェクトを同時に開始します。

現在、Rider にはブレークポイントのインポート機能はありません。したがって、ブレークポイントを手動で作成する必要があります：

| ファイルです                    | 行番号 |
| ------------------------- | --- |
| CartController            | 30  |
| CartController            | 34  |
| CartGrain                 | 24  |
| CartGrain                 | 32  |
| AddItemToCartEventHandler | 14  |
| AddItemToCartEventHandler | 28  |

> [Go To File を使用すると、ファイルの場所をすばやく見つめ替えます](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## デバッグを開始します

次に、要求を使用して、コード全体の実行プロセスについて説明します。

まず、swagger インターフェイスを使用して POST 要求を送信し、ショッピング カートにアイテムを追加します。

### CartController Start

最初のブレーク ポイントは、Web API 層の Controller コード：

```cs
[HttpPost("{id}")]
public async Task<IActionResult> AddItemAsync(int id, [FromBody] AddItemInput input)
{
    var cartGrain = _grainFactory.GetGrain<ICartGrain>(id.ToString());
    var items = await cartGrain.AddItemAsync(input.SkuId, input.Count);
    return Json(items);
}
```

このコードでは、`_grainFactory`を使用して iCartGrain`インスタンスを`します。

このインスタンスの本質は、Backend Server の特定の Grain を指すプロキシです。

渡された id は、一意の識別子を使用するアンカー インスタンスと見なすことができます。このビジネス コンテキストでは、"ショッピング カート ID" または "ユーザー ID" と理解できます (ユーザーごとに 1 つのショッピング カートがある場合)。

デバッグに進み、次のステップに進み、ICartGrain 内部がどのように機能するかを見てみましょう。

### CartGrain Start

次のブレーク ポイントは、CartGrain コード：

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

これは、次の図に示すように、フレームワークの実装の中心です：

![Claptrap](/images/20190228-001.gif)

ビジネスに関しては、コードは特定のショッピング カート オブジェクトに実行されています。

渡された skuId と count の両方が Controller から渡されたパラメーターであることをデバッガーで確認できます。

ここでは、次の操作を実行できます：

- イベントを使用して Claptrap のデータを変更します
- Claptrap に保存されているデータを読み取ります

このコードでは、ショッピング カートへの`を表す`AddItemToCartEvent オブジェクトを作成しました。

その後、処理のために Claptrap に渡されます。

Claptrap はイベントを受け入れた後、独自の State データを更新します。

最後に、StateData.Items を呼び出し元に返します。(実際には、StateData.Items は Claptrap.State.Data.Items のショートカット プロパティです)。したがって、実際には Claptrap から読み取られます。 ）

デバッガを使用すると、StateData のデータ型が次のようになります：

```cs
public class CartState : IStateData
{
    public Dictionary<string, int> Items { get; set; }
}
```

これは、サンプルで設計されたショッピング カートの状態です。Dictionary``を使用して、現在のショッピング カートの SkuId とそれに対応する数量を表します。

デバッグに進み、次の手順に進み、Claptrap が受信イベントをどのように処理するかを見てみましょう。

### AddItemToCartEventHandler Start

再びブレークポイントに命を落としたのは、次のコードです：

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

このコードには、現在のショッピング カートの状態を表す`CartState`と、処理する必要があるイベント`AddItemToCartEvent の 2 つの重要なパラメーター`。

ビジネス ニーズに基づいて、状態のディクショナリに SkuId が含まれているかどうかを判断し、その数を更新します。

デバッグを続行すると、コードはコードの最後まで実行されます。

この時点で、デバッガーを使用すると、stateData.Items というディクショナリが 1 つの項目を追加しますが、数は 0 になります。理由は、上記の else スニペットがコメントされているため、ショッピング カートを初めて追加すると常に失敗するバグの原因です。

ここでは、デバッグをすぐに中断しないでください。デバッグを続行し、コードを終了して、プロセス全体がどのように終了するかを理解します。

実際には、デバッグを続行すると、ブレークポイントは CartGrain と CartController の対応するメソッドのメソッドの末尾にヒットします。

## これは、実際には 3 層アーキテクチャです。

ほとんどの開発者は、3 層アーキテクチャを理解しています。実際、Newbe.Claptrap は 3 層アーキテクチャであるとも言えます。次に、テーブルを表で比較：

| 伝統的な3階建て                | Newbe.Claptrap    | 説明                                                                        |
| ----------------------- | ----------------- | ------------------------------------------------------------------------- |
| Presentation プレゼンテーション層 | Controller レイヤー   | 外部システムとのドッキングに使用され、外部相互運用性を提供します                                          |
| Business ビジネス層          | Grain レイヤー        | 着信ビジネス パラメータに基づいてビジネス処理を行う (サンプルでは実際には判断が書か付かいており、count > 0 を判断する必要があります) |
| Persistence 永続化レイヤー     | EventHandler レイヤー | ビジネスの結果を更新します                                                             |

もちろん、上記の類似性は簡単な説明です。特定のプロセスでは、あまりにも絡み合う必要はありませんが、これは理解を支援する声明です。

## また、修正するバグがあります

次に、前の「最初の参加が有効にならない」という以前の問題を修正するために戻ります。

### これは、単体テストを検討するためのフレームワークです

プロジェクト テンプレートには、主要なビジネス コードの単体テストを含むプロジェクト`HelloClaptrap.Actors.Tests`があります。

AddItemToCartEventHandler`コメントを含むコードが`の存在の主な原因であるのは、これでわかっています。

次の`dotnet test`を使用してテスト プロジェクトの単体テストを実行すると、次の 2 つのエラーが得られる可能性があります。

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

エラーが発生した単体テストのコードの 1 つを見てみましょう：

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

`AddItemToCartEventHandler`は、このテストの主要なテストのコンポーネントであり、stateData と event の両方が手動で構築されているため、開発者は必要に応じてテストするシナリオを簡単に構築できます。特別な何かを構築する必要はありません。

次に、addItemToCartEventHandler``のコメント付きコードの一部を復元して、単体テストを再実行します。単体テストに合格しました。BUG も自然に修正されました。

もちろん、削除シナリオに関する別の単体テストも失敗しました。開発者は、上記の「ブレークポイント」と「単体テスト」の線に沿って問題を修正できます。

## データは永続化されています

Backend Server と Web を再起動しようとすると、以前に操作したデータが永続的に保存されている場合があります。

詳細については、以降の章で説明します。

## 小さな結び目

この記事では、単純なショッピング カート シナリオを実装するための基本的なプロジェクト フレームワークを作成する方法について説明しました。

プロジェクト構造、展開、永続化：詳細な説明はありません。詳細については、次の記事を参照してください。
