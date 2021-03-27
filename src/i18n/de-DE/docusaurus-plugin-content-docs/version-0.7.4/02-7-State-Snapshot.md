---
title: 'Zustands-Snapshot'
description: 'Zustands-Snapshot'
---

## State Snapshot beschleunigt die Zustandswiederherstellungsgeschwindigkeit

Eine aktive Claptrap, deren Status der aktuelle Status der neuesten Daten ist.Dies wird von der Persistenzschicht durch Ereignisbeschaffung wiederhergestellt.Manchmal kann die Anzahl der Ereignisse sehr groß sein.Die Wiederherstellung des Zustands durch Ereignisse wird mehr Zeit in Anspruch nehmen.Daher wird im Claptrap-Framework ein Statusmomentaufnahme bereitgestellt, um den Status einer bestimmten Claptrap nach einer bestimmten Bedingung beizubehalten.Dieser Zustand ist in der Regel die following：

1. Nachdem mehrere Ereignisse ausgeführt wurden.
2. Bei Claptrap Deactive.
3. Über einen bestimmten Zeitraum.

Das Vorhandensein von Ereignismomentaufnahmen erhöht die Geschwindigkeit, mit der Zustände aus dem persistenten Layer wiederhergestellt werden.Wenn ein Snapshot in einer persistenten Ebene vorhanden ist, wird die Wiederherstellung eines Zustands in der Regel durch folgende：

1. Lesen Sie den Status-Snapshot.
2. Beginnen Sie mit der Versionsnummer für den Status-Snapshot und lesen Sie alle Ereignisse für Statusaktualisierungen zurück.
3. Aktualisieren Sie den Status, bis der Persistenz-Layer keine verbleibenden Ereignisse enthält.

Wenn jedoch keine Momentaufnahme vorhanden ist, wird der Wiederherstellungsschritt zum folgenden：

1. Erstellen Sie einen Anfangszustand über eine benutzerdefinierte Methode.
2. Lesen Sie alle Ereignisse aus der Ereignisbibliothek für Statusaktualisierungen.
3. Aktualisieren Sie den Status, bis der Persistenz-Layer keine verbleibenden Ereignisse enthält.

Aber.Die Existenz von Schnappschüssen bringt auch eine gewisse Spezialität.In Kombination mit den oben genannten Schritten ist es leicht zu erkennen, dass, sobald eine Momentaufnahme：

1. Die benutzerdefinierte Methode des Benutzers wird nicht mehr ausgeführt.
2. Ereignisse, die kleiner als die Snapshotversionsnummer sind, werden nicht erneut ausgeführt.

Derzeit kann das Framework nur einen endgültigen Snapshot für jede ID enthalten.
