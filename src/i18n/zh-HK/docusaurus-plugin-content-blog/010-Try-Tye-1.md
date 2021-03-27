---
date: 2021-01-30
title: 使用 Tye 辅助开发 k8s 应用竟如此简单（一）
tags:
  - Newbe.Claptrap
  - Tye
---

最近正巧在进行 Newbe.Claptrap 新版本的开发，其中使用到了 Tye 来辅助 k8s 应用的开发。该系列我们就来简单了解一下其用法。

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## 安装 Tye

首先，确保已经正确安装了 netcore 2.1 或以上版本的 dotnet SDK。

Tye 目前还处于开发阶段，因此，目前只能安装预览版本进行使用。通过以下链接可以搜索到当前最新的版本，并复制界面上的 CLI 安装。

<https://www.nuget.org/packages/Microsoft.Tye/>

```bash
dotnet tool install --global Microsoft.Tye --version 0.6.0-alpha.21070.5
```

安装完毕后，在控制台中运行 tye，便可以查看到如下结果：

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

## 创建并运行一个测试项目

接下来我们创建一个 netcore 应用来测试该部署方案。选择一个合适的位置运行以下命令来创建测试项目：

```bash
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln .\TyeTest.sln add .\TyeTest\TyeTest.csproj
```

这样，我们就得到了一个测试的解决方案和 WebApi 项目。我们可以运行以下命令在本地启动这个服务：

```bash
dotnet run --project .\TyeTest\TyeTest.csproj
```

启动后，可以在浏览器中打开<https://localhost:5001/swagger/index.html>来查看启动好的 swagger 界面。

## 使用 tye 在本地运行应用

接下来，我们关闭前面正在运行的应用，改为使用 tye 在本地启动测试应用。

在解决方案目录下，使用控制台运行以下命令：

```bash
tye run
```

运行之后，可能会得到如下的结果：

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
[12:11:32 INF] Selected process 24552.
[12:11:33 INF] Listening for event pipe events for tyetest_9dd91ae4-f on process id 24552
```

按照以上的提示，在 <http://127.0.0.1:8000> 成功启动的 tye dashboard。使用浏览器打开 dashboard 便可以查看到已经部署起来的应用列表。如下图所示：

![tye dashboard](/images/20210131-001.png)

通过 dashboard ，可以看到测试程序已经启动，并且绑定了 <http://localhost:14099> 和 <https://localhost:14100>。实际在自行测试中，这两个端口是随机选择的，因此会有不同。

我们通过上面公开的 https 绑定打开 swagger 就能看到和前面使用`dotnet run`一样的效果：<https://localhost:14100/swagger>

## 本地部署一个 k8s

接下来，我们将使用 Tye 将应用部署到 k8s 当中。那么为了实现这个效果，首先需要准备一个 k8s 。

在开发机器上部署 k8s 的方式多种多样，本次实验采用的是 Docker Desktop + k8s 的方案，原因不是别的，就是因为使用其他方案在过程中遇到了或多或少的问题。具体的开发者可以自行选择。

Docker Desktop + k8s 的方案在以下链接中讲述的非常清楚，建议开发者可以参考：

《Docker Desktop 启动 Kubernetes》<https://www.cnblogs.com/weschen/p/12658839.html>

本次实验除了 k8s 本体之外，还需要安装 nginx ingress 和 helm ，也可以参考以上文章中的内容进行安装。

## 将应用部署到 k8s 中

但 k8s 配置完毕之后，我们就可以使用 tye 将应用快速发布到 k8s 中进行查看。

### 登录 docker registry

首先，需要为本地的 docker 配置 docker registry。因为在使用 tye 发布的过程中将会将项目打包的 docker image 并且推送到一个 docker registry 中。

开发者可以选择多种方式获得一个自己的 docker registry：

- Nexus OSS Repository
- 阿里云、腾讯云、DaoCloud 等等都有免费额度的 docker registry
- docker hub，如果网络都好的话

使用`docker login`登录你的 docker registry。

### tye init 创建 tye.yml

在解决方案目录中，运行以下命令来创建 tye.yml 配置文件:

```bash
tye init
```

运行之后，将会在解决方案文件夹得到如下文件：

```yml
name: tyetest
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
```

这就是一个最简单的 tye.yml 文件。

### 修改 tye.yml

我们在 tye.yml 中加入一行关于 docker registry 的配置，以指定构建出来的镜像将推送到何处：

```yml
name: tyetest
registry: registry.cn-hangzhou.aliyuncs.com/newbe36524
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
```

例如，此处笔者使用的是阿里云杭州节点的 docker registry，名称空间为 newbe36524。因此增加了一行`registry: registry.cn-hangzhou.aliyuncs.com/newbe36524`。

这就相当于，如果进行构建，将会构建一个 tag 为`registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0`的镜像并推送到阿里云中。

### 提前下载 netcore 基础镜像

因为此次我们发布的是 netcore 程序，他们将会被构建的 netcore 镜像，因此，为了更加顺利的进行构建，建议先使用加速工具在本地提前下载好基础镜像。

例如，笔者在此次的使用中使用的 net5 TFM 的应用程序，因此，就需要在本地先拉好 mcr.microsoft.com/dotnet/aspnet:5.0 作为基础镜像。

由于现在 netcore 基础镜像的源已经从 docker hub 迁移到 mcr.microsoft.com。故而，建议使用 Newbe.McrMirror 进行加速下载。

详细的使用方法可以参考：<https://github.com/newbe36524/Newbe.McrMirror>

如果开发者不知道自己当前需要拉取的基础镜像是什么，也可以先尝试下面一个步骤直接发布，查看过程中使用的基础镜像内容，再来拉取。

### 使用 tye deploy

一切已经准备就绪，现在，继续在解决方案目录运行以下命令，便可以进行发布:

```bash
tye deploy
```

可能会得到如下结果:

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
            #2 sha256:9e3b70115b86134ab4be5a3ce629a55cd6060936130c89b906677d1958215910
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

            #4 [2/3] WORKDIR /app
            #4 sha256:56abde746b4f39a24525b2b730b2dfb6d9688bcf704d367c86a4753aefff33f6
            #4 CACHED

            #6 [3/3] COPY . /app
            #6 sha256:4a3b76a4eea70c858830bad519b2d8faf5b6969a820b7e38994c2116d3bacab2
            #6 DONE 0.0s

            #8 exporting to image
            #8 sha256:e8c613e07b0b7ff33893b694f7759a10d42e180f2b4dc349fb57dc6b71dcab00
            #8 exporting layers 0.0s done
            #8 writing image sha256:8867f4e2ed6ccddb509e9c39e86c736188a78f348d6487d6d2e7a1b5919c1fdb
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

从输出的日志，我们可以看出，应用已经发布成功。并且使用 k8s dashboard 或者 k9s，我们都可以查看到应用已经成功部署，并且启动完成。

```bash
tyetest-674865dcc4-mxkd5    ●●  1/1   Δ            0 Running   Δ 10.1.0.73     docker-desktop     3m46s
```

值得注意的是，确保这一步正常运行有几个前提：

- 需要确保本地的 kubectl 已经正确配置。一般来说，如果是使用 docker desktop，那么已经配置好了
- 需要确保 docker login 已经成功。开发者可以在运行部署前，测试以下是否可以手动推送镜像
- MCR 镜像的下载速度不是很理想的话，记得用 Newbe.McrMirror 进行加速

## 创建并使用 ingress

到这一步，我们已经完成了应用的发布。但是，由于没有配置 nginx ingress，服务虽然已经可以在 k8s 内部运行了，但是没有在外部进行访问。也就是说，在电脑上使用浏览器现在依然处于打不开的状态。故而，我们还需要为服务配置 ingress。还没有为 k8s 安装 ingress 的朋友，建议查看前面安装 k8s 的相关章节。

这里，我们打开 tye.yml 添加 ingress 相关配置：

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

我们增加了一个 ingress 配置，使得当流量从 ingress 进入，并且域名为`www.yueluo.pro`的时候，将会转发到 tyetest 服务。这样就实现了从外部访问 k8s 内部服务的目的。

首先，使用`tye run` 命令可以在本地查看一下这个效果。运行命令之后可能在 dashboard 中查看到以下情况：

![tye dashboard2](/images/20210131-002.png)

其中，https://localhost:8310 就是 ingress 的入口地址。由于我们采用的是域名绑定，因此可以采用两种方式进行访问以验证效果：

- 在 hosts 中加入 www.yueluo.pro -> 127.0.0.1 的映射关系
- 使用 http 请求文件直接访问。

这里我们采用 http 请求文件直接访问：

```http
GET https://localhost:8310/WeatherForecast
Host: www.yueluo.pro
```

这样，我们就成功验证了绑定的结果。

注意，其中的端口由于笔者没有配置为固定端口，因此每次运行开发者都要注意发生的变化。

## 将 ingress 部署到 k8s 中

接下来，停止`tye run`,运行`tye deploy`将 ingress 和应用程序发布到 k8s 中。

注意，ingress 的部署可能会花费数十秒的时间，因此需要进行一下等待。

部署完成之后，便可以通过 k8s dashboard 或者 k9s 查看部署的结果。

并且，可以使用以下 http 请求来验证部署的结果：

```http
GET https://localhost/WeatherForecast
Host: www.yueluo.pro
```

其得到的结果与先前自然是一样的。

## 从 k8s 中卸载应用

卸载应用，非常简单，`tye undeploy`。

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

本篇，我们简单介绍了如何使用 tye 运行或者部署应用的简单步骤。实际过程中还有很多可以扩展和自定义的选项。感兴趣的朋友可以查看 https://github.com/dotnet/tye 中的内容进行学习。

下一篇，我们将来部署一些稍微复杂一点的多实例应用。

<!-- md Footer-Newbe-Claptrap.md -->
