---
title: 'Serialización'
metaTitle: 'Serialización'
metaDescription: 'Serialización'
---

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

Dado que los eventos y estados deben transferirse y almacenarse en el sistema Claptrap, es necesario serializar los eventos y estados para poder controlar una amplia variedad de escenarios de transporte y almacenamiento.

## Cómo seleccionar un esquema de serialización.

Los métodos de serialización opcionales están disponibles de varias maneras, normalmente.：JSON, MessagePack, Protobuf, etc.Los esquemas de serialización en proyectos reales se pueden considerar en los siguientes puntos.：

1. Legibilidad.Si hay requisitos más altos para la legibilidad, más debe tener en cuenta los escenarios de serialización basados en texto.
2. Eficiencia de transferencia, utilización del espacio de almacenamiento.Si hay requisitos más altos para la eficiencia de transferencia y el espacio de almacenamiento, se deben tener en cuenta los escenarios de serialización más basados en binarios.

En el sistema Claptrap, dado que cada Claptrap tiene personalización completamente independiente, los desarrolladores pueden elegir diferentes escenarios de serialización para diferentes Claptraps.Sin embargo, lo único a tener en cuenta es que una vez seleccionado el esquema de serialización, es difícil cambiar, por lo que debe considerarse cuidadosamente en la etapa de diseño.

## Serialización e independencia del transportista.

En el marco de Claptrap, el almacenamiento, el transporte y la serialización son independientes entre sí.En otras palabras, puede usar la serialización jSON, que es más legible, cuando se transfiere, y la serialización binaria que es más propicio para la utilización del almacenamiento, y viceversa.

## Serialización y la restricción del portador.

La forma en que la serialización también está limitada frente a un vector de almacenamiento o edición de transporte determinado.Por ejemplo.：Actualmente usando una base de datos que no admite archivos binarios para el almacenamiento directo como una capa persistente de eventos, se vuelve poco práctico elegir guardar eventos a través de la serialización binaria.Por lo tanto, antes de seleccionar un esquema de serialización, es necesario dar prioridad al escenario de transporte y almacenamiento.

Actualmente, todos los esquemas de serialización admitidos se publican en nuget bajo el nombre "Newbe.Claptrap.DataSerializer."
