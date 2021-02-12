---
date: 2020-06-01
title: Hablando sobre la aplicación de la programación reactiva en el lado del servicio, optimización de la operación de la base de datos, de 20 segundos a 0,5 segundos
---

La programación reactiva se utiliza ampliamente en la programación de clientes, mientras que las aplicaciones actuales en el lado del servicio son relativamente menos mencionadas.En este artículo se describe cómo mejorar el rendimiento de las operaciones de base de datos mediante la aplicación de programación de respuestas en la programación del lado del servicio.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## La apertura es la conclusión

System.Reactive, junto con TaskCompleteSource, permite combinar una única solicitud de inserción de base de datos en una solicitud de inserción masiva.Optimice el rendimiento de inserción de la base de datos y garantice la corrección.

Si el lector ya sabe cómo hacerlo, el resto no necesita ser leído.

## Condiciones preestablecidas

Ahora, supongamos que existe una interfaz de repositorio para representar una operación de inserción de base de datos.

```csharp
namespace Newbe.RxWorld.DatabaseRepository
á
    interfaz pública IDatabaseRepository
    á
        /// <summary>
        /// Insertar un elemento y devolver el recuento total de datos en la base de datos
        /// </summary>
        /// <param name="item"></param>
        /// <returns></returns>
        Tarea<int> InsertData(int item);
    á
?
```

A continuación, vamos a experimentar las diferencias de rendimiento que vienen con diferentes implementaciones sin cambiar la firma de la interfaz.

## La versión subyacente

La primera es la versión subyacente, que utiliza la base de datos única más convencional`INSERT`para insertar datos.En este ejemplo se utiliza la`SQLite`como una base de datos de demostración con la que los lectores pueden experimentar.

```csharp
namespace Newbe.RxWorld.DatabaseRepository.Impl
-
    clase pública NormalDatabaseRepository : IDatabaseRepository

        _database privado readonly IDatabase;

        public NormalDatabaseRepository(
            IDatabase database)

            _database de datos;
        :

<int> de tareas públicas InsertData(int item)
        :
            devuelve _database. InsertOne(item);

    á
?
```

Operaciones generales.Uno de`_database. La implementación específica de la`InsertOne es invocar una única``de inserción.

La versión subyacente se puede completar básicamente más rápidamente cuando se inserta menos de 20 veces al mismo tiempo.Pero si el orden de magnitud aumenta, como la necesidad de insertar 10.000 bases de datos al mismo tiempo, tomará unos 20 segundos y hay mucho espacio para la optimización.

## TaskCompleteSource

TaskCompleteSource es un tipo de la biblioteca TPL que genera una tarea procesable.[los lectores que no están familiarizados con TaskCompleteSource pueden obtener información sobre el](https://github.com/newbe36524/Newbe.Demo/tree/feature/reactive/src/BlogDemos/Newbe.Tasks/Newbe.Tasks).

Aquí también hay una breve explicación del papel del objeto para que el lector pueda seguir leyendo.

Para los amigos que están familiarizados con javascript, puede pensar en TaskCompleteSource como el equivalente de un objeto Promise.También puede ser equivalente a jQuery en el .$. Diferido.

Si no entiendes a los amigos, puedes escuchar al autor comer picante caliente cuando piensas en el ejemplo de la vida.

| Coma picante caliente                                                                                      | Explicación técnica                                                                       |
| ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Antes de comer picante caliente, es necesario utilizar un plato para emparedar los platos.                 | Construir parámetros                                                                      |
| Después de emparedar los platos, llévenlos a la oficina de pago para echar un vistazo                      | El método se llama                                                                        |
| Cuando el cajero haya terminado, recibirá una señal de comida que suena                                    | Obtener un valor devuelto por la tarea                                                    |
| Tome la tarjeta del plato para encontrar un asiento para sentarse, jugar al teléfono móvil y otras comidas | A la espera de esta tarea, la CPU está tratando con otras cosas en su lugar               |
| Los anillos del plato, ir a buscar la comida y comerla                                                     | La tarea se completa, espera el número de secciones y pasa a la siguiente línea de código |

Entonces, ¿dónde está TaskCompleteSource?

En primer lugar, de acuerdo con el ejemplo anterior, recogeremos la comida sólo cuando suene el plato.Entonces, ¿cuándo será el anillo de señal de comida?Por supuesto, el camarero presionó manualmente un interruptor manual en el mostrador para activar la campana.

Bueno, este interruptor en el contador se puede interpretar técnicamente como TaskCompleteSource.

El interruptor de mesa controla el timbre de la placa.De forma similar, TaskCompleteSource es un objeto que controla el estado de la tarea.

## Resolver la idea

Con lo que ha aprendido sobre TaskCompleteSource antes, puede resolver el problema al principio del artículo.La idea es tan follows：

Cuando InsertData se llama, puede crear un TaskCompleteSource y un metagrupo de elementos.Para obtener una ilustración, denominamos a este``BatchItem.

Devuelve la tarea para TaskCompleteSource de BatchItem.

El código que llama a InsertData espera el Task devuelto, por lo que el llamador espera mientras el TaskCompleteSource no se opera.

A continuación, se inicia un subproceso independiente, que consume periódicamente la cola BatchItem.

Esto completa el proceso de convertir una sola plaquita en una plaquita a granel.

Es posible que el autor no lo explique muy claramente, pero todas las siguientes versiones del código se basan en las ideas anteriores.Los lectores pueden combinar palabras y código para entender.

## Versión ConcurrentQueue

Basándonos en la idea anterior, implementamos ConcurrentQueue como una cola BatchItem, con el siguiente código (mucho código, que no debe enredarse, porque hay más simples a continuación)：

```csharp
namespace Newbe.RxWorld.DatabaseRepository.Impl
-
    clase pública ConcurrentQueueDatabaseRepository : IDatabaseRepository

        _testOutputHelper privada de solo lectura ITestOutputHelper;
        _database privado readonly IDatabase;
        private readonly ConcurrentQueue<BatchItem> _queue;

        // ReSharper deshabilitar una vez PrivateFieldCanBeConvertedToLocalVariable
        _batchInsertDataTask de tarea de solo lectura privada;

        public ConcurrentQueueDatabaseRepository(
            ITestOutputHelper testOutputHelper,
            base de datos IDatabase)

            _testOutputHelper de pruebasOutputHelper;
            _database- base de datos;
            _queue : nueva<BatchItem>ConcurrentQueue ();
            // Iniciar un
            _batchInsertDataTask BatchItem en una cola de consumo de tareas . . . Task.Factory.StartNew (RunBatchInsert, TaskCreationOptions.LongRunning);
            _batchInsertDataTask.ConfigureAwait(false);


<int> de tareas públicas InsertData (elemento int)
        . . .
            // Build BatchItem para colocar objetos en la cola.Volver a la tarea
            el var taskCompletionSource s new TaskCompletionSource<int>();
            _queue. Enqueue(new BatchItem
            ?
                Item - item,
                TaskCompletionSource ? taskCompletionSource
            ;
            devolver taskCompletionSource.Task;

                    
                
                
            
            
        
        .

        . Wait();
                de

                de  de la  de la
                    _testOutputHelper.WriteLine($"hay un error : {e}");



            IEnumerable<IList<BatchItem>> GetBatches()
            á
                var sleepTime - TimeSpan.FromMilliseconds(50);
                mientras (true)
                á
                    const int maxCount a 100;
                    var oneBatchItems á GetWaitingItems()
                        . Take(maxCount)
                        . ToList();
                    si (oneBatchItems.Any())
                    -
                        rendimiento devuelven oneBatchItems;
                    de

                    demás
                        Thread.Sleep(sleepTime);



                IEnumerable<BatchItem> GetWaitingItems()

                    mientras (_queue. TryDequeue(out var item))
                    -
                        elemento devuelto por rendimiento;



        -

        elementos de la tarea async privada BatchInsertData(IEnumerable<BatchItem> items)

            . ToArray();
            intente
            la operación de inserción de
                de la base de datos
                var totalCount s _database. InsertMany(batchItems.Select(x á> x.Item));
                foreach (var batchItem in batchItems)
                -
                    batchItem.TaskCompletionSource.SetResult(totalCount);

            -
            catch (Exception e)
            á
                foreach (var batchItems in batchItems)

                    batchItem.TaskCompletionSource.SetException(e);
                de

                lanzamiento;
            de
        de

        estructura privada BatchItem

            TaskCompletionSource pública<int> TaskCompletionSource á get; set; •
            elemento de int público ; set; •


?
```

## ¡Empieza la película!

A continuación, vamos a usar System.Reactive para adaptar la versión más compleja de ConcurrentQueue anterior.Aquí está：

```csharp
namespace Newbe.RxWorld.DatabaseRepository.Impl
-
    clase pública AutoBatchDatabaseRepository : IDatabaseRepository

        _testOutputHelper privado de solo lectura ITestOutputHelper;
        _database privado readonly IDatabase;
<BatchItem> _subject privado de temas de solo lectura;

        público AutoBatchDatabaseRepository(
            ITestOutputHelper testOutputHelper,
            base de datos IDatabase)

            _testOutputHelper de pruebas Detección de la  de datos de IDatabase)   _testOutputHelper de pruebas de la base de datos de datos de  de datos de ;
            _database- base de datos;
            _subject nuevo<BatchItem>de Asunto ();
            // Solicitudes de grupo en grupos de 50 milisegundos o cada 100
            _subject. Buffer(TimeSpan.FromMilliseconds(50), 100)
                . Donde (x s> x.Count > 0)
                // Inserte cada conjunto de llamadas de datos de forma masiva y escriba en la base de datos
                . Select(list á> Observable.FromAsync(() á> BatchInsertData(list)))
                . Concat()
                . Subscribe();


        // No hay ningún cambio aquí desde la comparación anterior
        tarea pública<int>
        InsertData . . . .
            var taskCompletion .<int>.
            _subject. OnNext(new BatchItem
            ?
                Item - item,
                TaskCompletionSource ? taskCompletionSource
            ;
            devolver taskCompletionSource.Task;
        s

        // Este párrafo es exactamente el mismo que antes, no hay ningún cambio
        privado async Task BatchInsertData (IEnumerable<BatchItem> items)
        s
            var batchItems s elementos como BatchItems? ToArray();
            _database
                , intente
            . InsertMany(batchItems.Select(x á> x.Item));
                foreach (var batchItem in batchItems)

                    batchItem.TaskCompletionSource.SetResult(totalCount);

            -
            catch (Exception e)
            á
                foreach (var batchItems in batchItems)

                    batchItem.TaskCompletionSource.SetException(e);
                de

                lanzamiento;
            de
        de

        estructura privada BatchItem

            TaskCompletionSource pública<int> TaskCompletionSource á get; set; •
            elemento de int público ; set; •


?
```

El código se redujo en 50 líneas, principalmente porque la implementación lógica compleja en la versión ConcurrentQueue se implementó mediante el método de búfer eficaz proporcionado en System.Reactive.

## Maestro, ¿puede darme un poco más de fuerza?

Podemos optimizar "ligeramente" el código para separar el búfer y la lógica relacionada de la lógica de negocios de la "inserción de base de datos".Entonces conseguiremos una version：más simple

```csharp
namespace Newbe.RxWorld.DatabaseRepository.Impl

    clase pública FinalDatabaseRepository : IDatabaseRepository

<int, int> _batchOperator privado de solo lectura IBatchOperator;

        base de datos pública FinalDatabaseRepository(
            IDatabase)

            opciones var , new BatchOperatorOptions<int, int>
            ,
                BufferTime , TimeSpan.FromMilliseconds(50),
                BufferCount a 100,
                DoManyFunc - base de datos. InsertMany,
            ;
            _batchOperator: nueva<int, int>BatchOperator (opciones);
        :

        tarea pública<int> InsertData(int item)
        -
            devolver _batchOperator.CreateTask(item);


?
```

El código como IBatchOperator, que los lectores pueden ver en la base de código, no se muestra aquí.

## Pruebas de rendimiento

Básico se puede medir como follows：

La versión original no es muy diferente de la versión masiva cuando hay 10 operaciones de solo datos.Incluso las versiones a granel son más lentas cuando el número es pequeño, después de todo, hay un tiempo de espera máximo de 50 milisegundos.

Sin embargo, si necesita manipular 10.000 consumibles de datos a granel, la versión original puede tardar 20 segundos, mientras que la versión masiva solo tarda 0,5 segundos.

> [todo el código de ejemplo se puede encontrar en la base de código](https://github.com/newbe36524/Newbe.Demo).Si Github Clone está en problemas,[también puede hacer clic aquí para Clonar desde Gitee](https://gitee.com/yks/Newbe.Demo)

<!-- md Footer-Newbe-Claptrap.md -->
