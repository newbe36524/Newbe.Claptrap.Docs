---
title: 'Claptrap Design'
description: 'Claptrap Design'
---

## Claptrap Design ermöglicht Claptraps hohe Anpassung

Claptrap hat einen hohen Grad an Anpassung.Entwickler können benutzerdefinierte Event Loader/Event Saver/State Loader/State Saver/ EventNotification-Methode und eine Reihe anderer Komponenten für Claptrap-Objekte einrichten.All diese Anpassungen können speziell auf dem Claptrap Design-Objekt widergespiegelt werden.

Claptrap Design ist wie ein Designdiagramm, das jedes Detail von Claptrap bestimmt, häufig einschließlich：

1. Welche Art von Event Loader /Event Saver wird verwendet, um Ereignisse zu behandeln.
2. Wie oft speichern Sie einen Status-Snapshot?
3. Minion, wenn ja, dann Meister wer.
4. Wie viele Ereignisse gibt es und was sind die entsprechenden Ereignishandler?

Diese Details werden auf verschiedene Arten konfiguriert, einschließlich Typscans, Eigenschafts-Tags, kohärenteSchnittstellen, Profile usw., wenn die Anwendung gestartet wird.Dies führt zu einem vollständigen Claptrap-Design.Außerdem wird claptrap Design beim Start validiert, um sicherzustellen, dass Claptrap Design grundsätzlich verfügbar ist.Sie erhalten also keinen Low-Level-Fehler wie "Vergiss, handler für Event zu schreiben."

Das gesamte Claptrap-Design wird zentral in einem Speicherobjekt wie dem IClapDesign Store gespeichert, sodass Claptrap Factory Claptrap-Abruf erstellen kann.

Entwickler können auch auf der Grundlage aller Daten im IClaptrapDesign Store lesbaren Text oder Grafiken erstellen, um die Zusammenhänge und Konfigurationsdetails von Claptrap im aktuellen System auf hoher Ebene besser zu verstehen, da der Code höher als der Code ist.

---

Im Folgenden finden Sie eine erzählerbezogene Beschreibung, um das Verständnis zu unterstützen.Machen Sie sich keine allzu großen Sorgen.

Claptrap Design ist eine wichtige Grundlage für Claptrap Factory, um Claptrap zu produzieren.Die kundenspezifischen Einheiten, die für einen bestimmten Claptrap-Typ erforderlich sind, sind im Design dokumentiert.Denn：bestimmt den Taskausführungsmodul in einem Multifunktions-Taskprozessor, bestimmt das Gerätemodell der Handheld-Memo und bestimmt die Wiederherstellungsstrategie des Speicherwiederherstellungscontrollers.

Bevor sie sich für die Produktion von Claptrap entschied, war das Entwerfen von Claptrap Design ein wichtiger Teil, um sicherzustellen, dass das Endprodukt Ihren Anforderungen entspricht.

## Symbol

![Claptrap](/images/claptrap_icons/claptrap_design.svg)
