---
title: 'Claptrap Design'
metaTitle: 'Claptrap Design'
metaDescription: 'Claptrap Design'
---

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

## Claptrap Design 实现 Claptrap 的高可定制性

Claptrap hat einen hohen Grad an Anpassung.开发者可以为 Claptrap 对象设置自定义的 Event Loader/ Event Saver/ State Loader / State Saver / EventNotification Method 等等一系列组件。而这一切的自定义，都可以具体反映到 Claptrap Design 对象上。

Claptrap Design 就像一个设计图，决定了 Claptrap 的每个细节，常见的包括：

1. Welches Ereignis Loader / Event Saver wird verwendet, um das Ereignis zu behandeln.
2. Wie oft speichern Sie einen Status-Snapshot.
3. Minion ，如果是，那么 Master 是谁。
4. Wie viele Ereignisse vorhanden sind und wie hoch ist der entsprechende Ereignishandler.

这些细节都会在应用程序启动时，将会通过类型扫描、属性标记、连贯接口、配置文件等等多种方式进行配置。Dies führt zu einem vollständigen Claptrap-Design.Außerdem wird Claptrap Design beim Start auf Angemessenheit überprüft, um sicherzustellen, dass Claptrap Design grundsätzlich verfügbar ist.从而不会出现类似于“忘记编写 Event 对应的 Handler”这样低级的错误。

所有的 Claptrap Design 都会被集中保存在 IClaptrapDesignStore 这样一个内存对象中，以便 Claptrap Factory 在构建 Claptrap 检索。

开发者也可以基于 IClaptrapDesignStore 中的所有数据，来构成可供人类阅读的文本或者图形，以便更容易地从高层面来了解当前系统中 Claptrap 之间的相互关系和配置细节，源于代码却高于代码。

---

Im Folgenden finden Sie eine Story-basierte Beschreibung, um das Verständnis zu unterstützen.Kümmern Sie sich nicht zu sehr.

Claptrap Design Design ist eine wichtige Grundlage für die Claptrap-Produktion von Claptrap Factory.Die kundenspezifischen Geräte, die für einen bestimmten Claptrap-Typ erforderlich sind, sind im Design dokumentiert.Zum Beispiel.：Entscheiden Sie über das Taskausführungsmodul im Multifunktions-Taskprozessor, entscheiden Sie über das Gerätemodell für das Handheld-Memo und entscheiden Sie über die Wiederherstellungsstrategie des Speicherwiederherstellungscontrollers.

Das Entwerfen von Claptrap Design ist ein wichtiger Teil, um sicherzustellen, dass das Endprodukt Ihren Anforderungen entspricht, bevor Sie sich entscheiden, in Produktion zu gehen.

## ICON

![Claptrap.](/images/claptrap_icons/claptrap_design.svg)
