---
date: 2020-10-06
title: Как использовать dotTrace для диагностики проблем с производительностью приложений netcore
---

Недавно было сделано обновление производительности для [Newbe.Claptrap](https://claptrap.newbe.pro/) , поэтому мы представляем разработчикам базовое использование программного обеспечения dotTrace, использованного в процессе.

<!-- more -->

## Краткое изыску

[dotTrace](https://www.jetbrains.com/profiler/) является profile программное обеспечение, предоставляемое Jetbrains для приложений .net.Помогает диагностировать и анализировать трудоемкие функции и проблемы с памятью в программном обеспечении.

В этой статье мы проанализируем некоторые известные проблемы с производительностью с помощью программного обеспечения Jetbrains dotTrace.Это позволяет читателю освоить основные навыки использования программного обеспечения.

В ходе этого процесса мы продемонстрируем некоторые классические вопросы интервью, чтобы объяснить использование программного обеспечения шаг за шагом.

В этом примере используется среда IDE Rider в качестве основной демонстрации. Разработчики могут сделать то же самое с VS + Resharper.

## Как получить dotTrace

DotTrace - это платное программное обеспечение.Программное обеспечение в [настоящее время можно использовать](https://www.jetbrains.com/dotnet/) , приобретя лицензию dotUltimate и выше.

Конечно, программное обеспечение также включает в себя пробную версию, которая может быть открыта бесплатно в течение 7 дней.Jetbrains IDE покупается более года, чтобы получить последнюю текущую версию постоянного использования.

Кроме того, вы можете [Jetbrains для всей семьи баррель лицензии](https://www.jetbrains.com/all/), чтобы забрать все сразу.

## Классическая сцена воспроизводится

Далее мы испытаем, как использовать dotTrace с некоторыми классическими вопросами интервью.

### Когда использовать StringBuilder

Какой классический вопрос интервью.Друзья, которые могут видеть эту статью, я уверен, что вы все знаете, что StringBuilder может уменьшить фрагментацию string прямого сшива и уменьшить нагрузку на память.

Это правда, что мы?Будет ли это просто интервьюер хочет, чтобы смутить меня, запугивать меня асимметричной информации?

Это не имеет значения, давайте использовать dotTrace для конкретного сочетания кода для анализа волны.Посмотрите, если использование StringBuilder на самом деле уменьшить давление на выделение памяти.

Во-первых, мы создаем модульный тестовый проект и добавляем следующий тестовый класс：

```cs
using System.Linq;
using System.Text;
using NUnit.Framework;

namespace Newbe.DotTrace.Tests
{
    public class X01StringBuilderTest
    {
        [Test]
        public void UsingString()
        {
            var source = Enumerable.Range(0, 10)
                . Select(x => x.ToString())
                . ToArray();
            var re = string. Empty;
            for (int i = 0; i < 10_000; i++)
            {
                re += source[i % 10];
            }
        }

        [Test]
        public void UsingStringBuilder()
        {
            var source = Enumerable.Range(0, 10)
                . Select(x => x.ToString())
                . ToArray();
            var sb = new StringBuilder();
            for (var i = 0; i < 10_000; i++)
            {
                sb. Append(source[i % 10]);
            }

            var _ = sb. ToString();
        }
    }
}
```

Затем, как показано на следующем рисунке, мы устанавливает режим profile в Rider в Timeline.

![Установите режим profile](/images/20201006-001.png)

TimeLine является одним из нескольких шаблонов, которые, например, имеют более полное представление о работе отдельных потоков, включая многомерные данные, такие как выделение памяти, обработка ввода-вывода, блокировки, отражения и многое другое.Это будет шаблон, который в основном используется в этом примере.

Затем запустите profile для соответствующего теста с помощью небольшого значка слева от модульного теста, как показано на следующем рисунке.

![Запустите profile](/images/20201006-002.png)

После запуска profile после ожидания в течение некоторого времени появится последний созданный отчет timeline.Посмотрите, где находится отчет：

![Запустите profile](/images/20201006-003.png)

Щелкните правой кнопкой мыши соответствующий отчет и выберите Open in External Viewer, чтобы открыть созданный отчет с помощью dotTrace.

Итак, во-первых, позвольте мне открыть первый отчет и просмотреть отчеты, созданные методом UsingString.

Как показано на следующем рисунке, выберите .Net Memory Allocations, чтобы просмотреть объем памяти, выделенной во время тестового запуска.

![Запустите profile](/images/20201006-004.png)

Основываясь на приведенной выше диаграмме, мы можем сделать следующие выводы：

1. В этом тесте string было выделено 102M памяти.Обратите внимание, что выделение, отображаемое в dotTrace, относится к памяти, выделенной полностью на протяжении всего выполнения.Это значение не уменьшается, даже если оно будет последующе восстановлено.
2. Выделение памяти до тех пор, пока это делается в потоке CLR Worker.И очень плотный.

> Tip： Timeline отображает более длительное время выполнения, чем обычные тесты, так как необходимо дополнительное потребление для записи данных во время profile.

Таким образом, мы пришли к первому выводу：с помощью string для прямого сшива, это действительно потребляет больше выделения памяти.

Далее мы переймем выше, чтобы просмотреть отчет о методе UsingStringBuilder, как показано ниже：

![Запустите profile](/images/20201006-005.png)

Основываясь на рисунке выше, мы можем сделать второй вывод：Использование StringBuilder может значительно уменьшить объем памяти, потребляемой по сравнению с прямым сшивом string.

Конечно, окончательный вывод, который мы получили, на самом деле：, что интервьюеры не обманы.

### Как класс и struct влияют на память

Класс и struct имеют много различий, интервью вопросы часто.Между ними существуют различия с точки зрения памяти.

Итак, давайте пройсем тест, чтобы увидеть разницу.

```cs
using System;
using System.Collections.Generic;
using NUnit.Framework;

namespace Newbe.DotTrace.Tests
{
    public class X02ClassAndStruct
    {
        [Test]
        public void UsingClass()
        {
            Console.WriteLine($"memory in bytes before execution: {GC. GetGCMemoryInfo(). TotalAvailableMemoryBytes}");
            const int count = 1_000_000;
            var list = new List<Student>(count);
            for (var i = 0; i < count; i++)
            {
                list. Add(new Student
                {
                    Level = int. MinValue
                });
            }

            list. Clear();

            var gcMemoryInfo = GC. GetGCMemoryInfo();
            Console.WriteLine($"heap size: {gcMemoryInfo.HeapSizeBytes}");
            Console.WriteLine($"memory in bytes end of execution: {gcMemoryInfo.TotalAvailableMemoryBytes}");
        }

        [Test]
        public void UsingStruct()
        {
            Console.WriteLine($"memory in bytes before execution: {GC. GetGCMemoryInfo(). TotalAvailableMemoryBytes}");
            const int count = 1_000_000;
            var list = new List<Yueluo>(count);
            for (var i = 0; i < count; i++)
            {
                list. Add(new Yueluo
                {
                    Level = int. MinValue
                });
            }

            list. Clear();

            var gcMemoryInfo = GC. GetGCMemoryInfo();
            Console.WriteLine($"heap size: {gcMemoryInfo.HeapSizeBytes}");
            Console.WriteLine($"memory in bytes end of execution: {gcMemoryInfo.TotalAvailableMemoryBytes}");
        }

        public class Student
        {
            public int Level { get; set; }
        }

        public struct Yueluo
        {
            public int Level { get; set; }
        }
    }
}
```

Основные моменты кода：

1. Два теста, создав 1 000 000 классов и struct для присоединения к List.
2. После выполнения теста в конце теста выводится размер текущего пространства кучи.

Следуя базовым шагам, описанным в разделе выше, мы сравниваем отчеты, созданные двумя методами.

UsingClass

![UsingClass](/images/20201006-006.png)

UsingStruct

![UsingClass](/images/20201006-007.png)

Сравнивая два доклада, можно сделать следующие выводы：

1. Выделение памяти в отчете Timeline, содержащая только память, выделенную в куче.
2. Struct не нужно назначать в куче, однако массив является ссылочным объектом и должен быть назначен куче.
3. Суть процесса самоукрепления List заключается в том, что характеристики расширяемого массива также отражены в отчете.
4. Кроме того, он не отображается в отчете, в то время как дисплей отображается в тестовом печатном тексте, и размер кучи после запуска UsingStruct подтверждает, что struct не назначается куче.

### Упаковка и распаковка

Классический вопрос интервью X3, давай, код, отчет!

```cs
using NUnit.Framework;

namespace Newbe.DotTrace.Tests
{
    public class X03Boxing
    {
        [Test]
        public void Boxing()
        {
            for (int i = 0; i < 1_000_000; i++)
            {
                UseObject(i);
            }
        }

        [Test]
        public void NoBoxing()
        {
            for (int i = 0; i < 1_000_000; i++)
            {
                UseInt(i);
            }
        }

        public static void UseInt(int age)
        {
            // nothing
        }

        public static void UseObject(object obj)
        {
            // nothing
        }
    }
}
```

Boxing, происходит распаковка

![Boxing](/images/20201006-008.png)

NoBoxing, распаковка не произошла

![NoBoxing](/images/20201006-009.png)

Сравнивая два доклада, можно сделать следующие выводы：

1. Нет убийства без купли-продажи, нет распределения потребления без сноса.

### В чем разница между Thread.Sleep и Task.Delay

Классический вопрос интервью X4, давай, код, отчет!

```cs
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using NUnit.Framework;

namespace Newbe.DotTrace.Tests
{
    public class X04SleepTest
    {
        [Test]
        public Task TaskDelay()
        {
            return Task.Delay(TimeSpan.FromSeconds(3));
        }

        [Test]
        public Task ThreadSleep()
        {
            return Task.Run(() => { Thread.Sleep(TimeSpan.FromSeconds(3)); });
        }
    }
}
```

ThreadSleep

![ThreadSleep](/images/20201006-010.png)

TaskDelay

![TaskDelay](/images/20201006-011.png)

Сравнивая два доклада, можно сделать следующие выводы：

1. Thread.Sleep помечается отдельно в dotTrace, так как это не очень хорошая практика, которая может привести к голоду потоков.
2. Thread.Sleep имеет один поток в состоянии Sleep больше, чем Task.Delay

### Действительно ли блокирование большого количества task приводит к тому, что приложение неподвижно?

С выводами, сделанными на этом шагу, автор пришел к смелой идее.Мы все знаем, что потоки ограничены, так что, если вы запустите очень много Thread.Sleep или Task.Delay?

Давай, код：

```cs
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using NUnit.Framework;

namespace Newbe.DotTrace.Tests
{
    public class X04SleepTest
    {

        [Test]
        public Task RunThreadSleep()
        {
            return Task.WhenAny(GetTasks(50));

            IEnumerable<Task> GetTasks(int count)
            {
                for (int i = 0; i < count; i++)
                {
                    var i1 = i;
                    yield return Task.Run(() =>
                    {
                        Console.WriteLine($"Task {i1}");
                        Thread.Sleep(int. MaxValue);
                    });
                }

                yield return Task.Run(() => { Console.WriteLine("yueluo is the only one dalao"); });
            }
        }

        [Test]
        public Task RunTaskDelay()
        {
            return Task.WhenAny(GetTasks(50));

            IEnumerable<Task> GetTasks(int count)
            {
                for (int i = 0; i < count; i++)
                {
                    var i1 = i;
                    yield return Task.Run(() =>
                    {
                        Console.WriteLine($"Task {i1}");
                        return Task.Delay(TimeSpan.FromSeconds(int. MaxValue));
                    });
                }

                yield return Task.Run(() => { Console.WriteLine("yueluo is the only one dalao"); });
            }
        }
    }
}
```

Отчеты не будут размещены здесь, читатели могут попробовать этот тест, или они могут написать содержание доклада в комментариях к этой статье для участия в обсуждении

### Вызов отражения и вызов компиляции дерева выражений

Иногда нам нужно динамически вызывать метод.Наиболее известным способом является использование отражений.

Тем не менее, это также широко известный и относительно трудоемкий способ.

Здесь автор предоставляет идею создания делегатов с помощью дерева выражений для замены отражения для повышения эффективности.

Так есть ли сокращение потребления времени?Хороший отчет, я могу говорить сам.

```cs
using System;
using System.Diagnostics;
using System.Linq.Expressions;
using NUnit.Framework;

namespace Newbe.DotTrace.Tests
{
    public class X05ReflectionTest
    {
        [Test]
        public void RunReflection()
        {
            var methodInfo = GetType(). GetMethod(nameof(MoYue));
            Debug.Assert(methodInfo != null, nameof(methodInfo) + " != null");
            for (int i = 0; i < 1_000_000; i++)
            {
                methodInfo.Invoke(null, null);
            }

            Console.WriteLine(_count);
        }

        [Test]
        public void RunExpression()
        {
            var methodInfo = GetType(). GetMethod(nameof(MoYue));
            Debug.Assert(methodInfo != null, nameof(methodInfo) + " != null");
            var methodCallExpression = Expression.Call(methodInfo);
            var lambdaExpression = Expression.Lambda<Action>(methodCallExpression);
            var func = lambdaExpression.Compile();
            for (int i = 0; i < 1_000_000; i++)
            {
                func. Invoke();
            }

            Console.WriteLine(_count);
        }

        private static int _count = 0;

        public static void MoYue()
        {
            _count++;
        }
    }
}
```

RunReflection, прямой вызов с помощью отражения.

![RunReflection](/images/20201006-012.png)

RunExpression, компиляция делегата с помощью дерева выражений.

![RunExpression](/images/20201006-013.png)

## Этот подсеть

Используйте dotTrace для просмотра потребления памяти и времени метода.То, что показано в этой статье, является лишь небольшой частью этого.Разработчики могут попробовать свои первые попытки, и это может быть большим подспорьем.

Пример кода в этой статье можно найти в следующих связанных репозиториях：

- <https://github.com/newbe36524/Newbe.Demo>
- <https://gitee.com/yks/Newbe.Demo>

<!-- md Footer-Newbe-Claptrap.md -->
