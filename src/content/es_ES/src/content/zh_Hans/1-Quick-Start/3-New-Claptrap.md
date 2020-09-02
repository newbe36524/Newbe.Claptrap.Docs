---
title: 'Paso 3 - Definir Claptrap y gestionar el inventario de mercancías.'
metaTitle: 'Paso 3 - Definir Claptrap y gestionar el inventario de mercancías.'
metaDescription: 'Paso 3 - Definir Claptrap y gestionar el inventario de mercancías.'
---

Con este artículo, puedes empezar a hacer negocios con Claptrap.

> [La versión que se ve actualmente es el resultado de que la máquina simplificada en chino traduce la autocomprobación y las lecturas manuales.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar sus sugerencias de traducción.](https://crwd.in/newbeclaptrap)

<!-- more -->

## Resumen de apertura.

En este artículo, aprendí a definir una Claptrap en un ejemplo de proyecto existente implementando la necesidad de "administrar el inventario".

En combinación con los pasos básicos del artículo anterior, define Claptrap siempre y cuando añadas algunos pasos.Los pasos completos se muestran a continuación, donde la sección marcada como "Nuevo contenido" es diferente del nuevo contenido anterior en este article：

1. Definir ClaptrapTypeCode (Nuevo contenido)
1. Definición del estado (nuevo contenido)
1. Definir interfaz de grano (nuevo contenido)
1. Implementación de grano (nuevo contenido)
1. Regístrese en Grano (Nuevo Contenido)
1. Definir EventCode.
1. Definir evento.
1. Implementar controlador de eventos.
1. Regístrese en EventHandler.
1. Implementación de IInitial StateDataFactory (Nuevo contenido)
1. Modificar controlador.

Este es un proceso de abajo hacia arriba, y el proceso de codificación real también se puede ajustar para el desarrollo.

Casos de uso empresarial implementados en este artículo：

1. Implementa el objeto SKU (Stock Keeping Unit) que representa los datos de inventario.
2. Capacidad para actualizar y leer SKU.

## Definir ClaptrapTypeCode.

ClaptrapTypeCode es un código único para Claptrap.Desempeña un papel importante en la identificación y serialización del Estado.

Abra`la clase de`ClaptrapCodes en`HelloClaptrap.`proyecto.

Agregue ClaptrapTypeCode para la SKU.

```cs
  namespace HelloClaptrap.Models

      clase estática pública ClaptrapCodes

          la publicidad y la cadena de publicidad Cartin s " cart_claptrap_newbe";
          cadena const privada CartEventSuffix , ""e"" , "CartGrain";
          cadena de publicidad pública AddItemToCart , "addItem" , "CartEventSuffix";
          cadena de publicidad const Remove ItmFromCart , "remove." eItem" y CartEventSuffix;

          #region Sku

sku SkuGrain , "sku_claptrap_newbe";
y cadena const privada SkuEventSuffix , """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""

          #endregion
      . . .
  . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

## Definir estado.

State representa la representación de datos actual del objeto Actor en el modo Actor.

Porque Claptrap es un actor basado en patrones de trazabilidad de eventos.Así que es importante definir exactamente el estado.

En este ejemplo, solo necesitamos registrar el inventario de la SKU actual, por lo que el diseño de State es muy simple.

Agregue`la carpeta<code>Sku`al proyecto de</code>HelloClaptrap.Models y cree una carpeta</code>`SkuState.</p>

<p spaces-before="0">Agregue el siguiente código：</p>

<pre><code class="cs">singningnbe.Claptrap;
s
y namespace HelloClaptrap.Models.Sku
, s
, public class SkuState : IStateData
,
, public int . . . . .

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
`</pre>

El inventario representa el inventario de la SKU actual.

`interfaz IStateData`es una interfaz vacía en el marco de trabajo que representa State y se usa para la inferencia genérica.

## Defina la interfaz Granulado.

Defina la definición de la interfaz Grain para proporcionar interoperabilidad externa con Claptrap.

Agregue`proyecto de interfaz<code>HelloClaptrap.`</code>ISkuGrain.

Agregue interfaces así como atributos.

```cs
Uso de Systems.Threading.Tasks;
cantar HelloClaptrap.Models;
cantar HelloClaptrap.Models.Sku;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
,
, espacio de nombres HelloClaptrap.IActor
,
, claptrapState , ClaptrapCodes.SkuGrain ,
, interfaz pública , . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . en: IClaptrapGrain
. . </summary>

<summary>

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . <returns></returns>
. . . . . . . .         Task<int> GetInventoryAsync();

/ / / / <summary>
/ / Actualizar inventario por añadir diff, diff puede ser número negativo
. . . . . . . . . </summary>
<int> </returns>
<returns><param name="diff"></param>
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

Se ha added：lo siguiente

1. El`ClaptrapState`está etiquetado para asociar State con Grain.
2. La interfaz hereda``IClaptrapGrain, que es una interfaz Grain definida por el marco de trabajo que se basa en la interfaz que Orleans debe heredar para ejecutarse.
3. Se ha añadido el método GetInventoryAsync, que significa "Obtener inventario actual".
4. Se ha añadido el método UpdateInventoryAsync, que significa "actualización incremental del inventario actual".`diferencia > 0 indica` aumento del inventario,`diferencia < 0`indica una disminución en el inventario.
5. Es importante tener en cuenta que las definiciones de método de Grain son limitadas.Vea el[Desarrollo de un](https://dotnet.github.io/orleans/Documentation/grains/index.html)de Granos.

## Implementar grano.

Una vez que se ha definido ISkuGrain, puede agregar código para la implementación.

Cree`nueva carpeta<code>Sku`para el proyecto helloClaptrap.actors</code>y agregue la carpeta</code>skugrain``.</p>

<pre><code class="cs">+ using System;
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
``</pre>

Se ha added：lo siguiente

1. Heredar`claptrapBoxGrain<SkuState>`e implementar``ISkuGrain,`ClaptrapBoxGrain`es una clase base Grain definida por el marco donde los parámetros genéricos representan el tipo de estado correspondiente.
2. Implemente el método GetInventoryAsync para leer el inventario actual de StateData.
3. Implemente el método UpdateInventoryAsync, agregue código de juicio empresarial y produzca excepciones si no se cumplen las condiciones de las operaciones empresariales.
4. El último de UpdateInventoryAsync que estamos lanzando OutImplementEdException porque el evento actual aún no está definido y necesita esperar a las implementaciones de código posteriores.
5. BizException es una excepción personalizada que se puede agregar por sí sola.En el desarrollo real, también es posible indicar una interrupción del negocio sin producir una excepción, y también es posible utilizar un código de estado u otro valor devuelto entre.

## Regístrese en Grano.

El grano correspondiente a Claptrap debe registrarse cuando se inicia la aplicación para que el marco de trabajo pueda buscar la detección.

Dado que el código de ejemplo utiliza el análisis de todo el ensamblado, no se requieren modificaciones.

Aquí es donde el registro tomó place：

Abra`clase de programa para el proyecto HelloClap.BackendServer``proyecto`programa.

```cs
  Uso del sistema;
  usando Autofac;
  . Hening HelloClaptrap.Actors.Cart;
  Los Estados Unidos de China HelloClaptrap.IActor;
  de United Services HelloClaptrap.Repository;
  .AspNetCore.Hosting;
  .Extensions.Hosting;
  .Extensions.Logging;
  . Newbe.Claptrap;
  .Claptrap.Bootstrapper;
  NLog.Web;
  Orleans;

  programa de clase pública HelloClaptrap.BackendServer




          estático público IHostBuilder CreateHostBuilder (cadena)>
              Host.CreateDefaultBuilder (args)
                  . ConfigureWebHostDefaults (webBuilder> . . . . . . . . . . . . . . .
                  <Startup>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . UseClaptrap (
                      Builder>

s builder
. ScanClaptrapDesigns (nuevo)
,
y typeof (ICartGrain). Montaje,
y Typeof (CartGrain). Ensamblaje,
, s)
                      , constructor
> constructor. RegisterModule<RepositoryModule>(); )
                  . UseOrleansClaptrap()
                  . UseOrleans (Builders -> Builder. UseDashboards (opciones> opciones. Puerto s 9000))
                  . ConfigureLogging (registro>

                      registro. ClearProviders (); Registro
                      . SetMinimumLevel (LogLevel.Trace);
                  )
                  . UseNLog();
      . . . .
  . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

Dado que ISkuGrain y SkuGrain pertenecen al mismo ensamblado que ICartGrain y CartGrain, respectivamente, aquí no se requieren modificaciones.

## Definir EventCode.

Hemos implementado la parte principal de Claptrap antes, pero no hemos completado la operación de actualización de inventario.Esto se debe a que la actualización del inventario requiere una actualización a State.Y todos sabemos que Claptrap es un patrón de actor basado en eventos, y las actualizaciones al estado deben realizarse a través de eventos.Así que comience aquí, vamos a actualizar el inventario a través de eventos.

EventCode es la única codificación para cada evento en el sistema Claptrap.Desempeña un papel importante en la identificación y serialización de eventos.

Abra`la clase de`ClaptrapCodes en`HelloClaptrap.`proyecto.

Agregar EventCode para el inventario de actualización.

```cs
  namespace HelloClaptrap.Models

      clase estática pública ClaptrapCodes

          #region Cart

          la cadena pública y const CartGrain s "cart_claptrap_newbe";
          cadena const privada CartEventSuffix, """""""""""""""""""""""""""""""""""
          """""""""""""""""""""""""""""""""""""""""""""""""
          """""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" Tring RemoveItemFromCart - "RemoveItem" - CartEventSuffix;
          Publicidad pública const String Remove AllItems FrommCart , "Remoe AllItems" , CartEventSuffix;

          #endregion

          #region Sku

          publicidad pública y skuGrain - "sku_claptrap_newbe";
          la cadena const privada SkuEventSuffix . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
sufijo skuEvent, publicity, public y SkuEvent Suffix, "inventoryUpdate";

          #endregion
      . . . . . . . . . . . . . . . . .
  . . . . . . . . . . . . .
```

## Definir evento.

El evento es la clave para el seguimiento de eventos.Se utiliza para cambiar de estado en Claptrap.Y Event se conserva en la capa de persistencia.

Cree`clase de<code>InventoryUpdateEvent en la carpeta  Sku/Events`de`el proyecto de`</code>HelloClaptrap.models.

Agregue el siguiente código：

```cs
singningnbe.Claptrap;
y
, espacio de nombres HelloClap.Models.Sku.Events
,
, clase pública InventoryUpdateEvent : IEventData



.
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

1. Diff representa la cantidad de inventario para esta actualización,`diferencia > 0` indica un aumento en el inventario y`diferencia < 0`indica una disminución en el inventario.
2. NewInventory representa el inventario actualizado.Aquí, una recomendación se da por adelantado, pero debido a cuestiones de longitud, ningún debate：sugiere incluir los datos actualizados del Estado en el evento.

## Implementar controlador de eventos.

`EventHandler`actualizar eventos al sistema de</code>de estado`de Claptrap.</p>

<p spaces-before="0">Cree<code>clase de`InventoryUpdateEventHandler en la carpeta`Sku/Events`para el proyecto de</code>HelloClaptrap.actors`.</p>

<p spaces-before="0">Agregue el siguiente código：</p>

<pre><code class="cs">Uso de Systems.Threading.Tasks;
cantar HelloClaptrap.Models.Sku;
cantar HelloClaptrap.Models.Sku.Events;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

y espacio de nombres HelloClaptrap.Actors.Sku.Events
,
, public class InventoryUpdateEventHandler
, y : NormalEventHandler<SkuState, InventoryUpdateEvent>
,
, publicity override ValueTask StateData,
, inventoryUpdateEvent eventData,
, IEventContext eventContext)
, . .
stateData.Inventory , eventData.NewInventory;
y devolver new ValueTask();
. . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
`</pre>

1. Dado que el inventario actualizado ya está incluido en el evento, puede asignar StateData directamente.

## Regístrese en EventHandler.

Después de implementar y probar EventHandler, puede registrar EventHandler para asociarlo con EventCode y Claptrap.

Abra``SkuGrain para`HelloClap.`proyecto.

Marca con Attribute y modifica los eventos de ejecución updateInventoryAsync.

```cs
  Uso de System.Threading.Tasks;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
  The 1990s, HelloClaptrap.IActor;
  Los Estados Unidos Ofsing HelloClaptrap.Models;
  .HelloClaptrap.Models.Sku;
cantar HelloClaptrap.Models.Sku.Events;
  .Claptrap;
  Newbe.Claptrap.Orleans;

  el espacio de nombres HelloClaptrap.Actors.Sku


      snr. public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      ,
          Public SkuGrain ( IClaptrap Grain Common Services Claptrap Grain CommonService )
              : Base ( claptrapGrainCommonService)
          {
          }

          tarea pública<int> GetInventoryAsync()

              Return Task.FromResult (StateData.Inventory);
          )

          Public Async Task<int> Update InventyAsync (int diff)

              si

                  throw newexception ("diff no puede ser 0");
              .

              var old , StateData.Inventory;
              var newInventory , old , diff;
              (newInventory < 0)
              el
                  producir una nueva excepción bizException (
                      $"no pudo actualizar el inventario. Será menor que 0 si se añade la cantidad de diferencia. corriente : {old} , diff : {diff}" );
              -

- producir new NotImplementedException ();
y var evt, esto. CreateEvent (new InventoryUpdateEvent
s
s Diff s diff,
s newinventory s newinventory
s) );
y espere Claptrap.HandleEventAsync (evt);
y devolver StateData.Inventory;
          ,
      ,
  .
```

## Implemente IInitial State Data Factory.

Ya hemos completado la consulta y actualización de inventario.Generalmente, sin embargo, hay una cantidad inicial en el inventario, y estamos complementando esta parte de la lógica en esta sección.

Cree`<code>SkuStateInitHandler en la carpeta  Sku```proyecto de</code>HelloClaptrap.actors.

```cs
Uso de Systems.Threading.Tasks;
cantar HelloClaptrap.Models.Sku;
cantar HelloClaptrap.Repository;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
y
, namespace HelloClap.Actors.Sku
,
, public class SkuStateInitHandler : IinitialState DataFactory
,
, private readonly ISkuRepository _skuRepository;
s
skuStateInitHandler (
skuRepository skuRepository)
_skuRepository
. uRepositorio;
,
,
, tarea asincrónica pública<IStateData> crear (identidad IClaptrapIdentity)
,
, var skuId e identidad. Id;
y va de inventario _skuRepository.GetInitInventoryAsync (skuId);
y var re , nuevo skuEstado
,
, inventario, inventario
, .
y volver re;
. .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

1. ``llama a IInitial StateDataFactory cuando Claptrap se activa por primera vez para crear el valor inicial de State.
2. La inyección`ISkuRepository`lee el importe de inventario inicial de Sku de la base de datos, el código específico no aparece aquí y el lector puede ver la implementación en el almacén de ejemplo.

Además del código de implementación, se requiere el registro antes de que se pueda llamar.

Abra``SkuGrain para`HelloClap.`proyecto.

```cs
  Uso de System.Threading.Tasks;
  Los Estados Unidos Dething Hello Claptrap.Actors.Sku.Events;
  The 1990s, HelloClaptrap.IActor;
  Los Estados Unidos Ofsing HelloClaptrap.Models;
  .HelloClaptrap.Models.Sku;
  .HelloClaptrap.Models.Sku.Events;
  .Claptrap;
  Newbe.Claptrap.Orleans;

  espacio de nombres HelloClaptrap.Actors.Sku
  snr.
skptrapState Information Factory Handler)
      snr. (InventoryUpdateEventHandler), ClaptrapCodes.SkuVentory Update)
      Public Class SkuGrain : ClaptrapBoxGrain<SkuState>, ISGrakuin

          Public SkuGrain ( IClaptrapGrainCommonService Claptrap Grain Common Services
              : base (claptrapGrainCommonService)
          {
          }

          tarea pública<int> GetInventoryAsync (

              Return Task.From Reserve (StateData.Inventory);
          ;

          Public Information Task<int> UpdateInventoryAsync (int diff

              si (diff s 0)
              s
                  lanzar new bizException ("diff no puede ser 0");
              s

              var old s StateData.Inventory;
              var newinvent snr . . . old s diff;
              if (newinvent < 0)

                  nuevo bisp nuevo. on (
                      $"no pudo actualizar el inventario. Será menor que 0 si se añade la cantidad de diferencia. corriente : {old} , diff : {diff}" );
              .

              var evt . . . esto. CreateEvent (nuevo InventoryUpdateEvent

                  Diff s diff,
                  NewInventory s newinventory
              ) );
              .HandleEventAsync (evt);
              StateData.Inventory;
          ,
      ,
  .
```

## Modificar controlador.

Una vez completados todos los pasos anteriores, se han completado todas las partes de Claptrap.Sin embargo, Claptrap no puede proporcionar interoperabilidad directamente con programas externos.Por lo tanto, también debe agregar una API a la capa Controller para operaciones externas de "inventario de lectura".

Cree`nuevo`SkuController en`el proyecto de<code>HelloClaptrap.`de carpeta de</code>controllers.

```cs
Uso de Systems.Threading.Tasks;
cantar HelloClaptrap.IActor;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
y el uso de Orleans;

, espacio de nombres HelloClaptrap.Web.Controllers
,
, route ( " api /[controller]" ) ,
, public class SkuController : Controller
,
, private readonly IGrain Factory _grainFactory;
s
skuController (
s.iGrainFactory grainfactory)
s.
s. _grainFactory . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . _grainFac

<IActionResult> 
{id}


. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . Tory.<ISkuGrain>GetGrain (id);
s.var inventory skuGrain.GetInventoryAsync();
, devolver Json (nuevo
,
, skuId , id,
, inventario ,
, s);
,
, ,
, . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

1. La nueva API lee el inventario de un SkuId específico.De acuerdo con la implementación del código de ejemplo, puede pasar`Yueluo-123`obtiene una cantidad de inventario de 666.Un SkuId que no existe produce una excepción.
1. No hay ninguna API externa creada aquí para actualizar el inventario, porque este ejemplo realizará operaciones de inventario cuando realice una compra de pedido en el siguiente artículo y la API no es necesaria aquí en este momento.

## Resumen.

En este punto, hemos completado todo el contenido del simple requisito de "gestionar el inventario de mercancías".

Puede obtener el código fuente de este artículo en las siguientes：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
