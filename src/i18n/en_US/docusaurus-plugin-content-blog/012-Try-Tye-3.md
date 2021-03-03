---
date: 2021-02-15
title: Developing k8s apps with the Tye help is so simple (iii)
tags:
  - Newbe.Claptrap
  - Tye
---

Let's explore Tye's more ways of using it.This article we come to find out how to connect to the database in Tye.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## Middleware Connection

The vast majority of services need to be used to external middleware to support the proper functioning of the application, usually, in terms of containing databases, cache middleware, message queues, and file systems, and so on.

As a result, a link string to these middleware needs to be managed in the application during the development.

Tye provides a way to manage these linked strings more easily.

## Launch of the Mongo with Tye

First of all, we use Tye to start a mongo.

Create a tye.yml manually:

```yml tye.yml
name: mongo-sample
services:
  - name: mongo
    image: mongo
    env:
      - name: ME_CONFIG_MONGODB_ADMINUSERNAME
        value: root
      - name: ME_CONFIG_MONGODB_ADMINPASSWORD
        value: example
  - name: mongo-express
    image: mongo-express
    bindings:
      - port: 8081
        containerPort: 8081
        protocol: http
    env:
      - name: ME_CONFIG_MONGODB_ADMINUSERNAME
        value: root
      - name: ME_CONFIG_MONGODB_ADMINPASSWORD
        value: example
```

Use tye run to start a mongo locally and at <http://localhost:8081> to see data in the mongo via ui：

![mongo express](/images/20210215-001.png)

It is actually using Tye to control the docker desktop to start the mongo.Therefore, you need to install a local docker desktop.

Of course, this doesn't actually make any substantial difference with using the `docker-compose`.

## Create an application to connect to the mongo

Below, we create an app and connect the app with the mongo.

Create a test application and install the necessary package：

```bash create-tye-mongo-test.sh
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln ./TyeTest.sln add ./TyeTest/TyeTest.csproj
dotnet add ./TyeTest/TyeTest.csproj package Microsoft.Tye.Extensions.Configuration --version 0.6.0-alpha.21070.5
dotnet add ./TyeTest/TyeTest.csproj package MongoDB.Driver
```

Enter Startup to register the MongoClient in the container:

```cs Startup.cs
// This method gets called by the runtime. Use this method to add services to the container.
public void ConfigureServices(IServiceCollection services)
{
    services.AddControllers();
    services.AddSwaggerGen(c => { c.SwaggerDoc("v1", new OpenApiInfo {Title = "TyeTest", Version = "v1"}); });
    services.AddScoped(p =>
    {
        var config = p.GetRequiredService<IConfiguration>();
        var connectionString = config.GetConnectionString("mongo");
        Console.WriteLine(connectionString);
        var client = new MongoClient(connectionString);
        return client;
    });
}
```

It is worth thing here that an extended method is used here to read the connection string of the mongo from `IConfiguration`:

1. `mono` is actually the service name defined in tye
2. `GetConnectionString` is an extension method from `Microsoft.Tye.Extensions.Configuration`
3. `The MongoClient` should be a global single case or a `Scope` Actually the writer hasn't checked the information either.The actual project developer's attention is adjusted to the requirements.

Open the `WeatherForecastController`and let us write some data to `mongo` each time you accept the request to verify the effect.

```cs WeatherForecastController.cs
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using MongoDB.Driver;

namespace TyeTest.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class WeatherForecastController : ControllerBase
    {
        private static readonly string[] Summaries = new[]
        {
            "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
        };

        private readonly ILogger<WeatherForecastController> _logger;
        private readonly MongoClient _mongoClient;

        public WeatherForecastController(ILogger<WeatherForecastController> logger,
            MongoClient mongoClient)
        {
            _logger = logger;
            _mongoClient = mongoClient;
        }

        [HttpGet]
        public IEnumerable<WeatherForecast> Get()
        {
            var rng = new Random();
            var result = Enumerable.Range(1, 5).Select(index => new WeatherForecast
                {
                    Date = DateTime.Now.AddDays(index),
                    TemperatureC = rng.Next(-20, 55),
                    Summary = Summaries[rng.Next(Summaries.Length)]
                })
                .ToArray();

            var mongoCollection = _mongoClient.GetDatabase(nameof(WeatherForecast))
                .GetCollection<WeatherForecast>(nameof(WeatherForecast));
            mongoCollection.InsertMany(result);
            return result;
        }
    }
}
```

At this point, the test application was created.The expected effect is that when a request is accepted, some data is written to the `WeatherForecast` `collection` in the `mongo`.It can be viewed through the mongo express UI.

## Modify the ty.yml to configure the connection string

Thanks to the front, we have manually created the`tye.yml`.Therefore, we now make modifications directly on the original basis in order to join the test application.

First, place previously created`tye.yml`at the root of`TyeTest.sln`.

Then change it to the following form:

```yml tye.yml
name: mongo-sample
services:
  - name: mongo
    image: mongo
    env:
      - name: ME_CONFIG_MONGODB_ADMINUSERNAME
        value: root
      - name: ME_CONFIG_MONGODB_ADMINPASSWORD
        value: example
    bindings:
      - containerPort: 27017
        connectionString: 'mongodb://${host}:${port}'
  - name: mongo-express
    image: mongo-express
    bindings:
      - port: 8081
        containerPort: 8081
        protocol: http
    env:
      - name: ME_CONFIG_MONGODB_ADMINUSERNAME
        value: root
      - name: ME_CONFIG_MONGODB_ADMINPASSWORD
        value: example
  - name: tyetest
    project: TyeTest/TyeTest.csproj
```

Comparing with previse version, there are two changes made:

1. Added`tyetest`service configuration to enable test app
2. `bindings` were added to the`mongo`service.This is a way to manage connection for the services in`tye`.The`connectionString`is the connection string used for other service to connect `mongo`.

After modification.Start the app with`tye run`.

Open the`swagger`page, and access the API, then you can see in the mongo express that the data has been successfully completed writing：

![mongo express 2](/images/20210215-002.png)

After viewing the effect you can use`Ctrl`+`C`to stop`tye`to remove the relevant containers.

## Finally, send it to the K8S to try it out

This is an example that can not use`tye deploy`directly.

First, usually, the middleware is not likely to exist in a production environment by way of deployment in a container.Even with a container deployment, it's not going to want to be redeployed every time.That said, it is usually possible to connect the already existing middleware directly.

Second, the intermediate connection string is usually in the form of`secret`in`k8s`.Therefore, it is unlikely to be specified in the tye script.

As a result,`tye`will simply help developers check if the required`secret` already exists in the target cluster that needs to be deployed.When and only if, the required`secret`exists in the target cluster to deploy.

In this example, you need to have`secret`corresponding to`binding-product-mongo-secret`in the target cluster to be deployed using`tye`.

具体的名称约定规则，可以参照如下内容：

<https://github.com/dotnet/tye/blob/master/docs/reference/deployment.md#validate-secrets>

## 小结

本篇，我们已经顺利完成了使用 Tye 来完成应用与中间件之间的链接配置。

不过还遗留一些问题没有细说：

- 如果一个中间存在多个绑定该如何处理
- https 绑定该如何处理

详细这些内容，请移步官方文档进行查看：

<https://github.com/dotnet/tye/blob/master/docs/reference/service_discovery.md>

下一篇，我们将进一步在 Tye 中实现对纷繁复杂的日志进行统一管理。

<!-- md Footer-Newbe-Claptrap.md -->
