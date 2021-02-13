---
date: 2020-06-18
title: Wie viel Speicher benötigen Sie für 100.000 gleichzeitige Online-Nutzer? - Newbe.Claptrap Framework Horizontal Extension Experiment
---

Das Projekt Newbe.Claptrap ist ein serviceseitiges Entwicklungsframework, das der Autor auf der theoretischen Grundlage`reaktiven`,`Akteurmodus`und`Ereignisrückverfolgbarkeit`.In diesem Artikel werden wir uns mit der Fähigkeit des Frameworks befassen, horizontal zu skalieren.

<!-- more -->

## Ein früherer Informations-Synthesizer

Nach langer Zeit treffen wir uns heute wieder.Zunächst möchte ich die vergangenheits project：

[Für Erstleser dieses Frameworks können Sie hier die Grundtheorie und ihre Funktionsweise lesen.](001-Overview-Of-Newbe-Claptrap)

Kürzlich haben wir auch einige Aufwärmartikel und Tools geschrieben, Leser können mehr über die：

- [Sprechen Sie über die Anwendung der reaktiven Programmierung auf der Service-Seite, Datenbank-Betriebsoptimierung, von 20 Sekunden bis 0,5 Sekunden](008-Reactive-In-Server-1)
- [Newbe.Claptrap Project Weekly 1 - Noch keine Räder, zuerst mit Rädern laufen](006-Newbe-Claptrap-Weekly-1)

## Das heutige Thema

Lassen Sie uns heute eine Laborvorschau erstellen, um das Newbe.Claptrap-Framework zu validieren und wie Sie sich an die wachsende Anzahl von Onlinebenutzern in Form von horizontalen Erweiterungen anpassen können.

## Beschreibung der Geschäftsanforderungen

Sehen wir uns zunächst das Geschäftsszenario an, das implementiert werden soll today：

- Der Benutzer meldet sich über die API an und generiert ein JWT-Token
- Die Gültigkeit des JWT-Tokens wird überprüft, wenn der Benutzer die API aufruft.
- DIE JWT-Tokenausgabe wird nicht mit dem regulären öffentlichen und privaten JWS-Schlüssel ausgeführt, sondern für jeden Benutzer mit geheimem Schlüssel separat gehasht
- Überprüfen Sie, wie viel Arbeitsspeicher verschiedene Onlinebenutzer verbrauchen müssen
- Es darf nicht mehr als 200 ms dauern, bis sich der Benutzer am Buildtoken anmeldet.
- Die Validierungszeit von Tokn darf 10 ms nicht überschreiten

### Bragging trifft zuerst den Entwurf

Der Autor hat daher nicht nach der "Anzahl der Online-Nutzer" gesucht, die direkt mit der theoretischen Definition in Verbindung stehen, um Unterschiede in Ihrem Verständnis zu vermeiden.Der Autor weist nach eigenem Verständnis zunächst darauf hin,：Anzahl der Online-Nutzer am Ende bedeutet, welche technischen Anforderungen?

#### Nicht-Online-Nutzer, die online sind, sollten nicht von der Anzahl der Benutzer betroffen sein, die bereits online sind

Wenn sich ein Benutzer anmeldet, dauert es 100 ms.Ob die Zahl der Nutzer heute online ist zehn oder eine Million.Diese Anmeldung dauert nicht wesentlich länger als 100 ms.

Natürlich wird begrenzte physische Hardware sicher verlangsamen oder sogar neue Benutzer einfacher oder sogar falsch anmelden, wenn die Anzahl der Online-Benutzer einen Schwellenwert überschreitet, z. B. zwei Millionen.

Durch die Erhöhung der physischen Maschine kann dieser Schwellenwert jedoch erhöht werden, und wir können das horizontale Erweiterungsdesign als erfolgreich betrachten.

#### Für jeden Online-Benutzer sollte das Systemleistungsfeedback

Beispielsweise müssen Benutzer, die bereits online sind, 100 ms verbrauchen, um ihre Bestelldetails abzufragen.Dann sollte der durchschnittliche Verbrauch von Auftragsabfragen von einem Benutzer stabil bei 100 ms sein.

Natürlich müssen Sie hochkonzentrierte Leistungsprobleme wie das Snap-up ausschließen.Die Hauptdiskussion hier ist die tägliche stetige Erhöhung der Kapazität.(Wir sprechen später separat über "Schnappen")

Der konkrete Punkt kann auf diese Weise verstanden werden.Angenommen, wir machen ein Cloud-Notizprodukt.

Wenn also das Hinzufügen physischer Computer die Anzahl der Benutzer erhöht, die Cloud-Notizprodukte gleichzeitig verwenden, ohne die Leistungserfahrung eines Benutzers zu beeinträchtigen, denken wir, dass horizontales Skalierungsdesign ein Erfolg ist.

Wenn der Benutzer in diesem Experiment bereits angemeldet ist, beträgt die Zeit, um die Gültigkeit des JWT zu überprüfen, ca. 0,5 ms.

## Rufen Sie die Timing-Beziehung auf

![Zeitdiagramm](/images/20200621-001.png)

Kurze description：

1. Client-Anmeldeanforderungen werden Layer für Layer an UserGrain übermittelt
2. UserGrain aktiviert intern eine Claptrap, um die Statusdaten in UserGrain zu verwalten.Enthält Benutzername, Kennwort und Geheimnis für JWT-Signatur.
3. Nachfolgende Build-JWT-Builds und Validierungen verwenden die Daten direkt in UserGrain.Da die Daten in UserGrain für einen bestimmten Zeitraum im Speicher "zwischengespeichert" werden.Der folgende JWT-Build und die anschließende Validierung werden also sehr schnell sein.Die gemessene Menge beträgt ca. 0,5 ms.

## Physikalisches Strukturdesign

![Physikalisches Strukturdesign](/images/20200618-001.png)

Wie in der abbildung oben dargestellt, ist dies die physikalische Komponente der test：

| Namen                | Beschreibung                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| WebAPI               | Stellen Sie die WebAPI-Schnittstelle für die Außenseite bereit.Stellt eine Schnittstelle zum Anmelden und Überprüfen von Token bereit.       |
| Orleans Cluster      | Der Kernprozess des Hostings von Grain.                                                                                                      |
| Orleans Gateway      | Der Orleans Cluster ist im Wesentlichen derselbe, aber die WebAPI kann nur mit Gateway kommunizieren                                         |
| Orleans Dashboard    | Das Orleans Gateway ist im Grunde das gleiche, aber eine Dashboard-Präsentation wurde hinzugefügt, um den gesamten Orleans-Cluster zu sehen. |
| Konsul               | Cluster-Erkennung und -Wartung für Orleans-Cluster                                                                                           |
| Claptrap DB          | Wird zum Halten von Ereignis- und Statusdaten für das Newbe.Claptrap-Framework verwendet                                                     |
| Zufluss DB & Grafana | Wird verwendet, um Leistungsmetrikendaten im Zusammenhang mit Newbe.Claptrap zu überwachen                                                   |

Die Anzahl der Orleans-Clusterknoten in diesem Experiment ist tatsächlich die Gesamtzahl von Cluster plus Gateway plus Dashboard.Die oben genannten Divisionen unterscheiden sich tatsächlich durch Unterschiede in den Funktionseinstellungen.

Die physischen Knoten, die die Horizontal Extension-Funktion testen, sind in erster Linie The Orleans Cluster und The Orleans Gateway.Die Speichernutzung für die folgenden Bedingungen wird separat getestet.

| Orleans Dashboard | Orleans Gateway | Orleans Cluster |
| ----------------- | --------------- | --------------- |
| 1                 | 0               | 0               |
| 1                 | 1               | 1               |
| 1                 | 3               | 5               |

In diesem Experiment werden Bereitstellungstests von Windows Docker Desktop in Verbindung mit WSL 2 verwendet.

Die oben genannten physikalischen Strukturen sind tatsächlich nach den komplexesten Umständen des Experiments gestaltet.Wenn das Geschäftsszenario einfach genug ist, kann die physische Struktur abgeschnitten werden.Weitere Informationen finden Sie in den folgenden FAQ.

## Die tatsächlichen Testdaten

Im Folgenden werden verschiedene Clustergrößen und Benutzernummern getestet.

### 0 Gateway 0 Cluster

Wenn Sie den Dashboard-Knoten zum ersten Mal starten, können Sie mit Portainer standardmäßig sehen, dass der Container etwa 200 MB Arbeitsspeicher verbraucht, wie im：

![Der anfängliche Speicherbedarf](/images/20200621-002.png)

Die Testkonsole stellt 30.000 Anforderungen an die WebAPI.Jeder Stapel von 100 Anforderungen wird in Batches gesendet.

Schauen Sie sich nach etwa zwei Minuten erneut den Speicher an, etwa 9,2 GB, wie im：

![30.000 Benutzer](/images/20200621-003.png)

Daher schätzen wir einfach die Speichermenge, die jeder Online-Nutzer verbrauchen muss, ungefähr (9,2 x 1024-200)/30000 x 0,3 MB.

Darüber hinaus können Sie einige sekundäre data：

CPU-Auslastung

![CPU-Auslastung](/images/20200621-004.png)

Netzwerkdurchsatz

![Netzwerkdurchsatz](/images/20200621-005.png)

Orleans Dashboard.Die 30.000 in TOTAL ACTIVATIONS in der oberen linken Ecke stellen die Anzahl der UserGrains dar, die sich derzeit im Speicher befinden, und die anderen drei sind Körner, die vom Dashboard verwendet werden.

![Orleans Dashboard](/images/20200621-006.png)

Die durchschnittliche Bearbeitungszeit für Ereignisse, die Newbe.Claptrap in Grafana anzeigen, beträgt ca. 100-600 ms.Dieser Test ist in erster Linie eine Speicherbedingung mit einer Verarbeitungszeit von 30s, so dass die Stichprobengröße klein ist.Wir werden es in einem späteren Artikel über die Verarbeitungszeit genauer testen.

![Die durchschnittliche Bearbeitungszeit](/images/20200621-007.png)

Die durchschnittliche Zeit, die benötigt wird, um Ereignisse in Grafana zu speichern, um Newbe.Claptrap zu sehen, beträgt etwa 50-200 ms.Die Dauer des Speicherns eines Ereignisses ist ein wichtiger Teil der Ereignisverarbeitung.

![30.000 Benutzer](/images/20200621-009.png)

Die Gesamtzahl der Ereignisse, die in Grafana behandelt wurden, um Newbe.Claptrap anzuzeigen.Man wird 30.000 Mal eingeloggt, also ist die Gesamtzahl der Ereignisse 30.000.

![Die Gesamtanzahl der behandelten Ereignisse](/images/20200621-008.png)

### 1 Gateway 1 Cluster

Als Nächstes testen wir zwei zusätzliche Knoten.

Auch hier ist die Anzahl der Orleans-Clusterknoten die Gesamtzahl der Cluster plus Gateway plus Dashboard.Daher beträgt die Anzahl der Knoten im Test im Vergleich zum letzten Test 3.

Die getestete Speichernutzung ist so follows：

| Die Anzahl der Benutzer | Der durchschnittliche Speicher des Knotens | Gesamtspeicherverbrauch |
| ----------------------- | ------------------------------------------ | ----------------------- |
| 10000                   | 1,8 GB                                     | 1,8 x *3 = 5,4 GB       |
| 20000                   | 3,3 GB                                     | 3,3 x *3 = 9,9 GB       |
| 30000                   | 4,9 GB                                     | 4,9 x 3 = 14,7 GB       |

Bei 30.000 Benutzern verbraucht der durchschnittliche Benutzer also etwa (14,7 x 1024-200 x 3)/30000 x 0,48 MB

Warum ist die Anzahl der Knoten gestiegen und der durchschnittliche Speicherverbrauch gestiegen?Der Autor spekuliert, dass es keine Validierung：Knoten erhöht haben, und dass die Kommunikation zwischen Knoten tatsächlich zusätzlichen Speicher erfordert, so dass es im Durchschnitt zunimmt.

### 3 Gateway 5 Cluster

Fügen wir knotenweiter hinzu.Die Zusammenfassungspunkte sind 1 (Dashboard) und 3 (Cluster) und 5 (Gateway) und 9 Knoten

Die getestete Speichernutzung ist so follows：

| Die Anzahl der Benutzer | Der durchschnittliche Speicher des Knotens | Gesamtspeicherverbrauch |
| ----------------------- | ------------------------------------------ | ----------------------- |
| 20000                   | 1,6 GB                                     | 1,6 x *9 = 14,4 GB      |
| 30000                   | 2 GB                                       | 2 x 9 = 18 GB           |

Bei 30.000 Benutzern verbraucht der durchschnittliche Benutzer also etwa (18 x 1024-200 x 9)/30000 x 0,55 MB

### Wie viel Speicher benötigen 100.000 Benutzer?

Alle oben genannten Tests sind in der Anzahl von 30.000 Benutzern, was eine spezielle Zahl ist.Da die Anzahl der Benutzer weiter zunimmt, überschreitet der Speicher die Speicherbalance des Testers.(Bitte sponsern Sie zwei 16G)

Wenn Sie die Anzahl der Benutzer weiter erhöhen, verwenden Sie den virtuellen Speicher des Betriebssystems.Obwohl es ausgeführt werden kann, ist es weniger effizient.Der ursprüngliche Login benötigt möglicherweise nur 100 ms.Benutzer, die virtuellen Speicher verwenden, benötigen 2 s.

Daher ist es bei langsameren Geschwindigkeiten möglicherweise wenig sinnvoll, zu überprüfen, wie viel Speicher benötigt wird.

Dies bedeutet jedoch nicht, dass Sie sich nicht mehr anmelden können, wie dies bei 1-plus1 der Fall ist, wenn alle 100.000 Benutzer angemeldet sind.(Es gibt 100.000 Benutzer online zur gleichen Zeit, fügen Sie etwas Speicher, nicht schlechtes Geld.))

![100.000 Benutzer](/images/20200621-010.png)

## Quellbuildanweisungen

Der Code für diesen Test finden Sie in der Beispielcodebasis am Ende des Artikels.Um den Lesern das eigene Experimentieren zu erleichtern, wird docker-compose hauptsächlich für den Aufbau und die Bereitstellung verwendet.

Die einzige Umgebungsanforderung für einen Tester besteht also darin, Docker Desktop korrekt zu installieren.

Sie können den neuesten Beispielcode aus einem der folgenden addresses：

- <https://github.com/newbe36524/Newbe.Claptrap.Examples>
- <https://gitee.com/yks/Newbe.Claptrap.Examples>

### Schnell loslegen

Verwenden Sie die Konsole `Ordner src/Newbe.Claptrap.Auth/LocalCluster` .Sie können alle Komponenten lokal starten, indem Sie die folgenden commands：

```
docker-compose up -d
```

Sie müssen einige öffentliche Images, die auf Dockerhub gehostet werden, auf dem Weg ziehen und sicherstellen, dass die Beschleuniger lokal korrekt konfiguriert sind, damit Sie schnell erstellen können.[können durch Lesen dieses document](https://www.runoob.com/docker/docker-mirror-acceleration.html)

Nach einem erfolgreichen Start können`Komponenten über die docker ps-Website` werden.

```bash
PS>docker ps
CONTAINER ID        IMAGE                                                                            COMMAND                  CREATED             STATUS              PORTS                                                                                                                              NAMES
66470e5393e2        registry.cn-hangzhou.aliyuncs.com/newbe36524/newbe-claptrap-auth-webapi          "dotnet Newbe.Claptr…"   4 hours ago         Up About an hour    0.0.0.0:10080->80/tcp                                                                                                              localcluster_webapi_1
3bbaf5538ab9        registry.cn-hangzhou.aliyuncs.com/newbe36524/newbe-claptrap-auth-backendserver   "dotnet Newbe.Claptr…"   4 hours ago         Up About an hour    80/tcp, 443/tcp, 0.0.0.0:19000->9000/tcp, 0.0.0.0:32785->11111/tcp, 0.0.0.0:32784->30000/tcp                                       localcluster_dashboard_1
3f60f51e4641        registry.cn-hangzhou.aliyuncs.com/newbe36524/newbe-claptrap-auth-backendserver   "dotnet Newbe.Claptr…"   4 hours ago         Up About an hour    80/tcp, 443/tcp, 9000/tcp, 0.0.0.0:32787->11111/tcp, 0.0.0.0:32786->30000/tcp                                                      localcluster_cluster_gateway_1
7d516ada2b26        registry.cn-hangzhou.aliyuncs.com/newbe36524/newbe-claptrap-auth-backendserver   "dotnet Newbe.Claptr…"   4 hours ago         Up About an hour    80/tcp, 443/tcp, 9000/tcp, 30000/tcp, 0.0.0.0:32788->11111/tcp                                                                     localcluster_cluster_core_1
fc89fcd973f9        grafana/grafana                                                                  "/run.sh"                4 hours ago         Up 6 seconds        0.0.0.0:23000->3000/tcp                                                                                                            localcluster_grafana_1
1f10ed0eb25f        postgres                                                                         "docker-entrypoint.s…"   4 hours ago         Up About an hour    0.0.0.0:32772->5432/tcp                                                                                                            localcluster_claptrap_db_1
d5d2bec74311        adminer                                                                          "entrypoint.sh docke…"   4 hours ago         Up About an hour    0.0.0.0:58080->8080/tcp                                                                                                            localcluster_adminer_1
4c4be69f2f41        bitnami/consul                                                                   "/opt/bitnami/script…"   4 hours ago         Up About an hour    8300-8301/tcp, 8500/tcp, 8301/udp, 8600/tcp, 8600/udp                                                                              localcluster_consulnode3_1
88811d3aa0d2        influxdb                                                                         "/entrypoint.sh infl…"   4 hours ago         Up 6 seconds        0.0.0.0:29086->8086/tcp                                                                                                            localcluster_influxdb_1
d31c73b62a47        bitnami/consul                                                                   "/opt/bitnami/script…"   4 hours ago         Up About an hour    8300-8301/tcp, 8500/tcp, 8301/udp, 8600/tcp, 8600/udp                                                                              localcluster_consulnode2_1
72d4273eba2c        bitnami/consul                                                                   "/opt/bitnami/script…"   4 hours ago         Up About an hour    0.0.0.0:8300-8301->8300-8301/tcp, 0.0.0.0:8500->8500/tcp, 0.0.0.0:8301->8301/udp, 0.0.0.0:8600->8600/tcp, 0.0.0.0:8600->8600/udp   localcluster_consulnode1_1
```

Sobald der Start abgeschlossen ist, können Sie die entsprechende Schnittstelle über die untenstehenden Links anzeigen

| Adresse                  | Beschreibung                                                                          |
| ------------------------ | ------------------------------------------------------------------------------------- |
| <http://localhost:19000> | Das Orleans Dashboard zeigt den Status von Knoten im Orleans-Cluster an               |
| <http://localhost:10080> | Web-API-Basisadresse, diesmal mit der getesteten API-Basisadresse                     |
| <http://localhost:23000> | Grafana-Adresse zum Anzeigen von Leistungsmetriken im Zusammenhang mit Newbe.Claptrap |

### Quellbuild

Verwenden Sie die Konsole `Ordner src/Newbe.Claptrap.Auth` .Durch Ausführen der folgenden Befehle können Sie den Code locally：

```bash
./LocalCluster/pullimage.cmd
Docker-Compose-Build
```

Nachdem Sie auf den Abschluss des Builds gewartet haben, wird das entsprechende Bild lokal generiert.Als Nächstes können Sie versuchen, die App lokal für die erste time：

Verwenden Sie die Konsole `Ordner src/Newbe.Claptrap.Auth/LocalCluster` .Sie können den Container starten, indem Sie den folgenden Befehl ausführen:

```bash
docker-compose up -d
```

## Häufig gestellte Fragen

### Warum werden die Code- und Konfigurationsdetails im Artikel nicht beschrieben?

Dieser Artikel soll dem Leser die experimentelle Durchführbarkeit dieses Szenarios zeigen und zeigen, wie code mit dem Newbe.Claptrap-Framework geschrieben wird, was nicht die Hauptrichtung dieses Artikels ist und daher nicht erwähnt wird.

Der andere Punkt ist natürlich, dass der Rahmen nicht fertig ist, sich wahrscheinlich alles ändert, und die Details des Codes sind von geringer Bedeutung.

Es kann jedoch im Voraus erklärt werden, dass：Schreiben sehr einfach ist, da die geschäftlichen Anforderungen dieses Beispiels sehr einfach sind, so dass der Codeinhalt nicht viel ist.Alle finden Sie im Beispiel-Repository.

### Storage Token mit Redis kann auch die oben genannten Anforderungen implementieren, warum dieses Framework wählen?

Gegenwärtig hat der Autor keinen grundigen Grund, den Leser davon zu überzeugen, welches Schema verwendet werden muss, hier nur, um ein machbares Schema zu bieten, was das eigentliche Schema wählen sollte, sollte der Leser schließlich darüber nachdenken, ob das Werkzeug oder zu versuchen, zu wissen.

### Wenn es bis zu 100 Online-Benutzer sind, wie kann ich das System zuschneiden?

Die einzigen komponentenpflichtigten Komponenten sind Orleans Dashboard, WebAPI und Claptrap Db.Alle anderen Komponenten sind nicht wesentlich.Und wenn Sie den Code ändern, können Orleans Dashboard und WebAPI zusammengeführt werden.

Der kleinste ist also ein Prozess plus eine Datenbank.

### Warum hat Grafana keinen Bericht?

Grafana muss DataSource manuell erstellen und Dashboard nach dem ersten Start importieren.

Die Parameter, die mit diesem Experiment zusammenhängen, sind wie follows：

Datasource

- URL： http://influxdb:8086
- Datenbank-： -Metricsdatabase
- User： Claptrap
- Passwort： Klatsche

[Klicken Sie hier für die Dashboard-Definitionsdatei](https://github.com/newbe36524/Newbe.Claptrap/blob/develop/src/Docker/Monitor/grafana/claptrap.json)

### Wie ist die physische Konfiguration des Testers?

Es gibt keinen dedizierten freien Speicher und 16 GB Speicher wurden verwendet, bevor der Test begann.Im Folgenden finden Sie die Zahlendaten der Testmaschine (Fremdmüll, ca. 3500 Yuan)：

Prozessor Intel Xeon (Xeon) E5-2678 v3 s 2,50 GHz 12 Kern 24 Threads Motherboard HUANANZHI X99-AD3 GAMING (Wellsburg) Grafik Nvidia GeForce GTX 750 Ti Ti ( 2 GB / Nvidia ) 32 GB Speicher ( Samsung DDR3L 1600MHz ) 2013 Senior Speicher Hauptfestplatte Kingston SA400S37240G ( 240 GB / SSD )

Wenn Sie eine bessere physische Konfiguration haben, glaube ich, dass Sie bessere Daten erhalten können.

### Selbst 0,3 MB pro Benutzer sind zu hoch

Das Framework wird noch optimiert.Die Zukunft wird besser sein.

<!-- md Footer-Newbe-Claptrap.md -->
