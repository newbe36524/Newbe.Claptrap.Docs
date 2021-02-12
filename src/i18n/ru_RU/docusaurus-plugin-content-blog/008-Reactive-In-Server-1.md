---
date: 2020-06-01
title: Говоря о применении реактивного программирования на стороне службы, операции с базой данных оптимизированы от 20 до 0,5 секунды
---

Реактивное программирование широко используется в клиентских программированиях, в то время как в настоящее время приложения на стороне службы упоминаются относительно реже.В этой статье показано, как улучшить производительность операций с базой данных при применении ответа в программировании на стороне службы.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## Начало является заключением

System.Reactive в сочетании с TaskCompleteSource позволяет объединять распределенные запросы на вставку одной базы данных в пакетную вставку.Оптимизируйте производительность вставки базы данных, обеспечивая при этом правильность.

Если читатель уже знает, как это сделать, то остальное не нужно смотреть снова.

## Предустановленные условия

Теперь предположим, что существует такой интерфейс Repository для представления операции вставки базы данных.

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

Далее мы испытаем различия в производительности, вызванные различными реализациями, не изменяя подпись интерфейса.

## Базовая версия

Во-первых, это базовая версия с наиболее обычной одной базой данных`insert`для завершения вставки данных.В этом примере используется`SQLite`качестве демонстрационной базы данных, которая позволяет читателям экспериментировать самостоятельно.

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

Общие действия.Из них`_database. Конкретной реализацией`InsertOne (item) является вызов`insert`.

Базовая версия в основном может быть завершена быстрее при вставке менее 20 раз одновременно.Однако увеличение на порядок, например необходимость одновременной вставки 10 000 баз данных, может занять около 20 секунд с большим пространством для оптимизации.

## TaskCompleteSource

TaskCompleteSource — это тип в библиотеке TPL, который может создавать работоустроимые task.[читатели, которые не знакомы с TaskCompleteSource, могут узнать больше о коде](https://github.com/newbe36524/Newbe.Demo/tree/feature/reactive/src/BlogDemos/Newbe.Tasks/Newbe.Tasks).

Здесь также кратко объясняется, что делает объект, чтобы читатель мог продолжить чтение.

Для друзей, знакомых с JavaScript, можно считать, что TaskCompleteSource эквивалентен объекту Promise.Он также может быть эквивалентен $$ в JQuery. Deferred 。

Если вы не знаете друзей, вы можете услышать пример жизни, что автор думает, когда он ест пряный горячий.

| Ешьте пряный горячий                                                                         | Техническое объяснение                                                       |
| -------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Прежде чем есть пряный горячий, вы должны использовать тарелку, чтобы зажать овощи.          | Параметры построения                                                         |
| После того, как вы зажатые блюда, получить кассу, чтобы проверить                            | Вызовите метод                                                               |
| После того, как кассир оберняет счет, он получает табличку под названием Еда, которая звонит | Получает возвращаемое значение Task                                          |
| Возьмите тарелку, чтобы найти место, чтобы сесть, играть с мобильным телефоном и ждать еды   | В await этот Task, процессор перейти к другим вещам                          |
| Зазвонил табличка, пошел за едой, поесть                                                     | Task завершает, количество разделов await, и перейти к следующей строке кода |

Так где же TaskCompleteSource?

Во-первых, согласно приведеному выше примеру, мы не будем ходить за едой, пока звучит табличка.Так когда же столовые карточки зазвонят?Конечно, официант вручную нажал ручной переключатель на прилавке, чтобы вызвать звонок.

Ну, этот переключатель счетчика может быть технически интерпретируется как TaskCompleteSource.

Переключатель стола управляет звоном таблички.Аналогичным образом, TaskCompleteSource является объектом, который может управлять состоянием Task.

## Решение идей

С тем, что вы узнали о TaskCompleteSource ранее, вы можете решить проблему в начале статьи.Идея заключается в следующем：

При вызове InsertData можно создать метагруппу TaskCompleteSource, а также item.Чтобы проиллюстрировать это, мы назвали этот`batchItem`.

Верните task, соответствующий TaskCompleteSource от BatchItem.

Код, вызывающий InsertData, возвращает Task await, поэтому вызывающий объект будет ждать до тех пор, пока taskCompleteSource не будет работать.

Затем запустите дополнительный поток, который будет потреблять очереди BatchItem по времени.

Это завершает операцию превращения одной вставки в массовую вставку.

Автор может объяснить это не совсем ясно, но все следующие версии кода основаны на вышеуказанных идеях.Читатель может объединить слова и код, чтобы понять.

## Версия ConcurrentQueue

Основываясь на приведенной выше идее, мы используем ConcurrentQueue в качестве очереди BatchItem для реализации следующего кода (много кода, не нужно запутаться, потому что есть более простой ниже)：

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
            // Запуск BatchItem
            _batchInsertDataTask в очереди потребителей Task = Task.Factory.StartNew (RunBatchInsert, TaskCreationOptions.LongRunning);
            _batchInsertDataTask.ConfigureAwait(false);
        —

        public Task<int> InsertData (int item)
        —
            // Создайте batchItem, чтобы поместить объект в очередь.Вернуться в Task
            var taskCompletionSource = new TaskCompletionSource<int>();
            _queue. Enqueue(new BatchItem
            {
                Item = item,
                TaskCompletionSource = taskCompletionSource
            });
            return taskCompletionSource.Task;
        —

        // Постоянное получение BatchItem из очереди и пакет вставок в базу данных для обновления состояния TaskCompletionSource
        private void RunBatchInsert()
        —
            foreach (var batchItems in GetBatches())
            —
                try
                —
                    BatchInsertData (batchItems). Wait();
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
            —
                // Вызывает операцию массовой вставки базы данных
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

## Положительный фильм начинается!

Далее мы используем System.Reactive для преобразования более сложной версии ConcurrentQueue выше.Вот как это：

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
            // Группировать запросы каждые 50 миллисекунд или каждые 100 групп
            _subject. Buffer(TimeSpan.FromMilliseconds(50), 100)
                . Where(x => x.Count > 0)
                // Вставьте каждый набор вызовов данных пакетно, записывая в базу данных
                . Select(list => Observable.FromAsync(() => BatchInsertData(list)))
                . Concat()
                . Subscribe();
        »

        // Сравнение здесь и перед
        public Task<int> InsertData (int item)
        {
            var taskCompletionSource = new TaskCompletionSource<int>();
            _subject. OnNext(new BatchItem
            {
                Item = item,
                TaskCompletionSource = taskCompletionSource
            });
            return taskCompletionSource.Task;
        |

        // Этот сегмент точно такой же, как и раньше, без изменений
        private async Task BatchInsertData<BatchItem>
        |
            var batchItems = items as BatchItem[]?items.? ToArray();
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

Код уменьшается на 50 строк, главным образом из-за сложной логической реализации в версии ConcurrentQueue с помощью мощных методов Buffer, доступных в System.Reactive.

## Учитель, не могли бы вы дать немного больше силы?

Мы можем "немного" оптимизировать код, чтобы сделать Buffer и связанную с ним логику независимой от бизнес-логики "вставки базы данных".Тогда мы получим более простую версию：

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

Коды, такие как IBatchOperator, которые читатели могут просматривать в кодовой библиотеке, не показаны здесь.

## Тестирование производительности

Основные могут быть измерены следующим образом：

При одной и той же операции с 10 данными нет большой разницы между исходной и массовой версиями.Даже массовые версии медленнее, когда их меньше, в конце концов, существует время ожидания до 50 миллисекунд.

Однако, если требуется пакетная однофазная работа с 10 000 данных, исходная версия может занять до 20 секунд, в то время как массовая версия занимает всего 0,5 секунды.

> [все примеры кода можно найти в](https://github.com/newbe36524/Newbe.Demo).Если Github Clone имеет проблемы,[вы также можете нажать здесь, чтобы сделать Clone](https://gitee.com/yks/Newbe.Demo)

<!-- md Footer-Newbe-Claptrap.md -->
