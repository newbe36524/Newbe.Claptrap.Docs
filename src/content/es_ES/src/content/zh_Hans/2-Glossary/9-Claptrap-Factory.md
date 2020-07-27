---
title: 'Fábrica de Claptrap'
metaTitle: 'Fábrica de Claptrap'
metaDescription: 'Fábrica de Claptrap'
---

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

Claptrap tiene un alto grado de personalización.Los desarrolladores pueden especificar un conjunto personalizado de componentes para el objeto Claptrap, como Event Loader/Event Saver/State Saver/State Saver/EventNotification Method, etc.Y por la necesidad de adaptarse a esta personalización.Por lo tanto, es necesario elegir una buena solución para lograr el ensamblaje de los objetos Claptrap.

El marco actual se realiza utilizando Autofac como ensamblador.Esto se debe principalmente al soporte de Autofac para algunas de las características más ricas de System.Depenedency Injection, etc.

---

La siguiente es una descripción basada en la historia para ayudar a la comprensión.No me importa demasiado.

Claptrap Factory es el sitio principal para la producción de Claptrap.Personalizará cada Claptrap basado en fábrica para cada fábrica basado en el diseño Claptrap dado.Tiene una tasa de paso de producto muy alta y eficiencia de trabajo.

## Icono.

![Una trampa.](/images/claptrap_icons/claptrap_factory.svg)
