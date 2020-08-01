---
title: 'Instantánea de estado'
metaTitle: 'Instantánea de estado'
metaDescription: 'Instantánea de estado'
---

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

## State Snapshot 加速状态还原速度

一个处于激活状态的 Claptrap ，它的 State 即是当前的最新数据状态。Esto se restaura a partir de la capa de persistencia mediante el seguimiento del origen de los eventos.A veces, el número de eventos puede ser muy grande.Tomará más tiempo restaurar el estado a través de eventos.因此，在 Claptrap 框架中提供了状态快照来持久化特定 Claptrap 在一定条件之后的状态。这个条件通常来说是以下几种：

1. 执行了若干个事件之后。
2. 在 Claptrap Deactive 时。
3. 在一定的时间周期内。

事件快照的存在，使得状态从持久层还原的速度得到了提升。如果持久层存在快照，则一个状态的还原通常是按照以下步骤进行的：

1. 读取状态快照。
2. 从状态快照对应的版本号开始，向后读取所有的事件进行状态的更新。
3. 更新状态直到持久层已经没有剩余的事件。

但是，如果没有快照，则还原步骤则变为如下所示：

1. 通过用户自定义方法来创建初始状态。
2. 从事件库中读取所有事件来进行状态的更新。
3. 更新状态直到持久层已经没有剩余的事件。

不过。快照的存在也会带来一些特殊性。结合上面的工作步骤，我们很容易就发现，一旦形成了快照：

1. 将不会再执行用户的自定义方法。
2. 小于快照版本号的事件将不会被再次执行。

目前，框架对于每个 Id 仅仅能够保存一个最后的快照。
