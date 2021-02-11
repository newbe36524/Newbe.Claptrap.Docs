---
title: 'Claptrap-Identität'
description: 'Claptrap-Identität'
---


## Claptrap Identity ist die eindeutige Identität, die eine Claptrap lokalisiert

Es ist eine Struktur.Es enthält mehrere Haupt fields：

Claptrap Type Code, Claptrap Klassifizierungscode.Klassifizierter Code ist Code, der vom Entwickler definiert wird.In der Regel mit dem Geschäft verbunden mit Claptrap.Es ist wichtig zu beachten, dass es keine erzwungene Verbindung zwischen Claptrap und seinem Minion Claptrap Type Code gibt, aber normalerweise sollte Minions Claptrap Type Code als Teil seiner Master Claptrap entworfen werden, die geschäftsfreundlicher ist.

Id, Claptrap Business ID.Dies ist die ID des Unternehmens.In der Regel ist es der Primärschlüssel des Unternehmens.In dem eigentlichen Code und der Dokumentation wird Claptrap Identity im vollständigen Namen angezeigt, und wenn IDs angezeigt werden, beziehen sie sich in der Regel auf Geschäfts-IDs.

## Claptrap Identity Dies ist ein plattformunabhängiges Design

Daher ist es bei der Kombination mit einer bestimmten Plattform notwendig, seinen Bindungspunkt zu klären.

Die Verkörperung der Claptrap-Identität in Orleans.

Claptrap Type Code：In Orleans wird in der Regel jede Claptrap platziert, um in ClaptrapBoxGrain ausgeführt zu werden.An diesem Punkt wird Claptrap Type Code in der Regel auf einer Klasse oder Schnittstelle als Eigenschafts-Tag markiert.

Id：In Orleans kommt Grain selbst mit einem PrimaryKey.Daher wird der PrimaryKey auch direkt in ClaptrapBoxGrain als Claptrap ID wiederverwendet.
