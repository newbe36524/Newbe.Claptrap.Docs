---
title: 'Claptrap-Lebenszyklus'
metaTitle: 'Claptrap-Lebenszyklus'
metaDescription: 'Claptrap-Lebenszyklus'
---

> [Die aktuell angezeigte Version ist das Ergebnis von maschinell übersetztem chinesisch erarbeitetem vereinfachtem und manuellem Korrekturlesen.Wenn das Dokument falsch übersetzt wurde, klicken Sie bitte hier, um Ihren Übersetzungsvorschlag einzureichen.](https://crwd.in/newbeclaptrap)

Der Claptrap-Lebenszyklus wird nach Ansicht des Autors in zwei großen Kategorien dargestellt.：Laufzeitlebenszyklus und Entwurfszeitlebenszyklus.

## Der Laufzeitlebenszyklus.

Der Laufzeitlebenszyklus ist das Lebenszyklusverhalten jedes Objekts im Arbeitsspeicher während des Betriebs des Claptrap-Systems.Zum Beispiel.：In einem Websystem wird jede Webanforderung in der Regel als Lebenszyklus zugewiesen, und das Claptrap-System verfügt über einen ähnlichen Lebenszyklusentwurf.Diese Lebenszyklen haben Auswirkungen auf die Komponentenerweiterungen oder die Geschäftsentwicklung von Entwicklern.Der Laufzeitlebenszyklus des Claptrap-Frameworks ist unterteilt in.：Prozess, Claptrap und Event Handler.

Prozessebene.Ein Objekt, das als Lebenszyklus auf Prozessebene entwickelt wurde, ist ein Singleton-Objekt im allgemeinen Sinne.Jeder ausgeführte Claptrap-Prozess verfügt über ein eigenes Singleton-Objekt.In der Regel entspricht in einem Claptrap-Framework z. B. jedes persistente Layer-Ziel einem Batchprozessor (Batch Saver Event), um die Geschwindigkeit zu erhöhen, mit der Ereignisse in die persistente Ebene geschrieben werden.Sie haben während des gesamten Lebenszyklus des Prozesses nur eine Instanz, 1:1, die der entsprechenden Persistenzschicht entspricht, sodass Ereignisse zusammengeführt werden können, um in die Persistenzschicht zu schreiben, wodurch die Schreibleistung verbessert wird.Im Allgemeinen weisen Objekte, die als Lebenszyklus auf Prozessebene konzipiert sind, eines oder mehrere der folgenden Merkmale auf.：

1. Sie müssen die Logik oder den Code nur einmal während des gesamten Prozesslebenszyklus ausführen.Dies kann in der Regel mit Lazy und einem Singleton getan werden.
2. Während des gesamten Prozesslebenszyklus ist nur ein einzelnes Objekt erforderlich.Beispiel: Claptrap Design Store, Claptrap-Optionen usw.
3. Es kann nur ein einzelnes Objekt während des gesamten Prozesslebenszyklus vorhanden sein.Zum Beispiel Orleans Client.

Claptrap-Ebene.Objekte im Lebenszyklus auf Claptrap-Ebene werden mit der Aktivierung von Claptrap erstellt und mit der Inaktivierung von Claptrap freigegeben.Diese Objekte sind in der Regel stark mit einer Claptrap-Identität verknüpft.Z. B. Claptrap Design, Event Saver, Event Loader, State Saver, State Loader usw., die dieser Claptrap-Identität zugeordnet sind.

Ereignisprozessorebene (Ereignishandler).Lebenszyklusobjekte auf Ereignisprozessorebene werden erstellt, wenn der Ereignisprozessor erstellt und mit der Ereignisprozessorversion freigegeben wird.Diese Lebenszyklusebene ähnelt dem Lebenszyklus von Webanfragen als Reaktion auf das Web.In der Regel fällt die Arbeitseinheit für eine einheitliche Datenbanktransaktion auf diese Ebene.

## Lebensdauer der Entwurfszeit.

Design-Time-Lebenszyklen sind die Lebenszyklen von Geschäftsobjekten für Claptrap.Dies hat nichts damit zu tun, ob das Programm ausgeführt wird oder nicht, oder ob das Programm verwendet wird oder nicht.Um ein konkretes Beispiel zu nennen: Bestellungen in einem regulären E-Commerce-System.Die aktive Geschäftsfrist für einen Auftrag beträgt in der Regel nicht mehr als drei bis sechs Monate.Wenn dieses Zeitlimit überschritten wird, können die Auftragsdaten nicht geändert werden.Hier wird diese "drei bis sechs Monate" Frist als Entwurfszeitlebenszyklus eines Auftrags bezeichnet.Wenn ein Objekt in einem Claptrap-System seinen Entwurfszeitlebenszyklus überschritten hat, manifestiert es sich als "es besteht keine Notwendigkeit mehr, dieses Claptrap-Geschäft zu aktivieren."Daraus lassen sich die folgenden Schlussfolgerungen abziehen.：

1. Die Ereignisse, die Claptrap gespeichert hat, sind bedeutungslos, und das Löschen gibt freien Speicherplatz frei.
2. Der Geschäftscode für die Claptrap muss nicht mehr gewartet werden, und Sie können den Verweis entfernen oder den Code entfernen.

Je kürzer der Entwurfslebenszyklus von Claptrap, desto günstiger ist es daher, den Ressourcenbedarf und die Kosten für die Codewartung zu reduzieren und umgekehrt, was die Lagerkosten und Wartungsschwierigkeiten erhöht.Daher besteht beim Entwerfen von Claptrap-Systemen die Tendenz, einen kürzeren Lebenszyklus der Entwurfszeit zu verwenden.Und dieses Nobiss, spiegelt auch direkt das tatsächliche vollständig durch "Design" zu bestimmen. Als Nächstes listen wir einige gängige Entwurfszeit-Lebenszyklusklassifizierungen auf.

### Abgrenzung der Geschäftsgrenze.

Dies ist die häufigste Teilung.Die Geschäftsobjekte werden nach den Anforderungen der Domänenmodellierung unterteilt.Und diese Geschäftsobjekte haben oft einen festen Lebenszyklus.Wie in der vorherigen "Ordnung" ist ein häufiges Beispiel für die Aufteilung des Lebenszyklus durch Geschäftsgrenzen.Bei der Teilung mit dieser Methode müssen Sie nur beachten, dass Claptrap die grundlegende Anforderung erfüllt, dass "der minimale wettbewerbsfähige Ressourcenbereich größer oder gleich ist".Entwickler können diese Aufteilung mit einem Beispiel für ein "Zugticketsystem" erleben.

### Bedingte Grenzabgrenzung.

Im Allgemeinen konnte die geschäftsgrenzenbasierte Divisionsmethode einen angemessenen Lebenszyklus aufteilen.Wenn Sie jedoch einfach entlang von Geschäftsgrenzen unterteilt sind, verfügen Sie möglicherweise über Entwurfszeit-Lebenszyklus-zu-permanente Objekte.Angenommen, diese Objekte haben sehr dichte Ereignisoperationen.Dann ist die Anzahl der generierten Ereignisse ungewöhnlich groß.Dazu führen wir menschengesteuerte Wege ein, um den Lebenszyklus der Entwurfszeit zu verkürzen.Diese Aufteilung basiert auf bestimmten Bedingungen.Es wird daher als bedingte Grenzabgrenzung bezeichnet.Und die klassischste davon ist die Verwendung von "Zeitlimit" zu teilen.

Hier veranschaulichen wir diese Aufteilung anhand des Warenkorbobjekts im Schnellstartbeispiel.Erstens ist ein Warenkorb ein benutzerbezogenes Objekt, und solange der Benutzer im System war, ist es möglich, aktiviert zu werden, d.h. sein Design-Lebenszyklus ist "permanent".Daher können Sie verwandte Ereignisse nicht löschen, und sie müssen dauerhaft gespeichert werden, um sicherzustellen, dass die Warenkorbdaten korrekt sind.Aber wenn uns die Ereignisse, die ein Einkaufswagen vor einem Jahr verursacht hat, egal sind.Wir können die Einkaufswagen einzelner Benutzer manuell nach Jahr aufteilen.Gleichzeitig können wir für zwei angrenzende Jahre eine "Statuskopie" in einem Warenkorb erstellen.Dadurch werden die Zustandsdaten des Vorjahres erweitert, was zu einem kürzeren Entwurfslebenszyklus für den Einkaufswagen des Benutzers führt, und es wirkt sich nicht auf das Geschäft aus.Wir können eine klassische chinesische Legende verwenden, "The Fool es Move Mountain", um diese zeitbasierte Design-Lebenszyklus-Klassifizierung zu verstehen.In der Geschichte sind Narren Sterbliche, und obwohl sie nicht ewig leben können (kürzere Design-Lebenszyklen), kann der Geist der Narren (längere Design-Time-Lebenszyklen) mit zukünftigen Generationen weitergehen und somit die große Ursache der Bergwanderung vollenden.Wenn jede Generation von "Narren" ersetzt wird, tritt die oben erwähnte "Staatskopie" (spirituelle Fortsetzung) auf.Dies führt zu einem kürzeren Lebenszyklus der Entwurfszeit, der einen längeren oder sogar dauerhaften Design-Lebenszyklus ermöglicht.

> 《愚公移山》 太行、王屋两座山，方圆七百里，高七八千丈，本来在冀州南边，黄河北岸的北边。 北山下面有个名叫愚公的人，年纪快到 90 岁了，在山的正对面居住。他苦于山区北部的阻塞，出来进去都要绕道，就召集全家人商量说：“我跟你们尽力挖平险峻的大山，使道路一直通到豫州南部，到达汉水南岸，好吗？”大家纷纷表示赞同。他的妻子提出疑问说：“凭你的力气，连魁父这座小山都不能削平，能把太行、王屋怎么样呢？再说，往哪儿搁挖下来的土和石头？”众人说：“把它扔到渤海的边上，隐土的北边。”于是愚公率领儿孙中能挑担子的三个人上了山，凿石头，挖土，用箕畚运到渤海边上。邻居京城氏的寡妇有个孤儿，刚七八岁，蹦蹦跳跳地去帮助他。冬夏换季，才能往返一次。 河曲的智叟讥笑愚公，阻止他干这件事，说：“你简直太愚蠢了！就凭你残余的岁月、剩下的力气连山上的一棵草都动不了，又能把泥土石头怎么样呢？”北山愚公长叹说：“你的思想真顽固，顽固得没法开窍，连孤儿寡妇都比不上。即使我死了，还有儿子在呀；儿子又生孙子，孙子又生儿子；儿子又有儿子，儿子又有孙子；子子孙孙无穷无尽，可是山却不会增高加大，还怕挖不平吗？”河曲智叟无话可答。 握着蛇的山神听说了这件事，怕他没完没了地挖下去，向天帝报告了。天帝被愚公的诚心感动，命令大力神夸娥氏的两个儿子背走了那两座山，一座放在朔方的东部，一座放在雍州的南部。从这时开始，冀州的南部直到汉水南岸，再也没有高山阻隔了。
