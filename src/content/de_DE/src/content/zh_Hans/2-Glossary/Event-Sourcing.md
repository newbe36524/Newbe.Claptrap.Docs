---
title: 'Event Sourcing'
metaTitle: 'Event Sourcing'
metaDescription: 'Event Sourcing'
---

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

Der Ereignisablaufverfolgungsmodus ist eine Art Software-Design-Idee.Diese Art von Design-Idee unterscheidet sich in der Regel von der traditionellen System-Design-Idee basierend auf Addition und Löschung (CRUD).CruD-Anwendungen haben oft einige Einschränkungen：

1. Im Allgemeinen übernehmen CRUD-Anwendungen die Praxis, Datenspeicherung direkt zu betreiben.Eine solche Implementierung kann aufgrund unzureichender Datenbankoptimierung zu Leistungsengpässen führen, und dies kann schwierig sein, Anwendungen zu skalieren.
2. Es gibt häufig einige Daten in einem bestimmten Bereich, die die Behandlung von Parallelitätsproblemen beachten müssen, um Fehler bei Datenaktualisierungen zu vermeiden.Dies erfordert oft die Einführung verwandter Techniken wie Sperren, Transaktionen usw., um solche Probleme zu vermeiden.Dies kann aber auch zu Leistungseinbußen führen.
3. Sofern keine zusätzliche Überwachung hinzugefügt wird, ist der Verlauf der Datenänderungen im Allgemeinen nicht rückverfolgbar.Da der Datenspeicher in der Regel im Endzustand der Daten gespeichert wird.

Im Gegensatz zum CRUD-Ansatz vermeidet die Ereignisablaufverfolgung die Einschränkungen der obigen Beschreibung nach Entwurf.Im nächsten Schritt wird die grundlegende Arbeitsmethode für die Ereignisablaufverfolgung im Zusammenhang mit dem oben genannten "Transfer"-Geschäftsszenario beschrieben.

Verwenden Sie den CRUD-Ansatz zum "Übertragen".

!["Transfer" mit CRUD](/images/20190226-006.gif)

"Transfer" in Form der Ereignisrückverfolgbarkeit.

!["Transfer" mit einem Ereignisablaufverfolgungsansatz](/images/20190227-001.gif)

Wie in der abbildung oben dargestellt, werden die im Transfergeschäft vorgenommenen Bilanzänderungen ereignisbasiert über das Ereignisablaufverfolgungsmodell gespeichert.Realisiert auch das Geschäft selbst, das einige Vorteile bringt：

- Durch das Ereignis können Sie den Saldo jeder Phase des Kontos wiederherstellen, die bis zu einem gewissen Grad die Verfolgung des Kontosaldos erreicht.
- Da die Ereignisse beider Konten unabhängig behandelt werden.Daher wirkt sich die Verarbeitungsgeschwindigkeit der beiden Konten nicht gegenseitig aus.Beispielsweise kann sich die Übertragung von Konto B aufgrund zusätzlicher Verarbeitung etwas verzögern, aber Konto A kann immer noch übertragen werden.
- Sie können Ereignisse abonnieren, um eine asynchrone Verarbeitung Ihres Unternehmens zu erledigen.Zum Beispiel：Aktualisieren Sie Statistiken in der Datenbank, senden Sie SMS-Benachrichtigungen und andere asynchrone Vorgänge.

Natürlich führte die Einführung des Ereignisablaufverfolgungsmodus auch einige der damit verbundenen technischen Probleme der Ereignisablaufverfolgung ein.Zum Beispiel：Ereignisse können große Mengen an Speicher verbrauchen, eventuell muss Konsistenz angewendet werden, Ereignisse sind unveränderlich, die Umgestaltung kann schwierig sein usw.Diese verwandten Themen werden in einigen Artikeln ausführlicher beschrieben.Die Leser können die erweiterte Lektüre zum weiteren Verständnis und zur Auswertung lesen.

> Ressourcen
> 
> - [Event Sourcing-Muster](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/dn589792%28v%3dpandp.10%29)
> - [Übersetzt von Event Sourcing Pattern Chinese](https://www.infoq.cn/article/event-sourcing)
