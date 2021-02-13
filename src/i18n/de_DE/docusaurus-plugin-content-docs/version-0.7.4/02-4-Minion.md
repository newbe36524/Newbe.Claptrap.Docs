---
title: 'Minion'
description: 'Minion'
---

![Minion](/images/20190228-002.gif)

Minion ist eine spezielle Claptrap, wie in diesem Framework definiert.ist eine Anpassung, die auf der Grundlage von Claptrap vorgenommen wird.Es hat die folgenden characteristics：

**können das Ereignis aus dem entsprechenden Claptrap-**lesen.Wie Claptrap wird auch der Zustand des Dieners von Ereignissen gesteuert.Der Unterschied ist, dass Minion, wie es buchstäblich tut, immer Ereignisse aus der entsprechenden Claptrap bekommt, die seinen eigenen Zustand ändern.Daher kann Claptrap asynchron behandelt werden, nachdem das Ereignis generiert wurde.

> Minion ist abgeleitet von einem Glücksspiel, das von newbe36524[The Legend of furnace stone](https://zh.moegirl.org/%E7%82%89%E7%9F%B3%E4%BC%A0%E8%AF%B4)gespielt wird, in dem "entourage" in der englischen Version als "minion" beschrieben wird.

---

Im Folgenden finden Sie eine Storytized Beschreibung von Minion, um das Verständnis zu unterstützen.Machen Sie sich keine allzu großen Sorgen.

Eine einzelne Claptrap kann für komplexere Aufgaben schwierig zu erreichen sein.Daher, wenn sie solche Claptrap entwerfen, werden ein paar jüngere Brüder in die Claptrap hinzugefügt, wie nötig, um es bei der anstehenden Aufgabe zu unterstützen.Diese kleinen Brüder werden Minion genannt.Minion ist auch im Wesentlichen ein Claptrap Roboter, aber sie reduzieren das Handheld-Memo-Gerät im Vergleich zur Vollversion von Claptrap.Dies ist aufgrund der etwas anderen Art und Weise, wie es funktioniert und Claptrap.

Minion kann Aufgaben nur durch die Arbeit mit Claptrap ausführen, und er kann sich nicht entscheiden, ob eine Aufgabe ausgeführt werden soll.Ein Handheld-Memo, das Aufgabendetails aufzeichnet, ist also verfügbar, solange Claptrap es enthält.Wenn Claptrap eine Aufgabe abschließt, informiert es seine Minions über die Details der Aufgabe.Dadurch kann Minion den Inhalt der Aufgabe synchronisieren und seinen eigenen Speicher aktualisieren.Erklären wir dieses Arbeitsmuster mit einem Beispiel.

Nehmen wir an, wir haben jetzt einen Claptrap-Roboter in einer Nachbarschaft als Türsteher-Roboter eingesetzt.Zu seinen Aufgaben gehören die folgenden：

1. Verantwortlich für die Inspektion und Freigabe des Fahrzeugs im Türsteher
2. Verantwortlich für die Bearbeitung aller Arten von Anfragen von Passanten

Wir wissen jetzt, dass Claptrap-Roboter nur eine Sache auf einmal handhaben können, wenn sie arbeiten.Das heißt, wenn es ein Fahrzeug kontrolliert und loslässt, kann es keine Anfragen von Passanten bearbeiten.Ebenso wird sie, wenn sie von Passanten befragt wird, nicht in der Lage sein, die Inspektion und Freigabe von Fahrzeugen zu bewältigen.Das ist nicht effizient.Also haben wir diesem Claptrap einen Minion hinzugefügt, um ihn bei der Aufgabe zu unterstützen, von Passanten befragt zu werden.

Die spezifische Art zu arbeiten ist：Jeden Tag überprüft Claptrap die Situation in der Nachbarschaft und zeichnet alle spezifischen Informationen in einem Handheld-Memo auf.Und es benachrichtigt seinen Minion über die Details dieser Aufgaben.So kannte Minion alle Details über die Nachbarschaft, so dass es leicht die Anfragen von Passanten bewältigen konnte.

Mit dieser Zusammenarbeit kann sich Claptrap effizienter auf die Fahrzeuginspektion und -freigabe konzentrieren, während die Anfragen von Passanten an Minion überlassen werden.

Allerdings müssen einige Details zusätzlich erläutert werden, damit der Leser：

Warum nicht einfach eine neue Claptrap hinzufügen, um direkt auf die Anfragen von Passanten einzugehen?Ein neuer Claptrap bedeutet einen neuen Prinzipal, der Aufgaben unabhängig ausführen kann, was die Verwaltungskosten erhöht.Aber wenn Sie nur ein Minion hinzufügen, kann es von Claptrap verwaltet werden, zu dem es gehört, und ist einfacher zu verwalten als das.Natürlich, um ein wenig ein Gefühl der Generation hinzuzufügen, ist es auch verstanden, dass：Minion fehlt das Handheld-Memo-Gerät im Vergleich zu den normalen Claptrap.Die Kosten für dieses Gerät machen 99 % der gesamten Hardwarekosten aus.Warum nicht die Kosten senken, um die gleiche Aufgabe zu erfüllen?

Wäre es teuer für Claptrap, Minion über Aufgabendetails zu benachrichtigen?Nein, das wird es nicht.Claptrap und Minion sind in der Regel gang-basierte Operationen, und da die drahtlose Netzwerktechnologie sich weiter verbessert, werden die Kosten immer kleiner.5G Ermächtigung, die Zukunft ist zu erwarten.

Jetzt erwägen wir eine zusätzliche scenario：, wenn der Immobilienverwalter möchte, dass Claptrap an einem täglich geplanten Tag über den Zugang zu Fahrzeugen zur Community berichtet.In ähnlicher Weise, um das Gefühl der Insecoming zu erhöhen, könnten wir ebenso gut davon ausgehen, dass die Gemeinschaft sehr beschäftigt ist, mit Fahrzeugen, die 24 Stunden am Tag ein- und aussteigen.Wenn Sie also zeitgemäß den Zugang zum Fahrzeug melden, ist es wahrscheinlich, dass die Nachbarschaftstür blockiert wird.

Mit vorerfahrener Erfahrung können wir diese Claptrap auch mit einem neuen Minion ausstatten, um diese Aufgabe der Berichterstattung an den Immobilienverwalter zu bewältigen.Denn Claptrap benachrichtigt Minion über die Details, wenn das Fahrzeug zur Inspektion geht.Minion kennt also alle Details über den heutigen Fahrzeugzugang und gibt eine Erklärung ab, die von Minute zu Minute erfolgt.

Lassen Sie uns noch einen weiteren scenario：wir einen Blick auf die Bevölkerung werfen müssen.Dann müssen Sie nur die Informationen der Person aufzeichnen, wenn der Zellentürer Claptrap das Zugangspersonal überprüft.In ähnlicher Weise fügen wir ein Minion hinzu, um diese Kerndaten speziell zu aggregieren und die übergeordnete Abteilung zu setzen.Zufälligerhält die übergeordnete Abteilung auch den Unterdatenbericht über einen Claptrap-Roboter, und sie verfügt auch über ein Minion, um die Daten aus dem Unterbericht zusammenzufassen und an ihren Vorgesetzten zu melden.Also Claptrap1 -> Minion1 -> Claptrap2 -> Minion2 -> Claptrap3 …… Schicht nach oben.So haben wir die nationale und globale Datenzusammenfassung abgeschlossen.

Lassen Sie uns also zusammenfassen.Mit Der Ergänzung von Minion können Sie mindestens drei Dinge besser für Claptrap：

1. Unterstützung bei der Freigabe der ursprünglichen Abfrageklassenaufgaben
2. Unterstützung bei Aufgaben, die Statistiken, Benachrichtigungen usw. asynchron verarbeiten können
3. Unterstützen Sie andere Claptrap-Kollaborationen, um größere Aufgaben zu erfüllen
