---
title: 'Deuxième étape - Simple entreprise, panier vide.'
metaTitle: 'Deuxième étape - Simple entreprise, panier vide.'
metaDescription: 'Deuxième étape - Simple entreprise, panier vide.'
---

Avec cette lecture, vous êtes prêt à essayer d’utiliser Claptrap pour mettre en œuvre votre entreprise.

> [La version actuellement vue est le résultat d’une correction simplifiée et manuelle traduite par la machine.S’il y a une mauvaise traduction dans le document, veuillez cliquer ici pour soumettre votre proposition de traduction.](https://crwd.in/newbeclaptrap)

<!-- more -->

## Le résumé d’ouverture.

Dans cet article, j’ai appris à ajouter une implémentation d’entreprise à un exemple de projet existant en mettant en œuvre la nécessité de « vider le panier ».

Les principales étapes sont les suivantes.：

1. Définissez EventCode.
2. Décrivez Événement.
3. Implémenter EventHandler.
4. Inscrivez-vous à EventHandler.
5. Modifiez l’interface Grain.
6. Mettre en œuvre le grain.
7. Modifiez le contrôleur.

Il s’agit d’un processus ascendant, et le processus de codage réel peut également être développé de haut en bas.

## Définissez Code d’événement.

EventCode est l’encodage unique de chaque événement dans le système Claptrap.Il joue un rôle important dans l’identification et la sérialisation des événements.

Ouvre-le.`HelloClap.Models.`Projet.`Codes Claptrap.`Classe.

Ajouter EventCode pour " Événements de paniers vides « .

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

## Décrivez Événement.

L’événement est la clé de l’origine des événements.Utilisé pour changer l’État à Claptrap.Et l’événement est persisté à la couche de persistance.

Dans.`HelloClap.Models.`Le projet.`Panier/Événements.`Créer sous le dossier.`Supprimez AllItems de l’événement Cart.`Classe.

Ajoutez le code suivant.：

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

Parce que dans ce scénario d’entreprise simple, vider un panier d’achat ne nécessite pas de paramètres spécifiques.Par conséquent, il suffit de créer un type vide.

`IeventData.`Une interface est une interface vide dans un cadre qui représente les événements et est utilisé lors d’inférences génériques.

## Implémenter EventHandler.

`Gestionnaire d’événements.`Utilisé pour mettre à jour les événements vers Claptrap.`État.`Sur.Par exemple, dans ce scénario d’entreprise, EventHandler est responsable de vider le contenu du panier d’achat d’État.

Dans.`BonjourClap.Acteurs.`Le projet.`Panier/Événements.`Créer sous le dossier.`Supprimez tous les éléments du gestionnaire d’événements du panier.`Classe.

Ajoutez le code suivant.：

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

Voici quelques problèmes courants.：

1. Qu’est-ce que normal Event Handler ?

   NormalEventHandler est une classe de base simple définie par le cadre pour une implémentation facile de Handler. Le premier paramètre générique est le type d’état pour Claptrap.En conjonction avec le document précédent, notre type d’état de panier est CartState. Le deuxième paramètre générique est le type d’événement que Handler doit gérer.

2. Pourquoi l’utiliser.`StateData.Items snull;`Pas.`StateData.Items.Clear();`

   StateData est un objet conservé en mémoire, et Clear ne réduit pas la propre mémoire du dictionnaire.Bien sûr, il n’y a généralement pas de paniers avec des centaines de milliers d’articles.Mais le fait est que lors de la mise à jour de l’État, il est important de noter que Claptrap est un objet basé sur la mémoire qui augmente en nombre et augmente la consommation de mémoire.Par conséquent, conservez le moins de données possible dans l’État.

3. Qu’est-ce que ValueTask ?

   Peut passer ça.[Comprendre les pourquoi, les whats et quand de ValueTask](https://blogs.msdn.microsoft.com/dotnet/2018/11/07/understanding-the-whys-whats-and-whens-of-valuetask/)Apprendre.

Une fois l’implémentation EventHandler terminée, n’oubliez pas de la tester en unité.Il n’est pas répertorié ici.

## Inscrivez-vous à EventHandler.

Une fois que vous avez implémenté et testé EventHandler, vous pouvez enregistrer EventHandler pour vous associer à EventCode et Claptrap.

Ouvre-le.`BonjourClap.Acteurs.`Le projet.`CartGrain.`Classe.

Marquer avec attribut.

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

`Gestionnaire d’événements Claptrap.`Est un attribut défini par le cadre qui peut être marqué sur la classe d’implémentation du grain pour atteindre l’association entre EventHandler, EventCode et ClaptrapGrain.

Après l’association, si l’événement pour EventCode est généré dans ce grain, l’événement est géré par le EventHandler spécifié.

## Modifiez l’interface Grain.

Modifiez la définition de l’interface Grain pour assurer l’interopérabilité externe avec Claptrap.

Ouvre-le.`HelloClaptrap.IActos.`Le projet.`ICartGrain.`Interface.

Ajoutez des interfaces et des attributs.

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

Deux parties ont été ajoutées.：

1. Marqué.`Claptrapevent.`d’associer l’événement à Grain.Notez que voici l’étape précédente.`Gestionnaire d’événements Claptrap.`est différent.L’événement est marqué ici, et eventHandler est marqué dans l’étape précédente.
2. Ajout de la méthode RemoveAllItemsAsync pour indiquer le comportement professionnel de « vider les paniers ».Il est important de noter que la définition de la méthode du grain comporte certaines limites.Les détails peuvent être trouvés.[Développer un grain](https://dotnet.github.io/orleans/Documentation/grains/index.html)。

## Mettre en œuvre le grain.

Ensuite, suivez la modification de l’interface précédente, pour modifier la classe d’implémentation correspondante.

Ouvre-le.`BonjourClap.Acteurs.`Projet.`Panier.`sous le dossier.`CartGrain.`Classe.

Ajoutez l’implémentation correspondante.

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

L’implémentation correspondante de la méthode d’interface a été ajoutée.Il y a quelques points à connaître.：

1. Assurez-vous d’augmenter.`si (StateData.Items?? Tout () . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .`Cette ligne de jugement.Cela peut réduire considérablement les frais généraux de stockage.

   L’événement est exécuté quand.`Claptrap.HandleEventAsync (evt)`persistera.Dans le cas de la scène ici, s’il n’y a rien dans le panier, vider ou persister l’événement ajoute juste à la surcharge, mais n’a pas de sens. Par conséquent, l’ajout de jugement avant cela peut réduire la consommation inutile de stockage.

2. Il est important de déterminer si l’État et les paramètres entrants répondent aux critères d’exécution des événements.

   C’est différent de l’accent décrit dans le point précédent.L’accent mis précédemment sur « e produisez pas d’événements dénués de sen » suggère qu'« l n’y aura jamais d’événements que EventHandler ne peut pas consomme ». Dans le mode de traçage des événements, l’achèvement de l’entreprise est basé sur la persistance de l’événement comme base pour l’achèvement de la détermination de l’entreprise.Cela signifie que tant que l’événement est en stock, il peut être considéré que l’événement a été terminé. Dans EventHandler, vous ne pouvez accepter les événements lus qu’à partir du calque de persistance.À ce stade, l’événement ne peut plus être modifié car l’événement est immuable, il est donc important de s’assurer que l’événement peut être consommé par EventHandler.Alors, dans.`Claptrap.HandleEventAsync (evt)`Il est particulièrement important de porter un jugement avant. Par conséquent, il est important d’implémenter des tests unitaires pour s’assurer que la génération d’événements et la logique de traitement d’EventHandler sont remplacées.

3. Voici quelques méthodes dans la bibliothèque TAP que vous pouvez utiliser, voir .[Modèle asynchrone basé sur les tâches.](https://docs.microsoft.com/zh-cn/dotnet/standard/asynchronous-programming-patterns/task-based-asynchronous-pattern-tap)

## Modifiez le contrôleur.

Une fois toutes les étapes précédentes terminées, vous avez terminé toutes les parties de Claptrap.Toutefois, Claptrap n’est pas en mesure d’assurer directement l’interopérabilité avec des programmes externes.Par conséquent, vous devez également ajouter une API à la couche contrôleur pour le « vidage externe du pta ».

Ouvre-le.`BonjourClap.Web.`Le projet.`Contrôleurs.`sous le dossier.`CartController.`Classe.

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

À ce stade, nous avons fait tout ce dont nous avions besoin pour « vider votre panier ».

Vous pouvez obtenir le code source de cet article à partir de l’adresse suivante.：

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart2/HelloClaptrap)
