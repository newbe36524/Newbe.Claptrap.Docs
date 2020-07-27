---
title: 'Eventos'
metaTitle: 'Eventos'
metaDescription: 'Eventos'
---

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

Claptrap es un patrón de actor basado en eventos.Naturalmente, los eventos juegan un papel crucial.

Necesitas pasar eventos si quieres manipular Claptrap.Los eventos también son los únicos parámetros que cambian el estado de Claptrap.Por lo tanto, al crear un sistema con Claptrap, todas las operaciones del sistema se convierten en eventos y se pasan a Claptrap.Los eventos tienen estas características.：

## Los eventos son ordenados.

Cada evento contiene un número de serie único.En este marco, este número de serie se denomina número de versión.El número de versión del evento es una secuencia que incrementa 1 por uno.El orden del evento garantiza que el estado se calcula sin simultaneidad.Esta es una garantía importante de fiabilidad de los datos de estado.

El orden de los eventos refleja directamente la secuencia en la que Claptrap ejecuta eventos.Y debido a la necesidad de garantizar este pedido, Claptrap debe manejar los eventos en una base de incidente por evento.Esto sucede que tiene un ajuste natural con la naturaleza de un solo hilo del patrón Actor.

## Los eventos son inmutables.

Una vez que se produce un evento, es inmutable.El origen de los eventos, debido a la inmutabilidad de los eventos, hace que los datos sean fiables.Dado que mientras se lea el evento, es posible restaurar el estado después de ejecutar cualquier evento.Pero la inmutabilidad no es una limitación física.Todavía puede modificar los datos de eventos en el almacenamiento físico.Tenga en cuenta, sin embargo, que este es un comportamiento peligroso y extremadamente no recomendado.Vamos a relacionarnos con el "principio abierto y cercano" en el modo de diseño, que se puede resumir como "abierto a la expansión, cerrado a la modificación".¿Por qué debería haber un énfasis en "cerrado a la modificación"?En opinión del autor, el motivo del cierre de la modificación se debe en realidad a la naturaleza desconocida provocada por la modificación.Debido a la ejecución pasada del código, se generan los datos.Todos ellos han formado un cierto grado de cierre.Han sido validados por pruebas existentes.Si intenta modificarlas, está obligado a tener que ajustar las pruebas, lo que exacerba aún más las modificaciones, lo que no es algo bueno.La naturaleza inmutable de los eventos es un requisito.

Entonces, ¿qué pasa si los datos de eventos generados por el pasado son incorrectos debido a un BUG y el error necesita ser reparado ahora?El consejo del autor es no intentar modificar los eventos existentes.Se deben anexar nuevos eventos y algoritmos para corregir el estado actual.No ajustes el contenido antiguo.El autor piensa que esto está más en línea con el principio de apertura y cierre.Los desarrolladores están a su discreción.

## El evento es permanente.

Los eventos son un parámetro importante para garantizar la corrección del estado de Claptrap.Por lo tanto, debe asegurarse de que el evento se guarda de forma permanente.Sin embargo, este no es un caso absoluto, y si se cumplen las siguientes condiciones, se permite perder el evento.：

1. Hay una instantánea de estado permanente antes de que se pierda el evento.
2. El Claptrap correspondiente está muerto y nunca se activará de nuevo.

Por el contrario, si no se cumplen las condiciones anteriores, es importante asegurarse de que los eventos en el entorno de producción se conservan correctamente en la capa de persistencia y que hay análisis de tolerancia ante desastres adecuados.

## Icono.

![Una trampa.](/images/claptrap_icons/event.svg)
