---
title: 'Diseño'
description: 'Sistema de emisión de billetes de tren - diseño'
---


## Análisis de negocio

### Límites empresariales

El sistema contiene sólo la parte restante de la gestión de tickets del billete.Es decir, consultar los asientos restantes, pedir un boleto para reducir el asiento.

La generación de información de pedidos, pago, control de tráfico, solicitud de control eólico, etc. no se incluyen en el ámbito de esta discusión.

### Casos de uso empresarial

- Compruebe los billetes restantes y pueda comprobar el número de billetes disponibles entre las dos estaciones y el número de asientos restantes.
- Compruebe los billetes restantes correspondientes al número de viajes, puede consultar el número dado de veces, entre las estaciones cuántos asientos quedan.
- Soporte para la selección de asientos, los clientes pueden elegir un número determinado de coches y asientos, y pedir boletos.

## Implementar análisis difíciles

### Gestión de tickets residuales

La dificultad de la gestión residual del billete de tren reside en la particularidad del inventario de billetes restante.

Los bienes de comercio electrónico ordinarios, SKU como la unidad más pequeña, cada SKU es independiente entre sí, no se afectan entre sí.

Los billetes restantes para el tren son diferentes, ya que se verán afectados por la venta de billetes desde el final del plazo.Aquí hay un modelo lógico simple para obtener una mirada detallada a esta particularidad.

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

Si un cliente ha comprado un billete a,c.Así que ya que sólo hay un asiento, no hay boletos restantes que no sean c,d.La situación de voto restante se convierte en la siguiente：

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

## Diseño del cuerpo de Claptrap

![Diseño del sistema de venta de billetes de tren](/images/20200720-001.png)

### Diseñe cada asiento en el mismo viaje que un Claptrap-SeatGrain

El estado de Claptrap contiene una información básica

| Tipo                                    | Nombre     | Descripción                                                                                                                                                                                                                    |
| --------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| IList&lt;int&gt;            | Estaciones | La lista de identificación de las estaciones de ruta, comenzando con la estación de origen y terminando con la terminal.Verificación en el momento de la compra del billete principal.                                         |
| Diccionario&lt;int, int&gt; | StationDic | Diccionario inverso de índice que enruta el identificador de estación.Las estaciones son una lista de ids de índice, y el diccionario es el diccionario id-index correspondiente, con el fin de acelerar las consultas.        |
| Lista&lt;string&gt;         | RequestIds | Propiedades clave.En cada intervalo, el identificador del ticket comprado.Por ejemplo, un índice de 0 representa un identificador de ticket de la estación 0 a la estación 1.Si está vacío, no hay ningún vale de suscripción. |

Con el diseño de esta estructura de datos, se pueden implementar dos empresas.

#### Compruebe que se puede comprar

Al pasar en dos identificaciones de estación, puede averiguar si esto pertenece a este SeatGrain.Y consultar todos los segmentos de intervalo correspondientes a los puntos inicial y final.Simplemente juzgue si todos los segmentos de RequestIds no tienen un identificador de ticket.Si no, se puede comprar.Si ya hay un ID de compra de entradas en cualquier sección, la compra ya no es posible.

Por ejemplo, la situación actual con las estaciones es 10, 11, 12, 13. RequestIds, por otro, son 0,1,0.

Por lo tanto, si está comprando un billete de 10>12, eso no es posible porque el segundo rango de RequestIds ya se ha comprado.

Sin embargo, si desea>entradas de 10  11, puede hacerlo, porque nadie en el primer rango de RequestIds todavía tiene que comprarlos.

#### Comprar

Simplemente coloque los puntos inicial y final en todos los ajustes del segmento de intervalo en RequestIds.

### Diseñe el billete restante para todos los asientos en el mismo viaje que un Claptrap-TrainGran

El estado de Claptrap contiene información básica

| Tipo                                               | Nombre     | Descripción                                                                                                                                                                                                                                                                       |
| -------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IReadOnlyList&lt;int&gt;               | Estaciones | La lista de identificación de las estaciones de ruta, comenzando con la estación de origen y terminando con la terminal.Valide en la consulta principal.                                                                                                                          |
| I Diccionario&lt;StationTuple, int&gt; | SeatCount  | Propiedades clave.StationTuple representa un punto de partida.La colección contiene los tickets restantes para todos los posibles puntos de inicio y fin.Por ejemplo, según lo anterior, si el paseo pasa a través de 34 ubicaciones, el diccionario contiene 561 pares de claves |

En función de la estructura de datos anterior, solo necesita sincronizar la información correspondiente con el grano después de que se haya completado cada orden De SeatGrain.

Por ejemplo, si a,c tiene una compra de entradas, los tickets restantes para a,c/a,b/b,c se reducirán en uno.

Esto se puede lograr con el mecanismo Minion integrado en este marco.

Vale la pena mencionar que se trata de un diseño más grande que el "recurso competitivo mínimo".Dado que el escenario de consulta no necesita ser absolutamente rápido en ese escenario empresarial.Este diseño reduce la complejidad del sistema.

## Id

![Identificación del sistema de emisión de billetes de tren](/images/20200813-001.png)
