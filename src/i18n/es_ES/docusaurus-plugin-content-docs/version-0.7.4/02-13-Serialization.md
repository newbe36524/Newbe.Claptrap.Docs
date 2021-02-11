---
title: 'Serialización'
description: 'Serialización'
---


Dado que los eventos y estados deben transmitirse y almacenarse en un sistema Claptrap, es necesario serializar eventos y estados para controlar una amplia variedad de escenarios de transporte y almacenamiento.

## Cómo seleccionar un esquema de serialización

Hay una variedad de opciones para la serialización, normalmente：JSON, MessagePack, Protobuf y más.Los escenarios serializados en el proyecto real se pueden considerar en función de las siguientes points：

1. Legibilidad.Si hay requisitos más altos para la legibilidad, más debe considerar la serialización basada en texto.
2. Eficiencia de transmisión, utilización del espacio de almacenamiento.Si hay requisitos más altos para la eficiencia del transporte y el espacio de almacenamiento, se debe considerar la serialización basada en binario más.

En el sistema Claptrap, debido a que cada Claptrap es completamente personalizable, los desarrolladores pueden elegir diferentes esquemas de serialización para diferentes Claptrap.Sin embargo, lo único a tener en cuenta es que el esquema de serialización es difícil de cambiar una vez seleccionado, por lo que debe considerarse cuidadosamente en la etapa de diseño.

## Serialización e independencia del transportista

En el marco de Claptrap, el almacenamiento, el transporte y la serialización son independientes entre sí.En otras palabras, puede usar una serialización JSON más fácil de leer durante la transmisión, elegir una serialización binaria que sea más propicia para la utilización del almacenamiento y viceversa.

## Restricciones de serialización y portadora

La serialización también se limitará ante vectores de almacenamiento o transporte específicos.Por example：actualmente está utilizando una base de datos que no admite el almacenamiento directo binario como una capa persistente para eventos y, a continuación, elegir guardar eventos a través de la serialización binaria se vuelve imparable.Por lo tanto, antes de elegir un esquema de serialización, debe priorizar los escenarios de transporte y almacenamiento.

Actualmente, todos los esquemas de serialización admitidos se publican en nuget bajo el nombre "Newbe.Claptrap.DataSerializer".
