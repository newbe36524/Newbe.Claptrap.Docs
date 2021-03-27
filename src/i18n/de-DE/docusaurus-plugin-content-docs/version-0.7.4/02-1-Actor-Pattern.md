---
title: "Actor-Modus"
description: "Actor-Modus"
---

Das Actor-Muster ist ein Standard-Programmiermodell.Durch die Anwendung dieses Programmiermodells können einige Systeme das Problem der Komplexität lösen.Das Problem mit der hier erwähnten Union besteht darin, dass ein Computer, der dieselben Daten logisch verarbeitet, aufgrund mehrerer gleichzeitiger Anforderungen zu falschen Daten führen kann.Dies ist ein Problem, das bei der Multithreadprogrammierung auftreten muss.Um ein einfaches Beispiel zu geben, wenn Sie 100 Threads in einer nicht-synchronen Sperre verwenden, um einen s. . . Vorgang für eine int-Variable im Speicher auszuführen.Dann ist das Ergebnis dieser Variable oft kleiner als 100.So vermeidet das Actor-Muster dieses Problem.

Erstens, um das Verständnis zu erleichtern, kann sich der Leser hier Schauspieler als Objekt vorstellen.在面向对象的语言（Java、C#等）当中，可以认为 Actor 就是通过 new 关键词创建出来的对象。Aber dieses Objekt hat einige besondere characteristics：

**hat einen Zustand, der zu**gehört.Objekte können alle ihre eigenen Eigenschaften haben, was ein grundlegendes Merkmal objektorientierter Sprachen ist.在 Actor 模式中，这些属性都被统称为 Actor 的状态（State） 。Der Zustand des Schauspielers wird von Schauspieler selbst aufrechterhalten.

Dies hebt zwei points：

Erstens kann der Zustand des Schauspielers nur von selbst geändert werden, und um den Zustand des Schauspielers von außen zu ändern, kann er nur durch Aufrufen von Actor geändert werden.

![Aktualisieren des Actor-Status](/images/20190226-001.gif)

Zweitens wird der Status des Akteurs nur innerhalb von Actor beibehalten und nicht für ein anderes Objekt als den aktuellen Actor freigegeben.Die Nicht-Freigabe hier betont auch, dass sie den internen Status von Actor nicht durch eine Änderung in einer externen Eigenschaft ändern kann.Dies ist vor allem, um es von Programmiersprachen mit "Objektreferenz" Sprachmerkmale zu unterscheiden.例如：在 C#的 class 的 public 属性，假如是引用类型，那么在外部获得这个 class 之后是可以改变 class 中的属性的。Im Schauspielermodus ist dies jedoch nicht zulässig.

![Freigeben des Status "Akteur"](/images/20190226-003.gif)

Das Lesen von Daten von innen nach außen ist jedoch weiterhin erlaubt.

![Lesen Sie den Status "Schauspieler"](/images/20190226-002.gif)

**eingedatorten**.Der Schauspieler akzeptiert in der Regel jeweils nur einen Anruf.Die hier beschriebenen Threads sind nicht genau Threads im Computer und werden verwendet, um die "Attribute hervorzuheben, die Actor nur eine Anforderung gleichzeitig verarbeiten kann".Wenn Actor derzeit einen Anruf annimmt, werden die verbleibenden Anrufe blockiert, bis der Anruf beendet und die nächste Anforderung zugelassen wird.Dies ähnelt tatsächlich einem Mechanismus zum Synchronisieren von Sperren.Dieser Mechanismus vermeidet die Möglichkeit eines Problems mit dem Vorhandensein eines Problems beim Ändern des internen Zustands des Akteurs.具体一点说明：如果使用 100 个线程对一个 Actor 进行并发调用，让 Actor 对状态中的一个 int 变量进行 ++ 操作。Der endgültige Wert für diesen Zustand muss 100 sein.

![Schauspieler wird in einem Synthesizer genannt](/images/20190226-004.gif)

Single Threading ist jedoch nicht absolut, so dass 2000 verarbeitet werden kann, wenn kein Problemantrag gestellt wird.Lesen Sie beispielsweise den Status in Actor, der normalerweise kein Problem mit dem Symp hat, sodass zu diesem Zeitpunkt derselbe Vorgang zulässig ist.

![Lesen Sie Schauspieler zur gleichen Zeit](/images/20190226-005.gif)
