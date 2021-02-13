---
title: 'Estado (Estado)'
description: 'Estado (Estado)'
---

State representa el rendimiento de datos actual del objeto Actor en el modo Actor.Claptrap simplemente añade un límite a esta："El estado solo se puede actualizar mediante el abastecimiento de eventos".Debido a la fiabilidad de la trazabilidad de eventos, State in Claptrap también tiene una mejor fiabilidad.

## El número de versión del Estado

Estado en Claptrap tiene una propiedad denominada Version que representa la versión actual de State.El número de versión es un número autoagregado que comienza en 0 y se autoegreda después de procesar cada evento.

El estado con el número de versión 0 es el estado inicial de Claptrap y también se puede llamar un estado Génesis.El estado inicial se puede personalizar según las necesidades de la empresa.

Claptrap y Minion también tienen algunas diferencias en la forma en que se manejan los números de versión.

Para Claptrap, Claptrap es el productor del evento, por lo que el número de versión del evento en sí es dado por Claptrap.Por ejemplo, durante el procesamiento de un evento, se producirán las siguientes cosas en turn：

1. Versión del Estado 1000
2. Iniciar el procesamiento de eventos, cuya versión s Estado versión s 1 s 1001
3. Evento se procesa, actualizar la versión de estado s 1001

Para Minion, porque es un consumidor de eventos Claptrap.Por lo tanto, el número de versión se maneja de forma ligeramente diferente.Por ejemplo, durante el procesamiento de un evento, se producirán los siguientes eventos：

1. Versión del Estado 1000
2. Se leyó un evento con la versión 1001 del evento
3. Evento se procesa, actualizar la versión de estado s 1001

El número de versión del estado y el número de versión del evento son interdependientes y se validan mutuamente, que es la clave para el orden de los eventos.Si hay una discrepancia entre el número de versión del estado y el número de versión del evento durante el procesamiento, esto puede ser un problema grave.En general, hay una discordancia del número de versión, y hay solamente dos casos：

1. Se han perdido eventos en la capa de persistencia
2. Error maligno del marco

## Icono

![claptrap](/images/claptrap_icons/state.svg)
