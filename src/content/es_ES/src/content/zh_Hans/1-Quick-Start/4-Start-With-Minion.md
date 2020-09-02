---
title: 'Paso 4 - Utilice Minion para hacer un pedido de un producto.'
metaTitle: 'Paso 4 - Utilice Minion para hacer un pedido de un producto.'
metaDescription: 'Paso 4 - Utilice Minion para hacer un pedido de un producto.'
---

Con este artículo, puedes empezar a hacer negocios con Claptrap.

> [La versión que se ve actualmente es el resultado de que la máquina simplificada en chino traduce la autocomprobación y las lecturas manuales.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar sus sugerencias de traducción.](https://crwd.in/newbeclaptrap)

<!-- more -->

## Resumen de apertura.

En este artículo, aprendí cómo Se puede usar Minion para completar el procesamiento empresarial asincrónico en muestras de proyectos existentes mediante la implementación de los requisitos de "pedido de productos básicos".

En primer lugar, eche un vistazo a los casos de uso empresarial que deben cubrirse en este article：

1. El usuario puede realizar un pedido, que forma un pedido utilizando todas las SKU en el carro de la compra actual.
2. El inventario de las SKU correspondientes se deducirá después de realizar el pedido.Si una SKU está agotada, se produce un error en el pedido.
3. La operación de pedido solo se realiza correctamente hasta que el inventario se deduce correctamente y los pasos siguientes no requieren el ámbito de esta discusión de ejemplo.Por lo tanto, este ejemplo genera un registro de pedido en la base de datos después de realizar un pedido correcto, que indica el final de la creación del pedido.

Aunque el enfoque de este artículo se centra en el uso de Minion, debido a la necesidad de usar un nuevo objeto OrderGrain, todavía necesita usar el artículo anterior "Definición de Claptrap" conocimiento relacionado.

Minion es un tipo especial de Claptrap, y su relación con MasterClaptrap se muestra en las siguientes：

![Súbdito.](/images/20190228-002.gif)

Su principal proceso de desarrollo es similar al de Claptrap, con sólo unas pocas limitaciones.La comparación es como follows：

| Pasos.                                  | Una trampa. | Súbdito. |
| --------------------------------------- | ----------- | -------- |
| Definir ClaptrapTypeCode.               | √.          | √.       |
| Definir estado.                         | √.          | √.       |
| Defina la interfaz Granulado.           | √.          | √.       |
| Implementar grano.                      | √.          | √.       |
| Regístrese en Grano.                    | √.          | √.       |
| Definir EventCode.                      | √.          |          |
| Definir evento.                         | √.          |          |
| Implementar controlador de eventos.     | √.          | √.       |
| Regístrese en EventHandler.             | √.          | √.       |
| Implemente IInitial State Data Factory. | √.          | √.       |

La razón de esta eliminación es que debido a que Minion es el consumidor de eventos de claptrap, no es necesario procesar definiciones relacionadas con eventos.Pero el resto sigue siendo necesario.

> Al principio de este artículo, ya no enumeraremos las ubicaciones de archivo específicas donde se encuentra el código relevante, y esperamos que el lector pueda averiguarlo por sí mismo en el proyecto para que puedan dominarlo.

## Implemente OrderGrain.

Basándonos en el conocimiento anterior de "Definir Claptrap", implementamos un OrderGrain aquí para representar la operación de pedido de pedidos.Para ahorrar espacio, enumeramos solo las partes clave del producto.

### OrderState.

El estado de la orden se define como follows：

```cs
Systems.Collections.Generic;
. Newbe.Claptrap;

espacio de nombres HelloClaptrap.Models.Order
s
    clase pública Order State : IStateData
    s
        public bool OrderCreated s get; set; s
        public user stringId s get; set; s
        public Dictionary<string, int> Skus sned; set; s

s.
```

1. OrderCreated indica si se ha creado un pedido, evitando la creación de la orden repetidamente.
2. UserId realiza un pedido para un identificador de usuario.
3. Los pedidos de Skus contienen SkuIds y volúmenes de pedidos.

### OrderCreatedEvent.

Los eventos de creación de pedidos se definen como follows：

```cs
Systems.Collections.Generic;
. Newbe.Claptrap;

espacio de nombres HelloClaptrap.Models.Order.Events

    clase pública OrderCreatedEvent : IEventData
    . . .
        cadena pública UserId . . set; . . . . . . . . .

    <string, int> 
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

### OrdenGrain.

```cs
Uso de System.Threading.Tasks;
Los Estados Unidos, Hello Claptrap.Actors.Order.Events;
The 1990s, HelloClaptrap.IActor;
Los Estados Unidos Ofsing HelloClaptrap.Models;
.Models.Order;
.HelloClaptrap.Models.Order.Events;
.Claptrap;
Newbe.Claptrap.Orleans;
Orleans;

espacio de nombres HelloClaptrap.Actors.Order

    (OrderCreatedEventHandler, ClaptrapCodes.OrderCreated)
    Public Class Order Grain : ClaptrapBox Grain<OrderState>, IOrder Grain
    _grainFactory
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . IClaptrapGrainCommonService Claptrap Grain Common Services,
            IGrain Factory GrainFactory)
            : base (claptrapGrainCommonService)
        s
            _grainFactory s grainfactory;
        s

        public async Task CreateOrder Agent Async (CreateOrderInput)
        s
            var orderid s clatrapp.state.Identity. y.Id;
            // throw exception si order ya ha creado
            si (StateData.OrderCreated)

                new bizException ($"order with order id already created: {orderId}");


            // obtener artículos del carrito
            var cartGrain _grainFactory.GetGrain<ICartGrain>(entrada. CartId);
            var items - await cartGrain.GetItemsAsync();

            // actualizar inventario para
            foreach (skuId, count) en los artículos)

                sku skuGrain , _grainFactory.GetGrain<ISkuGrain>(skuId);
                await skuGrain.UpdateInventoryAsync (-count);
            . .

            // Quitar todos los artículos del carrito
            await cartGrain.Re. moveAllItemsAsync();

            // crear un
            var evt . . . este. CreateEvent (nueva entrada de
                de ID de usuario OrderCreatedEvent
            . UserId,
                Skus - elementos
            ) );
            .HandleEventAsync (evt);
        s
    s

```

1. OrderGrain implementa la lógica principal de la creación de pedidos, donde el método CreateOrderAsync completa la adquisición de datos del carro de la compra, las acciones relacionadas con la deducción de inventario.
2. Los campos relevantes en State se actualizarán después de la ejecución correcta de OrderCreatedEvent, que ya no aparece aquí.

## Guarde los datos del pedido en la base de datos a través de Minion.

Desde el principio de la serie hasta esto, nunca hemos mencionado las operaciones relacionadas con la base de datos.Porque cuando se usa el marco de trabajo de Claptrap, la gran mayoría de las operaciones se han reemplazado por Escrituras en eventos y actualizaciones de estado, por lo que no es necesario escribir sus propias operaciones de base de datos.

Sin embargo, debido a que Claptrap está diseñado generalmente para objetos unitarios (un pedido, una SKU, un carro de la compra), no es posible obtener datos para todos (todos los pedidos, todas las SKU, todos los carros).En este punto, los datos de estado deben conservarse en otra estructura persistente (base de datos, archivo, caché, etc.) para completar consultas u otras operaciones para toda la situación.

El concepto de Minion se introdujo en el marco de Claptrap para abordar estos requisitos.

A continuación, presentamos un OrderDbGrain (un minion) en el ejemplo para completar la operación de entrada de pedidos de OrderGrain de forma asincrónica.

## Definir ClaptrapTypeCode.

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
          publicidad pública y skuInventoryUpdate , "inventoryUpdate" , SkuEventSuffix;

          #endregion

          #region Orden

          orden de orden públicoGrain , "order_claptrap_newbe";
          la cadena privada privada privada OrderEventSuffix . . . . .""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""
          público y al público y el orden creado, "ordercreated" y orderEventSuffix;

el público y el público y el público a la cadena OrderDbGrain , "db_order_claptrap_newbe";

          #endregion
      . . . .
  . . . . . . . . . . . . . . . . . . . . . . . . . .
```

Minion es un tipo especial de Claptrap, en otras palabras, también es una especie de Claptrap.ClaptrapTypeCode es necesario para Claptrap y, por lo tanto, debe agregarse.

## Definir estado.

Dado que este ejemplo solo necesita escribir un registro de pedido en la base de datos y no requiere ningún dato en State, este paso no es realmente necesario en este ejemplo.

## Defina la interfaz Granulado.

```cs
Uso de HelloClaptrap.Models;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
+
+ espacio de nombres HelloClaptrap.IActor
+ á
+ [ClaptrapCodes.OrderGrain)]
+ [ClaptrapState(ClaptrapState(typeof(NoneStateData), ClaptrapCodes.OrderDbGrain)]
+ interfaz pública IOrderDbGrain : IClaptrapMinionGrain
+ á
+ á
+ ?
```

1. ClaptrapMinion se utiliza para marcar el Grano como un Esbirro, donde El Código apunta a su correspondiente MasterClaptrap.
2. ClaptrapState se utiliza para marcar el tipo de datos State de Claptrap.En el paso anterior, aclaramos que el Minion no requiere StateData, por lo que usamos NoneStateData como un tipo integrado de marco de trabajo en su lugar.
3. IClaptrapMinionGrain es una interfaz Minion que difiere de IClaptrapGrain.Si un Grano es Un esbirro, debe heredar la interfaz.
4. ClaptrapCodes.OrderGrain y ClaptrapCodes.OrderDbGrain son dos cadenas diferentes, y esperemos que el lector no sea un maestro interestelar.

> Star Master：Debido a que StarCraft es trepidante y tiene una gran cantidad de información, es fácil para los jugadores ignorar o juzgar mal parte de la información, por lo que a menudo "los jugadores no ven los eventos clave que ocurren bajo la nariz" errores divertidos.Los jugadores bromean así que los jugadores interestelares son ciegos (hubo una vez un enfrentamiento real entre jugadores ciegos y profesionales), cuanto mayor sea el segmento, más grave será la ceguera, los jugadores interestelares profesionales son ciegos.

## Implementar grano.

```cs
Uso de Systems.Collections.Generic;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
cantar HelloClaptrap.IActor;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
,
, namespace HelloClaptrap.Actors.DbGrains.Order
,
, y ClaptrapEventHandler , ClaptrapCodes . OrderCreated)
y la clase pública OrderDbGrain : ClaptrapBoxGrain<NoneStateData>, IOrderDbGrain
,
, Public OrderDbGrain (IpClatrapBoxGrain CommonService). claptrapGrainCommonService)
+ : base(claptrapGrainCommonService)
+ á
+ á
+
+ tarea asincrónica pública MasterEventReceivedAsync((public async Task MasterEventReceivedAsync((IEnumerable<IEvent> los eventos)
+ á
+ foreach (var @event en eventos)
+ á
+ await Claptrap.HandleEventAsync(@event);

,
,
,  ,
de  de wakeAsync () público ,
, devolver Task.CompletedTask,
,
,
.
```

1. MasterEventReceivedAsync es un método definido a partir de IClaptrapMinionGrain que significa recibir notificaciones de eventos de MasterClaptrap en tiempo real.Sin expandir la descripción aquí, siga la plantilla anterior.
2. WakeAsync es un método definido a partir de IClaptrapMinionGrain, que representa la activación activa de MasterClaptrap de Minion.Sin expandir la descripción aquí, siga la plantilla anterior.
3. Cuando el lector ve el código fuente, encuentra que la clase se define por separado en un ensamblado.Esta es sólo una clasificación que se puede entender como la colocación de Minion y MasterClaptrap en dos proyectos diferentes.En realidad no es problema para armarlo.

## Regístrese en Grano.

Aquí, porque definimos OrderDbGrain en un ensamblado independiente, necesitamos registrar el ensamblado adicionalmente.Como sigue,：

```cs
  Uso del sistema;
  usando Autofac;
  . Hening HelloClaptrap.Actors.Cart;
  .HelloClaptrap.Actors.DbGrains.Order;
  .IActor;
  s servicio general, HelloClaptrap.Repository;
  .AspNetCore.Hosting;
  .Extensions.Hosting;
  .Extensions.Logging;
  .Claptrap;
  newbe.Claptrap.Bootstrapper;
  NLog.Web;
  Orleans;

  espacio de nombres HelloClaptrap.BackendServer

      programa de programa público

          public static void main (string)

              var logger , NLogBuilder.ConfigureNLog ("nlog.config"). GetCurrentClassLogger ();
              prueba
              registrador
                  . Depurar ("init main");
                  CreateHostBuilder (args). Build(). Ejecutar ();



                  catch (excepción de excepción) //NLog: errores de configuración de captura
                  registrador. Error (excepción, "Programa detenido debido a la excepción");
                  lanzamiento;

              finalmente

                  // Asegúrese de vaciar y detener los temporizadores/hilos internos antes de la salida de la aplicación
                  NLog.LogManager.Shutdown();
              .
          . . . . . . . .

          . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .>
              .
                  CreateDefaultBuilder (args). ConfigureWebHostDefaults (webBuilder> . . . . . . . .
                  . . . . . . .<Startup>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . UseClaptrap (
                      Builders>

                          Builder
                              . ScanClaptrapDesigns (nuevo)

                                  typeof (ICartGrain). Montaje,
                                  tipo (CartGrain). Assembly,
y Typeof (OrderDbGrain).
                              )
                              . ConfigureClaptrapDesign (x .>
                                  x. Opciones de Claptrap. Opciones de EventCenter. EventCenterType . . . .
                      , constructor
> constructor. RegisterModule<RepositoryModule>(); )
                  . UseOrleans Claptrap()
                  . UseOrleans (constructores - constructores> . UseDashboards (opciones> opciones. Puerto s 9000))
                  . ConfigureLogging (registro )>
                  .
                      registro. ClearProviders (); registro
                      . SetMinimumLevel (LogLevel.Trace);
                  )
                  . UseNLog();
      . . .
  . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

## Implementar controlador de eventos.

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Order.Events;
+ using HelloClaptrap.Repository;
+ using Newbe.Claptrap;
+ using Newtonsoft.Json;
+
+ namespace HelloClaptrap.Actors.DbGrains.Order.Events
+ {
+     public class OrderCreatedEventHandler
+         : NormalEventHandler<NoneStateData, OrderCreatedEvent>
+     {
+         private readonly IOrderRepository _orderRepository;
+
+         public OrderCreatedEventHandler(
+             IOrderRepository orderRepository)
+         {
+             _orderRepository = orderRepository;
+         }
+
+         public override async ValueTask HandleEvent(NoneStateData stateData,
+             OrderCreatedEvent eventData,
+             IEventContext eventContext)
+         {
+             var orderId = eventContext.State.Identity.Id;
+             await _orderRepository.SaveAsync(eventData.UserId, orderId, JsonConvert.SerializeObject(eventData.Skus));
+         }
+     }
+ }
```

1. IOrderRepository es una interfaz que funciona directamente en el nivel de almacenamiento para el complemento y la eliminación de pedidos.La interfaz se llama aquí para implementar la operación de almacenamiento de la base de datos de pedidos.

## Regístrese en EventHandler.

De hecho, para ahorrar espacio, nos hemos registrado en el código para la sección "Implementar grano".

## Implemente IInitial State Data Factory.

Dado que StateData no tiene una definición especial, no es necesario implementar IInitial StateData Factory.

## Modificar controlador.

En el ejemplo, agregamos OrderController para realizar pedidos y pedidos de consulta.Los lectores pueden verlo en el código fuente.

Los lectores pueden seguir los pasos siguientes para probar el：

1. POST `/api/cart/123` "skuId": "yueluo-666", "count": 30" al carro de la compra 123 para añadir 30 unidades de concentrado yueluo-666.
2. POST `/api/order` ( "userId": "999", "cartId": "123") como 999 userId, desde el carro de la compra 123 para realizar un pedido.
3. GET `/api/order` el pedido se puede ver a través de la API después de que el pedido se haya realizado correctamente.
4. OBTENGA `` /api/sku/yueluo-666 puede ver el saldo del inventario después de realizar el pedido a través de la API de SKU.

## Resumen.

En este punto, hemos completado el "pedido de mercancías" esta demanda para el contenido básico.Este ejemplo proporciona una comprensión inicial de cómo varios Claptraps pueden trabajar juntos y cómo se puede usar Minion para realizar tareas asincrónicas.

Sin embargo, todavía hay algunos temas que discutiremos más adelante.

Puede obtener el código fuente de este artículo en las siguientes：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
