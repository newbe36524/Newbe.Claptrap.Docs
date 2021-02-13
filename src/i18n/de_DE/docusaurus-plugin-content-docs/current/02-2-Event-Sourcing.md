---
title: 'Event Sourcing'
description: 'Event Sourcing'
---

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

> Ressourcen
> 
> - [Event Sourcing-Muster](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/dn589792%28v%3dpandp.10%29)
> - [Event Sourcing Pattern Chinesische Übersetzung](https://www.infoq.cn/article/event-sourcing)
