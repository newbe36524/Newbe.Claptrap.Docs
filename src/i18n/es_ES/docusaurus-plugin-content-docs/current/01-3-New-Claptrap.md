---
title: "El tercer paso es definir Claptrap y gestionar el inventario de mercancías"
description: "El tercer paso es definir Claptrap y gestionar el inventario de mercancías"
---

Con esta lectura, puedes empezar a hacer negocios con Claptrap.

<!-- more -->

## Un resumen de apertura

En este artículo, aprendí a definir una Claptrap en un ejemplo de proyecto existente implementando los requisitos de "administrar el inventario".

En combinación con los pasos básicos del artículo anterior, defina Claptrap siempre y cuando agregue unos pasos fuera.Los pasos completos se muestran a continuación, donde la sección marcada como "Nuevo contenido" pertenece al nuevo contenido de este artículo que difiere del：anterior

1. Definición de ClaptrapTypeCode (nuevo contenido)
1. Definir estado (nuevo contenido)
1. Definir interfaz de grano (nuevo contenido)
1. Implementar grano (nuevo contenido)
1. Regístrese en Grano (Nuevo Contenido)
1. Definir EventCode
1. Definir evento
1. Implementar EventHandler
1. Regístrese en EventHandler
1. Implementación de IInitialStateDataFactory (Nuevo contenido)
1. Modificar controlador

Este es un proceso de abajo hacia arriba, y el desarrollo se puede ajustar durante el proceso de codificación real.

Los casos de uso empresarial implementados en este artículo：

1. Implementa un objeto SKU que representa los datos de inventario.
2. Capacidad para actualizar y leer SKU.

## Definir ClaptrapTypeCode

ClaptrapTypeCode es el único código para Claptrap.Desempeña un papel importante en la identificación, serialización, etc. del Estado.

Abra`la clase de`ClaptrapCodes en`el proyecto de HelloClaptrap.`.

Agregue ClaptrapTypeCode de SKU.

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

## Definir estado

State representa el rendimiento de datos actual del objeto Actor en el modo Actor.

Porque Claptrap es un actor basado en patrones de abastecimiento de eventos.Por lo tanto, es importante definir el estado exacto.

En este ejemplo, solo necesitamos registrar el inventario de la SKU actual, por lo que el diseño de estado es muy simple.

Agregue`carpeta Sku`al proyecto de HelloClaptrap.y cree elskuState`en esa carpeta.

Agregue los siguientes code：

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

El inventario representa el inventario de la SKU actual.

`interfaz IStateData`es una interfaz vacía que representa el estado en el marco de trabajo y se usa en inferencias genéricas.

## Definir la interfaz de grano

Defina la definición de la interfaz Grain para proporcionar interoperabilidad externa con Claptrap.

Agregue`interfaz ISkuGrain a`proyecto de``HelloClaptrap.IActors.

Agregue interfaces así como atributo.

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

Se ha added：lo siguiente

1. Marque el`ClaptrapState`para que State esté asociado con Grain.
2. La interfaz hereda`IClaptrapGrain`, una interfaz Grain definida por el marco de trabajo que se debe heredar para ejecutarse en Orleans.
3. Se ha añadido el método GetInventoryAsync para indicar "obtener inventario actual".
4. El método UpdateInventoryAsync se ha agregado para indicar una "actualización incremental del inventario actual".`diff 0 > 0` un aumento en el inventario,`diff < 0`una disminución en el inventario.
5. Es importante tener en cuenta que la definición del método de Grain tiene ciertas limitaciones.Para obtener más información,[se puede encontrar en el "Desarrollo de una grain](https://dotnet.github.io/orleans/Documentation/grains/index.html).

## Implementar grano

Una vez que haya definido ISkuGrain, puede agregar código para implementarlo.

Cree`nueva carpeta`de sku de`para el proyecto helloClaptrap. Actors`y agregue la carpeta`skugrain`.

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

Se ha added：lo siguiente

1. Heredar`<SkuState>`ClaptrapBoxGrain e implementar``ISkuGrain,``ClaptrapBoxGrain es una clase base Grain definida por el marco donde los parámetros genéricos representan el tipo de estado correspondiente.
2. Implemente el método GetInventoryAsync para leer el inventario actual de StateData.
3. Implemente el método UpdateInventoryAsync, agregue código de juicio empresarial y produzca excepciones si no se cumplen las condiciones de las operaciones empresariales.
4. El último de UpdateInventoryAsync ahora lanza NotImplementedException porque el evento actual aún no está definido y necesita esperar a una implementación de código posterior.
5. BizException es una excepción personalizada que se puede agregar usted mismo.En el desarrollo real, también puede usar la excepción throw para representar la interrupción del negocio, pero entre un código de estado u otros valores devueltos.

## Regístrese en Grain

Grain for Claptrap debe registrarse al iniciar la aplicación para que el marco de trabajo pueda buscar la detección.

Dado que el código de ejemplo utiliza un examen de todo el ensamblado, en realidad no es necesario modificarlo.

La ubicación donde se produjo el registro se indica here：

Abra`clase Program para el proyecto helloClaptrap.BackendServer``el programa`.

```cs
  utilizando el sistema;
  usando Autofac;
  utilizando HelloClaptrap.Actors.Cart;
  usa helloClaptrap.IActor;
  utilizando HelloClaptrap.Repository;
  mediante Microsoft.AspNetCore.Hosting;
  mediante Microsoft.Extensions.Hosting;
  mediante Microsoft.Extensions.Logging;
  usando Newbe.Claptrap;
  usando Newbe.Claptrap.Bootstrapper;
  mediante NLog.Web;
  usando Orleans;

  espacio de nombres HelloClaptrap.BackendServer

      clase pública Program
      ?

          public static IHostBuilder CreateHostBuilder(string[] args) ?>
              Host.CreateDefaultBuilder(args)
                  . ConfigureWebHostDefaults(webBuilder á> webBuilder.UseStartup<Startup>(); )
                  . UseClaptrap( constructor de
                      de>
                      -
+
del constructor + . ScanClaptrapDesigns(new[]
+ á
+ typeof(ICartGrain). Montaje,
+ typeof(CartGrain). Ensamblaje,
+ ;
                      , constructor de
                      , constructor de> , constructor. RegisterModule<RepositoryModule>(); )
                  . UseOrleansClaptrap()
                  . UseOrleans(builder á> builder. UseDashboard(opciones )> opciones. Puerto 9000))
                  . ConfigureLogging(logging ->
                  - registro
                      . ClearProviders(); Registro
                      . SetMinimumLevel(LogLevel.Trace);
                  )
                  . UseNLog();

  ?
```

Dado que ISkuGrain y SkuGrain pertenecen al mismo ensamblado que ICartGrain y CartGrain, respectivamente, no es necesario modificarlo aquí.

## Definir EventCode

Hemos implementado la parte principal de Claptrap anteriormente, pero no hemos completado la operación de actualización del inventario.Esto se debe a que la actualización del inventario requiere actualizar el estado.Y todos sabemos que Claptrap es un patrón de actor rastreado por eventos, y las actualizaciones al estado deben realizarse a través de eventos.Así que comience aquí, vamos a actualizar el inventario a través de eventos.

EventCode es el código único para cada evento en el sistema Claptrap.Desempeña un papel importante en la identificación y serialización de eventos.

Abra`la clase de`ClaptrapCodes en`el proyecto de HelloClaptrap.`.

Agregar EventCode para el inventario de actualización.

```cs
  namespace HelloClaptrap.Models
  :
      clase estática pública ClaptrapCodes

          #region

          de cadena const pública CartGrain á "cart_claptrap_newbe";
          cadena const privada CartEventSuffix - "_e_" + CartGrain;
          cadena const pública AddItemToCart á "addItem" + CartEventSuffix;
          cadena const pública RemoveItemFromCart - "removeItem" + CartEventSuffix;
          cadena const pública RemoveAllItemsFromCart á "remoeAllItems" + CartEventSuffix;

          #endregion

          #region Sku

          cadena const public SkuGrain á "sku_claptrap_newbe";
          cadena const privada SkuEventSuffix á "_e_" + SkuGrain;
+ cadena const pública SkuInventoryUpdate á "inventoryUpdate" + SkuEventSuffix;

          #endregion
      de
  ?
```

## Definir evento

El evento es la clave para el abastecimiento de eventos.Se utiliza para cambiar de estado en Claptrap.Y Event se conserva en la capa de persistencia.

Cree``InventoryUpdateEvent en la carpeta`Sku/Events`de`helloClaptrap.`proyectos.

Agregue los siguientes code：

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

1. Diff representa la cantidad de este inventario actualizado,`diferencia > 0` indica un aumento en el inventario y`diferencia < 0`indica una reducción en el inventario.
2. NewInventory representa el inventario actualizado.Aquí, una recomendación se da con antelación, pero debido a problemas de espacio, no hay discusión：recomienda que los datos actualizados del Estado se incluyan en el evento.

## Implementar EventHandler

EventHandler 用于将事件更新到 Claptrap 的 State 上。

Cree clase de`InventoryUpdateEventHandler en la carpeta`Sku/Events`de`el proyecto de`HelloClaptrap.Actors.

Agregue los siguientes code：

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

1. Dado que el inventario actualizado ya está incluido en el evento, simplemente se asigna a StateData.

## Regístrese en EventHandler

Después de implementar y probar EventHandler, puede registrar eventHandler para asociarlo con EventCode y Claptrap.

Abra`clase SkuGrain para helloClaptrap.Actors`proyecto`el proyecto de`.

Marca con Attribute y modifica updateInventoryAsync para ejecutar el evento.

```cs
  uso de System.Threading.Tasks;
+ mediante HelloClaptrap.Actors.Sku.Events;
  usa HelloClaptrap.IActor;
  uso de HelloClaptrap.Models;
  mediante HelloClaptrap.Models.Sku;
+ mediante HelloClaptrap.Models.Sku.Events;
  usando Newbe.Claptrap;
  usando Newbe.Claptrap.Orleans;

  espacio de nombres HelloClaptrap.Actors.Sku
  á
+ [ClaptrapEventHandler(typeof(InventoryUpdateEventHandler), ClaptrapCodes.SkuInventoryUpdate)]
      clase pública SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      á
          pública SkuGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
              : base( claptrapGrainCommonService)
          {
          }

          tarea pública<int> GetInventoryAsync()

              devolver Task.FromResult(StateData.Inventory);
          :

          tarea asincrónica pública<int> UpdateInventoryAsync(int diff)
          á
              si
              (diff á 0)
                  producir una nueva BizException("diff can't ser 0");
              á

              var old - StateData.Inventory;
              var newInventory á viejo + diff;
              si (newInventory < 0)

                  producir una nueva BizException(
                      $"no pudo actualizar el inventario. Será menor que 0 si se añade la cantidad de diferencia. corriente : {old} , diff : {diff}");
              -

- lanzar new NotImplementedException();
+ var evt . CreateEvent(new InventoryUpdateEvent
+ á
+ Diff - diff,
+ NewInventory - newInventory
+ ?
+ await Claptrap.HandleEventAsync(evt);
+ devolver StateData.Inventory;


  ?
```

## Implementar IInitialStateDataFactory

Hemos completado la consulta de inventario y la actualización anteriormente.Pero generalmente hay una cantidad inicial en el inventario, y estamos complementando esta parte de la lógica en esta sección.

Cree`clase de`SkuStateInitHandler en la carpeta`Sku`de`el proyecto de`HelloClaptrap.Actors.

```cs
+ utilizando System.Threading.Tasks;
+ mediante HelloClaptrap.Models.Sku;
+ utilizando HelloClaptrap.Repository;
+ usando Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Sku
+ á
+ public class SkuStateInitHandler : IInitialStateDataFactory
+ á
+ _skuRepository ISkuRepository privada;
+
+ skuStateInitHandler público(
+ ISkuRepository skuRepository)
+ á
+ _skuRepository á skuRepository;
+ á
+
+ public async Task<IStateData> Create(IClaptrapIdentity identity)
+ á
+ var skuId - identity. Id;
+ va inventory á await _skuRepository.GetInitInventoryAsync(skuId);
+ var re - nuevo SkuState
+ -
+ Inventario - inventario
+ ?
+ retorno re;
+ á
+ -
+ ?
```

1. `se llama a IInitialStateDataFactory`cuando Claptrap se activa por primera vez para crear el valor inicial de State.
2. La inyección`ISkuRepository`lee el importe de inventario inicial de Sku de la base de datos, el código específico no aparece aquí y el lector puede ver la implementación en el almacén de ejemplo.

Además de implementar el código, se requiere el registro antes de que se pueda llamar.

Abra`clase SkuGrain para helloClaptrap.Actors`proyecto`el proyecto de`.

```cs
  uso de System.Threading.Tasks;
  uso de HelloClaptrap.Actors.Sku.Events;
  usa HelloClaptrap.IActor;
  uso de HelloClaptrap.Models;
  mediante HelloClaptrap.Models.Sku;
  uso de HelloClaptrap.Models.Sku.Events;
  usando Newbe.Claptrap;
  usando Newbe.Claptrap.Orleans;

  espacio de nombres HelloClaptrap.Actors.Sku
  á
+ [ClaptrapStateInitialFactoryHandler(typeof(SkuStateInitHandler))]
      [ClaptrapEventHandler(typeof(InventoryUpdateEventHandler), ClaptrapCodes.SkuInventoryUpdate)]
      clase pública SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      á
          SkuGrain público( IClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

          tarea pública<int> GetInventoryAsync()
          -
              devolver Task.FromResult(StateData.Inventory);
          :

          tarea asincrónica pública<int> UpdateInventoryAsync(int diff)
          á
              si
              (diff - 0)
                  producir una nueva Excepción BizException("diff no puede ser 0");
              á

              var old - StateData.Inventory;
              var newInventory - viejo + diff;
              si (newInventory < 0)

                  producir una nueva BizException(
                      $"no pudo actualizar el inventario. Será menor que 0 si se añade la cantidad de diferencia. corriente : {old} , diff : {diff}");


              var evt. CreateEvent(new InventoryUpdateEvent
              ?
                  Diff - diff,
                  NewInventory ? newInventory
              ;
              await Claptrap.HandleEventAsync(evt);
              devolver StateData.Inventory;


  ?
```

## Modificar controlador

Para cuando se completen todos los pasos anteriores, se han completado todas las partes de Claptrap.Sin embargo, Claptrap no puede proporcionar directamente interoperabilidad con programas externos.Por lo tanto, también debe agregar una API en la capa Controller para operaciones externas de "inventario de lectura".

Cree`nuevo`SkuController en la carpeta`Controllers``del proyecto helloClaptrap.web`.

```cs
+ utilizando System.Threading.Tasks;
+ usando HelloClaptrap.IActor;
+ mediante Microsoft.AspNetCore.Mvc;
+ usando Orleans;
+
+ espacio de nombres HelloClaptrap.Web.Controllers
+ á
+ [Route("api/[controller]")]
+ clase pública SkuController : Controlador
+ á
+ _grainFactory privado de IGrainFactory;
+
+ SkuController público (
+ IGrainFactory grainFactory)
+ á
+ _grainFactory - grainFactory;
+ á
+
+ [HttpGet("{id}")]
+ tarea asincrónica pública<IActionResult> GetItemsAsync(string id)
+ á
+ sku skuGrain - _grainFactory.GetGrain<ISkuGrain>(id);
+ var inventory á await skuGrain.GetInventoryAsync();
+ devolver Json(new
+ á
+ skuId - id,
+ inventario - inventario,
+ ? );
+ á
+ -
+ ?
```

1. La nueva API lee el inventario de SkuIds específicos.Después de la implementación del código de ejemplo, puede pasar`yueluo-123`el importe del inventario es 666.Los SkuId que no existen producen excepciones.
1. No hay ninguna API externa para actualizar el inventario aquí, porque en este ejemplo se realizarán operaciones de inventario cuando realice un pedido en la siguiente sección y la API no es necesaria aquí.

## Resumen

En este punto, hemos completado el "gestionar el inventario de productos básicos" este simple requisito de todo el contenido.

Puede obtener el código fuente de este artículo en la siguiente address：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
