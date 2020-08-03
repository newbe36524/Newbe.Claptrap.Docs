---
title: 'Identidad de Claptrap.'
metaTitle: 'Identidad de Claptrap.'
metaDescription: 'Identidad de Claptrap.'
---

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

## Claptrap Identity es la identidad única para localizar una Claptrap.

Es una estructura.Contiene los siguientes campos principales.：

Claptrap Type Code, Claptrap Classification Code.El código de clasificación es el código que el propio desarrollador se define a sí mismo.Por lo general, está relacionado con el negocio asociado con el Claptrap correspondiente.Vale la pena señalar que no hay correlación obligatoria entre Claptrap y su Minion's Claptrap Type Code, pero es común que el código de tipo Claptrap de Minion se diseñe como parte de su Master Claptrap durante el desarrollo, lo que es más propicio para la comprensión empresarial.

Id, Claptrap Business Id.Esta es la identificación de negocio.Esta suele ser la clave principal del negocio.En el código real, en el documento, Claptrap Identity aparece a término, y cuando aparece un identificador, normalmente se refiere a un identificador de negocio.

## Claptrap Identity se trata de un diseño que no está relacionado con la plataforma en ejecución.

Por lo tanto, cuando se combina con una plataforma específica, es necesario aclarar su punto de integración.

Claptrap Identity se refleja en Orleans.

Claptrap Type Code.：En Orleans, normalmente cada Claptrap se coloca en ClaptrapBoxGrain.En este punto, Claptrap Type Code normalmente se marca como una etiqueta de propiedad en una clase o interfaz.

Id.：En Orleans, Grain tiene una PrimaryKey en sí misma.Por lo tanto, primaryKey como Claptrap Id también se reutilizó directamente en ClaptrapBoxGrain.
