---
title: Por qué Newbe.Claptrap
description: Newbe.Claptrap - Un marco de desarrollo del lado del servicio con "abastecimiento de eventos" y "modo actor" como teorías básicas
---

Este artículo es una introducción al contenido principal del proyecto Newbe.Claptrap, a través del cual los lectores pueden obtener una comprensión general del contenido del proyecto.

<!-- more -->

## Las ruedas se derivan de la demanda

Con el rápido desarrollo de las aplicaciones de Internet, constantemente se crean teorías técnicas relevantes y medios de implementación.Una serie de palabras clave como Cloud Native Architecture, MicroServer Architecture y DevOps están cada vez más a los ojos de los ingenieros.En resumen, el surgimiento de estas nuevas teorías y tecnologías es resolver algunos de los puntos de dolor técnico en Internet applications：

**se**los requisitos de escalabilidad de mayor capacidad.Sobre la base del éxito comercial, el número de usuarios de aplicaciones de Internet, la presión del sistema y el número de dispositivos de hardware aumentarán significativamente con el tiempo.Esto requiere la aplicación de la escalabilidad de la capacidad en la provincia.Esta escalabilidad de capacidad se describe a menudo como "las aplicaciones necesitan admitir el escalado horizontal."

**mayores requisitos de estabilidad del sistema**.La aplicación se ejecuta continuamente para garantizar el progreso continuo de las actividades comerciales, que cualquier persona asociada con esta aplicación le gustaría ver.Pero por lo general es muy difícil hacer eso.Las aplicaciones de Internet de hoy en día frente a muchos competidores del mismo tipo, si no suenan lo suficiente en este sentido, entonces es probable que pierda parte del favor del usuario.

**se**requisitos de escalabilidad funcional más altos."Embrace change", una palabra que llega a las personas cuando mencionan contenido relacionado con la "gestión ágil de proyectos".Esta palabra refleja plenamente lo importante que es que las aplicaciones de Internet de hoy en día tengan éxito y tengan éxito funcional.También refleja la demanda cambiante de productos en el entorno actual de Internet desde un lado.Como ingeniero de sistemas, esto debe considerarse al principio de la aplicación.

**mayor facilidad de uso requiere**de desarrollo.La facilidad de desarrollo que aquí pertenece se refiere al grado de dificultad en el desarrollo del propio sistema de aplicación.Cuanto más fácil sea desarrollar, más comprobable e implementable es aplicar su propia estructura de código.

**requisitos de rendimiento más altos**.Los requisitos de rendimiento mencionados aquí son específicamente requisitos de rendimiento a medida que aumenta la capacidad del sistema.Evite problemas de rendimiento de un solo punto en el sistema y proporcione a la aplicación una característica escalable horizontalmente.En general, cuando se producen problemas de rendimiento, a menudo es la forma más fácil de resolverlos mediante la adición de dispositivos físicos.Bajo una capacidad de sistema diferente, el esquema de optimización para el rendimiento del sistema suele ser diferente.Por lo tanto, la selección de soluciones técnicas combinadas con el escenario de aplicación siempre ha sido un problema que los ingenieros de sistemas deben tener en cuenta.

Este proyecto se basa en las características funcionales del sistema anteriores de los requisitos resumidos un conjunto de marco de desarrollo.Contiene piedras angulares teóricas relevantes, bibliotecas de desarrollo y protocolos técnicos.

> No hay bala de plata en el mundo.Un marco no resolverá todos los problemas. La luna cayó sobre el no querer ser nombrado

## De la demanda

Al explicar los sistemas distribuidos, el escenario empresarial simple de "transferencia de cuenta" se utiliza a menudo para que coincida con la descripción.He aquí un vistazo a este escenario de negocio.

Supongamos que necesitamos construir un sistema empresarial con un sistema de cuentas.Cada cuenta tiene un saldo.Ahora debe realizar una operación de transferencia para transferir 300 del saldo de la cuenta A a la cuenta B.Además, sobre la base de los requisitos básicos de la sección anterior, debemos tener en cuenta lo siguiente al implementar este scenario：

- Usted necesita lidiar con un aumento en la capacidad del sistema.Puede haber sólo 1000 usuarios iniciales al principio de la aplicación.Gracias a una buena promoción de aplicaciones y la afluencia de cuentas de bots, el número de usuarios ha aumentado en tres órdenes de magnitud en un mes, es decir, a un millón de niveles.
- Es necesario tener en cuenta la estabilidad y la capacidad de recuperación del sistema.Minimice el tiempo medio de falla del sistema en su conjunto, e incluso las fallas del sistema deben ser tan fáciles de recuperar como sea posible.Es decir, evitar un único punto de fracaso.
- La escalabilidad del negocio debe tenerse en cuenta.Es posible que sea necesario agregar cierta lógica de negocios later：limitar el importe de la transferencia diaria de acuerdo con el nivel de cuenta, la notificación por SMS después de que la transferencia se realice correctamente, el soporte de transferencia es una cierta cantidad de transferencia libre de secretos, una cuenta específica para lograr el "T1" a la cuenta.
- Debe tener en cuenta la capacidad de prueba del código.El código de negocio y el código del sistema del sistema pueden estar bien separados, y la corrección y el rendimiento del código de negocio y el código del sistema se pueden verificar inicialmente mediante pruebas unitarias.

## La teoría de las ruedas

Esta sección presentará algunos de los contenidos teóricos que están estrechamente integrados con este marco para facilitar la comprensión del lector de la labor del marco en el proceso de seguimiento.

### Modo actor

El patrón Actor es un modelo de programación estándar.A través de la aplicación de este modelo de programación, algunos sistemas pueden resolver el problema de la complejidad.El problema con la unión mencionada aquí es que cuando un equipo procesa lógicamente los mismos datos, puede causar datos incorrectos debido a múltiples solicitudes simultáneas.Este es un problema que debe encontrar cuando está programando multiproceso.Para dar un ejemplo sencillo, si utiliza 100 subprocesos en un bloqueo no sincrónico para realizar una operación s. . . en una variable int en la memoria.A continuación, el resultado de esta variable suele ser inferior a 100.Así es como el patrón Actor evita este problema.

En primer lugar, para facilitar la comprensión, el lector puede pensar en Actor como un objeto aquí.En los lenguajes orientados a objetos (Java, C, etc.), el actor puede considerarse como un objeto creado``la nueva palabra clave.Pero este objeto tiene un characteristics：especial

**tiene un estado que pertenece a**.Todos los objetos pueden tener sus propias propiedades, que es una característica básica de los lenguajes orientados a objetos.En el modo Actor, estas propiedades se conocen colectivamente como el estado del actor.El estado del actor es mantenido por el propio actor.

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

> Al leer sobre la naturaleza de un solo subproceso del actor, los lectores a menudo piensan si esto puede causar problemas de rendimiento porque el propio actor lo está manejando demasiado lentamente.Sobre este punto, espero que los lectores sigan ateniéndose a esta pregunta y la lean más adelante en la búsqueda de respuestas.

### Modo de trazabilidad de eventos

El patrón de trazabilidad de eventos es una especie de idea de diseño de software.Este tipo de idea de diseño suele ser diferente de la idea de diseño del sistema tradicional que se basa principalmente en la comprobación y corrección de complementos (CRUD).Las aplicaciones CRUD a menudo tienen algunos limitations：

1. En general, las aplicaciones CRUD se encargan de operar directamente el almacenamiento de datos.Esta implementación puede provocar cuellos de botella en el rendimiento debido a la optimización insuficiente de la base de datos y puede ser más difícil escalar la aplicación.
2. En áreas específicas, a menudo hay problemas de datos que requieren que se controle la atención para evitar errores en las actualizaciones de datos.Esto a menudo requiere la introducción de "bloqueos", "transacciones" y otras tecnologías relacionadas para evitar tales problemas.Sin embargo, esto también puede conducir a pérdidas de rendimiento.
3. A menos que se agregue una auditoría adicional, el historial de cambios en los datos generalmente no es rastreable.Dado que el estado final de los datos normalmente se almacena en el almacén de datos.

A diferencia de las prácticas CRUD, el abastecimiento de eventos evita las limitaciones descritas anteriormente por el diseño.A continuación, describa las formas subyacentes en que el abastecimiento de eventos funciona en torno al escenario de negocio de "transferencia" mencionado anteriormente.

Utilice el desmoronamiento para lograr "transferencias".

!["Transferir" utilizando el método CRUD](/images/20190226-006.gif)

"Transferencia" se logra mediante el seguimiento de eventos.

!["Transferir" con el abastecimiento de eventos](/images/20190227-001.gif)

Como se muestra en la figura anterior, los cambios de saldo implicados en el negocio de transferencia se almacenan como eventos a través del modelo de trazabilidad de eventos.El negocio en sí también se realiza, y esto trae algunas benefits：

- A través del evento, puede restaurar el saldo de la cuenta en cualquier etapa, que en cierta medida para lograr el seguimiento del saldo de la cuenta.
- Porque los eventos de ambas cuentas se controlan de forma independiente.Por lo tanto, la velocidad de procesamiento de las dos cuentas no se afecta entre sí.Por ejemplo, la transferencia de la Cuenta B puede retrasarse ligeramente debido a la necesidad de procesamiento adicional, pero la Cuenta A todavía se puede transferir.
- Puede realizar algún procesamiento asincrónico empresarial suscribiéndose a eventos.Por：otras acciones asincrónicas, como actualizar estadísticas en la base de datos, enviar notificaciones SMS, etc.

Por supuesto, la introducción del modo de abastecimiento de eventos ha introducido algunos problemas técnicos relacionados con el abastecimiento de eventos.Por：el almacenamiento consumido por un evento puede ser grande, se debe aplicar la coherencia final, los eventos son inmutables, la refactorización puede ser difícil, etc.Estos problemas se describen con más detalle en algunos artículos.Los lectores pueden leer lecturas extendidas posteriores para su comprensión y evaluación.

> La complejidad del negocio no se reduce por los cambios en el diseño del sistema, simplemente se mueve de un lugar a otro. Siempre di que la luna cae sobre tu propia comida

## Deja que las ruedas giren

Basándose en la comprensión general del lector de la teoría en la sección anterior, esta sección introducirá cómo funciona este marco a la luz del escenario empresarial de "transferencia" descrito anteriormente.En primer lugar, el lector necesita entender los dos sustantivos de este marco.

### Claptrap

![Claptrap](/images/20190228-001.gif)

Claptrap es un actor especial definido en este marco.Además de las dos características mencionadas anteriormente, Claptrap se define como tener los siguientes features：

**estado de  se controla mediante el**de eventos.El estado del Actor se mantiene dentro del Actor.Lo mismo ocurre con Claptrap, pero cambiar el estado de Claptrap lo limita a solo eventos, además de modificaciones dentro de Actor.Esto combina el patrón de abastecimiento de eventos con el patrón Actor.La exactitud y trazabilidad del estado del actor está garantizada a través del modo de abastecimiento de eventos.Estos eventos que cambian el estado de Claptrap son generados por claptrap sí mismo.Los eventos pueden ocurrir entre llamadas externas y mecanismos de desencadenador de clase dentro de Claptrap.

### Súbdito

![Súbdito](/images/20190228-002.gif)

Minion es un actor especial tal como se define en este marco.es un ajuste realizado sobre la base de Claptrap.Tiene los siguientes characteristics：

**puede leer el evento desde la**Claptrap correspondiente.Al igual que Claptrap, el estado del súbdito está controlado por eventos.La diferencia es que Minion, como literalmente lo hace, siempre obtiene eventos de la Claptrap correspondiente, cambiando su propio estado.Por lo tanto, puede controlar Claptrap de forma asincrónica después de generar el evento.

### Implementación empresarial

Ahora, con los conceptos básicos de la anterior, así es como este marco implementa el escenario de "transferencia" anterior.El siguiente diagrama comienza con un vistazo a la processes：principal

![Claptrap & Minion](/images/20190228-003.gif)

Como se muestra en la figura anterior, todo el proceso es el proceso general de implementación del escenario empresarial en este marco.Además, hay algunas cosas que deben tenerse en cuenta：

- La llamada entre Client y Claptrap en la figura espera solo para la primera etapa, lo que significa que el cliente puede obtener una respuesta más rápido sin tener que esperar a que finalice todo el proceso.
- La trampa A puede aceptar solicitudes de nuevo después de procesar sus propias solicitudes y enviar eventos al esbirro A, lo que aumenta el rendimiento de la trampa A.
- Minion hace algo más que manejar agentes de llamadas entre Claptrap.En Minion, también puedes hacer cosas como：, enviar mensajes de texto, actualizar estadísticas de bases de datos y mucho más, dependiendo de las necesidades de tu empresa.
- Minion también puede tener su propio estado, manteniendo algunos de los datos en su propio estado para que pueda consultar externamente desde sí mismo sin tener que consultar desde el Claptrap correspondiente.Por example：las últimas 24 horas de los cambios de transferencia de la cuenta para una consulta rápida.

### Capacidad empresarial

Como se mencionó anteriormente, este marco necesita construir una arquitectura de sistema que pueda escalar horizontalmente para hacer frente al crecimiento continuo de la capacidad empresarial.En este punto, el marco de trabajo está utilizando actualmente el código abierto[Dapr](https://dapr.io/)habilitar la descendente de aplicaciones y dispositivos físicos.

Por supuesto, cuando se trata de almacenamiento de datos, está obligado a implicar una serie de problemas, como la agrupación en clústeres de bases de datos.Estos son los detalles de la aplicación técnica, no el contenido del diseño de la teoría marco.Por lo tanto, solo este marco de trabajo se puede reducir en función de la arquitectura de código abierto anterior.

Preguntas prácticas durante el proceso de solicitud, los lectores pueden buscar respuestas en el contenido posterior del proyecto.

## Todo está listo

Creo que tiene una comprensión preliminar del marco.现在，进入[Newbe.Claptrap 快速入门](01-0-Quick-Start) 开始尝试该项目吧。
