---
date: 2020-06-18
title: '¿Cuánta memoria necesita para 100.000 usuarios en línea simultáneos? - Newbe.Claptrap Framework Horizontal Extension Experiment'
---

El proyecto Newbe.Claptrap es un marco de desarrollo del lado del servicio que el autor está construyendo sobre la base teórica de``reactivo,`modo Actor`y``de trazabilidad de eventos.En este artículo, veremos la capacidad del marco de trabajo para escalar horizontalmente.

<!-- more -->

## Un sintetizador informativo anterior

Después de mucho tiempo, nos volvemos a ver hoy.En primer lugar, me gustaría presentar el pasado project：

[Para los lectores por primera vez de este marco, puede leer la teoría básica y cómo funciona aquí.](001-Overview-Of-Newbe-Claptrap)

Recientemente, también hemos escrito algunos artículos de calentamiento y herramientas, los lectores pueden aprender sobre el：

- [Hable sobre la aplicación de la programación reactiva en el lado del servicio, optimización de la operación de la base de datos, de 20 segundos a 0,5 segundos](008-Reactive-In-Server-1)
- [Newbe.Claptrap Project Weekly 1 - Sin ruedas todavía, corre con ruedas primero](006-Newbe-Claptrap-Weekly-1)

## Tema de hoy

Hoy, vamos a hacer una vista previa de laboratorio para validar el marco Newbe.Claptrap y cómo adaptarse al creciente número de usuarios en línea en forma de extensiones horizontales.

## Descripción de los requisitos empresariales

Veamos primero el escenario empresarial que se implementarán today：

- El usuario inicia sesión a través de la API y genera un token JWT
- La validez del token JWT se verifica cuando el usuario llama a la API
- La emisión de tokens JWT no se realiza con la clave pública y privada de JWS normal, pero se aplica un algoritmo hash para cada usuario que usa secreto por separado
- Verificar para ver cuánta memoria necesitan consumir los diferentes usuarios en línea
- El usuario no debe tardar más de 200 ms en iniciar sesión en el token de compilación
- El tiempo de validación de Tokn no debe superar los 10 ms

### Bragging bate por primera vez el draft

El autor no buscó el "número de usuarios en línea" directamente relacionados con la definición teórica, por lo tanto, con el fin de evitar diferencias en su comprensión.El autor primero según su propio entendimiento para señalar：número de usuarios en línea al final significa ¿qué tipo de requisitos técnicos?

#### Los usuarios no en línea que están en línea no deben verse afectados por el número de usuarios que ya están en línea

Si un usuario inicia sesión, toma 100 ms.Así que si el número de usuarios en línea hoy en día es diez o un millón.Este login no toma significativamente más de 100 ms.

Por supuesto, el hardware físico limitado seguramente se ralentizará o incluso hará que sea más fácil o incluso incorrecto para los nuevos usuarios iniciar sesión cuando el número de usuarios en línea supera un umbral, como dos millones.

Sin embargo, al aumentar la máquina física, este umbral se puede elevar, y podemos considerar que el diseño de expansión horizontal es un éxito.

#### Para cualquier usuario en línea, los comentarios sobre el rendimiento del sistema deben ser los mismos

Por ejemplo, los usuarios que ya están en línea necesitan consumir 100 ms para consultar los detalles de su pedido.A continuación, el consumo medio de consultas de pedido por parte de cualquier usuario debe ser estable a 100 ms.

Por supuesto, debe descartar problemas de rendimiento de alta concentración como el ajuste.La discusión principal aquí es el aumento constante diario de la capacidad.(Hablaremos de "snapping" por separado más tarde)

El punto específico se puede entender de esta manera.Digamos que estamos haciendo un producto de nota en la nube.

Por lo tanto, si la adición de máquinas físicas aumenta el número de usuarios que usan productos de notas en la nube al mismo tiempo, sin sacrificar la experiencia de rendimiento de ningún usuario, creemos que el diseño de escalado horizontal es un éxito.

En este experimento, si el usuario ya ha iniciado sesión, el tiempo para verificar la validez del JWT es aproximadamente 0,5 ms.

## Llamar a la relación de tiempo

![Diagrama de temporización](/images/20200621-001.png)

Breve description：

1. Las solicitudes de inicio de sesión de cliente se comunican capa por capa a UserGrain
2. UserGrain activará internamente un Claptrap para mantener los datos de estado en UserGrain.Incluye nombre de usuario, contraseña y secreto para la firma JWT.
3. Las compilaciones y validaciones de JWT posteriores usarán los datos de UserGrain directamente.Porque los datos de UserGrain se "almacenan en caché" en la memoria durante un período de tiempo.Por lo tanto, la compilación y validación de JWT que sigue será muy rápida.La cantidad medida es de aproximadamente 0,5 ms.

## Diseño de estructura física

![Diseño de estructura física](/images/20200618-001.png)

Como se muestra en la figura anterior, este es el componente físico del test：

| Nombre                       | Descripción                                                                                                                               |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| WebAPI                       | Exponer a la llamada externa la interfaz WebAPI.Proporciona una interfaz para iniciar sesión y comprobar el token.                        |
| Clúster de Orleans           | El proceso central de alojar Grain.                                                                                                       |
| Puerta de entrada de Orleans | El clúster de Orleans es esencialmente el mismo, pero la WebAPI sólo puede comunicarse con Gateway                                        |
| Panel de Orleans             | La puerta de enlace de Orleans es básicamente la misma, pero se ha añadido una presentación del panel para ver todo el clúster de Orleans |
| Cónsul                       | Detección y mantenimiento de clústeres para clústeres de Orleans                                                                          |
| Claptrap DB                  | Se utiliza para contener datos de eventos y estado para el marco Newbe.Claptrap                                                           |
| Influx DB & Grafana          | Se utiliza para supervisar los datos de las métricas de rendimiento relacionados con Newbe.Claptrap                                       |

El número de nodos de clúster de Orleans en este experimento es en realidad el número total de clúster más puerta de enlace más panel.Las divisiones anteriores se distinguen realmente por las diferencias en la configuración de la función.

Los nodos físicos que prueban la característica Extensión horizontal son principalmente El clúster de Orleans y la puerta de enlace de Orleans.El uso de memoria para las siguientes condiciones se probará por separado.

| Panel de Orleans | Puerta de entrada de Orleans | Clúster de Orleans |
| ---------------- | ---------------------------- | ------------------ |
| 1                | 0                            | 0                  |
| 1                | 1                            | 1                  |
| 1                | 3                            | 5                  |

Este experimento utiliza pruebas de implementación de Windows Docker Desktop junto con WSL 2.

Las estructuras físicas anteriores están diseñadas de acuerdo con las circunstancias más complejas del experimento.De hecho, si el escenario empresarial es lo suficientemente simple, la estructura física se puede recortar.Puede ver las instrucciones en las preguntas frecuentes a continuación para obtener más detalles.

## Los datos de prueba reales

A continuación, pruebe diferentes tamaños de clúster y números de usuario

### 0 Gateway 0 Cluster

De forma predeterminada, cuando se inicia por primera vez el panel nodo, portainer le permite ver que el contenedor consume unos 200 MB de memoria, como se muestra en el：

![La huella de memoria inicial](/images/20200621-002.png)

La consola de prueba realiza 30.000 solicitudes a la WebAPI.Cada lote de 100 solicitudes se envía por lotes.

Después de una espera de unos dos minutos, mire de nuevo la memoria, alrededor de 9.2 GB, como se muestra en el：

![30.000 usuarios](/images/20200621-003.png)

Por lo tanto, simplemente estimamos que la cantidad de memoria que cada usuario en línea necesita consumir es aproximadamente (9,2 x 1024-200)/30000 x 0,3 MB.

Además, puede ver algunos data：secundarios

Uso de CPU

![Uso de CPU](/images/20200621-004.png)

Rendimiento de la red

![Rendimiento de la red](/images/20200621-005.png)

Panel de Orleans.Los 30.000 en TOTAL ACTIVATIONS en la esquina superior izquierda representan el número de UserGrains actualmente en la memoria, y los otros tres son Granos utilizados por Dashboard.

![Panel de Orleans](/images/20200621-006.png)

El tiempo medio de procesamiento para los eventos que ven Newbe.Claptrap en Grafana es de aproximadamente 100-600 ms.Esta prueba es principalmente una condición de memoria, con un tiempo de procesamiento de 30s, por lo que el tamaño de la muestra es pequeño.Lo probaremos con más detalle en un artículo posterior sobre el tiempo de procesamiento.

![El tiempo medio de procesamiento](/images/20200621-007.png)

El tiempo promedio que se tarda en guardar eventos en Grafana para ver Newbe.Claptrap es de aproximadamente 50-200 ms.El tiempo que se guarda un evento es una parte importante del procesamiento de eventos.

![30.000 usuarios](/images/20200621-009.png)

El número total de eventos controlados en Grafana para ver Newbe.Claptrap.Uno se registra en 30.000 veces, por lo que el número total de eventos es de 30.000.

![El número total de eventos controlados](/images/20200621-008.png)

### 1 Clúster Gateway 1

A continuación, probamos dos nodos adicionales.

Una vez más, el número de nodos de clúster de Orleans es en realidad el número total de clúster más puerta de enlace más panel.Por lo tanto, en comparación con la última prueba, el número de nodos en la prueba es 3.

El uso de memoria probado es tan follows：

| El número de usuarios | La memoria media del nodo | Consumo total de memoria |
| --------------------- | ------------------------- | ------------------------ |
| 10000                 | 1.8 GB                    | 1.8*3 a 5,4 GB           |
| 20000                 | 3.3 GB                    | 3,3o*3 a 9,9 GB          |
| 30000                 | 4,9 GB                    | 4,9o*3 a 14,7 GB         |

Así, en el caso de 30.000 usuarios, el usuario promedio consume alrededor de (14,7 x 1024-200 x 3)/30000 x 0,48 MB

¿Por qué ha aumentado el número de nodos y ha aumentado el consumo medio de memoria?El autor especula que no ha habido ninguna validación：nodos han aumentado y que la comunicación entre nodos realmente requiere memoria adicional, por lo que en promedio aumenta.

### 3 Clúster Gateway 5

Vamos a agregar nodos de nuevo.Los puntos de resumen son 1 (tablero) y 3 (cluster) y 5 (puerta de enlace) y 9 nodos

El uso de memoria probado es tan follows：

| El número de usuarios | La memoria media del nodo | Consumo total de memoria |
| --------------------- | ------------------------- | ------------------------ |
| 20000                 | 1.6 GB                    | 1,6o*9 a 14,4 GB         |
| 30000                 | 2 GB                      | 2o*9 a 18 GB             |

Así, en el caso de 30.000 usuarios, el usuario promedio consume aproximadamente (18 x 1024-200 x 9)/30000 x 0,55 MB

### ¿Cuánta memoria necesitan 100.000 usuarios?

Todas las pruebas anteriores están en el número de 30.000 usuarios, que es un número especial.Dado que el número de usuarios sigue aumentando, la memoria superará el equilibrio de memoria del probador.(Por favor, patrocine dos 16G)

Si continúa aumentando el número de usuarios, comenzará a utilizar la memoria virtual del sistema operativo.Aunque se puede ejecutar, es menos eficiente.El inicio de sesión original solo puede necesitar 100 ms.Los usuarios que utilizan memoria virtual necesitan 2 s.

Por lo tanto, en el caso de velocidades más lentas, puede que no tenga mucho sentido verificar cuánta memoria se requiere.

Sin embargo, esto no significa que no podrá continuar iniciando sesión, como es el caso de 1-plus1, cuando los 100.000 usuarios han iniciado sesión.(Hay 100.000 usuarios en línea al mismo tiempo, añadir algo de memoria, no mal dinero.))

![100.000 usuarios](/images/20200621-010.png)

## Instrucciones de compilación de origen

El código de esta prueba se puede encontrar en la base de código de ejemplo al final del artículo.Para facilitar a los lectores la experiencia propia, docker-compose se utiliza principalmente para la construcción y la implementación.

Por lo tanto, el único requisito de medio ambiente para un probador es instalar Docker Desktop correctamente.

Puede obtener el código de ejemplo más reciente de cualquiera de los siguientes addresses：

- <https://github.com/newbe36524/Newbe.Claptrap.Examples>
- <https://gitee.com/yks/Newbe.Claptrap.Examples>

### Comience rápidamente

Utilice la consola `la carpeta src/Newbe.Claptrap.Auth/LocalCluster` .Puede iniciar todos los componentes localmente ejecutando las siguientes commands：

```
docker-compose up -d
```

Debe extraer algunas imágenes públicas hospedadas en Dockerhub en el camino y asegurarse de que los aceleradores están configurados correctamente localmente para que pueda compilar rápidamente.[se puede configurar leyendo este document](https://www.runoob.com/docker/docker-mirror-acceleration.html)

Después de un lanzamiento exitoso,`componentes se pueden` a través del sitio web de docker ps.

```bash
PS>docker ps
CONTAINER ID        IMAGE                                                                            COMMAND                  CREATED             STATUS              PORTS                                                                                                                              NAMES
66470e5393e2        registry.cn-hangzhou.aliyuncs.com/newbe36524/newbe-claptrap-auth-webapi          "dotnet Newbe.Claptr…"   4 hours ago         Up About an hour    0.0.0.0:10080->80/tcp                                                                                                              localcluster_webapi_1
3bbaf5538ab9        registry.cn-hangzhou.aliyuncs.com/newbe36524/newbe-claptrap-auth-backendserver   "dotnet Newbe.Claptr…"   4 hours ago         Up About an hour    80/tcp, 443/tcp, 0.0.0.0:19000->9000/tcp, 0.0.0.0:32785->11111/tcp, 0.0.0.0:32784->30000/tcp                                       localcluster_dashboard_1
3f60f51e4641        registry.cn-hangzhou.aliyuncs.com/newbe36524/newbe-claptrap-auth-backendserver   "dotnet Newbe.Claptr…"   4 hours ago         Up About an hour    80/tcp, 443/tcp, 9000/tcp, 0.0.0.0:32787->11111/tcp, 0.0.0.0:32786->30000/tcp                                                      localcluster_cluster_gateway_1
7d516ada2b26        registry.cn-hangzhou.aliyuncs.com/newbe36524/newbe-claptrap-auth-backendserver   "dotnet Newbe.Claptr…"   4 hours ago         Up About an hour    80/tcp, 443/tcp, 9000/tcp, 30000/tcp, 0.0.0.0:32788->11111/tcp                                                                     localcluster_cluster_core_1
fc89fcd973f9        grafana/grafana                                                                  "/run.sh"                4 hours ago         Up 6 seconds        0.0.0.0:23000->3000/tcp                                                                                                            localcluster_grafana_1
1f10ed0eb25f        postgres                                                                         "docker-entrypoint.s…"   4 hours ago         Up About an hour    0.0.0.0:32772->5432/tcp                                                                                                            localcluster_claptrap_db_1
d5d2bec74311        adminer                                                                          "entrypoint.sh docke…"   4 hours ago         Up About an hour    0.0.0.0:58080->8080/tcp                                                                                                            localcluster_adminer_1
4c4be69f2f41        bitnami/consul                                                                   "/opt/bitnami/script…"   4 hours ago         Up About an hour    8300-8301/tcp, 8500/tcp, 8301/udp, 8600/tcp, 8600/udp                                                                              localcluster_consulnode3_1
88811d3aa0d2        influxdb                                                                         "/entrypoint.sh infl…"   4 hours ago         Up 6 seconds        0.0.0.0:29086->8086/tcp                                                                                                            localcluster_influxdb_1
d31c73b62a47        bitnami/consul                                                                   "/opt/bitnami/script…"   4 hours ago         Up About an hour    8300-8301/tcp, 8500/tcp, 8301/udp, 8600/tcp, 8600/udp                                                                              localcluster_consulnode2_1
72d4273eba2c        bitnami/consul                                                                   "/opt/bitnami/script…"   4 hours ago         Up About an hour    0.0.0.0:8300-8301->8300-8301/tcp, 0.0.0.0:8500->8500/tcp, 0.0.0.0:8301->8301/udp, 0.0.0.0:8600->8600/tcp, 0.0.0.0:8600->8600/udp   localcluster_consulnode1_1
```

Una vez finalizada la puesta en marcha, puede ver la interfaz relevante a través de los enlaces a continuación

| Dirección                | Descripción                                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------- |
| <http://localhost:19000> | El panel de Orleans ve el estado de los nodos en el clúster de Orleans                    |
| <http://localhost:10080> | Dirección base de la API web, esta vez utilizando la dirección base de la API probada     |
| <http://localhost:23000> | Dirección de Grafana para ver las métricas de rendimiento relacionadas con Newbe.Claptrap |

### Compilación de origen

Utilice la consola `la carpeta de` src/Newbe.Claptrap.Auth.Al ejecutar los siguientes comandos, puede compilar el código locally：

```bash
./LocalCluster/pullimage.cmd
compilación docker-compose
```

Después de esperar a que se complete la compilación, la imagen relevante se genera localmente.A continuación, puede intentar iniciar la aplicación localmente durante la primera time：

Utilice la consola `la carpeta src/Newbe.Claptrap.Auth/LocalCluster` .Puede iniciar el contenedor ejecutando el siguiente comando:

```bash
docker-compose up -d
```

## Preguntas más frecuentes

### ¿Por qué no se describen el código y los detalles de configuración en el artículo?

Este artículo está destinado a mostrar al lector la viabilidad experimental de este escenario y cómo escribir código mediante el marco Newbe.Claptrap, que no es el eje principal de este artículo y, por lo tanto, no se menciona.

El otro punto, por supuesto, es que el marco no está finalizado, es probable que todo cambie y los detalles del código son de poca importancia.

Sin embargo, se puede explicar de antemano que：escritura es muy simple, porque los requisitos empresariales de este ejemplo son muy simples, por lo que el contenido del código no es mucho.Todo se puede encontrar en el repositorio de ejemplo.

### Storage Token con Redis también puede implementar los requisitos anteriores, ¿por qué elegir este marco?

En la actualidad, el autor no tiene una razón completa para convencer al lector que debe utilizar qué esquema, aquí es sólo para proporcionar un esquema factible, en cuanto a la necesidad real debe elegir qué esquema, debe tener el lector para considerar, después de todo, si la herramienta o la necesidad de tratar de saber.

### Si se trata de 100 usuarios en línea, ¿cómo puedo recortar el sistema?

Los únicos componentes necesarios son Orleans Dashboard, WebAPI y Claptrap Db.Todos los demás componentes no son esenciales.Y si modifica el código, Orleans Dashboard y WebAPI se pueden combinar.

Así que el más pequeño es un proceso más una base de datos.

### ¿Por qué Grafana no tiene un informe?

Grafana necesita crear manualmente DataSource e importar Dashboard después de su primer lanzamiento.

Los parámetros relacionados con este experimento son follows：

Datasource

- ： HTTP://INFLUXDB:8086 URL
- Base de datos： métricasbase de datos
- Captura de： de usuario
- Contraseña： aplauso

[Haga clic aquí para ver el archivo de definición del panel](https://github.com/newbe36524/Newbe.Claptrap/blob/develop/src/Docker/Monitor/grafana/claptrap.json)

### ¿Cuál es la configuración física del probador?

No hay memoria libre dedicada y se utilizaron 16 GB de memoria antes de que comenzaran las pruebas.A continuación se muestran los datos de la cifra de la máquina de prueba (basura extranjera, unos 3500 yuanes)：

Procesador Intel Xeon (Xeon) E5-2678 v3 s 2.50GHz 12 núcleo 24 hilos placa base HUANANZHI X99-AD3 GAMING (Wellsburg) gráficos Nvidia GeForce GTX 750 Ti Ti ( 2 GB / Nvidia ) 32 GB de memoria ( Samsung DDR3L 1600MHz ) 2013 Memoria senior disco duro principal Kingston SA400S37240G ( 240 GB / SSD )

Si tiene una mejor configuración física, creo que puede obtener mejores datos.

### Incluso 0,3 MB por usuario es demasiado alto

El marco de trabajo todavía se está optimizando.El futuro será mejor.

<!-- md Footer-Newbe-Claptrap.md -->
