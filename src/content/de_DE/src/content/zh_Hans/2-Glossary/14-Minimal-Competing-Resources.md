---
title: 'Minimale wettbewerbsfähige Ressourcen'
metaTitle: 'Minimale wettbewerbsfähige Ressourcen'
metaDescription: 'Minimale wettbewerbsfähige Ressourcen'
---

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

Ein Konzept, das bei der Verwendung des Claptrap-Frameworks für minimale Wettbewerbsressourcen wichtig ist.Das Verständnis dieses Konzepts hilft Entwicklern, den Status von Claptrap besser zu entwerfen und das falsche Design zu vermeiden.

## Was ist die kleinste wettbewerbsfähige Ressource.

Das Konzept des "Ressourcenwettbewerbs" in analoger Multithreadprogrammierung, bei der das Konzept der "minimalen wettbewerbsorientierten Ressourcen" in einem Geschäftssystem vorgeschlagen wird.Mit diesem Konzept ist es einfach, Designpunkte für die Anwendung von Newbe.Claptrap zu finden.

Im Falle des Elektronischen Geschäftsverkehrs beispielsweise ist jede Ware eine "minimale wettbewerbsorientierte Ressource".Beachten Sie, dass dies nicht bedeutet, dass alle Waren eine "minimale wettbewerbsfähige Ressource" sind.Denn wenn 10.000 Waren nummeriert sind, dann die Eile, Waren 1 und 2 Waren zu kaufen, gibt es keinen Wettbewerb an sich.Daher ist jede Ware eine minimale wettbewerbsfähige Ressource.

Hier sind einige Beispiele available：

- In einem Geschäftssystem, das nur Single-Ended-Anmeldungen zulässt, ist das Anmeldeticket eines Benutzers die am wenigsten wettbewerbsfähige Ressource.
- In einem Konfigurationssystem ist jedes Konfigurationselement die am wenigsten wettbewerbsfähige Ressource.
- An einer Börse ist jeder Kauf- oder Verkaufsauftrag die kleinste wettbewerbsfähige Ressource.

In einigen Szenarien wird die kleinste wettbewerbsorientierte Ressource auch als "Minimum Concurrent Unit" bezeichnet.

## Der Zustand von Claptrap sollte mindestens größer oder gleich dem Bereich der "minimalen wettbewerbsorientierten Ressourcen" sein.

Kombiniert mit dem Beispiel eines E-Commerce-Snaps, wenn alle Waren im gleichen Claptrap-Zustand (größer als die kleinste wettbewerbsfähige Ressource) entworfen sind."Dann kaufen verschiedene Benutzer Artikel, die sich gegenseitig beeinflussen, da das auf Claptrap basierende Actor-Muster in die Warteschlange gestellt wird, um Anforderungen zu verarbeiten."Das heißt, vorausgesetzt, dass jeder Artikel 10ms verarbeiten muss, dann benötigt der schnellste s 10000 s 10 ms, um alle Kaufanfragen zu verarbeiten.Wenn jedoch jedes Element nummeriert ist, wird jedes Element als separater Claptrap-Status entworfen.Also, weil sie nichts miteinander zu tun haben.Der Verkauf aller Waren würde theoretisch nur 10ms kosten.

Es ist daher leicht zu schlussfolgern, dass, wenn Claptraps Staat größer als die minimale wettbewerbsorientierte Ressource ist, das System kein Problem mit der Korrektheit haben wird, aber es kann einige Leistungsstrafen geben. Wenn Claptraps Staat kleiner als die minimale Wettbewerbsressource ist, wird die Beziehung zwischen Claptrap schwierig und riskant.Da dies einer Aufteilung einer minimalen wettbewerbsorientierten Ressource in mehrere Teile entspricht und die kleinste wettbewerbsfähige Ressource in der Regel in einer einzigen Transaktion behandelt werden muss, die auf das sehr häufig auftretende Problem verteilter Transaktionen in verteilten Teilen zurückgeht, die schwer zu handhaben sind.
