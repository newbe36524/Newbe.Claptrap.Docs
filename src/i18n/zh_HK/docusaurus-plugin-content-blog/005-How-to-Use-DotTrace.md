---
date: 2020-10-06
title: 如何使用dotTrace来诊断netcore应用的性能问题
---

最近在为 [Newbe.Claptrap](https://claptrap.newbe.pro/) 做性能升级，因此将过程中使用到的 dotTrace 软件的基础用法介绍给各位开发者。

<!-- more -->

## 開篇摘要

[dotTrace](https://www.jetbrains.com/profiler/) 是 Jetbrains 公司为 .net 应用提供的一款 profile 软件。有助于对于软件中的耗时函数和内存问题进行诊断分析。

本篇，我们将使用 Jetbrains 公司的 dotTrace 软件对一些已知的性能问题进行分析。从而使读者能够掌握使用该软件的基本技能。

过程中我们将搭配一些经典的面试问题进行演示，逐步解释该软件的使用。

此次示例使用的是 Rider 作为主要演示的 IDE。 开发者也可以使用 VS + Resharper 做出相同的效果。

## 如何获取 dotTrace

dotTrace 是付费软件。目前只要购买 [dotUltimate](https://www.jetbrains.com/dotnet/) 及以上的许可证便可以直接使用该软件。

当然，该软件也包含试用版本，可以免费开启 7 天的试用时间。Jetbrains 的 IDE 购买满一年以上即可获取一个当前最新的永久使用版本。

或者也可以直接购买 [Jetbrains 全家桶许可证](https://www.jetbrains.com/all/)，一次性全部带走。

## 经典场景再现

接下来，我们通过一些经典的面试问题，来体验一下如何使用 dotTrace。

### 何时要使用 StringBuilder

这是多么经典的面试问题。能够看到这篇文章的朋友，我相信各位都知道 StringBuilder 能够减少 string 直接拼接的碎片，减少内存压力这个道理。

我们这是真的吗？会不会只是面试官想要刁难我，欺负我信息不对称呢？

没有关系，接下来，让我们使用 dotTrace 来具体的结合代码来分析一波。看看使用 StringBuilder 究竟有没有减低内存分配的压力。

首先，我们创建一个单元测试项目，并添加以下这样一个测试类：

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
                .Select(x => x.ToString())
                .ToArray();
            var re = string.Empty;
            for (int i = 0; i < 10_000; i++)
            {
                re += source[i % 10];
            }
        }

        [Test]
        public void UsingStringBuilder()
        {
            var source = Enumerable.Range(0, 10)
                .Select(x => x.ToString())
                .ToArray();
            var sb = new StringBuilder();
            for (var i = 0; i < 10_000; i++)
            {
                sb.Append(source[i % 10]);
            }

            var _ = sb.ToString();
        }
    }
}
```

然后，如下图所示，我们将 Rider 中的 profile 模式设置为 Timeline 。

![设置profile模式](/images/20201006-001.png)

TimeLine 是多种模式中的一种，相较而言，该模式可以更全面的了解各个线程的工作情况，包括有内存分配、IO 处理、锁、反射等等多维度数据。这将会作为本示例主要使用的一种模式。

接着，如下图所示，通过单元测试左侧的小图标启动对应测试的 profile。

![启动profile](/images/20201006-002.png)

启动 profile 之后，等待一段时间之后，便会出现最新生成的 timeline 报告。查看报告的位置如下所示：

![启动profile](/images/20201006-003.png)

右键选择对应的报告，选择"Open in External Viewer"，便可以使用 dotTrace 打开生成好的报告。

那么首先，让我打开第一个报告，查看 UsingString 方法生成的报告。

如下图所示，选择 .Net Memory Allocations 以查看该测试运行过程中分配的内存数额。

![启动profile](/images/20201006-004.png)

根据上图我们可以得出以下结论：

1. 在这测试中，有 102M 的内存被分配给 String 。注意，在 dotTrace 中显示的分配是指整个运行过程中全部分配的内存。即使后续被回收，该数值也不会减少。
2. 内存的分配只要在 CLR Worker 线程进行。并且非常的密集。

> Tip： Timeline 所显示的运行时间比正常运行测试的时间更长，因为在 profile 过程中需要对数据进行记录会有额外的消耗。

因此，我们就得出了第一个结论：使用 string 进行直接拼接，确实会消耗更多的内存分配。

接着，我们继续按照上面的步骤，查看一下 UsingStringBuilder 方法的报告，如下所示：

![启动profile](/images/20201006-005.png)

根据上图，我们可以得出第二个结论：使用 StringBuilder 可以明显的减少相较于 string 直接拼接所消耗的内存。

当然，我们得到的最终的结论其实是：看来面试官不是糊弄人。

### class 和 struct 对内存有什么影响

class 和 struct 的区别有很多，面试题常客了。其中，两者在内存方面就存在区别。

那么我们通过一个测试来看看区别。

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
            Console.WriteLine($"memory in bytes before execution: {GC.GetGCMemoryInfo().TotalAvailableMemoryBytes}");
            const int count = 1_000_000;
            var list = new List<Student>(count);
            for (var i = 0; i < count; i++)
            {
                list.Add(new Student
                {
                    Level = int.MinValue
                });
            }

            list.Clear();

            var gcMemoryInfo = GC.GetGCMemoryInfo();
            Console.WriteLine($"heap size: {gcMemoryInfo.HeapSizeBytes}");
            Console.WriteLine($"memory in bytes end of execution: {gcMemoryInfo.TotalAvailableMemoryBytes}");
        }

        [Test]
        public void UsingStruct()
        {
            Console.WriteLine($"memory in bytes before execution: {GC.GetGCMemoryInfo().TotalAvailableMemoryBytes}");
            const int count = 1_000_000;
            var list = new List<Yueluo>(count);
            for (var i = 0; i < count; i++)
            {
                list.Add(new Yueluo
                {
                    Level = int.MinValue
                });
            }

            list.Clear();

            var gcMemoryInfo = GC.GetGCMemoryInfo();
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

代码要点：

1. 两个测试，分别创建 1,000,000 个 class 和 struct 加入到 List 中。
2. 运行测试之后，在测试的末尾输出当前堆空间的大小。

按照上一节提供的基础步骤，我们对比两个方法生成的报告。

UsingClass

![UsingClass](/images/20201006-006.png)

UsingStruct

![UsingClass](/images/20201006-007.png)

对比两个报告，可以得出以下这些结论：

1. Timeline 报告中的内存分配，只包含分配在堆上的内存情况。
2. struct 不需要分配在堆上，但是，数组是引用对象，需要分配在堆上。
3. List 自增的过程本质是扩张数组的特性在报告中也得到了体现。
4. 另外，没有展示在报告上，而展示在测试打印文本中可以看到，UsingStruct 运行之后的堆大小也证实了 struct 不会被分配在堆上。

### 装箱和拆箱

经典面试题 X3，来，上代码，上报告！

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

Boxing,发生装箱拆箱

![Boxing](/images/20201006-008.png)

NoBoxing，未发生装箱拆箱

![NoBoxing](/images/20201006-009.png)

对比两个报告，可以得出以下这些结论：

1. 没有买卖就没有杀害，没有装拆就没有分配消耗。

### Thread.Sleep 和 Task.Delay 有什么区别

经典面试题 X4，来，上代码，上报告！

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

对比两个报告，可以得出以下这些结论：

1. 在 dotTrace 中 Thread.Sleep 会被单独标记，因为这是一种性能不不佳的做法，容易造成线程饥饿。
2. Thread.Sleep 比起 Task.Delay 会多出一个线程处于 Sleep 状态

### 阻塞大量的 Task 真的会导致应用一动不动吗

有了上一步的结论，笔者产生了一个大胆的想法。我们都知道线程的有限的，那如果启动非常多的 Thread.Sleep 或者 Task.Delay 会如何呢？

来，代码：

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
                        Thread.Sleep(int.MaxValue);
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
                        return Task.Delay(TimeSpan.FromSeconds(int.MaxValue));
                    });
                }

                yield return Task.Run(() => { Console.WriteLine("yueluo is the only one dalao"); });
            }
        }
    }
}
```

这里就不贴报告了，读者可以试一下这个测试，也可以将报告的内容写在本文的评论中参与讨论~

### 反射调用和表达式树编译调用

有时，我们需要动态调用一个方法。最广为人知的方式就是使用反射。

但是，这也是广为人知的耗时相对较高的方式。

这里，笔者提供一种使用表达式树创建委托来取代反射提高效率的思路。

那么，究竟有没有减少时间消耗呢？好报告，自己会说话。

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
            var methodInfo = GetType().GetMethod(nameof(MoYue));
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
            var methodInfo = GetType().GetMethod(nameof(MoYue));
            Debug.Assert(methodInfo != null, nameof(methodInfo) + " != null");
            var methodCallExpression = Expression.Call(methodInfo);
            var lambdaExpression = Expression.Lambda<Action>(methodCallExpression);
            var func = lambdaExpression.Compile();
            for (int i = 0; i < 1_000_000; i++)
            {
                func.Invoke();
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

RunReflection，直接使用反射调用。

![RunReflection](/images/20201006-012.png)

RunExpression，使用表达式树编译一个委托。

![RunExpression](/images/20201006-013.png)

## 本篇小结

使用 dotTrace 可以查看方法的内存和时间消耗。本篇所演示的内容只是其中很小的部分。开发者们可以尝试上手，大有裨益。

本篇内容中的示例代码，均可以在以下链接仓库中找到：

- <https://github.com/newbe36524/Newbe.Demo>
- <https://gitee.com/yks/Newbe.Demo>

<!-- md Footer-Newbe-Claptrap.md -->
