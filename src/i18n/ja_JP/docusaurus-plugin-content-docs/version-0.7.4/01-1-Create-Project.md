---
title: '第一歩ーショッピングモールの作成を。'
description: '第一歩ーショッピングモールの作成を。'
---

オンラインで済むような「電気 Newbe.Claptrap を使って開発する方法」をいくつか見ていきましょう。

<!-- more -->

## 必要なビジネス

Education Edition のシンプルな「ビジネス・カート」を行うためのシンプルな「サービス」を実装します：

- 現在のカート内の商品と個数をフェッチします
- 商品をカートに追加
- カートから指定した製品を削除

## プロジェクトテンプレートをインストール

まず、あなたが.NetCore SDK 3.1 がインストールされていることを確認する必要があります。[最新バージョンはこちらで入手できます。](https://dotnet.microsoft.com/download)

SDK のインストール完了後、以下コンソールでプロジェクトテンプレートをインストールします：

```bash
dotnet-new - Newbe.Classptrap.Template
```

インストール後、既にインストールされているプロジェクトテンプレートを確認できます。

![newbe.claptrap.templateのインストール完了](/images/20200709-001.png)

## プロジェクトを作成

場所を選択するためにディレクトリを作成しましょう。この例では、`D:\Repo`以下`Helloクラス`フォルダを作成してください。このフォルダーは、プロジェクトのコードとして新しいフォルダーになります。

コンソールを開き、作業ディレクトリを`D:\Repo\HelloClaptrap` に切り替えます。次に、次のコマンドを実行すると、それをプロジェクトが作成できます：

```bash
dotnet new newbe.claptrap --name HelloClaptrap
```

> 一般的に言えば、`D:\Repo\Helloクラップ`を Git のリポジトリフォルダとして作成することをお勧めします。バージョン管理によるソースコードを管理します。

## ビルドと起動

プロジェクト作成が完了した後は、好きな IDE を使用してソリューションをコンパイルします。

ビルド完了後、IDE で起動してWeb と BackendServer の2つのプロジェクトを実行します。(VSはコンソールのサービスとして起動する必要があり、IIS Expressを使用するにはデベロッパーにこのポート番号を参照してください)

起動時に、`http://localhost:365/swagger`アドレスをを介してサンプルプロジェクトの一覧を見ることができます。これらのうち、3 つの主要なAPIを含む：

- `GET` `/api/Cart/{id}` 特定のid カート内の商品と数量を取得する
- `POST` `/api/Cart/{id}` 指定されたid に新規商品を追加。
- `DELETE` `/api/Cart/{id}` 指定した id カートからカートを削除します。

トルネードボタンは、インタフェース上で何回か呼び出せるようにしてください。

> - [複数のプロジェクトを同時起動する方法](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [複数のプロジェクトを同時に起動する方法](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [戻るとノブ マイナジーの間の移動速度](https://mirrors.huaweicloud.com/)

## 最初の商品を追加しました。不適格?

はい、そうでしょうか。プロジェクトテンプレート 実装は バグがあります。

次に、いくつかのバグからこれらのブレークポイントを取得してそれをランク付けして問題を解決しましょう。

さらに、バグの場所を特定することで、フレームワークのコードの転送について学習することができます。

## ブレークポイントを追加

ここに、 IDE の指示に従って、ブレークポイントを設置してください。あなたの既存のIDE から操作できます。

現時点での頭はIDEがない場合は、このセクションをスキップすることで、背後にあるものを直接読むことができます。

### Visual Studio

前記のブートスタイルで同時に2 つのプロジェクトを開始します。

导入断点：打开“断点”窗口，点击按钮，从项目下选择`breakpoints.xml`文件。下記の２つのスクリーンショットを撮ることで対応する操作を行うことができます。

![Open Breakpoints Winindow](/images/20200709-002.png)

![Import Breakpoints](/images/20200709-003.png)

### Rider

前記のブートスタイルで同時に2 つのプロジェクトを開始します。

Riderにブレークポイントでインポート機能がありません。このため、以下のスロットに ブレークポイント を作成します：

| ファイル                      | 行番号 |
| ------------------------- | --- |
| CartController            | 30  |
| CartController            | 34  |
| CartGrain                 | 24  |
| CartGrain                 | 32  |
| AddItemToCartEventHandler | 14  |
| AddItemToCartEventHandler | 28  |

> [GoTo Fileを使って素早くファイルの場所を管理できます。](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## デバッグを開始

つぎに、１つずつ実行してコード実行のプロセスを学べます。

まず、swagger インタフェースからPOSTリクエストを送り、新しい商品をカートに追加しようとしています。

### CartController Start

最初に web API レイヤーコード： で干渉する

```cs
[HttpPost("{id}")]
public async Task<IActionResult> AddItemAsync(int id, [FromBody] AddItemInput input)
{
    var cartGrain = _grainFactory.GetGrain<ICartGrain>(id.ToString());
    var items = await cartGrain.AddItemAsync(input.SkuId, input.Count);
    return Json(items);
}
```

このスニペットでは、`_grainFactory`から作成して`ICartGrain`インスタンスを作成します。

このインスタンスはエージェントで、Backend Server 内にある Grain（Grain）どちらかを指すプロキシです。

受信した id は、インスタンス内で一意な識別子として識別できます。このビジネスコンテキスト内では、「カートID」もしくは「カートID」あるいは「ユーザid」になりましょう.

まずデバッグを続けて下さい ICartGrain の内部はどう働きます

### CartGrain Start

次のブレークポイントを果たすまでのポイントは CartGrain コード：

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

ここからフレームワークが実装されるコアです。以下の図に示す鍵：

![Claptrap](/images/20190228-001.gif)

具体的にはビジネスに述べています。コードは特定のカートオブジェクトを既に実行しています。

デバッガで渡されたskuIdとcountyは、Controller から引数として渡されます。

ここで以下の操作を完了できます：

- クラップでのデータ変更（Claptrap でのデータ）
- Claptrap から保存されたデータの読み込み

このコードでは、カートに対する変更を表す`AddItemToCartEvent`オブジェクトを作成します。

そしてそれをClaptrap に渡して処理します

クラプターの承認後、state は自身の state データを更新します。

直近に私たちは state Data.Items を呼び出すようになりました。(事実StateData.Items は Claptrap.State.Data.Items のショートカットです実際にはまだ Claptrap から読み込まれている必要があります)

デバッガーを使う場合、私は state のデータ型のデータ型がわかります：

```cs
class CartState : IStateデータ
{
    { public Dictionary<string, int> Items { get; set; }
}
```

サンプルのデザインのカートの状態です`Dictionary`を使用してこのカート内のSkuIdとその関連数を示すためのものです。

デバッグ作業を続け、次に，Claptrapが受信するイベントの出力について見てみましょう。

### AddItemToCartEventHandler Start

再ヒットポイントは、以下のコードの一部です：

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

ビジネス要件に従って、ユーザーの状態にあるDictionaryを表示して数を更新してください。

このプログラムをデバッグして最後の実行に移します。

この時点では、デバッガを使うことで、stateData.Itemsformat@@1 が辞書に追加されることがあります。しかし数量は 0 です。なぜかというと 注記されている `else コード段が原因で 常にカートに追加されたが未だに 決定的なものだからです

ここでは すぐにテストを終了しませんパズルを完了したら、コード全体をどのように終えたのか進めましょう。

これを続けると、ブレークポイントは次の時間で終わり、CartGrain と CartController間のメソッドの最後尾になります。

## これが三階構造です

優れた開発者は様々な階調のメカニズムを解明した。Newbe.Claptrap とは 三つの層構造だと教えてくれますこのフォームをひとつ付ければ、この比較してみましょう：

| 従来型三階                | Newbe.Claptrap | 説明                                              |
| -------------------- | -------------- | ----------------------------------------------- |
| Presenation バナー      | Controller     | 外部から対するシステムを用いた，外部への相互運用性                       |
| Business ビジネスレイヤー    | Grain レイヤー     | ビジネス パラメータをビジネスとして扱う (サンプルに書いては書かない限りは評価され > 0) |
| Persistence Locale | | EventHandler 層 | ビジネス結果の更新                                       |

上記の類似は単純なもので具体的には理解するのに難しすぎて 理解できる用語です

## 修正が必要なバグがあります。

これまでの商品への最初の参加不有効でない問題を修正しました。

### これはユニットテストのためのフレームワークです

プロジェクト テンプレートに新しいプロジェクト`HelloClaptrap.Actors.Tests`があるプロジェクトでは、そのプロジェクトはビジネスコードのユニットテストを含んでいます。

`AddItemToCartEventHandler`のグローバルコードの変換が、BUGにとって大きな原因となることでしょう。

`dotnette`を使用してプロジェクトの中のユニットテストを実行すると、次の2つのエラーを取得できます。

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

単体テストコードの一つ一つの例を見てみましょう：

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

`AddItemToCartEventHandler`は、主となるテストコンポーネントであり、stateData と event の両方が手動で構築されているため、開発者は事前テストが必要です。何も構築しない特別なコンテンツが必要です。

`AddItemToCartEventHandler`の項目をコメント文に復元するだけです。ユニットテストを再度実行してください。ユニットテストに合格しました。バグZは自然治癒の力を持たせました

しかし、シナリオを削除すること自体に点在する別なテストも失敗しました。開発者が見出しの「ブレークポイント」「ユニットテスト」のように手順を記載したものを修正することができます。

## データは永続的です

Backend Server と Webを再起動して、以前の作業データが永続的に保存されているでしょう。

さらに詳細な紹介文があります

## ミニ投稿

この章で、ベースプロジェクトのフレームワークを作成する方法を事前に理解し、カート環境のような単純な発想を実現します。

まだまだ詳しく：プロジェクト構造、展開、永続化など詳細な情報がありません。続きを読むための記事できるようになっています。
