---
title: 'Event Sourcing'
description: 'Event Sourcing'
---

Режим отслеживания событий является своего рода идеей проектирования программного обеспечения.Эта идея проектирования часто отличается от традиционной идеи проектирования системы, в основе которых преобладают дополнительные и сокращенные проверки (CRUD).Приложения CRUD обычно имеют некоторые ограничения：

1. Как правило, приложения CRUD используют прямое управление хранилищем данных.Такая реализация может привести к узким местам производительности из-за недостаточной оптимизации базы данных, что затрудняет масштабируемость приложения.
2. В определенных областях обычно существуют данные, которые требуют внимания к проблеме однофазного доступа для предотвращения ошибок при обновлении данных.Это часто требует внедрения связанных с ними технологий, таких как блокировка, транзакция и т.д., чтобы избежать таких проблем.Но это может привести к потере производительности.
3. История изменений данных, как правило, не может быть отслежена, если не добавлены дополнительные средства аудита.Это связано с тем, что в хранилище данных обычно хранится окончательное состояние данных.

По сравнению с практикой CRUD, отслеживание событий предназначено для избежания ограничений, описанных выше.Далее мы кратко изложение базового способа отслеживания событий вокруг бизнес-сценария " Перевода", упомянутого выше.

"Перевод" реализуется с помощью метода CRUD.

![Использование метода CRUD для реализации "перевода"](/images/20190226-006.gif)

"Перевод" реализуется путем отслеживания событий.

![Реализация "перевода" с помощью метода отслеживания событий](/images/20190227-001.gif)

Как показано на рисунке выше, изменения баланса, связанные с переводом бизнеса, хранятся в режиме отслеживания событий в режиме события.То же самое относится и к самому бизнесу, что дает некоторые преимущества：

- С помощью событий можно восстановить баланс счета на любом этапе, что в определенной степени позволяет отслеживать баланс счета.
- Поскольку события для обеих учетных записей обрабатываются независимо друг от друга.Таким образом, скорость обработки обеих учетных записей не влияет друг на друга.Например, перевод учетной записи B может быть немного отложен из-за необходимости дополнительной обработки, но учетная запись A все еще может быть переведена.
- Вы можете сделать некоторую асинхронную обработку бизнеса, подписавшись на событие.Например：другие асинхронные действия, такие как обновление статистики в базе данных, отправка sms-уведомлений и т. д.

Конечно, после введения режима отслеживания событий были введены некоторые технические проблемы, связанные с отслеживанием событий.Например：хранилище, потребляемое событиями, может быть огромным, необходимо применить окончательную согласованность, события неизменяемы, могут быть трудными для рефакторинга и т. д.Связанные с этим вопросы будут более подробно описаны в некоторых статьях.Читатели могут читать последующие расширенные чтения, чтобы понять и оценить.

> Справочные материалы
> 
> - [Event Sourcing Pattern](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/dn589792%28v%3dpandp.10%29)
> - [Перевод Event Sourcing Pattern на китайский язык](https://www.infoq.cn/article/event-sourcing)
