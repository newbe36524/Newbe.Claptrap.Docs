---
title: 'Zustands-Snapshot'
metaTitle: 'Zustands-Snapshot'
metaDescription: 'Zustands-Snapshot'
---

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

## State Snapshot beschleunigt die Zustandswiederherstellungsgeschwindigkeit.

Eine aktive Claptrap, deren Status der aktuelle Status der neuesten Daten ist.Dies wird aus der Persistenzebene wiederhergestellt, indem der Ursprung von Ereignissen nachverfolgt wird.Manchmal kann die Anzahl der Ereignisse sehr groß sein.Es wird mehr Zeit in Anspruch nehmen, den Zustand durch Ereignisse wiederherzustellen.Daher wird im Claptrap-Framework ein Statusmomentaufnahme bereitgestellt, um den Status einer bestimmten Claptrap nach einer bestimmten Bedingung beizubehalten.Dieser Zustand ist in der Regel die folgende.：

1. Mehrere Ereignisse wurden ausgeführt.
2. Bei Claptrap Deactive.
3. In einem bestimmten Zeitraum.

Das Vorhandensein von Ereignismomentaufnahmen erhöht die Geschwindigkeit, mit der Zustände aus dem persistenten Layer wiederhergestellt werden.Wenn ein Snapshot in der persistenten Ebene vorhanden ist, wird in der Regel in den folgenden Schritten eine Zustandswiederherstellung durchgeführt.：

1. Lesen Sie den Status-Snapshot.
2. Beginnend mit der Versionsnummer, die dem Status-Snapshot entspricht, lesen Sie alle Ereignisse rückwärts für Statusaktualisierungen.
3. Aktualisieren Sie den Status, bis der persistente Layer keine verbleibenden Ereignisse enthält.

Wenn jedoch keine Snapshots vorhanden sind, ändert sich der Wiederherstellungsschritt im Folgenden.：

1. Erstellen Sie den Anfangszustand über eine benutzerdefinierte Methode.
2. Lesen Sie alle Ereignisse aus der Ereignisbibliothek, um den Status zu aktualisieren.
3. Aktualisieren Sie den Status, bis der persistente Layer keine verbleibenden Ereignisse enthält.

Aber.Das Vorhandensein von Schnappschüssen bringt auch einige Spezialität.In Kombination mit den oben genannten Arbeitsschritten ist es leicht zu erkennen, dass, sobald ein Schnappschuss gebildet wird.：

1. Die benutzerdefinierte Methode des Benutzers wird nicht mehr ausgeführt.
2. Ereignisse, die kleiner als die Snapshotversionsnummer sind, werden nicht erneut ausgeführt.

Derzeit kann das Framework nur einen endgültigen Snapshot für jede ID enthalten.
