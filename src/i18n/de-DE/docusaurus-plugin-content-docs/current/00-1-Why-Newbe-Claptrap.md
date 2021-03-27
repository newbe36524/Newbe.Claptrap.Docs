---
title: Warum Newbe.Claptrap
description: Newbe.Claptrap - Ein serviceseitiges Entwicklungsframework mit "Event Sourcing" und "Actor Mode" als Grundtheorien
---

Dieser Artikel ist eine Einführung in den Hauptinhalt des Projekts Newbe.Claptrap, über das leserliche Informationen über den Projektinhalt erhalten können.

<!-- more -->

## Räder werden von der Nachfrage abgeleitet

Mit der rasanten Entwicklung von Internet-Anwendungen entstehen ständig relevante technische Theorien und Umsetzungsmöglichkeiten.Eine Reihe von Schlüsselwörtern wie Cloud Native Architecture, MicroServer Architecture und DevOps sind zunehmend in den Augen von Ingenieuren.Zusammenfassend lässt sich sagen, dass das Aufkommen dieser neuen Theorien und Technologien einige der technischen Probleme im Internet lösen applications：

**Anforderungen an die Skalierbarkeit von höheren Kapazität sind**.Auf der Grundlage des kommerziellen Erfolgs wird die Zahl der Nutzer von Internetanwendungen, der Systemdruck und die Anzahl der Hardwaregeräte im Laufe der Zeit deutlich zunehmen.Dies erfordert die Anwendung der Kapazitätsskalierbarkeit in der Provinz.Diese Kapazitätsskalierbarkeit wird häufig als "Anwendungen müssen horizontale Skalierung unterstützen" beschrieben.

**höheren Systemstabilitätsanforderungen**.Die Anwendung läuft kontinuierlich, um den kontinuierlichen Fortschritt der Geschäftsaktivitäten zu gewährleisten, die jeder, der mit dieser Anwendung in Verbindung steht, gerne sehen würde.Aber es ist in der Regel sehr schwierig, das zu tun.Heutige Internet-Anwendungen im Angesicht vieler Wettbewerber der gleichen Art, wenn nicht solide genug in dieser Hinsicht, dann ist es wahrscheinlich, einige der Gunst des Benutzers zu verlieren.

**höheren Anforderungen an die funktionale Skalierbarkeit sind**."Embrace change", ein Wort, das in die Menschen kommt, wenn sie "agile Project Management"-bezogene Inhalte erwähnen.Dieses Wort spiegelt voll und ganz wider, wie wichtig es ist, dass die heutigen Internetanwendungen erfolgreich sind und funktional erfolgreich sind.Es spiegelt auch die veränderliche Nachfrage von Produkten in der aktuellen Internet-Umgebung von einer Seite.Als Systemingenieur sollte dies zu Beginn der Anwendung berücksichtigt werden.

**eine höhere Benutzerfreundlichkeit erfordert**.Die Leichtigkeit der Entwicklung, die hierhin gehört, bezieht sich auf den Schwierigkeitsgrad bei der Entwicklung des Anwendungssystems selbst.Je einfacher es zu entwickeln ist, desto besser zu erprüfbar und einsetzbar ist es, seine eigene Codestruktur anzuwenden.

**höhere Leistungsanforderungen**.Die hier genannten Leistungsanforderungen sind insbesondere Leistungsanforderungen bei steigender Systemkapazität.Vermeiden Sie Ein-Punkt-Leistungsprobleme in Ihrem System und geben Sie Ihrer Anwendung eine horizontal skalierbare Funktion.Im Allgemeinen ist es, wenn Leistungsprobleme auftreten, oft der einfachste Weg, sie durch Hinzufügen physischer Geräte zu lösen.Bei unterschiedlicher Systemkapazität ist das Optimierungsschema für die Systemleistung in der Regel unterschiedlich.Daher war die Auswahl technischer Lösungen in Kombination mit dem Anwendungsszenario schon immer ein Problem, das Systemingenieure berücksichtigen müssen.

Dieses Projekt basiert auf den oben genannten Systemfunktionsmerkmalen der Anforderungen, die eine Reihe von Entwicklungsframeworks zusammengefasst haben.Diese enthält relevante theoretische Eckpfeiler, Entwicklungsbibliotheken und technische Protokolle.

> Es gibt keine silberne Kugel auf der Welt.Ein Rahmen wird nicht alle Probleme lösen. Der Mond fiel auf die nicht wollen, um genannt werden

## Von der Nachfrage

Bei der Erläuterung verteilter Systeme wird häufig das einfache Geschäftsszenario "Kontoübertragung" verwendet, um der Beschreibung zu entsprechen.Hier ist ein Blick auf dieses Geschäftsszenario.

Angenommen, wir müssen ein Geschäftssystem mit einem Kontosystem erstellen.Jedes Konto hat einen Saldo.Sie müssen nun einen Übertragungsvorgang durchführen, um 300 des Saldos von Konto A auf Konto B zu übertragen.Darüber hinaus müssen wir auf der Grundlage der grundlegenden Anforderungen des obigen Abschnitts bei der Implementierung dieser scenario：

- Sie müssen mit einem Anstieg der Systemkapazität fertig werden.Es können nur 1000 anfängliche Benutzer am Anfang der Anwendung vorhanden sein.Dank guter Anwendungsförderung und des Zustroms von Bot-Konten ist die Anzahl der Nutzer innerhalb eines Monats um drei Größenordnungen gestiegen, d. h. auf eine Million.
- Die Stabilität und Wiederherstellbarkeit des Systems müssen berücksichtigt werden.Minimieren Sie die durchschnittliche Ausfallzeit des Gesamten Systems, und selbst Systemausfälle sollten so einfach wie möglich wiederhergestellt werden können.Das heißt, um einen einzigen Punkt des Scheiterns zu vermeiden.
- Die Skalierbarkeit von Unternehmen muss berücksichtigt werden.Einige Geschäftslogik muss möglicherweise hinzugefügt werden, later：begrenzen Sie den täglichen Überweisungsbetrag entsprechend der Kontoebene, SMS-Benachrichtigung nach der Übertragung erfolgreich ist, Transfer unterstützung eine bestimmte Menge an geheimen-kostenlosen Übertragung, spezifisches Konto, um die "T1" auf das Konto zu erreichen.
- Sie müssen die Testbarkeit Ihres Codes berücksichtigen.Der Geschäftscode und der Systemcode des Systems können gut voneinander getrennt werden, und die Korrektheit und Leistung des Geschäftscodes und des Systemcodes kann zunächst durch Komponententests überprüft werden.

## Die Theorie der Räder

In diesem Abschnitt werden einige der theoretischen Inhalte vorgestellt, die eng in diesen Rahmen integriert sind, um dem Leser das Verständnis der Arbeit des Rahmens im Follow-up-Prozess zu erleichtern.

### Actor-Modus

Das Actor-Muster ist ein Standard-Programmiermodell.Durch die Anwendung dieses Programmiermodells können einige Systeme das Problem der Komplexität lösen.Das Problem mit der hier erwähnten Union besteht darin, dass ein Computer, der dieselben Daten logisch verarbeitet, aufgrund mehrerer gleichzeitiger Anforderungen zu falschen Daten führen kann.Dies ist ein Problem, das bei der Multithreadprogrammierung auftreten muss.Um ein einfaches Beispiel zu geben, wenn Sie 100 Threads in einer nicht-synchronen Sperre verwenden, um einen s. . . Vorgang für eine int-Variable im Speicher auszuführen.Dann ist das Ergebnis dieser Variable oft kleiner als 100.So vermeidet das Actor-Muster dieses Problem.

Erstens, um das Verständnis zu erleichtern, kann sich der Leser hier Schauspieler als Objekt vorstellen.In objektorientierten Sprachen (Java, C- usw.) kann der Akteur als ein Objekt betrachtet werden, das``dem neuen Schlüsselwort erstellt wurde.Aber dieses Objekt hat einige besondere characteristics：

**hat einen Zustand, der zu**gehört.Objekte können alle ihre eigenen Eigenschaften haben, was ein grundlegendes Merkmal objektorientierter Sprachen ist.Im Actor-Modus werden diese Eigenschaften kollektiv als State of Actor bezeichnet.Der Zustand des Schauspielers wird von Schauspieler selbst aufrechterhalten.

Dies hebt zwei points：

Erstens kann der Zustand des Schauspielers nur von selbst geändert werden, und um den Zustand des Schauspielers von außen zu ändern, kann er nur durch Aufrufen von Actor geändert werden.

![Aktualisieren des Actor-Status](/images/20190226-001.gif)

Zweitens wird der Status des Akteurs nur innerhalb von Actor beibehalten und nicht für ein anderes Objekt als den aktuellen Actor freigegeben.Die Nicht-Freigabe hier betont auch, dass sie den internen Status von Actor nicht durch eine Änderung in einer externen Eigenschaft ändern kann.Dies ist vor allem, um es von Programmiersprachen mit "Objektreferenz" Sprachmerkmale zu unterscheiden.例如：在 C#的 class 的 public 属性，假如是引用类型，那么在外部获得这个 class 之后是可以改变 class 中的属性的。Im Schauspielermodus ist dies jedoch nicht zulässig.

![Freigeben des Status "Akteur"](/images/20190226-003.gif)

Das Lesen von Daten von innen nach außen ist jedoch weiterhin erlaubt.

![Lesen Sie den Status "Schauspieler"](/images/20190226-002.gif)

**eingedatorten**.Der Schauspieler akzeptiert in der Regel jeweils nur einen Anruf.Die hier beschriebenen Threads sind nicht genau Threads im Computer und werden verwendet, um die "Attribute hervorzuheben, die Actor nur eine Anforderung gleichzeitig verarbeiten kann".Wenn Actor derzeit einen Anruf annimmt, werden die verbleibenden Anrufe blockiert, bis der Anruf beendet und die nächste Anforderung zugelassen wird.Dies ähnelt tatsächlich einem Mechanismus zum Synchronisieren von Sperren.Dieser Mechanismus vermeidet die Möglichkeit eines Problems mit dem Vorhandensein eines Problems beim Ändern des internen Zustands des Akteurs.具体一点说明：如果使用 100 个线程对一个 Actor 进行并发调用，让 Actor 对状态中的一个 int 变量进行 ++ 操作。Der endgültige Wert für diesen Zustand muss 100 sein.

![Schauspieler wird in einem Synthesizer genannt](/images/20190226-004.gif)

Single Threading ist jedoch nicht absolut, so dass 2000 verarbeitet werden kann, wenn kein Problemantrag gestellt wird.Lesen Sie beispielsweise den Status in Actor, der normalerweise kein Problem mit dem Symp hat, sodass zu diesem Zeitpunkt derselbe Vorgang zulässig ist.

![Lesen Sie Schauspieler zur gleichen Zeit](/images/20190226-005.gif)

> Wenn lesern sie über die Einfädelnatur des Schauspielers lesen, denken Leser oft darüber nach, ob dies Leistungsprobleme verursachen kann, weil Actor selbst zu langsam damit umgeht.In diesem Punkt hoffe ich, dass die Leser an dieser Frage festhalten und sie später auf der Suche nach Antworten lesen werden.

### Ereignisrückverfolgbarkeitsmodus

Event-Rückverfolgbarkeitsmuster ist eine Art Software-Design-Idee.Diese Art von Design-Idee unterscheidet sich in der Regel von der traditionellen System-Design-Idee, die hauptsächlich auf Add-Delete-Prüfung und Korrektur (CRUD) basiert.CRUD-Anwendungen haben oft einige limitations：

1. Im Allgemeinen übernehmen CRUD-Anwendungen die Praxis, Datenspeicher direkt zu betreiben.Diese Implementierung kann aufgrund unzureichender Datenbankoptimierung zu Leistungsengpässen führen und es kann schwieriger sein, Ihre Anwendung zu skalieren.
2. In bestimmten Bereichen gibt es häufig Datenprobleme, die aufmerksamkeit erfordern, um Fehler bei Datenaktualisierungen zu vermeiden.Dies erfordert oft die Einführung von "Sperren", "Transaktionen" und anderen verwandten Technologien, um solche Probleme zu vermeiden.Dies kann aber auch zu Leistungseinbußen führen.
3. Sofern keine zusätzliche Überwachung hinzugefügt wird, ist der Verlauf der Änderungen an den Daten in der Regel nicht rückverfolgbar.Denn der endgültige Zustand der Daten wird in der Regel im Datenspeicher gespeichert.

Im Gegensatz zu CRUD-Praktiken vermeidet event sourcing die oben beschriebenen Einschränkungen.Erläutern Sie als Nächstes die zugrunde liegenden Möglichkeiten, wie die Ereignisbeschaffung um das oben erwähnte "Transfer"-Geschäftsszenario herumfunktioniert.

Verwenden Sie crudding, um "Transfers" zu erreichen.

!["Transfer" mit CRUD-Methode](/images/20190226-006.gif)

"Transfer" wird mithilfe der Ereignisablaufverfolgung erreicht.

!["Transfer" mit Event Sourcing](/images/20190227-001.gif)

Wie in der abbildung oben dargestellt, werden die im Transfergeschäft vorgenommenen Bilanzänderungen als Ereignisse über das Ereignisrückverfolgbarkeitsmodell gespeichert.Auch das Geschäft selbst wird realisiert, und das bringt einige benefits：

- Durch das Ereignis können Sie den Saldo des Kontos in jeder Phase wiederherstellen, die bis zu einem gewissen Grad, um die Kontobilanzverfolgung zu erreichen.
- Da die Ereignisse für beide Konten unabhängig behandelt werden.Daher wirkt sich die Verarbeitungsgeschwindigkeit der beiden Konten nicht gegenseitig aus.Beispielsweise kann sich die Übertragung von Konto B aufgrund der Notwendigkeit einer zusätzlichen Verarbeitung geringfügig verzögern, aber Konto A kann immer noch übertragen werden.
- Sie können eine asynchrone Geschäftsverarbeitung tätigen, indem Sie Ereignisse abonnieren.Zum：andere asynchrone Aktionen, z. B. das Aktualisieren von Statistiken in der Datenbank, das Senden von SMS-Benachrichtigungen usw.

Natürlich hat die Einführung des Event-Sourcing-Modus einige technische Probleme im Zusammenhang mit Event-Sourcing eingeführt.Für：der von einem Ereignis verbrauchte Speicher groß sein kann, muss eventuell Konsistenz angewendet werden, Ereignisse sind unveränderlich, die Umgestaltung kann schwierig sein usw.Diese Probleme werden in einigen Artikeln ausführlicher beschrieben.Leser können nachfolgende erweiterte Lesungen zum Verstehen und Bewerten lesen.

> Die Komplexität des Geschäfts wird nicht durch Änderungen im Systemdesign verringert, sondern einfach von einem Ort zum anderen verschoben. Immer sagen, der Mond fällt auf Ihre eigene Nahrung

## Lassen Sie die Räder drehen

Basierend auf dem allgemeinen Verständnis der Theorie des Lesers im vorherigen Abschnitt wird in diesem Abschnitt vorgestellt, wie dieses Framework im Lichte des oben beschriebenen "Transfer"-Geschäftsszenarios funktioniert.Zuerst muss der Leser die beiden Substantive dieses Rahmens verstehen.

### Claptrap

![Claptrap](/images/20190228-001.gif)

Claptrap ist ein spezieller Akteur, der in diesem Framework definiert ist.Zusätzlich zu den beiden oben genannten Merkmalen ist Claptrap definiert als mit den folgenden features：

**Status wird vom Ereignis**gesteuert.Der Status des Schauspielers wird innerhalb des Schauspielers beibehalten.Dasselbe gilt für Claptrap, aber das Ändern des Zustands von Claptrap beschränkt ihn auf Ereignisse, zusätzlich zu Änderungen innerhalb von Actor.Dadurch wird das Event-Sourcing-Muster mit dem Actor-Muster kombiniert.Die Korrektheit und Rückverfolgbarkeit des Zustands des Schauspielers wird durch den Event-Sourcing-Modus gewährleistet.Diese Ereignisse, die den Zustand von Claptrap ändern, werden von Claptrap selbst generiert.Zwischen externen Aufrufen und Klassentriggermechanismen innerhalb von Claptrap können Ereignisse auftreten.

### Minion

![Minion](/images/20190228-002.gif)

Minion ist ein besonderer Akteur, wie in diesem Framework definiert.ist eine Anpassung, die auf der Grundlage von Claptrap vorgenommen wird.Es hat die folgenden characteristics：

**können das Ereignis aus dem entsprechenden Claptrap-**lesen.Wie Claptrap wird auch der Zustand des Dieners von Ereignissen gesteuert.Der Unterschied ist, dass Minion, wie es buchstäblich tut, immer Ereignisse aus der entsprechenden Claptrap bekommt, die seinen eigenen Zustand ändern.Daher kann Claptrap asynchron behandelt werden, nachdem das Ereignis generiert wurde.

### Geschäftsumsetzung

Nun mit den Grundlagen der vorherigen, hier ist, wie dieses Framework implementiert das "Transfer"-Szenario oben.Das folgende Diagramm beginnt mit einem Blick auf die wichtigsten processes：

![Claptrap & Minion](/images/20190228-003.gif)

Wie in der abbildung oben dargestellt, ist der gesamte Prozess der allgemeine Prozess der Implementierung des Geschäftsszenarios in diesem Rahmen.Darüber hinaus gibt es einige Dinge, die beachtet werden müssen,：

- Der Anruf zwischen Client und Claptrap in der Abbildung wartet nur auf die erste Stufe, was bedeutet, dass client eine Antwort schneller erhalten kann, ohne auf das Ende des gesamten Prozesses warten zu müssen.
- Claptrap A kann Erneut Anfragen annehmen, nachdem eigene Anfragen verarbeitet und Ereignisse an Minion A gesendet wurden, was den Durchsatz von Claptrap A erhöht.
- Minion erledigt mehr als nur Anrufagenten zwischen Claptrap.In Minion können Sie auch Dinge wie：tun, Textnachrichten senden, Datenbankstatistiken aktualisieren und vieles mehr, je nach Ihren geschäftlichen Anforderungen.
- Minion kann auch einen eigenen Zustand haben, der einige der Daten in seinem eigenen Zustand hält, sodass es extern von sich selbst abfragen kann, ohne von der entsprechenden Claptrap abfragen zu müssen.Für example：die letzten 24 Stunden der Übertragung des Kontos für eine schnelle Abfrage.

### Geschäftskapazität

Wie bereits erwähnt, muss dieser Rahmen eine Systemarchitektur aufbauen, die horizontal skaliert werden kann, um dem anhaltenden Wachstum der Geschäftskapazität gerecht zu werden.Zu diesem Zeitpunkt verwendet das Framework derzeit Open-Source-[Dapr-](https://dapr.io/)die Downscailation von Anwendungen und physischen Geräten aktivieren.

Natürlich, wenn es um die Datenspeicherung geht, ist es sicherlich eine Reihe von Problemen, wie Datenbank-Clustering.Dies sind die Details der technischen Anwendung, nicht der Inhalt des Rahmentheorie-Designs.Daher kann nur dieses Framework basierend auf der oben genannten Open-Source-Architektur verkleinert werden.

Praktische Fragen während des Bewerbungsprozesses können Leser in nachfolgenden Projektinhalten nach Antworten suchen.

## Alles ist fertig

Ich glaube, Sie haben ein vorläufiges Verständnis des Rahmens.现在，进入[Newbe.Claptrap 快速入门](01-0-Quick-Start) 开始尝试该项目吧。
