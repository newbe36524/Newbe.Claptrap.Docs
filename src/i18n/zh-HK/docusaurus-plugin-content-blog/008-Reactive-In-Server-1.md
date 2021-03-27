---
date: 2020-06-01
title: 谈反应式编程在服务端中的应用，数据库操作优化，从20秒到0.5秒
---

反应式编程在客户端编程当中的应用相当广泛，而当前在服务端中的应用相对被提及较少。本篇将介绍如何在服务端编程中应用响应时编程来改进数据库操作的性能。

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## 开篇就是结论

利用 System.Reactive 配合 TaskCompleteSource ，可以将分散的单次数据库插入请求合并会一个批量插入的请求。在确保正确性的前提下，实现数据库插入性能的优化。

如果读者已经了解了如何操作，那么剩下的内容就不需要再看了。

## 预设条件

现在，我们假设存在这样一个 Repository 接口来表示一次数据库的插入操作。

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

接下来，我们在不改变该接口签名的前提下，体验一下不同的实现带来的性能区别。

## 基础版本

首先是基础版本，采用的是最为常规的单次数据库`INSERT`操作来完成数据的插入。本示例采用的是`SQLite`作为演示数据库，方便读者自行实验。

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
            return _database.InsertOne(item);
        }
    }
}
```

常规操作。其中`_database.InsertOne(item)`的具体实现就是调用了一次`INSERT`。

基础版本在同时插入小于 20 次时基本上可以较快的完成。但是如果数量级增加，例如需要同时插入一万条数据库，将会花费约 20 秒钟，存在很大的优化空间。

## TaskCompleteSource

TaskCompleteSource 是 TPL 库中一个可以生成一个可操作 Task 的类型。[对于 TaskCompleteSource 不太熟悉的读者可以通过该实例代码了解](https://github.com/newbe36524/Newbe.Demo/tree/feature/reactive/src/BlogDemos/Newbe.Tasks/Newbe.Tasks)。

此处也简单解释一下该对象的作用，以便读者可以继续阅读。

对于熟悉 javascript 的朋友，可以认为 TaskCompleteSource 相当于 Promise 对象。也可以相当于 jQuery 当中的 \$.Deferred 。

如果都不了解的朋友，可以听一下笔者吃麻辣烫时想到的生活化例子。

| 吃麻辣烫                      | 技术解释                           |
| ------------------------- | ------------------------------ |
| 吃麻辣烫之前，需要先用盘子夹菜。          | 构造参数                           |
| 夹好菜之后，拿到结账处去结账            | 调用方法                           |
| 收银员结账完毕之后，会得到一个叫餐牌，会响铃的那种 | 得到一个 Task 返回值                  |
| 拿着菜牌找了一个位子坐下，玩手机等餐        | 正在 await 这个 Task ，CPU 转而处理其他事情 |
| 餐牌响了，去取餐，吃起来              | Task 完成，await 节数，继续执行下一行代码     |

那么 TaskCompleteSource 在哪儿呢？

首先，根据上面的例子，在餐牌响的时候，我们才会去取餐。那么餐牌什么时候才会响呢？当然是服务员手动按了一个在柜台的手动开关才触发了这个响铃。

那么，柜台的这个开关，可以被技术解释为 TaskCompleteSource 。

餐台开关可以控制餐牌的响铃。同样， TaskCompleteSource 就是一种可以控制 Task 的状态的对象。

## 解决思路

有了前面对 TaskCompleteSource 的了解，那么接下来就可以解决文章开头的问题了。思路如下：

当调用 InsertData 时，可以创建一个 TaskCompleteSource 以及 item 的元组。为了方便说明，我们将这个元组命名为`BatchItem`。

将 BatchItem 的 TaskCompleteSource 对应的 Task 返回出去。

调用 InsertData 的代码会 await 返回的 Task，因此只要不操作 TaskCompleteSource ，调用者就一会一直等待。

然后，另外启动一个线程，定时将 BatchItem 队列消费掉。

这样就完成了单次插入变为批量插入的操作。

笔者可能解释的不太清楚，不过以下所有版本的代码均基于以上思路。读者可以结合文字和代码进行理解。

## ConcurrentQueue 版本

基于以上的思路，我们采用 ConcurrentQueue 作为 BatchItem 队列进行实现，代码如下（代码很多，不必纠结，因为下面还有更简单的）：

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
            // 启动一个 Task 消费队列中的 BatchItem
            _batchInsertDataTask = Task.Factory.StartNew(RunBatchInsert, TaskCreationOptions.LongRunning);
            _batchInsertDataTask.ConfigureAwait(false);
        }

        public Task<int> InsertData(int item)
        {
            // 生成 BatchItem ，将对象放入队列。返回 Task 出去
            var taskCompletionSource = new TaskCompletionSource<int>();
            _queue.Enqueue(new BatchItem
            {
                Item = item,
                TaskCompletionSource = taskCompletionSource
            });
            return taskCompletionSource.Task;
        }

        // 从队列中不断获取 BatchItem ，并且一批一批插入数据库，更新 TaskCompletionSource 的状态
        private void RunBatchInsert()
        {
            foreach (var batchItems in GetBatches())
            {
                try
                {
                    BatchInsertData(batchItems).Wait();
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
                        .Take(maxCount)
                        .ToList();
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
                    while (_queue.TryDequeue(out var item))
                    {
                        yield return item;
                    }
                }
            }
        }

        private async Task BatchInsertData(IEnumerable<BatchItem> items)
        {
            var batchItems = items as BatchItem[] ?? items.ToArray();
            try
            {
                // 调用数据库的批量插入操作
                var totalCount = await _database.InsertMany(batchItems.Select(x => x.Item));
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

## 正片开始！

接下来我们使用 System.Reactive 来改造上面较为复杂的 ConcurrentQueue 版本。如下：

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
            // 将请求进行分组，每50毫秒一组或者每100个一组
            _subject.Buffer(TimeSpan.FromMilliseconds(50), 100)
                .Where(x => x.Count > 0)
                // 将每组数据调用批量插入，写入数据库
                .Select(list => Observable.FromAsync(() => BatchInsertData(list)))
                .Concat()
                .Subscribe();
        }

        // 这里和前面对比没有变化
        public Task<int> InsertData(int item)
        {
            var taskCompletionSource = new TaskCompletionSource<int>();
            _subject.OnNext(new BatchItem
            {
                Item = item,
                TaskCompletionSource = taskCompletionSource
            });
            return taskCompletionSource.Task;
        }

        // 这段和前面也完全一样，没有变化
        private async Task BatchInsertData(IEnumerable<BatchItem> items)
        {
            var batchItems = items as BatchItem[] ?? items.ToArray();
            try
            {
                var totalCount = await _database.InsertMany(batchItems.Select(x => x.Item));
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

代码减少了 50 行，主要原因就是使用 System.Reactive 中提供的很强力的 Buffer 方法实现了 ConcurrentQueue 版本中的复杂的逻辑实现。

## 老师，可以更给力一点吗？

我们，可以“稍微”优化一下代码，将 Buffer 以及相关的逻辑独立于“数据库插入”这个业务逻辑。那么我们就会得到一个更加简单的版本：

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
                DoManyFunc = database.InsertMany,
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

其中 IBatchOperator 等代码，读者可以到代码库中进行查看，此处就不在陈列了。

## 性能测试

基本可以测定如下：

在 10 条数据并发操作时，原始版本和批量版本没有多大区别。甚至批量版本在数量少时会更慢，毕竟其中存在一个最大 50 毫秒的等待时间。

但是，如果需要批量操作并发操作一万条数据，那么原始版本可能需要消耗 20 秒，而批量版本仅仅只需要 0.5 秒。

> [所有的示例代码均可以在代码库中找到](https://github.com/newbe36524/Newbe.Demo)。如果 Github Clone 存在困难，[也可以点击此处从 Gitee 进行 Clone](https://gitee.com/yks/Newbe.Demo)

<!-- md Footer-Newbe-Claptrap.md -->
