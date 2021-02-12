---
date: 2020-06-01
title: Talking about the application of reactive programming on the service side, database operation optimization, from 20 seconds to 0.5 seconds
---

Reactive programming is widely used in client programming, while current applications on the service side are relatively less mentioned.This article describes how to improve the performance of database operations by applying response programming in service-side programming.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## The opening is the conclusion

System.Reactive, in conjunction with TaskCompleteSource, allows you to merge a single single database insert request into a bulk insert request.Optimize database insertion performance while ensuring correctness.

If the reader already knows how to do it, the rest doesn't need to be read.

## Preset conditions

Now, let's assume that there is such a Repository interface to represent a database insert operation.

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

Next, let's experience the performance differences that come with different implementations without changing the interface signature.

## The underlying version

The first is the underlying version, which uses the most conventional single database`INSERT`to insert data.This example uses the`SQLite`as a demo database for readers to experiment with.

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

General operations.One of`_database. The specific implementation of the InsertOne`is to invoke a single`insert`.

The underlying version can basically be completed more quickly when inserted less than 20 times at the same time.But if the order of magnitude increases, such as the need to insert 10,000 databases at the same time, it will take about 20 seconds and there is a lot of room for optimization.

## TaskCompleteSource

TaskCompleteSource is a type in the TPL library that generates an actionable Task.[readers who are not familiar with TaskCompleteSource can learn about the](https://github.com/newbe36524/Newbe.Demo/tree/feature/reactive/src/BlogDemos/Newbe.Tasks/Newbe.Tasks).

Here is also a brief explanation of the object's role so that the reader can continue reading.

For friends who are familiar with javascript, you can think of TaskCompleteSource as the equivalent of a Promise object.Can also be equivalent to the jQuery in the .$. Deferred 。

If you do not understand the friends, you can listen to the author eat spicy hot when you think of the example of life.

| Eat spicy hot                                                                    | Technical explanation                                                                |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Before eating spicy hot, you need to use a plate to sandwich the dishes.         | Construct parameters                                                                 |
| After sandwiching the dishes, take them to the checkout office to check out      | The method is called                                                                 |
| When the cashier is finished, he'll get a meal sign that rings                   | Get a Task return value                                                              |
| Take the dish card to find a seat to sit down, play mobile phone and other meals | Awaiting this Task, the CPU is dealing with other things instead                     |
| The plate rings, go get the meal and eat it                                      | Task completes, awaits the number of sections, and proceeds to the next line of code |

So where is TaskCompleteSource?

First of all, according to the example above, we will pick up the meal only when the plate rings.So when will the food sign ring?Of course, the waiter manually pressed a manual switch at the counter to trigger the bell.

Well, this switch on the counter can be technically interpreted as TaskCompleteSource.

The table switch controls the ringing of the plate.Similarly, TaskCompleteSource is an object that controls the state of task.

## Solve the idea

With what you've learned about TaskCompleteSource before, you can solve the problem at the beginning of the article.The idea is as follows：

When InsertData is called, you can create a TaskCompleteSource and a metagroup of items.For illustration, we named this`BatchItem`.

Return the Task for BatchItem's TaskCompleteSource.

The code that calls InsertData awaits the Task returned, so the caller waits as long as the TaskCompleteSource is not operated.

Then, a separate thread is started, which periodically consumes the BatchItem queue.

This completes the process of turning a single insert into a bulk insert.

The author may not explain it very clearly, but all of the following versions of the code are based on the above ideas.Readers can combine words and code to understand.

## ConcurrentQueue version

Based on the above idea, we implemented ConcurrentQueue as a BatchItem queue, with the following code (a lot of code, not to be tangled, because there are simpler ones below)：

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
            // Launch a BatchItem
            _batchInsertDataTask in a Task consumption queue . . . Task.Factory.StartNew (RunBatchInsert, TaskCreationOptions.LongRunning);
            _batchInsertDataTask.ConfigureAwait(false);


        public Task<int> InsertData (int item)
        . . .
            // Build BatchItem to put objects in the queue.Back to Task
            the var taskCompletionSource s new TaskCompletionSource<int>();
            _queue. Enqueue(new BatchItem
            {
                Item = item,
                TaskCompletionSource = taskCompletionSource
            });
            return taskCompletionSource.Task;

                    
                
                
            
            
        
        .

        . Wait();
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
            the
                insert operation of the database
                var totalCount s _database. InsertMany(batchItems.Select(x => x.Item));
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

## The film begins!

Next, let's use System.Reactive to retrofit the more complex version of ConcurrentQueue above.Here's：

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
            // Group requests in groups of 50 milliseconds or every 100
            _subject. Buffer(TimeSpan.FromMilliseconds(50), 100)
                . Where (x s> x.Count > 0)
                // Insert each set of data calls in bulk and write to the database
                . Select(list => Observable.FromAsync(() => BatchInsertData(list)))
                . Concat()
                . Subscribe();


        // There is no change here from the previous comparison
        public Task<int> InsertData
        . . .
            var taskCompletion .<int>.
            _subject. OnNext(new BatchItem
            {
                Item = item,
                TaskCompletionSource = taskCompletionSource
            });
            return taskCompletionSource.Task;
        s

        // This paragraph is exactly the same as before, no change
        private async Task BatchInsertData (IEnumerable<BatchItem> items)
        s
            var batchItems s items as BatchItems? ToArray();
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

The code was reduced by 50 lines, mainly because the complex logical implementation in the ConcurrentQueue version was implemented using the powerful Buffer method provided in System.Reactive.

## Teacher, can you give me a little more strength?

We can "slightly" optimize the code to separate Buffer and related logic from the business logic of "database insertion".Then we'll get a simpler version：

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

Code such as IBatchOperator, which readers can view in the code base, is not on display here.

## Performance testing

Basic can be measured as follows：

The original version is not much different from the bulk version when there are 10 data-only operations.Even bulk versions are slower when the number is small, after all, there is a maximum wait time of 50 milliseconds.

However, if you need to manipulate 10,000 data consumables in bulk, the original version may take 20 seconds, while the bulk version only takes 0.5 seconds.

> [all sample code can be found in the code base](https://github.com/newbe36524/Newbe.Demo).If Github Clone is in trouble,[can also click here for Clone from Gitee](https://gitee.com/yks/Newbe.Demo)

<!-- md Footer-Newbe-Claptrap.md -->
