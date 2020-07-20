---
title: 'Der erste Schritt - erstellen Sie ein Projekt und implementieren Sie einen einfachen Warenkorb'
metaTitle: 'Der erste Schritt - erstellen Sie ein Projekt und implementieren Sie einen einfachen Warenkorb'
metaDescription: 'Der erste Schritt - erstellen Sie ein Projekt und implementieren Sie einen einfachen Warenkorb'
---

Implementieren wir eine einfache "E-Commerce-Warenkorb"-Anforderung, um zu sehen, wie man sich mit Newbe.Claptrap entwickelt.

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

<!-- more -->

## Geschäftsanforderungen

Realisieren Sie eine einfache "E-Commerce-Warenkorb"-Anforderung, bei der ein paar einfache Unternehmen：

- Holen Sie sich Artikel und Mengen in Ihrem aktuellen Warenkorb
- Hinzufügen von Artikeln zu Ihrem Warenkorb
- Entfernen bestimmter Artikel aus Ihrem Warenkorb

## Installieren von Projektvorlagen

Zuerst müssen Sie sicherstellen, dass Sie die installiert haben. NetCore SDK 3.1.[Sie können hier klicken, um die neueste Version für die Installation zu erhalten](https://dotnet.microsoft.com/download)。

Nachdem das SDK installiert ist, öffnen Sie die Konsole, und führen Sie die folgenden Befehle aus, um die neuesten Projektvorlagen zu installieren.：

```bash
dotnet neu -- new installbe.Claptrap.Template
```

Nach der Installation werden die Projektvorlagen angezeigt, die bereits in den Installationsergebnissen installiert wurden.

![Newbe.claptrap Vorlage installiert](/images/20200709-001.png)

## Erstellen eines Projekts

Wählen Sie einen Speicherort aus, um einen Ordner zu erstellen, und in diesem Beispiel wird die`D:\REpa`Erstellen eines Namens mit dem Namen`HelloClaptrap`den Ordner der .Der Ordner wird als Codeordner für neue Projekte verwendet.

Öffnen Sie die Konsole, und schalten Sie das Arbeitsverzeichnis auf`D:\Repo-HelloClaptrap`。Führen Sie dann den folgenden Befehl aus, um ein Projekt zu erstellen.：

```bash
dotnet newbe.claptrap -- Name HelloClaptrap
```

> Im Allgemeinen empfehlen wir Ihnen.`D:\Repo.HelloClaptrap.`Erstellen Sie einen Ordner als Git-Lager.Verwalten Sie Ihren Quellcode mit der Versionskontrolle.

## Kompilierung und Inbetriebnahme

Sobald das Projekt erstellt wurde, können Sie die Projektmappe mit Ihrer bevorzugten IDE öffnen kompilieren.

Starten Sie nach der Kompilierung sowohl Web- als auch BackendServer-Projekte mit der Startfunktion in der IDE.(VS muss die Dienstkonsole starten, und wenn Sie IIS Express verwenden, müssen Sie die entsprechende Portnummer des Entwicklers einsehen, um auf die Webseite zugreifen zu können.)

Sobald der Start abgeschlossen ist, können Sie`http://localhost:36525/swagger`Adresse, um die API-Beschreibung des Beispielelements anzuzeigen.Dazu gehören drei Haupt-APIs：

- `Erhalten` `/api/Cart/{id}` Abrufen von Artikeln und Mengen in einem bestimmten ID-Warenkorb
- `Bereitstellen` `/api/Cart/{id}` Hinzufügen eines neuen Artikels zum Kauf der angegebenen ID
- `Löschen` `/api/Cart/{id}` Entfernen eines bestimmten Artikels aus dem Warenkorb der angegebenen ID

Sie können versuchen, mehrere Aufrufe der API über die Schaltfläche Try It Out auf der Schnittstelle durchzuführen.

> - [So starten Sie mehrere Projekte gleichzeitig in VS](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [So starten Sie mehrere Projekte in Rider gleichzeitig](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Verwenden Sie Huawei Cloud, um die Nuget-Wiederherstellungsgeschwindigkeit zu beschleunigen](https://mirrors.huaweicloud.com/)

## Zuerst Produkt hinzufügen, keine Wirkung?

Ja, Sie haben Recht.Die Projektvorlage enthält FEHLER in der Geschäftsimplementierung.

Als Nächstes öffnen wir das Projekt und beheben und beheben diese Fehler, indem wir einige Haltepunkte hinzufügen.

Und wenn Sie den BUG finden, können Sie den Codeflussprozess des Frameworks verstehen.

## Hinzufügen von Haltepunkten

Im Folgenden müssen Sie den Speicherort von Haltepunkten basierend auf den verschiedenen IDE-Anweisungen erhöhen, und Sie können die IDE auswählen, die Sie zum Betrieb gewohnt sind.

Wenn Sie derzeit keine IDE zur Hand haben, können Sie diesen Abschnitt auch überspringen und direkt lesen, was folgt.

### Visual Studio

Starten Sie beide Projekte gleichzeitig, wie oben erwähnt.

Breakpoints importieren：Öffnen Sie das Breakpoint-Fenster, klicken Sie auf die Schaltfläche, wählen Sie unter dem Element`haltepunkte.xml`Datei.Den entsprechenden Betriebsort finden Sie in den beiden Screenshots unten.

![Openpoints Breakpoints-Fenster](/images/20200709-002.png)

![Breakpoints importieren](/images/20200709-003.png)

### Fahrer

Starten Sie beide Projekte gleichzeitig, wie oben erwähnt.

Rider verfügt derzeit nicht über eine Breakpoint-Importfunktion.Daher müssen Sie Haltepunkte manuell an den folgenden Stellen erstellen.：

| Datei                         | Zeile Nr. |
| ----------------------------- | --------- |
| CartController                | 30        |
| CartController                | 34        |
| CartGrain                     | 24        |
| CartGrain                     | 32        |
| AddItemToCart-Ereignishandler | 14        |
| AddItemToCart-Ereignishandler | 28        |

> [Mit Go To File können Sie schnell ermitteln, wo sich Ihre Dateien befinden](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## Starten des Debuggens

Als Nächstes nehmen wir eine Anforderung, um zu sehen, wie der gesamte Code ausgeführt wird.

Senden wir zunächst eine POST-Anforderung über die Swagger-Schnittstelle und versuchen Sie, Artikel zum Warenkorb hinzuzufügen.

### CartController Start

Die erste Lebenslinie ist der Controller-Code für die Web-API-Schicht：

```cs
(HttpPost){id}")]
öffentliche async-Aufgabe<IActionResult> AddItemAsync (int id, [FromBody] AddItem-Eingabe)
{
    var cartgrain s _grainFactory.GetGrain<ICartGrain>(id. ToString ();
    Var-Elemente warten auf cartgrain.AddItemAsync (Eingabe. SkuId, Eingabe. Anzahl);
    Rückgabe Json (Elemente);
}
```

In diesem Code übergeben wir`_grainFactory`um eine`ICartGrain`Instanz.

Bei dieser Instanz handelt es sich im Wesentlichen um einen Proxy, der auf ein bestimmtes Korn in Backend Server verweist.

Die eingehende ID kann als eindeutiger Bezeichner für die Standortinstanz betrachtet werden.In diesem geschäftlichen Kontext kann es als "Cart-ID" oder "Benutzer-ID" verstanden werden (wenn jeder Benutzer nur einen Warenkorb hat).

Fahren Sie mit dem Debuggen fort und fahren Sie mit dem nächsten Schritt fort, sehen wir uns an, wie das Innere von ICartGrain funktioniert.

### CartGrain Start

Der nächste Stopppunkt ist der CartGrain-Code.：

```cs
öffentliche async-Aufgabe<Dictionary<string, int>> AddItemAsync (Zeichenfolge skuId, int count)
{
    var evt s.this. CreateEvent (neues AddItem ToCartEvent)
    {
        Anzahl - Anzahl,
        SkuId skuId,
    });
    await Claptrap.HandleEventAsync (evt);
    StateData.Items zurückgeben;
}
```

Hier ist der Kern der Framework-Implementierung, wie in der folgenden Abbildung gezeigt.：

![Claptrap](/images/20190228-001.gif)

Insbesondere wurde der Code auf ein bestimmtes Warenkorbobjekt ausgeführt.

Sie können durch den Debugger sehen, dass sowohl die eingehende skuId als auch die Anzahl Parameter sind, die vom Controller übergeben werden.

Hier können Sie diese Dinge tun.：

- Ändern der Daten in Claptrap mit Ereignissen
- In Claptrap gespeicherte Daten lesen

In diesem Code erstellen wir einen.`AddItemToCart-Ereignis.`Objekt, das eine Änderung am Warenkorb darstellt.

Es wird dann zur Verarbeitung an Claptrap übergeben.

Claptrap aktualisiert seine Statusdaten, nachdem das Ereignis akzeptiert wurde.

Schließlich geben wir StateData.Items an den Aufrufer zurück.(Eigentlich ist StateData.Items eine quick-Eigenschaft für Claptrap.State.Data.Items.)Es wird also noch aus Claptrap gelesen. )

Im Debugger können Sie sehen, dass die Datentypen von StateData unten angezeigt werden.：

```cs
Öffentliche Klasse CartState : IStateData
{
    öffentliches Wörterbuch<string, int> Artikel . . . get; set; . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
}
```

Dies ist der Status des in der Stichprobe entworfenen Warenkorbs.Wir verwenden eine.`Wörterbuch.`, um die SkuId im aktuellen Warenkorb und der entsprechenden Menge darzustellen.

Fahren Sie mit dem Debuggen fort, und fahren Sie mit dem nächsten Schritt fort, um zu sehen, wie Claptrap eingehende Ereignisse verarbeitet.

### AddItemToCart-Ereignishandler-Start

Auch hier ist dieser Code unten der Punkt der Unterbrechung.：

```cs
Öffentliche Klasse AddItemCartEvent Handler
    : NormalEvent-Handler<CartState, AddItemToCartEvent>
{
    ValueTask HandleEvent (CartState StateData, AddItemToCartEvent Event EventEvent,
        IEventContext-Ereigniscontext)
    {
        Var-Elemente . . . stateData.Items ? neues Wörterbuch<string, int>();
        if (Elemente. TryGetValue (eventData.SkuId, out var itemCount))
        {
            itemCount s eventData.count;
        }
        oder
        // {
        itemCount - eventData.Count;
        // }

        Artikel[eventData.SkuId] s itemCount;
        StateData.Items . . . . . . . . . . . . . . . . . .
        neue ValueTask();
    }
}
```

Dieser Code enthält zwei wichtige Parameter, die den aktuellen Warenkorbstatus darstellen.`CartState.`und Ereignisse, die behandelt werden müssen.`AddItemToCart-Ereignis.`。

Wir bestimmen, ob das Wörterbuch im Zustand SkuId seamount entsprechend den Geschäftsanforderungen enthält, und aktualisieren seine Nummer.

Fahren Sie mit dem Debuggen fort, und der Code wird bis zum Ende dieses Codes ausgeführt.

An diesem Punkt können Sie über den Debugger sehen, dass das stateData.Items-Wörterbuch um eins zugenommen hat, die Zahl jedoch 0 ist.Der Grund ist eigentlich der obige Snippet, der die Ursache für den BUG ist, der zum ersten Mal keinen Warenkorb hinzufügt.

Unterbrechen Sie hier das Debuggen nicht sofort.Lassen Sie uns fortfahren und lassen Sie den Code durchgehen, um zu sehen, wie der gesamte Prozess endet.

In der Tat, fortsetzung des Debuggens, der Haltepunkt trifft das Ende der cartGrain und CartController Methoden wiederum.

## Dies ist eigentlich eine dreistufige Architektur!

Die überwiegende Mehrheit der Entwickler versteht die dreistufige Architektur.In der Tat können wir auch sagen, dass Newbe. Claptrap eigentlich eine dreistufige Architektur ist.Vergleichen wir es in einer Tabelle.：

| Traditionelle dreistufige       | Newbe.Claptrap     | Beschreibung                                                                                                                        |
| ------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Präsentationspräsentationsebene | Controller-Schicht | Wird zum Andocken externer Systeme verwendet, um externe Interoperabilität zu gewährleisten                                         |
| Business Business-Stufe         | Kornschicht        | Geschäftsverarbeitung basierend auf eingehenden Geschäftsparametern (Beispiel schreibt kein Urteil, muss die Anzahl beurteilen > 0) |
| Persistenzpersistenz-Layer      | EventHandler-Layer | Aktualisieren der Geschäftsergebnisse                                                                                               |

Natürlich ist die obige Analogie eine einfache Beschreibung.Im konkreten Prozess gibt es keine Notwendigkeit, zu verheddert zu sein, dies ist nur ein zusätzliches Verständnis der Aussage.

## Sie haben auch einen BUG zu beheben

Dann gehen wir zurück und beheben das vorherige "First Join Products Don't Take Effect"-Problem.

### Dies ist ein Rahmen für die Prüfung von Komponenten

Die Projektvorlage enthält ein Projekt.`HelloClaptrap.Actors.Tests.`Das Projekt enthält Komponententests des Hauptgeschäftscodes.

Wir wissen jetzt, dass`AddItem ToCart-Ereignishandler.`Der Code in den Kommentaren ist die Hauptursache für den FEHLER.

Wir können es nutzen.`dotnet-Test.`Wenn Sie die Komponententests im Testprojekt ausführen, werden zwei Fehler angezeigt:

```bash
Insgesamt 1 Testdateien stimmten mit dem syd dh'fydd-Muster überein.
  X AddFirstOne [130ms]
  Fehlermeldung:
   D'Value ist 10, wurde jedoch 0 gefunden.
  Stapelüberwachung:
     bei FluentS. Execution.LateTestBoundFramework.Throw (Zeichenfolgennachricht)
   bei FluentS. Execution.TestFramework Provider.T. Throw
   bei FluentS. Execution.DefaultKStrategy.HandleFailure (String Message)
   Bei FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   Bei FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   bei FluentS. Execution.Ax. Scope.FailWith (String-Nachricht, Objekt?args)
   bei FluentS.Numeric.NumericS'1.Be (T erwartet, String because, Object' becauseArgs)
   At HelloClaptrap.Actors.Tests.Cart.Events.AddItemCartEventHandler.AddFirstOne() in D:\Repo?HelloClaptrap?HelloClaptrap?HelloClaptrap.Actors.Tests?Cart?Events?AddToCartEventHandlerTest.cs: zeile 32
   At HelloClaptrap.Actors.Tests.Cart.Events.AddItemCartEventHandler.AddFirstOne() in D:\Repo?HelloClaptrap?HelloClaptrap?HelloClaptrap.Actors.Tests?Cart?Events?AddToCartEventHandlerTest.cs: zeile 32
   unter NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter'1.GetResult ()
   bei NUnit.Framework.Internal.AsyncToSyncAdapter.Await (Func'1-Aufruf)
   unter NUnit.Framework.Internal.Commands.TestMethodCommand.RunTestMethod (TestExecution-Kontext)
   unter NUnit.Framework.Internal.Commands.TestMethod Command.Execute (TestExecution Context)
   bei NUnit.Framework.Internal.Execution SimpleWorkItem.PerformWork()

  X RemoveOne [2ms]
  Fehlermeldung:
   D'Value ist 90, aber gefunden 100.
  Stapelüberwachung:
     bei FluentS. Execution.LateTestBoundFramework.Throw (Zeichenfolgennachricht)
   bei FluentS. Execution.TestFramework Provider.T. Throw
   bei FluentS. Execution.DefaultKStrategy.HandleFailure (String Message)
   Bei FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   Bei FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   bei FluentS. Execution.Ax. Scope.FailWith (String-Nachricht, Objekt?args)
   bei FluentS.Numeric.NumericS'1.Be (T erwartet, String because, Object' becauseArgs)
   At HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemCartEventHandlerHandler.RemoveOne() in D:\Repo?HelloClaptrap?HelloClap.Actors.Tests?Cart?Events\RMoveItem von CartEvent HandlerTest.cs: Zeile 40
   At HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemCartEventHandlerHandler.RemoveOne() in D:\Repo?HelloClaptrap?HelloClap.Actors.Tests?Cart?Events\RMoveItem von CartEvent HandlerTest.cs: Zeile 40
   unter NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter'1.GetResult ()
   bei NUnit.Framework.Internal.AsyncToSyncAdapter.Await (Func'1-Aufruf)
   unter NUnit.Framework.Internal.Commands.TestMethodCommand.RunTestMethod (TestExecution-Kontext)
   unter NUnit.Framework.Internal.Commands.TestMethod Command.Execute (TestExecution Context)
   bei NUnit.Framework.Internal.Execution SimpleWorkItem.PerformWork()


Testlauf fehlgeschlagen.
Tests insgesamt: 7
     Bestanden: 5
     Fehlgeschlagen: 2

```

Sehen wir uns den Code für einen der fehlerhaften Komponententests an.：

```cs
[Test]
öffentliche async-Aufgabe AddFirstOne ()
{
    verwenden var mocker - AutoMock.GetStrict ();

    await verwenden var handler s-mocker. Erstellen<AddItemToCartEventHandler>();
    var state s new CartState ();
    var evt s neues AddItemToCartEventEvent
    {
        SkuId skuId1,
        Anzahl s 10
    };
    await Handler. HandleEvent (Status, evt, default);

    Staat. Items.Count.Down.) Seien Sie (1);
    var (Schlüssel, Wert) s Zustand. Items.Single();
    Schlüssel. "Was") Be (evt. SkuId);
    Wert. "Was") Be (evt. Anzahl);
}
```

`AddItem ToCart-Ereignishandler.`ist die Haupttestkomponente dieses Tests, und da sowohl stateData als auch das Ereignis manuell erstellt werden, ist es für Entwickler einfach, Szenarien zu erstellen, die bei Bedarf getestet werden müssen.Es gibt keine Notwendigkeit, etwas Besonderes zu bauen.

Nun, solange es so lange ist.`AddItem ToCart-Ereignishandler.`Stellen Sie den kommentierten Code wieder her, und führen Sie den Komponententest erneut aus.Komponententests bestehen.FEHLER WERDEN NATÜRLICH AUCH BEHOBEN.

Natürlich gibt es einen weiteren Komponententest des Löschszenarios oben, der fehlschlägt.Entwickler können dieses Problem beheben, indem sie den oben beschriebenen Ideen "Breakpoint" und "Unit Test" folgen.

## Die Daten wurden beibehalten.

Sie können versuchen, Backend Server und das Web neu zu starten, und Sie werden feststellen, dass die Daten, an denen Sie zuvor gearbeitet haben, beibehalten wurden.

Wir werden es in einem späteren Kapitel weiter behandeln.

## Zusammenfassung

Durch diesen Artikel haben wir ein vorläufiges Verständnis dafür, wie ein grundlegendes Projektframework erstellt wird, um ein einfaches Warenkorbszenario zu implementieren.

Es gibt viele Dinge, die wir nicht im Detail erklären müssen.：Projektstruktur, Bereitstellung, Persistenz und mehr.Sie können weiter lesen, um mehr zu erfahren.
