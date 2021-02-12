---
date: 2020-10-06
title: Comment utiliser dotTrace pour diagnostiquer les problèmes de performances avec les applications netcore
---

Récemment, faire une mise à niveau des performances pour le [Newbe.Claptrap](https://claptrap.newbe.pro/) , introduire l’utilisation de base du logiciel dotTrace utilisé dans le processus pour les développeurs.

<!-- more -->

## Un résumé d’ouverture

[dotTrace](https://www.jetbrains.com/profiler/) le logiciel de profil jetbrains pour les applications .net.Aide à l’analyse diagnostique des fonctions chronophages et des problèmes de mémoire dans votre logiciel.

Dans cet article, nous utiliserons le logiciel dotTrace de Jetbrains pour analyser certains problèmes de performances connus.Cela permet au lecteur de maîtriser les compétences de base de l’utilisation du logiciel.

Au cours du processus, nous serons jumelés avec quelques questions d’entrevue classique pour démontrer l’utilisation du logiciel étape par étape.

Cet exemple utilise Rider comme IDE pour la démonstration principale. Les développeurs peuvent également faire de même avec VS et Resharper.

## Comment obtenir dotTrace

dotTrace est un logiciel payant.Actuellement, le logiciel [directement tant que](https://www.jetbrains.com/dotnet/) dotUltimate et au-dessus des licences sont achetés.

Bien sûr, le logiciel comprend également une version d’essai, qui vous permet de commencer l’essai de 7 jours gratuitement.Les achats IDE de Jetbrains ont plus d’un an pour obtenir la dernière version de l’utilisation permanente actuelle.

Ou vous pouvez acheter une [de seau de la famille Jetbrains](https://www.jetbrains.com/all/), tout à la fois.

## Reproduction classique de scène

Ensuite, jetons un coup d’oeil à la façon d’utiliser dotTrace à travers quelques questions d’entrevue classique.

### Quand utiliser StringBuilder

Quelle question d’entrevue classique.Amis qui peuvent voir cet article, je suis sûr que vous savez tous que StringBuilder peut réduire la fragmentation de couture directe des cordes et le stress de mémoire.

On est réels ?Est-ce que c’est juste l’intervieweur qui veut m’embarrasser et m’intimider avec des informations asymétriques?

Il n’a pas d’importance, ensuite, nous allons utiliser dotTrace pour analyser une vague de code de combinaison spécifique.Voyez si l’utilisation de StringBuilder a réduit la pression sur l’allocation de mémoire.

Tout d’abord, créons un projet de test unitaire et ajoutons l’un des tests classes：

```cs
en utilisant System.Linq;
utilisant System.Text;
'utilisation de NUnit.Framework;

'espace nominatif Newbe.DotTrace.Tests
{
    classe publique X01StringBuilderTest
    {
        [Test]
        vide public UsingString()
        { source var
            = Enumerable.Range(0, 10)
                . Sélectionnez (x => x.ToString())
                . ToArray();
            var re = chaîne. Vide;
            pour (int i = 0; je < 10_000; i++)
            {
                re += source[i % 10];
            }
        }

        [Test]
        vide public UsingStringBuilder ()
        {
            var source = Enumerable.Range(0, 10)
                . Sélectionnez (x => x.ToString())
                . ToArray();
            var sb = nouveau StringBuilder ();
            pour (var i = 0; je < 10_000; i++)
            {
                sb. Annexe (source[i % 10]);
            }

            var _ = sb. ToString();
        }
    }
}
```

Ensuite, comme indiqué dans l’image suivante, nous définissons le modèle de profil dans Rider to Timeline.

![Définir le mode profele](/images/20201006-001.png)

TimeLine est l’un des nombreux modèles qui fournissent une vue plus complète de la façon dont chaque thread fonctionne, y compris les données multidivisées telles que l’allocation de mémoire, le traitement io, verrouillage, réflexion, et ainsi de suite.Cela servira d’un des principaux modèles utilisés dans cet exemple.

Ensuite, comme indiqué dans l’image suivante, démarrez le profil pour le test correspondant avec une petite icône sur le côté gauche du test unitaire.

![Démarrer profele](/images/20201006-002.png)

Après avoir commencé le profil, attendez un certain temps que le dernier rapport de chronologie généré apparaisse.L’emplacement du rapport de vue est affiché below：

![Démarrer profele](/images/20201006-003.png)

Cliquez à droite sur le rapport correspondant et sélectionnez Open in External Viewer pour ouvrir le rapport généré à l’aide de dotTrace.

Donc, tout d’abord, permettez-moi d’ouvrir le premier rapport et d’examiner le rapport généré par la méthode UsingString.

Comme indiqué dans l’image suivante, sélectionnez .Net Memory Allocations pour voir la quantité de mémoire allouée pendant le test.

![Démarrer profele](/images/20201006-004.png)

Sur la base de la figure ci-dessus, nous pouvons dessiner les conclusions：

1. Dans ce test, 102M de mémoire ont été alloués à String.Notez que l’allocation indiquée dans dotTrace se réfère à toute la mémoire allouée tout au long de la course.Cette valeur ne diminue pas même si elle est recyclée par la suite.
2. La mémoire est allouée tant qu’elle est faite sur le thread CLR Worker.Et très dense.

> Tip： Timeline affiche des temps de fonctionnement plus longs que les tests normaux en raison de la consommation supplémentaire de données qui doivent être enregistrées pendant le processus de profil.

Nous sommes donc arrivés à la première conclusion：la ficelle pour la couture directe ne consomment plus d’allocation de mémoire.

Ensuite, allons-y et regardons le rapport sur la méthode UsingStringBuilder, comme le montre：

![Démarrer profele](/images/20201006-005.png)

Sur la base de la figure ci-dessus, nous pouvons dessiner la deuxième conclusion：en utilisant StringBuilder peut réduire considérablement la mémoire consommée par rapport à la couture directe des cordes.

Bien sûr, la conclusion finale que nous sommes arrivés à：l’intervieweur n’a pas dupé les gens.

### Quel effet la classe et la structuration ont-ils sur la mémoire

Il existe de nombreuses différences entre la classe et la structure, et les questions d’entrevue sont des visiteurs fréquents.Il y a une différence de mémoire entre les deux.

Donc, nous allons passer un test pour voir la différence.

```cs
en utilisant le système;
utilisant System.Collections.Generic;
'utilisation de NUnit.Framework;

'espace nominatif Newbe.DotTrace.Tests
{
    classe publique X02ClassAndStruct
    {
        [Test]
        vide public UsingClass()
        {
            Console.WriteLine ($"mémoire en octets avant l’exécution: {GC. GetGCMemoryInfo(). TotalAvailableMemoryBytes} »);
            compte d’int const = 1_000_000;
            var = nouvelle liste<Student>(compte);
            pour (var i = 0; je < compter; i++)
            {
                liste. Ajouter (nouveau programme étudiant
                {
                    niveau = int. MinValue
                });
            }

            liste. Clair ();

            var gcMemoryInfo = GC. GetGCMemoryInfo();
            Console.WriteLine ($"taille du tas: {gcMemoryInfo.HeapSizeBytes}« );
            Console.WriteLine ($"mémoire en octets fin d’exécution: {gcMemoryInfo.TotalAvailableMemoryBytes}« );
        }

        [Test]
        vide public UsingStruct()
        {
            Console.WriteLine ($"mémoire dans les octets avant l’exécution: {GC. GetGCMemoryInfo(). TotalAvailableMemoryBytes} »);
            nombre d’int const = 1_000_000;
            var = nouvelle liste<Yueluo>(compte);
            pour (var i = 0; je < compter; i++)
            {
                liste. Ajouter (nouveau Yueluo
                {
                    niveau = int. MinValue
                });
            }

            liste. Clair ();

            var gcMemoryInfo = GC. GetGCMemoryInfo();
            Console.WriteLine ($"taille du tas: {gcMemoryInfo.HeapSizeBytes}« );
            Console.WriteLine ($"mémoire en octets fin d’exécution: {gcMemoryInfo.TotalAvailableMemoryBytes}« );
        }

        classe publique Student
        {
            public int Level { get; ensemble; }
        }

        public struct Yueluo
        {
            public int Niveau { get; ensemble; }
        }
    }
}
```

Code Essentials：

1. Deux tests, créer 1.000.000 classes et struct pour rejoindre la Liste.
2. Après avoir exécuté le test, sortez la taille de l’espace de tas actuel à la fin du test.

En suivant les étapes de base fournies dans la dernière section, nous comparons les rapports générés par les deux méthodes.

UtilisationClass

![UtilisationClass](/images/20201006-006.png)

Utilisation de Struct

![UtilisationClass](/images/20201006-007.png)

En comparant les deux rapports, vous pouvez dessiner les conclusions：

1. L’allocation de mémoire dans le rapport Timeline ne contient que la mémoire allouée au tas.
2. Struct n’a pas besoin d’être affecté au tas, cependant, le tableau est un objet de référence et doit être affecté au tas.
3. L’essence du processus d’auto-augmentation de List est que les caractéristiques du tableau d’expansion sont également reflétées dans le rapport.
4. En outre, il n’est pas affiché sur le rapport, et comme on peut le voir dans le texte imprimé de test, la taille du tas après l’exécuter UsingStruct confirme que le struct ne sera pas affecté au tas.

### Boxe et déballage

Question d’entrevue classique X3, allez, codez, rapportez sur !

```cs
en utilisant NUnit.Framework;

'espace nominatif Newbe.DotTrace.Tests
{
    classe publique X03Boxing
    {
        [Test]
        public void Boxing()
        {
            pour (int i = 0; je < 1_000_000; i++)
            {
                UseObject(i);
            }
        }

        [Test]
        vide public NoBoxing ()
        {
            pour (int i = 0; je < 1_000_000; i++)
            {
                UseInt(i);
            }
        }

        public statique vide UseInt (int age)
        {
            // rien
        }

        public vide statique UseObject (objet obj)
        {
            // rien
        }
    }
}
```

Boxe, la boxe se produit

![Boxe](/images/20201006-008.png)

NoBoxing, pas de boxe

![NoBoxing (NoBoxing)](/images/20201006-009.png)

En comparant les deux rapports, vous pouvez dessiner les conclusions：

1. Il n’y a pas de mise à mort sans achat et sans vente, et il n’y a pas de distribution de la consommation sans démolition.

### Quelle est la différence entre Thread.Sleep et Task.Delay?

Question d’entrevue classique X4, allez, sur le code, sur le rapport!

```cs
en utilisant le système;
utilisant System.Collections.Generic;
en utilisant System.Threading;
utilisant System.Threading.Tasks;
'utilisation de NUnit.Framework;

'espace nominatif Newbe.DotTrace.Tests
{
    classe publique X04SleepTest
    {
        [Test]
        public Task TaskDelay()
        {
            return Task.Delay (TimeSpan.FromSeconds(3));
        }

        [Test]
        tâche publique ThreadSleep ()
        {
            return Task.Run(() => { Thread.Sleep (TimeSpan.FromSeconds(3)); });
        }
    }
}
```

ThreadSleep

![ThreadSleep](/images/20201006-010.png)

TâcheDelay

![TâcheDelay](/images/20201006-011.png)

En comparant les deux rapports, vous pouvez dessiner les conclusions：

1. Thread.Sleep est marqué séparément dans dotTrace parce que c’est une pratique non performante qui peut facilement causer la faim de fil.
2. Thread.Sleep a un fil de plus dans le sommeil que Task.Delay

### Le blocage d’un grand nombre de tâches fait-il vraiment en sorte que votre application reste immobile ?

Avec la conclusion de l’étape suivante, l’auteur a eu une idée audacieuse.Nous savons tous que les threads sont limités, alors que faire si vous commencez beaucoup de Thread.Sleep ou Task.Delay?

Allez, code：

```cs
en utilisant le système;
utilisant System.Collections.Generic;
en utilisant System.Threading;
utilisant System.Threading.Tasks;
'utilisation de NUnit.Framework;

'espace nominatif Newbe.DotTrace.Tests
{
    classe publique X04SleepTest
    {

        [Test]
        public Task RunThreadSleep ()
        {
            return Task.WhenAny(GetTasks(50));

            IEnumerable<Task> GetTasks (nombre int)
            {
                pour (int i = 0; je < compter; i++)
                {
                    var i1 = i;
                    rendement rendement Task.Run (() =>
                    {
                        Console.WriteLine ($"Task {i1}« );
                        Thread.Sleep (int. MaxValue);
                    });
                }

                rendement de rendement Task.Run (() => { Console.WriteLine (« yueluo est le seul dalao »); });
            }
        }

        [Test]
        tâche publique RunTaskDelay ()
        {
            retour Task.WhenAny (GetTasks(50));

            IEnumerable<Task> GetTasks (nombre int)
            {
                pour (int i = 0; je < compter; i++)
                {
                    var i1 = i;
                    rendement de rendement Task.Run (() =>
                    {
                        Console.WriteLine ($"Task {i1}« );
                        retourner Task.Delay (TimeSpan.FromSeconds(int. MaxValue));
                    });
                }

                rendement de rendement Task.Run (() => { Console.WriteLine (« yueluo est le seul dalao »); });
            }
        }
    }
}
```

Voici pas de rapport de poste, les lecteurs peuvent essayer ce test, vous pouvez également écrire le contenu du rapport dans les commentaires de cet article pour participer à la discussion

### Appels de réflexion et appels de compilation d’arbre d’expression

Parfois, nous avons besoin d’appeler une méthode dynamiquement.La façon la plus connue est d’utiliser la réflexion.

Cependant, c’est aussi une façon relativement longue d’être connu.

Ici, l’auteur donne l’idée d’utiliser des délégués de création d’arbres d’expression au lieu de la réflexion pour améliorer l’efficacité.

Alors, y a-t-il eu une réduction de la consommation de temps?Bon rapport, je peux parler moi-même.

```cs
en utilisant le système;
utilisant System.Diagnostics;
utilisant System.Linq.Expressions;
'utilisation de NUnit.Framework;

'espace nominatif Newbe.DotTrace.Tests
{
    classe publique X05ReflectionTest
    {
        [Test]
        public void RunReflection()
        {
            var methodInfo = GetType(). GetMethod (nom de (MoYue));
            Debug.Assert (methodInfo != null, nameof(methodInfo) + " != null « );
            pour (int i = 0; je < 1_000_000; i++)
            {
                methodInfo.Invoke (null, null);
            }

            Console.WriteLine (_count);
        }

        [Test]
        vide public RunExpression()
        {
            var methodInfo = GetType(). GetMethod (nom de (MoYue));
            Debug.Assert (methodInfo != null, nameof(methodInfo) + " != null « );
            var methodCallExpression = Expression.Call (methodInfo);
            var lambdaExpression = Expression.Lambda<Action>(methodCallExpression);
            var func = lambdaExpression.Compile();
            pour (int i = 0; je < 1_000_000; i++)
            {
                func. Invoquer ();
            }

            Console.WriteLine (_count);
        }

        int privé statique _count = 0;

        vide statique public MoYue ()
        {
            _count++;
        }
    }
}
```

RunReflection, appelez directement en utilisant la réflexion.

![RunRéflexion](/images/20201006-012.png)

RunExpression, qui compile un délégué à l’aide d’un arbre d’expression.

![RunExpression (RunExpression)](/images/20201006-013.png)

## Cette section est une fin syn

Utilisez dotTrace pour voir combien de mémoire et de temps la méthode consomme.Le contenu présenté dans cet article n’en est qu’une petite partie.Les développeurs peuvent essayer de commencer, ce qui peut être bénéfique.

Le code d’exemple de cet article se trouve dans le référentiel de lien below：

- <https://github.com/newbe36524/Newbe.Demo>
- <https://gitee.com/yks/Newbe.Demo>

<!-- md Footer-Newbe-Claptrap.md -->
