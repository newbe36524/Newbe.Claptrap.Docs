---
title: 'Paso 4 - Utilice esbirros para realizar pedidos de mercancías'
description: 'Paso 4 - Utilice esbirros para realizar pedidos de mercancías'
---

Con esta lectura, puedes empezar a hacer negocios con Claptrap.

<!-- more -->

## Un resumen de apertura

En este artículo, aprendí a usar Minion en un ejemplo de proyecto existente para completar el procesamiento empresarial asincrónico mediante la implementación de los requisitos de "pedir mercancías".

En primer lugar, eche un vistazo a los casos de uso empresarial involucrados en este article：

1. El usuario puede realizar un pedido, que se realizará utilizando todas las SKU en el carro de la compra actual para formar un pedido.
2. El inventario de la SKU correspondiente se deducirá después de realizar el pedido.Si una SKU está agotada, se produce un error en el pedido.
3. El pedido es solo hasta que la deducción de inventario se realice correctamente y los pasos siguientes no requieren el ámbito de esta discusión de ejemplo.Por lo tanto, después de que este ejemplo se coloca correctamente, se genera un registro de pedido en la base de datos para indicar el final de la creación de la orden.

Aunque este artículo se centra en el uso de Minion, requiere conocimiento de la anterior "Definición de Claptrap" debido a la necesidad de usar un nuevo objeto OrderGrain.

Minion es un Claptrap especial, y su relación con MasterClaptrap se muestra en el siguiente image：

![Súbdito](/images/20190228-002.gif)

Su principal proceso de desarrollo es similar al de Claptrap, con sólo unos pocos cortes.Compare el following：

| Pasos                                | Claptrap | Súbdito |
| ------------------------------------ | -------- | ------- |
| Definir ClaptrapTypeCode             | √        | √       |
| Definir estado                       | √        | √       |
| Definir la interfaz de grano         | √        | √       |
| Implementar grano                    | √        | √       |
| Regístrese en Grain                  | √        | √       |
| Definir EventCode                    | √        |         |
| Definir evento                       | √        |         |
| Implementar EventHandler             | √        | √       |
| Regístrese en EventHandler           | √        | √       |
| Implementar IInitialStateDataFactory | √        | √       |

La razón de esta reducción es que debido a que Minion es un consumidor de eventos para Claptrap, no es necesario controlar la definición de evento relacionado.Pero otras partes siguen siendo necesarias.

> Al principio de este artículo, ya no enumeraremos la ubicación específica del archivo del código relevante, con la esperanza de que los lectores puedan encontrar los suyos propios en el proyecto, con el fin de dominar.

## Implementar OrderGrain

Basándonos en los conocimientos relacionados con el anterior "Defining Claptrap", implementamos un OrderGrain aquí para representar la operación de orden.Para ahorrar espacio, enumeramos solo las partes clave del producto.

### OrderState

El estado de la orden se define：

```cs
uso de System.Collections.Generic;
usando Newbe.Claptrap;

espacio de nombres HelloClaptrap.Models.Order
á
    clase pública OrderState : IStateData
    á
        bool public OrderCreated á get; set; •
        cadena pública UserId - get; set; • diccionario público
<string, int> Skus ; set; •

?
```

1. OrderCreated indica si el pedido se ha creado y evita crear el orden repetidamente
2. UserId bajo el ID de usuario único
3. Los pedidos de Skus contienen SkuIds y cantidades de pedidos

### OrderCreatedEvent

El evento de creación de pedidos se define como follows：

```cs
uso de System.Collections.Generic;
usando Newbe.Claptrap;

espacio de nombres HelloClaptrap.Models.Order.Events
de
    clase pública OrderCreatedEvent : IEventData
    ,
        cadena pública UserId , Get; set; •
        diccionario público<string, int> Skus ; set; •

?
```

### OrderGrain

```cs
uso de System.Threading.Tasks;
uso de HelloClaptrap.Actors.Order.Events;
usa HelloClaptrap.IActor;
uso de HelloClaptrap.Models;
usa helloClaptrap.Models.Order;
uso de HelloClaptrap.Models.Order.Events;
usando Newbe.Claptrap;
usando Newbe.Claptrap.Orleans;
usando Orleans;

espacio de nombres HelloClaptrap.Actors.Order
á
    [ClaptrapEventHandler(typeof(OrderCreatedEventHandler), ClaptrapCodes.OrderCreated)]
    clase pública OrderGrain : ClaptrapBoxGrain<OrderState>, IOrderGrain

        privado readonly IGrainFactory _grainFactory;

        público OrderGrain(IClaptrapGrainCommonService claptrapGrainCommonService,
            IGrainFactory grainFactory)
            : base(claptrapGrainCommonService)

            _grainFactory a grainFactory;
        :

        tarea asincrónica pública CreateOrderAsync(CreateOrderInput input)

            var orderId - Claptrap.State.Identity.Id;
            // throw exception if order already created
            if (StateData.OrderCreated)
            -
                throw new BizException($"order with order id already created : {orderId}");
            :

            // obtener artículos del carrito
            var cartGrain á _grainFactory.GetGrain<ICartGrain>(entrada. CartId);
            var items á await cartGrain.GetItemsAsync();

            // inventario de actualización para cada
            de sku (var (skuId, count) en los elementos)

                var skuGrain - _grainFactory.GetGrain<ISkuGrain>(skuId);
                await skuGrain.UpdateInventoryAsync(-count);
            -

            // eliminar todos los elementos del carrito
            await cartGrain.RemoveAllItemsAsync();

            // crear una orden
            var evt - this. CreateEvent(new OrderCreatedEvent
            ?
                UserId - input. UserId,
                Skus - elementos
            ;
            await Claptrap.HandleEventAsync(evt);
        á

?
```

1. OrderGrain implementa la lógica principal de la creación de pedidos, donde el método CreateOrderAsync completa la adquisición de datos del carro de la compra y las acciones relacionadas con la deducción de inventario.
2. Los campos relevantes en State se actualizarán después de que orderCreatedEvent se haya ejecutado correctamente y ya no se enumeran aquí.

## Guarde los datos del pedido en la base de datos a través de Minion

Desde el principio de la serie hasta esto, nunca mencionamos las operaciones relacionadas con la base de datos.Porque cuando se usa el marco de trabajo de Claptrap, la gran mayoría de las operaciones se han reemplazado por "escribir en eventos" y "actualizaciones de estado", no es necesario escribir las operaciones de base de datos usted mismo.

Sin embargo, dado que Claptrap suele estar diseñado para un solo objeto (un pedido, una SKU, un carro de la compra), no es posible obtener todos los datos (todos los pedidos, todas las SKU, todos los carros de la compra).En este momento, debe conservar los datos de estado en otra estructura de persistencia (base de datos, archivo, caché, etc.) para completar consultas u otras operaciones para toda la situación.

El concepto de Minion se introdujo en el marco de Claptrap para abordar estos requisitos.

A continuación, presentamos un OrderDbGrain (un Minion) en el ejemplo para completar así asincrónicamente la operación de pedido de OrderGrain.

## Definir ClaptrapTypeCode

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
          cadena const pública SkuInventoryUpdate á "inventoryUpdate" + SkuEventSuffix;

          #endregion

          #region Order

          cadena const pública OrderGrain á "order_claptrap_newbe";
          cadena const privada OrderEventSuffix á "_e_" + OrderGrain;
          cadena const pública OrderCreated á "orderCreated" + OrderEventSuffix;

+ cadena const pública OrderDbGrain á "db_order_claptrap_newbe";

          #endregion

  ?
```

Minion es un Claptrap especial, en otras palabras, también es un Claptrap.ClaptrapTypeCode es necesario para Claptrap y debe agregarse a esta definición.

## Definir estado

Dado que este ejemplo solo necesita escribir un registro de pedido en la base de datos y no requiere ningún dato en State, este paso no es realmente necesario en este ejemplo.

## Definir la interfaz de grano

```cs
+ usando HelloClaptrap.Models;
+ usando Newbe.Claptrap;
+ usando Newbe.Claptrap.Orleans;
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
2. ClaptrapState se utiliza para marcar el tipo de datos State de Claptrap.En el paso anterior, hemos dejado claro que el Minion no necesita StateData, así que use NoneStateData en lugar del tipo integrado del marco de trabajo.
3. IClaptrapMinionGrain es la interfaz Minion que difiere de IClaptrapGrain.Si un Grano es Un esbirro, debe heredar la interfaz.
4. ClaptrapCodes.OrderGrain y ClaptrapCodes.OrderDbGrain son dos cadenas diferentes, y espero que el lector no sea un patrist interestelar.

> Star Master：Debido al ritmo rápido de la competición de StarCraft, la cantidad de información, los jugadores pueden ignorar o juzgar mal parte de la información, por lo que a menudo "los jugadores no ven los eventos clave que ocurren bajo la nariz" errores divertidos.Los jugadores bromean así de que los jugadores interestelares son ciegos (realmente hubo un duelo ciego y profesional), cuanto mayor era el segmento, más serios los jugadores interestelares profesionales ciegos son ciegos.

## Implementar grano

```cs
+ utilizando System.Collections.Generic;
+ mediante System.Threading.Tasks;
+ mediante HelloClaptrap.Actors.DbGrains.Order.Events;
+ usando HelloClaptrap.IActor;
+ usando HelloClaptrap.Models;
+ usando Newbe.Claptrap;
+ usando Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.Actors.DbGrains.Order
+ á
+ [ClaptrapEventHandler(typeof(OrderCreatedEventHandler), ClaptrapCodes.OrderCreated)]
+ clase pública OrderDbGrain : ClaptrapBoxGrain<NoneStateData>, IOrderDbGrain
+ á
+ public OrderDbGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
+ : base(claptrapGrainCommonService)
+ á
+ á
+
+ tarea asincrónica pública MasterEventReceivedAsync((public async Task MasterEventReceivedAsync((IEnumerable<IEvent> los eventos)
+ á
+ foreach (var @event en eventos)
+ á
+ await Claptrap.HandleEventAsync(@event);
+ á
+ á
+
+ tarea pública WakeAsync()
+ á
+ return Task.CompletedTask;
+ á
+ -
+ ?
```

1. MasterEventReceivedAsync es un método definido a partir de IClaptrapMinionGrain que significa recibir notificaciones de eventos de MasterClaptrap en tiempo real.No expanda la descripción aquí, simplemente siga la plantilla anterior.
2. WakeAsync es el método definido a partir de IClaptrapMinionGrain, que representa la activación activa de masterClaptrap de Minion.No expanda la descripción aquí, simplemente siga la plantilla anterior.
3. Cuando el lector ve el código fuente, encuentra que la clase se define por separado en un ensamblado.Este es sólo un método de clasificación que se puede entender como la clasificación de Minion y MasterClaptrap en dos proyectos diferentes.En realidad no hay problema en armarlo.

## Regístrese en Grain

Aquí, dado que definimos OrderDbGrain en un ensamblado independiente, se requiere un registro adicional para este ensamblado.Como follows：

```cs
  utilizando el sistema;
  usando Autofac;
  utilizando HelloClaptrap.Actors.Cart;
  utilizando HelloClaptrap.Actors.DbGrains.Order;
  usando HelloClaptrap.IActor;
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
          public static void Main(string[] args)

              ? GetCurrentClassLogger();
              probar
              registrador de
                  . Debug("init main");
                  CreateHostBuilder(args). Build(). Run();
              de

              catch (excepción de excepción)
                  //NLog: errores de configuración de captura
                  registrador. Error(excepción, "Programa detenido por excepción");
                  lanzamiento;

              finalmente
              -
                  // Asegúrese de vaciar y detener los temporizadores/hilos internos antes de la salida de la aplicación (Evitar error de segmentación en Linux)
                  NLog.LogManager.Shutdown();
              de



                  estático público IHostBuilder CreateHostBuilder(string[] args)>
              Host.CreateDefaultBuilder(args) . ConfigureWebHostDefaults(webBuilder á> webBuilder.UseStartup<Startup>(); )
                  . UseClaptrap( constructor de
                      á>
                      -
                          constructor
                              . ScanClaptrapDesigns(new[]
                              á
                                  typeof(ICartGrain). Ensamblaje,
                                  typeof(CartGrain). Assembly,
+ typeof(OrderDbGrain).
                              de
                              de ensamblaje . ConfigureClaptrapDesign(x á>
                                  x.ClaptrapOptions.EventCenterOptions.EventCenterType ? EventCenterType.OrleansClient);
                      , constructor de
                      , constructor de> , constructor. RegisterModule<RepositoryModule>(); )
                  . UseOrleansClaptrap()
                  . UseOrleans(builder á> builder. UseDashboard(opciones )> opciones. Puerto 9000))
                  . ConfigureLogging(logging ->
                  - registro
                      . ClearProviders(); registro
                      . SetMinimumLevel(LogLevel.Trace);
                  )
                  . UseNLog();
      de
  ?
```

## Implementar EventHandler

```cs
+ utilizando System.Threading.Tasks;
+ mediante HelloClaptrap.Models.Order.Events;
+ utilizando HelloClaptrap.Repository;
+ usando Newbe.Claptrap;
+ usando Newtonsoft.Json;
+
+ namespace HelloClaptrap.Actors.DbGrains.Order.Events
+ á
+ clase pública OrderCreatedEventHandler
+ : NormalEventHandler<NoneStateData, OrderCreatedEvent>
+ á
+ _orderRepository IOrderRepository privado;
+
+ public OrderCreatedEventHandler(
+ IOrderRepository orderRepository)
+ á
+ _orderRepository - orderRepository;
+ á
+
+ public override async ValueTask HandleEvent(NoneStateData stateData,
+ OrderCreatedEvent eventData,
+ IEventContext eventContext)
+ á
+ var orderId a eventContext.State.Identity.Id;
+ await _orderRepository.SaveAsync(eventData.UserId, orderId, JsonConvert.SerializeObject(eventData.Skus));
+ á
+ -
+ ?
```

1. IOrderRepository es una interfaz que funciona directamente en el nivel de almacenamiento para la adición y eliminación de pedidos.La interfaz se llama aquí para implementar la operación entrante de la base de datos de pedidos.

## Regístrese en EventHandler

De hecho, para ahorrar espacio, nos hemos registrado en el código para la sección "Implementar grano".

## Implementar IInitialStateDataFactory

Dado que StateData no tiene ninguna definición especial, no es necesario implementar IInitialStateDataFactory.

## Modificar controlador

En el ejemplo, agregamos OrderController para realizar pedidos y pedidos de consulta.Los lectores pueden verlo en el código fuente.

Los lectores pueden seguir los siguientes pasos para realizar una：

1. POST `/api/cart/123` ""skuId": "yueluo-666", "count":30" añadir 30 unidades de concentrado yueluo-666 al carro de la compra 123.
2. POST `/api/order` "userId": "999", "cartId": "123"" como 999 userId, desde el carro de la compra 123 para realizar un pedido.
3. Obtenga `` /api/order se puede ver a través de la API después de que el pedido se haya realizado correctamente.
4. GET `/api/sku/yueluo-666` la API de SKU puede ver el saldo de inventario después de que se haya pedido el pedido.

## Resumen

En este punto, hemos completado el "orden de productos básicos" este requisito del contenido básico.Este ejemplo le da un primer vistazo a cómo varios Claptraps pueden trabajar juntos y cómo usar Minion para realizar tareas asincrónicas.

Sin embargo, hay una serie de cuestiones que discutiremos más adelante.

Puede obtener el código fuente de este artículo en la siguiente address：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
