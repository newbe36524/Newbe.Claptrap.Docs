---
title: "Schritt 2 - Erstellen eines Projekts"
description: "Schritt 2 - Erstellen eines Projekts"
---

Im nächsten article [ersten Schritt - Vorbereitung der Entwicklungsumgebung](01-1-Preparation.md) , lernen wir weiter, wie man ein Newbe.Claptrap-Projekt erstellt.

<!-- more -->

## Installieren der Projektvorlage

Öffnen Sie die Konsole, um die folgenden Befehle auszuführen, um die neueste Projekt templates：

```bash
dotnet neu --install Newbe.Claptrap.Template
```

Nach der Installation können Sie die installierte Projektvorlage in den Installationsergebnissen anzeigen.

![newbe.claptrap.template installiert](/images/20200709-001.png)

## Erstellen eines Projekts

Wählen Sie einen Speicherort aus, erstellen Sie einen Ordner, und in diesem Beispiel wird ein Ordner mit dem Namen`helloClaptrap`unter`D:\Repo`erstellt.Der Ordner fungiert als Codeordner für das neue Projekt.

Öffnen Sie die Konsole, und wechseln Sie das Arbeitsverzeichnis auf`D:\Repo/HelloClaptrap`.Anschließend können Sie eine Projektumgebung erstellen, indem Sie die folgenden commands：

```bash
dotnet newbe.claptrap --name HelloClaptrap
```

> Im Allgemeinen empfehlen wir`D:\Repo,helloClaptrap`als Git-Lagerordner.Verwalten Sie Ihren Quellcode über die Versionskontrolle.

## Starten des Projekts

Als Nächstes verwenden wir die Befehlszeile, um das Projekt zu starten.Wechseln Sie die Befehlszeile zu`C:\Rsie die`epos/HelloClaptrap-HelloClaptrap, führen Sie die folgenden command：

```bash
tye run
```

Nach dem Start können Sie alle Elemente sehen, die in der Projektvorlage auf dem tye dashboard：

![newbe.claptrap-Dienst](/images/20210217-002.png)

> Die Adresse des Tye-Dashboards ist in der Regel <http://localhost:8000>, und wenn der Port belegt ist, werden automatisch andere Ports verwendet, und Sie können die Eingabeaufforderungen in der Befehlszeile anzeigen, um die aktuelle spezifische Adresse abzubekommen.

Die Betriebsadresse des`-Dienstes finden wir auf der oben`angezeigten Schnittstelle.Wie in der Abbildung oben dargestellt, lautet die Endpunktadresse beispielsweise<http://localhost:14285>.

Daher verwenden wir den Browser, um die Adresse zu öffnen, um die swagger-Schnittstelle anzuzeigen.

Versuchen Sie auf der Swagger-Seite,`/AuctionItems/{itemId}/status`API：

![newbe.claptrap AuctionItems](/images/20210217-003.png)

Die Rückgabe des Dienstes auf 200 gibt an, dass die Komponenten des aktuellen Dienstes normal gestartet wurden.

## Erleben Sie das Projekt

Projekte, die mit Projektvorlagen erstellt werden, sind eigentlich ein Programm, das Auktionsgebote simuliert.

Auktionsgebote sind ein typisches Geschäftsszenario, in dem eine Anforderung verarbeitet werden muss.Mit Newbe.Claptrap kann das Problem einfach gelöst werden.Wir verwenden dieses Geschäftsszenario weiterhin für die Demonstration in nachfolgenden Dokumenten, daher ist hier eine einfache Beschreibung des Geschäftsszenarios.

### Geschäftsregeln

Die Geschäftsregeln sind ungefähr so follows：

1. Jede Auktions-Itemid ist `einzigartige`
2. Auktionen können nur für einen bestimmten Zeitraum versteigert werden
3. Der Auktionsartikel hat einen Startauktionspreis
4. Alle Bieter haben eine eindeutige Benutzer-id `Benutzer`
5. Bieter können während des Auktionszeitraums auf unbestimmte Zeit auf einen Auktionsgegenstand bieten, und solange ihr Gebot größer als das aktuelle Höchstgebot ist, kann es als gültiges Gebot gezählt werden und der aktuelle Bieter für die Auktion werden.
6. Details zu allen erfolgreichen Geboten, einschließlich Gebotszeit, Gebotsbetrag, Bieter, müssen aufgezeichnet werden.

Der Status der Auktionsgegenstände ist so follows：

- `0 Geplante` warten auf Drehbeginn
- `1 OnSell` Auktion
- `2 Verkaufter` wurde erschossen
- `3 Unverkaufte` Streaming

### API-Design

Für den einfachsten Demonstrationseffekt entwirft dieses Beispiel die folgende API ：

- `GET/AuctionItems/{itemId}/Status` den aktuellen Auktionsstatus der angegebenen Auktion
- `GET/AuctionItems/{itemId}` Details des angegebenen Auktionsartikels
- `post/AuctionItems` Gebote für bestimmte Auktionsgegenstände

Verwenden wir ein einfaches Szenario, um die Auswirkungen dieser APIs zu erleben.

#### Suchen Sie nach Auktionsgegenständen, die derzeit versteigert werden

Da der Status von Auktionen von der Zeit beeinflusst wird, werden zeitbasierte Algorithmen verwendet, um Auktionen in allen Staaten zu generieren, damit Entwickler Auktionsgegenstände jederzeit in verschiedenen Bundesstaaten finden können.

Entwickler können die vier itemId-Aufrufe von 0/1/2/3`GET/AuctionItems/{itemId}/status`aktuellen Status der Auktion verwenden.

Es gibt mindestens eine Auktion mit `1 OnSell` .Für die nachfolgende Bequemlichkeit, nehmen wir an, dass seine itemId 1 ist.

#### Details zur Auktion anzeigen

Mit `GET/AuctionItems/{itemId}` finden Sie die Details des Auktionsartikels.Wenn wir z. B. mit itemId für 1 abfragen, erhalten wir möglicherweise die folgenden Ergebnisse:

```json
-
  "State":
    "biddingRecords": null,
    "basePrice": 10,
    "startTime": "2021-02-27T12:59:12.673013+08:00",
    "endTime": "2021-02-27T16:59:12.673013+08:00"


```

Die obigen Ergebnisse zeigen, dass：

- Die Auktion beginnt bei basePreis 10
- Der Auktionszeitraum ist der StartTime - endTime-Zeitraum
- Der aktuelle Auktionsdatensatz ist leer

Der Zeitraum kann sich je nach Startzeit des Projekts aufgrund der Zeit ändern, die zum Starten der Projektvorlage benötigt wird.

#### Versuchen Sie, zu bieten

Als Nächstes rufen wir`POST/AuctionItems`auf, um zu versuchen, auf das Auktionsobjekt zu bieten, das derzeit versteigert wird, und die Parameter als follows：

```json
•
  "userId": 1,
  "price": 36524,
  "itemId": 1

```

Die Parameter werden below：

- Bieter-Benutzer-Id ist 1
- Gebot 36524
- Der Auktionsartikel Id 1

Dies wird results：

```json
•
  "Erfolg": true,
  "userId": 1,
  "auctionItemStatus": 1,
  "nowPrice": 36524

```

Die Rücklaufergebnisse zeigen, dass：

- Das Erfolgsangebot war erfolgreich
- Bieter-Benutzer-Id ist 1
- Das letzte Gebot ist 36524
- Der aktuelle Stand der Auktion `1 OnSell`

Sie können die neuesten Auktionen{itemId}</code> mit dem GET/AuctionItems/：`</p>

<pre><code class="json">{
  "state": {
    "biddingRecords": {
      "36524": {
        "userId": 1,
        "price": 36524,
        "biddingTime": "2021-02-27T07:31:09.8954519+00:00"
      }
    },
    "basePrice": 10,
    "startTime": "2021-02-27T12:59:12.673013+08:00",
    "endTime": "2021-02-27T16:59:12.673013+08:00"
  }
}
`</pre>

Die obigen Ergebnisse zeigen, dass：

- Gebotsdatensätze wurden aktualisiert, um die neuesten Auktionsdetails enthalten zu können.

Damit wird die einfachste Gebotspräsentation abgeschlossen.

Entwickler können mit unterschiedlichen Zuständen und Parametern experimentieren, um die zugrunde liegende Verwendung der oben genannten APIs zu erfahren.Ein Gebot ist z. B. kleiner als das aktuelle Höchstgebot, ein Gebot für einen Artikel, der nicht neu erstellen darf usw.

## Beenden des Projekts

Wenn Sie ein Vorlagenprojekt beenden möchten, das gerade ausgeführt wird.Sie können ein laufendes Programm beenden, indem Sie`Strg``C-`auf dem Bedienfeld drücken, in dem Sie</code>-Tye-Run ausgeführt haben.</p>

<h2 spaces-before="0">Zusammenfassung</h2>

<p spaces-before="0">In diesem Artikel haben wir die grundlegenden Schritte zum Installieren und Verwenden von Projektvorlagen gelernt.</p>

<p spaces-before="0">Als Nächstes behandeln wir die wichtigsten Elemente in der Projektvorlage.</p>

<!-- md Footer-Newbe-Claptrap.md -->
