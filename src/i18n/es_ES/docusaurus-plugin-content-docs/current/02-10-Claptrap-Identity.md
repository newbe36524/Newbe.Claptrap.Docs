---
title: 'Identidad de Claptrap'
description: 'Identidad de Claptrap'
---


## Claptrap Identity es la identidad única que localiza una Claptrap

Es una estructura.Contiene varias fields：principales

Claptrap Type Code, Claptrap código de clasificación.El código clasificado es el código definido por el desarrollador.Normalmente relacionado con el negocio asociado con Claptrap.Es importante tener en cuenta que no hay ninguna asociación forzada entre Claptrap y su Minion's Claptrap Type Code, pero por lo general durante el desarrollo, el código de tipo Claptrap de Minion debe diseñarse como parte de su Master Claptrap, que es más favorable para los negocios.

Id, Claptrap Business ID.Esta es la identificación del negocio.Normalmente, es la clave principal del negocio.En el código y la documentación reales, Claptrap Identity aparece en nombre completo y, cuando aparecen los ID, normalmente hacen referencia a los ID de negocio.

## Identidad de Claptrap Este es un diseño independiente de la plataforma

Por lo tanto, cuando se combina con una plataforma específica, es necesario aclarar su punto de enlace.

La encarnación de Claptrap Identity en Orleans.

Claptrap Type Code：En Orleans, por lo general cada Claptrap se coloca para ejecutarse en ClaptrapBoxGrain.En este punto, Claptrap Type Code normalmente se marca en una clase o interfaz como una etiqueta de propiedad.

Id：En Orleans, Grain en sí viene con un PrimaryKey.Como resultado, PrimaryKey también se reutiliza directamente en ClaptrapBoxGrain como Claptrap ID.
