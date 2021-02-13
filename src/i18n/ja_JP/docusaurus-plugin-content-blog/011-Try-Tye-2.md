---
date: 2021-02-06
title: Tye を使用して k8s アプリを開発するのはとても簡単です (ii)
---

前回は、Tye の使用方法をさらに探求します。この記事では、Tye でサービス検出を使用する方法について説明します。

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## サービス検出 - マイクロサービス開発に不可欠なコンポーネント

> サービス検出は、新しく登録されたサービス モジュールが他の呼び出し元によってタイムリーに検出される可能性がある場合です。サービスの追加と削除に関係なく、自動検出が可能になります。 「サービスの登録と検出に関する洞察」を参照 <https://zhuanlan.zhihu.com/p/161277955>

> マイクロサービスを呼び出す過程で、REST API または Thrift API を呼び出し、呼び出し要求を完了するために、サービスが存在する IP アドレスとポートを指定するコードが必要であると仮定すると、従来のアプリケーションでは、ネットワーク アドレスとポートは静的であり、一般的に変更されません。 ただし、最新の Cloud ベースのマイクロサービス アーキテクチャでは、サービスのインスタンスが動的に割り当てられたアドレスであり、ネットワーク アドレスも動的であるため、この方法は無効になり、サービスの自動スケーリング、失敗処理、およびアップグレードが容易になります。 マイクロサービス アーキテクチャにおけるサービス検出メカニズム」を参照 <https://www.imooc.com/article/details/id/291255>

簡単に言えば、サービス検出では、特定のアドレスとポートの代わりに名前を使用したり、サービス間で詳細にアクセスしたりできます。これにより、クラウド ネイティブなどのアプリケーション インスタンスが変化する環境でサービスを簡単に適用できます。

## まず、2 つのサービスが必要です

前編と同様に、コマンド ラインを使用して 2 つのサービスを作成します。

```bash
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln .\TyeTest.sln add .\TyeTest\TyeTest.csproj
dotnet new webapi -n TyeTest2
dotnet sln .\TyeTest.sln add .\TyeTest2\TyeTest2.csproj
```

然后使用 tye init 创建 tye.yml 。

tye.yml では、次のように表示されます：

```yml
name: tyetest
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
  - name: tyetest2
    project: TyeTest2/TyeTest2.csproj
```

これにより、ローカルで`tye run`を使用して 2 つのサービスを開始できます。

次に、TyeTest サービスを変換して、TyeTest2 をダウンストリーム サービスとして呼び出します。

これにより、サービス検出の効果を検証できます。

## 次に、Tye.Configuration を使用します

### パッケージを追加します

次のコマンドを実行して、TyeTest プロジェクトのパッケージを追加します：

```bash
dotnet add ./TyeTest/TyeTest.csproj package Microsoft.Tye.Extensions.Configuration --version 0.6.0-alpha.21070.5
```

### HttpClientFactory を追加します

HttpClient を使用してダウンストリーム サービスを呼び出す必要があるため、HttpClientFactory を使用する必要があります。したがって、TyeTest プロジェクトの Startup.cs HttpClientFactory への登録が増加します。

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

### HttpClient を使用してサービスを呼び出します

WeatherForecastController に移動し、HttpClient を使用してダウンストリーム サービスを呼び出し、取得したデータを：

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

注目すべきは：

1. コンストラクターに挿入される`IConfiguration`は、Aspnet Core の固有のメカニズムであり、特別な登録は必要ではありません。
2. `_configuration. GetServiceUri("tyetest2")`この例の重要なポイントです。サービス名を使用してサービスの特定の Uri アドレスを取得し、展開時のサービス アドレスの詳細をマスクします。

これで終わりです。

次に、`tye run`を使用して、変換されたサービスをローカルで表示できます。最初のサービスのインターフェイスを呼び出し、2 番目のサービスから返されるデータを取得できます。

> Tye のサービス検出の実際の動作メカニズムについては、公式のライブラリにアクセスして： <https://github.com/dotnet/tye/blob/master/docs/reference/service_discovery.md#how-it-works-uris-in-development>

## 最後に、インタビューのためにK8Sに送ります

テストのために k8s に投稿するには、前編の内容に従って docker registry と ingress に設定して検証します。

開発者は自分で設定して試してみてください。

## 小さな結び目

この記事では、Tye を使用してサービス検出メカニズムの使用を完了しました。これにより、サービス名を使用してサービス間で相互に呼び出し、特定の展開の詳細をマスクし、開発を簡素化できます。

ただし、実際には、サービス間の情報はホストとポートだけではありません。場合によっては、ユーザー名、パスワード、および追加のパラメーターの設定も必要です。通常、データベース接続文字列の管理です。

次の記事では、Tye でデータベースをリンクする方法について説明します。

<!-- md Footer-Newbe-Claptrap.md -->
