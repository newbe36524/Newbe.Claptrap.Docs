---
title: "Modo actor"
description: "Modo actor"
---

El patrón Actor es un modelo de programación estándar.A través de la aplicación de este modelo de programación, algunos sistemas pueden resolver el problema de la complejidad.El problema con la unión mencionada aquí es que cuando un equipo procesa lógicamente los mismos datos, puede causar datos incorrectos debido a múltiples solicitudes simultáneas.Este es un problema que debe encontrar cuando está programando multiproceso.Para dar un ejemplo sencillo, si utiliza 100 subprocesos en un bloqueo no sincrónico para realizar una operación s. . . en una variable int en la memoria.A continuación, el resultado de esta variable suele ser inferior a 100.Así es como el patrón Actor evita este problema.

En primer lugar, para facilitar la comprensión, el lector puede pensar en Actor como un objeto aquí.在面向对象的语言（Java、C#等）当中，可以认为 Actor 就是通过 new 关键词创建出来的对象。Pero este objeto tiene un characteristics：especial

**tiene un estado que pertenece a**.Todos los objetos pueden tener sus propias propiedades, que es una característica básica de los lenguajes orientados a objetos.在 Actor 模式中，这些属性都被统称为 Actor 的状态（State） 。El estado del actor es mantenido por el propio actor.

Esto pone de relieve dos points：

En primer lugar, el estado de Actor sólo se puede cambiar por sí mismo, y para cambiar el estado de Actor desde el exterior, sólo se puede cambiar llamando a Actor.

![Actualizar el estado del actor](/images/20190226-001.gif)

En segundo lugar, el estado del actor se mantiene solo dentro de Actor y no se comparte con ningún objeto que no sea el actor actual.La falta de uso compartido aquí también hace hincapié en que no puede cambiar el estado interno de Actor a través de un cambio en una propiedad externa.Esto es principalmente para distinguirlo de los lenguajes de programación con características de lenguaje de "referencia de objetos".例如：在 C#的 class 的 public 属性，假如是引用类型，那么在外部获得这个 class 之后是可以改变 class 中的属性的。Pero esto no está permitido en el modo Actor.

![Compartir el estado de Actor](/images/20190226-003.gif)

Sin embargo, la lectura de datos desde el interior de Actor al exterior todavía está permitida.

![Leer el estado del actor](/images/20190226-002.gif)

****de un solo subproceso.El actor normalmente acepta solo una llamada a la vez.Los subprocesos descritos aquí no son exactamente subprocesos en el equipo y se utilizan para resaltar los "atributos que Actor solo puede controlar una solicitud a la vez."Si Actor está aceptando actualmente una llamada, las llamadas restantes se bloquean hasta que finaliza la llamada y se permite la siguiente solicitud.Esto es realmente similar a un mecanismo para sincronizar bloqueos.Este mecanismo evita la posibilidad de un problema con la presencia de un problema al modificar el estado interno del actor.具体一点说明：如果使用 100 个线程对一个 Actor 进行并发调用，让 Actor 对状态中的一个 int 变量进行 ++ 操作。El valor final para este estado debe ser 100.

![El actor se llama en un sintetizador](/images/20190226-004.gif)

Sin embargo, el subprocesamiento único no es absoluto, lo que permite el procesamiento 2000 en ausencia de una solicitud de un problema.Por ejemplo, lea el estado en Actor, que normalmente no tiene un problema con el symp, por lo que se permite la misma operación en este momento.

![Leer actor al mismo tiempo](/images/20190226-005.gif)
