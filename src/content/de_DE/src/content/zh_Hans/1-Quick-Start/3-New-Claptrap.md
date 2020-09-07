---
title: 'Schritt 3 - Definieren Sie Claptrap und verwalten Sie den Bestand von Waren.'
metaTitle: 'Schritt 3 - Definieren Sie Claptrap und verwalten Sie den Bestand von Waren.'
metaDescription: 'Schritt 3 - Definieren Sie Claptrap und verwalten Sie den Bestand von Waren.'
---

Mit diesem Artikel können Sie versuchen, Geschäfte mit Claptrap zu machen.

> [Die aktuell angezeigte Version ist das Ergebnis Chinesisch Vereinfachte Maschine übersetzt Selbstkontrolle und manuell Korrekturen.Wenn das Dokument eine unsachgemäße Übersetzung enthält, klicken Sie bitte hier, um Ihre Übersetzungsvorschläge einzureichen.](https://crwd.in/newbeclaptrap)

<!-- more -->

## Eröffnungszusammenfassung.

In diesem Artikel lernte ich, wie man eine Claptrap in einem vorhandenen Projektbeispiel definiert, indem ich die Notwendigkeit implementiert habe, "Inventar zu verwalten".

In Kombination mit den grundlegenden Schritten des vorherigen Artikels, definieren Sie Claptrap, solange Sie ein paar Schritte hinzufügen.Die vollständigen Schritte werden unten gezeigt, wobei sich der Abschnitt "Neuer Inhalt" von den vorherigen neuen Inhalten in diesem article：

1. ClaptrapTypeCode definieren (Neuer Inhalt)
1. Definieren des Status (Neuer Inhalt)
1. Definieren der Kornschnittstelle (neuer Inhalt)
1. Implementieren von Getreide (Neuer Inhalt)
1. Abonnieren Sie unsere Produkte Grain (New Content)
1. Definieren Sie EventCode.
1. Definieren Sie das Ereignis.
1. Implementieren Sie den Ereignishandler.
1. Registrieren Sie sich für EventHandler.
1. Implementieren von IInitial StateDataFactory (Neuer Inhalt)
1. Controller ändern.

Dies ist ein Bottom-up-Prozess, und der eigentliche Codierungsprozess kann auch für die Entwicklung angepasst werden.

In diesem Artikel implementierte Geschäftsanwendungsfälle：

1. Implementiert das SKU-Objekt (Stock Keeping Unit), das Bestandsdaten darstellt.
2. Möglichkeit zum Aktualisieren und Lesen von SKUs.

## Definieren Sie ClaptrapTypeCode.

ClaptrapTypeCode ist ein eindeutiger Code für Claptrap.Es spielt eine wichtige Rolle bei der Identifizierung und Serialisierung des Staates.

Öffnen Sie`Die ClaptrapCodes-`-Klasse in`HelloClaptrap.`Projekt.

Fügen Sie ClaptrapTypeCode für die SKU hinzu.

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

## Definieren Sie den Status.

Status stellt die aktuelle Datendarstellung des Actor-Objekts im Actor-Modus dar.

Da Claptrap ein Akteur ist, der auf Ereignisverfolgungsmustern basiert.Daher ist es wichtig, den genauen Zustand zu definieren.

In diesem Beispiel müssen wir nur den Bestand der aktuellen SKU erfassen, sodass der Entwurf des Bundeslandes sehr einfach ist.

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

`IStateData`-Schnittstelle ist eine leere Schnittstelle im Framework, die Status darstellt und für generische Rückschlüsse verwendet wird.

## Definieren Sie die Kornschnittstelle.

Definieren Sie die Definition der Grain-Schnittstelle, um externe Interoperabilität mit Claptrap bereitzustellen.

Fügen Sie`ISkuGrain`Schnittstelle`HelloClaptrap.`Projekt hinzu.

Fügen Sie Schnittstellen sowie Attribute hinzu.

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

1. Die`ClaptrapState`ist markiert, um State mit Grain zu assoziieren.
2. Die Schnittstelle erbt`IClaptrapGrain`, eine frameworkdefinierte Grain-Schnittstelle, die auf der Schnittstelle basiert, die Orleans erben muss, um ausgeführt zu werden.
3. Die GetInventoryAsync-Methode wurde hinzugefügt, was "Aktuelles Inventar abrufen" bedeutet.
4. Die UpdateInventoryAsync-Methode wurde hinzugefügt, was "inkrementelle Aktualisierung des aktuellen Inventars" bedeutet.`diff > 0 gibt` Bestandszuwachs an,`diff < 0`einen Rückgang des Lagerbestands angibt.
5. Es ist wichtig zu beachten, dass Grains Methodendefinitionen begrenzt sind.Siehe[Development a Grain](https://dotnet.github.io/orleans/Documentation/grains/index.html).

## Implementieren Sie Getreide.

Nachdem ISkuGrain definiert wurde, können Sie Code für die Implementierung hinzufügen.

Erstellen Sie`neuen<code>Sku-`-Ordner für das Projekt HelloClaptrap.actors</code>Projekt, und fügen Sie den Ordner`SkuGrain`hinzu.

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

1. Vererben Sie`ClaptrapBoxGrain<SkuState>`und implementieren sie`ISkuGrain`ist`ClaptrapBoxGrain`eine frameworkdefinierte Grain-Basisklasse, bei der generische Parameter den entsprechenden Zustandstyp darstellen.
2. Implementieren Sie die GetInventoryAsync-Methode, um die aktuelle Bestandsaufnahme aus StateData zu lesen.
3. Implementieren Sie die UpdateInventoryAsync-Methode, fügen Sie Geschäftsurteilscode hinzu und auslösen Sie Ausnahmen, wenn die Bedingungen für Geschäftsvorgänge nicht erfüllt sind.
4. Das letzte UpdateInventoryAsync, das wir OutImplementEdException auslösen, da das aktuelle Ereignis noch nicht definiert ist und auf nachfolgende Codeimplementierungen warten muss.
5. BizException ist eine benutzerdefinierte Ausnahme, die eigenrfürzabhängig hinzugefügt werden kann.In der tatsächlichen Entwicklung ist es auch möglich, eine Betriebsunterbrechung anzuzeigen, ohne eine Ausnahme auszulösen, und es ist auch möglich, einen Statuscode oder einen anderen Rückgabewert zwischen zu verwenden.

## Registrieren Sie sich für Grain.

Das Korn, das Claptrap entspricht, muss beim Starten der Anwendung registriert werden, damit das Framework nach Erkennung suchen kann.

Da der Beispielcode assemblyweites Scannen verwendet, sind keine Änderungen erforderlich.

Hier wurde die Registrierung place：

Öffnen Sie`Programmklasse für das HelloClap.BackendServer-`-Projekt`-Programm`Projekt.

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

Da ISkuGrain und SkuGrain zur gleichen Baugruppe gehören wie ICartGrain bzw. CartGrain, sind hier keine Modifikationen erforderlich.

## Definieren Sie EventCode.

Wir haben den Hauptteil von Claptrap bereits implementiert, aber wir haben den Bestandsaktualisierungsvorgang noch nicht abgeschlossen.Dies liegt daran, dass das Aktualisieren des Inventars eine Aktualisierung auf Status erfordert.Und wir alle wissen, dass Claptrap ein ereignisbasiertes Actor-Muster ist und Aktualisierungen des Zustands müssen durch Ereignisse durchgeführt werden.Beginnen sie also hier, aktualisieren wir das Inventar durch Ereignisse.

EventCode ist die einzige Codierung für jedes Ereignis auf dem Claptrap-System.Es spielt eine wichtige Rolle bei der Identifizierung und Serialisierung von Ereignissen.

Öffnen Sie`Die ClaptrapCodes-`-Klasse in`HelloClaptrap.`Projekt.

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

## Definieren Sie das Ereignis.

Ereignis ist der Schlüssel zur Ereignisablaufverfolgung.Wird verwendet, um den Status in Claptrap zu ändern.Und Das Ereignis wird auf der Persistenzebene beibehalten.

Erstellen Sie`InventoryUpdateEvent<code>-Klasse unter dem Ordner  Sku/Events``helloClaptrap.models`</code>Projekt.

Fügen Sie den folgenden Code：

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

1. Diff stellt den Lagerbestand für dieses Update dar,`diff > 0` einen Anstieg des Lagerbestands angibt, und`diff < 0`einen Rückgang des Lagerbestands angibt.
2. NewInventory stellt aktualisierten Bestand dar.Hier wird eine Empfehlung im Voraus gegeben, aber aufgrund von Längenproblemen, keine Diskussion：schlägt vor, die aktualisierten Daten des Staates in die Veranstaltung einzubeziehen.

## Implementieren Sie den Ereignishandler.

`EventHandler`, um Ereignisse auf das`State`-System von Claptrap zu aktualisieren.

Erstellen Sie`InventoryUpdateEventHandler`Klasse unter dem Ordner`Sku/Events`für das Projekt`HelloClaptrap.actors`Projekts.

Fügen Sie den folgenden Code：

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

1. Da das aktualisierte Inventar bereits im Ereignis enthalten ist, können Sie StateData direkt zuweisen.

## Registrieren Sie sich für EventHandler.

Nach dem Implementieren und Testen von EventHandler können Sie EventHandler registrieren, um EventCode und Claptrap zuzuordnen.

Öffnen Sie`SkuGrain`für`HelloClap.`Projekt.

Markieren Sie mit Attribut, und ändern Sie updateInventoryAsync-Ausführungsereignisse.

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

## Implementieren Sie IInitial State Data Factory.

Wir haben die Inventarabfrage und -aktualisierung bereits abgeschlossen.Im Allgemeinen gibt es jedoch einen anfänglichen Betrag im Inventar, und wir ergänzen diesen Teil der Logik in diesem Abschnitt.

Erstellen Sie`SkuStateInitHandler<code>unter dem  Sku``Ordner`HelloClaptrap.actors</code>Projekt.

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

1. `IInitial StateDataFactory`aufgerufen, wenn Claptrap zum ersten Mal aktiviert wird, um den Anfangswert von State zu erstellen.
2. Injektion`ISkuRepository`liest den anfänglichen Lagerbetrag für Sku aus der Datenbank, der spezifische Code wird hier nicht aufgeführt, und der Reader kann die Implementierung im Beispiellagerort anzeigen.

Zusätzlich zum Implementierungscode ist eine Registrierung erforderlich, bevor sie aufgerufen werden kann.

Öffnen Sie`SkuGrain`für`HelloClap.`Projekt.

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

## Controller ändern.

Nachdem alle vorherigen Schritte abgeschlossen sind, sind alle Teile von Claptrap abgeschlossen.Claptrap kann jedoch keine Direkteinteroperabilität direkt mit externen Programmen bereitstellen.Daher müssen Sie auch eine API zum Controller-Layer für externe "Leseinventar"-Vorgänge hinzufügen.

Erstellen Sie`neue SkuController-`unter`ordner`des Ordners "Controller"`HelloClaptrap.`Projekt.

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

1. Neue API liest Inventar für eine bestimmte SkuId.Je nach Implementierung des Beispielcodes können Sie`Yueluo-123 übergeben,`Sie einen Lagerbestand von 666 erhalten.Eine SkuId, die nicht vorhanden ist, löst eine Ausnahme aus.
1. Hier wird keine externe API erstellt, um den Bestand zu aktualisieren, da in diesem Beispiel Lagervorgänge durchgeführt werden, wenn Sie im nächsten Artikel einen Bestellkauf aufgeben, und die API ist hier derzeit nicht erforderlich.

## Zusammenfassung.

An dieser Stelle haben wir den gesamten Inhalt der einfachen Anforderung der "Verwaltung der Bestandsführung" abgeschlossen.

Den Quellcode für diesen Artikel können Sie aus den folgenden：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
