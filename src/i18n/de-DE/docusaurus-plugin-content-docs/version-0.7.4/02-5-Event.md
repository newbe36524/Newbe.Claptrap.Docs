---
title: 'Ereignisse'
description: 'Ereignisse'
---

Claptrap ist ein ereignisbasiertes Actor-Muster.Die Ereignisse spielen natürlich eine entscheidende Rolle.

Um Claptrap zu betreiben, müssen Sie Ereignisse an Sie übergeben.Ereignisse sind auch die einzigen Parameter, die den Claptrap-Status ändern.Wenn Sie daher ein System mit Claptrap erstellen, werden alle Systemvorgänge in Ereignisse konvertiert und an Claptrap übergeben.Veranstaltungen haben folgende characteristics：

## Veranstaltungen werden bestellt

Jedes Ereignis enthält eine eindeutige Seriennummer.In diesem Framework wird diese Seriennummer als Versionsnummer bezeichnet.Die Versionsnummer des Ereignisses ist eine Sequenz, die um 1 von 1 erhöht wird.Die Reihenfolge des Ereignisses stellt sicher, dass es kein Problem mit der Berechnung des Zustands gibt.Dies ist eine wichtige Garantie für die Zuverlässigkeit von Zustandsdaten.

Die Reihenfolge der Ereignisse gibt direkt die Reihenfolge wider, in der Claptrap Ereignisse ausführt.Da diese Reihenfolge sichergestellt werden muss, muss Claptrap Ereignisse von Fall zu Fall behandeln, wenn Ereignisse ausgeführt werden.Das passt natürlich zur Einfädelnatur des Actor-Musters.

## Ereignisse werden imm geändert

Sobald ein Ereignis eintritt, ist es unm veränderbar.Die Ereignisrückverfolgbarkeit macht die Daten gerade wegen der Unveränderlichkeit des Ereignisses zuverlässig.Denn solange Sie das Ereignis lesen, können Sie den Status wiederherstellen, nachdem ein Ereignis ausgeführt wurde.Aber Unveränderlichkeit ist keine physische Einschränkung.Sie können Ereignisdaten weiterhin im physischen Speicher ändern.Bitte beachten Sie jedoch, dass dies ein gefährliches und äußerst unkluges Verhalten ist.Lassen Sie uns das "offene und schließende Prinzip" im Design-Modus kontaktieren, der Klassiker kann als "offen für Erweiterung, geschlossen für Modifikation" zusammengefasst werden.Warum sollten wir "geschlossen für Änderungen" betonen?Aus Sicht des Autors ist der Grund für die Änderung der Schließung eigentlich auf die unbekannte Natur durch die Änderung.Aufgrund des in der Vergangenheit ausgeführten Codes werden die resultierenden Daten.Sie alle haben ein gewisses Maß an Schließung gebildet.Sie wurden durch bestehende Tests validiert.Wenn Sie versuchen, sie zu ändern, müssen Sie die Tests anpassen, und das verschlimmert die Änderungen weiter, was nicht gut ist.Die immedic Natur der Veranstaltung ist eine Art von Natur, sondern auch eine Art von Anforderung.

Was also, wenn ein BUG in der Vergangenheit falsche Ereignisdaten verursacht und jetzt behoben werden muss?Der Rat des Autors ist nicht zu versuchen, vorhandene Ereignisse zu ändern.Neue Ereignisse und Algorithmen sollten angehängt werden, um den aktuellen Status zu korrigieren.Passen Sie den alten Inhalt nicht an.Der Autor ist der Ansicht, dass dies eher dem Prinzip des Öffnens und Schließens entspricht.Entwickler können dies nach eigenem Ermessen tun.

## Die Veranstaltung ist permanent

Ereignisse sind wichtige Parameter, um sicherzustellen, dass der Claptrap-Status korrekt ist.Daher müssen Sie sicherstellen, dass das Ereignis dauerhaft gespeichert wird.Dies ist jedoch kein absoluter Fall, und wenn die folgenden Bedingungen erfüllt sind, dann lässt das Ereignis die：

1. Es gibt einen permanenten Status-Snapshot, bevor das Ereignis verloren geht
2. Die entsprechende Claptrap ist tot und wird nie wieder aktiviert

Umgekehrt ist es, wenn die oben genannten Bedingungen nicht erfüllt sind, wichtig, sicherzustellen, dass Ereignisse in der Produktionsumgebung ordnungsgemäß in der Persistenzschicht erhalten bleiben und dass geeignete Mittel zur Katastrophentoleranz vorhanden sind.

## Symbol

![Claptrap](/images/claptrap_icons/event.svg)
