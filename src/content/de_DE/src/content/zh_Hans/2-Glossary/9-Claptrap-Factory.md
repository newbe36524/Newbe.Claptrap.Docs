---
title: 'Claptrap Factory'
metaTitle: 'Claptrap Factory'
metaDescription: 'Claptrap Factory'
---

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

## Claptrap Factory montiert Claptrap.

Claptrap hat einen hohen Grad an Anpassung.Entwickler können einen benutzerdefinierten Satz von Komponenten für das Claptrap-Objekt angeben, z. B. Event Loader/Event Saver/State Saver/State Saver/EventNotification-Methode usw.Um sich an diese Anpassung anzupassen, ist eine gute Lösung erforderlich, um die Montage von Claptrap-Objekten zu erreichen.

Das aktuelle Framework wird mit Autofac als Assembler ausgeführt.Der Hauptgrund dafür ist, dass Autofac einige der reichhaltigeren Funktionen von System.Depenedency Injection unterstützt, z. B. Delegate Factory/Decorator/Generic Type/Module.

## Claptrap Factory steuert den Claptrap-Lebenszyklus.

Da Claptrap Factory ein Hersteller von Claptrap ist, ist es in der Regel auch für die Lebenszyklussteuerungsfunktion auf Claptrap-Ebene verantwortlich.In der Autofac-basierten Claptrap Factory spiegelt sich diese Lebenszyklussteuerung im Prozess der Verwendung des LifetimeScope-Objekts von Autofac wider, um den gesamten Lade-, Erstellungs- und Entladevorgang zu steuern.

---

Im Folgenden finden Sie eine Story-basierte Beschreibung, um das Verständnis zu unterstützen.Kümmern Sie sich nicht zu sehr.

Claptrap Factory ist der primäre Standort für die Claptrap-Produktion.Es wird für jede fabrikgefertigte Claptrap nach dem gegebenen Claptrap Design angepasst werden, und es hat eine sehr hohe Produktpassrate und Arbeitseffizienz.

## Symbol.

![Claptrap.](/images/claptrap_icons/claptrap_factory.svg)
