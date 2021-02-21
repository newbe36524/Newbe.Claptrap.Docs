---
title: 'Der erste Schritt besteht darin, ein Projekt zu erstellen und einen einfachen Warenkorb zu implementieren.'
description: 'Der erste Schritt besteht darin, ein Projekt zu erstellen und einen einfachen Warenkorb zu implementieren.'
---

Implementieren wir eine einfache "E-Commerce-Warenkorb"-Anforderung, um zu verstehen, wie man sich mit Newbe.Claptrap entwickelt.

<!-- more -->

:::caution 该文档仅适用于 0.7 及以下版本，若想要查看最新版本内容，请点击右上角进行切换。 :::

## Geschäftsanforderungen

Realisieren Sie eine einfache "E-Commerce-Warenkorb"-Anforderung, hier, um ein paar einfache Business-：zu erreichen

- Abrufen der Artikel und Mengen im aktuellen Warenkorb
- Hinzufügen von Artikeln zu Ihrem Warenkorb
- Entfernen eines bestimmten Artikels aus Ihrem Warenkorb

## Installieren der Projektvorlage

Zuerst müssen Sie sicherstellen, dass die . NetCore SDK 3.1[können hier klicken, um die neueste Version der Installation](https://dotnet.microsoft.com/download).

Nachdem das SDK installiert ist, öffnen Sie die Konsole, und führen Sie die folgenden Befehle aus, um die neueste Projekt- template：

```bash
dotnet neu --install Newbe.Claptrap.Template
```

Nach der Installation können Sie die Projektvorlagen sehen, die in den Installationsergebnissen installiert wurden.

![newbe.claptrap.template installiert](/images/20200709-001.png)

## Erstellen eines Projekts

Wählen Sie einen Speicherort aus, erstellen Sie einen Ordner, und in diesem Beispiel wird ein Ordner mit dem Namen`helloClaptrap`unter`D:\Repo`erstellt.Der Ordner fungiert als Codeordner für das neue Projekt.

Öffnen Sie die Konsole, und wechseln Sie das Arbeitsverzeichnis auf`D:\Repo/HelloClaptrap`.Anschließend können Sie eine Projektumgebung erstellen, indem Sie die folgenden commands：

```bash
dotnet newbe.claptrap --name HelloClaptrap
```

> Im Allgemeinen empfehlen wir`D:\Repo.helloClaptrap`als Git-Lagerordner.Verwalten Sie Ihren Quellcode über die Versionskontrolle.

## Kompilierung und Inbetriebnahme

Sobald das Projekt erstellt wurde, können Sie die Projektmappe mit Ihrer bevorzugten IDE öffnen, um sie zu kompilieren.

Wenn die Kompilierung abgeschlossen ist, starten Sie die Web- und BackendServer-Projekte mit der Startfunktion in der IDE.(VS muss den Dienst als Konsole starten, und wenn Sie IIS Express verwenden, müssen Sie die entsprechende Portnummer anzeigen, um auf die Webseite zugreifen zu können.)

Nach dem Start können Sie`http://localhost:36525/swagger`Beschreibung des Beispielprojekts mithilfe der Adresse anzeigen.Dazu gehören drei Haupt-API-：

- `GET` `/api/Cart/{id}` , um die Artikel und Mengen in einem bestimmten ID-Warenkorb zu erhalten
- `posten` `/api/cart/{id}` , um dem Kauf der angegebenen ID neue Artikel hinzuzufügen
- `löschen` `/api/cart/{id}` entfernen Sie einen bestimmten Artikel aus dem Warenkorb der angegebenen ID

Sie können versuchen, mehrere Aufrufe an die API mithilfe der Schaltfläche Try It Out auf der Schnittstelle durchzuführen.

> - [So starten Sie mehrere Projekte gleichzeitig in VS](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [So starten Sie mehrere Projekte in Rider gleichzeitig](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Verwenden Sie Huawei Cloud, um die Nuget-Wiederherstellungsgeschwindigkeit zu beschleunigen](https://mirrors.huaweicloud.com/)

## Wenn Sie ein Element zum ersten Mal hinzufügen, funktioniert es nicht?

Ja, Sie haben Recht.Die Geschäftsimplementierung in der Projektvorlage ist fehlerbasiert.

Öffnen wir das Projekt, beheben und beheben diese BUGes, indem wir einige Haltepunkte hinzufügen.

Und durch die Positionierung von BUGs können Sie den Codeflussprozess des Frameworks verstehen.

## Hinzufügen eines Haltepunkts

Im Folgenden basiert auf verschiedenen IDE-Anweisungen, um die Position des Haltepunkts zu erhöhen, können Sie Ihre übliche IDE auswählen.

Wenn Sie derzeit keine IDE zur Hand haben, können Sie diesen Abschnitt überspringen und den folgenden Abschnitt direkt lesen.

### Visual Studio

Starten Sie beide Projekte gleichzeitig, wie oben erwähnt.

Importieren Sie Breakpoint：öffnen Sie das Breakpoint-Fenster, klicken Sie auf die Schaltfläche, und wählen Sie die`Haltepunkte .xml`Elements aus.Den entsprechenden Standort finden Sie in den folgenden beiden Screenshots.

![Fenster "Breakpoints öffnen"](/images/20200709-002.png)

![Breakpoints importieren](/images/20200709-003.png)

### Fahrer

Starten Sie beide Projekte gleichzeitig, wie oben erwähnt.

Rider verfügt derzeit nicht über eine Breakpoint-Importfunktion.Daher müssen Sie in den folgenden：manuell Haltepunkte erstellen.

| Datei                     | Die Zeilennummer |
| ------------------------- | ---------------- |
| CartController            | 30               |
| CartController            | 34               |
| CartGrain                 | 24               |
| CartGrain                 | 32               |
| AddItemToCartEventHandler | 14               |
| AddItemToCartEventHandler | 28               |

> [Go To File hilft Ihnen, schnell zu finden, wo sich Ihre Dateien befinden](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## Starten des Debuggens

Sehen wir uns als Nächstes den gesamten Code an, der durch eine Anforderung ausgeführt wird.

Senden wir zunächst eine POST-Anforderung über die Swagger-Schnittstelle und versuchen Sie, Artikel zum Warenkorb hinzuzufügen.

### CartController Start

Der erste fatale Haltepunkt ist der Controller-Code in der Web-API：

```cs
[HttpPost("{id}")]
public async Task<IActionResult> AddItemAsync(int id, [FromBody] AddItemInput input)
{
    var cartGrain = _grainFactory.GetGrain<ICartGrain>(id.ToString());
    var items = await cartGrain.AddItemAsync(input.SkuId, input.Count);
    return Json(items);
}
```

In diesem Code verwenden wir die`_grainFactory`, um eine`Instanz der ICartGrain-`-Instanz zu erstellen.

Bei dieser Instanz handelt es sich im Wesentlichen um einen Proxy, der auf ein bestimmtes Korn im Backend Server verweist.

Eine eingehende ID kann als Suchen einer Instanz mit einem eindeutigen Bezeichner betrachtet werden.In diesem geschäftlichen Kontext kann es als "Warenkorb-ID" oder "Benutzer-ID" verstanden werden (wenn jeder Benutzer nur einen Warenkorb hat).

Wenn wir mit dem Debuggen fortfahren und mit dem nächsten Schritt fortfahren, werfen wir einen Blick darauf, wie ICartGrain im Inneren funktioniert.

### CartGrain Start

Als nächstes ist der CartGrain-Code：

```cs
public async Task<Dictionary<string, int>> AddItemAsync(string skuId, int count)
{
    var evt = this.CreateEvent(new AddItemToCartEvent
    {
        Count = count,
        SkuId = skuId,
    });
    await Claptrap.HandleEventAsync(evt);
    return StateData.Items;
}
```

Dies ist der Kern der Rahmenimplementierung, und die wichtigsten Elemente, die in den folgenden：

![Claptrap](/images/20190228-001.gif)

Insbesondere wurde der Code auf ein bestimmtes Warenkorbobjekt ausgeführt.

Sie können durch den Debugger sehen, dass sowohl die eingehende skuId als auch die Anzahl Parameter sind, die vom Controller übergeben werden.

Hier können Sie die following：

- Die Daten in Claptrap werden durch ein Ereignis
- Lesen der in Claptrap gespeicherten Daten

In diesem Code erstellen wir eine`AddItemToCartEvent`Objekt, um eine Änderung am Warenkorb darzustellen.

Es wird dann zur Verarbeitung an Claptrap übergeben.

Claptrap aktualisiert seine Statusdaten, nachdem das Ereignis akzeptiert wurde.

Schließlich geben wir StateData.Items an den Aufrufer zurück.(StateData.Items ist eigentlich eine Verknüpfungseigenschaft von Claptrap.State.Data.Items.)So wird es tatsächlich aus Claptrap gelesen. ）

Mit dem Debugger können Sie sehen, dass der Datentyp von StateData wie：

```cs
public class CartState : IStateData
{
    public Dictionary<string, int> Items { get; set; }
}
```

Dies ist der Status des in der Stichprobe entworfenen Warenkorbs.Verwenden wir ein`Wörterbuch`, um die SkuId im aktuellen Warenkorb und die Zahl, der sie entspricht, darzustellen.

Fahren Sie mit dem Debuggen fort, und fahren Sie mit dem nächsten Schritt fort, und sehen wir uns an, wie Claptrap eingehende Ereignisse verarbeitet.

### AddItemToCartEventHandler-Start

Auch hier ist der folgende Code der：

```cs
public class AddItemToCartEventHandler
    : NormalEventHandler<CartState, AddItemToCartEvent>
{
    public override ValueTask HandleEvent(CartState stateData, AddItemToCartEvent eventData,
        IEventContext eventContext)
    {
        var items = stateData.Items ?? new Dictionary<string, int>();
        if (items.TryGetValue(eventData.SkuId, out var itemCount))
        {
            itemCount += eventData.Count;
        }
        // else
        // {
        //     itemCount = eventData.Count;
        // }

        items[eventData.SkuId] = itemCount;
        stateData.Items = items;
        return new ValueTask();
    }
}
```

这段代码中，包含有两个重要参数，分别是表示当前购物车状态的 CartState 和需要处理的事件 AddItemToCartEvent。

Wir bestimmen, ob das Wörterbuch im Status SkuId enthält und aktualisieren seine Menge entsprechend unseren Geschäftsanforderungen.

Fahren Sie mit dem Debuggen fort, und der Code wird bis zum Ende des Codes ausgeführt.

An dieser Stelle können Sie mit dem Debugger sehen, dass das stateData.Items-Wörterbuch eine weitere hinzufügt, die Zahl jedoch 0 ist.Der Grund ist eigentlich der kommentierte andere Snippy-Code oben, was die Ursache für den BUG ist, der immer nicht zum ersten Mal den Warenkorb hinzufügt.

Unterbrechen Sie hier das Debuggen nicht sofort.Kommen wir zum Debuggen und lassen Sie den Code durchlaufen, um zu sehen, wie der gesamte Prozess endet.

In der Tat, fortsetzen Sie das Debuggen, und der Ausbruch wird das Ende der Methode für CartGrain und CartController wiederum treffen.

## Dies ist eigentlich eine dreistufige Architektur!

Die überwiegende Mehrheit der Entwickler versteht die dreistufige Architektur.In der Tat können wir auch sagen, dass Newbe.Claptrap tatsächlich eine dreistufige Architektur ist.Vergleichen wir die Ergebnisse mit einem table：

| Traditionelle drei Etagen   | Newbe.Claptrap     | Beschreibung                                                                                                                                                  |
| --------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Präsentations-Layer         | Controller-Schicht | Wird zur Schnittstelle mit externen Systemen und zur Bereitstellung externer Interoperabilität verwendet                                                      |
| Business-Layer              | Kornschicht        | Geschäftsverarbeitung eingehender Geschäftsparameter auf der Grundlage des Geschäfts (kein Urteil wird tatsächlich in der Stichprobe geschrieben, Zählen > 0) |
| Persistenzpersistenzschicht | EventHandler-Layer | Aktualisieren der Geschäftsergebnisse                                                                                                                         |

Natürlich ist die obige Ähnlichkeit nur eine einfache Beschreibung.Dabei muss man sich nicht zu verheddern, das ist nur ein Hilfsverständnis der Aussage.

## Sie haben auch einen BUG zu beheben

Als Nächstes gehen wir zurück und beheben das vorherige Problem "Ersteintrag wird nicht wirksam".

### Dies ist ein Rahmen für die Prüfung von Komponententests

Es gibt ein Projekt in der Projektvorlage`HelloClaptrap.Actors.Tests`, das Komponententests des Hauptgeschäftscodes enthält.

Wir wissen jetzt, dass`im AddItemToCartEventHandler kommentiert`die Hauptursache für Fehler ist.

Wir können`dotnet-Test`verwenden, um Komponententests in einem Testprojekt auszuführen und zwei Fehler zu erhalten:

```bash
A total of 1 test files matched the specified pattern.
  X AddFirstOne [130ms]
  Error Message:
   Expected value to be 10, but found 0.
  Stack Trace:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
   at FluentAssertions.Execution.TestFrameworkProvider.Throw(String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
   at FluentAssertions.Execution.AssertionScope.FailWith(Func`1 failReasonFunc)
   at FluentAssertions.Execution.AssertionScope.FailWith(Func`1 failReasonFunc)
   at FluentAssertions.Execution.AssertionScope.FailWith(String message, Object[] args)
   at FluentAssertions.Numeric.NumericAssertions`1.Be(T expected, String because, Object[] becauseArgs)
   at HelloClaptrap.Actors.Tests.Cart.Events.AddItemToCartEventHandlerTest.AddFirstOne() in D:\Repo\HelloClaptrap\HelloClaptrap\HelloClaptrap.Actors.Tests\Cart\Events\AddItemToCartEventHandlerTest.cs:line 32
   at HelloClaptrap.Actors.Tests.Cart.Events.AddItemToCartEventHandlerTest.AddFirstOne() in D:\Repo\HelloClaptrap\HelloClaptrap\HelloClaptrap.Actors.Tests\Cart\Events\AddItemToCartEventHandlerTest.cs:line 32
   at NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter`1.GetResult()
   at NUnit.Framework.Internal.AsyncToSyncAdapter.Await(Func`1 invoke)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.RunTestMethod(TestExecutionContext context)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.Execute(TestExecutionContext context)
   at NUnit.Framework.Internal.Execution.SimpleWorkItem.PerformWork()

  X RemoveOne [2ms]
  Error Message:
   Expected value to be 90, but found 100.
  Stack Trace:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
   at FluentAssertions.Execution.TestFrameworkProvider.Throw(String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
   at FluentAssertions.Execution.AssertionScope.FailWith(Func`1 failReasonFunc)
   at FluentAssertions.Execution.AssertionScope.FailWith(Func`1 failReasonFunc)
   at FluentAssertions.Execution.AssertionScope.FailWith(String message, Object[] args)
   at FluentAssertions.Numeric.NumericAssertions`1.Be(T expected, String because, Object[] becauseArgs)
   at HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemFromCartEventHandlerTest.RemoveOne() in D:\Repo\HelloClaptrap\HelloClaptrap\HelloClaptrap.Actors.Tests\Cart\Events\RemoveItemFromCartEventHandlerTest.cs:line 40
   at HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemFromCartEventHandlerTest.RemoveOne() in D:\Repo\HelloClaptrap\HelloClaptrap\HelloClaptrap.Actors.Tests\Cart\Events\RemoveItemFromCartEventHandlerTest.cs:line 40
   at NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter`1.GetResult()
   at NUnit.Framework.Internal.AsyncToSyncAdapter.Await(Func`1 invoke)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.RunTestMethod(TestExecutionContext context)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.Execute(TestExecutionContext context)
   at NUnit.Framework.Internal.Execution.SimpleWorkItem.PerformWork()


Test Run Failed.
Total tests: 7
     Passed: 5
     Failed: 2

```

Werfen wir einen Blick auf den Code für eine der Fehlereinheit tests：

```cs
[Test]
public async Task AddFirstOne()
{
    using var mocker = AutoMock.GetStrict();

    await using var handler = mocker.Create<AddItemToCartEventHandler>();
    var state = new CartState();
    var evt = new AddItemToCartEvent
    {
        SkuId = "skuId1",
        Count = 10
    };
    await handler.HandleEvent(state, evt, default);

    state.Items.Count.Should().Be(1);
    var (key, value) = state.Items.Single();
    key.Should().Be(evt.SkuId);
    value.Should().Be(evt.Count);
}
```

`AddItemToCartEventHandler`die Haupttestkomponente dieses Tests ist, und da sowohl stateData als auch das Ereignis manuell erstellt werden, können Entwickler problemlos Szenarien erstellen, die bei Bedarf getestet werden müssen.Sie müssen nichts Besonderes bauen.

Stellen Sie nun einfach`kommentierten Codeaus dem addItemToCartEventHandler-`wieder her, und führen Sie den Komponententest erneut aus.Der Komponententest besteht.BUG ist auch eine natürliche Lösung.

Natürlich gibt es einen weiteren Komponententest für das Löschszenario, der fehlgeschlagen ist.Entwickler können dieses Problem beheben, indem sie den oben beschriebenen Ideen "Break Points" und "Unit Tests" folgen.

## Die Daten wurden beibehalten

Sie können versuchen, Backend Server und das Web neu zu starten, und Sie werden feststellen, dass die Daten, an denen Sie zuvor gearbeitet haben, beibehalten wurden.

Wir werden es in einem Folgekapitel weiter behandeln.

## Zusammenfassung

In diesem Artikel werfen wir einen ersten Blick darauf, wie Sie ein grundlegendes Projektframework erstellen, um ein einfaches Warenkorbszenario zu implementieren.

Es gibt eine Menge, die wir nicht：Details, Projektstruktur, Bereitstellung, Persistenz usw. haben.Weitere Informationen dazu finden Sie in den nachfolgenden Artikeln.
