---
date: 2021-02-15
title: 使用 Tye 辅助开发 k8s 应用竟如此简单（三）
tags:
  - Newbe.Claptrap
  - Tye
---

续上篇，这篇我们来进一步探索 Tye 更多的使用方法。本篇我们来了解一下如何在 Tye 中如何对数据库进行链接。

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## 中间件链接

绝大多数服务都需要用到外部中间件来支持应用程序的正常运行，通常来说，就包含有数据库、缓存中间件、消息队列和文件系统等等。

因此，在开发过程中需要在应用程序中管理对这些中间件的链接字符串。

Tye 提供了一种方式以便更加容易的管理这些链接字符串。

## 使用 Tye 启动 mongo

首先，我们使用 Tye 来启动一个 mongo。

手动创建一个 tye.yml:

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

使用 tye run 便可以在本地启动一个 mongo 并且在 <http://localhost:8081> 通过 ui 查看 mongo 中的数据情况：

![mongo express](/images/20210215-001.png)

实际上就是使用 Tye 控制 docker desktop 启动 mongo。因此需要提前在本地安装好 docker desktop，以便启动。

当然，这实际上和使用 `docker-compose` 没有什么实质性的区别。

## 创建应用程序连接 mongo

下面，我们创建一个应用，并且将应用与 mongo 进行连接。

创建测试应用，并安装必要的包：

```bash create-tye-mongo-test.sh
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln ./TyeTest.sln add ./TyeTest/TyeTest.csproj
dotnet add ./TyeTest/TyeTest.csproj package Microsoft.Tye.Extensions.Configuration --version 0.6.0-alpha.21070.5
dotnet add ./TyeTest/TyeTest.csproj package MongoDB.Driver
```

进入 Startup，向容器中注册 MongoClient :

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

值得注意的是，这里使用了一个扩展方法从 `IConfiguration` 中读取 mongo 的连接字符串：

1. `mongo` 实际上就是定义在 tye 中的服务名称。
2. `GetConnectionString` 是来自于 `Microsoft.Tye.Extensions.Configuration` 的扩展方法
3. `MongoClient` 应该全局单例还是 `Scope` 其实笔者也没查过资料。实际项目开发者注意按照需求调整。

打开 `WeatherForecastController`，让我们在每次接受请求时，都写入一些数据到 `mongo` 中以验证效果。

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

至此，测试应用就创建完毕了。预期的效果是，当接受到请求时，就会向 `mongo` 中的 `WeatherForecast` `collection` 写入一些数据。可以通过 mongo express UI 进行查看。

## 修改 tye.yml 以配置链接串

由于前面，我们是手动创建过了`tye.yml`。因此，我们现在直接在原来的基础上进行修改，以便加入测试应用。

首先，将之前创建好的`tye.yml`放置到`TyeTest.sln`的根目录。

然后修改为如下形式:

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
