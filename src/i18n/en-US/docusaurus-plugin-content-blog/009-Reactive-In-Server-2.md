---
date: 2020-06-28
title: Talk about the application of reactive programming on the service side, database operation optimization, speed up Upsert
---

Reactive programming is widely used in client programming, while current applications on the service side are relatively less mentioned.This article describes how to improve the performance of database operations by applying response programming in service-side programming.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## The opening is the conclusion

Following the last["Talking about the application of reactive programming on the service side, database operation optimization, from 20 seconds to 0.5 seconds](008-Reactive-In-Server-1)this time, we bring a case study of upsert optimization with reactive programming.Readers are advised to read the previous article first, which makes it easier to understand the methods described in this article.

It is also a way to combine individual upsert operations in bulk using the idea of batching.The goal of reducing database link consumption has been achieved to significantly improve performance.

## The business scenario

In a recent article[How much memory is needed — Newbe.Clapp Framework Horizontal Experiment](003-How-Many-RAMs-In-Used-While-There-Are-One-Hundred-Thousand-Users-Online).We quickly verify JWT correctness by activating multiple memory-resident Claptrap.

However, there was a technical problem that was not resolved：

The Newbe.Claptrap framework designs a feature：when Claptrap Deactive, you can choose to save the snapshot to the database immediately.Therefore, when you try to shut down a node from a cluster, if there is a large number of Claptrap on the node, a large number of database upsert operations are generated.Instantly push up database consumption and even cause some errors and fail to save.

## A little bit of code

With the previous`IBatchOperator`, there is very little code left for this article.

First, write an action-supported repository using the IBatchOperator from the last article, like the following code：

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

This optimization can then be done well by implementing the UpsertMany method for the corresponding database.

## Operations on various databases

Combined with the Newbe.Claptrap now project actual.Currently, SQLite, PostgreSQL, MySql, and MongoDB are supported.Below, bulk Upsert operations for different types of databases are described separately.

Since the Upsert requirements in the Newbe.Claptrap project are based on the primary key as the comparison key, this is only discussed below.

### Sqlite

According to official documentation, `insert OR REPLACE INTO` the need to replace data in the first key conflict.

Specific statements are formatted as follows：

```SQL
INSERT OR REPLACE INTO TestTable (id, value)
VALUES
(@id0,@value0),
...
(@idn,@valuen);
```

So just stitch statements and parameter calls directly.It is important to note that SQLite's passable parameters default to 999, so the number of stitched variables should not be greater.

> [The official document：INSERT](https://www.sqlite.org/lang_insert.html)

### PostgreSQL

It is well known that PostgreSQL can use efficient COPY statements to complete the fast import of data, far faster than INSERT statements.Unfortunately, however, COPY does not support ON CONFLICT DO UPDATE sentences.Therefore, it is not possible to use COPY to complete upsert requirements.

We therefore return to the need to use INSERT with ON CONFLICT DO UPDATE subsentences, and the unnest function to complete the batch

Specific statements are formatted as follows：

```SQL
INSERT INTO TestTable (id, value)
VALUES (unnest(@ids), unnest(@values))
ON CONFLICT ON CONSTRAINT TestTable_pkey
DO UPDATE SET value=excluded.value;
```

Where ids and values are two equally long array objects, the unnest function converts the array objects into row data.

Note that an ON CONFLICT DO UPDATE command can affect row a second time error may occur.

So if you try to use the above scenario, you need to go through it again in the program before passing in the database.Also, in general, it makes sense to do a re-entry in a program to reduce the amount of data that is passed into the database.

> [official document：unnest function](https://www.postgresql.org/docs/9.2/functions-array.html) > [official document：Insert statement](https://www.postgresql.org/docs/9.5/sql-insert.html)

### Mysql

MySql, similar to SQLite, supports`REPLACE` syntax.The specific statements are in the following：

```sql
REPLACE INTO TestTable (id, value)
VALUES
(@id0,@value0),
...
(@idn,@valuen);
```

> [The official document：REPLACE statement](https://dev.mysql.com/doc/refman/8.0/en/replace.html)

### MongoDB

MongoDB natively supports bulkWrite's bulk transport mode, as well as replace's upsert syntax.So it's very easy to do.

So here's a look at how to do it：

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

This is the code given from the Newbe.Claptrap project business scenario, which readers can modify in conjunction with their own needs.

> [Official documents：db.collection.bulkWrite()](https://docs.mongodb.com/manual/reference/method/db.collection.bulkWrite/#db.collection.bulkWrite)

### Universal solution

The essence of optimization is to reduce the use of database links and do as much work as possible within one link.Therefore, if a particular database does not support similar operations for the above databases.Then there is a universal solution：

1. Write data to a temporary table as quickly as possible
2. The target table that updates the data of the temporary table to the table update
3. Delete the temporary table

> [UPDATE with a join](http://www.sql-workbench.eu/dbms_comparison.html)

## Performance testing

In the case of SQLite, try 2 upsert operations on 12345 data.

The single-：1 minute and 6 seconds

Batch processing：2.9 seconds

[The code for the test can be found in the link.](https://github.com/newbe36524/Newbe.Demo/blob/master/src/BlogDemos/Newbe.Rx/Newbe.RxWorld/Newbe.RxWorld/UpsertTest.cs)

The sample does not contain mySql, PostgreSQL, and MongoDB, because before optimization, the connection pool is basically exploded without raising the connection pool.The result of all optimizations is a direct solution to the availability problem.

> [all sample code can be found in the code base](https://github.com/newbe36524/Newbe.Demo).If Github Clone is in trouble,[can also click here for Clone from Gitee](https://gitee.com/yks/Newbe.Demo)

## FAQ

Here are answers to some common questions.

### Is the client waiting for the result of a bulk operation?

This is a question raised by many netizens.The answer：yes.

Suppose we expose a WebApi as an interface, called by the browser.If 100 browsers are making requests at the same time.

The 100 requests are then merged and then written to the database.These clients will not receive a response from the service side until they are written to the database and will wait.

This is also where the merge scheme differs from the usual "write queue, write library later" scenario.

### In principle, what's the point of this and bulkcopy?

The two are irrelevant and must have functions that work at the same time. First, the database in the code. InsertMany is the bulkcopy you mentioned.

The key to this code is not InsertMany, but how to merge a single insert request. Imagine that you can expose a bulkcopy API on webapi. However, you cannot combine requests from different clients within the same API to call bulkcopy. For example, with 10,000 clients calling your API, how do you combine these API requests?

If you do this above, although you only expose a single inserted API to the public.Between you and the consolidation of requests from different clients, you become able to use bulkcopy.This makes sense at high levels.

Also, this works with the open-close principle, because you didn't modify repository's InsertOne interface, but did bulkcopy.

### If one operation exception fails in a batch operation, will all other operations that were merged fail?

If the business scenario is that consolidation has an impact, it certainly shouldn't be merged.

A bulk operation fails, of course, because the underlying database transaction certainly fails together.

Unless the bulk interface also supports differential treatment of each incoming ID.Typically, such as mongodb's bulkcopy, we have the ability to set different Tcs states if we can return which successes and which failures.

What should and should not be merged depends entirely on the business.The example gives how you should merge if you want to merge.Not all are required to be merged.

### Insert and Upsert both said, what about Delete and Select?

The author generally refers to this model as "reactive batch processing".To confirm that the pattern is applied to the business scenario, you need to have the following two basic requirements：

- Whether batch processing downstream of the business will be faster than cumulative single processing, if so, can be used
- Whether there will be a short burst frequency request upstream of the business, if so, that can be used

Of course, there are also questions to consider,：such as whether downstream batch operations can be divided into the results of each request.But these two points must be considered.

So take Delete as an example：

- Will Delete Where In be faster than Delete?Give it a try
- Will there be a sudden increase in Delete requirements?Think about it

## Gadget Zeal

The author is a complete stored procedure can not be written out of the person.Access to documents for these databases, all with an offline document called Zeal.Recommended to you, you deserve it.

![Zeal](/images/20200627-010.png)

Zeal Official Address：<https://zealdocs.org/>

<!-- md Footer-Newbe-Claptrap.md -->
