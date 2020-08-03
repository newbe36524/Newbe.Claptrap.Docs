---
title: 'Staat'
metaTitle: 'Staat'
metaDescription: 'Staat'
---

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

Status stellt die aktuelle Datendarstellung des Actor-Objekts im Actor-Muster dar.Claptrap fügt nur ein Limit hinzu.："Der Zustand kann nur ereignisverfolgt aktualisiert werden."由于事件溯源的可靠性，Claptrap 中的 State 也就拥有了更好的可靠性。

## State 的版本号

在 Claptrap 中的 State 有一个名为 Version 的属性，它表示 State 当前的版本。版本号是一个从 0 开始的自增数字，会在每次处理一个事件之后进行自增。

State Claptrap mit der Versionsnummer 0 ist der Anfangszustand von Claptrap und kann auch als Genesis-Zustand bezeichnet werden.Der Anfangsstatus kann an die Geschäftsanforderungen angepasst werden.

Es gibt einige Unterschiede zwischen Claptrap und Minions Handhabung von Versionsnummern.

Für Claptrap ist Claptrap der Produzent des Ereignisses, so dass die Versionsnummer des Ereignisses selbst von Claptrap angegeben wird.Beispielsweise werden bei der Verarbeitung eines Ereignisses die folgenden Dinge nacheinander auftreten.：

1. Zustandsversion . . . 1000.
2. Beginnen Sie mit Event, dessen Version State Version s 1 s 1001 ist.
3. Das Ereignis ist beendet, und die Zustandsversion wird für 1001 aktualisiert.

Für Minion, weil es ein Verbraucher von The Claptrap Ereignis ist.Daher ist die Verarbeitung der Versionsnummer etwas anders.Beispielsweise treten bei der Verarbeitung eines Ereignisses die folgenden Ereignisse nacheinander auf.：

1. Zustandsversion . . . 1000.
2. Lesen Sie das Ereignis, dass die Ereignisversion 1001 ist.
3. Das Ereignis ist beendet, und die Zustandsversion wird für 1001 aktualisiert.

Die Versionsnummer des Status und die Versionsnummer des Ereignisses sind voneinander abhängig und gegenseitig überprüft, was für die Ereignisreihenfolge entscheidend ist.Wenn während der Verarbeitung eine Diskrepanz zwischen der Versionsnummer des Bundeslandes und der Versionsnummer des Ereignisses besteht, kann dies ein schwerwiegendes Problem darstellen.Im Allgemeinen gibt es in zwei Fällen eine Nichtübereinstimmung zwischen versionsnummern.：

1. Ereignisse in der Persistenzebene fehlen.
2. Rahmen bösartige BUG.

## ICON

![Claptrap.](/images/claptrap_icons/state.svg)
