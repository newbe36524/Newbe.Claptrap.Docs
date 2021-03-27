---
title: 'Schritt 4 - Verwenden von Minions, um Waren bestellungen zu bestellen'
description: 'Schritt 4 - Verwenden von Minions, um Waren bestellungen zu bestellen'
---

Mit dieser Lektüre können Sie versuchen, Geschäfte mit Claptrap zu machen.

<!-- more -->

:::caution 该文档仅适用于 0.7 及以下版本，若想要查看最新版本内容，请点击右上角进行切换。 :::

## Eine Eröffnungszusammenfassung

In diesem Artikel habe ich gelernt, wie Man Minion in einem vorhandenen Projektbeispiel verwendet, um eine asynchrone Geschäftsabwicklung abzuschließen, indem ich die Anforderungen der "Bestellung von Waren" umsetze.

Werfen Sie zunächst einen Blick auf die geschäftlichen Anwendungsfälle, die an diesem article：

1. Der Benutzer kann eine Bestellung aufgeben, die mit allen SKUs im aktuellen Warenkorb platziert wird, um eine Bestellung zu bilden.
2. Der Bestand der entsprechenden SKU wird nach Auftragsabschluss abgezogen.Wenn eine SKU nicht mehr vorrätig ist, schlägt die Bestellung fehl.
3. Die Bestellung erfolgt nur, bis der Lagerabzug erfolgreich ist und die nächsten Schritte den Umfang dieser Beispieldiskussion nicht erfordern.Daher wird nach dem erfolgreichen Platziert dieses Beispiels ein Auftragsdatensatz in der Datenbank generiert, um das Ende der Auftragserstellung anzugeben.

Obwohl sich dieser Artikel auf die Verwendung von Minion konzentriert, erfordert er Kenntnisse der vorherigen "Defining Claptrap" wegen der Notwendigkeit, ein neues OrderGrain-Objekt zu verwenden.

Minion ist eine spezielle Claptrap, und seine Beziehung zu MasterClaptrap wird im folgenden image：

![Minion](/images/20190228-002.gif)

Sein Hauptentwicklungsprozess ist ähnlich wie der von Claptrap, mit nur wenigen Schnitten.Vergleichen Sie die following：

| Schritte                                    | Claptrap | Minion |
| ------------------------------------------- | -------- | ------ |
| ClaptrapTypeCode definieren                 | √        | √      |
| Definieren des Zustands                     | √        | √      |
| Definieren der Korn-Schnittstelle           | √        | √      |
| Implement Grain                             | √        | √      |
| Registrieren Sie sich für Grain             | √        | √      |
| Definieren von EventCode                    | √        |        |
| Definieren des Ereignisses                  | √        |        |
| Implement EventHandler                      | √        | √      |
| Registrieren Sie sich für EventHandler      | √        | √      |
| Implementieren von IInitialStateDataFactory | √        | √      |

Der Grund für diese Reduzierung ist, dass, da Minion ein Ereignis-Consumer für Claptrap ist, die Definition von ereignisbezogenen nicht behandelt werden muss.Aber andere Teile sind noch notwendig.

> Am Anfang dieses Artikels werden wir nicht mehr den spezifischen Dateispeicherort des relevanten Codes auflisten, in der Hoffnung, dass die Leser in der Lage sein werden, ihre eigenen im Projekt zu finden, um zu meistern.

## Implementieren von OrderGrain

Basierend auf dem Wissen um die vorherige "Defining Claptrap" implementieren wir hier ein OrderGrain, um den Auftragsvorgang darzustellen.Um Platz zu sparen, listen wir nur die wichtigsten Teile auf.

### OrderState

Der Status des Auftrags wird definiert：

```cs
using System.Collections.Generic;
using Newbe.Claptrap;

namespace HelloClaptrap.Models.Order
{
    public class OrderState : IStateData
    {
        public bool OrderCreated { get; set; }
        public string UserId { get; set; }
        public Dictionary<string, int> Skus { get; set; }
    }
}
```

1. OrderCreated gibt an, ob der Auftrag erstellt wurde und vermeidet es, den Auftrag wiederholt zu erstellen.
2. UserId unter der Einzelbenutzer-ID
3. Skus-Bestellungen enthalten SkuIds und Bestellmengen

### OrderCreatedEvent

Das Auftragserstellungsereignis ist als follows：

```cs
using System.Collections.Generic;
using Newbe.Claptrap;

namespace HelloClaptrap.Models.Order.Events
{
    public class OrderCreatedEvent : IEventData
    {
        public string UserId { get; set; }
        public Dictionary<string, int> Skus { get; set; }
    }
}
```

### OrderGrain

```cs
using System.Threading.Tasks;
using HelloClaptrap.Actors.Order.Events;
using HelloClaptrap.IActor;
using HelloClaptrap.Models;
using HelloClaptrap.Models.Order;
using HelloClaptrap.Models.Order.Events;
using Newbe.Claptrap;
using Newbe.Claptrap.Orleans;
using Orleans;

namespace HelloClaptrap.Actors.Order
{
    [ClaptrapEventHandler(typeof(OrderCreatedEventHandler), ClaptrapCodes.OrderCreated)]
    public class OrderGrain : ClaptrapBoxGrain<OrderState>, IOrderGrain
    {
        private readonly IGrainFactory _grainFactory;

        public OrderGrain(IClaptrapGrainCommonService claptrapGrainCommonService,
            IGrainFactory grainFactory)
            : base(claptrapGrainCommonService)
        {
            _grainFactory = grainFactory;
        }

        public async Task CreateOrderAsync(CreateOrderInput input)
        {
            var orderId = Claptrap.State.Identity.Id;
            // throw exception if order already created
            if (StateData.OrderCreated)
            {
                throw new BizException($"order with order id already created : {orderId}");
            }

            // get items from cart
            var cartGrain = _grainFactory.GetGrain<ICartGrain>(input.CartId);
            var items = await cartGrain.GetItemsAsync();

            // update inventory for each sku
            foreach (var (skuId, count) in items)
            {
                var skuGrain = _grainFactory.GetGrain<ISkuGrain>(skuId);
                await skuGrain.UpdateInventoryAsync(-count);
            }

            // remove all items from cart
            await cartGrain.RemoveAllItemsAsync();

            // create a order
            var evt = this.CreateEvent(new OrderCreatedEvent
            {
                UserId = input.UserId,
                Skus = items
            });
            await Claptrap.HandleEventAsync(evt);
        }
    }
}
```

1. OrderGrain implementiert die Kernlogik der Auftragserstellung, bei der die CreateOrderAsync-Methode die Erfassung von Warenkorbdaten und die mit Lagerabzug zusammenhängenden Aktionen abschließt.
2. Die relevanten Felder im Status werden aktualisiert, nachdem orderCreatedEvent erfolgreich ausgeführt wurde und hier nicht mehr aufgeführt sind.

## Bestelldaten über Minion in der Datenbank speichern

Vom Anfang der Serie bis zu diesem, wir nie datenbankbezogene Operationen erwähnt.Denn wenn Sie das Claptrap-Framework verwenden, wurden die meisten Vorgänge durch "Schreiben in Ereignisse" und "Zustandsaktualisierungen" ersetzt, Sie müssen Datenbankvorgänge überhaupt nicht selbst schreiben.

Da Claptrap jedoch in der Regel für ein einzelnes Objekt (eine Bestellung, eine SKU, einen Warenkorb) ausgelegt ist, ist es nicht möglich, alle Daten (alle Bestellungen, alle SKUs, alle Einkaufswagen) zu erhalten.An diesem Punkt müssen Sie die Zustandsdaten in einer anderen Persistenzstruktur (Datenbank, Datei, Cache usw.) beibehalten, um Abfragen oder andere Vorgänge für die gesamte Situation abzuschließen.

Das Konzept von Minion wurde in das Claptrap-Framework eingeführt, um diesen Anforderungen gerecht zu werden.

Als Nächstes führen wir ein OrderDbGrain (ein Minion) in das Beispiel ein, um den OrderGrain-Auftragsvorgang asynchron abzuschließen.

## ClaptrapTypeCode definieren

```cs
  namespace HelloClaptrap.Models
  {
      public static class ClaptrapCodes
      {
          #region Cart

          public const string CartGrain = "cart_claptrap_newbe";
          private const string CartEventSuffix = "_e_" + CartGrain;
          public const string AddItemToCart = "addItem" + CartEventSuffix;
          public const string RemoveItemFromCart = "removeItem" + CartEventSuffix;
          public const string RemoveAllItemsFromCart = "remoeAllItems" + CartEventSuffix;

          #endregion

          #region Sku

          public const string SkuGrain = "sku_claptrap_newbe";
          private const string SkuEventSuffix = "_e_" + SkuGrain;
          public const string SkuInventoryUpdate = "inventoryUpdate" + SkuEventSuffix;

          #endregion

          #region Order

          public const string OrderGrain = "order_claptrap_newbe";
          private const string OrderEventSuffix = "_e_" + OrderGrain;
          public const string OrderCreated = "orderCreated" + OrderEventSuffix;

+         public const string OrderDbGrain = "db_order_claptrap_newbe";

          #endregion
      }
  }
```

Minion ist eine spezielle Claptrap, mit anderen Worten, es ist auch eine Claptrap.ClaptrapTypeCode ist für Claptrap erforderlich und muss dieser Definition hinzugefügt werden.

## Definieren des Zustands

Da dieses Beispiel nur einen Auftragsdatensatz in die Datenbank schreiben muss und keine Daten im Status erfordert, ist dieser Schritt in diesem Beispiel nicht erforderlich.

## Definieren der Korn-Schnittstelle

```cs
+ using HelloClaptrap.Models;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.IActor
+ {
+     [ClaptrapMinion(ClaptrapCodes.OrderGrain)]
+     [ClaptrapState(typeof(NoneStateData), ClaptrapCodes.OrderDbGrain)]
+     public interface IOrderDbGrain : IClaptrapMinionGrain
+     {
+     }
+ }
```

1. ClaptrapMinion wird verwendet, um das Korn als Minion zu markieren, wobei Code auf seine entsprechende MasterClaptrap zeigt.
2. ClaptrapState wird verwendet, um den Datentyp "State" von Claptrap zu markieren.Im vorherigen Schritt haben wir deutlich gemacht, dass das Minion keine StateData benötigt, also verwenden Sie NoneStateData anstelle des integrierten Typs des Frameworks.
3. IClaptrapMinionGrain ist die Minion-Schnittstelle, die sich von IClaptrapGrain unterscheidet.Wenn ein Grain Minion ist, müssen Sie die Schnittstelle erben.
4. ClaptrapCodes.OrderGrain und ClaptrapCodes.OrderDbGrain sind zwei verschiedene Zeichenfolgen, und ich hoffe, der Leser ist kein interstellarer Patrist.

> Star Master：Aufgrund des schnellen Tempos des StarCraft-Wettbewerbs, der Menge an Informationen, können Spieler einige der Informationen leicht ignorieren oder falsch einschätzen, so dass oft "Spieler nicht die wichtigsten Ereignisse sehen, die unter der Nase auftreten" lustige Fehler.Die Spieler scherzen also, dass interstellare Spieler blind sind (es gab wirklich ein blindes und professionelles Duell), je höher das Segment, desto ernster sind die blinden, professionellen interstellaren Spieler.

## Implement Grain

```cs
+ using System.Collections.Generic;
+ using System.Threading.Tasks;
+ using HelloClaptrap.Actors.DbGrains.Order.Events;
+ using HelloClaptrap.IActor;
+ using HelloClaptrap.Models;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.Actors.DbGrains.Order
+ {
+     [ClaptrapEventHandler(typeof(OrderCreatedEventHandler), ClaptrapCodes.OrderCreated)]
+     public class OrderDbGrain : ClaptrapBoxGrain<NoneStateData>, IOrderDbGrain
+     {
+         public OrderDbGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
+             : base(claptrapGrainCommonService)
+         {
+         }
+
+         public async Task MasterEventReceivedAsync(IEnumerable<IEvent> events)
+         {
+             foreach (var @event in events)
+             {
+                 await Claptrap.HandleEventAsync(@event);
+             }
+         }
+
+         public Task WakeAsync()
+         {
+             return Task.CompletedTask;
+         }
+     }
+ }
```

1. MasterEventReceivedAsync ist eine von IClaptrapMinionGrain definierte Methode, die bedeutet, Ereignisbenachrichtigungen von MasterClaptrap in Echtzeit zu empfangen.Erweitern Sie die Beschreibung hier nicht, folgen Sie einfach der obigen Vorlage.
2. WakeAsync ist die von IClaptrapMinionGrain definierte Methode, die das aktive Aufwachen von Minion durch masterClaptrap darstellt.Erweitern Sie die Beschreibung hier nicht, folgen Sie einfach der obigen Vorlage.
3. Wenn der Leser den Quellcode anzeigt, stellt er fest, dass die Klasse separat in einer Assembly definiert ist.Dies ist nur eine Klassifizierungsmethode, die als Klassifizierung von Minion und MasterClaptrap in zwei verschiedenen Projekten verstanden werden kann.Es ist eigentlich kein Problem, es zusammenzustellen.

## Registrieren Sie sich für Grain

Da wir OrderDbGrain in einer separaten Assembly definieren, ist für diese Assembly eine zusätzliche Registrierung erforderlich.Wie follows：

```cs
  using System;
  using Autofac;
  using HelloClaptrap.Actors.Cart;
  using HelloClaptrap.Actors.DbGrains.Order;
  using HelloClaptrap.IActor;
  using HelloClaptrap.Repository;
  using Microsoft.AspNetCore.Hosting;
  using Microsoft.Extensions.Hosting;
  using Microsoft.Extensions.Logging;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Bootstrapper;
  using NLog.Web;
  using Orleans;

  namespace HelloClaptrap.BackendServer
  {
      public class Program
      {
          public static void Main(string[] args)
          {
              var logger = NLogBuilder.ConfigureNLog("nlog.config").GetCurrentClassLogger();
              try
              {
                  logger.Debug("init main");
                  CreateHostBuilder(args).Build().Run();
              }
              catch (Exception exception)
              {
                  //NLog: catch setup errors
                  logger.Error(exception, "Stopped program because of exception");
                  throw;
              }
              finally
              {
                  // Ensure to flush and stop internal timers/threads before application-exit (Avoid segmentation fault on Linux)
                  NLog.LogManager.Shutdown();
              }
          }

          public static IHostBuilder CreateHostBuilder(string[] args) =>
              Host.CreateDefaultBuilder(args)
                  .ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); })
                  .UseClaptrap(
                      builder =>
                      {
                          builder
                              .ScanClaptrapDesigns(new[]
                              {
                                  typeof(ICartGrain).Assembly,
                                  typeof(CartGrain).Assembly,
+                                 typeof(OrderDbGrain).Assembly
                              })
                              .ConfigureClaptrapDesign(x =>
                                  x.ClaptrapOptions.EventCenterOptions.EventCenterType = EventCenterType.OrleansClient);
                      },
                      builder => { builder.RegisterModule<RepositoryModule>(); })
                  .UseOrleansClaptrap()
                  .UseOrleans(builder => builder.UseDashboard(options => options.Port = 9000))
                  .ConfigureLogging(logging =>
                  {
                      logging.ClearProviders();
                      logging.SetMinimumLevel(LogLevel.Trace);
                  })
                  .UseNLog();
      }
  }
```

## Implement EventHandler

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

1. IOrderRepository ist eine Schnittstelle, die direkt auf der Speicherebene zum Hinzufügen und Löschen von Aufträgen arbeitet.Die Schnittstelle wird hier aufgerufen, um den eingehenden Betrieb der Auftragsdatenbank zu implementieren.

## Registrieren Sie sich für EventHandler

Um Speicherplatz zu sparen, haben wir uns im Code für den Abschnitt "Grain implementieren" registriert.

## Implementieren von IInitialStateDataFactory

Da StateData keine spezielle Definition hat, ist es nicht erforderlich, IInitialStateDataFactory zu implementieren.

## Ändern des Controllers

Im Beispiel haben wir OrderController hinzugefügt, um Bestellungen und Abfrageaufträge aufzugeben.Leser können es im Quellcode anzeigen.

Leser können die folgenden Schritte ausführen, um eine reale：

1. POST `/api/cart/123` ""skuId": "yueluo-666", "count":30" fügen Sie 30 Einheiten Yueluo-666 Konzentrat in den 123 Warenkorb.
2. POST `/api/order` "userId": "999", "cartId": "123"" als 999 userId, aus dem 123 Warenkorb, um eine Bestellung aufzugeben.
3. Abrufen `/api/order` über die API angezeigt werden können, nachdem die Bestellung erfolgreich aufgegeben wurde.
4. GET `/api/sku/yueluo-666` die SKU-API den Lagerbestand nach Der Bestellung anzeigen kann.

## Zusammenfassung

An dieser Stelle haben wir die "Warenordnung" dieser Anforderung des Basisinhalts abgeschlossen.In diesem Beispiel erhalten Sie einen ersten Einblick, wie mehrere Claptraps zusammenarbeiten können und wie Sie Minion zum Ausführen asynchroner Aufgaben verwenden können.

Es gibt jedoch eine Reihe von Fragen, die wir später erörtern werden.

Sie können den Quellcode für diesen Artikel aus den folgenden address：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
