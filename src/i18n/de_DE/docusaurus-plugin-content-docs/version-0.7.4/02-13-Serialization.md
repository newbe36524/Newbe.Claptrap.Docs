---
title: 'Serialisierung'
description: 'Serialisierung'
---


Da Ereignisse und Zustände in einem Claptrap-System übertragen und gespeichert werden müssen, müssen Ereignisse und Zustände serialisiert werden, um eine Vielzahl von Transport- und Speicherszenarien zu bewältigen.

## Auswählen eines Serialisierungsschemas

Es gibt eine Vielzahl von Optionen für die Serialisierung, in der Regel：JSON, MessagePack, Protobuf und mehr.Die serialisierten Szenarien im eigentlichen Projekt können anhand der folgenden points：

1. Lesbarkeit.Wenn höhere Anforderungen an die Lesbarkeit bestehen, sollten Sie die textbasierte Serialisierung berücksichtigen.
2. Übertragungseffizienz, Speichernutzung.Wenn höhere Anforderungen an Transporteffizienz und Speicherplatz bestehen, sollte die binärere Serialisierung in Betracht gezogen werden.

Im Claptrap-System können Entwickler verschiedene Serialisierungsschemata für verschiedene Claptrap auswählen, da jede Claptrap vollständig anpassbar ist.Das einzige, was zu beachten ist, ist, dass das Serialisierungsschema schwierig zu ändern ist, sobald es ausgewählt wurde, daher muss es in der Entwurfsphase sorgfältig geprüft werden.

## Serialisierung und Carrier-Unabhängigkeit

Im Claptrap-Framework sind Lagerung, Transport und Serialisierung unabhängig voneinander.Mit anderen Worten, Sie können während der Übertragung eine lesefreundlichere JSON-Serialisierung verwenden, eine binäre Serialisierung auswählen, die der Speicherauslastung förderlicher ist, und umgekehrt.

## Serialisierungs- und Trägereinschränkungen

Die Serialisierung wird auch angesichts spezifischer Speicher- oder Transportvektoren eingeschränkt.Für example：Sie derzeit eine Datenbank verwenden, die binären direkten Speicher nicht als persistenten Layer für Ereignisse unterstützt, wird die Auswahl, um Ereignisse durch binäre Serialisierung zu speichern, nicht mehr aufzuhalten.Daher müssen Sie vor der Auswahl eines Serialisierungsschemas die Transport- und Speicherszenarien priorisieren.

Derzeit werden alle unterstützten Serialisierungsschemata auf nuget unter dem Namen "Newbe.Claptrap.DataSerializer" veröffentlicht.
