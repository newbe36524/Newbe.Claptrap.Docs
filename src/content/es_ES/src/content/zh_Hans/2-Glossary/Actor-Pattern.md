---
title: 'Modo actor'
metaTitle: 'Modo actor'
metaDescription: 'Modo actor'
---

El patrón Actor es un modelo de programación simultáneo.La aplicación de este modelo de programación puede resolver los problemas de simultaneidad de algunos sistemas.El problema de simultaneidad mencionado aquí es cuando un equipo procesa lógicamente los mismos datos, lo que puede provocar datos incorrectos debido a varias solicitudes simultáneas.Este problema es un problema que se debe encontrar cuando la programación multiproceso.Por ejemplo, si utiliza 100 subprocesos sin bloqueo sincrónico,`Int`Ejecución variable`++`Operación.El resultado final de esta variable suele ser inferior a 100.Así es como el patrón Actor evita este problema.

En primer lugar, para facilitar la comprensión, los lectores pueden pensar en Actor como un objeto aquí.En lenguajes orientados a objetos (Java, C, etc.), se puede pensar en Actor como un`Nuevo`El objeto creado por la palabra clave.Pero este objeto tiene algunas características especiales.：

**Ingons propios de su propio estado**。Los objetos pueden tener sus propias propiedades, que es una característica básica de los lenguajes orientados a objetos.En el patrón Actor, estas propiedades se conocen colectivamente como`El estado del actor`。El propio actor mantiene el estado del actor.

Esto enfatiza dos puntos.：

En primer lugar, el estado de Actor sólo se puede cambiar por sí mismo, y para cambiar el estado de Actor desde el exterior, sólo se puede cambiar llamando a Actor.

![Actualizar el estado del actor](/images/20190226-001.gif)

En segundo lugar, el estado de Actor se mantiene solo dentro del Actor y no se comparte con ningún objeto que no sea el Actor actual.El uso compartido aquí también hace hincapié en que no puede causar un cambio en el estado interno del actor a través de un cambio en una propiedad externa.Esto está destinado principalmente a distinguir entre lenguajes de programación con características de lenguaje de "referencia de objetos".Por ejemplo,：En C.`Clase`el`Público`Propiedad, si es un tipo de referencia, obtiene este`Clase`Y luego se puede cambiar.`Clase`La propiedad en .Pero esto no está permitido en el patrón Actor.

![Compartir estado del actor](/images/20190226-003.gif)

Sin embargo, todavía se permite leer datos desde el interior del actor hacia el exterior.

![Leer el estado del actor](/images/20190226-002.gif)

**Un solo subproceso**。El actor generalmente acepta sólo una llamada al mismo tiempo.Los subprocesos descritos aquí no se refieren exactamente a los subprocesos del equipo y se utilizan las palabras utilizadas para resaltar la "característica de Actor que solo puede controlar una solicitud a la vez".Si el actor actual está aceptando una llamada, las llamadas restantes se bloquean hasta el final de la llamada y no se permite la entrada de la siguiente solicitud.Esto es realmente similar a un mecanismo para un bloqueo sincrónico.Este mecanismo evita la posibilidad de problemas de simultaneidad al modificar el estado interno del actor.Una descripción específica：Si utiliza 100 subprocesos para realizar una llamada simultánea a un actor, deje que el actor`Int`Variable para realizar`++`Operación.El valor final para este estado debe ser 100.

![Llamada simultánea SActor](/images/20190226-004.gif)

Sin embargo, los subprocesos únicos no son absolutos, lo que permite el procesamiento simultáneo en ausencia de solicitudes simultáneas.Por ejemplo, leer el estado en el actor, que normalmente no tiene problemas de simultaneidad, permite operaciones simultáneas en este momento.

![Actor de lectura concurrente](/images/20190226-005.gif)
