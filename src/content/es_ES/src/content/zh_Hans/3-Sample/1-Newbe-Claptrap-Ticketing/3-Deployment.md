---
title: 'despliegue.'
metaTitle: 'Sistema de emisión de billetes de tren - despliegue.'
metaDescription: 'Sistema de emisión de billetes de tren - despliegue.'
---

> [La versión que se ve actualmente es el resultado de la corrección manual y simplificada en chino traducida por máquina.Si hay alguna traducción incorrecta en el documento, haga clic aquí para enviar su propuesta de traducción.](https://crwd.in/newbeclaptrap)


<!--
## 在线体验

该样例已经被部署在 <http://ticketing.newbe.pro> 网站上。

### 限时开放（还在备案）

由于运营成本的原因，该系统仅在以下特定的时段开放：

| 日期   | 时段        |
| ------ | ----------- |
| 工作日 | 12:00-14:00 |
| 工作日 | 20:00-22:00 |
| 周末   | 19:00-23:00 |

每次重新开放时，系统将会被重置，上一次开放的所有数据将被清空。

#### swagger 文档

为了更有效的抢票，开发者可以根据 swagger 文档给出的 API 开发自动抢票工具。文档地址<http://ticketing.newbe.pro/swagger> -->

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

Los pasos anteriores son una forma de ejecutar SQLite como base de datos y la base de código contiene varios otros modos de implementación que solo requieren up.cmd en diferentes carpetas para：

| Carpeta.               | Descripción.                                               |
| ---------------------- | ---------------------------------------------------------- |
| Clúster local Mongodb. | Versión de equilibrio de carga de varios nodos de MongoDb. |
| LocalCluster SQLite.   | Versión de nodo único sqlite.                              |
| Tencent.               | La versión implementada en la experiencia en línea.        |

> - Si actualmente estás en China continental y estás experimentando una descarga lenta de la imagen netcore, prueba a usar[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
> - Los desarrolladores también pueden optar por implementar la prueba[el](https://labs.play-with-docker.com/)PWD.
> - Cambie entre diferentes modos de implementación, tenga cuidado de ejecutar docker-compose abajo primero para cerrar la última implementación.
> - Los puertos web pueden variar de un patrón de implementación a un modo de implementación, dependiendo de la configuración de docker-compose.yml.
