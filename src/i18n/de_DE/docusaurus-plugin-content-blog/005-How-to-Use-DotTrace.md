---
date: 2020-10-06
title: Verwenden von dotTrace zur Diagnose von Leistungsproblemen mit Netcore-Apps
---

Kürzlich ein Leistungsupgrade für die [Newbe.Claptrap](https://claptrap.newbe.pro/) , stellen Sie den Entwicklern die grundlegende Verwendung der im Prozess verwendeten dotTrace-Software vor.

<!-- more -->

## Eine Eröffnungszusammenfassung

[dotTrace](https://www.jetbrains.com/profiler/) ist die Profilsoftware von Jetbrains für .net-Anwendungen.Hilft bei der Diagnoseanalyse zeitaufwändiger Funktionen und Speicherprobleme in Ihrer Software.

In diesem Artikel verwenden wir die dotTrace-Software von Jetbrains, um einige bekannte Leistungsprobleme zu analysieren.Dies ermöglicht es dem Leser, die Grundfertigkeiten der Verwendung der Software zu beherrschen.

Während des Prozesses werden wir mit einigen klassischen Interview-Fragen gepaart, um den Einsatz der Software Schritt für Schritt zu demonstrieren.

In diesem Beispiel wird Rider als IDE für die Hauptdemonstration verwendet. Entwickler können dasselbe auch mit VS und Resharper tun.

## So erhalten Sie dotTrace

dotTrace ist kostenpflichtige Software.Derzeit [die Software direkt, solange](https://www.jetbrains.com/dotnet/) dotUltimate und höher Lizenzen erworben werden.

Natürlich enthält die Software auch eine Testversion, mit der Sie die 7-Tage-Testversion kostenlos starten können.Jetbrains IDE-Käufe sind mehr als ein Jahr alt, um die neueste Version der aktuellen permanenten Nutzung zu erhalten.

Oder Sie können [Jetbrains Familie Eimer Lizenz](https://www.jetbrains.com/all/)kaufen, alle auf einmal.

## Klassische Szenenreproduktion

Als Nächstes werfen wir einen Blick auf die Verwendung von dotTrace durch einige klassische Interviewfragen.

### Verwendung von StringBuilder

Was für eine klassische Interviewfrage.Freunde, die diesen Artikel sehen können, ich bin sicher, dass Sie alle wissen, dass StringBuilder StringBuilder String Direct Stitching Fragmentierung und Speicherstress reduzieren kann.

Sind wir echt?Wird es nur der Interviewer sein, der mich in Verlegenheit bringen und mich mit asymmetrischen Informationen belästigen will?

Es spielt keine Rolle, als nächstes verwenden wir dotTrace, um eine Welle von spezifischem Kombinationscode zu analysieren.Prüfen Sie, ob die Verwendung von StringBuilder den Druck auf die Speicherzuweisung verringert hat.

Erstellen wir zunächst ein Komponententestprojekt und fügen einen der folgenden Tests hinzu classes：

```cs
mit System.Linq;
mit System.Text;
mit NUnit.Framework;

Namespace Newbe.DotTrace.Tests

    der öffentlichen Klasse X01StringBuilderTest

        [Test]
        öffentliche void UsingString()

            var source = Enumerable.Range(0, 10)
                . Select(x => x.ToString())
                . ToArray();
            var re = String. Leer;
            für (int i = 0; i < 10_000; i++)

                re += source[i % 10];

        -

        [Test]
        öffentliche void UsingStringBuilder()

            var source = Enumerable.Range(0, 10)
                . Select(x => x.ToString())
                . ToArray();
            var sb = neuer StringBuilder();
            für (var i = 0; i < 10_000; i++)

                sb. Anfügen(Quelle[i % 10]);


            var _ = sb. ToString();



```

Anschließend legen wir, wie in der folgenden Abbildung gezeigt, das Profilmuster in Rider auf Timeline fest.

![Stellen Sie den Profele-Modus ein](/images/20201006-001.png)

TimeLine ist eines von mehreren Mustern, die eine umfassendere Ansicht der Funktionsweise jedes Threads bieten, einschließlich mehrteiliger Daten wie Speicherzuweisung, E/A-Verarbeitung, Sperren, Reflektion usw.Dies dient als eines der Hauptmuster, die in diesem Beispiel verwendet werden.

Starten Sie anschließend, wie in der folgenden Abbildung gezeigt, das Profil für den entsprechenden Test mit einem kleinen Symbol auf der linken Seite des Komponententests.

![Start profele](/images/20201006-002.png)

Nachdem Sie das Profil gestartet haben, warten Sie eine Weile, bis der zuletzt generierte Zeitachsenbericht angezeigt wird.Die Position des Ansichtsberichts wird below：

![Start profele](/images/20201006-003.png)

Klicken Sie mit der rechten Maustaste auf den entsprechenden Bericht, und wählen Sie Öffnen in externer Anzeige aus, um den generierten Bericht mit dotTrace zu öffnen.

Lassen Sie mich also zunächst den ersten Bericht öffnen und den Bericht betrachten, der von der UsingString-Methode generiert wurde.

Wie in der folgenden Abbildung gezeigt, wählen Sie .Net Memory Allocations aus, um die während des Testlaufs zugewiesene Speichermenge anzuzeigen.

![Start profele](/images/20201006-004.png)

Basierend auf der obigen Abbildung können wir folgende conclusions：

1. In diesem Test wurde String 102M Arbeitsspeicher zugewiesen.Beachten Sie, dass sich die in dotTrace angezeigte Zuordnung auf den gesamten zugewiesenen Speicher während des gesamten Laufs bezieht.Dieser Wert nimmt auch dann nicht ab, wenn er anschließend recycelt wird.
2. Speicher wird zugewiesen, solange er im CLR Worker-Thread erfolgt.Und sehr dicht.

> Tipp： Timeline zeigt längere Laufzeiten als normale Tests aufgrund des zusätzlichen Datenverbrauchs an, der während des Profilprozesses aufgezeichnet werden muss.

So kamen wir zum ersten conclusion：mit String für direktes Nähen mehr Speicherzuweisung verbraucht.

Sehen wir uns als Nächstes den Bericht über die UsingStringBuilder-Methode an, wie：

![Start profele](/images/20201006-005.png)

Basierend auf der obigen Abbildung können wir die zweite conclusion：Mit StringBuilder kann der Speicherverbrauch im Vergleich zu String-Direktnähten erheblich reduziert werden.

Natürlich kam die abschließende Schlussfolgerung, zu der wir kamen,：, dass der Interviewer die Leute nicht täuschen würde.

### Welche Auswirkungen Klasse und Struktur auf den Speicher haben

Es gibt viele Unterschiede zwischen Klasse und Struktur, und Interview-Fragen sind häufige Besucher.Es gibt einen Unterschied im Speicher zwischen den beiden.

Lassen Sie uns also einen Test machen, um den Unterschied zu sehen.

```cs
Verwendung von System;
mit System.Collections.Generic;
mit NUnit.Framework;

Namespace Newbe.DotTrace.Tests

    öffentlichen Klasse X02ClassAndStruct

        [Test]
        öffentliche void UsingClass()
        -
            Console.WriteLine('memory in bytes vor der Ausführung: 'GC'. GetGCMemoryInfo(). TotalAvailableMemoryBytes");
            const int count = 1_000_000;
            var list = neue Liste<Student>(Anzahl);
            für (var i = 0; ich < zählen; i++)

                Liste. Add(neue Student
                -
                    Ebene = int. MinValue
                )
            liste

            . Clear();

            var gcMemoryInfo = GC. GetGCMemoryInfo();
            Console.WriteLine("heap-Größe: {gcMemoryInfo.HeapSizeBytes}");
            Console.WriteLine(-Speicher in Bytes Ende der Ausführung: {gcMemoryInfo.TotalAvailableMemoryBytes}");


        [Test]
        öffentliche void UsingStruct()

            Console.WriteLine("speicher in Bytes vor der Ausführung: 'GC' . GetGCMemoryInfo(). TotalAvailableMemoryBytes");
            const int count = 1_000_000;
            var list = neue Liste<Yueluo>(Anzahl);
            für (var i = 0; ich < zählen; i++)

                Liste. Hinzufügen(neue Yueluo-
                -
                    Level = int. MinValue
                );
            liste

            . Clear();

            var gcMemoryInfo = GC. GetGCMemoryInfo();
            Console.WriteLine("Heapgröße: {gcMemoryInfo.HeapSizeBytes}");
            Console.WriteLine(-Speicher in Bytes Ende der Ausführung: {gcMemoryInfo.TotalAvailableMemoryBytes}");


        der öffentlichen Klasse Schüler
        -
            öffentliche int-Stufe erhalten; eingestellt; •
        -

        öffentliche Struktur Yueluo
        -
            öffentliche int Level - get; eingestellt; •

    -
.
```

Code Essentials：

1. In zwei Tests werden 1.000.000 Klassen erstellt und die Verknüpfung mit der Liste erstellt.
2. Geben Sie nach dem Ausführen des Tests die Größe des aktuellen Heapspeichers am Ende des Tests aus.

Nach den grundlegenden Schritten im letzten Abschnitt vergleichen wir die Berichte, die mit den beiden Methoden generiert wurden.

UsingClass

![UsingClass](/images/20201006-006.png)

UsingStruct

![UsingClass](/images/20201006-007.png)

Wenn Sie die beiden Berichte vergleichen, können Sie die folgenden conclusions：

1. Die Speicherzuweisung im Timeline-Bericht enthält nur den Speicher, der dem Heap zugewiesen ist.
2. Die Struktur muss dem Heap nicht zugewiesen werden, das Array ist jedoch ein Referenzobjekt und muss dem Heap zugewiesen werden.
3. Das Wesen des selbststeigernden Prozesses von List besteht darin, dass sich die Merkmale des Erweiterungsarrays auch im Bericht widerspiegeln.
4. Darüber hinaus wird sie nicht im Bericht angezeigt, und wie im testgedruckten Text zu sehen ist, bestätigt die Heapgröße nach dem UsingStruct-Lauf, dass die Struktur nicht dem Heap zugewiesen wird.

### Boxen und Entpacken

Klassische Interview-Frage X3, kommen, Code, berichten!

```cs
Verwendung von NUnit.Framework;

Namespace Newbe.DotTrace.Tests

    öffentlichen Klasse X03Boxing

        [Test]
        öffentliche leere Boxing()
        -
            für (int i = 0; i < 1_000_000; i++)

                UseObject(i);
            -
        -

        [Test]
        öffentliche nichtigkeit NoBoxing()

            für (int i = 0; i < 1_000_000; i++)

                UseInt(i);

        -

        öffentliche statische void UseInt(int age)
        '
            / '
        '

        öffentliche statische void UseObject(object obj)
        '


    
        /
```

Boxen, Boxen findet statt

![Boxen](/images/20201006-008.png)

NoBoxing, kein Boxen

![NoBoxing](/images/20201006-009.png)

Wenn Sie die beiden Berichte vergleichen, können Sie die folgenden conclusions：

1. Es gibt kein Töten ohne Kaufen und Verkaufen, und es gibt keine Verteilung des Verbrauchs ohne Abriss.

### Was ist der Unterschied zwischen Thread.Sleep und Task.Delay?

Klassische Interview-Frage X4, kommen Sie auf, auf den Code, auf den Bericht!

```cs
Verwendung von System;
mit System.Collections.Generic;
mit System.Threading;
mit System.Threading.Tasks;
mit NUnit.Framework;

Namespace Newbe.DotTrace.Tests

    öffentlichen Klasse X04SleepTest

        [Test]
        öffentlichen TaskDelay()

            task.Delay(TimeSpan.FromSeconds(3));


        [Test]
        öffentlichen Task ThreadSleep()

            Task.Run(()=> . });

    -

```

ThreadSleep

![ThreadSleep](/images/20201006-010.png)

TaskDelay

![TaskDelay](/images/20201006-011.png)

Wenn Sie die beiden Berichte vergleichen, können Sie die folgenden conclusions：

1. Thread.Sleep ist in dotTrace separat markiert, da es sich um eine nicht funktionierende Praxis handelt, die leicht Threadhunger verursachen kann.
2. Thread.Sleep hat einen Thread mehr im Ruhezustand als Task.Delay

### Führt das Blockieren einer großen Anzahl von Aufgaben wirklich dazu, dass Ihre App regungslos bleibt?

Mit dem Abschluss des nächsten Schritts kam der Autor auf eine kühne Idee.Wir alle wissen, dass Threads begrenzt sind, also was ist, wenn Sie eine Menge Thread.Sleep oder Task.Delay starten?

Komm, code：

```cs
Verwendung von System;
mit System.Collections.Generic;
mit System.Threading;
mit System.Threading.Tasks;
mit NUnit.Framework;

Namespace Newbe.DotTrace.Tests

    öffentlichen Klasse X04SleepTest


        [Test]
        öffentlichen Task RunThreadSleep()

            - -Datei (LANY(GetTasks(50));

            IEnumerable<Task> GetTasks(int count)
            für
                (int i = 0; ich < zählen; i++)

                    var i1 = i;
                    -Ertragsrückgabe Task.Run(() =>

                        Console.WriteLine("Task {i1}");
                        Thread.Sleep(int. MaxValue);
                    );


                Yield-Rückgabe Task.Run(() => "Console.WriteLine"("yueluo is the only one dalao"); });



        [Test]
        öffentlichen Task RunTaskDelay()

            -rückgabe Task.WhenAny(GetTasks(50));

            IEnumerable<Task> GetTasks(int count)

                für (int i = 0; i < zählen; i++)

                    var i1 = i;
                    -Ertragsrückgabe Task.Run(() =>

                        Console.WriteLine("Task {i1}");
                        Task.Delay(TimeSpan.FromSeconds(int. MaxValue));
                    ) );


                Yield-Rückgabe Task.Run(() => ,,Console.WriteLine"("yueluo is the only one dalao"); });

        -
    -
.
```

Hier ist kein Beitragsbericht, Leser können diesen Test ausprobieren, Sie können auch den Inhalt des Berichts in die Kommentare dieses Artikels schreiben, um an der Diskussion teilzunehmen

### Reflektionsaufrufe und Ausdrucksstrukturkompilierungsaufrufe

Manchmal müssen wir eine Methode dynamisch aufrufen.Der bekannteste Weg ist die Verwendung von Reflexion.

Dies ist jedoch auch eine relativ zeitaufwändige Art und Weise, um bekannt zu sein.

Hier bietet der Autor eine Idee der Verwendung von Ausdrucksbaumerstellungsdelegaten anstelle von Reflexionen, um die Effizienz zu verbessern.

Hat es also eine Verringerung des Zeitverbrauchs gegeben?Guter Bericht, ich kann selbst reden.

```cs
Verwendung von System;
mit System.Diagnostics;
mit System.Linq.Expressions;
mit NUnit.Framework;

Namespace Newbe.DotTrace.Tests

    öffentlichen Klasse X05ReflectionTest

        [Test]
        öffentliche void RunReflection()

            var methodInfo = GetType(). GetMethod(nameof(MoYue));
            Debug.Assert(methodInfo != null, nameof(methodInfo) + " != null");
            für (int i = 0; i < 1_000_000; i++)

                methodeInfo.Invoke(null, null);


            Console.WriteLine(_count);


        [Test]
        öffentliche void RunExpression()

            var methodInfo = GetType(). GetMethod(nameof(MoYue));
            Debug.Assert(methodInfo != null, nameof(methodInfo) + " != null");
            var methodCallExpression = Expression.Call(methodInfo);
            var lambdaExpression = Expression.Lambda<Action>(methodCallExpression);
            var func = lambdaExpression.Compile();
            für (int i = 0; i < 1_000_000; i++)

                Func. Invoke();


            Console.WriteLine(_count);


        private statische int _count = 0;

        öffentliche statische void MoYue()

            _count++;


.
```

RunReflection, rufen Sie direkt mit Reflektion auf.

![RunReflection](/images/20201006-012.png)

RunExpression, das einen Delegaten mithilfe einer Ausdrucksstruktur kompiliert.

![RunExpression](/images/20201006-013.png)

## Dieser Abschnitt ist ein Syn-Ende

Verwenden Sie dotTrace, um zu sehen, wie viel Arbeitsspeicher und Zeit die Methode verbraucht.Der in diesem Artikel vorgestellte Inhalt ist nur ein kleiner Teil davon.Entwickler können versuchen, loszulegen, was von Vorteil sein kann.

Den Beispielcode in diesem Artikel finden Sie im Link-Repository below：

- <https://github.com/newbe36524/Newbe.Demo>
- <https://gitee.com/yks/Newbe.Demo>

<!-- md Footer-Newbe-Claptrap.md -->
