---
title: "Step 3 - Define Claptrap and manage inventory of goods."
description: "Step 3 - Define Claptrap and manage inventory of goods."
---

With this reading, you're ready to try using Claptrap to implement your business.

<!-- more -->

## Summary

I know how to define a Claptrap in an existing project sample by fulfilling the need to manage inventory.

In conjunction with the basic step of the previous chapter, a definition of Claptrap could be made by adding additional steps.The full step is shown below, and the part marked as "new" is new to this page as distinguished from the previous one.：

1. Define ClaptrapTypeCode (new)
1. Define State (new)
1. Define Grain interface (new)
1. Implement Grain (new)
1. Sign up for Grain (new)
1. Define EventCode.
1. Define Event.
1. Implement EventHandler.
1. Sign up for EventHandler.
1. Implement the IInitialStateDataFactory (new)
1. Modify the Controller.

This is a bottom-up process, and development can be adjusted during the actual coding process.

本篇实现的业务用例：

1. Implement SKU (Stocking Unit) objects that represent stock data.
2. Can update and read SKUs.

## Define ClaptrapTypeCode

ClaptrapTypeCode is a claptrap unique code.It plays an important role in State identification, serialization, etc.

Open`ClaptrapCodes`classes in the`HelloCladaptrap.Models`project.

Add ClaptrapTypeCode of SKU.

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

## Definition of State

State represents the current data of the Actor object in the Actor pattern.

Actor, because Claptrap is based on event traceability mode.So it is important to define the right State.

In this example, we need to record only the stock of the current SKU and therefore the State is very simple in design.

Add`Sku`folder to the HelloClaptrap. project and create the`SkuState`under that folder.

Add the following code.：

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

Inventory represents the stock of the current SKU.

`IStateData`Interface is an empty interface for State representation in a frame that is used for general extrapolation.

## Define Grain interface

Define the definition of the Grain interface to provide interoperability between external and Claptrap.

Add`ISkuGrain interface to`HelloClaptrap.IActors``project.

Add interfaces and Attributes.

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

Add like this：

1. `ClapState`has been marked to associate State with Grain.
2. The interface inherited`IClaptrapGrain`, a framework defined by Grain interface, which is the one that Orleans must inherit.
3. The GetInventoryAsync method has been added to mean "Get current inventory".
4. An UpdateInventoryAsync method has been added for "Update current inventory".`diff &gt; <code>` indicates stock increase,`diff < 0`indicates stock reduction.
5. It is important to note that grain's method definition has certain limitations.Details can be found.[Developing a Grain](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## Implement grain.

Once you define a good ISkuGrain, you can add code to implement it.

Create`new Sku`folder for the HelloClaptrap.Actors project and add the`SkuGrain`folder.

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

Add like this：

1. Inherit`ClaptrapBoxGrain<SkuState>`and implements`ISkuGrain`,`ClaptrapBoxGrain`is the frame defined Grain base class in which generic parameters represent the corresponding State type.
2. Implement the GetInventoryAsync method, read current stock from StateData.
3. Implement the UpdateInventoryAsync method, add business judgement code and throw an exception if the conditions of the operation are not met.
4. UpdateInventoryAsync ends with NotImplementated Exception, because the current event is not defined and needs to wait for the next code to be implemented.
5. BizException is a custom exception that can be added yourself.It is also possible to use a method for actual development without a drop exception to indicate business interruption, or to change the status code or other return value.

## Sign up for Grain

Claptrap corresponding Grain needs to be registered on application startup in order to scan discovery.

Since the sample code is scanned within the scope of the program, changes are not required in practice.

这里指出发生注册的位置：

Open`Hello Claptrap.BackendServer`Project`Program`.

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

Because ISkuGrain and SkuGrain belong to the same set in ICartGrain and CartGrain respectively, changes are not required here.

## Define EventCode.

We have already implemented the main part of Claptrap before, but nothing has been done to update your inventory.This is because stock update is required for State updates.And we all know that Claptrap is an Actor mode based on event traceability and that updating state requires an event to complete.So it is here that we renew our stock through events.

EventCode is the unique encoding of each event in the Claptrap system.It plays an important role in the identification and serialization of events.

Open`ClaptrapCodes`classes in the`HelloCladaptrap.Models`project.

Add EventCode to Update Inventory.

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

## Define Event.

Event is the key to the events sourcing.Used to change the State in Claptrap.And Event is persisted at the persistence layer.

Create`InventoryUpdateEvent`under the`Sku/Events`folder of`helloClaptrap.`projects.

Add the following code.：

```cs
+ using Newbe.Claptrap;
+
+ namespace Hello Claptrap.Models.Sku. vents
+ File
+ public class InventoryUpdateEvent : IIEventData
+ online
+ public int Diff LOget; set; }
+ public int NewInventories but it is also available on the web site; set; }
+ }
+ }
```

1. Diff indicates the amount of this stock updated,`diff >` indicates stock increase,`diff < 0`means stock reduction.
2. The New Inventory indicates an updated inventory.Here a suggestion is given in advance, but due to space problems, there is no discussion：suggesting that State updated data be included in the event.

## Implement EventHandler.

EventHandler is used to update events to the State of Claptrap.

Create`InventoryUpdateEventHandler`class under the`Sku/Events`folder of`the HelloClaptrap.Actors`project.

Add the following code.：

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

1. Since the event already contains updated inventories, it is sufficient to assign the StateData directly.

## Register EventHandler

Once you have implemented and tested EventHandler, you can register EventHandler to associate with EventCode and Claptrap.

Open`Hello Claptrap.Actors`Project`SkuGrain`.

Flag with Ature and modify UpdateInventoryAsync executions.

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

## Implementing the IInitialStateDataFactory

We have completed inventory queries and updates earlier.Usually, however, the inventory has an initial amount, and we are supplementing that part of the logic in this section.

Create SkuStateInitHandler class under the Sku folder of the HelloClatrp.Actors project.

```cs
+ using Systems. Threading.Tasks;
+ using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Repository;
+ using Newbe.Clapptrap;
+
+ namespace Claptrap.Actors. ku
+ online
+ public class SkuStateInitHandler: IInitialStateDataFactory
+ online
+ private readonly ISkuRepository _skuRepository; 
 +
+
+ public SkuStateInitHandler(
+ ISkuRepository sku Repository)
+ 56
+ _skuRepository = skuRepository;
+ }
+
+ public async Task<IStateData> Create(IClaptrapIdentity identity)
+ 56
+ var skuId = identity. d;
+ var inventory = await _sku Repository. etInitInventoryAsync (SkuId);
+ var re = new SkuState
+ {
+ Inventory = inventory
+ };
+ return re;
+ }
+ }
+ }
```

1. `IInitialStateDataFactory`will be called when Claptrap is first activated to create State initials.
2. Injecting`ISkuRepository`to read the initial amount of Sku inventory from the database, specific code is not listed here, and reader can view the implementation in sample repository.

In addition to the actual modern code, registration is required before being called.

Open`Hello Claptrap.Actors`Project`SkuGrain`.

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

## Modify the Controller.

Once all the previous steps have been completed, you have completed all the parts of Claptrap.But because Clatrap could not directly provide interoperability with external programs.There is therefore a need to add an API at the Controller level to allow external "read stocks".

New SkuController class under the Controllers folder in HelloClaptrap.Web project.

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

1. Add an API to read stock specific to SkuId.By implementing the sample code, you can pass`yueluo-123`to receive stock amount of 666.The unexpected SkuId will throw an exception.
1. There are no outgoing API created here because this example will perform stock operations on next order shopping, which is not required here.

## Summary

By then, we have completed all the elements of the simple need to “manage commodity inventories”.

You can get the source code for this article from the following address.：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
