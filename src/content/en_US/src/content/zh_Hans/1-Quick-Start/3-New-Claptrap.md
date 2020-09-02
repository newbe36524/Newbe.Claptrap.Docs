---
title: 'Step 3 - Define Claptrap and manage inventory of goods.'
metaTitle: 'Step 3 - Define Claptrap and manage inventory of goods.'
metaDescription: 'Step 3 - Define Claptrap and manage inventory of goods.'
---

With this article, you can start trying to do business with Claptrap.

> [The version currently viewed is the result Chinese Simplified machine translates self-checking and manually proofreads.If there is any improper translation in the document, please click here to submit your translation suggestions.](https://crwd.in/newbeclaptrap)

<!-- more -->

## Opening summary.

In this article, I learned how to define a Claptrap in an existing project sample by implementing the need to "manage inventory".

Combined with the basic steps of the previous article, define Claptrap as long as you add a few steps out there.The complete steps are shown below, where the section marked "New Content" is different from the previous new content in this article：

1. Define ClaptrapTypeCode (New Content)
1. Defining State (New Content)
1. Define grain interface (new content)
1. Implementing Grain (New Content)
1. Sign up for Grain (New Content)
1. Define EventCode.
1. Define Event.
1. Implement Event Handler.
1. Sign up for EventHandler.
1. Implementing IInitial StateDataFactory (New Content)
1. Modify controller.

This is a bottom-up process, and the actual coding process can also be adjusted for development.

Business use cases implemented in this article：

1. Implements the SKU (Stock Keeping Unit) object that represents inventory data.
2. Ability to update and read SKUs.

## Define ClaptrapTypeCode.

ClaptrapTypeCode is a unique code for Claptrap.It plays an important role in the identification and serialization of State.

Open`The ClaptrapCodes`class in`HelloClaptrap.`project.

Add ClaptrapTypeCode for the SKU.

```cs
  namespace HelloClaptrap.Models

      public static class ClaptrapCodes

          publicity and publicity string Cartin s " cart_claptrap_newbe";
          private const string CartEventSuffix , ""e"" , "CartGrain";
          public publicity const string AddItemToCart , "addItem" , "CartEventSuffix";
          publicity const string Remove ItmFromCart , "remove." eItem" and CartEventSuffix;

          #region Sku

sku SkuGrain , "sku_claptrap_newbe";
and private const string SkuEventSuffix , """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

          #endregion
      . . .
  . .
```

## Define State.

State represents the current data representation of the Actor object in the Actor pattern.

Because Claptrap is an Actor based on event traceability patterns.So it's important to define exactly state.

In this example, we only need to record the inventory of the current SKU, so State's design is very simple.

Add`the<code>Sku`folder to the HelloClaptrap.Models</code>project and create a`SkuState`folder.

Add the following code：

```cs
singningnbe.Claptrap;
s
and namespace HelloClaptrap.Models.Sku
, s
, public class SkuState : IStateData
,
, public int . . . .

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

Inventory represents the inventory of the current SKU.

`IStateData`interface is an empty interface in the framework that represents State and is used for generic inference.

## Define the Grain interface.

Define the definition of the Grain interface to provide external interoperability with Claptrap.

Add`ISkuGrain`interface`HelloClaptrap.`project.

Add interfaces as well as Attributes.

```cs
Using Systems.Threading.Tasks;
sing HelloClaptrap.Models;
sing HelloClaptrap.Models.Sku;
. . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . .
,
, namespace HelloClaptrap.IActor
,
, claptrapState , ClaptrapCodes.SkuGrain ,
, public interface , . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . ISkuGrain : IClaptrapGrain
. . . . </summary>

<summary>

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . <returns></returns>
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .         Task<int> GetInventoryAsync();

/ / / / <summary>
/ / Update inventory by add diff, diff can be negative number
. . . / / </summary>
<int> </returns>
<returns><param name="diff"></param>
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . .
. . . . . . . . . . . . . .
```

The following has been added：

1. The`ClaptrapState`is tagged to associate State with Grain.
2. The interface inherits`IClaptrapGrain`, which is a framework-defined Grain interface that is based on the interface that Orleans must inherit to run.
3. Added the GetInventoryAsync method, which means "Get current inventory."
4. Added the UpdateInventoryAsync method, which means "incremental update of current inventory."`diff > 0 indicates` increase in inventory,`diff < 0`indicates a decrease in inventory.
5. It is important to note that Grain's method definitions are limited.See the[Development a Grain](https://dotnet.github.io/orleans/Documentation/grains/index.html).

## Implement Grain.

Once ISkuGrain has been defined, you can add code for implementation.

Create`new<code>Sku`folder for the HelloClaptrap.actors</code>project and add the`SkuGrain`folder.

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

The following has been added：

1. Inherit`ClaptrapBoxGrain<SkuState>`and implement`ISkuGrain`,`ClaptrapBoxGrain`is a framework-defined Grain base class where generic parameters represent the corresponding State type.
2. Implement the GetInventoryAsync method to read current inventory from StateData.
3. Implement the UpdateInventoryAsync method, add business judgment code, and throw exceptions if the conditions for business operations are not met.
4. The last of UpdateInventoryAsync we're throwing OutImplementEdException because the current event is not yet defined and needs to wait for subsequent code implementations.
5. BizException is a custom exception that can be added on its own.In actual development, it is also possible to indicate a business interruption without throwing an exception, and it is also possible to use a status code or other return value between.

## Sign up for Grain.

The Grain corresponding to Claptrap needs to be registered when the application starts so that the framework can scan for discovery.

Because the sample code uses assembly-wide scanning, no modifications are actually required.

Here's where the registration took place：

Open`program class for the HelloClap.BackendServer`project`program`project.

```cs
  Using System;
  using Autofac;
  . Hening HelloClaptrap.Actors.Cart;
  The United States of China HelloClaptrap.IActor;
  United Services HelloClaptrap.Repository;
  .AspNetCore.Hosting;
  .Extensions.Hosting;
  .Extensions.Logging;
  . Newbe.Claptrap;
  .Claptrap.Bootstrapper;
  NLog.Web;
  Orleans;

  namespace HelloClaptrap.BackendServer

      public class program


          public static IHostBuilder CreateHostBuilder (string)>
              Host.CreateDefaultBuilder (args)
                  . ConfigureWebHostDefaults (webBuilder> . . . . . . . . . .<Startup>. . . . . . . . . . . . . . . . . . . . . . . . . . . . .
                  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . UseClaptrap (
                      Builder>

s builder
. ScanClaptrapDesigns (new)
,
and typeof (ICartGrain). Assembly,
and Typeof (CartGrain). Assembly,
, s)
                      ,
                      builder> builder. RegisterModule<RepositoryModule>(); )
                  . UseOrleansClaptrap()
                  . UseOrleans (Builders -> Builder. UseDashboards (options> options. Port s 9000))
                  . ConfigureLogging (logging>

                      logging. ClearProviders ();
                      logging. SetMinimumLevel (LogLevel.Trace);
                  )
                  . UseNLog();
      . . .
  . .
```

Because ISkuGrain and SkuGrain belong to the same assembly as ICartGrain and CartGrain, respectively, no modifications are required here.

## Define EventCode.

We have implemented the main part of Claptrap before, but we have not completed the inventory update operation.This is because updating inventory requires an update to State.And we all know that Claptrap is an event-based Actor pattern, and updates to State need to be done through events.So start here, let's update the inventory through events.

EventCode is the only encoding for each event on the Claptrap system.It plays an important role in the identification and serialization of events.

Open`The ClaptrapCodes`class in`HelloClaptrap.`project.

Add EventCode for Update Inventory.

```cs
  namespace HelloClaptrap.Models

      public static class ClaptrapCodes

          #region Cart

          public and const string CartGrain s "cart_claptrap_newbe";
          private const string CartEventSuffix, """""""""""""""""""""""""""""""""""
          """"""""""""""""""""""""""""""""""""""""
          """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" Tring RemoveItemFromCart - "RemoveItem" - CartEventSuffix;
          Public publicity const String Remove AllItems FrommCart , "Remoe AllItems" , CartEventSuffix;

          #endregion

          #region Sku

          public publicity and skuGrain - "sku_claptrap_newbe";
          the private const string SkuEventSuffix . . . . . . . . . . . . . . . . . . . . . . . . .
skuEvent Suffix, publicity, public, and SkuEvent Suffix, "inventoryUpdate";

          #endregion
      . . .
  . .
```

## Define Event.

Event is the key to event tracing.Used to change State in Claptrap.And Event is persisted at the persistence layer.

Create`InventoryUpdateEvent<code>class under the  Sku/Events`folder of`the HelloClaptrap.models`</code>project.

Add the following code：

```cs
singningnbe.Claptrap;
and
, namespace HelloClap.Models.Sku.Events
,
, public class InventoryUpdateEvent : IEventData



. . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

1. Diff represents the amount of inventory for this update,`diff > 0` indicates an increase in inventory, and`diff < 0`indicates a decrease in inventory.
2. NewInventory represents updated inventory.Here, a recommendation is given in advance, but due to length issues, no discussion：suggests including State's updated data in the event.

## Implement Event Handler.

`EventHandler`to update events to Claptrap's`State`system.

Create`InventoryUpdateEventHandler`class under the`Sku/Events`folder for the`HelloClaptrap.actors`project.

Add the following code：

```cs
Using Systems.Threading.Tasks;
sing HelloClaptrap.Models.Sku;
sing HelloClaptrap.Models.Sku.Events;
. . . . . . . . . . . . . . . . . . . . .

and namespace HelloClaptrap.Actors.Sku.Events
,
, public class InventoryUpdateEventHandler
, and : NormalEventHandler<SkuState, InventoryUpdateEvent>
,
, publicity override ValueTask StateData,
, inventoryUpdateEvent eventData,
, IEventContext eventContext)
, . . .
stateData.Inventory , eventData.NewInventory;
and return new ValueTask();
. . .
. . .
. . . . . . . . . . . . . . . . . . . .
```

1. Because the updated inventory is already included in the event, you can assign StateData directly.

## Sign up for EventHandler.

After implementing and testing EventHandler, you can register EventHandler to associate with EventCode and Claptrap.

Open`SkuGrain`for`HelloClap.`project.

Mark with Attribute and modify updateInventoryAsync execution events.

```cs
  Using System.Threading.Tasks;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
  The 1990s, HelloClaptrap.IActor;
  The United States Ofsing HelloClaptrap.Models;
  .HelloClaptrap.Models.Sku;
sing HelloClaptrap.Models.Sku.Events;
  .Claptrap;
  Newbe.Claptrap.Orleans;

  the namespace HelloClaptrap.Actors.Sku


      snr. public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      ,
          Public SkuGrain ( IClaptrap Grain Common Services Claptrap Grain CommonService )
              : Base ( claptrapGrainCommonService)
          {
          }

          Public Task<int> GetInventoryAsync()

              Return Task.FromResult (StateData.Inventory);
          )

          Public Async Task<int> Update InventyAsync (int diff)

              if

                  throw new bizException ("diff can't be 0");
              .

              var old , StateData.Inventory;
              var newInventory , old , diff;
              (newInventory < 0)
              the
                  throw new bizException (
                      $"failed to update inventory. It will be less than 0 if add diff amount. current : {old} , diff : {diff}" );
              -

- throw new NotImplementedException ();
and var evt , this. CreateEvent (new InventoryUpdateEvent
s
s Diff s diff,
s newinventory s newinventory
s) );
and await Claptrap.HandleEventAsync (evt);
and return StateData.Inventory;
          ,
      ,
  .
```

## Implement IInitial State Data Factory.

We've already completed the inventory query and update.Generally, however, there is an initial amount in inventory, and we are supplementing this part of the logic in this section.

Create`SkuStateInitHandler<code>under the  Sku``folder`HelloClaptrap.actors</code>project.

```cs
Using Systems.Threading.Tasks;
sing HelloClaptrap.Models.Sku;
sing HelloClaptrap.Repository;
. . . . . . . . . . . . . . . . . . . . .
and
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
, var skuId , and identity. Id;
and var inventory _skuRepository.GetInitInventoryAsync (skuId);
and var re , new SkuState
,
, inventory , inventory
, .
and return re;
. . .
. . .
. . . . . . . . . . . . . . . . . . . . .
```

1. `IInitial StateDataFactory`called when Claptrap is first activated to create the initial value of State.
2. Injection`ISkuRepository`reads the initial inventory amount for Sku from the database, the specific code is not listed here, and the reader can view the implementation in the sample warehouse.

In addition to the implementation code, registration is required before it can be called.

Open`SkuGrain`for`HelloClap.`project.

```cs
  Using System.Threading.Tasks;
  The United States Ofthing Hello Claptrap.Actors.Sku.Events;
  The 1990s, HelloClaptrap.IActor;
  The United States Ofsing HelloClaptrap.Models;
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

              if (diff s 0)
              s
                  throw new bizException ("diff can't be 0");
              s

              var old s StateData.Inventory;
              var newinvent snr . . . old s diff;
              if (newinvent < 0)

                  new new bisp. on (
                      $"failed to update inventory. It will be less than 0 if add diff amount. current : {old} , diff : {diff}" );
              .

              var evt . . . this. CreateEvent (new InventoryUpdateEvent

                  Diff s diff,
                  NewInventory s newinventory
              ) );
              .HandleEventAsync (evt);
              StateData.Inventory;
          ,
      ,
  .
```

## Modify controller.

After all the previous steps have been completed, all parts of Claptrap have been completed.However, Claptrap cannot provide interoperability directly with external programs.Therefore, you also need to add an API to the Controller layer for external "read inventory" operations.

Create`new SkuController`under`the Controllers`folder`HelloClaptrap.`project.

```cs
Using Systems.Threading.Tasks;
sing HelloClaptrap.IActor;
. . . . . . . . . . . . . . . . . . . . . . . . . . .
and using Orleans;

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
s. _grainFactory . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

,
, httpget ("{id}") ,
, public async Task<IActionResult> GetItemsAsync (string id)
,
, and var skuGrain , _grainFac. Tory. GetGrain<ISkuGrain>(id);
s.var inventory skuGrain.GetInventoryAsync();
, return Json (new
,
, skuId , id,
, inventory ,
, s) ;
,
, ,
, . . . . . . . . . . . . . . . . . . . . . . . . .
```

1. New API reads inventory for a specific SkuId.According to the implementation of the sample code, you can pass in`Yueluo-123`you get an inventory amount of 666.A SkuId that does not exist throws an exception.
1. There is no external API created here to update inventory, because this example will do inventory operations when you place an order purchase in the next article, and the API is not required here at this time.

## Summary.

At this point, we have completed all the content of the simple requirement of "managing inventory of goods".

You can obtain the source code for this article from the following：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
