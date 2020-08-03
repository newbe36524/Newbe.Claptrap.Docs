---
title: 'Ciclo de vida de Claptrap'
metaTitle: 'Ciclo de vida de Claptrap'
metaDescription: 'Ciclo de vida de Claptrap'
---

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

El ciclo de vida de Claptrap se ilustra en dos amplias categorías según la opinión del autor.：Ciclo de vida en tiempo de ejecución y ciclo de vida en tiempo de diseño.

## El ciclo de vida en tiempo de ejecución.

El ciclo de vida en tiempo de ejecución es el comportamiento del ciclo de vida de cada objeto en la memoria durante el funcionamiento del sistema Claptrap.Por ejemplo.：En un sistema Web, cada solicitud Web se asigna normalmente como ciclo de vida y el sistema Claptrap tiene un diseño de ciclo de vida similar.Estos ciclos de vida tienen un impacto en las extensiones de componentes de los desarrolladores o en el desarrollo empresarial.El ciclo de vida en tiempo de ejecución del marco de Trabajo de Claptrap se divide en.：Proceso, Claptrap y controlador de eventos.

Nivel de proceso.Un objeto diseñado como un ciclo de vida a nivel de proceso es un objeto singleton en el sentido general.Cada proceso de Claptrap en ejecución tiene su propio objeto singleton.Normalmente, en un marco de Claptrap, por ejemplo, cada destino de capa persistente corresponde a un procesador por lotes (Evento de ahorro por lotes) para aumentar la velocidad a la que se escriben los eventos en la capa persistente.Solo tienen una instancia a lo largo del ciclo de vida del proceso, uno a uno correspondiente a la capa de persistencia correspondiente, de modo que los eventos se pueden combinar para escribir en la capa de persistencia, mejorando el rendimiento de escritura.En general, los objetos diseñados para ser ciclos de vida de nivel de proceso tienen una o varias de las siguientes características.：

1. Solo necesita ejecutar la lógica o el código una vez a lo largo del ciclo de vida del proceso.Esto generalmente se puede hacer con Lazy y un singleton.
2. Solo se requiere un solo objeto durante todo el ciclo de vida del proceso.Por ejemplo, Claptrap Design Store, Opciones de Claptrap, etc.
3. Sólo puede haber un único objeto durante todo el ciclo de vida del proceso.Por ejemplo, cliente de Orleans.

Nivel de claptrap.Los objetos del ciclo de vida a nivel de Claptrap se crean con la activación de Claptrap y se liberan con la inactivación de Claptrap.Estos objetos suelen estar fuertemente asociados con una identidad de Claptrap.Por ejemplo, Claptrap Design, Event Saver, Event Loader, State Saver, State Loader, etc. asociados a esta identidad de Claptrap.

Nivel de procesador de eventos (controlador de eventos).Los objetos de ciclo de vida de nivel de procesador de eventos se crean a medida que se crea y libera el procesador de eventos con la versión del procesador de eventos.Este nivel de ciclo de vida es similar al ciclo de vida de las solicitudes web en respuesta a la Web.Normalmente, la unidad de trabajo de una transacción de base de datos unificada cae a este nivel.

## Ciclo de vida de tiempo de diseño.

Los ciclos de vida en tiempo de diseño son los ciclos de vida de los objetos de negocio de Claptrap.Esto no tiene nada que ver con si el programa se está ejecutando o no, o incluso si se utiliza o no el programa.Por poner un ejemplo específico, los pedidos en un sistema de comercio electrónico regular.El límite de tiempo de negocio activo para un pedido generalmente no es más de tres a seis meses.Cuando se supera este límite de tiempo, los datos del pedido no se pueden modificar.Aquí, este límite de tiempo de "tres a seis meses" se denomina el ciclo de vida del tiempo de diseño de una orden.En un sistema Claptrap, si un objeto ha excedido su ciclo de vida en tiempo de diseño, se manifiesta como "ya no hay necesidad de activar este negocio de Claptrap".De esto se pueden obtener las siguientes inferencias.：

1. Los eventos que Claptrap ha almacenado no tienen sentido, y eliminarlos libera espacio libre.
2. El código de negocio de Claptrap ya no necesita mantenimiento y puede optar por quitar la referencia o quitar el código.

Por lo tanto, cuanto más corto es el ciclo de vida de diseño de Claptrap, es más propicio para reducir la huella de recursos y los costos de mantenimiento del código, y viceversa, aumentando los costos de almacenamiento y las dificultades de mantenimiento.Por lo tanto, al diseñar sistemas Claptrap, hay una tendencia a utilizar un ciclo de vida en tiempo de diseño más corto.Y este sustantivo, también refleja directamente el real enteramente por "diseño" para determinar. A continuación, vamos a enumerar algunas clasificaciones comunes del ciclo de vida del tiempo de diseño.

### Demarcación de límites de negocio.

Esta es la división más común.Los objetos de negocio se dividen en función de los requisitos del modelado de dominios.Y estos objetos de negocio a menudo tienen un ciclo de vida fijo.Como en el "orden" anterior es un ejemplo común de dividir el ciclo de vida por límites de negocio.Al dividir con este método, solo tiene que tener en cuenta que Claptrap cumple con el requisito básico de que "el rango mínimo de recursos competitivos es mayor o igual que".Los desarrolladores pueden experimentar esta división con un ejemplo de un "sistema de venta de billetes de tren".

### Demarcación de límites condicionales.

En general, el método de división basado en límites de negocio ha sido capaz de dividir un ciclo de vida razonable.Sin embargo, si simplemente se divide a lo largo de los límites del negocio, es posible que tenga objetos de ciclo de vida a permanente en tiempo de diseño.Supongamos que estos objetos tienen operaciones de eventos muy densas.A continuación, el número de eventos generados será inusualmente grande.Para ello, introducimos formas controladas por el ser humano para acortar el ciclo de vida en tiempo de diseño.Esta división se basa en condiciones específicas.Por lo tanto, se denomina demarcación de límite condicional.Y el más clásico de ellos es el uso de "límite de tiempo" para dividir.

Aquí ilustramos esta división utilizando el objeto de carrito de compras en el ejemplo de inicio rápido.En primer lugar, un carro de la compra es un objeto relacionado con el usuario, y mientras el usuario haya estado en el sistema, es posible activarlo, es decir, su ciclo de vida de diseño es "permanente".Por lo tanto, no puede eliminar eventos relacionados y deben guardarse permanentemente para asegurarse de que los datos del carro de la compra son correctos.Pero si no nos importan los eventos que un carro de la compra causó hace un año.Podemos dividir manualmente los carros de la compra de los usuarios individuales por año.Al mismo tiempo, podemos hacer una "copia de estado" en un carro de la compra durante dos años adyacentes.Esto amplía los datos de estado del año anterior, lo que resulta en un ciclo de vida de diseño más corto para el carro de la compra del usuario, y no afecta al negocio.Podemos usar una historia clásica de leyenda china, "The Fool's Move Mountain", para entender esta clasificación del ciclo de vida del diseño basado en el tiempo.En la historia, los tontos son mortales, y aunque no pueden vivir para siempre (ciclos de vida más cortos en tiempo de diseño), el espíritu de los tontos (ciclos de vida más largos en tiempo de diseño) puede continuar con las generaciones futuras, y así puede completar la gran causa de la migración de montaña.Cuando se reemplaza a cada generación de "tontos", se produce la "copia de estado" (continuación espiritual) mencionada anteriormente.Esto se traduce en un ciclo de vida de tiempo de diseño más corto, lo que permite un ciclo de vida de tiempo de diseño más largo o incluso permanente.
