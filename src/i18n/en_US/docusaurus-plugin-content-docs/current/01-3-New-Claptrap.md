---
title: "Step 3 - Define Claptrap and manage inventory of goods."
description: "Step 3 - Define Claptrap and manage inventory of goods."
---

With this reading, you're ready to try using Claptrap to implement your business.

<!-- more -->

## Summary

In this article, I learned how to define a Claptrap in an existing project sample by implementing the requirements of "managing inventory".

Combined with the basic steps of the previous article, define Claptrap as long as you add a few steps outside.The complete steps are shown below, where the section marked "New Content" belongs to the new content of this article that differs from the previous：

1. Defining ClaptrapTypeCode (New Content)
1. Define State (New Content)
1. Define grain interface (new content)
1. Implement Grain (New Content)
1. Sign up for Grain (New Content)
1. Define EventCode.
1. Define Event.
1. Implement EventHandler.
1. Sign up for EventHandler.
1. Implementing IInitialStateDataFactory (New Content)
1. Modify the Controller.

This is a bottom-up process, and development can be adjusted during the actual coding process.

The business use cases implemented in this article：

1. Implements a SKU object that represents inventory data.
2. Ability to update and read SKUs.

## Define ClaptrapTypeCode

ClaptrapTypeCode is the only code for Claptrap.It plays an important role in the identification, serialization and so on of State.

Open`ClaptrapCodes`classes in the`HelloCladaptrap.Models`project.

Add SKU's ClaptrapTypeCode.

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

+ public const string SkuGrain = "sku_claptrap_newbe";
+ private const string SkuEventSuffix = "_e_" + SkuGrain;

          #endregion
      }
  }
```

## Define State

State represents the current data of the Actor object in the Actor pattern.

Because Claptrap is an Actor based on event sourcing patterns.So it's important to define the exact state.

In this example, we only need to record the inventory of the current SKU, so state design is very simple.

Add`Sku`folder to the HelloClaptrap. project and create the`SkuState`under that folder.

Add the following code.：

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Sku
+ {
+ public class SkuState : IStateData
+ {
+ public int Inventory { get; set; }
+ }
+ }
```

Inventory represents the inventory of the current SKU.

`IStateData`interface is an empty interface that represents State in the framework and is used in generic inferences.

## Define the Grain interface

Define the definition of the Grain interface to provide external interoperability with Claptrap.

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
+ [ClaptrapState(typeof(SkuState), ClaptrapCodes.SkuGrain)]
+ public interface ISkuGrain : IClaptrapGrain
+ {
+ /// <summary>
+ /// Get latest inventory of this sku
+ /// </summary>
+ /// <returns></returns>
+         Task<int> GetInventoryAsync();
+
+ /// <summary>
+ /// Update inventory by add diff, diff could be negative number
+ /// </summary>
+ /// <param name="diff"></param>
+ /// <returns>Inventory after updating</returns>
+ Task<int> UpdateInventoryAsync(int diff);
+ }
+ }
```

The following has been added：

1. Mark the`ClaptrapState`so that State is associated with Grain.
2. The interface inherits`IClaptrapGrain`, a framework-defined Grain interface that must be inherited to run on Orleans.
3. Added the GetInventoryAsync method to indicate "get current inventory."
4. The UpdateInventoryAsync method has been added to indicate an "incremental update of current inventory."`diff 0 > 0` an increase in inventory,`diff < 0`a decrease in inventory.
5. It is important to note that grain's method definition has certain limitations.Details can be found.[Developing a Grain](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## Implement grain.

Once you've defined ISkuGrain, you can add code to implement it.

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

The following has been added：

1. Inheriting`ClaptrapBoxGrain<SkuState>`and implementing`ISkuGrain`,`ClaptrapBoxGrain`is a framework-defined Grain base class where generic parameters represent the corresponding State type.
2. Implement the GetInventoryAsync method to read the current inventory from StateData.
3. Implement the UpdateInventoryAsync method, add business judgment code, and throw exceptions if the conditions for business operations are not met.
4. UpdateInventoryAsync's last we now throw NotImplementedException because the current event is not yet defined and needs to wait for a subsequent code implementation.
5. BizException is a custom exception that can be added yourself.In actual development, you can also use the throw exception to represent business interruption, but between a status code or other return values.

## Sign up for Grain

Grain for Claptrap needs to be registered at application startup so that the framework can scan for discovery.

Because the sample code uses an assembly-wide scan, it does not actually need to be modified.

The location where the registration occurred is indicated here：

Open`Program class for HelloClaptrap.BackendServer`project`the`program.

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
                  . ConfigureWebHostDefaults(webBuilder => { webBuilder.UseStartup<Startup>(); })
                  . UseClaptrap(
                      builder =>
                      {
+ builder
+ . ScanClaptrapDesigns(new[]
+ {
+ typeof(ICartGrain). Assembly,
+ typeof(CartGrain). Assembly,
+ });
                      },
                      builder => { builder. RegisterModule<RepositoryModule>(); })
                  . UseOrleansClaptrap()
                  . UseOrleans(builder => builder. UseDashboard(options => options. Port = 9000))
                  . ConfigureLogging(logging =>
                  {
                      logging. ClearProviders();
                      logging. SetMinimumLevel(LogLevel.Trace);
                  })
                  . UseNLog();
      }
  }
```

Because ISkuGrain and SkuGrain belong to the same assembly as ICartGrain and CartGrain, respectively, there is no need to modify it here.

## Define EventCode.

We have implemented the main part of Claptrap earlier, but we have not completed the operation of updating the inventory.This is because updating inventory requires updating State.And we all know that Claptrap is an event-traced Actor pattern, and updates to State need to be done through events.So start here, let's update the inventory through events.

EventCode is the unique encoding of each event in the Claptrap system.It plays an important role in the identification and serialization of events.

Open`ClaptrapCodes`classes in the`HelloCladaptrap.Models`project.

Add EventCode for Update Inventory.

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
+ public const string SkuInventoryUpdate = "inventoryUpdate" + SkuEventSuffix;

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
+ namespace HelloClaptrap.Models.Sku.Events
+ {
+ public class InventoryUpdateEvent : IEventData
+ {
+ public int Diff { get; set; }
+ public int NewInventory { get; set; }
+ }
+ }
```

1. Diff represents the amount of this updated inventory,`diff > 0` indicates an increase in inventory, and`diff < 0`indicates a reduction in inventory.
2. NewInventory represents the updated inventory.Here, a recommendation is given in advance, but due to space issues, there is no discussion：recommends that State's updated data be included in the event.

## Implement EventHandler.

EventHandler 用于将事件更新到 Claptrap 的 State 上。

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
+ public class InventoryUpdateEventHandler
+ : NormalEventHandler<SkuState, InventoryUpdateEvent>
+ {
+ public override ValueTask HandleEvent(SkuState stateData,
+ InventoryUpdateEvent eventData,
+ IEventContext eventContext)
+ {
+ stateData.Inventory = eventData.NewInventory;
+ return new ValueTask();
+ }
+ }
+ }
```

1. Because the updated inventory is already included in the event, it is simply assigned to StateData.

## Register EventHandler

Once you have implemented and tested EventHandler, you can register EventHandler to associate with EventCode and Claptrap.

Open`SkuGrain class for helloClaptrap.Actors`project`the`project.

Mark with Attribute and modify updateInventoryAsync to execute the event.

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
+ [ClaptrapEventHandler(typeof(InventoryUpdateEventHandler), ClaptrapCodes.SkuInventoryUpdate)]
      public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      {
          public SkuGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
              : base( claptrapGrainCommonService)
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

- throw new NotImplementedException();
+ var evt = this. CreateEvent(new InventoryUpdateEvent
+ {
+ Diff = diff,
+ NewInventory = newInventory
+ });
+ await Claptrap.HandleEventAsync(evt);
+ return StateData.Inventory;
          }
      }
  }
```

## Implement IInitialStateDataFactory

We have completed the inventory query and update earlier.But generally there is an initial amount in inventory, and we are supplementing this part of the logic in this section.

Create`SkuStateInitHandler`class under the`Sku`folder of`the HelloClaptrap.Actors`project.

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Sku;
+ using HelloClaptrap.Repository;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Sku
+ {
+ public class SkuStateInitHandler : IInitialStateDataFactory
+ {
+ private readonly ISkuRepository _skuRepository;
+
+ public SkuStateInitHandler(
+ ISkuRepository skuRepository)
+ {
+ _skuRepository = skuRepository;
+ }
+
+ public async Task<IStateData> Create(IClaptrapIdentity identity)
+ {
+ var skuId = identity. Id;
+ var inventory = await _skuRepository.GetInitInventoryAsync(skuId);
+ var re = new SkuState
+ {
+ Inventory = inventory
+ };
+ return re;
+ }
+ }
+ }
```

1. `IInitialStateDataFactory`is called when Claptrap is first activated to create the initial value of State.
2. Injection`ISkuRepository`reads the initial inventory amount for Sku from the database, the specific code is not listed here, and the reader can view the implementation in the sample warehouse.

In addition to implementing the code, registration is required before it can be called.

Open`SkuGrain class for helloClaptrap.Actors`project`the`project.

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
+ [ClaptrapStateInitialFactoryHandler(typeof(SkuStateInitHandler))]
      [ClaptrapEventHandler(typeof(InventoryUpdateEventHandler), ClaptrapCodes.SkuInventoryUpdate)]
      public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      {
          public SkuGrain( IClaptrapGrainCommonService claptrapGrainCommonService)
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

              var evt = this. CreateEvent(new InventoryUpdateEvent
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

Once all the previous steps have been completed, you have completed all the parts of Claptrap.But because Clatrap could not directly provide interoperability with external programs.Therefore, you also need to add an API at the Controller layer for external "read inventory" operations.

Create`new SkuController`under the`Controllers``folder of the HelloClaptrap.web`project.

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.IActor;
+ using Microsoft.AspNetCore.Mvc;
+ using Orleans;
+
+ namespace HelloClaptrap.Web.Controllers
+ {
+ [Route("api/[controller]")]
+ public class SkuController : Controller
+ {
+ private readonly IGrainFactory _grainFactory;
+
+ public SkuController(
+ IGrainFactory grainFactory)
+ {
+ _grainFactory = grainFactory;
+ }
+
+ [HttpGet("{id}")]
+ public async Task<IActionResult> GetItemsAsync(string id)
+ {
+ var skuGrain = _grainFactory.GetGrain<ISkuGrain>(id);
+ var inventory = await skuGrain.GetInventoryAsync();
+ return Json(new
+ {
+ skuId = id,
+ inventory = inventory,
+ });
+ }
+ }
+ }
```

1. New API reads inventory for specific SkuIds.Following the implementation of the sample code, you can pass in`yueluo-123`the inventory amount is 666.SkuIds that do not exist throw exceptions.
1. There is no external API for updating inventory here, because this example will do inventory operations when you place an order in the next section, and the API is not required here.

## Summary

At this point, we have completed the "manage commodity inventory" this simple requirement of all the content.

You can get the source code for this article from the following address.：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
