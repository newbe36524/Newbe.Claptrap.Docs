---
title: "La troisième étape consiste à définir Claptrap et à gérer l’inventaire des biens"
description: "La troisième étape consiste à définir Claptrap et à gérer l’inventaire des biens"
---

Avec cette lecture, vous pouvez commencer à essayer de faire des affaires avec Claptrap.

<!-- more -->

## Un résumé d’ouverture

Dans cet article, j’ai appris à définir un Claptrap dans un échantillon de projet existant en mettant en œuvre les exigences de « gestion des stocks ».

Combiné avec les étapes de base de l’article précédent, définir Claptrap aussi longtemps que vous ajoutez quelques étapes à l’extérieur.Les étapes complètes sont indiquées ci-dessous, où la section marquée « Nouveau contenu » appartient au nouveau contenu de cet article qui diffère de la liste：

1. Définition de ClaptrapTypeCode (Nouveau contenu)
1. Décrivez State (New Content)
1. Décrivez grain interface (nouveau contenu)
1. Implémenter grain (nouveau contenu)
1. Inscrivez-vous à Grain (Nouveau contenu)
1. Décrivez EventCode
1. Décrivez Event
1. Implémenter EventHandler
1. Inscrivez-vous à EventHandler
1. Mise en œuvre d’IInitialStateDataFactory (Nouveau contenu)
1. Modifier le contrôleur

Il s’agit d’un processus ascendant, et le développement peut être ajusté au cours du processus de codage réel.

Les cas d’utilisation des entreprises mis en œuvre dans cet article：

1. Implémente un objet SKU qui représente les données d’inventaire.
2. Possibilité de mettre à jour et de lire les SDS.

## Décrivez ClaptrapTypeCode

ClaptrapTypeCode est le seul code pour Claptrap.Il joue un rôle important dans l’identification, la sérialisation et ainsi de suite de l’État.

Ouvrez`la classe de`ClaptrapCodes`le HelloClaptrap.`projet.

Ajoutez ClaptrapTypeCode de SKU.

```cs
  namespace HelloClaptrap.Models
  {
      classe statique publique ClaptrapCodes
      {
          chaîne de const publique CartGrain = « cart_claptrap_newbe »;
          chaîne de const privée CartEventSuffix = « _e_ » + CartGrain;
          chaîne de const publique AddItemToCart = « addItem » + CartEventSuffix;
          chaîne de const publique RemoveItemFromCart = « removeItem » + CartEventSuffix;

          #region Sku

+ chaîne de const public SkuGrain = « sku_claptrap_newbe »;
+ chaîne const privée SkuEventSuffix = « _e_ » + SkuGrain;

          #endregion
      }
  }
```

## Décrivez State

L’état représente les performances de données actuelles de l’objet Acteur en mode Acteur.

Parce que Claptrap est un acteur basé sur des modèles d’approvisionnement d’événements.Il est donc important de définir l’état exact.

Dans cet exemple, nous avons seulement besoin d’enregistrer l’inventaire de l’actuel SKU, de sorte que la conception de l’État est très simple.

Ajoutez`dossier`Sku au projet HelloClaptrap.et créez le`SkuState`sous ce dossier.

Ajouter les éléments code：

```cs
+ en utilisant Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Sku
+ {
+ classe publique SkuState : IStateData
+ {
+ public int Inventory { get; ensemble; }
+ }
+ }
```

L’inventaire représente l’inventaire de la SKU actuelle.

`interface`IStateData est une interface vide qui représente l’État dans le cadre et est utilisée dans les inférences génériques.

## Décrivez l’interface Grain

Définissez la définition de l’interface Grain pour assurer l’interopérabilité externe avec Claptrap.

Ajoutez`interface ISkuGrain au`HelloClaptrap.IActors``projet.

Ajoutez des interfaces ainsi qu’Attribut.

```cs
+ en utilisant System.Threading.Tasks;
+ en utilisant HelloClaptrap.Models;
+ en utilisant HelloClaptrap.Models.Sku;
+ en utilisant Newbe.Claptrap;
+ en utilisant Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.IActor
+ {
+ [ClaptrapState (typeof (SkuState), ClaptrapCodes.SkuGrain)]
+ interface publique ISkuGrain : IClaptrapGrain
+ {
+ /// <summary>
+ /// Obtenez le dernier inventaire de ce sku
+ /// </summary>
+ /// <returns></returns>
+         Tâche<int> GetInventoryAsync ();
+
+ /// <summary>
+ /// Mise à jour de l’inventaire par ajouter diff, diff pourrait être numéro négatif
+ /// </summary>
+ /// <param name="diff"></param>
+ /// inventaire <returns>après mise à jour</returns>
+ Mise à jour<int> mise à jourInventoryAsync (int diff);
+ }
+ }
```

Ce qui suit a été added：

1. Marquez le`ClaptrapState`de sorte que l’État est associé au grain.
2. L’interface hérite`IClaptrapGrain`, une interface grain définie par framework qui doit être héritée pour fonctionner sur Orléans.
3. Ajout de la méthode GetInventoryAsync pour indiquer « obtenir l’inventaire actuel ».
4. La méthode UpdateInventoryAsync a été ajoutée pour indiquer une « mise à jour progressive de l’inventaire actuel ».`diff 0 > 0` augmentation des stocks,`diff < 0`une diminution des stocks.
5. Il est important de noter que la définition de la méthode de Grain a certaines limites.Pour plus d’informations,[pouvez être trouvé dans le « Développement d’un grain](https://dotnet.github.io/orleans/Documentation/grains/index.html).

## Mettre en œuvre le grain

Une fois que vous avez défini ISkuGrain, vous pouvez ajouter du code pour l’implémenter.

Créez`nouveau dossier`Sku pour le projet HelloClaptrap.Actors et ajoutez le`dossier`SkuGrain.

```cs
+ using System;
+ using System.Threading.Tasks;
+ using HelloClaptrap.IActor;
+ using HelloClaptrap.Models;
+ using HelloClaptrap.Models.Sku;
+ using Newbe.Claptrap;
+ using Newbe.Claptrap.Orleans;
+
+ namespace HelloClaptrap.Actors.Sku
+ {
+     public class SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
+     {
+         public SkuGrain(IClaptrapGrainCommonService claptrapGrainCommonService)
+             : base(claptrapGrainCommonService)
+         {
+         }
+
+         public Task<int> GetInventoryAsync()
+         {
+             return Task.FromResult(StateData.Inventory);
+         }
+
+         public async Task<int> UpdateInventoryAsync(int diff)
+         {
+             if (diff == 0)
+             {
+                 throw new BizException("diff can`t be 0");
+             }
+
+             var old = StateData.Inventory;
+             var newInventory = old + diff;
+             if (newInventory < 0)
+             {
+                 throw new BizException(
+                     $"failed to update inventory. It will be less than 0 if add diff amount. current : {old} , diff : {diff}");
+             }
+
+             throw new NotImplementedException();
+         }
+     }
+ }
```

Ce qui suit a été added：

1. Héritière de`ClaptrapBoxGrain<SkuState>`et mise en œuvre de`ISkuGrain`,`ClaptrapBoxGrain`est une classe de base grain définie par un cadre où les paramètres génériques représentent le type d’État correspondant.
2. Implémentez la méthode GetInventoryAsync pour lire l’inventaire actuel de StateData.
3. Implémentez la méthode UpdateInventoryAsync, ajoutez du code de jugement d’entreprise et lancez des exceptions si les conditions d’exploitation des entreprises ne sont pas remplies.
4. UpdateInventoryAsync dernier, nous jetons maintenant NotImplementedException parce que l’événement actuel n’est pas encore défini et doit attendre une implémentation de code ultérieure.
5. BizException est une exception personnalisée qui peut être ajoutée vous-même.Dans le développement réel, vous pouvez également utiliser l’exception de lancer pour représenter l’interruption d’entreprise, mais entre un code d’état ou d’autres valeurs de retour.

## Inscrivez-vous à Grain

Grain pour Claptrap doit être enregistré au démarrage de l’application afin que le cadre puisse numériser pour la découverte.

Étant donné que le code de l’échantillon utilise une analyse à l’échelle de l’assemblage, il n’a pas besoin d’être modifié.

L’endroit où l’enregistrement a eu lieu est indiqué here：

Cours`programme ouvert pour HelloClaptrap.BackendServer`projet`le`programme.

```cs
  en utilisant le système;
  utilisant Autofac;
  utilisant HelloClaptrap.Actors.Cart;
  en utilisant HelloClaptrap.IActor;
  utilisant HelloClaptrap.Repository;
  'utilisation de Microsoft.AspNetCore.Hosting;
  'utilisation de Microsoft.Extensions.Hosting;
  'utilisation de Microsoft.Extensions.Logging;
  en utilisant Newbe.Claptrap;
  en utilisant Newbe.Claptrap.Bootstrapper;
  'utilisation de NLog.Web;
  'utilisation d’Orléans;

  'espace de nom HelloClaptrap.BackendServer
  {
      public class Program
      {

          public statique IHostBuilder CreateHostBuilder (string[] args) =>
              Host.CreateDefaultBuilder (args)
                  . ConfigureWebHostDefaults (webBuilder => { webBuilder.UseStartup<Startup>(); })
                  . UseClaptrap (
                      constructeur =>
                      {
+ constructeur
+ . ScanClaptrapDesigns (nouveau[]
+ {
+ type de (ICartGrain). Assemblage,
+ type de (CartGrain). Assemblage,
+ });
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

Étant donné qu’ISkuGrain et SkuGrain appartiennent au même assemblage qu’ICartGrain et CartGrain, respectivement, il n’est pas nécessaire de le modifier ici.

## Décrivez EventCode

Nous avons mis en œuvre la partie principale de Claptrap plus tôt, mais nous n’avons pas terminé le fonctionnement de la mise à jour de l’inventaire.C’est parce que la mise à jour de l’inventaire nécessite la mise à jour de l’état.Et nous savons tous que Claptrap est un modèle d’acteur retracé par l’événement, et les mises à jour de l’État doivent être effectuées par le biais d’événements.Commençons donc ici, mettons à jour l’inventaire à travers les événements.

EventCode est le code unique pour chaque événement du système Claptrap.Il joue un rôle important dans l’identification et la sérialisation des événements.

Ouvrez`la classe de`ClaptrapCodes`le HelloClaptrap.`projet.

Ajouter EventCode pour mettre à jour l’inventaire.

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
+ chaîne const publique SkuInventoryUpdate = « inventoryUpdate » + SkuEventSuffix;

          #endregion
      }
  }
```

## Décrivez Event

L’événement est la clé de l’approvisionnement en événements.Utilisé pour changer d’État à Claptrap.Et l’événement est persisté à la couche de persistance.

Créez`'inventaireUpdateEvent`sous le`Sku/Events`dossier de`helloClaptrap.`projets.

Ajouter les éléments code：

```cs
+ en utilisant Newbe.Claptrap;
+
+ namespace HelloClaptrap.Models.Sku.Events
+ {
+ classe publique InventoryUpdateEvent : IEventData
+ {
+ int public Diff { get; ensemble; }
+ public int NewInventory { get; ensemble; }
+ }
+ }
```

1. Diff représente le montant de cet inventaire mis à jour,`diff > 0` indique une augmentation des stocks, et`diff < 0`indique une réduction des stocks.
2. NewInventory représente l’inventaire mis à jour.Ici, une recommandation est donnée à l’avance, mais en raison de questions spatiales, il n’y a pas de discussion：recommande que les données mises à jour de l’État soient incluses dans l’événement.

## Implémenter EventHandler

EventHandler 用于将事件更新到 Claptrap 的 State 上。

Créez`'inventaireUpdateEventHandler`classe dans le dossier`Sku/Events`de`le projet HelloClaptrap.Actors`.

Ajouter les éléments code：

```cs
+ en utilisant System.Threading.Tasks;
+ en utilisant HelloClaptrap.Models.Sku;
+ en utilisant HelloClaptrap.Models.Sku.Events;
+ en utilisant Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Sku.Events
+ {
+ classe publique InventoryUpdateEventHandler
+ : NormalEventHandler<SkuState, InventoryUpdateEvent>
+ {
+ public override ValueTask HandleEvent (SkuState stateData,
+ InventoryUpdateEvent eventData,
+ IEventContext eventContext)
+ {
+ stateData.Inventory = eventData.NewInventory;
+ retourner la nouvelle ValueTask();
+ }
+ }
+ }
```

1. Étant donné que l’inventaire mis à jour est déjà inclus dans l’événement, il est simplement attribué à StateData.

## Inscrivez-vous à EventHandler

Une fois que vous avez implémenté et testé EventHandler, vous pouvez enregistrer eventHandler pour vous associer à EventCode et Claptrap.

Ouvrez`classe SkuGrain pour helloClaptrap.Actors`projet`le`projet.

Marquez avec Attribut et modifiez updateInventoryAsync pour exécuter l’événement.

```cs
  en utilisant System.Threading.Tasks;
+ en utilisant HelloClaptrap.Actors.Sku.Events;
  en utilisant HelloClaptrap.IActor;
  utilisant HelloClaptrap.Models;
  en utilisant HelloClaptrap.Models.Sku;
+ en utilisant HelloClaptrap.Models.Sku.Events;
  en utilisant Newbe.Claptrap;
  en utilisant Newbe.Claptrap.Orleans;

  'espace de nom HelloClaptrap.Actors.Sku
  {
+ [ClaptrapEventHandler (typeof (InventoryUpdateEventHandler), ClaptrapCodes.SkuInventoryUpdate)]
      classe publique SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      {
          public SkuGrain (IClaptrapGrainCommonService claptrapGrainCommonService)
              : base ( claptrapGrainCommonService)
          {
          }

          public Task<int> GetInventoryAsync ()
          {
              return Task.FromResult (StateData.Inventory);
          }

          public async Task<int> UpdateInventoryAsync (int diff)
          {
              si (diff == 0)
              {
                  jeter nouveau BizException (« diff ne peut pas être 0 »);
              }

              var vieux = StateData.Inventory;
              var newInventory = ancien + diff;
              si (newInventory < 0)
              {
                  lancer de nouveaux BizException (
                      $ » n’a pas mis à jour l’inventaire. Il sera inférieur à 0 si ajouter la quantité diff. courant : {old} , diff : {diff}« );
              }

- lancer nouveau NotImplementedException ();
+ var evt = ceci. CreateEvent (nouveau InventoryUpdateEvent
+ {
+ Diff = diff,
+ NewInventory = newInventory
+ });
+ attendre Claptrap.HandleEventAsync (evt);
+ retourner StateData.Inventory;
          }
      }
  }
```

## Implémenter IInitialStateDataFactory

Nous avons terminé la requête d’inventaire et la mise à jour plus tôt.Mais en général, il y a un montant initial dans l’inventaire, et nous complétons cette partie de la logique dans cette section.

Créez`classe`SkuStateInitHandler sous le dossier`Sku`de`le projet HelloClaptrap.Actors`.

```cs
+ en utilisant System.Threading.Tasks;
+ en utilisant HelloClaptrap.Models.Sku;
+ en utilisant HelloClaptrap.Repository;
+ en utilisant Newbe.Claptrap;
+
+ namespace HelloClaptrap.Actors.Sku
+ {
+ classe publique SkuStateInitHandler : IInitialStateDataFactory
+ {
+ private readonly ISkuRepository _skuRepository;
+
+ public SkuStateInitHandler (
+ ISkuRepository skuRepository)
+ {
+ _skuRepository = skuRepository;
+ }
+
+ public async Task<IStateData> Create (IClaptrapIdentity identity)
+ {
+ var skuId = identité. Id;
+ inventaire var = attendre _skuRepository.GetInitInventoryAsync (skuId);
+ var re = nouveau SkuState
+ {
+ Inventaire = inventaire
+ };
+ retour re;
+ }
+ }
+ }
```

1. `IInitialStateDataFactory`appelé lorsque Claptrap est activé pour la première fois pour créer la valeur initiale de l’État.
2. Injection`ISkuRepository`lit le montant initial de l’inventaire pour Sku à partir de la base de données, le code spécifique n’est pas répertorié ici, et le lecteur peut afficher l’implémentation dans l’entrepôt de l’échantillon.

En plus de la mise en œuvre du code, l’enregistrement est nécessaire avant qu’il puisse être appelé.

Ouvrez`classe SkuGrain pour helloClaptrap.Actors`projet`le`projet.

```cs
  en utilisant System.Threading.Tasks;
  en utilisant HelloClaptrap.Actors.Sku.Events;
  en utilisant HelloClaptrap.IActor;
  utilisant HelloClaptrap.Models;
  en utilisant HelloClaptrap.Models.Sku;
  en utilisant HelloClaptrap.Models.Sku.Events;
  en utilisant Newbe.Claptrap;
  en utilisant Newbe.Claptrap.Orleans;

  'espace de nom HelloClaptrap.Actors.Sku
  {
+ [ClaptrapStateInitialFactoryHandler (typeof(SkuStateInitHandler))
      [ClaptrapEventHandler(typeof (InventoryUpdateEventHandler), ClaptrapCodes.SkuInventoryUpdate)]
      classe publique SkuGrain : ClaptrapBoxGrain<SkuState>, ISkuGrain
      {
          public SkuGrain( IClaptrapGrainCommonService claptrapGrainCommonService)
              : base (claptrapGrainCommonService)
          {
          }

          public Task<int> GetInventoryAsync()
          {
              return Task.FromResult(StateData.Inventory);
          }

          public async Task<int> UpdateInventoryAsync (int diff)
          {
              if (diff == 0)
              {
                  throw new BizException (« diff can’t be 0 »);
              }

              var vieux = StateData.Inventory;
              var newInventory = ancien + diff;
              si (newInventory < 0)
              {
                  lancer de nouveaux BizException (
                      $ » n’a pas mis à jour l’inventaire. Il sera inférieur à 0 si ajouter la quantité diff. courant : {old} , diff : {diff}« );
              }

              var evt = ceci. CreateEvent(new InventoryUpdateEvent
              {
                  Diff = diff,
                  NewInventory = newInventory
              });
              attendre Claptrap.HandleEventAsync (evt);
              retourner StateData.Inventory;
          }
      }
  }
```

## Modifier le contrôleur

Au moment où toutes les étapes précédentes sont terminées, toutes les parties de Claptrap ont été terminées.Toutefois, Claptrap ne peut pas fournir directement l’interopérabilité avec des programmes externes.Par conséquent, vous devez également ajouter une API à la couche Contrôleur pour les opérations externes d’inventaire de lecture.

Créez`nouveau`SkuController sous le dossier`Controllers``du projet HelloClaptrap.web`.

```cs
+ en utilisant System.Threading.Tasks;
+ en utilisant HelloClaptrap.IActor;
+ en utilisant Microsoft.AspNetCore.Mvc;
+ en utilisant Orléans;
+
+ namespace HelloClaptrap.Web.Controllers
+ {
+ [Route(« api/[controller] »)]
+ classe publique SkuController : Controller
+ {
+ private readonly IGrainFactory _grainFactory;
+
+ public SkuController (
+ IGrainFactory grainFactory)
+ {
+ _grainFactory = grainFactory;
+ }
+
+ [HttpGet( »{id}« )]
+ public async Task<IActionResult> GetItemsAsync (string id)
+ {
+ var skuGrain = _grainFactory.GetGrain<ISkuGrain>(id);
+ inventaire var = attendre skuGrain.GetInventoryAsync ();
+ retour Json (nouvelle
+ {
+ skuId = id,
+ inventaire = inventaire,
+ });
+ }
+ }
+ }
```

1. La nouvelle API lit l’inventaire pour des SkuIds spécifiques.Suite à la mise en œuvre du code échantillon, vous pouvez passer`yueluo-123`montant de l’inventaire est de 666.SkuIds qui n’existent pas jeter des exceptions.
1. Il n’y a pas d’API externe pour la mise à jour de l’inventaire ici, parce que cet exemple fera des opérations d’inventaire lorsque vous placez une commande dans la section suivante, et l’API n’est pas nécessaire ici.

## Résumé

À ce stade, nous avons terminé le « gérer l’inventaire des produits de base » cette exigence simple de tout le contenu.

Vous pouvez obtenir le code source de cet article à partir de la address：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee ( Gitee )](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
