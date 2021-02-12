---
title: 'Modo actor'
description: 'Modo actor'
---

El patrón Actor es un modelo de programación estándar.A través de la aplicación de este modelo de programación, algunos sistemas pueden resolver el problema de la complejidad.El problema con la unión mencionada aquí es que cuando un equipo procesa lógicamente los mismos datos, puede causar datos incorrectos debido a múltiples solicitudes simultáneas.Este es un problema que debe encontrar cuando está programando multiproceso.举个简单的例子，假如在不加同步锁的情况下，使用 100 个线程并发对内存中的一个 int 变量执行 ++ 操作。A continuación, el resultado de esta variable suele ser inferior a 100.Así es como el patrón Actor evita este problema.

En primer lugar, para facilitar la comprensión, el lector puede pensar en Actor como un objeto aquí.En los lenguajes orientados a objetos (Java, C, etc.), el actor puede considerarse como un objeto creado``la nueva palabra clave.Pero este objeto tiene un characteristics：especial

**tiene un estado que pertenece a**.Todos los objetos pueden tener sus propias propiedades, que es una característica básica de los lenguajes orientados a objetos.在 Actor 模式中，这些属性都被统称为 Actor的状态（State） 。El estado del actor es mantenido por el propio actor.

Esto pone de relieve dos points：

En primer lugar, el estado de Actor sólo se puede cambiar por sí mismo, y para cambiar el estado de Actor desde el exterior, sólo se puede cambiar llamando a Actor.

![Actualizar el estado del actor](/images/20190226-001.gif)

En segundo lugar, el estado del actor se mantiene solo dentro de Actor y no se comparte con ningún objeto que no sea el actor actual.La falta de uso compartido aquí también hace hincapié en que no puede cambiar el estado interno de Actor a través de un cambio en una propiedad externa.Esto es principalmente para distinguirlo de los lenguajes de programación con características de lenguaje de "referencia de objetos".Por example：la propiedad de</code>pública`de<code>`de clase de C- puede cambiar la propiedad`en<code>clase`</code>después de que sea un tipo de referencia, si es un tipo de referencia.Pero esto no está permitido en el modo Actor.

![Compartir el estado de Actor](/images/20190226-003.gif)

Sin embargo, la lectura de datos desde el interior de Actor al exterior todavía está permitida.

![Leer el estado del actor](/images/20190226-002.gif)

****de un solo subproceso.El actor normalmente acepta solo una llamada a la vez.Los subprocesos descritos aquí no son exactamente subprocesos en el equipo y se utilizan para resaltar los "atributos que Actor solo puede controlar una solicitud a la vez."Si Actor está aceptando actualmente una llamada, las llamadas restantes se bloquean hasta que finaliza la llamada y se permite la siguiente solicitud.Esto es realmente similar a un mecanismo para sincronizar bloqueos.Este mecanismo evita la posibilidad de un problema con la presencia de un problema al modificar el estado interno del actor.Specifically：Si usa 100 subprocesos para realizar una llamada a un actor en una variable de</code>int`, déjele hacer<code>`.El valor final para este estado debe ser 100.

![El actor se llama en un sintetizador](/images/20190226-004.gif)

Sin embargo, el subprocesamiento único no es absoluto, lo que permite el procesamiento 2000 en ausencia de una solicitud de un problema.Por ejemplo, lea el estado en Actor, que normalmente no tiene un problema con el symp, por lo que se permite la misma operación en este momento.

![Leer actor al mismo tiempo](/images/20190226-005.gif)
