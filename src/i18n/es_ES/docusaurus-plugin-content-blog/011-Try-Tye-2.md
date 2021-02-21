---
date: 2021-02-06
title: Usar Tye para ayudar a desarrollar aplicaciones k8s es tan simple como eso (II)
tags:
  - Newbe.Claptrap
  - Tye
---

En el último artículo, vamos a explorar las más formas de usarlo de Tye.Echemos un vistazo a cómo usar el descubrimiento de servicios en Tye.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## Detección de servicios - Una parte indispensable del desarrollo de microservidor

> La detección de servicios es que otros llamadores pueden detectar el módulo de servicio recién registrado de forma oportuna.La detección automática se logra independientemente de las adiciones de servicio y los cortes de servicio. Obtenga más información sobre el registro de servicios y discovery <https://zhuanlan.zhihu.com/p/161277955>

> En el proceso de llamar a un microservidor, suponiendo que al llamar a una API REST o a una API de Thrift, para completar una solicitud de llamada, el código debe especificar la dirección IP y el puerto donde se encuentra el servicio, en las aplicaciones tradicionales, la dirección de red y el puerto son estáticos y generalmente no cambian, solo necesitamos hacer coincidir con el archivo de configuración, podemos completar la llamada leyendo el archivo de configuración. Sin embargo, en las arquitecturas modernas de microservidor basadas en la nube, este enfoque fallará, porque las instancias de servicios se asignan dinámicamente las direcciones y las direcciones de red son dinámicas, lo que tiene la ventaja de facilitar el escalado automático, el procesamiento de errores y la actualización de los servicios. "Mecanismo de detección de servicios en la arquitectura de microservidor" <https://www.imooc.com/article/details/id/291255>

En pocas palabras, la detección de servicios le permite usar nombres entre servicios en lugar de direcciones y puertos específicos o incluso acceder a detalles.Esto facilita el uso de servicios en entornos donde las instancias de aplicación, como los nativos de nube, son variables.

## Primero, necesitamos dos servicios

Como en el artículo anterior, usamos la línea de comandos para crear dos servicios.

```bash
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln .\TyeTest.sln agregue .\TyeTest\TyeTest.csproj
dotnet new webapi -n TyeTest2
dotnet sln .\TyeTest.sln agregue .\TyeTest2\TyeTest2.csproj
```

然后使用 tye init 创建 tye.yml 。

Puede encontrar lo siguiente en tye.yml：

```yml
nombre: tyetest
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
  - name: tyetest2
    project: TyeTest2/TyeTest2.csproj
```

Esto nos permite iniciar`servicios localmente utilizando`tye run.

A continuación, modernizaremos el servicio TyeTest para que llame a TyeTest2 como su servicio de nivel inferior.

Esto nos permite verificar la eficacia de la detección de servicios.

## A continuación, utilice Tye.Configuration

### Añadir un paquete

Ejecute el siguiente comando para agregar un paquete al project：

```bash
dotnet agregar ./TyeTest/TyeTest.csproj paquete Microsoft.Tye.Extensions.Configuration --version 0.6.0-alpha.21070.5
```

### Añadir http://www.http://www.http://www.twitter.com/http://www.http://www.http

Dado que necesitamos llamar a servicios de nivel inferior mediante HttpClient, necesitamos usar httpClientFactory.Como resultado, el proyecto TyeTest Startup.cs aumentar el registro de http://www.twitter.com/TyTest.

```csharp
  public void ConfigureServices(IServiceCollection services)
  á
+ servicios. AddHttpClient();
      servicios. AddControllers();
      servicios. AddSwaggerGen(c á>
      ?
          c.SwaggerDoc("v1", new OpenApiInfo ? Title ? "TyeTest", Version ? "v1" ? ;
      );
  ?
```

### Use HttpClient para invocar el servicio

Escriba WeatherForecastController, donde usamos HttpClient para invocar servicios de nivel inferior y devolver los datos resultantes a：

```cs
utilizando el sistema;
mediante System.Collections.Generic;
mediante System.Linq;
mediante System.Net.Http;
mediante System.Text.Json;
mediante System.Threading.Tasks;
mediante Microsoft.AspNetCore.Mvc;
mediante Microsoft.Extensions.Configuration;
mediante Microsoft.Extensions.Logging;

espacio de nombres TyeTest.Controllers
á
    [ApiController]
    [Route("[controller]")]
    clase pública WeatherForecastController : ControllerBase
    ?
<WeatherForecastController> _logger ILogger privado readonly;
        _configuration de configuración de solo lectura privada;
        _httpClient HttpClient de solo lectura privada;

        registrador público WeatherForecastController(ILogger<WeatherForecastController> , configuración de configuración de
            IConfiguration,
            HttpClient httpClient)

            _logger de la configuración de IConfiguration;
            _configuration de configuración;
            _httpClient: httpClient;
        :

        [HttpGet]
<string> de tareas asíncrona públicas Get()
        ?
            var serviceUri - _configuration. GetServiceUri("tyetest2");
            Console.WriteLine(serviceUri);
            var httpResponseMessage á await _httpClient.GetAsync($"{serviceUri}WeatherForecast");
            var json á await httpResponseMessage.Content.ReadAsStringAsync();
            devuelve json;


?
```

Vale la pena señalar que：

1. El IConfiguration`inyecta en`es un mecanismo intrínseco de Aspnet Core y no requiere un registro especial.
2. `_configuration. GetServiceUri ("tyetest2")`punto clave de este ejemplo.Obtiene la dirección Uri específica del servicio por un nombre de servicio, que enmascara los detalles de la dirección de servicio en el momento de la implementación.

Eso es, se acabó.

El siguiente paso es`ejecución tye`puede ver los servicios modificados localmente.Se llama a la interfaz del primer servicio y se pueden obtener los datos esperados devueltos desde el segundo servicio.

> El verdadero funcionamiento del descubrimiento de servicios en Tye se puede encontrar en la biblioteca oficial para： <https://github.com/dotnet/tye/blob/master/docs/reference/service_discovery.md#how-it-works-uris-in-development>

## Finalmente, envíalo a K8S para una entrevista

Para publicar en k8s para pruebas, simplemente siga el contenido anterior y configure el registro y la entrada de docker para verificarlos.

Los desarrolladores pueden configurarlo y probarlo ellos mismos.

## Resumen

En este artículo, hemos completado correctamente el uso de Tye para completar el uso del mecanismo de detección de servicios.De este modo, podemos usar nombres de servicio para llamar entre sí entre servicios, enmascarar detalles de implementación específicos y simplificar el desarrollo.

Sin embargo, en la producción del mundo real, hay algo más que información de host y puerto entre los servicios.A veces también es necesario establecer nombres de usuario, contraseñas y parámetros adicionales.Típico es la administración de cadenas de conexión de base de datos.

En el siguiente artículo, daremos un paso más sobre cómo vincular la base de datos en Tye.

<!-- md Footer-Newbe-Claptrap.md -->
