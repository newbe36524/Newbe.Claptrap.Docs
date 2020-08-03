---
title: 'Caja de aplausos.'
metaTitle: 'Caja de aplausos.'
metaDescription: 'Caja de aplausos.'
---

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

## Claptrap Box permite que Claptrap se ejecute en más marcos.

Claptrap es un objeto implementado en función del patrón Actor.Solo tiene la capacidad de controlar eventos y controles de estado.Por lo tanto, en el escenario real, a menudo es necesario confiar en el entorno operativo específico para hospedarlo, o la necesidad de diseñar la interfaz de negocio externa de acuerdo con el negocio.

El caso de uso más típico es combinar con el Grano de Orleans.Grain es la implementación virtual de Actor de Orleans, y Claptrap es un actor.Cuando se combinan Claptrap y Grain, elegimos encasillar a Claptrap dentro de Grain.De esta manera, tenemos The Actor, que combina el seguimiento de eventos, corriendo en Grain, que aprovecha al máximo las características distribuidas de Orleans.Cuando ponemos Claptrap en grano, podemos pensar en Grano como una caja, y la combinación de objetos es muy similar al patrón de fachada en modo de diseño, donde Grain proporciona Claptrap con una fachada para comunicarse con el exterior, enmascarando los detalles internos mientras hace que el exterior sea más consciente de cómo interactúa.Aquí llamamos a esto "cómo funciona Claptrap en un objeto de fachada específico" como el patrón Claptrap Box, donde el objeto de fachada se llama Claptrap Box.Este enfoque permite que Claptrap se aplique a plataformas y negocios más complejos.En Orleans, esta Claptrap Box se llama Claptrap BoxGrain.

Gracias a The Claptrap Box, Claptrap puede mantener las condiciones básicas de seguimiento de eventos y modo Actor incluso si está separado de Orleans.Por ejemplo, en un programa de consola simple, los desarrolladores todavía pueden usar NormalClaptrapBox como un objeto de fachada.Esto, sin embargo, pierde la ventaja de Orleans distribuido.

La existencia del concepto Claptrap Box permite a Claptrap operar en plataformas y marcos más básicos.Aunque actualmente sólo Orleans / Akka.net / ningún portador, etc. están disponibles para la selección de objetos de cara.

---

La siguiente es una descripción basada en la historia para ayudar a la comprensión.No me importa demasiado.

Claptrap es un robot altamente personalizable.Para que Claptrap funcione en un entorno más complejo, necesita diseñar cargas cargadas para diferentes entornos del mundo real para que funcionen perfectamente.Por ejemplo.：Claptrap trabajar en el fondo del mar requiere un portador que es suficiente para soportar la presión del agua; Claptrap trabajar en un pantano requiere un vehículo a prueba de trampas; y Claptrap trabajar cerca del cráter requiere un portaaviones hecho de materiales de alta temperatura.Esta serie de vehículos, conocidos colectivamente como Claptrap Box.Esto se debe a que todos estos portadores tienen una característica común, todos son cajas completamente empaquetadas, por supuesto, en diferentes formas, pero colectivamente nos referimos a la caja.Con estos vehículos, Claptrap funciona bien en una variedad de entornos diferentes.

## Icono.

![Una trampa.](/images/claptrap_icons/claptrap_box.svg)
