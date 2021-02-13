---
title: 'Eventos'
description: 'Eventos'
---

Claptrap es un patrón de actor basado en eventos.Naturalmente, los eventos desempeñan un papel vital.

Para operar Claptrap, necesitas pasarle eventos.Los eventos también son los únicos parámetros que cambian el estado de Claptrap.Por lo tanto, al crear un sistema con Claptrap, todas las operaciones del sistema se convierten en eventos y se pasan a Claptrap.Los eventos tienen los siguientes characteristics：

## Los eventos se ordenan

Cada evento contiene un número de serie único.En este marco, este número de serie se denomina número de versión.El número de versión del evento es una secuencia que aumenta en 1 a 1.El orden del evento garantiza que no haya ningún problema con el cálculo del estado.Esta es una garantía importante de la fiabilidad de los datos de estado.

El orden de los eventos refleja directamente el orden en el que Claptrap ejecuta eventos.Debido a la necesidad de garantizar este orden, Claptrap debe controlar los eventos caso por caso al ejecutar eventos.Esto encaja naturalmente con la naturaleza de un solo hilo del patrón Actor.

## Los eventos se cambian

Una vez que se produce un evento, es imm cambiable.La trazabilidad de eventos hace que los datos sean fiables precisamente debido a la inmutabilidad del evento.Porque siempre que lea el evento, puede restaurar el estado después de ejecutar cualquier evento.Pero la inmutabilidad no es una limitación física.Todavía puede modificar los datos de eventos en el almacenamiento físico.Tenga en cuenta, sin embargo, que este es un comportamiento peligroso y altamente no aconsejado.Vamos a poner en contacto con el "principio de apertura y cierre" en el modo de diseño, el clásico se puede resumir como "abierto a la expansión, cerrado a la modificación".¿Por qué deberíamos enfatizar "cerrado a la modificación"?Desde el punto de vista del autor, la razón de la modificación del cierre se debe en realidad a la naturaleza desconocida provocada por la modificación.Debido al código ejecutado en el pasado, los datos resultantes.Todos ellos han formado un cierto grado de cierre.Han sido validados por pruebas existentes.Si intentas modificarlas, tendrás que ajustar las pruebas, y eso agrava aún más las modificaciones, lo cual no es algo bueno.La naturaleza inmédica del evento es una especie de naturaleza, pero también una especie de requisito.

Entonces, ¿qué pasa si un BUG causa datos de eventos incorrectos en el pasado y necesita ser corregido ahora?El consejo del autor es no intentar modificar los eventos existentes.Se deben anexar nuevos eventos y algoritmos para corregir el estado actual.No ajuste el contenido antiguo.El autor piensa que esto está más en línea con el principio de apertura y cierre.Los desarrolladores pueden hacerlo a su discreción.

## El evento es permanente

Los eventos son parámetros importantes para asegurarse de que Claptrap State es correcto.Por lo tanto, debe asegurarse de que el evento se guarda de forma permanente.Sin embargo, este no es un caso absoluto, y si se cumplen las siguientes condiciones, el evento permite la：

1. Hay una instantánea de estado permanente antes de que se pierda el evento
2. El Claptrap correspondiente está muerto y nunca se activará de nuevo

Por el contrario, si no se cumplen las condiciones anteriores, es importante asegurarse de que los eventos en el entorno de producción se conservan correctamente en la capa de persistencia y que hay medios adecuados de tolerancia ante desastres.

## Icono

![claptrap](/images/claptrap_icons/event.svg)
