---
title: 'Súbdito'
description: 'Súbdito'
---

![Súbdito](/images/20190228-002.gif)

Minion es un Claptrap especial como se define en este marco.es un ajuste realizado sobre la base de Claptrap.Tiene los siguientes characteristics：

**puede leer el evento desde la**Claptrap correspondiente.Al igual que Claptrap, el estado del súbdito está controlado por eventos.La diferencia es que Minion, como literalmente lo hace, siempre obtiene eventos de la Claptrap correspondiente, cambiando su propio estado.Por lo tanto, puede controlar Claptrap de forma asincrónica después de generar el evento.

> Minion se deriva de un juego de la suerte jugado por newbe36524[The Legend of furnace stone](https://zh.moegirl.org/%E7%82%89%E7%9F%B3%E4%BC%A0%E8%AF%B4), en el que "entourage" se describe como "minion" en la versión en inglés.

---

La siguiente es una descripción historiada de Minion para ayudar a la comprensión.No te preocupes demasiado.

Un solo Claptrap puede ser difícil de lograr para tareas más complejas.Por lo tanto, al diseñar tal Claptrap, algunos hermanos más jóvenes se añaden a la Claptrap según sea necesario para ayudarla en la tarea en cuestión.Estos hermanitos se llaman Minion.Minion también es esencialmente un robot Claptrap, pero reducen el dispositivo de memoria de mano en comparación con la versión completa de Claptrap.Esto se debe a la forma ligeramente diferente en que funciona y Claptrap.

Minion solo puede realizar tareas trabajando con Claptrap, y no pueden decidir si hacer una tarea.Por lo tanto, una nota de mano que registra los detalles de la tarea está disponible siempre y cuando Claptrap la mantenga.Cuando Claptrap completa una tarea, informa a sus esbirros de los detalles de la tarea.Esto permite a Minion sincronizar el contenido de la tarea y actualizar su propia memoria.Vamos a explicar este patrón de trabajo con un ejemplo.

Digamos que ahora hemos puesto un robot Claptrap en un vecindario como robot portero.Sus responsabilidades laborales incluyen las siguientes：

1. Responsable de la inspección y liberación del vehículo en el portero
2. Responsable de tratar con todo tipo de consultas de los transeúntes

Ahora sabemos que los robots Claptrap sólo pueden manejar una cosa a la vez cuando están trabajando.Es decir, si está inspeccionando y liberando un vehículo, no puede manejar las consultas de los transeúntes.Del mismo modo, si está siendo cuestionado por los transeúntes, no podrá manejar la inspección y liberación de vehículos.Esto no es eficiente.Así que añadimos un esbirro a esta Claptrap para ayudarle con la tarea de ser interrogado por los transeúntes.

La forma específica de trabajar es：Todos los días, Claptrap comprueba la situación alrededor del vecindario y registra toda la información específica en una nota de mano.Y notifica a su Esbirro de los detalles de estas tareas.Así que Minion conocía todos los detalles sobre el vecindario, así que podía manejar fácilmente las consultas de los transeúntes.

Con esta colaboración, Claptrap puede centrarse de manera más eficiente en la inspección y liberación del vehículo, mientras que las consultas de los transeúntes se dejan en manos de Minion.

Sin embargo, algunos detalles deben explicarse adicionalmente para que el lector pueda entender：

¿Por qué no añadir un nuevo Claptrap para hacer frente directamente a las preguntas de los transeúntes?Un nuevo Claptrap significa un nuevo principal que puede completar tareas de forma independiente, lo que aumenta el costo de la administración.Pero si solo agregas un Minion, puede ser administrado por Claptrap, al que pertenece, y es más fácil de manejar que eso.Por supuesto, para añadir un poco de sentido de generación, también se entiende que：Minion carece del dispositivo de notas de mano en comparación con el Claptrap regular.El costo de este dispositivo representa el 99% del costo total del hardware.¿Por qué no reducir los costos para realizar la misma tarea?

¿Sería caro para Claptrap notificar a Minion los detalles de la tarea?No, no lo hará.Claptrap y Minion son generalmente operaciones basadas en pandillas, y a medida que la tecnología de red inalámbrica continúa mejorando, el costo se hará cada vez más pequeño.Empoderamiento 5G, el futuro se puede esperar.

Ahora, estamos considerando un scenario：adicional si el administrador de la propiedad desea Claptrap para informar sobre el acceso de vehículos a la comunidad en un día programado todos los días.Del mismo modo, con el fin de aumentar la sensación de insecoming, también podríamos asumir que la comunidad está muy ocupada, con vehículos que entran y salen las 24 horas del día.Así que si dejas que tome tiempo para informar el acceso del vehículo, debido a la naturaleza de clatrap de un solo hilo, es probable que la puerta del vecindario se bloquee.

Con experiencia previa, también podemos equipar este Claptrap con un nuevo Minion para manejar esta tarea de informar al administrador de la propiedad.Porque Claptrap notifica a Minion los detalles cuando el vehículo sale para la inspección.Así que Minion conoce todos los detalles sobre el acceso al vehículo de hoy y hace una declaración, que es minuto a minuto.

Vamos a añadir otra scenario：necesitamos echar un vistazo a la población.Entonces sólo tiene que registrar la información de la persona cuando el portero de la celda Claptrap comprueba el personal de acceso.Del mismo modo, agregamos un minion para agregar específicamente esos datos principales y poner el departamento principal.Coincidentemente, el departamento matriz también recibe el informe de sub-datos a través de un robot Claptrap, y también tiene un Minion para resumir los datos del sub-informe e informar a su supervisor.Así que Claptrap1 -> Minion1 -> Claptrap2 -> Minion2 -> Claptrap3 …… capa hacia arriba.Así que completamos el resumen de datos nacional y global.

Así que vamos a resumir.Con la adición de Minion, puedes hacer al menos tres cosas mejor para Claptrap：

1. Ayudar a compartir las tareas originales de la clase de consulta
2. Ayudar con las tareas que las estadísticas, las notificaciones, etc. pueden manejar de forma asincrónica
3. Ayuda con otras colaboraciones de Claptrap para realizar tareas más grandes
