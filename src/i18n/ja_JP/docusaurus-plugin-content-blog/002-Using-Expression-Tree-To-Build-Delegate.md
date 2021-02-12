---
date: 2020-10-13
title: 10 ステップで式ツリーを適用して、動的呼び出しを最適化できます
---

式ツリーは、.net で非常に使い方の良い一連の型です。一部のシナリオでエクスプレッション ツリーを使用すると、パフォーマンスが向上し、スケーラビリティが向上します。この記事では、"モデル検証ツール" を構築することで、動的呼び出しの構築における式ツリーの利点を理解し、適用します。

<!-- more -->

## オープダイジェスト

少し前、[「dotTrace を使用して netcore アプリのパフォーマンスの問題を診断する方法」の](005-How-to-Use-DotTrace)を公開し、ユーザー投票の後、式ツリーの内容に関心が表明されました。

動的呼び出しは、メソッド名やプロパティ名のみを知っている場合に、メソッドまたはプロパティを動的に呼び出す .net 開発で頻繁に発生する要件です。実装する最も広く知られている方法の 1 つは、"反射" を使用してこのような要件を実装することです。もちろん、Emit を使用してこの要件を満たす高パフォーマンスのシナリオもあります。

この記事では、リフレクションよりもパフォーマンスとスケーラビリティが向上し、Emit よりも習得しやすいため、式ツリーを使用してこのシナリオを実装する方法について説明します。

具体的なシナリオを使用して、式を段階的に使用して動的呼び出しを実装します。

このシナリオでは、aspnet mvc の ModelState の要件シナリオによく似たモデル検証ツールを構築します。

この**は**の簡単な入門記事ではなく、コンテンツに初めて足を踏み入れた読者は、アイドル状態のときに IDE が立ち寄るときに見てお勧めします。同時に、サンプルに登場する詳細な方法を気にする必要はありませんが、その意図を理解し、サンプルに従って描画し、その意図をマスターし、深く理解する必要があります。

スペースを短くするために、記事のサンプル コードは変更されていない部分を隠し、完全なテスト コードを取得するには、記事の最後にあるコード ウェアハウスを開いてプルします。

## 実際にビデオがあります

このシリーズには、12 時間の長いビデオが含されています。1つのキーストロークで3つのリンクを覚えている! <iframe src="//player.bilibili.com/player.html?aid=797475985&bvid=BV15y4y1r7pK&cid=247120978&page=1" scrolling="no" border="0" frameBorder="no" frameSpacing="0" allowFullScreen="true" mark="crwd-mark"> </iframe>

元のビデオ アドレス：<https://www.bilibili.com/video/BV15y4y1r7pK>

## 式ツリーを使用する理由と、式ツリーを使用する理由

最初に確認する必要があるものには、2 つの：

1. リフレクションの代わりに式ツリーを使用すると、パフォーマンスが向上しますか。
2. 式ツリーを使用した動的呼び出しでは、パフォーマンスが大幅に低下しますか。

問題がある、実験を行う。2 つの単体テストを使用して、上記の 2 つの問題を検証します。

オブジェクトのメソッドを呼び出します：

```cs
using System;
using System.Diagnostics;
using System.Linq.Expressions;
using System.Reflection;
using FluentAssertions;
using NUnit.Framework;

namespace Newbe.ExpressionsTests
{
    public class X01CallMethodTest
    {
        private const int Count = 1_000_000;
        private const int Diff = 100;

        [SetUp]
        public void Init()
        {
            _methodInfo = typeof(Claptrap). GetMethod(nameof(Claptrap.LevelUp));
            Debug.Assert(_methodInfo != null, nameof(_methodInfo) + " != null");

            var instance = Expression.Parameter(typeof(Claptrap), "c");
            var levelP = Expression.Parameter(typeof(int), "l");
            var callExpression = Expression.Call(instance, _methodInfo, levelP);
            var lambdaExpression = Expression.Lambda<Action<Claptrap, int>>(callExpression, instance, levelP);
            // lambdaExpression should be as (Claptrap c,int l) =>  { c.LevelUp(l); }
            _func = lambdaExpression.Compile();
        }

        [Test]
        public void RunReflection()
        {
            var claptrap = new Claptrap();
            for (int i = 0; i < Count; i++)
            {
                _methodInfo.Invoke(claptrap, new[] {(object) Diff});
            }

            claptrap. Level.Should(). Be(Count * Diff);
        }

        [Test]
        public void RunExpression()
        {
            var claptrap = new Claptrap();
            for (int i = 0; i < Count; i++)
            {
                _func. Invoke(claptrap, Diff);
            }

            claptrap. Level.Should(). Be(Count * Diff);
        }

        [Test]
        public void Directly()
        {
            var claptrap = new Claptrap();
            for (int i = 0; i < Count; i++)
            {
                claptrap. LevelUp(Diff);
            }

            claptrap. Level.Should(). Be(Count * Diff);
        }

        private MethodInfo _methodInfo;
        private Action<Claptrap, int> _func;

        public class Claptrap
        {
            public int Level { get; set; }

            public void LevelUp(int diff)
            {
                Level += diff;
            }
        }
    }
}
```

上記のテストでは、3 番目の呼び出し方法に 100 万回の呼び出しを行い、各テストにかかった時間を記録しました。次のような結果が得られます：

| Method        | Time  |
| ------------- | ----- |
| RunReflection | 217ms |
| RunExpression | 20ms  |
| Directly      | 19ms  |

次の結論に達することができます：

1. 式ツリーを使用して動的呼び出しを行うデリゲートを作成すると、ほぼ同じパフォーマンスが得られます。
2. 式ツリーを使用して動的呼び出しを行うデリゲートを作成するのにかかる時間は、約 10 分の 1 です。

したがって、パフォーマンスのみから考える場合は、式ツリーまたは式ツリーを使用する必要があります。

しかし、これは100万の呼び出しの下で発生する時間であり、単一の呼び出しのために、実際にはナ秒レベルの違いであり、実際には重要ではありません。

しかし、式ツリーは、リフレクションよりもパフォーマンスが優れただけでなく、より強力な拡張性は、実際には最も重要な特性を使用します。

また、プロパティを操作するためのテストも含まれていますが、テスト コードと結果は次のように一覧：

```cs
using System;
using System.Diagnostics;
using System.Linq.Expressions;
using System.Reflection;
using FluentAssertions;
using NUnit.Framework;

namespace Newbe.ExpressionsTests
{
    public class X02PropertyTest
    {
        private const int Count = 1_000_000;
        private const int Diff = 100;

        [SetUp]
        public void Init()
        {
            _propertyInfo = typeof(Claptrap). GetProperty(nameof(Claptrap.Level));
            Debug.Assert(_propertyInfo != null, nameof(_propertyInfo) + " != null");

            var instance = Expression.Parameter(typeof(Claptrap), "c");
            var levelProperty = Expression.Property(instance, _propertyInfo);
            var levelP = Expression.Parameter(typeof(int), "l");
            var addAssignExpression = Expression.AddAssign(levelProperty, levelP);
            var lambdaExpression = Expression.Lambda<Action<Claptrap, int>>(addAssignExpression, instance, levelP);
            // lambdaExpression should be as (Claptrap c,int l) =>  { c.Level += l; }
            _func = lambdaExpression.Compile();
        }

        [Test]
        public void RunReflection()
        {
            var claptrap = new Claptrap();
            for (int i = 0; i < Count; i++)
            {
                var value = (int) _propertyInfo.GetValue(claptrap);
                _propertyInfo.SetValue(claptrap, value + Diff);
            }

            claptrap. Level.Should(). Be(Count * Diff);
        }

        [Test]
        public void RunExpression()
        {
            var claptrap = new Claptrap();
            for (int i = 0; i < Count; i++)
            {
                _func. Invoke(claptrap, Diff);
            }

            claptrap. Level.Should(). Be(Count * Diff);
        }

        [Test]
        public void Directly()
        {
            var claptrap = new Claptrap();
            for (int i = 0; i < Count; i++)
            {
                claptrap. Level += Diff;
            }

            claptrap. Level.Should(). Be(Count * Diff);
        }

        private PropertyInfo _propertyInfo;
        private Action<Claptrap, int> _func;

        public class Claptrap
        {
            public int Level { get; set; }
        }
    }
}
```

時間のかかる状況：

| Method        | Time  |
| ------------- | ----- |
| RunReflection | 373ms |
| RunExpression | 19ms  |
| Directly      | 18ms  |

より多くのボックス化された消費が反映されるので、デリゲートの使用は、前のテスト サンプルよりも遅くなります。

## ステップ1、要件のデモンストレーション

まず、テストを使用して、作成する "モデル検証ツール" がどのような要件であるかを確認します。

```cs
using System.ComponentModel.DataAnnotations;
using FluentAssertions;
using NUnit.Framework;

namespace Newbe.ExpressionsTests
{
    /// <summary>
    /// Validate data by static method
    /// </summary>
    public class X03PropertyValidationTest00
    {
        private const int Count = 10_000;

        [Test]
        public void Run()
        {
            for (int i = 0; i < Count; i++)
            {
                // test 1
                {
                    var input = new CreateClaptrapInput();
                    var (isOk, errorMessage) = Validate(input);
                    isOk.Should(). BeFalse();
                    errorMessage.Should(). Be("missing Name");
                }

                // test 2
                {
                    var input = new CreateClaptrapInput
                    {
                        Name = "1"
                    };
                    var (isOk, errorMessage) = Validate(input);
                    isOk.Should(). BeFalse();
                    errorMessage.Should(). Be("Length of Name should be great than 3");
                }

                // test 3
                {
                    var input = new CreateClaptrapInput
                    {
                        Name = "yueluo is the only one dalao"
                    };
                    var (isOk, errorMessage) = Validate(input);
                    isOk.Should(). BeTrue();
                    errorMessage.Should(). BeNullOrEmpty();
                }
            }
        }

        public static ValidateResult Validate(CreateClaptrapInput input)
        {
            return ValidateCore(input, 3);
        }

        public static ValidateResult ValidateCore(CreateClaptrapInput input, int minLength)
        {
            if (string. IsNullOrEmpty(input. Name))
            {
                return ValidateResult.Error("missing Name");
            }

            if (input. Name.Length < minLength)
            {
                return ValidateResult.Error($"Length of Name should be great than {minLength}");
            }

            return ValidateResult.Ok();
        }

        public class CreateClaptrapInput
        {
            [Required] [MinLength(3)] public string Name { get; set; }
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
    }
}
```

上から下へ、上記のコードの主なポイント：

1. メイン テスト メソッドには、3 つの基本的なテスト ケースが含まれています。次のすべての手順では、このようなテスト ケースを使用します。
2. Validate メソッドは、テストされたラッパー メソッドであり、その後、効果を検証するためにメソッドの実装が呼び出されます。
3. ValidateCore は、モデル検証ツールのデモ実装です。コードからわかるように、メソッドは CreateClaptrapInput オブジェクトを検証し、検証結果を取得します。しかし、この方法の欠点も非常に明白であり、これは典型的な「書き込み死」です。その後、我々は改造のシリーズを通過します。私たちの「モデル検証ツール」をより汎用的にし、この「デッドを書く」アプローチと同じ効率を維持することが重要です!
4. ValidateResult は、検証ツールの出力の結果です。その後、結果は繰り返し使用されます。

## 最初のステップは、静的メソッドを呼び出すことです

まず、前のセクションの静的メソッド ValidateCore を直接使用する最初の式ツリーを作成します。

```cs
using System;
using System.ComponentModel.DataAnnotations;
using System.Diagnostics;
using System.Linq.Expressions;
using FluentAssertions;
using NUnit.Framework;

namespace Newbe.ExpressionsTests
{
    /// <summary>
    /// Validate date by func created with Expression
    /// </summary>
    public class X03PropertyValidationTest01
    {
        private const int Count = 10_000;

        private static Func<CreateClaptrapInput, int, ValidateResult> _func;

        [SetUp]
        public void Init()
        {
            try
            {
                var method = typeof(X03PropertyValidationTest01). GetMethod(nameof(ValidateCore));
                Debug.Assert(method != null, nameof(method) + " != null");
                var pExp = Expression.Parameter(typeof(CreateClaptrapInput));
                var minLengthPExp = Expression.Parameter(typeof(int));
                var body = Expression.Call(method, pExp, minLengthPExp);
                var expression = Expression.Lambda<Func<CreateClaptrapInput, int, ValidateResult>>(body,
                    pExp,
                    minLengthPExp);
                _func = expression.Compile();
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
            return _func. Invoke(input, 3);
        }

        public static ValidateResult ValidateCore(CreateClaptrapInput input, int minLength)
        {
            if (string. IsNullOrEmpty(input. Name))
            {
                return ValidateResult.Error("missing Name");
            }

            if (input. Name.Length < minLength)
            {
                return ValidateResult.Error($"Length of Name should be great than {minLength}");
            }

            return ValidateResult.Ok();
        }
    }
}
```

上から下へ、上記のコードの主なポイント：

1. 単体テストの開始時に作成された式ツリーが、静的フィールド \_func にデリゲートとしてコンパイルされる単体テストの初期化メソッドが追加されました。
2. メイン テスト メソッド Run のコードは省略され、読者が読むときに短くすることができます。実際のコードは変更され、その後は説明が繰り返されません。コード デモ ウェアハウスで確認できます。
3. Validate メソッドの実装が変更され、ValidateCore が直接呼び出され、検証のために \_func呼び出されました。
4. このテストを実行すると、開発者は、前の手順の直接呼び出しとほぼ同じ時間を消費し、追加の消費がないのを見つけ出すことができます。
5. ここでは、動的呼び出しのプロシージャを表す静的メソッド (ValidateCore など) を記述できる場合に、式を使用して動的呼び出しを行う最も簡単な方法を示します。次に、Init と同様のビルド プロセスを使用して式とデリゲートを構築します。
6. 開発者は、ValidateCore に 3 番目の引数 name を追加して、エラー メッセージにステッチして、この単純な式を構築する場合を理解できます。

## 2 番目の手順では、式を結合します

前の手順では、直接呼び出しによって動的呼び出しが変換されましたが、ValidateCore は書き込み用であるため、さらに変更する必要があります。

この手順では、ValidateCore で記述された 3 つの return パスを異なるメソッドに分割し、式をスプライスします。

実現すれば、ある程度の拡張のために、より多くのメソッドをつなぎ合わせる条件があります。

注：デモ コードは瞬時に長く、あまりストレスを感じなくても、後のコード ポイントの説明を参照できます。

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

コードの要点：

1. ValidateCore メソッドは、ValidateNameRequired と ValidateNameMinLength の 2 つのメソッドに分割され、Name の Required と MinLength がそれぞれ検証されます。
2. Init メソッドで local function を使用すると、メソッドの "最初に使用して定義" という効果が得られます。読者はトップダウンで読み、トップレベルからアプローチ全体のロジックを理解することができます。
3. Init 全体のロジックは、 ValidateNameRequired と ValidateNameMinLength を式によって ValidateCore のような形のデリゲート `Func に再構成<CreateClaptrapInput, int, ValidateResult>`。
4. Expression.Parameter は、デリゲート式の引数部分を示します。
5. Expression.Variable は、通常の変数である変数を示します。コード内の`var a に`。
6. Expression.Label は、特定の場所を示します。この例では、主に return ステートメントの位置を指定するために使用されます。goto の構文に精通している開発者は、goto の場合、goto を使用して goto の場所をマークする必要があることを知っています。実際には、return は特別な goto です。したがって、複数のステートメント ブロックで return を return するには、同様にタグが必要です。
7. Expression.Block では、複数の式を順番にグループ化できます。コードを順番に記述すると理解できます。ここでは、CreateDefaultResult、CreateValidateNameRequiredExpression、CreateValidateNameMinLengthExpression、および Label 式をグループ化します。効果は、これらのコードを順番にステッチするのと似ています。
8. CreateValidateNameRequiredExpression と CreateValidateNameMinLengthExpression の構造は非常によく似ています。
9. CreateValidateNameRequiredExpression および CreateValidateNameMinLengthExpression の詳細についてあまり気にする必要はありません。このサンプルをすべて読み終えたら、詳細な Expression.XXXできます。
10. このような変更により、拡張機能が実装されました。Name に MaxLength を 16 を超える検証を追加する必要がある場合。ValidateNameMaxLength の静的メソッドを 1 つ追加し、CreateValidateNameMaxLengthExpression メソッドを追加し、Block に追加するだけで済みます。読者は、この効果を達成するためにハンズオン波を試すことができます。

## 3 番目の手順では、プロパティを読み取ります

ValidateNameRequired と ValidateNameMinLength の 2 つのメソッドを変換します。現在、これらの 2 つのメソッドは CreateClaptrapInput を引数として受け取っているため、内部ロジックも検証 Name として記述されるため、これは優れています。

両方のメソッドを変換して、検証されたプロパティ名を表す string name を渡し、検証されたプロパティ値を表す string value を渡します。これにより、Name に限定されない多くのプロパティに対して、これら 2 つの検証メソッドを使用できます。

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

コードの要点：

1. 前述のように、ValidateNameRequired を変更し、ValidateStringRequired に名前を変更しました。 ValidateNameMinLength -> ValidateStringMinLength。
2. 静的メソッドのパラメータが変更されたため、CreateValidateNameRequiredExpression および CreateValidateNameMinLengthExpression が変更されました。
3. このような変換により、2 つの静的メソッドを使用して、より多くのプロパティ検証を行える可能性があります。読者は、NickName プロパティを追加しようとすることができます。そして、同じ検証を行います。

## 4 番目の手順では、複数のプロパティの検証をサポートします

次に、CreateClaptrapInput のすべての string プロパティを検証します。

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

コードの要点：

1. プロパティ NickName が CreateClaptrapInput に追加され、テスト ケースによっても検証されます。
2. List`を<Expression>`、より動的に生成された式を Block に追加しました。したがって、Name と NickName の両方に対して検証式を生成できます。

## 5 番目の手順では、Attribute を使用してコンテンツを検証することにしました

前に複数のプロパティの検証をサポートしましたが、検証と検証に関するパラメーターは書き込み可能です (たとえば、：MinLength の長さ)。

このセクションでは、Attribute を使用して検証の詳細を決定します。たとえば、Required は必須の検証のためにプロパティとしてマークされます。

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

コードの要点：

1. プロパティの Attribute`を使用して特定の式を含めるかどうかを決定するときに、List<Expression>`を作成します。

## 6 番目の手順では、静的メソッドを式に変更します

ValidateStringRequired と ValidateStringMinLength の 2 つの静的メソッドの内部には、実際には 1 つの判断トライブロック式のみが含まれています。

したがって、ValidateStringRequired と ValidateStringMinLength を式に直接変換できるため、式を構築するために静的メソッドを取得するためにリフレクションは必要ありません。

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

コードの要点：

1. 静的メソッドを式に変更します。したがって、CreateXXXExpression の対応する位置も変更され、コードが短くなります。

## ステップ7、カリー化

関数コリ化とも呼ばれるコリ化は、関数型プログラミングの1つの方法です。単純な表現は、：複数の引数関数の 1 つ以上の引数を固定することで、引数の少ない関数を取得します。用語化は,高次関数(関数の次数は実際には引数の数)を下位関数に変換する方法として表現できる.

たとえば、2 つの数値を加算する機能を実装する add(int,int) 関数があります。セットの最初の引数を 5 に固定すると、数に 5 を加算する関数を実装する add(5,int) 関数が得られる。

ポイントは何ですか?

関数の降順は、関数の一貫性を高め、一貫性のある関数を取得した後、最適化のためにコードを統一することができます。たとえば、上記の 2 つの式：

1. `Expression<Func<string, string, ValidateResult>> ValidateStringRequiredExp`
2. `Expression<Func<string, string, int, ValidateResult>> ValidateStringMinLengthExp`

2 つの式のうち、2 番目の式と最初の式は、3 番目の引数と区別されます。3 番目の int パラメータを Ke理化学で固定すると、2 つの式のシグネチャをまったく同じにできます。これは、オブジェクト指向の抽象化と非常によく似ています。

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

コードの要点：

1. CreateValidateStringMinLengthExp 静的メソッドで、CreateValidateStringRequiredExp の戻り値と同じ式を作成するパラメーターを渡します。前のセクションの ValidateStringMinLengthExp と比較して、int パラメーターを固定して新しい式を取得する操作を実装します。これは、コリ化の現れです。
2. 静的メソッドを統一するために、前のセクションの ValidateStringRequiredExp も CreateValidateStringRequiredExp 静的メソッドに変更しました。
3. それに応じて、List `アセンブリ<Expression>` コードを調整します。

## 8 番目の手順では、重複するコードをマージします

このセクションでは、CreateValidateStringRequiredExpression と CreateValidateStringMinLengthExpression で重複するコードをマージします。

requiredMethodExp のみが異なる方法で作成されます。したがって、このパラメーターをメソッドの外側から渡すだけで、共通部分から引き出すことができます。

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

コードの要点：

1. CreateValidateExpression は、引き出されたパブリック メソッドです。
2. CreateValidateExpression の 2 番目のパラメータである validateFuncExpression は、前のステップのコーリー化なしでは決定が困難です。
3. CreateValidateStringRequiredExpression と CreateValidateStringMinLengthExpression は内部的に CreateValidateExpression を呼び出しますが、いくつかのパラメータが固定されています。戻り値は式であり、実際には関数の表現と見なされるため、これは実際にはコリ化と見なすことができます。

## ステップ 9 では、より多くのモデルをサポートします

これで、CreateClaptrapInput の複数の string フィールドの検証をサポートする検証ツールができました。また、式を増やすだけで、より多くの型を拡張することはそれほど難しくありません。

このセクションでは、CreateClaptrapInput をより抽象的な型に抽象化します。

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

コードの要点：

1. `Func<CreateClaptrapInput, ValidateResult>` を `Func<object, ValidateResult>`に置き換え、書き込み死者の typeof(CreateClaptrapInput) を type に置き換えます。
2. 対応する型の検証ツールを作成した後、ValidateFunc に保存します。これにより、Func 全体を毎回再構築する必要がありません。

## ステップ10は、いくつかの詳細を追加します

最後に、ビジネス機能に合わせて抽象インターフェイスと実装を調整する「いくつかの詳細を追加」の楽しい段階に：しました。その結果、このサンプルの最終バージョンが作成されます。

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

コードの要点：

1. 特定の種類の検証デリゲートの作成を表す IValidatorFactory モデル検証ファクトリ
2. IPropertyValidatorFactory の具体的な属性の検証式は、ルールの追加に応じて新しい実装を追加できるファクトリを作成します。
3. モジュール管理には Autofac を使用します。

## 練習に同行する

行かないで!まだ宿題があります。

開発者がこれらのタスクを実行し、このサンプルのコードをさらに理解し、使用しようとする難易度評価の要件を次に示します。

### string max length を検証するルールを追加します

難易度：D

アイデア：

min length と同様に、登録することを忘れてはならない。

### int が 0 以上でないことを確認するルールを 1 つ増やします

難易度：D

アイデア：

単に新しいプロパティタイプを追加し、登録することを忘れてはならない。

### IEnumerable`を 1 つ増やす<T>`少なくとも 1 つの要素が含まれている必要があります

難易度：C

アイデア：

Linq の Any メソッドを使用して検証できます

### IEnumerable`を追加するには<T>`が既に ToList または ToArray、mvc のルールに例えされている必要があります

難易度：C

アイデア：

実際には、ICollection が既に ICollection であることを確認するだけで十分です。

### 空のオブジェクトのサポートも検証結果を出力します

難易度：C

アイデア：

input が空の場合。また,条件を満たさない最初のルールも出力できる.たとえば、Name Required などです。

### 検証 int を追加しますか? 値を持つ必要があるルール

難易度：B

アイデア：

int? 実際には構文砂糖であり、実際の型は `Nullable<int>`。

### 検証列挙体を 1 つ増やすには、指定されたスコープに準拠する必要があります

難易度：B

アイデア：

列挙型は、Enum TestEnum { None = 0 が定義されているなど、任意の数値範囲に割り当て可能です。 ただし、233 を強制的に割り当てると、このようなプロパティはエラーを報告しません。この検証では、プロパティ値が定義された値のみであることを確認する必要があります。

また、Flags というラベルの付いた列挙体の混合値範囲の検証をサポートするなど、独自の難易度を上けすることもできます。

### int A プロパティが int B プロパティと大きくで必要な検証を追加します

難易度：A

アイデア：

2 つのプロパティが関与する必要があります。放っておいて、2 つの数値のサイズを比較する静的関数を記述します。次に、式化方法、コリ化方法を検討します。前のアイデアを参照することができます。

追加の修飾条件により、現在のインターフェイス定義を変更することはできません。

### string A プロパティが string B プロパティと等しく、大文字と小文字を区別しない必要がある検証を追加します

難易度：A

アイデア：

前の1つに似ています。ただし、string の比較は int よりも特殊であり、大文字と小文字を無視する必要があります。

### すべての検証結果の返しをサポートします

難易度：S

アイデア：

検証結果の戻り値を調整し、最初に満たされていないルールを返すから、mvc model state の効果に例え、満たされていないすべてのルールを返すに変更します。

結合された結果を変更する必要がある式には、List を内部的に作成し、結果を配置する方法と、yield return メソッドを使用して返す方が簡単です。

すべてのルールが実行されるので、いくつかの判断は防御的な判断を必要とします。たとえば、string 長さで判断する場合は、まず空かどうかを判断する必要があります。string が null が最小長要件を満たすかどうかについては、開発者はポイントではなく自由に決定できます。

### オブジェクトの再帰的な検証をサポートします

難易度：SS

アイデア：

つまり、オブジェクトにプロパティとオブジェクトが含まれている場合は、子オブジェクトも検証する必要があります。

考え方は2つ：

1 つは、ValidatorFactory を変更して、式の一部として ValidateFunc から検証ツールを取得できるようにします。この考え方で対処する必要がある主な問題は、ValidateFunc コレクションに子モデルの検証ツールが事前に存在しない可能性がある場合です。Lazy を使用してこの問題を解決できます。

2 つは、ValidatorFactory から ValidateFunc を取得してサブモデルを検証できる IPropertyValidatorFactory 実装を作成します。この考え方の主な問題は、直接実装が循環依存を引き起ぼす可能性がある場合です。ValidateFunc 分割を 2 つのインターフェイスに保存して生成し、この循環依存を解除できます。シナリオは単純です。

さらに、昇格の難易度は SSS で、 `IEnumerable<>` 要素を検証します。開発者は試すことができます。

### チェーン API がサポートされています

難易度：SSS

アイデア：

EntityFramework で Attribute とチェーン API の両方をサポートするのと同様に、チェーン設定検証のプロパティを追加します。

これには、チェーン登録用の新しいインターフェイスの追加が必要であり、Attribute を使用して式を直接生成する元のメソッドも、Attribute -> 登録データ -> 式を生成するように調整する必要があります。

### プロパティ モディファイヤを実装します

難易度：SSS

アイデア：

オブジェクトのプロパティが長さ 11 を満たす文字列で、先頭が 1 の場合、携帯電話番号が暗号化されるルールを実装します。最初の 3 桁と次の 4 桁を除くすべての文字は、すべて`*`。

プロパティ モディファイヤをゼロから実装し、上記のコードに変更を加えないようにお勧めします。検証と置換は、通常、入力用と出力用の 2 つの異なるビジネスであるためです。

ここにいくつかの追加の要件があります：

1. 置換が完了すると、今回置換されたすべての値の前後がログに出力されます。
2. テストのパフォーマンスは、メソッドを直接呼び出すことと同等である必要があります。

## この記事を要約します

.net では、式ツリーを 2 つの主要なシナリオで使用できます。1 つは結果を解析するためのもので、通常は EntityFramework で、もう 1 つはデリゲートの構築です。

この記事では、デリゲートを構築する方法でモデル検証ツールの要件を実装します。運用環境は、実際には、多くの動的呼び出しで使用できます。

式ツリーをマスターすると、リフレクションの代わりに動的呼び出しを行う方法が習得され、拡張性が向上するだけでなく、パフォーマンスも向上します。

この記事のサンプル コードは、次のリンク リポジトリにあります：

- <https://github.com/newbe36524/Newbe.Demo>
- <https://gitee.com/yks/Newbe.Demo>

<!-- md Footer-Newbe-Claptrap.md -->
