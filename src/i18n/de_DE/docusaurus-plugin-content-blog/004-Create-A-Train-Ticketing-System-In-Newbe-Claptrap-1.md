---
date: 2020-07-20
title: Erstellen Eines einfachen Zugticketing-Systems, Newbe.Claptrap Framework Use Case, Erster Schritt - Geschäftsanalyse
---

Das Newbe.Claptrap-Framework ist ideal für die Lösung von Geschäftssystemen mit Komplizenschaftsproblemen.Das Fahrscheinsystem ist ein sehr typischer Szenario-Anwendungsfall.

In dieser Serie werden wir die Geschäfts-, Code-, Test- und Bereitstellungsaspekte der Verwendung des Newbe.Claptrap-Frameworks zum Erstellen eines einfachen Zugticketsystems schrittweise durchlaufen.

<!-- more -->

## Bragging trifft zuerst den Entwurf

Definieren wir zunächst die Geschäftsgrenzen und Leistungsanforderungen, die für dieses einfache Zugticketsystem erforderlich sind.

### Geschäftsgrenzen

Das System enthält nur den verbleibenden Ticketverwaltungsteil des Tickets.Das heißt, die restlichen Plätze abfragen, ein Ticket bestellen, um den Sitzplatz zu reduzieren.

Das Generieren von Auftragsinformationen, Zahlung, Verkehrssteuerung, Windsteuerung usw. ist in diesem Diskussionsbereich nicht enthalten.

### Business-Anwendungsfälle

- Überprüfen Sie die restlichen Tickets und können Sie die Anzahl der zwischen den beiden Bahnhöfen verfügbaren Tickets und die Anzahl der verbleibenden Sitzplätze überprüfen.
- Überprüfen Sie die verbleibenden Tickets entsprechend der Anzahl der Fahrten, kann die angegebene Anzahl von Malen abfragen, zwischen den Stationen, wie viele Plätze bleiben.
- Unterstützung bei der Sitzplatzauswahl, Können Kunden eine bestimmte Anzahl von Autos und Sitzplätzen wählen und Tickets bestellen.

### Leistungsanforderungen

- Die durchschnittlichen Kosten für die Abfrage der verbleibenden Tickets und die Bestellung dürfen 20ms nicht überschreiten.Diese Zeit umfasst nur die dienstseitige Verarbeitungszeit, d. h. die Übertragung von Seitennetzwerken, das Seitenrendering usw. sind nicht Teil des Frameworks.
- Restkartenabfragen können eine Verzögerung, jedoch nicht mehr als 5 Sekunden haben.Verzögerung bedeutet, dass es möglicherweise eine Abfrage für Tickets gibt, aber keine Tickets bestellt werden dürfen.

## Schwierige Analyse

### Restkartenverwaltung

Die Schwierigkeit der Restfahrkartenverwaltung liegt in der Besonderheit des verbleibenden Ticketbestands.

Gewöhnliche E-Commerce-Waren, SKU als kleinste Einheit, jede SKU ist unabhängig voneinander, beeinflussen sich nicht gegenseitig.

Seit：verkaufe ich derzeit 10.000 Armstrong-Kreisverkehre vom Planeten Sebotan, rot und weiß.Dann, wenn der Benutzer unter Aufträgen, solange die Kontrolle von rot und weiß zwei Artikel des Lagers nicht überverkauft ist.Es gibt keine Beziehung zwischen ihnen.

Die übrigen Tickets für den Zug sind jedoch unterschiedlich, da die übrigen Tickets vom Ende der verkauften Tickets betroffen sind.Hier ist ein einfaches logisches Modell, um einen detaillierten Blick auf diese Besonderheit zu erhalten.

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

Wenn ein Kunde jetzt ein a,c-Ticket erworben hat.Da es also nur einen Sitzplatz gibt, gibt es kein anderes Ticket außer c,d.Die verbleibende Abstimmungssituation wird die folgende：

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

## Logisches Claptrap-Design

Der Akteurmodus ist ein Entwurfsmuster, das von Natur aus geeignet ist, Probleme mit Problemen mit Problemen zu lösen.Das auf diesem Konzept basierende Newbe.Claptrap-Framework kann natürlich mit den oben genannten Schwierigkeiten umgehen.

### Minimale wettbewerbsfähige Ressourcen

Verglichen mit dem Konzept des "Ressourcenwettbewerbs" in der Multithread-Programmierung stellt der Autor das Konzept der "minimalen wettbewerbsorientierten Ressource" im Geschäftssystem vor.Dieses Konzept macht es einfach, Designpunkte für die Anwendung von Newbe.Claptrap zu finden.

Im Beispiel des Autors zum Verkauf von Abstrom-Kreiselkanonen ist beispielsweise jedes Element in der gleichen Farbe eine "minimale wettbewerbsorientierte Ressource".

Beachten Sie, dass dies nicht bedeutet, dass alle Artikel unter der gleichen Farbe eine "minimale wettbewerbsfähige Ressource" sind.Denn wenn Sie 10.000 Artikel nummerieren, dann die Eile, die erste und zweite Ware zu kaufen, gibt es keine Konkurrenz an sich.Daher ist jede Ware eine minimale wettbewerbsfähige Ressource.

Bei Zugtickets：also die kleinste wettbewerbsfähige Ressource den gleichen Sitzplatz im selben Zug.

Wie bereits erwähnt, ist derselbe Sitzplatz im selben Zug bei der Auswahl der verschiedenen Start- und Endpunkte, dass die verbleibende Ticketsituation dort ein Wettbewerbsverhältnis besteht.Insbesondere möchte der Autor beispielsweise Tickets für a,c kaufen, während Leser Tickets für a,b kaufen möchten.Dann haben wir eine Wettbewerbsbeziehung, und wir werden nur eine Person haben, die diese "minimale wettbewerbsfähige Ressource" erfolgreich kaufen kann.

Hier sind einige Beispiele, die der Autor für available：

- In einem Geschäftssystem, das nur Single-End-Anmeldungen zulässt, ist das Anmeldeticket eines Benutzers die am wenigsten wettbewerbsfähige Ressource.
- In einem Konfigurationssystem ist jedes Konfigurationselement die am wenigsten wettbewerbsfähige Ressource
- An einer Börse ist jede Kauf- oder Verkaufsorder die am wenigsten wettbewerbsfähige Ressource

> Dies ist die eigenen Annahmen des Autors, kein Verweis auf andere Materialien, wenn es ähnliche Informationen oder Substantive können den Inhalt unterstützen, sondern auch hoffen, dass leser eine Nachrichtenbeschreibung hinterlassen kann.

### Minimale Wettbewerbsressourcen mit Claptrap

"Mindestmittel für den Wettbewerb" werden genannt, da die Unterscheidung zwischen den am wenigsten wettbewerbsfähigen Ressourcen eine wichtige Grundlage für die Systemgestaltung bei der Gestaltung des Claptrap-Staates ist.

Hier ist eine Schlussfolgerung:：**Claptrap S-Staat sollte mindestens größer oder gleich der "minimalen wettbewerbsorientierten Ressource" sein.**

Kombiniert mit dem Beispiel der Absterrand Schwenkbeschleunigungspistole, wenn alle Elemente der gleichen Farbe im gleichen Claptrap-Zustand (größer als die minimale Wettbewerbsressource) entworfen sind.Anschließend kaufen verschiedene Benutzer Artikel, die sich gegenseitig beeinflussen, da Claptrap auf dem Actor-Muster basiert, das für die Verarbeitung von Anforderungen in die Warteschlange gestellt wird.Das heißt, vorausgesetzt, dass jeder Artikel 10 ms verarbeiten muss, dann ist es bis zu 10000, um alle Kaufanfragen zu verarbeiten.Wenn jedoch jedes Element nummeriert ist, wird jedes Element als separater Claptrap-Status entworfen.Also, weil sie nicht miteinander verwandt sind.Der Verkauf aller Waren würde theoretisch nur 10ms erfordern.

Wenn：**der Zustand von Claptrap größer als der minimale wettbewerbsfähige Ressourcenbereich ist, hat das System kein Problem mit der Korrektheit, aber es kann einige Leistungseinbußen geben.**

Darüber hinaus ist, wie bereits erwähnt, derselbe Sitzplatz im selben Zug die am wenigsten wettbewerbsfähige Ressource, so dass wir diese Geschäftseinheit als Claptrap es State gestalten können.Aber was ist, wenn das Design-Sortiment kleiner ist?

Für：haben wir Claptrap es State als Restkarte für denselben Sitzplatz im selben Zug an verschiedenen Abfahrtspunkten entworfen.Dann stellt sich die ganz traditionelle Frage der："Wie kann die Korrektheit der Daten in einem verteilten System sichergestellt werden".In diesem Punkt kann der Autor nicht erweitern, weil der Autor auch nicht klar sagen kann, einfach übereilt fallen eine Schlussfolgerung：**"Wenn Claptrap Sanwendungsbereich ist weniger als der Umfang der kleinsten wettbewerbsfähigen Ressourcen, wird die Beziehung zwischen Claptrap schwierig zu bewältigen, gibt es Risiken."**

### Claptrap Körperdesign

Kombinieren Sie als Nächstes die oben beschriebenen Theorien.Wir haben das Design direkt rausgeworfen.

![Train Ticketing System Design](/images/20200720-001.png)

#### Gestalten Sie jeden Sitz auf der gleichen Fahrt wie ein Claptrap-SeatGrain

Der Zustand von Claptrap enthält eine grundlegende Information

| Typ                                    | Namen      | Beschreibung                                                                                                                                                                                      |
| -------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IList&lt;int&gt;           | Stationen  | Die ID-Liste der Routenstationen, beginnend mit der Ursprungsstation und endend mit dem Terminal.Überprüfung zum Zeitpunkt des Kaufs des Haupttickets.                                            |
| Wörterbuch&lt;int, int&gt; | StationDic | Das Index-Reverse-Wörterbuch, das die Stations-ID leitet.Stationen sind eine Liste von Index-IDs, und das Wörterbuch ist das entsprechende id-index-Wörterbuch, um Abfragen zu beschleunigen.     |
| Liste&lt;string&gt;        | RequestIds | Schlüsseleigenschaften.In jedem Intervall wird die gekaufte Ticket-ID.Ein Index von 0 stellt z. B. eine Ticket-ID von Station 0 zu Station 1 dar.Wenn es leer ist, gibt es kein Abonnementticket. |

Mit dem Entwurf dieser Datenstruktur können zwei Unternehmen implementiert werden.

##### Überprüfen Sie, ob es erworben werden kann

Wenn Sie zwei Stations-IDs passieren, können Sie herausfinden, ob dies zu diesem SeatGrain gehört.Und alle Intervallsegmente abfragen, die den Start- und Endpunkten entsprechen.Beurteilen Sie einfach, ob alle Segmente in den RequestIds nicht über eine Ticket-ID verfügen.Wenn nicht, kann es gekauft werden.Wenn in einem Abschnitt bereits eine Ticket-Einkaufs-ID vorhanden ist, ist der Kauf nicht mehr möglich.

Die aktuelle Situation bei Stationen ist beispielsweise 10, 11, 12, 13. RequestIds hingegen sind 0,1,0.

Wenn Sie also ein 10->12-Ticket kaufen, ist das nicht möglich, da die zweite Reihe von RequestIds bereits gekauft wurde.

Wenn Sie jedoch 10->11 Tickets  möchten, können Sie dies, da niemand im ersten Bereich von RequestIds sie noch kaufen muss.

##### Kaufen

Platzieren Sie einfach die Start- und Endpunkte in allen Intervallsegmenteinstellungen in RequestIds.

##### Komponententestfälle

Mit den folgenden Links können Sie die Codeimplementierung der oben genannten algorithm：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/blob/master/src/Newbe.Claptrap.Ticketing/Newbe.Claptrap.Ticketing.Actors.Tests/TicketingTest.cs)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/blob/master/src/Newbe.Claptrap.Ticketing/Newbe.Claptrap.Ticketing.Actors.Tests/TicketingTest.cs)

#### Entwerfen Sie das Restticket für alle Sitzplätze auf der gleichen Fahrt wie ein Claptrap-TrainGran

Der Zustand von Claptrap enthält einige grundlegende Informationen

| Typ                                              | Namen     | Beschreibung                                                                                                                                                                                                                                                 |
| ------------------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| IReadOnlyList&lt;int&gt;             | Stationen | Die ID-Liste der Routenstationen, beginnend mit der Ursprungsstation und endend mit dem Terminal.Überprüfen sie für die Hauptabfrage.                                                                                                                        |
| IDictionary&lt;StationTuple, int&gt; | SeatCount | Schlüsseleigenschaften.StationTuple stellt einen Ausgangspunkt dar.Die Sammlung enthält die restlichen Tickets für alle möglichen Start- und Endpunkte.Wenn die Fahrt beispielsweise durch 34 Standorte verläuft, enthält das Wörterbuch 561 Schlüsselpaare. |

Basierend auf der obigen Datenstruktur müssen Sie die entsprechenden Informationen erst nach Abschluss jeder SeatGrain-Bestellung mit dem Korn synchronisieren.

Wenn a,c z. B. einen Ticketkauf hat, werden die verbleibenden Tickets für a,c/a,b/b,c um eins reduziert.

Dies kann mit dem in diesem Framework integrierten Minion-Mechanismus erreicht werden.

Es ist erwähnenswert, dass dies ein größeres Design als die "minimale wettbewerbsorientierte Ressource" ist.Da das Abfrageszenario in diesem Geschäftsszenario nicht absolut schnell sein muss.Dieser Entwurf reduziert die Komplexität des Systems.

## Zusammenfassung

In diesem Artikel haben wir durch Geschäftsanalyse eine Kombination aus Zugticket-Restverwaltung und Newbe.Claptrap ersann.

Anschließend konzentrieren wir uns auf das Design dieses Artikels und erläutern, wie sie entwickeln, testen und bereitstellen.

Tatsächlich wurde der Projektquellcode erstellt, und Leser können die：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples)

Besonderer Dank[wangjunjx8868](https://github.com/wangjunjx8868)Schnittstelle mit Blazor für dieses Beispiel erstellt.

<!-- md Footer-Newbe-Claptrap.md -->
