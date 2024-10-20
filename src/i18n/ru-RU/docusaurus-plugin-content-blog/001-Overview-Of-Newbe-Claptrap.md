---
date: 2019-02-28
title: Newbe.Claptrap - набор платформ разработки на стороне сервиса с "отслеживанием событий" и "режимом Actor" в качестве основных теорий
---

Эта статья представляет собой введение в содержание предмета проекта Newbe.Claptrap, с помощью которых читатели могут получить представление о содержании проекта в целом.

<!-- more -->

## Колеса проистекают из спроса

С быстрым развитием интернет-приложений, соответствующие технические теории и средства реализации постоянно создаются.Ряд ключевых слов, таких как облачная архитектура, архитектура микросубъектов и DevOps, все чаще появляется в поле зрения инженеров.Подводя итог, можно сделать вывод, что эти новые теории и новые технологии возникли для решения некоторых технических болевых точек, возникающих в интернет-приложениях：

**более высокие требования к масштабируемости емкости**.Исходя из коммерческого успеха, количество пользователей интернет-приложений, системное давление и количество аппаратных устройств значительно возросли с течением времени.Это требует применения масштабируемости емкости в провинции.Эта масштабируемость емкости часто описывается как "приложение нуждается в поддержке горизонтального масштабирования".

**более высокие требования к стабильности системы**.Приложение работает непрерывно, обеспечивая непрерывный прогресс в бизнесе, что любой, кто связан с этой системой приложений, хотел бы видеть.Но это, как правило, очень трудно сделать.В настоящее время интернет-приложения сталкиваются со многими аналогичными конкурентами, если они не делают достаточно хорошо в этом отношении, то, скорее всего, потеряют некоторые из пользователей.

**более высокие требования к масштабируемости**."Объятия изменений", когда люди упоминают "гибкое управление проектами", связанные с содержанием, все это включает в себя слово.Этот термин в полной мере отражает, насколько важно, чтобы современные интернет-приложения были успешными и функциональными.Он также отражает изменчивый спрос на продукцию в текущей интернет-среде с одной стороны.Как системный инженер, это должно быть рассмотрено в начале приложения.

**более высокие требования к простоте разработки**.Простота разработки, к которой относится здесь, относится к сложности самой прикладной системы при разработке.Для того, чтобы сделать его более простым в разработке, необходимо приложить усилия для применения собственной структуры кода, тестируемости и развертывания.

**более высокие требования к производительности**.Требования к производительности, упомянутые здесь, относятся, в себя, в себя требования к производительности по увеличению емкости системы.Избегайте единой точки производительности системы и дайте приложению возможности горизонтального масштабирования.Как правило, в случае проблем с производительностью, это, как правило, самый простой способ решить проблему, добавив физическое устройство.При различной емкости системы сценарии оптимизации производительности системы обычно различны.Таким образом, выбор технического решения в сочетании с сценарием применения всегда был проблемой, которую должны рассмотреть системные инженеры.

Этот проект является набором платформ разработки, основанных на вышеуказанных функциональных требованиях системы.Это включает в себя соответствующие теоретические базовые камни, библиотеки классов разработки и технические статуты.

> В мире также не существует "серебряной пули".Набор рамок не решает всех проблем. - Закат луны, который не желает раскрывать свое имя

## С точки зрения спроса

При описании распределенных систем часто используется простой бизнес-сценарий "перевод учетной записи" в сочетании с описанием.Вот бизнес-сценарий.

Предположим, нам нужно построить бизнес-систему с системой учетных записей.Каждый счет имеет баланс.Теперь необходимо выполнить операцию перевода, чтобы перевести 300 из баланса счета A на счет B.Кроме того, основываясь на основных требованиях, приведенных в приведении в разделе, при реализации этого сценария необходимо учитывать следующее：

- Необходимо реагировать на всплеск емкости системы.На начальном этапе приложения может быть только 1000 первоначальных пользователей.Из-за хороших результатов продвижения приложений и притока учетных записей ботов, количество пользователей достигло трех порядков роста в месяц, т.е. до миллиона уровней.
- Необходимо учитывать стабильность и восстанавливаемость системы.Минимистистит среднее время простоя системы в целом и должно быть как можно проще в восстановлении, даже если происходит сбой системы.То есть, чтобы избежать единой точки отказа.
- Необходимо учитывать масштабируемость бизнеса.Впоследствии может потребоваться добавить некоторую бизнес-логику：в соответствии с уровнем счета, чтобы ограничить дневной перевод, sms-уведомление после успешного перевода, перевод поддерживает определенную сумму безвежных переводов, конкретная учетная запись реализует "T+1" на счет.
- Необходимо учитывать тестируемость кода.Бизнес-код системы и системный код могут быть хорошо отделены, что позволяет предварительно проверить правильность и производительность бизнес-кода и системного кода с помощью модульного тестирования.

## Теория колес

В этом разделе описываются некоторые теоретические элементы, тесно связанные с этой структурой, с тем чтобы читатели могли понять процесс работы рамок в ходе последующей деятельности.

### Режим Actor

Режим Actor — это модель однофайлового программирования.Применение этой модели программирования может решить некоторые проблемы симулирования системы очень хорошо.Проблема совместного доступа, упомянутая здесь, относится к проблеме, когда компьютер логически обрабатывает один и тот же данный, что может привести к неверным данным из-за нескольких однофайлных запросов.Эта проблема, безусловно, столкнется с многопоточным программированием.В качестве простого примера, если вы используете 100 потоков одновременно для выполнения операции ++ к переменной int в памяти без блокировки синхронизации.Тогда конечный результат этой переменной, как правило, меньше 100.Вот как режим Actor избегает этой проблемы.

Во-первых, для удобства читателя можно считать Actor объектом здесь.В объектно-ориентированных языках (Java, C# и т. д.) Actor считается объектом, созданным``new и ключевыми словами.Тем не менее, этот объект имеет некоторые особенности：

**имеет собственное состояние**.Объекты могут иметь свои собственные свойства, которые являются основными функциями объектно-ориентированного языка.В режиме Actor эти свойства в совокупности называются состояниями Actor.Состояние Actor поддерживается самим Actor.

Это подчеркивает два момента：

Во-первых, состояние Actor может быть изменено только самими себеи, а для изменения состояния Actor извне его можно изменить только путем вызова Actor.

![Обновите состояние Acactor](/images/20190226-001.gif)

Во-вторых, состояние Actor поддерживается только внутри Actor и не является общим для любого объекта, кроме текущего Actor.Несвяжее значение здесь также подчеркивает, что он не может привести к изменению внутреннего состояния Actor путем изменения внешнего свойства.Это в первую очередь для того, чтобы отличаться от некоторых языков программирования, которые имеют характеристики языка "ссылки на объекты".例如：在 C#的 class 的 public 属性，假如是引用类型，那么在外部获得这个 class 之后是可以改变 class 中的属性的。Но это не допускается в режиме Actor.

![Общий доступ к состоянию Acactor](/images/20190226-003.gif)

Однако чтение данных изнутри Actor во внешний файл по-прежнему допустимо.

![Чтение состояния Acactor](/images/20190226-002.gif)

**однопоточный**.Actor обычно может принимать только один вызов в то же время.Потоки, описанные здесь, не совсем относятся к потокам на компьютере и используются для выделения терминов, используемых "Actor может обрабатывать только один запрошенный атрибут в то же время".Если actor в настоящее время принимает вызов, оставшиеся вызовы блокируются до тех пор, пока вызов не будет завершен, прежде чем следующий запрос будет разрешен.На самом деле это похоже на механизм блокировки синхронизации.Этот механизм позволяет избежать возможности проблемы слаженности при изменении внутреннего состояния Actor.具体一点说明：如果使用 100 个线程对一个 Actor 进行并发调用，让 Actor 对状态中的一个 int 变量进行 ++ 操作。В конечном счете значение этого состояния должно быть 100.

![Вызов Actor в то же время](/images/20190226-004.gif)

Однако однопоточность также не является абсолютной, и однофайловая обработка разрешена без запроса на проблему однофайлового выполнения.Например, чтение состояния в Actor, который обычно не имеет проблемы с вхождами, позволяет операции симулы на этом этапе.

![Чтение Actor в то же время](/images/20190226-005.gif)

> Читая однопоточный характер Actor, читатели обычно принимают во внимание, может ли это привести к тому, что сам Actor будет работать слишком медленно, что приведет к проблемам с производительностью?По этому вопросу, я надеюсь, что читатели будут продолжать держать этот вопрос читать и искать ответы.

### Режим отслеживания событий

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

> Сложность бизнеса не уменьшается из-за изменений в дизайне системы, она просто перемещается из одного места в другое. Всегда говорите о луне их собственной кухни

## Позвольте колесам повернуться

Основываясь на том, что читатель в целом понял теорию верхнего раздела, в этом разделе будет представлен принцип работы этой структуры в сочетании с бизнес-сценарием "перевода", описанным выше.Во-первых, читателю необходимо понять два существительных этой структуры.

### Claptrap

![Claptrap](/images/20190228-001.gif)

Claptrap — это особый actor, определенный этой платформой.В дополнение к двум функциям Actor, упомянутым выше, Claptrap определяется как который имеет следующие функции：

**состояние управляется событием**.Состояние Actor поддерживается внутри Actor.То же самое относится и к Claptrap, но изменение состояния Claptrap ограничивается только событиями, в дополнение к ограничениям на изменения в Actor.Это сочетает в себе режим отслеживания событий с шаблоном Actor.Правильность и прослеживаемость состояния Actor гарантируются шаблоном отслеживания событий.Эти события, изменяющие состояние Claptrap, генерируются самим Claptrap.Причиной события может быть внешний вызов или механизм триггера класса внутри Claptrap.

### Minion

![Minion](/images/20190228-002.gif)

Minion — это особый actor, определенный этой платформой.Это корректировка, сделанная на основе Claptrap.Он имеет следующие характеристики：

**считывает события из соответствующего Claptrap**.Как и Claptrap, состояние Minion контролируется событием.Разница в том, что Minion, как и в буквальном смысле этого слова, всегда получает события от соответствующего Claptrap, изменяя свое состояние.Таким образом, он может асинхронно обрабатывать последующие действия после того, как Claptrap создает событие.

### Бизнес-реализация

Теперь, когда у вас есть предыдущие основы, давайте рассмотрим, как эта платформа реализует сценарий " Перевода" выше.Во-первых, вы можете узнать об основных процессах, как показано на следующем：

![Claptrap & Minion](/images/20190228-003.gif)

Как показано на рисунке выше, весь процесс представляет собой более крупный процесс реализации бизнес-сценария в рамках.Кроме того, есть еще несколько вопросов, которые следует отметить,：

- Вызовы Client и Claptrap на рисунке существуют только в том случае, если существует только первый этап, т.е. это позволяет Client быстрее реагировать, не дожидаясь завершения всего процесса.
- Claptrap A может повторно принять запрос после обработки собственного запроса и отправки события в Minion A, что повышает пропускную способность Claptrap A.
- Minion не только обрабатывает агенты вызовов между Claptrap.В Minion можно также отправлять текстовые сообщения, обновлять статистик：у базы данных и многое другое в соответствии с бизнес-требованиями.
- Minion также может иметь свое собственное состояние, сохраняя часть данных в своем собственном состоянии, чтобы внешние запросы могли быть запрошены из себя, а не из соответствующего Claptrap.Например：подсчитайте изменения в переводе учетной записи за последние 24 часа для быстрого запроса.

### Емкость бизнеса

Как упоминалось ранее, эта структура должна быть построена с масштабируемой архитектурой системы, которая может справиться с продолжающимся ростом бизнес-мощностей.На этом этапе платформа использует microsoft с открытым исходным кодом[Orleans](https://github.com/dotnet/orleans)для реализации сокращения приложений и физических устройств.Конечно, есть ряд вопросов, связанных с кластерами баз данных, когда дело доходит до частей хранения данных.Это детали применения технологии, а не содержание структурного теоретического дизайна.Таким образом, здесь показано только, что платформа может масштабируемься на основе вышеукажетой архитектуры с открытым исходным кодом.Практические вопросы в приложении, на которые читатели могут обратиться за ответами в последующих проектах.

## Расширенное чтение

Все следующее имеет далеко идущие последствия для этих рамок.Читатели могут улучшить свое понимание этой структуры, прочитав следующее.

- [Ray, распределенная, отслеживаемая событиями, управляемая событиями и в конечном счете консистенция высокопроизводительной платформы, построенной на основе Платформы Actor Orleans](https://github.com/RayTale/Ray)
- [Event Sourcing Pattern](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/dn589792%28v%3dpandp.10%29)
- [Перевод Event Sourcing Pattern на китайский язык](https://www.infoq.cn/article/event-sourcing)
- [Orleans - Distributed Virtual Actor Model](https://github.com/dotnet/orleans)
- [Service Fabric](https://docs.microsoft.com/zh-cn/azure/service-fabric/)
- [ENode 1.0 - Мысль и реализация Саги](http://www.cnblogs.com/netfocus/p/3149156.html)

<!-- md Footer-Newbe-Claptrap.md -->
