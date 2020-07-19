---
title: 'Actor-Modus'
metaTitle: 'Actor-Modus'
metaDescription: 'Actor-Modus'
---

> [当前查看的版本是由机器翻译自简体中文，并进行人工校对的结果。若文档中存在任何翻译不当的地方，欢迎点击此处提交您的翻译建议。](https://crwd.in/newbeclaptrap)

Das Actor-Muster ist ein gleichzeitiges Programmiermodell.Die Anwendung dieses Programmiermodells kann die Parallelitätsprobleme einiger Systeme lösen.Das hier erwähnte Parallelitätsproblem ist, wenn ein Computer dieselben Daten logisch verarbeitet, was aufgrund mehrerer gleichzeitiger Anforderungen zu falschen Daten führen kann.Dieses Problem ist ein Problem, das beim Programmieren mit mehreren Threads auftreten muss.Um ein einfaches Beispiel zu nehmen: Wenn Sie 100 Threads ohne synchrone Sperre verwenden,`Int`Variablenausführung`++`Vorgang.Das Endergebnis dieser Variablen ist oft kleiner als 100.So vermeidet das Actor-Muster dieses Problem.

Erstens, um das Verständnis zu erleichtern, können leserende Schauspieler als Objekt hier betrachten.In objektorientierten Sprachen (Java, C, etc.) kann man sich Schauspieler als`Neu`Das vom Schlüsselwort erstellte Objekt.Aber dieses Objekt hat einige Besonderheiten.：

**Eigene Ingons ihres eigenen Staates**。Objekte können ihre eigenen Eigenschaften haben, was ein grundlegendes Merkmal objektorientierter Sprachen ist.Im Actor-Muster werden diese Eigenschaften kollektiv als`Der Zustand des Schauspielers`。Der Status des Schauspielers wird vom Schauspieler selbst beibehalten.

Dies unterstreicht zwei Punkte.：

Erstens kann der Zustand des Schauspielers nur von selbst geändert werden, und um den Zustand des Schauspielers von außen zu ändern, kann er nur durch Aufrufen von Actor geändert werden.

![Status des Akteurs aktualisieren](/images/20190226-001.gif)

Zweitens wird der Status von Actor nur innerhalb des Akteurs beibehalten und nicht für ein anderes Objekt als den aktuellen Actor freigegeben.Die Freigabe hier betont auch, dass sie keine Änderung des internen Zustands des Akteurs durch eine Änderung einer externen Eigenschaft verursachen kann.Damit soll in erster Linie zwischen Programmiersprachen mit "Objektreferenz"-Sprachmerkmalen unterschieden werden.Zum Beispiel：In C.`Klasse`das`Öffentlich`Die Eigenschaft, wenn es sich um einen Referenztyp handelt, ruft diese externe`Klasse`Und dann kann es geändert werden.`Klasse`Die Eigenschaft in .Dies ist jedoch im Actor-Muster nicht zulässig.

![Share Actor-Status](/images/20190226-003.gif)

Das Lesen von Daten aus dem Inneren des Akteurs nach außen ist jedoch weiterhin zulässig.

![Lesen Sie den Status des Schauspielers](/images/20190226-002.gif)

**Einfädeln**。Schauspieler akzeptiert in der Regel nur einen Anruf zur gleichen Zeit.Die hier beschriebenen Threads beziehen sich nicht genau auf Threads im Computer, und es werden die Wörter verwendet, die verwendet werden, um das "Feature von Actor, das jeweils nur eine Anforderung verarbeiten kann" hervorzuheben.Wenn der aktuelle Akteur einen Anruf annimmt, werden die verbleibenden Anrufe bis zum Ende des Anrufs blockiert, und die nächste Anforderung darf nicht eingegeben werden.Dies ähnelt tatsächlich einem Mechanismus für eine synchrone Sperre.Dieser Mechanismus vermeidet die Möglichkeit von Parallelitätsproblemen beim Ändern des internen Status des Akteurs.Eine spezifische Beschreibung：Wenn Sie 100 Threads verwenden, um einen gleichzeitigen Aufruf eines Schauspielers zu tätigen,`Int`Variable zum Ausführen`++`Vorgang.Der endgültige Wert für diesen Zustand muss 100 sein.

![Gleichzeitiger Aufruf SActor](/images/20190226-004.gif)

Einzelne Threads sind jedoch nicht absolut, sodass keine gleichzeitigen Anforderungen gleichzeitig verarbeitet werden können.Wenn Sie z. B. den Status im Actor lesen, der normalerweise keine Parallelitätsprobleme hat, können zu diesem Zeitpunkt gleichzeitige Vorgänge angezeigt werden.

![Gleichzeitiger Lese-Schauspieler](/images/20190226-005.gif)
