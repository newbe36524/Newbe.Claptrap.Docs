---
title: 'Design'
description: 'Zugticketsystem - Design'
---


## Unternehmensanalyse

### Geschäftsgrenzen

Das System enthält nur den verbleibenden Ticketverwaltungsteil des Tickets.Das heißt, die restlichen Plätze abfragen, ein Ticket bestellen, um den Sitzplatz zu reduzieren.

Das Generieren von Auftragsinformationen, Zahlung, Verkehrssteuerung, Windsteuerung usw. ist in diesem Diskussionsbereich nicht enthalten.

### Business-Anwendungsfälle

- Überprüfen Sie die restlichen Tickets und können Sie die Anzahl der zwischen den beiden Bahnhöfen verfügbaren Tickets und die Anzahl der verbleibenden Sitzplätze überprüfen.
- Überprüfen Sie die verbleibenden Tickets entsprechend der Anzahl der Fahrten, kann die angegebene Anzahl von Malen abfragen, zwischen den Stationen, wie viele Plätze bleiben.
- Unterstützung bei der Sitzplatzauswahl, Können Kunden eine bestimmte Anzahl von Autos und Sitzplätzen wählen und Tickets bestellen.

## Implementieren schwieriger Analysen

### Restkartenverwaltung

Die Schwierigkeit der Restfahrkartenverwaltung liegt in der Besonderheit des verbleibenden Ticketbestands.

Gewöhnliche E-Commerce-Waren, SKU als kleinste Einheit, jede SKU ist unabhängig voneinander, beeinflussen sich nicht gegenseitig.

Die übrigen Tickets für den Zug sind unterschiedlich, da sie vom Verkauf der Tickets ab dem Ende der Laufzeit betroffen sind.Hier ist ein einfaches logisches Modell, um einen detaillierten Blick auf diese Besonderheit zu erhalten.

Nehmen wir nun an, dass ein Zug durch vier Stationen fährt, a, b, c, d, und gleichzeitig vereinfachen wir das Szenario, vorausgesetzt, dass es nur einen Sitzplatz in der Fahrt gibt.

Bevor also jemand ein Ticket kauft, ist die verbleibende Ticketsituation für diese Anzahl von Tickets so follows：

| Start und Ende | Die Anzahl der verbleibenden Tickets |
| -------------- | ------------------------------------ |
| a,b            | 1                                    |
| a,c            | 1                                    |
| a,d            | 1                                    |
| b,c            | 1                                    |
| b,d            | 1                                    |
| c,d            | 1                                    |

Wenn ein Kunde jetzt ein a,c-Ticket erworben hat.Da es also nur einen Sitzplatz gibt, gibt es keine anderen Restkarten als c,d.Die verbleibende Abstimmungssituation wird die folgende：

| Start und Ende | Die Anzahl der verbleibenden Tickets |
| -------------- | ------------------------------------ |
| a,b            | 0                                    |
| a,c            | 0                                    |
| a,d            | 0                                    |
| b,c            | 0                                    |
| b,d            | 0                                    |
| c,d            | 1                                    |

Um es direkter zu machen: Wenn ein Kunde a,d für das gesamte Ticket kauft, werden alle verbleibenden Tickets auf 0 geändert.Denn der Passagier sitzt immer auf diesem Platz.

Dies ist die Besonderheit der Zugtickets：gleichen Sitzplatz es im selben Zug, die Anzahl der an jedem Abfahrtsort verbleibenden Tickets wird durch den Start und das Ende des verkauften Tickets beeinflusst.

Wenn man ein wenig ausdehnt, lässt sich leicht feststellen, dass es keinen solchen Effekt zwischen verschiedenen Sitzen in der gleichen Fahrt gibt.

### Restticket-Anfrage

Wie im vorherigen Abschnitt erwähnt, aufgrund der Besonderheit des Restkartenbestands.Für die gleiche Fahrt a, b, c, d, gibt es 6 mögliche Ticketoptionen.

Und es ist leicht zu schlussfolgern, dass die Methode zur Berechnung der Anzahl der gewählten Arten tatsächlich darin besteht, zwei Kombinationen in n-Standorten auszuwählen, d. h.c(n, 2).

Wenn also ein Auto durch 34 Stationen fährt, ist die mögliche Kombination c (34,2) s 561.

Wie man mit vielen Arten von Abfragen umgeht, die effizient existieren können, ist auch ein Problem, das das System lösen muss.

## Claptrap Körperdesign

![Train Ticketing System Design](/images/20200720-001.png)

### Gestalten Sie jeden Sitz auf der gleichen Fahrt wie ein Claptrap-SeatGrain

Der Zustand von Claptrap enthält eine grundlegende Information

| Typ                                    | Namen      | Beschreibung                                                                                                                                                                                      |
| -------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IList&lt;int&gt;           | Stationen  | Die ID-Liste der Routenstationen, beginnend mit der Ursprungsstation und endend mit dem Terminal.Überprüfung zum Zeitpunkt des Kaufs des Haupttickets.                                            |
| Wörterbuch&lt;int, int&gt; | StationDic | Das Index-Reverse-Wörterbuch, das die Stations-ID leitet.Stationen sind eine Liste von Index-IDs, und das Wörterbuch ist das entsprechende id-index-Wörterbuch, um Abfragen zu beschleunigen.     |
| Liste&lt;string&gt;        | RequestIds | Schlüsseleigenschaften.In jedem Intervall wird die gekaufte Ticket-ID.Ein Index von 0 stellt z. B. eine Ticket-ID von Station 0 zu Station 1 dar.Wenn es leer ist, gibt es kein Abonnementticket. |

Mit dem Entwurf dieser Datenstruktur können zwei Unternehmen implementiert werden.

#### Überprüfen Sie, ob es erworben werden kann

Wenn Sie zwei Stations-IDs passieren, können Sie herausfinden, ob dies zu diesem SeatGrain gehört.Und alle Intervallsegmente abfragen, die den Start- und Endpunkten entsprechen.Beurteilen Sie einfach, ob alle Segmente in den RequestIds nicht über eine Ticket-ID verfügen.Wenn nicht, kann es gekauft werden.Wenn in einem Abschnitt bereits eine Ticket-Einkaufs-ID vorhanden ist, ist der Kauf nicht mehr möglich.

Die aktuelle Situation bei Stationen ist beispielsweise 10, 11, 12, 13. RequestIds hingegen sind 0,1,0.

Wenn Sie also ein 10->12-Ticket kaufen, ist das nicht möglich, da die zweite Reihe von RequestIds bereits gekauft wurde.

Wenn Sie jedoch 10->11 Tickets  möchten, können Sie dies, da niemand im ersten Bereich von RequestIds sie noch kaufen muss.

#### Kaufen

Platzieren Sie einfach die Start- und Endpunkte in allen Intervallsegmenteinstellungen in RequestIds.

### Entwerfen Sie das Restticket für alle Sitzplätze auf der gleichen Fahrt wie ein Claptrap-TrainGran

Der Zustand von Claptrap enthält einige grundlegende Informationen

| Typ                                              | Namen     | Beschreibung                                                                                                                                                                                                                                                 |
| ------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| IReadOnlyList&lt;int&gt;             | Stationen | Die ID-Liste der Routenstationen, beginnend mit der Ursprungsstation und endend mit dem Terminal.Überprüfen sie für die Hauptabfrage.                                                                                                                        |
| IDictionary&lt;StationTuple, int&gt; | SeatCount | Schlüsseleigenschaften.StationTuple stellt einen Ausgangspunkt dar.Die Sammlung enthält die restlichen Tickets für alle möglichen Start- und Endpunkte.Wenn die Fahrt beispielsweise durch 34 Standorte verläuft, enthält das Wörterbuch 561 Schlüsselpaare. |

Basierend auf der obigen Datenstruktur müssen Sie die entsprechenden Informationen erst nach Abschluss jeder SeatGrain-Bestellung mit dem Korn synchronisieren.

Wenn a,c z. B. einen Ticketkauf hat, werden die verbleibenden Tickets für a,c/a,b/b,c um eins reduziert.

Dies kann mit dem in diesem Framework integrierten Minion-Mechanismus erreicht werden.

Es ist erwähnenswert, dass dies ein größeres Design als die "minimale wettbewerbsorientierte Ressource" ist.Da das Abfrageszenario in diesem Geschäftsszenario nicht absolut schnell sein muss.Dieser Entwurf reduziert die Komplexität des Systems.

## Id

![Zugticketing System Id](/images/20200813-001.png)
