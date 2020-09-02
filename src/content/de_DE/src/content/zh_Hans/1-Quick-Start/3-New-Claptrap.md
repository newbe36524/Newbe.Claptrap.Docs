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

      öffentliche statische Klasse ClaptrapCodes

          Werbung und Werbezeichenfolge Cartin s " cart_claptrap_newbe";
          private const string CartEventSuffix , ""e"" , "CartGrain";
          public publicity const string AddItemToCart , "addItem" , "CartEventSuffix";
          publicity const string Remove ItmFromCart , "remove". eItem" und CartEventSuffix;

          #region Sku

sku SkuGrain , "sku_claptrap_newbe";
und private const string SkuEventSuffix , """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

          #endregion
      . . .
  . . . . . . . . . . . . . . . . . .
```

## Definieren Sie den Status.

Status stellt die aktuelle Datendarstellung des Actor-Objekts im Actor-Modus dar.

Da Claptrap ein Akteur ist, der auf Ereignisverfolgungsmustern basiert.Daher ist es wichtig, den genauen Zustand zu definieren.

In diesem Beispiel müssen wir nur den Bestand der aktuellen SKU erfassen, sodass der Entwurf des Bundeslandes sehr einfach ist.

Fügen Sie`<code>Sku-`-Ordner zum HelloClaptrap.Models-</code>-Projekt hinzu und erstellen Sie einen`SkuState-`-Ordner.

Fügen Sie den folgenden Code：

```cs
singningnbe.Claptrap;
s
und Namespace HelloClaptrap.Models.Sku
, s
, öffentliche Klasse SkuState : IStateData
,
, public int . . .

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

Der Lagerbestand stellt den Lagerbestand der aktuellen SKU dar.

`IStateData`-Schnittstelle ist eine leere Schnittstelle im Framework, die Status darstellt und für generische Rückschlüsse verwendet wird.

## Definieren Sie die Kornschnittstelle.

Definieren Sie die Definition der Grain-Schnittstelle, um externe Interoperabilität mit Claptrap bereitzustellen.

Fügen Sie`ISkuGrain`Schnittstelle`HelloClaptrap.`Projekt hinzu.

Fügen Sie Schnittstellen sowie Attribute hinzu.

```cs
Verwenden von Systems.Threading.Tasks;
singen HelloClaptrap.Models;
singen HelloClaptrap.Models.Sku;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
,
, Namespace HelloClaptrap.IActor
,
, claptrapState , ClaptrapCodes.SkuGrain ,
, public interface , . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . laptrapGrain
. . . </summary>

<summary>

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . <returns></returns>
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .         Task<int> GetInventoryAsync();

/ / / / / <summary>
/ / Bestand durch Add diff aktualisieren, diff kann negative Zahl sein
. . . . . . </summary>
<int> </returns>
<returns><param name="diff"></param>
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
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
  Verwenden von System;
  mit Autofac;
  . Hening HelloClaptrap.Actors.Cart;
  Die Vereinigten Staaten von China HelloClaptrap.IActor;
  United Services HelloClaptrap.Repository;
  .AspNetCore.Hosting;
  .Extensions.Hosting;
  .Extensions.Logging;
  . Newbe.Claptrap;
  .Claptrap.Bootstrapper;
  NLog.Web;
  Orleans;

  Namespace HelloClaptrap.BackendServer

      öffentliches Klassenprogramm


          öffentlichen statischen IHostBuilder CreateHostBuilder (Zeichenfolge)>
              Host.CreateDefaultBuilder (args)
                  . ConfigureWebHostDefaults (webBuilder> . .
                  <Startup>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . UseClaptrap (
                      Builder>

s Builder
. ScanClaptrapDesigns (neu)
,
und Typeof (ICartGrain). Montage,
und Typeof (CartGrain). Montage,
, s)
                      ,
                      Erbauer> Baumeister. RegisterModule<RepositoryModule>(); )
                  . Verwenden SieOrleansClaptrap()
                  . UseOrleans (Builders -> Builder. UseDashboards (Optionen> Optionen. Port s 9000))
                  . ConfigureLogging (Protokollierung>

                      Protokollierung. ClearProviders ();
                      Protokollierung. SetMinimumLevel (logLevel.Trace);
                  )
                  . UseNLog();
      . . .
  . . . . . . . . . . . . . . . . . .
```

Da ISkuGrain und SkuGrain zur gleichen Baugruppe gehören wie ICartGrain bzw. CartGrain, sind hier keine Modifikationen erforderlich.

## Definieren Sie EventCode.

Wir haben den Hauptteil von Claptrap bereits implementiert, aber wir haben den Bestandsaktualisierungsvorgang noch nicht abgeschlossen.Dies liegt daran, dass das Aktualisieren des Inventars eine Aktualisierung auf Status erfordert.Und wir alle wissen, dass Claptrap ein ereignisbasiertes Actor-Muster ist und Aktualisierungen des Zustands müssen durch Ereignisse durchgeführt werden.Beginnen sie also hier, aktualisieren wir das Inventar durch Ereignisse.

EventCode ist die einzige Codierung für jedes Ereignis auf dem Claptrap-System.Es spielt eine wichtige Rolle bei der Identifizierung und Serialisierung von Ereignissen.

Öffnen Sie`Die ClaptrapCodes-`-Klasse in`HelloClaptrap.`Projekt.

Fügen Sie EventCode für Update Inventory hinzu.

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
skuEvent Suffix, Publicity, Public und SkuEvent Suffix, "inventoryUpdate";

          #endregion
      . . .
  . . . . . . . . . . . . . . . . . .
```

## Definieren Sie das Ereignis.

Ereignis ist der Schlüssel zur Ereignisablaufverfolgung.Wird verwendet, um den Status in Claptrap zu ändern.Und Das Ereignis wird auf der Persistenzebene beibehalten.

Erstellen Sie`InventoryUpdateEvent<code>-Klasse unter dem Ordner  Sku/Events``helloClaptrap.models`</code>Projekt.

Fügen Sie den folgenden Code：

```cs
singningnbe.Claptrap;
und
, Namespace HelloClap.Models.Sku.Events
,
, public class InventoryUpdateEvent : IEventData



. . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

1. Diff stellt den Lagerbestand für dieses Update dar,`diff > 0` einen Anstieg des Lagerbestands angibt, und`diff < 0`einen Rückgang des Lagerbestands angibt.
2. NewInventory stellt aktualisierten Bestand dar.Hier wird eine Empfehlung im Voraus gegeben, aber aufgrund von Längenproblemen, keine Diskussion：schlägt vor, die aktualisierten Daten des Staates in die Veranstaltung einzubeziehen.

## Implementieren Sie den Ereignishandler.

`EventHandler`, um Ereignisse auf das`State`-System von Claptrap zu aktualisieren.

Erstellen Sie`InventoryUpdateEventHandler`Klasse unter dem Ordner`Sku/Events`für das Projekt`HelloClaptrap.actors`Projekts.

Fügen Sie den folgenden Code：

```cs
Verwenden von Systems.Threading.Tasks;
singen HelloClaptrap.Models.Sku;
singen HelloClaptrap.Models.Sku.Events;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

und Namespace HelloClaptrap.Actors.Sku.Events
,
, die öffentliche Klasse InventoryUpdateEventHandler
und : NormalEventHandler<SkuState, InventoryUpdateEvent>
,
, publicity override ValueTask StateData,
, inventoryUpdateEvent eventData,
, IEventContext eventContext)
. . .
stateData.Inventory , eventData.NewInventory;
und geben Sie neue ValueTask();
. . . .
. . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

1. Da das aktualisierte Inventar bereits im Ereignis enthalten ist, können Sie StateData direkt zuweisen.

## Registrieren Sie sich für EventHandler.

Nach dem Implementieren und Testen von EventHandler können Sie EventHandler registrieren, um EventCode und Claptrap zuzuordnen.

Öffnen Sie`SkuGrain`für`HelloClap.`Projekt.

Markieren Sie mit Attribut, und ändern Sie updateInventoryAsync-Ausführungsereignisse.

```cs
  Verwenden von System.Threading.Tasks;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
  Die 1990er Jahre, HelloClaptrap.IActor;
  Die Vereinigten Staaten Ofsing HelloClaptrap.Models;
  .HelloClaptrap.Models.Sku;
singen HelloClaptrap.Models.Sku.Events;
  .Claptrap;
  Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Sku


      snr. public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      ,
          Public SkuGrain ( IClaptrap Grain Common Services Claptrap Grain CommonService )
              : Base ( claptrapGrainCommonService)
          {
          }

          öffentliche Aufgabe<int> GetInventoryAsync()

              Return Task.FromResult (StateData.Inventory);
          )

          Public Async Task<int> Update InventyAsync (int diff)

              wenn

                  werfen Sie neue bizException ("diff kann nicht 0 sein");
              .

              var old , StateData.Inventory;
              var newInventory , old , diff;
              (newInventory < 0)
              die
                  neue bizException auslösen (
                      nicht in der Liste zu aktualisieren. Es wird kleiner als 0 sein, wenn diff Betrag hinzufügen. aktuell : {old} , diff : {diff}" );
              -

- neue NotImplementedException ();
und var evt , dies. CreateEvent (neues InventoryUpdateEvent
s
s Diff s diff,
s newinventory s newinventory
s) );
und warten Claptrap.HandleEventAsync (evt);
und Rückgabe stateData.Inventory;
          ,
      ,
  .
```

## Implementieren Sie IInitial State Data Factory.

Wir haben die Inventarabfrage und -aktualisierung bereits abgeschlossen.Im Allgemeinen gibt es jedoch einen anfänglichen Betrag im Inventar, und wir ergänzen diesen Teil der Logik in diesem Abschnitt.

Erstellen Sie`SkuStateInitHandler<code>unter dem  Sku``Ordner`HelloClaptrap.actors</code>Projekt.

```cs
Verwenden von Systems.Threading.Tasks;
singen HelloClaptrap.Models.Sku;
singen HelloClaptrap.Repository;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
und
, namespace HelloClap.Actors.Sku
,
, public class SkuStateInitHandler : IinitialState DataFactory
,
, private readonly ISkuRepository _skuRepository;
s
skuStateInitHandler (
skuRepository skuRepository)
_skuRepository
sk. uRepository;
,
,
, public async Task<IStateData> Create (IClaptrapIdentity Identity)
,
, var skuId und identity. ID;
und var Inventar _skuRepository.GetInitInventoryAsync (skuId);
und var re , neue SkuState
,
, Inventar , Inventar
, .
und Rückkehr re;
. . . .
. . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

1. `IInitial StateDataFactory`aufgerufen, wenn Claptrap zum ersten Mal aktiviert wird, um den Anfangswert von State zu erstellen.
2. Injektion`ISkuRepository`liest den anfänglichen Lagerbetrag für Sku aus der Datenbank, der spezifische Code wird hier nicht aufgeführt, und der Reader kann die Implementierung im Beispiellagerort anzeigen.

Zusätzlich zum Implementierungscode ist eine Registrierung erforderlich, bevor sie aufgerufen werden kann.

Öffnen Sie`SkuGrain`für`HelloClap.`Projekt.

```cs
  Verwenden von System.Threading.Tasks;
  Die Vereinigten Staaten Ofthing Hello Claptrap.Actors.Sku.Events;
  Die 1990er Jahre, HelloClaptrap.IActor;
  Die Vereinigten Staaten Ofsing HelloClaptrap.Models;
  .HelloClaptrap.Models.Sku;
  .HelloClaptrap.Models.Sku.Events;
  .Claptrap;
  Newbe.Claptrap.Orleans;

  Namespace HelloClaptrap.Actors.Sku
  snr.
snr. skptrapState Information Factory Handler)
      snr. (InventoryUpdateEventHandler), ClaptrapCodes.SkuVentory Update)
      Public Class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain

          Public SkuGrain ( IClaptrapGrainCommonService Claptrap Grain Common Services
              : base (claptrapGrainCommonService)
          {
          }

          Public Task<int> GetInventoryAsync (

              Return Task.From Reserve (StateData.Inventory);
          ;

          Public Information Task<int> UpdateInventoryAsync (int diff

              , wenn (diff s 0)
              s
                  neue bizException ("diff can't 0");
              s

              var old s StateData.Inventory;
              var newinvent snr . . . old s diff;
              if (newinvent < 0)

                  neuen bisp. auf (
                      nicht in der Lage, den Bestand zu aktualisieren. Es wird kleiner als 0 sein, wenn diff Betrag hinzufügen. strom : {old} , diff : {diff}" );
              .

              var evt . . . dies. CreateEvent (new InventoryUpdateEvent

                  Diff s diff,
                  NewInventory s newinventory
              ) );
              .HandleEventAsync (evt);
              StateData.Inventory;
          ,
      ,
  .
```

## Controller ändern.

Nachdem alle vorherigen Schritte abgeschlossen sind, sind alle Teile von Claptrap abgeschlossen.Claptrap kann jedoch keine Direkteinteroperabilität direkt mit externen Programmen bereitstellen.Daher müssen Sie auch eine API zum Controller-Layer für externe "Leseinventar"-Vorgänge hinzufügen.

Erstellen Sie`neue SkuController-`unter`ordner`des Ordners "Controller"`HelloClaptrap.`Projekt.

```cs
Verwenden von Systems.Threading.Tasks;
singen HelloClaptrap.IActor;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
und mit Orleans;

, namespace HelloClaptrap.Web.Controllers
,
, route ( " api /[controller]" ) ,
, public class SkuController : Controller
,
, private readonly IGrain Factory _grainFactory;
s
skuController (
s.iGrainFactory grainfactory)
s.
s. _grainFactory . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . _grainFac

<IActionResult> 
{id}


. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . Tory. GetGrain<ISkuGrain>(id);
s.var Inventar skuGrain.GetInventoryAsync();
, rückgabe Json (neue
,
, skuId , id,
, inventar ,
, s) ;
,
, ,
, . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

1. Neue API liest Inventar für eine bestimmte SkuId.Je nach Implementierung des Beispielcodes können Sie`Yueluo-123 übergeben,`Sie einen Lagerbestand von 666 erhalten.Eine SkuId, die nicht vorhanden ist, löst eine Ausnahme aus.
1. Hier wird keine externe API erstellt, um den Bestand zu aktualisieren, da in diesem Beispiel Lagervorgänge durchgeführt werden, wenn Sie im nächsten Artikel einen Bestellkauf aufgeben, und die API ist hier derzeit nicht erforderlich.

## Zusammenfassung.

An dieser Stelle haben wir den gesamten Inhalt der einfachen Anforderung der "Verwaltung der Bestandsführung" abgeschlossen.

Den Quellcode für diesen Artikel können Sie aus den folgenden：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
