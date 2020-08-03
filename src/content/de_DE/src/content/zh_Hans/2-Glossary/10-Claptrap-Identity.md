---
title: 'Claptrap-Identität.'
metaTitle: 'Claptrap-Identität.'
metaDescription: 'Claptrap-Identität.'
---

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

## Claptrap Identity ist die eindeutige Identität zum Auffinden einer Claptrap.

Es ist eine Struktur.Es enthält die folgenden Hauptfelder.：

Claptrap Type Code, Claptrap Classification Code.Klassifizierungscode ist Code, den der Entwickler selbst definiert.Es ist in der Regel mit dem Geschäft verbunden mit der entsprechenden Claptrap.Es ist erwähnenswert, dass es keine obligatorische Korrelation zwischen Claptrap und seinem Minion Claptrap Type Code gibt, aber es ist üblich, dass Minions Claptrap Type Code während der Entwicklung als Teil seiner Master-Claptrap entworfen wird, was dem Geschäftsverständnis förderlicher ist.

Id, Claptrap Business Id.Dies ist die Geschäfts-ID.Dies ist in der Regel der Primäreschlüssel des Unternehmens.Im eigentlichen Code wird im Dokument Die Claptrap-Identität in voller Schrift angezeigt, und wenn eine ID angezeigt wird, bezieht sie sich in der Regel auf eine Geschäfts-ID.

## Claptrap Identity Ist dies ein Entwurf, der nicht mit der laufenden Plattform zusammenhängt.

Daher ist es in Kombination mit einer bestimmten Plattform notwendig, seinen Integrationspunkt zu klären.

Claptrap Identity spiegelt sich in Orleans wider.

Claptrap-Typcode.：In Orleans wird in der Regel jede Claptrap in ClaptrapBoxGrain platziert.An diesem Punkt wird Claptrap Type Code in der Regel als Eigenschaftstag auf einer Klasse oder Schnittstelle markiert.

Id.：In Orleans hat Grain einen PrimaryKey für sich.Somit wurde der PrimaryKey als Claptrap Id auch direkt in ClaptrapBoxGrain wiederverwendet.
