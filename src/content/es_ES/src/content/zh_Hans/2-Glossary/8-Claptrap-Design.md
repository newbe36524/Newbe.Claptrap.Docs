---
title: 'Diseño de Claptrap'
metaTitle: 'Diseño de Claptrap'
metaDescription: 'Diseño de Claptrap'
---

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

## Claptrap Design 实现 Claptrap 的高可定制性

Claptrap tiene un alto grado de personalización.开发者可以为 Claptrap 对象设置自定义的 Event Loader/ Event Saver/ State Loader / State Saver / EventNotification Method 等等一系列组件。而这一切的自定义，都可以具体反映到 Claptrap Design 对象上。

Claptrap Design 就像一个设计图，决定了 Claptrap 的每个细节，常见的包括：

1. Qué event Loader / Event Saver se utiliza para controlar el evento.
2. Con qué frecuencia se guarda una instantánea de estado.
3. Minion ，如果是，那么 Master 是谁。
4. Cuántos eventos hay y cuál es el controlador de eventos correspondiente.

这些细节都会在应用程序启动时，将会通过类型扫描、属性标记、连贯接口、配置文件等等多种方式进行配置。Esto da como resultado un diseño completo de Claptrap.Además, Claptrap Design se valida por razonabilidad al inicio para garantizar que Claptrap Design esté disponible básicamente.从而不会出现类似于“忘记编写 Event 对应的 Handler”这样低级的错误。

所有的 Claptrap Design 都会被集中保存在 IClaptrapDesignStore 这样一个内存对象中，以便 Claptrap Factory 在构建 Claptrap 检索。

开发者也可以基于 IClaptrapDesignStore 中的所有数据，来构成可供人类阅读的文本或者图形，以便更容易地从高层面来了解当前系统中 Claptrap 之间的相互关系和配置细节，源于代码却高于代码。

---

La siguiente es una descripción basada en la historia para ayudar a la comprensión.No me importa demasiado.

Claptrap Design Design es una base importante para la producción claptrap de Claptrap Factory.Los dispositivos personalizados necesarios para un tipo particular de Claptrap se documentan en Diseño.Por ejemplo.：Decida el módulo de ejecución de tareas en el procesador de tareas multifunción, decida el modelo de dispositivo para la nota de mano y decida la estrategia de recuperación del controlador de recuperación de memoria.

Diseñar Claptrap Design es una parte importante para garantizar que el producto final satisfaga sus necesidades antes de decidir entrar en producción.

## ICON

![Una trampa.](/images/claptrap_icons/claptrap_design.svg)
