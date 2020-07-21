---
title: 'Paso dos - Negocios simples, carrito de compras vacío.'
metaTitle: 'Paso dos - Negocios simples, carrito de compras vacío.'
metaDescription: 'Paso dos - Negocios simples, carrito de compras vacío.'
---

Con esta lectura, estás listo para probar con Claptrap para implementar tu negocio.

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

<!-- more -->

## El resumen de apertura.

En este artículo, aprendí a agregar una implementación de negocio a un ejemplo de proyecto existente implementando la necesidad de "vaciar el carro de la compra".

Los principales incluyen estos pasos.：

1. Definir EventCode.
2. Definir evento.
3. Implementar EventHandler.
4. Regístrese en EventHandler.
5. Modifique la interfaz Grano.
6. Implementar grano.
7. Modifique el controlador.

Este es un proceso de abajo hacia arriba, y el proceso de codificación real también se puede desarrollar de arriba a abajo.

## Definir código de evento.

EventCode es la codificación única de cada evento en el sistema Claptrap.Desempeña un papel importante en la identificación y serialización de eventos.

Ábrela.`HelloClap.Models.`Proyecto.`Códigos de Claptrap.`Clase.

Agregar EventCode para "Eventos vacíos del carro de la compra."

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

## Definir evento.

El evento es la clave para el origen de los eventos.Se utiliza para cambiar el estado en Claptrap.Y Event se conserva en la capa de persistencia.

En.`HelloClap.Models.`El proyecto.`Carro/Eventos.`Crear en la carpeta.`Quitar AllItems del evento de carro.`Clase.

Agregue el código siguiente.：

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

`IEventData.`Una interfaz es una interfaz vacía en un marco de trabajo que representa eventos y se utiliza cuando se deducen genéricas.

## Implementar EventHandler.

`Controlador de eventos.`Se utiliza para actualizar eventos a Claptrap.`Estado.`En.Por ejemplo, en este escenario empresarial, EventHandler es responsable de vaciar el contenido del carro de la compra estatal.

En.`HelloClap.Actors.`El proyecto.`Carro/Eventos.`Crear en la carpeta.`Eliminar todos los elementos del controlador de eventos del carro.`Clase.

Agregue el código siguiente.：

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

Estos son algunos problemas comunes.：

1. ¿Qué es normal Event Handler?

   NormalEventHandler es una clase base simple definida por el marco de trabajo para facilitar la implementación de Handler. El primer parámetro genérico es el tipo De estado para Claptrap.Junto con el documento anterior, nuestro tipo de estado de carro es CartState. El segundo parámetro genérico es el tipo de evento que Handler debe controlar.

2. ¿Por qué usarlo?`StateData.Items snull;`No.`StateData.Items.Clear();`

   StateData es un objeto que se mantiene en memoria y Clear no reduce la propia memoria del diccionario.Por supuesto, por lo general no hay carros de la compra con cientos de miles de artículos.Pero el punto es, al actualizar State, es importante tener en cuenta que Claptrap es un objeto basado en memoria que aumenta en número y aumenta el consumo de memoria.Por lo tanto, mantenga el menor contenido posible en El Estado.

3. ¿Qué es ValueTask?

   Puede pasar esto.[Comprender los porqués, las novedades y los cuándoes de ValueTask](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)Aprender.

Una vez completada la implementación de EventHandler, no olvide probarla unitariamente.No está en la lista aquí.

## Regístrese en EventHandler.

Una vez que haya implementado y probado EventHandler, puede registrar EventHandler para que se asocie con EventCode y Claptrap.

Ábrela.`HelloClap.Actors.`El proyecto.`CartGrain.`Clase.

Marcar con atributo.

```cs
  using Newbe.Claptrap;
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
```

`Controlador de controlador de eventos de Claptrap.`Es un atributo definido por el marco de trabajo que se puede marcar en la clase de implementación de grain para lograr la asociación entre EventHandler, EventCode y ClaptrapGrain.

Después de la asociación, si el evento para EventCode se genera en este grano, el evento se controla mediante el EventHandler especificado.

## Modifique la interfaz Grano.

Modifique la definición de la interfaz Grain para proporcionar interoperabilidad externa con Claptrap.

Ábrela.`HelloClaptrap.IActors.`El proyecto.`ICartGrain.`Interfaz.

Agregue interfaces y atributos.

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

Se han añadido dos partes.：

1. Marcado.`ClaptrapEvent.`para asociar el evento con Grain.Tenga en cuenta que aquí está el paso anterior.`Controlador de eventos de Claptrap.`es diferente.El evento se marca aquí y eventHandler se marca en el paso anterior.
2. Se ha añadido el método RemoveAllItemsAsync para indicar el comportamiento empresarial de "vaciar carros de la compra".Es importante tener en cuenta que la definición del método del grano tiene ciertas limitaciones.Se pueden encontrar detalles.[Desarrollo de un grano](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## Implementar grano.

A continuación, siga la modificación de la interfaz anterior para modificar la clase de implementación correspondiente.

Ábrela.`HelloClap.Actors.`Proyecto.`Carro.`debajo de la carpeta.`CartGrain.`Clase.

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

Se ha agregado la implementación correspondiente del método de interfaz.Hay algunos puntos a tener en cuenta.：

1. Asegúrese de aumentar.`si (StateData.Items?? Any() ! . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .`Esta línea de juicio.Esto puede reducir significativamente la sobrecarga del almacenamiento.

   El evento se ejecuta cuando.`Claptrap.HandleEventAsync (evt)`persistirá.En el caso de la escena aquí, si no hay nada en el carro de la compra, vaciar o conservar el evento sólo aumenta la sobrecarga, pero no tiene sentido. Por lo tanto, añadir juicio antes de esto puede reducir el consumo inútil de almacenamiento.

2. Es importante determinar si State y los parámetros entrantes cumplen los criterios para la ejecución de eventos.

   Esto es diferente del énfasis descrito en el punto anterior.El énfasis anterior en "no producir eventos sin sentido" sugiere que "nunca habrá eventos que EventHandler no pueda consumir". En el modo de seguimiento de eventos, la finalización de la empresa se basa en la persistencia del evento como base para la finalización de la determinación de negocio.Esto significa que mientras el evento esté en stock, se puede considerar que el evento se ha completado. En EventHandler, solo puede aceptar eventos leídos de la capa de persistencia.En este punto, el evento ya no se puede modificar ya que el evento es inmutable, por lo que es importante asegurarse de que EventHandler puede consumir el evento.Así que, adentro.`Claptrap.HandleEventAsync (evt)`Es especialmente importante hacer un juicio antes. Por lo tanto, es importante implementar pruebas unitarias para asegurarse de que la generación de eventos y la lógica de procesamiento de EventHandler se sobrescriben.

3. Estos son algunos métodos de la biblioteca TAP que puede utilizar, consulte .[Patrón asincrónico basado en tareas.](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap)

## Modifique el controlador.

Una vez completados todos los pasos anteriores, ha completado todas las partes de Claptrap.Sin embargo, Claptrap no puede proporcionar interoperabilidad con programas externos directamente.Por lo tanto, también debe agregar una API a la capa Controller para "vaciar el carro de la compra" externamente.

Ábrela.`HelloClap.Web.`El proyecto.`Controladores.`debajo de la carpeta.`CartController.`Clase.

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

En este punto, hemos hecho todo lo que necesitamos para "vaciar su carrito de compras".

Puede obtener el código fuente de este artículo desde la siguiente dirección.：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
