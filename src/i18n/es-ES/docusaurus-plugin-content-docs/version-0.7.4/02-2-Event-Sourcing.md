---
title: 'Abastecimiento de eventos'
description: 'Abastecimiento de eventos'
---

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

> Recursos
> 
> - [Patrón de abastecimiento de eventos](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/dn589792%28v%3dpandp.10%29)
> - [Event Sourcing Pattern Traducción al chino](https://www.infoq.cn/article/event-sourcing)
