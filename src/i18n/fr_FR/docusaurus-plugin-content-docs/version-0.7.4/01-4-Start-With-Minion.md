---
title: 'Étape 4 - Utilisez des sbires pour passer des commandes de marchandises'
description: 'Étape 4 - Utilisez des sbires pour passer des commandes de marchandises'
---

Avec cette lecture, vous pouvez commencer à essayer de faire des affaires avec Claptrap.

<!-- more -->

## Un résumé d’ouverture

Dans cet article, j’ai appris à utiliser Minion dans un échantillon de projet existant pour compléter le traitement asynchrone de l’entreprise en mettant en œuvre les exigences de « commander des marchandises ».

Tout d’abord, jetez un coup d’œil aux cas d’utilisation des affaires impliqués dans article：

1. L’utilisateur peut passer une commande, qui sera placée en utilisant tous les SSUs dans le panier actuel pour former une commande.
2. L’inventaire de la SKU concernée sera déduit une fois la commande effectuée.Si un SKU est en rupture de stock, l’ordre échoue.
3. La commande est seulement jusqu’à ce que la déduction d’inventaire soit réussie, et les étapes suivantes n’exigent pas la portée de cette discussion d’échantillon.Par conséquent, une fois cet exemple placé avec succès, un enregistrement de commande est généré dans la base de données pour indiquer la fin de la création de la commande.

Bien que cet article se concentre sur l’utilisation de Minion, il nécessite une connaissance de l’ancien « Defining Claptrap » en raison de la nécessité d’utiliser un nouvel objet OrderGrain.

Minion est un Claptrap spécial, et sa relation avec MasterClaptrap est montrée dans les image：

![Minion](/images/20190228-002.gif)

Son principal processus de développement est similaire à celui de Claptrap, avec seulement quelques coupes.Comparez les following：

| Étapes                               | Claptrap | Minion |
| ------------------------------------ | -------- | ------ |
| Décrivez ClaptrapTypeCode            | √        | √      |
| Décrivez State                       | √        | √      |
| Décrivez l’interface Grain           | √        | √      |
| Mettre en œuvre le grain             | √        | √      |
| Inscrivez-vous à Grain               | √        | √      |
| Décrivez EventCode                   | √        |        |
| Décrivez Event                       | √        |        |
| Implémenter EventHandler             | √        | √      |
| Inscrivez-vous à EventHandler        | √        | √      |
| Implémenter IInitialStateDataFactory | √        | √      |

La raison de cette réduction est que, parce que Minion est un consommateur d’événements pour Claptrap, la définition de l’événement lié n’a pas besoin d’être traitée.Mais d’autres parties sont encore nécessaires.

> Au début de cet article, nous n’énumérerons plus l’emplacement spécifique du fichier du code pertinent, en espérant que les lecteurs seront en mesure de trouver leur propre dans le projet, afin de maîtriser.

## Implémenter OrderGrain

Sur la base des connaissances liées à la précédente « Defining Claptrap », nous implémentons ici un OrderGrain pour représenter l’opération ordre.Pour économiser de l’espace, nous n’énumérons que les parties clés de celui-ci.

### OrderState (en)

L’état de l’ordre est défini：

```cs
en utilisant System.Collections.Generic;
en utilisant Newbe.Claptrap;

'espace de nom HelloClaptrap.Models.Order
{
    public class OrderState : IStateData
    {
        public bool OrderCreated { get; ensemble; }
        chaîne publique UserId { get; ensemble; }
        dictionnaire public<string, int> Skus { get; ensemble; }
    }
}
```

1. OrderCreated indique si l’ordre a été créé et évite de créer l’ordre à plusieurs reprises
2. UserId sous l’iD utilisateur unique
3. Les commandes de Skus contiennent des SkuIds et commandent des quantités

### OrderCreatedEvent (OrderCreatedEvent)

L’événement de création d’ordre est défini comme follows：

```cs
en utilisant System.Collections.Generic;
en utilisant Newbe.Claptrap;

'espace de nom HelloClaptrap.Models.Order.Events
{
    public class OrderCreatedEvent : IEventData
    {
        chaîne publique UserId { get; ensemble; }
        dictionnaire public<string, int> Skus { get; ensemble; }
    }
}
```

### CommanderGrain

```cs
en utilisant System.Threading.Tasks;
en utilisant HelloClaptrap.Actors.Order.Events;
en utilisant HelloClaptrap.IActor;
utilisant HelloClaptrap.Models;
utilisant HelloClaptrap.Models.Order;
en utilisant HelloClaptrap.Models.Order.Events;
en utilisant Newbe.Claptrap;
en utilisant Newbe.Claptrap.Orleans;
en utilisant Orléans;

namespace HelloClaptrap.Actors.Order
{
    [ClaptrapEventHandler(typeof(OrderCreatedEventHandler), ClaptrapCodes.OrderCreated)]
    public class OrderGrain : ClaptrapBoxGrain<OrderState>, IOrderGrain
    {
        private readonly IGrainy _grainFactory;

        public OrderGrain (IClaptrapGrainCommonService claptrapGrainCommonService,
            IGrainFactory grainFactory)
            : base (claptrapGrainCommonService)
        {
            _grainFactory = grainFactory;
        }

        public async Task CreateOrderAsync (CreateOrderInput entrée)
        {
            var orderId = Claptrap.State.Identity.Id;
            // exception de lancer si l’ordre a déjà créé
            si (StateData.OrderCreated)
            {
                jeter de nouveaux BizException ($"ordre avec id de commande déjà créé: {orderId}« );
            }

            // obtenir des articles de panier
            var cartGrain = _grainFactory.GetGrain<ICartGrain>(entrée. CartId);
            var articles = attendre cartGrain.GetItemsAsync ();

            // mise à jour de l’inventaire pour chaque sku
            avant (var (skuId, compte) en articles)
            {
                var skuGrain = _grainFactory.GetGrain<ISkuGrain>(skuId);
                attendons skuGrain.UpdateInventoryAsync (-compte);
            }

            // retirez tous les articles du panier
            attendez cartGrain.RemoveAllItemsAsync();

            // créer un ordre
            var evt = ceci. CreateEvent(new OrderCreatedEvent
            {
                UserId = entrée. UserId,
                Skus = éléments
            });
            attendre Claptrap.HandleEventAsync (evt);
        }
    }
}
```

1. OrderGrain met en œuvre la logique de base de la création de commandes, où la méthode CreateOrderAsync complète l’acquisition de données de panier d’achat et les actions liées à la déduction des stocks.
2. Les champs pertinents dans l’État seront mis à jour après que orderCreatedEvent a été exécuté avec succès et ne sont plus répertoriés ici.

## Enregistrer les données de commande dans la base de données via Minion

Du début de la série à cela, nous n’avons jamais mentionné les opérations liées à la base de données.Parce que lorsque vous utilisez le framework Claptrap, la grande majorité des opérations ont été remplacées par « écrire à des événements » et « mises à jour de l’état », vous n’avez pas besoin d’écrire des opérations de base de données vous-même à tous.

Toutefois, comme Claptrap est généralement conçu pour un seul objet (une commande, un SKU, un panier), il n’est pas possible d’obtenir toutes les données (toutes les commandes, toutes les SCU, tous les caddies).À ce stade, vous devez persister les données d’état dans une autre structure de persistance (base de données, fichier, cache, etc.) afin de remplir des requêtes ou d’autres opérations pour l’ensemble de la situation.

Le concept de Minion a été introduit dans le cadre claptrap pour répondre à ces exigences.

Ensuite, nous introduisons un OrderDbGrain (un Minion) dans l’échantillon pour compléter asynchronement l’opération de commande de OrderGrain.

## Décrivez ClaptrapTypeCode

```cs
  namespace HelloClaptrap.Models
  {
      classe statique publique ClaptrapCodes
      {
          #region Cart

          chaîne de const publique CartGrain = « cart_claptrap_newbe »;
          chaîne de const privée CartEventSuffix = « _e_ » + CartGrain;
          chaîne de const publique AddItemToCart = « addItem » + CartEventSuffix;
          chaîne de const publique RemoveItemFromCart = « removeItem » + CartEventSuffix;
          chaîne de const publique RemoveAllItemsFromCart = « remoeAllItems » + CartEventSuffix;

          #endregion

          #region Sku

          chaîne de const public SkuGrain = « sku_claptrap_newbe »;
          chaîne de const privée SkuEventSuffix = « _e_ » + SkuGrain;
          chaîne de const publique SkuInventoryUpdate = « inventoryUpdate » + SkuEventSuffix;

          #endregion

          #region Ordre

          chaîne de const public OrderGrain = « order_claptrap_newbe »;
          chaîne de const privée OrderEventSuffix = « _e_ » + OrderGrain;
          chaîne de const public OrderCreated = « orderCreated » + OrderEventSuffix;

+ chaîne de const public OrderDbGrain = « db_order_claptrap_newbe »;

          #endregion
      }
  }
```

Minion est un Claptrap spécial, en d’autres termes, c’est aussi un Claptrap.ClaptrapTypeCode est nécessaire pour Claptrap et doit être ajouté à cette définition.

## Décrivez State

Étant donné que cet échantillon n’a besoin que d’écrire un enregistrement de commande à la base de données et ne nécessite aucune donnée dans l’État, cette étape n’est pas réellement nécessaire dans cet échantillon.

## Décrivez l’interface Grain

```cs
+ en utilisant HelloClaptrap.Models;
+ en utilisant Newbe.Claptrap;
+ en utilisant Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.IActor
+ {
+ [ClaptrapMinion (ClaptrapCodes.OrderGrain)]
+ [ClaptrapState (typeof (NoneStateData), ClaptrapCodes.OrderDbGrain)]
+ interface publique IOrderDbGrain : IClaptrapMinionGrain
+ {
+ }
+ }
```

1. ClaptrapMinion est utilisé pour marquer le grain comme un minion, où code pointe vers son MasterClaptrap correspondant.
2. ClaptrapState est utilisé pour marquer le type de données d’État de Claptrap.Dans l’étape précédente, nous avons clairement indiqué que le Minion n’a pas besoin de StateData, alors utilisez NoneStateData au lieu du type intégré du cadre.
3. IClaptrapMinionGrain est l’interface Minion qui diffère d’IClaptrapGrain.Si un Grain est Minion, vous devez hériter de l’interface.
4. ClaptrapCodes.OrderGrain et ClaptrapCodes.OrderDbGrain sont deux chaînes différentes, et j’espère que le lecteur n’est pas un patrist interstellaire.

> Star Master：En raison du rythme rapide de la compétition StarCraft, la quantité d’informations, les joueurs peuvent facilement ignorer ou mal juger certaines des informations, si souvent « les joueurs ne voient pas les événements clés qui se produisent sous le nez » erreurs drôles.Les joueurs plaisantent donc sur le fait que les joueurs interstellaires sont aveugles (il y avait vraiment un duel aveugle et professionnel), plus le segment est élevé, plus les joueurs interstellaires aveugles et professionnels sont aveugles.

## Mettre en œuvre le grain

```cs
+ en utilisant System.Collections.Generic;
+ en utilisant System.Threading.Tasks;
+ en utilisant HelloClaptrap.Actors.DbGrains.Order.Events;
+ en utilisant HelloClaptrap.IActor;
+ en utilisant HelloClaptrap.Models;
+ en utilisant Newbe.Claptrap;
+ en utilisant Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.Actors.DbGrains.Order
+ {
+ [ClaptrapEventHandler (typeof (OrderCreatedEventHandler), ClaptrapCodes.OrderCreated)]
+ classe publique OrderDbGrain : ClaptrapBoxGrain<NoneStateData>, IOrderDbGrain
+ {
+ Public OrderDbGrain (IClaptrapGrainCommonService claptrapGrainCommonService)
+ : base (claptrapGrainCommonService)
+ {
+ }
+
+ public async Task MasterEventReceivedAsync (I Evénements<IEvent> )
+ {
+ foreach (var @event dans les épreuves)
+ {
+ attendre Claptrap.HandleEventAsync (@event);
+ }
+ }
+
+ tâche publique WakeAsync ()
+ {
+ retour Task.CompletedTask;
+ }
+ }
+ }
```

1. MasterEventReceivedAsync est une méthode définie à partir d’IClaptrapMinionGrain qui signifie recevoir des notifications d’événements de MasterClaptrap en temps réel.N’élargissez pas la description ici, il suffit de suivre le modèle ci-dessus.
2. WakeAsync est la méthode définie à partir d’IClaptrapMinionGrain, qui représente le réveil actif de Minion par MasterClaptrap.N’élargissez pas la description ici, il suffit de suivre le modèle ci-dessus.
3. Lorsque le lecteur regarde le code source, il constate que la classe est définie séparément dans un assemblage.Ce n’est qu’une méthode de classification qui peut être comprise comme classant Minion et MasterClaptrap dans deux projets différents.En fait, ce n’est pas un problème de le mettre ensemble.

## Inscrivez-vous à Grain

Ici, parce que nous définissons OrderDbGrain dans une assemblée séparée, un enregistrement supplémentaire est nécessaire pour cette assemblée.Comme follows：

```cs
  en utilisant le système;
  utilisant Autofac;
  utilisant HelloClaptrap.Actors.Cart;
  en utilisant HelloClaptrap.Actors.DbGrains.Order;
  en utilisant HelloClaptrap.IActor;
  'utilisation de HelloClaptrap.Repository;
  'utilisation de Microsoft.AspNetCore.Hosting;
  'utilisation de Microsoft.Extensions.Hosting;
  'utilisation de Microsoft.Extensions.Logging;
  en utilisant Newbe.Claptrap;
  utilisant Newbe.Claptrap.Bootstrapper;
  en utilisant NLog.Web;
  'utilisation d’Orléans;

  'espace de nom HelloClaptrap.BackendServer
  {
      public class Program
      {
          public statique void Main (string[] args)
          {
              var logger = NLogBuilder.ConfigureNLog (« nlog.config »). GetCurrentClassLogger();
              essayez
              {
                  enregistreur. Debug (« init main »);
                  CreateHostBuilder (args). Construire(). Exécuter ();
              }
              capture (exception d’exception)
              {
                  //NLog : erreurs de configuration de capture
                  enregistreur. Erreur (exception, « Programme arrêté à cause de l’exception »);
                  lancer;
              }
              enfin
              {
                  // Assurez-vous de rincer et d’arrêter les temps/threads internes avant la sortie de l’application (Éviter les défauts de segmentation sur Linux)
                  NLog.LogManager.Shutdown();
              }
          }

          public statique IHostBuilder CreateHostBuilder (string[] args) =>
              Host.CreateDefaultBuilder (args)
                  . ConfigureWebHostDefaults (webBuilder => { webBuilder.UseStartup<Startup>(); })
                  . UseClaptrap (
                      constructeur =>
                      {
                          constructeur
                              . ScanClaptrapDesigns(nouveau[]
                              {
                                  type de (ICartGrain). assemblage,
                                  type de (CartGrain). Assemblage,
+ type de (OrderDbGrain). Assemblage
                              })
                              . ConfigureClaptrapDesign(x =>
                                  x.ClaptrapOptions.EventCenterOptions.EventCenterType = EventCenterType.OrleansClient);
                      },
                      constructeur => { constructeur. RegisterModule<RepositoryModule>(); })
                  . UseOrleansClaptrap ()
                  . UseOrleans (constructeur => constructeur. UseDashboard (options = options> options. Port = 9000))
                  . ConfigureLogging (journalisation =>
                  {
                      journalisation. ClearProviders();
                      'exploitation forestière. SetMinimumLevel (LogLevel.Trace);
                  })
                  . UseNLog();
      }
  }
```

## Implémenter EventHandler

```cs
+ en utilisant System.Threading.Tasks;
+ en utilisant HelloClaptrap.Models.Order.Events;
+ en utilisant HelloClaptrap.Repository;
+ en utilisant Newbe.Claptrap;
+ en utilisant Newtonsoft.Json;
+
+ namespace HelloClaptrap.Actors.DbGrains.Order.Events
+ {
+ public class OrderCreatedEventHandler
+ : NormalEventHandler<NoneStateData, OrderCreatedEvent>
+ {
+ private readonly IOrderRepository _orderRepository;
+
+ Ordre publicCreatedEventHandler (
+ IOrderRepository orderRepository)
+ {
+ _orderRepository = orderRepository;
+ }
+
+ remplacement public async ValueTask HandleEvent (NoneStateData stateData,
+ OrderCreatedEvent eventData,
+ IEventContext eventContext)
+ {
+ var orderId = eventContext.State.Identity.Id;
+ attendez _orderRepository.SaveAsync (eventData.UserId, orderId, JsonConvert.SerializeObject (eventData.Skus));
+ }
+ }
+ }
```

1. IOrderRepository est une interface qui fonctionne directement sur le niveau de stockage pour l’ajout et la suppression des commandes.L’interface est appelée ici pour implémenter le fonctionnement entrant de la base de données de commande.

## Inscrivez-vous à EventHandler

En fait, pour économiser de l’espace, nous nous sommes inscrits dans le code de la section « Implement Grain ».

## Implémenter IInitialStateDataFactory

Étant donné que StateData n’a pas de définition particulière, il n’est pas nécessaire de mettre en œuvre IInitialStateDataFactory.

## Modifier le contrôleur

Dans l’exemple, nous avons ajouté OrderController pour passer des commandes et des ordres de requête.Les lecteurs peuvent le voir au code source.

Les lecteurs peuvent utiliser les étapes suivantes pour effectuer une expérience：

1. POST `/api/cart/123` « "skuId »: « yueluo-666 », « count »:30 » ajouter 30 unités de concentré yueluo-666 au panier 123.
2. POST `/api/order` « userId »: « 999 », « cartId »: « 123" » comme 999 userId, à partir du panier 123 pour passer une commande.
3. Obtenez `/api/order` peuvent être consultés via l’API après que la commande a été passée avec succès.
4. GET `/api/sku/yueluo-666` l’API SKU peut afficher le solde des stocks une fois la commande commandée.

## Résumé

À ce stade, nous avons rempli la « commande de marchandises » cette exigence du contenu de base.Cet exemple vous donne un premier regard sur la façon dont plusieurs Claptraps peuvent travailler ensemble et comment utiliser Minion pour accomplir des tâches asynchrones.

Toutefois, il y a un certain nombre de questions dont nous discuterons plus tard.

Vous pouvez obtenir le code source de cet article à partir de la address：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee ( Gitee )](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
