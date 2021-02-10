---
title: 'Étape 4 - Utilisez Minion pour passer une commande pour un produit.'
metaTitle: 'Étape 4 - Utilisez Minion pour passer une commande pour un produit.'
metaDescription: 'Étape 4 - Utilisez Minion pour passer une commande pour un produit.'
---

Avec cet article, vous pouvez commencer à essayer de faire des affaires avec Claptrap.

> [La version actuellement vue est le résultat chinois machine simplifiée traduit auto-vérification et corrections manuelles.S’il y a une traduction incorrecte dans le document, veuillez cliquer ici pour soumettre vos suggestions de traduction.](https://crwd.in/newbeclaptrap)

<!-- more -->

## Résumé d’ouverture.

Dans cet article, j’ai appris comment Minion peut être utilisé pour effectuer le traitement asynchrone des affaires dans les échantillons de projets existants en mettant en œuvre les exigences de la « commande de marchandises ».

Tout d’abord, jetez un oeil aux cas d’utilisation des affaires qui doivent être couverts dans cette article：

1. L’utilisateur peut passer une commande, qui forme une commande à l’aide de tous les SKU dans le panier d’achat actuel.
2. L’inventaire des SKU pertinents sera déduit après la commande.Si un SKU est en rupture de stock, l’ordre échoue.
3. L’opération de commande n’est réussie que jusqu’à ce que l’inventaire soit déduit avec succès, et les étapes suivantes ne nécessitent pas la portée de cette discussion d’exemple.Par conséquent, cet exemple génère un enregistrement de commande dans la base de données après le passé d’une commande réussie, indiquant la fin de la création de la commande.

Bien que l’accent de cet article est sur l’utilisation de Minion, en raison de la nécessité d’utiliser un nouvel objet OrderGrain, vous devez toujours utiliser l’article précédent « Définition Claptrap » connaissances connexes.

Minion est un type spécial de Claptrap, et sa relation avec MasterClaptrap est montré dans les：suivants

![Minion.](/images/20190228-002.gif)

Son principal processus de développement est similaire à celui de Claptrap, avec seulement quelques limitations.La comparaison est aussi follows：

| Étapes.                                   | Claptrap. | Minion. |
| ----------------------------------------- | --------- | ------- |
| Décrivez ClaptrapTypeCode.                | √.        | √.      |
| Définir État.                             | √.        | √.      |
| Définissez l’interface Grain.             | √.        | √.      |
| Mettre en œuvre grain.                    | √.        | √.      |
| Inscrivez-vous à Grain.                   | √.        | √.      |
| Définissez EventCode.                     | √.        |         |
| Décrivez Événement.                       | √.        |         |
| Implémentez le gestionnaire d’événements. | √.        | √.      |
| Inscrivez-vous à EventHandler.            | √.        | √.      |
| Implémenter IInitial State Data Factory.  | √.        | √.      |

La raison de cette suppression est que, parce que Minion est le consommateur d’événements claptrap, les définitions liées à l’événement n’ont pas besoin d’être traitées.Mais le reste est encore nécessaire.

> Au début de cet article, nous ne répertorierons plus les emplacements de fichiers spécifiques où se trouve le code pertinent, et nous espérons que le lecteur sera en mesure de le découvrir par lui-même dans le projet afin qu’il puisse le maîtriser.

## Implémenter OrderGrain.

Sur la base des connaissances précédentes « Defining Claptrap », nous avons mis en œuvre un OrderGrain ici pour représenter l’opération de commande.Pour économiser de l’espace, nous n’énumérons que les éléments clés de celui-ci.

### OrderState.

L’état de l’ordre est défini comme follows：

```cs
Systems.Collections.Generic;
. Newbe.Claptrap;

'espace de noms HelloClaptrap.Models.Order
s
    état de l’ordre de classe publique : IStateData
    s
        public bool OrderCreated s get; set; s
        public user stringId s get; set; s
        public Dictionary<string, int> Skus sned; set; s

s.
```

1. OrderCreated indique si un ordre a été créé, évitant ainsi la création de l’ordre à plusieurs reprises.
2. UserId passe une commande pour un ID utilisateur.
3. Les commandes skus contiennent des SkuIds et des volumes de commandes.

### OrderCreatedEvent.

Les événements de création d’ordre sont définis comme follows：

```cs
Systems.Collections.Generic;
. Newbe.Claptrap;

'espace de noms HelloClaptrap.Models.Order.Events

    classe publique OrderCreatedEvent : IeventData
    . . . .
        chaîne publique UserId . . . . set; . . . .
        Dictionnaire public<string, int> Skus

    . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

### OrderGrain.

```cs
Utilisation de System.Threading.Tasks ;
Les États-Unis, Hello Claptrap.Actors.Order.Events;
Les années 1990, HelloClaptrap.IActor;
Les États-Unis Ofsing HelloClaptrap.Models;
.Models.Order;
.HelloClaptrap.Models.Order.Events;
.Claptrap;
Newbe.Claptrap.Orleans;
Orléans;

'espace de noms HelloClaptrap.Actors.Order

    (OrderCreatedEventHandler, ClaptrapCodes.OrderCreated)
    Grain d’ordre de classe publique : ClaptrapBox Grain<OrderState>, IOrder Grain
    _grainFactory
        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

        . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . IClaptrapGrainCommonService Claptrap Grain Common Services,
            IGrain Factory GrainFactory)
            : base (claptrapGrainCommonService)
        s
            _grainFactory s grainfactory;
        s

        publicsync Task CreateOrder Agent Async (CreateOrderInput)

            var orderid s claptrap.state.Identity. y.Id;
            // jeter exception si l’ordre déjà créé
            si (StateData.OrderCreated)

                nouvelle bizException ($"order with order id already created: {orderId} »);


            // obtenir des articles du chariot
            var cartGrain _grainFactory.GetGrain<ICartGrain>(entrée. CartId);
            articles var - attendez cartGrain.GetItemsAsync();

            // mise à jour de l’inventaire pour
            'avant-match (skuId, count) dans les articles)

                var skuGrain , _grainFactory.GetGrain<ISkuGrain>(skuId);
                attendent skuGrain.UpdateInventoryAsync (-count);
            . . .

            // Supprimer tous les articles du panier
            attendent cartGrain.Re. moveAllItemsAsync();

            // créer un
            var evt . . . ceci. CreateEvent (nouvelle entrée
                OrderCreatedEvent
            userid. UserId,
                Skus - éléments
            ) );
            .HandleEventAsync (evt);



```

1. OrderGrain implémente la logique de base de la création d’ordres, où la méthode CreateOrderAsync complète l’acquisition de données de panier d’achat, les actions liées à la déduction des stocks.
2. Les champs pertinents dans l’État seront mis à jour après l’exécution réussie de OrderCreatedEvent, qui n’est plus répertoriée ici.

## Enregistrez les données de commande dans la base de données via Minion.

Depuis le début de la série jusqu’à cela, nous n’avons jamais mentionné les opérations liées à la base de données.Étant donné que lorsque vous utilisez le cadre Claptrap, la grande majorité des opérations ont été remplacées par Écrit aux événements et mises à jour d’état, de sorte que vous n’avez pas besoin d’écrire vos propres opérations de base de données.

Toutefois, comme Claptrap est généralement conçu pour les objets unitaires (un ordre, un SKU, un panier), il n’est pas possible d’obtenir des données pour tous (toutes les commandes, tous les SKU, tous les chariots).À ce stade, les données d’état doivent être maintenues dans une autre structure persistante (base de données, fichier, cache, etc.) afin de compléter les requêtes ou d’autres opérations pour l’ensemble de la situation.

Le concept de Minion a été introduit dans le cadre Claptrap pour répondre à ces exigences.

Ensuite, nous introduisons un OrderDbGrain (un Minion) dans l’exemple pour terminer l’opération d’entrée de commande de OrderGrain de façon asynchrone.

## Décrivez ClaptrapTypeCode.

```cs
  namespace HelloClaptrap.Models

      classe statique publique ClaptrapCodes

          #region Cart

          public et const string CartGrain s « cart_claptrap_newbe »;
          chaîne privée const CartEventSuffix, « """"""""""""""""""""""""""""""""""""
          
          """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" » Tring RemoveItemFromCart - « RemoveItem » - CartEventSuffix;
          public de publicité const String Remove AllItems FrommCart , « Remoe AllItems » , CartEventSuffix;

          #endregion

          #region Sku

          publicité publique et skuGrain - « sku_claptrap_newbe »;
          la chaîne privée SkuEventSuffix . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
          publicité publique et skuInventoryUpdate , « inventoryUpdate », SkuEventSuffix;

          #endregion

          #region’ordre

          'ordre publicGrain , " order_claptrap_newbe « ;
          la chaîne privée privée de const OrderEventSuffix . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
          public et du public et de l’ordre créé, « ordercreated » , et l’ordreEventSuffix;

le public, le public et le public à enchaîner OrderDbGrain, « db_order_claptrap_newbe » ;

          #endregion
      . . .
  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

Minion est un type spécial de Claptrap, en d’autres termes, c’est aussi une sorte de Claptrap.ClaptrapTypeCode est nécessaire pour Claptrap et doit donc être ajouté.

## Définir État.

Étant donné que cet exemple n’a besoin que d’écrire un enregistrement de commande dans la base de données et ne nécessite aucune donnée dans l’État, cette étape n’est pas réellement requise dans cet exemple.

## Définissez l’interface Grain.

```cs
Utilisation de HelloClaptrap.Models;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
+
+ espace de noms HelloClaptrap.IActor
+ {
+ [ClaptrapMinion(ClaptrapCodes.OrderGrain)]
+ [ClaptrapState((typeof(NoneStateData), ClaptrapCodes.OrderDbGrain)]
+ interface publique IOrderDbGrain : IClaptrapMinionGrain
+ {
+ }
+ }
```

1. ClaptrapMinion est utilisé pour marquer le grain comme un Minion, où Code pointe vers son MasterClaptrap correspondant.
2. ClaptrapState est utilisé pour marquer le type de données d’état de Claptrap.Dans l’étape précédente, nous avons précisé que le Minion n’a pas besoin de StateData, donc nous utilisons NoneStateData comme un type intégré de cadre à la place.
3. IClaptrapMinionGrain est une interface Minion qui diffère d’IclaptrapGrain.Si un Grain est Minion, vous devez hériter de l’interface.
4. ClaptrapCodes.OrderGrain et ClaptrapCodes.OrderDbGrain sont deux chaînes différentes, et j’espère que le lecteur n’est pas un maître interstellaire.

> Star Master：Parce que StarCraft est rapide et a une grande quantité d’informations, il est facile pour les joueurs d’ignorer ou de mal juger certaines des informations, si souvent « les joueurs ne voient pas les événements clés qui se produisent sous le nez » erreurs drôles.Les joueurs plaisantent donc que les joueurs interstellaires sont aveugles (il y avait une fois une véritable épreuve de force entre les joueurs aveugles et professionnels), plus le segment, plus la cécité, les joueurs professionnels interstellaires sont aveugles.

## Mettre en œuvre grain.

```cs
Utilisation de Systems.Collections.Generic;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
chantent HelloClaptrap.IActor;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
,
, l’espace de noms HelloClaptrap.Actors.DbGrains.Order
,
et ClaptrapEventHandler , ClaptrapCodes . OrderCreated)
et la classe publique OrderDbGrain : ClaptrapBoxgrain<NoneStateData>, IOrderDbGrain
,
, Public OrderDbGrain (IclapGrain CommonService). claptrapGrainCommonService)
+ : base(claptrapGrainCommonService)
+ {
+ }
+
+ public async Task MasterEventReceivedAsync(I Événements<IEvent> numérotables)
+ {
+ avant-@event dans les événements)
+ {
+ attendre Claptrap.HandleEventAsync(@event);

,
,
,  , public WakeAsync ()
,
, retour Task.CompletedTask,
,
,
.
```

1. MasterEventReceivedAsync est une méthode définie à partir d’IClaptrapMinionGrain qui signifie recevoir des notifications d’événements de MasterClaptrap en temps réel.Sans élargir la description ici, suivez le modèle ci-dessus.
2. WakeAsync est une méthode définie à partir d’IClaptrapMinionGrain, qui représente le réveil actif de Minion de MasterClaptrap.Sans élargir la description ici, suivez le modèle ci-dessus.
3. Lorsque le lecteur affiche le code source, il constate que la classe est définie séparément dans un assembly.Il s’agit simplement d’une classification qui peut être comprise comme plaçant Minion et MasterClaptrap dans deux projets différents.En fait, ce n’est pas un problème de le mettre ensemble.

## Inscrivez-vous à Grain.

Ici, parce que nous définissons OrderDbGrain dans un assembly séparé, nous devons enregistrer l’assembly en plus.Comme suit,：

```cs
  Utilisation du système;
  à l’aide d’Autofac;
  . Hening HelloClaptrap.Actors.Cart;
  .HelloClaptrap.Actors.DbGrains.Order;
  .IActor;
  s service général, HelloClaptrap.Repository;
  .AspNetCore.Hosting;
  .Extensions.Hosting;
  .Extensions.Logging ;
  .Claptrap;
  newbe.Claptrap.Bootstrapper;
  NLog.Web;
  Orléans;

  'espace de noms HelloClaptrap.BackendServer

      programme public

          public statique vide principal (chaîne)

              var logger , NLogBuilder.ConfigureNLog (« nlog.config »). GetCurrentClassLogger ();
              essayez
              .
                  logger. Débogage (« init main »);
                  CreateHostBuilder (args). Build(). Exécuter ();

              catch (exception exception)

                  //NLog : erreurs de configuration de capture
                  enregistreur. Erreur (exception, « Programme arrêté en raison d’exception ») ;
                  lancer;

              enfin

                  // Assurez-vous de rincer et d’arrêter les minuteries/threads internes avant la sortie de l’application
                  NLog.LogManager.Shutdown();
              . . .
          . . . .

          publicité statique IHostBuilder (chaîne)>
              . CreateDefaultBuilder (args)
                  . ConfigureWebHostDefaults (webBuilder> . .<Startup>. . . . . . .
                  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . UseClaptrap (
                      Builders>

                          Builder
                              . ScanClaptrapDesigns (nouveau)

                                  typeof (ICartGrain). Assembly,
                                  typeof (CartGrain). Assembly,
et Typeof (OrderDbGrain).
                              de l’Assemblée
                              . ConfigureClapTrapDesign (x .>
                                  x. Options Claptrap. Options EventCenter. EventCenterType . . . EventCenterType.Orleans Client);
                      , constructeur
> constructeur. RegisterModule<RepositoryModule>(); )
                  . UseOrleans Claptrap()
                  . UseOrleans (constructeurs -> constructeurs. UseDashboards (options> options. Port s 9000))
                  . ConfigureLogging (journalisation )>
                  .
                      la journalisation. ClearProviders ();
                      l’exploitation forestière. SetMinimumLevel (LogLevel.Trace);
                  )
                  . UseNLog();
      . . .
  . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

## Implémentez le gestionnaire d’événements.

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Order.Events;
+ using HelloClaptrap.Repository;
+ using Newbe.Claptrap;
+ using Newtonsoft.Json;
+
+ namespace HelloClaptrap.Actors.DbGrains.Order.Events
+ {
+     public class OrderCreatedEventHandler
+         : NormalEventHandler<NoneStateData, OrderCreatedEvent>
+     {
+         private readonly IOrderRepository _orderRepository;
+
+         public OrderCreatedEventHandler(
+             IOrderRepository orderRepository)
+         {
+             _orderRepository = orderRepository;
+         }
+
+         public override async ValueTask HandleEvent(NoneStateData stateData,
+             OrderCreatedEvent eventData,
+             IEventContext eventContext)
+         {
+             var orderId = eventContext.State.Identity.Id;
+             await _orderRepository.SaveAsync(eventData.UserId, orderId, JsonConvert.SerializeObject(eventData.Skus));
+         }
+     }
+ }
```

1. IOrderRepository est une interface qui fonctionne directement sur le niveau de stockage pour le module de complément et la suppression des commandes.L’interface est appelée ici pour implémenter le fonctionnement de stockage de la base de données de commande.

## Inscrivez-vous à EventHandler.

En fait, pour économiser de l’espace, nous nous sommes inscrits dans le code de la section « Mettre en œuvre le grain ».

## Implémenter IInitial State Data Factory.

Étant donné que StateData n’a pas de définition spéciale, il n’est pas nécessaire d’implémenter IInitial StateData Factory.

## Modifier le contrôleur.

Dans l’exemple, nous avons ajouté OrderController pour passer des commandes et des ordres de requête.Les lecteurs peuvent le voir dans le code source.

Les lecteurs peuvent utiliser les étapes suivantes pour tester le：réel

1. POST `/api/cart/123` « skuId »: « yueluo-666 », « count »: 30 » au panier de 123 pour ajouter 30 unités de concentré yueluo-666.
2. POST `/api/order` ( « userId »: « 999 », « cartId »: « 123 ») comme 999 userId, à partir du panier 123 pour passer une commande.
3. GET `/api/order` la commande peut être visualisée via l’API après que la commande a été placée avec succès.
4. GET `/api/sku/yueluo-666` pouvez afficher le solde de l’inventaire après la commande est faite via l’API SKU.

## Résumé.

À ce stade, nous avons terminé la « commande de marchandises » cette demande pour le contenu de base.Cet exemple fournit une première compréhension de la façon dont plusieurs Claptraps peuvent travailler ensemble et comment Minion peut être utilisé pour accomplir des tâches asynchrones.

Toutefois, il y a encore des questions dont nous discuterons plus tard.

Vous pouvez obtenir le code source de cet article à partir de la：suivante

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart4/HelloClaptrap)
