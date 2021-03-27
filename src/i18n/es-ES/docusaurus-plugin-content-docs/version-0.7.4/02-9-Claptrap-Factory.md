---
title: 'Fábrica de Claptrap'
description: 'Fábrica de Claptrap'
---


## Claptrap Factory ensambla Claptrap

Claptrap tiene un alto grado de personalización.Los desarrolladores pueden especificar un rango de componentes para el objeto Claptrap, como el cargador de eventos personalizado/Event Saver/State Loader/State Saver/EventNotification Method.Para adaptarse a esta personalización, es necesario utilizar un buen esquema para lograr el montaje de objetos Claptrap.

El marco actual se realiza con Autofac como ensamblador.La razón principal es que Autofac admite características como Delegate Factory / Decorator / Generic Type / Module que son más ricas que System.DesignEdencyInjection.

## Claptrap Factory controla el ciclo de vida de Claptrap

Debido a que Claptrap Factory es un productor de Claptrap, también es generalmente responsable de las capacidades de control del ciclo de vida a nivel de Claptrap.En La fábrica de Claptrap basada en Autofac, este control del ciclo de vida se refleja en el uso de los objetos LifetimeScope de Autofac para controlar todo el proceso de carga, creación y descarga.

---

La siguiente es una descripción que cuenta historias para ayudar a la comprensión.No te preocupes demasiado.

Claptrap Factory es el lugar principal para la producción de Claptrap.Realizará un montaje personalizado de cada Claptrap de fábrica de acuerdo con un diseño Claptrap dado, que tiene una tasa de paso de producto y rendimiento muy alto.

## Icono

![claptrap](/images/claptrap_icons/claptrap_factory.svg)
