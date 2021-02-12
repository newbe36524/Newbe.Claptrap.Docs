---
title: 'Minimale wettbewerbsfähige Ressourcen'
description: 'Minimale wettbewerbsfähige Ressourcen'
---


Ein Konzept, das bei der Verwendung des Claptrap-Frameworks für minimale Wettbewerbsressourcen wichtig ist.Das Verständnis dieses Konzepts kann Entwicklern helfen, den Status von Claptrap besser zu entwerfen und das falsche Design zu vermeiden.

## Was ist die minimale wettbewerbsorientierte Ressource

Das Konzept des "Ressourcenwettbewerbs" in der Multithread-Programmierung wird hier als das Konzept der "minimalen wettbewerbsorientierten Ressource" in Unternehmenssystemen vorgestellt.Dieses Konzept macht es einfach, Designpunkte für die Anwendung von Newbe.Claptrap zu finden.

Im Fall des elektronischen Geschäftsverkehrs ist z. B. jeder Artikel eine "minimale wettbewerbsorientierte Ressource".Beachten Sie, dass dies nicht bedeutet, dass alle Waren eine "minimale wettbewerbsfähige Ressource" sind.Denn wenn Sie 10.000 Artikel nummerieren, dann die Eile, die erste und zweite Ware zu kaufen, gibt es keine Konkurrenz an sich.Daher ist jede Ware eine minimale wettbewerbsfähige Ressource.

Hier sind einige Beispiele available：

- In einem Geschäftssystem, das nur Single-End-Anmeldungen zulässt, ist das Anmeldeticket eines Benutzers die am wenigsten wettbewerbsfähige Ressource.
- In einem Konfigurationssystem ist jedes Konfigurationselement die am wenigsten wettbewerbsfähige Ressource
- An einer Börse ist jede Kauf- oder Verkaufsorder die am wenigsten wettbewerbsfähige Ressource

In einigen Szenarien wird die kleinste wettbewerbsorientierte Ressource auch als Minimale gleichzeitige Einheit bezeichnet.

## Der Staat von Claptrap sollte mindestens größer oder gleich dem Umfang der "minimalen wettbewerbsorientierten Ressourcen" sein.

Kombiniert mit E-Commerce-Snap-up-Beispielen, wenn alle Artikel im gleichen Claptrap-Status (größer als die minimale Wettbewerbsressource) entworfen sind.Anschließend kaufen verschiedene Benutzer Artikel, die sich gegenseitig beeinflussen, da Claptrap auf dem Actor-Muster basiert, das für die Verarbeitung von Anforderungen in die Warteschlange gestellt wird.Das heißt, vorausgesetzt, dass jeder Artikel 10 ms verarbeiten muss, dann ist es bis zu 10000, um alle Kaufanfragen zu verarbeiten.Wenn jedoch jedes Element nummeriert ist, wird jedes Element als separater Claptrap-Status entworfen.Also, weil sie nicht miteinander verwandt sind.Der Verkauf aller Waren würde theoretisch nur 10ms erfordern.

Es ist daher leicht zu schlussfolgern, dass, wenn Claptraps Zustand größer als die minimale wettbewerbsfähige Ressourcenreichweite ist, das System kein Problem mit der Korrektheit haben wird, aber es kann einige Leistungsverluste geben. Wenn der Zustand von Claptrap unter dem minimalen Ressourcenbereich liegt, wird die Beziehung zwischen Claptrap schwierig zu handhaben und riskant.Da dies einer Aufteilung einer minimalen wettbewerbsorientierten Ressource in Teile entspricht und die minimale wettbewerbsorientierte Ressource in der Regel in einer Transaktion behandelt werden muss, kehrt dies zu dem Problem verteilter Transaktionen zurück, das bei verteilten, schwierigen Aufgaben häufig ist.
