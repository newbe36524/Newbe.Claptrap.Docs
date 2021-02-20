---
date: 2021-02-16
title: 使用 Tye 辅助开发 k8s 应用竟如此简单（五）
tags:
  - Newbe.Claptrap
  - Tye
---

续上篇，这篇我们来进一步探索 Tye 更多的使用方法。本篇我们来了解一下如何在 Tye 中实现对分布式链路追踪。

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## 我是谁？我在哪儿？我咋了？

分布式系统纷繁复杂，特别以现在微服务架构的出现，使得应用系统中的应用实例变得更加多变难以捉摸。

那么如何在如此繁杂的系统中找到一条业务调用链的上下游关系、性能细节、业务数据等等成为了一项开发者必然要面对的挑战。

使用分布式链路追踪系统无非是解决该问题的一个良好方法。目前市面上也有非常多可用的开源方案，其中不乏开箱即用的优秀用例：[SkyWalking](http://skywalking.apache.org/)、[Jaeger](https://www.jaegertracing.io/)和[Zipkin](https://zipkin.io/)等等。

本篇，我们将探索 Tye 中已经实现扩展的 Zipkin 来演示一下分布式链路追踪的简易效果。

## 创建测试应用

要测试分布式情况，那么至少需要两个应用实例才能够体现效果。因此，此处创建两个测试服务实例：

```bash create-tye-zipkin-test.sh
dotnet new sln -n TyeTest

dotnet new webapi -n TyeTest
dotnet add ./TyeTest/TyeTest.csproj package Microsoft.Tye.Extensions.Configuration --version 0.6.0-alpha.21070.5
dotnet sln ./TyeTest.sln add ./TyeTest/TyeTest.csproj

dotnet new webapi -n TyeTest2
dotnet sln ./TyeTest.sln add ./TyeTest2/TyeTest2.csproj
tye init
```

在 TyeTest 项目的 Startup.cs 增加对 HttpClientFactory 的注册。

```cs
  public void ConfigureServices(IServiceCollection services)
  {
+     services.AddHttpClient();
      services.AddControllers();
      services.AddSwaggerGen(c =>
      {
          c.SwaggerDoc("v1", new OpenApiInfo { Title = "TyeTest", Version = "v1" });
      });
  }
```

进入 WeatherForecastController， 我们使用 HttpClient 来调用下游服务，并且将得到的数据返回：

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
            var serviceUri = _configuration.GetServiceUri("tyetest2");
            Console.WriteLine(serviceUri);
            var httpResponseMessage = await _httpClient.GetAsync($"{serviceUri}WeatherForecast");
            var json = await httpResponseMessage.Content.ReadAsStringAsync();
            return json;
        }
    }
}
```

这样，我们就得到了一个在服务 TyeTest 中调用 TyeTest2 的一个服务间调用的示例。

这其实和 [《使用 Tye 辅助开发 k8s 应用竟如此简单（二）》](011-Try-Tye-2) 中得到的测试用例是相同的。

然后使用`tye run`便可以启用测试应用。开发者可以在 swagger 页面中测试具体的效果。

但是！其实没完。此处我们还需要修改`Program.cs`变更默认的`Activity.DefaultIdFormat`:

```cs Program.cs
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace TyeTest
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Activity.DefaultIdFormat = ActivityIdFormat.W3C;
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
```

注意，两个应用都需要修改。

这将会在消息请求头中添加这是一种符合 W3C 标准追踪头信息。不过，如果开发者是 net5 应用，则不需要变更了，因为这已经是默认行为。有关此内容的详细信息，开发者可以参阅：

- <https://devblogs.microsoft.com/aspnet/improvements-in-net-core-3-0-for-troubleshooting-and-monitoring-distributed-apps/>
- <https://docs.microsoft.com/en-us/dotnet/core/compatibility/core-libraries/5.0/default-activityidformat-changed>

## 启用 Zipkin

接下来，我们修改 tye.yml 来启用 zipkin 以监控服务间的调用：

```yml tye.yml
name: tyetest
extensions:
  - name: zipkin
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
  - name: tyetest2
    project: TyeTest2/TyeTest2.csproj
```

没错，其实只是加了`extensions`就完成了。

使用`tye run`，启动应用，便可以在 dashboard 中查看到自动部署起来的 zipkin：

![zipkin in dashboard](/images/20210216-005.png)

打开对应链接，便可以看到对应的 zipkin 查询界面：

![zipkin search ui](/images/20210216-006.png)

然后，我们打开 tyetest 服务的 swagger 界面，进行一次调用。然后在回来查询，便可以查询到服务调用的情况：

![zipkin results](/images/20210216-007.png)

点击其中的 Show 按钮，便可以查看到一次服务调用的详细过程信息：

![one tracing](/images/20210216-008.png)

这就是使用 zipkin 对 http 调用进行追踪的最简易示例。

## 自行部署 Zipkin

和 seq 一样，开发者可以使用已经部署好的 zipkin 以便重复利用，避免每次都要启动浪费时间。

```yml docker-compose.yml
version: '3.3'

services:
  zipkin:
    image: openzipkin/zipkin
    restart: always
    container_name: zipkin
    ports:
      - 9411:9411
```

```yml tye.yml
name: tyetest
extensions:
  - name: zipkin
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
  - name: tyetest2
    project: TyeTest2/TyeTest2.csproj
  - name: zipkin
    external: true
    bindings:
      - name: http
        containerPort: 9411
```

和 seq 一样，通过自行部署 zipkin 实例。然后修改 tye.yml 使得服务得以连接。预期效果与前面一节相同。但是节约了每次启动都需要启动 zipkin 实例的时间。

## Jaeger 也可以

实际上，只要是 zipkin 协议兼容的收集端，那么都可以被这种方式集成。因此，我们该用 Jaeger 作为后端进行测试。

```yml docker-compose.yml
version: '3.3'
services:
  jaeger:
    image: jaegertracing/all-in-one:1.21
    restart: always
    ports:
      - 9411:9411
      - 16686:16686
    environment:
      COLLECTOR_ZIPKIN_HTTP_PORT: 9411
```

`tye.yml`和先前对比没有变化。

启用并测试应用。便可以在 jaeger dashboard 得到类似的结果：

![jaeger result](/images/20210216-009.png)

当然，使用与 Zipkin 兼容的 SkyWalking 也是可以的，开发者可以自行尝试。

## 更详细的追踪

如果在应用程序中需要更加细致的追踪细节，那么可以使用 OpenTelemetry 相关的类库在系统中进行集成。然后通过 Tye 获取对应服务的 connectionString 便可以实现自行导出特定的活动细节。

这里，开发者可以参照 [《使用 Tye 辅助开发 k8s 应用竟如此简单（二）》](011-Try-Tye-2) 中连接 mongodb 的方式进行实验。

> 《OpenTelemetry .NET》 <https://github.com/open-telemetry/opentelemetry-dotnet> 《OpenTelemetry - 云原生下可观测性的新标准》 <https://blog.csdn.net/sd7o95o/article/details/112645413>

## 最后，发到 K8S 里面试一下

注意，和前面的 seq 一样。 `tye deploy` 并不会自动部署对应的 zipkin 服务。

因此，如果要部署`extensions`包含 zipkin 的 tye.yml。请确保 k8s 集群中存在名称为 zipkin 的服务，这样数据才会被收集。

## 小结

本篇，我们已经顺利完成了使用 Tye 中的 zipkin 扩展来实现分布式链路追踪。

下一篇，我们将进一步研究 Tye 如何与分布式应用程序运行时 Dapr 如何碰撞出更精彩的火花。

<!-- md Footer-Newbe-Claptrap.md -->
