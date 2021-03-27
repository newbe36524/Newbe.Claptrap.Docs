---
title: 'Claptrap Box'
description: 'Claptrap Box'
---


## Claptrap Box ermöglicht Claptrap, auf mehr Frameworks zu laufen

Claptrap ist ein Objekt, das basierend auf dem Actor-Muster implementiert wird.Es hat nur die Möglichkeit, Ereignisse und Probleme im Zusammenhang mit der Staatlichen Kontrolle zu behandeln.Daher müssen Sie sich im aktuellen Szenario häufig auf die spezifische Betriebsumgebung verlassen, um sie zu übertragen, oder die externe Geschäftsschnittstelle entsprechend dem Unternehmen entwerfen.

Der typischste Anwendungsfall ist die Kombination mit Grain of Orleans.Grain ist eine virtuelle Actor-Implementierung für Orleans, und Claptrap ist Schauspieler.Als Claptrap und Grain kombiniert wurden, entschieden wir uns, Claptrap in Grain einzukapseln.Auf diese Weise machen wir Claptrap, einen event-traced Actor, in Grain laufen, die die Unterstützung von Orleans für verteilte Funktionen nutzt.Wenn wir Claptrap in Korn setzen, um zu laufen, können wir uns Grain als eine Box vorstellen, die Objekte kombiniert, die dem Gesichtsmuster im Designmodus sehr ähnlich sind, und Grain bietet Claptrap ein Gesicht, um mit der Außenseite zu kommunizieren, die internen Details abzuschirmen und gleichzeitig das Äußere besser zu verstehen, wie es interagiert.Hier beziehen wir uns auf dieses "wie Claptrap für die Ausführung in einem bestimmten Gesichtsobjekt" als Claptrap Box-Modus, in dem das Gesichtsobjekt Claptrap Box genannt wird.Dieser Ansatz ermöglicht die Anwendung von Claptrap auf komplexere Plattformen und Unternehmen.In Orleans heißt diese Claptrap Box ClaptrapBoxGrain.

Aufgrund der Claptrap Box kann Claptrap die Grundbedingungen der Event-Sourcing und actor-Modus beibehalten, auch wenn es von Orleans getrennt ist.In einem einfachen Konsolenprogramm können Entwickler beispielsweise weiterhin NormalClaptrapBox als Gesichtsobjekt verwenden.Dies verliert jedoch den Vorteil von Orleans verteilt.

Das Claptrap Box-Konzept ermöglicht es Claptrap, auf weiteren zugrunde liegenden Plattformen und Frameworks zu laufen.Obwohl derzeit nur Orleans / Akka.net / unversiegelt, etc. können Gesichtsobjekte ausgewählt werden.

---

Im Folgenden finden Sie eine erzählerbezogene Beschreibung, um das Verständnis zu unterstützen.Machen Sie sich keine allzu großen Sorgen.

Claptrap ist ein hochgradig anpassbarer Roboter.Damit Claptrap in farbenfroheren und komplexeren Umgebungen arbeiten kann, müssen einige Träger, die mit Claptrap geladen werden können, für verschiedene reale Umgebungen entwickelt werden, damit sie einwandfrei funktionieren können.Zum Beispiel muss：Claptrap, die auf dem Meeresboden arbeitet, mit einem Fahrzeug ausgestattet werden, das ausreicht, um dem Wasserdruck standzuhalten, Claptrap, das in einem Sumpf arbeitet, mit einem feuchtigkeitsdichten Träger ausgestattet sein muss und Claptrap, der in der Nähe des Kraters arbeitet, muss mit einem Träger aus hochtemperaturbeständigen Materialien ausgestattet sein.Diese Serie von Trägern nennen wir gemeinsam Claptrap Box.Das liegt daran, dass diese Träger alle ein gemeinsames Merkmal haben, sie sind alle voll verpackt, natürlich, verschiedene Formen, aber wir nennen gemeinsam Box.Mit diesen Trägern kann Claptrap in einer Vielzahl von Umgebungen gut funktionieren.

## Symbol

![Claptrap](/images/claptrap_icons/claptrap_box.svg)
