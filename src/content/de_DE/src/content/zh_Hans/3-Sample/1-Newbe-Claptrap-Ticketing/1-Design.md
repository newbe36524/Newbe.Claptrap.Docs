---
title: 'Design.'
metaTitle: 'Zug-Ticketing-System - Design.'
metaDescription: 'Zug-Ticketing-System - Design.'
---

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

## Geschäftsanalyse.

### Geschäftsgrenzen.

Das System enthält nur den verbleibenden Ticketverwaltungsteil des Tickets.Das heißt, die restlichen Plätze abfragen, Tickets bestellen, um Sitze zu reduzieren.

Das Generieren von Auftragsinformationen, Zahlung, Verkehrssteuerung, Windsteuerung usw. ist in diesem Diskussionsbereich nicht enthalten.

### Business-Anwendungsfälle.

- Überprüfen Sie die restlichen Tickets, um die Anzahl der verfügbaren Fahrten zwischen den beiden Stationen und die Anzahl der verbleibenden Sitzplätze zu ermitteln.
- Fragen Sie den Ticket-Einsatz entsprechend der Anzahl der Züge, kann die angegebene Anzahl von Zügen abfragen, zwischen den Bahnhöfen gibt es, wie viele verbleibende Sitzplätze.
- Die Sitzplatzauswahl wird unterstützt, und Kunden können eine bestimmte Anzahl von Autos und Sitzplätzen auswählen und eine Bestellung aufgeben, um ein Ticket zu kaufen.

## Implementieren Sie eine schwierige Yiter-Analyse.

### Restkartenverwaltung.

Die Schwierigkeit der Ticketüberleitung liegt in der Besonderheit des restlichen Ticketbestands.

Gewöhnliche E-Commerce-Waren, mit SKUs als kleinste Einheit, jede SKU ist unabhängig voneinander und hat keine Auswirkungen aufeinander.

Zugtickets sind anders, weil die verbleibenden Tickets durch den Start und das Ende der verkauften Tickets betroffen sind.Hier ist ein einfaches logisches Modell, um einen detaillierten Blick auf diese Besonderheit zu werfen.

Nehmen wir nun an, dass es eine Reihe von Autos gibt, die vier Stationen passieren, a, b, c, d, und gleichzeitig vereinfachen wir das Szenario, vorausgesetzt, dass es nur einen Sitz in der Reihe gibt.

Bevor also jemand ein Ticket kauft, sind die restlichen Tickets für diese Fahrt so follows：

| Vom Ende. | Die Höhe der verbleibenden Tickets. |
| --------- | ----------------------------------- |
| a,b.      | 1。                                  |
| a, c.     | 1。                                  |
| a, d.     | 1。                                  |
| b,c.      | 1。                                  |
| b,d.      | 1。                                  |
| c, d.     | 1。                                  |

Wenn ein Kunde jetzt ein Ticket erworben hat.Da es also nur einen Sitzplatz gibt, haben a, b und b, c keine Restkarten.Die übrigen Stimmen werden zu den folgenden：

| Vom Ende. | Die Höhe der verbleibenden Tickets. |
| --------- | ----------------------------------- |
| a,b.      | 0。                                  |
| a, c.     | 0。                                  |
| a, d.     | 1。                                  |
| b,c.      | 0。                                  |
| b,d.      | 1。                                  |
| c, d.     | 1。                                  |

Um es noch deutlicher zu sagen: Wenn ein Kunde ein, d kauft, werden alle verbleibenden Tickets 0.Denn der Passagier saß immer auf dem Sitz.

Dies ist die Besonderheit des Zugtickets：dem gleichen Sitzplatz desselben Zuges wird die Anzahl der verbleibenden Tickets an jedem Endpunkt durch den Startpunkt des verkauften Tickets beeinflusst.

Wenn man sich ein wenig ausdehnt, lässt sich leicht feststellen, dass es keinen solchen Effekt zwischen verschiedenen Sitzen im selben Auto gibt.

### Verbleibende Ticketanfragen.

Wie im vorherigen Abschnitt erwähnt, aufgrund der Besonderheit des verbleibenden Ticketbestands.Für den gleichen Zug a, b, c, d gibt es 6 mögliche Ticketoptionen.

Und es ist leicht zu schlussfolgern, dass die Anzahl der ausgewählten Typen tatsächlich berechnet wird, indem eine Kombination von 2 in den n-Sites ausgewählt wird, die c (n, 2) ist.

Wenn also ein Auto durch 34 Stationen fährt, ist die mögliche Kombination c (34,2) s 561.

Wie man mit den vielen Arten von Abfragen umgeht, die effektiv existieren können, ist auch ein Problem, das das System lösen muss.

## Claptrap Körper-Design.

![Train Ticketing System Design.](/images/20200720-001.png)

### Jeder Sitz im selben Zug ist als Claptrap- SeatGrain konzipiert.

Der Zustand der Klatsche enthält eine grundlegende Information.

| Typ.                                   | Namen.      | Beschreibung                                                                                                                                                                                        |
| -------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IList&lt;int&gt;           | Stationen.  | Die Liste der IDs für die Pfadstation beginnt mit der Ursprungsstation und endet mit dem Terminal.Überprüfung zum Zeitpunkt des Großkaufs.                                                          |
| Wörterbuch&lt;int, int&gt; | StationDic. | Das Index-Reverse-Wörterbuch der Straßenstations-ID.Stationen sind eine Liste von Index-IDs, und das Wörterbuch ist das entsprechende id-index-Wörterbuch, um die Abfrage zu beschleunigen.         |
| Liste&lt;string&gt;        | RequestIds. | Schlüsseleigenschaften.In jedem Intervall die Ticket-ID für den Kauf.Der Index ist z. B. 0, d. h. die Ticket-ID von Station 0 zu Station 1.Wenn es leer ist, gibt es derzeit kein Abonnementticket. |

Mit diesem Datenstrukturentwurf können Sie zwei Unternehmen implementieren.

#### Stellen Sie sicher, dass es zum Kauf verfügbar ist.

Wenn Sie zwei Stations-IDs passieren, können Sie herausfinden, ob dies zu diesem SeatGrain gehört.Und alle Intervallsegmente nach den Start- und Endpunkten abfragen.Sagen Sie einfach, ob dies nicht über eine Ticket-ID für alle Segmente vergibt, die Sie von RequestIds mitteilen.Wenn nicht, bedeutet es, dass es gekauft werden kann.Wenn Sie eine ID für einen der Absätze haben, können Sie nicht.

Die aktuelle Stationssituation ist beispielsweise 10, 11, 12, 13. RequestIds hingegen ist 0,1,0.

Also, wenn Sie ein Ticket für 10->12 kaufen möchten, nicht weil die zweite Reihe von RequestIds bereits gekauft wurde.

Wenn Sie jedoch ein Ticket für 10->11 kaufen möchten, können Sie dies, da die erste Reihe von RequestIds noch nicht verfügbar ist.

#### Kaufen.

Sie können die Start-INGon der Ticket-ID für alle Intervalleinstellungen in RequestIds zuweisen.

### Die restlichen Tickets für alle Sitzplätze im selben Zug sind als Claptrap-TrainGran konzipiert.

Der Zustand der Claptrap enthält einige grundlegende Informationen.

| Typ.                                             | Namen.     | Beschreibung                                                                                                                                                                                                                      |
| ------------------------------------------------ | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IReadOnlyList&lt;int&gt;             | Stationen. | Die Liste der IDs für die Pfadstation beginnt mit der Ursprungsstation und endet mit dem Terminal.Überprüfen Sie sit auf der primären Abfrage.                                                                                    |
| IDictionary&lt;StationTuple, int&gt; | SeatCount. | Schlüsseleigenschaften.Station Tuple ist ein Ausgangspunkt.Die Sammlung enthält alle möglichen Tickets für Den Anfang und das Ende.Wenn das Auto beispielsweise 34 Standorte passiert, enthält das Wörterbuch 561 Schlüsselpaare. |

Basierend auf der obigen Datenstruktur müssen Sie die entsprechenden Informationen nur mit dem Korn synchronisieren, wenn The SeatGrain die Bestellung abschließt.

Wenn a, c z. B. einen Ticketkauf hat, werden die restlichen Tickets für a, c/a, b/b, c um eins reduziert.

Dies kann hier mit Hilfe des in diesem Framework integrierten Minion-Mechanismus erfolgen.

Es ist erwähnenswert, dass dies ein größeres Design als die "am wenigsten wettbewerbsfähigen Ressourcen" ist.Da das Abfrageszenario in diesem Geschäftsszenario keine absolute Geschwindigkeit benötigt.Dieser Entwurf reduziert die Komplexität des Systems.

## Id.

![Zug-Ticketing-System-Id.](/images/20200813-001.png)
