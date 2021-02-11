---
title: 'Claptrap'
description: 'Claptrap'
---

Einfach ausgedrückt, Claptrap [Actor](02-1-Actor-Pattern) [Event trace](02-2-Event-Sourcing)

![Claptrap](/images/20190228-001.gif)

Claptrap ist ein spezieller Akteur, der in diesem Framework definiert ist.Zusätzlich zu den zugrunde liegenden Funktionen des Akteurs ist Claptrap definiert als mit den folgenden：

**Status wird vom Ereignis**gesteuert.Der Status des Schauspielers wird innerhalb des Schauspielers beibehalten.Dasselbe gilt für Claptrap, aber das Ändern des Zustands von Claptrap beschränkt es auf Ereignisse, zusätzlich zu Actor.Dadurch wird das Event-Sourcing-Muster mit dem Actor-Muster kombiniert.Die Korrektheit und Rückverfolgbarkeit des Zustands des Schauspielers wird durch den Event-Sourcing-Modus gewährleistet.Diese Ereignisse, die den Zustand von Claptrap ändern, werden von Claptrap selbst generiert.Zwischen externen Aufrufen und Klassentriggermechanismen innerhalb von Claptrap können Ereignisse auftreten.

> Claptrap ist ein klassischer Charakter in einem alten Spiel, das newbe36524 gespielt hat.[klicken Sie hier für](https://zh.moegirl.org/%E5%B0%8F%E5%90%B5%E9%97%B9)

---

Im Folgenden finden Sie eine Storytized Beschreibung von Claptrap, um das Verständnis zu unterstützen.Machen Sie sich keine allzu großen Sorgen.

Claptrap ist eine einfache Struktur und einfache Funktion Roboter.Obwohl es eine Vielzahl von Aufgaben ausführen kann, hat es einige Einschränkungen.

Claptrap ist ein Einfädelroboter, der jeweils nur eine Aufgabe ausführen kann.Wenn Sie ihm mehrere Aufgaben zuweisen möchten, wird es nacheinander in der Reihenfolge behandelt, in der die Dinge angeordnet sind.

Claptraps Job ist wahrscheinlich so.Wenn er eine Aufgabe annimmt, wird er zunächst überlegen, ob sie zu 100 Prozent erfüllt ist.Wenn er es zu 100 Prozent schaffen kann, schreiben Sie es in sein Memo und beenden Sie es.Fahren Sie dann mit der nächsten Sache fort.

Das erste, was Claptrap jeden Morgen tut, ist sein verlorenes Selbst zu finden.Holen Sie sich das große Selbst zurück, das Sie gestern waren.Zuallererst wird es versuchen zu sehen, ob es irgendwelche schönen Bilder von gestern, wenn überhaupt, wird es das Aussehen von gestern neu gravieren.Lesen Sie als nächstes aus dem Memo in Ihrer Hand, was nach dem gestrigen Fotoshooting passiert ist, und stellen Sie nach und nach Ihr Gedächtnis wieder her.Auf diese Weise, der Erfolg der Erholung ihrer eigenen.

Claptrap ist ein standardisierter Roboter.Sie werden alle auf der Produktionslinie im Werk Claptrap produziert.Die Anlage montiert einen Claptrap Roboter mit standardisierten Komponenten nach dem Claptrap-Design.Zu diesen erforderlichen Komponenten gehören：Speicher, Handheld-Memos, Multifunktions-Taskprozessoren und Speicherdrucker.

Speicher.Claptrap ist mit einem benutzerdefinierten Speicher ausgestattet, der die aktuellen Statusdaten für die gesamte Maschine enthält.Wenn Claptrap die Stromversorgung verliert, gehen die Daten im Speicher aufgrund der Abschaltmenge verloren.

Multifunktionaler Taskprozessor.Aus Kostengründen ist jede Claptrap mit einem Multitask-Prozessor ausgestattet, der für spezielle Aufgaben angepasst ist.Für：Claptrap, die sich auf die Brandbekämpfung spezialisiert hat, gehören grundsätzlich feuerbezogene Funktionen zu ihren Multifunktions-Taskprozessoren.Aber es kann nicht mit hausaufgaben.

Handnotizen.Vor jeder Aufgabe zeichnet Claptrap alle Details der Aufgabe mit einem Hand-Memo auf, um sicherzustellen, dass jedes Detail der Aufgabe korrekt ist.

Speicherdrucker.Die Daten im Speicher können in ein physisches Format gedruckt werden, das beibehalten werden kann, und mehr DNA-Speicher werden in der tatsächlichen Produktion verwendet.Aufgrund der Abschalten von Speicherdaten können die Daten im Speicher nach dem Neustart nur nacheinander über Memo-Datensätze abgerufen werden.Da die Memo-Daten jedoch wahrscheinlich groß sind, wird die Wiederherstellung nur langsam erfolgen.Mit Hilfe eines Speicherdruckers können Sie den Speicherstatus zu einem bestimmten Zeitpunkt ausdrucken, wodurch die Speicherdatenwiederherstellung beschleunigt wird, wenn Sie die Wiederherstellung neu starten.

## Symbol

![Claptrap](/images/claptrap_icons/claptrap.svg)
