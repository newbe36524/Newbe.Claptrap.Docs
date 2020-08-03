---
title: 'Claptrap Box.'
metaTitle: 'Claptrap Box.'
metaDescription: 'Claptrap Box.'
---

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

## Claptrap Box ermöglicht Claptrap, auf mehr Frameworks ausgeführt zu werden.

Claptrap ist ein Objekt, das basierend auf dem Actor-Muster implementiert wird.Es hat nur die Möglichkeit, Ereignis- und Zustandssteuerungsbezogene zu behandeln.Daher ist es im tatsächlichen Szenario häufig erforderlich, sich auf die spezifische Betriebsumgebung zu verlassen, um sie zu hosten, oder die externe Geschäftsschnittstelle entsprechend dem Unternehmen zu entwerfen.

Der typischste Anwendungsfall ist, mit dem Grain of Orleans zu kombinieren.Grain ist die virtuelle Actor-Implementierung von Orleans, und Claptrap ist ein Schauspieler.Wenn Claptrap und Grain kombiniert werden, entscheiden wir uns dafür, Claptrap in Grain einzuhüllen.Auf diese Weise haben wir The Actor, das Event-Tracing kombiniert, läuft in Grain, das die verteilten Funktionen von Orleans voll ausnutzt.Wenn wir Claptrap in Korn setzen, können wir uns Grain als Eine Schachtel vorstellen, und die Kombination von Objekten ist dem Fassadenmuster im Designmodus sehr ähnlich, wo Grain Claptrap mit einer Fassade versorgt, um mit der Außenseite zu kommunizieren, interne Details zu maskieren und gleichzeitig das Äußere bewusster zu machen, wie es interagiert.Hier nennen wir dies "wie Claptrap in einem bestimmten Fassadenobjekt funktioniert" als Das Claptrap Box-Muster, bei dem das Fassadenobjekt Claptrap Box genannt wird.Dieser Ansatz ermöglicht die Anwendung von Claptrap auf komplexere Plattformen und Unternehmen.In Orleans heißt diese Claptrap Box Claptrap BoxGrain.

Dank The Claptrap Box kann Claptrap die Grundbedingungen der Ereignisverfolgung und des Actor-Modus beibehalten, auch wenn er von Orleans getrennt ist.In einem einfachen Konsolenprogramm können Entwickler beispielsweise normalClaptrapBox weiterhin als Fassadenobjekt verwenden.Dies verliert jedoch den Vorteil von Orleans verteilt.

Die Existenz des Claptrap Box-Konzepts ermöglicht es Claptrap, auf grundlegenderen Plattformen und Frameworks zu arbeiten.Obwohl derzeit nur Orleans / Akka.net / kein Träger, etc. stehen für die Auswahl von Gesichtsobjekten zur Verfügung.

---

Im Folgenden finden Sie eine Story-basierte Beschreibung, um das Verständnis zu unterstützen.Kümmern Sie sich nicht zu sehr.

Claptrap ist ein hochgradig anpassbarer Roboter.Damit Claptrap in einer komplexeren Umgebung arbeiten kann, müssen Sie geladene Lasten für verschiedene reale Umgebungen so entwerfen, dass sie perfekt funktionieren.Zum Beispiel.：Claptrap, das auf dem Meeresboden arbeitet, erfordert einen Träger, der ausreicht, um dem Wasserdruck standzuhalten; Claptrap, der in einem Sumpf arbeitet, erfordert ein fallsicheres Fahrzeug; und Claptrap, der in der Nähe des Kraters arbeitet, erfordert einen Träger aus Hochtemperaturmaterialien.Diese Serie von Fahrzeugen, kollektiv bekannt als Claptrap Box.Das liegt daran, dass diese Träger alle ein gemeinsames Merkmal haben, sie sind alle voll verpackte Boxen, natürlich in verschiedenen Formen, aber wir beziehen uns gemeinsam auf Box.Mit diesen Fahrzeugen funktioniert Claptrap gut in einer Vielzahl von verschiedenen Umgebungen.

## Symbol.

![Claptrap.](/images/claptrap_icons/claptrap_box.svg)
