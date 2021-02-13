---
date: 2021-02-06
title: Разработка приложений k8s с помощью Tye так проста (II)
---

Давайте прочтем эту статью дальше, чтобы изучить больше использования Tye.В этой статье мы поймем, как использовать обнаружение служб в Tye.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## Обнаружение служб - незаменимые компоненты для разработки микросхем

> Обнаружение службы заключается в том, что вновь зарегистрированный сервисный модуль может быть своевременно обнаружен другими вызывающими объектами.Автоматическое обнаружение может быть достигнуто независимо от того, являются ли они новыми сервисными и сервисными сокращениями. Подробнее о регистрации и открытии услуг <https://zhuanlan.zhihu.com/p/161277955>

> В процессе вызова микросвязя предположим, что при вызове ОПРЕДЕЛЕННОГО REST API или API Thrift, для выполнения запроса вызова, код должен указать IP-адрес и порт, в котором находится служба, в традиционном приложении сетевой адрес и порт являются статическими и обычно не изменяются, мы просто должны поставить их в профиль, мы можем завершить вызов, прочитав профиль. Однако в современной архитектуре микросхем на основе Cloud этот подход становится недействительным, поскольку экземпляры служб динамически назначают адреса, а сетевые адреса являются динамическими, что облегчает автоматическое масштабирование, обработку сбоев и обновление служб. механизм обнаружения служб в архитектуре микросубы <https://www.imooc.com/article/details/id/291255>

Проще говоря, обнаружение службы может использовать имя между службами вместо конкретного адреса и порта или даже для доступа к деталям.Это упрощает работу служб в средах с изменчивыми экземплярами приложений, такими как облачные.

## Во-первых, нам нужны две услуги

Как и в предыдущих статьях, мы используем командную строку для создания двух служб.

```bash
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln .\TyeTest.sln add .\TyeTest\TyeTest.csproj
dotnet new webapi -n TyeTest2
dotnet sln .\TyeTest.sln add .\TyeTest2\TyeTest2.csproj
```

然后使用 tye init 创建 tye.yml 。

Вы можете получить следующее в tye.yml：

```yml
name: tyetest
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
  - name: tyetest2
    project: TyeTest2/TyeTest2.csproj
```

Таким образом, мы можем`две службы локально`с помощью tye run.

Далее мы преобразуем одну из служб TyeTest, чтобы она вызывали TyeTest2 в качестве нисходящей службы.

Таким образом, мы можем проверить, нас где служба находит результаты.

## Затем используйте Tye.Configuration

### Добавьте пакет

Выполните следующую команду, чтобы добавить пакет для проекта TyeTest：

```bash
dotnet add ./TyeTest/TyeTest.csproj package Microsoft.Tye.Extensions.Configuration --version 0.6.0-alpha.21070.5
```

### Добавьте HttpClientFactory

Поскольку нам нужно вызвать нисходящую службу с помощью HttpClient, нам нужно использовать HttpClientFactory.Таким образом, в начале проекта TyeTest Startup.cs регистрацию httpClientFactory.

```csharp
  public void ConfigureServices(IServiceCollection services)
  {
+ services. AddHttpClient();
      services. AddControllers();
      services. AddSwaggerGen(c =>
      {
          c.SwaggerDoc("v1", new OpenApiInfo { Title = "TyeTest", Version = "v1" });
      });
  }
```

### Вызовите службу с помощью HttpClient

Войди в WeatherForecastController, мы используем HttpClient для вызова нисходящей службы и возвращаем полученные данные：

```cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace TyeTest.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private readonly ILogger<WeatherForecastController> _logger;
        private readonly IConfiguration _configuration;
        private readonly HttpClient _httpClient;

        public WeatherForecastController(ILogger<WeatherForecastController> logger,
            IConfiguration configuration,
            HttpClient httpClient)
        {
            _logger = logger;
            _configuration = configuration;
            _httpClient = httpClient;
        }

        [HttpGet]
        public async Task<string> Get()
        {
            var serviceUri = _configuration. GetServiceUri("tyetest2");
            Console.WriteLine(serviceUri);
            var httpResponseMessage = await _httpClient.GetAsync($"{serviceUri}WeatherForecast");
            var json = await httpResponseMessage.Content.ReadAsStringAsync();
            return json;
        }
    }
}
```

Примечательно：

1. IConfiguration`, вводимый в`, является неотъемлимым механизмом Aspnet Core и не требует специальной регистрации.
2. `_configuration. GetServiceUri ("tyetest2")`ключевым моментом в этом примере.Он использует имя службы для получения конкретного адреса Uri службы, что позволяет маскировать сведения об адресе службы при развертывании.

Так что все кончено.

Затем просто используйте`tye run`чтобы увидеть, какие службы были преобразованы локально.Вызывает интерфейс первой службы и может получить ожидаемые данные, возвращаемые из второй службы.

> Чтобы узнать больше о реальных механизмах работы обнаружения служб в Tye, вы можете посетить официальную библиотеку： <https://github.com/dotnet/tye/blob/master/docs/reference/service_discovery.md#how-it-works-uris-in-development>

## Наконец, отправить его на собеседование в K8S

Чтобы опубликовать его в k8s для тестирования, просто следуйте инструкциям, которые были установлены на docker registry и ingress.

Разработчики могут настроить и попробовать сами.

## Сделать небольшой узел

В этой статье мы успешно завершили использование Tye для завершения использования механизма обнаружения служб.Таким образом, мы можем использовать имя службы для взаимных вызовов между службами, чтобы заблокировать конкретные детали развертывания и упростить разработку.

Однако на практике на практике между службами существует не только информация о узле и порту.Иногда требуется задать имя пользователя, пароль и дополнительные параметры.Типичным является управление строками подключения к базе данных.

Далее мы свяжемся с базой данных в Tye.

<!-- md Footer-Newbe-Claptrap.md -->
