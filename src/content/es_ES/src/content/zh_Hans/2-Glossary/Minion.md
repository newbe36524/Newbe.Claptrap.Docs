---
title: 'Súbdito'
metaTitle: 'Súbdito'
metaDescription: 'Súbdito'
---

> [当前查看的版本是由机器翻译自简体中文，并进行人工校对的结果。若文档中存在任何翻译不当的地方，欢迎点击此处提交您的翻译建议。](https://crwd.in/newbeclaptrap)

![Súbdito](/images/20190228-002.gif)

Minion es un Claptrap especial definido por este marco.es un ajuste basado en Claptrap.Tiene las siguientes características：

**Leer evento de la Claptrap correspondiente**。Al igual que Claptrap, el estado del súbdito está controlado por eventos.La diferencia es que Minion, al igual que su significado literal, siempre obtiene eventos de la Claptrap correspondiente, cambiando su estado.Por lo tanto, puede controlar de forma asincrónica las acciones posteriores después del evento generado por The Claptrap.

> Minion 一词出自 newbe36524 玩的一款运气游戏[《炉石传说》](https://zh.moegirl.org/%E7%82%89%E7%9F%B3%E4%BC%A0%E8%AF%B4)，其中“随从”在英文版中的描述即为“minion”。

---

La siguiente es una descripción basada en la historia de Minion para ayudar a la comprensión.No me importa demasiado.

Para tareas más complejas, un solo Claptrap puede ser difícil de completar.Por lo tanto, al diseñar este tipo de Claptrap, algunos hermanos más pequeños se añaden a la Claptrap según sea necesario para ayudarle con la tarea en cuestión.Estos hermanitos se llaman Minions.La esencia de Minion es también un robot Claptrap, pero reducen el dispositivo de memoria de mano en comparación con la versión completa de Claptrap.Esta es la razón por la que funciona ligeramente diferente de Claptrap.

Los esbirros solo pueden completar tareas colaborando con Claptrap, y no pueden decidir si hacer una tarea.Por lo tanto, una nota de mano que registra los detalles de la tarea siempre y cuando la trampa la sostenga.

Cuando Claptrap completa una tarea, informa a sus esbirros sobre los detalles de la tarea.Esto permite a Minion sincronizar el contenido de la tarea y usarlo para actualizar tu memoria.Vamos a explicar este patrón de trabajo en un ejemplo.

Digamos que ahora hemos puesto un robot Claptrap en un vecindario para actuar como un robot portero.Sus responsabilidades laborales incluyen tener lo siguiente：

1. Responsable de inspeccionar y liberar vehículos en el conserje
2. Responsable de tratar con todo tipo de consultas de los transeúntes

Ahora sabemos que los robots Claptrap solo pueden manejar una cosa a la vez mientras trabajan.Es decir, si está inspeccionando y liberando un vehículo, no será capaz de manejar las consultas de los transeúntes.Del mismo modo, si está siendo cuestionado por los transeúntes, no podrá manejar la inspección y liberación del vehículo.No es eficiente.Por lo tanto, añadimos un esbirro a esta claptrap para ayudarle con la tarea de ser preguntado por los transeúntes.

La forma específica de trabajar es esta：Todos los días, Claptrap comprueba la situación en todo el vecindario y registra toda la información específica en una nota de mano.E informa a su Esbirro de los detalles de estas tareas.Así que Minion conocía todos los detalles sobre el vecindario, por lo que fue capaz de lidiar fácilmente con las preguntas de los transeúntes.

Esta colaboración permite a Claptrap centrarse de forma más eficiente en la inspección y liberación del vehículo, mientras que las consultas de los transeúntes se dejan en manos de Minion.

Sin embargo, se necesitan explicaciones adicionales para que algunos detalles sean entendidos por el lector：

¿Por qué no añadir un nuevo Claptrap para manejar las consultas de los transeúntes directamente?Un nuevo Claptrap significa una nueva entidad que puede completar tareas de forma independiente, lo que aumenta el costo de administración.Pero si agregas solo un Esbirro, puede ser manejado por el Claptrap al que pertenece, que es más fácil de manejar de lo que es.Por supuesto, con el fin de añadir un poco de sentido de generación, también se puede entender así：Minion carece del dispositivo de notas de mano en comparación con el Claptrap normal.El costo de este dispositivo es el 99% del costo total del hardware.Reduzca los costos para realizar la misma tarea, ¿por qué no?

¿El costo de Notificar a Minion de los detalles de la tarea por Claptrap es alto?No, no lo hará.Claptrap y Minion son generalmente trabajos de pandillas, y a medida que la tecnología de red inalámbrica continúa mejorando, el costo se volverá cada vez más pequeño.Empoderamiento 5G, futuro.

Ahora, vamos a considerar un escenario adicional.：Si el administrador de la propiedad quiere que Claptrap informe regularmente sobre los movimientos de vehículos en el área.Del mismo modo, con el fin de aumentar la sensación de admisión, también podemos suponer que la comunidad está muy ocupada, con vehículos que entran y salen las 24 horas del día.Así que si le permite llegar a tiempo para informar sobre el acceso al vehículo, es probable que la puerta del vecindario será bloqueada debido a la naturaleza de un solo hilo de Claptrap.

Con la experiencia que hemos tenido anteriormente, también podemos equipar este Claptrap con un nuevo Minion para manejar la tarea de informar al administrador de la propiedad.Porque Claptrap notificará a Minion los detalles cuando el vehículo está siendo inspeccionado.Así que Minion conoce todos los detalles sobre el acceso al vehículo de hoy y hace una declaración, que es minuto a minuto.

Vamos a añadir otra escena.：Tenemos que hacer un censo de la población.Entonces sólo tiene que comprobar el personal de acceso en el portero de la comunidad Claptrap, la información de la persona se registra.Del mismo modo, agregaremos un minion para compilar esos datos principales y poner el departamento principal en.Coincidentemente, el departamento matriz también recibe el informe de datos del subordinado a través de un robot Claptrap, y también tiene un esbirro que resume los datos del informe subordinado y los reporta a su superior.Eso es lo que Claptrap1 -> Minion1 -> Claptrap2 -> Minion2 -> Claptrap3 …… Una capa arriba.Así que completamos una agregación de datos nacional y global.

Así que podemos resumir.Con la adición de Minion, puedes hacer al menos tres cosas mejor para Claptrap：

1. Ayudar a compartir las tareas originales de la clase de consulta
2. Ayudar a las estadísticas, notificaciones y más que se pueden manejar de forma asincrónica
3. Ayudar a inge con otros Claptraps para realizar tareas más grandes
