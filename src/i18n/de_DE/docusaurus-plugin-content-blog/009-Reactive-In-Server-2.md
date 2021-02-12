---
date: 2020-06-28
title: Sprechen Sie über die Anwendung der reaktiven Programmierung auf der Service-Seite, Datenbank-Betriebsoptimierung, Beschleunigen Upsert
---

Reaktive Programmierung wird häufig in der Clientprogrammierung verwendet, während aktuelle Anwendungen auf der Dienstseite relativ weniger erwähnt werden.In diesem Artikel wird beschrieben, wie Sie die Leistung von Datenbankvorgängen verbessern können, indem Sie die Antwortprogrammierung in der dienstseitigen Programmierung anwenden.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## Die Eröffnung ist der Abschluss

Nach dem letzten["Im Gespräch über die Anwendung der reaktiven Programmierung auf der Service-Seite, Datenbank-Betriebsoptimierung, von 20 Sekunden auf 0,5 seconds](008-Reactive-In-Server-1)dieses Mal, bringen wir eine Fallstudie der upsert Optimierung mit reaktiver Programmierung.Lesern wird empfohlen, zuerst den vorherigen Artikel zu lesen, was es einfacher macht, die in diesem Artikel beschriebenen Methoden zu verstehen.

Es ist auch eine Möglichkeit, einzelne Upsert-Operationen in loser Schüttung mit der Idee der Batching zu kombinieren.Das Ziel, den Verbrauch von Datenbankverbindungen zu reduzieren, wurde erreicht, um die Leistung deutlich zu verbessern.

## Das Geschäftsszenario

在最近的一篇文章[《十万同时在线用户，需要多少内存？——Newbe.Claptrap 框架水平扩展实验》](003-How-Many-RAMs-In-Used-While-There-Are-One-Hundred-Thousand-Users-Online)中。Wir überprüfen schnell die JWT-Korrektheit, indem wir mehrere speicherresidente Claptrap aktivieren.

Es gab jedoch ein technisches Problem, das nicht resolved：

Das Newbe.Claptrap-Framework entwirft eine feature：wenn Claptrap Deactive, können Sie den Snapshot sofort in der Datenbank speichern.Wenn Sie also versuchen, einen Knoten von einem Cluster herunterzufahren, wird eine große Anzahl von Claptrap-Vorgängen auf dem Knoten generiert.Schieben Sie den Datenbankverbrauch sofort nach oben und verursachen Sogar einige Fehler und können nicht gespeichert werden.

## Ein wenig Code

Da die vorherige`IBatchOperator`, gibt es nur noch sehr wenig Code für diesen Artikel.

Schreiben Sie zunächst ein aktionsunterstütztes Repository mit dem IBatchOperator aus dem letzten Artikel, wie im folgenden code：

```cs
Public Class BatchUpsert : IUpsertRepository
-
    private schreibgeschützte IDatabase _database;
    private schreibgeschützte IBatchOperator<(int, int), int> _batchOperator;

    öffentliche BatchUpsert(IDatabase-Datenbank)

        _database = Datenbank;
        var-Optionen = neue BatchOperatorOptions<(int, int), int>

            BufferCount = 100,
            BufferTime = TimeSpan.FromMilliseconds(50),
            DoManyFunc = DoManyFunc
        ;
        _batchOperator = neue BatchOperator-<(int, int), int>(Optionen);


    privaten Task<int> DoManyFunc(IEnumerable<(int, int)> arg)
        
    _database zurück. UpsertMany(arg. ToDictionary(x => x.Item1, x => x.Item2));


    öffentlichen Task UpsertAsync(int-Schlüssel, int-Wert)

        _batchOperator.CreateTask((Key, value));


```

Diese Optimierung kann dann gut durchgeführt werden, indem die UpsertMany-Methode für die entsprechende Datenbank implementiert wird.

## Vorgänge in verschiedenen Datenbanken

Kombiniert mit dem Newbe.Claptrap jetzt Projekt aktuell.Derzeit werden SQLite, PostgreSQL, MySql und MongoDB unterstützt.Im Folgenden werden Bulk-Upsert-Vorgänge für verschiedene Datenbanktypen separat beschrieben.

Da die Upsert-Anforderungen im Newbe.Claptrap-Projekt auf dem Primärschlüssel als Vergleichsschlüssel basieren, wird dies nur im Folgenden erläutert.

### Sqlite

Laut offizieller Dokumentation `OR REPLACE INTO` die Notwendigkeit, Daten im ersten Schlüsselkonflikt zu ersetzen.

Bestimmte Anweisungen werden als follows：

```SQL
INSERT ODER REPLACE INTO TestTable (id, wert)
VALUES
(@id0,@value0),
...
(@idn,@valuen);
```

Also nur stich Anweisungen und Parameteraufrufe direkt.Es ist wichtig zu beachten, dass die passablen Parameter von SQLite standardmäßig auf 999 wert sind, daher sollte die Anzahl der genähten Variablen nicht größer sein.

> [Das offizielle Dokument：INSERT](https://www.sqlite.org/lang_insert.html)

### Postgresql

众所周知，PostgreSQL 在进行批量写入时，可以使用高效的 COPY 语句来完成数据的高速导入，这远远快于 INSERT 语句。但可惜的是 COPY 并不能支持 ON CONFLICT DO UPDATE 子句。因此，无法使用 COPY 来完成 upsert 需求。

因此，我们还是回归使用 INSERT 配合 ON CONFLICT DO UPDATE 子句，以及 unnest 函数来完成批量 upsert 的需求。

Bestimmte Anweisungen werden als follows：

```SQL
INSERT INTO TestTable (id, wert)
VALUES (unnest(@ids), unnest(@values))
ON CONFLICT ON CONSTRAINT TestTable_pkey
DO UPDATE SET value=excluded.value;
```

Wo iDs und Werte zwei gleichermaßen lange Arrayobjekte sind, konvertiert die unnest-Funktion die Arrayobjekte in Zeilendaten.

Beachten Sie, dass ein ON CONFLICT DO UPDATE-Befehl die Zeile beeinflussen kann, wenn ein zweiter Zeitfehler auftreten kann.

Wenn Sie also versuchen, das obige Szenario zu verwenden, müssen Sie es erneut im Programm durchlaufen, bevor Sie die Datenbank übergeben.Im Allgemeinen ist es auch sinnvoll, einen Erneuteintrag in ein Programm zu tun, um die Datenmenge zu reduzieren, die an die Datenbank übergeben wird.

> [offizielles Dokument：unnestfunktion](https://www.postgresql.org/docs/9.2/functions-array.html) > [offizielles Dokument：Insert statement](https://www.postgresql.org/docs/9.5/sql-insert.html)

### Mysql

MySql, ähnlich wie SQLite, unterstützt`REPLACE` Syntax.Die spezifischen Aussagen sind in den folgenden：

```sql
REPLACE INTO TestTable (id, wert)
VALUES
(@id0,@value0),
...
(@idn,@valuen);
```

> [Das offizielle Dokument：REPLACE-Erklärung](https://dev.mysql.com/doc/refman/8.0/en/replace.html)

### Mongodb

MongoDB unterstützt nativ den Massentransportmodus von bulkWrite und ersetzt die upsert-Syntax.Es ist also sehr einfach zu tun.

Hier ist also ein Blick darauf, wie man it：

```cs
private async Task SaveManyCoreMany(
    IDbFactory dbFactory,
    IEnumerable<StateEntity> Entitäten)

    var array = Entitäten als StateEntity[] ??-Entitäten. ToArray();
    var items = Array
        . Select(x => neue MongoStateEntity
        -
            claptrap_id = x.ClaptrapId,
            claptrap_type_code = x.ClaptrapTypeCode,
            Version = x.Version,
            state_data = x.StateData,
            updated_time = x.UpdatedTime,

        . ToArray();

    var client = dbFactory.GetConnection(_connectionName);
    var db = Client. GetDatabase(_databaseName);
    var collection = db. GetCollection<MongoStateEntity>(_stateCollectionName);

    var upsertModels = Items. Select(x =>
    -
        var filter = new ExpressionFilterDefinition<MongoStateEntity>(entity =>
            entity.claptrap_id == x.claptrap_id && entity.claptrap_type_code == x.claptrap_type_code);
        geben neue ReplaceOneModel-<MongoStateEntity>(Filter, x) zurück

            IsUpsert = true
        ;
    );
    warten auf die Sammlung. BulkWriteAsync(upsertModels);

```

Dies ist der Code aus dem Newbe.Claptrap-Projektgeschäftsszenario, den Leser in Verbindung mit ihren eigenen Anforderungen ändern können.

> [Offizielle Dokumente：db.collection.bulkWrite()](https://docs.mongodb.com/manual/reference/method/db.collection.bulkWrite/#db.collection.bulkWrite)

### Universelle Lösung

Das Wesen der Optimierung ist es, die Verwendung von Datenbank-Links zu reduzieren und so viel Arbeit wie möglich innerhalb eines Links zu tun.Wenn eine bestimmte Datenbank ähnliche Vorgänge für die oben genannten Datenbanken nicht unterstützt.Dann gibt es eine universelle solution：

1. Schreiben von Daten so schnell wie möglich in eine temporäre Tabelle
2. Die Zieltabelle, die die Daten der temporären Tabelle in die Tabellenaktualisierung aktualisiert
3. Löschen der temporären Tabelle

> [UPDATE mit einer Verknüpfung](http://www.sql-workbench.eu/dbms_comparison.html)

## Leistungstests

Versuchen Sie im Fall von SQLite 2 Upsert-Operationen für 12345-Daten.

Die：1 Minute und 6 Sekunden

Stapelverarbeitung：2,9 Sekunden

[Den Code für den Test finden Sie im Link.](https://github.com/newbe36524/Newbe.Demo/blob/master/src/BlogDemos/Newbe.Rx/Newbe.RxWorld/Newbe.RxWorld/UpsertTest.cs)

Das Beispiel enthält keine mySql, PostgreSQL und MongoDB, da vor der Optimierung der Verbindungspool im Grunde explodiert ist, ohne den Verbindungspool anzuheben.Das Ergebnis aller Optimierungen ist eine direkte Lösung für das Verfügbarkeitsproblem.

> [finden Sie den gesamten Beispielcode in der Codebasis](https://github.com/newbe36524/Newbe.Demo).Wenn Github Clone in Schwierigkeiten ist, können[auch hier für Klonen klicken, von Gitee](https://gitee.com/yks/Newbe.Demo)

## Häufig gestellte Fragen

Hier finden Sie Antworten auf einige häufig gestellte Fragen.

### Wartet der Client auf das Ergebnis eines Massenvorgangs?

Diese Frage stellt sich viele Netzbürger.Die Antwort：ja.

Angenommen, wir machen eine WebApi als Schnittstelle verfügbar, die vom Browser aufgerufen wird.Wenn 100 Browser gleichzeitig Anfragen stellen.

Die 100 Anforderungen werden dann zusammengeführt und dann in die Datenbank geschrieben.Diese Clients erhalten erst dann eine Antwort von der Dienstseite, wenn sie in die Datenbank geschrieben wurden und warten.

Hier unterscheidet sich das Zusammenführungsschema auch vom üblichen Szenario "Schreibwarteschlange, Spätere Schreibbibliothek".

### Im Prinzip, was ist der Sinn dieser und Bulkcopy?

Die beiden sind irrelevant und müssen Funktionen haben, die gleichzeitig funktionieren. Zuerst die Datenbank im Code. InsertMany ist die von Ihnen erwähnte Bulkcopy.

Der Schlüssel zu diesem Code ist nicht InsertMany, sondern wie eine einzelne Einfügeanforderung zusammengeführt wird. Stellen Sie sich vor, Sie können eine Bulkcopy-API auf webapi verfügbar machen. Sie können jedoch keine Anforderungen von verschiedenen Clients innerhalb derselben API kombinieren, um Bulkcopy aufzurufen. Wie kombinieren Sie beispielsweise diese API-Anforderungen bei 10.000 Clients, die Ihre API aufrufen?

Wenn Sie dies oben tun, obwohl Sie nur eine einzelne eingefügte API für die Öffentlichkeit verfügbar machen.Zwischen Ihnen und der Konsolidierung von Anforderungen von verschiedenen Clients können Sie Bulkcopy verwenden.Das macht auf hohem Niveau Sinn.

Dies funktioniert auch mit dem Open-Close-Prinzip, da Sie die InsertOne-Schnittstelle des Repositorys nicht geändert haben, sondern Bulkcopy.

### Wenn eine Vorgangsausnahme in einem Batchvorgang fehlschlägt, schlagen alle anderen Zusammengeführten Vorgänge fehl?

Wenn das Geschäftsszenario darin besteht, dass Konsolidierung Auswirkungen hat, sollte sie sicherlich nicht zusammengeführt werden.

Ein Massenvorgang schlägt natürlich fehl, da die zugrunde liegende Datenbanktransaktion sicherlich zusammen fehlschlägt.

Es sei denn, die Bulk-Schnittstelle unterstützt auch die differenzierte Behandlung jeder eingehenden ID.Typischerweise, wie Mongodbs Bulkcopy, haben wir die Möglichkeit, verschiedene Tcs-Zustände festzulegen, wenn wir welche Erfolge und welche Fehler zurückgeben können.

Was zusammengeführt werden sollte und was nicht, hängt ganz vom Geschäft ab.Im Beispiel wird erläutert, wie Sie zusammenführen sollten, wenn Sie zusammenführen möchten.Nicht alle müssen zusammengeführt werden.

### Einfügen und Upsert sagten beide, was ist mit Löschen und Auswählen?

Der Autor bezeichnet dieses Modell im Allgemeinen als "reaktive Batchverarbeitung".Um zu bestätigen, dass das Muster auf das Geschäftsszenario angewendet wird, müssen Sie die folgenden beiden grundlegenden requirements：

- Ob die Batch-Verarbeitung nach dem Geschäft schneller sein wird als die kumulative Einzelverarbeitung, wenn ja, kann verwendet werden
- Ob es eine kurze Burst-Frequenz-Anfrage vor dem Geschäft geben wird, wenn ja, die verwendet werden kann

Natürlich gibt es auch Fragen zu berücksichtigen,：wie z. B. ob nachgelagerte Batch-Operationen in die Ergebnisse jeder Anfrage unterteilt werden können.Aber diese beiden Punkte müssen berücksichtigt werden.

Nehmen Sie Delete also als example：

- Wird Delete Where In schneller als Delete sein?Probieren Sie es aus
- Wird es zu einem plötzlichen Anstieg der Löschanforderungen kommt?Denk darüber nach

## Gadget Zeal

Der Autor ist eine vollständige gespeicherte Prozedur kann nicht aus der Person geschrieben werden.Zugriff auf Dokumente für diese Datenbanken, alle mit einem Offlinedokument namens Zeal.Sie werden empfohlen, Sie verdienen es.

![Eifer](/images/20200627-010.png)

Zeal Official Address：<https://zealdocs.org/>

<!-- md Footer-Newbe-Claptrap.md -->
