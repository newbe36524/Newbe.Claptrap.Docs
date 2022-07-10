---
title: "Étape 3 - Comprendre la structure du projet"
description: "Étape 3 - Comprendre la structure du projet"
---

À côté de la [étape 2 - Créer des](01-3-Basic-Flow.md) de projet, examinons la structure du projet créée à l’aide du modèle de projet Newbe.Claptrap.

<!-- more -->

## La structure de la solution

Utilisez Visual Studio ou Rider pour ouvrir une solution à l’origine de la`helloClaptrap .sln`.

La solution contient plusieurs dossiers de solutions, dont chacun est aussi follows：

| Le dossier de solution         | Description                                                                                                                                                                                                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0_Infrastructure               | Infrastructure.Ici, vous pouvez placer quelques modèles couramment utilisés, bibliothèques de classe commune, et ainsi de suite.Ils sont généralement référencés par plusieurs autres projets                                                                                        |
| 1_Business                     | Logique d’affaires.Ici, vous pouvez placer quelques bibliothèques de classe liées aux affaires de base.Par exemple, les niveaux de stockage, les niveaux d’affaires, et ainsi de suite.En particulier, des implémentations spécifiques d’Actor peuvent généralement être placées ici |
| 2_Application                  | Application.Ici, vous pouvez placer des applications en cours d’exécution qui peuvent inclure certains WebApi, services Grpc, processus d’exécution d’acteur, et ainsi de suite                                                                                                      |
| SolutionsItems (solutionItems) | Certains fichiers au niveau de la solution, tels que nuget.config, tye.yml, Directory.Build.props, et ainsi de suite                                                                                                                                                                 |

Ce ne sont là que les structures de solutions les plus simples incluses dans la démonstration du projet.Dans le développement réel, vous devez souvent rejoindre, interfaces d’entrepôt, test unitaire, services back-office et autres contenus.Les développeurs peuvent les positionner selon les règles de l’équipe.

## En savoir plus sur les liens d’appel

Maintenant, je comprends le processus d’exécution de Newbe.Claptrap avec un lien d’appel simple.

Regardons les `get/auctionitems/{itemId}`processus.

### Couche API

Lorsque l’API est appelée, la première entrée naturelle est la`controller`.Parmi les modèles de projet correspondants est`AuctionItemsController`dans le cadre du projet`HelloClaptrap.WebApi`, et les sections suivantes liées à cette API sont：

```cs AuctionItemsController.cs
en utilisant System.Threading.Tasks;
utilisant Dapr.Actors;
en utilisant Dapr.Actors.Client;
en utilisant HelloClaptrap.IActor;
utilisant HelloClaptrap.Models;
en utilisant Microsoft.AspNetCore.Mvc;
en utilisant Newbe.Claptrap;
en utilisant Newbe.Claptrap.Dapr;

'espace de nom HelloClaptrap.WebApi.Controllers
{
    [ApiController]
    [Route( »[controller]« )]
    public class AuctionItemsController : ControllerBase
    {
        private readonly IActorProxyFactory _actorProxyFactory;

        public AuctionItemsController (
            IActorProxyFactory actorProxyFactory)
        {
            _actorProxyFactory = actorProxyFactory;
        }

        [HttpGet( »{itemId}/status »)]
        public async Task<IActionResult> GetStatus (int itemId = 1)
        {
            var id = nouveau ClaptrapIdentity (itemId.ToString(),
                ClaptrapCodes.AuctionItemActor);
            var auctionItemActor = _actorProxyFactory.GetClaptrap<IAuctionItemActor>(id);
            statut var = attendre auctionItemActor.GetStatusAsync ();
            var = nouvelles
            {
                status
            };
            retour Ok (résultat);
        }
    }
}
```

Ce code indique que：

1. `GetStatus`créé`ClaptrapIdentity`, qui est le[Claptrap Identity](https://claptrap.newbe.pro/zh_Hans/docs/02-10-Claptrap-Identity), qui est utilisé pour localiser un`claptrap`
2. Prochain appel`_actorProxyFactory`pour obtenir un proxy acteur.Ceci est implémenté par une interface fournie par Dapr.
3. Appelez le`GetStatusAsync`pour l’agent de`enchères créé, afin que vous puissiez appeler la méthode pour l’instance Claptrap correspondante.
4. Les résultats retournés de Claptrap sont emballés et retournés en tant que résultats de l’API.


<p spaces-before="0">Il s’agit d’une simple représentation de l’API layer：méthode qui appelle acteur en créant un proxy acteur.La couche API est en fait la couche d’entrée du système.Vous pouvez plus que simplement exposer l’API d’une manière reposant.Il est parfaitement possible d’utiliser Grpc ou autre chose.</p>

<h3 spaces-before="0">Couche Claptrap</h3>

<p spaces-before="0">est au cœur de l’écriture de code d’entreprise, qui, comme Controller dans MVC, sert le but principal du contrôle logique d’entreprise.</p>

<p spaces-before="0">Ensuite, regardons comment la couche Claptrap fonctionne à la fois de façon à lire seulement et à écrire uniquement.</p>

<h4 spaces-before="0">Opérations de lecture de la couche Claptrap</h4>

<p spaces-before="0">Jetons un coup d’oeil à la façon dont la couche Claptrap fonctionne.Avec la fonction Mise en œuvre find de l’IDE, vous trouverez AuctionItemActor`pour la classe de mise en œuvre du projet `IAuctionItemActor dans le projet HelloClaptrap.Actors`, et voici quelques-unes des sections liées au projet`GetStatus Async`method：</p>

```cs AuctionItemActor.cs
en utilisant System.Linq;
utilisant System.Threading.Tasks;
en utilisant Dapr.Actors.Runtime;
en utilisant HelloClaptrap.Actors.AuctionItem.Events;
en utilisant HelloClaptrap.IActor;
utilisant HelloClaptrap.Models;
en utilisant HelloClaptrap.Models.AuctionItem;
en utilisant HelloClaptrap.Models.AuctionItem.Events;
en utilisant Newbe.Claptrap;
en utilisant Newbe.Claptrap.Dapr;

'espace de nom HelloClaptrap.Actors.AuctionItem
{
    [Actor(TypeName = ClaptrapCodes.AuctionItemActor)]
    [ClaptrapStateInitialFactoryHandler(typeof (AuctionItemActorInitialStateDataFactory))]
    [ClaptrapEventHandler(typeof(NewBidderEventHandler), ClaptrapCodes.NewBidderEvent)]
    classe publique AuctionItemActor : ClaptrapBoxActor<AuctionItemState>, IAuctionItemActor
    {
        privé readonly IClock _clock;

        public AuctionItemActor (
            ActorHost actorHost,
            IClaptrapActorCommonService claptrapActorCommonService,
            IClock clock) : base (actorHost, claptrapActorCommonService)
        {
            _clock = horloge;
        }

        tâche publique<AuctionItemStatus> GetStatusAsync ()
        {
            retour Task.FromResult (GetStatusCore());
        }

        AuctionItemStatus GetStatusCore ()
        {
            var maintenant = _clock. UtcNow;
            si (maintenant < StateData.StartTime)
            {
                retour AuctionItemStatus.Planned;
            }

            si (maintenant > StateData.StartTime && maintenant < StateData.EndTime)
            {
                retour AuctionItemStatus.OnSell;
            }

            retourner StateData.BiddingRecords?. Tout () == vrai ? AuctionItemStatus.Sold : AuctionItemStatus.UnSold;
        }
    }
}
```

Ce code indique que：

1. `attribut` sont marqués sur le auctionItemActor, qui fournissent `un` s basi important pour la numérisation du système `claptrap` composants.Les fonctionnalités seront expliquées plus en détail dans les articles suivants.
2. `The AuctionItemActor` hérité `ClaptrapBoxActor<AuctionItemState>`.Hériter de cette classe ajoute également `soutien` 'approvisionnement événement à la demande de l’acteur.
3. `'` le constructeur a présenté `ActorHost` et `IClaptrapActorCommonService`.Lorsque `ActorHost` est un paramètre fourni par le Dapr SDK qui représente des informations de base telles que l’ID et le type de l’acteur actuel. `IClaptrapActorCommonService` est l’interface de service fournie par le framework Claptrap, et tout le comportement de Claptrap est implémenté en changeant les types pertinents dans l’interface.
4. `GetStatusAsync` lire les données directement de State in Claptrap.En raison du mécanisme d’approvisionnement en événements, les développeurs peuvent toujours penser que l’état dans Claptrap est toujours dans l’état correct, à jour et disponible.Vous pouvez toujours faire confiance aux données de l’État dans Claptrap, sans penser à la façon dont vous interagissez avec la couche de persistance.

#### Claptrap couche écrit

Claptrap opérations de lecture uniquement sont des opérations qui appellent acteur sans un changement à l’état Claptrap.L’écriture en vaut la peine que l’acteur modifie l’état de Claptrap.En raison du mécanisme de traçabilité des événements, pour modifier l’état de Claptrap, vous devez le modifier par des événements.Vous pouvez `l'` de Claptrap en utilisant la méthode TryBidding pour apprendre à générer un event：

```cs AuctionItemActor.cs
en utilisant System.Linq;
utilisant System.Threading.Tasks;
en utilisant Dapr.Actors.Runtime;
en utilisant HelloClaptrap.Actors.AuctionItem.Events;
en utilisant HelloClaptrap.IActor;
utilisant HelloClaptrap.Models;
en utilisant HelloClaptrap.Models.AuctionItem;
en utilisant HelloClaptrap.Models.AuctionItem.Events;
en utilisant Newbe.Claptrap;
en utilisant Newbe.Claptrap.Dapr;

'espace de nom HelloClaptrap.Actors.AuctionItem
{
    [Actor(TypeName = ClaptrapCodes.AuctionItemActor)]
    [ClaptrapStateInitialFactoryHandler(typeof (AuctionItemActorInitialStateDataFactory))]
    [ClaptrapEventHandler(typeof(NewBidderEventHandler), ClaptrapCodes.NewBidderEvent)]
    classe publique AuctionItemActor : ClaptrapBoxActor<AuctionItemState>, IAuctionItemActor
    {
        privé readonly IClock _clock;

        public AuctionItemActor (
            ActorHost actorHost,
            IClaptrapActorCommonService claptrapActorCommonService,
            IClock clock) : base (actorHost, claptrapActorCommonService)
        {
            _clock = horloge;
        }

        public Task<TryBiddingResult> TryBidding (entrée TryBiddingInput)
        {
            statut var = GetStatusCore();

            si (statut != AuctionItemStatus.OnSell)
            {
                retourner Task.FromResult (CreateResult(faux));
            }

            si (entrée. Prix <= GetTopPrice())
            {
                return Task.FromResult(CreateResult(false));
            }

            retour HandleCoreAsync ();

            async Task<TryBiddingResult> HandleCoreAsync ()
            {
                var dataEvent = ceci. CreateEvent(nouveau NewBidderEvent
                {
                    Price = entrée. Prix,
                    UserId = entrée. UserId
                });
                attendre Claptrap.HandleEventAsync (dataEvent);
                retour CreateResult (vrai);
            }

            TryBiddingResult CreateResult (succès bool)
            {
                retour nouveau ()
                {
                    Succès = succès,
                    NowPrice = GetTopPrice(),
                    UserId = entrée. UserId,
                    AuctionItemStatus = statut
                };
            }

            décimale GetTopPrice ()
            {
                return StateData.BiddingRecords?. Tout () == vrai
                    ? StateData.BiddingRecords.First(). Clé
                    : StateData.BasePrice;
            }
        }
    }
}
```

Ce code indique que：

1. Les données peuvent être validées via Claptrap State avant de générer des événements pour déterminer s’il faut générer le prochain événement.Cela est nécessaire parce qu’il empêche les événements inutiles.Il est nécessaire en termes de logique opérationnelle, d’espace de persistance ou d’efficacité d’exécution.
2. Une fois que la vérification nécessaire a été faite, vous pouvez `cela. CreateEvent` pour créer un événement.Il s’agit d’une méthode d’extension qui construit certaines des informations sous-jacentes sur Event.Les développeurs n’ont qu’à se soucier de la section de données métier personnalisée.Pour `NewBidderEvent` les données d’entreprise dont les développeurs doivent se préoccuper.
3. Une fois la création de l’événement terminée, vous pouvez enregistrer et exécuter `gérer L'` l’objet Claptrap.Dans cette méthode Claptrap persistera l’événement et appellera Handler pour mettre à jour l’État de Claptrap.Ce qui suit décrit comment écrire Handler
4. Après avoir appelé `HandleEventAsync` , s’il n’y a pas d’erreurs, l’événement a été maintenu avec succès.Et vous pouvez penser que l’État de Claptrap a été mis à jour correctement.Par conséquent, les données les plus récentes peuvent maintenant être lues à partir de l’État et retournées à l’appelant.

### Couche de gestionnaire

La couche Handler est responsable de l’exécution de la logique commerciale de l’événement et de la mise à jour des données à l’État.Parce que l’Événement et l’État sont des objets en mémoire, donc.La mise en œuvre du code du gestionnaire est généralement très simple.Voici le gestionnaire qui `lorsque le` NewBidderEvent est déclenché.

```cs NewBidderEventHandler.cs
en utilisant System.Threading.Tasks;
utilisant HelloClaptrap.Models.AuctionItem;
en utilisant HelloClaptrap.Models.AuctionItem.Events;
en utilisant Newbe.Claptrap;

'espace de nom HelloClaptrap.Actors.AuctionItem.Events
{
    classe publique NewBidderEventHandler
        : NormalEventHandler<AuctionItemState, NewBidderEvent>
    {
        privé readonly IClock _clock;

        public NewBidderEventHandler (
            horloge IClock)
        {
            _clock = horloge;
        }

        public remplace ValueTask HandleEvent (AuctionItemState stateData,
            NewBidderEvent eventData,
            IEventContext eventContext)
        {
            if (stateData.BiddingRecords == null)
            {
                stateData.InitBiddingRecords();
            }

            dossiers var = stateData.BiddingRecords;

            dossiers. Ajouter (eventData.Price, nouvelle offreRecord
            {
                Prix = eventData.Price,
                BiddingTime = _clock. UtcNow,
                UserId = eventData.UserId
            });
            stateData.BiddingRecords = enregistrements;
            retour ValueTask.CompletedTask;
        }
    }
}
```

Ce code indique que：

1. `NewBidderEventHandler` hérité `NormalEventHandler` comme classe de base, qui a été ajoutée principalement pour simplifier les implémentations de gestionnaire.Ses paramètres génériques sont le type d’État correspondant à Claptrap et le type EventData pour Event.
2. Handler implémente la méthode handleevent `héritée de la` normaleventhandler `la` classe.Le but principal de cette méthode est de mettre à jour l’état.

En plus du code évident ci-dessus, il existe d’importants mécanismes de fonctionnement pour Handler qui doivent être expliqués here：

1. Le gestionnaire nécessite une balise sur le type d’acteur correspondant à utiliser.C' `rôle joué par Claptrap Event Handler, ClaptrapCodes.NewBidderEvent` dans AuctionItemActor.
2. Handler implémente `les interfaces` `IAsyncDispose` IDispose.Cela indique que Handler sera créé sur demande lors du traitement des événements.Vous pouvez vous référer aux instructions du cycle de vie des objets du système TODO Claptrap.
3. En raison du mécanisme d’approvisionnement en événements, les développeurs doivent tenir compte de l’idempotentness de la logique `dans la méthode handleEvent` lors de l’écriture handler.En d’autres termes, vous devez vous assurer que les mêmes paramètres `gérerEvent` la méthode handleEvent et obtenir exactement les mêmes résultats.Dans le cas contraire, des résultats inattendus peuvent se produire lorsque la pratique est tracée.Vous pouvez vous référer aux instructions de HOW TODO Events and States Work.

Avec la couche Handler, vous pouvez mettre à jour l’état par le biais d’événements.

## Résumé

Dans cet article, nous couvrons les principaux niveaux de structure du projet et les éléments clés du projet Claptrap.En comprenant ces composants, les développeurs ont été en mesure de comprendre comment exposer les API, générer des événements et mettre à jour l’état.C’est aussi l’étape la plus simple nécessaire pour utiliser Claptrap.

Ensuite, nous allons vous montrer comment utiliser Minion.

<!-- md Footer-Newbe-Claptrap.md -->
