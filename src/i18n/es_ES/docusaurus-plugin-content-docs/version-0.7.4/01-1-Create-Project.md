---
title: 'El primer paso es crear un proyecto e implementar un simple carrito de compras'
description: 'El primer paso es crear un proyecto e implementar un simple carrito de compras'
---

Vamos a implementar un simple requisito de "carrito de compras de comercio electrónico" para entender cómo desarrollar usando Newbe.Claptrap.

<!-- more -->

:::caution 该文档仅适用于 0.7 及以下版本，若想要查看最新版本内容，请点击右上角进行切换。 :::

## Requisitos empresariales

Consiga un simple requisito de "carrito de compras de comercio electrónico", aquí para lograr unas pocas：de negocios simples

- Obtener los artículos y cantidades en el carro de la compra actual
- Añade artículos a tu carrito de compras
- Retire un artículo específico de su carrito de compras

## Instale la plantilla de proyecto

En primer lugar, debe asegurarse de que el archivo . SDK de NetCore 3.1 。[puede hacer clic aquí para ver la última versión del](https://dotnet.microsoft.com/download)de instalación.

Una vez instalado el SDK, abra la consola y ejecute los siguientes comandos para instalar el proyecto más reciente template：

```bash
dotnet new --install Newbe.Claptrap.Template
```

Una vez instalado, puede ver las plantillas de proyecto que se han instalado en los resultados de la instalación.

![newbe.claptrap.template instalado](/images/20200709-001.png)

## Crear un proyecto

Seleccione una ubicación, cree una carpeta y en este ejemplo se elija crear una carpeta denominada``HelloClaptrap en`D:\Repo`.La carpeta actuará como la carpeta de código para el nuevo proyecto.

Abra la consola y cambie el directorio de trabajo a`D:\R`epo/HelloClaptrap.A continuación, puede crear un entorno de proyecto ejecutando las siguientes commands：

```bash
dotnet newbe.claptrap --name HelloClaptrap
```

> En general, se recomienda`D:\R`epo.helloClaptrap como una carpeta de almacén de Git.Administre el código fuente a través del control de versiones.

## Compilación y puesta en marcha

Una vez creado el proyecto, puede abrir la solución con su IDE preferido para compilarlo.

Una vez completada la compilación, inicie los proyectos web y BackendServer con la característica de inicio en el IDE.(VS necesita iniciar el servicio como una consola y, si usa IIS Express, necesita que el desarrollador examine el número de puerto correspondiente para tener acceso a la página Web)

Una vez iniciado, puede ver`http://localhost:36525/swagger`descripción del proyecto de ejemplo mediante la dirección.Esto incluye tres：API principales

- `GET` `/api/Cart/{id}` para obtener los artículos y las cantidades en un carrito de identificación en particular
- `registrar` `/api/cart/{id}` para agregar nuevos artículos a la compra del identificador especificado
- `eliminar` `/api/cart/{id}` eliminar un artículo específico del carro de la compra del id especificado

Puede intentar realizar varias llamadas a la API mediante el botón Try It Out de la interfaz.

> - [Cómo iniciar varios proyectos al mismo tiempo en VS](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Cómo iniciar varios proyectos en Rider al mismo tiempo](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Utilice Huawei Cloud para acelerar la velocidad de restauración de nuget](https://mirrors.huaweicloud.com/)

## La primera vez que agregas un elemento, ¿no funciona?

Sí, tienes razón.La implementación empresarial en la plantilla de proyecto se basa en errores.

Abramos el proyecto y solucionemos problemas y resuelvamos estos BUGes agregando algunos puntos de interrupción.

Y al posicionar los BUG, puede comprender el proceso de flujo de código del marco de trabajo.

## Añadir un punto de interrupción

Lo siguiente se basa en diferentes instrucciones IDE para aumentar la posición del punto de interrupción, puede elegir el IDE habitual para hacer.

Si actualmente no tiene un IDE a mano, puede omitir esta sección y leer lo siguiente directamente.

### Visual Studio

Inicie ambos proyectos al mismo tiempo, como se mencionó anteriormente.

Importar punto de interrupción：abrir la ventana Punto de interrupción, haga clic en el botón y seleccione los puntos de interrupción`.xml`elemento.La ubicación correspondiente se puede encontrar en las siguientes dos capturas de pantalla.

![Abrir ventana de puntos de interrupción](/images/20200709-002.png)

![Importar puntos de interrupción](/images/20200709-003.png)

### Jinete

Inicie ambos proyectos al mismo tiempo, como se mencionó anteriormente.

Rider no tiene actualmente una entidad de importación de punto de interrupción.Por lo tanto, debe crear manualmente puntos de interrupción en los siguientes：

| Archivo                   | El número de línea |
| ------------------------- | ------------------ |
| CartController            | 30                 |
| CartController            | 34                 |
| CartGrain                 | 24                 |
| CartGrain                 | 32                 |
| AddItemToCartEventHandler | 14                 |
| AddItemToCartEventHandler | 28                 |

> [Ir a archivo le ayuda a localizar rápidamente dónde están sus archivos](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## Iniciar depuración

A continuación, echemos un vistazo a todo el código ejecutado a través de una solicitud.

En primer lugar, vamos a enviar una solicitud POST a través de la interfaz swagger e intentar agregar artículos al carro de la compra.

### Inicio de CartController

El primer punto de interrupción fatal es el código Controller en la API web：

```cs
[HttpPost("{id}")]
public async Task<IActionResult> AddItemAsync(int id, [FromBody] AddItemInput input)
{
    var cartGrain = _grainFactory.GetGrain<ICartGrain>(id.ToString());
    var items = await cartGrain.AddItemAsync(input.SkuId, input.Count);
    return Json(items);
}
```

En este código, usamos la`_grainFactory`para crear una instancia`de la instancia de`ICartGrain.

Esta instancia es esencialmente un proxy que apunta a un grano específico en el servidor back-end.

Un identificador entrante se puede considerar como la localización de una instancia mediante un identificador único.En este contexto empresarial, se puede entender como "id de carrito de compras" o "id de usuario" (si cada usuario tiene un solo carro de la compra).

Continuando con la depuración y pasando al siguiente paso, echemos un vistazo a cómo funciona ICartGrain en el interior.

### CartGrain Start

El siguiente es el código CartGrain：

```cs
public async Task<Dictionary<string, int>> AddItemAsync(string skuId, int count)
{
    var evt = this.CreateEvent(new AddItemToCartEvent
    {
        Count = count,
        SkuId = skuId,
    });
    await Claptrap.HandleEventAsync(evt);
    return StateData.Items;
}
```

Este es el núcleo de la implementación del marco de trabajo y los elementos clave que se muestran en la siguiente：

![Claptrap](/images/20190228-001.gif)

En concreto, el código se ha ejecutado en un objeto de carrito de compras específico.

Puede ver a través del depurador que el skuId entrante y count son parámetros pasados desde Controller.

Aquí puedes hacer el following：

- Los datos de Claptrap se modifican mediante un evento
- Lea los datos guardados en Claptrap

En este código, creamos un`addItemToCartEvent`objeto para representar un cambio en el carro de la compra.

A continuación, se pasa a Claptrap para su procesamiento.

Claptrap actualiza sus datos de estado después de aceptar el evento.

Por último, devolvemos StateData.Items al autor de la llamada.(StateData.Items es en realidad una propiedad de acceso directo de Claptrap.State.Data.Items.)Así que en realidad se lee de Claptrap. ）

Con el depurador, puede ver que el tipo de datos de StateData tiene el aspecto：

```cs
public class CartState : IStateData
{
    public Dictionary<string, int> Items { get; set; }
}
```

Este es el estado del carro de la compra diseñado en la muestra.Vamos a usar un`Dictionary`para representar el SkuId en el carro de la compra actual y el número al que corresponde.

Continúe la depuración y pase al siguiente paso y veamos cómo Claptrap controla los eventos entrantes.

### Inicio de AddItemToCartEventHandler

Una vez más, el código siguiente es el：

```cs
public class AddItemToCartEventHandler
    : NormalEventHandler<CartState, AddItemToCartEvent>
{
    public override ValueTask HandleEvent(CartState stateData, AddItemToCartEvent eventData,
        IEventContext eventContext)
    {
        var items = stateData.Items ?? new Dictionary<string, int>();
        if (items.TryGetValue(eventData.SkuId, out var itemCount))
        {
            itemCount += eventData.Count;
        }
        // else
        // {
        //     itemCount = eventData.Count;
        // }

        items[eventData.SkuId] = itemCount;
        stateData.Items = items;
        return new ValueTask();
    }
}
```

这段代码中，包含有两个重要参数，分别是表示当前购物车状态的 CartState 和需要处理的事件 AddItemToCartEvent。

Determinamos si el diccionario en el estado contiene SkuId y actualizamos su cantidad de acuerdo con nuestras necesidades empresariales.

Continúe la depuración y el código se ejecutará hasta el final del código.

En este punto, con el depurador, puede ver que el stateData.Items diccionario agrega uno más, pero el número es 0.La razón es en realidad debido al código snippy comentado anteriormente, que es la causa del BUG que siempre no puede agregar el carro de la compra por primera vez.

Aquí, no interrumpa la depuración inmediatamente.Pasemos a la depuración y dejemos que el código pase para ver cómo termina todo el proceso.

De hecho, continúe la depuración y la ruptura llegará al final del método para CartGrain y CartController a su vez.

## ¡Esta es en realidad una arquitectura de tres niveles!

La gran mayoría de los desarrolladores entienden la arquitectura de tres niveles.De hecho, también podemos decir que Newbe.Claptrap es en realidad una arquitectura de tres niveles.Comparemos los resultados con un table：

| Tres plantas tradicionales           | Newbe.Claptrap       | Descripción                                                                                                                                             |
| ------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Capa de presentación de presentación | Capa del controlador | Se utiliza para interactuar con sistemas externos y proporcionar interoperabilidad externa                                                              |
| Capa de negocio                      | Capa de grano        | Procesamiento empresarial de parámetros empresariales entrantes basados en el negocio (no se escribe realmente ningún juicio en la muestra, cuenta > 0) |
| Capa de persistencia de persistencia | Capa EventHandler    | Actualizar los resultados empresariales                                                                                                                 |

Por supuesto, la similitud anterior es sólo una descripción simple.En el proceso, no hay necesidad de enredarse demasiado, esto es sólo una comprensión auxiliar de la declaración.

## También tiene un BUG para arreglar

A continuación, volvamos y solucionemos el problema anterior de "la entrada por primera vez no surta efecto".

### Este es un marco para considerar las pruebas unitarias

Hay un proyecto en la plantilla de proyecto`HelloClaptrap.Actors.Tests`, que incluye pruebas unitarias del código de negocio principal.

Ahora sabemos que`comentado en el`AddItemToCartEventHandler es la causa principal de los errores.

Podemos usar``de prueba dotnet para ejecutar pruebas unitarias en un proyecto de prueba y obtener dos errores:

```bash
A total of 1 test files matched the specified pattern.
  X AddFirstOne [130ms]
  Error Message:
   Expected value to be 10, but found 0.
  Stack Trace:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
   at FluentAssertions.Execution.TestFrameworkProvider.Throw(String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
   at FluentAssertions.Execution.AssertionScope.FailWith(Func`1 failReasonFunc)
   at FluentAssertions.Execution.AssertionScope.FailWith(Func`1 failReasonFunc)
   at FluentAssertions.Execution.AssertionScope.FailWith(String message, Object[] args)
   at FluentAssertions.Numeric.NumericAssertions`1.Be(T expected, String because, Object[] becauseArgs)
   at HelloClaptrap.Actors.Tests.Cart.Events.AddItemToCartEventHandlerTest.AddFirstOne() in D:\Repo\HelloClaptrap\HelloClaptrap\HelloClaptrap.Actors.Tests\Cart\Events\AddItemToCartEventHandlerTest.cs:line 32
   at HelloClaptrap.Actors.Tests.Cart.Events.AddItemToCartEventHandlerTest.AddFirstOne() in D:\Repo\HelloClaptrap\HelloClaptrap\HelloClaptrap.Actors.Tests\Cart\Events\AddItemToCartEventHandlerTest.cs:line 32
   at NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter`1.GetResult()
   at NUnit.Framework.Internal.AsyncToSyncAdapter.Await(Func`1 invoke)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.RunTestMethod(TestExecutionContext context)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.Execute(TestExecutionContext context)
   at NUnit.Framework.Internal.Execution.SimpleWorkItem.PerformWork()

  X RemoveOne [2ms]
  Error Message:
   Expected value to be 90, but found 100.
  Stack Trace:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
   at FluentAssertions.Execution.TestFrameworkProvider.Throw(String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
   at FluentAssertions.Execution.AssertionScope.FailWith(Func`1 failReasonFunc)
   at FluentAssertions.Execution.AssertionScope.FailWith(Func`1 failReasonFunc)
   at FluentAssertions.Execution.AssertionScope.FailWith(String message, Object[] args)
   at FluentAssertions.Numeric.NumericAssertions`1.Be(T expected, String because, Object[] becauseArgs)
   at HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemFromCartEventHandlerTest.RemoveOne() in D:\Repo\HelloClaptrap\HelloClaptrap\HelloClaptrap.Actors.Tests\Cart\Events\RemoveItemFromCartEventHandlerTest.cs:line 40
   at HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemFromCartEventHandlerTest.RemoveOne() in D:\Repo\HelloClaptrap\HelloClaptrap\HelloClaptrap.Actors.Tests\Cart\Events\RemoveItemFromCartEventHandlerTest.cs:line 40
   at NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter`1.GetResult()
   at NUnit.Framework.Internal.AsyncToSyncAdapter.Await(Func`1 invoke)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.RunTestMethod(TestExecutionContext context)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.Execute(TestExecutionContext context)
   at NUnit.Framework.Internal.Execution.SimpleWorkItem.PerformWork()


Test Run Failed.
Total tests: 7
     Passed: 5
     Failed: 2

```

Echemos un vistazo al código de una de las unidades de error tests：

```cs
[Test]
public async Task AddFirstOne()
{
    using var mocker = AutoMock.GetStrict();

    await using var handler = mocker.Create<AddItemToCartEventHandler>();
    var state = new CartState();
    var evt = new AddItemToCartEvent
    {
        SkuId = "skuId1",
        Count = 10
    };
    await handler.HandleEvent(state, evt, default);

    state.Items.Count.Should().Be(1);
    var (key, value) = state.Items.Single();
    key.Should().Be(evt.SkuId);
    value.Should().Be(evt.Count);
}
```

``AddItemToCartEventHandler es el componente de prueba principal de esta prueba y, dado que stateData y event se compilan manualmente, los desarrolladores pueden crear fácilmente escenarios que deben probarse a petición.No necesitas construir nada especial.

Ahora, simplemente restaure`fragmento de código comentado desde la`addItemToCartEventHandler y vuelva a ejecutar la prueba unitaria.La prueba unitaria pasa.BUG es también una solución natural.

Por supuesto, hay otra prueba unitaria en el escenario de eliminación que falló.Los desarrolladores pueden solucionar este problema siguiendo las ideas de "puntos de interrupción" y "pruebas unitarias" descritas anteriormente.

## Los datos se han conservado

Puede intentar reiniciar el servidor back-end y la Web, y verá que los datos en los que trabajó anteriormente se han conservado.

Lo trataremos más adelante en un capítulo de seguimiento.

## Resumen

En este artículo, echamos un primer vistazo a cómo crear un marco de proyecto básico para implementar un escenario de carrito de compras simple.

Hay mucho que no tenemos：detalles, estructura del proyecto, implementación, persistencia, etc.Puede leer más sobre él en artículos posteriores.
