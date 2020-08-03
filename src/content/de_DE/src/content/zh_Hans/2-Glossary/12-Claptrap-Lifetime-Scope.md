---
title: 'Claptrap-Lebenszyklus'
metaTitle: 'Claptrap-Lebenszyklus'
metaDescription: 'Claptrap-Lebenszyklus'
---

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

Der Claptrap-Lebenszyklus wird nach Ansicht des Autors in zwei großen Kategorien dargestellt.：Laufzeitlebenszyklus und Entwurfszeitlebenszyklus.

## Der Laufzeitlebenszyklus.

Der Laufzeitlebenszyklus ist das Lebenszyklusverhalten jedes Objekts im Arbeitsspeicher während des Betriebs des Claptrap-Systems.Zum Beispiel.：In einem Websystem wird jede Webanforderung in der Regel als Lebenszyklus zugewiesen, und das Claptrap-System verfügt über einen ähnlichen Lebenszyklusentwurf.Diese Lebenszyklen haben Auswirkungen auf die Komponentenerweiterungen oder die Geschäftsentwicklung von Entwicklern.Der Laufzeitlebenszyklus des Claptrap-Frameworks ist unterteilt in.：Prozess, Claptrap und Event Handler.

Prozessebene.Ein Objekt, das als Lebenszyklus auf Prozessebene entwickelt wurde, ist ein Singleton-Objekt im allgemeinen Sinne.Jeder ausgeführte Claptrap-Prozess verfügt über ein eigenes Singleton-Objekt.In der Regel entspricht in einem Claptrap-Framework z. B. jedes persistente Layer-Ziel einem Batchprozessor (Batch Saver Event), um die Geschwindigkeit zu erhöhen, mit der Ereignisse in die persistente Ebene geschrieben werden.Sie haben während des gesamten Lebenszyklus des Prozesses nur eine Instanz, 1:1, die der entsprechenden Persistenzschicht entspricht, sodass Ereignisse zusammengeführt werden können, um in die Persistenzschicht zu schreiben, wodurch die Schreibleistung verbessert wird.Im Allgemeinen weisen Objekte, die als Lebenszyklus auf Prozessebene konzipiert sind, eines oder mehrere der folgenden Merkmale auf.：

1. Sie müssen die Logik oder den Code nur einmal während des gesamten Prozesslebenszyklus ausführen.Dies kann in der Regel mit Lazy und einem Singleton getan werden.
2. Während des gesamten Prozesslebenszyklus ist nur ein einzelnes Objekt erforderlich.Beispiel: Claptrap Design Store, Claptrap-Optionen usw.
3. Es kann nur ein einzelnes Objekt während des gesamten Prozesslebenszyklus vorhanden sein.Zum Beispiel Orleans Client.

Claptrap-Ebene.Objekte im Lebenszyklus auf Claptrap-Ebene werden mit der Aktivierung von Claptrap erstellt und mit der Inaktivierung von Claptrap freigegeben.Diese Objekte sind in der Regel stark mit einer Claptrap-Identität verknüpft.Z. B. Claptrap Design, Event Saver, Event Loader, State Saver, State Loader usw., die dieser Claptrap-Identität zugeordnet sind.

Ereignisprozessorebene (Ereignishandler).Lebenszyklusobjekte auf Ereignisprozessorebene werden erstellt, wenn der Ereignisprozessor erstellt und mit der Ereignisprozessorversion freigegeben wird.Diese Lebenszyklusebene ähnelt dem Lebenszyklus von Webanfragen als Reaktion auf das Web.In der Regel fällt die Arbeitseinheit für eine einheitliche Datenbanktransaktion auf diese Ebene.

## Lebensdauer der Entwurfszeit.

Design-Time-Lebenszyklen sind die Lebenszyklen von Geschäftsobjekten für Claptrap.Dies hat nichts damit zu tun, ob das Programm ausgeführt wird oder nicht, oder ob das Programm verwendet wird oder nicht.Um ein konkretes Beispiel zu nennen: Bestellungen in einem regulären E-Commerce-System.Die aktive Geschäftsfrist für einen Auftrag beträgt in der Regel nicht mehr als drei bis sechs Monate.Wenn dieses Zeitlimit überschritten wird, können die Auftragsdaten nicht geändert werden.Hier wird diese "drei bis sechs Monate" Frist als Entwurfszeitlebenszyklus eines Auftrags bezeichnet.Wenn ein Objekt in einem Claptrap-System seinen Entwurfszeitlebenszyklus überschritten hat, manifestiert es sich als "es besteht keine Notwendigkeit mehr, dieses Claptrap-Geschäft zu aktivieren."Daraus lassen sich die folgenden Schlussfolgerungen abziehen.：

1. Die Ereignisse, die Claptrap gespeichert hat, sind bedeutungslos, und das Löschen gibt freien Speicherplatz frei.
2. Der Geschäftscode für die Claptrap muss nicht mehr gewartet werden, und Sie können den Verweis entfernen oder den Code entfernen.

Je kürzer der Entwurfslebenszyklus von Claptrap, desto günstiger ist es daher, den Ressourcenbedarf und die Kosten für die Codewartung zu reduzieren und umgekehrt, was die Lagerkosten und Wartungsschwierigkeiten erhöht.Daher besteht beim Entwerfen von Claptrap-Systemen die Tendenz, einen kürzeren Lebenszyklus der Entwurfszeit zu verwenden.Und dieses Nobiss, spiegelt auch direkt das tatsächliche vollständig durch "Design" zu bestimmen. Als Nächstes listen wir einige gängige Entwurfszeit-Lebenszyklusklassifizierungen auf.

### Abgrenzung der Geschäftsgrenze.

Dies ist die häufigste Teilung.Die Geschäftsobjekte werden nach den Anforderungen der Domänenmodellierung unterteilt.Und diese Geschäftsobjekte haben oft einen festen Lebenszyklus.Wie in der vorherigen "Ordnung" ist ein häufiges Beispiel für die Aufteilung des Lebenszyklus durch Geschäftsgrenzen.Bei der Teilung mit dieser Methode müssen Sie nur beachten, dass Claptrap die grundlegende Anforderung erfüllt, dass "der minimale wettbewerbsfähige Ressourcenbereich größer oder gleich ist".Entwickler können diese Aufteilung mit einem Beispiel für ein "Zugticketsystem" erleben.

### Bedingte Grenzabgrenzung.

Im Allgemeinen konnte die geschäftsgrenzenbasierte Divisionsmethode einen angemessenen Lebenszyklus aufteilen.Wenn Sie jedoch einfach entlang von Geschäftsgrenzen unterteilt sind, verfügen Sie möglicherweise über Entwurfszeit-Lebenszyklus-zu-permanente Objekte.Angenommen, diese Objekte haben sehr dichte Ereignisoperationen.Dann ist die Anzahl der generierten Ereignisse ungewöhnlich groß.Dazu führen wir menschengesteuerte Wege ein, um den Lebenszyklus der Entwurfszeit zu verkürzen.Diese Aufteilung basiert auf bestimmten Bedingungen.Es wird daher als bedingte Grenzabgrenzung bezeichnet.Und die klassischste davon ist die Verwendung von "Zeitlimit" zu teilen.

Hier veranschaulichen wir diese Aufteilung anhand des Warenkorbobjekts im Schnellstartbeispiel.Erstens ist ein Warenkorb ein benutzerbezogenes Objekt, und solange der Benutzer im System war, ist es möglich, aktiviert zu werden, d.h. sein Design-Lebenszyklus ist "permanent".Daher können Sie verwandte Ereignisse nicht löschen, und sie müssen dauerhaft gespeichert werden, um sicherzustellen, dass die Warenkorbdaten korrekt sind.Aber wenn uns die Ereignisse, die ein Einkaufswagen vor einem Jahr verursacht hat, egal sind.Wir können die Einkaufswagen einzelner Benutzer manuell nach Jahr aufteilen.Gleichzeitig können wir für zwei angrenzende Jahre eine "Statuskopie" in einem Warenkorb erstellen.Dadurch werden die Zustandsdaten des Vorjahres erweitert, was zu einem kürzeren Entwurfslebenszyklus für den Einkaufswagen des Benutzers führt, und es wirkt sich nicht auf das Geschäft aus.Wir können eine klassische chinesische Legende verwenden, "The Fool es Move Mountain", um diese zeitbasierte Design-Lebenszyklus-Klassifizierung zu verstehen.In der Geschichte sind Narren Sterbliche, und obwohl sie nicht ewig leben können (kürzere Design-Lebenszyklen), kann der Geist der Narren (längere Design-Time-Lebenszyklen) mit zukünftigen Generationen weitergehen und somit die große Ursache der Bergwanderung vollenden.Wenn jede Generation von "Narren" ersetzt wird, tritt die oben erwähnte "Staatskopie" (spirituelle Fortsetzung) auf.Dies führt zu einem kürzeren Lebenszyklus der Entwurfszeit, der einen längeren oder sogar dauerhaften Design-Lebenszyklus ermöglicht.
