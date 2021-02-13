---
date: 2020-06-28
title: Hable sobre la aplicación de programación reactiva en el lado del servicio, optimización de la operación de la base de datos, acelerar Upsert
---

La programación reactiva se utiliza ampliamente en la programación de clientes, mientras que las aplicaciones actuales en el lado del servicio son relativamente menos mencionadas.En este artículo se describe cómo mejorar el rendimiento de las operaciones de base de datos mediante la aplicación de programación de respuestas en la programación del lado del servicio.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## La apertura es la conclusión

Siguiendo el último["Hablando de la aplicación de la programación reactiva en el lado del servicio, optimización de la operación de la base de datos, de 20 segundos a 0,5 seconds](008-Reactive-In-Server-1)este tiempo, traemos un caso de estudio de optimización de upsert con programación reactiva.Se recomienda a los lectores que lean primero el artículo anterior, lo que facilita la comprensión de los métodos descritos en este artículo.

También es una manera de combinar operaciones de upsert individuales en masa utilizando la idea de procesamiento por lotes.El objetivo de reducir el consumo de vínculos de base de datos se ha logrado para mejorar significativamente el rendimiento.

## El escenario empresarial

在最近的一篇文章[《十万同时在线用户，需要多少内存？——Newbe.Claptrap 框架水平扩展实验》](003-How-Many-RAMs-In-Used-While-There-Are-One-Hundred-Thousand-Users-Online)中。Verificamos rápidamente la corrección de JWT activando múltiples Claptrap residentes en memoria.

Sin embargo, hay un problema técnico que no es resolved：

El marco Newbe.Claptrap diseña un feature：cuando Claptrap Deactive, puede elegir guardar la instantánea en la base de datos inmediatamente.Por lo tanto, cuando intenta cerrar un nodo de un clúster, si hay un gran número de Claptrap en el nodo, se genera un gran número de operaciones upsert de base de datos.Empuje al instante el consumo de la base de datos e incluso causar algunos errores y no se puede guardar.

## Un poco de código

Con el`anterior`IBatchOperator, queda muy poco código para este artículo.

En primer lugar, escriba un repositorio compatible con acciones con IBatchOperator del último artículo, como el siguiente code：

```cs
clase pública BatchUpsert : IUpsertRepository
-
    _database privada de IDatabase readonly;
<privado de solo lectura IBatchOperator (int, int), int> _batchOperator;

    de la base de datos public BatchUpsert(IDatabase)
    de la base de datos de
        _database;
        var options ( new BatchOperatorOptions<(int, int), int>
        á
            BufferCount ,
            BufferTime , TimeSpan.FromMilliseconds(50),
            DoManyFunc - DoManyFunc
        ;
        _batchOperator: nuevo<De BatchOperator (int, int), int>(opciones);


    tarea privada<int> DoManyFunc(IEnumerable<(int, int)> arg)

        devuelve _database. UpsertMany(arg. ToDictionary(x á> x.Item1, x á> x.Item2));
    :

    Task UpsertAsync(int key, int value)
    -
        devuelve _batchOperator.CreateTask((key, value));

?
```

Esta optimización se puede hacer bien mediante la implementación de la UpsertMany método para la base de datos correspondiente.

## Operaciones en varias bases de datos

Combinado con el newbe.Claptrap ahora proyecto real.Actualmente, se admiten SQLite, PostgreSQL, MySql y MongoDB.A continuación, las operaciones de Upsert masivas para diferentes tipos de bases de datos se describen por separado.

Dado que los requisitos de Upsert en el proyecto Newbe.Claptrap se basan en la clave principal como clave de comparación, esto solo se describe a continuación.

### Sqlite

De acuerdo con la documentación oficial, `insertar o REEMPLAZAR EN` la necesidad de reemplazar los datos en el primer conflicto clave.

Las instrucciones específicas tienen el formato de follows：

```SQL
INSERTAR O REEMPLAZAR INTO TestTable (id, valor)
VALUES
(@id0,@value0),
...
(@idn,@valuen);
```

Así que sólo las instrucciones de puntada y las llamadas de parámetros directamente.Es importante tener en cuenta que los parámetros pasables de SQLite tienen como valor predeterminado 999, por lo que el número de variables cosidas no debe ser mayor.

> [El documento oficial：INSERT](https://www.sqlite.org/lang_insert.html)

### Postgresql

众所周知，PostgreSQL 在进行批量写入时，可以使用高效的 COPY 语句来完成数据的高速导入，这远远快于 INSERT 语句。但可惜的是 COPY 并不能支持 ON CONFLICT DO UPDATE 子句。因此，无法使用 COPY 来完成 upsert 需求。

因此，我们还是回归使用 INSERT 配合 ON CONFLICT DO UPDATE 子句，以及 unnest 函数来完成批量 upsert 的需求。

Las instrucciones específicas tienen el formato de follows：

```SQL
INSERT INTO TestTable (id, value)
VALUES (unnest(@ids), unnest(@values))
ON CONFLICT ON CONSTRAINT TestTable_pkey
DO UPDATE SET value-excluded.value;
```

Donde los identificadores y los valores son dos objetos de matriz igualmente largos, la función unnest convierte los objetos de matriz en datos de fila.

Tenga en cuenta que un comando ON CONFLICT DO UPDATE puede afectar a la fila por segunda vez.

Así que si intenta utilizar el escenario anterior, debe ir a través de él de nuevo en el programa antes de pasar la base de datos.Además, en general, tiene sentido realizar un reingreso en un programa para reducir la cantidad de datos que se pasan a la base de datos.

> [documento oficial：función no más](https://www.postgresql.org/docs/9.2/functions-array.html) > [documento oficial：Insertar statement](https://www.postgresql.org/docs/9.5/sql-insert.html)

### Mysql

MySql, similar a SQLite, admite`sintaxis de` REPLACE.Las instrucciones específicas se encuentran en el siguiente：

```sql
REPLACE INTO TestTable (id, value)
VALUES
(@id0,@value0),
...
(@idn,@valuen);
```

> [El documento oficial：declaración REPLACE](https://dev.mysql.com/doc/refman/8.0/en/replace.html)

### Mongodb

MongoDB admite de forma nativa el modo de transporte masivo de bulkWrite, así como la sintaxis upsert de replace.Así que es muy fácil de hacer.

Así que aquí hay un vistazo a cómo hacer it：

```cs
Tarea asincrónica privada SaveManyCoreMany(
    IDbFactory,
    IEnumerable<StateEntity> entities)

    . ToArray();
    var items -
        de matriz . Select(x á> nuevo
        MongoStateEntity
            claptrap_id á x.ClaptrapId,
            claptrap_type_code x.ClaptrapTypeCode,
            versión de x.version,
            state_data x.StateData,
            updated_time x.UpdatedTime,
        )
        . ToArray();

    var client á dbFactory.GetConnection(_connectionName);
    cliente var db. GetDatabase(_databaseName);
    colección var: db.<MongoStateEntity>GetCollection (_stateCollectionName);

    var upsertModels- elementos. Select(x á>
    -
        var filter ? new ExpressionFilterDefinition<MongoStateEntity>(entidad )>
            entity.claptrap_id x.claptrap_id && entity.claptrap_type_code á x.claptrap_type_code);
        devuelven un nuevo<MongoStateEntity>ReplaceOneModel (filtro, x)
        de
            IsUpsert a
        verdadero;
    );
    esperamos colección. BulkWriteAsync(upsertModels);
?
```

Este es el código proporcionado por el escenario empresarial del proyecto Newbe.Claptrap, que los lectores pueden modificar junto con sus propias necesidades.

> [Documentos oficiales：db.collection.bulkWrite()](https://docs.mongodb.com/manual/reference/method/db.collection.bulkWrite/#db.collection.bulkWrite)

### Solución universal

La esencia de la optimización es reducir el uso de enlaces de base de datos y hacer tanto trabajo como sea posible dentro de un enlace.Por lo tanto, si una base de datos determinada no admite operaciones similares para las bases de datos anteriores.Luego hay un solution：universal

1. Escribir datos en una tabla temporal lo antes posible
2. La tabla de destino que actualiza los datos de la tabla temporal a la actualización de la tabla
3. Eliminar la tabla temporal

> [ACTUALIZAR con una unión](http://www.sql-workbench.eu/dbms_comparison.html)

## Pruebas de rendimiento

En el caso de SQLite, pruebe 2 operaciones upsert en datos 12345.

El：1 minuto y 6 segundos

Procesamiento por lotes：2,9 segundos

[El código de la prueba se puede encontrar en el vínculo.](https://github.com/newbe36524/Newbe.Demo/blob/master/src/BlogDemos/Newbe.Rx/Newbe.RxWorld/Newbe.RxWorld/UpsertTest.cs)

El ejemplo no contiene mySql, PostgreSQL y MongoDB, porque antes de la optimización, el grupo de conexiones se descompone básicamente sin generar el grupo de conexiones.El resultado de todas las optimizaciones es una solución directa al problema de disponibilidad.

> [todo el código de ejemplo se puede encontrar en la base de código](https://github.com/newbe36524/Newbe.Demo).Si Github Clone está en problemas,[también puede hacer clic aquí para Clonar desde Gitee](https://gitee.com/yks/Newbe.Demo)

## Preguntas más frecuentes

Estas son las respuestas a algunas preguntas comunes.

### ¿Está el cliente esperando el resultado de una operación masiva?

Esta es una pregunta planteada por muchos neizeres.La respuesta：sí.

Supongamos que exponemos un WebApi como una interfaz, a la que llama el explorador.Si 100 navegadores están haciendo solicitudes al mismo tiempo.

A continuación, las 100 solicitudes se combinan y, a continuación, se escriben en la base de datos.Estos clientes no recibirán una respuesta del lado del servicio hasta que se escriban en la base de datos y esperarán.

Aquí también es donde el esquema de combinación difiere del escenario habitual de "cola de escritura, biblioteca de escritura más adelante".

### En principio, ¿cuál es el punto de esto y la copia a granel?

Los dos son irrelevantes y deben tener funciones que funcionen al mismo tiempo. En primer lugar, la base de datos en el código. InsertMany es la copia a granel que mencionó.

La clave de este código no es InsertMany, sino cómo combinar una sola solicitud de inserción. Imagine que puede exponer una API de copia masiva en webapi. Sin embargo, no puede combinar solicitudes de diferentes clientes dentro de la misma API para llamar a bulkcopy. Por ejemplo, con 10.000 clientes que llaman a la API, ¿cómo se combinan estas solicitudes de API?

Si lo hace anteriormente, aunque solo expone una única API insertada al público.Entre usted y la consolidación de solicitudes de diferentes clientes, puede utilizar bulkcopy.Esto tiene sentido en niveles altos.

Además, esto funciona con el principio de cierre abierto, porque no modificó la interfaz InsertOne del repositorio, pero copia masiva.

### Si se produce un error en una excepción de operación en una operación por lotes, ¿se producirá un error en todas las demás operaciones que se combinaron?

Si el escenario empresarial es que la consolidación tiene un impacto, ciertamente no debería combinarse.

Una operación masiva falla, por supuesto, porque la transacción de base de datos subyacente ciertamente falla juntos.

A menos que la interfaz masiva también admita el tratamiento diferencial de cada ID entrante.Normalmente, como la copia masiva de mongodb, tenemos la capacidad de establecer diferentes estados Tcs si podemos devolver qué éxitos y qué errores.

Lo que debe y no debe fusionarse depende enteramente del negocio.En el ejemplo se muestra cómo se debe combinar si desea combinar.No todos deben combinarse.

### Insert y Upsert dijeron, ¿qué pasa con Eliminar y Seleccionar?

El autor generalmente se refiere a este modelo como "procesamiento por lotes reactivo".Para confirmar que el patrón se aplica al escenario empresarial, debe tener las dos requirements：

- Si el procesamiento por lotes aguas abajo del negocio será más rápido que el procesamiento único acumulado, si es así, se puede utilizar
- Si habrá una solicitud de frecuencia de ráfaga corta aguas arriba de la empresa, si es así, que se puede utilizar

Por supuesto, también hay preguntas a tener en cuenta,：como si las operaciones por lotes posteriores se pueden dividir en los resultados de cada solicitud.Pero estos dos puntos deben ser considerados.

Así que toma Delete como un example：

- ¿Eliminar dónde en será más rápido que Eliminar?Pruébalo
- ¿Habrá un aumento repentino en los requisitos de eliminación?Piénsalo

## Gadget Zeal

El autor es un procedimiento almacenado completo que no se puede escribir fuera de la persona.Acceso a documentos para estas bases de datos, todos con un documento sin conexión llamado Zeal.Recomendado para usted, usted se lo merece.

![Celo](/images/20200627-010.png)

Discurso Oficial de Zeal：<https://zealdocs.org/>

<!-- md Footer-Newbe-Claptrap.md -->
