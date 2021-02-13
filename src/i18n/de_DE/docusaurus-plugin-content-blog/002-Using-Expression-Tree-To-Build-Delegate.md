---
date: 2020-10-13
title: In nur zehn Schritten können Sie eine Ausdrucksstruktur anwenden, um dynamische Aufrufe zu optimieren.
---

Ausdrucksstrukturen sind eine Reihe sehr nützlicher Typen in .net.Die Verwendung von Ausdrucksstrukturen in einigen Szenarien kann zu einer besseren Leistung und einer besseren Skalierbarkeit führen.In diesem Artikel verstehen und wenden wir die Vorteile von Ausdrucksbäumen beim Erstellen dynamischer Aufrufe an, indem wir einen "Modellvalidierer" erstellen.

<!-- more -->

## Eine Eröffnungszusammenfassung

Vor nicht allzu langer Zeit haben wir[Wie man dotTrace verwendet, um Leistungsprobleme mit netcore-Apps](005-How-to-Use-DotTrace)zu diagnostizieren, und nach einer Netizen-Abstimmung bekundeten netizens Interesse am Inhalt des Ausdrucksbaums, daher werden wir in diesem Artikel darüber sprechen.

Dynamisches Aufrufen ist eine Anforderung, die häufig in der .net-Entwicklung auftritt, d. h. dynamische Aufrufmethoden oder Eigenschaften, wenn nur Methodennamen oder Eigenschaftsnamen bekannt sind.Eine der bekanntesten Implementierungen ist die Verwendung von "Reflexion", um eine solche Anforderung zu erreichen.Natürlich gibt es einige Hochleistungsszenarien, die Emit verwenden, um diese Anforderung zu erfüllen.

In diesem Artikel wird die Verwendung von Ausdrucksstrukturen zum Implementieren dieses Szenarios beschrieben, da dieser Ansatz eine bessere Leistung und Skalierbarkeit als "Reflektion" hat und einfacher zu beherrschen ist als Emit.

Wir verwenden ein bestimmtes Szenario, um dynamische Aufrufe Schritt für Schritt mit Ausdrücken zu implementieren.

In diesem Szenario erstellen wir einen Modellvalidierer, der dem Anforderungsszenario für ModelState in aspnet mvc sehr ähnlich ist.

Dies****ein einfacher Einführungsartikel für Erstleser, und es wird empfohlen, dass Sie sehen, während Sie frei sind und eine IDE zur Hand haben, um nebenbei zu tun.Zur gleichen Zeit, auch nicht über die Details des Beispiels der Methode kümmern müssen, müssen nur die allgemeine Idee zu verstehen, kann nach dem Stil gemalt werden kann sein, meistern Sie die große Idee und dann tiefgründiges Verständnis ist nicht zu spät.

Um den Speicherplatz zu verkürzen, wird der Beispielcode im Artikel das unbewegte Teil ausblenden, und wenn Sie den vollständigen Testcode abrufen möchten, öffnen Sie das Code-Repository am Ende des Zuziehvorgangs.

## Es gibt immer noch ein Video

Diese Artikelserie ist mit einem zehnstündigen Video verpackt.Denken Sie an einen Klick, drei Unternehmen! <iframe src="//player.bilibili.com/player.html?aid=797475985&bvid=BV15y4y1r7pK&cid=247120978&page=1" scrolling="no" border="0" frameBorder="no" frameSpacing="0" allowFullScreen="true" mark="crwd-mark"> </iframe>

Original-Video-address：<https://www.bilibili.com/video/BV15y4y1r7pK>

## Warum Ausdrucksstrukturen verwenden, warum kann ich Ausdrucksstrukturen verwenden?

Das erste, was zu bestätigen ist, dass es zwei：

1. Ist es besser, Reflexion durch Ausdrucksbäume zu ersetzen?
2. Gibt es einen erheblichen Leistungsverlust, der Ausdrucksstrukturen für dynamische Aufrufe verwendet?

Es gibt ein Problem, machen Sie das Experiment.Wir haben zwei Komponententests verwendet, um beide Probleme zu validieren.

Aufrufen der Methode eines object：

```cs
Verwendung von System;
mit System.Diagnostics;
mit System.Linq.Expressions;
mit System.Reflection;
mit FluentAssertions;
mit NUnit.Framework;

Namespace Newbe.ExpressionsTests

    öffentlichen Klasse X01CallMethodTest

        private const int Count = 1_000_000;
        private const int Diff = 100;

        [SetUp]
        öffentliche void Init()
        -
            _methodInfo = typeof(Claptrap). GetMethod(nameof(Claptrap.LevelUp));
            Debug.Assert(_methodInfo != null, nameof(_methodInfo) + " != null");

            var-Instanz = Expression.Parameter(typeof(Claptrap), "c");
            var levelP = Expression.Parameter(typeof(int), "l");
            var callExpression = Expression.Call(instance, _methodInfo, levelP);
            var lambdaExpression = Expression.Lambda<Action<Claptrap, int>>(callExpression, instance, levelP);
            / sollte /lambdaExpression wie (Claptrap c,int l) =>  c.LevelUp(l); •
            _func = lambdaExpression.Compile();


        [Test]
        öffentliche void RunReflection()
        -
            var claptrap = new Claptrap();
            für (int i = 0; i < Zählen; i++)

                _methodInfo.Invoke(claptrap, new[]


            Klatsche. Level.Should(). Be(Anzahl * Diff);


        [Test]
        öffentliche void RunExpression()
        -
            var claptrap = new Claptrap();
            für (int i = 0; i < Zählen; i++)

                _func. Invoke(claptrap, Diff);


            Klatsche. Level.Should(). Be(Anzahl * Diff);


        [Test]
        öffentliche Leere Direkt()

            var claptrap = new Claptrap();
            für (int i = 0; i < Zählen; i++)

                Klatsche. Levelup(Diff);


            Klatsche. Level.Should(). Be(Anzahl * Diff);


        privaten MethodInfo-_methodInfo;
        private Aktion<Claptrap, int> _func;

        der öffentlichen Klasse Claptrap

            öffentliche int Level erhalten; eingestellt; •

            öffentliche void LevelUp(int diff)
            -
                Level += diff;


-

```

In den oben genannten Tests haben wir eine Million Mal für den dritten Anruf angerufen und die Zeit aufgezeichnet, die für jeden Test aufgewendet wurde.Sie können ähnliche Ergebnisse wie die following：

| Methode       | Zeit  |
| ------------- | ----- |
| RunReflection | 217ms |
| RunExpression | 20ms  |
| Direkt        | 19ms  |

Folgende Schlussfolgerungen können drawn：

1. Das Erstellen eines Delegaten mit einer Ausdrucksstruktur für dynamische Aufrufe kann fast die gleiche Leistung wie direkte Aufrufe erhalten.
2. Das Erstellen eines Delegaten mit einer Ausdrucksstruktur benötigt etwa ein Zehntel der Zeit, um einen dynamischen Aufruf zu tätigen.

Wenn Sie also nur an die Leistung denken, sollten Sie eine Ausdrucksstruktur verwenden, oder Sie können eine Ausdrucksstruktur verwenden.

Dies spiegelt sich jedoch in einer Million Aufrufen wider, die in der Zeit erscheinen, denn ein einziger Anruf ist eigentlich der Unterschied zwischen der Nanecond-Ebene, in der Tat, der Bedeutungslosigkeit.

Aber in der Tat, Ausdruckbäume sind nicht nur besser in der Leistung als Reflexion, ihre leistungsfähigere Skalierbarkeit verwendet tatsächlich die wichtigsten Funktionen.

Es gibt auch einen Test für die Eigenschaften, bei dem der Testcode und die Ergebnisse：

```cs
Verwendung von System;
mit System.Diagnostics;
mit System.Linq.Expressions;
mit System.Reflection;
mit FluentAssertions;
mit NUnit.Framework;

Namespace Newbe.ExpressionsTests

    öffentlichen Klasse X02PropertyTest

        private const int Count = 1_000_000;
        private const int Diff = 100;

        [SetUp]
        öffentliche void Init()
        -
            _propertyInfo = typeof(Claptrap). GetProperty(nameof(Claptrap.Level));
            Debug.Assert(_propertyInfo != null, nameof(_propertyInfo) + " != null");

            var-Instanz = Expression.Parameter(typeof(Claptrap), "c");
            var levelProperty = Expression.Property(instanz, _propertyInfo);
            var levelP = Expression.Parameter(typeof(int), "l");
            var addAssignExpression = Expression.AddAssign(levelProperty, levelP);
            var lambdaExpression = Expression.Lambda<Action<Claptrap, int>>(addAssignExpression, instance, levelP);
            / / lambdaExpression sollte wie (Claptrap c,int l) =>  c.Level += l; •
            _func = lambdaExpression.Compile();


        [Test]
        öffentliche void RunReflection()
        -
            var claptrap = new Claptrap();
            für (int i = 0; i < Graf; i++)

                var-Wert = (int) _propertyInfo.GetValue(claptrap);
                _propertyInfo.SetValue(Claptrap, Wert + Diff);


            Klatsche. Level.Should(). Be(Anzahl * Diff);


        [Test]
        öffentliche void RunExpression()
        -
            var claptrap = new Claptrap();
            für (int i = 0; i < Zählen; i++)

                _func. Invoke(claptrap, Diff);


            Klatsche. Level.Should(). Be(Anzahl * Diff);


        [Test]
        öffentliche Leere Direkt()

            var claptrap = new Claptrap();
            für (int i = 0; i < Zählen; i++)

                Klatsche. Stufe += Diff;


            Klatsche. Level.Should(). Be(Anzahl * Diff);


        privaten PropertyInfo _propertyInfo;
        private Aktion<Claptrap, int> _func;

        der öffentlichen Klasse Claptrap
        ,
            öffentliche int Level erhalten; eingestellt; •
        -
    -

```

Zeit-consuming：

| Methode       | Zeit  |
| ------------- | ----- |
| RunReflection | 373ms |
| RunExpression | 19ms  |
| Direkt        | 18ms  |

Da die Reflexion mehr als eine Entpackenvon verbrauchen, ist sie langsamer als die vorherige Testprobe, und die Verwendung von Delegaten ist kein solcher Verbrauch.

## Schritt 10, Anforderungsdemonstration

Beginnen wir mit einem Test, um zu sehen, welche Art von Anforderungen wir für den Modellvalidator erstellen werden.

```cs
Verwendung von System.ComponentModel.DataAnnotations;
mit FluentAssertions;
mit NUnit.Framework;

Namespace Newbe.ExpressionsTests
'
    //// <summary>
    //validate data by static method
    // </summary>
    public class X03PropertyValidationTest00
    '
        private const int Count = 10_000;

        [Test]
        öffentliche nichtigkeit Run()
        für
            für (int i = 0; i < Graf; i++)

                / Test 1
                -
                    var-Eingang = neue CreateClaptrapInput();
                    var (isOk, errorMessage) = Validate(input);
                    isOk.Should(). BeFalse();
                    errorMessage.Should(). Be("fehlender Name");
                -

                / testen
                Sie die eingabe -
                    var -  -

                    - .
                        .
                    var (isOk, errorMessage) = Validate(input);
                    isOk.Should(). BeFalse();
                    errorMessage.Should(). Be("Länge des Namens sollte groß als 3 sein");


                / test 3
                -
                    var input = neue CreateClaptrapInput
                    -
                        Name = "yueluo ist der einzige dalao"
                    .
                    var (isOk, errorMessage) = Validate(input);
                    isOk.Should(). BeTrue();
                    errorMessage.Should(). Benullorempty();
                -
            -
        -

        öffentliche statische ValidateResult Validate(CreateClaptrapInput-Eingabe)

            validateCore(input, 3);


        öffentlichen statischen ValidateResult ValidateCore(CreateClaptrapInput-Eingabe, int minLength)

            if (Zeichenfolge. IsNullOrEmpty(Eingang. Name))

                ValidateResult.Error("missing Name") zurückgeben.


            if (Eingang. Name.Length < minLength)

                geben ValidateResult.Error('"Länge des Namens sollte größer sein als {minLength}");


            ValidateResult.Ok();


        der öffentlichen Klasse CreateClaptrapInput

            [Required] [MinLength(3)] öffentlichen Zeichenfolgenname - get; eingestellt; •
        -

        public struct ValidateResult
        -
            public bool IsOk - get; eingestellt; •
            öffentliche Zeichenfolge ErrorMessage - get; eingestellt; -

            öffentliche void Deconstruct(out bool isOk, out string errorMessage)
            '
                isOk = IsOk;
                errorMessage = ErrorMessage;


            öffentlichen statischen ValidateResult Ok()

                neue ValidateResult-

                    IsOk = true
                .


            öffentlichen statischen ValidateResult Error(string errorMessage)

                neues ValidateResult
                zurückgeben,
                    IsOk = false,
                    ErrorMessage = errorMessage
                ;

        -
    -
.
```

Von oben nach unten, die wichtigsten Punkte des obigen Codes：

1. Die Haupttestmethode enthält drei grundlegende Testfälle, von denen jeder 10.000 Mal ausgeführt wird.Alle nachfolgenden Schritte werden solche Testfälle verwenden.
2. Die Validate-Methode ist die zu testende Wrappermethode, und die Implementierung der Methode wird anschließend aufgerufen, um den Effekt zu überprüfen.
3. ValidityCore ist eine Demoimplementierung von Modellvalidierern.Wie Sie aus dem Code sehen können, überprüft die Methode das CreateClaptrapInput-Objekt und ruft die Ergebnisse ab.Aber die Nachteile dieser Methode sind auch sehr offensichtlich, was ein typisches "Schreiben tot" ist.Wir werden eine Reihe von Renovierungen verfolgen.Machen Sie unseren Model Validator vielseitiger und, was wichtig ist, so effizient wie dieser "Write Dead"-Ansatz!
4. ValidateResult ist das Ergebnis der Validierungsausgabe.Das Ergebnis wird immer wieder wiederholt.

## Der erste Schritt besteht darin, die statische Methode aufzurufen.

Zuerst erstellen wir die erste Ausdrucksstruktur, die validateCore direkt mit der statischen Methode im letzten Abschnitt verwendet.

```cs
Verwendung von System;
mit System.ComponentModel.DataAnnotations;
mit System.Diagnostics;
mit System.Linq.Expressions;
mit FluentAssertions;
mit NUnit.Framework;

Namespace Newbe.ExpressionsTests

    // <summary>
    /////Validate date by func created with Expression
    /// </summary>
    public class X03PropertyValidationTest01
    '
        private const int Count = 10_000;

        private statische Func-<CreateClaptrapInput, int, ValidateResult> _func;

        [SetUp]
        öffentliche void Init()

            versuchen

                var-Methode = typeof(X03PropertyValidationTest01). GetMethod(nameof(ValidateCore));
                Debug.Assert(Methode != null, nameof(methode) + " != null");
                var pExp = Expression.Parameter(typeof(CreateClaptrapInput));
                var minLengthPExp = Expression.Parameter(typeof(int));
                var body = Expression.Call(methode, pExp, minLengthPExp);
                var-Ausdruck = Expression.Lambda<Func<CreateClaptrapInput, int, ValidateResult>>(body,
                    pExp,
                    minLengthPExp);
                _func = expression.Compile();

            ab (Ausnahme e)

                Console.WriteLine(e);
                werfen;

        -

        [Test]
        öffentliche void Run()
        -
           / siehe Code in Demo-Repo-
        -

        öffentliche statische ValidateResult Validate(CreateClaptrapInput-Eingabe)

            _func zurückgeben. Invoke(Eingang, 3);


        öffentliche statische ValidateResult ValidateCore(CreateClaptrapInput-Eingabe, int minLength)

            if (Zeichenfolge. IsNullOrEmpty(Eingang. Name))
            {
                return ValidateResult.Error("missing Name");


            if (Eingang. Name.Length < minLength)

                validateResult.Error.Error('Länge des Namens sollte größer sein als {minLength}");


            ValidateResult.Ok();

.
    .
```

Von oben nach unten, die wichtigsten Punkte des obigen Codes：

1. Eine Initialisierungsmethode für Komponententests wurde hinzugefügt, und eine Ausdrucksstruktur, die zu Beginn des Komponententests erstellt wurde, kompiliert sie als Delegat, um sie im statischen Feld _func zu speichern.
2. Der Code in der Haupttestmethode Ausführen wird weggelassen, sodass der Leser weniger Speicherplatz lesen kann.Der eigentliche Code hat sich nicht geändert, und die Beschreibung wird in Zukunft nicht wiederholt.Sie können es im Codedemo-Repository anzeigen.
3. Die Implementierung der Validate-Methode wurde so geändert, dass validateCore nicht mehr direkt aufgerufen wird, _func überprüft werden.
4. Durch ausführen des Tests können Entwickler sehen, dass es fast so viel Zeit in Anspruch nimmt wie der nächste direkte Aufruf, ohne zusätzlichen Verbrauch.
5. Dies bietet die einfachste Möglichkeit, Ausdrücke für dynamische Aufrufe zu verwenden, wenn Sie eine statische Methode (z. B. ValidateCore) schreiben können, um die Prozedur für dynamische Aufrufe darzustellen.Verwenden wir also einfach einen Buildprozess ähnlich dem in Init, um Ausdrücke und Delegaten zu erstellen.
6. Entwickler können versuchen, ValidateCore einen dritten Parameternamen hinzuzufügen, damit sie die Fehlermeldung einschließen können, um zu verstehen, ob Sie einen so einfachen Ausdruck erstellen.

## Der zweite Schritt besteht darin, Ausdrücke zu kombinieren.

Obwohl wir im vorherigen Schritt den dynamischen Aufruf direkt konvertieren, muss valideCore jedoch weiter geändert werden, da ValidateCore noch tot ist.

In diesem Schritt teilen wir die drei in ValidateCore tot geschriebenen Rückgabepfade in verschiedene Methoden auf und fügen sie dann mit Ausdrücken zusammen.

Wenn wir das tun, dann sind wir an einem guten Ort, um mehr Methoden zusammenzufügen, um ein gewisses Maß an Expansion zu erreichen.

Note：der Democode sofort lang sein wird und nicht zu viel Druck verspüren muss, der mit einer Nachverfolgungscodepunktbeschreibung angezeigt werden kann.

```cs
using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq.Expressions;
using FluentAssertions;
using NUnit.Framework;

// ReSharper disable InvalidXmlDocComment

namespace Newbe.ExpressionsTests
{
    /// <summary>
    /// Block Expression
    /// </summary>
    public class X03PropertyValidationTest02
    {
        private const int Count = 10_000;

        private static Func<CreateClaptrapInput, int, ValidateResult> _func;

        [SetUp]
        public void Init()
        {
            try
            {
                var finalExpression = CreateCore();
                _func = finalExpression.Compile();

                Expression<Func<CreateClaptrapInput, int, ValidateResult>> CreateCore()
                {
                    // exp for input
                    var inputExp = Expression.Parameter(typeof(CreateClaptrapInput), "input");
                    var minLengthPExp = Expression.Parameter(typeof(int), "minLength");

                    // exp for output
                    var resultExp = Expression.Variable(typeof(ValidateResult), "result");

                    // exp for return statement
                    var returnLabel = Expression.Label(typeof(ValidateResult));

                    // build whole block
                    var body = Expression.Block(
                        new[] {resultExp},
                        CreateDefaultResult(),
                        CreateValidateNameRequiredExpression(),
                        CreateValidateNameMinLengthExpression(),
                        Expression.Label(returnLabel, resultExp));

                    // build lambda from body
                    var final = Expression.Lambda<Func<CreateClaptrapInput, int, ValidateResult>>(
                        body,
                        inputExp,
                        minLengthPExp);
                    return final;

                    Expression CreateDefaultResult()
                    {
                        var okMethod = typeof(ValidateResult).GetMethod(nameof(ValidateResult.Ok));
                        Debug.Assert(okMethod != null, nameof(okMethod) + " != null");
                        var methodCallExpression = Expression.Call(okMethod);
                        var re = Expression.Assign(resultExp, methodCallExpression);
                        /**
                         * final as:
                         * result = ValidateResult.Ok()
                         */
                        return re;
                    }

                    Expression CreateValidateNameRequiredExpression()
                    {
                        var requireMethod = typeof(X03PropertyValidationTest02).GetMethod(nameof(ValidateNameRequired));
                        var isOkProperty = typeof(ValidateResult).GetProperty(nameof(ValidateResult.IsOk));
                        Debug.Assert(requireMethod != null, nameof(requireMethod) + " != null");
                        Debug.Assert(isOkProperty != null, nameof(isOkProperty) + " != null");

                        var requiredMethodExp = Expression.Call(requireMethod, inputExp);
                        var assignExp = Expression.Assign(resultExp, requiredMethodExp);
                        var resultIsOkPropertyExp = Expression.Property(resultExp, isOkProperty);
                        var conditionExp = Expression.IsFalse(resultIsOkPropertyExp);
                        var ifThenExp =
                            Expression.IfThen(conditionExp,
                                Expression.Return(returnLabel, resultExp));
                        var re = Expression.Block(
                            new[] {resultExp},
                            assignExp,
                            ifThenExp);
                        /**
                         * final as:
                         * result = ValidateNameRequired(input);
                         * if (!result.IsOk)
                         * {
                         *     return result;
                         * }
                         */
                        return re;
                    }

                    Expression CreateValidateNameMinLengthExpression()
                    {
                        var minLengthMethod =
                            typeof(X03PropertyValidationTest02).GetMethod(nameof(ValidateNameMinLength));
                        var isOkProperty = typeof(ValidateResult).GetProperty(nameof(ValidateResult.IsOk));
                        Debug.Assert(minLengthMethod != null, nameof(minLengthMethod) + " != null");
                        Debug.Assert(isOkProperty != null, nameof(isOkProperty) + " != null");

                        var requiredMethodExp = Expression.Call(minLengthMethod, inputExp, minLengthPExp);
                        var assignExp = Expression.Assign(resultExp, requiredMethodExp);
                        var resultIsOkPropertyExp = Expression.Property(resultExp, isOkProperty);
                        var conditionExp = Expression.IsFalse(resultIsOkPropertyExp);
                        var ifThenExp =
                            Expression.IfThen(conditionExp,
                                Expression.Return(returnLabel, resultExp));
                        var re = Expression.Block(
                            new[] {resultExp},
                            assignExp,
                            ifThenExp);
                        /**
                        * final as:
                        * result = ValidateNameMinLength(input, minLength);
                        * if (!result.IsOk)
                        * {
                        *     return result;
                        * }
                        */
                        return re;
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }

        [Test]
        public void Run()
        {
            // see code in demo repo
        }

        public static ValidateResult Validate(CreateClaptrapInput input)
        {
            return _func.Invoke(input, 3);
        }

        public static ValidateResult ValidateNameRequired(CreateClaptrapInput input)
        {
            return string.IsNullOrEmpty(input.Name)
                ? ValidateResult.Error("missing Name")
                : ValidateResult.Ok();
        }

        public static ValidateResult ValidateNameMinLength(CreateClaptrapInput input, int minLength)
        {
            return input.Name.Length < minLength
                ? ValidateResult.Error($"Length of Name should be great than {minLength}")
                : ValidateResult.Ok();
        }

    }
}
```

Code Essentials：

1. Die ValidateCore-Methode wird in validateNameRequired- und ValidateNameMinLength-Methoden aufgeteilt, um die erforderliche bzw. MinLength-Methode von Name zu überprüfen.
2. Die Local-Funktion wird in der Init-Methode verwendet, um die Wirkung der Methode "zuerst verwenden, später definieren" zu erzielen.Leser können von oben nach unten lesen und die Logik des gesamten Ansatzes von oben lernen.
3. Die Logik von Init als Ganzes besteht darin, ValidateNameRequired und ValidateNameMinLength durch Ausdrücke in einem delegatähnlichen `Func-<CreateClaptrapInput, int, ValidateResult>`zusammenzusetzen.
4. Expression.Parameter wird verwendet, um den Parameterteil des Delegatausdrucks anzugeben.
5. Expression.Variable wird verwendet, um eine Variable anzugeben, die eine normale Variable ist.Ähnlich wie die`var a`.
6. Expression.Label wird verwendet, um eine bestimmte Position anzugeben.In diesem Beispiel wird es in erster Linie verwendet, um die Rückgabeanweisung zu positionieren.Entwickler, die mit der goto-Syntax vertraut sind, wissen, dass goto Beschriftungen verwenden muss, um zu markieren, wohin sie gehen möchten.In der Tat ist die Rückkehr eine besondere Art von Goto.Wenn Sie also in mehr als einem Anweisungsblock zurückkehren möchten, müssen Sie ihn auch markieren, bevor Sie zurückkehren können.
7. Expression.Block kann mehrere Ausdrücke in der Reihenfolge gruppieren.Es kann als das Schreiben von Code nacheinander verstanden werden.Hier kombinieren wir CreateDefaultResult, CreateValidateNameRequired Expression, CreateValidateNameMinLengthExpression und Label-Ausdrücke.Der Effekt ähnelt dem sequenziellen Zusammenfügen des Codes.
8. CreateValidateNameRequiredExpression und CreateValidateNameMinLengthExpression weisen sehr ähnliche Strukturen auf, da die resultierenden Ausdrücke, die Sie generieren möchten, sehr ähnlich sind.
9. Machen Sie sich keine allzu großen Sorgen über die Details in CreateValidateNameRequired Expression und CreateValidateNameMinLengthExpression.Sie können versuchen, mehr über diese Methode zu erfahren, nachdem Sie Expression.XXX Beispiel gelesen haben.
10. Mit dieser Änderung haben wir die Erweiterung implementiert.Angenommen, Sie müssen jetzt eine MaxLength-Validierung zu Name hinzufügen, der 16 nicht überschreitet.Fügen Sie einfach eine statische Methode von ValidateNameMaxLength hinzu, fügen Sie eine CreateValidateNameMaxLengthExpression-Methode hinzu, und fügen Sie sie Dem Block hinzu.Leser können versuchen, eine Welle zu tun, um diesen Effekt zu erreichen.

## Der dritte Schritt besteht darin, die Eigenschaften

Lassen Sie uns validateNameRequired und ValidateNameMinLength nachrüsten.Da beide Methoden jetzt CreateClaptrapInput als Argument erhalten, wird auch die interne Logik geschrieben, um Name zu validieren, was nicht sehr gut ist.

Wir passen beide Methoden so an, dass der Zeichenfolgenname übergeben wird, um den überprüften Eigenschaftsnamen darzustellen, und der Zeichenfolgenwert stellt den überprüften Eigenschaftswert dar.Auf diese Weise können wir diese beiden Validierungsmethoden für mehr Eigenschaften verwenden, die nicht auf Name beschränkt sind.

```cs
using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq.Expressions;
using FluentAssertions;
using NUnit.Framework;

// ReSharper disable InvalidXmlDocComment

namespace Newbe.ExpressionsTests
{
    /// <summary>
    /// Property Expression
    /// </summary>
    public class X03PropertyValidationTest03
    {
        private const int Count = 10_000;

        private static Func<CreateClaptrapInput, int, ValidateResult> _func;

        [SetUp]
        public void Init()
        {
            try
            {
                var finalExpression = CreateCore();
                _func = finalExpression.Compile();

                Expression<Func<CreateClaptrapInput, int, ValidateResult>> CreateCore()
                {
                    // exp for input
                    var inputExp = Expression.Parameter(typeof(CreateClaptrapInput), "input");
                    var nameProp = typeof(CreateClaptrapInput).GetProperty(nameof(CreateClaptrapInput.Name));
                    Debug.Assert(nameProp != null, nameof(nameProp) + " != null");
                    var namePropExp = Expression.Property(inputExp, nameProp);
                    var nameNameExp = Expression.Constant(nameProp.Name);
                    var minLengthPExp = Expression.Parameter(typeof(int), "minLength");

                    // exp for output
                    var resultExp = Expression.Variable(typeof(ValidateResult), "result");

                    // exp for return statement
                    var returnLabel = Expression.Label(typeof(ValidateResult));

                    // build whole block
                    var body = Expression.Block(
                        new[] {resultExp},
                        CreateDefaultResult(),
                        CreateValidateNameRequiredExpression(),
                        CreateValidateNameMinLengthExpression(),
                        Expression.Label(returnLabel, resultExp));

                    // build lambda from body
                    var final = Expression.Lambda<Func<CreateClaptrapInput, int, ValidateResult>>(
                        body,
                        inputExp,
                        minLengthPExp);
                    return final;

                    Expression CreateDefaultResult()
                    {
                        var okMethod = typeof(ValidateResult).GetMethod(nameof(ValidateResult.Ok));
                        Debug.Assert(okMethod != null, nameof(okMethod) + " != null");
                        var methodCallExpression = Expression.Call(okMethod);
                        var re = Expression.Assign(resultExp, methodCallExpression);
                        /**
                         * final as:
                         * result = ValidateResult.Ok()
                         */
                        return re;
                    }

                    Expression CreateValidateNameRequiredExpression()
                    {
                        var requireMethod = typeof(X03PropertyValidationTest03).GetMethod(nameof(ValidateStringRequired));
                        var isOkProperty = typeof(ValidateResult).GetProperty(nameof(ValidateResult.IsOk));
                        Debug.Assert(requireMethod != null, nameof(requireMethod) + " != null");
                        Debug.Assert(isOkProperty != null, nameof(isOkProperty) + " != null");

                        var requiredMethodExp = Expression.Call(requireMethod, nameNameExp, namePropExp);
                        var assignExp = Expression.Assign(resultExp, requiredMethodExp);
                        var resultIsOkPropertyExp = Expression.Property(resultExp, isOkProperty);
                        var conditionExp = Expression.IsFalse(resultIsOkPropertyExp);
                        var ifThenExp =
                            Expression.IfThen(conditionExp,
                                Expression.Return(returnLabel, resultExp));
                        var re = Expression.Block(
                            new[] {resultExp},
                            assignExp,
                            ifThenExp);
                        /**
                         * final as:
                         * result = ValidateNameRequired("Name", input.Name);
                         * if (!result.IsOk)
                         * {
                         *     return result;
                         * }
                         */
                        return re;
                    }

                    Expression CreateValidateNameMinLengthExpression()
                    {
                        var minLengthMethod =
                            typeof(X03PropertyValidationTest03).GetMethod(nameof(ValidateStringMinLength));
                        var isOkProperty = typeof(ValidateResult).GetProperty(nameof(ValidateResult.IsOk));
                        Debug.Assert(minLengthMethod != null, nameof(minLengthMethod) + " != null");
                        Debug.Assert(isOkProperty != null, nameof(isOkProperty) + " != null");

                        var requiredMethodExp = Expression.Call(minLengthMethod,
                            nameNameExp,
                            namePropExp,
                            minLengthPExp);
                        var assignExp = Expression.Assign(resultExp, requiredMethodExp);
                        var resultIsOkPropertyExp = Expression.Property(resultExp, isOkProperty);
                        var conditionExp = Expression.IsFalse(resultIsOkPropertyExp);
                        var ifThenExp =
                            Expression.IfThen(conditionExp,
                                Expression.Return(returnLabel, resultExp));
                        var re = Expression.Block(
                            new[] {resultExp},
                            assignExp,
                            ifThenExp);
                        /**
                        * final as:
                        * result = ValidateNameMinLength("Name", input.Name, minLength);
                        * if (!result.IsOk)
                        * {
                        *     return result;
                        * }
                        */
                        return re;
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }

        [Test]
        public void Run()
        {
            // see code in demo repo
        }

        public static ValidateResult Validate(CreateClaptrapInput input)
        {
            return _func.Invoke(input, 3);
        }

        public static ValidateResult ValidateStringRequired(string name, string value)
        {
            return string.IsNullOrEmpty(value)
                ? ValidateResult.Error($"missing {name}")
                : ValidateResult.Ok();
        }

        public static ValidateResult ValidateStringMinLength(string name, string value, int minLength)
        {
            return value.Length < minLength
                ? ValidateResult.Error($"Length of {name} should be great than {minLength}")
                : ValidateResult.Ok();
        }
    }
}
```

Code Essentials：

1. Wie bereits erwähnt, haben wir ValidateNameRequired geändert und validateStringRequired umbenannt. ValidateNameMinLength -> ValidateStringMinLength
2. CreateValidateNameErforderlicher Ausdruck und CreateValidateNameMinLengthExpression wurden geändert, da sich die Parameter der statischen Methode geändert haben.
3. Mit dieser Änderung können wir zwei statische Methoden für mehr Attributvalidierung verwenden.Leser können versuchen, eine NickName-Eigenschaft hinzuzufügen.und führen Sie die gleiche Validierung durch.

## Der vierte Schritt besteht darin, mehrere Eigenschaftenüberprüfungen zu unterstützen.

Als Nächstes überprüfen wir alle Zeichenfolgeneigenschaften von CreateClaptrapInput.

```cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using FluentAssertions;
using NUnit.Framework;

// ReSharper disable InvalidXmlDocComment

namespace Newbe.ExpressionsTests
{
    /// <summary>
    /// Reflect Properties
    /// </summary>
    public class X03PropertyValidationTest04
    {
        private const int Count = 10_000;

        private static Func<CreateClaptrapInput, int, ValidateResult> _func;

        [SetUp]
        public void Init()
        {
            try
            {
                var finalExpression = CreateCore();
                _func = finalExpression.Compile();

                Expression<Func<CreateClaptrapInput, int, ValidateResult>> CreateCore()
                {
                    // exp for input
                    var inputExp = Expression.Parameter(typeof(CreateClaptrapInput), "input");
                    var minLengthPExp = Expression.Parameter(typeof(int), "minLength");

                    // exp for output
                    var resultExp = Expression.Variable(typeof(ValidateResult), "result");

                    // exp for return statement
                    var returnLabel = Expression.Label(typeof(ValidateResult));

                    var innerExps = new List<Expression> {CreateDefaultResult()};

                    var stringProps = typeof(CreateClaptrapInput)
                        .GetProperties()
                        .Where(x => x.PropertyType == typeof(string));

                    foreach (var propertyInfo in stringProps)
                    {
                        innerExps.Add(CreateValidateStringRequiredExpression(propertyInfo));
                        innerExps.Add(CreateValidateStringMinLengthExpression(propertyInfo));
                    }

                    innerExps.Add(Expression.Label(returnLabel, resultExp));

                    // build whole block
                    var body = Expression.Block(
                        new[] {resultExp},
                        innerExps);

                    // build lambda from body
                    var final = Expression.Lambda<Func<CreateClaptrapInput, int, ValidateResult>>(
                        body,
                        inputExp,
                        minLengthPExp);
                    return final;

                    Expression CreateDefaultResult()
                    {
                        var okMethod = typeof(ValidateResult).GetMethod(nameof(ValidateResult.Ok));
                        Debug.Assert(okMethod != null, nameof(okMethod) + " != null");
                        var methodCallExpression = Expression.Call(okMethod);
                        var re = Expression.Assign(resultExp, methodCallExpression);
                        /**
                         * final as:
                         * result = ValidateResult.Ok()
                         */
                        return re;
                    }

                    Expression CreateValidateStringRequiredExpression(PropertyInfo propertyInfo)
                    {
                        var requireMethod = typeof(X03PropertyValidationTest04).GetMethod(nameof(ValidateStringRequired));
                        var isOkProperty = typeof(ValidateResult).GetProperty(nameof(ValidateResult.IsOk));
                        Debug.Assert(requireMethod != null, nameof(requireMethod) + " != null");
                        Debug.Assert(isOkProperty != null, nameof(isOkProperty) + " != null");

                        var namePropExp = Expression.Property(inputExp, propertyInfo);
                        var nameNameExp = Expression.Constant(propertyInfo.Name);

                        var requiredMethodExp = Expression.Call(requireMethod, nameNameExp, namePropExp);
                        var assignExp = Expression.Assign(resultExp, requiredMethodExp);
                        var resultIsOkPropertyExp = Expression.Property(resultExp, isOkProperty);
                        var conditionExp = Expression.IsFalse(resultIsOkPropertyExp);
                        var ifThenExp =
                            Expression.IfThen(conditionExp,
                                Expression.Return(returnLabel, resultExp));
                        var re = Expression.Block(
                            new[] {resultExp},
                            assignExp,
                            ifThenExp);
                        return re;
                    }

                    Expression CreateValidateStringMinLengthExpression(PropertyInfo propertyInfo)
                    {
                        var minLengthMethod =
                            typeof(X03PropertyValidationTest04).GetMethod(nameof(ValidateStringMinLength));
                        var isOkProperty = typeof(ValidateResult).GetProperty(nameof(ValidateResult.IsOk));
                        Debug.Assert(minLengthMethod != null, nameof(minLengthMethod) + " != null");
                        Debug.Assert(isOkProperty != null, nameof(isOkProperty) + " != null");

                        var namePropExp = Expression.Property(inputExp, propertyInfo);
                        var nameNameExp = Expression.Constant(propertyInfo.Name);

                        var requiredMethodExp = Expression.Call(minLengthMethod,
                            nameNameExp,
                            namePropExp,
                            minLengthPExp);
                        var assignExp = Expression.Assign(resultExp, requiredMethodExp);
                        var resultIsOkPropertyExp = Expression.Property(resultExp, isOkProperty);
                        var conditionExp = Expression.IsFalse(resultIsOkPropertyExp);
                        var ifThenExp =
                            Expression.IfThen(conditionExp,
                                Expression.Return(returnLabel, resultExp));
                        var re = Expression.Block(
                            new[] {resultExp},
                            assignExp,
                            ifThenExp);
                        return re;
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }

        [Test]
        public void Run()
        {
            // see code in demo repo
        }

        public static ValidateResult Validate(CreateClaptrapInput input)
        {
            return _func.Invoke(input, 3);
        }

        public static ValidateResult ValidateStringRequired(string name, string value)
        {
            return string.IsNullOrEmpty(value)
                ? ValidateResult.Error($"missing {name}")
                : ValidateResult.Ok();
        }

        public static ValidateResult ValidateStringMinLength(string name, string value, int minLength)
        {
            return value.Length < minLength
                ? ValidateResult.Error($"Length of {name} should be great than {minLength}")
                : ValidateResult.Ok();
        }


        public class CreateClaptrapInput
        {
            [Required] [MinLength(3)] public string Name { get; set; }
            [Required] [MinLength(3)] public string NickName { get; set; }
        }
    }
}
```

Code Essentials：

1. Eine Eigenschaft, NickName, wurde CreateClaptrapInput hinzugefügt, und der Testfall überprüft die Eigenschaft.
2. Durch`List<Expression>`haben wir dynamisch generierte Ausdrücke hinzugefügt, um sie zu blockieren.Daher können wir Validierungsausdrücke für Name und NickName generieren.

## Der fünfte Schritt besteht darin, den Inhalt durch die Attributentscheidung zu überprüfen.

Obwohl wir die Validierung einer Reihe von Eigenschaften in erster Linie unterstützt haben, sind die Parameter für die Validierung und Validierung immer noch tot geschrieben (z. B. die Länge：MinLength).

In diesem Abschnitt verwenden wir Attribut, um die Details der Validierung zu bestimmen.Wenn Sie z. B. als Erforderlich markiert sind, ist dies eine Eigenschaft für die erforderliche Validierung.

```cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using FluentAssertions;
using NUnit.Framework;

// ReSharper disable InvalidXmlDocComment

namespace Newbe.ExpressionsTests
{
    /// <summary>
    /// Using Attribute
    /// </summary>
    public class X03PropertyValidationTest05
    {
        private const int Count = 10_000;

        private static Func<CreateClaptrapInput, ValidateResult> _func;

        [SetUp]
        public void Init()
        {
            try
            {
                var finalExpression = CreateCore();
                _func = finalExpression.Compile();

                Expression<Func<CreateClaptrapInput, ValidateResult>> CreateCore()
                {
                    // exp for input
                    var inputExp = Expression.Parameter(typeof(CreateClaptrapInput), "input");

                    // exp for output
                    var resultExp = Expression.Variable(typeof(ValidateResult), "result");

                    // exp for return statement
                    var returnLabel = Expression.Label(typeof(ValidateResult));

                    var innerExps = new List<Expression> {CreateDefaultResult()};

                    var stringProps = typeof(CreateClaptrapInput)
                        .GetProperties()
                        .Where(x => x.PropertyType == typeof(string));

                    foreach (var propertyInfo in stringProps)
                    {
                        if (propertyInfo.GetCustomAttribute<RequiredAttribute>() != null)
                        {
                            innerExps.Add(CreateValidateStringRequiredExpression(propertyInfo));
                        }

                        var minlengthAttribute = propertyInfo.GetCustomAttribute<MinLengthAttribute>();
                        if (minlengthAttribute != null)
                        {
                            innerExps.Add(
                                CreateValidateStringMinLengthExpression(propertyInfo, minlengthAttribute.Length));
                        }
                    }

                    innerExps.Add(Expression.Label(returnLabel, resultExp));

                    // build whole block
                    var body = Expression.Block(
                        new[] {resultExp},
                        innerExps);

                    // build lambda from body
                    var final = Expression.Lambda<Func<CreateClaptrapInput, ValidateResult>>(
                        body,
                        inputExp);
                    return final;

                    Expression CreateDefaultResult()
                    {
                        var okMethod = typeof(ValidateResult).GetMethod(nameof(ValidateResult.Ok));
                        Debug.Assert(okMethod != null, nameof(okMethod) + " != null");
                        var methodCallExpression = Expression.Call(okMethod);
                        var re = Expression.Assign(resultExp, methodCallExpression);
                        /**
                         * final as:
                         * result = ValidateResult.Ok()
                         */
                        return re;
                    }

                    Expression CreateValidateStringRequiredExpression(PropertyInfo propertyInfo)
                    {
                        var requireMethod = typeof(X03PropertyValidationTest05).GetMethod(nameof(ValidateStringRequired));
                        var isOkProperty = typeof(ValidateResult).GetProperty(nameof(ValidateResult.IsOk));
                        Debug.Assert(requireMethod != null, nameof(requireMethod) + " != null");
                        Debug.Assert(isOkProperty != null, nameof(isOkProperty) + " != null");

                        var namePropExp = Expression.Property(inputExp, propertyInfo);
                        var nameNameExp = Expression.Constant(propertyInfo.Name);

                        var requiredMethodExp = Expression.Call(requireMethod, nameNameExp, namePropExp);
                        var assignExp = Expression.Assign(resultExp, requiredMethodExp);
                        var resultIsOkPropertyExp = Expression.Property(resultExp, isOkProperty);
                        var conditionExp = Expression.IsFalse(resultIsOkPropertyExp);
                        var ifThenExp =
                            Expression.IfThen(conditionExp,
                                Expression.Return(returnLabel, resultExp));
                        var re = Expression.Block(
                            new[] {resultExp},
                            assignExp,
                            ifThenExp);
                        return re;
                    }

                    Expression CreateValidateStringMinLengthExpression(PropertyInfo propertyInfo,
                        int minlengthAttributeLength)
                    {
                        var minLengthMethod =
                            typeof(X03PropertyValidationTest05).GetMethod(nameof(ValidateStringMinLength));
                        var isOkProperty = typeof(ValidateResult).GetProperty(nameof(ValidateResult.IsOk));
                        Debug.Assert(minLengthMethod != null, nameof(minLengthMethod) + " != null");
                        Debug.Assert(isOkProperty != null, nameof(isOkProperty) + " != null");

                        var namePropExp = Expression.Property(inputExp, propertyInfo);
                        var nameNameExp = Expression.Constant(propertyInfo.Name);

                        var requiredMethodExp = Expression.Call(minLengthMethod,
                            nameNameExp,
                            namePropExp,
                            Expression.Constant(minlengthAttributeLength));
                        var assignExp = Expression.Assign(resultExp, requiredMethodExp);
                        var resultIsOkPropertyExp = Expression.Property(resultExp, isOkProperty);
                        var conditionExp = Expression.IsFalse(resultIsOkPropertyExp);
                        var ifThenExp =
                            Expression.IfThen(conditionExp,
                                Expression.Return(returnLabel, resultExp));
                        var re = Expression.Block(
                            new[] {resultExp},
                            assignExp,
                            ifThenExp);
                        return re;
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }

        [Test]
        public void Run()
        {
            // see code in demo repo
        }

        public class CreateClaptrapInput
        {
            [Required] [MinLength(3)] public string Name { get; set; }
            [Required] [MinLength(3)] public string NickName { get; set; }
        }
    }
}
```

Code Essentials：

1. Beim Erstellen einer`Liste<Expression>`wird ein bestimmter Ausdruck durch Die Angabe eines bestimmten Ausdrucks für das Attribut in der Eigenschaft erstellt.

## Ersetzen Sie im sechsten Schritt die statische Methode durch einen Ausdruck

Das Innere der beiden statischen Methoden ValidateStringRequired und ValidateStringMinLength enthält eigentlich nur einen trilateralen Urteilsausdruck, und in C' können Sie der Lambda-Methode einen Ausdruck zuweisen.

Daher können wir validateStringRequired und ValidateStringMinLength direkt in Ausdrücke ändern, sodass wir keine Reflektion benötigen, um statische Methoden zum Erstellen von Ausdrücken abzubekommen.

```cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using FluentAssertions;
using NUnit.Framework;

// ReSharper disable InvalidXmlDocComment

namespace Newbe.ExpressionsTests
{
    /// <summary>
    /// Static Method to Expression
    /// </summary>
    public class X03PropertyValidationTest06
    {
        private const int Count = 10_000;

        private static Func<CreateClaptrapInput, ValidateResult> _func;

        [SetUp]
        public void Init()
        {
            try
            {
                var finalExpression = CreateCore();
                _func = finalExpression.Compile();

                Expression<Func<CreateClaptrapInput, ValidateResult>> CreateCore()
                {
                    // exp for input
                    var inputExp = Expression.Parameter(typeof(CreateClaptrapInput), "input");

                    // exp for output
                    var resultExp = Expression.Variable(typeof(ValidateResult), "result");

                    // exp for return statement
                    var returnLabel = Expression.Label(typeof(ValidateResult));

                    var innerExps = new List<Expression> {CreateDefaultResult()};

                    var stringProps = typeof(CreateClaptrapInput)
                        .GetProperties()
                        .Where(x => x.PropertyType == typeof(string));

                    foreach (var propertyInfo in stringProps)
                    {
                        if (propertyInfo.GetCustomAttribute<RequiredAttribute>() != null)
                        {
                            innerExps.Add(CreateValidateStringRequiredExpression(propertyInfo));
                        }

                        var minlengthAttribute = propertyInfo.GetCustomAttribute<MinLengthAttribute>();
                        if (minlengthAttribute != null)
                        {
                            innerExps.Add(
                                CreateValidateStringMinLengthExpression(propertyInfo, minlengthAttribute.Length));
                        }
                    }

                    innerExps.Add(Expression.Label(returnLabel, resultExp));

                    // build whole block
                    var body = Expression.Block(
                        new[] {resultExp},
                        innerExps);

                    // build lambda from body
                    var final = Expression.Lambda<Func<CreateClaptrapInput, ValidateResult>>(
                        body,
                        inputExp);
                    return final;

                    Expression CreateDefaultResult()
                    {
                        var okMethod = typeof(ValidateResult).GetMethod(nameof(ValidateResult.Ok));
                        Debug.Assert(okMethod != null, nameof(okMethod) + " != null");
                        var methodCallExpression = Expression.Call(okMethod);
                        var re = Expression.Assign(resultExp, methodCallExpression);
                        /**
                         * final as:
                         * result = ValidateResult.Ok()
                         */
                        return re;
                    }

                    Expression CreateValidateStringRequiredExpression(PropertyInfo propertyInfo)
                    {
                        var isOkProperty = typeof(ValidateResult).GetProperty(nameof(ValidateResult.IsOk));
                        Debug.Assert(isOkProperty != null, nameof(isOkProperty) + " != null");

                        var namePropExp = Expression.Property(inputExp, propertyInfo);
                        var nameNameExp = Expression.Constant(propertyInfo.Name);

                        var requiredMethodExp = Expression.Invoke(ValidateStringRequiredExp, nameNameExp, namePropExp);
                        var assignExp = Expression.Assign(resultExp, requiredMethodExp);
                        var resultIsOkPropertyExp = Expression.Property(resultExp, isOkProperty);
                        var conditionExp = Expression.IsFalse(resultIsOkPropertyExp);
                        var ifThenExp =
                            Expression.IfThen(conditionExp,
                                Expression.Return(returnLabel, resultExp));
                        var re = Expression.Block(
                            new[] {resultExp},
                            assignExp,
                            ifThenExp);
                        return re;
                    }

                    Expression CreateValidateStringMinLengthExpression(PropertyInfo propertyInfo,
                        int minlengthAttributeLength)
                    {
                        var isOkProperty = typeof(ValidateResult).GetProperty(nameof(ValidateResult.IsOk));
                        Debug.Assert(isOkProperty != null, nameof(isOkProperty) + " != null");

                        var namePropExp = Expression.Property(inputExp, propertyInfo);
                        var nameNameExp = Expression.Constant(propertyInfo.Name);

                        var requiredMethodExp = Expression.Invoke(ValidateStringMinLengthExp,
                            nameNameExp,
                            namePropExp,
                            Expression.Constant(minlengthAttributeLength));
                        var assignExp = Expression.Assign(resultExp, requiredMethodExp);
                        var resultIsOkPropertyExp = Expression.Property(resultExp, isOkProperty);
                        var conditionExp = Expression.IsFalse(resultIsOkPropertyExp);
                        var ifThenExp =
                            Expression.IfThen(conditionExp,
                                Expression.Return(returnLabel, resultExp));
                        var re = Expression.Block(
                            new[] {resultExp},
                            assignExp,
                            ifThenExp);
                        return re;
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }

        [Test]
        public void Run()
        {
            // see code in demo repo
        }

        private static readonly Expression<Func<string, string, ValidateResult>> ValidateStringRequiredExp =
            (name, value) =>
                string.IsNullOrEmpty(value)
                    ? ValidateResult.Error($"missing {name}")
                    : ValidateResult.Ok();

        private static readonly Expression<Func<string, string, int, ValidateResult>> ValidateStringMinLengthExp =
            (name, value, minLength) =>
                value.Length < minLength
                    ? ValidateResult.Error($"Length of {name} should be great than {minLength}")
                    : ValidateResult.Ok();

    }
}
```

Code Essentials：

1. Ersetzen Sie die statische Methode durch einen Ausdruck.Der Speicherort von createXXXExpression wurde daher geändert, und der Code ist kürzer.

## Schritt sieben, Curry

Coli-Chemikalien, auch bekannt als funktionelle Wissenschaft und Physik, ist eine Methode in der funktionellen Programmierung.Einfach kann als：ausgedrückt werden, indem ein oder mehrere Argumente einer Multi-Argument-Funktion fixiert werden, was zu einer Funktion mit weniger Argumenten führt.Einige Terminologie kann auch als eine Möglichkeit ausgedrückt werden, eine Funktion höherer Ordnung (die Reihenfolge einer Funktion ist eigentlich die Anzahl der Argumente) in eine Funktion niedriger Ordnung zu konvertieren.

Beispielsweise gibt es jetzt eine add-Funktion (int, int), die die Funktion des Hinzufügens von zwei Zahlen implementiert.Wenn wir das erste Argument im Satz auf 5 anheften, erhalten wir eine add (5,int) Funktion, die die Funktion plus eine Zahl plus 5 implementiert.

Worum geht es?

Die absteigende Funktion kann die Funktionen konsistent machen, und nachdem die konsistenten Funktionen erhalten wurden, kann eine gewisse Codevereinheitlichung zur Optimierung vorgenommen werden.Die beiden oben verwendeten Ausdrücke：

1. `Ausdruck<Func<string, string, ValidateResult>> ValidateStringRequiredExp`
2. `Ausdruck<Func<string, string, int, ValidateResult>> ValidateStringMinLengthExp`

Der Unterschied zwischen dem zweiten Ausdruck und dem ersten Ausdruck in den beiden Ausdrücken ist nur auf dem dritten Argument.Wenn wir den dritten int-Parameter mit Corredic anheften, können wir die Signaturen der beiden Ausdrücke genau gleich machen.Dies ist sehr ähnlich wie die Abstraktion in objektorientierter Art.

```cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using FluentAssertions;
using NUnit.Framework;

// ReSharper disable InvalidXmlDocComment

namespace Newbe.ExpressionsTests
{
    /// <summary>
    /// Currying
    /// </summary>
    public class X03PropertyValidationTest07
    {
        private const int Count = 10_000;

        private static Func<CreateClaptrapInput, ValidateResult> _func;

        [SetUp]
        public void Init()
        {
            try
            {
                var finalExpression = CreateCore();
                _func = finalExpression.Compile();

                Expression<Func<CreateClaptrapInput, ValidateResult>> CreateCore()
                {
                    // exp for input
                    var inputExp = Expression.Parameter(typeof(CreateClaptrapInput), "input");

                    // exp for output
                    var resultExp = Expression.Variable(typeof(ValidateResult), "result");

                    // exp for return statement
                    var returnLabel = Expression.Label(typeof(ValidateResult));

                    var innerExps = new List<Expression> {CreateDefaultResult()};

                    var stringProps = typeof(CreateClaptrapInput)
                        .GetProperties()
                        .Where(x => x.PropertyType == typeof(string));

                    foreach (var propertyInfo in stringProps)
                    {
                        if (propertyInfo.GetCustomAttribute<RequiredAttribute>() != null)
                        {
                            innerExps.Add(CreateValidateStringRequiredExpression(propertyInfo));
                        }

                        var minlengthAttribute = propertyInfo.GetCustomAttribute<MinLengthAttribute>();
                        if (minlengthAttribute != null)
                        {
                            innerExps.Add(
                                CreateValidateStringMinLengthExpression(propertyInfo, minlengthAttribute.Length));
                        }
                    }

                    innerExps.Add(Expression.Label(returnLabel, resultExp));

                    // build whole block
                    var body = Expression.Block(
                        new[] {resultExp},
                        innerExps);

                    // build lambda from body
                    var final = Expression.Lambda<Func<CreateClaptrapInput, ValidateResult>>(
                        body,
                        inputExp);
                    return final;

                    Expression CreateDefaultResult()
                    {
                        var okMethod = typeof(ValidateResult).GetMethod(nameof(ValidateResult.Ok));
                        Debug.Assert(okMethod != null, nameof(okMethod) + " != null");
                        var methodCallExpression = Expression.Call(okMethod);
                        var re = Expression.Assign(resultExp, methodCallExpression);
                        /**
                         * final as:
                         * result = ValidateResult.Ok()
                         */
                        return re;
                    }

                    Expression CreateValidateStringRequiredExpression(PropertyInfo propertyInfo)
                    {
                        var isOkProperty = typeof(ValidateResult).GetProperty(nameof(ValidateResult.IsOk));
                        Debug.Assert(isOkProperty != null, nameof(isOkProperty) + " != null");

                        var namePropExp = Expression.Property(inputExp, propertyInfo);
                        var nameNameExp = Expression.Constant(propertyInfo.Name);

                        var requiredMethodExp =
                            Expression.Invoke(CreateValidateStringRequiredExp(),
                                nameNameExp,
                                namePropExp);
                        var assignExp = Expression.Assign(resultExp, requiredMethodExp);
                        var resultIsOkPropertyExp = Expression.Property(resultExp, isOkProperty);
                        var conditionExp = Expression.IsFalse(resultIsOkPropertyExp);
                        var ifThenExp =
                            Expression.IfThen(conditionExp,
                                Expression.Return(returnLabel, resultExp));
                        var re = Expression.Block(
                            new[] {resultExp},
                            assignExp,
                            ifThenExp);
                        return re;
                    }

                    Expression CreateValidateStringMinLengthExpression(PropertyInfo propertyInfo,
                        int minlengthAttributeLength)
                    {
                        var isOkProperty = typeof(ValidateResult).GetProperty(nameof(ValidateResult.IsOk));
                        Debug.Assert(isOkProperty != null, nameof(isOkProperty) + " != null");

                        var namePropExp = Expression.Property(inputExp, propertyInfo);
                        var nameNameExp = Expression.Constant(propertyInfo.Name);

                        var requiredMethodExp = Expression.Invoke(
                            CreateValidateStringMinLengthExp(minlengthAttributeLength),
                            nameNameExp,
                            namePropExp);
                        var assignExp = Expression.Assign(resultExp, requiredMethodExp);
                        var resultIsOkPropertyExp = Expression.Property(resultExp, isOkProperty);
                        var conditionExp = Expression.IsFalse(resultIsOkPropertyExp);
                        var ifThenExp =
                            Expression.IfThen(conditionExp,
                                Expression.Return(returnLabel, resultExp));
                        var re = Expression.Block(
                            new[] {resultExp},
                            assignExp,
                            ifThenExp);
                        return re;
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }

        [Test]
        public void Run()
        {
            // see code in demo repo
        }

        private static Expression<Func<string, string, ValidateResult>> CreateValidateStringRequiredExp()
        {
            return (name, value) =>
                string.IsNullOrEmpty(value)
                    ? ValidateResult.Error($"missing {name}")
                    : ValidateResult.Ok();
        }

        private static Expression<Func<string, string, ValidateResult>> CreateValidateStringMinLengthExp(int minLength)
        {
            return (name, value) =>
                value.Length < minLength
                    ? ValidateResult.Error($"Length of {name} should be great than {minLength}")
                    : ValidateResult.Ok();
        }
    }
}
```

Code Essentials：

1. CreateValidateStringMinLengthExp statische Methode, übergeben Sie in einem Argument, um einen Ausdruck zu erstellen, der mit dem von CreateValidateStringRequiredExp zurückgegebenen Wert identisch ist.Im Vergleich zum ValidateStringMinLengthExp im letzten Abschnitt wird der Vorgang zum Fixieren des int-Parameters zum Abrufen eines neuen Ausdrucks implementiert.Dies ist die Verkörperung eines Korredic.
2. Um die statischen Methoden zu vereinheitlichen, haben wir validateStringRequiredExp im letzten Abschnitt geändert, um statische Methoden zu erstellen, nur um konsistent zu sein (aber tatsächlich ein wenig Overhead hinzufügen, da kein unveränderter Ausdruck wiederholt erstellt werden muss).
3. Passen Sie den Code für die `Assembly<Expression>` Listencode entsprechend an.

## Schritt 8, führen Sie den doppelten Code zusammen

In diesem Abschnitt kombinieren wir doppelten Code aus CreateValidateStrationRequired Expression und CreateValidateStringMinLengthExpression.

Nur RequiredMethodExp wird anders erstellt.Daher können Sie den gemeinsamen Teil herausziehen, indem Sie diesen Parameter einfach von außerhalb der Methode übergeben.

```cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using FluentAssertions;
using NUnit.Framework;

// ReSharper disable InvalidXmlDocComment

namespace Newbe.ExpressionsTests
{
    /// <summary>
    /// Refactor to CreateValidateExpression
    /// </summary>
    public class X03PropertyValidationTest08
    {
        private const int Count = 10_000;

        private static Func<CreateClaptrapInput, ValidateResult> _func;

        [SetUp]
        public void Init()
        {
            try
            {
                var finalExpression = CreateCore();
                _func = finalExpression.Compile();

                Expression<Func<CreateClaptrapInput, ValidateResult>> CreateCore()
                {
                    // exp for input
                    var inputExp = Expression.Parameter(typeof(CreateClaptrapInput), "input");

                    // exp for output
                    var resultExp = Expression.Variable(typeof(ValidateResult), "result");

                    // exp for return statement
                    var returnLabel = Expression.Label(typeof(ValidateResult));

                    var innerExps = new List<Expression> {CreateDefaultResult()};

                    var stringProps = typeof(CreateClaptrapInput)
                        .GetProperties()
                        .Where(x => x.PropertyType == typeof(string));

                    foreach (var propertyInfo in stringProps)
                    {
                        if (propertyInfo.GetCustomAttribute<RequiredAttribute>() != null)
                        {
                            innerExps.Add(CreateValidateStringRequiredExpression(propertyInfo));
                        }

                        var minlengthAttribute = propertyInfo.GetCustomAttribute<MinLengthAttribute>();
                        if (minlengthAttribute != null)
                        {
                            innerExps.Add(
                                CreateValidateStringMinLengthExpression(propertyInfo, minlengthAttribute.Length));
                        }
                    }

                    innerExps.Add(Expression.Label(returnLabel, resultExp));

                    // build whole block
                    var body = Expression.Block(
                        new[] {resultExp},
                        innerExps);

                    // build lambda from body
                    var final = Expression.Lambda<Func<CreateClaptrapInput, ValidateResult>>(
                        body,
                        inputExp);
                    return final;

                    Expression CreateDefaultResult()
                    {
                        var okMethod = typeof(ValidateResult).GetMethod(nameof(ValidateResult.Ok));
                        Debug.Assert(okMethod != null, nameof(okMethod) + " != null");
                        var methodCallExpression = Expression.Call(okMethod);
                        var re = Expression.Assign(resultExp, methodCallExpression);
                        /**
                         * final as:
                         * result = ValidateResult.Ok()
                         */
                        return re;
                    }

                    Expression CreateValidateStringRequiredExpression(PropertyInfo propertyInfo)
                        => CreateValidateExpression(propertyInfo,
                            CreateValidateStringRequiredExp());

                    Expression CreateValidateStringMinLengthExpression(PropertyInfo propertyInfo,
                        int minlengthAttributeLength)
                        => CreateValidateExpression(propertyInfo,
                            CreateValidateStringMinLengthExp(minlengthAttributeLength));

                    Expression CreateValidateExpression(PropertyInfo propertyInfo,
                        Expression<Func<string, string, ValidateResult>> validateFuncExpression)
                    {
                        var isOkProperty = typeof(ValidateResult).GetProperty(nameof(ValidateResult.IsOk));
                        Debug.Assert(isOkProperty != null, nameof(isOkProperty) + " != null");

                        var namePropExp = Expression.Property(inputExp, propertyInfo);
                        var nameNameExp = Expression.Constant(propertyInfo.Name);

                        var requiredMethodExp = Expression.Invoke(
                            validateFuncExpression,
                            nameNameExp,
                            namePropExp);
                        var assignExp = Expression.Assign(resultExp, requiredMethodExp);
                        var resultIsOkPropertyExp = Expression.Property(resultExp, isOkProperty);
                        var conditionExp = Expression.IsFalse(resultIsOkPropertyExp);
                        var ifThenExp =
                            Expression.IfThen(conditionExp,
                                Expression.Return(returnLabel, resultExp));
                        var re = Expression.Block(
                            new[] {resultExp},
                            assignExp,
                            ifThenExp);
                        return re;
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }

        [Test]
        public void Run()
        {
            // see code in demo repo
        }
    }
}
```

Code Essentials：

1. CreateValidate Expression ist eine gängige Möglichkeit, sich herausziehen zu lassen.
2. Ohne den vorherigen Schritt wäre der zweite Parameter von CreateValidate Expression, validateFuncExpression, schwer zu bestimmen.
3. CreateValidateStringRequired Expression und CreateValidateStringMinLengthExpression werden intern als CreateValidate Expression bezeichnet, aber mehrere Parameter korrigiert.Dies kann auch als Corredic betrachtet werden, da der Rückgabewert ist, dass der Ausdruck tatsächlich als eine Funktion der Form betrachtet werden kann, natürlich verstanden als Überlastung ist kein Problem, müssen nicht zu verheddert sein.

## Schritt 9 zur Unterstützung weiterer Modelle

Bisher verfügen wir über einen Validator, der die Überprüfung mehrerer Zeichenfolgenfelder in CreateClaptrapInput unterstützt.Und selbst wenn Sie mehr Typen erweitern möchten, ist es nicht zu schwer, fügen Sie einfach einen Ausdruck hinzu.

In diesem Abschnitt werden CreateClaptrapInput in einen abstrakteren Typ abstrahiert, schließlich ist kein Modellvalidierer für die Validierung nur einer Klasse vorgesehen.

```cs
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using FluentAssertions;
using NUnit.Framework;

// ReSharper disable InvalidXmlDocComment

namespace Newbe.ExpressionsTests
{
    /// <summary>
    /// Multiple Type
    /// </summary>
    public class X03PropertyValidationTest09
    {
        private const int Count = 10_000;

        private static readonly Dictionary<Type, Func<object, ValidateResult>> ValidateFunc =
            new Dictionary<Type, Func<object, ValidateResult>>();

        [SetUp]
        public void Init()
        {
            try
            {
                var finalExpression = CreateCore(typeof(CreateClaptrapInput));
                ValidateFunc[typeof(CreateClaptrapInput)] = finalExpression.Compile();

                Expression<Func<object, ValidateResult>> CreateCore(Type type)
                {
                    // exp for input
                    var inputExp = Expression.Parameter(typeof(object), "input");

                    // exp for output
                    var resultExp = Expression.Variable(typeof(ValidateResult), "result");

                    // exp for return statement
                    var returnLabel = Expression.Label(typeof(ValidateResult));

                    var innerExps = new List<Expression> {CreateDefaultResult()};

                    var stringProps = type
                        .GetProperties()
                        .Where(x => x.PropertyType == typeof(string));

                    foreach (var propertyInfo in stringProps)
                    {
                        if (propertyInfo.GetCustomAttribute<RequiredAttribute>() != null)
                        {
                            innerExps.Add(CreateValidateStringRequiredExpression(propertyInfo));
                        }

                        var minlengthAttribute = propertyInfo.GetCustomAttribute<MinLengthAttribute>();
                        if (minlengthAttribute != null)
                        {
                            innerExps.Add(
                                CreateValidateStringMinLengthExpression(propertyInfo, minlengthAttribute.Length));
                        }
                    }

                    innerExps.Add(Expression.Label(returnLabel, resultExp));

                    // build whole block
                    var body = Expression.Block(
                        new[] {resultExp},
                        innerExps);

                    // build lambda from body
                    var final = Expression.Lambda<Func<object, ValidateResult>>(
                        body,
                        inputExp);
                    return final;

                    Expression CreateDefaultResult()
                    {
                        var okMethod = typeof(ValidateResult).GetMethod(nameof(ValidateResult.Ok));
                        Debug.Assert(okMethod != null, nameof(okMethod) + " != null");
                        var methodCallExpression = Expression.Call(okMethod);
                        var re = Expression.Assign(resultExp, methodCallExpression);
                        /**
                         * final as:
                         * result = ValidateResult.Ok()
                         */
                        return re;
                    }

                    Expression CreateValidateStringRequiredExpression(PropertyInfo propertyInfo)
                        => CreateValidateExpression(propertyInfo,
                            CreateValidateStringRequiredExp());

                    Expression CreateValidateStringMinLengthExpression(PropertyInfo propertyInfo,
                        int minlengthAttributeLength)
                        => CreateValidateExpression(propertyInfo,
                            CreateValidateStringMinLengthExp(minlengthAttributeLength));

                    Expression CreateValidateExpression(PropertyInfo propertyInfo,
                        Expression<Func<string, string, ValidateResult>> validateFuncExpression)
                    {
                        var isOkProperty = typeof(ValidateResult).GetProperty(nameof(ValidateResult.IsOk));
                        Debug.Assert(isOkProperty != null, nameof(isOkProperty) + " != null");

                        var convertedExp = Expression.Convert(inputExp, type);
                        var namePropExp = Expression.Property(convertedExp, propertyInfo);
                        var nameNameExp = Expression.Constant(propertyInfo.Name);

                        var requiredMethodExp = Expression.Invoke(
                            validateFuncExpression,
                            nameNameExp,
                            namePropExp);
                        var assignExp = Expression.Assign(resultExp, requiredMethodExp);
                        var resultIsOkPropertyExp = Expression.Property(resultExp, isOkProperty);
                        var conditionExp = Expression.IsFalse(resultIsOkPropertyExp);
                        var ifThenExp =
                            Expression.IfThen(conditionExp,
                                Expression.Return(returnLabel, resultExp));
                        var re = Expression.Block(
                            new[] {resultExp},
                            assignExp,
                            ifThenExp);
                        return re;
                    }
                }
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }

        [Test]
        public void Run()
        {
            // see code in demo repo
        }

        public static ValidateResult Validate(CreateClaptrapInput input)
        {
            return ValidateFunc[typeof(CreateClaptrapInput)].Invoke(input);
        }

    }
}
```

Code Essentials：

1. Ersetzen Sie `Func-<CreateClaptrapInput, ValidateResult>` durch `Func-<object, ValidateResult>`, und ersetzen Sie den toten Typ (CreateClaptrapInput) durch den Typ.
2. Speichern Sie den Validator des entsprechenden Typs in ValidatedFunc, nachdem er erstellt wurde.Dies erfordert nicht jedes Mal den Wiederaufbau des gesamten Func.

## Schritt 10, fügen Sie einige Details hinzu

Schließlich befinden wir uns in der angenehmen "Hinzufügen von einigen Details" phase：abstrakte Schnittstellen und Implementierungen an Geschäftsmerkmale anzupassen.Also haben wir die endgültige Version dieses Beispiels bekommen.

```cs
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq;
using System.Linq.Expressions;
using System.Reflection;
using Autofac;
using FluentAssertions;
using NUnit.Framework;
using Module = Autofac.Module;

// ReSharper disable InvalidXmlDocComment

namespace Newbe.ExpressionsTests
{
    /// <summary>
    /// Final
    /// </summary>
    public class X03PropertyValidationTest10
    {
        private const int Count = 10_000;

        private IValidatorFactory _factory = null!;

        [SetUp]
        public void Init()
        {
            try
            {
                var builder = new ContainerBuilder();
                builder.RegisterModule<ValidatorModule>();
                var container = builder.Build();
                _factory = container.Resolve<IValidatorFactory>();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                throw;
            }
        }

        [Test]
        public void Run()
        {
            for (int i = 0; i < Count; i++)
            {
                // test 1
                {
                    var input = new CreateClaptrapInput
                    {
                        NickName = "newbe36524"
                    };
                    var (isOk, errorMessage) = Validate(input);
                    isOk.Should().BeFalse();
                    errorMessage.Should().Be("missing Name");
                }

                // test 2
                {
                    var input = new CreateClaptrapInput
                    {
                        Name = "1",
                        NickName = "newbe36524"
                    };
                    var (isOk, errorMessage) = Validate(input);
                    isOk.Should().BeFalse();
                    errorMessage.Should().Be("Length of Name should be great than 3");
                }

                // test 3
                {
                    var input = new CreateClaptrapInput
                    {
                        Name = "yueluo is the only one dalao",
                        NickName = "newbe36524"
                    };
                    var (isOk, errorMessage) = Validate(input);
                    isOk.Should().BeTrue();
                    errorMessage.Should().BeNullOrEmpty();
                }
            }
        }

        public ValidateResult Validate(CreateClaptrapInput input)
        {
            Debug.Assert(_factory != null, nameof(_factory) + " != null");
            var validator = _factory.GetValidator(typeof(CreateClaptrapInput));
            return validator.Invoke(input);
        }

        public class CreateClaptrapInput
        {
            [Required] [MinLength(3)] public string Name { get; set; }
            [Required] [MinLength(3)] public string NickName { get; set; }
        }

        public struct ValidateResult
        {
            public bool IsOk { get; set; }
            public string ErrorMessage { get; set; }

            public void Deconstruct(out bool isOk, out string errorMessage)
            {
                isOk = IsOk;
                errorMessage = ErrorMessage;
            }

            public static ValidateResult Ok()
            {
                return new ValidateResult
                {
                    IsOk = true
                };
            }

            public static ValidateResult Error(string errorMessage)
            {
                return new ValidateResult
                {
                    IsOk = false,
                    ErrorMessage = errorMessage
                };
            }
        }

        private class ValidatorModule : Module
        {
            protected override void Load(ContainerBuilder builder)
            {
                base.Load(builder);
                builder.RegisterType<ValidatorFactory>()
                    .As<IValidatorFactory>()
                    .SingleInstance();

                builder.RegisterType<StringRequiredPropertyValidatorFactory>()
                    .As<IPropertyValidatorFactory>()
                    .SingleInstance();
                builder.RegisterType<StringLengthPropertyValidatorFactory>()
                    .As<IPropertyValidatorFactory>()
                    .SingleInstance();
            }
        }

        public interface IValidatorFactory
        {
            Func<object, ValidateResult> GetValidator(Type type);
        }

        public interface IPropertyValidatorFactory
        {
            IEnumerable<Expression> CreateExpression(CreatePropertyValidatorInput input);
        }

        public abstract class PropertyValidatorFactoryBase<TValue> : IPropertyValidatorFactory
        {
            public virtual IEnumerable<Expression> CreateExpression(CreatePropertyValidatorInput input)
            {
                if (input.PropertyInfo.PropertyType != typeof(TValue))
                {
                    return Enumerable.Empty<Expression>();
                }

                var expressionCore = CreateExpressionCore(input);
                return expressionCore;
            }

            protected abstract IEnumerable<Expression> CreateExpressionCore(CreatePropertyValidatorInput input);

            protected Expression CreateValidateExpression(
                CreatePropertyValidatorInput input,
                Expression<Func<string, TValue, ValidateResult>> validateFuncExpression)
            {
                var propertyInfo = input.PropertyInfo;
                var isOkProperty = typeof(ValidateResult).GetProperty(nameof(ValidateResult.IsOk));
                Debug.Assert(isOkProperty != null, nameof(isOkProperty) + " != null");

                var convertedExp = Expression.Convert(input.InputExpression, input.InputType);
                var propExp = Expression.Property(convertedExp, propertyInfo);
                var nameExp = Expression.Constant(propertyInfo.Name);

                var requiredMethodExp = Expression.Invoke(
                    validateFuncExpression,
                    nameExp,
                    propExp);
                var assignExp = Expression.Assign(input.ResultExpression, requiredMethodExp);
                var resultIsOkPropertyExp = Expression.Property(input.ResultExpression, isOkProperty);
                var conditionExp = Expression.IsFalse(resultIsOkPropertyExp);
                var ifThenExp =
                    Expression.IfThen(conditionExp,
                        Expression.Return(input.ReturnLabel, input.ResultExpression));
                var re = Expression.Block(
                    new[] {input.ResultExpression},
                    assignExp,
                    ifThenExp);
                return re;
            }
        }

        public class StringRequiredPropertyValidatorFactory : PropertyValidatorFactoryBase<string>
        {
            private static Expression<Func<string, string, ValidateResult>> CreateValidateStringRequiredExp()
            {
                return (name, value) =>
                    string.IsNullOrEmpty(value)
                        ? ValidateResult.Error($"missing {name}")
                        : ValidateResult.Ok();
            }

            protected override IEnumerable<Expression> CreateExpressionCore(CreatePropertyValidatorInput input)
            {
                var propertyInfo = input.PropertyInfo;
                if (propertyInfo.GetCustomAttribute<RequiredAttribute>() != null)
                {
                    yield return CreateValidateExpression(input, CreateValidateStringRequiredExp());
                }
            }
        }

        public class StringLengthPropertyValidatorFactory : PropertyValidatorFactoryBase<string>
        {
            private static Expression<Func<string, string, ValidateResult>> CreateValidateStringMinLengthExp(
                int minLength)
            {
                return (name, value) =>
                    string.IsNullOrEmpty(value) || value.Length < minLength
                        ? ValidateResult.Error($"Length of {name} should be great than {minLength}")
                        : ValidateResult.Ok();
            }

            protected override IEnumerable<Expression> CreateExpressionCore(CreatePropertyValidatorInput input)
            {
                var propertyInfo = input.PropertyInfo;
                var minlengthAttribute = propertyInfo.GetCustomAttribute<MinLengthAttribute>();
                if (minlengthAttribute != null)
                {
                    yield return CreateValidateExpression(input,
                        CreateValidateStringMinLengthExp(minlengthAttribute.Length));
                }
            }
        }

        public class CreatePropertyValidatorInput
        {
            public Type InputType { get; set; } = null!;
            public Expression InputExpression { get; set; } = null!;
            public PropertyInfo PropertyInfo { get; set; } = null!;
            public ParameterExpression ResultExpression { get; set; } = null!;
            public LabelTarget ReturnLabel { get; set; } = null!;
        }

        public class ValidatorFactory : IValidatorFactory
        {
            private readonly IEnumerable<IPropertyValidatorFactory> _propertyValidatorFactories;

            public ValidatorFactory(
                IEnumerable<IPropertyValidatorFactory> propertyValidatorFactories)
            {
                _propertyValidatorFactories = propertyValidatorFactories;
            }

            private Func<object, ValidateResult> CreateValidator(Type type)
            {
                var finalExpression = CreateCore();
                return finalExpression.Compile();

                Expression<Func<object, ValidateResult>> CreateCore()
                {
                    // exp for input
                    var inputExp = Expression.Parameter(typeof(object), "input");

                    // exp for output
                    var resultExp = Expression.Variable(typeof(ValidateResult), "result");

                    // exp for return statement
                    var returnLabel = Expression.Label(typeof(ValidateResult));

                    var innerExps = new List<Expression> {CreateDefaultResult()};

                    var validateExpressions = type.GetProperties()
                        .SelectMany(p => _propertyValidatorFactories
                            .SelectMany(f =>
                                f.CreateExpression(new CreatePropertyValidatorInput
                                {
                                    InputExpression = inputExp,
                                    PropertyInfo = p,
                                    ResultExpression = resultExp,
                                    ReturnLabel = returnLabel,
                                    InputType = type,
                                })))
                        .ToArray();
                    innerExps.AddRange(validateExpressions);

                    innerExps.Add(Expression.Label(returnLabel, resultExp));

                    // build whole block
                    var body = Expression.Block(
                        new[] {resultExp},
                        innerExps);

                    // build lambda from body
                    var final = Expression.Lambda<Func<object, ValidateResult>>(
                        body,
                        inputExp);
                    return final;

                    Expression CreateDefaultResult()
                    {
                        var okMethod = typeof(ValidateResult).GetMethod(nameof(ValidateResult.Ok));
                        Debug.Assert(okMethod != null, nameof(okMethod) + " != null");
                        var methodCallExpression = Expression.Call(okMethod);
                        var re = Expression.Assign(resultExp, methodCallExpression);
                        /**
                         * final as:
                         * result = ValidateResult.Ok()
                         */
                        return re;
                    }
                }
            }

            private static readonly ConcurrentDictionary<Type, Func<object, ValidateResult>> ValidateFunc =
                new ConcurrentDictionary<Type, Func<object, ValidateResult>>();

            public Func<object, ValidateResult> GetValidator(Type type)
            {
                var re = ValidateFunc.GetOrAdd(type, CreateValidator);
                return re;
            }
        }
    }
}
```

Code Essentials：

1. Die IValidatorFactory Model Validator Factory, die die Erstellung eines bestimmten Typs von Validator-Delegat darstellt
2. Der Validierungsausdruck für die spezifischen Eigenschaften von IPropertyValidatorFactory erstellt eine Factory, die eine neue Implementierung anfügen kann, wenn die Regeln zunehmen.
3. Verwenden Sie Autofac für die Modulverwaltung.

## Üben mit der Halle

Gehen Sie nicht!Sie haben immer noch Jobs.

Hier ist eine Anforderung, um nach Schwierigkeiten zu bewerten, die Entwickler erreichen können, um den Code in diesem Beispiel besser zu verstehen und zu verwenden.

### Hinzufügen einer Regel, die die maximale Zeichenfolgenlänge überprüft

Schwierigkeit：D

Ideas：

Ähnlich wie min Länge, vergessen Sie nicht, sich zu registrieren.

### Fügen Sie eine Regel hinzu, die überprüft, dass int größer oder gleich 0 sein muss.

Schwierigkeit：D

Ideas：

Fügen Sie einfach einen neuen Eigenschaftstyp hinzu und vergessen Sie nicht, sich zu registrieren.

### Hinzufügen einer Regel`IEnumerable<T>`Objekt mindestens ein Element enthalten muss

Schwierigkeit：C

Ideas：

Sie können dies mit der Any-Methode in Linq überprüfen

### Hinzufügen eines`IEnumerable<T>`bereits ToList oder ToArray, Analogie zur Regel in mvc

Schwierigkeit：C

Ideas：

Überprüfen Sie, ob es sich bereits um ICollection handelt.

### Unterstützung für leere Objekte gibt auch Validierungsergebnisse aus

Schwierigkeit：C

Ideas：

Wenn die Eingabe leer ist.Sie sollten auch in der Lage sein, die erste Regel auszugeben, die die Kriterien nicht erfüllt.Beispiel: Name Erforderlich.

### Fügen Sie eine Validierungs-Int hinzu? Es muss eine Wertregel geben

Schwierigkeit：B

Ideas：

Int? Es ist eigentlich Syntaxzucker, `Typ ist<int>`.

### Das Hinzufügen einer aufgezählten Validierung muss einem bestimmten Bereich entsprechen.

Schwierigkeit：B

Ideas：

Enumerationen können einem beliebigen Wertebereich zugewiesen werden, z. B. die Enumeration TestEnum s None s 0; Wenn Sie jedoch eine 233 zwingen, eine solche Eigenschaft zu geben, wird kein Fehler gemeldet.Diese Validierung erfordert eine Validierung, dass der Eigenschaftswert nur definiert werden kann.

Sie können es auch erschweren, z. B. indem Sie die Validierung des Bereichs gemischter Werte unterstützen, die als Flags aufgezählt sind.

### Das Hinzufügen einer Validierungsint-A-Eigenschaft muss groß sein, und die int B-Eigenschaft muss groß sein.

Schwierigkeit：A

Ideas：

Für die Teilnahme sind zwei Eigenschaften erforderlich.Egal, schreiben Sie zuerst eine statische Funktion, um die Größe der beiden Werte zu vergleichen.Dann überlegen Sie, wie zu expressionisieren, wie zu korrieren.Sie können sich auf die vorherigen Ideen beziehen.

Zusätzliche Qualifikationsbedingungen können die aktuelle Schnittstellendefinition nicht ändern.

### Hinzufügen einer Validierungszeichenfolge A-Eigenschaft muss gleich der Zeichenfolge B-Eigenschaft sein, wobei die Groß-/Kleinschreibung ignoriert werden muss.

Schwierigkeit：A

Ideas：

Ähnlich wie beim vorherigen.Zeichenfolgenvergleiche sind jedoch spezieller als int, und die Anfrage muss ignoriert werden.

### Unterstützt die Rückgabe aller Validierungsergebnisse

Schwierigkeit：S

Ideas：

Passen Sie die Validierungsergebnisse an, um einen Wert zurückzugeben, von der Rückgabe der ersten nicht so erfüllten Regel bis zur Rückgabe aller nicht erfüllten Regeln, analog zum Effekt des mvc-Modellstatus.

Ausdrücke, die die kombinierten Ergebnisse ändern müssen, können auf zwei Arten erstellt werden, eine besteht darin, die Liste intern zu erstellen und dann die Ergebnisse einzugeben, und die einfachere besteht darin, mit der Yield Return-Methode zurückzukehren.

Es ist wichtig zu beachten, dass, da alle Regeln in Kraft sind, einige Urteile defensive Urteile erfordern.Wenn Sie z. B. die Zeichenfolgenlänge beurteilen, müssen Sie zuerst ermitteln, ob sie leer ist.Was die Frage betrifft, ob die Zeichenfolge leer eine Mindestlängenanforderung ist, können Entwickler frei entscheiden, nicht den Punkt.

### Unterstützt rekursive Validierung von Objekten

Schwierigkeit：SS

Ideas：

Das heißt, wenn ein Objekt eine Eigenschaft und ein Objekt enthält, muss auch das untergeordnete Objekt überprüft werden.

Es gibt zwei ideas：

Eine besteht darin, ValidatorFactory so zu ändern, dass der Validator von ValideFunc als Teil des Ausdrucks abgehört wird.Das Hauptproblem, das diese Idee angehen muss, ist, dass der Validator für das Untermodell möglicherweise nicht im Voraus in der ValidityFunc-Auflistung vorhanden ist.Sie können Lazy verwenden, um dieses Problem zu lösen.

Die zweite besteht darin, eine IPropertyValidatorFactory-Implementierung zu erstellen, die es ihr ermöglicht, ValidateFunc von ValidatorFactory abzuholen, um das Untermodell zu validieren.Das Hauptproblem bei dieser Idee besteht darin, dass eine direkte Implementierung zu zirkulären Abhängigkeiten führen kann.ValidateFunc kann gespeichert und generiert werden, aufgeteilt in zwei Schnittstellen, um diese zirkuläre Abhängigkeit zu lindern.Das System ist einfacher.

Darüber hinaus ist die Schwierigkeit der Qualifikation SSS, `alle Elemente<>` iEnumerable System.Entwickler können es versuchen.

### Verkettete APIs werden unterstützt

Schwierigkeit：SSS

Ideas：

Wie Attribute- und Ketten-APIs in EnterpriseFramework fügen Sie die Merkmale der Ketteneinstellungsüberprüfung hinzu.

Dies erfordert das Hinzufügen einer neuen Schnittstelle für die Kettenregistrierung, und die Methode, die ursprünglich Attribut verwendet hat, um Ausdrücke direkt zu generieren, sollte ebenfalls an Attribut -> Registrierungsdaten -> generieren ausdrücken angepasst werden.

### Implementieren eines Eigenschaftenmodifizierers

Schwierigkeit：SSS

Ideas：

Implementieren Sie eine Regel, dass die Telefonnummer verschlüsselt wird, wenn die Eigenschaft eines Objekts eine Zeichenfolge ist, die eine Länge von 11 erfüllt und mit 1 beginnt.Alle Zeichen außer den ersten drei und den letzten vier werden durch``ersetzt.

Es wird empfohlen, den Eigenschaftenmodifizierer von Grund auf neu zu implementieren, ohne Änderungen am obigen Code vorzunehmen.Da Validierung und Austausch in der Regel zwei verschiedene Unternehmen sind, eines für Input und eines für die Ausgabe.

Hier sind einige zusätzliche requirements：

1. Nachdem der Austausch abgeschlossen ist, werden die Vorher-Nachher-Bedingungen aller ersetzten Werte im Protokoll ausgegeben.
2. Beachten Sie, dass der Test genauso gut ausgeführt werden sollte wie die Direktaufrufmethoden, da andernfalls ein Problem mit der Codeimplementierung auftreten muss.

## Dieser Artikel fasst zusammen

In .net können Ausdrucksstrukturen in zwei Hauptszenarien verwendet werden.Eines wird zum Analysieren der Ergebnisse verwendet, in der Regel EnterpriseFramework, und das andere wird zum Erstellen von Delegaten verwendet.

In diesem Artikel werden die Anforderungen eines Modellvalidators durch Erstellen von Delegaten implementiert.Die Produktion kann auch in vielen dynamischen Aufrufen in der Praxis eingesetzt werden.

Durch das Mastering der Ausdrucksstruktur können Sie dynamische Aufrufe anstelle von Reflektionen tätigen, die nicht nur skalierbarer sind, sondern auch eine gute Leistung erzielen.

Den Beispielcode in diesem Artikel finden Sie im Link-Repository below：

- <https://github.com/newbe36524/Newbe.Demo>
- <https://gitee.com/yks/Newbe.Demo>

<!-- md Footer-Newbe-Claptrap.md -->
