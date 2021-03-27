---
date: 2020-10-06
title: Cómo usar dotTrace para diagnosticar problemas de rendimiento con aplicaciones netcore
---

Recientemente haciendo una actualización de rendimiento para el [Newbe.Claptrap](https://claptrap.newbe.pro/) , introducir el uso básico del software dotTrace utilizado en el proceso a los desarrolladores.

<!-- more -->

## Un resumen de apertura

[dotTrace](https://www.jetbrains.com/profiler/) es el software de perfil de Jetbrains para aplicaciones .net.Ayuda con el análisis de diagnóstico de funciones que consumen mucho tiempo y problemas de memoria en su software.

En este artículo, usaremos el software dotTrace de Jetbrains para analizar algunos problemas de rendimiento conocidos.Esto permite al lector dominar las habilidades básicas del uso del software.

Durante el proceso, seremos emparejados con algunas preguntas clásicas de la entrevista para demostrar el uso del software paso a paso.

En este ejemplo se usa Rider como IDE para la demostración principal. Los desarrolladores también pueden hacer lo mismo con VS y Resharper.

## Cómo obtener dotTrace

dotTrace es un software de pago.Actualmente, el software [directamente siempre y cuando se compren](https://www.jetbrains.com/dotnet/) licencias dotUltimate y superior.

Por supuesto, el software también incluye una versión de prueba, que le permite iniciar la prueba de 7 días de forma gratuita.Las compras IDE de Jetbrains tienen más de un año para obtener la última versión del uso permanente actual.

O puede comprar [licencia de cubo de la familia Jetbrains](https://www.jetbrains.com/all/), todo a la vez.

## Reproducción de escenas clásicas

A continuación, echemos un vistazo a cómo utilizar dotTrace a través de algunas preguntas de entrevista clásicas.

### Cuándo usar StringBuilder

Qué pregunta clásica de la entrevista.Amigos que pueden ver este artículo, estoy seguro de que todos saben que StringBuilder puede reducir la fragmentación de costura directa de cadena y el estrés de la memoria.

¿Somos reales?¿Será sólo el entrevistador que quiere avergonzarme y intimidarme con información asimétrica?

No importa, a continuación, vamos a usar dotTrace para analizar una oleada de código de combinación específico.Compruebe si el uso de StringBuilder ha reducido la presión sobre la asignación de memoria.

En primer lugar, vamos a crear un proyecto de prueba unitaria y agregar una de las siguientes classes：de prueba

```cs
uso de System.Linq;
utilizando System.Text;
mediante NUnit.Framework;

espacio de nombres Newbe.DotTrace.Tests
á
    clase pública X01StringBuilderTest
    ?
        [Test]
        public void UsingString()
        ?
            var source ? Enumerable.Range(0, 10)
                . Select(x á> x.ToString())
                . ToArray();
            var re - string. Vacío;
            para (int i á 0; i < 10_000; i++)

                re -o source[i % 10];
            á


        [Test]
        vacío público UsingStringBuilder()
        -
            var source - Enumerable.Range(0, 10)
                . Select(x á> x.ToString())
                . ToArray();
            var sb á new StringBuilder();
            para (var i a 0; i < 10_000; i++)
            á
                sb. Anexar(fuente[i % 10]);
            á

            var _ á sb. ToString();


?
```

Luego, como se muestra en la siguiente imagen, establecemos el patrón de perfil en Rider en Timeline.

![Establecer el modo profele](/images/20201006-001.png)

TimeLine es uno de varios patrones que proporcionan una vista más completa de cómo funciona cada subproceso, incluidos los datos multidivisa, como la asignación de memoria, el procesamiento de E/S, el bloqueo, la reflexión, etc.Esto servirá como uno de los patrones principales utilizados en este ejemplo.

A continuación, como se muestra en la siguiente imagen, inicie el perfil para la prueba correspondiente con un pequeño icono en el lado izquierdo de la prueba unitaria.

![Iniciar profele](/images/20201006-002.png)

Después de iniciar el perfil, espere un momento a que aparezca el último informe de escala de tiempo generado.La ubicación del informe de vista se muestra below：

![Iniciar profele](/images/20201006-003.png)

Haga clic con el botón derecho en el informe correspondiente y seleccione Abrir en el visor externo para abrir el informe generado mediante dotTrace.

Por lo tanto, en primer lugar, permítanme abrir el primer informe y ver el informe generado por el UsingString método.

Como se muestra en la siguiente imagen, seleccione Asignaciones de memoria .Net para ver la cantidad de memoria asignada durante la ejecución de prueba.

![Iniciar profele](/images/20201006-004.png)

Basándonos en la figura anterior, podemos dibujar las siguientes conclusions：

1. En esta prueba, 102M de memoria se asignó a String.Tenga en cuenta que la asignación que se muestra en dotTrace hace referencia a toda la memoria asignada a lo largo de la ejecución.Este valor no disminuye aunque se recifise posteriormente.
2. La memoria se asigna siempre que se realice en el subproceso de trabajo de CLR.Y muy denso.

> Consejo： Línea de tiempo muestra tiempos de ejecución más largos que las pruebas normales debido al consumo adicional de datos que deben registrarse durante el proceso de perfil.

Así que llegamos a la primera conclusion：usar string para la costura directa consume más asignación de memoria.

A continuación, echemos un vistazo al informe sobre el método UsingStringBuilder, como se muestra：

![Iniciar profele](/images/20201006-005.png)

En función de la figura anterior, podemos dibujar la segunda conclusion：el uso de StringBuilder puede reducir significativamente la memoria consumida en comparación con la costura directa de cadena.

Por supuesto, la conclusión final que llegamos a：que el entrevistador no estaba engañando a la gente.

### Qué clase de efecto y estructura tienen en la memoria

Hay muchas diferencias entre la clase y la estructura, y las preguntas de entrevista son visitantes frecuentes.Hay una diferencia en la memoria entre los dos.

Así que vamos a hacer una prueba para ver la diferencia.

```cs
utilizando el sistema;
mediante System.Collections.Generic;
mediante NUnit.Framework;

espacio de nombres Newbe.DotTrace.Tests
á
    clase pública X02ClassAndStruct
    á
        [Test]
        public void UsingClass()
        á
            Console.WriteLine($"memory en bytes antes de la ejecución: .GC. GetGCMemoryInfo(). TotalAvailableMemoryBytes");
            const int count á 1_000_000;
            lista var : nueva lista<Student>(recuento);
            para (var i a 0; i < contar; i++)
            : lista de
                . Add(new Student
                ?
                    Level - int. MinValue
                ;
            de la lista de

            . Clear();

            var gcMemoryInfo - GC. GetGCMemoryInfo();
            Console.WriteLine($"tamaño del montón: {gcMemoryInfo.HeapSizeBytes}");
            Console.WriteLine($"memory in bytes end of execution: {gcMemoryInfo.TotalAvailableMemoryBytes}");
        :

        [Test]
        public void UsingStruct()
        -
            Console.WriteLine($"memory in bytes before execution: .GC. GetGCMemoryInfo(). TotalAvailableMemoryBytes");
            const int count á 1_000_000;
            lista var : nueva lista<Yueluo>(recuento);
            para (var i a 0; i < cuenta; i++)
            : lista de
                . Add(new Yueluo
                ?
                    Level - int. MinValue
                ;
            : lista de

            . Clear();

            var gcMemoryInfo - GC. GetGCMemoryInfo();
            Console.WriteLine($"tamaño del montón: {gcMemoryInfo.HeapSizeBytes}");
            Console.WriteLine($"memory in bytes end of execution: {gcMemoryInfo.TotalAvailableMemoryBytes}");
        :

        clase pública
        de alumnos ,
            nivel de int público, obtener; set; •
        -

        estructura pública Yueluo
        -
            nivel de int público ; set; •


?
```

Código Esenciales：

1. Dos pruebas, crear 1.000.000 de clases y estructura para unirse a la lista.
2. Después de ejecutar la prueba, genere el tamaño del espacio de almacenamiento dinámico actual al final de la prueba.

Siguiendo los pasos básicos proporcionados en la última sección, comparamos los informes generados por los dos métodos.

UsingClass

![UsingClass](/images/20201006-006.png)

Uso deStruct

![UsingClass](/images/20201006-007.png)

Comparando los dos informes, puede dibujar los siguientes conclusions：

1. La asignación de memoria en el informe de línea de tiempo contiene solo la memoria asignada al montón.
2. Struct no necesita ser asignado al montón, sin embargo, la matriz es un objeto de referencia y necesita ser asignado al montón.
3. La esencia del proceso de autoevaluación de List es que las características de la matriz de expansión también se reflejan en el informe.
4. Además, no se muestra en el informe y, como se puede ver en el texto impreso de prueba, el tamaño del montón después de la ejecución de UsingStruct confirma que la estructura no se asignará al montón.

### Boxeo y unboxing

Pregunta de entrevista clásica X3, vamos, código, informe sobre!

```cs
utilizando NUnit.Framework;

espacio de nombres Newbe.DotTrace.Tests
á
    clase pública X03Boxing
    á
        [Test]
        public void Boxing()
        á
            para (int i á 0; i < 1_000_000; i++)

                UseObject(i);
            á
        -

        [Test]

        público void NoBoxing() para
            (int i á 0; i < 1_000_000; i++)

                UseInt(i);



        vacío estático público UseInt(int age)

            // nada
        ?

        vacío estático público UseObject(object obj)


    
        
            ?
```

Boxeo, el boxeo se produce

![Boxeo](/images/20201006-008.png)

NoBoxing, sin boxeo

![NoBoxing](/images/20201006-009.png)

Comparando los dos informes, puede dibujar los siguientes conclusions：

1. No hay matanza sin comprar y vender, y no hay distribución del consumo sin demolición.

### ¿Cuál es la diferencia entre Thread.Sleep y Task.Delay?

¡Entrevista clásica pregunta X4, vamos, en el código, en el informe!

```cs
utilizando el sistema;
mediante System.Collections.Generic;
mediante System.Threading;
mediante System.Threading.Tasks;
mediante NUnit.Framework;

espacio de nombres Newbe.DotTrace.Tests
á
    clase pública X04SleepTest
    á
        [Test]
        Task TaskDelay() pública
        á
            devolver Task.Delay(TimeSpan.FromSeconds(3));
        á

        [Test]
        tarea pública ThreadSleep()
        -
            devolver Task.Run(() á> - Thread.Sleep(TimeSpan.FromSeconds(3)); });


?
```

ThreadSleep

![ThreadSleep](/images/20201006-010.png)

TaskDelay

![TaskDelay](/images/20201006-011.png)

Comparando los dos informes, puede dibujar los siguientes conclusions：

1. Thread.Sleep se etiqueta por separado en dotTrace porque es una práctica de no rendimiento que puede causar fácilmente el hambre de hilos.
2. Thread.Sleep tiene un subproceso más en reposo que Task.Delay

### ¿Bloquear un gran número de tareas realmente hace que la aplicación permanezca inmóvil?

Con la conclusión del siguiente paso, el autor se le ocurrió una idea audaz.Todos sabemos que los subprocesos son limitados, así que ¿qué pasa si se inicia una gran cantidad de Thread.Sleep o Task.Delay?

Vamos, code：

```cs
utilizando el sistema;
mediante System.Collections.Generic;
mediante System.Threading;
mediante System.Threading.Tasks;
mediante NUnit.Framework;

espacio de nombres Newbe.DotTrace.Tests
á
    clase pública X04SleepTest
    á

        [Test]
        tarea pública RunThreadSleep()

            devolver Task.WhenAny(GetTasks(50));

            IEnumerable<Task> GetTasks(int count)

                para (int i á 0; i < contar; i++)
                de
                    var i1 a i;
                    retorno de rendimiento Task.Run(() á>
                    -
                        Console.WriteLine($"Task {i1}");
                        Thread.Sleep(int. MaxValue);
                    );
                :

                retorno de rendimiento Task.Run()-> de la aplicación de la aplicación: Console.WriteLine("yueluo es el único dalao"); });
            á
        -

        [Test]
        tarea pública RunTaskDelay()

            devolver Task.WhenAny(GetTasks(50));

            IEnumerable<Task> GetTasks(int count)

                para (int i á 0; i < contar; i++)
                de
                    var i1 a i;
                    retorno de rendimiento Task.Run(() á>
                    -
                        Console.WriteLine($"Task {i1}");
                        devuelve Task.Delay(TimeSpan.FromSeconds(int. MaxValue));
                    );
                :

                retorno de rendimiento Task.Run()-> de la aplicación de la aplicación: Console.WriteLine("yueluo es el único dalao"); });



?
```

Aquí no hay ningún informe de publicación, los lectores pueden probar esta prueba, también puede escribir el contenido del informe en los comentarios de este artículo para participar en la discusión

### Llamadas de reflexión y llamadas de compilación de árbol de expresión

A veces necesitamos llamar a un método dinámicamente.La forma más conocida es utilizar la reflexión.

Sin embargo, esta es también una manera relativamente lenta de ser conocido.

Aquí, el autor proporciona una idea de usar delegados de creación de árbol de expresión en lugar de reflexión para mejorar la eficiencia.

Entonces, ¿ha habido una reducción en el consumo de tiempo?Buen informe, puedo hablar yo mismo.

```cs
utilizando el sistema;
mediante System.Diagnostics;
mediante System.Linq.Expressions;
mediante NUnit.Framework;

espacio de nombres Newbe.DotTrace.Tests
á
    clase pública X05ReflectionTest
    ?
        [Test]
        public void RunReflection()
        ?
            var method - GetType(). GetMethod(nameof(MoYue));
            Debug.Assert(methodInfo !- null, nameof(methodInfo) + " !- null");
            para (int i á 0; i < 1_000_000; i++)

                methodInfo.Invoke(null, null);
            :

            Console.WriteLine(_count);
        :

        [Test]
        public void RunExpression()
        á
            var methodInfo á GetType(). GetMethod(nameof(MoYue));
            Debug.Assert(methodInfo !- null, nameof(methodInfo) + " !- null");
            var methodCallExpression á Expression.Call(methodInfo);
            var lambdaExpression á Expression.Lambda<Action>(methodCallExpression);
            var func á lambdaExpression.Compile();
            para (int i á 0; i < 1_000_000; i++)

                func. Invoke();
            :

            Console.WriteLine(_count);
        :

        _count de int estático privado a 0;

        vacío estático público MoYue()
        á
            _count++;


?
```

RunReflection, llame directamente mediante la reflexión.

![RunReflection](/images/20201006-012.png)

RunExpression, que compila un delegado mediante un árbol de expresiones.

![RunExpression](/images/20201006-013.png)

## Esta sección es un fin sinérgio

Utilice dotTrace para ver cuánta memoria y tiempo consume el método.El contenido presentado en este artículo es sólo una pequeña parte de él.Los desarrolladores pueden intentar empezar, lo que puede ser beneficioso.

El código de ejemplo de este artículo se puede encontrar en el repositorio de vínculos below：

- <https://github.com/newbe36524/Newbe.Demo>
- <https://gitee.com/yks/Newbe.Demo>

<!-- md Footer-Newbe-Claptrap.md -->
