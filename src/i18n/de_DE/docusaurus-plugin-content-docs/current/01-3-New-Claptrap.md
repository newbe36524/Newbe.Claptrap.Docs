---
title: "Der dritte Schritt ist die Definition von Claptrap und die Verwaltung des Bestands von Waren"
description: "Der dritte Schritt ist die Definition von Claptrap und die Verwaltung des Bestands von Waren"
---

Mit dieser Lektüre können Sie versuchen, Geschäfte mit Claptrap zu machen.

<!-- more -->

## Eine Eröffnungszusammenfassung

In diesem Artikel lernte ich, wie man eine Claptrap in einem vorhandenen Projektbeispiel definiert, indem ich die Anforderungen der "Verwaltung von Inventar" implementiert e.B.

In Kombination mit den grundlegenden Schritten des vorherigen Artikels, definieren Sie Claptrap, solange Sie ein paar Schritte außerhalb hinzufügen.Die vollständigen Schritte werden unten gezeigt, wobei der Abschnitt "Neuer Inhalt" zum neuen Inhalt dieses Artikels gehört, der sich von den vorherigen：

1. Definieren von ClaptrapTypeCode (Neuer Inhalt)
1. Status definieren (Neuer Inhalt)
1. Definieren der Kornschnittstelle (neuer Inhalt)
1. Implementieren von Getreide (Neuer Inhalt)
1. Abonnieren Sie unsere Produkte Grain (New Content)
1. Definieren von EventCode
1. Definieren des Ereignisses
1. Implement EventHandler
1. Registrieren Sie sich für EventHandler
1. Implementieren von IInitialStateDataFactory (Neuer Inhalt)
1. Ändern des Controllers

Dies ist ein Bottom-up-Prozess, und die Entwicklung kann während des eigentlichen Codierungsprozesses angepasst werden.

Die in diesem Artikel implementierten geschäftlichen Anwendungsfälle：

1. Implementiert ein SKU-Objekt, das Bestandsdaten darstellt.
2. Möglichkeit zum Aktualisieren und Lesen von SKUs.

## ClaptrapTypeCode definieren

ClaptrapTypeCode ist der einzige Code für Claptrap.Es spielt eine wichtige Rolle bei der Identifizierung, Serialisierung und so weiter des Staates.

Öffnen Sie`der ClaptrapCodes-`-Klasse in`das HelloClaptrap.`-Projekt.

Fügen Sie SKUs ClaptrapTypeCode hinzu.

```cs
  namespace HelloClaptrap.Models
  {
      public static class ClaptrapCodes
      {
          public const string CartGrain = "cart_claptrap_newbe";
          private const string CartEventSuffix = "_e_" + CartGrain;
          public const string AddItemToCart = "addItem" + CartEventSuffix;
          public const string RemoveItemFromCart = "removeItem" + CartEventSuffix;

          #region Sku

+         public const string SkuGrain = "sku_claptrap_newbe";
+         private const string SkuEventSuffix = "_e_" + SkuGrain;

          #endregion
      }
  }
```

## Definieren des Zustands

Status stellt die aktuelle Datenleistung des Actor-Objekts im Actor-Modus dar.

Denn Claptrap ist ein Schauspieler, der auf Event-Sourcing-Mustern basiert.Daher ist es wichtig, den genauen Zustand zu definieren.

In diesem Beispiel müssen wir nur den Bestand der aktuellen SKU erfassen, daher ist der Zustandsentwurf sehr einfach.

Fügen `Sku-` Sie`-Ordner zum HelloClaptrap.Models-`-Projekt hinzu und erstellen Sie einen`SkuState-`-Ordner.

Fügen Sie den folgenden Code:

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Sku
+ {
+     public class SkuState : IStateData
+     {
+         public int Inventory { get; set; }
+     }
+ }
```

Der Lagerbestand stellt den Lagerbestand der aktuellen SKU dar.

`IStateData`-Schnittstelle ist eine leere Schnittstelle, die den Status im Framework darstellt und in generischen Rückschlüssen verwendet wird.

## Definieren der Korn-Schnittstelle

Definieren Sie die Definition der Grain-Schnittstelle, um externe Interoperabilität mit Claptrap bereitzustellen.

Fügen Sie`ISkuGrain-Schnittstelle zu`HelloClaptrap.IActors``-Projekt hinzu.

Fügen Sie Schnittstellen sowie Attribut hinzu.

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models;
+ using HelloClaptrap.Models.Sku;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.IActor
+ {
+     [ClaptrapState(typeof(SkuState), ClaptrapCodes.SkuGrain)]
+     public interface ISkuGrain : IClaptrapGrain
+     {
+         /// <summary>
+         /// Get latest inventory of this sku
+         /// </summary>
+         /// <returns></returns>
+         Task<int> GetInventoryAsync();
+
+         /// <summary>
+         /// Update inventory by add diff, diff could be negative number
+         /// </summary>
+         /// <param name="diff"></param>
+         /// <returns>Inventory after updating</returns>
+         Task<int> UpdateInventoryAsync(int diff);
+     }
+ }
```

Es wurde added：

1. Markieren Sie die`ClaptrapState`, damit der Status mit Grain verknüpft ist.
2. Die Schnittstelle erbt`IClaptrapGrain`, einer frameworkdefinierten Grain-Schnittstelle, die geerbt werden muss, um auf Orleans ausgeführt zu werden.
3. Die GetInventoryAsync-Methode wurde hinzugefügt, um anzugeben, dass "aktueller Bestand abrufen" angegeben wird.
4. Die UpdateInventoryAsync-Methode wurde hinzugefügt, um eine "inkrementelle Aktualisierung des aktuellen Bestands" anzuzeigen.`diff 0 > 0` einer Erhöhung des Lagerbestands,`diff < 0`einem Rückgang des Lagerbestands.
5. Es ist wichtig zu beachten, dass Grains Methodendefinition gewisse Einschränkungen aufweist.Weitere Informationen finden Sie[unter "Entwicklung einer grain](https://dotnet.github.io/orleans/Documentation/grains/index.html).

## Implement Grain

Nachdem Sie ISkuGrain definiert haben, können Sie Code hinzufügen, um es zu implementieren.

Erstellen `Sku-` Sie`neuen-Ordner für das Projekt HelloClaptrap.actors`Projekt, und fügen Sie den Ordner`SkuGrain`hinzu.

```cs
+ using System;
+ using System.Threading.Tasks;
+ using HelloClaptrap.IActor;
+ using HelloClaptrap.Models;
+ using HelloClaptrap.Models.Sku;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.Actors.Sku
+ {
+     public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
+     {
+         public SkuGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
+             : base(claptrapGrainCommonService)
+         {
+         }
+
+         public Task<int> GetInventoryAsync()
+         {
+             return Task.FromResult(StateData.Inventory);
+         }
+
+         public async Task<int> UpdateInventoryAsync(int diff)
+         {
+             if (diff == 0)
+             {
+                 throw new BizException("diff can`t be 0");
+             }
+
+             var old = StateData.Inventory;
+             var newInventory = old + diff;
+             if (newInventory < 0)
+             {
+                 throw new BizException(
+                     $"failed to update inventory. It will be less than 0 if add diff amount. current : {old} , diff : {diff}");
+             }
+
+             throw new NotImplementedException();
+         }
+     }
+ }
```

Es wurde added：

1. Das Vererben`ClaptrapBoxGrain<SkuState>`und das Implementieren`ISkuGrain`ist`ClaptrapBoxGrain`eine frameworkdefinierte Grain-Basisklasse, bei der generische Parameter den entsprechenden State-Typ darstellen.
2. Implementieren Sie die GetInventoryAsync-Methode, um das aktuelle Inventar aus StateData zu lesen.
3. Implementieren Sie die UpdateInventoryAsync-Methode, fügen Sie Geschäftsurteilscode hinzu und auslösen Sie Ausnahmen, wenn die Bedingungen für Geschäftsvorgänge nicht erfüllt sind.
4. UpdateInventoryAsyncs letzte Meldung löst jetzt NotImplementedException aus, da das aktuelle Ereignis noch nicht definiert ist und auf eine nachfolgende Codeimplementierung warten muss.
5. BizException ist eine benutzerdefinierte Ausnahme, die selbst hinzugefügt werden kann.In der tatsächlichen Entwicklung können Sie die Auslaufausnahme auch verwenden, um Geschäftsunterbrechungen darzustellen, jedoch zwischen einem Statuscode oder anderen Rückgabewerten.

## Registrieren Sie sich für Grain

Grain for Claptrap muss beim Anwendungsstart registriert werden, damit das Framework nach Erkennung suchen kann.

Da der Beispielcode einen Assembly-weiten Scan verwendet, muss er eigentlich nicht geändert werden.

Der Ort, an dem die Registrierung stattgefunden hat, wird here：

Öffnen Sie`Program-Klasse für HelloClaptrap.BackendServer`Projekt`das`-Programm.

```cs
  using System;
  using Autofac;
  using HelloClaptrap.Actors.Cart;
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

          public static IHostBuilder CreateHostBuilder(string[] args) =>
              Host.CreateDefaultBuilder(args)
                  .ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); })
                  .UseClaptrap(
                      builder =>
                      {
+                         builder
+                             .ScanClaptrapDesigns(new[]
+                             {
+                                 typeof(ICartGrain).Assembly,
+                                 typeof(CartGrain).Assembly,
+                             });
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

Da ISkuGrain und SkuGrain zur gleichen Assembly gehören wie ICartGrain bzw. CartGrain, besteht hier keine Notwendigkeit, sie zu ändern.

## Definieren von EventCode

Wir haben den Hauptteil von Claptrap früher implementiert, aber wir haben den Vorgang der Aktualisierung des Inventars noch nicht abgeschlossen.Dies liegt daran, dass das Aktualisieren des Inventars die Aktualisierung des Status erfordert.Und wir alle wissen, dass Claptrap ein ereignisbasiertes Schauspielermuster ist, und Aktualisierungen des Status müssen durch Ereignisse durchgeführt werden.Beginnen sie also hier, aktualisieren wir das Inventar durch Ereignisse.

EventCode ist der eindeutige Code für jedes Ereignis im Claptrap-System.Es spielt eine wichtige Rolle bei der Identifizierung und Serialisierung von Ereignissen.

Öffnen Sie`der ClaptrapCodes-`-Klasse in`das HelloClaptrap.`-Projekt.

Fügen Sie EventCode für Update Inventory hinzu.

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
+         public const string SkuInventoryUpdate = "inventoryUpdate" + SkuEventSuffix;

          #endregion
      }
  }
```

## Definieren des Ereignisses

Event ist der Schlüssel zum Event Sourcing.Wird verwendet, um den Status in Claptrap zu ändern.Und Das Ereignis wird auf der Persistenzebene beibehalten.

Erstellen Sie`InventoryUpdateEvent`Klasse unter dem Ordner `-Sku/Events``helloClaptrap.models`Projekt.

Fügen Sie den folgenden Code:

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Sku.Events
+ {
+     public class InventoryUpdateEvent : IEventData
+     {
+         public int Diff { get; set; }
+         public int NewInventory { get; set; }
+     }
+ }
```

1. Diff stellt den Betrag dieses aktualisierten Lagerbestands dar,`diff > 0` einen Anstieg des Lagerbestands angibt, und`diff < 0`eine Reduzierung des Lagerbestands angibt.
2. NewInventory stellt den aktualisierten Bestand dar.Hier wird eine Empfehlung im Voraus gegeben, aber aus Platzgründen gibt es keine Diskussion：empfiehlt, die aktualisierten Daten des Staates in die Veranstaltung einzubeziehen.

## Implement EventHandler

EventHandler 用于将事件更新到 Claptrap 的 State 上。

Erstellen Sie`InventoryUpdateEventHandler`-Klasse unter dem Ordner`Sku/Events``dem Projekt HelloClaptrap.Actors`.

Fügen Sie den folgenden Code:

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Models.Sku.Events;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Sku.Events
+ {
+     public class InventoryUpdateEventHandler
+         : NormalEventHandler<SkuState, InventoryUpdateEvent>
+     {
+         public override ValueTask HandleEvent(SkuState stateData,
+             InventoryUpdateEvent eventData,
+             IEventContext eventContext)
+         {
+             stateData.Inventory = eventData.NewInventory;
+             return new ValueTask();
+         }
+     }
+ }
```

1. Da das aktualisierte Inventar bereits im Ereignis enthalten ist, wird es einfach StateData zugewiesen.

## Registrieren Sie sich für EventHandler

Nachdem Sie EventHandler implementiert und getestet haben, können Sie eventHandler registrieren, um EventCode und Claptrap zuzuordnen.

Öffnen Sie`SkuGrain-Klasse für helloClaptrap.Actors`Projekt`das`-Projekt.

Markieren Sie mit Attribut, und ändern Sie updateInventoryAsync, um das Ereignis auszuführen.

```cs
  using System.Threading.Tasks;
+ using HelloClaptrap.Actors.Sku.Events;
  using HelloClaptrap.IActor;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Models.Sku.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Sku
  {
+     [ClaptrapEventHandler(typeof(InventoryUpdateEventHandler), ClaptrapCodes.SkuInventoryUpdate)]
      public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      {
          public SkuGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

          public Task<int> GetInventoryAsync()
          {
              return Task.FromResult(StateData.Inventory);
          }

          public async Task<int> UpdateInventoryAsync(int diff)
          {
              if (diff == 0)
              {
                  throw new BizException("diff can`t be 0");
              }

              var old = StateData.Inventory;
              var newInventory = old + diff;
              if (newInventory < 0)
              {
                  throw new BizException(
                      $"failed to update inventory. It will be less than 0 if add diff amount. current : {old} , diff : {diff}");
              }

-             throw new NotImplementedException();
+             var evt = this.CreateEvent(new InventoryUpdateEvent
+             {
+                 Diff = diff,
+                 NewInventory = newInventory
+             });
+             await Claptrap.HandleEventAsync(evt);
+             return StateData.Inventory;
          }
      }
  }
```

## Implementieren von IInitialStateDataFactory

Wir haben die Inventarabfrage abgeschlossen und zuvor aktualisiert.Aber in der Regel gibt es einen anfänglichen Betrag im Inventar, und wir ergänzen diesen Teil der Logik in diesem Abschnitt.

在 HelloClaptrap.Actors 项目的 Sku 文件夹下创建 SkuStateInitHandler 类。

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Repository;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Sku
+ {
+     public class SkuStateInitHandler : IInitialStateDataFactory
+     {
+         private readonly ISkuRepository _skuRepository;
+
+         public SkuStateInitHandler(
+             ISkuRepository skuRepository)
+         {
+             _skuRepository = skuRepository;
+         }
+
+         public async Task<IStateData> Create(IClaptrapIdentity identity)
+         {
+             var skuId = identity.Id;
+             var inventory = await _skuRepository.GetInitInventoryAsync(skuId);
+             var re = new SkuState
+             {
+                 Inventory = inventory
+             };
+             return re;
+         }
+     }
+ }
```

1. `IInitialStateDataFactory`wird aufgerufen, wenn Claptrap zum ersten Mal aktiviert wird, um den Anfangswert von State zu erstellen.
2. Injektion`ISkuRepository`liest den anfänglichen Lagerbetrag für Sku aus der Datenbank, der spezifische Code wird hier nicht aufgeführt, und der Reader kann die Implementierung im Beispiellagerort anzeigen.

Zusätzlich zur Implementierung des Codes ist eine Registrierung erforderlich, bevor er aufgerufen werden kann.

Öffnen Sie`SkuGrain-Klasse für helloClaptrap.Actors`Projekt`das`-Projekt.

```cs
  using System.Threading.Tasks;
  using HelloClaptrap.Actors.Sku.Events;
  using HelloClaptrap.IActor;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Sku;
  using HelloClaptrap.Models.Sku.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Sku
  {
+     [ClaptrapStateInitialFactoryHandler(typeof(SkuStateInitHandler))]
      [ClaptrapEventHandler(typeof(InventoryUpdateEventHandler), ClaptrapCodes.SkuInventoryUpdate)]
      public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      {
          public SkuGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

          public Task<int> GetInventoryAsync()
          {
              return Task.FromResult(StateData.Inventory);
          }

          public async Task<int> UpdateInventoryAsync(int diff)
          {
              if (diff == 0)
              {
                  throw new BizException("diff can`t be 0");
              }

              var old = StateData.Inventory;
              var newInventory = old + diff;
              if (newInventory < 0)
              {
                  throw new BizException(
                      $"failed to update inventory. It will be less than 0 if add diff amount. current : {old} , diff : {diff}");
              }

              var evt = this.CreateEvent(new InventoryUpdateEvent
              {
                  Diff = diff,
                  NewInventory = newInventory
              });
              await Claptrap.HandleEventAsync(evt);
              return StateData.Inventory;
          }
      }
  }
```

## Ändern des Controllers

Bis alle vorherigen Schritte abgeschlossen sind, sind alle Teile von Claptrap abgeschlossen.Claptrap kann jedoch keine direkte Interoperabilität mit externen Programmen bieten.Daher müssen Sie auch eine API auf controller-Ebene für externe "Leseinventar"-Vorgänge hinzufügen.

Erstellen Sie`neuen SkuController-`unter dem Ordner`Controller``des Projekts HelloClaptrap.web`.

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.IActor;
+ using Microsoft.AspNetCore.Mvc;
+ using Orleans;
+
+ namespace HelloClaptrap.Web.Controllers
+ {
+     [Route("api/[controller]")]
+     public class SkuController : Controller
+     {
+         private readonly IGrainFactory _grainFactory;
+
+         public SkuController(
+             IGrainFactory grainFactory)
+         {
+             _grainFactory = grainFactory;
+         }
+
+         [HttpGet("{id}")]
+         public async Task<IActionResult> GetItemsAsync(string id)
+         {
+             var skuGrain = _grainFactory.GetGrain<ISkuGrain>(id);
+             var inventory = await skuGrain.GetInventoryAsync();
+             return Json(new
+             {
+                 skuId = id,
+                 inventory = inventory,
+             });
+         }
+     }
+ }
```

1. Neue API liest Inventar für bestimmte SkuIds.Nach der Implementierung des Beispielcodes können Sie`yueluo-123 übergeben`der Lagerbestand s666 beträgt.SkuIds, die nicht vorhanden sind, werfen Ausnahmen aus.
1. Es gibt hier keine externe API zum Aktualisieren des Inventars, da in diesem Beispiel Lagervorgänge durchgeführt werden, wenn Sie im nächsten Abschnitt einen Auftrag aufgeben, und die API ist hier nicht erforderlich.

## Zusammenfassung

An diesem Punkt haben wir das "Verwalten des Wareninventars" dieser einfachen Anforderung aller Inhalte abgeschlossen.

Sie können den Quellcode für diesen Artikel aus den folgenden address：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
