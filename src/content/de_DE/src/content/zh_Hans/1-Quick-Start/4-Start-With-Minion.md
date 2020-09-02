---
title: 'Schritt 4 - Verwenden Sie Minion, um eine Bestellung für ein Produkt aufzugeben.'
metaTitle: 'Schritt 4 - Verwenden Sie Minion, um eine Bestellung für ein Produkt aufzugeben.'
metaDescription: 'Schritt 4 - Verwenden Sie Minion, um eine Bestellung für ein Produkt aufzugeben.'
---

Mit diesem Artikel können Sie versuchen, Geschäfte mit Claptrap zu machen.

> [Die aktuell angezeigte Version ist das Ergebnis Chinesisch Vereinfachte Maschine übersetzt Selbstkontrolle und manuell Korrekturen.Wenn das Dokument eine unsachgemäße Übersetzung enthält, klicken Sie bitte hier, um Ihre Übersetzungsvorschläge einzureichen.](https://crwd.in/newbeclaptrap)

<!-- more -->

## Eröffnungszusammenfassung.

In diesem Artikel habe ich gelernt, wie Minion verwendet werden kann, um asynchrone Geschäftsverarbeitung in vorhandenen Projektbeispielen abzuschließen, indem die Anforderungen der "Warenbestellung" implementiert werden.

Sehen Sie sich zunächst die geschäftlichen Anwendungsfälle an, die in diesem article：

1. Der Benutzer kann eine Bestellung aufgeben, die eine Bestellung mit allen SKUs im aktuellen Warenkorb bildet.
2. Der Bestand der relevanten SKUs wird nach Auftragsabschluss abgezogen.Wenn eine SKU nicht mehr vorrätig ist, schlägt die Bestellung fehl.
3. Der Auftragsvorgang ist nur erfolgreich, bis der Lagerbestand erfolgreich abgezogen wurde und die nächsten Schritte den Umfang dieser Beispieldiskussion nicht erfordern.Daher generiert dieses Beispiel einen Auftragsdatensatz in der Datenbank, nachdem eine erfolgreiche Bestellung platziert wurde, die das Ende der Auftragserstellung angibt.

Obwohl der Schwerpunkt dieses Artikels auf der Verwendung von Minion liegt, müssen Sie aufgrund der Notwendigkeit, ein neues OrderGrain-Objekt zu verwenden, immer noch den vorherigen Artikel "Defining Claptrap" verwandtes Wissen verwenden.

Minion ist eine besondere Art von Claptrap, und seine Beziehung zu MasterClaptrap wird im folgenden：

![Minion.](/images/20190228-002.gif)

Sein Hauptentwicklungsprozess ist ähnlich wie claptrap, mit nur wenigen Einschränkungen.Der Vergleich ist wie follows：

| Schritte.                                       | Claptrap. | Minion. |
| ----------------------------------------------- | --------- | ------- |
| Definieren Sie ClaptrapTypeCode.                | √.        | √.      |
| Definieren Sie den Status.                      | √.        | √.      |
| Definieren Sie die Kornschnittstelle.           | √.        | √.      |
| Implementieren Sie Getreide.                    | √.        | √.      |
| Registrieren Sie sich für Grain.                | √.        | √.      |
| Definieren Sie EventCode.                       | √.        |         |
| Definieren Sie das Ereignis.                    | √.        |         |
| Implementieren Sie den Ereignishandler.         | √.        | √.      |
| Registrieren Sie sich für EventHandler.         | √.        | √.      |
| Implementieren Sie IInitial State Data Factory. | √.        | √.      |

Der Grund für diese Löschung ist, dass, da Minion der Ereignis-Consumer von claptrap ist, ereignisbezogene Definitionen nicht verarbeitet werden müssen.Aber der Rest ist immer noch notwendig.

> Am Anfang dieses Artikels werden wir nicht mehr die spezifischen Dateispeicherorte auflisten, an denen sich der entsprechende Code befindet, und wir hoffen, dass der Leser in der Lage sein wird, sich im Projekt davon zu überzeugen, damit er ihn beherrschen kann.

## Implementieren Sie OrderGrain.

Basierend auf dem bisherigen "Defining Claptrap"-Wissen haben wir hier ein OrderGrain implementiert, um den Bestellvorgang darzustellen.Um Platz zu sparen, listen wir nur die wichtigsten Teile auf.

### OrderState.

Der Status des Auftrags ist definiert als follows：

```cs
Systems.Collections.Generic;
. Newbe.Claptrap;

namespace HelloClaptrap.Models.Order
s
    öffentlichen Klasse Order State : IStateData
    s
        public bool OrderCreated s get; set; s
        public user stringId s get; set; s
        public Dictionary<string, int> Skus sned; set; s

s.
```

1. OrderCreated gibt an, ob ein Auftrag erstellt wurde, wodurch die Erstellung des Auftrags wiederholt vermieden wird.
2. UserId ordnet eine Benutzer-ID an.
3. Skus-Aufträge enthalten SkuIds und Auftragsvolumina.

### OrderCreatedEvent.

Auftragserstellungsereignisse werden als follows：

```cs
Systems.Collections.Generic;
. Newbe.Claptrap;

Namespace HelloClaptrap.Models.Order.Events

    der öffentlichen Klasse OrderCreatedEvent : IEventData
    . . .
        öffentlichen Zeichenfolge UserId . . . gesetzt; . . . .
        Öffentliches Wörterbuch<string, int> Skus

    . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

### OrderGrain.

```cs
Verwenden von System.Threading.Tasks;
Vereinigte Staaten, Hello Claptrap.Actors.Order.Events;
Die 1990er Jahre, HelloClaptrap.IActor;
Die Vereinigten Staaten Ofsing HelloClaptrap.Models;
.Models.Order;
.HelloClaptrap.Models.Order.Events;
.Claptrap;
Newbe.Claptrap.Orleans;
Orleans;

Namespace HelloClaptrap.Actors.Order

    (OrderCreatedEventHandler, ClaptrapCodes.OrderCreated)
    Public Class Order Grain : ClaptrapBox Grain<OrderState>, IOrder Grain
    _grainFactory
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . IClaptrapGrainCommonService Claptrap Grain Common Services,
            IGrain Factory GrainFactory)
            : base (claptrapGrainCommonService)
        s
            _grainFactory s grainfactory;
        s

        public async Task CreateOrder Agent Async (CreateOrderInput)
        s
            var orderid s claptrap.state.Identity. y.Id;
            / auslösen Ausnahme, wenn die Reihenfolge bereits
            if (StateData.OrderCreated)

                neue bizException ("Order with order id already created: {orderId}");


            / erhalten Sie Artikel aus dem Warenkorb
            var cartGrain _grainFactory.GetGrain<ICartGrain>(Eingabe. CartId);
            var-Elemente - warten auf cartGrain.GetItemsAsync();

            / Update-Inventar für
            foreach (skuId, count) in items)

                var skuGrain , _grainFactory.GetGrain<ISkuGrain>(skuId);
                warten skuGrain.UpdateInventoryAsync (-count);
            . .

            / Entfernen Sie alle Artikel aus dem Warenkorb
            warten cartGrain.Re. moveAllItemsAsync();

            / erstellen Sie eine
            var evt . . . dies. CreateEvent (neue OrderCreatedEvent
            Userid
                Eingabe. UserId,
                Skus - Elemente
            ) );
            .HandleEventAsync (evt);
        s


```

1. OrderGrain implementiert die Kernlogik der Auftragserstellung, bei der die CreateOrderAsync-Methode die Erfassung von Warenkorbdaten und im Zusammenhang mit Lagerabzugsaktionen abschließt.
2. Die entsprechenden Felder im Status werden nach der erfolgreichen Ausführung von OrderCreatedEvent aktualisiert, die hier nicht mehr aufgeführt ist.

## Speichern Sie Auftragsdaten über Minion in der Datenbank.

Vom Anfang der Serie bis zu diesem haben wir nie datenbankbezogene Operationen erwähnt.Denn wenn Sie das Claptrap-Framework verwenden, wurden die meisten Vorgänge durch Schreibvorgänge in Ereignisse und Zustandsaktualisierungen ersetzt, sodass Sie keine eigenen Datenbankvorgänge schreiben müssen.

Da Claptrap jedoch in der Regel für Einheitenobjekte (ein Auftrag, eine SKU, ein Warenkorb) ausgelegt ist, ist es nicht möglich, Daten für alle (alle Bestellungen, alle SKUs, alle Warenkorb) zu erhalten.An diesem Punkt müssen Zustandsdaten in einer anderen persistenten Struktur (Datenbank, Datei, Cache usw.) beibehalten werden, um Abfragen oder andere Vorgänge für die gesamte Situation abzuschließen.

Das Konzept von Minion wurde in das Claptrap-Framework eingeführt, um diesen Anforderungen gerecht zu werden.

Als Nächstes führen wir ein OrderDbGrain (ein Minion) in das Beispiel ein, um OrderGrains Auftragseingabevorgang asynchron abzuschließen.

## Definieren Sie ClaptrapTypeCode.

```cs
  namespace HelloClaptrap.Models

      öffentliche statische Klasse ClaptrapCodes

          #region Cart

          public und const string CartGrain s "cart_claptrap_newbe";
          private const string CartEventSuffix, """"""""
          """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
          """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" Tring RemoveItemFromCart - "RemoveItem" - CartEventSuffix;
          Public Publicity const String Entfernen Sie AllItems FrommCart , "Remoe AllItems" , CartEventSuffix;

          #endregion

          #region Sku

          Öffentlichkeit und skuGrain - "sku_claptrap_newbe";
          die private const-Zeichenfolge SkuEventSuffix . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
          Öffentlichkeit und skuInventoryUpdate , "inventoryUpdate" , SkuEventSuffix;

          #endregion

          #region Ordnung

          OrdnungsordnungGrain , "order_claptrap_newbe";
          die private private const string OrderEventSuffix . . . ."""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
          der Öffentlichkeit und der Öffentlichkeit und der Ordnungerstellte , "ordercreated" und orderEventSuffix;

die Öffentlichkeit und die Öffentlichkeit, OrderDbGrain , "db_order_claptrap_newbe" zu saiten;

          #endregion
      . . .
  . . . . . . . . . . . . . . . . . .
```

Minion ist eine besondere Art von Claptrap, mit anderen Worten, es ist auch eine Art Claptrap.ClaptrapTypeCode ist für Claptrap erforderlich und muss daher hinzugefügt werden.

## Definieren Sie den Status.

Da dieses Beispiel nur einen Auftragsdatensatz in die Datenbank schreiben muss und keine Daten im Status erfordert, ist dieser Schritt in diesem Beispiel nicht erforderlich.

## Definieren Sie die Kornschnittstelle.

```cs
Verwenden von HelloClaptrap.Models;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
+
+ Namespace HelloClaptrap.IActor
+ s
+ [ClaptrapMinion(ClaptrapCodes.OrderGrain)]
+ [ClaptrapState(typeof(NoneStateData), ClaptrapCodes.OrderDbGrain)]
+ öffentliche Schnittstelle IOrderDbGrain : IClaptrapMinionGrain


+
```

1. ClaptrapMinion wird verwendet, um das Korn als Minion zu markieren, wobei Code auf seine entsprechende MasterClaptrap zeigt.
2. ClaptrapState wird verwendet, um den Statusdatentyp von Claptrap zu markieren.Im vorherigen Schritt haben wir klargestellt, dass das Minion keine StateData erfordert, daher verwenden wir Stattdessen NoneStateData als integrierten Frameworktyp.
3. IClaptrapMinionGrain ist eine Minion-Schnittstelle, die sich von IClaptrapGrain unterscheidet.Wenn ein Grain Minion ist, müssen Sie die Schnittstelle erben.
4. ClaptrapCodes.OrderGrain und ClaptrapCodes.OrderDbGrain sind zwei verschiedene Zeichenfolgen, und hoffentlich ist der Reader kein interstellarer Master.

> Star Master：Da StarCraft schnelllebig ist und eine große Menge an Informationen hat, ist es für Spieler leicht, einige der Informationen zu ignorieren oder falsch einzuschätzen, so oft "Spieler sehen nicht die wichtigsten Ereignisse, die unter der Nase auftreten" lustige Fehler.Die Spieler scherzen daher, dass interstellare Spieler blind sind (es gab einmal einen echten Showdown zwischen blinden und professionellen Spielern), je höher das Segment, desto ernster die Blindheit, professionelle interstellare Spieler sind blind.

## Implementieren Sie Getreide.

```cs
Verwenden von Systems.Collections.Generic;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
singen HelloClaptrap.IActor;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
,
, namespace HelloClaptrap.Actors.DbGrains.Order
,
, und ClaptrapEventHandler , ClaptrapCodes . OrderCreated)
und public class OrderDbGrain : ClaptrapBoxGrain<NoneStateData>, IOrderDbGrain
,
, public OrderDbGrain (IClaptrapGrain CommonService). claptrapGrainCommonService)
+ : base(claptrapGrainCommonService)
+ -
+ -
+
+ public async Task MasterEventReceivedAsync(IEnumerable<IEvent> events)
+ '
+ foreach (var @event in events)
+ '
+ await Claptrap.HandleEventAsync(@event);

,
,
,  , öffentliche WakeAsync ()
,
, geben Task.CompletedTask,
,
,
zurück.
```

1. MasterEventReceivedAsync ist eine von IClaptrapMinionGrain definierte Methode, die bedeutet, Ereignisbenachrichtigungen von MasterClaptrap in Echtzeit zu empfangen.Ohne die Beschreibung hier zu erweitern, folgen Sie der obigen Vorlage.
2. WakeAsync ist eine von IClaptrapMinionGrain definierte Methode, die MasterClaptraps aktives Aufwachen von Minion darstellt.Ohne die Beschreibung hier zu erweitern, folgen Sie der obigen Vorlage.
3. Wenn der Leser den Quellcode anzeigt, stellt er fest, dass die Klasse separat in einer Assembly definiert ist.Dies ist nur eine Klassifizierung, die als Platzierung von Minion und MasterClaptrap in zwei verschiedenen Projekten verstanden werden kann.Es ist eigentlich kein Problem, es zusammenzustellen.

## Registrieren Sie sich für Grain.

Da wir OrderDbGrain in einer separaten Baugruppe definieren, müssen wir die Assembly zusätzlich registrieren.Wie folgt：

```cs
  Verwenden von System;
  mit Autofac;
  . Hening HelloClaptrap.Actors.Cart;
  .HelloClaptrap.Actors.DbGrains.Order;
  .IActor;
  s allgemeinen Dienst, HelloClaptrap.Repository;
  .AspNetCore.Hosting;
  .Extensions.Hosting;
  .Extensions.Logging;
  .Claptrap;
  newbe.Claptrap.Bootstrapper;
  NLog.Web;
  Orleans;

  Namespace HelloClaptrap.BackendServer

      öffentliches Programmprogramm

          öffentliche statische Void Main (String)

              var logger , NLogBuilder.ConfigureNLog ("nlog.config"). GetCurrentClassLogger ();
              versuchen sie
              .
                  Logger. Debuggen ("init main");
                  CreateHostBuilder (args). Build(). Ausführen ();

              catch (Ausnahmeausnahme)

                  /NLog: Setupfehler
                  Protokollierung abfangen. Fehler (Ausnahme, "Programm wegen Ausnahme beendet");
                  werfen;

              endlich

                  / / Stellen Sie sicher, dass interne Timer/Threads vor dem Beenden der Anwendung
                  NLog.LogManager.Shutdown();
              . . .
          . . .

          . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .>
              . CreateDefaultBuilder (args)
                  . ConfigureWebHostDefaults (webBuilder> . .<Startup>. . . . . . . . .
                  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . UseClaptrap (
                      Builders>

                          Builder
                              . ScanClaptrapDesigns (neu)

                                  Typ (ICartGrain). Baugruppe,
                                  Typ (CartGrain). Montage,
und Typeof (OrderDbGrain). Montage
                              )
                              . ConfigureClaptrapDesign (x .>
                                  x. Claptrap-Optionen. EventCenter-Optionen. EventCenterType . . . EventCenterType.Orleans Client);
                      ,
                      Erbauer> Baumeister. RegisterModule<RepositoryModule>(); )
                  . UseOrleans Claptrap()
                  . UseOrleans (Bauherren -> Bauherren. UseDashboards (Optionen> Optionen. Port s 9000))
                  . ConfigureLogging (Logging )>
                  .
                      Protokollierung. ClearProviders ();
                      Protokollierung. SetMinimumLevel (logLevel.Trace);
                  )
                  . UseNLog();
      . . .
  . . . . . . . . . . . . . . . . . .
```

## Implementieren Sie den Ereignishandler.

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Order.Events;
+ using HelloClaptrap.Repository;
+ using Newbe.Claptrap;
+ using Newtonsoft.Json;
+
+ namespace HelloClaptrap.Actors.DbGrains.Order.Events
+ {
+     public class OrderCreatedEventHandler
+         : NormalEventHandler<NoneStateData, OrderCreatedEvent>
+     {
+         private readonly IOrderRepository _orderRepository;
+
+         public OrderCreatedEventHandler(
+             IOrderRepository orderRepository)
+         {
+             _orderRepository = orderRepository;
+         }
+
+         public override async ValueTask HandleEvent(NoneStateData stateData,
+             OrderCreatedEvent eventData,
+             IEventContext eventContext)
+         {
+             var orderId = eventContext.State.Identity.Id;
+             await _orderRepository.SaveAsync(eventData.UserId, orderId, JsonConvert.SerializeObject(eventData.Skus));
+         }
+     }
+ }
```

1. IOrderRepository ist eine Schnittstelle, die direkt auf der Speicherebene für Add-On und Löschen von Aufträgen arbeitet.Die Schnittstelle wird hier aufgerufen, um den Speichervorgang der Auftragsdatenbank zu implementieren.

## Registrieren Sie sich für EventHandler.

Um Speicherplatz zu sparen, haben wir uns im Code für den Abschnitt "Grain implementieren" registriert.

## Implementieren Sie IInitial State Data Factory.

Da StateData nicht über eine spezielle Definition verfügt, ist die Implementierung von IInitial StateData Factory nicht erforderlich.

## Controller ändern.

Im Beispiel haben wir OrderController hinzugefügt, um Bestellungen und Abfrageaufträge aufzugeben.Leser können sie im Quellcode anzeigen.

Leser können die folgenden Schritte verwenden, um die tatsächliche：

1. POST `/api/cart/123` "skuId": "yueluo-666", "count": 30" zum 123 Warenkorb, um 30 Einheiten Yueluo-666 Konzentrat hinzuzufügen.
2. POST `/api/order` ( "userId": "999", "cartId": "123") als 999 userId, aus dem 123 Warenkorb, um eine Bestellung aufzugeben.
3. GET `/api/order` die Bestellung kann über die API angezeigt werden, nachdem die Bestellung erfolgreich aufgegeben wurde.
4. GET `/api/sku/yueluo-666` den Lagerbestand anzeigen kann, nachdem der Auftrag über die SKU-API erfolgt ist.

## Zusammenfassung.

An dieser Stelle haben wir den "Warenauftrag" dieser Nachfrage nach dem Basisinhalt abgeschlossen.Dieses Beispiel bietet ein erstes Verständnis dafür, wie mehrere Claptraps zusammenarbeiten können und wie Minion zum Ausführen asynchroner Aufgaben verwendet werden kann.

Es gibt jedoch noch einige Fragen, die wir später erörtern werden.

Den Quellcode für diesen Artikel können Sie aus den folgenden：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
