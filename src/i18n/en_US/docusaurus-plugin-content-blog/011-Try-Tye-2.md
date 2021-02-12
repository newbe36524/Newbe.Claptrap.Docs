---
date: 2021-02-06
title: Using Tye to help develop k8s applications is as simple as that (II)
---

In the last article, let's explore Tye's more ways of using it.Let's take a look at how to use service discovery in Tye.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## Service Discovery - An indispensable part of microserver development

> Service discovery is that the newly registered service module can be discovered by other callers in a timely manner.Automatic discovery is achieved regardless of service additions and service cuts. Learn more about service registration and discovery <https://zhuanlan.zhihu.com/p/161277955>

> In the process of calling a microserver, assuming that in calling a REST API or a Thrift API, in order to complete a call request, the code needs to specify the IP address and port where the service is located, in traditional applications, the network address and port are static and generally do not change, we just need to match them to the configuration file, we can complete the call by reading the configuration file. However, in modern Cloud-based microserver architectures, this approach will fail, because instances of services are dynamically assigned addresses, and network addresses are dynamic, which has the advantage of facilitating automatic scaling, fail-processing and upgrade of services. "Service Discovery Mechanism in Microserver Architecture" <https://www.imooc.com/article/details/id/291255>

Simply put, service discovery allows you to use names between services instead of specific addresses and ports or even access details.This makes it easier for services to be used in environments where application instances such as cloud natives are variable.

## First, we need two services

As in the previous article, we use the command line to create two services.

```bash
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln .\TyeTest.sln add .\TyeTest\TyeTest.csproj
dotnet new webapi -n TyeTest2
dotnet sln .\TyeTest.sln add .\TyeTest2\TyeTest2.csproj
```

Then use tye init to create tye.yml

You can find the following in tye.yml：

```yml
name: tyetest
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
  - name: tyetest2
    project: TyeTest2/TyeTest2.csproj
```

This allows us to start`services locally using`tye run.

Next, we'll retrofit the TyeTest service so that it calls TyeTest2 as its downstream service.

This allows us to verify the effectiveness of service discovery.

## Then, use Tye.Configuration

### Add a package

Run the following command to add a package to the TyeTest project：

```bash
dotnet add ./TyeTest/TyeTest.csproj package Microsoft.Tye.Extensions.Configuration --version 0.6.0-alpha.21070.5
```

### Add http://www.http://www.http://www.twitter.com/http://www.http://www.http

Because we need to call downstream services using HttpClient, we need to use httpClientFactory.As a result, the TyeTest project Startup.cs to increase registration for http://www.twitter.com/TyTest.

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

### Use HttpClient to invoke the service

Enter WeatherForecastController, where we use HttpClient to invoke downstream services and return the resulting data to：

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

It's worth noting that：

1. The IConfiguration`injected into`is an intrinsic mechanism of Aspnet Core and does not require special registration.
2. `_configuration. GetServiceUri ("tyetest2")`key point in this example.It obtains the service's specific Uri address by a service name, which masks the details of the service address at deployment time.

That's it, it's over.

The next step is`tye run`you can view the modified services locally.The interface of the first service is called and the expected data returned from the second service can be obtained.

> The true workings of service discovery in Tye can be found in the official library for： <https://github.com/dotnet/tye/blob/master/docs/reference/service_discovery.md#how-it-works-uris-in-development>

## Finally, send it to K8S for an interview

To publish to k8s for testing, just follow the previous content and set up to docker registry and ingress to verify.

Developers can configure and try it themselves.

## Summary

In this article, we've successfully completed using Tye to complete the use of the service discovery mechanism.In this way, we can use service names to call each other between services, masking specific deployment details and simplifying development.

However, in real-world production, there is more than just host and port information between services.Sometimes you also need to set user names, passwords, and additional parameters.Typical is the management of database connection strings.

In the next article, we'll take a step further on how to link the database in Tye.

<!-- md Footer-Newbe-Claptrap.md -->
