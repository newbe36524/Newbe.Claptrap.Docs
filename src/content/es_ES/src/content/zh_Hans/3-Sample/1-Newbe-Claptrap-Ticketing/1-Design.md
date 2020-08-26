---
title: 'Diseño.'
metaTitle: 'Sistema de emisión de billetes de tren - diseño.'
metaDescription: 'Sistema de emisión de billetes de tren - diseño.'
---

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

## Análisis de negocios.

### Límites de negocio.

El sistema solo contiene la parte restante de gestión de tickets del ticket.Es decir, consultar los asientos restantes, pedir boletos para reducir los asientos.

La generación de información de pedidos, pago, control de tráfico, solicitud de control eólico, etc. no se incluyen en el ámbito de esta discusión.

### Casos de uso empresarial.

- Consulte los billetes restantes para averiguar el número de viajes disponibles entre las dos estaciones y el número de asientos restantes.
- Consultar la apuesta de billete correspondiente al número de trenes, puede consultar el número dado de trenes, entre las estaciones hay cuántos asientos restantes.
- Se admite la selección de asientos, y los clientes pueden seleccionar un número determinado de coches y asientos y realizar un pedido para comprar un billete.

## Implementar análisis de yiter difícil.

### Gestión de tickets residuales.

La dificultad de la gestión del excedente de billetes de tren radica en la particularidad del resto del inventario de billetes.

Los productos de comercio electrónico ordinarios, con SKU como la unidad más pequeña, cada SKU es independiente entre sí y no se afecta entre sí.

Los billetes de tren son diferentes porque los billetes restantes se verán afectados por el inicio y el final de los billetes vendidos.Aquí hay un modelo lógico simple para echar un vistazo detallado a esta particularidad.

Ahora, supongamos que hay un número de coches pasando a través de cuatro estaciones, a, b, c, d, y al mismo tiempo, simplificamos el escenario, suponiendo que sólo hay un asiento en la fila.

Así que antes de que alguien compre un boleto, los boletos restantes para este viaje son tan follows：

| Desde el final. | La cantidad de boletos restantes. |
| --------------- | --------------------------------- |
| a,b.            | 1。                                |
| a, c.           | 1。                                |
| a, d.           | 1。                                |
| b,c.            | 1。                                |
| b,d.            | 1。                                |
| c, d.           | 1。                                |

Si un cliente ahora ha comprado un ticket,c.Así que ya que sólo hay un asiento, a, b y b, c no tienen boletos restantes.Los votos restantes se convierten en los siguientes：

| Desde el final. | La cantidad de boletos restantes. |
| --------------- | --------------------------------- |
| a,b.            | 0。                                |
| a, c.           | 0。                                |
| a, d.           | 0。                                |
| b,c.            | 0。                                |
| b,d.            | 0。                                |
| c, d.           | 1。                                |

Para decirlo con más fluide, si un cliente compra a, d, todos los boletos restantes se convertirán en 0.Porque el pasajero siempre estaba sentado en el asiento.

Esta es la naturaleza especial del billete de tren：el mismo asiento del mismo tren, el número de billetes restantes en cada punto final se verá afectado por el punto de partida del billete vendido.

Extendiéndose un poco, es fácil concluir que no hay tal efecto entre diferentes asientos en el mismo coche.

### Consultas de boletos restantes.

Como se mencionó en la sección anterior, debido a la particularidad del inventario de boletos restante.Para el mismo tren a, b, c, d, hay 6 opciones de billetes posibles.

Y es fácil concluir que el número de tipos seleccionados se calcula realmente seleccionando una combinación de 2 en los n sitios, que es c (n, 2).

Así que si hay un coche pasando a través de 34 estaciones, la posible combinación es c (34,2) s 561.

Cómo lidiar con los muchos tipos de consultas que pueden existir eficazmente es también un problema que el sistema necesita resolver.

## Diseño del cuerpo de la claptrap.

![Diseño del sistema de venta de billetes de tren.](/images/20200720-001.png)

### Cada asiento en el mismo tren está diseñado como un Claptrap- SeatGrain.

El estado de la claptrap contiene una información básica.

| Tipo.                                   | Nombre.     | Descripción                                                                                                                                                                                                                                                               |
| --------------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IList&lt;int&gt;            | Estaciones. | La lista de identificadores para la estación de trayecto comienza con la estación de origen y termina con la terminal.Verificación en el momento de la compra importante.                                                                                                 |
| Diccionario&lt;int, int&gt; | StationDic. | Diccionario inverso índice del id de la estación de carretera.Las estaciones son una lista de ids de índice, y el diccionario es el diccionario id-index correspondiente para acelerar la consulta.                                                                       |
| Lista&lt;string&gt;         | RequestIds. | Propiedades clave.En cada intervalo, el identificador de ticket para la compra de compra.Por ejemplo, el índice es 0, lo que significa que el identificador de billete de la estación 0 a la estación 1.Si está vacío, no hay ningún vale de suscripción en este momento. |

Con este diseño de estructura de datos, puede implementar dos empresas.

#### Compruebe que está disponible para la compra.

Al pasar en dos identificaciones de estación, se puede averiguar si esto pertenece a este SeatGrain.Y consulte todos los segmentos de intervalo para los puntos inicial y final.Solo diga si esto no tiene un identificador de ticket para todos los segmentos que indique de RequestIds.Si no, significa que se puede comprar.Si tiene un ID en cualquiera de los párrafos, no puede.

Por ejemplo, la situación actual de las estaciones es 10, 11, 12, 13. RequestIds, por otro lado, es 0,1,0.

Por lo tanto, si desea comprar un boleto para 10->12, no porque el segundo rango de RequestIds ya se ha comprado.

Sin embargo, si desea comprar un boleto para 10->11, puede, porque el primer rango de RequestIds aún no está disponible.

#### Comprar.

Puede asignar el start ingon al identificador de vale en todas las configuraciones de intervalo en RequestIds.

### Los billetes restantes para todos los asientos en el mismo tren están diseñados como Un Claptrap-TrainGran.

El estado de la trampa contiene información básica.

| Tipo.                                              | Nombre.     | Descripción                                                                                                                                                                                                                                                 |
| -------------------------------------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IReadOnlyList&lt;int&gt;               | Estaciones. | La lista de identificadores para la estación de trayecto comienza con la estación de origen y termina con la terminal.Validar sit en la consulta principal.                                                                                                 |
| I Diccionario&lt;StationTuple, int&gt; | SeatCount.  | Propiedades clave.La tupla de la estación representa un punto de partida.La colección contiene todas las entradas posibles para el inicio y el final.Por ejemplo, si el coche pasa a través de 34 ubicaciones, el diccionario contiene 561 pares de claves. |

En función de la estructura de datos anterior, sólo tiene que sincronizar la información correspondiente con el grano cada vez que SeatGrain completa la realización del pedido.

Por ejemplo, si a, c tiene una compra de boleto, los boletos restantes para a, c/a, b/b, c se reducirán en uno.

Esto se puede hacer aquí con la ayuda del mecanismo Minion integrado en este marco.

Vale la pena mencionar que se trata de un diseño más grande que los "recursos menos competitivos".Dado que el escenario de consulta no necesita velocidad absoluta en ese escenario empresarial.Este diseño reduce la complejidad del sistema.

## Id.

![Identificación del sistema de billetes de tren.](/images/20200813-001.png)
