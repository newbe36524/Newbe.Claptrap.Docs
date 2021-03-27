---
date: 2019-03-08
title: Newbe.Claptrap Project Weekly 1 - Sin ruedas todavía, corre con ruedas primero
---

Newbe.Claptrap Project Weekly 1, la primera semana del código escribió un poco.Pero principalmente considerar la viabilidad teórica.

<!-- more -->

## ¿Cuál es el periódico semanal?

Las obras exitosas de código abierto no pueden separarse de la participación activa de los colaboradores de la comunidad.Como un proyecto de rueda recién lanzado, el cofundador del proyecto, Moon Landing, tiene una cuenta：

"Sé que no tienes la capacidad de codificar muy bien, y tendrás una cuenta semanal de tus ideas".Deje que otros vean el valor del proyecto.A la espera de que más y más personas descubran el valor del proyecto, naturalmente darán más atención, incluso en el desarrollo del proyecto involucrado.Así que tienes que escribir un periódico semanal.El informe semanal se centra mejor en explicar el concepto del proyecto y cómo resolver problemas prácticos a través del proyecto.Por supuesto, también puede incluir algún contenido sobre cómo se diseña el proyecto, pero preste atención a la moderación, por lo general la gente no presta demasiada atención a cómo se implementa el proyecto.Concéntrese más en el valor del proyecto.Remember：proyecto solo se realiza correctamente si genera valor. "

Así que el autor sólo puede escribir un periódico semanal, apenas capaz de mantener una vida como esta.

## La rueda tiene una muestra de rueda

La nueva ronda debería tener la apariencia de una nueva ronda, la "apertura del proyecto" introdujo la teoría básica y los principios de trabajo relacionados con este marco.Dado que el contenido teórico relevante es desconocido para el lector que acaba de entrar en contacto, esta sección enumera el contenido más crítico de la sección anterior a continuación para estimular la memoria del lector.

El atributo actor i.：el estado de Actor se cambia llamando a Actor externamente.

![Actualizar el estado del actor](/images/20190226-001.gif)

El actor cuenta uno para componer 1：el estado de Actor no se comparte externamente.

![Compartir el estado de Actor](/images/20190226-003.gif)

La función Actor complementa 2：puede leer el estado Actor externamente.

![Leer el estado del actor](/images/20190226-002.gif)

Actor feature II：actor trabaja "de un solo hilo" y sólo puede procesar una solicitud a la vez.

![El actor se llama en un sintetizador](/images/20190226-004.gif)

El atributo Actor es 2-to：el mismo estado de lectura no puede ser un "único subproceso."

![Leer actor al mismo tiempo](/images/20190226-005.gif)

El marco de trabajo define el tipo Actor, Claptrap：Actor que genera eventos a través de patrones de eventos y cambia su propio estado a través de eventos.

![Claptrap](/images/20190228-001.gif)

El marco de trabajo define el tipo Actor, Minion：en comparación con Claptrap, el súbdito no genera eventos, pero lee los eventos correspondientes a Claptrap para cambiar su estado.Se permiten varios esbirros para una claptrap.

![Súbdito](/images/20190228-002.gif)

Completa el negocio de "transferencia" con Claptrap y Minion.

![Claptrap & Minion](/images/20190228-003.gif)

> Caída de la luna gran hombre famoso advirtió 1：el mundo no existe "bala de plata".Un marco no resolverá todos los problemas. El famoso dicho de Moon Landing 2：complejidad empresarial no se reduce por los cambios en el diseño del sistema, sino que solo se mueve de un lugar a otro.

## Sin rueda, corre primero con una rueda

Ahora tenemos los conceptos de Claptrap y Minion.A continuación, combine algunos escenarios empresariales para experimentar con si el marco de trabajo puede manejar una amplia variedad de necesidades empresariales.

> Hermosos medios técnicos no pueden hacer frente a las necesidades y cambios reales, que sólo pueden ser jarrones técnicos. La luna cae justo después de aprender el Set de Instrucción de Computación Cuántica Sebotan XII

### El escenario empresarial

Es un simple comercio electrónico system：

1. Sólo se vende un cristal verde, y por el bien de la descripción, el producto se llama "Perdonar cristal".
2. Los usuarios pueden usar el saldo de su cuenta para comprar cristales de perdón.El saldo se recarga a través de un sistema de pago externo.La parte de recarga, por el momento, no es un escenario empresarial a tener en cuenta.
3. Cada usuario también tiene una integral, que, casualmente, también es verde, por lo que el crédito se denomina "Perdonar puntos".
4. Hay muchas maneras de ganar puntos de condonación, como：registro de usuarios, invitar a otros usuarios a registrarse, invitar a los usuarios a realizar una compra, que el invitado también puede obtener, perdonar es la minería, en realidad para obtener el perdón, y así sucesivamente, que puede necesitar estar en línea con las actividades posteriores para aumentar continuamente el método de adquisición.
5. Perdonar puntos puede deducir una parte de la cantidad que necesita ser pagado cuando usted hace una compra de Perdonar Cristal.
6. Es probable que los puntos de perdón tengan otros usos en el futuro.
7. Es probable que el método de pago para comprar Forgive Crystal sea más que saldo y puntos de perdón en el futuro.

Lo anterior es una descripción de los requisitos de este sistema de comercio electrónico.La demanda seguramente cambiará en el futuro.

### Conciencia de características

Sistema de comercio electrónico, el escenario empresarial más importante está naturalmente relacionado con la transacción de escenarios de negocio de mercancías.No importa cuán complejos sean los otros escenarios de requisitos, los escenarios de negocio relacionados con el trading están obligados a ser los primeros en requerir análisis y resolución.

Por lo tanto, primero, usaremos el escenario "Cristal de condonación de compra de confirmación de usuario" para describir en términos simples lo que el programa debe hacer：

1. Debe comprobar que el saldo del usuario es suficiente
2. Si el usuario selecciona un crédito de crédito, debe comprobar que el crédito del usuario es suficiente
3. Debe comprobar que el inventario es suficiente
4. El saldo del usuario debe ser deducido
5. El inventario debe ser deducido
6. Si el usuario selecciona un crédito de crédito, es necesario deducir el crédito del usuario

Si implementa estos seis puntos operando directamente la hoja de datos, debería ser muy sencillo para la mayoría de los desarrolladores.Puede completar el negocio abriendo una transacción de base de datos con al menos un bloqueo de nivel de fila que compruebe y actualice los datos.Por lo tanto, ahora que está usando este marco de trabajo para la implementación, debe implementar los mismos seis puntos clave basados en el hecho básico de que "la complejidad del negocio no disminuye".

### El profeta aún no ha sido llamado

En primer lugar, bajo la premisa de no mucha discusión, el autor en torno a algunos de los conceptos principales antes mencionados, diseñó el siguiente Claptrap：

| Concepto                  | Nombrado en inglés | Abreviatura |
| ------------------------- | ------------------ | ----------- |
| Perdona el cristal        | Sku                | S           |
| Perdonar puntos           | UserPoint          | P           |
| El equilibrio del usuario | UserBalance        | B           |

### Dibuja la rueda de acuerdo con la libélula

Siguiendo el diseño del proceso del escenario empresarial anterior de "transferencia", la lógica de la compra se diseña de la misma manera aquí.Como se muestra en la figura below：

![Diseño de cadena](/images/20190307-001.gif)

Analice este design：

De acuerdo con el orden de la lógica empresarial, complete la inspección de inventario, la deducción de inventario, la verificación de saldo, la deducción de saldo, la verificación de crédito, los pasos empresariales de deducción de crédito.

Observe el tiempo que existe la línea de llamada entre el cliente y Claptrap S, y solo al principio, es decir, el cliente solo necesita un poco de espera para obtener una respuesta.

Claptrap S puede seguir respondiendo a nuevas solicitudes después de que empuje el evento a Minion S.Asegurarse de que varios usuarios realicen una compra al mismo tiempo garantiza que el artículo no está sobrevendido y que la respuesta es lo suficientemente corta.

El punto de entrada de toda la lógica empresarial es S, que garantiza que el usuario paga al bloquear el inventario, evitando la situación en la que el usuario paga por las mercancías.

Por razones de forma, este diseño se **"Diseño de cadena",**.

### Mismo material, diferentes ruedas

Hay otro diseño.Como se muestra en la figura below：

![Diseño de árbol](/images/20190307-002.gif)

Analice este design：

Un nuevo Claptrap W (Qué increíble que me consiga un cristal perdonado) fue introducido como el punto de entrada para el negocio, que Claptrap W implementó llamando a otros Claptrap.

Los esbirros S, P y B ya no están involucrados en el control de flujo del negocio, ya que ya están controlados por Claptrap W, en comparación con el diseño de la sección anterior.

Y debido a Minion W, este diseño también puede hacer llamadas parciales a Minion, por lo que también puede tomar dos formas.

![Diseño de árbol](/images/20190307-003.gif)

![Diseño de árbol](/images/20190307-004.gif)

Por razones de forma, este diseño se **"Diseño similar a un árbol"**.

Luego hay una opción, y ya que hay una opción, entonces aquí está el uso de "WhyNot análisis comparativo" registrado en el "Moon Boss's Software Development Tricks 32" para decidir qué diseño use：

| Opciones         | ¿Por qué no?                                                                                                                                                                                                                                                                | ¡por qué!Loc                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Diseño de cadena |                                                                                                                                                                                                                                                                             | El control del proceso de flujo de negocio está conectado a través de Minion, un diseño estrechamente acoplado.Esto es equivalente al contexto de las operaciones de Minion y Claptrap esta vez.Una pregunta obvia：Si el cliente ha elegido pagar puntos es una lógica que se juzga ya sea en Minion B o Claptrap P, pero de cualquier manera no tiene sentido.<br/>diseño puede ser particularmente difícil de manejar cuando se trata de errores de proceso.Por ejemplo, si el cliente no tiene suficientes puntos en el último paso, es posible que deba retroceder gradualmente, lo que puede ser muy difícil. |
| Diseño de árbol  | Este diseño reúne el contenido de control de procesos central del negocio en un par de Claptrap W y Minion W relacionados.Este es un rendimiento de alta cohesión.<br/>basado en este diseño, es fácil construir procesos más complejos basados en Claptrap S, P y B. |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

De hecho, es fácil para los lectores encontrar que la tabla de comparación y análisis WhyNot para esta elección es en realidad una calle unidireccional.Obviamente se trata de elegir un diseño de árbol.

> "Moon boss software development tricks 32", es el hombre grande de aterrizaje de la luna en el proceso de desarrollo diario del proceso de desarrollo de software utilizado en algunos pequeños métodos de recolección y generalización.La mayoría de estos métodos no son nuevas invenciones.Los aterrizajes de la Luna simplemente juntan estos métodos, y con el fin de iluminar a los que más tarde, hay pequeñas maneras de hacer las cosas más ordenadas al analizar y juzgar algunos problemas.Además del método de análisis comparativo WhyNot, hay la más conocida "descripción de requisitos de 5W1H";

> WhyNo método de análisis comparativo, simplemente es elegir varios sujetos para la comparación en paralelo, respectivamente, enumerar las razones "debe elegirlo" y "no debe elegirlo", y luego hacer un juicio completo y luego tomar un método de decisión.Es particularmente aplicable al método utilizado por múltiples personas en litigio sobre una opción, que garantiza que las razones de la declaración se registren por separado en forma de formulario, garantizando que no haya escasez de justificaciones.Sobre la base del método, también se derivan otras variantes como "medida del peso de la razón" y "medida del derecho de las personas a hablar".Este método tiene cierta conexión y diferencia con los métodos de comparación como "método de diferencia" y "método de comparación de diferencias", así como "método de selección de probabilidad" y "método de selección de experiencia".El nombre de este método se dice que es el primero de los alunizajes y es un terrier de sintaxis.Entre los chinos, el "¿Por qué no?" se puede utilizar. "Tal contra-pregunta para indicar la razón para elegir un objeto, se puede utilizar el "¿Por qué!Loc "Esta frase de oración representa la razón para no elegir un objeto. WhyNot es en realidad una traducción directa de las cuatro palabras por qué no.

### Las buenas ruedas también se ven bien

Los lectores que ven por primera vez ¿El análisis comparativo de Not puede tener questions：no hay razón para elegir el diseño de cadena?

Debe explicarse que por quéNo el análisis comparativo es el análisis de escenas fijas, por lo que si la escena cambia, los resultados del análisis cambiarán.Es decir,**en ciertos escenarios, el diseño de cadenas tiene su necesidad y**.

Así que antes de explicar, tomamos un enfoque diferente para interpretar la relación entre el diseño de la cadena y el árbol：

- Combina Claptrap con el minion correspondiente
- Con "Porque... Así que..." la frase reemplaza la llamada sólida en el dibujo

![Diseño de cadena](/images/20190307-001.gif)

A continuación, el diseño de la cadena combinado con la imagen anterior se puede expresar como：

- Porque S, so B
- Porque B, so P

La semántica expandida se puede：

- El saldo se deduce aún más porque el inventario se deduce de la compra
- El saldo se deduce como resultado de la compra, por lo que se deducen más puntos

![Diseño de árbol](/images/20190307-002.gif)

El diseño del árbol anterior se puede expresar como：

- Porque W, so S
- Porque W, tan B
- Porque W, so P

La semántica expandida se puede：

- El inventario se dedujo debido a la compra
- El saldo se dedujo debido a la compra
- Los puntos se deducen debido a la compra

Incluso si el autor aquí explicó no muy claramente, pero el lector todavía puede observar "debido a la compra y deducción del saldo, por lo que para deducir más puntos" esta frase no es del todo razonable, los dos en el negocio en realidad no deben tener efectos externos obvios.

Esta es también la razón por la que el diseño de cadena no funciona en este scenario：si la relación de llamada entre los dos no tiene consecuencias previas obvias, los dos están diseñados como relaciones de cadena para las devolución de llamada.Lo que es probable que se obtenga es un diseño irrazonable.

Así que al revés around：**si desea aplicar un diseño de cadena.Debe haber consecuencias previas razonables entre los dos.**

Sin embargo, en el proceso de análisis de la demanda, las causas y consecuencias preexistentes actuales pueden no ser razonables más adelante.El escenario empresarial cambiante y la estabilidad incompleta de los requisitos han llevado al hecho de que el diseño de árbol puede manejar más problemas.

Los lectores pueden intentar diseñar algunos de los requisitos restantes en el escenario empresarial anterior.

Además, el lector puede repensar el diseño del escenario de "transferencia" utilizado en la abertura, con un diseño de árbol es más apropiado.

## En realidad es una rueda nueva

En la apertura, hicimos una comparación simple del modo Actor con el patrón CRUD.Ahora hay otro tipo de diseño que se menciona más comúnmente, que es "diseño controlado por dominio".

El concepto de diseño basado en dominios no se presenta mucho aquí, y los lectores que están relativamente desconocidos con este contenido pueden referirse al artículo del MVP de Microsoft Mr. Tang Xuehua["Modelo de dominio de dominio-controlado Design](http://www.cnblogs.com/netfocus/archive/2011/10/10/2204949.html)

Por lo tanto, cuando el lector entienda el diseño controlado por dominio, combine el Claptrap W, S, P y B mencionado anteriormente en este artículo.Tal vez Claptrap S, P, B es la raíz agregada?Tal vez Claptrap W es un servicio de aplicaciones?El autor piensa que el modelo Actor es en realidad una especie de desarrollo adicional de：basado en dominios

- El diseño basado en dominios no tiene en cuenta los sintetizadores de negocios dentro del modelo de diseño, y el patrón Actor, como un conjunto de modelos de programación de sintetizador, compensa esta parte de la brecha.
- La gran mayoría de los marcos basados en dominios (como el autor sabe) siguen utilizando el proceso general de "restaurar raíces agregadas del almacenamiento y guardarlos después de la operación".El marco actor, en el caso de Orleans, mantiene al actor activado en la memoria durante un período de tiempo, lo que significa que la raíz agregada se puede modificar continuamente en la memoria sin necesidad de restauraciones repetidas desde el almacén.

En general, el lector puede modelar la idea del diseño controlado por dominio y, a continuación, intentar diseñar la raíz agregada original y el servicio de aplicación como Actor, teóricamente tratando de ver si el dominio con el que están familiarizados se puede implementar con Actor.Tal vez los lectores pueden encontrar algo diferente.

Sin embargo, debido a los patrones de actor y abastecimiento de eventos, el enfoque de diseño no es exactamente el mismo que el modelo controlado por dominio, y hay otras cosas a tener en cuenta que se recopilarán más adelante.

## La conclusión

A través del diseño de un escenario empresarial, este artículo espera que el lector sepa cómo utilizar los conceptos teóricos de este marco para lograr negocios.Contiene algunas de las suposiciones del autor, por lo que el lector puede tardar más tiempo en entender.

Debido a la limitada experiencia laboral del autor y a la falta de conocimiento del sector de la industria, es imposible emitir un juicio preciso sobre si el concepto de diseño del marco se ajusta a las características de una industria en particular.Si tiene alguna pregunta que requiera ayuda, póngase en contacto con este equipo del proyecto.

Los amigos interesados en esto son bienvenidos a seguir el proyecto y participar en el proyecto.

<!-- md Footer-Newbe-Claptrap.md -->
