---
title: 'Estado'
metaTitle: 'Estado'
metaDescription: 'Estado'
---

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

State representa la representación de datos actual del objeto Actor en el patrón Actor.Claptrap sólo añade un límite a esto.："El estado sólo se puede actualizar de una manera rastreada por el evento."由于事件溯源的可靠性，Claptrap 中的 State 也就拥有了更好的可靠性。

## State 的版本号

在 Claptrap 中的 State 有一个名为 Version 的属性，它表示 State 当前的版本。版本号是一个从 0 开始的自增数字，会在每次处理一个事件之后进行自增。

State Claptrap con el número de versión 0 es el estado inicial de Claptrap y también se puede llamar el estado Génesis.El estado inicial se puede personalizar según las necesidades empresariales.

Hay algunas diferencias entre el manejo de los números de versión de Claptrap y Minion.

Para Claptrap, Claptrap es el productor del evento, por lo que el número de versión del evento en sí es dado por Claptrap.Por ejemplo, durante el procesamiento de un evento, a su vez se producirán las siguientes cosas.：

1. Versión de estado . . 1000.
2. Comience a trabajar con Event, cuya versión es el estado Versión s 1 s 1001.
3. El evento ha terminado y la versión de estado se actualiza para 1001.

Para Minion, porque es un consumidor del evento The Claptrap.Por lo tanto, el procesamiento del número de versión es ligeramente diferente.Por ejemplo, durante el procesamiento de un evento, a su vez se producen los siguientes eventos.：

1. Versión de estado . . 1000.
2. Lea el evento que la versión del evento es 1001.
3. El evento ha terminado y la versión de estado se actualiza para 1001.

El número de versión del estado y el número de versión del evento son interdependientes y se verifican mutuamente, lo que es clave para el orden de eventos.Si hay una discordancia entre el número de versión del estado y el número de versión del evento durante el procesamiento, esto puede ser un problema grave.En general, hay una discordancia de número de versión, en dos casos.：

1. Faltan eventos en la capa de persistencia.
2. Encuadre de BUG maligno.

## ICON

![Una trampa.](/images/claptrap_icons/state.svg)
