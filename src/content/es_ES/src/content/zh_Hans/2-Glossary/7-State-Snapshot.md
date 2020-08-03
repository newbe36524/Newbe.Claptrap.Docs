---
title: 'Instantánea de estado'
metaTitle: 'Instantánea de estado'
metaDescription: 'Instantánea de estado'
---

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

## Instantánea de estado acelera la velocidad de restauración del estado.

Un Claptrap activo cuyo estado es el estado actual de los datos más recientes.Esto se restaura a partir de la capa de persistencia mediante el seguimiento del origen de los eventos.A veces, el número de eventos puede ser muy grande.Tomará más tiempo restaurar el estado a través de eventos.Por lo tanto, se proporciona una instantánea de estado en el marco de Claptrap para conservar el estado de una Claptrap determinada después de una determinada condición.Esta afección suele ser la siguiente.：

1. Se ejecutaron varios eventos.
2. En Claptrap Deactive.
3. En un cierto período de tiempo.

La presencia de instantáneas de eventos aumenta la velocidad a la que se restauran los estados de la capa persistente.Si existe una instantánea en la capa persistente, normalmente se realiza una restauración de estado en los pasos siguientes.：

1. Lea la instantánea de estado.
2. A partir del número de versión correspondiente a la instantánea de estado, lea todos los eventos hacia atrás para obtener actualizaciones de estado.
3. Actualice el estado hasta que la capa persistente no tenga eventos restantes.

Sin embargo, si no hay instantáneas, el paso de restauración cambia a lo siguiente.：

1. Cree el estado inicial a través de un método definido por el usuario.
2. Lea todos los eventos de la biblioteca de eventos para actualizar el estado.
3. Actualice el estado hasta que la capa persistente no tenga eventos restantes.

Pero.La presencia de instantáneas también aporta cierta especialidad.Combinado con los pasos de trabajo anteriores, es fácil ver que una vez que se forma una instantánea.：

1. El método personalizado del usuario ya no se ejecutará.
2. Los eventos que sean menores que el número de versión de instantánea no se volverán a ejecutar.

Actualmente, el marco de trabajo solo puede contener una instantánea final para cada identificador.
