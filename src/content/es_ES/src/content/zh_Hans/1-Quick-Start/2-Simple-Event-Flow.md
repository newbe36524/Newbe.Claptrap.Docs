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
  Espacio de nombres HelloClaptrap.Models.
  {
      clase estática pública ClaptrapCodes.
      {
          cadena pública de const CartGrain s "cart_claptrap_newbe";
          Cadena const privada CartEventSuffix . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
          cadena const pública AddItemToCart - "addItem" s cartEventSuffix;
          cadena pública const RemoveItem FromCart - "removeItem" s cartEventSuffix;
public const string Remove AllItems FromCart s "remoeAllItems" s."
      }
  }
```

## Definir evento.

El evento es la clave para el origen de los eventos.Se utiliza para cambiar el estado en Claptrap.Y Event se conserva en la capa de persistencia.

En.`HelloClap.Models.`El proyecto.`Carro/Eventos.`Crear en la carpeta.`Quitar AllItems del evento de carro.`Clase.

Agregue el código siguiente.：

```cs
susing Newbe.Claptrap;
+
Snamespace HelloClaptrap.Models.Cart.Events.
+ {
clase pública quitar AllAllItems FromCartEvent: IEventData.
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
susing System.Threading.Tasks;
- Hola UsingClaptrap.Models.Cart;
- HelloClaptrap.Models.Cart.Events;
susing Newbe.Claptrap;
+
Snamespace HelloClaptrap.Actors.Cart.Events.
+ {
clase de clase pública Remove AllItems From CartEvent Handler.
: NormalEventHandler.<CartState, RemoveAllItemsFromCartEvent>
+     {
invalidación pública ValueTask HandleEvent (CartState StateData,
RemoveAllItems FromCart EventData EventData,
IEventContext EventContext)
+         {
statedata.Items snull;
devolver new ValueTask();
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
  utilizando Newbe.Claptrap;
  utilizando Newbe.Claptrap.Orleans;

  Espacio de nombres HelloClaptrap.Actors.Cart.
  {
      (Claptrap Event Handler(Typeof (AddItemToCartEvent Handler), ClaptrapCodes.AddItemToCart)
      (Claptrap Event Handler( RemoveitemFromCartEvent Handler), ClaptrapCodes.RemoveItemFromCart)
- "Claptrap Event Handler (Typeof (Remove AllItems From Cart Event Handler), ClaptrapCodes.RemoveAllFromItems Cart)
      clase pública CartGrain : ClaptrapBoxGrain.<CartState>, ICartGrain.
      {
          CartGrain público ()
              IClaptrapGrainCommon Service ClapGrainGrainCommonService
              : base (claptrapGrain Common Service)
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
  Uso de System.Collections.Generic;
  Uso de System.Threading.Tasks;
  Uso de HelloClaptrap.Models;
  Uso de HelloClaptrap.Models.Cart;
  Uso de HelloClaptrap.Models.Cart.Events;
  utilizando Newbe.Claptrap;
  utilizando Newbe.Claptrap.Orleans;

  Espacio de nombres HelloClaptrap.IActor.
  {
      (ClaptrapState(typeof, ClaptrapCodes.CartGrain))
      (ClaptrapEvent(Typeof(AddItemToCartEvent), ClaptrapCodes.AddItemToCart)
      (ClaptrapEvent(Typeof (RemoveItemFromCartEventEvent), ClaptrapCodes.RemoveItemFromCart)
- "ClaptrapEvent (Typeof (Remove AllItems from CartEventEvent), ClaptrapCodes.RemoveAllItemsfromCart)
      interfaz pública ICartGrain : IClaptrapGrain.
      {
          Tarea.<Dictionary<string, int>> AddItemAsync (string skuId, int count);
          Tarea.<Dictionary<string, int>> Quitar ItemAsync (string skuId, int count);
          Tarea.<Dictionary<string, int>> GetItemsAsync ();
Tarea AllItemsAsync ();
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
  Uso del sistema;
  Uso de System.Collections.Generic;
  Uso de System.Linq;
  Uso de System.Threading.Tasks;
  Uso de HelloClaptrap.Actors.Cart.Events;
  Uso de HelloClaptrap.IActor;
  Uso de HelloClaptrap.Models;
  Uso de HelloClaptrap.Models.Cart;
  Uso de HelloClaptrap.Models.Cart.Events;
  utilizando Newbe.Claptrap;
  utilizando Newbe.Claptrap.Orleans;

  Espacio de nombres HelloClaptrap.Actors.Cart.
  {
      (Claptrap Event Handler(Typeof (AddItemToCartEvent Handler), ClaptrapCodes.AddItemToCart)
      (Claptrap Event Handler( RemoveitemFromCartEvent Handler), ClaptrapCodes.RemoveItemFromCart)
      (Claptrap Event Handler(TypeofAllItems From Cart Event Handler), ClaptrapCodes.RemoveAllItems From Cart)
      clase pública CartGrain : ClaptrapBoxGrain.<CartState>, ICartGrain.
      {
          CartGrain público ()
              IClaptrapGrainCommon Service ClapGrainGrainCommonService
              : base (claptrapGrain Common Service)
          {
          }

tarea pública Eliminar AllItemsAsync ()
+         {
si (StateData.Items?. Any() ! . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
+             {
Devolver Task.CompletedTask;
+             }
+
el var removeAllItems FromCartEvent s new RemoveAllItems FromCartEvent ();
svar evt s.this. CreateEvent (removeAllItems From CartEvent);
devolver Claptrap.HandleEventAsync (evt);
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
  Uso de System.Threading.Tasks;
  Uso de HelloClaptrap.IActor;
  uso de Microsoft.AspNetCore.Mvc;
  Uso de Orleans;

  Espacio de nombres HelloClaptrap.Web.Controllers.
  {
      Ruta ("api/[controller]")]
      clase pública CartController : Controlador.
      {
          Fábrica privada de solo lectura _grainFactory;

          CartController público (CartController público)
              IGrain FactorY Grain Factory)
          {
              _grainFactory - fábrica de granos;
          }

httppost ("{id}/clean")
tarea asincrónica pública.<IActionResult> RemoveAllItemAsync (identificador de int)
+         {
el var cartgrain s _grainFactory.GetGrain.<ICartGrain>(id. ToString ();
await cartgrain.RemoveAllItemsAsync ();
devolver Json ("éxito limpio");
+         }
      }
  }
```

## Resumen

En este punto, hemos hecho todo lo que necesitamos para "vaciar su carrito de compras".

Puede obtener el código fuente de este artículo desde la siguiente dirección.：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
