---
date: 2020-10-13
title: En solo diez pasos, puede aplicar un árbol de expresión para optimizar las llamadas dinámicas
---

Los árboles de expresión son una serie de tipos muy útiles en .net.El uso de árboles de expresión en algunos escenarios puede dar lugar a un mejor rendimiento y una mejor escalabilidad.En este artículo, comprenderemos y aplicaremos las ventajas de los árboles de expresión en la creación de llamadas dinámicas mediante la creación de un "validador de modelos".

<!-- more -->

## Un resumen de apertura

No hace mucho tiempo, lanzamos[Cómo usar dotTrace para diagnosticar problemas de rendimiento con aplicaciones netcore](005-How-to-Use-DotTrace), y después de un voto de netizen, los usuarios de netizens expresaron interés en el contenido del árbol de expresión, por lo que hablaremos de ello en este artículo.

La llamada dinámica es un requisito que a menudo se encuentra en el desarrollo de .net, es decir, métodos de llamada dinámicos o propiedades cuando solo se conocen nombres de método o nombres de propiedad.Una de las implementaciones más conocidas es el uso de la "reflexión" para lograr tal requisito.Por supuesto, hay algunos escenarios de alto rendimiento que usan Emit para cumplir este requisito.

En este artículo se describe "usar árboles de expresión" para implementar este escenario, porque este enfoque tendrá mejor rendimiento y escalabilidad que la "reflexión" y es más fácil de dominar que Emit.

Usaremos un escenario específico para implementar llamadas dinámicas paso a paso con expresiones.

En este escenario, crearemos un validador de modelo, que es muy similar al escenario de requisitos para ModelState en aspnet mvc.

Este****un artículo introductorio simple para los lectores por primera vez, y se recomienda que veas mientras eres libre y tengas un IDE a mano para hacerlo por cierto.Al mismo tiempo, también no tienen que preocuparse por los detalles del ejemplo del método, sólo tiene que entender la idea general, se puede pintar de acuerdo con el estilo puede ser, dominar la gran idea y luego la comprensión en profundidad no es demasiado tarde.

Para acortar el espacio, el código de ejemplo del artículo ocultará la parte no eliminada y, si desea obtener el código de prueba completo, abra el repositorio de código al final del artículo que se va a extraer.

## Todavía hay un video

Esta serie de artículos está empaquetada con un video de diez horas de duración.Recuerde un clic, tres empresas! <iframe src="//player.bilibili.com/player.html?aid=797475985&bvid=BV15y4y1r7pK&cid=247120978&page=1" scrolling="no" border="0" frameBorder="no" frameSpacing="0" allowFullScreen="true" mark="crwd-mark"> </iframe>

Address：<https://www.bilibili.com/video/BV15y4y1r7pK>de vídeo original

## ¿Por qué utilizar árboles de expresión, por qué puedo usar árboles de expresión?

Lo primero que hay que confirmar es que hay dos：

1. ¿Es mejor reemplazar la reflexión por árboles de expresión?
2. ¿Hay una pérdida de rendimiento significativa mediante árboles de expresión para llamadas dinámicas?

Hay un problema, haz el experimento.Usamos dos pruebas unitarias para validar ambos problemas.

Llame al método de un object：

```cs
utilizando el sistema;
mediante System.Diagnostics;
mediante System.Linq.Expressions;
utilizando System.Reflection;
uso de FluentAssertions;
mediante NUnit.Framework;

espacio de nombres Newbe.ExpressionsTests

    clase pública X01CallMethodTest
    á
        const privado int count á 1_000_000;
        const privado int Diff a 100;

        [SetUp]
        público void Init()
        á
            _methodInfo - typeof(Claptrap). GetMethod(nameof(Claptrap.LevelUp));
            Debug.Assert(_methodInfo !- null, nameof(_methodInfo) + " !- null");

            var instance - Expression.Parameter(typeof(Claptrap), "c");
            var levelP á Expression.Parameter(typeof(int), "l");
            var callExpression - Expression.Call(instance, _methodInfo, levelP);
            var lambdaExpression - Expression.Lambda<Action<Claptrap, int>>(callExpression, instance, levelP);
            // lambdaExpression debe ser como (Claptrap c,int l) ->  á c.LevelUp(l); •
            _func de lambdaExpression.Compile();
        á

        [Test]
        public void RunReflection()
        ?
            var claptrap ? new Claptrap();
            para (int i á 0; i < Conde; i++)
            de
                _methodInfo.Invoke(claptrap, new[] á(object) Diff);
            de

            aplauso. Level.Should(). Be(Count * Diff);
        á

        [Test]
        public void RunExpression()
        á
            var claptrap - new Claptrap();
            para (int i á 0; i < Conde; i++)

                _func. Invoke(claptrap, Diff);
            de

            aplauso. Level.Should(). Be(Count * Diff);
        á

        [Test]
        public void Directly()
        ?
            var claptrap ? new Claptrap();
            para (int i á 0; i < Conde; i++)
            á
                aplauso. LevelUp(Diff);
            de

            aplauso. Level.Should(). Be(Count * Diff);
        :

        _methodInfo privado MethodInfo;
<Claptrap, int> _func de Acción privada;

        clase pública Claptrap
        -
            public int Level - get; set; •

            público void LevelUp(int diff)
            -
                Nivel + ? diff;



?
```

En las pruebas anteriores, llamamos un millón de veces para la tercera llamada y registramos el tiempo invertido en cada prueba.Puede obtener resultados similares a los following：

| Método        | Hora  |
| ------------- | ----- |
| RunReflection | 217ms |
| RunExpression | 20ms  |
| Directamente  | 19ms  |

Las siguientes conclusiones pueden ser drawn：

1. La creación de un delegado con un árbol de expresiones para llamadas dinámicas puede obtener casi el mismo rendimiento que las llamadas directas.
2. La creación de un delegado con un árbol de expresiones tarda aproximadamente una décima parte del tiempo en realizar una llamada dinámica.

Por lo tanto, si solo está pensando en el rendimiento, debe usar un árbol de expresión o puede usar un árbol de expresión.

Sin embargo, esto se refleja en un millón de llamadas para aparecer en el tiempo, ya que una sola llamada es en realidad la diferencia entre el nivel nanecond, de hecho, insignificancia.

Pero, de hecho, los árboles de expresión no solo son mejores en rendimiento que en reflexión, sino que su escalabilidad más potente en realidad utiliza las características más importantes.

También hay una prueba para operar en las propiedades, donde el código de prueba y los resultados se enumeran：

```cs
utilizando el sistema;
mediante System.Diagnostics;
mediante System.Linq.Expressions;
utilizando System.Reflection;
uso de FluentAssertions;
mediante NUnit.Framework;

espacio de nombres Newbe.ExpressionsTests

    clase pública X02PropertyTest
    ?
        private const int Count á 1_000_000;
        const privado int Diff a 100;

        [SetUp]
        público void Init()
        á
            _propertyInfo - typeof(Claptrap). GetProperty(nameof(Claptrap.Level));
            Debug.Assert(_propertyInfo !- null, nameof(_propertyInfo) + " !- null");

            var instance - Expression.Parameter(typeof(Claptrap), "c");
            var levelProperty á Expression.Property(instance, _propertyInfo);
            var levelP á Expression.Parameter(typeof(int), "l");
            var addAssignExpression á Expression.AddAssign(levelProperty, levelP);
            var lambdaExpression - Expression.Lambda<Action<Claptrap, int>>(addAssignExpression, instance, levelP);
            // lambdaExpression debe ser como (Claptrap c,int l) ->  á c.Nivel + l; •
            _func lambdaExpression.Compile();
        á

        [Test]
        público void RunReflection()
        á
            var claptrap - new Claptrap();
            para (int i á 0; i < Conde; i++)
            á
                valor var (int) _propertyInfo.GetValue(claptrap);
                _propertyInfo.SetValue(claptrap, value + Diff);
            de

            aplauso. Level.Should(). Be(Count * Diff);
        á

        [Test]
        public void RunExpression()
        ? á
            var claptrap - new Claptrap();
            para (int i á 0; i < Conde; i++)

                _func. Invoke(claptrap, Diff);
            el aplauso

            . Level.Should(). Be(Count * Diff);
        á

        [Test]
        public void Directly()
        ?
            var claptrap ? new Claptrap();
            para (int i á 0; i < Conde; i++)
            á
                aplauso. Nivel + .
            de

            aplauso. Level.Should(). Be(Count * Diff);
        :

        _propertyInfo privada PropertyInfo;
<Claptrap, int> _func de Acción privada;

        clase pública Claptrap
        -
            public int Level - get; set; •


?
```

Consuming：de tiempo

| Método        | Hora  |
| ------------- | ----- |
| RunReflection | 373ms |
| RunExpression | 19ms  |
| Directamente  | 18ms  |

Dado que la reflexión es más de un consumo de unboxing, es más lenta que la muestra de prueba anterior y el uso de delegados no es un consumo de este tipo.

## Paso 10, demostración de requisitos

Comencemos con una prueba para ver qué tipo de requisitos vamos a crear para el validador de modelos.

```cs
uso de System.ComponentModel.DataAnnotations;
uso de FluentAssertions;
mediante NUnit.Framework;

espacio de nombres Newbe.ExpressionsTests

    /// <summary>
    /// Validar datos por método estático
    /// </summary>
    clase pública X03PropertyValidationTest00
    -
        private const int Count á 10_000;

        [Test]
        public void Run()
        á
            for (int i á 0; i < Conde; i++)
            á
                // test 1
                -
                    entrada var - new CreateClaptrapInput();
                    var (isOk, errorMessage) - Validate(input);
                    isOk.Should(). BeFalse();
                    errorMessage.Should(). Be("nombre perdido");
                de

                // prueba 2
                de la
                    de la entrada var - nueva
                    CreateClaptrapInput - nombre de
                        a "1"
                    ;
                    var (isOk, errorMessage) - Validate(input);
                    isOk.Should(). BeFalse();
                    errorMessage.Should(). Be("La longitud del nombre debe ser genial que 3");
                de

                // prueba 3
                -
                    entrada var - nueva
                    CreateClaptrapInput - nombre
                        " yueluo es el único dalao"
                    ;
                    var (isOk, errorMessage) - Validate(input);
                    isOk.Should(). BeTrue();
                    errorMessage.Should(). BeNullOrEmpty();
                de
            de


        validación de ValidateResult Validate(entrada CreateClaptrapInput) estática pública

            devolver ValidateCore(input, 3);
        :

        static pública ValidateResult ValidateCore(CreateClaptrapInput input, int minLength)
        á
            if (string. IsNullOrEmpty(entrada. Name))
            de
                devolver ValidateResult.Error("Nombre faltante");
            -

            si (entrada. Name.Length < minLength)
            -
                devolver ValidateResult.Error($"Length of Name debe ser genial que {minLength}");
            :

            devuelve ValidateResult.Ok();
        :

        clase pública CreateClaptrapInput

            [Required] [MinLength(3)] nombre de cadena pública ; set; •
        -

        estructura pública ValidateResult
        -
            bool público IsOk - get; set; •
            cadena pública ErrorMessage á get; set; •

            public void Deconstruct(out bool isOk, out string errorMessage)
            á
                isOk á IsOk;
                errorMessage - ErrorMessage;
            de


            de validación pública ValidateResult Ok()
                devolver un nuevo
                ValidateResult de
                    de  isok a true
                ;
            :

            static pública ValidateResult Error(string errorMessage)
            ?
                devolver new ValidateResult
                ? ?
                    IsOk - false,
                    ErrorMessage ? errorMessage
                ;



?
```

De arriba hacia abajo, los puntos principales del código anterior：

1. El método de prueba principal contiene tres casos de prueba básicos, cada uno de los cuales se ejecutará 10.000 veces.Todos los pasos posteriores utilizarán estos casos de prueba.
2. El Validate método es el método contenedor que se está probando y la implementación del método se llama posteriormente para comprobar el efecto.
3. ValidityCore es una implementación de demostración de validadores de modelos.Como puede ver en el código, el método valida el objeto CreateClaptrapInput y obtiene los resultados.Pero las desventajas de este método también son muy obvias, que es un típico "escribir muerto".Seguiremos a través de una serie de renovaciones.¡Haga que nuestro validador de modelos sea más versátil y, lo que es más importante, tan eficiente como este enfoque de "escribir muertos"!
4. ValidateResult es el resultado de la salida del validador.El resultado se repetirá una y otra vez.

## El primer paso es llamar al método estático

En primer lugar, creamos el primer árbol de expresiones, que usará validateCore directamente mediante el método estático de la última sección.

```cs
utilizando el sistema;
mediante System.ComponentModel.DataAnnotations;
mediante System.Diagnostics;
mediante System.Linq.Expressions;
uso de FluentAssertions;
mediante NUnit.Framework;

espacio de nombres Newbe.ExpressionsTests
á
    /// <summary>
    /// Validar fecha por func creada con Expression
    /// </summary>
    clase pública X03PropertyValidationTest01

        private const int count á 10_000;

<CreateClaptrapInput, int, ValidateResult> _func privado estático Func;

        [SetUp]
        público void Init()
        ?
            probar
            ?
                var method ? typeof(X03PropertyValidationTest01). GetMethod(nameof(ValidateCore));
                Debug.Assert(method !- null, nameof(method) + " !- null");
                var pExp á Expression.Parameter(typeof(CreateClaptrapInput));
                var minLengthPExp á Expression.Parameter(typeof(int));
                var body á Expression.Call(method, pExp, minLengthPExp);
                expression - Expression.Lambda<Func<CreateClaptrapInput, int, ValidateResult>>(body,
                    pExp,
                    minLengthPExp);
                _func - expression.Compile();
            de

            catch (Exception e)  -
                Console.WriteLine(e);
                lanzar;
            de


        [Test]

        public void Run() á
           // ver código en el repositorio de demostración


        la entrada pública de ValidateResult Validate(CreateClaptrapInput)

            devuelve _func. Invoke(input, 3);
        :

        static pública ValidateResult ValidateCore(CreateClaptrapInput input, int minLength)
        á
            if (string. IsNullOrEmpty(entrada. Name))
            de
                devolver ValidateResult.Error("Nombre faltante");


            si (entrada. Name.Length < minLength)
            -
                devolver ValidateResult.Error($"Length of Name debe ser genial que {minLength}");
            :

            devolver ValidateResult.Ok();


?
```

De arriba hacia abajo, los puntos principales del código anterior：

1. Se ha agregado un método de inicialización para las pruebas unitarias y un árbol de expresiones creado al principio de la prueba unitaria lo compila como delegado para guardarlo en el campo estático _func.
2. El código del método de prueba principal Run se omite para que el lector pueda leer menos espacio.El código real no ha cambiado y la descripción no se repetirá en el futuro.Puede verlo en el repositorio de demostración de código.
3. La implementación de la Validate método se ha modificado para que validateCore ya no se llama directamente, _func para validar.
4. Al ejecutar la prueba, los desarrolladores pueden ver que toma casi tanto tiempo como la siguiente llamada directa, sin consumo adicional.
5. Esto proporciona la forma más sencilla de usar expresiones para llamadas dinámicas, si puede escribir un método estático (por ejemplo, ValidateCore) para representar el procedimiento para las llamadas dinámicas.Así que vamos a usar un proceso de compilación similar al de Init para crear expresiones y delegados.
6. Los desarrolladores pueden intentar agregar un tercer nombre de parámetro a ValidateCore para que puedan coser el mensaje de error para comprender si crea una expresión tan simple.

## El segundo paso es combinar expresiones

Aunque en el paso anterior, convertiremos la llamada dinámica directamente, pero como ValidateCore sigue muerto, debe modificarse más.

En este paso, dividiremos las tres rutas de acceso de retorno escritas muertas en ValidateCore en diferentes métodos y, a continuación, las undemos junto con expresiones.

Si lo hacemos, entonces estamos en un buen lugar para unir más métodos para lograr un grado de expansión.

Note：el código de demostración será instantáneamente largo y no tiene que sentir demasiada presión, que se puede ver con una descripción de punto de código de seguimiento.

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

Código Esenciales：

1. El ValidateCore método se divide en validateNameRequired y ValidateNameMinLength métodos para validar Name Required y MinLength, respectivamente.
2. La función Local se utiliza en el método Init para lograr el efecto del método "use first, define later".Los lectores pueden leer de arriba hacia abajo y aprender la lógica de todo el enfoque desde la parte superior.
3. La lógica de Init como un todo es volver a ensamblar ValidateNameRequired y ValidateNameMinLength a través de expresiones en un `Func<CreateClaptrapInput, int, ValidateResult>`.
4. Expression.Parameter se utiliza para indicar la parte del parámetro de la expresión de delegado.
5. Expression.Variable se utiliza para indicar una variable, que es una variable normal.Similar a la`var un`.
6. Expression.Label se utiliza para indicar una ubicación específica.En este ejemplo, se utiliza principalmente para colocar la instrucción return.Los desarrolladores familiarizados con la sintaxis goto saben que goto necesita usar etiquetas para marcar dónde quieren goto.De hecho, el retorno es un tipo especial de goto.Por lo tanto, si desea volver en más de un bloque de instrucciones, también debe marcarlo antes de poder volver.
7. Expression.Block puede agrupar varias expresiones en orden.Se puede entender como escribir código secuencialmente.Aquí combinamos CreateDefaultResult, CreateValidateNamePrequired Expression, CreateValidateNameMinLengthExpression, y Label expresiones.El efecto es similar a unir el código secuencialmente.
8. CreateValidateNameRequiredExpression y CreateValidateNameMinLengthExpression tienen estructuras muy similares porque las expresiones resultantes que desea generar son muy similares.
9. No se preocupe demasiado por los detalles de CreateValidateNameExión requerido y CreateValidateNameMinLengthExpression.Puede intentar obtener más información sobre este método después de leer Expression.XXX ejemplo.
10. Con esta modificación, implementamos la extensión.Supongamos que ahora necesita agregar una validación MaxLength a Name que no supere 16.Simplemente agregue un método estático de ValidateNameMaxLength, agregue un método CreateValidateNameMaxLengthExpression y agréguelo a Block.Los lectores pueden intentar hacer una onda para lograr este efecto.

## El tercer paso es leer las propiedades

Vamos a volver a validar validateNameRequired y ValidateNameMinLength.Puesto que ambos métodos ahora reciben CreateClaptrapInput como argumento, la lógica interna también se escribe para validar Name, lo que no es muy bueno.

Vamos a reacondicionar ambos métodos para que el nombre de cadena se pasa para representar el nombre de propiedad verificado y el valor de cadena representa el valor de propiedad verificado.De esta manera podemos usar estos dos métodos de validación para más propiedades que no se limitan a Name.

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

Código Esenciales：

1. Como se mencionó anteriormente, modificamos ValidateNameRequired y lo renombramos ValidateStringRequired. ValidateNameMinLength -> ValidateStringMinLength。
2. CreateValidateNameExión de requerido y CreateValidateNameMinLengthExpression se han modificado porque los parámetros del método estático han cambiado.
3. Con esta modificación, podemos usar dos métodos estáticos para obtener más validación de atributos.Los lectores pueden intentar agregar una propiedad NickName.y realizar la misma validación.

## El cuarto paso es admitir varias validaciones de propiedades

A continuación, comprobaremos todas las propiedades de cadena de CreateClaptrapInput.

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

Código Esenciales：

1. Se ha agregado una propiedad, NickName, a CreateClaptrapInput y el caso de prueba validará la propiedad.
2. Al`List<Expression>`agregamos expresiones generadas más dinámicamente para bloquear.Por lo tanto, podemos generar expresiones de validación para Name y NickName.

## El quinto paso es verificar el contenido a través de la decisión Atributo

Aunque hemos admitido la validación de varias propiedades en primer lugar, los parámetros para la validación y validación siguen siendo muertos (por ejemplo, la longitud de：MinLength).

En esta sección, usaremos Atributo para determinar los detalles de la validación.Por ejemplo, al marcar Required es una propiedad para la validación necesaria.

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

Código Esenciales：

1. Al crear una lista de`<Expression>`se realiza una expresión específica decidiendo si se debe incluir una expresión específica en el atributo en la propiedad.

## En el sexto paso, reemplace el método estático por una expresión

El interior de los dos métodos estáticos, ValidateStringRequired y ValidateStringMinLength, contiene realmente solo una expresión trilateral de juicio, y en C- puede asignar una expresión al método Lambda.

Por lo tanto, podemos cambiar validateStringRequired y ValidateStringMinLength directamente a expresiones, por lo que no necesitamos reflexión para obtener métodos estáticos para crear expresiones.

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

Código Esenciales：

1. Reemplace el método estático por una expresión.Por lo tanto, la ubicación de createXXXExpression se ha modificado y el código es más corto.

## Paso siete, Curry

La química de la coli, también conocida como ciencia funcional y física, es un método en la programación funcional.Simple se puede expresar como：mediante la fijación de uno o varios argumentos de una función de varios argumentos, lo que resulta en una función con menos argumentos.Algunas terminologías también se pueden expresar como una forma de convertir una función de orden superior (el orden de una función es en realidad el número de argumentos) en una función de orden inferior.

Por ejemplo, ahora hay una función add (int, int) que implementa la función de agregar dos números.Si anclamos el primer argumento en el conjunto a 5, obtenemos una función add (5,int) que implementa la función de más un número más 5.

¿Cuál es el punto?

La función descendente puede hacer que las funciones sean coherentes, y después de que se hayan obtenido las funciones coherentes, se puede realizar cierta unificación de código para la optimización.Por ejemplo, las dos expresiones utilizadas anteriormente：

1. `Expresión<Func<string, string, ValidateResult>> ValidateStringRequiredExp`
2. `Expresión<Func<string, string, int, ValidateResult>> ValidateStringMinLengthExp`

La diferencia entre la segunda expresión y la primera expresión de las dos expresiones es solo en el tercer argumento.Si anclamos el tercer parámetro int con Corredic, podemos hacer que las firmas de las dos expresiones sean exactamente iguales.Esto es muy similar a la abstracción orientada a objetos.

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

Código Esenciales：

1. CreateValidateStringMinLengthExp método estático, pase un argumento para crear una expresión que es la misma que el Value devuelto por CreateValidateStringRequiredExp.En comparación con el ValidateStringMinLengthExp en la última sección, se implementa la operación de corregir el parámetro int para obtener una nueva expresión.Esta es la encarnación de un corredí.
2. Para unificar los métodos estáticos, hemos cambiado ValidateStringRequiredExp en la última sección a createValidateStringRequiredExp métodos estáticos, sólo para parecer coherente (pero en realidad agregar un poco de sobrecarga porque no hay necesidad de crear una expresión sin cambios repetidamente).
3. Ajuste el código del ensamblado `<Expression>` el código de lista en consecuencia.

## Paso 8, combina el código duplicado

En esta sección, combinaremos código duplicado de CreateValidateStrationRequired Expression y CreateValidateStringMinLengthExpression.

Solo RequiredMethodExp se crea de forma diferente.Por lo tanto, puede extraer de la parte común simplemente pasando este parámetro desde fuera del método.

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

Código Esenciales：

1. CreateValidate Expression es una forma común de extraerse.
2. Sin el paso anterior, el segundo parámetro de CreateValidate Expression, validateFuncExpression, sería difícil de determinar.
3. CreateValidateStringExión de requerido y CreateValidateStringMinLengthExpression denominado CreateValidate Expresión internamente, pero corregido varios parámetros.Esto también se puede considerar un corredí, porque el valor devuelto es que la expresión realmente se puede considerar una función de la forma, por supuesto, entendida como sobrecarga no es ningún problema, no tiene que estar demasiado enredada.

## Paso 9 para admitir más modelos

Hasta ahora, tenemos un validador que admite la comprobación de varios campos de cadena en CreateClaptrapInput.E incluso si desea extender más tipos, no es demasiado difícil, simplemente agregue una expresión.

En esta sección, abstraemos CreateClaptrapInput en un tipo más abstracto, después de todo, ningún validador de modelo está dedicado a validar solo una clase.

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

Código Esenciales：

1. Reemplace `Func<CreateClaptrapInput, ValidateResult>` por `func<object, ValidateResult>`y reemplace el tipo deadof (CreateClaptrapInput) por el tipo.
2. Guarde el validador del tipo correspondiente en ValidatedFunc después de crearlo.Esto no requiere la reconstrucción de todo el Func cada vez.

## Paso 10, agregue algunos detalles

Por último, estamos en el agradable "añadir algunos detalles" phase：para ajustar las interfaces abstractas y las implementaciones a las características del negocio.Así que tenemos la versión final de este ejemplo.

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

Código Esenciales：

1. IValidatorFactory Model Validator Factory, que representa la creación de un tipo específico de delegado de validador
2. La expresión de validación para las propiedades específicas de IPropertyValidatorFactory crea un generador que puede anexar una nueva implementación a medida que aumentan las reglas.
3. Utilice Autofac para la gestión de módulos.

## Practicar con la sala

¡No te vayas!Aún tienes trabajo.

Este es un requisito para calificar por dificultad que los desarrolladores pueden intentar lograr para comprender y usar el código en este ejemplo.

### Agregue una regla que valide la longitud máxima de cadena

Dificultad para：D

Ideas：

Similar a la duración mínima, no se olvide de registrarse.

### Agregue una regla que compruebe que int debe ser mayor o igual que 0

Dificultad para：D

Ideas：

Simplemente agregue un nuevo tipo de propiedad y no olvide registrarse.

### Agregar una regla`IEnumerable<T>`objeto debe contener al menos un elemento

Dificultad：C

Ideas：

Puede comprobar esto mediante el método Any en Linq

### Agregar un`IEnumerable ya<T>`ToList o ToArray, analogía con la regla en mvc

Dificultad：C

Ideas：

De hecho, sólo verifique que ya es ICollection.

### La compatibilidad con objetos vacíos también genera resultados de validación

Dificultad：C

Ideas：

Si la entrada está vacía.también debería poder generar la primera regla que no cumpla los criterios.Por ejemplo, Nombre requerido.

### ¿Agregar una validación int? Debe haber una regla de valor

Dificultad：B

Ideas：

¿Int? En realidad es azúcar de sintaxis, `tipo es<int>`.

### Agregar una validación enumerada debe ajustarse a un intervalo determinado

Dificultad：B

Ideas：

Las enumeraciones se pueden asignar a cualquier rango de valores, por ejemplo, enum TestEnum s None s 0; Sin embargo, forzar un 233 para dar una propiedad de este tipo no informa de un error.Esta validación requiere la validación de que el valor de propiedad solo se puede definir.

También puede hacerlo más difícil, por ejemplo, al admitir la validación del intervalo de valores mixtos enumerados como indicadores.

### Agregar una propiedad int A de validación debe ser grande y la propiedad int B

Dificultad：A

Ideas：

Se requieren dos propiedades para participar.No importa, escriba primero una función estática para comparar el tamaño de los dos valores.A continuación, considere cómo expresionizar, cómo corrificación.Puede consultar las ideas anteriores.

Condiciones de calificación adicionales, no pueden modificar la definición de interfaz actual.

### Agregar una cadena de validación Una propiedad debe ser igual a la propiedad de cadena B, ignorando mayúsculas y minúsculas

Dificultad：A

Ideas：

Similar al anterior.Sin embargo, las comparaciones de cadenas son más especiales que int y case debe omitirse.

### Admite la devolución de todos los resultados de validación

Dificultad：S

Ideas：

Ajuste los resultados de validación para devolver un valor, desde devolver la primera regla unso satisfecha hasta devolver todas las reglas no satisfechas, analogía al efecto del estado del modelo mvc.

Las expresiones que necesitan modificar los resultados combinados se pueden crear de dos maneras, una es crear la lista internamente y, a continuación, colocar los resultados en, y el más sencillo es devolver mediante el método return yield.

Es importante tener en cuenta que, dado que todas las normas están en funcionamiento, algunas sentencias requieren juicios defensivos.Por ejemplo, al juzgar la longitud de la cadena, primero debe determinar si está vacía.En cuanto a si la cadena vacía es un requisito de longitud mínima, los desarrolladores son libres de decidir, no el punto.

### Admite la validación recursiva de objetos

Dificultad：SS

Ideas：

Es decir, si un objeto contiene una propiedad y un objeto, el objeto secundario también debe validarse.

Hay dos ideas：

Una es modificar ValidatorFactory para admitir la obtención del validador de ValideFunc como parte de la expresión.El principal problema que esta idea debe abordar es que el validador del submodelo puede no existir en la colección ValidityFunc de antemano.Puede utilizar Lazy para resolver este problema.

El segundo consiste en crear una implementación de IPropertyValidatorFactory que le permita obtener ValidateFunc de ValidatorFactory para validar el submodelo.El principal problema con esta idea es que una implementación directa puede producir dependencias circulares.ValidateFunc se puede guardar y generar dividido en dos interfaces para aliviar esta dependencia circular.El esquema es más simple.

Además, la dificultad de calificar es SSS, `todos los elementos<>` el sistema IEnumerable.Los desarrolladores pueden intentarlo.

### Se admiten API encadenadas

Dificultad：SSS

Ideas：

Al igual que las API Attribute y Chain en EnterpriseFramework, agregue las características de la validación de la configuración de cadena.

Esto requiere agregar una nueva interfaz para el registro de la cadena, y el método que utilizó originalmente Atributo para generar expresiones directamente también debe ajustarse a atributo -> datos de registro -> generar expresiones.

### Implementar un modificador de propiedad

Dificultad：SSS

Ideas：

Implemente una regla que el número de teléfono se cifra cuando la propiedad de un objeto es una cadena que cumple una longitud de 11 y comienza con 1.Todos los caracteres excepto los tres primeros y los últimos cuatro se reemplazan por``.

Se recomienda implementar el modificador de propiedad desde cero, sin realizar cambios en el código anterior.Debido a que la validación y el reemplazo suelen ser dos empresas diferentes, una para la entrada y otra para la salida.

Estas son algunas requirements：adicionales

1. Una vez completada la sustitución, las condiciones antes y después de todos los valores que se reemplazaron se generan en el registro.
2. Tenga en cuenta que la prueba debe realizar, así como llamar a métodos directamente, de lo contrario debe haber un problema con la implementación de código.

## Este artículo resume

En .net, los árboles de expresión se pueden utilizar en dos escenarios principales.Uno se utiliza para analizar los resultados, normalmente EnterpriseFramework, y el otro se utiliza para crear delegados.

En este artículo se implementan los requisitos de un validador de modelo mediante la creación de delegados.La producción también se puede utilizar en muchas llamadas dinámicas en la práctica.

Dominar el árbol de expresiones le da una manera de realizar llamadas dinámicas en lugar de reflexión, que no solo es más escalable, sino que también funciona bien.

El código de ejemplo de este artículo se puede encontrar en el repositorio de vínculos below：

- <https://github.com/newbe36524/Newbe.Demo>
- <https://gitee.com/yks/Newbe.Demo>

<!-- md Footer-Newbe-Claptrap.md -->
