---
title: 'Claptrap'
metaTitle: 'Claptrap'
metaDescription: 'Claptrap'
---

> [当前查看的版本是由机器翻译自简体中文，并进行人工校对的结果。若文档中存在任何翻译不当的地方，欢迎点击此处提交您的翻译建议。](https://crwd.in/newbeclaptrap)

Kurz gesagt, Claptrap . . . [Schauspieler](/zh_Hans/2-Glossary/Actor-Pattern) + [Ereignisablaufverfolgung](/zh_Hans/2-Glossary/Event-Sourcing)

![Claptrap](/images/20190228-001.gif)

Claptrap ist ein spezieller Akteur, der in diesem Framework definiert ist.除了 Actor 的基础特性之外，Claptrap 还被定义为具有以下特性：

**Der Zustand wird durch das Ereignis gesteuert**。Der Status des Schauspielers wird innerhalb des Schauspielers beibehalten.Dasselbe gilt für Claptrap, aber die Änderung des Zustands von Claptrap, zusätzlich zum Actor, beschränkt es auf Änderungen nur durch Ereignisse.Dadurch wird das Ereignisrückverfolgbarkeitsmuster mit dem Actor-Muster kombiniert.Die Korrektheit und Rückverfolgbarkeit des Actor-Status wird durch den Ereignisrückverfolgbarkeitsmodus gewährleistet.Diese Ereignisse, die den Zustand von Claptrap ändern, werden von Claptrap selbst generiert.Das Ereignis kann aufgrund eines externen Aufrufs oder aufgrund eines Klassentriggermechanismus in Claptrap auftreten.

> Claptrap 是 newbe36524 曾经玩过的一款老游戏中的经典角色。[点击此处了解](https://zh.moegirl.org/%E5%B0%8F%E5%90%B5%E9%97%B9)

---

Im Folgenden finden Sie eine Story-basierte Beschreibung von Claptrap, um das Verständnis zu unterstützen.Kümmern Sie sich nicht zu sehr.

Claptrap ist ein einfach zu strukturierender, funktionaler Roboter.Obwohl es eine Vielzahl von Aufgaben ausführen kann, hat es einige Einschränkungen.

Claptrap ist ein Einfädelroboter, der jeweils nur eine Aufgabe ausführen kann.Wenn Sie ihm mehrere Aufgaben zuweisen möchten, wird es nacheinander in der Reihenfolge behandelt, in der die Dinge geplant sind.

Claptraps Arbeit ist wahrscheinlich so.Wenn er eine Aufgabe annimmt, wird er zunächst überlegen, ob er das zu 100 Prozent machen kann.Wenn er es zu 100 Prozent tun kann, dann schreibe es in sein Memo und beende es.Fahren Sie dann mit der nächsten Sache fort.

Das erste, was Claptrap jeden Morgen tut, ist, ihr verlorenes Selbst zu finden.Holen Sie sich den Stock von sich selbst gestern zurück.Zuallererst wird sie versuchen zu sehen, ob es das schöne Bild von gestern gibt, wenn es sie gibt, wird sie das Aussehen von gestern wieder ins Spiel setzen.Lesen Sie als nächstes aus dem Memo in Ihrer Hand, was nach dem gestrigen Fotoshooting passiert ist, und stellen Sie nach und nach Ihr Gedächtnis wieder her.Dies wird es gelingen, sich selbst zu finden.

Claptrap ist ein standardisierter Roboter.Sie werden alle auf der Produktionslinie der Claptrap-Anlage produziert.Die Fabrik montiert einen Claptrap Roboter mit standardisierten Komponenten basierend auf dem Claptrap-Design.Zu diesen notwendigen Komponenten gehören unter anderem:：Speicher, Handnotizen, Multifunktions-Taskprozessoren und Speicherdrucker.

Speicher.Claptrap ist mit einem benutzerdefinierten Speicher ausgestattet, der die Zustandsdaten der aktuellen Maschine enthält.Aufgrund des flüchtigen Stromausfalls von Speicherdaten gehen die Daten im Speicher verloren, wenn Claptrap die Stromversorgung verliert.

Mehrzweck-Taskprozessor.Aus Kostengründen ist jede Claptrap mit einem Mehrzweck-Taskprozessor ausgestattet, der auf spezielle Aufgaben zugeschnitten ist.Zum Beispiel：Claptrap, das dem Feuer gewidmet ist, umfasst im Wesentlichen feuerbezogene Funktionen in ihren Mehrzweck-Task-Prozessoren.Aber es kann nicht mit inländischen Aufgaben umgehen.

Handheld-Memo.Claptrap verwendet ein Handheld-Memo, um alle Details der Aufgabe aufzuzeichnen, bevor sie jede Aufgabe ausführen, um sicherzustellen, dass jedes Detail der Aufgabe korrekt ist.

Speicherdrucker.Die Daten im Speicher können in ein physisches Format gedruckt werden, das beibehalten werden kann, und mehr in der realen Produktion ist der DNA-Speicher.Aufgrund des flüchtigen Stromausfalls von Speicherdaten können die Daten im Arbeitsspeicher nach dem Neustart nur nacheinander über Memo-Datensätze abgerufen werden.Da die Memo-Daten jedoch wahrscheinlich groß sind, wird die Wiederherstellung nur langsam erfolgen.Mit Hilfe eines Speicherdruckers können Sie den Speicherstatus zu einem bestimmten Zeitpunkt vollständig ausdrucken, wodurch die Speicherdatenwiederherstellung beschleunigt wird, wenn Sie die Wiederherstellung neu starten.
