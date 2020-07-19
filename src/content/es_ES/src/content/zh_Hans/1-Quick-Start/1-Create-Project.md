---
title: 'El primer paso - crear un proyecto e implementar un simple carrito de compras'
metaTitle: '第一步——创建项目，实现简易购物车'
metaDescription: 'El primer paso - crear un proyecto e implementar un simple carrito de compras'
---

Vamos a implementar un simple requisito de "carro de comercio electrónico" para ver cómo desarrollar usando Newbe.Claptrap.

> [当前查看的版本是由机器翻译自简体中文，并进行人工校对的结果。若文档中存在任何翻译不当的地方，欢迎点击此处提交您的翻译建议。](https://crwd.in/newbeclaptrap)

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

> 通常来说，我们建议将`D:\Repo\HelloClaptrap`创建为 Git 仓库文件夹。通过版本控制来管理您的源码。

## Compilación y puesta en marcha

Una vez creado el proyecto, puede compilar la solución con su IDE favorito abierto.

Una vez compilados, inicie proyectos web y BackendServer con la característica de inicio en el IDE.(VS necesita iniciar la consola de servicio y, si usa IIS Express, necesita que el desarrollador examine el número de puerto correspondiente para tener acceso a la página web)

Una vez completado el inicio, puede`http://localhost:36525/swagger`Dirección para ver la descripción de la API del elemento de ejemplo.Esto incluye tres API principales：

- `Obtener` `/api/Cart/{id}` Obtener artículos y cantidades en un carrito de compras id específico
- `Exponer` `/api/Cart/{id}` Agregue un nuevo artículo a la compra del identificador especificado
- `Eliminar` `/api/Cart/{id}` Retire un artículo específico del carro de la compra del identificador especificado

Puede intentar realizar varias llamadas a la API a través del botón Try It Out de la interfaz.

> - [如何在 VS 中同时启动多个项目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [如何在 Rider 中同时启动多个项目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [使用华为云加速 nuget 还原速度](https://mirrors.huaweicloud.com/)

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

> [通过 Go To File 可以助您快速定位文件所在](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

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

此处便是框架实现的核心，如下图所示的关键内容：

![Claptrap](/images/20190228-001.gif)

具体说到业务上，代码已经运行到了一个具体的购物车对象。

可以通过调试器看到传入的 skuId 和 count 都是从 Controller 传递过来的参数。

在这里您可以完成以下这些操作：

- Modifique los datos en Claptrap con eventos
- Leer los datos guardados en Claptrap

这段代码中，我们创建了一个`AddItemToCartEvent`对象来表示一次对购物车的变更。

然后将它传递给 Claptrap 进行处理了。

Claptrap 接受了事件之后就会更新自身的 State 数据。

最后我们将 StateData.Items 返回给调用方。（实际上 StateData.Items 是 Claptrap.State.Data.Items 的一个快捷属性。因此实际上还是从 Claptrap 中读取。）

通过调试器，可以看到 StateData 的数据类型如下所示：

```cs
clase pública CartState : IStateData
{
    diccionario público<string, int> Artículos . . . get; set; . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
}
```

这就是样例中设计的购物车状态。我们使用一个`Dictionary`来表示当前购物车中的 SkuId 及其对应的数量。

继续调试，进入下一步，让我们看看 Claptrap 是如何处理传入的事件的。

### Inicio del controlador de eventos AddItemToCart

再次命中断点的是下面这段代码：

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

这段代码中，包含有两个重要参数，分别是表示当前购物车状态的`CartState`和需要处理的事件`AddItemToCartEvent`。

我们按照业务需求，判断状态中的字典是否包含 SkuId，并对其数量进行更新。

继续调试，代码将会运行到这段代码的结尾。

此时，通过调试器，可以发现，stateData.Items 这个字典虽然增加了一项，但是数量却是 0 。原因其实就是因为上面被注释的 else 代码段，这就是第一次添加购物车总是失败的 BUG 成因。

在这里，不要立即中断调试。我们继续调试，让代码走完，来了解整个过程如何结束。

实际上，继续调试，断点将会依次命中 CartGrain 和 CartController 对应方法的方法结尾。

## ¡Esta es en realidad una arquitectura de tres niveles!

绝大多数的开发者都了解三层架构。其实，我们也可以说 Newbe.Claptrap 其实就是一个三层架构。下面我们通过一个表格来对比一下：

| Tradicional de tres niveles          | Newbe.Claptrap       | Descripción                                                                                                                                      |
| ------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Capa de presentación de presentación | Capa del controlador | Se utiliza para acoplar sistemas externos para proporcionar interoperabilidad externa                                                            |
| Nivel de negocio empresarial         | Capa de grano        | Procesamiento del negocio basado en los parámetros del negocio entrantes (muestra no escribe realmente el juicio, necesita juzgar el conteo > 0) |
| Capa de persistencia de persistencia | Capa EventHandler    | Actualizar los resultados empresariales                                                                                                          |

当然上面的类似只是一种简单的描述。具体过程中，不需要太过于纠结，这只是一个辅助理解的说法。

## También tiene un BUG para arreglar

接下来我们重新回过头来修复前面的“首次加入商品不生效”的问题。

### Este es un marco para considerar las pruebas unitarias

在项目模板中存在一个项目`HelloClaptrap.Actors.Tests`，该项目包含了对主要业务代码的单元测试。

我们现在已经知道，`AddItemToCartEventHandler`中注释的代码是导致 BUG 存在的主要原因。

我们可以使用`dotnet test`运行一下测试项目中的单元测试，可以得到如下两个错误:

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

我们看一下其中一个出错的单元测试的代码：

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

`AddItemToCartEventHandler`是该测试主要测试的组件，由于 stateData 和 event 都是通过手动构建的，因此开发者可以很容易就按照需求构建出需要测试的场景。不需要构建什么特殊的内容。

现在，只要将`AddItemToCartEventHandler`中那段被注释的代码还原，重新运行这个单元测试。单元测试便就通过了。BUG 也就自然的修复了。

当然，上面还有另外一个关于删除场景的单元测试也是失败的。开发者可以按照上文中所述的“断点”、“单元测试”的思路，来修复这个问题。

## Los datos se han conservado.

您可以尝试重新启动 Backend Server 和 Web， 您将会发现，您之前操作的数据已经被持久化的保存了。

我们将会在后续的篇章中进一步介绍。

## Resumen

通过本篇，我们初步了解了一下，如何创建一个基础的项目框架来实现一个简单的购物车场景。

这里还有很多内容我们没有详细的说明：项目结构、部署、持久化等等。您可以进一步阅读后续的文章来了解。
