---
title: 'Fábrica de Claptrap'
metaTitle: 'Fábrica de Claptrap'
metaDescription: 'Fábrica de Claptrap'
---

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

## Claptrap Factory ensambla Claptrap.

Claptrap tiene un alto grado de personalización.Los desarrolladores pueden especificar un conjunto personalizado de componentes para el objeto Claptrap, como Event Loader/Event Saver/State Saver/State Saver/EventNotification Method, etc.Para adaptarse a esta personalización, se necesita una buena solución para lograr el montaje de objetos Claptrap.

El marco actual se realiza utilizando Autofac como ensamblador.La razón principal es que Autofac admite algunas de las características más ricas de System.Depenedency Injection, como Delegate Factory/Decorator/Generic Type/Module.

## Claptrap Factory controla el ciclo de vida de Claptrap.

Debido a que Claptrap Factory es un productor de Claptrap, también es generalmente responsable de la función de control del ciclo de vida en el nivel de Claptrap.En Claptrap Factory basado en Autofac, este control del ciclo de vida se refleja en el proceso de uso del objeto LifetimeScope de Autofac para controlar todo el proceso de carga, creación y descarga.

---

La siguiente es una descripción basada en la historia para ayudar a la comprensión.No me importa demasiado.

Claptrap Factory es el sitio principal para la producción de Claptrap.Se personalizará para cada Claptrap fabricado en fábrica de acuerdo con el diseño Claptrap dado, y tiene una tasa de pase de producto muy alta y eficiencia en el trabajo.

## Icono.

![Una trampa.](/images/claptrap_icons/claptrap_factory.svg)
