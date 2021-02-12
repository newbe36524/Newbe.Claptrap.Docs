---
title: 'Actor-Modus'
description: 'Actor-Modus'
---

Das Actor-Muster ist ein Standard-Programmiermodell.Durch die Anwendung dieses Programmiermodells können einige Systeme das Problem der Komplexität lösen.Das Problem mit der hier erwähnten Union besteht darin, dass ein Computer, der dieselben Daten logisch verarbeitet, aufgrund mehrerer gleichzeitiger Anforderungen zu falschen Daten führen kann.Dies ist ein Problem, das bei der Multithreadprogrammierung auftreten muss.Als einfaches Beispiel, wenn Sie 100 Threads verwenden, um`eine<code>int`Variable im Speicher mit 100 Threads in</code>ohne  Sperre auszuführen.Dann ist das Ergebnis dieser Variable oft kleiner als 100.So vermeidet das Actor-Muster dieses Problem.

Erstens, um das Verständnis zu erleichtern, kann sich der Leser hier Schauspieler als Objekt vorstellen.In objektorientierten Sprachen (Java, C- usw.) kann der Akteur als ein Objekt betrachtet werden, das``dem neuen Schlüsselwort erstellt wurde.Aber dieses Objekt hat einige besondere characteristics：

**hat einen Zustand, der zu**gehört.Objekte können alle ihre eigenen Eigenschaften haben, was ein grundlegendes Merkmal objektorientierter Sprachen ist.Im Schauspielermodus werden diese Eigenschaften gemeinsam als Actor es State</code>`.Der Zustand des Schauspielers wird von Schauspieler selbst aufrechterhalten.</p>

<p spaces-before="0">Dies hebt zwei points：</p>

<p spaces-before="0">Erstens kann der Zustand des Schauspielers nur von selbst geändert werden, und um den Zustand des Schauspielers von außen zu ändern, kann er nur durch Aufrufen von Actor geändert werden.</p>

<p spaces-before="0"><img src="/images/20190226-001.gif" alt="Aktualisieren des Actor-Status" /></p>

<p spaces-before="0">Zweitens wird der Status des Akteurs nur innerhalb von Actor beibehalten und nicht für ein anderes Objekt als den aktuellen Actor freigegeben.Die Nicht-Freigabe hier betont auch, dass sie den internen Status von Actor nicht durch eine Änderung in einer externen Eigenschaft ändern kann.Dies ist vor allem, um es von Programmiersprachen mit "Objektreferenz" Sprachmerkmale zu unterscheiden.Für example：kann die<code>öffentliche`-Eigenschaft in`Klasse`von C- die`-Eigenschaft in<code>Klasse ändern,`</code>nachdem es sich um einen Verweistyp handelt, wenn es sich um einen Verweistyp handelt.Im Schauspielermodus ist dies jedoch nicht zulässig.

![Freigeben des Status "Akteur"](/images/20190226-003.gif)

Das Lesen von Daten von innen nach außen ist jedoch weiterhin erlaubt.

![Lesen Sie den Status "Schauspieler"](/images/20190226-002.gif)

**eingedatorten**.Der Schauspieler akzeptiert in der Regel jeweils nur einen Anruf.Die hier beschriebenen Threads sind nicht genau Threads im Computer und werden verwendet, um die "Attribute hervorzuheben, die Actor nur eine Anforderung gleichzeitig verarbeiten kann".Wenn Actor derzeit einen Anruf annimmt, werden die verbleibenden Anrufe blockiert, bis der Anruf beendet und die nächste Anforderung zugelassen wird.Dies ähnelt tatsächlich einem Mechanismus zum Synchronisieren von Sperren.Dieser Mechanismus vermeidet die Möglichkeit eines Problems mit dem Vorhandensein eines Problems beim Ändern des internen Zustands des Akteurs.Specifically：Wenn Sie 100 Threads verwenden, um einen Aufruf an einen Actor in einer`int`-Variablen zu erstellen, lassen Sie ihn``.Der endgültige Wert für diesen Zustand muss 100 sein.

![Schauspieler wird in einem Synthesizer genannt](/images/20190226-004.gif)

Single Threading ist jedoch nicht absolut, so dass 2000 verarbeitet werden kann, wenn kein Problemantrag gestellt wird.Lesen Sie beispielsweise den Status in Actor, der normalerweise kein Problem mit dem Symp hat, sodass zu diesem Zeitpunkt derselbe Vorgang zulässig ist.

![Lesen Sie Schauspieler zur gleichen Zeit](/images/20190226-005.gif)
