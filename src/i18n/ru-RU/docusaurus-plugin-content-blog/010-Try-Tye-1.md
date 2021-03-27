---
date: 2021-01-30
title: Разработка приложений k8s с помощью Tye так проста (I)
tags:
  - Newbe.Claptrap
  - Tye
---

Недавняя разработка новой версии Newbe.Claptrap, которая использует Tye для ее сша, чтобы помочь в разработке приложений k8s.В этой серии давайте кратко рассмотрим ее использование.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## Установите Tye

Во-первых, убедитесь, что пакет SDK dotnet установлен правильно для netcore 2.1 или более поздней версии.

Tye все еще находится в стадии разработки, поэтому в настоящее время для использования можно установить только предварительную версию.По следующей ссылке можно выполнить поиск текущей последней версии и скопировать установку CLI на интерфейсе.

<https://www.nuget.org/packages/Microsoft.Tye/>

```bash
dotnet tool install --global Microsoft.Tye --version 0.6.0-alpha.21070.5
```

После установки запустите tye в консоли, и вы можете увидеть следующие результаты：

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

## Создайте и запустите тестовый проект

Далее мы создадим приложение netcore для тестирования сценария развертывания.Выберите подходящее место для выполнения следующих команд для создания тестового проекта：

```bash
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln .\TyeTest.sln add .\TyeTest\TyeTest.csproj
```

Таким образом, у нас есть тестовое решение и проект WebApi.Мы можем запустить эту службу локально, выполнив следующую команду：

```bash
dotnet run --project .\TyeTest\TyeTest.csproj
```

После запуска можно открыть функцию<https://localhost:5001/swagger/index.html>, чтобы просмотреть запущенный интерфейс swagger.

## Используйте tye для запуска приложения локально

Затем мы закрываем приложения, запущенные ранее, и запускаем тестовые приложения локально с помощью tye.

В каталоге решений используйте консоль для выполнения следующих команд：

```bash
tye run
```

После запуска могут быть результаты, как показано ниже：

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

Следуйте инструкциям выше, чтобы <http://127.0.0.1:8000> tye dashboard, который успешно запущен в файле.Откройте dashboard с помощью браузера, чтобы просмотреть список развернутых приложений.Как показано на следующем рисунке：

![tye dashboard](/images/20210131-001.png)

С помощью dashboard можно увидеть, что тестовая программа запущена и привязана к <http://localhost:14099> и <https://localhost:14100>.На самом деле, в самотекать, эти два порта выбираются случайным образом и, следовательно, будут отличаться.

Мы открываем swagger с помощью привязки https, которая была обнародована выше, чтобы увидеть такой же эффект,`предыдущий`dotnet run：<https://localhost:14100/swagger>

## Локальное развертывание k8s

Далее мы будем использовать Tye для развертывания приложения в k8s.Таким образом, для достижения этого эффекта, вы должны сначала подготовить k8s.

K8s развертывается на машинах разработки различными способами, и в этом эксперименте используется сценарий Docker Desktop + k8s либо по другой причине, либо из-за более или менее проблем в процессе использования других сценариев.Конкретные разработчики могут выбрать по своему выбору.

Сценарий Docker Desktop + k8s очень ясен по ссылке ниже, и рекомендуется, чтобы разработчики могли обратиться к：

Docker Desktop запускает Kubernetes<https://www.cnblogs.com/weschen/p/12658839.html>

В дополнение к корпусу k8s, этот эксперимент требует установки nginx ingress и helm, а также ссылки на содержимое вышеупомянутой статьи.

## Разверните приложение в k8s

Но после настройки k8s мы можем использовать tye для быстрой публикации приложения в k8s для просмотра.

### Войдите в docker registry

Во-первых, необходимо настроить docker registry для локального docker.Это связано с тем, что docker image, упаковываемый в проект, будет отправлен в docker registry во время публикации с помощью tye.

Разработчики могут выбрать один из своих собственных docker registry：

- Nexus OSS Repository
- Alibaba Cloud, Tencent Cloud, DaoCloud и многое другое имеют бесплатные docker registry
- docker hub, если сеть в порядке

Войдите`docker registry с помощью`docker login.

### tye init создает tye.yml

В каталоге решений выполните следующую команду для создания профиля tye.yml:

```bash
tye init
```

После запуска в папке решения появится следующий файл：

```yml
name: tyetest
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
```

Это самый простой файл tye.yml.

### Измените tye.yml

Мы добавим строку конфигурации docker registry в tye.yml, чтобы указать, куда будет отправлено построенное зеркало：

```yml
name: tyetest
registry: registry.cn-hangzhou.aliyuncs.com/newbe36524
services:
  - name: tyetest
    project: TyeTest/TyeTest.csproj
```

Например, здесь я использую docker registry узла Alibaba Cloud Hangzhou с пространством имен newbe36524.Таким образом, добавлена строка`registry: registry.cn-hangzhou.aliyuncs.com/newbe36524`.

Это эквивалентно созданию зеркала tag`registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0`и отправке в облако Alibaba.

### Загрузите базовое зеркало netcore заранее

Поскольку на этот раз мы публикуем программу netcore, они будут построены для зеркал netcore, поэтому для более плавной сборки рекомендуется сначала загрузить базовое зеркало локально с помощью инструмента ускорения.

例如，笔者在此次的使用中使用的 net5 TFM 的应用程序，因此，就需要在本地先拉好 mcr.microsoft.com/dotnet/aspnet:5.0 作为基础镜像。

Поскольку источник базового зеркала netcore теперь перенесен с docker hub на mcr.microsoft.com.故而，建议使用 Newbe.McrMirror 进行加速下载。

Подробную информацию об использовании можно найти в：<https://github.com/newbe36524/Newbe.McrMirror>

Если разработчик не знает, что такое базовое зеркало, которое в настоящее время необходимо вытащить, он также может попробовать следующий шаг, чтобы опубликовать его напрямую, просмотреть базовое зеркальное отображение, использованное в процессе, а затем вытащить его.

### Используйте tye deploy

Все готово, и теперь вы готовы к публикации, продолжая выполнять следующие команды в каталоге решений:

```bash
tye deploy
```

Вы можете получить следующие результаты:

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

Из выходных журналов видно, что приложение успешно опубликовано.И с k8s dashboard или k9s, мы можем видеть, что приложение было успешно развернуто и запуск завершен.

```bash
tyetest-674865dcc4-mxkd5 ●● 1/1 Δ 0 Running Δ 10.1.0.73 docker-desktop 3m46s
```

Примечательно, что существует несколько предварительных условий для обеспечения правильной работы этого шага：

- Необходимо убедиться, что локальный kubectl настроен правильно.Как правило, если вы используете docker desktop, он уже настроен
- Необходимо убедиться, что docker login выполнен успешно.Перед запуском развертывания разработчики могут проверить, можно ли вручную отправить образ ниже
- MCR зеркала не очень быстро загружаются, не забудьте ускорить с Newbe.McrMirror

## Создайте и используйте ingress

На этом мы завершили выпуск приложения.Однако, поскольку nginx ingress не настроен, служба больше не может работать внутри k8s, но не имеет внешнего доступа.Это означает, что использование браузера на компьютере по-прежнему не открывается.Таким образом, нам также нужно настроить ingress для службы.Друзья, которые еще не установить ingress для k8s, рекомендуется ознакомиться с разделами, связанными с предыдущей установкой k8s.

Здесь мы открываем tye.yml, чтобы добавить конфигурацию, связанную с ingress：

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

Мы добавили конфигурацию ingress, которая пересылает трафик в службу tyetest, когда трафик поступает из ingress и доменное имя`www.yueluo.pro`, когда доменное имя является  www.yueluo.pro .Это позволяет получить доступ к внутренним службам k8s извне.

Во-первых,`команду` tye run можно просмотреть этот эффект локально.После выполнения команды в dashboard может появиться следующее：

![tye dashboard2](/images/20210131-002.png)

Где https://localhost:8310 является адресом входа для ingress.Поскольку мы используем привязку доменных имен, доступ к ним можно получить двумя способами для проверки эффективности：

- Добавьте сопоставление www.yueluo.pro> 127.0.0.1 в hosts
- Используйте http-файл запроса для прямого доступа.

Здесь мы используем http-файл запроса для прямого доступа к：

```http
GET https://localhost:8310/WeatherForecast
Host: www.yueluo.pro
```

Таким образом, мы успешно проверили результат привязки.

Обратите внимание, что порты, которые не настроены автором в качестве фиксированных портов, должны быть замечены при каждом запуске разработчика.

## Разверните ingress в k8s

Затем остановите`tye run`, запустите`tye deploy`опубликуйте ingress и приложения в k8s.

Обратите внимание, что развертывание ingress может занять десятки секунд, поэтому необходимо подождать.

После завершения развертывания результаты развертывания можно просмотреть по k8s dashboard или k9s.

Кроме того, следующие http-запросы можно использовать для проверки результатов развертывания：

```http
GET https://localhost/WeatherForecast
Host: www.yueluo.pro
```

Результаты такие же, как и в предыдущих природах.

## Удалите приложение из k8s

Удаление приложения очень просто,`tye undeploy`.

```bash
PS C:\Repos\TyeTest> tye undeploy
Loading Application Details...
Found 3 resource(s).
Deleting 'Service' 'tyetest' ...
Deleting 'Deployment' 'tyetest' ...
Deleting 'Ingress' 'tyetest-ingress' ...
Time Elapsed: 00:00:02:87
```

## Сделать небольшой узел

В этой статье мы кратко рассмотрели простые шаги по запуску или развертыванию приложения с помощью tye.Есть много вариантов, которые могут быть расширены и настроены на практике.Заинтересованные друзья могут просматривать https://github.com/dotnet/tye в этом режиме.

В следующей статье мы разместим несколько немного более сложных приложений с несколько экземплярами.

<!-- md Footer-Newbe-Claptrap.md -->
