---
title: 'La première étape consiste à créer un projet et à mettre en œuvre un simple panier'
description: 'La première étape consiste à créer un projet et à mettre en œuvre un simple panier'
---

Mettons en œuvre un simple « panier d’achat e-commerce » pour comprendre comment se développer en utilisant Newbe.Claptrap.

<!-- more -->

## Exigences de l’entreprise

Réalisez une simple exigence de « panier d’achat de commerce électronique », ici pour réaliser quelques affaires simples：

- Obtenez les articles et les quantités dans le panier actuel
- Ajoutez des articles à votre panier
- Retirez un article spécifique de votre panier

## Installer le modèle de projet

Tout d’abord, vous devez vous assurer que le . NetCore SDK 3,1[pouvez cliquer ici pour la dernière version de l’installation](https://dotnet.microsoft.com/download).

Une fois le SDK installé, ouvrez la console et exécutez les commandes suivantes pour installer le dernier projet template：

```bash
dotnet new --install Newbe.Claptrap.Template
```

Une fois installé, vous pouvez voir les modèles de projet qui ont été installés dans les résultats d’installation.

![newbe.claptrap.template installé](/images/20200709-001.png)

## Créer un projet

Sélectionnez un emplacement, créez un dossier, et cet exemple choisit de créer un dossier appelé`HelloClaptrap`sous`D:\Répoque`.Le dossier agira comme le dossier de code pour le nouveau projet.

Ouvrez la console et passez l’annuaire de travail`D:\Repo/HelloClaptrap`.Vous pouvez ensuite créer un environnement de projet en exécutant les éléments suivants commands：

```bash
dotnet new newbe.claptrap --name HelloClaptrap
```

> En général, nous vous recommandons`D:\Repo.helloClaptrap`un dossier d’entrepôt Git.Gérez votre code source grâce au contrôle de la version.

## Compilation et démarrage

Une fois le projet créé, vous pouvez ouvrir la solution avec votre IDE préféré pour la compiler.

Lorsque la compilation est terminée, démarrez les projets web et BackendServer avec la fonction Startup sur l’IDE.(VS doit démarrer le service en tant que console, et si vous utilisez IIS Express, vous avez besoin que le développeur regarde le numéro de port correspondant pour accéder à la page Web)

Une fois démarré, vous pouvez afficher`http://localhost:36525/swagger`description du projet d’échantillon en utilisant l’adresse.Cela inclut trois principaux：

- `GET` `/api/Cart/{id}` pour obtenir les articles et les quantités dans un chariot d’identification particulier
- `post` `/api/cart/{id}` ajouter de nouveaux articles à l’achat de l’id spécifié
- `supprimer` `/api/cart/{id}` supprimer un élément spécifique du panier de l’id spécifié

Vous pouvez essayer de passer plusieurs appels à l’API à l’aide du bouton Try It Out sur l’interface.

> - [Comment démarrer plusieurs projets en même temps dans VS](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Comment démarrer plusieurs projets dans Rider en même temps](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Utilisez Huawei Cloud pour accélérer la vitesse de restauration nuget](https://mirrors.huaweicloud.com/)

## La première fois que vous ajoutez un élément, il ne fonctionne pas?

Oui, tu as raison.La mise en œuvre de l’entreprise dans le modèle de projet est basée sur les bogues.

Ouvrons le projet et dépannage et résoudre ces BUGes en ajoutant quelques points de rupture.

Et en positionnant les BUG, vous pouvez comprendre le processus de flux de code du framework.

## Ajouter un point de rupture

Ce qui suit est basé sur différentes instructions IDE pour augmenter la position du point de rupture, vous pouvez choisir votre IDE habituel à faire.

Si vous n’avez pas actuellement d’IDE en main, vous pouvez sauter cette section et lire directement ce qui suit.

### Studio visuel

Démarrez les deux projets en même temps, comme mentionné ci-dessus.

Import Breakpoint：la fenêtre Breakpoint, cliquez sur le bouton et sélectionnez les points d'`et .xml`élément.L’emplacement correspondant peut être trouvé dans les deux captures d’écran suivantes.

![Fenêtre de points d’arrêt ouverts](/images/20200709-002.png)

![Points d’arrêt d’importation](/images/20200709-003.png)

### Coureur

Démarrez les deux projets en même temps, comme mentionné ci-dessus.

Rider n’a actuellement pas de fonction d’importation de point de rupture.Par conséquent, vous devez créer manuellement des points de rupture dans les：

| Fichier                           | Le numéro de ligne |
| --------------------------------- | ------------------ |
| CartController ( CartController ) | 30                 |
| CartController ( CartController ) | 34                 |
| CartGrain ( CartGrain )           | 24                 |
| CartGrain ( CartGrain )           | 32                 |
| AddItemToCartEventHandler         | 14                 |
| AddItemToCartEventHandler         | 28                 |

> [Go To File vous aide à localiser rapidement où se trouvent vos fichiers](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## Commencez à débogage

Ensuite, jetons un coup d’oeil à l’ensemble du code exécuté par une demande.

Tout d’abord, nous allons envoyer une demande POST à travers l’interface fanfaronnade et essayer d’ajouter des éléments au panier.

### Démarrage cartcontroller

Le premier point de rupture fatal est le code controller de l’API Web：

```cs
[HttpPost("{id}")]
public async Task<IActionResult> AddItemAsync(int id, [FromBody] AddItemInput input)
{
    var cartGrain = _grainFactory.GetGrain<ICartGrain>(id.ToString());
    var items = await cartGrain.AddItemAsync(input.SkuId, input.Count);
    return Json(items);
}
```

Dans ce code, nous utilisons le`_grainFactory`pour créer une instance`l’instance ICartGrain`instance.

Cette instance est essentiellement un proxy qui indique un grain spécifique dans Backend Server.

Un id entrant peut être considéré comme localisateur d’une instance à l’aide d’un identificateur unique.Dans ce contexte d’entreprise, il peut être compris comme « id panier » ou « id utilisateur » (si chaque utilisateur n’a qu’un seul panier).

En continuant à débogage et en passant à l’étape suivante, jetons un coup d’oeil à la façon dont ICartGrain fonctionne à l’intérieur.

### Démarrage cartgrain

Vient ensuite le code CartGrain：

```cs
public async Task<Dictionary<string, int>> AddItemAsync(string skuId, int count)
{
    var evt = this.CreateEvent(new AddItemToCartEvent
    {
        Count = count,
        SkuId = skuId,
    });
    await Claptrap.HandleEventAsync(evt);
    return StateData.Items;
}
```

C’est le cœur de la mise en œuvre du cadre, et les éléments clés indiqués dans les：

![Claptrap](/images/20190228-001.gif)

Plus précisément, le code a été exécuté vers un objet de panier spécifique.

Vous pouvez voir à travers le debugger que le skuId entrant et le nombre sont des paramètres passés par Controller.

Ici, vous pouvez faire le following：

- Les données de Claptrap sont modifiées par un événement
- Lire les données enregistrées dans Claptrap

Dans ce code, nous créons une`AddItemToCartEvent`'objet pour représenter une modification du panier.

Il est ensuite passé à Claptrap pour traitement.

Claptrap met à jour ses données d’état après avoir accepté l’événement.

Enfin, nous retournons StateData.Items à l’appelant.(StateData.Items est en fait une propriété raccourcie de Claptrap.State.Data.Items.)Donc, il est effectivement lu de Claptrap. ）

Avec le debugger, vous pouvez voir que le type de données de StateData ressemble à：

```cs
public class CartState : IStateData
{
    public Dictionary<string, int> Items { get; set; }
}
```

C’est l’état du panier conçu dans l’échantillon.Utilisons un dictionnaire`pour`le SkuId dans le panier actuel et le nombre qu’il correspond.

Continuez à débogage et passez à l’étape suivante, et voyons comment Claptrap gère les événements entrants.

### AddItemToCartEventHandler Démarrer

Encore une fois, le code suivant est le：

```cs
public class AddItemToCartEventHandler
    : NormalEventHandler<CartState, AddItemToCartEvent>
{
    public override ValueTask HandleEvent(CartState stateData, AddItemToCartEvent eventData,
        IEventContext eventContext)
    {
        var items = stateData.Items ?? new Dictionary<string, int>();
        if (items.TryGetValue(eventData.SkuId, out var itemCount))
        {
            itemCount += eventData.Count;
        }
        // else
        // {
        //     itemCount = eventData.Count;
        // }

        items[eventData.SkuId] = itemCount;
        stateData.Items = items;
        return new ValueTask();
    }
}
```

Ce code contient deux paramètres importants, le`CartState`, qui représente l’état actuel du panier, et l’événement`AddItemToCartEvent`.

Nous déterminons si le dictionnaire dans le statut contient SkuId et mettons à jour sa quantité en fonction de nos besoins commerciaux.

Continuez le débogage et le code s’exécutera jusqu’à la fin du code.

À ce stade, avec le debugger, vous pouvez voir que le dictionnaire stateData.Items ajoute un de plus, mais le nombre est de 0.La raison en est en fait à cause du code commenté d’autre snippy ci-dessus, qui est la cause du BUG qui ne parvient toujours pas à ajouter le panier pour la première fois.

Ici, n’interrompez pas immédiatement le débogage.Passons au débogage et laissons passer le code pour voir comment tout le processus se termine.

En fait, continuer le débogage, et l’évasion frappera la fin de la méthode pour CartGrain et CartController à son tour.

## Il s’agit en fait d’une architecture à trois niveaux!

La grande majorité des développeurs comprennent l’architecture à trois niveaux.En fait, nous pouvons également dire que Newbe.Claptrap est en fait une architecture à trois niveaux.Comparons les résultats avec un table：

| Trois étages traditionnels           | Newbe.Claptrap       | Description                                                                                                                                            |
| ------------------------------------ | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Couche de présentation               | Couche de contrôleur | Utilisé pour s’interfacer avec des systèmes externes et fournir une interopérabilité externe                                                           |
| Couche d’affaires d’affaires         | Couche de grain      | Traitement commercial des paramètres d’entreprise entrants en fonction de l’entreprise (aucun jugement n’est réellement écrit dans l’échantillon, > 0) |
| Couche de persistance de persistance | Couche EventHandler  | Mettre à jour les résultats de l’entreprise                                                                                                            |

Bien sûr, la similitude ci-dessus est juste une description simple.Dans le processus, il n’est pas nécessaire d’être trop emmêlé, ce n’est qu’une compréhension auxiliaire de la déclaration.

## Vous avez également un BUG à corriger

Ensuite, revenons en arrière et de fixer le précédent « entrée pour la première fois ne prend pas effet » question.

### Il s’agit d’un cadre pour l’examen des tests unitaires

Il ya un projet dans le modèle de projet`HelloClaptrap.Actors.Tests`, qui comprend des tests unitaires du code d’entreprise principal.

Nous savons maintenant que`commenté dans l’AddItemToCartEventHandler`est la principale cause de bugs.

Nous pouvons utiliser les`test dotnet pour`tests unitaires dans un projet de test et obtenir deux erreurs :

```bash
A total of 1 test files matched the specified pattern.
  X AddFirstOne [130ms]
  Error Message:
   Expected value to be 10, but found 0.
  Stack Trace:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
   at FluentAssertions.Execution.TestFrameworkProvider.Throw(String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
   at FluentAssertions.Execution.AssertionScope.FailWith(Func`1 failReasonFunc)
   at FluentAssertions.Execution.AssertionScope.FailWith(Func`1 failReasonFunc)
   at FluentAssertions.Execution.AssertionScope.FailWith(String message, Object[] args)
   at FluentAssertions.Numeric.NumericAssertions`1.Be(T expected, String because, Object[] becauseArgs)
   at HelloClaptrap.Actors.Tests.Cart.Events.AddItemToCartEventHandlerTest.AddFirstOne() in D:\Repo\HelloClaptrap\HelloClaptrap\HelloClaptrap.Actors.Tests\Cart\Events\AddItemToCartEventHandlerTest.cs:line 32
   at HelloClaptrap.Actors.Tests.Cart.Events.AddItemToCartEventHandlerTest.AddFirstOne() in D:\Repo\HelloClaptrap\HelloClaptrap\HelloClaptrap.Actors.Tests\Cart\Events\AddItemToCartEventHandlerTest.cs:line 32
   at NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter`1.GetResult()
   at NUnit.Framework.Internal.AsyncToSyncAdapter.Await(Func`1 invoke)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.RunTestMethod(TestExecutionContext context)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.Execute(TestExecutionContext context)
   at NUnit.Framework.Internal.Execution.SimpleWorkItem.PerformWork()

  X RemoveOne [2ms]
  Error Message:
   Expected value to be 90, but found 100.
  Stack Trace:
     at FluentAssertions.Execution.LateBoundTestFramework.Throw(String message)
   at FluentAssertions.Execution.TestFrameworkProvider.Throw(String message)
   at FluentAssertions.Execution.DefaultAssertionStrategy.HandleFailure(String message)
   at FluentAssertions.Execution.AssertionScope.FailWith(Func`1 failReasonFunc)
   at FluentAssertions.Execution.AssertionScope.FailWith(Func`1 failReasonFunc)
   at FluentAssertions.Execution.AssertionScope.FailWith(String message, Object[] args)
   at FluentAssertions.Numeric.NumericAssertions`1.Be(T expected, String because, Object[] becauseArgs)
   at HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemFromCartEventHandlerTest.RemoveOne() in D:\Repo\HelloClaptrap\HelloClaptrap\HelloClaptrap.Actors.Tests\Cart\Events\RemoveItemFromCartEventHandlerTest.cs:line 40
   at HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemFromCartEventHandlerTest.RemoveOne() in D:\Repo\HelloClaptrap\HelloClaptrap\HelloClaptrap.Actors.Tests\Cart\Events\RemoveItemFromCartEventHandlerTest.cs:line 40
   at NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter`1.GetResult()
   at NUnit.Framework.Internal.AsyncToSyncAdapter.Await(Func`1 invoke)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.RunTestMethod(TestExecutionContext context)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.Execute(TestExecutionContext context)
   at NUnit.Framework.Internal.Execution.SimpleWorkItem.PerformWork()


Test Run Failed.
Total tests: 7
     Passed: 5
     Failed: 2

```

Jetons un coup d’oeil au code pour l’une des unités d’erreur tests：

```cs
[Test]
public async Task AddFirstOne()
{
    using var mocker = AutoMock.GetStrict();

    await using var handler = mocker.Create<AddItemToCartEventHandler>();
    var state = new CartState();
    var evt = new AddItemToCartEvent
    {
        SkuId = "skuId1",
        Count = 10
    };
    await handler.HandleEvent(state, evt, default);

    state.Items.Count.Should().Be(1);
    var (key, value) = state.Items.Single();
    key.Should().Be(evt.SkuId);
    value.Should().Be(evt.Count);
}
```

`AddItemToCartEventHandler`est le principal élément de test de ce test, et parce que stateData et event sont construits manuellement, les développeurs peuvent facilement construire des scénarios qui doivent être testés sur demande.Vous n’avez pas besoin de construire quelque chose de spécial.

Maintenant, il suffit de restaurer`morceau de code commenté à partir de l’addItemToCartEventHandler`et réexéder le test unitaire.Le test unitaire passe.BUG est également une solution naturelle.

Bien sûr, il y a un autre test unitaire sur le scénario de suppression qui a échoué.Les développeurs peuvent résoudre ce problème en suivant les idées de « points de rupture » et de « tests unitaires » décrites ci-dessus.

## Les données ont persisté

Vous pouvez essayer de redémarrer Backend Server et le Web, et vous constaterez que les données sur qui vous avez travaillé précédemment ont été persistantes.

Nous le couvrirons plus loin dans un chapitre de suivi.

## Résumé

Dans cet article, nous examinons d’abord comment créer un cadre de projet de base pour mettre en œuvre un scénario simple de panier d’achat.

Il y a beaucoup de choses que nous n’avons pas：détails, la structure du projet, le déploiement, la persévérance, et ainsi de suite.Vous pouvez en savoir plus à ce sujet dans les articles suivants.
