---
title: 'Paso 2 - Simple negocio, vacíe su carrito de compras'
description: 'Paso 2 - Simple negocio, vacíe su carrito de compras'
---

Con esta lectura, puedes empezar a hacer negocios con Claptrap.

<!-- more -->

## Un resumen de apertura

En este artículo, aprendí a agregar una implementación de negocio a un ejemplo de proyecto existente implementando la necesidad de "vaciar el carro de la compra".

Los siguientes pasos se included：

1. Definir EventCode
2. Definir evento
3. Implementar EventHandler
4. Regístrese en EventHandler
5. Modificar la interfaz de grano
6. Implementar grano
7. Modificar controlador

Este es un proceso de abajo hacia arriba, y el desarrollo en el proceso de codificación real también se puede implementar de arriba hacia abajo.

## Definir código de evento

EventCode es el código único para cada evento en el sistema Claptrap.Desempeña un papel importante en la identificación y serialización de eventos.

Abra`la clase de`ClaptrapCodes en`el proyecto de HelloClaptrap.`.

Agregue EventCode para eventos vacíos del carro de la compra.

```cs
  namespace HelloClaptrap.Models
  {
      public static class ClaptrapCodes
      {
          public const string CartGrain = "cart_claptrap_newbe";
          private const string CartEventSuffix = "_e_" + CartGrain;
          public const string AddItemToCart = "addItem" + CartEventSuffix;
          public const string RemoveItemFromCart = "removeItem" + CartEventSuffix;
+         public const string RemoveAllItemsFromCart = "remoeAllItems" + CartEventSuffix;
      }
  }
```

## Definir evento

El evento es la clave para el abastecimiento de eventos.Se utiliza para cambiar de estado en Claptrap.Y Event se conserva en la capa de persistencia.

Cree```RemoveAllItems FromCartEvent en la carpeta Cart/Events`del proyecto de HelloClaptrap. Models.

Agregue los siguientes code：

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Cart.Events
+ {
+     public class RemoveAllItemsFromCartEvent : IEventData
+     {
+     }
+ }
```

Porque en este escenario empresarial simple, vaciar un carro de la compra no requiere parámetros específicos.Por lo tanto, simplemente cree un tipo vacío.

`interfaz IEventData`es una interfaz vacía en el marco de trabajo que representa eventos y se usa en inferencias genéricas.

## Implementar EventHandler

EventHandler 用于将事件更新到 Claptrap 的 State 上。Por ejemplo, en este escenario empresarial, EventHandler es responsable de vaciar el contenido del carro de estado.

Cree  clase RemoveAllItems FromCartEventHandler en la carpeta Cart/Events`del proyecto HelloClaptrap.

Agregue los siguientes code：

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Cart;
+ using HelloClaptrap.Models.Cart.Events;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Cart.Events
+ {
+     public class RemoveAllItemsFromCartEventHandler
+         : NormalEventHandler<CartState, RemoveAllItemsFromCartEvent>
+     {
+         public override ValueTask HandleEvent(CartState stateData,
+             RemoveAllItemsFromCartEvent eventData,
+             IEventContext eventContext)
+         {
+             stateData.Items = null;
+             return new ValueTask();
+         }
+     }
+ }
```

Estas son algunas questions：comunes

1. ¿Qué es NormalEventHandler?

   NormalEventHandler es una clase base simple definida por el marco de trabajo para facilitar la implementación de Handler. El primer parámetro genérico es el tipo De estado para Claptrap.En combinación con el documento anterior, nuestro tipo de estado del carro es CartState. El segundo parámetro genérico es el tipo de evento que el controlador debe controlar.

2. Por qué usar`StateData.Items . . null;`en su lugar`stateData.Items.Clear ();`

   StateData es un objeto que se mantiene en memoria y Clear no reduce la memoria que el diccionario ya consume.Por supuesto, no hay cientos de miles de artículos en un carro de la compra.Pero el punto es que cuando se actualiza State, es importante tener en cuenta que Claptrap es un objeto residente en memoria que aumenta el consumo de memoria a medida que aumenta el número.Por lo tanto, mantenga el menor contenido posible en El Estado.

3. ¿Qué es ValueTask?

   Puede[en este artículo sobre la comprensión de los porqués, las novedades y cuándo de ValueTask](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)el mundo.

Una vez completada la implementación de EventHandler, no olvide probarla unitariamente.No está en la lista aquí.

## Regístrese en EventHandler

Después de implementar y probar EventHandler, puede registrar eventHandler para asociarlo con EventCode y Claptrap.

Abra la clase`CartGrain del proyecto HelloClaptrap.</p>

<p spaces-before="0">Marcar con atributo.</p>

<pre><code class="cs">  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Cart
  {
      [ClaptrapEventHandler(typeof(AddItemToCartEventHandler), ClaptrapCodes.AddItemToCart)]
      [ClaptrapEventHandler(typeof(RemoveItemFromCartEventHandler), ClaptrapCodes.RemoveItemFromCart)]
+     [ClaptrapEventHandler(typeof(RemoveAllItemsFromCartEventHandler), ClaptrapCodes.RemoveAllItemsFromCart)]
      public class CartGrain : ClaptrapBoxGrain<CartState>, ICartGrain
      {
          public CartGrain(
              IClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

          ....
`</pre>

`atributo ClaptrapEventHandler`es un atributo definido por el marco de trabajo que se puede etiquetar en la clase de implementación de Grain para implementar la asociación entre EventHandler, EventCode y ClaptrapGrain.

Después de la asociación, si el evento correspondiente a EventCode se produce en este Grano, será controlado por el EventHandler especificado.

## Modificar la interfaz de grano

Modifique la definición de la interfaz Grain para proporcionar interoperabilidad externa con Claptrap.

打开 HelloClaptrap.IActors 项目的 ICartGrain 接口。

Agregue interfaces así como atributo.

```cs
  using System.Collections.Generic;
  using System.Threading.Tasks;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Cart;
  using HelloClaptrap.Models.Cart.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.IActor
  {
      [ClaptrapState(typeof(CartState), ClaptrapCodes.CartGrain)]
      [ClaptrapEvent(typeof(AddItemToCartEvent), ClaptrapCodes.AddItemToCart)]
      [ClaptrapEvent(typeof(RemoveItemFromCartEvent), ClaptrapCodes.RemoveItemFromCart)]
+     [ClaptrapEvent(typeof(RemoveAllItemsFromCartEvent), ClaptrapCodes.RemoveAllItemsFromCart)]
      public interface ICartGrain : IClaptrapGrain
      {
          Task<Dictionary<string, int>> AddItemAsync(string skuId, int count);
          Task<Dictionary<string, int>> RemoveItemAsync(string skuId, int count);
          Task<Dictionary<string, int>> GetItemsAsync();
+         Task RemoveAllItemsAsync();
      }
  }
```

Se han added：dos partes

1. Marque el``ClaptrapEvent para asociar el evento con Grain.Tenga en cuenta que esto es diferente del`el`anterior ClaptrapEventHandler.El evento se marca aquí y EventHandler se marca como el último paso.
2. Se ha añadido el método RemoveAllItemsAsync para representar el comportamiento empresarial de "vaciar el carro de la compra".Es importante tener en cuenta que la definición del método de Grain tiene ciertas limitaciones.Para obtener más información,[se puede encontrar en el "Desarrollo de una grain](https://dotnet.github.io/orleans/Documentation/grains/index.html).

## Implementar grano

A continuación, siga las modificaciones de interfaz del paso siguiente para modificar la clase de implementación correspondiente.

Abra la clase`CartGrain`el `Cart en el proyecto de`HelloClaptrap.actors.

Agregue la implementación correspondiente.

```cs
  using System;
  using System.Collections.Generic;
  using System.Linq;
  using System.Threading.Tasks;
  using HelloClaptrap.Actors.Cart.Events;
  using HelloClaptrap.IActor;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Cart;
  using HelloClaptrap.Models.Cart.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Cart
  {
      [ClaptrapEventHandler(typeof(AddItemToCartEventHandler), ClaptrapCodes.AddItemToCart)]
      [ClaptrapEventHandler(typeof(RemoveItemFromCartEventHandler), ClaptrapCodes.RemoveItemFromCart)]
      [ClaptrapEventHandler(typeof(RemoveAllItemsFromCartEventHandler), ClaptrapCodes.RemoveAllItemsFromCart)]
      public class CartGrain : ClaptrapBoxGrain<CartState>, ICartGrain
      {
          public CartGrain(
              IClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

+         public Task RemoveAllItemsAsync()
+         {
+             if (StateData.Items?.Any() != true)
+             {
+                 return Task.CompletedTask;
+             }
+
+             var removeAllItemsFromCartEvent = new RemoveAllItemsFromCartEvent();
+             var evt = this.CreateEvent(removeAllItemsFromCartEvent);
+             return Claptrap.HandleEventAsync(evt);
+         }
      }
  }
```

Se ha agregado la implementación correspondiente del método de interfaz.Hay los siguientes puntos para note：

1. Asegúrese de`si (StateData.Items?. Any() ! . . true)`esta línea de juicio.Esto puede reducir significativamente la sobrecarga del almacenamiento.

   Los eventos persisten cuando`el claptrap.HandleEventAsync (evt`el evento.En cuanto al escenario aquí se refiere, si no hay contenido en el carro de la compra, vaciar o persistir el evento simplemente aumenta la sobrecarga y no tiene ningún significado práctico. Por lo tanto, añadir juicio hasta entonces puede reducir el consumo inútil de almacenamiento.

2. Asegúrese de determinar el estado y si los parámetros entrantes cumplen las condiciones para la ejecución de eventos.

   Esto es diferente de lo que se describe en el punto anterior.El foco en el punto anterior indica que "no producen eventos sin sentido", lo que indica que "nunca produzca eventos que EventHandler no pueda consumir". En el modo de abastecimiento de eventos, la finalización del negocio se basa en la persistencia del evento como base para la finalización del negocio.Esto significa que tan pronto como el evento está en la biblioteca, puede pensar que el evento está completo. En EventHandler, solo se pueden aceptar eventos leídos de la capa de persistencia.En este punto, el evento ya no se puede modificar según su inmutabilidad, así que asegúrese de que EventHandler puede consumir el evento.Por lo tanto,`importante realizar un juicio antes de la`de Claptrap.HandleEventAsync (evt). Por lo tanto, es importante implementar pruebas unitarias para asegurarse de que la generación de eventos y la lógica de procesamiento de EventHandler se sobrescriben.

3. Estos son algunos métodos para usar en algunas bibliotecas TAP, como[](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap)asincrónico basado en tareas.

## Modificar controlador

Para cuando se completen todos los pasos anteriores, se han completado todas las partes de Claptrap.Sin embargo, Claptrap no puede proporcionar directamente interoperabilidad con programas externos.Por lo tanto, también debe agregar una API en la capa Controller para "vaciar el carro de la compra" externamente.

Abra la CartController`en la carpeta Controllers``para el proyecto helloClaptrap.web`.

```cs
  using System.Threading.Tasks;
  using HelloClaptrap.IActor;
  using Microsoft.AspNetCore.Mvc;
  using Orleans;

  namespace HelloClaptrap.Web.Controllers
  {
      [Route("api/[controller]")]
      public class CartController : Controller
      {
          private readonly IGrainFactory _grainFactory;

          public CartController(
              IGrainFactory grainFactory)
          {
              _grainFactory = grainFactory;
          }

+         [HttpPost("{id}/clean")]
+         public async Task<IActionResult> RemoveAllItemAsync(int id)
+         {
+             var cartGrain = _grainFactory.GetGrain<ICartGrain>(id.ToString());
+             await cartGrain.RemoveAllItemsAsync();
+             return Json("clean success");
+         }
      }
  }
```

## Resumen

En este punto, hemos hecho todo lo que necesitamos para "vaciar el carro de la compra".

Puede obtener el código fuente de este artículo en la siguiente address：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
