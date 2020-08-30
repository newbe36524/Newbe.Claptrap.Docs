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

## 独立部署

开发者也可以使用源码在本地的 docker 环境进行独立部署。只需要按照以下的步骤进行操作即可。

1. Asegúrese de que el entorno de docker está instalado correctamente localmente y de que el docker-compose/git está disponible.
2. Consulte el origen del proyecto <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. Ejecute el comando docker-compose build en la carpeta src/Newbe.Claptrap.Ticketing para completar la compilación del proyecto.
4. Ejecute docker-compose up-d en la carpeta src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLite para iniciar todos los servicios.
5. Acceda al `http://localhost:10080` para abrir la interfaz.

总结起来，脚本如下：

```bash
Git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.examples/src/newbe.Claptrap.ticketing
docker-compose build
cd Docker/LocalClusterSQLite
docker-compose up -d.
```

以上步骤是运行以 SQLite 为数据库的方法，代码库中还包含了其他若干种部署模式，只需要分别运行不同文件夹中的 up.cmd 即可：

| 文件夹                 | 说明                |
| ------------------- | ----------------- |
| LocalClusterMongodb | MongoDb 多节点负载均衡版本 |
| LocalClusterSQLite  | SQLite 单节点版本      |
| Tencent             | “在线体验”中部署的版本      |

> - Si actualmente estás en China continental y estás experimentando una descarga lenta de la imagen netcore, prueba a usar[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
> - Los desarrolladores también pueden optar por implementar la prueba[el](https://labs.play-with-docker.com/)PWD.
> - Cambie entre diferentes modos de implementación, tenga cuidado de ejecutar docker-compose abajo primero para cerrar la última implementación.
> - Los puertos web pueden variar de un patrón de implementación a un modo de implementación, dependiendo de la configuración de docker-compose.yml.
