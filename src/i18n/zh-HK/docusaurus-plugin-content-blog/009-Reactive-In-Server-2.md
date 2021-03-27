---
date: 2020-06-28
title: 谈反应式编程在服务端中的应用，数据库操作优化，提速 Upsert
---

反应式编程在客户端编程当中的应用相当广泛，而当前在服务端中的应用相对被提及较少。本篇将介绍如何在服务端编程中应用响应时编程来改进数据库操作的性能。

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## 开篇就是结论

接续上一篇[《谈反应式编程在服务端中的应用，数据库操作优化，从 20 秒到 0.5 秒`》](008-Reactive-In-Server-1)之后，这次，我们带来了关于利用反应式编程进行 upsert 优化的案例说明。建议读者可以先阅读一下前一篇，这样更容易理解本篇介绍的方法。

同样还是利用批量化的思路，将单个 upsert 操作批量进行合并。已达到减少数据库链接消耗从而大幅提升性能的目的。

## 业务场景

在最近的一篇文章[《十万同时在线用户，需要多少内存？——Newbe.Claptrap 框架水平扩展实验》](003-How-Many-RAMs-In-Used-While-There-Are-One-Hundred-Thousand-Users-Online)中。我们通过激活多个常驻于内存当中的 Claptrap 来实现快速验证 JWT 正确性的目的。

但，当时有一个技术问题没有得到解决：

Newbe.Claptrap 框架设计了一个特性：当 Claptrap Deactive 时，可以选择将快照立即保存到数据库。因此，当尝试从集群中关闭一个节点时，如果节点上存在大量的 Claptrap ，那么将产生大量的数据库 upsert 操作。瞬间推高数据库消耗，甚至导致部分错误而保存失败。

## 一点点代码

有了前篇的`IBatchOperator`，那么留给这篇的代码内容就非常少了。

首先，按照使用上一篇的 IBatchOperator 编写一个支持操作的 Repository，形如以下代码：

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
        return _database.UpsertMany(arg.ToDictionary(x => x.Item1, x => x.Item2));
    }

    public Task UpsertAsync(int key, int value)
    {
        return _batchOperator.CreateTask((key, value));
    }
}
```

然后，只要实现对应数据库的 UpsertMany 方法，便可以很好地完成这项优化。

## 各种数据库的操作

结合 Newbe.Claptrap 现在项目的实际。目前，被支持的数据库分别有 SQLite、PostgreSQL、MySql 和 MongoDB。以下，分别对不同类型的数据库的批量 Upsert 操作进行说明。

由于在 Newbe.Claptrap 项目中的 Upsert 需求都是以主键作为对比键，因此以下也只讨论这种情况。

### SQLite

根据官方文档，使用 `INSERT OR REPLACE INTO` 便可以实现主键冲突时替换数据的需求。

具体的语句格式形如以下：

```SQL
INSERT OR REPLACE INTO TestTable (id, value)
VALUES
(@id0,@value0),
...
(@idn,@valuen);
```

因此只要直接拼接语句和参数调用即可。需要注意的是，SQLite 的可传入参数默认为 999，因此拼接的变量也不应大于该数量。

> [官方文档：INSERT](https://www.sqlite.org/lang_insert.html)

### PostgreSQL

众所周知，PostgreSQL 在进行批量写入时，可以使用高效的 COPY 语句来完成数据的高速导入，这远远快于 INSERT 语句。但可惜的是 COPY 并不能支持 ON CONFLICT DO UPDATE 子句。因此，无法使用 COPY 来完成 upsert 需求。

因此，我们还是回归使用 INSERT 配合 ON CONFLICT DO UPDATE 子句，以及 unnest 函数来完成批量 upsert 的需求。

具体的语句格式形如以下：

```SQL
INSERT INTO TestTable (id, value)
VALUES (unnest(@ids), unnest(@values))
ON CONFLICT ON CONSTRAINT TestTable_pkey
DO UPDATE SET value=excluded.value;
```

其中的 ids 和 values 分别为两个等长的数组对象，unnest 函数可以将数组对象转换为行数据的形式。

注意，可能会出现 ON CONFLICT DO UPDATE command cannot affect row a second time 错误。

因此如果尝试使用上述方案，需要在传入数据库之前，先在程序中去重一遍。而且，通常来说，在程序中进行一次去重可以减少向数据库中传入的数据，这本身也很有意义。

> [官方文档：unnest 函数](https://www.postgresql.org/docs/9.2/functions-array.html) > [官方文档：Insert 语句](https://www.postgresql.org/docs/9.5/sql-insert.html)

### MySql

MySql 与 SQLite 类似，支持`REPLACE` 语法。具体语句形式如下：

```sql
REPLACE INTO TestTable (id, value)
VALUES
(@id0,@value0),
...
(@idn,@valuen);
```

> [官方文档：REPLACE 语句](https://dev.mysql.com/doc/refman/8.0/en/replace.html)

### MongoDB

MongoDB 原生支持 bulkWrite 的批量传输模式，也支持 replace 的 upsert 语法。因此操作非常简单。

那么这里展示一下 C# 操作方法：

```cs
private async Task SaveManyCoreMany(
    IDbFactory dbFactory,
    IEnumerable<StateEntity> entities)
{
    var array = entities as StateEntity[] ?? entities.ToArray();
    var items = array
        .Select(x => new MongoStateEntity
        {
            claptrap_id = x.ClaptrapId,
            claptrap_type_code = x.ClaptrapTypeCode,
            version = x.Version,
            state_data = x.StateData,
            updated_time = x.UpdatedTime,
        })
        .ToArray();

    var client = dbFactory.GetConnection(_connectionName);
    var db = client.GetDatabase(_databaseName);
    var collection = db.GetCollection<MongoStateEntity>(_stateCollectionName);

    var upsertModels = items.Select(x =>
    {
        var filter = new ExpressionFilterDefinition<MongoStateEntity>(entity =>
            entity.claptrap_id == x.claptrap_id && entity.claptrap_type_code == x.claptrap_type_code);
        return new ReplaceOneModel<MongoStateEntity>(filter, x)
        {
            IsUpsert = true
        };
    });
    await collection.BulkWriteAsync(upsertModels);
}
```

这是从 Newbe.Claptrap 项目业务场景中给出的代码，读者可以结合自身需求进行修改。

> [官方文档：db.collection.bulkWrite()](https://docs.mongodb.com/manual/reference/method/db.collection.bulkWrite/#db.collection.bulkWrite)

### 通用型解法

优化的本质是减少数据库链接的使用，尽可能在一个链接内完成更多的工作。因此如果特定的数据库不支持以上数据库类似的操作。那么还是存在一种通用型的解法：

1. 以尽可能快地方式将数据写入一临时表
2. 将临时表的数据已连表 update 的方式更新的目标表
3. 删除临时表

> [UPDATE with a join](http://www.sql-workbench.eu/dbms_comparison.html)

## 性能测试

以 SQLite 为例，尝试对 12345 条数据进行 2 次 upsert 操作。

单条并发：1 分 6 秒

批量处理：2.9 秒

[可以在该链接找到测试的代码。](https://github.com/newbe36524/Newbe.Demo/blob/master/src/BlogDemos/Newbe.Rx/Newbe.RxWorld/Newbe.RxWorld/UpsertTest.cs)

样例中不包含有 MySql、PostgreSQL 和 MongoDB 的样例，因为没有优化之前，在不提高连接池的情况下，一并发基本就爆炸了。所有优化的结果是直接解决了可用性的问题。

> [所有的示例代码均可以在代码库中找到](https://github.com/newbe36524/Newbe.Demo)。如果 Github Clone 存在困难，[也可以点击此处从 Gitee 进行 Clone](https://gitee.com/yks/Newbe.Demo)

## 常见问题解答

此处对一些常见的问题进行解答。

### 客户端是等待批量操作的结果吗？

这是一个很多网友提出的问题。答案是：是的。

假设我们公开了一个 WebApi 作为接口，由浏览器调用。如果同时有 100 个浏览器同时发出请求。

那么这 100 个请求会被合并，然后写入数据库。而在写入数据库之前，这些客户端都不会得到服务端的响应，会一直等待。

这也是该合并方案区别于普通的“写队列，后写库”方案的地方。

### 原理上讲，这种和 bulkcopy 有啥不一样？

两者是不相关，必须同时才有作用的功能。 首先，代码中的 database.InsertMany 就是你提到的 bulkcopy。

这个代码的关键不是 InsertMany ，而是如何将单次的插入请求合并。 试想一下，你可以在 webapi 上公开一个 bulkcopy 的 API。 但是，你无法将来自不同客户端的请求合并在同一个 API 里面来调用 bulkcopy。 例如，有一万个客户端都在调用你的 API，那怎么合并这些 API 请求呢？

如果如果通过上面这种方式，虽然你只是对外公开了一个单次插入的 API。你却实现了来自不同客户端请求的合并，变得可以使用 bulkcopy 了。这在高并发下很有意义。

另外，这符合开闭的原理，因为你没有修改 Repository 的 InsertOne 接口，却实现了 bulkcopy 的效果。

### 如果批量操作中一个操作异常失败是否会导致被合并的其他操作全部失败？

如果业务场景是合并会有影响，那当然不应该合并。

批量操作一个失败，当然是一起失败，因为底层的数据库事务肯定也是一起失败。

除非批量接口也支持对每个传入的 ID 做区别对待。典型的，比如 mongodb 的 bulkcopy 可以返回哪些成功哪些失败，那么我们就有能力设置不同的 Tcs 状态。

哪些该合并，哪些不该合并，完全取决于业务。样例给出的是如果要合并，应该怎么合并。不会要求所有都要合并。

### Insert 和 Upsert 都说了，那 Delete 和 Select 呢？

笔者笼统地将该模式称为“反应式批量处理”。要确认业务场景是否应用该模式，需要具备以下这两个基本的要求：

- 业务下游的批量处理是否会比累积的单条处理要快，如果会，那可以用
- 业务上游是否会出现短时间的突增频率的请求，如果会，那可以用

当然，还需要考量，比如：下游的批量操作能否却分每个请求的结果等等问题。但以上两点是一定需要考量的。

那么以 Delete 为例：

- Delete Where In 的速度会比 Delete = 的速度快吗？试一下
- 会有突增的 Delete 需求吗？想一下

## 小小工具 Zeal

笔者是一个完整存储过程都写不出来的人。能够查阅到这些数据库的文档，全靠一款名为 Zeal 的离线文档查看免费软件。推荐给您，您也值得拥有。

![Zeal](/images/20200627-010.png)

Zeal 官网地址：<https://zealdocs.org/>

<!-- md Footer-Newbe-Claptrap.md -->
