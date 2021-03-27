---
title: 'Claptrap Box'
description: 'Claptrap Box'
---


## Claptrap Box permite a Claptrap ejecutar en más marcos

Claptrap es un objeto implementado en función del patrón Actor.Solo tiene la capacidad de controlar eventos y problemas relacionados con el control de estado.Por lo tanto, en el escenario real, a menudo es necesario confiar en el entorno operativo específico para llevarlo, o la necesidad de diseñar la interfaz de negocio externa de acuerdo con el negocio.

El caso de uso más típico es combinar con Grain of Orleans.Grain es una implementación de actor virtual para Orleans, y Claptrap es actor.Cuando se combinaron Claptrap y Grain, elegimos encapsular Claptrap dentro de Grain.De esta manera, hacemos que Claptrap, un actor rastreado por eventos, corra en Grain, que aprovecha el soporte de Orleans para las características distribuidas.Cuando ponemos Claptrap en grano para correr, podemos pensar en Grano como una caja que combina objetos muy similares al patrón de la cara en el modo de diseño, y Grano proporciona Claptrap con una cara para comunicarse con el exterior, protegiendo los detalles internos mientras que también hace que el exterior tenga más comprensión de cómo interactúa.Aquí nos referimos a esto "cómo Claptrap se monta para ejecutar en un objeto de cara en particular" como el modo Claptrap Box, donde el objeto de la cara se llama Claptrap Box.Este enfoque permite que Claptrap se aplique a plataformas y negocios más complejos.En Orleans, esta Claptrap Box se llama ClaptrapBoxGrain.

Debido a Claptrap Box, Claptrap puede mantener las condiciones básicas de abastecimiento de eventos y el modo Actor incluso si se separa de Orleans.Por ejemplo, en un programa de consola simple, los desarrolladores todavía pueden usar NormalClaptrapBox como un objeto de cara.Sin embargo, esto pierde la ventaja de Orleans distribuido.

El concepto Claptrap Box permite que Claptrap se ejecute en plataformas y marcos más subyacentes.Aunque actualmente sólo Orleans / Akka.net / sin sellar, etc. se pueden seleccionar objetos de cara.

---

La siguiente es una descripción que cuenta historias para ayudar a la comprensión.No te preocupes demasiado.

Claptrap es un robot altamente personalizable.Para que Claptrap funcione en entornos más coloridos y complejos, algunos transportistas que se pueden cargar con Claptrap deben estar diseñados para diferentes entornos del mundo real para que puedan funcionar perfectamente.Por ejemplo,：Claptrap que trabaja en el fondo marino necesita estar equipado con un vehículo que sea suficiente para soportar la presión del agua, Claptrap que trabaja en un pantano necesita estar equipado con un portador a prueba de humedad, y Claptrap que trabaja cerca del cráter necesita estar equipado con un portaaviones hecho de materiales resistentes a altas temperaturas.Esta serie de transportistas, colectivamente llamamos Claptrap Box.Esto se debe a que todos estos transportistas tienen una característica común, todos están en caja de paquete completo, por supuesto, diferentes formas, pero colectivamente llamamos box.Con estos portadores, Claptrap puede funcionar bien en una variedad de entornos.

## Icono

![claptrap](/images/claptrap_icons/claptrap_box.svg)
