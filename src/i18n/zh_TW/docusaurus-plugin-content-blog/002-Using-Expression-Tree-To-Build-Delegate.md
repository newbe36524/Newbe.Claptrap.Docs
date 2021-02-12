---
date: 2020-10-13
title: 只要十步，你就可以應用表達式樹來優化動態調用
---

運算式樹是 .net 中一系列非常好用的類型。在一些場景中使用表達式樹可以獲得更好的性能和更佳的擴充性。本篇我們將通過構建一個"模型驗證器"來理解和應用運算式樹在構建動態調用方面的優勢。

<!-- more -->

## 開篇摘要

前不久，我們發佈了[《如何使用 dotTrace 來診斷 netcore 應用的性能問題》](005-How-to-Use-DotTrace)，經過網友投票之後，網友們表示對其中表達式樹的內容很感興趣，因此本篇我們將展開講講。

動態呼叫是在 .net 開發是時常遇到的一種需求，即在只知道方法名或者屬性名等情況下動態的調用方法或者屬性。最廣為人知的一種實現方式就是使用"反射"來實現這樣的需求。當然也有一些高性能場景會使用 Emit 來完成這個需求。

本文將介紹"使用表達式樹"來實現這種場景，因為這個方法相較於"反射"將擁有更好的性能和擴充性，相較於 Emit 又更容易掌握。

我們將使用一個具體的場景來逐步使用表達式來實現動態調用。

在該場景中，我們將構建一個模型驗證器，這非常類似於 aspnet mvc 中 ModelState 的需求場景。

這**不是**一篇簡單的入門文章，初次涉足該內容的讀者，建議在空閒時，在手邊有 IDE 可以順便操作時邊看邊做。同時，也不必在意樣例中出現的細節方法，只需要瞭解其中的大意，能夠依樣畫瓢即可，掌握大意之後再深入瞭解也不遲。

為了縮短篇幅，文章中的樣例代碼會將沒有修改的部分隱去，想要獲取完整的測試代碼，請打開文章末尾的代碼倉庫進行拉取。

## 居然還有視頻

本系列文章配套一個十幾個小時的長篇視頻。記得一鍵三連哟！ <iframe src="//player.bilibili.com/player.html?aid=797475985&bvid=BV15y4y1r7pK&cid=247120978&page=1" scrolling="no" border="0" frameBorder="no" frameSpacing="0" allowFullScreen="true" mark="crwd-mark"> </iframe>

原始影片地址：<https://www.bilibili.com/video/BV15y4y1r7pK>

## 為什麼要用表達式樹，為什麼可以用表達式樹？

首先需要確認的事情有兩個：

1. 使用表達式樹取代反射是否有更好的性能？
2. 使用表達式樹進行動態調用是否有很大的性能損失？

有問題，做實驗。我們採用兩個單元測試來驗證以上兩個問題。

呼叫一個物件的方法：

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

以上測試中，我們對第三種調用方式一百萬次調用，並記錄每個測試所花費的時間。可以得到類似以下的結果：

| Method        | Time  |
| ------------- | ----- |
| RunReflection | 217ms |
| RunExpression | 20ms  |
| Directly      | 19ms  |

可以得出以下結論：

1. 使用表達式樹創建委託進行動態調用可以得到和直接調用近乎相同的性能。
2. 使用表達式樹創建委託進行動態調用所消耗的時間約為十分之一。

所以如果僅僅從性能上考慮，應該使用表達式樹，也可以是用表達式樹。

不過這是在一百萬調用下體現出現的時間，對於單次調用而言其實就是納秒級別的區別，其實無足輕重。

但其實表達式樹不僅僅在性能上相較於反射更優，其更強大的擴展性其實採用最為重要的特性。

此處還有一個對屬性進行操作的測試，此處將測試代碼和結果羅列如下：

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

耗時情況：

| Method        | Time  |
| ------------- | ----- |
| RunReflection | 373ms |
| RunExpression | 19ms  |
| Directly      | 18ms  |

由於反射多了一份裝拆箱的消耗，所以比起前一個測試樣例顯得更慢了，使用委託是沒有這種消耗的。

## 第〇步，需求演示

先通過一個測試來瞭解我們要創建的"模型驗證器"究竟是一個什麼樣的需求。

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

從上而下，以上代碼的要點：

1. 主測試方法中，包含有三個基本的測試用例，並且每個都將執行一萬次。後續所有的步驟都將會使用這樣的測試用例。
2. Validate 方法是被測試的包裝方法，後續將會調用該方法的實現以驗證效果。
3. ValidateCore 是「模型驗證器」的一個演示實現。從代碼中可以看出該方法對 CreateClaptrapInput 物件進行的驗證，並且得到驗證結果。但是該方法的缺點也非常明顯，這是一種典型的"寫死"。後續我們將通過一系列改造。使得我們的「模型驗證器」更加的通用，並且，很重要的，保持和這個「寫死」的方法一樣的高效！
4. ValidateResult 是驗證器輸出的結果。後續將不斷重複的用到該結果。

## 第一步，調用靜態方法

首先我們構建第一個表達式樹，該表達式樹將直接使用上一節中的靜態方法 ValidateCore。

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

從上而下，以上代碼的要點：

1. 增加了一個單元測試的初始化方法，在單元測試啟動時創建的一個運算式樹將其編譯為委託保存在靜態欄位 \_func 中。
2. 省略了主測試方法 Run 中的代碼，以便讀者閱讀時減少篇幅。實際代碼沒有變化，後續將不再重複說明。可以在程式碼演示倉庫中查看。
3. 修改了 Validate 方法的實現，不再直接調用 ValidateCore ，而調用 \_func 來進行驗證。
4. 運行該測試，開發者可以發現，其消耗的時間和上一步直接調用的耗時，幾乎一樣，沒有額外消耗。
5. 這裡提供了一種最為簡單的使用表達式進行動態調用的思路，如果可以寫出一個靜態方法（例如：ValidateCore）來表示動態調用的過程。那麼我們只要使用類似於 Init 中的構建過程來建構運算式和委託即可。
6. 開發者可以試著為 ValidateCore 增加第三個參數 name 以便拼接在錯誤資訊中，從而瞭解如果建構這種簡單的運算式。

## 第二步，組合表達式

雖然前一步，我們將直接調用轉變了動態調用，但由於 ValidateCore 還是寫死的，因此還需要進一步修改。

本步驟，我們將會把 ValidateCore 中寫死的三個 return 路徑拆分為不同的方法，然後再採用表達式拼接在一起。

如果我們實現了，那麼我們就有條件將更多的方法拼接在一起，實現一定程度的擴展。

注意：演示代碼將瞬間邊長，不必感受太大壓力，可以輔助後面的代碼要點說明進行查看。

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

代碼要點：

1. ValidateCore 方法被分割為了 ValidateNameRequired 和 ValidateNameMinLength 兩個方法，分別驗證 Name 的 Required 和 MinLength。
2. Init 方法中使用了 local function 從而實現了方法"先使用後定義"的效果。讀者可以自上而下閱讀，從頂層開始瞭解整個方法的邏輯。
3. Init 整體的邏輯就是透過表示式將 ValidateNameRequired 和 ValidateNameMinLength 重新組合成一個形如 ValidateCore 的委託 `Func<CreateClaptrapInput, int, ValidateResult>`。
4. Expression.Parameter 用於標明委託表達式的參數部分。
5. Expression.Variable 用於標明一個變數，就是一個普通的變數。類似於代碼中的`var a`。
6. Expression.Label 用於標明一個特定的位置。在該樣例中，主要用於標定 return 语句的位置。熟悉 goto 語法的開發者知道， goto 的時候需要使用 label 來標記想要 goto 的地方。而實際上，return 就是一種特殊的 goto。所以想要在多個語句塊中 return 也同樣需要標記後才能 return。
7. Expression.Block 可以將多個運算式順序組合在一起。可以理解為按順序寫代碼。這裏我們將 CreateDefaultResult、CreateValidateNameRequiredExpression、CreateValidateNameMinLengthExpression 和 Label 運算式組合在一起。效果就類似於把這些代碼按順序拼接在一起。
8. CreateValidateNameRequiredExpression 和 CreateValidateNameMinLengthExpression 的結構非常類似，因為想要生成的結果表達式非常類似。
9. 不必太在意 CreateValidateNameRequiredExpression 和 CreateValidateNameMinLengthExpression 當中的細節。可以在本樣例全部閱讀完之後再嘗試瞭解更多的 Expression.XXX 方法。
10. 經過這樣的修改之後，我們就實現了擴展。假設現在需要對 Name 增加一個 MaxLength 不得超過 16 的驗證。只需要增加一個 ValidateNameMaxLength 的靜態方法，添加一個 CreateValidateNameMaxLengthExpression 的方法，並且加入到 Block 中即可。讀者可以嘗試動手操作一波實現這個效果。

## 第三步，讀取屬性

我們來改造 ValidateNameRequired 和 ValidateNameMinLength 兩個方法。因為現在這兩個方法接收的是 CreateClaptrapInput 作為參數，內部的邏輯也被寫死為驗證 Name，這很不優秀。

我們將改造這兩個方法，使其傳入 string name 表示驗證的屬性名稱，string value 表示驗證的屬性值。這樣我們就可以將這兩個驗證方法用於不限於Name的更多屬性。

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

代碼要點：

1. 正如前文所述，我們修改了 ValidateNameRequired ，並重命名為 ValidateStringRequired。 ValidateNameMinLength -> ValidateStringMinLength。
2. 修改了 CreateValidateNameRequiredExpression 和 CreateValidateNameMinLengthExpression，因為靜態方法的參數發生了變化。
3. 通過這樣的改造，我們便可以將兩個靜態方法用於更多的屬性驗證。讀者可以嘗試增加一個 NickName 屬性。並且進行相同的驗證。

## 第四步，支援多個屬性驗證

接下來，我們通過將驗證 CreateClaptrapInput 所有的 string 屬性。

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

代碼要點：

1. 在 CreateClaptrapInput 中增加了一個屬性 NickName ，測試用例也將驗證該屬性。
2. 通過`List<Expression>`我們將更多動態生成的運算式加入到了 Block 中。因此，我們可以對 Name 和 NickName 都生成驗證運算式。

## 第五步，通過 Attribute 決定驗證內容

儘管前面我們已經支持驗證多種屬性了，但是關於是否進行驗證以及驗證的參數依然是寫死的（例如：MinLength 的長度）。

本節，我們將通過 Attribute 來決定驗證的細節。例如被標記為 Required 是屬性才會進行必填驗證。

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

代碼要點：

1. 在建構`List<Expression>`時透過屬性上的 Attribute 上的決定是否加入特定的運算式。

## 第六步，將靜態方法換為表達式

ValidateStringRequired 和 ValidateStringMinLength 兩個靜態方法的內部實際上只包含一個判斷三目表達式，而且在 C# 中，可以將 Lambda 方法賦值個一個表達式。

因此，我們可以直接將 ValidateStringRequired 和 ValidateStringMinLength 改換為表達式，這樣就不需要反射來獲取靜態方法再去構建表達式了。

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

代碼要點：

1. 將靜態方法換成了表達式。因此 CreateXXXExpression 相應的位置也進行了修改，代碼就更短了。

## 第七步，柯里化

柯理化，也稱為函數柯理化，是函數式程式設計當中的一種方法。簡單的可以表述為：通過固定一個多參數函數的一個或幾個參數，從而得到一個參數更少的函數。術語化一些，也可以表述為將高階函數（函數的階其實就是說參數的個數）轉換為低階函數的方法。

例如，現在有一個 add（int，int） 的函數，它實現了將兩個數相加的功能。假如我們固定集中第一個參數為 5 ，則我們會得到一個 add（5，int） 的函數，它實現的是將一個數加 5 的功能。

這有什麼意義？

函數降階可以使得函數變得一致，得到了一致的函數之後可以做一些代碼上的統一以便優化。例如上面使用到的兩個表示式：

1. `Expression<Func<string, string, ValidateResult>> ValidateStringRequiredExp`
2. `Expression<Func<string, string, int, ValidateResult>> ValidateStringMinLengthExp`

這兩個運算式中第二個運算式和第一個運算式之間僅僅區別在第三參數上。如果我們使用柯理化固定第三個 int 參數，則可以使得兩個表達式的簽名完全一樣。這其實和面向物件中的抽象非常類似。

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

代碼要點：

1. CreateValidateStringMinLengthExp 靜態方法，傳入一個參數創建得到一個和 CreateValidateStringRequiredExp 返回值一樣的運算式。對比上一節中的 ValidateStringMinLengthExp ，實現了固定 int 參數而得到一個新運算式操作。這就是一種柯理化的體現。
2. 為了統一都採用靜態方法，我們將上一節中的 ValidateString RequiredExp 也改為 CreateValidateStringRequiredExp 靜態方法，這僅僅只是為了看起來一致（但實際上增加了一點點開銷，因為沒必要重複創建一個不變的表達式）。
3. 相應的調整一下 `List<Expression>` 組裝過程的代碼。

## 第八步，合併重複代碼

本節，我們將合併 CreateValidateStringRequiredExpression 和 CreateValidateStringMinLengthExpression 中重複的代碼。

其中只有 requiredMethodExp 的建立方式不同。因此，只要將這個參數從方法外面傳入就可以抽離出公共部分。

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

代碼要點：

1. CreateValidateExpression 就是被抽離出來的公共方法。
2. 如果沒有前一步柯理化，CreateValidateExpression 的第二個參數 validateFuncExpression 將很難確定。
3. CreateValidateStringRequiredExpression 和 CreateValidateStringMinLengthExpression 內部調用了 CreateValidateExpression，但是固定了幾個參數。這其實也可以被認為是一種柯理化，因為返回值是表達式其實可以被認為是一種函數的表現形式，當然理解為重載也沒有問題，不必太過糾結。

## 第九步，支援更多模型

到現在，我們已經得到了一個支持驗證 CreateClaptrapInput 多個 string 欄位的驗證器。並且，即使要擴展多更多類型也不是太難，只要增加表達式即可。

本節，我們將 CreateClaptrapInput 抽象為更抽象的類型，畢竟沒有模型驗證器是專門只能驗證一個 class 的。

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

代碼要點：

1. 將 `Func<CreateClaptrapInput, ValidateResult>` 替換為了 `Func<object, ValidateResult>`，並且將寫死的 typeof（CreateClaptrapInput） 都替換為了 type。
2. 將對應類型的驗證器創建好之後保存在 ValidateFunc 中。這樣就不需要每次都重建整個 Func。

## 第十步，加入一些細節

最後的最後，我們又到了令人愉快的"加入一些細節"階段：按照業務特性對抽象介面和實現進行調整。於是我們就得到了本示例最終的版本。

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

代碼要點：

1. IValidatorFactory 模型驗證器工廠，表示創建特定類型的驗證器委託
2. IPropertyValidatorFactory 具體屬性的驗證表達式創建工廠，可以根據規則的增加，追加新的實現。
3. 使用 Autofac 進行模組管理。

## 隨堂小練

別走！您還有作業。

以下有一個按照難度分級的需求，開發者可以嘗試完成這些任務，進一步理解和使用本樣例中的代碼。

### 增加一個驗證 string max length 的規則

難度：D

思路：

和 min length 類似，別忘記註冊就行。

### 增加一個驗證 int 必須大於等於 0 的規則

難度：D

思路：

只是多了一個新的屬性類型，別忘記註冊就行。

### 增加一個`IEnumerable<T>`物件必須包含至少一個元素的規則

難度：C

思路：

可以用 Linq 中的 Any 方法來驗證

### 增加一個`IEnumerable<T>`必須已經 ToList 或者 ToArray，類比 mvc 中的規則

難度：C

思路：

其實只要驗證是否已經是 ICollection 就可以了。

### 支援空物件也輸出驗證結果

難度：C

思路：

如果 input 為空。則也要能夠輸出第一條不滿足條件的規則。例如 Name Required。

### 增加一個驗證 int？ 必須有值的規則

難度：B

思路：

int? 其實是語法糖，實際類型是 `Nullable<int>`。

### 增加一個驗證枚舉必須符合給定的範圍

難度：B

思路：

枚舉是可以被賦值以任意數值範圍的，例如定義了 Enum TestEnum { None = 0; } 但是，強行賦值 233 給這樣的屬性並不會報錯。該驗證需要驗證屬性值只能是定義的值。

也可以增加自己的難度，例如支援驗證標記為 Flags 的枚舉的混合值範圍。

### 添加一個驗證 int A 屬性必須和 int B 屬性大

難度：A

思路：

需要有兩個屬性參與。啥都別管，先寫一個靜態函數來比較兩個數值的大小。然後在考慮如何表達式化，如何柯理化。可以參考前面思路。

額外限定條件，不能修改現在介面定義。

### 添加一個驗證 string A 屬性必須和 string B 屬性相等，忽略大小寫

難度：A

思路：

和前一個類似。但是，string 的比較比 int 特殊，並且需要忽略大小寫。

### 支援返回全部的驗證結果

難度：S

思路：

調整驗證結果返回值，從返回第一個不滿足的規則，修改為返回所有不滿足的規則，類比 mvc model state 的效果。

需要修改組合結果的表達式，可以有兩種辦法，一種是內部創建 List 然後將結果放入，更為簡單的一種是使用 yield return 的方法進行返回。

需要而外注意的是，由於所有規則都運行，一些判斷就需要進行防禦性判斷。例如在 string 長度判斷時，需要先判斷其是否為空。至於 string 為空是否屬於滿足最小長度要求，開發者可以自由決定，不是重點。

### 支援物件的遞歸驗證

難度：SS

思路：

即如果物件包含一個屬性又是一個物件，則子物件也需要被驗證。

有兩種思路：

一是修改 ValidatorFactory 使其支援從 ValidateFunc 中獲取驗證器作為表達式的一部分。該思路需要解決的主要問題是，ValidateFunc 集合中可能提前不存在子模型的驗證器。可以使用 Lazy 來解決這個問題。

二是創建一個IPropertyValidatorFactory實現，使其能夠從 ValidatorFactory 中獲取 ValidateFunc 來驗證子模型。該思路主要要解決的問題是，直接實現可能會產生循環依賴。可以保存和生成 ValidateFunc 劃分在兩個介面中，解除這種循環依賴。該方案較為簡單。

另外，晉級難度為 SSS，驗證 `IEnumerable<>` 中所有的元素。開發者可以嘗試。

### 支持鏈式 API

難度：SSS

思路：

形如 EntityFramework 中同時支援 Attribute 和鏈式 API 一樣，添加鏈式設置驗證的特性。

這需要增加新的介面以便進行鏈式註冊，並且原來使用 Attribute 直接生成運算式的方法也應該調整為 Attribute -> 註冊數據 -> 生成運算式。

### 實現一個屬性修改器

難度：SSS

思路：

實現一條規則，手機號碼加密，當物件的某個屬性是滿足長度為 11 的字串，並且開頭是 1。則除了前三位和後四位之外的字元全部取代為`*`。

建議從頭開始實現屬性修改器，不要在上面的代碼上做變更。因為驗證和替換通常來說是兩個不同的業務，一個是為了輸入，一個是為了輸出。

這裡有一些額外的要求：

1. 在替換完成後，將此次被替換的所有值的前後情況輸出在日誌中。
2. 注意，測試的性能要與直接調用方法相當，否則肯定是代碼實現存在問題。

## 本文總結

在.net 中，表達式樹可以用於兩種主要的場景。一種是用於解析結果，典型的就是 EntityFramework，而另外一種就是用於構建委託。

本文通過構建委託的方式實現了一個模型驗證器的需求。生產實際中還可以用於很多動態調用的地方。

掌握表達式樹，就掌握了一種可以取代反射進行動態調用的方法，這種方法不僅擴展性更好，而且性能也不錯。

本篇內容中的範例代碼，均可以在以下連結主目錄中找到：

- <https://github.com/newbe36524/Newbe.Demo>
- <https://gitee.com/yks/Newbe.Demo>

<!-- md Footer-Newbe-Claptrap.md -->
