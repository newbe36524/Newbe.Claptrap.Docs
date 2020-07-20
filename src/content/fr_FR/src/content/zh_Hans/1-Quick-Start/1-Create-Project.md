---
title: 'La première étape - créer un projet et mettre en œuvre un panier simple'
metaTitle: 'La première étape - créer un projet et mettre en œuvre un panier simple'
metaDescription: 'La première étape - créer un projet et mettre en œuvre un panier simple'
---

Mettons en œuvre une simple exigence de « chariot de commerce électronique » pour voir comment se développer en utilisant Newbe.Claptrap.

> [La version actuellement vue est le résultat d’une correction simplifiée et manuelle traduite par la machine.S’il y a une mauvaise traduction dans le document, veuillez cliquer ici pour soumettre votre proposition de traduction.](https://crwd.in/newbeclaptrap)

<!-- more -->

## Besoins commerciaux

Réalisez une simple exigence de « panier d’achat e-commerce », où quelques affaires simples：

- Obtenez des articles et des quantités dans votre panier d’achat actuel
- Ajouter des articles à votre panier
- Supprimer des articles spécifiques de votre panier

## Installer des modèles de projet

Tout d’abord, vous devez vous assurer que vous avez installé le . SDK NetCore 3.1.[Vous pouvez cliquer ici pour la dernière version pour l’installation](https://dotnet.microsoft.com/download)。

Une fois le SDK installé, ouvrez la console et exécutez les commandes suivantes pour installer les derniers modèles de projet：

```bash
dotnet nouveau - nouveau installbe.Claptrap.Template
```

Une fois installés, vous pouvez voir les modèles de projet qui ont déjà été installés dans les résultats d’installation.

![Modèle Newbe.claptrap installé](/images/20200709-001.png)

## Créer un projet

Sélectionnez un emplacement pour créer un dossier, et cet exemple sélectionne le`D:\ROeb`Créer un nom appelé`HelloClaptrap`le dossier de la .Le dossier sera utilisé comme dossier de code pour les nouveaux projets.

Ouvrez la console et commutez le répertoire de travail`D:\Repo-HelloClaptrap`。Exécutez ensuite la commande suivante pour créer un projet：

```bash
dotnet nouveau newbe.claptrap - nom HelloClaptrap
```

> En général, nous vous recommandons.`D:\Repo.HelloClaptrap.`Créez un dossier en tant qu’entrepôt Git.Gérez votre code source avec le contrôle de version.

## Compilation et démarrage

Une fois le projet créé, vous pouvez compiler la solution avec votre IDE préféré ouvert.

Une fois compilé, démarrez les projets Web et BackendServer avec la fonctionnalité Démarrage sur IDE.(VS doit démarrer la console de service, et si vous utilisez IIS Express, vous devez que le développeur examine le numéro de port correspondant pour accéder à la page Web)

Une fois le début terminé, vous pouvez`http://localhost:36525/swagger`Adresse pour afficher la description de l’API de l’élément exemple.Cela comprend trois API principales：

- `Avoir` `/api/Cart/{id}` Obtenir des articles et des quantités dans un panier d’identification spécifique
- `Publier` `/api/Cart/{id}` Ajouter un nouvel élément à l’achat de l’id spécifié
- `Supprimer` `/api/Cart/{id}` Supprimer un élément spécifique du panier d’achat de l’id spécifié

Vous pouvez essayer de passer plusieurs appels à l’API via le bouton Try It Out de l’interface.

> - [Comment démarrer plusieurs projets simultanément en VS](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Comment démarrer plusieurs projets dans Rider en même temps](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Utilisez Huawei Cloud pour accélérer la vitesse de restauration nuget](https://mirrors.huaweicloud.com/)

## D’abord ajouter le produit, pas d’effet?

Oui, tu as raison.Il y a des BOGUES dans la mise en œuvre de l’entreprise dans le modèle de projet.

Ensuite, ouvrons le projet et dépanner et résolvons ces bogues en ajoutant quelques points d’arrêt.

Et en localisant le BUG, vous pouvez comprendre le processus de flux de code de l’infrastructure.

## Ajouter des points d’arrêt

Le besoin suivant d’augmenter l’emplacement des points d’arrêt en fonction des différentes instructions IDE, et vous pouvez choisir l’IDE que vous êtes habitué à l’exploitation.

Si vous n’avez pas actuellement d’IDE sous la main, vous pouvez également sauter cette section et lire directement ce qui suit.

### Visual Studio

Démarrer les deux projets en même temps, comme mentionné ci-dessus.

Points d’arrêt d’importation：Ouvrez la fenêtre Point d’arrêt, cliquez sur le bouton, sélectionnez sous l’élément`points d’arrêt.xml`Fichier.L’emplacement d’exploitation correspondant se trouve dans les deux captures d’écran ci-dessous.

![Fenêtre de points d’arrêt Openpoints](/images/20200709-002.png)

![Importer des points d’arrêt](/images/20200709-003.png)

### Coureur

Démarrer les deux projets en même temps, comme mentionné ci-dessus.

Rider n’a pas actuellement de fonction d’importation de point d’arrêt.Par conséquent, vous devez créer manuellement des points d’arrêt aux emplacements suivants：

| Fichier                                 | Ligne No. |
| --------------------------------------- | --------- |
| CartController                          | 30        |
| CartController                          | 34        |
| CartGrain                               | 24        |
| CartGrain                               | 32        |
| Gestionnaire d’événements AddItemToCart | 14        |
| Gestionnaire d’événements AddItemToCart | 28        |

> [Aller au fichier vous permet de localiser rapidement où se trouvent vos fichiers](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## Démarrer le débogage

Ensuite, nous prenons une demande pour voir comment le code entier s’exécute.

Tout d’abord, nous allons envoyer une demande post par l’interface swagger et essayer d’ajouter des éléments au panier.

### Début cartController

La première bouée de sauvetage est le code Contrôleur pour la couche API Web：

```cs
(HttpPost){id}")]
Tâche async du public<IActionResult> AddItemAsync (id int, [FromBody] Entrée AddItem)
{
    var cartgrain s _grainFactory.GetGrain<ICartGrain>(id. ToString ();
    Les éléments var attendent cartgrain.AddItemAsync (entrée. SkuId, entrée. Compte);
    retour Json (articles);
}
```

Dans ce code, nous passons`_grainFactory`pour créer un`ICartGrain`Exemple.

Cette instance est essentiellement un proxy qui pointe vers un grain spécifique dans Backend Server.

L’id entrant peut être considéré comme un identificateur unique pour l’instance d’emplacement.Dans ce contexte d’entreprise, il peut être compris comme « id de chariot » ou « id d’utilisateur » (si chaque utilisateur n’a qu’un seul panier).

Continuez avec le débogage et passons à l’étape suivante, voyons comment fonctionne l’intérieur d’ICartGrain.

### Début cartgrain

Le point d’arrêt suivant est le code CartGrain.：

```cs
Tâche async du public<Dictionary<string, int>> AddItemAsync (skuId de chaîne, nombre int)
{
    var evt s.this. CreateEvent (nouveau AddItem ToCartEvent)
    {
        Comte - Comte,
        SkuId skuId,
    });
    attendre Claptrap.HandleEventAsync (evt);
    Renvoyer StateData.Items;
}
```

Voici le cœur de la mise en œuvre du cadre, comme indiqué dans l’image suivante.：

![Claptrap](/images/20190228-001.gif)

Plus précisément, le code s’est exécuté à un objet de panier d’achat spécifique.

Vous pouvez voir à travers le débogueur que le skuId entrant et le compte sont des paramètres transmis à partir du contrôleur.

Ici, vous pouvez faire ces choses.：

- Modifier les données dans Claptrap avec des événements
- Lire les données enregistrées dans Claptrap

Dans ce code, nous en créons un.`AddItemToCart, événement.`Objet pour représenter une modification du panier.

Il est ensuite transmis à Claptrap pour traitement.

Claptrap met à jour ses données d’état après avoir accepté l’événement.

Enfin, nous ren retournerons StateData.Items à l’appelant.(En fait, StateData.Items est une propriété rapide pour Claptrap.State.Data.Items.)Donc, il est en fait encore lu de Claptrap. )

À partir du débogueur, vous pouvez voir que les types de données de StateData sont affichés ci-dessous.：

```cs
Classe publique CartState : IStateData
{
    Dictionnaire public<string, int> Articles . . . obtenir; ensemble; . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
}
```

C’est l’état du panier conçu dans l’échantillon.On en utilise un.`Dictionary.`pour représenter le SkuId dans le panier d’achat actuel et sa quantité correspondante.

Continuez le débogage et passez à l’étape suivante pour voir comment Claptrap gère les événements entrants.

### Début du gestionnaire d’événements AddItemToCart

Encore une fois, le point d’interruption est ce code ci-dessous.：

```cs
classe publique AddItemCartEvent Handler
    : Gestionnaire NormalEvent<CartState, AddItemToCartEvent>
{
    contrôle public ValueTask HandleEvent (CartState StateData, AddItemToCartEvent Event EventData,
        IEventContext EventContext)
    {
        Articles Var . . . stateData.Items ? nouveau Dictionnaire<string, int>();
        si (articles. TryGetValue (eventData.SkuId, out var itemCount))
        {
            itemCount s eventData.count;
        }
        Autre
        // {
        itemCount - eventData.Count;
        // }

        Articles[eventData.SkuId] s itemCount;
        StateData.Items . . .
        retourner de nouvelles ValueTask();
    }
}
```

Ce code contient deux paramètres importants qui représentent l’état actuel du panier d’achat.`CartState.`et les événements qui doivent être gérés.`AddItemToCart, événement.`。

Nous déterminons si le dictionnaire dans l’état contient le mont sous-marin SkuId en fonction des besoins de l’entreprise et de mettre à jour son nombre.

Continuez le débogage et le code s’exécutera jusqu’à la fin de ce code.

À ce stade, à travers le débogueur, vous pouvez voir que le dictionnaire stateData.Items a augmenté d’un, mais le nombre est 0.La raison en est en fait à cause de l’autre extrait ci-dessus, qui est la cause du BUG qui ne parvient toujours pas à ajouter un panier pour la première fois.

Ici, n’interrompez pas immédiatement le débogage.Allons de l’avant et laissons le code passer en revue pour voir comment l’ensemble du processus se termine.

En fait, en continuant le débogage, le point d’arrêt frappe à son tour l’extrémité des méthodes cartGrain et CartController.

## Il s’agit en fait d’une architecture à trois niveaux!

La grande majorité des développeurs comprennent l’architecture à trois niveaux.En fait, nous pouvons aussi dire que Newbe. Claptrap est en fait une architecture à trois niveaux.Comparons-le dans un tableau.：

| Traditionnel à trois niveaux           | Newbe.Claptrap       | Description                                                                                                                                     |
| -------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Couche de présentation de présentation | Couche du contrôleur | Utilisé pour accoster des systèmes externes pour assurer l’interopérabilité externe                                                             |
| Niveau d’entreprise                    | Couche de grain      | Traitement de l’entreprise basé sur les paramètres métier entrants (l’échantillon n’écrit pas réellement le jugement, doit juger le compte > 0) |
| Couche de persistance de persistance   | Calque EventHandler  | Mettre à jour les résultats de l’entreprise                                                                                                     |

Bien sûr, l’analogie ci-dessus est une description simple.Dans le processus spécifique, il n’est pas nécessaire d’être trop empêtré, ce n’est qu’une compréhension auxiliaire de l’énoncé.

## Vous avez également un BUG à corriger

Ensuite, nous revenons en arrière et fixer le précédent « Premiers produits de jointure ne prennent pas effet » question.

### Il s’agit d’un cadre pour l’examen des tests unitaires

Il y a un projet dans le modèle de projet.`HelloClaptrap.Actors.Tests.`Le projet contient des tests unitaires du code d’activité principal.

Nous savons maintenant que`AddItem ToCart Gestionnaire d’événements.`Le code dans les commentaires est la cause principale du BUG.

On peut l’utiliser.`test dotnet.`Si vous exécutez les tests unitaires dans votre projet de test, vous obtenez deux erreurs :

```bash
Un total de 1 fichiers de test correspondait au modèle syd dh’fydd.
  X AddFirstOne [130ms]
  Message d’erreur :
   D’Value à 10 ans, mais trouvé 0.
  Trace de pile :
     à FluentS. Execution.LateTestBoundFramework.Throw (Message de chaîne)
   à FluentS. Execution.TestFramework Provider.T. Throw
   à FluentS. Execution.DefaultKStrategy.HandleFailure (Message de chaîne)
   À FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   À FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   à FluentS. Execution.Ax. Scope.FailWith (Message de chaîne, Objet?args)
   à FluentS.Numeric.NumericS'1.Be (T attendu, String because, Object' becauseArgs)
   À HelloClaptrap.Actors.Tests.Cart.Events.AddItemCartEventHandler.AddFirstOne() en D:\Repo?HelloClaptrap?HelloClaptrap?HelloClaptrap.Actors.Tests?Cart?Events?AddToCartEventHandlerTest.cs: ligne 32
   À HelloClaptrap.Actors.Tests.Cart.Events.AddItemCartEventHandler.AddFirstOne() en D:\Repo?HelloClaptrap?HelloClaptrap?HelloClaptrap.Actors.Tests?Cart?Events?AddToCartEventHandlerTest.cs: ligne 32
   à NUnit.Framework.Internal.TaskWaitAdapter.GenericAdapter'1.GetResult ()
   à NUnit.Framework.Internal.AsyncToSyncAdapter.Await (Func'1 Invoke)
   à NUnit.Framework.Internal.Commands.TestMethodCommand.RunTestMethod (TestExecution Context)
   à NUnit.Framework.Internal.Commands.TestMethod Command.Execute (TestExecution Context)
   à NUnit.Framework.Internal.Execution SimpleWorkItem.PerformWork()

  X RemoveOne [2ms]
  Message d’erreur :
   D’Value à 90 ans, mais en a trouvé 100.
  Trace de pile :
     à FluentS. Execution.LateTestBoundFramework.Throw (Message de chaîne)
   à FluentS. Execution.TestFramework Provider.T. Throw
   à FluentS. Execution.DefaultKStrategy.HandleFailure (Message de chaîne)
   À FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   À FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   à FluentS. Execution.Ax. Scope.FailWith (Message de chaîne, Objet?args)
   à FluentS.Numeric.NumericS'1.Be (T attendu, String because, Object' becauseArgs)
   à HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemCartEventHandlerHandler.RemoveOne() en D:\Repo?HelloClaptrap?HelloClap.Actors.Tests?Cart?Evénements\RMoveItem De CartEvent HandlerTest.cs: ligne 40
   à HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemCartEventHandlerHandler.RemoveOne() en D:\Repo?HelloClaptrap?HelloClap.Actors.Tests?Cart?Evénements\RMoveItem De CartEvent HandlerTest.cs: ligne 40
   à NUnit.Framework.Internal.TaskWaitAdapter.GenericAdapter'1.GetResult ()
   à NUnit.Framework.Internal.AsyncToSyncAdapter.Await (Func'1 Invoke)
   à NUnit.Framework.Internal.Commands.TestMethodCommand.RunTestMethod (TestExecution Context)
   à NUnit.Framework.Internal.Commands.TestMethod Command.Execute (TestExecution Context)
   à NUnit.Framework.Internal.Execution SimpleWorkItem.PerformWork()


Échec de l’exécution de test.
Nombre total de tests: 7
     Passé: 5
     Échec: 2

```

Regardons le code pour l’un des tests unitaires défectueux.：

```cs
[Test]
asynch task addFirstOne public ()
{
    utilisation var mocker - AutoMock.GetStrict ();

    attendre l’utilisation var handler s-mocker. Créer<AddItemToCartEventHandler>();
    var état s nouveau CartState ();
    var evt s nouveau AddItemToCartEventEvent
    {
        SkuId skuId1,
        Compte s 10
    };
    attendre gestionnaire. HandleEvent (état, evt, par défaut);

    État. Items.Count.Down.) Être (1);
    var (clé, valeur) s état. Items.Single();
    Clé. « Quoi ») Soyez (evt. SkuId);
    Valeur. « Quoi ») Soyez (evt. Compte);
}
```

`AddItem ToCart Gestionnaire d’événements.`est le principal composant de test de ce test, et puisque les données d’état et l’événement sont construits manuellement, il est facile pour les développeurs de construire des scénarios qui doivent être testés au besoin.Il n’est pas nécessaire de construire quelque chose de spécial.

Maintenant, tant qu’il le fera.`AddItem ToCart Gestionnaire d’événements.`Restaurez le code commenté et réexécuter le test unitaire.Les tests unitaires passent.LES BOGUES SONT ÉGALEMENT NATURELLEMENT CORRIGÉS.

Bien sûr, il ya un autre test unitaire du scénario de suppression ci-dessus qui échoue.Les développeurs peuvent résoudre ce problème en suivant les idées de « point d’arrêt » et de « test unitaire » décrites ci-dessus.

## Les données ont été maintenues.

Vous pouvez essayer de redémarrer Backend Server et le Web, et vous constaterez que les données sur lesquelles vous avez travaillé auparavant ont été maintenues.

Nous le couvrirons davantage dans un chapitre ultérieur.

## Résumé

Grâce à cet article, nous avons une compréhension préliminaire de la façon de créer un cadre de projet de base pour mettre en œuvre un scénario simple panier d’achat.

Il y a beaucoup de choses que nous n’avons pas à expliquer en détail.：Structure du projet, déploiement, persistance, et plus encore.Vous pouvez lire ensuite pour en savoir plus.
