---
title: 'Claptrap'
description: 'Claptrap'
---

En pocas palabras, Claptrap [Actor](02-1-Actor-Pattern) [evento trace](02-2-Event-Sourcing)

![Claptrap](/images/20190228-001.gif)

Claptrap es un actor especial definido en este marco.Además de las características subyacentes del actor, Claptrap se define como tener la siguiente：

**estado de  se controla mediante el**de eventos.El estado del Actor se mantiene dentro del Actor.Lo mismo ocurre con Claptrap, pero cambiar el estado de Claptrap lo limita a los eventos, además de Actor.Esto combina el patrón de abastecimiento de eventos con el patrón Actor.La exactitud y trazabilidad del estado del actor está garantizada a través del modo de abastecimiento de eventos.Estos eventos que cambian el estado de Claptrap son generados por claptrap sí mismo.Los eventos pueden ocurrir entre llamadas externas y mecanismos de desencadenador de clase dentro de Claptrap.

> Claptrap es un personaje clásico en un viejo juego que newbe36524 ha jugado.[haga clic aquí para obtener](https://zh.moegirl.org/%E5%B0%8F%E5%90%B5%E9%97%B9)

---

La siguiente es una descripción historiada de Claptrap para ayudar a la comprensión.No te preocupes demasiado.

Claptrap es un robot de estructura simple y función simple.Aunque puede realizar una variedad de tareas, tiene algunas limitaciones.

Claptrap es un robot de un solo subproceso que solo puede realizar una tarea a la vez.Si desea darle varias tareas, se manejará una por una en el orden en que se organizan las cosas.

El trabajo de Claptrap es probablemente así.Cuando acepte una tarea, primero considerará si es 100 por ciento lograble.Si puede hacerlo al 100 por ciento, escríbalo en su nota y termínalo.Entonces pasa a lo siguiente.

Lo primero que Claptrap hace cada mañana es encontrar su yo perdido.Recupera el gran yo que eras ayer.En primer lugar, tratará de ver si hay bellas imágenes de ayer, si las hay, volverá a grabar la apariencia de ayer.A continuación, lea el memorándum en su mano lo que sucedió después de la sesión de fotos de ayer y restaurar gradualmente su memoria.De esta manera, el éxito de la recuperación de los suyos.

Claptrap es un robot estandarizado.Todos ellos se producen en la línea de producción de la planta de Claptrap.La planta ensambla un robot Claptrap utilizando componentes estandarizados de acuerdo con el diseño de Claptrap.Estos componentes necesarios incluyen：memoria, notas de mano, procesadores de tareas multifunción e impresoras de memoria.

Memoria.Claptrap está equipado con una memoria de tamaño personalizado para contener los datos de estado actuales para toda la máquina.Debido al apagado de los datos de memoria, si Claptrap pierde energía, los datos en la memoria se pierden.

Procesador de tareas multifuncional.Por razones de costo, cada Claptrap está equipado con un procesador multitarea personalizado para tareas especiales.Para：Claptrap, que se especializa en la lucha contra incendios, básicamente incluye características relacionadas con el fuego en sus procesadores de tareas multifunción.Pero no puede manejar tareas domésticas.

Memorandos de mano.Antes de cada tarea, Claptrap registra todos los detalles de la tarea con una nota de mano para asegurarse de que cada detalle de la tarea es preciso.

Impresora de memoria.Los datos de la memoria se pueden imprimir en un formato físico que se puede conservar y se utilizan más memorias de ADN en la producción real.Debido al apagado de los datos de memoria, los datos en la memoria solo se pueden recuperar uno por uno a través de registros de notas después del reinicio.Pero debido a que es probable que los datos de la nota sean grandes, será lento recuperarse.Con la ayuda de una impresora de memoria, puede imprimir el estado de memoria en un determinado momento, lo que acelera la recuperación de datos de memoria al reiniciar la recuperación.

## Icono

![claptrap](/images/claptrap_icons/claptrap.svg)
