---
title: 'despliegue.'
metaTitle: 'Sistema de emisión de billetes de tren - despliegue.'
metaDescription: 'Sistema de emisión de billetes de tren - despliegue.'
---

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

## Experiencia en línea.

Este ejemplo se ha implementado en el sitio web de <http://ticketing.newbe.pro> .

### Abierto por tiempo limitado.

Debido a los costes operativos, el sistema solo está disponible para los siguientes periods：

| Fecha.  | Hora.        |
| ------- | ------------ |
| Días.   | 12:00-14:00。 |
| Días.   | 20:00-22:00。 |
| Semana. | 19:00-23:00。 |

Cada vez que se vuelva a abrir, el sistema se restablecerá y se vaciarán todos los datos de la última apertura.

#### Documentación de Swagger.

Para ser más eficaces en la emisión de tickets, los desarrolladores pueden desarrollar herramientas de emisión de tickets automáticas basadas en las API que se indican en la documentación de swagger.Dirección de documento<http://ticketing.newbe.pro/swagger>

## Implemente de forma independiente.

Los desarrolladores también pueden usar el código fuente para la implementación independiente en el entorno de acoplación local.Sólo tienes que seguir los pasos a continuación.

1. Asegúrese de que el entorno de docker está instalado correctamente localmente y de que el docker-compose está disponible.
2. Consulte el origen del proyecto <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. Ejecute el comando `docker-compose build` en la carpeta `src/Newbe.Claptrap.Ticketing` para completar la compilación del proyecto.
4. Ejecute `` docker-compose up -d en la carpeta`src/Newbe.Claptrap.Ticketing/LocalCluster` para iniciar todos los servicios.
5. Acceda al `http://localhost:10080` para abrir la interfaz.

> Si actualmente estás en China continental y estás experimentando una descarga lenta de la imagen netcore, prueba a usar[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
