---
title: 'Abastecimiento de eventos'
metaTitle: 'Abastecimiento de eventos'
metaDescription: 'Abastecimiento de eventos'
---

El modo de seguimiento de eventos es una especie de idea de diseño de software.Este tipo de idea de diseño suele ser diferente de la idea de diseño del sistema tradicional basada en la adición y eliminación (CRUD).Las aplicaciones CruD a menudo tienen algunas limitaciones：

1. En general, las aplicaciones CRUD toman la práctica de operar el almacenamiento de datos directamente.Esta implementación puede dar lugar a cuellos de botella de rendimiento debido a la optimización inadecuada de la base de datos, y esto puede ser difícil de escalar las aplicaciones.
2. A menudo hay algunos datos en un área determinada que requiere atención al control de problemas de simultaneidad para evitar errores en las actualizaciones de datos.Esto a menudo requiere la introducción de técnicas relacionadas como bloqueos, transacciones, etc. para evitar tales problemas.Pero esto también puede conducir a pérdidas de rendimiento.
3. A menos que se agregue una auditoría adicional, el historial de cambios de datos generalmente no se puede rastrear.Dado que el almacén de datos normalmente se guarda en el estado final de los datos.

A diferencia del enfoque CRUD, el seguimiento de eventos evita las limitaciones de la descripción anterior por diseño.El siguiente paso es describir el método de trabajo básico de seguimiento de eventos en torno al escenario de negocio de "transferencia" mencionado anteriormente.

Utilice el enfoque CRUD para "transferir".

!["Transferir" usando CRUD](/images/20190226-006.gif)

"Transferencia" en forma de trazabilidad de eventos.

!["Transferir" utilizando un enfoque de seguimiento de eventos](/images/20190227-001.gif)

Como se muestra en la figura anterior, los cambios de saldo implicados en el negocio de transferencia se almacenan de forma basada en eventos a través del modelo de seguimiento de eventos.También se da cuenta del negocio en sí, lo que trae algunos beneficios：

- A través del evento, puede restaurar el saldo de cualquier etapa de la cuenta, que en cierta medida para lograr el seguimiento del saldo de la cuenta.
- Porque los eventos de ambas cuentas se controlan de forma independiente.Por lo tanto, la velocidad de procesamiento de las dos cuentas no se afecta entre sí.Por ejemplo, la transferencia de la Cuenta B puede retrasarse ligeramente debido al procesamiento adicional, pero la Cuenta A todavía se puede transferir.
- Puede suscribirse a eventos para realizar algún procesamiento asincrónico de su negocio.Por ejemplo,：Actualice las estadísticas de la base de datos, envíe notificaciones SMS y otras operaciones asincrónicas.

Por supuesto, la introducción del modo de seguimiento de eventos también introdujo algunos de los problemas técnicos relacionados con el seguimiento de eventos.Por ejemplo,：Los eventos pueden consumir grandes cantidades de almacenamiento, se debe aplicar la coherencia final, los eventos son inmutables, la refactorización puede ser difícil, etc.Estos problemas relacionados se describen con más detalle en algunos artículos.Los lectores pueden leer la lectura extendida para una mayor comprensión y evaluación.

> Recursos
> 
> - [Patrón de abastecimiento de eventos](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/dn589792%28v%3dpandp.10%29)
> - [Traducido por Event Sourcing Pattern Chino](https://www.infoq.cn/article/event-sourcing)
