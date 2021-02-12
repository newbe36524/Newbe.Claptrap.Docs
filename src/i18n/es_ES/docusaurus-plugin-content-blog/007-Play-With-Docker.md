---
date: 2020-08-16
title: Joven viudo yo, ¿está dejando caer este servidor de red pública 4G gratuito de 8 núcleos, o esta plataforma experimental Docker lista para usar?
---

Los niños toman decisiones, todos los adultos quieren.Así que echemos un vistazo a cómo obtener un servidor de plataforma experimental 8-core 4G gratuito.

<!-- more -->

## Juega con Docker

Abra el<https://labs.play-with-docker.com/>para acceder a la plataforma Play With Docker. Regístrese para obtener una cuenta de DockerHub y podrá acceder a este sitio y obtener fácilmente un servidor de red pública 4G de 8 núcleos. Echemos un vistazo a cómo usar este servidor para algunas operaciones de Docker.

## Implementar Nginx

En este ejemplo, implementamos un nginx y exponemos el servicio a una dirección de red pública.

### Inicie sesión y cree una instancia

Este paso es muy simple, con poca explicación, y una vez completada la creación exitosa, puede ver la interfaz que se muestra a continuación.

![La interfaz](/images/20200816-001.png)

### Tire del espejo

Al ejecutar el siguiente comando, puede extraer la última imagen de nginx.

```bash
docker pull nginx
```

Pull es muy rápido porque este nodo de instancia se implementa en el extranjero, por lo que puede descargarlo muy rápidamente sin configurar un reflejo.

### Inicie el contenedor nginx

Al ejecutar el siguiente comando, puede iniciar un contenedor nginx

```bash
docker run --name nginx-test -p 8080:80 -d nginx
```

### Acceso público

Una vez completada la implementación, un nuevo botón aparece automáticamente en la interfaz para indicar que la dirección de red pública ahora se puede desplegar correctamente, tal y como se muestra en de la：

![El botón de acceso público](/images/20200816-002.png)

Con el clic de un botón, puede acceder al servicio nginx en su navegador que acaba de implementar correctamente.

Si genera un botón, también puede hacer clic en "OPEN PORT" para seleccionar un puerto abierto.

## Implementar un sistema de emisión de billetes de tren

Sólo la implementación de un simple nginx obviamente no es lo suficientemente divertido.Así que voy a implementar un sistema un poco más complejo.

Se trata de un sistema de demostración que consta de siete contenedores, con referencia a las instrucciones de[Train TicketIng System - Deployment](https://claptrap.newbe.pro/zh_Hans/3-Sample/1-Newbe-Claptrap-Ticketing/3-Deployment), y ejecutando el siguiente comando para iniciar una emisión simulada de billetes de tren system：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-compose build
cd Docker/LocalClusterMongodb
docker-compose up -d
```

Una vez que el script se está ejecutando, abra el puerto 10080 a través de OPEN PORT para ver el sistema de simulación de billetes de simulación de billetes de tren que acaba de ser desplegado. ![Interfaz del sistema de ticketing simulado](/images/20200816-003.png)

<!-- md Footer-Newbe-Claptrap.md -->
