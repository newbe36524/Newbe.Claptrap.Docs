---
date: 2021-02-06
title: 使用 Tye 輔助開發 k8s 應用竟如此簡單（二）
---

續上篇，這篇我們來進一步探索 Tye 更多的使用方法。本篇我們來瞭解一下如何在 Tye 中使用服務發現。

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## 服務發現 - 微服務開發不可缺少的部件

> 服務發現，就是新註冊的這個服務模塊能夠及時的被其他調用者發現。不管是服務新增和服務刪減都能實現自動發現。 《深入瞭解服務註冊與發現》 <https://zhuanlan.zhihu.com/p/161277955>

> 我們在呼叫微服務的過程中， 假設在呼叫某個 REST API 或者 Thrift API， 為了完成某次呼叫請求， 程式碼裡面需要指定服務所在的 IP 位址和連接埠， 在傳統的應用中， 網路位址和連接埠是靜態的，一般不會改變， 我們只需要把它們配到設定檔中， 就可以透過讀取配置檔來完成呼叫. 但是， 在現代基於 Cloud 的微服務架構中， 這種方式將失效， 因為服務的實體是動態分配的位址， 網路位址也是動態的， 這樣做的好處是便於服務的自動伸縮， 失敗處理和升級. 《微服務架構中的服務發現機制》 <https://www.imooc.com/article/details/id/291255>

簡單來說，通過服務發現，服務之間可以使用名稱來代替具體的位址和埠甚至訪問細節。這樣可以使得服務更加容易適用於雲原生這種應用程式實例多變的環境。

## 首先，我們需要兩個服務

和前篇一樣，我們使用命令行來創建兩個服務。

```bash
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln .\TyeTest.sln add .\TyeTest\TyeTest.csproj
dotnet new webapi -n TyeTest2
dotnet sln .\TyeTest.sln add .\TyeTest2\TyeTest2.csproj
```

然后使用 tye init 创建 tye.yml 。

便可以在 tye.yml 中得到如下內容：

```yml
name: tyetest
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
  - name: tyetest2
    project: TyeTest2/TyeTest2.csproj
```

這樣我們就可以在本地使用`tye run`啟動著兩個服務。

接下來，我們會改造其中的 TyeTest 服務，使其調用 TyeTest2 作為其下游服務。

這樣我們便可以驗證服務發現的效果。

## 然後，使用 Tye.Configuration

### 添加包

執行以下指令，為 TyeTest 專案加入套件：

```bash
dotnet add ./TyeTest/TyeTest.csproj package Microsoft.Tye.Extensions.Configuration --version 0.6.0-alpha.21070.5
```

### 添加 HTTPClientFactory

由於我們需要使用 HttpClient 調用下游服務，因此需要使用到 HTTPClientFactory。故而，在 TyeTest 專案的 Startup.cs 增加對 HTTPClientFactory 的註冊。

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

### 使用 HTTPClient 調用服務

進入 WeatherForecastController， 我們使用 HTTPClient 來呼叫下遊服務，並且將得到的資料傳回：

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

值得注意的是：

1. 建構函數中注入的`IConfiguration`是 Aspnet Core 的內在機制，無需特殊註冊。
2. `_configuration. GetServiceUri（"tyetest2"）`是本示例的關鍵點。其通過一個服務名稱來獲取服務的具體 Uri 位址，這樣便可以遮罩部署時，服務地址的細節。

這樣，就結束了。

接下來只要使用`tye run`便可以在本地查看已經改造好的服務。調用第一個服務的介面，並可以得到預期的從第二個服務返回的數據。

> 關於 Tye 中服務發現的真實運作機制可以前往官方文庫進行瞭解： <https://github.com/dotnet/tye/blob/master/docs/reference/service_discovery.md#how-it-works-uris-in-development>

## 最後，發到 K8S 里面試一下

若要發佈到 k8s 進行測試，只要按照前篇的內容，設置到 docker registry 和 ingress 便可以進行驗證了。

開發者可以自行配置並嘗試。

## 小結

本篇，我們已經順利完成了使用 Tye 來完成服務發現機制的使用。通過這種方式，我們便可以使用服務名對服務之間進行相互調用，從而遮罩具體的部署細節，簡化開發。

不過，在實際生產實際中，服務之間並非僅僅只有主機和埠兩個資訊。有時還需要進行使用者名、密碼和額外參數的設置。典型的就是對資料庫連接字串的管理。

下一篇，我們將進一步在 Tye 中如何對資料庫進行連結。

<!-- md Footer-Newbe-Claptrap.md -->
