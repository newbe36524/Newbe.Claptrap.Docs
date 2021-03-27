---
date: 2020-10-06
title: 如何使用dotTrace來診斷netcore應用的性能問題
---

最近在為 [Newbe.Claptrap](https://claptrap.newbe.pro/) 做性能升級，因此將過程中使用到的 dotTrace 軟體的基礎用法介紹給各位開發者。

<!-- more -->

## 開篇摘要

[dotTrace](https://www.jetbrains.com/profiler/) 是 Jetbrains 公司為 .net 應用提供的一款 profile 軟體。有助於對於軟體中的耗時函數和記憶體問題進行診斷分析。

本篇，我們將使用 Jetbrains 公司的 dotTrace 軟體對一些已知的性能問題進行分析。從而使讀者能夠掌握使用該軟體的基本技能。

過程中我們將搭配一些經典的面試問題進行演示，逐步解釋該軟體的使用。

此次示例使用的是 Rider 作為主要演示的 IDE。 開發者也可以使用 VS + Resharper 做出相同的效果。

## 如何獲取 dotTrace

dotTrace 是付費軟體。目前只要購買 [dotUltimate](https://www.jetbrains.com/dotnet/) 及以上的許可證便可以直接使用該軟體。

當然，該軟體也包含試用版本，可以免費開啟 7 天的試用時間。Jetbrains 的 IDE 購買滿一年以上即可獲取一個當前最新的永久使用版本。

或者也可以直接購買 [Jetbrains 全家桶許可證](https://www.jetbrains.com/all/)，一次性全部帶走。

## 經典場景再現

接下來，我們通過一些經典的面試問題，來體驗一下如何使用 dotTrace。

### 何時要使用 StringBuilder

這是多麼經典的面試問題。能夠看到這篇文章的朋友，我相信各位都知道 StringBuilder 能夠減少 string 直接拼接的碎片，減少記憶體壓力這個道理。

我們這是真的嗎？會不會只是面試官想要刁難我，欺負我信息不對稱呢？

沒有關係，接下來，讓我們使用 dotTrace 來具體的結合代碼來分析一波。看看使用 StringBuilder 究竟有沒有減低記憶體分配的壓力。

首先，我們創建一個單元測試專案，並添加以下這樣一個測試類：

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

然後，如下圖所示，我們將 Rider 中的 profile 模式設定為 Timeline 。

![設置profile模式](/images/20201006-001.png)

TimeLine 是多種模式中的一種，相較而言，該模式可以更全面的瞭解各個線程的工作情況，包括有記憶體分配、IO 處理、鎖、反射等等多維度數據。這將會作為本示例主要使用的一種模式。

接著，如下圖所示，通過單元測試左側的小圖示啟動對應測試的 profile。

![啟動profile](/images/20201006-002.png)

啟動 profile 之後，等待一段時間之後，便會出現最新生成的 timeline 報告。檢視報告的位置的一個不使用：

![啟動profile](/images/20201006-003.png)

右鍵選擇對應的報告，選擇"Open in External Viewer"，便可以使用 dotTrace 打開生成好的報告。

那麼首先，讓我打開第一個報告，查看 UsingString 方法生成的報告。

如下圖所示，選擇 .Net Memory Allocations 以查看該測試運行過程中分配的記憶體數額。

![啟動profile](/images/20201006-004.png)

根據上圖我們可以得出以下結論：

1. 在這測試中，有 102M 的記憶體被分配給 String 。注意，在 dotTrace 中顯示的分配是指整個運行過程中全部分配的記憶體。即使後續被回收，該數值也不會減少。
2. 記憶體的分配只要在 CLR Worker 線程進行。並且非常的密集。

> Tip： Timeline 所顯示的運行時間比正常運行測試的時間更長，因為在 profile 過程中需要對資料進行記錄會有額外的消耗。

因此，我們就得出了第一個結論：使用 string 進行直接拼接，確實會消耗更多的記憶體分配。

接著，我們繼續按照上面的步驟，查看一下 UsingStringBuilder 方法的報告，如下所示：

![啟動profile](/images/20201006-005.png)

根據上圖，我們可以得出第二個結論：使用 StringBuilder 可以明顯的減少相較於 string 直接拼接所消耗的記憶體。

當然，我們得到的最終的結論其實是：看來面試官不是糊弄人。

### class和struct對記憶體有什麼影響

class 和 struct 的區別有很多，面試題常客了。其中，兩者在記憶體方面就存在區別。

那麼我們通過一個測試來看看區別。

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

代碼要點：

1. 兩個測試，分別創建 1，000，000 個 class 和 struct 加入到 List 中。
2. 運行測試之後，在測試的末尾輸出當前堆空間的大小。

按照上一節提供的基礎步驟，我們對比兩個方法生成的報告。

UsingClass

![UsingClass](/images/20201006-006.png)

UsingStruct

![UsingClass](/images/20201006-007.png)

對比兩個報告，可以得出以下這些結論：

1. Timeline 報告中的記憶體分配，只包含分配在堆上的記憶體情況。
2. struct 不需要分配在堆上，但是，陣列是引用物件，需要分配在堆上。
3. List 自增的過程本質是擴張陣列的特性在報告中也得到了體現。
4. 另外，沒有展示在報告上，而展示在測試列印文本中可以看到，UsingStruct 運行之後的堆大小也證實了struct不會被分配在堆上。

### 裝箱和拆箱

經典面試題 X3，來，上代碼，上報告！

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

Boxing，發生裝箱拆箱

![Boxing](/images/20201006-008.png)

NoBoxing，未發生裝箱拆箱

![NoBoxing](/images/20201006-009.png)

對比兩個報告，可以得出以下這些結論：

1. 沒有買賣就沒有殺害，沒有裝拆就沒有分配消耗。

### Thread.Sleep 和 Task.Delay 有什麼區別

經典面試題 X4，來，上代碼，上報告！

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

對比兩個報告，可以得出以下這些結論：

1. 在 dotTrace 中 Thread.Sleep 會被單獨標記，因為這是一種性能不不佳的做法，容易造成線程饑餓。
2. Thread.Sleep 比起 Task.Delay 會多出一個線程處於 Sleep 狀態

### 阻塞大量的 Task 真的會導致應用一動不動嗎

有了上一步的結論，筆者產生了一個大膽的想法。我們都知道線程的有限的，那如果啟動非常多的 Thread.Sleep 或者 Task.Delay 會如何呢？

來，程式碼：

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

這裡就不貼報告了，讀者可以試一下這個測試，也可以將報告的內容寫在本文的評論中參與討論~

### 反射調用和表達式樹編譯調用

有時，我們需要動態調用一個方法。最廣為人知的方式就是使用反射。

但是，這也是廣為人知的耗時相對較高的方式。

這裏，筆者提供一種使用表達式樹創建委託來取代反射提高效率的思路。

那麼，究竟有沒有減少時間消耗呢？好報告，自己會說話。

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

RunReflection，直接使用反射調用。

![RunReflection](/images/20201006-012.png)

RunExpression，使用運算式樹編譯一個委託。

![RunExpression](/images/20201006-013.png)

## 本篇小結

使用 dotTrace 可以查看方法的記憶體和時間消耗。本篇所演示的內容只是其中很小的部分。開發者們可以嘗試上手，大有裨益。

本篇內容中的範例代碼，均可以在以下連結主目錄中找到：

- <https://github.com/newbe36524/Newbe.Demo>
- <https://gitee.com/yks/Newbe.Demo>

<!-- md Footer-Newbe-Claptrap.md -->
