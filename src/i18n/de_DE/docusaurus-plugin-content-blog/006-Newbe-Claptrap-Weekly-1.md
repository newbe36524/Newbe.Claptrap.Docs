---
date: 2019-03-08
title: Newbe.Claptrap Project Weekly 1 - Noch keine Räder, zuerst mit Rädern laufen
---

Newbe.Claptrap Project Weekly 1, die erste Woche des Codes schrieb ein wenig.Aber vor allem die theoretische Machbarkeit zu betrachten.

<!-- more -->

## Was ist die Wochenzeitung?

Erfolgreiche Open-Source-Arbeiten können nicht von der aktiven Teilnahme von Community-Mitwirkenden getrennt werden.Als neu gestartetes Radprojekt hat der Mitbegründer des Projekts, Moon Landing, ein Konto：

"Ich weiß, dass Du nicht in der Lage bist, sehr gut zu programmieren, und du wirst einen wöchentlichen Bericht über deine Ideen haben."Lassen Sie andere den Wert des Projekts sehen.Das Warten auf immer mehr Menschen, um den Wert des Projekts zu entdecken, wird natürlich mehr Aufmerksamkeit schenken, auch bei der Entwicklung des projekts.Also muss man eine Wochenzeitung schreiben.Der wöchentliche Bericht konzentriert sich am besten auf die Erläuterung des Konzepts des Projekts und wie praktische Probleme durch das Projekt gelöst werden können.Natürlich können Sie auch einige Inhalte darüber enthalten, wie das Projekt gestaltet ist, aber achten Sie auf Mäßigung, in der Regel achten die Leute nicht zu viel darauf, wie das Projekt umgesetzt wird.Konzentrieren Sie sich mehr auf den Wert des Projekts.Remember：Projekt ist nur erfolgreich, wenn es Wert generiert. "

So kann der Autor nur eine Wochenzeitung schreiben, kaum in der Lage, ein Leben wie dieses zu führen.

## Das Rad hat eine Radprobe

Die neue Runde sollte den Anschein einer neuen Runde haben, "Projekteröffnung" führte die grundlegenden Theorie und Arbeitsprinzipien in Bezug auf diesen Rahmen.Da der relevante theoretische Inhalt dem Leser, der gerade in Kontakt gekommen ist, unbekannt ist, listet dieser Abschnitt den kritischsten Inhalt des vorherigen Abschnitts unten auf, um das Gedächtnis des Lesers zu stimulieren.

Das Akteurattribut i.：der Status von Actor wird geändert, indem Actor extern aufgerufen wird.

![Aktualisieren des Actor-Status](/images/20190226-001.gif)

Schauspieler verfügen über eine, die 1：der Status von Schauspieler wird nicht extern geteilt.

![Freigeben des Status "Akteur"](/images/20190226-003.gif)

Die Actor-Funktion ergänzt 2：den Actor-Status extern lesen können.

![Lesen Sie den Status "Schauspieler"](/images/20190226-002.gif)

Schauspieler-Feature II：Schauspieler arbeitet "Einfädelig" und kann nur eine Anforderung nach der anderen verarbeiten.

![Schauspieler wird in einem Synthesizer genannt](/images/20190226-004.gif)

Das Actor-Attribut ist 2-to：derselbe Lesezustand kann kein "einzelner Thread" sein.

![Lesen Sie Schauspieler zur gleichen Zeit](/images/20190226-005.gif)

Das Framework definiert den Actor-Typ, Claptrap：Actor, der Ereignisse durch Ereignismuster generiert und seinen eigenen Status durch Ereignisse ändert.

![Claptrap](/images/20190228-001.gif)

Das Framework definiert den Actor-Typ, Minion：im Vergleich zu Claptrap generiert der Diener keine Ereignisse, sondern liest Ereignisse, die Claptrap entsprechen, um seinen Status zu ändern.Mehrere Minions sind für eine Claptrap erlaubt.

![Minion](/images/20190228-002.gif)

Schließe das "Transfer"-Geschäft mit Claptrap und Minion ab.

![Claptrap & Minion](/images/20190228-003.gif)

> Mond fall großer Mann berühmt gewarnt 1：die Welt existiert nicht "Silberkugel".Ein Rahmen wird nicht alle Probleme lösen. Moon Landings berühmtes Sprichwort 2：Business-Komplexität wird nicht durch Systemdesign-Änderungen verringert, sondern nur von einem Ort zum anderen verschoben.

## Ohne Rad, zuerst mit einem Rad laufen

Jetzt haben wir die Konzepte von Claptrap und Minion.Kombinieren Sie als Nächstes einige Geschäftsszenarien, um zu experimentieren, ob das Framework eine Vielzahl von Geschäftsanforderungen erfüllen kann.

> Schöne technische Mittel können nicht mit den wirklichen Bedürfnissen und Veränderungen zu bewältigen, das können nur technische Vasen sein. Der Mond fällt kurz nach dem Erlernen des Sebotan XII Quantum Computer Instruction Set

### Das Geschäftsszenario

Es ist ein einfacher E-Commerce-system：

1. Nur ein grüner Kristall wird verkauft, und um der Beschreibung willen heißt das Produkt "Forgive Crystal".
2. Benutzer können den Saldo in ihrem Konto verwenden, um Kristalle zu kaufen.Der Restbetrag wird über ein externes Zahlungssystem aufgeladen.Ein Aufladen eines Teils ist vorerst kein Geschäftsszenario, das es zu berücksichtigen gilt.
3. Jeder Benutzer hat auch ein Integral, das zufällig auch grün ist, so dass der Kredit "Forgive Points" genannt wird.
4. Es gibt viele Möglichkeiten, Vergebungspunkte zu sammeln, wie z. B.：Benutzerregistrierung, die Einladung anderer Benutzer zur Registrierung, die Einladung zu einem Kauf, den der Eingeladene auch erhalten kann, Verzeihung ist Bergbau, in Wirklichkeit, um Vergebung zu erhalten, und so weiter, die möglicherweise im Einklang mit den nachfolgenden Aktivitäten sein müssen, um die Erfassungsmethode kontinuierlich zu erhöhen.
5. Vergebungspunkte können einen Teil des Betrags abziehen, der beim Kauf von Kristall verzeihen bezahlt werden muss.
6. Vergebungspunkte werden wahrscheinlich in Zukunft andere Verwendungen haben.
7. Die Zahlungsmethode für den Kauf von Forgive Crystal wird wahrscheinlich mehr als Saldo und Verzeihung Punkte in der Zukunft sein.

Das Obige ist eine Beschreibung der Anforderungen dieses E-Commerce-Systems.Die Nachfrage wird sich in Zukunft sicherlich ändern.

### Feature-Bewusstsein

E-Commerce-System, das wichtigste Geschäftsszenario ist natürlich mit der Transaktion von Waren-Geschäftsszenarien verbunden.Unabhängig davon, wie komplex die anderen Anforderungsszenarien sein mögen, sind handelsbezogene Geschäftsszenarien die ersten, die eine Analyse und Lösung erfordern.

Zunächst verwenden wir das Szenario "User Confirmation purchase forgiveness crystal", um in einfachen Worten zu beschreiben, was das Programm tun muss,：

1. Sie müssen überprüfen, ob das Guthaben des Benutzers ausreichend ist.
2. Wenn der Benutzer eine Gutschrift auswählt, müssen Sie überprüfen, ob das Guthaben des Benutzers ausreichend ist.
3. Sie müssen überprüfen, ob der Bestand ausreichend ist
4. Das Guthaben des Benutzers muss abgezogen werden
5. Inventar muss abgezogen werden
6. Wenn der Benutzer ein Guthaben auswählt, muss das Guthaben des Benutzers abgezogen werden.

Wenn Sie diese sechs Punkte implementieren, indem Sie das Datenblatt direkt bedienen, sollte es für die meisten Entwickler sehr einfach sein.Sie können das Geschäft abschließen, indem Sie eine Datenbanktransaktion mit mindestens einer Sperre auf Zeilenebene öffnen, die die Daten überprüft und aktualisiert.Nun, da Sie dieses Framework für die Implementierung verwenden, müssen Sie dieselben sechs Schlüsselpunkte implementieren, die auf der grundlegenden Tatsache basieren, dass "die Komplexität des Unternehmens nicht abnimmt".

### Der Prophet heißt noch nicht

Zunächst einmal, unter der Prämisse von nicht viel Diskussion, der Autor über einige der oben genannten Hauptkonzepte, entwarf die folgenden Claptrap：

| Konzept                    | Benannt in Englisch | Abkürzung |
| -------------------------- | ------------------- | --------- |
| Verzeihen Sie den Kristall | Sku                 | S         |
| Vergeben von Punkten       | UserPoint           | P         |
| Die Benutzerbalance        | UserBalance         | B         |

### Zeichnen Sie das Rad nach der Libelle

Nach dem Prozessentwurf des vorherigen "Transfer"-Geschäftsszenarios wird hier die Logik des Kaufs auf die gleiche Weise entworfen.Wie in der Abbildung below：

![Kettendesign](/images/20190307-001.gif)

Analysieren Sie diese design：

Führen Sie gemäß der Geschäftsreihenfolgelogik die Bestandsprüfung, den Lagerabzug, den Saldoscheck, den Saldoabzug, die Bonitätsprüfung, die Geschäftsschritte für den Kreditabzug aus.

Beachten Sie die Zeit, zu der die Anrufleitung zwischen Client und Claptrap S vorhanden ist, und nur am Anfang, d. h., der Client benötigt nur ein wenig Wartezeit, um eine Antwort zu erhalten.

Claptrap S kann weiterhin auf neue Anfragen reagieren, nachdem es das Ereignis an Minion S übertragen hat.Sicherstellen, dass mehrere Benutzer gleichzeitig einen Kauf tätigen, stellt sicher, dass der Artikel nicht überverkauft ist und die Antwort kurz genug ist.

Der Einstiegspunkt der gesamten Geschäftslogik ist S, das sicherstellt, dass der Benutzer zahlt, während der Lagerbestand gesperrt wird, wodurch die Situation vermieden wird, dass der Benutzer für die Waren bezahlt.

Aus Formgründen ist dieses Design **"Chain-Like Design"**.

### Gleiches Material, verschiedene Räder

Es gibt ein anderes Design.Wie in der Abbildung below：

![Baumgestaltung](/images/20190307-002.gif)

Analysieren Sie diese design：

Ein neues Claptrap W (Was für ein erstaunlicher, dass ich einen vergebenen Kristall bekomme) wurde als Einstiegspunkt für das Geschäft eingeführt, das Claptrap W implementierte, indem er andere Claptrap anrief.

Minion S, P und B sind nicht mehr an der Durchflusssteuerung des Unternehmens beteiligt, da sie bereits von Claptrap W gesteuert werden, im Vergleich zum Design im vorherigen Abschnitt.

Und wegen Minion W kann dieses Design auch teilweise Anrufe an Minion tätigen, so dass es auch zwei Formen annehmen kann.

![Baumgestaltung](/images/20190307-003.gif)

![Baumgestaltung](/images/20190307-004.gif)

Aus Formgründen ist dieses Design **"Tree-Like Design"**.

Dann gibt es eine Wahl, und da es eine Wahl gibt, dann ist hier die Verwendung von "WhyNot vergleichende Analyse" in der "Moon Boss es Software Development Tricks 32" aufgezeichnet, um zu entscheiden, welches Design use：

| Optionen       | Warum nicht?                                                                                                                                                                                                                                                                                                 | Warum!Nein!                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kettendesign   |                                                                                                                                                                                                                                                                                                              | Die Steuerung des Geschäftsflussprozesses erfolgt über Minion, ein eng gekoppeltes Design.Dies entspricht dem Kontext der Operationen von Minion und Claptrap dieses Mal.Eine offensichtliche Frage：Ob der Kunde sich entschieden hat, Punkte zu zahlen, ist eine Logik, die entweder in Minion B oder Claptrap P beurteilt wird, aber so oder so macht es keinen Sinn.<br/>Design kann bei Prozessausfällen besonders schwierig zu handhaben sein.Wenn der Kunde z. B. im letzten Schritt nicht genügend Punkte hat, muss er möglicherweise schrittweise zurücksetzen, was sehr schwierig sein kann. |
| Baumgestaltung | Dieses Design vereint die kerngewichtigsten Prozesssteuerungsinhalte des Unternehmens in einem Paar verwandter Claptrap W und Minion W.Dies ist eine sehr kohäsionshohe Leistung.<br/>basierend auf diesem Design, ist es einfach, komplexere Prozesse basierend auf Claptrap S, P und B zu erstellen. |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

Tatsächlich ist es für Leser leicht zu finden, dass die WhyNot-Vergleichs- und Analysetabelle für diese Wahl tatsächlich eine Einbahnstraße ist.Es geht natürlich darum, ein Baumdesign zu wählen.

> "Moon boss software development tricks 32", ist der Mond Landung großen Mann im täglichen Entwicklungsprozess des Software-Entwicklungsprozesses in einigen kleinen Methoden der Sammlung und Verallgemeinerung verwendet.Die meisten dieser Verfahren sind keine neuen Erfindungen.Die Mondlandungen setzen diese Methoden einfach zusammen, und um diejenigen zu erleuchten, die später, gibt es kleine Möglichkeiten, die Dinge geordneter zu machen, wenn einige Probleme analysiert und beurteilt werden.Neben der WhyNot-Vergleichsanalysemethode gibt es die bekanntere "5W1H-Anforderungsbeschreibung";

> WarumNicht vergleichende Analysemethode, einfach mehrere Themen für den Vergleich nebeneinander zu wählen, jeweils die "sollte es wählen" und "sollte es nicht wählen" Gründe, und dann ein umfassendes Urteil zu treffen und dann eine Entscheidungmethode zu treffen.Sie gilt insbesondere für die Methode, die von mehreren Streitpersonen im Streit um eine Option angewandt wird, die sicherstellt, dass die Gründe für die Erklärung getrennt in Form eines Formblatts erfasst werden, um sicherzustellen, dass es nicht an Rechtfertigungen mangelt.Auf der Grundlage der Methode werden auch einige andere Varianten wie "Grundgewichtsmessung" und "Sprachrecht der Menschen" abgeleitet.Diese Methode hat eine gewisse Verbindung und Differenz mit den Vergleichsmethoden wie "Differenzmethode" und "Differenzvergleichsmethode", sowie "Wahrscheinlichkeitsauswahlmethode" und "Erfahrungsauswahlmethode".Der Name dieser Methode soll die erste der Mondlandungen sein und ist ein Syntaxterrier.Unter Chinesen kann das "Warum nicht?" verwendet werden. "Eine solche Gegenfrage, um den Grund für die Auswahl eines Objekts anzugeben, können Sie das "Warum!Nein! "Dieser Gebetssatz ist der Grund dafür, dass man sich nicht für ein Objekt entscheidet. Warumnicht ist eigentlich eine direkte Übersetzung der vier Wörter warum nicht.

### Gute Räder sehen auch gut aus

Leser, die zuerst WhyNots vergleichende Analyse sehen, haben möglicherweise questions：gibt es keinen Grund, sich für Kettendesign zu entscheiden?

Es sollte erklärt werden, dass warumNicht vergleichende Analyse ist die Analyse von festen Szenen, so dass, wenn die Szene ändert, werden die Ergebnisse der Analyse ändern.Das heißt,**in bestimmten Szenarien hat Kettendesign seine Notwendigkeit und**.

Bevor wir also erklären, gehen wir einen anderen Ansatz, um die Beziehung zwischen Kettenentwurf und Baumentwurf：

- Merge Claptrap mit dem entsprechenden Minion
- Mit "Because... Also..." der Satz ersetzt den festen Aufruf in der Zeichnung

![Kettendesign](/images/20190307-001.gif)

Dann kann das Kettendesign in Kombination mit dem obigen Bild als：

- Weil S, so B
- Weil B, so P

Die erweiterte Semantik kann：

- Der Saldo wird weiter abgezogen, da der Lagerbestand vom Kauf abgezogen wird.
- Der Saldo wird durch den Kauf abgezogen, so dass weitere Punkte abgezogen werden

![Baumgestaltung](/images/20190307-002.gif)

Die obige Baumkonstruktion kann als：

- Weil W, so S
- Weil W, so B
- Weil W, so P

Die erweiterte Semantik kann：

- Der Bestand wurde aufgrund des Kaufs abgezogen
- Der Saldo wurde aufgrund des Kaufs abgezogen
- Punkte werden wegen des Kaufs abgezogen

Auch wenn der Autor hier nicht sehr klar erklärt, aber der Leser kann immer noch beobachten ,wegen des Kaufs und Abzugdes des Saldos, also um weitere Punkte abzuziehen" dieser Satz ist nicht ganz vernünftig, sollten die beiden in der Wirtschaft eigentlich nicht offensichtliche Vorwirkungen haben.

Dies ist auch der Grund, warum Kettendesign in diesem scenario：wenn die Anrufbeziehung zwischen den beiden keine offensichtlichen Vorfolgen hat, sind die beiden als Kettenbeziehungen für Rückrufe konzipiert.Was wahrscheinlich erreicht wird, ist ein unangemessenes Design.

Auf die andere Around：**, wenn Sie ein Kettendesign anwenden möchten.Zwischen den beiden müssen vernünftige Vorkonsequenzen bestehen.**

Bei der Bedarfsanalyse sind die derzeitigen Ursachen und Folgen jedoch später möglicherweise nicht zumutbar.Das veränderbare Geschäftsszenario und die unvollständige Stabilität der Anforderungen haben dazu geführt, dass die Baumkonstruktion mehr Probleme bewältigen kann.

Leser können versuchen, einige der verbleibenden Anforderungen im obigen Geschäftsszenario zu entwerfen.

Darüber hinaus kann der Leser das Design des in der Öffnung verwendeten "Transfer"-Szenarios überdenken, wobei ein Baumentwurf besser geeignet ist.

## Es ist eigentlich ein neues Rad

In der Eröffnung haben wir einen einfachen Vergleich des Actor-Modus mit dem CRUD-Muster vorgenommen.Jetzt gibt es eine andere Art von Design, die häufiger erwähnt wird, die "domain-driven Design" ist.

Das Konzept des domänengesteuerten Designs wird hier nicht viel eingeführt, und Leser, die mit diesem Inhalt relativ vertraut sind, können sich auf den Artikel von Microsoft MVP Mr. Tang Xuehua["Domain Model of Domain-Driven Design](http://www.cnblogs.com/netfocus/archive/2011/10/10/2204949.html)

Wenn der Leser also das domänengesteuerte Design versteht, kombinieren Sie die oben in diesem Artikel erwähnten Claptrap W, S, P und B.Vielleicht ist Claptrap S, P, B die Aggregatwurzel?Vielleicht ist Claptrap W ein App-Dienst?Der Autor denkt, dass das Actor-Modell eigentlich eine Art Weiterentwicklung von domänengesteuerten：

- Domain-gesteuertes Design berücksichtigt keine Business-Synthesizer innerhalb des Designmodells, und das Actor-Muster als eine Reihe von Synth-Programmiermodellen macht diesen Teil der Lücke aus.
- Die überwiegende Mehrheit der domänengesteuerten Frameworks (wie der Autor weiß) verwendet immer noch den allgemeinen Prozess der "Wiederherstellung von Aggregatwurzeln aus dem Speicher und speichern sie nach dem Betrieb".Das Actor-Framework, im Fall von Orleans, hält den aktivierten Actor für einen bestimmten Zeitraum im Speicher, was bedeutet, dass die Aggregatwurzel kontinuierlich im Speicher geändert werden kann, ohne dass wiederholte Wiederherstellungen aus dem Lager erforderlich sind.

Im Allgemeinen kann der Leser die Idee des domänengesteuerten Entwurfs modellieren und dann versuchen, den ursprünglichen Aggregatstamm- und Anwendungsdienst als Actor zu entwerfen, und theoretisch versuchen, zu sehen, ob die Domäne, mit der er vertraut ist, mit Actor implementiert werden kann.Vielleicht finden Leser etwas anderes.

Aufgrund der Actor- und Event-Sourcing-Muster ist der Entwurfsansatz jedoch nicht genau mit dem domänengesteuerten Modell identisch, und es gibt andere Dinge, die später zusammengestellt werden.

## Die Schlussfolgerung

Durch die Gestaltung eines Geschäftsszenarios soll dieser Artikel dem Leser wissen lassen, wie die theoretischen Konzepte dieses Frameworks verwendet werden können, um Geschäfte zu tätigen.Es enthält einige der Annahmen des Autors, so kann es dauern, den Leser mehr Zeit zu verstehen.

Aufgrund der begrenzten Berufserfahrung des Autors und mangelnder Branchenkenntnisse ist es unmöglich, genau zu beurteilen, ob das Gestaltungskonzept des Rahmens den Merkmalen einer bestimmten Branche entspricht.Wenn Sie Fragen haben, die Hilfe benötigen, wenden Sie sich bitte an dieses Projektteam.

Freunde, die sich dafür interessieren, sind herzlich eingeladen, das Projekt zu verfolgen und am Projekt teilzunehmen.

<!-- md Footer-Newbe-Claptrap.md -->
