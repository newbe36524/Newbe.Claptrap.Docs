---
title: 'Status (Status)'
description: 'Status (Status)'
---

Status stellt die aktuelle Datenleistung des Actor-Objekts im Actor-Modus dar.Claptrap fügt dieser："Staat kann nur durch Event-Sourcing aktualisiert werden" einfach ein Limit hinzu.Aufgrund der Zuverlässigkeit der Ereignisrückverfolgbarkeit hat State in Claptrap auch eine bessere Zuverlässigkeit.

## Die Versionsnummer des Staates

State in Claptrap verfügt über eine Eigenschaft namens Version, die die aktuelle Version von State darstellt.Die Versionsnummer ist eine selbst hinzugefügte Zahl, die bei 0 beginnt und sich selbst erhöht, nachdem jedes Ereignis verarbeitet wurde.

Status mit Version 0 ist der Anfangszustand von Claptrap und kann auch als Genesis-Zustand bezeichnet werden.Der Anfangszustand kann an die Anforderungen des Unternehmens angepasst werden.

Claptrap und Minion haben auch einige Unterschiede in der Art und Weise, wie Versionsnummern behandelt werden.

Für Claptrap ist Claptrap der Produzent des Ereignisses, so dass die Versionsnummer des Ereignisses selbst von Claptrap angegeben wird.Beispielsweise werden bei der Verarbeitung eines Ereignisses die folgenden Punkte in turn：

1. Zustandsversion = 1000
2. Starten sie die Verarbeitung des Ereignisses, dessen Version s State Version s 1 s 1001
3. Ereignis wird verarbeitet, Statusversion s 1001 aktualisieren

Für Minion, weil es ein Verbraucher von Claptrap-Events ist.Daher wird die Versionsnummer etwas anders gehandhabt.Beispielsweise treten während der Verarbeitung eines Ereignisses die folgenden Ereignisse：

1. Zustandsversion = 1000
2. Ein Ereignis mit Event Version 1001 wurde gelesen
3. Ereignis wird verarbeitet, Statusversion s 1001 aktualisieren

Die Versionsnummer des Status und die Versionsnummer des Ereignisses sind voneinander abhängig und werden gegenseitig validiert, was der Schlüssel zur Ereignisreihenfolge ist.Wenn während der Verarbeitung eine Diskrepanz zwischen der Versionsnummer des Staates und der Versionsnummer des Ereignisses besteht, kann dies ein schwerwiegendes Problem darstellen.Im Allgemeinen gibt es eine Versionsnummer Nichtübereinstimmung, und es gibt nur zwei Fälle：

1. Ereignisse in der Persistenzschicht sind verloren gegangen
2. Framework bösartig ERBug

## Symbol

![Claptrap](/images/claptrap_icons/state.svg)
