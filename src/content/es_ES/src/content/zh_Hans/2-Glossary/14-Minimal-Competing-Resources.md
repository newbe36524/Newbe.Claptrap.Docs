---
title: 'Recursos competitivos mínimos'
metaTitle: 'Recursos competitivos mínimos'
metaDescription: 'Recursos competitivos mínimos'
---

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

Un concepto que es importante cuando se utiliza el marco de Claptrap para recursos competitivos mínimos.Comprender este concepto ayuda a los desarrolladores a diseñar mejor el estado de Claptrap y evitar el diseño incorrecto.

## ¿Cuál es el recurso competitivo más pequeño.

El concepto de "competencia de recursos" en la programación análoga-multiproceso, donde el concepto de "recursos mínimos competitivos" se propone en un sistema empresarial.Con este concepto, es fácil encontrar puntos de diseño para cómo aplicar Newbe.Claptrap.

En el caso del comercio electrónico, por ejemplo, cada producto básico es un "recurso competitivo mínimo".Tenga en cuenta que esto no quiere decir que todos los productos sean un "recurso competitivo mínimo".Porque, si se numeran 10.000 bienes, entonces la prisa por comprar bienes 1 y 2, no hay competencia en sí misma.Por lo tanto, cada producto básico es un recurso competitivo mínimo.

Estos son algunos ejemplos available：

- En un sistema empresarial que solo permite inicios de sesión de un solo extremo, el ticket de inicio de sesión de un usuario es el recurso menos competitivo.
- En un sistema de configuración, cada elemento de configuración es el recurso menos competitivo.
- En un mercado de valores, cada orden de compra o venta es el recurso competitivo más pequeño.

En algunos escenarios, el recurso competitivo más pequeño también se conoce como la "Unidad Mínima Concurrente"

## El Estado de Claptrap debe ser al menos mayor o igual que el rango de "recursos mínimos competitivos".

Combinado con el ejemplo de un snap de comercio electrónico, si todos los productos están diseñados en el mismo estado de Claptrap (mayor que el recurso competitivo más pequeño)."A continuación, diferentes usuarios compran artículos que se afectan entre sí porque el patrón Actor basado en Claptrap se pone en cola para procesar solicitudes."Es decir, suponiendo que cada artículo necesita procesar 10ms, entonces la necesidad más rápida s 10000 s 10 ms para procesar todas las solicitudes de compra.Pero si cada elemento está numerado, cada elemento está diseñado como un estado de Claptrap independiente.Así que porque no están relacionados.Vender todos los bienes teóricamente sólo costaría 10 ms.

Por lo tanto, es fácil concluir que si el Estado de Claptrap es mayor que el recurso competitivo mínimo, el sistema no tendrá un problema de corrección, pero puede haber algunas sanciones de rendimiento. Además, si el estado de Claptrap es menor que el recurso competitivo mínimo, la relación entre Claptrap se vuelve difícil y arriesgada.Debido a que esto equivale a dividir un recurso competitivo mínimo en varias partes, y el recurso competitivo más pequeño normalmente debe tratarse en una sola transacción, lo que se remonta al problema muy común de las transacciones distribuidas en partes distribuidas que son difíciles de manejar.
