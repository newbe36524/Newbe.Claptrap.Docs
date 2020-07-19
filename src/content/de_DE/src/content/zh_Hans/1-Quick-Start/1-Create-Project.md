---
title: 'Der erste Schritt - erstellen Sie ein Projekt und implementieren Sie einen einfachen Warenkorb'
metaTitle: '第一步——创建项目，实现简易购物车'
metaDescription: 'Der erste Schritt - erstellen Sie ein Projekt und implementieren Sie einen einfachen Warenkorb'
---

Implementieren wir eine einfache "E-Commerce-Warenkorb"-Anforderung, um zu sehen, wie man sich mit Newbe.Claptrap entwickelt.

> [当前查看的版本是由机器翻译自简体中文，并进行人工校对的结果。若文档中存在任何翻译不当的地方，欢迎点击此处提交您的翻译建议。](https://crwd.in/newbeclaptrap)

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

> 通常来说，我们建议将`D:\Repo\HelloClaptrap`创建为 Git 仓库文件夹。通过版本控制来管理您的源码。

## Kompilierung und Inbetriebnahme

Sobald das Projekt erstellt wurde, können Sie die Projektmappe mit Ihrer bevorzugten IDE öffnen kompilieren.

Starten Sie nach der Kompilierung sowohl Web- als auch BackendServer-Projekte mit der Startfunktion in der IDE.(VS muss die Dienstkonsole starten, und wenn Sie IIS Express verwenden, müssen Sie die entsprechende Portnummer des Entwicklers einsehen, um auf die Webseite zugreifen zu können.)

Sobald der Start abgeschlossen ist, können Sie`http://localhost:36525/swagger`Adresse, um die API-Beschreibung des Beispielelements anzuzeigen.Dazu gehören drei Haupt-APIs：

- `Erhalten` `/api/Cart/{id}` Abrufen von Artikeln und Mengen in einem bestimmten ID-Warenkorb
- `Bereitstellen` `/api/Cart/{id}` Hinzufügen eines neuen Artikels zum Kauf der angegebenen ID
- `Löschen` `/api/Cart/{id}` Entfernen eines bestimmten Artikels aus dem Warenkorb der angegebenen ID

Sie können versuchen, mehrere Aufrufe der API über die Schaltfläche Try It Out auf der Schnittstelle durchzuführen.

> - [如何在 VS 中同时启动多个项目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [如何在 Rider 中同时启动多个项目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [使用华为云加速 nuget 还原速度](https://mirrors.huaweicloud.com/)

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

> [通过 Go To File 可以助您快速定位文件所在](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

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

此处便是框架实现的核心，如下图所示的关键内容：

![Claptrap](/images/20190228-001.gif)

具体说到业务上，代码已经运行到了一个具体的购物车对象。

可以通过调试器看到传入的 skuId 和 count 都是从 Controller 传递过来的参数。

在这里您可以完成以下这些操作：

- Ändern der Daten in Claptrap mit Ereignissen
- In Claptrap gespeicherte Daten lesen

这段代码中，我们创建了一个`AddItemToCartEvent`对象来表示一次对购物车的变更。

然后将它传递给 Claptrap 进行处理了。

Claptrap 接受了事件之后就会更新自身的 State 数据。

最后我们将 StateData.Items 返回给调用方。（实际上 StateData.Items 是 Claptrap.State.Data.Items 的一个快捷属性。因此实际上还是从 Claptrap 中读取。）

通过调试器，可以看到 StateData 的数据类型如下所示：

```cs
Öffentliche Klasse CartState : IStateData
{
    öffentliches Wörterbuch<string, int> Artikel . . . get; set; . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
}
```

这就是样例中设计的购物车状态。我们使用一个`Dictionary`来表示当前购物车中的 SkuId 及其对应的数量。

继续调试，进入下一步，让我们看看 Claptrap 是如何处理传入的事件的。

### AddItemToCart-Ereignishandler-Start

再次命中断点的是下面这段代码：

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

这段代码中，包含有两个重要参数，分别是表示当前购物车状态的`CartState`和需要处理的事件`AddItemToCartEvent`。

我们按照业务需求，判断状态中的字典是否包含 SkuId，并对其数量进行更新。

继续调试，代码将会运行到这段代码的结尾。

此时，通过调试器，可以发现，stateData.Items 这个字典虽然增加了一项，但是数量却是 0 。原因其实就是因为上面被注释的 else 代码段，这就是第一次添加购物车总是失败的 BUG 成因。

在这里，不要立即中断调试。我们继续调试，让代码走完，来了解整个过程如何结束。

实际上，继续调试，断点将会依次命中 CartGrain 和 CartController 对应方法的方法结尾。

## Dies ist eigentlich eine dreistufige Architektur!

绝大多数的开发者都了解三层架构。其实，我们也可以说 Newbe.Claptrap 其实就是一个三层架构。下面我们通过一个表格来对比一下：

| Traditionelle dreistufige       | Newbe.Claptrap     | Beschreibung                                                                                                                        |
| ------------------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Präsentationspräsentationsebene | Controller-Schicht | Wird zum Andocken externer Systeme verwendet, um externe Interoperabilität zu gewährleisten                                         |
| Business Business-Stufe         | Kornschicht        | Geschäftsverarbeitung basierend auf eingehenden Geschäftsparametern (Beispiel schreibt kein Urteil, muss die Anzahl beurteilen > 0) |
| Persistenzpersistenz-Layer      | EventHandler-Layer | Aktualisieren der Geschäftsergebnisse                                                                                               |

当然上面的类似只是一种简单的描述。具体过程中，不需要太过于纠结，这只是一个辅助理解的说法。

## Sie haben auch einen BUG zu beheben

接下来我们重新回过头来修复前面的“首次加入商品不生效”的问题。

### Dies ist ein Rahmen für die Prüfung von Komponenten

在项目模板中存在一个项目`HelloClaptrap.Actors.Tests`，该项目包含了对主要业务代码的单元测试。

我们现在已经知道，`AddItemToCartEventHandler`中注释的代码是导致 BUG 存在的主要原因。

我们可以使用`dotnet test`运行一下测试项目中的单元测试，可以得到如下两个错误:

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

我们看一下其中一个出错的单元测试的代码：

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

`AddItemToCartEventHandler`是该测试主要测试的组件，由于 stateData 和 event 都是通过手动构建的，因此开发者可以很容易就按照需求构建出需要测试的场景。不需要构建什么特殊的内容。

现在，只要将`AddItemToCartEventHandler`中那段被注释的代码还原，重新运行这个单元测试。单元测试便就通过了。BUG 也就自然的修复了。

当然，上面还有另外一个关于删除场景的单元测试也是失败的。开发者可以按照上文中所述的“断点”、“单元测试”的思路，来修复这个问题。

## Die Daten wurden beibehalten.

您可以尝试重新启动 Backend Server 和 Web， 您将会发现，您之前操作的数据已经被持久化的保存了。

我们将会在后续的篇章中进一步介绍。

## Zusammenfassung

通过本篇，我们初步了解了一下，如何创建一个基础的项目框架来实现一个简单的购物车场景。

这里还有很多内容我们没有详细的说明：项目结构、部署、持久化等等。您可以进一步阅读后续的文章来了解。
