---
title: 'Einsatz.'
metaTitle: 'Zugticketsystem - Bereitstellung.'
metaDescription: 'Zugticketsystem - Bereitstellung.'
---

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

## Online-Erfahrung.

Dieses Beispiel wurde auf der <http://ticketing.newbe.pro> -Website bereitgestellt.

### Offen für eine begrenzte Zeit.

Aufgrund der Betriebskosten ist das System nur für folgende spezifische periods：

| Datum.      | Zeit.        |
| ----------- | ------------ |
| Tage.       | 12:00-14:00。 |
| Tage.       | 20:00-22:00。 |
| Wochenende. | 19:00-23:00。 |

Jedes Mal, wenn es wieder geöffnet wird, wird das System zurückgesetzt und alle Daten von der letzten Öffnung werden geleert.

#### Swagger-Dokumentation.

Um beim Ticketing effektiver zu sein, können Entwickler automatische Ticketing-Tools auf der Grundlage der APIs entwickeln, die in der Swagger-Dokumentation angegeben sind.Dokumentadresse<http://ticketing.newbe.pro/swagger>

## Stellen Sie unabhängig bereit.

Entwickler können den Quellcode auch für die unabhängige Bereitstellung in der lokalen Docker-Umgebung verwenden.Folgen Sie einfach den Schritten unten.

1. Stellen Sie sicher, dass die Docker-Umgebung lokal ordnungsgemäß installiert ist und dass das docker-compose verfügbar ist.
2. Sehen Sie sich die Projektquelle <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. Führen Sie den Befehl `docker-compose build` im Ordner `src/Newbe.Claptrap.Ticketing` aus, um die Projektkompilierung abzuschließen.
4. Führen Sie `docker-compose up -d` im Ordner`src/Newbe.Claptrap.Ticketing/LocalCluster` aus, um alle Dienste zu starten.
5. Greifen Sie auf die `http://localhost:10080` zu, um die Schnittstelle zu öffnen.

> Wenn Sie derzeit chinesisches Festland sind und einen langsamen Download des Netcore-Images erleben, versuchen Sie es mit[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
