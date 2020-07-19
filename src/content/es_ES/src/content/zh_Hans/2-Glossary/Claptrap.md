---
title: 'Claptrap'
metaTitle: 'Claptrap'
metaDescription: 'Claptrap'
---

> [当前查看的版本是由机器翻译自简体中文，并进行人工校对的结果。若文档中存在任何翻译不当的地方，欢迎点击此处提交您的翻译建议。](https://crwd.in/newbeclaptrap)

En pocas palabras, Claptrap . . . [Actor](/zh_Hans/2-Glossary/Actor-Pattern) + [Seguimiento de eventos](/zh_Hans/2-Glossary/Event-Sourcing)

![Claptrap](/images/20190228-001.gif)

Claptrap es un actor especial definido en este marco.除了 Actor 的基础特性之外，Claptrap 还被定义为具有以下特性：

**El estado está controlado por el evento**。El estado del Actor se mantiene dentro del Actor.Lo mismo ocurre con Claptrap, pero cambiar el estado de Claptrap, además del actor, lo limita a cambiar sólo a través de eventos.Esto combina el patrón de trazabilidad de eventos con el patrón Actor.La corrección y trazabilidad del estado Actor están garantizadas por el modo de trazabilidad de eventos.Estos eventos que cambian el estado de Claptrap son generados por Claptrap sí mismo.El evento puede ocurrir debido a una llamada externa o debido a un mecanismo de desencadenador de clase dentro de Claptrap.

> Claptrap 是 newbe36524 曾经玩过的一款老游戏中的经典角色。[点击此处了解](https://zh.moegirl.org/%E5%B0%8F%E5%90%B5%E9%97%B9)

---

La siguiente es una descripción basada en la historia de Claptrap para ayudar a la comprensión.No me importa demasiado.

Claptrap es un robot funcional y fácil de estructurar.Aunque puede realizar una amplia variedad de tareas, tiene algunas limitaciones.

Claptrap es un robot de un solo subproceso que solo puede realizar una tarea a la vez.Si desea darle varias tareas, se manejará una por una en el orden en que se programan las cosas.

El trabajo de Claptrap es probablemente así.Cuando acepte una tarea, primero considerará si puede hacerlo al 100 por ciento.Si puede hacerlo al 100 por ciento, entonces escríbalo en su nota y termine.A continuación, proceda a lo siguiente.

Lo primero que Claptrap hace cada mañana es encontrar tu yo perdido.Recupera el palo de ti mismo ayer.En primer lugar, tratará de ver si hay una hermosa imagen de ayer, si la hay, volverá a encarcelar la aparición de ayer.A continuación, lea el memorándum en su mano lo que sucedió después de la sesión de fotos de ayer, y restaurar gradualmente su memoria.Esto tendrá éxito en encontrarse a sí mismo.

Claptrap es un robot estandarizado.Todos ellos se producen en la línea de producción de la planta de Claptrap.La fábrica ensambla un robot Claptrap utilizando componentes estandarizados basados en el diseño Claptrap.Estos componentes necesarios incluyen, entre otras cosas,：Memoria, notas portátiles, procesadores de tareas multifunción e impresoras de memoria.

Memoria.Claptrap está equipado con una memoria de tamaño personalizado que contiene los datos de estado de la máquina actual.Debido a la pérdida de energía volátil de los datos de memoria, si Claptrap pierde energía, los datos en la memoria se pierden.

Procesador de tareas multiusos.Basado en consideraciones de costos, cada Claptrap está equipado con un procesador de tareas multiusos que se adapta a tareas especiales.Por ejemplo,：Claptrap, dedicado al fuego, incluye esencialmente funciones relacionadas con el fuego en sus procesadores de tareas multipropósito.Pero no puede manejar tareas relacionadas con el país.

Nota de mano.Claptrap utiliza una nota de mano para registrar todos los detalles de la tarea antes de realizar cada tarea para asegurarse de que cada detalle de la tarea es preciso.

Impresora de memoria.Los datos en la memoria se pueden imprimir en un formato físico que se puede conservar, y más en la producción real es la memoria de ADN.Debido a la pérdida de energía volátil de los datos de memoria, los datos en la memoria después del reinicio solo se pueden recuperar uno por uno a través de registros de notas.Pero debido a que es probable que los datos de la nota sean grandes, la recuperación será lenta.Con la ayuda de una impresora de memoria, puede imprimir completamente el estado de memoria en algún momento, lo que acelera la recuperación de datos de memoria al reiniciar la recuperación.
