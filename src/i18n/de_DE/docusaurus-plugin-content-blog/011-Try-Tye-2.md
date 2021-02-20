---
date: 2021-02-06
title: Die Verwendung von Tye zur Entwicklung von k8s-Anwendungen ist so einfach wie das (II)
tags:
  - Newbe.Claptrap
  - Tye
---

Im letzten Artikel, lassen Sie uns Tyes weitere Möglichkeiten zu erkunden, es zu verwenden.Werfen wir einen Blick auf die Verwendung der Dienstermittlung in Tye.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## Service Discovery - Ein unverzichtbarer Bestandteil der Microserver-Entwicklung

> Die Dienstermittlung besteht darin, dass das neu registrierte Dienstmodul von anderen Aufrufern zeitnah erkannt werden kann.Die automatische Erkennung wird unabhängig von Service-Ergänzungen und Servicekürzungen erreicht. Erfahren Sie mehr über Serviceregistrierung und discovery <https://zhuanlan.zhihu.com/p/161277955>

> Beim Aufrufen eines Microservers, vorausgesetzt, dass beim Aufrufen einer REST-API oder einer Thrift-API, um eine Aufrufanforderung abzuschließen, muss der Code die IP-Adresse und den Port angeben, an dem sich der Dienst befindet, in herkömmlichen Anwendungen sind die Netzwerkadresse und der Port statisch und ändern sich im Allgemeinen nicht, wir müssen sie nur mit der Konfigurationsdatei abgleichen, wir können den Aufruf abschließen, indem wir die Konfigurationsdatei lesen. In modernen Cloud-basierten Microserver-Architekturen schlägt dieser Ansatz jedoch fehl, da Instanzen von Diensten dynamisch zugewiesene Adressen sind und Netzwerkadressen dynamisch sind, was den Vorteil hat, die automatische Skalierung, Fail-Verarbeitung und Aktualisierung von Diensten zu erleichtern. "Service Discovery Mechanism in Microserver Architecture" <https://www.imooc.com/article/details/id/291255>

Einfach ausgedrückt: Mit der Dienstermittlung können Sie Namen zwischen Diensten anstelle bestimmter Adressen und Ports oder sogar Zugriffsdetails verwenden.Dies erleichtert die Verwendung von Diensten in Umgebungen, in denen Anwendungsinstanzen wie Cloud-Natives variabel sind.

## Erstens brauchen wir zwei Dienste

Wie im vorherigen Artikel verwenden wir die Befehlszeile, um zwei Dienste zu erstellen.

```bash
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln .\TyeTest.sln hinzufügen .\TyeTest\TyeTest.csproj
dotnet new webapi -n TyeTest2
dotnet sln .\TyeTest.sln hinzufügen .\TyeTest2\TyeTest2.csproj
```

然后使用 tye init 创建 tye.yml 。

Folgendes finden Sie in tye.yml：

```yml
Name: tyetest
Services:
  - Name: tyetest
    Projekt: TyeTest/TyeTest.csproj
  - Name: tyetest2
    Projekt: TyeTest2/TyeTest2.csproj
```

Auf diese Weise können wir`Dienste lokal mit`-Tye-Run starten.

Als Nächstes werden wir den TyeTest-Dienst so umrüsten, dass er TyeTest2 als Downstream-Dienst aufruft.

Auf diese Weise können wir die Wirksamkeit der Dienstermittlung überprüfen.

## Verwenden Sie dann Tye.Configuration

### Hinzufügen eines Pakets

Führen Sie den folgenden Befehl aus, um ein Paket zum TyeTest-project：

```bash
dotnet hinzufügen ./TyeTest/TyeTest.csproj Paket Microsoft.Tye.Extensions.Configuration --version 0.6.0-alpha.21070.5
```

### Hinzufügen von http://www.http://www.http://www.twitter.com/http://www.http://www.http

Da wir downstream Dienste mit HttpClient aufrufen müssen, müssen wir httpClientFactory verwenden.Das TyeTest-Projekt Startup.cs daher die Registrierung für http://www.twitter.com/TyTest zu erhöhen.

```csharp
  public void ConfigureServices(IServiceCollection-Dienste)

+ Dienste. AddHttpClient();
      Dienstleistungen. AddControllers();
      Dienstleistungen. AddSwaggerGen(c =>
      -
          c.SwaggerDoc("v1", neue OpenApiInfo - Title = "TyeTest", Version = "v1"
      )

```

### Verwenden von HttpClient zum Aufrufen des Dienstes

Geben Sie WeatherForecastController ein, wo wir HttpClient verwenden, um Downstream-Dienste aufzurufen und die resultierenden Daten an：

```cs
Verwendung von System;
mit System.Collections.Generic;
mit System.Linq;
mit System.Net.Http;
mit System.Text.Json;
mit System.Threading.Tasks;
microsoft.AspNetCore.Mvc verwenden;
microsoft.Extensions.Configuration verwenden;
mit Microsoft.Extensions.Logging;

Namespace TyeTest.Controllers

    [ApiController]
    [Route("[controller]")]
    öffentlichen Klasse WeatherForecastController : ControllerBase

        private sischbare ILogger<WeatherForecastController> _logger;
        private schreibgeschützte IConfiguration _configuration;
        private schreibgeschützte httpClient _httpClient;

        öffentlichen WeatherForecastController(ILogger<WeatherForecastController> Logger,
            IConfiguration-Konfiguration,
            httpClient httpClient)

            _logger = Logger;
            _configuration = Konfiguration;
            _httpClient = httpClient;


        [HttpGet]
        öffentliche async Task<string> Get()
        -
            var serviceUri = _configuration. GetServiceUri("tyetest2");
            Console.WriteLine(serviceUri);
            var httpResponseMessage = warten _httpClient.GetAsync("{serviceUri}WeatherForecast");
            var json = await httpResponseMessage.Content.ReadAsStringAsync();
            json zurückgeben;



```

Es ist erwähnenswert, dass：

1. Die IConfiguration-`in`injiziert wird, ist ein intrinsischer Mechanismus von Aspnet Core und erfordert keine spezielle Registrierung.
2. `_configuration. GetServiceUri ("tyetest2")`Schlüsselpunkt in diesem Beispiel.Die spezifische Uri-Adresse des Dienstes wird über einen Dienstnamen ab, der die Details der Dienstadresse zur Bereitstellungszeit maskiert.

Das war's, es ist vorbei.

Der nächste Schritt ist`,`Sie die geänderten Dienste lokal anzeigen können.Die Schnittstelle des ersten Dienstes wird aufgerufen, und die erwarteten Daten, die vom zweiten Dienst zurückgegeben werden, können abgerufen werden.

> Die wahre Funktionsweise der Service-Entdeckung in Tye finden Sie in der offiziellen Bibliothek für： <https://github.com/dotnet/tye/blob/master/docs/reference/service_discovery.md#how-it-works-uris-in-development>

## Schicken Sie es schließlich an K8S für ein Interview

Um zum Testen in k8s zu veröffentlichen, folgen Sie einfach dem vorherigen Inhalt und richten Sie die Docker-Registrierung und den Eintritt ein, um dies zu überprüfen.

Entwickler können es selbst konfigurieren und ausprobieren.

## Zusammenfassung

In diesem Artikel haben wir die Verwendung von Tye erfolgreich abgeschlossen, um die Verwendung des Dienstermittlungsmechanismus abzuschließen.Auf diese Weise können wir Dienstnamen verwenden, um sich gegenseitig zwischen Diensten aufzurufen, bestimmte Bereitstellungsdetails zu maskieren und die Entwicklung zu vereinfachen.

In der realen Produktion gibt es jedoch mehr als nur Host- und Portinformationen zwischen den Diensten.Manchmal müssen Sie auch Benutzernamen, Kennwörter und zusätzliche Parameter festlegen.Typisch ist die Verwaltung von Datenbankverbindungszeichenfolgen.

Im nächsten Artikel gehen wir noch einen Schritt weiter, wie die Datenbank in Tye verknüpft wird.

<!-- md Footer-Newbe-Claptrap.md -->
