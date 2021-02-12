---
date: 2020-10-13
title: En seulement dix étapes, vous pouvez appliquer un arbre d’expression pour optimiser les appels dynamiques
---

Les arbres d’expression sont une série de types très utiles dans .net.L’utilisation d’arbres d’expression dans certains scénarios peut se traduire par de meilleures performances et une meilleure évolutivité.Dans cet article, nous allons comprendre et appliquer les avantages des arbres d’expression dans la construction d’appels dynamiques en construisant un « validateur modèle ».

<!-- more -->

## Un résumé d’ouverture

Il n’y a pas si longtemps, nous avons publié[Comment utiliser dotTrace pour diagnostiquer les problèmes de performances avec les applications netcore](005-How-to-Use-DotTrace), et après un vote net-citoyens, les net-citoyens ont exprimé leur intérêt pour le contenu de l’arbre d’expression, donc nous allons en parler dans cet article.

L’appel dynamique est une exigence qui est souvent rencontrée dans le développement .net, c’est-à-dire les méthodes d’appel dynamiques ou les propriétés lorsque seuls les noms de méthode ou les noms de propriété sont connus.L’une des implémentations les plus connues est l’utilisation de la « réflexion » pour atteindre une telle exigence.Bien sûr, il existe certains scénarios de haute performance qui utilisent Emit pour répondre à cette exigence.

Cet article décrit « l’utilisation d’arbres d’expression » pour mettre en œuvre ce scénario, parce que cette approche aura de meilleures performances et évolutivité que la « réflexion » et est plus facile à maîtriser que Emit.

Nous utiliserons un scénario spécifique pour implémenter des appels dynamiques étape par étape avec des expressions.

Dans ce scénario, nous allons construire un validateur de modèle, qui est très similaire au scénario d’exigences pour ModelState en mvc aspnet.

Cela****un simple article d’introduction pour les lecteurs pour la première fois, et il est recommandé que vous regardez pendant que vous êtes libre et ont un IDE à portée de main à faire par la voie.Dans le même temps, aussi ne pas avoir à se soucier des détails de l’exemple de la méthode, juste besoin de comprendre l’idée générale, peut être peint selon le style peut être, maîtriser la grande idée et puis la compréhension approfondie n’est pas trop tard.

Pour raccourcir l’espace, l’exemple de code dans l’article cachera la partie non mobile, et si vous voulez obtenir le code de test complet, ouvrez le référentiel de code à la fin de l’article pour tirer.

## Il y a toujours une vidé o

Cette série d’articles est emballée avec une vidéo de dix heures.Rappelez-vous un clic, trois entreprises! <iframe src="//player.bilibili.com/player.html?aid=797475985&bvid=BV15y4y1r7pK&cid=247120978&page=1" scrolling="no" border="0" frameBorder="no" frameSpacing="0" allowFullScreen="true" mark="crwd-mark"> </iframe>

Vidéo originale address：<https://www.bilibili.com/video/BV15y4y1r7pK>

## Pourquoi utiliser des arbres d’expression, pourquoi puis-je utiliser des arbres d’expression?

La première chose à confirmer est qu’il y a deux：

1. Est-il préférable de remplacer la réflexion par des arbres d’expression?
2. Y a-t-il une perte de performance significative à l’aide d’arbres d’expression pour les appels dynamiques ?

Il y a un problème, faites l’expérience.Nous avons utilisé deux tests unitaires pour valider ces deux questions.

Appelez la méthode d’un object：

```cs
en utilisant le système;
utilisant System.Diagnostics;
utilisant System.Linq.Expressions;
utilisant System.Reflection;
utilisant FluentAssertions;
'utilisation de NUnit.Framework;

'espace nominatif Newbe.ExpressionsTests
{
    classe publique X01CallMethodTest
    {
        const int Count privé = 1_000_000;
        const privé int Diff = 100;

        [SetUp]
        vide public Init ()
        {
            _methodInfo = type de (Claptrap). GetMethod (nom de (Claptrap.LevelUp));
            Debug.Assert (_methodInfo != null, nameof(_methodInfo) + " != null « );

            instance var = Expression.Parameter(typeof(Claptrap), « c »);
            var levelP = Expression.Parameter(typeof(int), « l »);
            var callExpression = Expression.Call (instance, _methodInfo, levelP);
            var lambdaExpression = Expression.Lambda<Action<Claptrap, int>>(callExpression, instance, levelP);
            // lambdaExpression devrait être aussi (Claptrap c,int l) =>  { c.LevelUp(l); }
            _func = lambdaExpression.Compile();
        }

        [Test]
        vide public RunReflection ()
        {
            var claptrap = nouveau Claptrap();
            pour (int i = 0; je < comte; i++)
            {
                _methodInfo.Invoke (claptrap, nouveau[] {(objet) Diff});
            }

            claptrap. Level.Should(). Be (Comte * Diff);
        }

        [Test]
        public vide RunExpression ()
        {
            var claptrap = nouveau Claptrap();
            pour (int i = 0; je < comte; i++)
            {
                _func. Invoquer (claptrap, Diff);
            }

            claptrap. Level.Should(). Be (Comte * Diff);
        }

        [Test]
        vide public Directement ()
        {
            var claptrap = nouveau Claptrap();
            pour (int i = 0; je < comte; i++)
            {
                claptrap. LevelUp (Diff);
            }

            claptrap. Level.Should(). Be (Comte * Diff);
        }

        méthode privéeInfo _methodInfo;
        d’action<Claptrap, int> _func;

        classe publique Claptrap
        {
            public int Niveau { get; ensemble; }

            public vide LevelUp (int diff)
            {
                Niveau += diff;
            }
        }
    }
}
```

Dans les tests ci-dessus, nous avons appelé un million de fois pour le troisième appel et enregistré le temps passé sur chaque test.Vous pouvez obtenir des résultats similaires à ceux following：

| Méthode                       | Heure |
| ----------------------------- | ----- |
| RunRéflexion                  | 217ms |
| RunExpression (RunExpression) | 20ms  |
| Directement                   | 19ms  |

Les conclusions suivantes peuvent être drawn：

1. La création d’un délégué avec un arbre d’expression pour les appels dynamiques peut obtenir presque la même performance que les appels directs.
2. La création d’un délégué avec un arbre d’expression prend environ un dixième du temps pour faire un appel dynamique.

Donc, si vous pensez simplement à la performance, vous devez utiliser un arbre d’expression, ou vous pouvez utiliser un arbre d’expression.

Toutefois, cela se reflète dans un million d’appels à apparaître dans le temps, car un seul appel est en fait la différence entre le niveau nanecond, en fait, l’insignifiance.

Mais en fait, les arbres d’expression ne sont pas seulement mieux dans la performance que la réflexion, leur évolutivité plus puissante utilise en fait les caractéristiques les plus importantes.

Il ya aussi un test pour fonctionner sur les propriétés, où le code de test et les résultats sont répertoriés：

```cs
en utilisant le système;
utilisant System.Diagnostics;
utilisant System.Linq.Expressions;
utilisant System.Reflection;
utilisant FluentAssertions;
'utilisation de NUnit.Framework;

'espace nominatif Newbe.ExpressionsTests
{
    classe publique X02PropertyTest
    {
        const int Count privé = 1_000_000;
        const privé int Diff = 100;

        [SetUp]
        vide public Init ()
        {
            _propertyInfo = type de (Claptrap). GetProperty (nom de (Claptrap.Level));
            Debug.Assert (_propertyInfo != null, nameof(_propertyInfo) + " != null « );

            instance var = Expression.Parameter(typeof(Claptrap), « c »);
            var levelProperty = Expression.Property (instance, _propertyInfo);
            var levelP = Expression.Parameter(typeof(int), « l »);
            var addAssignExpression = Expression.AddAssign (levelProperty, levelP);
            var lambdaExpression = Expression.Lambda<Action<Claptrap, int>>(addAssignExpression, instance, levelP);
            // lambdaExpression devrait être aussi (Claptrap c,int l) =>  { c.Level += l; }
            _func = lambdaExpression.Compile();
        }

        [Test]
        vide public RunReflection ()
        {
            var claptrap = nouveau Claptrap();
            pour (int i = 0; je < comte; i++)
            {
                valeur var = (int) _propertyInfo.GetValue (claptrap);
                _propertyInfo.SetValue (claptrap, valeur + Diff);
            }

            claptrap. Level.Should(). Be (Comte * Diff);
        }

        [Test]
        public vide RunExpression ()
        {
            var claptrap = nouveau Claptrap();
            pour (int i = 0; je < comte; i++)
            {
                _func. Invoquer (claptrap, Diff);
            }

            claptrap. Level.Should(). Be (Comte * Diff);
        }

        [Test]
        vide public Directement ()
        {
            var claptrap = nouveau Claptrap();
            pour (int i = 0; je < comte; i++)
            {
                claptrap. Niveau += Diff;
            }

            claptrap. Level.Should(). Be (Comte * Diff);
        }

        propriété privéeInfo _propertyInfo;
        d’action<Claptrap, int> _func;

        classe publique Claptrap
        {
            public int Niveau { get; ensemble; }
        }
    }
}
```

Time-consuming：

| Méthode                       | Heure       |
| ----------------------------- | ----------- |
| RunRéflexion                  | 373ms       |
| RunExpression (RunExpression) | 19ms        |
| Directement                   | 18ms (18ms) |

Parce que la réflexion est plus d’une consommation de déballage, il est plus lent que l’échantillon de test précédent, et l’utilisation des délégués n’est pas une telle consommation.

## Étape 10, démonstration des exigences

Commençons par un test pour voir quel type d’exigences nous allons créer pour le valideur modèle.

```cs
en utilisant System.ComponentModel.DataAnnotations;
utilisant FluentAssertions;
'utilisation de NUnit.Framework;

'espace nominatif Newbe.ExpressionsTests
{
    /// <summary>
    /// Valider les données par méthode statique
    /// </summary>
    classe publique X03PropertyValidationTest00
    {
        const privé int Count = 10_000;

        [Test]
        public void Run ()
        {
            pour (int i = 0; je < comte; i++)
            {
                // test 1
                {
                    entrée var = nouvelle CreateClaptrapInput();
                    var (isOk, errorMessage) = Validate (entrée);
                    isOk.Should(). BeFalse();
                    erreurMessage.Should(). Be (« nom manquant »);
                }

                // test 2
                { entrée var
                    = nouvelle
                    CreateClaptrapInput {
                        Nom = « 1 »
                    };
                    var (isOk, errorMessage) = Validate (entrée);
                    isOk.Should(). BeFalse();
                    erreurMessage.Should(). Be (« La longueur du nom doit être grande que 3 »);
                }

                // test 3
                { entrée var
                    = nouveau CreateClaptrapInput
                    {
                        Nom = « yueluo est le seul dalao »
                    };
                    var (isOk, errorMessage) = Validate (entrée);
                    isOk.Should(). BeTrue();
                    erreurMessage.Should(). BeNullOrEmpty();
                }
            }
        }

        validation statique publique ValidateResult Validate (CreateClaptrapInput input)
        {
            return ValidateCore (entrée, 3);
        }

        validation statique publique ValidateResult ValidateCore (Entrée CreateClaptrapInput, int minLength)
        {
            si (chaîne. IsNullOrEmpty(entrée. Nom))
            {
                retour ValidateResult.Error (« nom manquant »);
            }

            si (entrée. Name.Length < minLength)
            {
                retour ValidateResult.Error ($"Longueur de nom devrait être grande que {minLength}« );
            }

            retour ValidateResult.Ok ();
        }

        classe publique CreateClaptrapInput
        {
            [Required] [MinLength(3)] nom de chaîne publique { get; ensemble; }
        }

        struct public ValidateResult
        {
            bool public IsOk { get; ensemble; }
            chaîne publique ErrorMessage { get; ensemble; }

            public vide Deconstruct (out bool isOk, out string errorMessage)
            {
                isOk = IsOk;
                erreurMessage = ErrorMessage;
            }

            validation statique publique ValidateResult Ok ()
            {
                retour nouveau ValidateResult
                {
                    IsOk = true
                };
            }

            validation statique publique Erreurresult (erreur de chaîneMessage)
            { retour
                nouveau ValidateResult
                {
                    IsOk = faux,
                    ErrorMessage = errorMessage
                };
            }
        }
    }
}
```

De haut en bas, les principaux points du code ci-dessus：

1. La méthode de test principale contient trois cas de test de base, dont chacun sera exécuté 10 000 fois.Toutes les étapes ultérieures utiliseront de tels cas de test.
2. La méthode Validate est la méthode wrapper testée, et la mise en œuvre de la méthode est ensuite appelée pour vérifier l’effet.
3. ValidityCore est une implémentation de démonstration de validateurs de modèles.Comme vous pouvez le voir sur le code, la méthode valide l’objet CreateClaptrapInput et obtient les résultats.Mais les inconvénients de cette méthode sont également très évidents, qui est un typique « écrire mort ».Nous ferons le suivi d’une série de rénovations.Rendez notre Model Validator plus polyvalent et, surtout, aussi efficace que cette approche « écrire mort » !
4. ValidateResult est le résultat de la sortie validateur.Le résultat sera répété encore et encore.

## La première étape consiste à appeler la méthode statique

Tout d’abord, nous construisons le premier arbre d’expression, qui utilisera validateCore directement en utilisant la méthode statique dans la dernière section.

```cs
en utilisant le système;
utilisant System.ComponentModel.DataAnnotations;
utilisant System.Diagnostics;
utilisant System.Linq.Expressions;
utilisant FluentAssertions;
'utilisation de NUnit.Framework;

'espace nominatif Newbe.ExpressionsTests
{
    /// <summary>
    /// Validation de la date par func créé avec Expression
    /// </summary>
    classe publique X03PropertyValidationTest01
    {
        const privé int Count = 10_000;

        func statique privé<CreateClaptrapInput, int, ValidateResult> _func;

        [SetUp]
        vide public Init ()
        {
            essayez
            {
                méthode var = type de (X03PropertyValidationTest01). GetMethod (nom de (ValidateCore));
                Debug.Assert (méthode != null, nameof(method) + " != null « );
                var pExp = Expression.Parameter(typeof(CreateClaptrapInput));
                var minLengthPExp = Expression.Parameter(typeof(int));
                corps var = Expression.Call (méthode, pExp, minLengthPExp);
                expression var = Expression.Lambda<Func<CreateClaptrapInput, int, ValidateResult>>(corps,
                    pExp,
                    minLengthPExp);
                _func = expression.Compile();
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                lancer;
            }
        }

        [Test]
        public void Run ()
        {
           // voir le code dans la démo repo
        }

        validation statique publique validate (entrée CreateClaptrapInput)
        {
            retour _func. Invoquer (entrée, 3);
        }

        validation statique publique ValidateResult ValidateCore (entrée CreateClaptrapInput, int minLength)
        {
            si (chaîne. IsNullOrEmpty(entrée. Nom))
            {
                retour ValidateResult.Error (« nom manquant »);
            }

            si (entrée. Name.Length < minLength)
            {
                retour ValidateResult.Error ($"Longueur de nom devrait être grande que {minLength}« );
            }

            retour ValidateResult.Ok ();
        }
    }
}
```

De haut en bas, les principaux points du code ci-dessus：

1. Une méthode d’initialisation pour les tests unitaires a été ajoutée, et un arbre d’expression créé au début du test unitaire le compile en tant que délégué pour enregistrer dans le champ statique _func.
2. Le code de la méthode de test principale Exécuter est omis afin que le lecteur puisse lire moins d’espace.Le code réel n’a pas changé et la description ne sera pas répétée à l’avenir.Vous pouvez le visualiser dans le référentiel de démonstration de code.
3. La mise en œuvre de la méthode Validate a été modifiée afin que validateCore ne soit plus appelé directement, _func à valider.
4. En exécutant le test, les développeurs peuvent voir qu’il faut presque autant de temps que le prochain appel direct, sans consommation supplémentaire.
5. Cela fournit la façon la plus simple d’utiliser des expressions pour les appels dynamiques, si vous pouvez écrire une méthode statique (par exemple, ValidateCore) pour représenter la procédure pour les appels dynamiques.Utilisons donc un processus de construction similaire à celui d’Init pour créer des expressions et des délégués.
6. Les développeurs peuvent essayer d’ajouter un troisième nom de paramètre à ValidateCore afin qu’ils puissent coudre dans le message d’erreur pour comprendre si vous construisez une expression aussi simple.

## La deuxième étape consiste à combiner les expressions

Bien que dans l’étape précédente, nous allons convertir l’appel dynamique directement, mais parce que ValidateCore est toujours mort, il doit être modifié.

Dans cette étape, nous allons diviser les trois chemins de retour écrits morts dans ValidateCore en différentes méthodes, puis les coudre avec des expressions.

Si nous le faisons, alors nous sommes dans un bon endroit pour coudre plus de méthodes ensemble pour atteindre un degré d’expansion.

Note：le code de démonstration sera instantanément long et n’a pas à ressentir trop de pression, qui peut être consulté avec une description de point de code de suivi.

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

1. La méthode ValidateCore est divisée en méthodes validateNameRequired et ValidateNameMinLength pour valider respectivement name’s Required et MinLength.
2. La fonction locale est utilisée dans la méthode Init pour obtenir l’effet de la méthode « utiliser d’abord, définir plus tard ».Les lecteurs peuvent lire de haut en bas et apprendre la logique de toute l’approche par le haut.
3. La logique de l’Init dans son ensemble est de remonter ValidateNameRequired et ValidateNameMinLength à travers des expressions dans un `de<CreateClaptrapInput, int, ValidateResult>`.
4. Expression.Parameter est utilisé pour indiquer la partie paramètre de l’expression déléguée.
5. Expression.Variable est utilisé pour indiquer une variable, qui est une variable normale.Semblable à la`var un`.
6. Expression.Label est utilisé pour indiquer un emplacement spécifique.Dans cet exemple, il est principalement utilisé pour positionner l’instruction de retour.Les développeurs familiers avec la syntaxe goto savent que goto doit utiliser des étiquettes pour marquer où ils veulent goto.En fait, le retour est un type spécial de goto.Donc, si vous souhaitez revenir dans plus d’un bloc d’instructions, vous devez également le marquer avant de pouvoir revenir.
7. Expression.Block peut regrouper plusieurs expressions ensemble dans l’ordre.Il peut être compris comme l’écriture de code séquentiellement.Ici, nous combinons CreateDefaultResult, CreateValidateNameRequired Expression, CreateValidateNameMinLengthExpression, et les expressions label.L’effet est similaire à la couture du code ensemble séquentiellement.
8. CreateValidateNameRequiredExpression et CreateValidateNameMinLengthExpression ont des structures très similaires parce que les expressions résultantes que vous souhaitez générer sont très similaires.
9. Ne vous inquiétez pas trop sur les détails dans CreateValidateNameRequired Expression et CreateValidateNameMinLengthExpression.Vous pouvez essayer d’en savoir plus sur cette méthode après avoir lu Expression.XXX échantillon.
10. Avec cette modification, nous avons implémenté l’extension.Supposons que vous devez maintenant ajouter une validation MaxLength au nom qui ne dépasse pas 16.Il suffit d’ajouter une méthode statique de ValidateNameMaxLength, ajouter une méthode CreateValidateNameMaxLengthExpression, et l’ajouter à Bloc.Les lecteurs peuvent essayer de faire une vague pour atteindre cet effet.

## La troisième étape consiste à lire les propriétés

Rénovons validateNameRequired et ValidateNameMinLength.Puisque les deux méthodes reçoivent maintenant CreateClaptrapInput comme argument, la logique interne est également écrite pour valider le nom, ce qui n’est pas très bon.

Nous allons moderniser les deux méthodes afin que le nom de la chaîne soit transmis pour représenter le nom de propriété vérifié, et la valeur de la chaîne représente la valeur de propriété vérifiée.De cette façon, nous pouvons utiliser ces deux méthodes de validation pour plus de propriétés qui ne sont pas limitées au nom.

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

1. Comme mentionné précédemment, nous avons modifié ValidateNameRequired et l’avons rebaptisé ValidateStringRequired. ValidateNameMinLength -> ValidateStringMinLength
2. CreateValidateNameRequired Expression et CreateValidateNameMinLengthExpression ont été modifiés parce que les paramètres de la méthode statique ont changé.
3. Avec cette modification, nous pouvons utiliser deux méthodes statiques pour plus de validation des attributs.Les lecteurs peuvent essayer d’ajouter une propriété NickName.et effectuer la même validation.

## La quatrième étape consiste à prendre en charge plusieurs validations de propriétés

Ensuite, nous vérifierons toutes les propriétés des cordes de CreateClaptrapInput.

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

1. Une propriété, NickName, a été ajoutée à CreateClaptrapInput, et le cas de test validera la propriété.
2. Par`Liste<Expression>`avons ajouté des expressions générées plus dynamiquement à bloquer.Par conséquent, nous pouvons générer des expressions de validation pour Name et NickName.

## La cinquième étape consiste à vérifier le contenu par le biais de la décision Attribut

Bien que nous ayons pris en charge la validation d’un certain nombre de propriétés en premier lieu, les paramètres de validation et de validation sont toujours écrits morts (par exemple, la durée de：MinLength).

Dans cette section, nous utiliserons Attribut pour déterminer les détails de la validation.Par exemple, être marqué Requis est une propriété pour validation requise.

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

1. Lors de la création`liste<Expression>`une expression spécifique est faite en décidant d’inclure ou non une expression spécifique sur l’attribut sur la propriété.

## Dans la sixième étape, remplacer la méthode statique par une expression

L’intérieur des deux méthodes statiques, ValidateStringRequired et ValidateStringMinLength, ne contient en fait qu’une seule expression trilatérale de jugement, et en C# vous pouvez assigner une expression à la méthode Lambda.

Par conséquent, nous pouvons modifier validateStringRequired et ValidateStringMinLength directement aux expressions, de sorte que nous n’avons pas besoin de réflexion pour obtenir des méthodes statiques pour construire des expressions.

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

1. Remplacez la méthode statique par une expression.Ainsi, l’emplacement de createXXExpression a été modifié, et le code est plus court.

## Septième étape, Curry

La chimie de coli, également connue sous le nom de science fonctionnelle et de physication, est une méthode dans la programmation fonctionnelle.Simple peut être exprimé comme：en fixant un ou plusieurs arguments d’une fonction multi-argument, résultant en une fonction avec moins d’arguments.Une certaine terminologie peut également être exprimée comme un moyen de convertir une fonction d’ordre supérieur (l’ordre d’une fonction est en fait le nombre d’arguments) en une fonction de faible ordre.

Par exemple, il y a maintenant une fonction ajouter (int, int) qui implémente la fonction d’ajout de deux nombres.Si nous épinglons le premier argument dans l’ensemble à 5, nous obtenons une fonction ajouter (5,int) qui implémente la fonction de plus un nombre plus 5.

À quoi bon?

La fonction descendante peut rendre les fonctions cohérentes, et une fois que les fonctions cohérentes ont été obtenues, une certaine unification du code peut être faite pour l’optimisation.Par exemple, les deux expressions utilisées ci-dessus：

1. `Expression<Func<string, string, ValidateResult>> ValidateStringRequiredExp`
2. `Expression<Func<string, string, int, ValidateResult>> ValidateStringMinLengthExp`

La différence entre la deuxième expression et la première expression dans les deux expressions n’est que sur le troisième argument.Si nous épinglons le troisième paramètre int avec Corredic, nous pouvons faire les signatures des deux expressions exactement la même chose.Ceci est très similaire à l’abstraction dans l’objet orienté.

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

1. CreateValidateStringMinLengthExp méthode statique, passer dans un argument pour créer une expression qui est la même que la valeur retournée par CreateValidateStringRequiredExp.Par rapport au ValidateStringMinLengthExp dans la dernière section, le fonctionnement de la fixation du paramètre int pour obtenir une nouvelle expression est implémenté.C’est l’incarnation d’un corrédique.
2. Pour unifier les méthodes statiques, nous avons modifié le ValidateStringRequiredExp dans la dernière section pour créervalidateStringRequiredExp méthodes statiques, juste pour regarder cohérente (mais effectivement ajouter un peu de frais généraux parce qu’il n’est pas nécessaire de créer une expression inchangée à plusieurs reprises).
3. Ajustez le code pour l' `'<Expression>` le code de liste en conséquence.

## Étape 8, fusionner le code en double

Dans cette section, nous combinerons le code en double de CreateValidateStrationRequired Expression et CreateValidateStringMinLengthExpression.

Seul RequiredMethodExp est créé différemment.Par conséquent, vous pouvez sortir de la partie commune en passant simplement ce paramètre de l’extérieur de la méthode.

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

1. CreateValidate Expression est un moyen commun de se faire sortir.
2. Sans l’étape précédente, le deuxième paramètre de CreateValidate Expression, validateFuncExpression, serait difficile à déterminer.
3. CreateValidateStringRequired Expression et CreateValidateStringMinLengthExpression appelée CreateValidate Expression en interne, mais fixe plusieurs paramètres.Cela peut également être considéré comme un corrédique, parce que la valeur de retour est que l’expression peut effectivement être considérée comme une fonction de la forme, bien sûr, compris que la surcharge n’est pas un problème, ne doivent pas être trop emmêlés.

## Étape 9 pour prendre en charge plus de modèles

Jusqu’à présent, nous avons un validateur qui prend en charge la vérification de plusieurs champs de cordes dans CreateClaptrapInput.Et même si vous voulez étendre plus de types, ce n’est pas trop difficile, il suffit d’ajouter une expression.

Dans cette section, nous abstract CreateClaptrapInput dans un type plus abstrait, après tout, aucun validateur de modèle n’est dédié à la validation d’une seule classe.

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

1. Remplacez `Func<CreateClaptrapInput, ValidateResult>` par `Func<object, ValidateResult>`, et remplacez le type mort (CreateClaptrapInput) par le type.
2. Enregistrez le validateur du type correspondant dans ValidatedFunc après sa création.Cela ne nécessite pas de reconstruire l’ensemble func à chaque fois.

## Étape 10, ajouter quelques détails

Enfin, nous sommes dans l’agréable « ajouter quelques détails » pour phase：interfaces abstraites et les implémentations aux caractéristiques de l’entreprise.Nous avons donc obtenu la version finale de cet exemple.

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

1. L’usine de valideurs de modèles IValidatorFactory, qui représente la création d’un type spécifique de délégué validateur
2. L’expression de validation pour les propriétés spécifiques d’IPropertyValidatorFactory crée une usine qui peut annexer une nouvelle implémentation à mesure que les règles augmentent.
3. Utilisez Autofac pour la gestion du module.

## Pratique avec la salle

Ne partez pas !Tu as toujours du travail.

Voici une exigence de noter par difficulté que les développeurs peuvent essayer d’accomplir pour mieux comprendre et utiliser le code dans cet exemple.

### Ajouter une règle qui valide la longueur maximale de la chaîne

Difficulté：D

Ideas：

Semblable à la longueur min, n’oubliez pas de vous inscrire.

### Ajouter une règle qui vérifie que l’int doit être supérieur ou égal à 0

Difficulté：D

Ideas：

Il suffit d’ajouter un nouveau type de propriété et n’oubliez pas de vous inscrire.

### Ajouter une règle`'objet<T>`iEnumérable doit contenir au moins un élément

Difficulté：C

Ideas：

Vous pouvez vérifier cela en utilisant n’importe quelle méthode dans Linq

### Ajout d`un<T>`IEnumerable déjà ToList ou ToArray, analogie avec la règle en mvc

Difficulté：C

Ideas：

En fait, il suffit de vérifier que c’est déjà ICollection.

### La prise en charge des objets vides permet également de valider les résultats

Difficulté：C

Ideas：

Si l’entrée est vide.vous devriez également être en mesure de donner la première règle qui ne répond pas aux critères.Par exemple, nom requis.

### Ajouter une int validation? Il doit y avoir une règle de valeur

Difficulté：B

Ideas：

Int? C’est en fait du sucre syntaxe, `type est<int>`.

### L’ajout d’une validation énumérée doit être conforme à une plage donnée

Difficulté：B

Ideas：

Les énumérations peuvent être attribuées à n’importe quelle gamme de valeurs, par exemple, enum TestEnum s None s 0; Toutefois, forcer un 233 à donner une telle propriété ne fait pas état d’une erreur.Cette validation nécessite la validation que la valeur de la propriété ne peut être définie.

Vous pouvez également rendre les choses plus difficiles, par exemple en soutenant la validation de la gamme de valeurs mixtesumées sous forme de drapeaux.

### L’ajout d’une propriété de validation int A doit être grand et la propriété int B

Difficulté：A

Ideas：

Deux propriétés sont nécessaires pour participer.Ne vous souciez jamais, écrivez d’abord une fonction statique pour comparer la taille des deux valeurs.Ensuite, réfléchissez à la façon d’expressionner, comment corrification.Vous pouvez vous référer aux idées précédentes.

Conditions de qualification supplémentaires, ne peut pas modifier la définition actuelle de l’interface.

### Ajout d’une chaîne de validation Une propriété doit être égale à la propriété de la chaîne B, ignorant le cas

Difficulté：A

Ideas：

Semblable à la précédente.Toutefois, les comparaisons de cordes sont plus spéciales qu’int et le cas doit être ignoré.

### Prend en charge le retour de tous les résultats de validation

Difficulté：S

Ideas：

Ajustez les résultats de validation pour retourner une valeur, du retour de la première règle non satisfaite au retour de toutes les règles non satisfaites, analogie avec l’effet de l’état du modèle mvc.

Les expressions qui doivent modifier les résultats combinés peuvent être créées de deux façons, l’une est de créer la Liste en interne, puis de mettre les résultats, et le plus simple est de revenir en utilisant la méthode de rendement.

Il est important de noter que puisque toutes les règles sont en vigueur, certains jugements exigent des jugements défensifs.Par exemple, lorsque vous jugez la longueur des cordes, vous devez d’abord déterminer si elle est vide.Quant à savoir si la chaîne vide est une exigence de longueur minimale, les développeurs sont libres de décider, pas le point.

### Prend en charge la validation récursive des objets

Difficulté：SS

Ideas：

C’est-à-dire que si un objet contient une propriété et un objet, l’objet enfant doit également être validé.

Il y a deux ideas：

La première est de modifier ValidatorFactory pour prendre en charge l’obtention du validateur de ValideFunc dans le cadre de l’expression.Le principal problème que cette idée doit résoudre est que le validateur du sous-modèle peut ne pas exister dans la collection ValidityFunc à l’avance.Vous pouvez utiliser Lazy pour résoudre ce problème.

La seconde est de créer une implémentation IPropertyValidatorFactory qui lui permet d’obtenir ValidateFunc de ValidatorFactory pour valider le sous-modèle.Le principal problème avec cette idée est qu’une mise en œuvre directe peut produire des dépendances circulaires.ValidateFunc peut être enregistré et généré divisé en deux interfaces pour soulager cette dépendance circulaire.Le schéma est plus simple.

En outre, la difficulté de se qualifier est SSS, `tous les éléments<>` le système IEnumerable.Les développeurs peuvent essayer.

### Les API enchaînées sont prises en charge

Difficulté：SSS

Ideas：

Comme les API d’attribut et de chaîne dans EnterpriseFramework, ajoutez les caractéristiques de validation du réglage de la chaîne.

Cela nécessite l’ajout d’une nouvelle interface pour l’enregistrement de la chaîne, et la méthode qui utilisait à l’origine Attribut pour générer des expressions directement doit également être ajustée pour attribuer -> données d’enregistrement -> générer des expressions.

### Implémenter un modificateur de propriété

Difficulté：SSS

Ideas：

Implémentez une règle selon que le numéro de téléphone est crypté lorsque la propriété d’un objet est une chaîne qui rencontre une longueur de 11 et commence par 1.Tous les personnages sauf les trois premiers et les quatre derniers sont remplacés par``.

Il est recommandé d’implémenter le modificateur de propriété à partir de zéro, sans apporter de modifications au code ci-dessus.Parce que la validation et le remplacement sont généralement deux entreprises différentes, l’une pour l’entrée et l’autre pour la sortie.

Voici quelques informations requirements：

1. Une fois le remplacement terminé, les conditions avant et après de toutes les valeurs qui ont été remplacées sont la sortie dans le journal.
2. Notez que le test doit fonctionner ainsi que les méthodes d’appel directement, sinon il doit y avoir un problème avec la mise en œuvre du code.

## Cet article résume

Dans .net, les arbres d’expression peuvent être utilisés dans deux scénarios principaux.L’un est utilisé pour parse les résultats, généralement EnterpriseFramework, et l’autre est utilisé pour construire des délégués.

Cet article met en œuvre les exigences d’un validateur modèle en construisant des délégués.La production peut également être utilisée dans de nombreux appels dynamiques dans la pratique.

Maîtriser l’arbre d’expression vous donne un moyen de faire des appels dynamiques au lieu de la réflexion, qui est non seulement plus évolutive, mais fonctionne également bien.

Le code d’exemple de cet article se trouve dans le référentiel de lien below：

- <https://github.com/newbe36524/Newbe.Demo>
- <https://gitee.com/yks/Newbe.Demo>

<!-- md Footer-Newbe-Claptrap.md -->
