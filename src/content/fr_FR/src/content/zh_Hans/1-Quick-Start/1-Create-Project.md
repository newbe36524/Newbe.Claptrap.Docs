---
title: 'La première étape - créer un projet et mettre en œuvre un panier simple'
metaTitle: '第一步——创建项目，实现简易购物车'
metaDescription: 'La première étape - créer un projet et mettre en œuvre un panier simple'
---

Mettons en œuvre une simple exigence de « chariot de commerce électronique » pour voir comment se développer en utilisant Newbe.Claptrap.

> [当前查看的版本是由机器翻译自简体中文，并进行人工校对的结果。若文档中存在任何翻译不当的地方，欢迎点击此处提交您的翻译建议。](https://crwd.in/newbeclaptrap)

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

> 通常来说，我们建议将`D:\Repo\HelloClaptrap`创建为 Git 仓库文件夹。通过版本控制来管理您的源码。

## Compilation et démarrage

Une fois le projet créé, vous pouvez compiler la solution avec votre IDE préféré ouvert.

Une fois compilé, démarrez les projets Web et BackendServer avec la fonctionnalité Démarrage sur IDE.(VS doit démarrer la console de service, et si vous utilisez IIS Express, vous devez que le développeur examine le numéro de port correspondant pour accéder à la page Web)

Une fois le début terminé, vous pouvez`http://localhost:36525/swagger`Adresse pour afficher la description de l’API de l’élément exemple.Cela comprend trois API principales：

- `Avoir` `/api/Cart/{id}` Obtenir des articles et des quantités dans un panier d’identification spécifique
- `Publier` `/api/Cart/{id}` Ajouter un nouvel élément à l’achat de l’id spécifié
- `Supprimer` `/api/Cart/{id}` Supprimer un élément spécifique du panier d’achat de l’id spécifié

Vous pouvez essayer de passer plusieurs appels à l’API via le bouton Try It Out de l’interface.

> - [如何在 VS 中同时启动多个项目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [如何在 Rider 中同时启动多个项目](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [使用华为云加速 nuget 还原速度](https://mirrors.huaweicloud.com/)

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

> [通过 Go To File 可以助您快速定位文件所在](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

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

此处便是框架实现的核心，如下图所示的关键内容：

![Claptrap](/images/20190228-001.gif)

具体说到业务上，代码已经运行到了一个具体的购物车对象。

可以通过调试器看到传入的 skuId 和 count 都是从 Controller 传递过来的参数。

在这里您可以完成以下这些操作：

- Modifier les données dans Claptrap avec des événements
- Lire les données enregistrées dans Claptrap

这段代码中，我们创建了一个`AddItemToCartEvent`对象来表示一次对购物车的变更。

然后将它传递给 Claptrap 进行处理了。

Claptrap 接受了事件之后就会更新自身的 State 数据。

最后我们将 StateData.Items 返回给调用方。（实际上 StateData.Items 是 Claptrap.State.Data.Items 的一个快捷属性。因此实际上还是从 Claptrap 中读取。）

通过调试器，可以看到 StateData 的数据类型如下所示：

```cs
Classe publique CartState : IStateData
{
    Dictionnaire public<string, int> Articles . . . obtenir; ensemble; . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . . .
}
```

这就是样例中设计的购物车状态。我们使用一个`Dictionary`来表示当前购物车中的 SkuId 及其对应的数量。

继续调试，进入下一步，让我们看看 Claptrap 是如何处理传入的事件的。

### Début du gestionnaire d’événements AddItemToCart

再次命中断点的是下面这段代码：

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

这段代码中，包含有两个重要参数，分别是表示当前购物车状态的`CartState`和需要处理的事件`AddItemToCartEvent`。

我们按照业务需求，判断状态中的字典是否包含 SkuId，并对其数量进行更新。

继续调试，代码将会运行到这段代码的结尾。

此时，通过调试器，可以发现，stateData.Items 这个字典虽然增加了一项，但是数量却是 0 。原因其实就是因为上面被注释的 else 代码段，这就是第一次添加购物车总是失败的 BUG 成因。

在这里，不要立即中断调试。我们继续调试，让代码走完，来了解整个过程如何结束。

实际上，继续调试，断点将会依次命中 CartGrain 和 CartController 对应方法的方法结尾。

## Il s’agit en fait d’une architecture à trois niveaux!

绝大多数的开发者都了解三层架构。其实，我们也可以说 Newbe.Claptrap 其实就是一个三层架构。下面我们通过一个表格来对比一下：

| Traditionnel à trois niveaux           | Newbe.Claptrap       | Description                                                                                                                                     |
| -------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Couche de présentation de présentation | Couche du contrôleur | Utilisé pour accoster des systèmes externes pour assurer l’interopérabilité externe                                                             |
| Niveau d’entreprise                    | Couche de grain      | Traitement de l’entreprise basé sur les paramètres métier entrants (l’échantillon n’écrit pas réellement le jugement, doit juger le compte > 0) |
| Couche de persistance de persistance   | Calque EventHandler  | Mettre à jour les résultats de l’entreprise                                                                                                     |

当然上面的类似只是一种简单的描述。具体过程中，不需要太过于纠结，这只是一个辅助理解的说法。

## Vous avez également un BUG à corriger

接下来我们重新回过头来修复前面的“首次加入商品不生效”的问题。

### Il s’agit d’un cadre pour l’examen des tests unitaires

在项目模板中存在一个项目`HelloClaptrap.Actors.Tests`，该项目包含了对主要业务代码的单元测试。

我们现在已经知道，`AddItemToCartEventHandler`中注释的代码是导致 BUG 存在的主要原因。

我们可以使用`dotnet test`运行一下测试项目中的单元测试，可以得到如下两个错误:

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

我们看一下其中一个出错的单元测试的代码：

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

`AddItemToCartEventHandler`是该测试主要测试的组件，由于 stateData 和 event 都是通过手动构建的，因此开发者可以很容易就按照需求构建出需要测试的场景。不需要构建什么特殊的内容。

现在，只要将`AddItemToCartEventHandler`中那段被注释的代码还原，重新运行这个单元测试。单元测试便就通过了。BUG 也就自然的修复了。

当然，上面还有另外一个关于删除场景的单元测试也是失败的。开发者可以按照上文中所述的“断点”、“单元测试”的思路，来修复这个问题。

## Les données ont été maintenues.

您可以尝试重新启动 Backend Server 和 Web， 您将会发现，您之前操作的数据已经被持久化的保存了。

我们将会在后续的篇章中进一步介绍。

## Résumé

通过本篇，我们初步了解了一下，如何创建一个基础的项目框架来实现一个简单的购物车场景。

这里还有很多内容我们没有详细的说明：项目结构、部署、持久化等等。您可以进一步阅读后续的文章来了解。
