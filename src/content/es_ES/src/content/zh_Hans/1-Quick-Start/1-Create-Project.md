---
title: 'El primer paso - crear un proyecto e implementar un simple carrito de compras'
metaTitle: 'El primer paso - crear un proyecto e implementar un simple carrito de compras'
metaDescription: 'El primer paso - crear un proyecto e implementar un simple carrito de compras'
---

Vamos a implementar un simple requisito de "carro de comercio electrónico" para ver cómo desarrollar usando Newbe.Claptrap.

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

<!-- more -->

## Necesidades empresariales

Consiga un simple requisito de "carrito de compras de comercio electrónico", donde unos pocos negocios simples：

- Obtenga artículos y cantidades en su carrito de compras actual
- Añade artículos a tu carrito de compras
- Retire artículos específicos de su carrito de compras

## Instalar plantillas de proyecto

En primer lugar, debe asegurarse de que ha instalado el archivo . NETCore SDK 3.1.[Puede hacer clic aquí para obtener la última versión para la instalación](https://dotnet.microsoft.com/download)。

Una vez instalado el SDK, abra la consola y ejecute los siguientes comandos para instalar las plantillas de proyecto más recientes：

```bash
dotnet new - new installbe.Claptrap.Template
```

Una vez instalado, puede ver las plantillas de proyecto que ya se han instalado en los resultados de la instalación.

![Plantilla Newbe.claptrap instalada](/images/20200709-001.png)

## Crear un proyecto

Seleccione una ubicación para crear una carpeta y este ejemplo`D:\REpo`Crear un nombre llamado`HelloClaptrap`la carpeta del archivo .La carpeta se utilizará como una carpeta de código para nuevos proyectos.

Abra la consola y cambie el directorio de trabajo a`D:\Repo-HelloClaptrap`。A continuación, ejecute el siguiente comando para crear un proyecto：

```bash
dotnet newbe.claptrap - nombre HelloClaptrap
```

> En general, le recomendamos que.`D:\Repo.HelloClaptrap.`Cree una carpeta como un almacén de Git.Administre el código fuente con el control de versiones.

## Compilación y puesta en marcha

Una vez creado el proyecto, puede compilar la solución con su IDE favorito abierto.

Una vez compilados, inicie proyectos web y BackendServer con la característica de inicio en el IDE.(VS necesita iniciar la consola de servicio y, si usa IIS Express, necesita que el desarrollador examine el número de puerto correspondiente para tener acceso a la página web)

Una vez completado el inicio, puede`http://localhost:36525/swagger`Dirección para ver la descripción de la API del elemento de ejemplo.Esto incluye tres API principales：

- `Obtener` `/api/Cart/{id}` Obtener artículos y cantidades en un carrito de compras id específico
- `Exponer` `/api/Cart/{id}` Agregue un nuevo artículo a la compra del identificador especificado
- `Eliminar` `/api/Cart/{id}` Retire un artículo específico del carro de la compra del identificador especificado

Puede intentar realizar varias llamadas a la API a través del botón Try It Out de la interfaz.

> - [Cómo iniciar varios proyectos simultáneamente en VS](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Cómo iniciar varios proyectos en Rider al mismo tiempo](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Utilice Huawei Cloud para acelerar la velocidad de restauración de nuget](https://mirrors.huaweicloud.com/)

## Primero añadir producto, sin efecto?

Sí, tienes razón.Hay BUGS en la implementación de negocio en la plantilla de proyecto.

A continuación, abramos el proyecto y solucionemos y resuelvamos estos errores agregando algunos puntos de interrupción.

Y al localizar el BUG, puede comprender el proceso de flujo de código del marco de trabajo.

## Añadir puntos de interrupción

Lo siguiente necesita para aumentar la ubicación de los puntos de interrupción en función de las diferentes instrucciones IDE y puede elegir el IDE que está acostumbrado a operar.

Si actualmente no tiene un IDE a mano, también puede omitir esta sección y leer directamente lo que sigue.

### Visual Studio

Inicie ambos proyectos al mismo tiempo, como se mencionó anteriormente.

Importar puntos de interrupción：Abra la ventana Punto de interrupción, haga clic en el botón, seleccione debajo del elemento`puntos de interrupción.xml`Archivo.La ubicación de funcionamiento correspondiente se puede encontrar en las dos capturas de pantalla a continuación.

![Ventana Puntos de interrupción de Openpoints](/images/20200709-002.png)

![Importar puntos de interrupción](/images/20200709-003.png)

### Jinete

Inicie ambos proyectos al mismo tiempo, como se mencionó anteriormente.

Rider no tiene actualmente una función de importación de punto de interrupción.Por lo tanto, debe crear manualmente puntos de interrupción en las siguientes ubicaciones：

| Archivo                              | Línea No. |
| ------------------------------------ | --------- |
| CartController                       | 30        |
| CartController                       | 34        |
| CartGrain                            | 24        |
| CartGrain                            | 32        |
| Controlador de eventos AddItemToCart | 14        |
| Controlador de eventos AddItemToCart | 28        |

> [Ir a archivo le permite localizar rápidamente dónde se encuentran sus archivos](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## Iniciar depuración

A continuación, aceptamos una solicitud para ver cómo se ejecuta todo el código.

En primer lugar, vamos a enviar una solicitud POST a través de la interfaz swagger e intente agregar artículos al carro de la compra.

### Inicio de CartController

La primera línea de vida es el código del controlador para la capa Web API：

```cs
(HttpPost){id}")]
tarea asincrónica pública<IActionResult> AddItemAsync (int id, [FromBody] Entrada de entrada AddItem)
{
    var cartgrain s _grainFactory.GetGrain<ICartGrain>(id. ToString ();
    Var items s await cartgrain.AddItemAsync (entrada. SkuId, entrada. Contar);
    devolver Json (elementos);
}
```

En este código, pasamos`_grainFactory`para crear una`ICartGrain`Ejemplo.

Esta instancia es esencialmente un proxy que apunta a un grano específico en el servidor back-end.

El identificador entrante se puede considerar un identificador único para la instancia de ubicación.En este contexto empresarial, se puede entender como "id de carro" o "id de usuario" (si cada usuario tiene un solo carro de la compra).

Continúe con la depuración y pase al siguiente paso, veamos cómo funciona el interior de ICartGrain.

### CartGrain Start

El siguiente punto de parada es el código CartGrain.：

```cs
tarea asincrónica pública<Dictionary<string, int>> AddItemAsync (string skuId, int count)
{
    var evt s.this. CreateEvent (nuevo AddItem ToCartEvent)
    {
        Count - Conde,
        SkuId skuId,
    });
    await Claptrap.HandleEventAsync (evt);
    Devolver StateData.Items;
}
```

Aquí está el núcleo de la implementación del marco de trabajo, como se muestra en la siguiente imagen.：

![Claptrap](/images/20190228-001.gif)

En concreto, el código se ha ejecutado en un objeto de carrito de compras específico.

Puede ver a través del depurador que el skuId entrante y count son parámetros pasados desde Controller.

Aquí puedes hacer estas cosas.：

- Modifique los datos en Claptrap con eventos
- Leer los datos guardados en Claptrap

En este código, creamos uno.`Evento AddItemToCart.`Objeto para representar un cambio en el carro de la compra.

A continuación, se pasa a Claptrap para su procesamiento.

Claptrap actualiza sus datos de estado después de aceptar el evento.

Por último, devolvemos StateData.Items al autor de la llamada.(En realidad, StateData.Items es una propiedad rápida para Claptrap.State.Data.Items.)Así que en realidad todavía se lee de Claptrap. )

En el depurador, puede ver que los tipos de datos de StateData se muestran a continuación.：

```cs
clase pública CartState : IStateData
{
    diccionario público<string, int> Artículos . . . get; set; . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
}
```

Este es el estado del carro de la compra diseñado en la muestra.Usamos uno.`Diccionario.`para representar el SkuId en el carro de la compra actual y su cantidad correspondiente.

Continúe con la depuración y pase al siguiente paso para ver cómo Claptrap controla los eventos entrantes.

### Inicio del controlador de eventos AddItemToCart

Una vez más, el punto de interrupción es este código a continuación.：

```cs
clase pública AddItemCartEvent Handler
    : Controlador NormalEvent<CartState, AddItemToCartEvent>
{
    invalidación pública ValueTask HandleEvent (CartState StateData, AddItemToCartEvent EventData,
        IEventContext EventContext)
    {
        Var elementos . . . stateData.Items ? nuevo Diccionario<string, int>();
        si (artículos. TryGetValue (eventData.SkuId, out var itemCount))
        {
            itemCount s eventData.count;
        }
        Más
        // {
        itemCount - eventData.Count;
        // }

        Artículos[eventData.SkuId] s itemCount;
        StateData.Items . . .
        devolver new ValueTask();
    }
}
```

Este código contiene dos parámetros importantes que representan el estado actual del carro de la compra.`CartState.`y eventos que necesitan ser manejados.`Evento AddItemToCart.`。

Determinamos si el diccionario en el estado contiene El monte mar SkuId según las necesidades del negocio y actualizamos su número.

Continúe la depuración y el código se ejecutará hasta el final de este código.

En este punto, a través del depurador, puede ver que el stateData.Items diccionario ha aumentado en uno, pero el número es 0.La razón es en realidad debido al fragmento de otro tipo anterior, que es la causa del BUG que siempre no puede agregar un carro de la compra por primera vez.

Aquí, no interrumpa la depuración inmediatamente.Sigamos adelante y dejemos que el código pase para ver cómo termina todo el proceso.

De hecho, continuando la depuración, el punto de interrupción llega al final de los métodos cartGrain y CartController a su vez.

## ¡Esta es en realidad una arquitectura de tres niveles!

La gran mayoría de los desarrolladores entienden la arquitectura de tres niveles.De hecho, también podemos decir que Newbe. Claptrap es en realidad una arquitectura de tres niveles.Vamos a compararlo en una tabla.：

| Tradicional de tres niveles          | Newbe.Claptrap       | Descripción                                                                                                                                      |
| ------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Capa de presentación de presentación | Capa del controlador | Se utiliza para acoplar sistemas externos para proporcionar interoperabilidad externa                                                            |
| Nivel de negocio empresarial         | Capa de grano        | Procesamiento del negocio basado en los parámetros del negocio entrantes (muestra no escribe realmente el juicio, necesita juzgar el conteo > 0) |
| Capa de persistencia de persistencia | Capa EventHandler    | Actualizar los resultados empresariales                                                                                                          |

Por supuesto, la analogía anterior es una descripción simple.En el proceso específico, no hay necesidad de estar demasiado enredado, esto es sólo una comprensión auxiliar de la declaración.

## También tiene un BUG para arreglar

Luego volvemos y solucionamos el anterior problema "First Join Products Don't Take Effect".

### Este es un marco para considerar las pruebas unitarias

Hay un proyecto en la plantilla de proyecto.`HelloClaptrap.Actors.Tests.`El proyecto contiene pruebas unitarias del código de negocio principal.

Ahora sabemos que`Controlador de eventos AddItem ToCart.`El código de los comentarios es la causa principal del BUG.

Podemos usarlo.`prueba de dotnet.`Si ejecuta las pruebas unitarias en el proyecto de prueba, obtendrá dos errores:

```bash
Un total de 1 archivos de prueba coincidieron con el patrón syd dh'fydd.
  X AddFirstOne [130ms]
  Mensaje de error:
   D'Value para ser 10, pero encontró 0.
  Rastreo de pila:
     en FluentS. Execution.LateTestBoundFramework.Throw (Mensaje de cadena)
   en FluentS. Execution.TestFramework Provider.T. Throw
   en FluentS. Execution.DefaultKStrategy.HandleFailure (Mensaje de cadena)
   En FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   En FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   en FluentS. Execution.Ax. Scope.FailWith (mensaje de cadena, Object?args)
   en FluentS.Numeric.NumericS'1.Be (T expected, String because, Object' becauseArgs)
   En HelloClaptrap.Actors.Tests.Cart.Events.AddItemCartEventHandler.AddFirstOne() en D:\Repo?HelloClaptrap?HelloClaptrap?HelloClaptrap.Actors.Tests?Cart?Events?AddToCartEventHandlerTest.cs: línea 32
   En HelloClaptrap.Actors.Tests.Cart.Events.AddItemCartEventHandler.AddFirstOne() en D:\Repo?HelloClaptrap?HelloClaptrap?HelloClaptrap.Actors.Tests?Cart?Events?AddToCartEventHandlerTest.cs: línea 32
   en NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter'1.GetResult ()
   en NUnit.Framework.Internal.AsyncToSyncAdapter.Await (Func'1 Invoke)
   en NUnit.Framework.Internal.Commands.TestMethodCommand.RunTestMethod (TestExecution Context)
   en NUnit.Framework.Internal.Commands.TestMethod Command.Execute (TestExecution Context)
   en NUnit.Framework.Internal.Execution SimpleWorkItem.PerformWork()

  X RemoveOne [2ms]
  Mensaje de error:
   D'Value para ser 90, pero encontró 100.
  Rastreo de pila:
     en FluentS. Execution.LateTestBoundFramework.Throw (Mensaje de cadena)
   en FluentS. Execution.TestFramework Provider.T. Throw
   en FluentS. Execution.DefaultKStrategy.HandleFailure (Mensaje de cadena)
   En FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   En FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   en FluentS. Execution.Ax. Scope.FailWith (mensaje de cadena, Object?args)
   en FluentS.Numeric.NumericS'1.Be (T expected, String because, Object' becauseArgs)
   En HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemCartEventHandlerHandler.RemoveOne() en D:\Repo?HelloClaptrap?HelloClap.Actors.Tests?Cart?Eventos\RMoveItem From CartEvent HandlerTest.cs: línea 40
   En HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemCartEventHandlerHandler.RemoveOne() en D:\Repo?HelloClaptrap?HelloClap.Actors.Tests?Cart?Eventos\RMoveItem From CartEvent HandlerTest.cs: línea 40
   en NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter'1.GetResult ()
   en NUnit.Framework.Internal.AsyncToSyncAdapter.Await (Func'1 Invoke)
   en NUnit.Framework.Internal.Commands.TestMethodCommand.RunTestMethod (TestExecution Context)
   en NUnit.Framework.Internal.Commands.TestMethod Command.Execute (TestExecution Context)
   en NUnit.Framework.Internal.Execution SimpleWorkItem.PerformWork()


Error en la ejecución de la prueba.
Total de pruebas: 7
     Aprobado: 5
     Error: 2

```

Echemos un vistazo al código de una de las pruebas unitarias defectuosas.：

```cs
[Test]
tarea asincrónica pública AddFirstOne ()
{
    usando var mocker - AutoMock.GetStrict ();

    await use var handler s-mocker. Crear<AddItemToCartEventHandler>();
    var state s new CartState ();
    var evt s nuevo AddItemToCartEventEvent
    {
        SkuId skuId1,
        Recuento s 10
    };
    esperar manejador. HandleEvent (state, evt, default);

    Estado. Items.Count.Down.) Ser (1);
    var (clave, valor) s estado. Items.Single();
    Clave. "Qué") Ser (evt. SkuId);
    Valor. "Qué") Ser (evt. Contar);
}
```

`Controlador de eventos AddItem ToCart.`es el componente de prueba principal de esta prueba, y dado que stateData y event se compilan manualmente, es fácil para los desarrolladores crear escenarios que deben probarse según sea necesario.No hay necesidad de construir nada especial.

Ahora, mientras sea.`Controlador de eventos AddItem ToCart.`Restaure el código comentado y vuelva a ejecutar la prueba unitaria.Pasan las pruebas unitarias.LOS ERRORES TAMBIÉN SE CORRIGEN DE FORMA NATURAL.

Por supuesto, hay otra prueba unitaria del escenario de eliminación anterior que falla.Los desarrolladores pueden solucionar este problema siguiendo las ideas de "punto de interrupción" y "prueba unitaria" descritas anteriormente.

## Los datos se han conservado.

Puede intentar reiniciar el servidor back-end y la Web, y verá que los datos en los que trabajó antes se han conservado.

Lo cubriremos más adelante en un capítulo posterior.

## Resumen

A través de este artículo, tenemos una comprensión preliminar de cómo crear un marco de proyecto básico para implementar un escenario de carrito de compras simple.

Hay muchas cosas que no tenemos que explicar en detalle.：Estructura del proyecto, implementación, persistencia y mucho más.Puede leer más para obtener más información.
