---
date: 2020-06-28
title: サービス側でのリアクションプログラミングの適用、データベース操作の最適化、Upsertのスピードアップについて説明します
---

リアクティブ プログラミングは、クライアント プログラミングで非常に広く使用されていますが、サービス側での現在のアプリケーションは比較的少ないです。この記事では、サービス側プログラミングで応答を適用するときにプログラミングして、データベース操作のパフォーマンスを改善する方法について説明します。

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## 始まりは結論です

前回の[「サービス側でのリアクション プログラミングの適用、データベース操作の最適化、20 秒から 0.5 秒'」の](008-Reactive-In-Server-1)に続き、今回はリアクション プログラミングを使用した upsert 最適化のケース ノートを紹介します。読者は、この記事で紹介した方法を理解しやすくするために、前の記事を読むことをお勧めします。

また、バッチ化されたアイデアを使用して、個々の upsert 操作をバッチでマージすることもできます。データベース リンクの消費を削減し、パフォーマンスを大幅に向上させる目標を達成しました。

## ビジネス シナリオ

最近の1記事[同時オンラインのユーザー数のメモリが必要ですか？- Newbe.Classptrap フレームワーク水平拡張実験](003-How-Many-RAMs-In-Used-While-There-Are-One-Hundred-Thousand-Users-Online)メモリに常駐する複数の Claptrap をアクティブ化することで、JWT の正確性をすばやく検証します。

しかし、当時は技術的な問題が解決：

Newbe.Claptrap フレームワークは、プロパティを設計しました：Claptrap Deactive の場合、スナップショットをデータベースにすぐに保存するオプションがあります。したがって、クラスターからノードをシャットダウンしようとすると、ノードに多数の Claptrap が存在する場合、大量のデータベース upsert 操作が生成されます。データベースの消費を瞬時に押し上け、一部のエラーを引き起こして保存に失敗しました。

## 少しコード

前編の「IBatchOperator`を`すると、この記事に残されたコードの内容は最小限に抑えます。

まず、前の IBatchOperator を使用して、次のコードを参照して、操作をサポートする Repository を：

```cs
public class BatchUpsert : IUpsertRepository
{
    private readonly IDatabase _database;
    private readonly IBatchOperator<(int, int), int> _batchOperator;

    public BatchUpsert(IDatabase database)
    {
        _database = database;
        var options = new BatchOperatorOptions<(int, int), int>
        {
            BufferCount = 100,
            BufferTime = TimeSpan.FromMilliseconds(50),
            DoManyFunc = DoManyFunc
        };
        _batchOperator = new BatchOperator<(int, int), int>(options);
    }

    private Task<int> DoManyFunc(IEnumerable<(int, int)> arg)
    {
        return _database. UpsertMany(arg. ToDictionary(x => x.Item1, x => x.Item2));
    }

    public Task UpsertAsync(int key, int value)
    {
        return _batchOperator.CreateTask((key, value));
    }
}
```

この最適化は、データベースに対応する UpsertMany メソッドを実装する限り、適切に実行できます。

## さまざまなデータベースの操作

Newbe.Claptrap の現在のプロジェクトの実績を組み合わせます。現在、サポートされているデータベースには、SQLite、PostgreSQL、MySql、MongoDB があります。以下では、さまざまな種類のデータベースに対する一括 Upsert 操作について説明します。

Newbe.Claptrap プロジェクトの Upsert 要件は主キーを比較キーとして使用するため、この状況については以下で説明します。

### SQLite

公式ドキュメントによると、 `INSERT OR REPLACE INTO` を使用すると、主キーの競合時にデータを置き換える必要があります。

具体的なステートメント形式は、次の形式です：

```SQL
INSERT OR REPLACE INTO TestTable (id, value)
VALUES
(@id0,@value0),
...
(@idn,@valuen);
```

したがって、ステートメントと引数の呼び出しを直接スプライスするだけです。SQLite の渡し可能なパラメーターは既定で 999 に設定されているため、スプライスされた変数もその数より大きくする必要があります。

> [公式文書：INSERT](https://www.sqlite.org/lang_insert.html)

### PostgreSQL

PostgreSQLはバッチ処理で書き出せたら、データの高速のインポートはCOPY文に効果的に使用することができ、こちらが INSERT よりかなり速いです。でもON CONFLICT DO UPDATE 副句は COPYをサポートしていなかった。したがってCOPYではupsert の要求を満たすことはできません

そこで我々はINSERTの使用法を ON CONFLICT DO UPDAATE 句および unnest 関数の量アップsert を決めるようにしました。

具体的なステートメント形式は、次の形式です：

```SQL
INSERT INTO TestTable (id, value)
VALUES (unnest(@ids), unnest(@values))
ON CONFLICT ON CONSTRAINT TestTable_pkey
DO UPDATE SET value=excluded.value;
```

ids と values はそれぞれ 2 つの等長配列オブジェクトであり、unnest 関数は配列オブジェクトを行データの形式に変換します。

ON CONFLICT DO UPDATE command cannot affect row a second time エラーが発生することがあります。

したがって、上記のシナリオを使用する場合は、データベースを渡す前に、プログラムでやり直す必要があります。また、通常、プログラム内で 1 回の削除を行う場合、データベースへのデータの受信が減るのも理にかなっています。

> [ドキュメント：unnest 関数](https://www.postgresql.org/docs/9.2/functions-array.html) > [公式ドキュメント：Insert ステートメント](https://www.postgresql.org/docs/9.5/sql-insert.html)

### MySql

MySql は SQLite に似ていますが、`REPLACE` サポートしています。具体的なステートメントの形式は次のとおりです：

```sql
REPLACE INTO TestTable (id, value)
VALUES
(@id0,@value0),
...
(@idn,@valuen);
```

> [公式ドキュメント：REPLACE ステートメント](https://dev.mysql.com/doc/refman/8.0/en/replace.html)

### MongoDB

MongoDB は、bulkWrite の一括転送モードと replace の upsert 構文をネイティブにサポートしています。だから、操作は非常に簡単です。

次に、C# の動作を示します：

```cs
private async Task SaveManyCoreMany(
    IDbFactory dbFactory,
    IEnumerable<StateEntity> entities)
{
    var array = entities as StateEntity[] ?? entities. ToArray();
    var items = array
        . Select(x => new MongoStateEntity
        {
            claptrap_id = x.ClaptrapId,
            claptrap_type_code = x.ClaptrapTypeCode,
            version = x.Version,
            state_data = x.StateData,
            updated_time = x.UpdatedTime,
        })
        . ToArray();

    var client = dbFactory.GetConnection(_connectionName);
    var db = client. GetDatabase(_databaseName);
    var collection = db. GetCollection<MongoStateEntity>(_stateCollectionName);

    var upsertModels = items. Select(x =>
    {
        var filter = new ExpressionFilterDefinition<MongoStateEntity>(entity =>
            entity.claptrap_id == x.claptrap_id && entity.claptrap_type_code == x.claptrap_type_code);
        return new ReplaceOneModel<MongoStateEntity>(filter, x)
        {
            IsUpsert = true
        };
    });
    await collection. BulkWriteAsync(upsertModels);
}
```

これは、Newbe.Claptrap プロジェクトのビジネス シナリオから提供されるコードであり、読者は自分のニーズに合わせて変更できます。

> [公式文書：db.collection.bulkWrite()](https://docs.mongodb.com/manual/reference/method/db.collection.bulkWrite/#db.collection.bulkWrite)

### 汎用解法

最適化の本質は、データベース リンクの使用を減らし、1 つのリンク内でより多くの作業を行います。したがって、特定のデータベースが上記のデータベースと同様の操作をサポートしていない場合。では、汎用的な解法があります：

1. 一時テーブルにできるだけ速くデータを書き込みます
2. 一時テーブルのデータがテーブル update に接続されている方法で更新されるターゲット テーブル
3. 一時テーブルを削除します

> [UPDATE with a join](http://www.sql-workbench.eu/dbms_comparison.html)

## パフォーマンス テスト

たとえば、SQLite では、12345 データに対して 2 回 upsert 操作を実行してください。

1 つの同時：1 分 6 秒です

バッチ処理：2.9 秒です

[テストのコードは、このリンクにあります。](https://github.com/newbe36524/Newbe.Demo/blob/master/src/BlogDemos/Newbe.Rx/Newbe.RxWorld/Newbe.RxWorld/UpsertTest.cs)

MySql、PostgreSQL、および MongoDB のサンプルは、最適化の前に接続プールを改善せずにほぼ同時に爆発するため、サンプルには含まれていません。すべての最適化の結果、可用性の問題が直接解決されます。

> [サンプル コードはすべて、コード ベースに](https://github.com/newbe36524/Newbe.Demo)。Github Clone に問題がある場合は、[Gitee から Clone をダウンロードするには、ここをクリック](https://gitee.com/yks/Newbe.Demo)

## よく寄せられる質問

ここでは、いくつかの一般的な質問に対する回答を示します。

### クライアントは一括操作の結果を待機していますか。

これは、多くのネチズンによって提起された質問です。答えは：です。

ブラウザーによって呼び出されるインターフェイスとして WebApi を公開するとします。同時に 100 台のブラウザーが同時に要求を行う場合。

その後、100 の要求がマージされ、データベースに書き込まれます。これらのクライアントは、データベースに書き込むまでサービス側から応答を受け取り、待機します。

また、マージ スキームは、通常の "書き込みキュー、ポスト 書き込みライブラリ" スキームと区別されます。

### 原理的には、これはbulkcopyと何が違うのでしょうか?

両者は無関係であり、機能的な機能を持つ必要があります。 まず、コード内の database. InsertMany は、あなたが言及した bulkcopy です。

このコードの鍵は InsertMany ではなく、単一の挿入要求をマージする方法です。 bulkcopy の API を webapi で公開できるのを想像してください。 ただし、異なるクライアントからの要求を同じ API にマージして bulkcopy を呼び出す方法はありません。 たとえば、1 万のクライアントが API を呼び出しているとしますが、これらの API 要求を組み込むにはどうすればよいでしょうか。

上記の方法でこれを行う場合は、単一の挿入 API を外部に公開します。しかし、異なるクライアント要求からのマージを実装し、bulkcopy を使用できます。これは、高同時実行で理にかなっています。

また、Repository の InsertOne インターフェイスを変更していないが、bulkcopy インターフェイスの効果を実現しているので、これは開閉の原則 です。

### 一括操作で 1 つの操作が異常に失敗すると、マージされた他の操作はすべて失敗しますか。

ビジネス シナリオがマージの影響を受ける場合は、もちろんマージしないでください。

一括操作の失敗は、基になるデータベース トランザクションも必ず一緒に失敗するため、一緒に失敗します。

バルク インターフェイスが着信 ID ごとに異なる扱いもサポートしていない限り。通常、mongodb の bulkcopy がどの成功または失敗を返すかなど、Tcs の状態を異なる状態に設定できます。

どの合併が、何が合併しないかは、ビジネスに完全に依存します。サンプルは、マージする場合のマージ方法を示しています。すべてがマージされる必要はありません。

### インサートとUpsertは、DeleteとSelectについて何を言いましたか?

筆者は大まかにこのパターンを「反応式バッチ処理」と呼ぶ.ビジネス シナリオでパターンが適用されているかどうかを確認するには、次の 2 つの基本的な要件が必要です：

- ビジネスダウンストリームのバッチ処理が累積された 1 つの処理よりも高速かどうか
- ビジネス アップストリームで短時間の急増頻度の要求が発生するかどうか

もちろん、：下流のバッチ操作が各要求の結果を分割できるかどうかなど、考慮する必要があります。しかし、上記の2つの点は、考慮する必要があります。

Delete を例にとってみましょう：

- Delete Where In は Delete = よりも高速ですか?試してください
- デレットの需要は急増していますか?考えろ

## 小さなガジェットゼロ

著者は、完全なストアドプロシージャが書き込み可能な人ではありません。これらのデータベースにアクセスできるドキュメントは、Zeal という名前のオフライン ドキュメントで無料で表示できます。あなたにお勧めし、あなたも持っている価値がある。

![Zeal](/images/20200627-010.png)

Zeal の公式サイトのアドレス：<https://zealdocs.org/>

<!-- md Footer-Newbe-Claptrap.md -->
