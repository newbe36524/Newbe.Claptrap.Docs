---
title: 'Instantánea de estado'
description: 'Instantánea de estado'
---

## Instantánea de estado acelera la velocidad de restauración del estado

Un Claptrap activo cuyo estado es el estado actual de los datos más recientes.Esto se restaura a partir de la capa de persistencia mediante el abastecimiento de eventos.A veces, el número de eventos puede ser muy grande.Restaurar el estado a través de eventos llevará más tiempo.Por lo tanto, se proporciona una instantánea de estado en el marco de Claptrap para conservar el estado de una Claptrap determinada después de una determinada condición.Esta afección suele ser la following：

1. Después de que se hayan ejecutado varios eventos.
2. En Claptrap Deactive.
3. Durante un período de tiempo.

La presencia de instantáneas de eventos aumenta la velocidad a la que se restauran los estados de la capa persistente.Si existe una instantánea en una capa persistente, la restauración de un estado se realiza normalmente siguiendo：

1. Lea la instantánea de estado.
2. Comience con el número de versión de la instantánea de estado y lea todos los eventos de las actualizaciones de estado.
3. Actualice el estado hasta que la capa de persistencia no tenga eventos restantes.

Sin embargo, si no hay ninguna instantánea, el paso de restauración se convierte en el siguiente：

1. Cree un estado inicial a través de un método definido por el usuario.
2. Lea todos los eventos de la biblioteca de eventos para obtener actualizaciones de estado.
3. Actualice el estado hasta que la capa de persistencia no tenga eventos restantes.

Pero.La existencia de instantáneas también aporta cierta especialidad.Combinado con los pasos anteriores, es fácil ver que una vez que una instantánea es：

1. El método personalizado del usuario ya no se ejecutará.
2. Los eventos menores que el número de versión de instantánea no se volverán a ejecutar.

Actualmente, el marco de trabajo solo puede contener una instantánea final para cada identificador.
