---
title: "Étape 2 - Affaires simples, videz votre panier"
description: "Étape 2 - Affaires simples, videz votre panier"
---

Avec cette lecture, vous pouvez commencer à essayer de faire des affaires avec Claptrap.

<!-- more -->

## Un résumé d’ouverture

Dans cet article, j’ai appris à ajouter une mise en œuvre d’entreprise à un échantillon de projet existant en mettant en œuvre la nécessité de « vider le panier ».

Les étapes suivantes sont principalement included：

1. Décrivez EventCode
2. Décrivez Event
3. Implémenter EventHandler
4. Inscrivez-vous à EventHandler
5. Modifier l’interface Grain
6. Mettre en œuvre le grain
7. Modifier le contrôleur

Il s’agit d’un processus ascendant, et le développement dans le processus de codage réel peut également être implémenté de haut en bas.

## Décrivez Event Code

EventCode est le code unique pour chaque événement du système Claptrap.Il joue un rôle important dans l’identification et la sérialisation des événements.

Ouvrez`la classe de`ClaptrapCodes`le HelloClaptrap.`projet.

Ajoutez EventCode pour les événements empty shopping cart.

```cs
  namespace HelloClaptrap.Models
  {
      public static class ClaptrapCodes
      {
          public const string CartGrain = "cart_claptrap_newbe";
          private const string CartEventSuffix = "_e_" + CartGrain;
          public const string AddItemToCart = "addItem" + CartEventSuffix;
          public const string RemoveItemFromCart = "removeItem" + CartEventSuffix;
+         public const string RemoveAllItemsFromCart = "remoeAllItems" + CartEventSuffix;
      }
  }
```

## Décrivez Event

L’événement est la clé de l’approvisionnement en événements.Utilisé pour changer d’État à Claptrap.Et l’événement est persisté à la couche de persistance.

Créez`RemoveAllItems FromCartEvent``sous le dossier Cart/Events`du projet HelloClaptrap.Models.

Ajouter les éléments code：

```cs
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Cart.Events
+ {
+     public class RemoveAllItemsFromCartEvent : IEventData
+     {
+     }
+ }
```

Parce que dans ce scénario d’affaires simple, vider un panier ne nécessite pas de paramètres spécifiques.Par conséquent, il suffit de créer un type vide.

`interface`IEventData est une interface vide dans le cadre qui représente les événements et est utilisée dans les inférences génériques.

## Implémenter EventHandler

EventHandler 用于将事件更新到 Claptrap 的 State 上。Par exemple, dans ce scénario d’entreprise, EventHandler est responsable de vider le contenu du panier d’État.

Créez`supprimer tous les membres de la classeCartEventHandler sous le dossier Cart/Events`du projet HelloClaptrap.Actors.

Ajouter les éléments code：

```cs
+ using System.Threading.Tasks;
+ using HelloClaptrap.Models.Cart;
+ using HelloClaptrap.Models.Cart.Events;
+ using Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Cart.Events
+ {
+     public class RemoveAllItemsFromCartEventHandler
+         : NormalEventHandler<CartState, RemoveAllItemsFromCartEvent>
+     {
+         public override ValueTask HandleEvent(CartState stateData,
+             RemoveAllItemsFromCartEvent eventData,
+             IEventContext eventContext)
+         {
+             stateData.Items = null;
+             return new ValueTask();
+         }
+     }
+ }
```

Voici quelques points communs questions：

1. Qu’est-ce que NormalEventHandler?

   NormalEventHandler est une classe de base simple définie par le cadre pour une mise en œuvre facile de Handler. Le premier paramètre générique est le type d’État pour Claptrap.Combiné avec le document précédent, notre type d’état de chariot est CartState. Le deuxième paramètre générique est le type d’événement que le gestionnaire doit gérer.

2. Pourquoi utiliser`StateData.Items . . . null;`au`stateData.Items.Clear ();`

   StateData est un objet qui est gardé en mémoire, et Clear ne réduit pas la mémoire que le dictionnaire consomme déjà.Bien sûr, il n’y a pas des centaines de milliers d’articles dans un panier.Mais le fait est que lorsque vous mettez à jour l’état, il est important de noter que Claptrap est un objet résident de la mémoire qui augmente la consommation de mémoire à mesure que le nombre augmente.Par conséquent, gardez le moins de données possible dans l’État.

3. Qu’est-ce que ValueTask?

   Vous pouvez[dans cet article sur la compréhension des pourquoi, whats, et quand de ValueTask](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)le monde.

Une fois l’implémentation EventHandler terminée, n’oubliez pas de la tester unitairement.Il n’est pas répertorié ici.

## Inscrivez-vous à EventHandler

Une fois que vous avez implémenté et testé EventHandler, vous pouvez enregistrer eventHandler pour vous associer à EventCode et Claptrap.

打开 `HelloClaptrap.Actors` 项目的 CartGrain 类。

Marquez avec attribut.

```cs
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Cart
  {
      [ClaptrapEventHandler(typeof(AddItemToCartEventHandler), ClaptrapCodes.AddItemToCart)]
      [ClaptrapEventHandler(typeof(RemoveItemFromCartEventHandler), ClaptrapCodes.RemoveItemFromCart)]
+     [ClaptrapEventHandler(typeof(RemoveAllItemsFromCartEventHandler), ClaptrapCodes.RemoveAllItemsFromCart)]
      public class CartGrain : ClaptrapBoxGrain<CartState>, ICartGrain
      {
          public CartGrain(
              IClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

          ....
```

ClaptrapEventHandlerAttribute 是框架定义的一个 Attribute，可以标记在 Grain 的实现类上，以实现 EventHandler 、 EventCode 和 ClaptrapGrain 三者之间的关联。

Après l’association, si l’événement correspondant à EventCode se produit dans ce grain, il sera géré par le EventHandler spécifié.

## Modifier l’interface Grain

Modifier la définition de l’interface Grain pour assurer l’interopérabilité externe avec Claptrap.

打开 HelloClaptrap.IActors 项目的 ICartGrain 接口。

Ajoutez des interfaces ainsi qu’Attribut.

```cs
  using System.Collections.Generic;
  using System.Threading.Tasks;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Cart;
  using HelloClaptrap.Models.Cart.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.IActor
  {
      [ClaptrapState(typeof(CartState), ClaptrapCodes.CartGrain)]
      [ClaptrapEvent(typeof(AddItemToCartEvent), ClaptrapCodes.AddItemToCart)]
      [ClaptrapEvent(typeof(RemoveItemFromCartEvent), ClaptrapCodes.RemoveItemFromCart)]
+     [ClaptrapEvent(typeof(RemoveAllItemsFromCartEvent), ClaptrapCodes.RemoveAllItemsFromCart)]
      public interface ICartGrain : IClaptrapGrain
      {
          Task<Dictionary<string, int>> AddItemAsync(string skuId, int count);
          Task<Dictionary<string, int>> RemoveItemAsync(string skuId, int count);
          Task<Dictionary<string, int>> GetItemsAsync();
+         Task RemoveAllItemsAsync();
      }
  }
```

Deux parties ont été added：

1. Marquer le`ClaptrapEvent`associer l’événement à Grain.Notez que c’est différent de la`de la`ClaptrapEventHandler.L’événement est marqué ici, et EventHandler est marqué la dernière étape.
2. Ajout de la méthode RemoveAllItemsAsync pour représenter le comportement commercial de « vider le panier ».Il est important de noter que la définition de la méthode de Grain a certaines limites.Pour plus d’informations,[pouvez être trouvé dans le « Développement d’un grain](https://dotnet.github.io/orleans/Documentation/grains/index.html).

## Mettre en œuvre le grain

Ensuite, suivez les modifications d’interface de l’étape suivante pour modifier la classe de mise en œuvre correspondante.

Ouvrez`classe CartGrain`le`Cart``dans le projet HelloClaptrap.actors`.

Ajouter la mise en œuvre correspondante.

```cs
  using System;
  using System.Collections.Generic;
  using System.Linq;
  using System.Threading.Tasks;
  using HelloClaptrap.Actors.Cart.Events;
  using HelloClaptrap.IActor;
  using HelloClaptrap.Models;
  using HelloClaptrap.Models.Cart;
  using HelloClaptrap.Models.Cart.Events;
  using Newbe.Claptrap;
  using Newbe.Claptrap.Orleans;

  namespace HelloClaptrap.Actors.Cart
  {
      [ClaptrapEventHandler(typeof(AddItemToCartEventHandler), ClaptrapCodes.AddItemToCart)]
      [ClaptrapEventHandler(typeof(RemoveItemFromCartEventHandler), ClaptrapCodes.RemoveItemFromCart)]
      [ClaptrapEventHandler(typeof(RemoveAllItemsFromCartEventHandler), ClaptrapCodes.RemoveAllItemsFromCart)]
      public class CartGrain : ClaptrapBoxGrain<CartState>, ICartGrain
      {
          public CartGrain(
              IClaptrapGrainCommonService claptrapGrainCommonService)
              : base(claptrapGrainCommonService)
          {
          }

+         public Task RemoveAllItemsAsync()
+         {
+             if (StateData.Items?.Any() != true)
+             {
+                 return Task.CompletedTask;
+             }
+
+             var removeAllItemsFromCartEvent = new RemoveAllItemsFromCartEvent();
+             var evt = this.CreateEvent(removeAllItemsFromCartEvent);
+             return Claptrap.HandleEventAsync(evt);
+         }
      }
  }
```

La mise en œuvre correspondante de la méthode d’interface a été ajoutée.Il y a les points suivants à note：

1. Assurez-vous`si (StateData.Items?. Tout () ! . . vrai)`cette ligne de jugement.Cela peut réduire considérablement les frais généraux de stockage.

   Les événements persistent`le claptrap.HandleEventAsync (evt`'événement.En ce qui concerne le scénario en l’espèce, s’il n’y a pas de contenu dans le panier, vider ou persister l’événement augmente simplement les frais généraux et n’a aucune signification pratique. Par conséquent, l’ajout de jugement jusque-là peut réduire la consommation inutile de stockage.

2. Assurez-vous de déterminer l’état et si les paramètres entrants répondent aux conditions d’exécution de l’événement.

   Ceci est différent de ce qui est décrit dans le point ci-dessus.L’accent mis sur le point ci-dessus indique que « ne produisent pas d’événements dénués de sens », ce qui indique que « ne jamais produire des événements que EventHandler ne peut pas consommer ». En mode d’approvisionnement en cas d’approvisionnement, l’achèvement de l’entreprise est basé sur la persistance de l’événement comme base pour l’achèvement de l’entreprise.Cela signifie que dès que l’événement est dans la bibliothèque, vous pouvez penser que l’événement est terminé. Dans EventHandler, seuls les événements lus à partir de la couche de persistance peuvent être acceptés.À ce stade, l’événement ne peut plus être modifié en fonction de son immuabilité, alors assurez-vous que l’événement peut être consommé par EventHandler.Par conséquent,`est important de rendre un jugement devant`de Claptrap.HandleEventAsync (evt). Par conséquent, il est important de mettre en œuvre des tests unitaires pour s’assurer que la génération d’événements et la logique de traitement d’EventHandler sont écrasées.

3. Voici quelques méthodes à utiliser dans certaines bibliothèques TAP, telles que la[asynchrone basée sur les tâches](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap)

## Modifier le contrôleur

Au moment où toutes les étapes précédentes sont terminées, toutes les parties de Claptrap ont été terminées.Toutefois, Claptrap ne peut pas fournir directement l’interopérabilité avec des programmes externes.Par conséquent, vous devez également ajouter une API à la couche Contrôleur pour « vider le panier » à l’extérieur.

Ouvrez le`CartController`sous le`contrôleurs`dossier`pour le projet helloClaptrap.web`.

```cs
  using System.Threading.Tasks;
  using HelloClaptrap.IActor;
  using Microsoft.AspNetCore.Mvc;
  using Orleans;

  namespace HelloClaptrap.Web.Controllers
  {
      [Route("api/[controller]")]
      public class CartController : Controller
      {
          private readonly IGrainFactory _grainFactory;

          public CartController(
              IGrainFactory grainFactory)
          {
              _grainFactory = grainFactory;
          }

+         [HttpPost("{id}/clean")]
+         public async Task<IActionResult> RemoveAllItemAsync(int id)
+         {
+             var cartGrain = _grainFactory.GetGrain<ICartGrain>(id.ToString());
+             await cartGrain.RemoveAllItemsAsync();
+             return Json("clean success");
+         }
      }
  }
```

## Résumé

À ce stade, nous avons fait tout ce dont nous avons besoin pour « vider le panier ».

Vous pouvez obtenir le code source de cet article à partir de la address：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Gitee ( Gitee )](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
