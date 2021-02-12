---
date: 2020-10-06
title: dotTrace を使用して netcore アプリケーションのパフォーマンスの問題を診断する方法
---

最近、 [Newbe.Claptrap](https://claptrap.newbe.pro/) のパフォーマンスアップグレードを行っているため、プロセスで使用される dotTrace ソフトウェアの基本的な使用法を開発者に紹介しています。

<!-- more -->

## オープダイジェスト

[dotTrace](https://www.jetbrains.com/profiler/) は、Jetbrains が .net アプリケーション用に提供しているプロファイル ソフトウェアです。ソフトウェアの時間のかかる関数とメモリの問題の診断分析に役立ちます。

この記事では、Jetbrains の dotTrace ソフトウェアを使用して、既知のパフォーマンスの問題のいくつかを分析します。これにより、読者はソフトウェアを使用するための基本的なスキルを習得できます。

このプロセスでは、いくつかの古典的なインタビューの質問と一緒にデモを行い、ソフトウェアの使用をステップバイステップで説明します。

この例では、メイン デモとして Rider の IDE を使用しています。 開発者は、VS + Resharper を使用して同じ効果を得ることができます。

## dotTrace を取得する方法

dotTrace は有料ソフトウェアです。現在、このソフトウェア [dotUltimate](https://www.jetbrains.com/dotnet/) 以上のライセンスを購入すると、直接使用できます。

もちろん、このソフトウェアには、7 日間の試用期間を無料で有効にする試用版も含まれています。Jetbrains の IDE は、1 年以上購入して、最新の永久使用バージョンを取得します。

または、Jetbrains [バケット ライセンスを直接購入し、](https://www.jetbrains.com/all/)一度にすべて持ち帰ることができます。

## クラシックシーン再現

次に、いくつかの古典的なインタビューの質問を通してdotTraceを使用する方法を体験します。

### StringBuilder を使用する場合

どのような古典的なインタビューの質問です。この記事を見ることができる友人は、StringBuilder が string の直接ステッチの断片化を減らし、メモリの負荷を軽減することを知っていると思います。

本当か?面接官が私を苦しめ、情報の非対称性をいじめただけでしょうか。

問題ない、次に、dotTrace を使用して、特定の結合コードを使用して波を分析します。StringBuilder を使用して、メモリ割り当てのストレスを軽減する必要があるかどうかを確認します。

まず、単体テスト プロジェクトを作成し、次のようなテスト クラスを追加します：

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

次に、次の図に示すように、 Rider のプロファイル モードを Timeline に設定します。

![プロファイルモードを設定します](/images/20201006-001.png)

TimeLine は、メモリ割り当て、IO 処理、ロック、リフレクションなどの多次元データなど、個々のスレッドの動作をより包括的に把握できる複数のパターンの 1 つです。これは、この例で主に使用されるパターンの 1 つです。

次に、次の図に示すように、単体テストの左側にある小さなアイコンを使用して、対応するテストのプロファイルを開始します。

![プロファイルを起動します](/images/20201006-002.png)

プロファイルを起動した後、しばらく待ってから、最新の timeline レポートが表示されます。レポートを表示する場所は次のとおりです：

![プロファイルを起動します](/images/20201006-003.png)

右クリックしてレポートを選択し、Open in External Viewer を選択すると、dotTrace を使用して生成されたレポートを開くことができます。

まず、最初のレポートを開いて、UsingString メソッドによって生成されたレポートを確認します。

次の図に示すように、.Net Memory Allocations を選択して、テストの実行中に割り当てられたメモリの量を確認します。

![プロファイルを起動します](/images/20201006-004.png)

上の図から、次の結論を導き出すことができます：

1. このテストでは、102M のメモリが String に割り当てされます。dotTrace に表示される割り当ては、実行中に割り当てられたメモリ全体を参照します。その後に回収されたとしても、その値は減少しません。
2. メモリの割り当ては、CLR ワーカー スレッドで行われる限りです。そして、非常に密。

> Tip： Timeline は、プロファイル プロセス中にデータを記録する必要があるため、通常のテストよりも実行時間が長くなります。

したがって、最初の結論に達しました：string を使用して直接ステッチすると、より多くのメモリ割り当てが消費されます。

次に、上記の手順に従って、次のように UsingStringBuilder メソッドのレポートを：

![プロファイルを起動します](/images/20201006-005.png)

上の図から 2 番目の結論が導き出されます：StringBuilder を使用すると、string 直接ステッチよりも消費されるメモリが大幅に削減されます。

もちろん 最終的な結論は：面接官が 混乱していないように見えるというものです

### class と struct がメモリに与える影響

class と struct には多くの違いがあり、面接の質問は頻繁に行います。このうち、メモリには違いがあります。

次に、テストで違いを見てみましょう。

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

コードの要点：

1. 1,000,000 の class と struct を作成する 2 つのテストが List に追加されます。
2. テストの実行後、現在のヒープ領域のサイズがテストの最後に出力されます。

前のセクションで説明した基本的な手順に従って、2 つのメソッドによって生成されたレポートを比較します。

UsingClass

![UsingClass](/images/20201006-006.png)

UsingStruct

![UsingClass](/images/20201006-007.png)

2 つのレポートを比較すると、次の結論が導き出されます：

1. Timeline レポートのメモリ割り当てには、ヒープに割り当てられたメモリの状態のみが含まれます。
2. struct はヒープに割り当てる必要はありませんが、配列は参照オブジェクトであり、ヒープに割り当てる必要があります。
3. List の自己増加のプロセスの本質は、拡張配列の特性がレポートにも反映されている場合です。
4. また、レポートには表示されませんが、テスト印刷テキストでは、UsingStruct の実行後のヒープ サイズによって、struct がヒープに割り当てられていないという証拠が表示されます。

### ボックス化とボックス化解除

古典的なインタビューの質問X3は、来て、コードに、報告!

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

Boxing、ボックス化解除が発生しました

![Boxing](/images/20201006-008.png)

NoBoxing、ボックス化解除は発生しません

![NoBoxing](/images/20201006-009.png)

2 つのレポートを比較すると、次の結論が導き出されます：

1. 売買なしでは殺す、解体なし、分配消費なし。

### Thread.Sleep と Task.Delay の違いは何ですか?

古典的なインタビューの質問X4は、来て、コードに、報告!

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

2 つのレポートを比較すると、次の結論が導き出されます：

1. DotTrace では、Thread.Sleep は、スレッドの飢餓を引き起こす可能性が高いパフォーマンスの低いプラクティスであるため、個別にマークされます。
2. Thread.Sleep は、Task.Delay よりも 1 つのスレッドが Sleep 状態になります

### 大量の Task をブロックすると、実際にアプリが動かなくなるのか

前のステップの結論で、著者は大胆な考えを思いつきました。我々は、すべてのスレッドの制限を知っているので、Thread.SleepやTask.Delayの非常に多くの起動はどうなりますか?

来て、コード：

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

ここではレポートを投稿しませんが、読者はこのテストを試したり、レポートの内容をこの記事のコメントに書き込んで議論に参加することができます

### リフレクション呼び出しと式ツリー コンパイル呼び出し

場合によっては、メソッドを動的に呼び出す必要があります。最もよく知られている方法は、反射を使用することです。

しかし、それはまた、広く知られている比較的時間のかかる方法です。

ここでは、リフレクションの代わりに式ツリーを使用してデリゲートを作成し、効率を向上させる方法を提供します。

では、時間の消費は減ったのでしょうか。良いレポートは、自分で話す。

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

RunReflection は、リフレクション呼び出しを直接使用します。

![RunReflection](/images/20201006-012.png)

RunExpression は、式ツリーを使用してデリゲートをコンパイルします。

![RunExpression](/images/20201006-013.png)

## この記事の結び目

dotTrace を使用すると、メソッドのメモリと時間の消費量を確認できます。この記事で示されている内容は、ごく一部です。開発者は、長い道のりを行く、それを試すことができます。

この記事のサンプル コードは、次のリンク リポジトリにあります：

- <https://github.com/newbe36524/Newbe.Demo>
- <https://gitee.com/yks/Newbe.Demo>

<!-- md Footer-Newbe-Claptrap.md -->
