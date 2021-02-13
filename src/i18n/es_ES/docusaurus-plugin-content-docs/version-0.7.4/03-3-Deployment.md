---
title: 'despliegue'
description: 'Sistema de emisión de billetes de tren - despliegue'
---


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

## Despliegue independiente

Los desarrolladores también pueden usar el código fuente para la implementación independiente en el entorno de docker local.Sólo sigue estos pasos.

1. Asegúrese de que el entorno de docker está instalado correctamente localmente y que puede utilizar docker-compose/git
2. Consulte el origen del proyecto code <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. Ejecute el comando docker-compose build en la carpeta src/Newbe.Claptrap.Ticketing para completar la compilación del proyecto
4. Ejecute docker-compose up-d en la carpeta src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLite para iniciar todos los servicios
5. Acceda `http://localhost:10080` para abrir la interfaz.

En resumen, el script es tan follows：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-compose build
cd Docker/LocalClusterSQLite
docker-compose up -d
```

Los pasos anteriores son una forma de ejecutar SQLite como base de datos y la base de código contiene varios otros modos de implementación que solo necesitan ejecutar up.cmd en carpetas independientes para：

| Carpeta             | Descripción                                               |
| ------------------- | --------------------------------------------------------- |
| LocalClusterMongodb | Versión de equilibrio de carga de varios nodos de MongoDb |
| LocalClusterSQLite  | Versión de nodo único SQLite                              |
| Tencent             | La versión implementada en la experiencia en línea        |

> - Si actualmente estás en China continental y estás experimentando una descarga lenta de imágenes netcore, puedes probar[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
> - Los desarrolladores también pueden[implementar](https://labs.play-with-docker.com/)prueba en la red PWD
> - Cambiar entre diferentes modos de implementación es tener cuidado de ejecutar docker-compose abajo primero para cerrar la última implementación
> - Los puertos web pueden variar del modo de implementación al modo de implementación, dependiendo de la configuración de docker-compose.yml
