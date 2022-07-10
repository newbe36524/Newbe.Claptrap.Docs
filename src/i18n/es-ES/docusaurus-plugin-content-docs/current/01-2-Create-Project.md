---
title: "Paso 2 - Crear un proyecto"
description: "Paso 2 - Crear un proyecto"
---

En los próximos article [primer paso : preparación del entorno de desarrollo](01-1-Preparation.md) , vamos a seguir aprendiendo cómo crear un proyecto Newbe.Claptrap.

<!-- more -->

## Instale la plantilla de proyecto

Abra la consola para ejecutar los siguientes comandos para instalar el proyecto más reciente templates：

```bash
dotnet nuevo --instalar Newbe.Claptrap.Template
```

Una vez instalado, puede ver la plantilla de proyecto instalada en los resultados de la instalación.

![newbe.claptrap.template instalado](/images/20200709-001.png)

## Crear un proyecto

Seleccione una ubicación, cree una carpeta y este ejemplo elige crear una carpeta llamada`HelloClaptrap`en`D:\Repo`.La carpeta actuará como la carpeta de código del nuevo proyecto.

Abra la consola y cambie el directorio de trabajo a`D:\Repo/HelloClaptrap`.A continuación, puede crear un entorno de proyecto ejecutando los siguientes commands：

```bash
dotnet newbe.claptrap --name HelloClaptrap
```

> En general, se recomienda`D:\Repo,helloClaptrap`como una carpeta de almacén Git.Administre el código fuente a través del control de versiones.

## Iniciar el proyecto

A continuación, usamos la línea de comandos para iniciar el proyecto.Cambie la línea de comandos a`C:\Rla`epos/HelloClaptrap-HelloClaptrap, ejecute las siguientes command：

```bash
tye correr
```

Después de empezar, puede ver todos los elementos contenidos en la plantilla de proyecto en el tye dashboard：

![servicio newbe.claptrap](/images/20210217-002.png)

> La dirección del panel tye es típicamente <http://localhost:8000>, y si el puerto está ocupado, se utilizan automáticamente otros puertos y puede ver las indicaciones en la línea de comandos para obtener la dirección específica actual.

Podemos encontrar la dirección operativa del servicio de`en la interfaz mostrada`arriba.Por ejemplo, como se muestra en la figura anterior, su dirección de punto de conexión es<http://localhost:14285>.

Por lo tanto, utilizamos el navegador para abrir la dirección para ver la interfaz swagger.

En la página swagger, intente llamar a`/AuctionItems/{itemId}/status`API：

![newbe.claptrap AuctionItems](/images/20210217-003.png)

La devolución del servicio a 200 indica que los componentes del servicio actual se han iniciado normalmente.

## Experimente el proyecto

Los proyectos creados con plantillas de proyecto son en realidad un programa que simula las pujas de subasta.

Las pujas de subasta son un escenario empresarial típico que puede tener un escenario empresarial en el que es necesario procesar una solicitud.El uso de Newbe.Claptrap puede simplemente resolver el problema.Continuaremos usando este escenario empresarial para la demostración en documentos posteriores, así que aquí hay una descripción simple del escenario empresarial.

### Reglas de negocio

Las reglas de negocio son más o menos tan follows：

1. Cada artículo de subasta es `único`
2. Las subastas solo se pueden subastar durante un período de tiempo
3. El artículo de subasta tiene un precio de subasta inicial
4. Todos los licitadores tienen un usuario único `usuario`
5. Los licitadores pueden pujar por un artículo de subasta indefinidamente durante el período de subasta, y siempre y cuando su oferta sea mayor que la oferta máxima actual, se puede contar como una oferta válida y convertirse en el pujador actual de la subasta
6. Es necesario registrar los detalles de todas las ofertas exitosas, incluido el tiempo de licitación, el importe de la oferta, el pujador.

El estado de los artículos de subasta es el follows：

- `0` planificadas esperando para empezar a disparar
- subasta de de `1 OnSell
- 2` vendidos ha sido baleado
- `3 Streaming de` sin vender

### Diseño de API

Para obtener el efecto de demostración más simple, en este ejemplo se diseña la siguiente API ：

- `GET/AuctionItems/{itemId}/status` el estado actual de la subasta especificada
- `los detalles de GET/AuctionItems/{itemId}` del artículo de subasta especificado
- `post/AuctionItems` pujas por artículos de subasta designados

Usemos un escenario sencillo para experimentar los efectos de estas API.

#### Busque artículos de subasta actualmente en subasta

Dado que el estado de las subastas está influenciado por el tiempo, con el fin de que los desarrolladores encuentren artículos de subasta en varios estados en cualquier momento, los algoritmos basados en el tiempo se utilizan para generar subastas en todos los estados.

Los desarrolladores pueden usar las cuatro llamadas itemId 0/1/2/3`GET/AuctionItems/{itemId}/status`el estado actual de la subasta.

Hay al menos una subasta con `1 OnSell` .Para mayor comodidad, supongamos que su itemId es 1.

#### Ver detalles de la subasta

Con `GET/AuctionItems/{itemId}` puede encontrar los detalles del artículo de subasta.Por ejemplo, si consultamos con itemId para 1, podríamos obtener los siguientes resultados:

```json
{
  "estado": {
    "biddingRecords": null,
    "basePrice": 10,
    "startTime": "2021-02-27T12:59:12.673013+08:00",
    "fin Hora": "2021-02-27T16:59:12.673013+08:00"
  }
}
```

Los resultados anteriores muestran que：

- La subasta comienza en la basePrice 10
- El período de subasta es el período startTime - endTime
- El registro actual de la subasta está vacío

El período de tiempo puede cambiar dependiendo de la hora de inicio del proyecto debido al tiempo necesario para iniciar la plantilla de proyecto.

#### Intente pujar

A continuación, llamamos a`POST/AuctionItems`para intentar pujar por el artículo de subasta actualmente en subasta, y llamar y pasar los parámetros como follows：

```json
{
  "userId": 1,
  "precio": 36524,
  "itemId": 1
}
```

Los parámetros se describen below：

- Bidder userId es 1
- Oferta 36524
- El artículo de subasta Id 1

Esto se pondrá results：

```json
{
  "éxito": true,
  "userId": 1,
  "auctionItemStatus": 1,
  "nowPrice": 36524
}
```

Los resultados de la devolución muestran que：

- La oferta de éxito fue exitosa
- Bidder userId es 1
- La última oferta es 36524
- El estado actual de la subasta `1 OnSell`

Puede `las últimas subastas{itemId}` utilizando GET/AuctionItems/：

```json
{
  "state": {
    "biddingRecords": {
      "36524": {
        "userId": 1,
        "price": 36524,
        "biddingTime": "2021-02-27T07:31:09.8954519+00:00"
      }
    },
    "basePrice": 10,
    "startTime": "2021-02-27T12:59:12.673013+08:00",
    "endTime": "2021-02-27T16:59:12.673013+08:00"
  }
}
```

Los resultados anteriores muestran que：

- Los registros de pujas se han actualizado para incluir los últimos detalles de la subasta.

Esto completa la presentación de puja más simple.

Los desarrolladores pueden experimentar con estados y parámetros más diferentes para experimentar el uso subyacente de las API anteriores.Por ejemplo, una puja es menor que la puja más alta actual, una puja por un artículo que no es de remake, etc.

## Detener el proyecto

Si desea detener un proyecto de plantilla que se está ejecutando actualmente.Puede detener un programa en ejecución presionando`Ctrl``C`en el panel de control donde acaba de ejecutar`ejecutar`.

## Resumen

En este artículo, aprendimos los pasos básicos para instalar y usar plantillas de proyecto.

A continuación, cubriremos los elementos principales contenidos en la plantilla de proyecto.

<!-- md Footer-Newbe-Claptrap.md -->
