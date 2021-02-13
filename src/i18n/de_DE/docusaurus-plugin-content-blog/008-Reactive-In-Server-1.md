---
date: 2020-06-01
title: Apropos Anwendung der reaktiven Programmierung auf der Service-Seite, Datenbankbetriebsoptimierung, von 20 Sekunden auf 0,5 Sekunden
---

Reaktive Programmierung wird häufig in der Clientprogrammierung verwendet, während aktuelle Anwendungen auf der Dienstseite relativ weniger erwähnt werden.In diesem Artikel wird beschrieben, wie Sie die Leistung von Datenbankvorgängen verbessern können, indem Sie die Antwortprogrammierung in der dienstseitigen Programmierung anwenden.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## Die Eröffnung ist der Abschluss

System.Reactive ermöglicht es Ihnen, in Verbindung mit TaskCompleteSource eine einzelne Datenbankeinfügeanforderung in einer Masseneinfügeanforderung zusammenzuführen.Optimieren Sie die Datenbankeinfügeleistung und stellen Sie gleichzeitig die Korrektheit sicher.

Wenn der Leser bereits weiß, wie es geht, muss der Rest nicht gelesen werden.

## Voreingestellte Bedingungen

Nehmen wir nun an, dass es eine solche Repository-Schnittstelle gibt, die einen Datenbankeinfügevorgang darstellt.

```csharp
namespace Newbe.RxWorld.DatabaseRepository

    öffentliche Schnittstelle IDatabaseRepository

        // <summary>
        // Fügen Sie ein Element ein und geben Sie die Gesamtanzahl der Daten in die Datenbank
        // </summary>
        // <param name="item"></param>
        // <returns></returns>
        Task<int> InsertData(int-Element);

.
```

Als Nächstes erleben wir die Leistungsunterschiede, die mit verschiedenen Implementierungen kommen, ohne die Schnittstellensignatur zu ändern.

## Die zugrunde liegende Version

Die erste ist die zugrunde liegende Version, die die konventionellste einzeldatenbank`INSERT-`verwendet, um Daten einzufügen.In diesem Beispiel wird die`SQLite`als Demodatenbank für Leser zum Experimentieren verwendet.

```csharp
namespace Newbe.RxWorld.DatabaseRepository.Impl

    öffentlichen Klasse NormalDatabaseRepository : IDatabaseRepository
    -
        private schreibgeschützte IDatabase _database;

        öffentliche SNormalDatabaseRepository(
            IDatabase-Datenbank)

            _database = Datenbank;


        öffentlichen Task<int> InsertData(int-Element)

            _database zurückgeben. InsertOne(item);



```

Allgemeine Operationen.Einer von`_database. Die spezifische Implementierung des InsertOne-`besteht darin, eine einzelne`einfügen`aufzurufen.

Die zugrunde liegende Version kann grundsätzlich schneller abgeschlossen werden, wenn sie weniger als 20 Mal gleichzeitig eingefügt wird.Aber wenn die Größenordnung zunimmt, wie die Notwendigkeit, 10.000 Datenbanken gleichzeitig einzufügen, dauert es etwa 20 Sekunden und es gibt viel Raum für Optimierung.

## TaskCompleteSource

TaskCompleteSource ist ein Typ in der TPL-Bibliothek, der eine umsetzbare Aufgabe generiert.[Leser, die mit TaskCompleteSource nicht vertraut sind, können sich über die](https://github.com/newbe36524/Newbe.Demo/tree/feature/reactive/src/BlogDemos/Newbe.Tasks/Newbe.Tasks)informieren.

Hier ist auch eine kurze Erläuterung der Rolle des Objekts, damit der Leser weiterlesen kann.

Für Freunde, die mit Javascript vertraut sind, können Sie sich TaskCompleteSource als Äquivalent zu einem Promise-Objekt vorstellen.Kann auch der jQuery in der . Latent.

Wenn Sie die Freunde nicht verstehen, können Sie dem Autor zuhören, wie er würzig heiß isst, wenn Sie an das Beispiel des Lebens denken.

| Essen Sie würzig heiß                                                                                                 | Technische Erklärung                                                                                        |
| --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| Bevor Sie würzig heiß essen, müssen Sie einen Teller verwenden, um die Gerichte zu sandwichen.                        | Konstruktparameter                                                                                          |
| Nach dem Sandwichen der Gerichte, nehmen Sie sie an die Kasse, um zu überprüfen                                       | Die Methode wird als                                                                                        |
| Wenn der Kassierer fertig ist, bekommt er ein Essensschild, das klingelt                                              | Abrufen eines Task-Rückgabewerts                                                                            |
| Nehmen Sie die Tellerkarte, um einen Sitzplatz zu finden, um sich hinzusetzen, Handy und andere Mahlzeiten zu spielen | In Erwartung dieser Aufgabe, die CPU beschäftigt sich mit anderen Dingen statt                              |
| Der Teller klingelt, gehen Sie die Mahlzeit und essen Sie es                                                          | Aufgabe wird abgeschlossen, wartet auf die Anzahl der Abschnitte und fährt mit der nächsten Codezeile fort. |

Wo ist also TaskCompleteSource?

Zunächst werden wir nach dem obigen Beispiel die Mahlzeit erst abholen, wenn der Teller klingelt.Wann wird also das Essensschild klingeln?Natürlich drückte der Kellner manuell einen manuellen Schalter am Schalter, um die Glocke auszulösen.

Nun, dieser Schalter auf dem Zähler kann technisch als TaskCompleteSource interpretiert werden.

Der Tischschalter steuert das Klingeln der Platte.Ebenso ist TaskCompleteSource ein Objekt, das den Status der Aufgabe steuert.

## Lösen Sie die Idee

Mit dem, was Sie bereits über TaskCompleteSource gelernt haben, können Sie das Problem am Anfang des Artikels lösen.Die Idee ist so follows：

Wenn InsertData aufgerufen wird, können Sie eine TaskCompleteSource und eine Metagruppe von Elementen erstellen.Zur Veranschaulichung haben wir diese`BatchItem`benannt.

Geben Sie die Aufgabe für BatchItem-TaskCompleteSource zurück.

Der Code, der InsertData aufruft, wartet auf die zurückgegebene Aufgabe, sodass der Aufrufer wartet, solange die TaskCompleteSource nicht ausgeführt wird.

Anschließend wird ein separater Thread gestartet, der in regelmäßigen Abständen die BatchItem-Warteschlange verbraucht.

Damit wird der Vorgang abgeschlossen, einen einzelnen Einsatz in einen Masseneinsatz umzuwandeln.

Der Autor kann es nicht sehr klar erklären, aber alle der folgenden Versionen des Codes basieren auf den oben genannten Ideen.Leser können Wörter und Code kombinieren, um sie zu verstehen.

## ConcurrentQueue-Version

Basierend auf der obigen Idee implementierten wir ConcurrentQueue als BatchItem-Warteschlange mit dem folgenden Code (viel Code, nicht zu verheddern, da es unten einfachere gibt)：

```csharp
namespace Newbe.RxWorld.DatabaseRepository.Impl

    öffentlichen Klasse ConcurrentQueueDatabaseRepository : IDatabaseRepository
    -
        private schreibgeschützte ITestOutputHelper _testOutputHelper;
        private schreibgeschützte IDatabase _database;
        private schreibgeschützte ConcurrentQueue<BatchItem> _queue;

        / ReSharper deaktivieren, sobald PrivateFieldCanBeConvertedToLocalVariable
        private schreibgeschützte Task _batchInsertDataTask;

        öffentliche ConcurrentQueueDatabaseRepository(
            ITestOutputHelper testOutputHelper,
            IDatabase-Datenbank)
        -
            _testOutputHelper = testOutputHelper;
            _database = Datenbank;
            _queue = neue ConcurrentQueue<BatchItem>();
            / starten Sie eine BatchItem-
            _batchInsertDataTask in einer Task-Verbrauchswarteschlange . . . Task.Factory.StartNew (RunBatchInsert, TaskCreationOptions.LongRunning);
            _batchInsertDataTask.ConfigureAwait(false);


        öffentlichen Task<int> InsertData (int-Element)
        . . .
            / Build BatchItem, um Objekte in die Warteschlange zu stellen.Zurück zu Task
            der neuen TaskCompletionSource<int>();
            _queue. Enqueue(new BatchItem
            -
                Item = item,
                TaskCompletionSource = taskCompletionSource
            );
            geben TaskCompletionSource.Task;

                    
                
                
            
            
        
        .

        . Wait();

                ab (Ausnahme e)

                    _testOutputHelper.WriteLine('es ist ein Fehler : {e}");



            IEnumerable<IList<BatchItem>> GetBatches()

                var sleepTime = TimeSpan.FromMilliseconds(50);
                während (true)

                    const int maxCount = 100;
                    var oneBatchItems = GetWaitingItems()
                        . Take(maxCount)
                        . ToList();
                    , ob (oneBatchItems.Any())

                        yield oneBatchItems;

                    sonst

                        Thread.Sleep(sleepTime);



                iEnumerable<BatchItem> GetWaitingItems()

                    während (_queue. TryDequeue(out var item))

                        Yield Return Item;
<BatchItem> 

        
        
            


            var batchItems = Items als BatchItem[] ??-Elemente. ToArray();
            versuchen, den
                Einfügevorgang der Datenbank
                var totalCount s _database
            . InsertMany(batchItems.Select(x => x.Item));
                foreach (var batchItem in batchItems)

                    batchItem.TaskCompletionSource.SetResult(totalCount);

            -
            abfangen (Ausnahme e)

                foreach (var batchItem in batchItems)

                    batchItem.TaskCompletionSource.SetException(e);


                werfen;

        -

        privaten struct BatchItem
        -
            öffentliche TaskCompletionSource<int> TaskCompletionSource - get; eingestellt; •
            öffentliches int-Element - get; eingestellt; •


.
```

## Der Film beginnt!

Als Nächstes verwenden wir System.Reactive, um die komplexere Version von ConcurrentQueue oben nachzurüsten.Hier ist：

```csharp
namespace Newbe.RxWorld.DatabaseRepository.Impl

    öffentlichen Klasse AutoBatchDatabaseRepository : IDatabaseRepository

        private schreibgeschützte ITestOutputHelper _testOutputHelper;
        private schreibgeschützte IDatabase _database;
        private sediengeschützte Betreff<BatchItem> _subject;

        öffentliche AutoBatchDatabaseRepository(
            ITestOutputHelper testOutputHelper,
            IDatabase-Datenbank)

            _testOutputHelper = testOutputHelper;
            _database = Datenbank;
            _subject = neues Thema<BatchItem>();
            / Gruppenanforderungen in Gruppen von 50 Millisekunden oder alle 100
            _subject. Buffer(TimeSpan.FromMilliseconds(50), 100)
                . Wo (x s> x.Count > 0)
                / / Fügen Sie jeden Satz von Datenaufrufen in großen Mengen ein und schreiben Sie in die Datenbank
                . Select(list => Observable.FromAsync(() => BatchInsertData(list))))
                . Concat()
                . Abonnieren();


        / / Vom vorherigen Vergleich
        öffentlichen Task<int> InsertData
        . . .
            var taskCompletion .<int>.
            _subject. OnNext(neue BatchItem-
            -
                Item = Item,
                TaskCompletionSource = taskCompletionSource
            );
            geben TaskCompletionSource.Task;
        s

        / Dieser Absatz ist genau derselbe wie zuvor, keine Änderung
        privaten async Task BatchInsertData (IEnumerable<BatchItem> Items)
        s
            var batchItems s Items als BatchItems? ToArray();
            versuchen sie

                var totalCount = warten sie _database. InsertMany(batchItems.Select(x => x.Item));
                foreach (var batchItem in batchItems)

                    batchItem.TaskCompletionSource.SetResult(totalCount);

            -
            abfangen (Ausnahme e)

                foreach (var batchItem in batchItems)

                    batchItem.TaskCompletionSource.SetException(e);


                wurf;

        -

        privaten struct BatchItem
        -
            öffentliche TaskCompletionSource<int> TaskCompletionSource - get; eingestellt; •
            öffentliches int-Element - get; eingestellt; •
        ,


```

Der Code wurde um 50 Zeilen reduziert, vor allem, weil die komplexe logische Implementierung in der ConcurrentQueue-Version mit der leistungsstarken Buffer-Methode in System.Reactive implementiert wurde.

## Lehrer, kannst du mir ein wenig mehr Kraft geben?

Wir können den Code "leicht" optimieren, um Buffer und zugehörige Logik von der Geschäftslogik von "Datenbankeinfügung" zu trennen.Dann bekommen wir eine einfachere version：

```csharp
namespace Newbe.RxWorld.DatabaseRepository.Impl

    öffentlichen Klasse FinalDatabaseRepository : IDatabaseRepository

        private schreibgeschützte IBatchOperator<int, int> _batchOperator;

        öffentliches FinalDatabaseRepository(
            IDatabase-Datenbank)

            var-Optionen = neue BatchOperatorOptions-<int, int>
            -
                BufferTime = TimeSpan.FromMilliseconds(50),
                BufferCount = 100,
                DoManyFunc = Datenbank. InsertMany,
            ;
            _batchOperator = neue BatchOperator<int, int>(Optionen);


        öffentlichen Task<int> InsertData(int item)

            _batchOperator.CreateTask(item) zurückgeben.


.
```

Code wie IBatchOperator, den Leser in der Codebasis anzeigen können, wird hier nicht angezeigt.

## Leistungstests

Basic kann als follows：gemessen werden

Die ursprüngliche Version unterscheidet sich nicht wesentlich von der Massenversion, wenn es 10 reine Datenvorgänge gibt.Selbst Massenversionen sind langsamer, wenn die Zahl klein ist, schließlich gibt es eine maximale Wartezeit von 50 Millisekunden.

Wenn Sie jedoch 10.000 Datenverbrauchsmaterialien in großen Mengen bearbeiten müssen, kann die ursprüngliche Version 20 Sekunden dauern, während die Massenversion nur 0,5 Sekunden dauert.

> [finden Sie den gesamten Beispielcode in der Codebasis](https://github.com/newbe36524/Newbe.Demo).Wenn Github Clone in Schwierigkeiten ist, können[auch hier für Klonen klicken, von Gitee](https://gitee.com/yks/Newbe.Demo)

<!-- md Footer-Newbe-Claptrap.md -->
