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

对比之前，一共有两处修改：

1. 增加了`tyetest`服务配置的节点，以便能够启动测试应用
2. 在`mongo`服务上增加了`bindings`。这是`tye`中组织服务之间相互连接的一种方式。其中的`connectionString`便是其他服务连接`mongo`所使用的链接串。

修改完毕之后。使用`tye run`启动应用。

打开`swagger`页面，并访问 API，便可以在 mongo express 中查看到数据已经成功完成了写入：

![mongo express 2](/images/20210215-002.png)

查看效果之后可以使用`Ctrl`+`C`停止`tye`以移除相关容器。

## 最后，发到 K8S 里面试一下

这次的样例，并不是直接使用`tye deploy`就可以完成了。

首先，通常来说，中间件在生产环境中不太可能是通过部署在容器中的方式而存在的。即便是使用容器部署，也不会每次 deploy 都希望重新部署。也就是说，通常是直接连接已有的中间件就可以了。

其次，中间件连接字符串通常来说是以`secret`的形式存于`k8s`中。故而不太可能在 tye 脚本中进行指定。

故而，`tye`仅仅会帮助开发者检查需要部署的目标集群中是否已经存在符合要求的`secret`。当且仅当，目标集群中存在符合要求的`secret`才能部署。

以本示例为例，需要在目标集群中存在`binding-production-mongo-secret`对应的`secret`才能都实现使用`tye`进行部署。

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
