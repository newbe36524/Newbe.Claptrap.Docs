---
title: "Paso 3 - Entender la estructura del proyecto"
description: "Paso 3 - Entender la estructura del proyecto"
---

Junto al [Paso 2 - Crear](01-3-Basic-Flow.md) de proyecto, echemos un vistazo a la estructura del proyecto creada con la plantilla de proyecto Newbe.Claptrap.

<!-- more -->

## La estructura de la solución

Use Visual Studio o Rider para abrir una solución en la raíz del`helloClaptrap .sln`.

La solución contiene varias carpetas de soluciones, cada una de las cuales es como follows：

| La carpeta de soluciones | Descripción                                                                                                                                                                                                                                                                |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0_Infrastructure         | Infraestructura.Aquí puede colocar algunos modelos de uso común, bibliotecas de clases comunes, etc.Por lo general, se hace referencia a ellos por varios otros proyectos                                                                                                  |
| 1_Business               | Lógica de negocios.Aquí puede colocar algunas bibliotecas de clases principales relacionadas con las empresas.Por ejemplo, niveles de almacenamiento, niveles de negocio, etc.En particular, las implementaciones específicas de Actor generalmente se pueden colocar aquí |
| 2_Application            | Aplicación.Aquí puede colocar aplicaciones en ejecución que pueden incluir algunos WebApi, servicios Grpc, procesos de ejecución de actor, etc.                                                                                                                            |
| SolutionItems            | Algunos archivos de nivel de solución, como nuget.config, tye.yml, Directory.Build.props, etc.                                                                                                                                                                             |

Estas son sólo las estructuras de solución más simples incluidas en la demostración del proyecto.En el desarrollo real, a menudo necesita unirse, interfaces de almacén, pruebas unitarias, servicios de back-office y otro contenido.Los desarrolladores pueden colocarlos de acuerdo con las reglas del equipo.

## Obtén información sobre cómo llamar enlaces

Ahora, entiendo el proceso de ejecutar Newbe.Claptrap con un simple enlace de llamada.

Echemos un vistazo a la `llamada GET/AuctionItems/{itemId}`el proceso.

### Capa api

Cuando se llama a la API, la primera entrada natural es el controlador de``.Entre las plantillas de proyecto correspondientes se encuentra`AuctionItemsController`en el proyecto`HelloClaptrap.WebApi`y se：las secciones siguientes relacionadas con esta API.

```cs AuctionItemsController.cs
utilizando System.Threading.Tasks;
usando Dapr.Actors;
usando Dapr.Actors.Client;
usando HelloClaptrap.IActor;
usando HelloClaptrap.Models;
usar Microsoft.AspNetCore.Mvc;
usando Newbe.Claptrap;
usando Newbe.Claptrap.Dapr;

espacio de nombres HelloClaptrap.WebApi.Controllers
{
    [ApiController]
    [Route("[controller]")]
    clase pública AuctionItemsController : ControllerBase
    {
        _actorProxyFactory privada de IActorProxyFactory;

        público AuctionItemsController(
            IActorProxyFactory actorProxyFactory)
        {
            _actorProxyFactory = actorProxyFactory;
        }

        [HttpGet("{itemId}/status")]
        tarea asincrónica pública<IActionResult> GetStatus(int itemId = 1)
        {
            var id = new ClaptrapIdentity(itemId.ToString(),
                ClaptrapCodes.AuctionItemActor);
            var auctionItemActor = _actorProxyFactory.GetClaptrap<IAuctionItemActor>(id);
            estado var = await auctionItemActor.GetStatusAsync();
            resultado var = nuevo
            {
                status
            };
            devolver Ok(result);
        }
    }
}
```

Este código indica que：

1. `GetStatus`creado por primera vez``ClaptrapIdentity, que es elde identidad Claptrap

, que se utiliza para localizar una`específica claptrap`
   
   2 A continuación, llame a`_actorProxyFactory`para obtener el proxy de un actor.Esto es implementado por una interfaz proporcionada por Dapr.
3 Llame algetstatusasync`para el agente de`auctionItemActor creado`, para que pueda llamar al método de la instancia de Claptrap correspondiente.
Los resultados devueltos de Claptrap se ajustan y devuelven como resultados de la API.


<p spaces-before="0">Esta es una representación simple de la API layer：método que llama actor mediante la creación de un actor proxy.La capa API es en realidad la capa de entrada del sistema.Puede exponer la API de una manera más que inquieta.Es perfectamente posible usar Grpc o algo más.</p>

<h3 spaces-before="0">Capa claptrap</h3>

<p spaces-before="0">está en el corazón de la escritura de código de negocio, que, al igual que controller en MVC, sirve para el propósito principal del control de lógica de negocios.</p>

<p spaces-before="0">A continuación, veamos cómo funciona la capa Claptrap de maneras de solo lectura y solo escritura.</p>

<h4 spaces-before="0">Operaciones de solo lectura de la capa Claptrap</h4>

<p spaces-before="0">Echemos un vistazo a cómo funciona la capa Claptrap.Con la característica Buscar implementación del IDE, encontrará<code>`AuctionItemActor para la clase de implementación para el proyecto</code>IAuctionItemActor de`en el proyecto``HelloClaptrap.Actors, y aquí están algunas de las secciones relacionadas con la GetStatus Async`method：</p> 
  

```cs AuctionItemActor.cs
utilizando System.Linq;
uso de System.Threading.Tasks;
utilizando Dapr.Actors.Runtime;
usando HelloClaptrap.Actors.AuctionItem.Events;
usando HelloClaptrap.IActor;
usando HelloClaptrap.Models;
usando HelloClaptrap.Models.AuctionItem;
usando HelloClaptrap.Models.AuctionItem.Events;
usando Newbe.Claptrap;
usando Newbe.Claptrap.Dapr;

espacio de nombres HelloClaptrap.Actors.AuctionItem
{
    [Actor(TypeName = ClaptrapCodes.AuctionItemActor)]
    [ClaptrapStateInitialFactoryHandler(type typeof(AuctionItemActorInitialStateDataFactory))]
    [ClaptrapEventHandler(typeof(NewBidderEventHandler), ClaptrapCodes.NewBidderEvent)]
    clase pública AuctionItemActor : ClaptrapBoxActor<AuctionItemState>, IAuctionItemActor
    {
        _clock IClock privado;

        público AuctionItemActor(
            ActorHost actorHost,
            IClaptrapActorCommonService claptrapActorCommonService,
            reloj IClock) : base(actorHost, claptrapActorCommonService)
        {
            _clock = reloj;
        }

        tarea pública<AuctionItemStatus> GetStatusAsync()
        {
            devolver Task.FromResult(GetStatusCore());
        }

        privado AuctionItemStatus GetStatusCore()
        {
            var ahora = _clock. UtcNow;
            si (ahora < StateData.StartTime)
            {
                devolver AuctionItemStatus.Planned;
            }

            si (ahora > StateData.StartTime && ahora < StateData.EndTime)
            {
                devolver AuctionItemStatus.OnSell;
            }

            devolver StateData.BiddingRecords?. Any() == true ? AuctionItemStatus.Sold : AuctionItemStatus.UnSold;
        }
    }
}
```


Este código indica que：

1. ` <code>` de atributos se marcan en el auctionItemActor, que proporcionan `un` s basi importante para el análisis del sistema `componentes` Claptrap.Las características se explicarán con más detalle en artículos posteriores.
2. `El AuctionItemActor` heredó `<AuctionItemState>`ClaptrapBoxActor.Heredar esta clase también agrega compatibilidad `` abastecimiento de eventos a la aplicación del actor.
3. `constructor de` De ThemActor presentó el ActorHost `y <code>IClaptrapActorCommonService`.Donde `ActorHost` es un parámetro proporcionado por el SDK de Dapr que representa información básica como el identificador y el tipo del actor actual. `IClaptrapActorCommonService` es la interfaz de servicio proporcionada por el marco de Claptrap y todo el comportamiento de Claptrap se implementa cambiando los tipos relevantes de la interfaz.
4. `GetStatusAsync` leer datos directamente desde State en Claptrap.Debido al mecanismo de abastecimiento de eventos, los desarrolladores siempre pueden pensar que State en Claptrap siempre está en el estado correcto, actualizado y disponible.Siempre puede confiar en los datos de Estado en Claptrap, sin pensar en cómo interactúa con la capa de persistencia.


#### Claptrap capa escribe

Las operaciones de solo lectura de Claptrap son operaciones que llaman a Actor sin un cambio en el estado Claptrap.La escritura vale la pena que actor modifique el estado de Claptrap.Debido al mecanismo de trazabilidad de eventos, para modificar el estado de Claptrap, debe modificarlo a través de eventos.Puede `el` estatal de Claptrap mediante el método TryBidding para aprender a generar una event：



```cs AuctionItemActor.cs
utilizando System.Linq;
uso de System.Threading.Tasks;
utilizando Dapr.Actors.Runtime;
usando HelloClaptrap.Actors.AuctionItem.Events;
usando HelloClaptrap.IActor;
usando HelloClaptrap.Models;
usando HelloClaptrap.Models.AuctionItem;
usando HelloClaptrap.Models.AuctionItem.Events;
usando Newbe.Claptrap;
usando Newbe.Claptrap.Dapr;

espacio de nombres HelloClaptrap.Actors.AuctionItem
{
    [Actor(TypeName = ClaptrapCodes.AuctionItemActor)]
    [ClaptrapStateInitialFactoryHandler(type typeof(AuctionItemActorInitialStateDataFactory))]
    [ClaptrapEventHandler(typeof(NewBidderEventHandler), ClaptrapCodes.NewBidderEvent)]
    clase pública AuctionItemActor : ClaptrapBoxActor<AuctionItemState>, IAuctionItemActor
    {
        _clock IClock privado;

        público AuctionItemActor(
            ActorHost actorHost,
            IClaptrapActorCommonService claptrapActorCommonService,
            reloj IClock) : base(actorHost, claptrapActorCommonService)
        {
            _clock = reloj;
        }

        tarea pública<TryBiddingResult> TryBidding(entrada TryBiddingInput)
        {
            estado var = GetStatusCore();

            si (status != AuctionItemStatus.OnSell)
            {
                devolver Task.FromResult(CreateResult(false));
            }

            si (entrada. Precio <= GetTopPrice())
            {
                devolver Task.FromResult(CreateResult(false));
            }

            devolver HandleCoreAsync();

            tarea asincrónica<TryBiddingResult> HandleCoreAsync()
            {
                var dataEvent = this. CreateEvent(new NewBidderEvent
                {
                    Price = entrada. Precio,
                    UserId = entrada. UserId
                });
                esperar Claptrap.HandleEventAsync(dataEvent);
                devolver CreateResult(true);
            }

            TryBiddingResult CreateResult(bool success)
            {
                devolver new()
                {
                    Success = success,
                    NowPrice = GetTopPrice(),
                    UserId = input. UserId,
                    AuctionItemStatus = estado
                };
            }

            decimal GetTopPrice()
            {
                devolver StateData.BiddingRecords?. Any() == ¿verdadero
                    ? StateData.BiddingRecords.First().
                    clave : StateData.BasePrice;
            }
        }
    }
}
```


Este código indica que：

1. Los datos se pueden validar a través del estado de Claptrap antes de generar eventos para determinar si se debe generar el siguiente evento.Esto es necesario porque mantiene fuera eventos innecesarios.Es necesario en términos de lógica operativa, espacio de persistencia o eficiencia de ejecución.
2. Una vez realizada la verificación necesaria, puede `esto. CreateEvent` para crear un evento.Este es un método de extensión que compila parte de la información subyacente sobre Event.Los desarrolladores solo deben preocuparse por la sección de datos empresariales personalizados.Para `NewBidderEvent` son los datos empresariales que los desarrolladores deben preocuparse.
3. Una vez completada la creación del evento, puede guardar y ejecutar la `handleEventAsync` el objeto Claptrap.En este método Claptrap conservará el evento y llamará a Handler para actualizar el estado de Claptrap.A continuación se describe cómo escribir Handler
4. Después de llamar a `HandleEventAsync` , si no hay errores, el evento se ha conservado correctamente.Y se puede pensar que el Estado en Claptrap se ha actualizado correctamente.Por lo tanto, los datos más recientes ahora se pueden leer desde Estado y devolverse al llamador.


### Capa de manipulador

La capa Handler es responsable de ejecutar la lógica de negocios del evento y actualizar los datos a State.Porque event y state son objetos en la memoria, por lo tanto.La implementación de código del controlador suele ser muy sencilla.Aquí está el controlador `desencadenado cuando se desencadena el` NewBidderEvent.



```cs NewBidderEventHandler.cs
utilizando System.Threading.Tasks;
usando HelloClaptrap.Models.AuctionItem;
usando HelloClaptrap.Models.AuctionItem.Events;
usando Newbe.Claptrap;

espacio de nombres HelloClaptrap.Actors.AuctionItem.Events
{
    clase pública NewBidderEventHandler
        : NormalEventHandler<AuctionItemState, NewBidderEvent>
    {
        _clock IClock privado;

        público NewBidderEventHandler(
            reloj IClock)
        {
            _clock = reloj;
        }

        invalidación pública ValueTask HandleEvent(AuctionItemState stateData,
            evento NewBidderEventData,
            IEventContext eventContext)
        {
            if (stateData.BiddingRecords == null)
            {
                stateData.InitBiddingRecords();
            }

            var records = stateData.BiddingRecords;

            registros. Add(eventData.Price, nuevo
            de BiddingRecord {
                Price = eventData.Price,
                BiddingTime = _clock. UtcNow,
                UserId = eventData.UserId
            });
            stateData.BiddingRecords = registros;
            devolver ValueTask.CompletedTask;
        }
    }
}
```


Este código indica que：

1. `NewBidderEventHandler` heredado `NormalEventHandler` como la clase base, que se agregó principalmente para simplificar las implementaciones de controladores.Sus parámetros genéricos son el tipo de estado correspondiente a Claptrap y el tipo EventData para Event.
2. Handler implementa el método HandleEvent `heredado del` normaleventhandler `la clase` .El propósito principal de este método es actualizar State.
Además del código obvio anterior, hay algunos mecanismos operativos importantes para Handler que deben explicarse here：

1. Handler requiere que se use una etiqueta en el tipo actor correspondiente.Este es `rol desempeñado por Claptrap Event Handler, ClaptrapCodes.NewBidderEvent` en AuctionItemActor.
2. Handler implementa `IDispose` y `interfaces de` IAsyncDispose.Esto indica que Handler se creará a petición al controlar eventos.Puede consultar las instrucciones de El ciclo de vida de los objetos en el sistema CLAPTRAP de TODO.
3. Debido al mecanismo de abastecimiento de eventos, los desarrolladores deben tener en cuenta la idempotenteness de `lógica en el método handleEvent` al escribir Handler.En otras palabras, debe asegurarse de que los mismos parámetros `handleEvent` el método handleEvent y obtener exactamente los mismos resultados.De lo contrario, pueden producirse resultados inesperados cuando se realiza un seguimiento de la práctica.Puede consultar las instrucciones de CÓMO funcionan todos los eventos y estados de TODO.
Con la capa Handler, puede actualizar State a través de eventos.



## Resumen

En este artículo, cubrimos los principales niveles de estructura del proyecto y los componentes clave del proyecto Claptrap.Al comprender estos componentes, los desarrolladores han podido comprender cómo exponer API, generar eventos y actualizar el estado.Este es también el paso más simple necesario para usar Claptrap.

A continuación, te mostraremos cómo usar Minion.

<!-- md Footer-Newbe-Claptrap.md -->
