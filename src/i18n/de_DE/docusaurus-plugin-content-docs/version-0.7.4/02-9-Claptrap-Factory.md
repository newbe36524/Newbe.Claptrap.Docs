---
title: 'Claptrap Factory'
description: 'Claptrap Factory'
---


## Claptrap Factory montiert Claptrap

Claptrap hat einen hohen Grad an Anpassung.Entwickler können einen Bereich von Komponenten für das Claptrap-Objekt angeben, z. B. benutzerdefinierte Event Loader/Event Saver/State Loader/State Saver/ EventNotification-Methode.Um sich an diese Anpassung anzupassen, ist es notwendig, ein gutes Schema zu verwenden, um die Montage von Claptrap-Objekten zu erreichen.

Das aktuelle Framework wird mit Autofac als Assembler ausgeführt.Der Hauptgrund ist, dass Autofac Funktionen wie Delegate Factory / Decorator / Generic Type / Module unterstützt, die reicher sind als System.DesignEdencyInjection.

## Claptrap Factory steuert den Claptrap-Lebenszyklus

Da Claptrap Factory ein Hersteller von Claptrap ist, ist es im Allgemeinen auch für die Lifecycle Control-Funktionen auf Claptrap-Ebene verantwortlich.In der Autofac-basierten Claptrap Factory spiegelt sich diese Lebenszyklussteuerung in der Verwendung von Autofac LifetimeScope-Objekten wider, um den gesamten Lade-, Erstellungs- und Entladevorgang zu steuern.

---

Im Folgenden finden Sie eine erzählerbezogene Beschreibung, um das Verständnis zu unterstützen.Machen Sie sich keine allzu großen Sorgen.

Claptrap Factory ist der primäre Standort für die Claptrap-Produktion.Es wird eine kundenspezifische Montage jeder Fabrik Claptrap nach einem bestimmten Claptrap Design durchführen, die eine sehr hohe Produktpassrate und Leistung hat.

## Symbol

![Claptrap](/images/claptrap_icons/claptrap_factory.svg)
