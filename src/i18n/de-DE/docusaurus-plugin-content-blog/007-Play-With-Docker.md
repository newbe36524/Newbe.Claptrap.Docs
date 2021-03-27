---
date: 2020-08-16
title: Junge Witwer yo, fallen Sie diese kostenlose 8-Core 4G öffentlichen Netzwerk-Server, oder ist diese gebrauchsfertige Docker experimentelle Plattform?
---

Kinder treffen Entscheidungen, Erwachsene alle wollen.Werfen wir also einen Blick darauf, wie Sie einen kostenlosen 8-Core 4G Docker experimentellen Plattform-Server erhalten.

<!-- more -->

## Spielen Sie mit Docker

Öffnen Sie die<https://labs.play-with-docker.com/>, um auf die Play With Docker-Plattform zuzugreifen. Registrieren Sie sich für ein DockerHub-Konto, und Sie können auf diese Website zugreifen und ganz einfach einen öffentlichen 4G-Netzwerkserver mit 8 Kernen erhalten. Werfen wir einen Blick auf die Verwendung dieses Servers für einige Docker-Vorgänge.

## Nginx bereitstellen

In diesem Beispiel stellen wir einen nginx bereit und machen den Dienst für eine öffentliche Netzwerkadresse verfügbar.

### Anmelden und Erstellen einer Instanz

Dieser Schritt ist sehr einfach, mit wenig Erklärung, und sobald die erfolgreiche Erstellung abgeschlossen ist, können Sie die Schnittstelle unten sehen.

![Die Schnittstelle](/images/20200816-001.png)

### Ziehen Sie den Spiegel

Wenn Sie den folgenden Befehl ausführen, können Sie das neueste nginx-Bild abrufen.

```bash
docker pull nginx
```

Pull ist sehr schnell, da dieser Instance-Knoten im Ausland bereitgestellt wird, sodass Sie ihn sehr schnell herunterladen können, ohne einen Spiegel einzurichten.

### Starten Sie den nginx-Container

Durch Ausführen des folgenden Befehls können Sie einen nginx-Container starten.

```bash
docker run --name nginx-test -p 8080:80 -d nginx
```

### Öffentlicher Zugang

Sobald die Bereitstellung abgeschlossen ist, wird automatisch eine neue Schaltfläche auf der Schnittstelle angezeigt, um anzuzeigen, dass die öffentliche Netzwerkadresse jetzt erfolgreich bereitgestellt werden kann, wie im：

![Die Schaltfläche für den öffentlichen Zugriff](/images/20200816-002.png)

Auf knopfdrucke Schaltfläche können Sie auf den nginx-Dienst in Ihrem Browser zugreifen, den Sie gerade erfolgreich bereitgestellt haben.

Wenn Sie eine Schaltfläche generieren, können Sie auch auf "OPEN PORT" klicken, um einen offenen Port auszuwählen.

## Bereitstellen eines Zugticketsystems

Nur die Bereitstellung eines einfachen nginx macht offensichtlich nicht genug Spaß.Ich werde also ein etwas komplexeres System bereitstellen.

Dies ist ein Demonstrationssystem, das aus sieben Containern besteht, unter Bezugnahme auf die Anweisungen von[Train TicketIng System - Deployment](https://claptrap.newbe.pro/zh_Hans/3-Sample/1-Newbe-Claptrap-Ticketing/3-Deployment), und mit dem folgenden Befehl, um eine simulierte Zugticketing-system：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-compose build
cd Docker/LocalClusterMongodb
docker-compose up -d
```

Sobald das Skript ausgeführt wird, öffnen Sie Port 10080 über OPEN PORT, um das gerade bereitgestellte Ticketsystem für die Zugticketsimulation anzuzeigen. ![Simulierte Ticketing-Systemschnittstelle](/images/20200816-003.png)

<!-- md Footer-Newbe-Claptrap.md -->
