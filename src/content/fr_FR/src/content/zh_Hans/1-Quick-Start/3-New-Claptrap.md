---
title: 'Étape 3 - Définir Claptrap et gérer l’inventaire des marchandises.'
metaTitle: 'Étape 3 - Définir Claptrap et gérer l’inventaire des marchandises.'
metaDescription: 'Étape 3 - Définir Claptrap et gérer l’inventaire des marchandises.'
---

Avec cet article, vous pouvez commencer à essayer de faire des affaires avec Claptrap.

> [La version actuellement vue est le résultat chinois machine simplifiée traduit auto-vérification et corrections manuelles.S’il y a une traduction incorrecte dans le document, veuillez cliquer ici pour soumettre vos suggestions de traduction.](https://crwd.in/newbeclaptrap)

<!-- more -->

## Résumé d’ouverture.

Dans cet article, j’ai appris à définir un Claptrap dans un échantillon de projet existant en mettant en œuvre la nécessité de « gérer l’inventaire ».

Combiné avec les étapes de base de l’article précédent, définissez Claptrap tant que vous ajoutez quelques étapes là-bas.Les étapes complètes sont affichées ci-dessous, où la section marquée « Nouveau contenu » est différente du nouveau contenu précédent dans cette article：

1. Décrivez ClaptrapTypeCode (Nouveau contenu)
1. Définition de l’état (nouveau contenu)
1. Définir l’interface grain (nouveau contenu)
1. Mise en œuvre du grain (nouveau contenu)
1. Inscrivez-vous pour Grain (Nouveau contenu)
1. Définissez EventCode.
1. Décrivez Événement.
1. Implémentez le gestionnaire d’événements.
1. Inscrivez-vous à EventHandler.
1. Implémentation iInitial StateDataFactory (Nouveau contenu)
1. Modifier le contrôleur.

Il s’agit d’un processus ascendant, et le processus de codage réel peut également être ajusté pour le développement.

Les cas d’utilisation des affaires mis en œuvre dans cet article：

1. Implémente l’objet SKU (Stock Keeping Unit) qui représente les données d’inventaire.
2. Possibilité de mettre à jour et de lire les SKU.

## Décrivez ClaptrapTypeCode.

ClaptrapTypeCode est un code unique pour Claptrap.Il joue un rôle important dans l’identification et la sérialisation de l’État.

Ouvrez`la classe`ClaptrapCodes dans`HelloClaptrap.`projet.

Ajoutez ClaptrapTypeCode pour le SKU.

```cs
  namespace HelloClaptrap.Models

      public static class ClaptrapCodes

          publicity and publicity string Cartin s " cart_claptrap_newbe";
          private const string CartEventSuffix , ""e"" , "CartGrain";
          public publicity const string AddItemToCart , "addItem" , "CartEventSuffix";
          publicity const string Remove ItmFromCart , "remove." eItem » et CartEventSuffix;

          #region Sku

sku SkuGrain , « sku_claptrap_newbe » ;
et la chaîne privée const SkuEventSuffix , « """"""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""""" »

          #endregion
      . . .
  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

## Définir État.

State représente la représentation actuelle des données de l’objet Actor en mode Acteur.

Parce que Claptrap est un acteur basé sur les modèles de traçabilité des événements.Il est donc important de définir exactement l’état.

Dans cet exemple, nous n’avons qu’à enregistrer l’inventaire de l’UST actuel, de sorte que la conception de l’État est très simple.

Ajoutez`dossier``Sku au projet`HelloClaptrap.Models et créez un dossier</code>`SkuState.</p>

<p spaces-before="0">Ajouter le：de code suivant</p>

<pre><code class="cs">singningnbe.Claptrap;
s
et l’espace de noms HelloClaptrap.Models.Sku
, s
, classe publique SkuState : IStateData
,
, public int . . .

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
`</pre>

L’inventaire représente l’inventaire de l’EST actuel.

`interface`IStateData est une interface vide dans le cadre qui représente l’État et est utilisée pour l’inférence générique.

## Définissez l’interface Grain.

Définissez la définition de l’interface Grain pour fournir une interopérabilité externe avec Claptrap.

Ajoutez`<code>HelloClaptrap.`d’interface</code>ISkuGrain.

Ajoutez des interfaces ainsi que des attributs.

```cs
Utilisation de Systems.Threading.Tasks ;
chantent HelloClaptrap.Models;
chantent HelloClaptrap.Models.Sku;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
,
, espace de noms HelloClaptrap.IActor
,
, claptrapState , ClaptrapCodes.SkuGrain ,
, interface publique , . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . : IClaptrapGrain
. . </summary>

<summary>

. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . <returns></returns>
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .         Tâche<int> GetInventoryAsync();

/ / / / / <summary>
/ / Mise à jour de l’inventaire par ajouter diff, le diff peut être le nombre négatif
. </summary>
<int> </returns>
<returns><param name="diff"></param>
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
. . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

Ce qui suit a été added：

1. Le</code>claptrapstate`est étiqueté pour associer l’État au grain.</li>
<li>L’interface hérite<code>IClaptrapGrain`, qui est une interface grain définie par cadre qui est basée sur l’interface dont Orléans doit hériter pour exécuter.
3. Ajout de la méthode GetInventoryAsync, qui signifie « Obtenez l’inventaire actuel ».
4. Ajout de la méthode UpdateInventoryAsync, qui signifie « mise à jour incrémentielle de l’inventaire actuel ».`diff > 0 indique` augmentation des stocks,`diff < 0`indique une diminution des stocks.
5. Il est important de noter que les définitions de la méthode de Grain sont limitées.Voir le[Development a Grain](https://dotnet.github.io/orleans/Documentation/grains/index.html).

## Mettre en œuvre grain.

Une fois ISkuGrain défini, vous pouvez ajouter du code pour l’implémentation.

Créez`nouveau dossier<code>Sku`pour le projet</code>HelloClaptrap.actors et ajoutez le dossier</code>``SkuGrain.</p>

<pre><code class="cs">+ using System;
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
``</pre>

Ce qui suit a été added：

1. Hériter`<SkuState>`ClaptrapBoxGrain et implémenter``ISkuGrain,`claptrapboxgrain`est une classe de base de grain définie par le cadre où les paramètres génériques représentent le type d’état correspondant.
2. Implémentez la méthode GetInventoryAsync pour lire l’inventaire actuel à partir de StateData.
3. Implémentez la méthode UpdateInventoryAsync, ajoutez du code de jugement d’entreprise et lancez des exceptions si les conditions d’exploitation de l’entreprise ne sont pas remplies.
4. Le dernier de UpdateInventoryAsync nous jetons OutMplementedException parce que l’événement actuel n’est pas encore défini et doit attendre les implémentations de code ultérieures.
5. BizException est une exception personnalisée qui peut être ajoutée seule.En développement réel, il est également possible d’indiquer une interruption d’activité sans lancer d’exception, et il est également possible d’utiliser un code d’état ou une autre valeur de retour entre.

## Inscrivez-vous à Grain.

Le grain correspondant à Claptrap doit être enregistré lorsque l’application démarre afin que le cadre puisse être scanné pour la découverte.

Étant donné que l’exemple de code utilise l’analyse à l’échelle de l’assembly, aucune modification n’est réellement requise.

C’est là que l’inscription a place：

Ouvrez`classe de programme pour le projet`HelloClap.BackendServer`programme`projet.

```cs
  Utilisation du système;
  à l’aide d’Autofac;
  . Hening HelloClaptrap.Actors.Cart;
  Les États-Unis de Chine HelloClaptrap.IActor;
  United Services HelloClaptrap.Repository;
  .AspNetCore.Hosting;
  .Extensions.Hosting;
  .Extensions.Logging ;
  . Newbe.Claptrap;
  .Claptrap.Bootstrapper;
  NLog.Web;
  Orléans;

  'espace de noms HelloClaptrap.BackendServer

      programme de classe publique


          le
                  statique public IHostBuilder CreateHostBuilder (string)>
              Host.CreateDefaultBuilder (args). ConfigureWebHostDefaults (webBuilder> . . . . . . . .
                  . . . . . . . . . . . . .<Startup>. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . UseClaptrap (
                      Builder>

le
de constructeur . ScanClaptrapDesigns (nouveau)
,
et typeof (ICartGrain). Assembly,
et Typeof (CartGrain). Assemblée,
, s)
                      , constructeur
> constructeur. RegisterModule<RepositoryModule>(); )
                  . UseOrleansClaptrap()
                  . UseOrleans (Builders -> Builder. UseDashboards (options> options. Port s 9000))
                  . ConfigureLogging (journalisation>

                      la journalisation. ClearProviders ();
                      l’enregistrement. SetMinimumLevel (LogLevel.Trace);
                  )
                  . UseNLog();
      . . .
  . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

Étant donné qu’ISkuGrain et SkuGrain appartiennent au même assembly qu’ICartGrain et CartGrain, respectivement, aucune modification n’est requise ici.

## Définissez EventCode.

Nous avons déjà mis en œuvre la partie principale de Claptrap, mais nous n’avons pas terminé l’opération de mise à jour des stocks.Cela s’agit du fait que la mise à jour de l’inventaire nécessite une mise à jour de l’état.Et nous savons tous que Claptrap est un modèle d’acteur basé sur l’événement, et les mises à jour de l’État doivent être faites par le biais d’événements.Alors commencez ici, mettons à jour l’inventaire à travers les événements.

EventCode est le seul codage pour chaque événement sur le système Claptrap.Il joue un rôle important dans l’identification et la sérialisation des événements.

Ouvrez`la classe`ClaptrapCodes dans`HelloClaptrap.`projet.

Ajouter eventcode pour mettre à jour l’inventaire.

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
skuEvent Suffixe, publicité, public, et SkuEvent Suffixe, « inventoryUpdate »;

          #endregion
      . . .
  . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

## Décrivez Événement.

L’événement est la clé du traçage des événements.Utilisé pour changer d’état dans Claptrap.Et l’événement est persisté à la couche de persistance.

Créez`classe<code>InventoryUpdateEvent sous le dossier`Sku/Events de`le projet`</code>HelloClaptrap.models.

Ajouter le：de code suivant

```cs
singningnbe.Claptrap;
et
, espace de noms HelloClap.Models.Sku.Events
,
, classe publique InventoryUpdateEvent : IEventData



. . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

1. Diff représente le montant des stocks pour cette mise à jour,`diff > 0` indique une augmentation des stocks, et`diff < 0`indique une diminution des stocks.
2. NewInventory représente l’inventaire mis à jour.Ici, une recommandation est donnée à l’avance, mais en raison de questions de longueur, aucune discussion：suggère d’inclure les données mises à jour de l’État dans l’événement.

## Implémentez le gestionnaire d’événements.

`EventHandler`de mettre à jour les événements du système</code>d’État`de Claptrap.</p>

<p spaces-before="0">Créez<code>classe`InventoryUpdateEventHandler sous le dossier</code>`Sku/Events pour le projet`helloClaptrap.actors`.</p>

<p spaces-before="0">Ajouter le：de code suivant</p>

<pre><code class="cs">Utilisation de Systems.Threading.Tasks ;
chantent HelloClaptrap.Models.Sku;
chantez HelloClaptrap.Models.Sku.Events;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .

et espace de noms HelloClaptrap.Actors.Sku.Events
,
, classe publique InventoryUpdateEventHandler
, et : NormalEventHandler<SkuState, InventoryUpdateEvent>
,
, la publicité remplacer ValueTask StateData,
, inventoryUpdateEvent eventData,
, IEventContext eventContext)
, . . .
stateData.Inventory , eventData.NewInventory;
et retourner de nouvelles ValueTask();
. . .
. . . . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
`</pre>

1. Étant donné que l’inventaire mis à jour est déjà inclus dans l’événement, vous pouvez affecter StateData directement.

## Inscrivez-vous à EventHandler.

Après avoir implémenté et testé EventHandler, vous pouvez enregistrer EventHandler pour vous associer à EventCode et Claptrap.

Ouvrez``SkuGrain pour`HelloClap.`projet.

Marquer avec attribut et modifier les événements d’exécution InventoryAsync update.

```cs
  Utilisation de System.Threading.Tasks ;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
  Les années 1990, HelloClaptrap.IActor;
  Les États-Unis Ofsing HelloClaptrap.Models;
  .HelloClaptrap.Models.Sku;
chantez HelloClaptrap.Models.Sku.Events;
  .Claptrap;
  Newbe.Claptrap.Orleans;

  l’espace de noms HelloClaptrap.Actors.Sku


      snr. classe publique SkuGrain : ClaptrapBoxgrain<SkuState>, ISkuGrain
      ,
          Public SkuGrain ( IClaptrap Grain Common Services Claptrap Grain CommonService )
              : Base ( claptrapGrainCommonService)
          {
          }

          tâche publique<int> GetInventoryAsync()

              Return Task.FromResult (StateData.Inventory);
          )

          Public Async Task<int> Update InventyAsync (int diff)

              si

                  lancer un nouveau bizException (« diff ne peut pas être 0 »);
              .

              var old , StateData.Inventory;
              var newInventory , vieux , diff;
              (newInventory < 0)
              le
                  lancer de nouvelles bizException (
                      $"n’a pas mis à jour l’inventaire. Il sera inférieur à 0 si ajouter diff quantité. courant : {old} , diff : {diff}" );
              -

- jeter nouvelle Non-implémentéException ();
et var evt , ceci. CreateEvent (nouveau InventoryUpdateEvent
s
s Diff s diff,
newinventory s newinventory
s) );
et attendre Claptrap.HandleEventAsync (evt);
et retournez StateData.Inventory;
          ,
      ,
  .
```

## Implémenter IInitial State Data Factory.

Nous avons déjà terminé la requête d’inventaire et la mise à jour.En général, cependant, il y a un montant initial dans l’inventaire, et nous complétons cette partie de la logique dans cette section.

Créez`<code>SkuStateInitHandler sous le dossier``Sku`projet helloClaptrap.</code>actors.

```cs
Utilisation de Systems.Threading.Tasks ;
chantent HelloClaptrap.Models.Sku;
chantez HelloClaptrap.Repository;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
et
, namespace HelloClap.Actors.Sku
,
, classe publique SkuStateInitHandler : IinitialState DataFactory
,
, private readonly ISkuRepository _skuRepository;
s
skuStateInitHandler (
skuRepository skuRepository)
_skuRepository
sk. uRépository;
,
,
, tâche async<IStateData> public Créer (IClaptrapIdentity Identity)
,
, var skuId , et l’identité. Id;
et var inventaire _skuRepository.GetInitInventoryAsync (skuId);
et var re , nouveau
SkuState ,
, inventaire , inventaire
, .
et retour;
. . .
. . . . . . . . . . . . . . . . . . . .
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

1. `IInitial StateDataFactory`appelé lorsque Claptrap est activé pour la première fois pour créer la valeur initiale de l’État.
2. Injection`ISkuRepository`lit le montant d’inventaire initial pour Sku à partir de la base de données, le code spécifique n’est pas répertorié ici, et le lecteur peut afficher l’implémentation dans l’exemple d’entrepôt.

En plus du code d’implémentation, l’enregistrement est nécessaire avant qu’il puisse être appelé.

Ouvrez``SkuGrain pour`HelloClap.`projet.

```cs
  Utilisation de System.Threading.Tasks ;
  The United States Ofthing Hello Claptrap.Actors.Sku.Events;
  Les années 1990, HelloClaptrap.IActor;
  Les États-Unis Ofsing HelloClaptrap.Models;
  .HelloClaptrap.Models.Sku;
  .HelloClaptrap.Models.Sku.Events;
  .Claptrap;
  Newbe.Claptrap.Orleans;

  'espace de noms HelloClaptrap.Actors.Sku
  snr.
snr. skptrapState Information Factory Handler)
      snr. (InventoryUpdateEventHandler), ClaptrapCodes.SkuVentory Update)
      Public Class SkuGrain : ClaptrapBoxgrain<SkuState>, ISkuGrain

          Public SkuGrain ( IClaptrapGrainCommonService Claptrap Grain Common Services
              : base (claptrapGrainCommonService)
          {
          }

          tâche publique<int> GetInventoryAsync (

              Return Task.From Reserve (StateData.Inventory);
          ;

          Public Information Task<int> UpdateInventoryAsync (int diff

              si (diff s 0)
              s
                  jeter nouveau bizException (« diff can’t be 0 »);
              s

              var old s StateData.Inventory;
              var newinvent snr . . . old s diff;
              if (newinvent < 0)

                  nouveau bisp. (
                      $"n’a pas mis à jour l’inventaire. Il sera inférieur à 0 si ajouter diff quantité. courant : {old} , diff : {diff}" );
              .

              var evt . . . ceci. CreateEvent (nouveau InventoryUpdateEvent

                  Diff s diff,
                  newinventory de NewInventory s newinventory
              ) );
              .HandleEventAsync (evt);
              StateData.Inventory;
          ,
      ,
  .
```

## Modifier le contrôleur.

Une fois toutes les étapes précédentes terminées, toutes les parties de Claptrap ont été terminées.Toutefois, Claptrap ne peut pas fournir l’interopérabilité directement avec des programmes externes.Par conséquent, vous devez également ajouter une API à la couche Contrôleur pour les opérations externes d’inventaire de lecture.

Créez`nouveau`SkuController sous`le projet<code>HelloClaptrap.`de dossier</code>des contrôleurs.

```cs
Utilisation de Systems.Threading.Tasks ;
chantent HelloClaptrap.IActor;
. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
et l’utilisation d’Orléans;

, namespace HelloClaptrap.Web.Controllers
,
, route ( " api /[controller]" ) ,
, classe publique SkuController : Contrôleur
,
, private readonly IGrain Factory _grainFactory;
s
skuController (
s.iGrainFactory)
s.
s. _grainFactory . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . _grainFac

<IActionResult> 
{id}


. . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . Tory. GetGrain<ISkuGrain>(id);
s.var inventaire skuGrain.GetInventoryAsync();
, retour Json (nouveau
,
, skuId , id,
, inventaire ,
, s) ;
,
,
, . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
```

1. Une nouvelle API lit l’inventaire d’un SkuId spécifique.Selon la mise en œuvre de l’exemple de code, vous pouvez passer dans`Yueluo-123`vous obtenez un montant d’inventaire de 666.Un SkuId qui n’existe pas jette une exception.
1. Il n’y a pas d’API externe créée ici pour mettre à jour l’inventaire, car cet exemple fera des opérations d’inventaire lorsque vous placez un achat de commande dans l’article suivant, et l’API n’est pas nécessaire ici pour le moment.

## Résumé.

À ce stade, nous avons rempli tout le contenu de la simple exigence de « érer l’inventaire des marchandise ».

Vous pouvez obtenir le code source de cet article à partir de la：suivante

- [Github.](https://github.com/newbe36524/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
- [Gitee.](https://gitee.com/yks/Newbe.Claptrap.Examples/tree/master/src/Newbe.Claptrap.QuickStart3/HelloClaptrap)
