---
date: 2020-06-01
title: Parler de l’application de la programmation réactive du côté du service, optimisation du fonctionnement de la base de données, de 20 secondes à 0,5 seconde
---

La programmation réactive est largement utilisée dans la programmation client, tandis que les applications actuelles du côté du service sont relativement moins mentionnées.Cet article décrit comment améliorer les performances des opérations de base de données en appliquant des programmes de réponse dans la programmation côté service.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## L’ouverture est la conclusion

System.Reactive, en conjonction avec TaskCompleteSource, vous permet de fusionner une seule demande d’insertion de base de données dans une demande d’insertion en vrac.Optimisez les performances d’insertion de base de données tout en assurant la justesse.

Si le lecteur sait déjà comment le faire, le reste n’a pas besoin d’être lu.

## Conditions prédéfiniales

Supposons maintenant qu’il existe une telle interface de dépôt pour représenter une opération d’insertion de base de données.

```csharp
namespace Newbe.RxWorld.DatabaseRepository
{
    interface publique IDatabaseRepository
    {
        /// <summary>
        /// Insérer un élément et renvoyer le nombre total de données dans la base de données
        /// </summary>
        /// <param name="item"></param>
        /// <returns></returns>
        Task<int> InsertData (int item);
    }
}
```

Ensuite, faisons l’expérience des différences de performances qui viennent avec différentes implémentations sans changer la signature de l’interface.

## La version sous-jacente

La première est la version sous-jacente, qui utilise la base de données la plus conventionnelle`INSERT`pour insérer des données.Cet exemple utilise le`SQLite`base de données de démonstration pour les lecteurs à expérimenter.

```csharp
namespace Newbe.RxWorld.DatabaseRepository.Impl
{
    classe publique NormalDatabaseRepository : IDatabaseRepository
    {
        private readonly IDatabase _database;

        public NormalDatabaseRepository (
            base de données IDatabase)
        {
            _database = base de données;
        }

        tâche publique<int> InsertData (élément int)
        {
            retour _database. InsertOne (article);
        }
    }
}
```

Opérations générales.L’un`_database. La mise en œuvre spécifique du`InsertOne est d’invoquer une seule`insérer`.

La version sous-jacente peut essentiellement être complétée plus rapidement lorsqu’elle est insérée moins de 20 fois en même temps.Mais si l’ordre de grandeur augmente, comme la nécessité d’insérer 10 000 bases de données en même temps, cela prendra environ 20 secondes et il y a beaucoup de place pour l’optimisation.

## TaskCompleteSource (en)

TaskCompleteSource est un type de la bibliothèque TPL qui génère une tâche actionnable.[lecteurs qui ne sont pas familiers avec TaskCompleteSource peuvent en apprendre davantage sur les](https://github.com/newbe36524/Newbe.Demo/tree/feature/reactive/src/BlogDemos/Newbe.Tasks/Newbe.Tasks).

Voici également une brève explication du rôle de l’objet afin que le lecteur puisse continuer à lire.

Pour les amis qui sont familiers avec javascript, vous pouvez penser à TaskCompleteSource comme l’équivalent d’un objet Promise.Peut également être équivalent à la jQuery dans le .$. Différé.

Si vous ne comprenez pas les amis, vous pouvez écouter l’auteur manger épicé chaud quand vous pensez à l’exemple de la vie.

| Mangez épicé chaud                                                                                          | Explication technique                                                                   |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Avant de manger épicé chaud, vous devez utiliser une assiette pour sandwich les plats.                      | Construire des paramètres                                                               |
| Après avoir pris la vaisselle en sandwich, emmenez-les à la caisse pour vérifier                            | La méthode est appelée                                                                  |
| Quand la caissière aura fini, il aura un signe de repas qui sonnera                                         | Obtenez une valeur de retour de tâche                                                   |
| Prenez la carte de plat pour trouver un siège pour s’asseoir, jouer au téléphone portable et d’autres repas | Dans l’attente de cette tâche, la CPU traite d’autres choses à la place                 |
| L’assiette sonne, va chercher le repas et mange-le                                                          | La tâche se termine, attend le nombre de sections et passe à la prochaine ligne de code |

Alors, où est TaskCompleteSource?

Tout d’abord, selon l’exemple ci-dessus, nous ne prendons le repas que lorsque l’assiette sonnera.Quand le panneau alimentaire sonnera-t-il ?Bien sûr, le serveur a appuyé manuellement sur un interrupteur manuel au comptoir pour déclencher la cloche.

Eh bien, cet interrupteur sur le compteur peut être techniquement interprété comme TaskCompleteSource.

L’interrupteur de table contrôle la sonnerie de la plaque.De même, TaskCompleteSource est un objet qui contrôle l’état des tâches.

## Résoudre l’idée

Avec ce que vous avez appris sur TaskCompleteSource avant, vous pouvez résoudre le problème au début de l’article.L’idée est aussi follows：

Lorsque InsertData est appelé, vous pouvez créer une TaskCompleteSource et un métagroupe d’éléments.Pour l’illustration, nous avons nommé`BatchItem`.

Retournez la tâche pour la taskcompleteSource de BatchItem.

Le code qui appelle InsertData attend la tâche retournée, de sorte que l’appelant attend tant que la TaskCompleteSource n’est pas exploitée.

Ensuite, un thread distinct est démarré, qui consomme périodiquement la file d’attente BatchItem.

Cela complète le processus de transformation d’un seul insert en insert en vrac.

L’auteur peut ne pas l’expliquer très clairement, mais toutes les versions suivantes du code sont basées sur les idées ci-dessus.Les lecteurs peuvent combiner les mots et le code pour comprendre.

## Version ConcurrentQueue

Sur la base de l’idée ci-dessus, nous avons implémenté ConcurrentQueue comme une file d’attente BatchItem, avec le code suivant (beaucoup de code, à ne pas emmêler, parce qu’il ya plus simples ci-dessous)：

```csharp
namespace Newbe.RxWorld.DatabaseRepository.Impl
{
    classe publique ConcurrentQueueDatabaseRepository : IDatabaseRepository
    {
        private readonly ITestOutputHelper _testOutputHelper;
        l’IDatabase _database;
        privé readonly ConcurrentQueue<BatchItem> _queue;

        // ReSharper désactiver une fois PrivateFieldCanBeConvertedToLocalVariable
        privée readonly Task _batchInsertDataTask;

        public ConcurrentQueueDatabaseRepository (
            ITestOutputHelper testOutputHelper,
            base de données IDatabase)
        {
            _testOutputHelper = testOutputHelper;
            _database = base de données;
            _queue = nouveau concurrentQueue<BatchItem>();
            // Lancez une
            _batchInsertDataTask BatchItem dans une file d’attente de consommation de tâches . . . Task.Factory.StartNew (RunBatchInsert, TaskCreationOptions.LongRunning);
            _batchInsertDataTask.ConfigureAwait (faux);


        tâche publique<int> InsertData (élément int)
        . . .
            // Construire BatchItem pour mettre des objets dans la file d’attente.Retour à la
            la tâche varCompletionSource nouvelle TaskCompletionSource<int>();
            _queue. Enqueue(nouveau BatchItem
            {
                Item = item,
                TaskCompletionSource = taskCompletionSource
            });
            tâche de retourCompletionSource.Task;

                    
                
                
            
            
        
        .

        . Attendre ();
                }
                catch (Exception e)
                {
                    _testOutputHelper.WriteLine ($"il y a une erreur : {e}« );
                }
            }

            IEnumerable<IList<BatchItem>> GetBatches()
            {
                var sleepTime = TimeSpan.FromMilliseconds(50);
                tandis que (vrai)
                {
                    const int maxCount = 100;
                    var oneBatchItems = GetWaitingItems ()
                        . Prendre (maxCount)
                        . ToList();
                    si (oneBatchItems.Any())
                    {
                        rendement rendement oneBatchItems;
                    }
                    autre
                    {
                        Thread.Sleep (sleepTime);
                    }
                }

                IEnumerable<BatchItem> GetWaitingItems ()
                {
                    while (_queue. TryDequeue (out var item))
                    {
                        rapport de rendement;
                    }
                }
            }
        }

        privé async Task BatchInsertData (IEnumerable<BatchItem> items)
        {
            var batchItems = items as BatchItem[] ?? items. ToArray();
            essayer
            '
                'insertion de la base de données
                var totalCount _database. InsertMany (batchItems.Select(x => x.Item));
                foreach (var batchItem in batchItems)
                {
                    batchItem.TaskCompletionSource.SetResult (totalCount);
                }
            }
            catch (Exception e)
            {
                foreach (var batchItem in batchItems)
                {
                    batchItem.TaskCompletionSource.SetException(e);
                }

                lancer;
            }
        }

        structure privée BatchItem
        {
            taskcompletionSource<int> TaskCompletionSource { get; ensemble; }
            'élément int public { obtenir; ensemble; }
        }
    }
}
```

## Le film commence!

Ensuite, utilisons System.Reactive pour moderniser la version plus complexe de ConcurrentQueue ci-dessus.En voici：

```csharp
namespace Newbe.RxWorld.DatabaseRepository.Impl
{
    classe publique AutoBatchDatabaseRepository : IDatabaseRepository
    {
        private readonly ITestOutputHelper _testOutputHelper;
        l’IDatabase _database;
        sujet privé<BatchItem> _subject;

        public AutoBatchDatabaseRepository (
            ITestOutputHelper testOutputHelper,
            base de données IDatabase)
        {
            _testOutputHelper = testOutputHelper;
            _database = base de données;
            _subject = nouveau sujet<BatchItem>();
            // Demandes de groupe en groupes de 50 millisecondes ou toutes les 100
            _subject. Buffer (TimeSpan.FromMilliseconds(50), 100)
                . Où (x s> x.Count > 0)
                // Insérez chaque ensemble d’appels de données en vrac et écrivez à la base de données
                . Sélectionnez (liste => Observable.FromAsync (() => BatchInsertData(liste)))
                . Concat ()
                . Abonnez-vous();


        // Il n’y a pas de changement ici par rapport à la comparaison précédente
        public Task<int> InsertData
        . .
            var taskCompletion .<int>.
            _subject. OnNext (nouveau BatchItem
            {
                Item = item,
                TaskCompletionSource = taskCompletionSource
            });
            tâche de retourCompletionSource.Task;
        s

        // Ce paragraphe est exactement le même qu’avant, pas de changement
        privé async Task BatchInsertData (IEnumerable<BatchItem> articles)

            var batchItems articles comme BatchItems? ToArray();
            essayer
            {
                var totalCount = attendre _database. InsertMany (batchItems.Select(x => x.Item));
                foreach (var batchItem en batchItems)
                {
                    batchItem.TaskCompletionSource.SetResult (totalCount);
                }
            }
            catch (Exception e)
            {
                foreach (var batchItem in batchItems)
                {
                    batchItem.TaskCompletionSource.SetException(e);
                }

                lancer;
            }
        }

        structuration privée BatchItem
        {
            taskcompletionSource<int> TaskCompletionSource { get; ensemble; }
            int public Item { get; ensemble; }
        }
    }
}
```

Le code a été réduit de 50 lignes, principalement parce que la mise en œuvre logique complexe de la version ConcurrentQueue a été implémentée en utilisant la puissante méthode Buffer fournie dans System.Reactive.

## Professeur, pouvez-vous me donner un peu plus de force ?

Nous pouvons « légèrement » optimiser le code pour séparer buffer et logique connexe de la logique métier de « insertion de base de données ».Ensuite, nous aurons une approche plus simple version：

```csharp
namespace Newbe.RxWorld.DatabaseRepository.Impl
{
    classe publique FinalDatabaseRepository : IDatabaseRepository
    {
        privé readonly IBatchOperator<int, int> _batchOperator;

        public FinalDatabaseRepository (
            base de données IDatabase)
        {
            options var = nouveaux BatchOperatorOptions<int, int>
            {
                BufferTime = TimeSpan.FromMilliseconds(50),
                BufferCount = 100,
                DoManyFunc = base de données. InsertMany,
            };
            _batchOperator = nouveau batchoperator<int, int>(options);
        }

        tâche publique<int> InsertData (élément int)
        {
            retour _batchOperator.CreateTask(item);
        }
    }
}
```

Le code tel qu’IBatchOperator, que les lecteurs peuvent afficher dans la base de code, n’est pas affiché ici.

## Tests de performance

L’essentiel peut être mesuré comme follows：

La version originale n’est pas très différente de la version en vrac lorsqu’il y a 10 opérations uniquement de données.Même les versions en vrac sont plus lentes lorsque le nombre est faible, après tout, il ya un temps d’attente maximum de 50 millisecondes.

Toutefois, si vous avez besoin de manipuler 10 000 consommables de données en vrac, la version originale peut prendre 20 secondes, tandis que la version en vrac ne prend que 0,5 seconde.

> [tout le code d’échantillon peut être trouvé dans la base de code](https://github.com/newbe36524/Newbe.Demo).Si Github Clone est en difficulté,[pouvez également cliquer ici pour Clone de Gitee](https://gitee.com/yks/Newbe.Demo)

<!-- md Footer-Newbe-Claptrap.md -->
