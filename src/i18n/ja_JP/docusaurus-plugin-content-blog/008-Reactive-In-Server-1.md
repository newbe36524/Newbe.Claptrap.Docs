---
date: 2020-06-01
title: サービス側でのリアクション プログラミングの適用、データベース操作の最適化、20 秒から 0.5 秒まで
---

リアクティブ プログラミングは、クライアント プログラミングで非常に広く使用されていますが、サービス側での現在のアプリケーションは比較的少ないです。この記事では、サービス側プログラミングで応答を適用するときにプログラミングして、データベース操作のパフォーマンスを改善する方法について説明します。

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## 始まりは結論です

System.Reactive を TaskCompleteSource と組み合わせて使用すると、分散した単一データベース挿入要求を 1 つの一括挿入要求にマージできます。正確性を確保しながら、データベース挿入のパフォーマンスを最適化します。

読者は、すでにその方法を理解している場合、残りはもう見る必要はありません。

## プリセット条件

次に、データベースの挿入操作を表す Repository インターフェイスがあるとします。

```csharp
namespace Newbe.RxWorld.DatabaseRepository
{
    public interface IDatabaseRepository
    {
        /// <summary>
        /// Insert one item and return total count of data in database
        /// </summary>
        /// <param name="item"></param>
        /// <returns></returns>
        Task<int> InsertData(int item);
    }
}
```

次に、インターフェイスのシグネチャを変更せずに、実装によってもたらされるパフォーマンスの違いを体験します。

## 基になるバージョン

まず、最も一般的な単一データベースを使用して、INSERT`操作を実行して`を完了する基本バージョンです。この例では、`SQLite`をデモ データベースとして使用し、読者が自分で実験できるようにしています。

```csharp
namespace Newbe.RxWorld.DatabaseRepository.Impl
{
    public class NormalDatabaseRepository : IDatabaseRepository
    {
        private readonly IDatabase _database;

        public NormalDatabaseRepository(
            IDatabase database)
        {
            _database = database;
        }

        public Task<int> InsertData(int item)
        {
            return _database. InsertOne(item);
        }
    }
}
```

一般的な操作。そのうち`_database。 InsertOne(item)`の具体的な実装は、 INSERT を呼び`呼び出`。

基になるバージョンは、同時に 20 回未満を挿入すると、基本的に高速に実行できます。ただし、10,000 のデータベースを同時に挿入する必要があるなど、大きな増加は、約 20 秒かかる可能性があり、最適化の余地は大きくなります。

## TaskCompleteSource

TaskCompleteSource は、TPL ライブラリで操作可能な Task を生成できる型です。[TaskCompleteSource にあまり馴染みのない読者は、このインスタンス コードを使用して](https://github.com/newbe36524/Newbe.Demo/tree/feature/reactive/src/BlogDemos/Newbe.Tasks/Newbe.Tasks)。

また、読者が読み続けできるように、オブジェクトの動作について簡単に説明します。

Javascript に詳しい友人にとって、TaskCompleteSource は Promise オブジェクトに相当すると考えることができます。jQuery の \$に相当します。 Deferred 。

友達がわからなかったら、筆者がスパイシーなホットポテトを食べるときに思い浮かぶ生活化の例を聞いてみましょう。

| スパイシーなホットを食べる                     | 技術的な説明                               |
| --------------------------------- | ------------------------------------ |
| スパイシーなホットを食べる前に、プレートで皿を挟む必要があります。 | コンストラクション パラメーター                     |
| 皿を挟んだら、チェックアウトに持って行きます            | メソッドを呼び出します                          |
| レジ係がチェックアウトすると、カードが鳴ります           | Task 戻り値を取得します                       |
| 野菜の看板を持って、座って、携帯電話で食事をする席を見つける    | await の Task では、CPU は他の処理に転じています     |
| 食事の看板が鳴って、食べ物を取りに行き、食べました         | Task 完了、await セクション数、コードの次の行に進んでください |

TaskCompleteSource はどこにありますか?

まず、上記の例によると、食事プレートが鳴ったときにのみ、私たちは食事を取りに行きます。では、プレートはいつ鳴るのでしょうか?もちろん、ウェイターがカウンターで手動スイッチを手動で押すと、ベルが鳴ります。

さて、カウンターのこのスイッチは、技術的にはTaskCompleteSourceとして解釈することができます。

ダイニングテーブルスイッチは、プレートのリングを制御することができます。同様に、TaskCompleteSource は Task の状態を制御するオブジェクトです。

## アイデアを解決します

TaskCompleteSource の以前の知識があれば、記事の冒頭で問題を解決できます。考え方は次の通りです：

InsertData が呼び出されると、TaskCompleteSource と item のタプルを作成できます。説明の便宜上、このタプルに "BatchItem" という`を付`。

BatchItem の TaskCompleteSource に対応する Task を返します。

InsertData を呼び出すコードは await によって返される Task であるため、TaskCompleteSource を操作しない限り、呼び出し元は待機します。

その後、別のスレッドが開始され、BatchItem キューが定期的に消費されます。

これで、1 回の挿入から一括挿入への操作が完了します。

著者は、以下のコードのすべてのバージョンは、上記の考え方に基づいているが、あまり明確に説明していない可能性があります。読者は、テキストとコードを組み合わせて理解することができます。

## ConcurrentQueue のバージョン

以上の考え方に基づいて、BatchItem キューとして ConcurrentQueue を実装し、コードは次のように実装されます (コードが多く、以下の方が単純であるため、もつれする必要はありません)：

```csharp
namespace Newbe.RxWorld.DatabaseRepository.Impl
{
    public class ConcurrentQueueDatabaseRepository : IDatabaseRepository
    {
        private readonly ITestOutputHelper _testOutputHelper;
        private readonly IDatabase _database;
        private readonly ConcurrentQueue<BatchItem> _queue;

        // ReSharper disable once PrivateFieldCanBeConvertedToLocalVariable
        private readonly Task _batchInsertDataTask;

        public ConcurrentQueueDatabaseRepository(
            ITestOutputHelper testOutputHelper,
            IDatabase database)
        {
            _testOutputHelper = testOutputHelper;
            _database = database;
            _queue = new ConcurrentQueue<BatchItem>();
            // Task コンシューマ キューの BatchItem
            _batchInsertDataTask = Task.Factory.StartNew(RunBatchInsert, TaskCreationOptions.LongRunning);
            _batchInsertDataTask.ConfigureAwait(false);
        ]

        public Task<int> InsertData(int item)
        {
            // を使用して BatchItem を生成し、オブジェクトをキューに入れます。Task に戻る
            var taskCompletionSource = new TaskCompletionSource<int>();
            _queue. Enqueue(new BatchItem
            {
                Item = item,
                TaskCompletionSource = taskCompletionSource
            });
            return taskCompletionSource.Task;
        )

        // キューから BatchItem を継続的に取得し、TaskCompletionSource の状態を更新するバッチをデータベースに挿入します
        private void RunBatchInsert()
        {
            foreach (var batchItems in GetBatches())
            {
                try
                {
                    BatchInsertData(batchItems))。 Wait();
                }
                catch (Exception e)
                {
                    _testOutputHelper.WriteLine($"there is an error : {e}");
                }
            }

            IEnumerable<IList<BatchItem>> GetBatches()
            {
                var sleepTime = TimeSpan.FromMilliseconds(50);
                while (true)
                {
                    const int maxCount = 100;
                    var oneBatchItems = GetWaitingItems()
                        . Take(maxCount)
                        . ToList();
                    if (oneBatchItems.Any())
                    {
                        yield return oneBatchItems;
                    }
                    else
                    {
                        Thread.Sleep(sleepTime);
                    }
                }

                IEnumerable<BatchItem> GetWaitingItems()
                {
                    while (_queue. TryDequeue(out var item))
                    {
                        yield return item;
                    }
                }
            }
        }

        private async Task BatchInsertData(IEnumerable<BatchItem> items)
        {
            var batchItems = items as BatchItem[] ?? items. ToArray();
            try
            {
                // 呼び出しデータベースの一括挿入操作
                var totalCount = await _database。 InsertMany(batchItems.Select(x => x.Item));
                foreach (var batchItem in batchItems)
                {
                    batchItem.TaskCompletionSource.SetResult(totalCount);
                }
            }
            catch (Exception e)
            {
                foreach (var batchItem in batchItems)
                {
                    batchItem.TaskCompletionSource.SetException(e);
                }

                throw;
            }
        }

        private struct BatchItem
        {
            public TaskCompletionSource<int> TaskCompletionSource { get; set; }
            public int Item { get; set; }
        }
    }
}
```

## 正の映画が始まります!

次に、System.Reactive を使用して、上記のより複雑なバージョンの ConcurrentQueue を刷新します。以下の通り：

```csharp
namespace Newbe.RxWorld.DatabaseRepository.Impl
{
    public class AutoBatchDatabaseRepository : IDatabaseRepository
    {
        private readonly ITestOutputHelper _testOutputHelper;
        private readonly IDatabase _database;
        private readonly Subject<BatchItem> _subject;

        public AutoBatchDatabaseRepository(
            ITestOutputHelper testOutputHelper,
            IDatabase database)
        {
            _testOutputHelper = testOutputHelper;
            _database = database;
            _subject = new Subject<BatchItem>();
            // 要求を 50 ミリ秒ごとにグループ化するか、100
            _subject。 Buffer(TimeSpan.FromMilliseconds(50), 100)
                . Where(x => x.Count > 0)
                // は、データ・セットごとに一括挿入を呼び出し、データベース
                . Select(list => Observable.FromAsync(() => BatchInsertData(list)))
                . Concat()
                . Subscribe();
        }

        // ここと前との比較は変わっていません
        public Task<int> InsertData(int item)
        {
            var taskCompletionSource = new TaskCompletionSource<int>();
            _subject. OnNext(new BatchItem
            {
                Item = item,
                TaskCompletionSource = taskCompletionSource
            });
            return taskCompletionSource.Task;
        }

        // これは前とまったく同じですが、変更はありません
        private async Task BatchInsertData(IEnumerable<BatchItem> items)
        {
            var batchItems = items as BatchItem[] ?items. ToArray();
            try
            {
                var totalCount = await _database. InsertMany(batchItems.Select(x => x.Item));
                foreach (var batchItem in batchItems)
                {
                    batchItem.TaskCompletionSource.SetResult(totalCount);
                }
            }
            catch (Exception e)
            {
                foreach (var batchItem in batchItems)
                {
                    batchItem.TaskCompletionSource.SetException(e);
                }

                throw;
            }
        }

        private struct BatchItem
        {
            public TaskCompletionSource<int> TaskCompletionSource { get; set; }
            public int Item { get; set; }
        }
    }
}
```

コードが 50 行削減された主な理由は、System.Reactive で提供される強力な Buffer メソッドを使用して、ConcurrentQueue バージョンの複雑なロジック実装を実装した結果です。

## 先生、もっと力を与えていただけますか。

コードを "少し" 最適化し、Buffer と関連するロジックを "データベース挿入" ビジネス ロジックから独立して挿入できます。その後、我々はより単純なバージョンを取得します：

```csharp
namespace Newbe.RxWorld.DatabaseRepository.Impl
{
    public class FinalDatabaseRepository : IDatabaseRepository
    {
        private readonly IBatchOperator<int, int> _batchOperator;

        public FinalDatabaseRepository(
            IDatabase database)
        {
            var options = new BatchOperatorOptions<int, int>
            {
                BufferTime = TimeSpan.FromMilliseconds(50),
                BufferCount = 100,
                DoManyFunc = database. InsertMany,
            };
            _batchOperator = new BatchOperator<int, int>(options);
        }

        public Task<int> InsertData(int item)
        {
            return _batchOperator.CreateTask(item);
        }
    }
}
```

IBatchOperator などのコードは、読者がコード ベースで参照できる場所であり、ここでは表示されません。

## パフォーマンス テスト

基本的には、次のように測定できます：

元のバージョンと一括バージョンは、10 のデータ同時操作で大きな違いはありません。バルク バージョンでも、最大 50 ミリ秒の待機時間が存在する限り、数が少ない場合は遅くなります。

ただし、10,000 のデータを同時に操作するバッチ操作が必要な場合は、元のバージョンでは 20 秒、一括バージョンでは 0.5 秒しかかかりません。

> [サンプル コードはすべて、コード ベースに](https://github.com/newbe36524/Newbe.Demo)。Github Clone に問題がある場合は、[Gitee から Clone をダウンロードするには、ここをクリック](https://gitee.com/yks/Newbe.Demo)

<!-- md Footer-Newbe-Claptrap.md -->
