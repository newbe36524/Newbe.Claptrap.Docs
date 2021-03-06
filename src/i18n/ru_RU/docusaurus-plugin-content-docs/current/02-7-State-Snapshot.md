---
title: 'Моментальный снимок состояния (State Snapshot)'
description: 'Моментальный снимок состояния (State Snapshot)'
---

## State Snapshot ускоряет скорость восстановления состояния

Активный Claptrap, стат которого является текущим последним состоянием данных.Это восстанавливается из уровня сохраняемости путем отслеживания событий.Иногда количество инцидентов может быть очень большим.Восстановление State с помощью событий займет больше времени.Таким образом, моментальный снимок состояния предоставляется в платформе Claptrap для сохраняемого состояния определенного Claptrap после определенных условий.Это условие обычно является следующим：

1. После выполнения нескольких событий.
2. При Claptrap Deactive.
3. В течение определенного периода времени.

Наличие моментальных снимков событий приводит к увеличению скорости восстановления состояния с постоянного уровня.Если на постоянном уровне существует моментальный снимок, восстановление состояния обычно осуществляется следующим образом：

1. Чтение моментального снимка состояния.
2. Начиная с номера версии, соответствующего моментально-снимку состояния, все события считываются снова для обновления состояния.
3. Состояние обновляется до тех пор, пока на постоянном уровне не будет оставшихся событий.

Однако без моментального снимка шаги восстановления становятся следующими：

1. Создайте начальное состояние с помощью пользовательского метода.
2. Чтение всех событий из библиотеки событий для обновления состояния.
3. Состояние обновляется до тех пор, пока на постоянном уровне не будет оставшихся событий.

Тем не менее.Наличие моментальных снимков также может привести к некоторой специфике.В сочетании с рабочими шагами выше, мы можем легко обнаружить, что как только моментальные снимки：

1. Пользовательские методы пользователя больше не будут выполняться.
2. События, которые меньше номера версии моментального снимка, не будут выполняться снова.

В настоящее время платформа может хранить только один последний моментальный снимок для каждого идентификатора.
