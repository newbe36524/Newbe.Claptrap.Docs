---
date: 2020-10-13
title: In just ten steps, you can apply an expression tree to optimize dynamic calls
---

Expression trees are a series of very useful types in .net.Using expression trees in some scenarios can result in better performance and better scalability.In this article, we'll understand and apply the benefits of expression trees in building dynamic calls by building a "model validator."

<!-- more -->

## Summary

Not long ago, we released[How to use dotTrace to diagnose performance issues with netcore apps](005-How-to-Use-DotTrace), and after a netizen vote, netizens expressed interest in the contents of the expression tree, so we'll talk about it in this article.

Dynamic calling is a requirement that is often encountered in .net development, i.e. dynamic call methods or properties when only method names or property names are known.One of the most well-known implementations is the use of "reflection" to achieve such a requirement.Of course, there are some high-performance scenarios that use Emit to accomplish this requirement.

This article describes "using expression trees" to implement this scenario, because this approach will have better performance and scalability than "reflection" and is easier to master than Emit.

We'll use a specific scenario to implement dynamic calls step-by-step with expressions.

In this scenario, we'll build a model validator, which is very similar to the requirements scenario for ModelState in aspnet mvc.

This****a simple introductory article for first-time readers, and it is recommended that you watch while you're free and have an IDE at hand to do by the way.At the same time, also do not have to care about the details of the example of the method, just need to understand the general idea, can be painted according to the style can be, master the big idea and then in-depth understanding is not too late.

To shorten the space, the sample code in the article will hide the unalmoved part, and if you want to get the complete test code, open the code repository at the end of the article to pull.

## There's still a video

This series of articles is packaged with a ten-hour long video.Remember one click, three companies! <iframe src="//player.bilibili.com/player.html?aid=797475985&bvid=BV15y4y1r7pK&cid=247120978&page=1" scrolling="no" border="0" frameBorder="no" frameSpacing="0" allowFullScreen="true" mark="crwd-mark"> </iframe>

Original video address：<https://www.bilibili.com/video/BV15y4y1r7pK>

## Why use expression trees, why can I use expression trees?

The first thing to confirm is that there are two：

1. Is it better to replace reflection with expression trees?
2. Is there a significant performance loss using expression trees for dynamic calls?

There's a problem, do the experiment.We used two unit tests to validate both of these issues.

Call the method of an object：

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

In the above tests, we called a million times for the third call and recorded the time spent on each test.You can get results similar to the following：

| Method        | Time  |
| ------------- | ----- |
| RunReflection | 217ms |
| RunExpression | 20ms  |
| Directly      | 19ms  |

The following conclusions can be drawn：

1. Creating a delegate with an expression tree for dynamic calls can get almost the same performance as direct calls.
2. Creating a delegate with an expression tree takes about one-tenth of the time to make a dynamic call.

So if you're just thinking about performance, you should use an expression tree, or you can use an expression tree.

However, this is reflected in a million calls to appear in the time, for a single call is actually the difference between the nanecond level, in fact, insignificance.

But in fact, expression trees are not only better in performance than reflection, their more powerful scalability actually uses the most important features.

There is also a test to operate on the properties, where the test code and results are listed：

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

Time-consuming：

| Method        | Time  |
| ------------- | ----- |
| RunReflection | 373ms |
| RunExpression | 19ms  |
| Directly      | 18ms  |

Because the reflection is more than one unboxing consumption, it is slower than the previous test sample, and the use of delegates is not such a consumption.

## Step 10, requirements demonstration

Let's start with a test to see what kind of requirements we're going to create for the Model Validator.

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

From the top down, the main points of the above code：

1. The main test method contains three basic test cases, each of which will be executed 10,000 times.All subsequent steps will use such test cases.
2. The Validate method is the wrapper method being tested, and the implementation of the method is subsequently called to verify the effect.
3. ValidityCore is a demo implementation of model validators.As you can see from the code, the method validates the CreateClaptrapInput object and obtains the results.But the disadvantages of this method are also very obvious, which is a typical "write dead".We will follow through a series of renovations.Make our Model Validator more versatile and, importantly, as efficient as this "write dead" approach!
4. ValidateResult is the result of the validator output.The result will be repeated over and over again.

## The first step is to call the static method

First, we build the first expression tree, which will use validateCore directly using the static method in the last section.

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

From the top down, the main points of the above code：

1. An initialization method for unit tests has been added, and an expression tree created at the start of the unit test compiles it as a delegate to save in the static field _func.
2. The code in the main test method Run is omitted so that the reader can read less space.The actual code has not changed and the description will not be repeated in the future.You can view it in the code demo repository.
3. The implementation of the Validate method has been modified so that validateCore is no longer called directly, _func to validate.
4. By running the test, developers can see that it takes almost as much time as the next direct call, with no additional consumption.
5. This provides the simplest way to use expressions for dynamic calls, if you can write out a static method (for example, ValidateCore) to represent the procedure for dynamic calls.So let's just use a build process similar to the one in Init to build expressions and delegates.
6. Developers can try adding a third parameter name to ValidateCore so that they can stitch in the error message to understand if you build such a simple expression.

## The second step is to combine expressions

Although in the previous step, we'll convert the dynamic call directly, but because ValidateCore is still dead, it needs to be further modified.

In this step, we'll split the three return paths written dead in ValidateCore into different methods, and then stitch them together with expressions.

If we do, then we are in a good place to stitch more methods together to achieve a degree of expansion.

Note：the demo code will be instantly long and does not have to feel too much pressure, which can be viewed with a follow-up code point description.

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

1. The ValidateCore method is split into validateNameRequired and ValidateNameMinLength methods to validate Name's Required and MinLength, respectively.
2. The Local function is used in the Init method to achieve the effect of the method "use first, define later".Readers can read from the top down and learn the logic of the whole approach from the top.
3. The logic of Init as a whole is to reassemble ValidateNameRequired and ValidateNameMinLength through expressions into a delegate-like `Func<CreateClaptrapInput, int, ValidateResult>`.
4. Expression.Parameter is used to indicate the parameter portion of the delegate expression.
5. Expression.Variable is used to indicate a variable, which is a normal variable.Similar to the`var a`.
6. Expression.Label is used to indicate a specific location.In this example, it is primarily used to position the return statement.Developers familiar with the goto syntax know that goto needs to use labels to mark where they want goto.In fact, return is a special kind of goto.So if you want to return in more than one statement block, you also need to mark it before you can return.
7. Expression.Block can group multiple expressions together in order.It can be understood as writing code sequentially.Here we combine CreateDefaultResult, CreateValidateNameRequired Expression, CreateValidateNameMinLengthExpression, and Label expressions.The effect is similar to stitching the code together sequentially.
8. CreateValidateNameRequiredExpression and CreateValidateNameMinLengthExpression have very similar structures because the resulting expressions you want to generate are very similar.
9. Don't worry too much about the details in CreateValidateNameRequired Expression and CreateValidateNameMinLengthExpression.You can try to learn more about this method after you've read Expression.XXX sample.
10. With this modification, we implemented the extension.Suppose you now need to add a MaxLength validation to Name that does not exceed 16.Just add a static method of ValidateNameMaxLength, add a CreateValidateNameMaxLengthExpression method, and add it to Block.Readers can try to do a wave to achieve this effect.

## The third step is to read the properties

Let's retrofit validateNameRequired and ValidateNameMinLength.Since both methods now receive CreateClaptrapInput as an argument, the internal logic is also written to validate Name, which is not very good.

We'll retrofit both methods so that the string name is passed in to represent the verified property name, and string value represents the verified property value.This way we can use these two validation methods for more properties that are not limited to Name.

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

1. As mentioned earlier, we modified ValidateNameRequired and renamed it ValidateStringRequired. ValidateNameMinLength -> ValidateStringMinLength。
2. CreateValidateNameRequired Expression and CreateValidateNameMinLengthExpression have been modified because the parameters of the static method have changed.
3. With this modification, we can use two static methods for more attribute validation.Readers can try adding a NickName property.and perform the same validation.

## The fourth step is to support multiple property validations

Next, we'll verify all the string properties of CreateClaptrapInput.

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

1. A property, NickName, has been added to CreateClaptrapInput, and the test case will validate the property.
2. By`List<Expression>`we added more dynamically generated expressions to block.Therefore, we can generate validation expressions for both Name and NickName.

## The fifth step is to verify the content through the Attribute decision

Although we've supported validation of a number of properties in the first place, the parameters for validation and validation are still written dead (for example, the length of：MinLength).

In this section, we will use Attribute to determine the details of the validation.For example, being marked Required is a property for required validation.

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

1. When building a`List<Expression>`a specific expression is made by deciding whether to include a specific expression on the Attribute on the property.

## In the sixth step, replace the static method with an expression

The interior of the two static methods, ValidateStringRequired and ValidateStringMinLength, actually contains only one judgment trilateral expression, and in C# you can assign the Lambda method an expression.

Therefore, we can change validateStringRequired and ValidateStringMinLength directly to expressions, so that we don't need reflection to get static methods to build expressions.

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

1. Replace the static method with an expression.So createXXXExpression's location has been modified, and the code is shorter.

## Step seven, Curry

Coli chemicalization, also known as functional science and physication, is a method in functional programming.Simple can be expressed as：by fixing one or more arguments of a multi-argument function, resulting in a function with fewer arguments.Some terminology can also be expressed as a way to convert a higher-order function (the order of a function is actually the number of arguments) into a low-order function.

For example, there is now an add (int, int) function that implements the function of adding two numbers.If we pin the first argument in the set to 5, we get an add (5,int) function that implements the function of plus a number plus 5.

What's the point?

The function descending can make the functions consistent, and after the consistent functions have been obtained, some code unification can be made for optimization.For example, the two expressions used above：

1. `Expression<Func<string, string, ValidateResult>> ValidateStringRequiredExp`
2. `Expression<Func<string, string, int, ValidateResult>> ValidateStringMinLengthExp`

The difference between the second expression and the first expression in the two expressions is only on the third argument.If we pin the third int parameter with Corredic, we can make the signatures of the two expressions exactly the same.This is very similar to abstraction in object-oriented.

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

1. CreateValidateStringMinLengthExp static method, pass in an argument to create an expression that is the same as the Value returned by CreateValidateStringRequiredExp.Compared to the ValidateStringMinLengthExp in the last section, the operation of fixing the int parameter to obtain a new expression is implemented.This is the embodiment of a corredic.
2. To unify the static methods, we changed the ValidateStringRequiredExp in the last section to createValidateStringRequiredExp static methods, just to look consistent (but actually add a little overhead because there is no need to create an unchanged expression repeatedly).
3. Adjust the code for the `assembly<Expression>` the list code accordingly.

## Step 8, merge the duplicate code

In this section, we'll combine duplicate code from CreateValidateStrationRequired Expression and CreateValidateStringMinLengthExpression.

Only RequiredMethodExp is created differently.Therefore, you can pull out of the common part by simply passing this parameter in from outside the method.

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

1. CreateValidate Expression is a common way to get pulled out.
2. Without the previous step, CreateValidate Expression's second parameter, validateFuncExpression, would be difficult to determine.
3. CreateValidateStringRequired Expression and CreateValidateStringMinLengthExpression called CreateValidate Expression internally, but fixed several parameters.This can also be considered a corredic, because the return value is that the expression can actually be considered a function of the form, of course, understood as overloading is no problem, do not have to be too tangled.

## Step 9 to support more models

So far, we've got a validator that supports verifying multiple string fields in CreateClaptrapInput.And even if you want to extend more types, it's not too hard, just add an expression.

In this section, we abstract CreateClaptrapInput into a more abstract type, after all, no model validator is dedicated to validating only one class.

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

1. Replace `Func<CreateClaptrapInput, ValidateResult>` with `Func<object, ValidateResult>`, and replace the dead typeof (CreateClaptrapInput) with type.
2. Save the validator of the corresponding type in ValidatedFunc after it has been created.This does not require rebuilding the entire Func every time.

## Step 10, add some details

Finally, we're in the pleasant "add some details" phase：to adjust abstract interfaces and implementations to business characteristics.So we got the final version of this example.

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

1. The IValidatorFactory Model Validator Factory, which represents the creation of a specific type of validator delegate
2. The validation expression for the specific properties of IPropertyValidatorFactory creates a factory that can append a new implementation as the rules increase.
3. Use Autofac for module management.

## Practice with the hall

Don't leave!You still have jobs.

Here's a requirement to rate by difficulty that developers can try to accomplish to further understand and use the code in this example.

### Add a rule that validates string max length

Difficulty：D

Ideas：

Similar to min length, don't forget to register.

### Add a rule that verifies that int must be greater than or equal to 0

Difficulty：D

Ideas：

Just add a new property type and don't forget to register.

### Add a rule`IEnumerable<T>`object must contain at least one element

Difficulty：C

Ideas：

You can verify this using the Any method in Linq

### Adding an`IEnumerable<T>`already ToList or ToArray, analogy to the rule in mvc

Difficulty：C

Ideas：

In fact, just verify that it's already ICollection.

### Support for empty objects also outputs validation results

Difficulty：C

Ideas：

If input is empty.you should also be able to output the first rule that does not meet the criteria.For example, Name Required.

### Add a validation int? There must be a rule of value

Difficulty：B

Ideas：

Int? It's actually syntax sugar, `type is<int>`.

### Adding a validation enumerated must conform to a given range

Difficulty：B

Ideas：

Enumerations can be assigned to any range of values, for example, enum TestEnum s None s 0; However, forcing a 233 to give such a property does not report an error.This validation requires validation that the property value can only be defined.

You can also make it more difficult, such as by supporting validation of the range of mixed values enumerated as Flags.

### Adding a validation int A property must be large and the int B property

Difficulty：A

Ideas：

Two properties are required to participate.Never care, write a static function first to compare the size of the two values.Then consider how to expressionize, how to corrification.You can refer to the previous ideas.

Additional qualification conditions, can not modify the current interface definition.

### Adding a validation string A property must be equal to the string B property, ignoring case

Difficulty：A

Ideas：

Similar to the previous one.However, string comparisons are specialer than int and case needs to be ignored.

### Supports returning all validation results

Difficulty：S

Ideas：

Adjust the validation results to return a value, from returning the first unso satisfied rule to returning all unso satisfied rules, analogy to the effect of mvc model state.

Expressions that need to modify the combined results can be created in two ways, one is to create the List internally and then put the results in, and the simpler one is to return using the yield return method.

It is important to note that since all rules are in operation, some judgments require defensive judgments.For example, when judging string length, you need to first determine if it is empty.As to whether string empty is a minimum length requirement, developers are free to decide, not the point.

### Supports recursive validation of objects

Difficulty：SS

Ideas：

That is, if an object contains a property and an object, the child object also needs to be validated.

There are two ideas：

One is to modify ValidatorFactory to support getting the validator from ValideFunc as part of the expression.The main problem that this idea needs to address is that the validator for the sub-model may not exist in the ValidityFunc collection in advance.You can use Lazy to solve this problem.

The second is to create an IPropertyValidatorFactory implementation that enables it to obtain ValidateFunc from ValidatorFactory to validate the sub-model.The main problem with this idea is that a direct implementation may produce circular dependencies.ValidateFunc can be saved and generated divided into two interfaces to relieve this circular dependency.The scheme is simpler.

In addition, the difficulty of qualifying is SSS, `all the elements<>` the IEnumerable system.Developers can try.

### Chained APIs are supported

Difficulty：SSS

Ideas：

Like both Attribute and Chain APIs in EnterpriseFramework, add the characteristics of chain setting validation.

This requires adding a new interface for chain registration, and the method that originally used Attribute to generate expressions directly should also be adjusted to attribute -> registration data -> generate expressions.

### Implement a property modifier

Difficulty：SSS

Ideas：

Implement a rule that the phone number is encrypted when an object's property is a string that meets a length of 11 and starts with 1.All characters except the first three and the last four are replaced with``.

It is recommended to implement the property modifier from scratch, without making changes to the code above.Because validation and replacement are usually two different businesses, one for input and one for output.

Here are some additional requirements：

1. After the replacement is complete, the before and after conditions of all the values that were replaced are output in the log.
2. Note that the test should perform as well as calling methods directly, otherwise there must be a problem with the code implementation.

## This article summarizes

In .net, expression trees can be used in two main scenarios.One is used to parse the results, typically EnterpriseFramework, and the other is used to build delegates.

This article implements the requirements of a model validator by building delegates.Production can also be used in many dynamic calls in practice.

Mastering the expression tree gives you a way to make dynamic calls instead of reflection, which is not only more scalable, but also performs well.

The sample code in this article can be found in the link repository below：

- <https://github.com/newbe36524/Newbe.Demo>
- <https://gitee.com/yks/Newbe.Demo>

<!-- md Footer-Newbe-Claptrap.md -->
