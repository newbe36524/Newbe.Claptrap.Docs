---
date: 2021-02-06
title: 使用 Tye 辅助开发 k8s 应用竟如此简单（二）
---

续上篇，这篇我们来进一步探索 Tye 更多的使用方法。本篇我们来了解一下如何在 Tye 中使用服务发现。

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## 服务发现 - 微服务开发不可缺少的部件

> 服务发现，就是新注册的这个服务模块能够及时的被其他调用者发现。不管是服务新增和服务删减都能实现自动发现。 《深入了解服务注册与发现》 <https://zhuanlan.zhihu.com/p/161277955>

> 我们在调用微服务的过程中, 假设在调用某个 REST API 或者 Thrift API, 为了完成某次调用请求, 代码里面需要指定服务所在的 IP 地址和端口, 在传统的应用中, 网络地址和端口是静态的,一般不会改变, 我们只需要把它们配到配置文件中, 就可以通过读取配置文件来完成调用.但是, 在现代基于 Cloud 的微服务架构中, 这种方式将失效, 因为服务的实例是动态分配的地址, 网络地址也是动态的, 这样做的好处是便于服务的自动伸缩, 失败处理和升级. 《微服务架构中的服务发现机制》 <https://www.imooc.com/article/details/id/291255>

简单来说，通过服务发现，服务之间可以使用名称来代替具体的地址和端口甚至访问细节。这样可以使得服务更加容易适用于云原生这种应用程序实例多变的环境。

## 首先，我们需要两个服务

和前篇一样，我们使用命令行来创建两个服务。

```bash
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln .\TyeTest.sln add .\TyeTest\TyeTest.csproj
dotnet new webapi -n TyeTest2
dotnet sln .\TyeTest.sln add .\TyeTest2\TyeTest2.csproj
```

然后使用 tye init 创建 tye.yml 。

便可以在 tye.yml 中得到如下内容：

```yml
name: tyetest
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
  - name: tyetest2
    project: TyeTest2/TyeTest2.csproj
```

这样我们就可以在本地使用`tye run`启动着两个服务。

接下来，我们会改造其中的 TyeTest 服务，使其调用 TyeTest2 作为其下游服务。

这样我们便可以验证服务发现的效果。

## 然后，使用 Tye.Configuration

### 添加包

运行以下命令，为 TyeTest 项目添加包：

```bash
dotnet add ./TyeTest/TyeTest.csproj package Microsoft.Tye.Extensions.Configuration --version 0.6.0-alpha.21070.5
```

### 添加 HttpClientFactory

由于我们需要使用 HttpClient 调用下游服务，因此需要使用到 HttpClientFactory。故而，在 TyeTest 项目的 Startup.cs 增加对 HttpClientFactory 的注册。

```csharp
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

### 使用 HttpClient 调用服务

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

值得注意的是：

1. 构造函数中注入的`IConfiguration`是 Aspnet Core 的内在机制，无需特殊注册。
2. `_configuration.GetServiceUri("tyetest2")`是本示例的关键点。其通过一个服务名称来获取服务的具体 Uri 地址，这样便可以屏蔽部署时，服务地址的细节。

这样，就结束了。

接下来只要使用`tye run`便可以在本地查看已经改造好的服务。调用第一个服务的接口，并可以得到预期的从第二个服务返回的数据。

> 关于 Tye 中服务发现的真实运作机制可以前往官方文库进行了解： <https://github.com/dotnet/tye/blob/master/docs/reference/service_discovery.md#how-it-works-uris-in-development>

## 最后，发到 K8S 里面试一下

若要发布到 k8s 进行测试，只要按照前篇的内容，设置到 docker registry 和 ingress 便可以进行验证了。

开发者可以自行配置并尝试。

## 小結

本篇，我们已经顺利完成了使用 Tye 来完成服务发现机制的使用。通过这种方式，我们便可以使用服务名对服务之间进行相互调用，从而屏蔽具体的部署细节，简化开发。

不过，在实际生产实际中，服务之间并非仅仅只有主机和端口两个信息。有时还需要进行用户名、密码和额外参数的设置。典型的就是对数据库连接字符串的管理。

下一篇，我们将进一步在 Tye 中如何对数据库进行链接。

<!-- md Footer-Newbe-Claptrap.md -->
