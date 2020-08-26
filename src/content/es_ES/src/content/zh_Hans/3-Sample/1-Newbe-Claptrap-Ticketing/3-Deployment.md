---
title: 'despliegue.'
metaTitle: 'Sistema de emisión de billetes de tren - despliegue.'
metaDescription: 'Sistema de emisión de billetes de tren - despliegue.'
---

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)

## Experiencia en línea.

Este ejemplo se ha implementado en el sitio web de <http://ticketing.newbe.pro> .

### Apertura por tiempo limitado (todavía archivada)

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

1. Asegúrese de que el entorno de docker está instalado correctamente localmente y de que el docker-compose/git está disponible.
2. Consulte el origen del proyecto <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. Ejecute el comando docker-compose build en la carpeta src/Newbe.Claptrap.Ticketing para completar la compilación del proyecto.
4. Ejecute docker-compose up-d en la carpeta src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLite para iniciar todos los servicios.
5. Acceda al `http://localhost:10080` para abrir la interfaz.

En resumen, el script es tan follows：

```bash
Git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.examples/src/newbe.Claptrap.ticketing
docker-compose build
cd Docker/LocalClusterSQLite
docker-compose up -d.
```

Los pasos anteriores son una forma de ejecutar la base de datos SQLite y la base de código contiene varios otros modos de implementación que requieren la ejecución de up.cmd en diferentes carpetas para：

| Carpeta.               | Descripción.                                               |
| ---------------------- | ---------------------------------------------------------- |
| Clúster local Mongodb. | Versión de equilibrio de carga de varios nodos de MongoDb. |
| LocalCluster SQLite.   | Versión de nodo único sqlite.                              |
| Tencent.               | La versión implementada en la experiencia en línea.        |

> - Si actualmente estás en China continental y estás experimentando una descarga lenta de la imagen netcore, prueba a usar[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
> - Los desarrolladores también pueden optar por implementar la prueba[el](https://labs.play-with-docker.com/)PWD.
> - Cambie entre diferentes modos de implementación, tenga cuidado de ejecutar docker-compose abajo primero para cerrar la última implementación.
> - Los puertos web pueden variar de un patrón de implementación a un modo de implementación, dependiendo de la configuración de docker-compose.yml.
