---
title: 'Schritt zwei - Einfaches Geschäft, leerer Warenkorb.'
metaTitle: 'Schritt zwei - Einfaches Geschäft, leerer Warenkorb.'
metaDescription: 'Schritt zwei - Einfaches Geschäft, leerer Warenkorb.'
---

Mit dieser Lesart können Sie versuchen, Claptrap zur Implementierung Ihres Unternehmens zu verwenden.

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

<!-- more -->

## Die Eröffnungszusammenfassung.

In diesem Artikel habe ich gelernt, wie man eine Geschäftsimplementierung zu einem vorhandenen Projektbeispiel hinzufügt, indem ich die Notwendigkeit implementiert habe, den Warenkorb zu leeren.

Die wichtigsten umfassendiese dieser Schritte.：

1. Definieren Sie EventCode.
2. Definieren Sie das Ereignis.
3. Implementieren Sie EventHandler.
4. Registrieren Sie sich für EventHandler.
5. Ändern Sie die Kornschnittstelle.
6. Implementieren Sie Getreide.
7. Ändern Sie den Controller.

Dies ist ein Bottom-up-Prozess, und der eigentliche Codierungsprozess kann auch von oben nach unten entwickelt werden.

## Definieren Sie den Ereigniscode.

EventCode ist die eindeutige Codierung jedes Ereignisses im Claptrap-System.Es spielt eine wichtige Rolle bei der Identifizierung und Serialisierung von Ereignissen.

Öffnen Sie es.`HelloClap.Models.`Projekt.`Claptrap Codes.`Klasse.

Fügen Sie EventCode für "Leere Warenkorbereignisse" hinzu.

```cs
  namespace HelloClaptrap.Models
  {
      public static class ClaptrapCodes
      {
          public const string CartGrain = "cart_claptrap_newbe";
          private const string CartEventSuffix = "_e_" + CartGrain;
          public const string AddItemToCart = "addItem" + CartEventSuffix;
          public const string RemoveItemFromCart = "removeItem" + CartEventSuffix;
+         public const string RemoveAllItemsFromCart = "remoeAllItems" + CartEventSuffix;
      }
  }
```

## Definieren Sie das Ereignis.

Ereignis ist der Schlüssel zum Ursprung von Ereignissen.Wird verwendet, um den Status in Claptrap zu ändern.Und Das Ereignis wird auf der Persistenzebene beibehalten.

In.`HelloClap.Models.`Das Projekt.`Cart/Events.`Erstellen Sie unter dem Ordner.`Entfernen Sie AllItems aus Cart Event.`Klasse.

Fügen Sie den folgenden Code hinzu.：

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Cart.Events
+ {
+     public class RemoveAllItemsFromCartEvent : IEventData
+     {
+     }
+ }
```

Denn in diesem einfachen Geschäftsszenario erfordert das Leeren eines Warenkorbs keine spezifischen Parameter.Erstellen Sie daher einfach einen leeren Typ.

`IEventData.`Eine Schnittstelle ist eine leere Schnittstelle in einem Framework, die Ereignisse darstellt und bei allgemeinen Rückschlüssen verwendet wird.

## Implementieren Sie EventHandler.

`Ereignishandler.`Wird verwendet, um Ereignisse auf Claptrap zu aktualisieren.`Staat.`Auf.In diesem Geschäftsszenario ist EventHandler beispielsweise für das Leeren des Inhalts des Status-Warenkorbs verantwortlich.

In.`HelloClap.Actors.`Das Projekt.`Cart/Events.`Erstellen Sie unter dem Ordner.`Entfernen Sie alle Elemente aus cart Event Handler.`Klasse.

Fügen Sie den folgenden Code hinzu.：

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Cart;
+ using HelloClaptrap.Models.Cart.Events;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Cart.Events
+ {
+     public class RemoveAllItemsFromCartEventHandler
+         : NormalEventHandler<CartState, RemoveAllItemsFromCartEvent>
+     {
+         public override ValueTask HandleEvent(CartState stateData,
+             RemoveAllItemsFromCartEvent eventData,
+             IEventContext eventContext)
+         {
+             stateData.Items = null;
+             return new ValueTask();
+         }
+     }
+ }
```

Hier sind einige häufige Probleme.：

1. Was ist Normal Event Handler?

   NormalEventHandler ist eine einfache Basisklasse, die durch das Framework für die einfache Implementierung von Handler definiert wird. Der erste generische Parameter ist der State-Typ für Claptrap.In Verbindung mit dem vorherigen Dokument ist unser Warenkorb-Statustyp CartState. Der zweite generische Parameter ist der Ereignistyp, den Handler verarbeiten muss.

2. Warum es verwenden.`StateData.Items snull;`Nicht.`StateData.Items.Clear();`

   StateData ist ein Objekt, das im Arbeitsspeicher gespeichert wird, und Clear reduziert den eigenen Speicher des Wörterbuchs nicht.Natürlich gibt es in der Regel keine Einkaufswagen mit Hunderttausenden von Artikeln.Aber der Punkt ist, wenn Status aktualisiert wird, ist es wichtig zu beachten, dass Claptrap ein speicherbasiertes Objekt ist, das die Anzahl erhöht und den Speicherverbrauch erhöht.Bewahren Sie daher so wenig Daten wie möglich im Zustand auf.

3. Was ist ValueTask?

   Kann dies passieren.[Verstehen der Gründe, Wasund und Wann von ValueTask](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)Lernen.

Sobald die EventHandler-Implementierung abgeschlossen ist, vergessen Sie nicht, sie in der Einheit zu testen.Es ist hier nicht aufgeführt.

## Registrieren Sie sich für EventHandler.

Nachdem Sie EventHandler implementiert und getestet haben, können Sie EventHandler registrieren, um EventCode und Claptrap zuzuordnen.

Öffnen Sie es.`HelloClap.Actors.`Das Projekt.`CartGrain.`Klasse.

Markieren Sie mit Attribut.

```cs
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Cart
  {
      [ClaptrapEventHandler(typeof(AddItemToCartEventHandler), ClaptrapCodes.AddItemToCart)]
      [ClaptrapEventHandler(typeof(RemoveItemFromCartEventHandler), ClaptrapCodes.RemoveItemFromCart)]
+     [ClaptrapEventHandler(typeof(RemoveAllItemsFromCartEventHandler), ClaptrapCodes.RemoveAllItemsFromCart)]
      public class CartGrain : ClaptrapBoxGrain<CartState>, ICartGrain
      {
          public CartGrain(
              IClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

          ....
```

`Claptrap-Ereignishandlerhandler.`Ein Attribut, das durch das Framework definiert wird, das für die Implementierungsklasse von grain markiert werden kann, um die Zuordnung zwischen EventHandler, EventCode und ClaptrapGrain zu erreichen.

Wenn nach der Zuordnung das Ereignis für EventCode in diesem Korn generiert wird, wird das Ereignis vom angegebenen EventHandler behandelt.

## Ändern Sie die Kornschnittstelle.

Ändern Sie die Definition der Grain-Schnittstelle, um externe Interoperabilität mit Claptrap bereitzustellen.

Öffnen Sie es.`HelloClaptrap.IActors.`Das Projekt.`ICartGrain.`Schnittstelle.

Fügen Sie Schnittstellen und Attribute hinzu.

```cs
  using System.Collections.Generic;
  using System.Threading.Tasks;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Cart;
  using HelloClaptrap.Models.Cart.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.IActor
  {
      [ClaptrapState(typeof(CartState), ClaptrapCodes.CartGrain)]
      [ClaptrapEvent(typeof(AddItemToCartEvent), ClaptrapCodes.AddItemToCart)]
      [ClaptrapEvent(typeof(RemoveItemFromCartEvent), ClaptrapCodes.RemoveItemFromCart)]
+     [ClaptrapEvent(typeof(RemoveAllItemsFromCartEvent), ClaptrapCodes.RemoveAllItemsFromCart)]
      public interface ICartGrain : IClaptrapGrain
      {
          Task<Dictionary<string, int>> AddItemAsync(string skuId, int count);
          Task<Dictionary<string, int>> RemoveItemAsync(string skuId, int count);
          Task<Dictionary<string, int>> GetItemsAsync();
+         Task RemoveAllItemsAsync();
      }
  }
```

Zwei Teile wurden hinzugefügt.：

1. Markiert.`ClaptrapEvent.`, um das Ereignis mit Grain zu verknüpfen.Beachten Sie, dass hier der vorherige Schritt ist.`Claptrap-Ereignishandler.`ist anders.Das Ereignis wird hier markiert, und eventHandler wird im vorherigen Schritt markiert.
2. Die RemoveAllItemsAsync-Methode wurde hinzugefügt, um das Geschäftsverhalten von "leeren Einkaufswagen" anzuzeigen.Es ist wichtig zu beachten, dass die Methodendefinition von Getreide gewisse Einschränkungen aufweist.Details finden Sie.[Entwicklung eines Getreides](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## Implementieren Sie Getreide.

Folgen Sie als Nächstes der vorherigen Schnittstellenänderung, um die entsprechende Implementierungsklasse zu ändern.

Öffnen Sie es.`HelloClap.Actors.`Projekt.`Warenkorb.`unter dem Ordner.`CartGrain.`Klasse.

Fügen Sie die entsprechende Implementierung hinzu.

```cs
  using System;
  using System.Collections.Generic;
  using System.Linq;
  using System.Threading.Tasks;
  using HelloClaptrap.Actors.Cart.Events;
  using HelloClaptrap.IActor;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Cart;
  using HelloClaptrap.Models.Cart.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Cart
  {
      [ClaptrapEventHandler(typeof(AddItemToCartEventHandler), ClaptrapCodes.AddItemToCart)]
      [ClaptrapEventHandler(typeof(RemoveItemFromCartEventHandler), ClaptrapCodes.RemoveItemFromCart)]
      [ClaptrapEventHandler(typeof(RemoveAllItemsFromCartEventHandler), ClaptrapCodes.RemoveAllItemsFromCart)]
      public class CartGrain : ClaptrapBoxGrain<CartState>, ICartGrain
      {
          public CartGrain(
              IClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

+         public Task RemoveAllItemsAsync()
+         {
+             if (StateData.Items?.Any() != true)
+             {
+                 return Task.CompletedTask;
+             }
+
+             var removeAllItemsFromCartEvent = new RemoveAllItemsFromCartEvent();
+             var evt = this.CreateEvent(removeAllItemsFromCartEvent);
+             return Claptrap.HandleEventAsync(evt);
+         }
      }
  }
```

Die entsprechende Implementierung der Schnittstellenmethode wurde hinzugefügt.Es gibt einige Punkte, die man sich bewusst sein sollte.：

1. Achten Sie darauf, zu erhöhen.`wenn (StateData.Items?? Beeinen() ! . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .`Diese Linie des Urteils.Dies kann den Speicheraufwand erheblich reduzieren.

   Das Ereignis wird ausgeführt, wenn.`Claptrap.HandleEventAsync (evt)`wird beibehalten.Im Falle der Szene hier, wenn nichts im Warenkorb ist, das Leeren oder Beharren des Ereignisses erhöht sich nur zum Overhead, macht aber keinen Sinn. Daher kann das Hinzufügen von Urteilen davor den nutzlosen Speicherverbrauch reduzieren.

2. Es ist wichtig zu bestimmen, ob Status und die eingehenden Parameter die Kriterien für die Ereignisausführung erfüllen.

   Dies unterscheidet sich von der im vorherigen Punkt beschriebenen Betonung.Die vorherige Betonung "keine bedeutungslosen Ereignisse erzeugen" legt nahe, dass es "niemals Ereignisse geben wird, die EventHandler nicht konsumieren kann". Im Modus für die Ereignisablaufverfolgung basiert der Abschluss des Geschäfts auf der Persistenz des Ereignisses als Grundlage für den Abschluss der Geschäftsermittlung.Dies bedeutet, dass, solange die Veranstaltung auf Lager ist, davon ausgegangen werden kann, dass die Veranstaltung abgeschlossen wurde. In EventHandler können Sie nur Ereignisse akzeptieren, die aus dem Persistenz-Layer gelesen werden.An diesem Punkt kann das Ereignis nicht mehr geändert werden, da das Ereignis unveränderlich ist, daher ist es wichtig sicherzustellen, dass das Ereignis von EventHandler verwendet werden kann.Also, in.`Claptrap.HandleEventAsync (evt)`Es ist besonders wichtig, vorher ein Urteil zu fällen. Daher ist es wichtig, Komponententests zu implementieren, um sicherzustellen, dass die Ereignisgenerierung und die Verarbeitungslogik von EventHandler überschrieben werden.

3. Hier sind einige Methoden in der TAP-Bibliothek, die Sie verwenden können, siehe .[Aufgabenbasiertes asynchrones Muster.](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap)

## Ändern Sie den Controller.

Nachdem alle vorherigen Schritte abgeschlossen sind, haben Sie alle Teile von Claptrap abgeschlossen.Claptrap ist jedoch nicht in der Lage, die Interoperabilität mit externen Programmen direkt bereitzustellen.Daher müssen Sie auch eine API zum Controller-Layer hinzufügen, um den Warenkorb extern zu leeren.

Öffnen Sie es.`HelloClap.Web.`Das Projekt.`Controller.`unter dem Ordner.`CartController.`Klasse.

```cs
  using System.Threading.Tasks;
  using HelloClaptrap.IActor;
  using Microsoft.AspNetCore.Mvc;
  using Orleans;

  namespace HelloClaptrap.Web.Controllers
  {
      [Route("api/[controller]")]
      public class CartController : Controller
      {
          private readonly IGrainFactory _grainFactory;

          public CartController(
              IGrainFactory grainFactory)
          {
              _grainFactory = grainFactory;
          }

+         [HttpPost("{id}/clean")]
+         public async Task<IActionResult> RemoveAllItemAsync(int id)
+         {
+             var cartGrain = _grainFactory.GetGrain<ICartGrain>(id.ToString());
+             await cartGrain.RemoveAllItemsAsync();
+             return Json("clean success");
+         }
      }
  }
```

## Zusammenfassung

An diesem Punkt haben wir alles getan, was wir brauchen, um "Ihren Warenkorb zu leeren".

Sie können den Quellcode für diesen Artikel unter der folgenden Adresse abrufen.：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
