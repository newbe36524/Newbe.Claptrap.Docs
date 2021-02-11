---
title: 'Recursos competitivos mínimos'
description: 'Recursos competitivos mínimos'
---


Un concepto que es importante cuando se utiliza el marco de Claptrap para recursos competitivos mínimos.Comprender este concepto puede ayudar a los desarrolladores a diseñar mejor el estado de Claptrap y evitar el diseño incorrecto.

## ¿Cuál es el recurso competitivo mínimo

El concepto de "competencia de recursos" en la programación multiproceso se presenta aquí como el concepto de "recurso competitivo mínimo" en los sistemas empresariales.Este concepto facilita la búsqueda de puntos de diseño para aplicar Newbe.Claptrap.

Por ejemplo, en el caso del comercio electrónico, cada elemento es un "recurso competitivo mínimo".Tenga en cuenta que esto no quiere decir que todos los productos sean un "recurso mínimo competitivo".Porque, si usted es el número 10.000 artículos, entonces la prisa por comprar el primer y segundo producto, no hay competencia en sí mismo.Por lo tanto, cada producto básico es un recurso competitivo mínimo.

Estos son algunos ejemplos available：

- En un sistema empresarial que solo permite inicios de sesión de un solo extremo, el ticket de inicio de sesión de un usuario es el recurso menos competitivo
- En un sistema de configuración, cada elemento de configuración es el recurso menos competitivo
- En un mercado de valores, cada orden de compra o venta es el recurso menos competitivo

En algunos escenarios, el recurso competitivo más pequeño también se conoce como la Unidad Concurrente Mínima

## El Estado de Claptrap debe ser al menos mayor o igual que el alcance de los "recursos mínimos competitivos".

Combinado con ejemplos de complementos de comercio electrónico, si todos los artículos están diseñados en el mismo estado de Claptrap (mayor que el recurso competitivo mínimo).A continuación, diferentes usuarios compran elementos que se afectan entre sí porque Claptrap se basa en el patrón Actor que pone en cola para procesar las solicitudes.Es decir, suponiendo que cada artículo necesita procesar 10 ms, entonces es hasta 10000 para manejar todas las solicitudes de compra.Sin embargo, si cada elemento está numerado, cada elemento está diseñado como un estado de Claptrap independiente.Así que porque no están relacionados entre sí.La venta de todos los productos requeriría teóricamente sólo 10ms.

Por lo tanto, es fácil concluir que si el estado de Claptrap es mayor que el rango mínimo de recursos competitivos, el sistema no tendrá un problema con la corrección, pero puede haber algunas pérdidas de rendimiento. Además, si el estado de Claptrap es menor que el rango mínimo de recursos competitivos, la relación entre Claptrap se vuelve difícil de manejar y arriesgada.Dado que esto equivale a dividir un recurso competitivo mínimo en partes, y el recurso competitivo mínimo normalmente debe controlarse en una transacción, esto vuelve al problema de las transacciones distribuidas, que es muy común en distribuidas, difíciles de tratar.
