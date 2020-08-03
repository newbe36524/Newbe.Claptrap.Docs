---
title: 'Serialisierung'
metaTitle: 'Serialisierung'
metaDescription: 'Serialisierung'
---

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

Da Ereignisse und Zustände im Claptrap-System übertragen und gespeichert werden müssen, müssen Ereignisse und Zustände serialisiert werden, um eine Vielzahl von Transport- und Speicherszenarien bewältigen zu können.

## So wählen Sie ein Serialisierungsschema aus.

Optionale Serialisierungsmethoden sind in der Regel auf verschiedene Arten verfügbar.：JSON, MessagePack, Protobuf, etc.Serialisierungsschemata in tatsächlichen Projekten können in den folgenden Punkten berücksichtigt werden.：

1. Lesbarkeit.Wenn höhere Anforderungen an die Lesbarkeit bestehen, sollten Sie textbasierte Serialisierungsszenarien berücksichtigen.
2. Transfereffizienz, Speichernutzung.Wenn höhere Anforderungen an Übertragungseffizienz und Speicherplatz bestehen, sollten die binäreren Serialisierungsszenarien berücksichtigt werden.

Im Claptrap-System können Entwickler verschiedene Serialisierungsszenarien für verschiedene Claptraps auswählen, da jede Claptrap völlig unabhängig ist.Das einzige, was zu beachten ist, ist, dass, sobald das Serialisierungsschema ausgewählt ist, es schwierig ist, es zu ändern, so dass es in der Entwurfsphase sorgfältig berücksichtigt werden muss.

## Serialisierung und Carrier-Unabhängigkeit.

Im Claptrap-Framework sind Lagerung, Transport und Serialisierung unabhängig voneinander.Mit anderen Worten, Sie können die jSON-Serialisierung, die bei der Übertragung lesbarer ist, und die binäre Serialisierung verwenden, die der Speicherauslastung förderlicher ist, und umgekehrt.

## Serialisierung und die Einschränkung des Spediteurs.

Die Art und Weise, in der die Serialisierung auch angesichts eines bestimmten Speicher- oder Transportbearbeitungsvektors eingeschränkt ist.Zum Beispiel.：Derzeit eine Datenbank verwendet, die Binärdateien für den direkten Speicher nicht als persistente Ereignisschicht unterstützt, wird es unpraktisch, Ereignisse durch binäre Serialisierung zu speichern.Daher muss vor der Auswahl eines Serialisierungsschemas dem Transport- und Speicherszenario Priorität eingeräumt werden.

Derzeit werden alle unterstützten Serialisierungsschemata auf nuget unter dem Namen "Newbe.Claptrap.DataSerializer" veröffentlicht.
