---
date: 2020-06-01
title: 談反應式程式設計在服務端中的應用，資料庫操作優化，從20秒到0.5秒
---

反應式程式設計在用戶端程式設計當中的應用相當廣泛，而當前在服務端中的應用相對被提及較少。本篇將介紹如何在服務端程式設計中應用回應時程式設計來改進資料庫操作的性能。

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## 開篇就是結論

利用 System.Reactive 配合 TaskCompleteSource ，可以將分散的單次資料庫插入請求合併會一個批量插入的請求。在確保正確性的前提下，實現資料庫插入性能的優化。

如果讀者已經瞭解了如何操作，那麼剩下的內容就不需要再看了。

## 預設條件

現在，我們假設存在這樣一個 Repository 介面來表示一次資料庫的插入操作。

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

接下來，我們在不改變該介面簽名的前提下，體驗一下不同的實現帶來的性能區別。

## 基礎版本

首先是基礎版本，採用的是最為常規的單次資料庫`INSERT`操作來完成數據的插入。本示例採用的是`SQLite`作為演示資料庫，方便讀者自行實驗。

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

常規操作。其中`_database. InsertOne（item）`的具體實現就是調用了一次`INSERT`。

基礎版本在同時插入小於 20 次時基本上可以較快的完成。但是如果數量級增加，例如需要同時插入一萬條資料庫，將會花費約 20 秒鐘，存在很大的優化空間。

## TaskCompleteSource

TaskCompleteSource 是 TPL 庫中一個可以生成一個可操作 Task 的類型。[對於 TaskCompleteSource 不太熟悉的讀者可以通過該實例代碼瞭解](https://github.com/newbe36524/Newbe.Demo/tree/feature/reactive/src/BlogDemos/Newbe.Tasks/Newbe.Tasks)。

此處也簡單解釋一下該物件的作用，以便讀者可以繼續閱讀。

對於熟悉 javascript 的朋友，可以認為 TaskCompleteSource 相當於 Promise 物件。也可以相當於 jQuery 當中的 \$. Deferred 。

如果都不瞭解的朋友，可以聽一下筆者吃麻辣燙時想到的生活化例子。

| 吃麻辣燙                      | 技術解釋                           |
| ------------------------- | ------------------------------ |
| 吃麻辣燙之前，需要先用盤子夾菜。          | 構造參數                           |
| 夾好菜之後，拿到結帳處去結帳            | 調用方法                           |
| 收銀員結帳完畢之後，會得到一個叫餐牌，會響鈴的那種 | 得到一個 Task 返回值                  |
| 拿著菜牌找了一個位子坐下，玩手機等餐        | 正在 await 這個 Task ，CPU 轉而處理其他事情 |
| 餐牌響了，去取餐，吃起來              | Task 完成，await 節數，繼續執行下一行代碼     |

那麼 TaskCompleteSource 在哪兒呢？

首先，根據上面的例子，在餐牌響的時候，我們才會去取餐。那麼餐牌什麼時候才會響呢？當然是服務員手動按了一個在櫃檯的手動開關才觸發了這個響鈴。

那麼，櫃檯的這個開關，可以被技術解釋為 TaskCompleteSource 。

餐台開關可以控制餐牌的響鈴。同樣， TaskCompleteSource 就是一種可以控制 Task 的狀態的物件。

## 解決思路

有了前面對 TaskCompleteSource 的了解，那麼接下來就可以解決文章開頭的問題了。思路如下：

當調用 InsertData 時，可以建立一個 TaskCompleteSource 以及 item 的元組。為了方便說明，我們將這個元組命名為`BatchItem`。

將 BatchItem 的 TaskCompleteSource 對應的 Task 返回出去。

調用 InsertData 的代碼會 await 返回的 Task，因此只要不操作 TaskCompleteSource ，調用者就一會一直等待。

然後，另外啟動一個線程，定時將 BatchItem 佇列消費掉。

這樣就完成了單次插入變為批量插入的操作。

筆者可能解釋的不太清楚，不過以下所有版本的代碼均基於以上思路。讀者可以結合文字和代碼進行理解。

## ConcurrentQueue 版本

基於以上的思路，我們採用 ConcurrentQueue 作為 BatchItem 佇列進行實現，代碼如下（代碼很多，不必糾結，因為下面還有更簡單的）：

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
            // 啟動一個 Task 消費佇列中的 BatchItem
            _batchInsertDataTask = Task.Factory.StartNew（RunBatchInsert， TaskCreationOptions.LongRunning）;
            _batchInsertDataTask.ConfigureAwait(false);
        }

        public Task<int> InsertData（int item）
        {
            // 生成 BatchItem ，將物件放入佇列。傳回 Task 出去
            var taskCompletionSource = new TaskCompletionSource<int>（）;
            _queue. Enqueue(new BatchItem
            {
                Item = item,
                TaskCompletionSource = taskCompletionSource
            });
            return taskCompletionSource.Task;
        }

        // 從佇列中不斷獲取 BatchItem ，並且一批一批插入資料庫，更新 TaskCompletionSource 的狀態
        private void RunBatchInsert（）
        {
            foreach （var batchItems in GetBatches（））
            {
                try
                {
                    BatchInsertData（batchItems）. Wait();
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
                // 呼叫資料庫的批次插入操作
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

## 正片開始！

接下來我們使用 System.Reactive 來改造上面較為複雜的 ConcurrentQueue 版本。如下：

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
            // 將請求進行分組，每50毫秒一組或者每100個一組
            _subject. Buffer(TimeSpan.FromMilliseconds(50), 100)
                . Where（x => x.Count > 0）
                // 將每組資料呼叫批次插入，寫入資料庫
                . Select(list => Observable.FromAsync(() => BatchInsertData(list)))
                . Concat()
                . Subscribe();
        }

        // 這裡和前面對比沒有變化
        public Task<int> InsertData（int item）
        {
            var taskCompletionSource = new TaskCompletionSource<int>（）;
            _subject. OnNext(new BatchItem
            {
                Item = item,
                TaskCompletionSource = taskCompletionSource
            });
            return taskCompletionSource.Task;
        }

        // 這段和前面也完全一樣，沒有變化
        private async Task BatchInsertData（IEnumerable<BatchItem> items）
        {
            var batchItems = items as BatchItem[] ？？ items. ToArray();
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

代碼減少了 50 行，主要原因就是使用 System.Reactive 中提供的很強力的 Buffer 方法實現了 ConcurrentQueue 版本中的複雜的邏輯實現。

## 老師，可以更給力一點嗎？

我們，可以"稍微"優化一下代碼，將 Buffer 以及相關的邏輯獨立於"資料庫插入"這個業務邏輯。那麼我們就會得到一個更加簡單的版本：

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

其中 IBatchOperator 等代碼，讀者可以到代碼庫中進行查看，此處就不在陳列了。

## 性能測試

基本可以測定如下：

在 10 條數據併發操作時，原始版本和批量版本沒有多大區別。甚至批量版本在數量少時會更慢，畢竟其中存在一個最大 50 毫秒的等待時間。

但是，如果需要批量操作併發操作一萬條數據，那麼原始版本可能需要消耗 20 秒，而批量版本僅僅只需要 0.5 秒。

> [所有的範例代碼均找到](https://github.com/newbe36524/Newbe.Demo)。如果 Github Clone 存在困難，[也可以點擊此處從 Gitee 進行 Clone](https://gitee.com/yks/Newbe.Demo)

<!-- md Footer-Newbe-Claptrap.md -->
