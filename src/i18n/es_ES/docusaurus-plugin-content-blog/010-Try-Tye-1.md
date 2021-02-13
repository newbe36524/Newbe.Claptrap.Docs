---
date: 2021-01-30
title: El desarrollo de aplicaciones k8s con Tye Aid es tan simple como eso (I)
---

Recientemente se ha desarrollado una nueva versión de Newbe.Claptrap, utilizando Tye para ayudar al desarrollo de aplicaciones k8s.Echemos un breve vistazo a cómo se usa en esta serie.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## Instalar Tye

En primer lugar, asegúrese de que la versión 2.1 o superior de netcore del SDK de dotnet está instalada correctamente.

Tye está actualmente en desarrollo, por lo que sólo la versión preliminar se puede instalar para su uso en este momento.El link abajo permite que usted busque la última versión y copie la instalación CLI en la interfaz.

<https://www.nuget.org/packages/Microsoft.Tye/>

```bash
dotnet herramienta install --global Microsoft.Tye --version 0.6.0-alpha.21070.5
```

Una vez instalado, ejecute tye en la consola y puede ver los siguientes results：

```bash
PS C:\tools\Cmder> tye
tye:
  Developer tools and publishing for microservices.

Usage:
  tye [options] [command]

Options:
  --no-default      Disable default options from environment variables
  -?, -h, --help    Show help and usage information
  --version         Show version information

Commands:
  init <path>        create a yaml manifest
  run <path>         run the application
  build <path>       build containers for the application
  push <path>        build and push application containers to registry
  deploy <path>      deploy the application
  undeploy <path>    delete deployed application
```

## Crear y ejecutar un proyecto de prueba

A continuación, creamos una aplicación netcore para probar el escenario de implementación.Elija una ubicación adecuada para ejecutar los siguientes comandos para crear una prueba project：

```bash
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln .\TyeTest.sln agregue .\TyeTest\TyeTest.csproj
```

De esa manera, obtenemos una solución de prueba y un proyecto WebApi.Podemos ejecutar el siguiente comando para iniciar este servicio locally：

```bash
dotnet run --project .\TyeTest\TyeTest.csproj
```

Después del lanzamiento, puede abrir el navegador<https://localhost:5001/swagger/index.html>para ver la interfaz swagger de inicio.

## Use tye para ejecutar la aplicación localmente

A continuación, vamos a cerrar la aplicación que se estaba ejecutando anteriormente y usar tye en su lugar para iniciar la aplicación de prueba localmente.

En el directorio de la solución, utilice la consola para ejecutar las siguientes commands：

```bash
tye correr
```

Después de ejecutar, puede obtener las siguientes results：

```bash
PS C:\Repos\TyeTest> tye run
Loading Application Details...
Launching Tye Host...

[12:11:30 INF] Ejecución de la aplicación desde C:\Repos\TyeTest\TyeTest.sln
[12:11:30 INF] Panel que se ejecuta en http://127.0.0.1:8000
[12:11:30 INF] Construcción de proyectos
[12:11:32 INF] Lanzamiento del servicio tyetest_9dd91ae4-f: C:\Repos\TyeTest\TyeTest-bin-Debug\net5.0\TyeTest.exe
[12:11:32 INF] tyetest_9dd91ae4-f que se ejecuta en el identificador de proceso 24552 enlazado a http://localhost:14099, https://localhost:14100
[12:11:32 INF] La réplica tyetest_9dd91ae4-f se está moviendo a un estado listo
[ 12:11:32 INF] Proceso seleccionado 24552.
[12:11:33 INF] Escuchar eventos de canalización de eventos para tyetest_9dd91ae4-f en el identificador de proceso 24552
```

Siga los consejos anteriores para <http://127.0.0.1:8000> el panel de tye que se inició correctamente en el equipo.Abra el panel con el explorador para ver una lista de las aplicaciones que se han implementado.Como se muestra en la figura below：

![tye tablero](/images/20210131-001.png)

El panel muestra que el probador se ha iniciado y está enlazado a <http://localhost:14099> y <https://localhost:14100>.En la práctica, en las autopruebas, los dos puertos se seleccionan aleatoriamente, por lo que habrá diferencias.

Al abrir swagger con los enlaces https expuestos anteriormente, podemos ver el mismo efecto que`dotnet run`previously：<https://localhost:14100/swagger>

## Implementar un k8s local

A continuación, usaremos Tye para implementar la aplicación en k8s.Así que para lograr este efecto, primero necesitas preparar un k8s.

Hay varias maneras de implementar k8s en una máquina de desarrollo y este experimento usa un escenario de Docker Desktop más k8s, ya sea debido a algo más o porque hay más o menos problemas con el uso de otros escenarios.Los desarrolladores específicos pueden elegir.

El escenario k8s de Docker Desktop s está bien cubierto en los vínculos siguientes y se recomienda que los desarrolladores consulten：

Docker Desktop inicia Kubernetes<https://www.cnblogs.com/weschen/p/12658839.html>

Además de la ontogene k8s, este laboratorio también requiere la instalación de entrada nginx y timón, que también se puede instalar con referencia al artículo anterior.

## Implementar la aplicación en k8s

Pero cuando k8s está configurado, podemos usar tye para publicar rápidamente la aplicación en k8s para su visualización.

### Inicia sesión en docker registry

En primer lugar, debe configurar el registro de docker para la ventana acoplable local.Dado que la imagen acoplable del proyecto se empaqueta y se inserta en un registro de docker durante el proceso de publicación con tye.

Los desarrolladores pueden elegir entre una variedad de maneras de obtener su propio registro de docker：

- Repositorio de OSS Nexus
- Alibaba Cloud, Tencent Cloud, DaoCloud y más tienen registro de docker gratuito
- Docker hub, si la red es buena

Use``de inicio de sesión de docker para iniciar sesión en el registro de docker.

### tye init crea tye.yml

En el catálogo de soluciones, ejecute el siguiente comando para crear un perfil tye.yml:

```bash
tye init
```

Después de ejecutar, se crearán los siguientes archivos en la solución：

```yml
nombre: tyetest
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
```

Este es el archivo tye.yml más simple.

### Modificar tye.yml

Agregamos una línea de configuraciones sobre docker registry en tye.yml para especificar dónde se insertará la imagen integrada：

```yml
nombre: tyetest
registry: registry.cn-hangzhou.aliyuncs.com/newbe36524
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
```

Por ejemplo, aquí el autor está utilizando el registro docker del nodo Hangzhou de Alibaba Cloud, el espacio de nombres es newbe36524.Así que agregue un registro line`: registry.cn-hangzhou.aliyuncs.com/newbe36524`.

Esto equivale, si se construye, a una imagen de etiqueta de`registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0`y se inserta en la nube de Alibaba.

### Descargue la imagen base de netcore de antemano

Debido a que esta vez vamos a lanzar un programa netcore, se van a construir con imágenes netcore, por lo que para una compilación más suave, se recomienda que utilice la herramienta de aceleración para descargar la imagen subyacente localmente de antemano.

例如，笔者在此次的使用中使用的 net5 TFM 的应用程序，因此，就需要在本地先拉好 mcr.microsoft.com/dotnet/aspnet:5.0 作为基础镜像。

Dado que el origen del reflejo subyacente netcore se ha migrado de docker hub a mcr.microsoft.com.故而，建议使用 Newbe.McrMirror 进行加速下载。

Se pueden hacer referencia a métodos de uso detallados：<https://github.com/newbe36524/Newbe.McrMirror>

Si el desarrollador no sabe cuál es la imagen subyacente que necesita extraer actualmente, también puede intentar el siguiente paso para publicar directamente, ver el contenido de imagen subyacente utilizado en el proceso y, a continuación, extraer.

### Usar tye deploy

Ahora que todo está listo, puede publicar ejecutando los siguientes comandos en el catálogo de soluciones:

```bash
tye deploy
```

Puede obtener los siguientes resultados:

```bash
PS C:\Repos\TyeTest> tye deploy
Loading Application Details...
Verificación de la instalación de kubectl...
Verificación de la conexión kubectl al clúster...
Servicio de procesamiento 'tyetest'...
    Aplicación de valores predeterminados de contenedor...
    Servicios de compilación...
    Publicación de proyectos...
    Creación de proyectos de compilación...  Creación de proyectos de desarrollo...  creación de proyectos de compilación...  creación de proyectos de compilación...  creación de proyectos de compilación...  creación de proyectos de compilación...  creación de proyectos de desarrollo...  creación de proyectos de compilación...  creación de proyectos de compilación...  creación de proyectos de compilación...   creación de proyectos de desarrollo...  creación de proyectos de compilación...  creación de proyectos de compilación...  creación de proyectos de compilación...  creación de proyectos de compilación...   creación de proyectos de compilación...  creación de proyectos de compila Imagen...
            #1 [internal] definición de compilación de carga de Dockerfile
            #1 sha256:a3872c76e0ccfd4bade43ecac3349907e0d110092c3ca8c61f1d360689bad7e2
            #1 transferencia de  #1 transferencia de  #1 dockerfile: 144B hecho
            #1 DONE 0.0s

            #2 [internal] carga .dockerignore
            #2 sha256:9e3b70115b86134ab4be5a3ce629a55cd6060936130c89 b906677d1958215910
            #2 contexto de transferencia: 2B hecho
            #2 DONE 0.0s

            #3 [internal] metadatos de carga para mcr.microsoft.com/dotnet/aspnet:5.0
            #3 sha256:3b35130338ebb888f84ec0aa58f64d182f10a676a625072200f5903996d93690
            #3 HECHO 0.0s

            #7 [1/3] DE mcr.microsoft.com/dotnet/aspnet:5.0
            #7 sha256:31acc33a1535ed7869167d21032ed94a0e9b41bbf02055dc5f04524507860176
            #7 HECHO 0.0s

            #5 [internal] contexto de construcción de carga
            #5 sha256:2aa74f859befdf852c0e7cf6b6b7e71ec4ddeedd37d3bb6e4840dd441d712a20 contexto de transferencia de
            #5: 3.87MB 0.0s hecho
            #5 HECHO 0.1s

            #4 [2/3] WO RKDIR /app
            #4 sha256:56abde746b4f39a24525b2b730b2dfb6d9688bcf704d367c86a4753aefff33f6
            #4 CACHED

            #6 [3/3] COPY . /app
            #6 sha256:4a3b76a4eea70c858830bad519b2d8faf5b6969a820b7e38994c2116d3bacab2
            #6 DONE 0.0s

            #8 exportando a la imagen
            #8 sha256:e8c613bacab2  #6 DONE 0.0s  #8 exportando a la imagen  #8 sha256:e8c613bacab2b7ff33893b694f7759a10d42e180f2b4dc349fb57dc6b71dcab00
            #8 capas exportadoras 0.0s hecho
            #8 escritura de imagen sha256:8867f4e2ed6ccddb509e9c39e86c736188a7a7 8f348d6487d6d2e7a1b5919c1fdb
            #8 imagen de escritura sha256:8867f4e2ed6ccddb509e9c39e86c736188a78f348d6487d6d2e7a1b5919c1fdb hecho
            #8 nombre a registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0 hecho
            #8 DONE 0.1s
        Created Docker Image: 'registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0'
    Inserción de imagen de Docker...
        imagen de docker pushed: 'registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0'

    Validación de secretos...
    generar manifiestos...
implementación de manifiestos de aplicación...
    aplicación de manifiestos de Kubernetes...
        Verificación de la instalación de kubectl...
        Verificación de la conexión de kutlbec a la conexión de kutlbec a cluster...
        Escribir la salida en 'C:'Usuarios'Administrador'AppData'Local\Temp\tmp2BC2.tmp'.
        aplicación implementada 'tyetest'. Tiempo
transcurrido: 00:00:12:99
```

Desde el registro de la salida, podemos ver que la aplicación se ha publicado correctamente.Y con el panel k8s o k9s, todos podemos ver que la aplicación se ha implementado e iniciado correctamente.

```bash
tyetest-674865dcc4-mxkd5 á 1/1 a 0 En ejecución 10.1.0.73 docker-desktop 3m46s
```

Vale la pena señalar que hay varios requisitos previos para garantizar que este paso：

- Debe asegurarse de que su kubectl local está configurado correctamente.En general, si está utilizando docker desktop, ya está configurado
- Debe asegurarse de que el inicio de sesión de docker se ha realizado correctamente.Los desarrolladores pueden probar si las siguientes imágenes se pueden insertar manualmente antes de ejecutar la implementación
- Si la velocidad de descarga de la imagen MCR no es ideal, recuerde acelerarla con Newbe.McRMirror

## Crear y usar la entrada

En este punto, hemos terminado de publicar la aplicación.Sin embargo, debido a que el ingreso de nginx no está configurado, el servicio ya se puede ejecutar dentro de k8s, pero no se accede externamente.Es decir, el uso de un navegador en su ordenador todavía no está abierto.Así que también necesitamos configurar la entrada para el servicio.Amigos que no han instalado la entrada para k8s, se recomienda revisar las secciones anteriores sobre la instalación de k8s.

Aquí, activamos tye.yml para agregar la configuración relacionada con el ingreso：

```yml
nombre: tyetest
registro: registry.cn-hangzhou.aliyuncs.com/newbe36524
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
ingress:
  - name: tyetest-ingress
    bindings:
      - name: https
        protocol: https
    rules:
      - host: www.yueluo.pro
        service: tyetest
```

Hemos agregado una configuración de entrada para que cuando el tráfico llegue desde la entrada y el nombre de dominio sea`www.yueluo.pro`, se reenvíe al servicio tyetest.Esto permite el acceso externo a los servicios internos de k8s.

En primer lugar, utilice`comando tye run` para ver el efecto localmente.Después de ejecutar el comando, puede ver lo siguiente en el dashboard：

![tye dashboard2](/images/20210131-002.png)

Donde, https://localhost:8310 es la dirección de entrada de ingreso.Dado que estamos usando el enlace de nombres de dominio, hay dos maneras de tener acceso a él para comprobar el：

- Agregue una relación de asignación www.yueluo.pro> 127.0.0.1 en hosts
- Utilice http para solicitar acceso directo al archivo.

Aquí usamos el archivo de solicitud http para acceder a la：

```http
GET https://localhost:8310/WeatherForecast
Host: www.yueluo.pro
```

De esta manera, validamos correctamente los resultados del enlace.

Tenga en cuenta que los puertos en él no están configurados como puertos fijos, por lo que cada vez que el desarrollador debe prestar atención a los cambios que se producen.

## Implementar la entrada en k8s

A continuación, detenga``de ejecución tye, ejecute`tye deploy`y publique la entrada y las aplicaciones en k8s.

Tenga en cuenta que la implementación de entrada puede tardar decenas de segundos, por lo que debe esperar.

Una vez completada la implementación, puede ver los resultados de la implementación a través de paneles k8s o k9s.

Además, puede utilizar la siguiente solicitud http para comprobar los resultados de su deployment：

```http
GET https://localhost/WeatherForecast
Host: www.yueluo.pro
```

El resultado es el mismo que antes.

## Desinstale la aplicación de k8s

Desinstale la aplicación,`simple, tye anular la implementación`.

```bash
PS C: epos\R\TyeTest> tye undeploy
Loading Application Details...
Found 3 resource(s).
Eliminar 'Servicio' 'tyetest' ...
Eliminación de 'Despliegue' 'tyetest' ...
Eliminación 'Ingress' 'tyetest-ingress' ...
Tiempo transcurrido: 00:00:02:87
```

## Resumen

En este artículo, describimos brevemente los sencillos pasos de cómo ejecutar o implementar una aplicación mediante tye.Hay muchas opciones que se pueden ampliar y personalizar en la práctica.Los amigos interesados pueden https://github.com/dotnet/tye en el contenido.

A continuación, implementaremos algunas aplicaciones de varias instancias un poco más complejas.

<!-- md Footer-Newbe-Claptrap.md -->
