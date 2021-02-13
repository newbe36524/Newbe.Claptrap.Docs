---
date: 2020-07-20
title: Construir un sistema de venta de billetes de tren fácil, Newbe.Claptrap Framework Caso de uso, Primer paso - Análisis de negocios
---

El marco Newbe.Claptrap es ideal para resolver sistemas empresariales con problemas de complicidad.El sistema de emisión de billetes de tren es un caso de uso de escenario muy típico.

En esta serie, recorreremos los aspectos de negocio, código, pruebas e implementación de cómo usar el marco Newbe.Claptrap para crear un sistema de emisión de billetes de tren simple.

<!-- more -->

## Bragging bate por primera vez el draft

Vamos a definir primero los límites de negocio y los requisitos de rendimiento necesarios para este sencillo sistema de emisión de billetes de tren.

### Límites empresariales

El sistema contiene sólo la parte restante de la gestión de tickets del billete.Es decir, consultar los asientos restantes, pedir un boleto para reducir el asiento.

La generación de información de pedidos, pago, control de tráfico, solicitud de control eólico, etc. no se incluyen en el ámbito de esta discusión.

### Casos de uso empresarial

- Compruebe los billetes restantes y pueda comprobar el número de billetes disponibles entre las dos estaciones y el número de asientos restantes.
- Compruebe los billetes restantes correspondientes al número de viajes, puede consultar el número dado de veces, entre las estaciones cuántos asientos quedan.
- Soporte para la selección de asientos, los clientes pueden elegir un número determinado de coches y asientos, y pedir boletos.

### Requisitos de rendimiento

- El costo promedio de consultar los tickets y pedidos restantes no debe superar los 20 ms.Esta vez solo incluye el tiempo de procesamiento del lado del servicio, es decir, la transmisión de la red de páginas, la representación de páginas, etc. no son partes de la preocupación del marco.
- Las consultas de tickets residuales pueden tener un retraso, pero no más de 5 segundos.Retraso significa que puede haber una consulta para vales, pero no se permite pedir tickets.

## Análisis difícil

### Gestión de tickets residuales

La dificultad de la gestión residual del billete de tren reside en la particularidad del inventario de billetes restante.

Los bienes de comercio electrónico ordinarios, SKU como la unidad más pequeña, cada SKU es independiente entre sí, no se afectan entre sí.

Por：actualmente estoy vendiendo 10.000 rotondas Armstrong del planeta Sebotan, rojo y blanco, respectivamente.A continuación, cuando el usuario bajo pedidos, siempre y cuando el control de rojo y blanco dos artículos de inventario no se sobrevenden.No hay relación entre ellos.

Sin embargo, los billetes restantes para el tren son diferentes, ya que los billetes restantes se verán afectados por el final de los billetes vendidos.Aquí hay un modelo lógico simple para obtener una mirada detallada a esta particularidad.

Ahora, supongamos que hay un tren pasando por cuatro estaciones, a, b, c, d, y al mismo tiempo, simplificamos el escenario, suponiendo que sólo hay un asiento en el viaje.

Así que antes de que alguien compre un boleto, la situación restante del boleto para este número de boletos es como follows：

| Inicio y fin | La cantidad de entradas restantes |
| ------------ | --------------------------------- |
| a,b          | 1                                 |
| a,c          | 1                                 |
| a,d          | 1                                 |
| b,c          | 1                                 |
| b,d          | 1                                 |
| c,d          | 1                                 |

Si un cliente ha comprado un billete a,c.Así que ya que sólo hay un asiento, no hay otro billete excepto c,d.La situación de voto restante se convierte en la siguiente：

| Inicio y fin | La cantidad de entradas restantes |
| ------------ | --------------------------------- |
| a,b          | 0                                 |
| a,c          | 0                                 |
| a,d          | 0                                 |
| b,c          | 0                                 |
| b,d          | 0                                 |
| c,d          | 1                                 |

Para decirlo más directamente, si un cliente compra a,d para todo el billete, todos los boletos restantes se cambiarán a 0.Porque el pasajero siempre está en este asiento.

Esta es la particularidad de los billetes de tren：el mismo asiento en el mismo tren, el número de billetes restantes en cada punto de salida se verá afectado por el inicio y el final del billete vendido.

Extendiéndose un poco, es fácil concluir que no hay tal efecto entre diferentes asientos en el mismo viaje.

### Consulta de tickets residuales

Como se mencionó en la sección anterior, debido a la particularidad del inventario de tickets residuales.Para el mismo viaje a, b, c, d, hay 6 opciones de entradas posibles.

Y es fácil concluir que el método de cálculo del número de tipos elegidos es en realidad seleccionar dos combinaciones en n sitios, es decir.c(n, 2).

Así que si hay un coche pasando a través de 34 estaciones, la posible combinación es c (34,2) s 561.

Cómo lidiar con muchos tipos de consultas que pueden existir eficientemente es también un problema que el sistema necesita resolver.

## Diseño lógico de Claptrap

El modo actor es un patrón de diseño que es inherentemente adecuado para resolver problemas con problemas.El marco Newbe.Claptrap basado en este concepto puede manejar naturalmente las dificultades mencionadas anteriormente.

### Recursos competitivos mínimos

En comparación con el concepto de "competencia de recursos" en la programación multiproceso, el autor propone el concepto de "recurso competitivo mínimo" en el sistema empresarial.Este concepto facilita la búsqueda de puntos de diseño para aplicar Newbe.Claptrap.

Por ejemplo, en el ejemplo del autor de vender cañones de giro Abstrom, cada artículo del mismo color es un "recurso competitivo mínimo".

Tenga en cuenta que esto no quiere decir que todos los elementos bajo el mismo color son un "recurso competitivo mínimo".Porque, si usted es el número 10.000 artículos, entonces la prisa por comprar el primer y segundo producto, no hay competencia en sí mismo.Por lo tanto, cada producto básico es un recurso competitivo mínimo.

Así que en el caso de los billetes de tren, el recurso competitivo más pequeño：el mismo asiento en el mismo tren.

Como se mencionó anteriormente, el mismo asiento en el mismo tren, en la selección de diferentes puntos de partida y fin es que la situación restante del billete hay una relación competitiva.Específicamente, por ejemplo, el autor quiere comprar entradas para a,c, mientras que los lectores quieren comprar entradas para a,b.Entonces tenemos una relación competitiva, y sólo tendremos una persona que pueda comprar con éxito este "recurso competitivo mínimo".

Estos son algunos ejemplos que el autor cree que son available：

- En un sistema empresarial que solo permite inicios de sesión de un solo extremo, el ticket de inicio de sesión de un usuario es el recurso menos competitivo
- En un sistema de configuración, cada elemento de configuración es el recurso menos competitivo
- En un mercado de valores, cada orden de compra o venta es el recurso menos competitivo

> Esta es la propia suposición del autor, ninguna referencia a otros materiales, si hay información similar o sustantivos pueden apoyar el contenido, pero también esperar que los lectores puedan dejar una descripción del mensaje.

### Recursos competitivos mínimos con Claptrap

Se mencionan los "recursos mínimos de competitividad" porque distinguir entre los recursos menos competitivos es una base importante para el diseño del sistema al diseñar el estado de Claptrap.

Aquí hay una conclusión:：**estado de Claptrap debe ser al menos mayor o igual que el "recurso competitivo mínimo".**

Combinado con el ejemplo de la pistola de aceleración oscilante Absterrand, si todos los objetos del mismo color están diseñados en el mismo estado de Claptrap (más grande que el recurso competitivo mínimo).A continuación, diferentes usuarios compran elementos que se afectan entre sí porque Claptrap se basa en el patrón Actor que pone en cola para procesar las solicitudes.Es decir, suponiendo que cada artículo necesita procesar 10 ms, entonces es hasta 10000 para manejar todas las solicitudes de compra.Sin embargo, si cada elemento está numerado, cada elemento está diseñado como un estado de Claptrap independiente.Así que porque no están relacionados entre sí.La venta de todos los productos requeriría teóricamente sólo 10ms.

Que：**si el estado de Claptrap es mayor que el rango mínimo de recursos competitivos, el sistema no tendrá un problema con la corrección, pero puede haber algunas pérdidas de rendimiento.**

Además, como se mencionó anteriormente en el ejemplo de la emisión de billetes de tren, el mismo asiento en el mismo tren es el recurso menos competitivo, por lo que podemos diseñar esta entidad comercial como el estado de Claptrap.Pero, ¿qué pasa si el rango de diseño es más pequeño que esto?

Para：diseñamos Claptrap's State como un billete residual para el mismo asiento en el mismo tren en diferentes puntos de salida.Entonces, hay una cuestión muy tradicional de："Cómo garantizar la corrección de los datos en un sistema distribuido".Para este punto, el autor no puede expandirse, porque el autor tampoco puede decir claramente, sólo apresurarse a retirar una conclusión：**"Si el Estado de Claptrap es menor que el alcance de los recursos competitivos más pequeños, la relación entre Claptrap será difícil de tratar, hay riesgos".**

### Diseño del cuerpo de Claptrap

A continuación, combine las teorías descritas anteriormente.Tiramos el diseño directamente.

![Diseño del sistema de venta de billetes de tren](/images/20200720-001.png)

#### Diseñe cada asiento en el mismo viaje que un Claptrap-SeatGrain

El estado de Claptrap contiene una información básica

| Tipo                                    | Nombre     | Descripción                                                                                                                                                                                                                    |
| --------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| IList&lt;int&gt;            | Estaciones | La lista de identificación de las estaciones de ruta, comenzando con la estación de origen y terminando con la terminal.Verificación en el momento de la compra del billete principal.                                         |
| Diccionario&lt;int, int&gt; | StationDic | Diccionario inverso de índice que enruta el identificador de estación.Las estaciones son una lista de ids de índice, y el diccionario es el diccionario id-index correspondiente, con el fin de acelerar las consultas.        |
| Lista&lt;string&gt;         | RequestIds | Propiedades clave.En cada intervalo, el identificador del ticket comprado.Por ejemplo, un índice de 0 representa un identificador de ticket de la estación 0 a la estación 1.Si está vacío, no hay ningún vale de suscripción. |

Con el diseño de esta estructura de datos, se pueden implementar dos empresas.

##### Compruebe que se puede comprar

Al pasar en dos identificaciones de estación, puede averiguar si esto pertenece a este SeatGrain.Y consultar todos los segmentos de intervalo correspondientes a los puntos inicial y final.Simplemente juzgue si todos los segmentos de RequestIds no tienen un identificador de ticket.Si no, se puede comprar.Si ya hay un ID de compra de entradas en cualquier sección, la compra ya no es posible.

Por ejemplo, la situación actual con las estaciones es 10, 11, 12, 13. RequestIds, por otro, son 0,1,0.

Por lo tanto, si está comprando un billete de 10>12, eso no es posible porque el segundo rango de RequestIds ya se ha comprado.

Sin embargo, si desea>entradas de 10  11, puede hacerlo, porque nadie en el primer rango de RequestIds todavía tiene que comprarlos.

##### Comprar

Simplemente coloque los puntos inicial y final en todos los ajustes del segmento de intervalo en RequestIds.

##### Casos de pruebas unitarias

Los siguientes vínculos le permiten ver la implementación de código de los algorithm：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/blob/master/src/Newbe.Claptrap.Ticketing/Newbe.Claptrap.Ticketing.Actors.Tests/TicketingTest.cs)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/blob/master/src/Newbe.Claptrap.Ticketing/Newbe.Claptrap.Ticketing.Actors.Tests/TicketingTest.cs)

#### Diseñe el billete restante para todos los asientos en el mismo viaje que un Claptrap-TrainGran

El estado de Claptrap contiene información básica

| Tipo                                               | Nombre     | Descripción                                                                                                                                                                                                                                                                       |
| -------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IReadOnlyList&lt;int&gt;               | Estaciones | La lista de identificación de las estaciones de ruta, comenzando con la estación de origen y terminando con la terminal.Valide en la consulta principal.                                                                                                                          |
| I Diccionario&lt;StationTuple, int&gt; | SeatCount  | Propiedades clave.StationTuple representa un punto de partida.La colección contiene los tickets restantes para todos los posibles puntos de inicio y fin.Por ejemplo, según lo anterior, si el paseo pasa a través de 34 ubicaciones, el diccionario contiene 561 pares de claves |

En función de la estructura de datos anterior, solo necesita sincronizar la información correspondiente con el grano después de que se haya completado cada orden De SeatGrain.

Por ejemplo, si a,c tiene una compra de entradas, los tickets restantes para a,c/a,b/b,c se reducirán en uno.

Esto se puede lograr con el mecanismo Minion integrado en este marco.

Vale la pena mencionar que se trata de un diseño más grande que el "recurso competitivo mínimo".Dado que el escenario de consulta no necesita ser absolutamente rápido en ese escenario empresarial.Este diseño reduce la complejidad del sistema.

## Resumen

En este artículo, a través del análisis de negocios, hemos llegado a una combinación de gestión residual de billetes de tren y Newbe.Claptrap.

A continuación, nos centraremos en el diseño de este artículo, explicando cómo desarrollar, probar e implementar.

De hecho, se ha creado el código fuente del proyecto y los lectores pueden obtener el：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples)

Agradecimiento especial[interfaz de](https://github.com/wangjunjx8868)wangjunjx8868 creada con Blazor para este ejemplo.

<!-- md Footer-Newbe-Claptrap.md -->
