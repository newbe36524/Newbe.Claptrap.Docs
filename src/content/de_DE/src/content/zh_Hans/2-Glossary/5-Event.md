---
title: 'Ereignisse'
metaTitle: 'Ereignisse'
metaDescription: 'Ereignisse'
---

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

Claptrap ist ein ereignisbasiertes Actor-Muster.Die Ereignisse spielen natürlich eine entscheidende Rolle.

Sie müssen Ereignisse weitergeben, wenn Sie Claptrap bearbeiten möchten.Ereignisse sind auch die einzigen Parameter, die den Claptrap-Status ändern.Wenn Sie daher ein System mit Claptrap erstellen, werden alle Systemvorgänge in Ereignisse konvertiert und an Claptrap übergeben.Ereignisse haben diese Eigenschaften.：

## Die Ereignisse sind geordnet.

Jedes Ereignis enthält eine eindeutige Seriennummer.In diesem Framework wird diese Seriennummer als Versionsnummer bezeichnet.Die Versionsnummer des Ereignisses ist eine Sequenz, die 1 um eins erhöht.Die Reihenfolge des Ereignisses stellt sicher, dass der Zustand ohne Parallelität berechnet wird.Dies ist eine wichtige Garantie für die Zuverlässigkeit der Staatlichen Daten.

Die Reihenfolge der Ereignisse gibt direkt die Reihenfolge wider, in der Claptrap Ereignisse ausführt.Und da diese Reihenfolge sichergestellt werden muss, muss Claptrap Ereignisse auf einer Ereignis-für-Ereignis-Basis behandeln.Dies passt natürlich zur einfädeligen Natur des Actor-Musters.

## Ereignisse sind unveränderlich.

Sobald ein Ereignis produziert wird, ist es unveränderlich.Der Ursprung von Ereignissen aufgrund der Unveränderlichkeit von Ereignissen macht die Daten zuverlässig.Da das Ereignis gelesen wird, ist es möglich, den Status wiederherzustellen, nachdem ein Ereignis ausgeführt wurde.Aber Unveränderlichkeit ist keine physische Einschränkung.Sie können Ereignisdaten weiterhin im physischen Speicher ändern.Bitte beachten Sie jedoch, dass dies ein gefährliches und äußerst unempfohlenes Verhalten ist.Beziehen wir uns auf das "offene und enge Prinzip" im Design-Modus, das als "offen für Erweiterung, geschlossen für Modifikationen" zusammengefasst werden kann.Warum sollte der Schwerpunkt auf "geschlossen für Änderungen" liegen?Nach Ansicht des Autors ist der Grund für die Schließung der Änderung eigentlich auf die unbekannte Natur zurückzuführen, die durch die Änderung bewirkt wurde.Aufgrund der früheren Ausführung des Codes werden die Daten generiert.Sie alle haben ein gewisses Maß an Schließung gebildet.Sie wurden durch bestehende Tests validiert.Wenn Sie versuchen, sie zu ändern, müssen Sie die Tests anpassen, was die Änderungen weiter verschärft, was nicht gut ist.Die Unveränderlichkeit von Ereignissen ist eine Voraussetzung.

Was ist also, wenn die in der Vergangenheit generierten Ereignisdaten aufgrund eines FEHLERs falsch sind und der Fehler jetzt behoben werden muss?Der Rat des Autors ist nicht zu versuchen, vorhandene Ereignisse zu ändern.Neue Ereignisse und Algorithmen sollten angehängt werden, um den aktuellen Status zu korrigieren.Passen Sie alte Inhalte nicht an.Der Autor ist der Ansicht, dass dies eher dem Prinzip des Öffnens und Schließens entspricht.Entwickler liegen in ihrem Ermessen.

## Die Veranstaltung ist permanent.

Ereignisse sind ein wichtiger Parameter, um die Korrektheit des Claptrap-Status zu gewährleisten.Daher müssen Sie sicherstellen, dass das Ereignis dauerhaft gespeichert wird.Dies ist jedoch kein absoluter Fall, und wenn die folgenden Bedingungen erfüllt sind, darf das Ereignis verloren gehen.：

1. Es gibt einen permanenten Statusmomentaufnahme, bevor das Ereignis verloren geht.
2. Die entsprechende Claptrap ist tot und wird nie wieder aktiviert.

Umgekehrt ist es wichtig, sicherzustellen, dass Ereignisse in der Produktionsumgebung ordnungsgemäß in der Persistenzschicht beibehalten werden und dass entsprechende Notfalltoleranzscans durchgeführt werden.

## Symbol.

![Claptrap.](/images/claptrap_icons/event.svg)
