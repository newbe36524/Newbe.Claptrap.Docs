---
date: 2021-01-30
title: Tye を使用して k8s アプリを開発するのはとても簡単です (1)
---

最近、K8s アプリケーションの開発を支援するために Tye を使用する Newbe.Claptrap の新しいバージョンの開発が進行中です。このシリーズでは、その使い方を簡単に説明します。

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## Tye をインストールします

まず、netcore 2.1 以降の dotnet SDK が正しくインストールされていることを確認します。

Tye はまだ開発中であるため、現時点ではプレビュー バージョンのみをインストールできます。次のリンクを使用して、現在の最新バージョンを検索し、インターフェイスで CLI インストールをコピーします。

<https://www.nuget.org/packages/Microsoft.Tye/>

```bash
dotnet tool install --global Microsoft.Tye --version 0.6.0-alpha.21070.5
```

インストールが完了したら、コンソールで tye を実行すると、次のような結果が表示されます：

```bash
PS C:\tools\Cmder> tye
tye:
  Developer tools and publishing for microservices.

Usage:
  tye [options] [command]

Options:
  --no-default      Disable default options from environment variables
  -?, -h, --help    Show help and usage information
  --version         Show version information

Commands:
  init <path>        create a yaml manifest
  run <path>         run the application
  build <path>       build containers for the application
  push <path>        build and push application containers to registry
  deploy <path>      deploy the application
  undeploy <path>    delete deployed application
```

## テスト プロジェクトを作成して実行します

次に、展開シナリオをテストする netcore アプリを作成します。テスト プロジェクトを作成するには、次のコマンドを実行する適切な場所を選択します：

```bash
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln .\TyeTest.sln add .\TyeTest\TyeTest.csproj
```

これにより、テストされたソリューションと WebApi プロジェクトが得されます。このサービスをローカルで開始するには、次のコマンドを実行：

```bash
dotnet run --project .\TyeTest\TyeTest.csproj
```

起動後、ブラウザで<https://localhost:5001/swagger/index.html>を開いて、起動した swagger インターフェイスを表示できます。

## tye を使用してアプリをローカルで実行します

次に、前に実行したアプリを閉じ、代わりに tye を使用してテスト アプリをローカルで起動します。

ソリューション ディレクトリで、コンソールを使用して次のコマンドを実行します：

```bash
tye run
```

実行すると、次のような結果が得られる場合があります：

```bash
PS C:\Repos\TyeTest> tye run
Loading Application Details...
Launching Tye Host...

[12:11:30 INF] Executing application from C:\Repos\TyeTest\TyeTest.sln
[12:11:30 INF] Dashboard running on http://127.0.0.1:8000
[12:11:30 INF] Building projects
[12:11:32 INF] Launching service tyetest_9dd91ae4-f: C:\Repos\TyeTest\TyeTest\bin\Debug\net5.0\TyeTest.exe
[12:11:32 INF] tyetest_9dd91ae4-f running on process id 24552 bound to http://localhost:14099, https://localhost:14100
[12:11:32 INF] Replica tyetest_9dd91ae4-f is moving to a ready state
[ 12:11:32 INF] Selected process 24552.
[12:11:33 INF] Listening for event pipe events for tyetest_9dd91ae4-f on process id 24552
```

上記のプロンプトに従って、 <http://127.0.0.1:8000> 正常に起動した tye dashboard をクリックします。ブラウザを使用して dashboard を開くと、デプロイされたアプリの一覧が表示されます。次の図に示すように：

![tye dashboard](/images/20210131-001.png)

dashboard を使用すると、テスターが起動され、 <http://localhost:14099> と <https://localhost:14100>。実際には、自己テストでは、2 つのポートがランダムに選択されるため、異なります。

上記の https バインディングを使用して swagger を開くと、`dotnet run`を使用した場合と同じ効果が得られます：<https://localhost:14100/swagger>

## k8s をローカルにデプロイします

次に、Tye を使用してアプリを k8s にデプロイします。これを実現するには、まず k8s を準備する必要があります。

k8s を開発マシンに展開する方法はさま一致しますが、この実験では Docker Desktop + k8s のシナリオを使用します。特定の開発者は、自分で選択できます。

Docker Desktop + k8s のシナリオは、次のリンクで明確に説明されていますが、開発者は次のリンクを参照：

Docker Desktop が Kubernetes を起動<https://www.cnblogs.com/weschen/p/12658839.html>

今回の実験では、 k8s 本体に加えて nginx ingress と helm をインストールする必要があり、上記の記事の内容を参照してインストールすることもできます.

## k8s にアプリをデプロイします

しかし、k8s を設定したら、tye を使用して k8s にアプリをすばやく公開して表示できます。

### docker registry にログインします

まず、ローカルの docker に対して docker registry を構成する必要があります。tye を使用してパブリッシュすると、プロジェクトがパッケージ化された docker image が docker registry にプッシュされるためです。

開発者は、独自の docker registry を取得するさまざまな方法を：

- Nexus OSS Repository
- Alibaba Cloud、Tencent Cloud、DaoCloud などには、無料クレジットの docker registry があります
- docker hub は、ネットワークがすべて良好である場合

docker login`を使用`docker registry にログインします。

### tye init は tye.yml を作成します

ソリューション ディレクトリで、次のコマンドを実行して tye.yml 構成ファイルを作成します。

```bash
tye init
```

実行すると、ソリューション フォルダーに次のようなファイルが表示：

```yml
name: tyetest
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
```

これは最も簡単な tye.yml ファイルです。

### tye.yml を変更します

tye.yml に docker registry に関する構成行を追加して、構築されたミラーがプッシュされる場所を指定します：

```yml
name: tyetest
registry: registry.cn-hangzhou.aliyuncs.com/newbe36524
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
```

たとえば,ここではアリババクラウド杭州ノードのdocker registryを用い,ネームスペースはnewbe36524である.したがって、 registry:`行が追加registry.cn-hangzhou.aliyuncs.com/newbe36524`。

これは、ビルドすると、タグが`registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0`のイメージが構築され、Alibaba Cloud にプッシュされるのと同じです。

### netcore ベースイメージを事前にダウンロードしてください

今回はnetcoreプログラムをリリースし,構築したnetcoreミラーを作成するため,よりスムーズに構築するために,まずアクセラレーションツールを用い,ベースミラーをローカルに事前にダウンロードすることをお勧めします.

例えば、以下のコードで net5 TFM を使うことを指すため、ローカルではmcr.microsoft.com/dotnet/aspnet:5.0 を基本としたミラーにしてください。

netcore 基になるミラーのソースが docker hub から mcr.microsoft.com。このアドオンにNewbe.McrMirror を使用してダウンロードアップ・ダウンロードアップを推奨。

詳細な使用方法については、「」を参照してください：<https://github.com/newbe36524/Newbe.McrMirror>

開発者が現在プルする必要がある基になるイメージがわからない場合は、次の手順を試して直接公開し、プロセスで使用される基になるイメージの内容を確認し、プルすることもできます。

### tye deploy を使用します

これで、ソリューション ディレクトリで次のコマンドを実行し、発行する準備ができました。

```bash
tye deploy
```

次のような結果が得られる場合があります。

```bash
PS C:\Repos\TyeTest> tye deploy
Loading Application Details...
Verifying kubectl installation...
Verifying kubectl connection to cluster...
Processing Service 'tyetest'...
    Applying container defaults...
    Compiling Services...
    Publishing Project...
    Building Docker Image...
            #1 [internal] load build definition from Dockerfile
            #1 sha256:a3872c76e0ccfd4bade43ecac3349907e0d110092c3ca8c61f1d360689bad7e2
            #1 transferring dockerfile: 144B done
            #1 DONE 0.0s

            #2 [internal] load .dockerignore
            #2 sha256:9e3b70115b86134ab4be5a3ce629a55cd6060936130c89 b906677d1958215910
            #2 transferring context: 2B done
            #2 DONE 0.0s

            #3 [internal] load metadata for mcr.microsoft.com/dotnet/aspnet:5.0
            #3 sha256:3b35130338ebb888f84ec0aa58f64d182f10a676a625072200f5903996d93690
            #3 DONE 0.0s

            #7 [1/3] FROM mcr.microsoft.com/dotnet/aspnet:5.0
            #7 sha256:31acc33a1535ed7869167d21032ed94a0e9b41bbf02055dc5f04524507860176
            #7 DONE 0.0s

            #5 [internal] load build context
            #5 sha256:2a74f859befdf852c0e7cf66b6b7e71ec4ddeedd37d3bb6e4840dd441d712a20
            #5 transferring context: 3.87MB 0.0s done
            #5 DONE 0.1s

            #4 [2/3] WO RKDIR /app
            #4 sha256:56abde746b4f39a24525b2b730b2dfb6d9688bcf704d367c86a4753aefff33f6
            #4 CACHED

            #6 [3/3] COPY . /app
            #6 sha256:4a3b76a4eea70c858830bad519b2d8faf5b6969a820b7e38994c2116d3bacab2
            #6 DONE 0.0s

            #8 exporting to image
            #8 sha256:e8c613e07b0b7ff33893b694f7759a10d42e180f2b4dc349fb57dc6b71dcab00
            #8 exporting layers 0.0s done
            #8 writing image sha256:8867f4e2ed6ccddb509e9c39e86c736188a7 8f348d6487d6d2e7a1b5919c1fdb
            #8 writing image sha256:8867f4e2ed6ccddb509e9c39e86c736188a78f348d6487d6d2e7a1b5919c1fdb done
            #8 naming to registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0 done
            #8 DONE 0.1s
        Created Docker Image: 'registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0'
    Pushing Docker Image...
        Pushed docker image: 'registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0'

    Validating Secrets...
    Generating Manifests...
Deploying Application Manifests...
    Applying Kubernetes Manifests...
        Verifying kubectl installation...
        Verifying kubectl connection to cluster...
        Writing output to 'C:\Users\Administrator\AppData\Local\Temp\tmp2BC2.tmp'.
        Deployed application 'tyetest'.
Time Elapsed: 00:00:12:99
```

出力ログから、アプリが正常にリリースされたことがわかります。また、k8s dashboard または k9s を使用すると、アプリが正常にデプロイされ、起動が完了したことを確認できます。

```bash
tyetest-674865dcc4-mxkd5 ●● 1/1 Δ 0 Running Δ 10.1.0.73 docker-desktop 3m46s
```

この手順が正しく機能していることを確認するには、いくつかの前提条件があります：

- ローカルの kubectl が正しく構成されていることを確認する必要があります。一般に、docker desktop を使用する場合は、既に構成されています
- docker login が成功したことを確認する必要があります。開発者は、展開を実行する前に、次のイメージを手動でプッシュできるかどうかをテストできます
- MCRミラーのダウンロード速度は理想的ではなく、Newbe.McrMirrorで加速することを忘れずに

## ingress を作成して使用します

このステップでは、アプリのリリースが完了しました。ただし、nginx ingress が構成されていない場合、サービスは k8s 内で実行できますが、外部でアクセスできません。つまり、PC でブラウザを使用すると、まだ開いていきます。したがって、サービス用に ingress を構成する必要があります。まだ k8s 用に ingress をインストールしていない友人は、k8s のインストールに関する以前の章を確認することをお勧めします。

ここでは、 tye.yml を開き、 ingress 関連の設定を追加します：

```yml
name: tyetest
registry: registry.cn-hangzhou.aliyuncs.com/newbe36524
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
ingress:
  - name: tyetest-ingress
    bindings:
      - name: https
        protocol: https
    rules:
      - host: www.yueluo.pro
        service: tyetest
```

ingress からトラフィックが入力され、ドメイン名が`www.yueluo.pro`のときに tyetest サービスに転送される ingress 構成を追加しました。これにより、外部から k8s 内部サービスにアクセスできます。

まず、`tye run` コマンドを使用して、この効果をローカルで確認できます。コマンドの実行後、dashboard で次の状況が表示される場合があります：

![tye dashboard2](/images/20210131-002.png)

ここで、https://localhost:8310 は ingress のエントリ アドレスです。ドメイン 名バインディングを使用しているため、2 つの方法でアクセスして、結果を検証することができます：

- hosts に www.yueluo.pro -> 127.0.0.1 のマッピング関係を追加します
- http を使用してファイルへの直接アクセスを要求します。

ここでは、http を使用してファイルへの直接アクセスを要求します：

```http
GET https://localhost:8310/WeatherForecast
Host: www.yueluo.pro
```

これにより、バインディングの結果が正常に検証されます。

これらのポートは固定ポートとして構成されていないため、開発者を実行するたびに変更に注意する必要があります。

## ingress を k8s にデプロイします

次に、`tye run`を停止し、`tye deploy`を実行して ingress とアプリケーションを k8s にパブリッシュします。

ingress の展開には数十秒かかる可能性があるため、少し待機する必要があります。

デプロイが完了したら、k8s ダッシュボードまたは k9s を使用してデプロイの結果を表示できます。

また、次の http 要求を使用して、展開の結果を検証できます：

```http
GET https://localhost/WeatherForecast
Host: www.yueluo.pro
```

結果は、以前の自然と同じです。

## k8s からアプリをアンインストールします

アプリをアンインストールすると、 tye undeploy`簡単にアンインストール`。

```bash
PS C:\Repos\TyeTest> tye undeploy
Loading Application Details...
Found 3 resource(s).
Deleting 'Service' 'tyetest' ...
Deleting 'Deployment' 'tyetest' ...
Deleting 'Ingress' 'tyetest-ingress' ...
Time Elapsed: 00:00:02:87
```

## 小さな結び目

この記事では、tye を使用してアプリを実行またはデプロイする簡単な手順について簡単に説明します。実際には、拡張およびカスタマイズできるオプションが他にもたくさんあります。興味のある友人は、https://github.com/dotnet/tyeを見ることができます。

次回は、もう少し複雑なマルチインスタンス アプリを展開します。

<!-- md Footer-Newbe-Claptrap.md -->
