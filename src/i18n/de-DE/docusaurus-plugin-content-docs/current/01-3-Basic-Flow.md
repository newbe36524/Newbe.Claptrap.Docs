---
title: "Schritt 3 - Verstehen der Projektstruktur"
description: "Schritt 3 - Verstehen der Projektstruktur"
---

Sehen sie sich neben dem [Schritt 2 - Erstellen von Projekt](01-3-Basic-Flow.md) die Projektstruktur an, die mit der Projektvorlage Newbe.Claptrap erstellt wurde.

<!-- more -->

## Die Lösungsstruktur

Verwenden Sie Visual Studio oder Rider, um eine Lösung im Stammverzeichnis der`helloClaptrap .sln`zu öffnen.

Die Lösung enthält mehrere Lösungsordner, von denen jeder wie follows：

| Der Lösungsordner | Beschreibung                                                                                                                                                                                               |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0_Infrastructure  | Infrastruktur.Hier können Sie einige häufig verwendete Modelle, allgemeine Klassenbibliotheken usw. platzieren.Sie werden in der Regel von mehreren anderen Projekten                                      |
| 1_Business        | Geschäftslogik.Hier können Sie einige kerngeschäftliche Klassenbibliotheken platzieren.Beispielsweise Speicherebenen, Geschäftsebenen usw.Insbesondere können hier spezifische Implementierungen von Actor |
| 2_Application     | Anwendung.Hier können Sie laufende Anwendungen platzieren, die einige WebApi-, Grpc-Dienste, Actor-Laufprozesse usw. enthalten können.                                                                     |
| SolutionItems     | Einige Dateien auf Lösungsebene, z. B. nuget.config, tye.yml, Directory.Build.props usw.                                                                                                                   |

Dies sind nur die einfachsten Lösungsstrukturen, die in der Projektdemonstration enthalten sind.In der tatsächlichen Entwicklung müssen Sie häufig beitreten, Lagerschnittstellen, Komponententests, Backoffice-Services und andere Inhalte.Entwickler können sie nach Teamregeln positionieren.

## Erfahren Sie mehr über das Aufrufen von Links

Jetzt verstehe ich den Prozess der Ausführung von Newbe.Claptrap mit einem einfachen Anruflink.

Sehen wir uns die `get/AuctionItems/{itemId}`den Prozess an.

### API-Schicht

Wenn die API aufgerufen wird, ist der erste natürliche Eintrag der`Controller`.Zu den entsprechenden Projektvorlagen gehören`AuctionItemsController-`unter dem`HelloClaptrap.WebApi-`-Projekt, und die folgenden Abschnitte zu dieser API sind：

```cs AuctionItemsController.cs
Mit System.Threading.Tasks;
mit Dapr.Actors;
, dapr.Actors.Client zu verwenden;
mit HelloClaptrap.IActor;
mit HelloClaptrap.Models;
microsoft.AspNetCore.Mvc verwenden;
mit Newbe.Claptrap;
mit Newbe.Claptrap.Dapr;

Namespace HelloClaptrap.WebApi.Controllers

    [ApiController]
    [Route("[controller]")]
    öffentlichen Klasse AuctionItemsController : ControllerBase
    -
        private schreibgeschützte IActorProxyFactory _actorProxyFactory;

        öffentlichen AuctionItemsController(
            IActorProxyFactory actorProxyFactory)

            _actorProxyFactory = actorProxyFactory;


        [httpGet("{itemId}/status")]
        öffentliche async Task<IActionResult> GetStatus(int itemId = 1)

            var id = neue ClaptrapIdentity(itemId.ToString(),
                ClaptrapCodes.AuctionItemActor);
            var auctionItemActor = _actorProxyFactory.GetClaptrap<IAuctionItemActor>(id);
            var status = warten auctionItemActor.GetStatusAsync();
            var result = neue
            {
                status
            };
            geben Ok(result);

    -

```

Dieser Code gibt an, dass：

1. `GetStatus`zuerst`ClaptrapIdentity`erstellt, das ist die[Claptrap Identity](https://claptrap.newbe.pro/zh_Hans/docs/02-10-Claptrap-Identity), die verwendet wird, um eine bestimmte`Claptrap`
2. Der nächste Aufruf`_actorProxyFactory`, um den Proxy eines Schauspielers abzurufen.Dies wird durch eine Schnittstelle von Dapr implementiert.
3. Rufen Sie die`GetStatusAsync-`für die erstellte`auctionItemActor`-Agent auf, sodass Sie die Methode für die entsprechende Claptrap-Instanz aufrufen können.
4. Die von Claptrap zurückgegebenen Ergebnisse werden umschlossen und als API-Ergebnisse zurückgegeben.

Dies ist eine einfache Darstellung der API-layer：-Methode, die Actor aufruft, indem ein Actor-Proxy erstellt wird.Die API-Schicht ist eigentlich die Einlassschicht des Systems.Sie können die API mehr als nur auf eine rastvolle Weise verfügbar machen.Es ist durchaus möglich, Grpc oder etwas anderes zu verwenden.

### Claptrap-Schicht

ist das Herzstück des Schreibens von Geschäftscode, der, wie Controller in MVC, dem Kernzweck der Geschäftslogiksteuerung dient.

Sehen wir uns als Nächstes an, wie die Claptrap-Ebene sowohl schreibgeschützt als auch schreibgeschützt funktioniert.

#### Schreibgeschützte Claptrap-Layer-Operationen

Werfen wir einen Blick auf die Funktionsweise der Claptrap-Schicht.Mit der IDE-Funktion "Implementierung suchen" finden Sie`AuctionItemActor`für die Implementierungsklasse für das Projekt`IAuctionItemActor`im`HelloClaptrap.Actors`-Projekt, und hier sind einige der Abschnitte, die sich auf die`GetStatus Async`method：

```cs AuctionItemActor.cs
mit System.Linq;
mit System.Threading.Tasks;
mit Dapr.Actors.Runtime;
mit HelloClaptrap.Actors.AuctionItem.Events;
mit HelloClaptrap.IActor;
mit HelloClaptrap.Models;
mit HelloClaptrap.Models.AuctionItem;
mit HelloClaptrap.Models.AuctionItem.Events;
mit Newbe.Claptrap;
mit Newbe.Claptrap.Dapr;

Namespace HelloClaptrap.Actors.AuctionItem

    [Actor(TypeName = ClaptrapCodes.AuctionItemActor)]
    [ClaptrapStateInitialFactoryHandler(typeof(AuctionItemActorInitialStateDataFactory))]
    [ClaptrapEventHandler(typeof(NewBidderEventHandler), ClaptrapCodes.NewBidderEvent)]
    public class)] AuctionItemActor : ClaptrapBoxActor<AuctionItemState>, IAuctionItemActor

        private swertierbari_clock;

        öffentlichen AuctionItemActor(
            ActorHost actorHost,
            IClaptrapActorCommonService claptrapActorCommonService,
            IClock Uhr) : base(actorHost, claptrapActorCommonService)
        -
            _clock = Uhr;


        öffentlichen Task<AuctionItemStatus> GetStatusAsync()

            - -Task.FromResult(GetStatusCore()) zurückgeben.


        privaten AuctionItemStatus GetStatusCore()

            var jetzt = _clock. UtcNow;
            if (jetzt < stateData.StartTime)

                AuctionItemStatus.Planned zurückgeben.


            wenn (jetzt > stateData.StartTime && jetzt stateData.EndTime < )
            ,
                AuctionItemStatus.OnSell zurückgeben;


            stateData.BiddingRecords?. Any() == wahr ? AuctionItemStatus.Sold : AuctionItemStatus.UnSold;



```

Dieser Code gibt an, dass：

1. ` <code>Attribut-` sind auf der auctionItemActor markiert, die `eine wichtige` s für das Scannen von Systemscans `Claptrap` Komponenten bieten.Die Features werden in den nachfolgenden Artikeln ausführlicher erläutert.
2. `Der AuctionItemActor` `ClaptrapBoxActor<AuctionItemState>`geerbt.Durch das Vererben dieser Klasse wird auch `Unterstützung` Event-Sourcing zur Anwendung des Akteurs hinzugefügt.
3. `TheActor` Konstruktor hat die `ActorHost` und `IClaptrapActorCommonService`eingeführt.Wobei `ActorHost-` ein Parameter ist, der vom Dapr SDK bereitgestellt wird und grundlegende Informationen wie die ID und den Typ des aktuellen Actor darstellt. `IClaptrapActorCommonService` ist die Vom Claptrap-Framework bereitgestellte Dienstschnittstelle, und das gesamte Verhalten von Claptrap wird durch Ändern der relevanten Typen in der Schnittstelle implementiert.
4. `GetStatusAsync` Daten direkt aus dem Zustand in Claptrap lesen.Aufgrund des Ereignisbeschaffungsmechanismus können Entwickler immer denken, dass State in Claptrap immer im richtigen, aktuellen und verfügbaren Zustand ist.Sie können Statusdaten in Claptrap immer vertrauen, ohne darüber nachzudenken, wie Sie mit der Persistenzschicht interagieren.

#### Claptrap-Layer schreibt

Schreibgeschützte Claptrap-Vorgänge sind Vorgänge, die Actor aufrufen, ohne den Claptrap-Status zu ändern.Der Schreibvorgang ist es wert, dass Der Schauspieler den Zustand von Claptrap ändert.Aufgrund des Ereignisrückverfolgbarkeitsmechanismus müssen Sie ihn durch Ereignisse ändern, um den Status von Claptrap zu ändern.Sie können die von Claptrap`, indem Sie die TryBidding-Methode verwenden, um zu erfahren, wie Sie eine event：

```cs
mit System.Linq;
mit System.Threading.Tasks;
mit Dapr.Actors.Runtime;
mit HelloClaptrap.Actors.AuctionItem.Events;
mit HelloClaptrap.IActor;
mit HelloClaptrap.Models;
mit HelloClaptrap.Models.AuctionItem;
mit HelloClaptrap.Models.AuctionItem.Events;
mit Newbe.Claptrap;
mit Newbe.Claptrap.Dapr;

Namespace HelloClaptrap.Actors.AuctionItem

    [Actor(TypeName = ClaptrapCodes.AuctionItemActor)]
    [ClaptrapStateInitialFactoryHandler(typeof(AuctionItemActorInitialStateDataFactory))]
    [ClaptrapEventHandler(typeof(NewBidderEventHandler), ClaptrapCodes.NewBidderEvent)]
    public class)] AuctionItemActor : ClaptrapBoxActor<AuctionItemState>, IAuctionItemActor

        private swertierbari_clock;

        öffentlichen AuctionItemActor(
            ActorHost actorHost,
            IClaptrapActorCommonService claptrapActorCommonService,
            IClock Uhr) : base(actorHost, claptrapActorCommonService)
        -
            _clock = Uhr;


        öffentlichen Task<TryBiddingResult> TryBidding(TryBiddingInput-Eingabe)

            var-Status = GetStatusCore();

            if (Status != AuctionItemStatus.OnSell)
            ,
                Task.FromResult(CreateResult(false)) zurückgeben;


            if (Eingang. Preis <= GetTopPrice())

                Los.FromResult(CreateResult(false)) zurückgeben;


            HandleCoreAsync();

            async Task<TryBiddingResult> HandleCoreAsync()

                var dataEvent = this. CreateEvent(new NewBidderEvent
                -
                    Price = Eingabe. Preis,
                    UserId = Eingabe. UserId
                )
                claptrap.HandleEventAsync(dataEvent);
                createResult(true);


            TryBiddingResult CreateResult(bool success)

                geben Sie neue()
                zurück,
                    Erfolg,
                    NowPrice = GetTopPrice(),
                    UserId = Eingabe. UserId,
                    AuctionItemStatus = Status
                ;
            -

            -Dezimal-GetTopPrice()

                -Rückgabe von StateData.BiddingRecords?. Any() == true
                    ? stateData.BiddingRecords.First(). Schlüssel
                    : StateData.BasePrice;


    -

```

Dieser Code gibt an, dass：

1. Daten können über den Claptrap-Status überprüft werden, bevor Ereignisse generiert werden, um zu bestimmen, ob das nächste Ereignis generiert werden soll.Dies ist notwendig, weil es unnötige Ereignisse verhindert.Dies ist in Bezug auf DieBetriebslogik, Persistenzraum oder Ausführungseffizienz erforderlich.
2. Sobald die erforderliche Überprüfung erfolgt ist, können Sie dies `. CreateEvent` , um ein Ereignis zu erstellen.Dies ist eine Erweiterungsmethode, die einige der zugrunde liegenden Informationen zu Event erstellt.Entwickler müssen sich nur um den Abschnitt für benutzerdefinierte Geschäftsdaten kümmern.Für `NewBidderEvent` sind die Geschäftsdaten, über die Entwickler besorgt sein müssen.
3. Sobald die Ereigniserstellung abgeschlossen ist, können Sie die `handleEventAsync` das Claptrap-Objekt speichern und ausführen.Bei dieser Methode behält Claptrap das Ereignis bei und ruft Handler auf, um den Status von Claptrap zu aktualisieren.Im Folgenden wird beschrieben, wie Handler geschrieben wird
4. Nach dem Aufruf `HandleEventAsync` wurde das Ereignis erfolgreich beibehalten, wenn keine Fehler vorliegen.Und Sie können denken, dass State in Claptrap korrekt aktualisiert wurde.Daher können die neuesten Daten nun aus dem Status gelesen und an den Aufrufer zurückgegeben werden.

### Handler-Layer

Die Handler-Schicht ist für die Ausführung der Geschäftslogik des Ereignisses und das Aktualisieren der Daten in Status verantwortlich.Denn sowohl Ereignis als auch Zustand sind Objekte im Speicher, also.Die Codeimplementierung von Handler ist im Allgemeinen sehr einfach.Hier ist der Handler `ausgelöst, wenn die` NewBidderEvent ausgelöst wird.

```cs NewBidderEventHandler.cs
Mit System.Threading.Tasks;
mit HelloClaptrap.Models.AuctionItem;
mit HelloClaptrap.Models.AuctionItem.Events;
mit Newbe.Claptrap;

Namespace HelloClaptrap.Actors.AuctionItem.Events

    öffentlichen Klasse NewBidderEventHandler
        : NormalEventHandler<AuctionItemState, NewBidderEvent>

        private schreibgeschützte IClock _clock;

        öffentlichen NewBidderEventHandler(
            IClock-Uhr)

            _clock = Uhr;


        öffentliche überschreiben ValueTask HandleEvent(AuctionItemState stateData,
            NewBidderEvent eventData,
            IEventContext eventContext)

            wenn (stateData.BiddingRecords == null)

                stateData.InitBiddingRecords();


            var-Datensätze = stateData.BiddingRecords;

            Datensätze. Add(eventData.Price, neue BiddingRecord
            -
                Price = eventData.Price,
                BiddingTime = _clock. UtcNow,
                UserId = eventData.UserId
            )
            stateData.BiddingRecords = Datensätze;
            ValueTask.CompletedTask zurückgeben;



```

Dieser Code gibt an, dass：

1. `NewBidderEventHandler` `NormalEventHandler` als Basisklasse geerbt, die in erster Linie hinzugefügt wurde, um Handlerimplementierungen zu vereinfachen.Seine generischen Parameter sind der Statustyp, der Claptrap entspricht, und der EventData-Typ für Event.
2. Handler implementiert die HandleEvent `-Methode, die vom` normaleventhandler `der` -Klasse geerbt wurde.Der Hauptzweck dieser Methode besteht darin, den Status zu aktualisieren.

Zusätzlich zu dem oben genannten offensichtlichen Code gibt es einige wichtige Funktionsmechanismen für Handler, die here：

1. Handler erfordert die Verwendung eines Tags für den entsprechenden Actor-Typ.Dies ist `Rolle, die Claptrap Event Handler, ClaptrapCodes.NewBidderEvent` in AuctionItemActor, spielt.
2. Handler implementiert `IDispose-` und `IAsyncDispose-` -Schnittstellen.Dies weist darauf hin, dass Handler bei Bedarf bei der Behandlung von Ereignissen erstellt wird.Sie können die Anweisungen in Der Lebenszyklus von Objekten im TODO-Claptrap-System lesen.
3. Aufgrund des Ereignisbeschaffungsmechanismus sollten Entwickler beim Schreiben von Handler die Idempotentität `Logik in der handleEvent` -Methode berücksichtigen.Mit anderen Worten, Sie müssen sicherstellen, dass die gleichen Parameter `handleEvent` der handleEvent-Methode und genau die gleichen Ergebnisse abrufen.Andernfalls können unerwartete Ergebnisse auftreten, wenn die Übung nachverfolgt wird.Sie können die Anweisungen in HOW TODO Ereignisse und Staaten arbeit lesen.

Mit dem Handler-Layer können Sie den Status durch Ereignisse aktualisieren.

## Zusammenfassung

In diesem Artikel behandeln wir die wichtigsten Projektstrukturebenen und Schlüsselkomponenten im Claptrap-Projekt.Durch das Verständnis dieser Komponenten konnten Entwickler verstehen, wie APIs verfügbar gemacht, Ereignisse generiert und der Status aktualisiert werden kann.Dies ist auch der einfachste notwendige Schritt, um Claptrap zu verwenden.

Als Nächstes zeigen wir Ihnen, wie Sie Minion verwenden.

<!-- md Footer-Newbe-Claptrap.md -->
