---
date: 2021-01-30
title: 使用 Tye 輔助開發 k8s 應用竟如此簡單（一）
tags:
  - Newbe.Claptrap
  - Tye
---

最近正巧在進行 Newbe.Claptrap 新版本的開發，其中使用到了 Tye 來輔助 k8s 應用的開發。該系列我們就來簡單瞭解一下其用法。

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## 安裝 Tye

首先，確保已經正確安裝了 netcore 2.1 或以上版本的 dotnet SDK。

Tye 目前還處於開發階段，因此，目前只能安裝預覽版本進行使用。通過以下連結可以搜索到當前最新的版本，並複製介面上的 CLI 安裝。

<https://www.nuget.org/packages/Microsoft.Tye/>

```bash
dotnet tool install --global Microsoft.Tye --version 0.6.0-alpha.21070.5
```

安裝完畢後，在控制台中運行 tye，便可以查看到如下結果：

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

## 建立並運行一個測試專案

接下來我們創建一個 netcore 應用來測試該部署方案。選擇一個合適的位置執行以下指令來建立測試專案：

```bash
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln .\TyeTest.sln add .\TyeTest\TyeTest.csproj
```

這樣，我們就得到了一個測試的解決方案和 WebApi 專案。我們可以執行以下指令在本地啟動這個服務：

```bash
dotnet run --project .\TyeTest\TyeTest.csproj
```

啟動後，可以在瀏覽器中打開<https://localhost:5001/swagger/index.html>來查看啟動好的 swagger 介面。

## 使用 tye 在本地運行應用

接下來，我們關閉前面正在運行的應用，改為使用 tye 在本地啟動測試應用。

在解決方案目錄下，使用主控台執行以下命令：

```bash
tye run
```

運行之後，可能會得到如下的結果：

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

按照以上的提示，在 <http://127.0.0.1:8000> 成功啟動的 tye dashboard。使用瀏覽器打開 dashboard 便可以查看到已經部署起來的應用清單。如下圖所示：

![tye dashboard](/images/20210131-001.png)

通過 dashboard ，可以看到測試程式已經啟動，並且綁定了 <http://localhost:14099> 和 <https://localhost:14100>。實際在自行測試中，這兩個埠是隨機選擇的，因此會有不同。

我們通過上面公開的 Hs 綁定開啟 swagger 就能看到和前面使用`dotnet run`一樣的效果：<https://localhost:14100/swagger>

## 本地部署一個 k8s

接下來，我們將使用 Tye 將應用部署到 k8s 當中。那麼為了實現這個效果，首先需要準備一個 k8s 。

在開發機器上部署 k8s 的方式多種多樣，本次實驗採用的是 Docker Desktop + k8s 的方案，原因不是別的，就是因為使用其他方案在過程中遇到了或多或少的問題。具體的開發者可以自行選擇。

Docker Desktop + k8s 的方案在以下連結中講述的非常清楚，建議開發者可以參考：

《Docker Desktop 啟動 Kubernetes》<https://www.cnblogs.com/weschen/p/12658839.html>

本次實驗除了 k8s 本體之外，還需要安裝 nginx ingress 和 helm ，也可以參考以上文章中的內容進行安裝。

## 將應用部署到 k8s 中

但 k8s 配置完畢之後，我們就可以使用 tye 將應用快速發表到 k8s 中進行查看。

### 登入 docker registry

首先，需要為本地的 docker 設定 docker registry。因為在使用 tye 發佈的過程中將會將專案打包的 docker image 並且推送到一個 docker registry 中。

開發者可以選擇多種方式獲得一個自己的 docker registry：

- Nexus OSS Repository
- 阿裡雲、騰訊雲、DaoCloud 等等都有免費額度的 docker registry
- docker hub，如果網路都好的話

使用`docker login`登入你的 docker registry。

### tye init 創建 tye.yml

在解決方案目錄中，執行以下指令來建立 tye.yml 設定檔：

```bash
tye init
```

執行之後，將會在解決方案資料夾得到如下檔：

```yml
name: tyetest
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
```

這就是一個最簡單的 tye.yml 檔。

### 修改 tye.yml

我們在 tye.yml 中加入一行關於 docker registry 的配置，以指定構建出來的鏡像將推送到何處：

```yml
name: tyetest
registry: registry.cn-hangzhou.aliyuncs.com/newbe36524
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
```

例如，此處筆者使用的是阿裡雲杭州節點的 docker registry，名稱空間為 newbe36524。因此增加了一行`registry： registry.cn-hangzhou.aliyuncs.com/newbe36524`。

這就相當於，如果進行構建，將會構建一個 tag 為`registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0`的鏡像並推送到阿裡雲中。

### 提前下載 netcore 基礎鏡像

因為此次我們發佈的是 netcore 程式，他們將會被構建的 netcore 鏡像，因此，為了更加順利的進行構建，建議先使用加速工具在本地提前下載好基礎鏡像。

例如，笔者在此次的使用中使用的 net5 TFM 的应用程序，因此，就需要在本地先拉好 mcr.microsoft.com/dotnet/aspnet:5.0 作为基础镜像。

由於現在 netcore 基礎鏡像的源已經從 docker hub 遷移到 mcr.microsoft.com。故而，建议使用 Newbe.McrMirror 进行加速下载。

詳細的使用方法可以參考：<https://github.com/newbe36524/Newbe.McrMirror>

如果開發者不知道自己當前需要拉取的基礎鏡像是什麼，也可以先嘗試下面一個步驟直接發佈，查看過程中使用的基礎鏡像內容，再來拉取。

### 使用 tye deploy

一切已經準備就緒，現在，繼續在解決方案目錄運行以下命令，便可以進行發佈：

```bash
tye deploy
```

可能會得到如下結果：

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

從輸出的日誌，我們可以看出，應用已經發佈成功。並且使用 k8s dashboard 或者 k9s，我們都可以查看到應用已經成功部署，並且啟動完成。

```bash
tyetest-674865dcc4-mxkd5 ●● 1/1 Δ 0 Running Δ 10.1.0.73 docker-desktop 3m46s
```

值得注意的是，確保這一步正常運行有幾個前提：

- 需要確保本地的 kubectl 已經正確配置。一般來說，如果是使用 docker desktop，那麼已經配置好了
- 需要確保 docker login 已經成功。開發者可以在運行部署前，測試以下是否可以手動推送鏡像
- MCR 鏡像的下載速度不是很理想的話，記得用 Newbe.McrMirror 進行加速

## 建立並使用 ingress

到這一步，我們已經完成了應用的發佈。但是，由於沒有配置 nginx ingress，服務雖然已經可以在 k8s 內部運行了，但是沒有在外部進行訪問。也就是說，在電腦上使用瀏覽器現在依然處於打不開的狀態。故而，我們還需要為服務配置 ingress。還沒有為 k8s 安裝 ingress 的朋友，建議查看前面安裝 k8s 的相關章節。

這裡，我們打開 tye.yml 添加 ingress 相關配置：

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

我們增加了一個 ingress 配置，使得當流量從 ingress 進入，並且域名為`www.yueluo.pro`的時候，將會轉發到 tyetest 服務。這樣就實現了從外部訪問 k8s 內部服務的目的。

首先，使用`tyerun` 命令可以在本地查看一下這個效果。執行命令之後可能在 dashboard 中查看到以下情況：

![tye dashboard2](/images/20210131-002.png)

其中，HTTPs：//localhost：8310 就是ingress的入口位址。由於我們採用的是功能變數名稱綁定，因此可以採用兩種方式進行訪問以驗證效果：

- 在 hosts 中加入 www.yueluo.pro -> 127.0.0.1 的映射關係
- 使用 HTTP 請求檔直接存取。

這裡我們採用 http 要求檔案直接存取：

```http
GET https://localhost:8310/WeatherForecast
Host: www.yueluo.pro
```

這樣，我們就成功驗證了綁定的結果。

注意，其中的埠由於筆者沒有配置為固定埠，因此每次運行開發者都要注意發生的變化。

## 將 ingress 部署到 k8s 中

接下來，停止`tye run`，運行`tye deploy`將 ingress 和應用程式發布到 k8s 中。

注意，ingress 的部署可能會花費數十秒的時間，因此需要進行一下等待。

部署完成之後，便可以通過 k8s dashboard 或者 k9s 查看部署的結果。

並且，可以使用以下 HTTP 請求來驗證部署的結果：

```http
GET https://localhost/WeatherForecast
Host: www.yueluo.pro
```

其得到的結果與先前自然是一樣的。

## 從 k8s 中卸載應用

卸載應用，非常簡單，`tye undeploy`。

```bash
PS C:\Repos\TyeTest> tye undeploy
Loading Application Details...
Found 3 resource(s).
Deleting 'Service' 'tyetest' ...
Deleting 'Deployment' 'tyetest' ...
Deleting 'Ingress' 'tyetest-ingress' ...
Time Elapsed: 00:00:02:87
```

## 小結

本篇，我們簡單介紹了如何使用 tye 運行或者部署應用的簡單步驟。實際過程中還有很多可以擴展和自定義的選項。感興趣的朋友可以查看 https://github.com/dotnet/tye 中的內容進行學習。

下一篇，我們將來部署一些稍微複雜一點的多實例應用。

<!-- md Footer-Newbe-Claptrap.md -->
