---
date: 2021-01-30
title: Die Entwicklung von k8s-Anwendungen mit Tye Aid ist so einfach wie das (I)
tags:
  - Newbe.Claptrap
  - Tye
---

Eine neue Version von Newbe.Claptrap wurde vor kurzem entwickelt, mit Tye, um die Entwicklung von k8s Anwendungen zu unterstützen.Werfen wir einen kurzen Blick darauf, wie es in dieser Serie verwendet wird.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## Tye installieren

Stellen Sie zunächst sicher, dass die netcore 2.1-Version oder höher der Version des dotnet SDK ordnungsgemäß installiert ist.

Tye befindet sich derzeit in der Entwicklung, sodass derzeit nur die Vorschauversion für die Verwendung installiert werden kann.Über den folgenden Link können Sie nach der neuesten Version suchen und die CLI-Installation auf der Schnittstelle kopieren.

<https://www.nuget.org/packages/Microsoft.Tye/>

```bash
dotnet-Toolinstallieren --global Microsoft.Tye --version 0.6.0-alpha.21070.5
```

Führen Sie nach der Installation tye in der Konsole aus, und Sie können die folgenden results：

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

## Erstellen und Ausführen eines Testprojekts

Als Nächstes erstellen wir eine Netcore-App, um das Bereitstellungsszenario zu testen.Wählen Sie einen geeigneten Speicherort aus, um die folgenden Befehle auszuführen, um einen Test project：

```bash
dotnet new sln -n TyeTest
dotnet new webapi -n TyeTest
dotnet sln .\TyeTest.sln hinzufügen .\TyeTest\TyeTest.csproj
```

Auf diese Weise erhalten wir eine Testlösung und ein WebApi-Projekt.Wir können den folgenden Befehl ausführen, um diesen Dienst zu starten locally：

```bash
dotnet run --project .\TyeTest\TyeTest.csproj
```

Nach dem Start können Sie den<https://localhost:5001/swagger/index.html>-Browser öffnen, um die Start-Swagger-Schnittstelle anzuzeigen.

## Verwenden von tye zum lokalen Ausführen der App

Schließen wir als Nächstes die zuvor ausgeführte App und verwenden stattdessen tye, um die Test-App lokal zu starten.

Verwenden Sie im Lösungsverzeichnis die Konsole, um die folgenden commands：

```bash
tye run
```

Nach dem Ausführen erhalten Sie möglicherweise die folgenden results：

```bash
PS C:\Repos\TyeTest> tye run
Loading Application Details...
Launching Tye Host...

[12:11:30 INF] Ausführen der Anwendung von C:\Repos\TyeTest\TyeTest.sln
[12:11:30 INF] Dashboard läuft auf http://127.0.0.1:8000
[12:11:30 INF] Bauprojekte
[12:11:32] Startdienst tyetest_9dd91ae4-f: C:\Repos\TyeTest\TyeTest-bin-Debug-\net5,0\TyeTest.exe
[12:11:32 INF] tyetest_9dd91ae4-f, der auf der Prozess-ID 24552 ausgeführt wird und an http://localhost:14099 gebunden ist, https://localhost:14100
[12:11:32 INF] Replica tyetest_9dd91ae4-f wird in einen bereitschaftsfähigen Zustand
[ 12:11:32 INF] Ausgewählter Prozess 24552.
[12:11:33 INF] Abhören von Ereignispipe-Ereignissen für tyetest_9dd91ae4-f auf Prozess-ID 24552
```

Folgen Sie den oben genannten Tipps, um das Tye-Dashboard zu <http://127.0.0.1:8000> , das erfolgreich auf dem Computer gestartet wurde.Öffnen Sie das Dashboard mithilfe Ihres Browsers, um eine Liste der bereitgestellten Apps anzuzeigen.Wie in der Abbildung below：

![tye-Dashboard](/images/20210131-001.png)

Das Dashboard zeigt an, dass der Tester gestartet wurde und an <http://localhost:14099> und <https://localhost:14100>gebunden ist.In der Praxis werden bei Selbsttests die beiden Ports nach dem Zufallsprinzip ausgewählt, sodass es Unterschiede geben wird.

Wenn Wir Swagger mit den oben verfügbar gemachten https-Bindungen öffnen, können wir den gleichen Effekt wie`dotnet-Lauf`previously：<https://localhost:14100/swagger>

## Bereitstellen eines k8s lokal

Als Nächstes verwenden wir Tye, um die App auf k8s bereitzustellen.Um diesen Effekt zu erzielen, müssen Sie also zuerst einen k8s vorbereiten.

Es gibt eine Vielzahl von Möglichkeiten, k8s auf einem Entwicklungscomputer bereitzustellen, und dieses Experiment verwendet ein Docker Desktop plus k8s-Szenario, entweder wegen etwas anderem oder weil es mehr oder weniger Probleme mit der Verwendung anderer Szenarien gibt.Bestimmte Entwickler können wählen.

Das k8s-Szenario von Docker Desktop ist in den folgenden Links gut behandelt und wird Entwicklern empfohlen, sich auf：

Docker Desktop startet Kubernetes<https://www.cnblogs.com/weschen/p/12658839.html>

Zusätzlich zu den k8s auf dem Gen, erfordert dieses Labor auch die Installation von nginx Ingress und Helm, die auch unter Bezugnahme auf den obigen Artikel installiert werden können.

## Bereitstellen der App auf k8s

Aber wenn k8s konfiguriert ist, können wir tye verwenden, um die App schnell in k8s zur Anzeige zu veröffentlichen.

### Anmelden bei docker registry

Zuerst müssen Sie die Docker-Registrierung für den lokalen Docker konfigurieren.Da das Docker-Image des Projekts während der Veröffentlichung mit tye in eine Docker-Registrierung übertragen wird.

Entwickler können aus einer Vielzahl von Möglichkeiten wählen, um ihre eigene Docker-Registrierung：

- Nexus OSS-Repository
- Alibaba Cloud, Tencent Cloud, DaoCloud und mehr haben alle kostenlose Docker-Registrierung
- Docker Hub, wenn das Netzwerk gut ist

Verwenden Sie`Docker-Anmeldung`, um sich bei Ihrer Docker-Registrierung anzumelden.

### tye init schafft tye.yml

Führen Sie im Lösungskatalog den folgenden Befehl aus, um ein tye.yml-Profil zu erstellen:

```bash
tye init
```

Nach der Ausführung werden die folgenden Dateien in der Lösung：

```yml
Name: tyetest
Services:
  - Name: tyetest
    Projekt: TyeTest/TyeTest.csproj
```

Dies ist die einfachste tye.yml-Datei.

### ändern tye.yml

Wir fügen eine Reihe von Konfigurationen über docker registry in tye.yml hinzu, um anzugeben, wo das integrierte Image：

```yml
Name: tyetest
Registry: registry.cn-hangzhou.aliyuncs.com/newbe36524
Services:
  - Name: tyetest
    Projekt: TyeTest/TyeTest.csproj
```

Hier verwendet der Autor beispielsweise die Docker-Registrierung des Hangzhou-Knotens von Alibaba Cloud, der Namespace ist newbe36524.Fügen Sie also eine line`-Registrierung hinzu: registry.cn-hangzhou.aliyuncs.com/newbe36524`.

Dies entspricht, wenn es erstellt wird, einem Tag-Bild von`registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0`und in die Alibaba Cloud geschoben wird.

### Laden Sie das Netcore-Basisbild vorab herunter

Da wir dieses Mal ein Netcore-Programm veröffentlichen, werden sie mit Netcore-Images erstellt, daher wird für einen reibungsloseren Build empfohlen, dass Sie das Beschleunigungstool verwenden, um das zugrunde liegende Bild lokal im Voraus herunterzuladen.

例如，笔者在此次的使用中使用的 net5 TFM 的应用程序，因此，就需要在本地先拉好 mcr.microsoft.com/dotnet/aspnet:5.0 作为基础镜像。

Da die Quelle des zugrunde liegenden Netcore-Spiegels nun von docker hub nach mcr.microsoft.com migriert wurde.故而，建议使用 Newbe.McrMirror 进行加速下载。

Detaillierte Verwendungsmethoden können auf：<https://github.com/newbe36524/Newbe.McrMirror>

Wenn der Entwickler nicht weiß, was das zugrunde liegende Image ist, das er derzeit abrufen muss, kann er auch den folgenden Schritt versuchen, direkt zu veröffentlichen, den zugrunde liegenden Bildinhalt anzuzeigen, der im Prozess verwendet wird, und dann zu ziehen.

### Verwenden von tye-Bereitstellung

Nachdem nun alles fertig ist, können Sie veröffentlichen, indem Sie die folgenden Befehle im Lösungskatalog fortsetzen:

```bash
tye deploy
```

Sie können die folgenden Ergebnisse erhalten:

```bash
PS C:\Repos\TyeTest> tye deploy
Loading Application Details...
Verifying kubectl installation...
Verifying kubectl connection to cluster...
Processing Service 'tyetest'...
    Anwenden von Containerstandards...
    Compiling Services...

    Publishing Docker Bild...
            #1 [internal] Builddefinition aus Dockerfile
            #1 sha256:a3872c76e0ccfd4bade43ecac3349907e0d10092c3ca8c61f1d360689bad7e2
            #1 Übertragen dockerfile: 144B getan
            #1 DONE 0.0s

            #2 [internal] laden .dockerignore
            #2 sha256:9e3b70115b86134ab4be5a3ce629a55cd6060936130c89 b906677d1958215910
            #2 Übertragungskontext: 2B
            #2 DONE 0.0s

            #3 [internal] Lademetadaten für mcr.microsoft.com/dotnet/aspnet:5.0
            #3 sha256:3b35130338ebb888f84 ec0aa58f64d182f10a676a625072200f5903996d93690
            #3 DONE 0.0s

            #7 [1/3] VON mcr.microsoft.com/dotnet/aspnet:5.0
            #7 sha256:31acc33a1535ed7869167d21032ed94a0e9b41bbf02055dc5f04524507860176
            #7 DONE 0.0s

            #5 [internal] Load Build Context
            #5 sha256:2a 74f859befdf852c0e7cf66b6b7e71ec4ddeedd37d3bb6e4840dd441d712a20
            #5 Übertragungskontext: 3.87MB 0.0s
            #5 DONE 0.1s

            #4 [2/3] WO RKDIR /app
            #4 sha256:56abde746b4f39a24525b2b730b2dfb6d9688bcf704d367c86a4753aefff33f6
            #4 CACHED

            #6 [3/3] COPY . /app
            #6 sha256:4a3b76a4eea70c858830bad519b2d8faf5b6969a820b7e38994c2116d3bacab2
            #6 DONE 0.0s

            #8 exportieren zu bild
            #8 sha256:e8c613e07b0b7 ff33893b694f7759a10d42e180f2b4dc349fb57dc6b71dcab00
            #8 Exportieren von Layern 0,0s
            #8 Schreiben des Bildes sha256:8867f4e2ed6ccddb509e9c39e86c736188a7 8f348d6487d6d2e7a1b5919c1fdb
            #8 schreiben bild sha256:8867f4e2ed6ccddb509e9c39e86 c736188a78f348d6487d6d2e7a1b5919c1fdb hat
            #8 Benennung getan registry.cn-hangzhou.aliyuncs.com/newbe36524/tyetest:1.0.0
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
        Die Ausgabe wird in 'C:'Users'Administrator'AppData'Local\Temp\tmp2BC2.tmp' geschrieben.
        bereitgestellte Anwendung 'tyetest'.
Zeit Verstrichen: 00:00:12:99
```

Aus dem Protokoll der Ausgabe können wir sehen, dass die App erfolgreich veröffentlicht wurde.Und mit k8s Dashboard oder k9s können wir alle sehen, dass die App erfolgreich bereitgestellt und gestartet wurde.

```bash
tyetest-674865dcc4-mxkd5
```

Es ist erwähnenswert, dass es mehrere Voraussetzungen dafür gibt, dass dieser Schritt：

- Sie müssen sicherstellen, dass Ihr lokales kubectl richtig konfiguriert ist.Wenn Sie Docker Desktop verwenden, ist er im Allgemeinen bereits konfiguriert.
- Sie müssen sicherstellen, dass die Docker-Anmeldung erfolgreich war.Entwickler können testen, ob die folgenden Bilder manuell übertragen werden können, bevor sie die Bereitstellung ausführen.
- Wenn die Download-Geschwindigkeit des MCR-Images nicht ideal ist, denken Sie daran, es mit Newbe.McRMirror zu beschleunigen

## Erstellen und Verwenden von Ingress

Zu diesem Zeitpunkt haben wir die Veröffentlichung der App abgeschlossen.Da nginx ingress jedoch nicht konfiguriert ist, kann der Dienst bereits innerhalb von k8s ausgeführt werden, aber nicht extern aufgerufen werden.Das heißt, die Verwendung eines Browsers auf Ihrem Computer ist immer noch nicht geöffnet.Daher müssen wir auch den Eintritt für den Dienst konfigurieren.Freunde, die ingress für k8s nicht installiert haben, wird empfohlen, die vorherigen Abschnitte über die Installation von k8s zu überprüfen.

Hier aktivieren wir tye.yml, um ingressbezogene Konfigurationen hinzuzufügen：

```yml
Name: tyetest
Registry: registry.cn-hangzhou.aliyuncs.com/newbe36524
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
        service: www.yueluo.pro  service: www.yueluo.pro
```

Wir haben eine Eingangskonfiguration hinzugefügt, sodass, wenn der Datenverkehr vom Eingehen hereinkommt und der Domänenname`www.yueluo.pro`ist, er an den tyetest-Dienst weitergeleitet wird.Dies ermöglicht den externen Zugriff auf die internen dienste k8s.

Verwenden Sie zunächst`tye-Ausführung` Befehl, um den Effekt lokal zu sehen.Nachdem Sie den Befehl ausgeführt haben, wird möglicherweise Folgendes im dashboard：

![tye-Dashboard2](/images/20210131-002.png)

Wo https://localhost:8310 die Eingangsadresse des Eingangs ist.Da wir die Domänennamenbindung verwenden, gibt es zwei Möglichkeiten, darauf zuzugreifen, um die：

- Hinzufügen einer Zuordnungsbeziehung www.yueluo.pro> 127.0.0.1 in Hosts
- Verwenden Sie http, um direkten Zugriff auf die Datei anzufordern.

Hier verwenden wir die http-Anforderungsdatei, um auf die：

```http
GET https://localhost:8310/WeatherForecast
Host: www.yueluo.pro
```

Auf diese Weise validieren wir erfolgreich die Ergebnisse der Bindung.

Beachten Sie, dass die darin eingebauten Ports nicht als feste Ports konfiguriert sind, daher sollte der Entwickler jedes Mal auf die auftretenden Änderungen achten.

## Bereitstellen von Ingress auf k8s

Beenden Sie als Nächstes`tye-Ausführung`, führen Sie`tye-Bereitstellung`aus und veröffentlichen Sie Eingehen de in k8s.

Beachten Sie, dass die Bereitstellung von Ingress zig Sekunden dauern kann, sodass Sie warten müssen.

Sobald die Bereitstellung abgeschlossen ist, können Sie die Ergebnisse der Bereitstellung über k8s-Dashboards oder k9s anzeigen.

Außerdem können Sie die folgende http-Anforderung verwenden, um die Ergebnisse Ihrer deployment：

```http
GET https://localhost/WeatherForecast
Host: www.yueluo.pro
```

Das Ergebnis ist das gleiche wie vorher.

## Deinstallieren Sie die App von k8s

Deinstallieren Sie die App,`einfache, binden unbereitstellennde`.

```bash
PS C:\Repos\TyeTest> tye undeploy
Loading Application Details...
Found 3 resource(s).
Löschen 'Service' 'tyetest' ...
Löschen 'Deployment' 'tyetest' ...
Löschen 'Ingress' 'tyetest-ingress' ...
Zeit Verstrichen: 00:00:02:87
```

## Zusammenfassung

In diesem Artikel haben wir kurz die einfachen Schritte zum Ausführen oder Bereitstellen einer App mit tye beschrieben.Es gibt viele Optionen, die in der Praxis erweitert und angepasst werden können.Interessierte Freunde können sich auf den Inhalt https://github.com/dotnet/tye.

Als Nächstes stellen wir einige etwas komplexere Multi-Instance-Anwendungen bereit.

<!-- md Footer-Newbe-Claptrap.md -->
