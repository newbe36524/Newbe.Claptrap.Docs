---
title: "Schritt 2 - Einfaches Geschäft, leeren Sie Ihren Warenkorb"
description: "Schritt 2 - Einfaches Geschäft, leeren Sie Ihren Warenkorb"
---

Mit dieser Lektüre können Sie versuchen, Geschäfte mit Claptrap zu machen.

<!-- more -->

## Eine Eröffnungszusammenfassung

In diesem Artikel habe ich gelernt, wie man eine Geschäftsimplementierung zu einem vorhandenen Projektbeispiel hinzufügt, indem ich die Notwendigkeit implementiert habe, den Warenkorb zu leeren.

Die folgenden Schritte sind in erster Linie included：

1. Definieren von EventCode
2. Definieren des Ereignisses
3. Implement EventHandler
4. Registrieren Sie sich für EventHandler
5. Ändern der Korn-Schnittstelle
6. Implement Grain
7. Ändern des Controllers

Dies ist ein Bottom-up-Prozess, und die Entwicklung im eigentlichen Codierungsprozess kann auch von oben nach unten implementiert werden.

## Definieren des Ereigniscodes

EventCode ist der eindeutige Code für jedes Ereignis im Claptrap-System.Es spielt eine wichtige Rolle bei der Identifizierung und Serialisierung von Ereignissen.

Öffnen Sie`der ClaptrapCodes-`-Klasse in`das HelloClaptrap.`-Projekt.

Fügen Sie EventCode für Leere Warenkorbereignisse hinzu.

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

## Definieren des Ereignisses

Event ist der Schlüssel zum Event Sourcing.Wird verwendet, um den Status in Claptrap zu ändern.Und Das Ereignis wird auf der Persistenzebene beibehalten.

Erstellen Sie`RemoveAllItems FromCartEvent``unter dem Ordner Cart/Events`des Projekts HelloClaptrap.Models .

Fügen Sie den folgenden Code:

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

`IEventData`-Schnittstelle eine leere Schnittstelle im Framework ist, die Ereignisse darstellt und in generischen Rückschlüssen verwendet wird.

## Implement EventHandler

EventHandler 用于将事件更新到 Claptrap 的 State 上。In diesem Geschäftsszenario ist EventHandler beispielsweise für das Leeren des Inhalts des Statuswagens verantwortlich.

Erstellen Sie`RemoveAllItems FromCartEventHandler-Klasse unter dem Ordner Cart/Events`Ordner des HelloClaptrap.Actor s -Projekts.

Fügen Sie den folgenden Code:

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

Hier sind einige häufige questions：

1. Was ist NormalEventHandler?

   NormalEventHandler ist eine einfache Basisklasse, die durch das Framework für die einfache Implementierung von Handler definiert wird. Der erste generische Parameter ist der State-Typ für Claptrap.In Kombination mit dem vorherigen Dokument ist unser Warenkorb-Statustyp CartState. Der zweite generische Parameter ist der Ereignistyp, den der Handler verarbeiten muss.

2. Warum`StateData.Items . . . null;`stattdessen`stateData.Items.Clear ();`

   StateData ist ein Objekt, das im Arbeitsspeicher gespeichert wird, und Clear reduziert den Speicher, den das Wörterbuch bereits belegt, nicht.Natürlich gibt es nicht Hunderttausende von Artikeln in einem Warenkorb.Aber der Punkt ist, dass es beim Aktualisieren des Status wichtig ist zu beachten, dass Claptrap ein speicherresidentes Objekt ist, das den Speicherverbrauch erhöht, wenn die Anzahl zunimmt.Bewahren Sie daher so wenig Daten wie möglich im Zustand auf.

3. Was ist ValueTask?

   Sie können in diesem Artikel[, wie Sie die Gründe, was und wann von ValueTask](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)der Welt verstehen.

Sobald die EventHandler-Implementierung abgeschlossen ist, vergessen Sie nicht, sie in der Einheit zu testen.Es ist hier nicht aufgeführt.

## Registrieren Sie sich für EventHandler

Nachdem Sie EventHandler implementiert und getestet haben, können Sie eventHandler registrieren, um EventCode und Claptrap zuzuordnen.

Öffnen Sie die`CartGrain-Klasse des HelloClaptrap.Actors`-Projekts`The`Project.

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

ClaptrapEventHandlerAttribute 是框架定义的一个 Attribute，可以标记在 Grain 的实现类上，以实现 EventHandler 、 EventCode 和 ClaptrapGrain 三者之间的关联。

Wenn nach der Zuordnung das Ereignis, das EventCode entspricht, in diesem Korn auftritt, wird es vom angegebenen EventHandler behandelt.

## Ändern der Korn-Schnittstelle

Ändern Sie die Definition der Grain-Schnittstelle, um externe Interoperabilität mit Claptrap bereitzustellen.

打开 HelloClaptrap.IActors 项目的 ICartGrain 接口。

Fügen Sie Schnittstellen sowie Attribut hinzu.

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

Zwei Teile wurden added：

1. Markieren Sie die`ClaptrapEvent`, um das Ereignis Grain zuzuordnen.Beachten Sie, dass sich dies von der`der vorherigen`ClaptrapEventHandler unterscheidet.Das Ereignis wird hier markiert, und EventHandler wird als letzter Schritt markiert.
2. Die RemoveAllItemsAsync-Methode wurde hinzugefügt, um das Geschäftsverhalten des "Leerens des Warenkorbs" darzustellen.Es ist wichtig zu beachten, dass Grains Methodendefinition gewisse Einschränkungen aufweist.Weitere Informationen finden Sie[unter "Entwicklung einer grain](https://dotnet.github.io/orleans/Documentation/grains/index.html).

## Implement Grain

Folgen Sie als Nächstes den Schnittstellenänderungen des nächsten Schritts, um die entsprechende Implementierungsklasse zu ändern.

Öffnen Sie die`CartGrain-Klasse``Cart``im HelloClaptrap.actors-`-Projekt.

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

Die entsprechende Implementierung der Schnittstellenmethode wurde hinzugefügt.Es gibt die folgenden Punkte zu note：

1. Achten Sie darauf,`if (StateData.Items?. Any() ! . . true)`dieser Linie des Urteils.Dies kann den Speicheraufwand erheblich reduzieren.

   Ereignisse bleiben bestehen, wenn`die claptrap.HandleEventAsync (evt`das Ereignis.Was das Szenario hier betrifft, wenn es keinen Inhalt im Warenkorb gibt, erhöht das Entleeren oder Beharren des Ereignisses einfach den Overhead und hat keine praktische Bedeutung. Daher kann das Hinzufügen von Urteilen bis dahin den nutzlosen Speicherverbrauch reduzieren.

2. Stellen Sie sicher, dass der Status bestimmt wird und ob die eingehenden Parameter die Bedingungen für die Ereignisausführung erfüllen.

   Dies unterscheidet sich von dem, was im obigen Punkt beschrieben wird.Der Fokus auf den obigen Punkt weist darauf hin, dass "keine bedeutungslosen Ereignisse erzeugen", was darauf hinweist, dass "niemals Ereignisse erzeugen, die EventHandler nicht konsumieren kann". Im Event-Sourcing-Modus basiert der Abschluss des Geschäfts auf der Persistenz des Ereignisses als Grundlage für den Abschluss des Geschäfts.Das bedeutet, dass Sie, sobald sich das Ereignis in der Bibliothek befindet, denken können, dass das Ereignis abgeschlossen ist. In EventHandler können nur Ereignisse akzeptiert werden, die von der Persistenzebene gelesen werden.An diesem Punkt kann das Ereignis nicht mehr entsprechend seiner Unveränderlichkeit geändert werden, also stellen Sie sicher, dass das Ereignis von EventHandler verwendet werden kann.Daher`wichtig, ein Urteil vor dem`von Claptrap.HandleEventAsync (evt) zu fällen. Daher ist es wichtig, Komponententests zu implementieren, um sicherzustellen, dass die Ereignisgenerierung und die Verarbeitungslogik von EventHandler überschrieben werden.

3. Im Folgenden finden Sie einige Methoden, die in einigen TAP-Bibliotheken verwendet werden können, z. B.[aufgabenbasierte asynchrone](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap)

## Ändern des Controllers

Bis alle vorherigen Schritte abgeschlossen sind, sind alle Teile von Claptrap abgeschlossen.Claptrap kann jedoch keine direkte Interoperabilität mit externen Programmen bieten.Daher müssen Sie auch eine API auf der Controller-Ebene hinzufügen, um den Warenkorb extern zu leeren.

Öffnen Sie den `CartController unter dem Ordner Controller``für helloClaptrap.web`-Projekt.

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

An diesem Punkt haben wir alles getan, was wir brauchen, um "den Warenkorb zu leeren".

Sie können den Quellcode für diesen Artikel aus den folgenden address：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
