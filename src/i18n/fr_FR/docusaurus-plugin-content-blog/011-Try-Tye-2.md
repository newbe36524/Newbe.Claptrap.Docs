---
date: 2021-02-06
title: Utiliser Tye pour aider à développer des applications k8s est aussi simple que cela (II)
---

Dans le dernier article, explorons les autres façons de Tye de l’utiliser.Jetons un coup d’oeil à la façon d’utiliser la découverte de service dans Tye.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## Service Discovery - Une partie indispensable du développement des microservateurs

> La découverte du service est que le module de service nouvellement enregistré peut être découvert par d’autres appelants en temps opportun.La découverte automatique est réalisée indépendamment des ajouts de service et des coupures de service. En savoir plus sur l’inscription au service et discovery <https://zhuanlan.zhihu.com/p/161277955>

> Dans le processus d’appel d’un microservateur, en supposant qu’en appelant une API REST ou une API Thrift, afin de remplir une demande d’appel, le code doit spécifier l’adresse IP et le port où le service est situé, dans les applications traditionnelles, l’adresse réseau et le port sont statiques et généralement ne changent pas, nous avons juste besoin de les faire correspondre au fichier de configuration, nous pouvons compléter l’appel en lisant le fichier de configuration. Toutefois, dans les architectures modernes de microserveurs basés sur le Cloud, cette approche échouera, car les cas de services sont des adresses assignées dynamiquement, et les adresses réseau sont dynamiques, ce qui a l’avantage de faciliter la mise à l’échelle automatique, le traitement des pannes et la mise à niveau des services. « Mécanisme de découverte de service dans l’architecture microserver » <https://www.imooc.com/article/details/id/291255>

En termes simples, la découverte de service vous permet d’utiliser des noms entre les services au lieu d’adresses et de ports spécifiques ou même des détails d’accès.Il est ainsi plus facile pour les services d’être utilisés dans des environnements où les instances d’application telles que les natifs du cloud sont variables.

## Premièrement, nous avons besoin de deux services

Comme dans l’article précédent, nous utilisons la ligne de commande pour créer deux services.

```bash
dotnet nouveau sln -n TyeTest
dotnet nouveau webapi -n TyeTest
dotnet sln .\TyeTest.sln ajouter .\TyeTest\TyeTest.csproj
dotnet nouveau webapi -n TyeTest2
dotnet sln .\TyeTest.sln ajouter .\TyeTest2\TyeTest2.csproj
```

然后使用 tye init 创建 tye.yml 。

Vous pouvez trouver ce qui suit dans tye.yml：

```yml
nom: tyetest
services:
  - nom: tyetest
    project: TyeTest/TyeTest.csproj
  - nom: tyetest2
    project: TyeTest2/TyeTest2.csproj
```

Cela nous permet de commencer à`services locaux en utilisant`tye run.

Ensuite, nous allons moderniser le service TyeTest afin qu’il appelle TyeTest2 comme son service en aval.

Cela nous permet de vérifier l’efficacité de la découverte du service.

## Ensuite, utilisez Tye.Configuration

### Ajouter un paquet

Exécutez la commande suivante pour ajouter un paquet à l’project：

```bash
dotnet ajouter ./TyeTest/TyeTest.csproj paquet Microsoft.Tye.Extensions.Configuration --version 0.6.0-alpha.21070.5
```

### Ajouter http://www.http://www.http://www.twitter.com/http://www.http://www.http

Parce que nous avons besoin d’appeler les services en aval en utilisant HttpClient, nous devons utiliser httpClientFactory.Par conséquent, le projet TyeTest vise à Startup.cs’enregistrement des http://www.twitter.com/TyTest.

```csharp
  vide public ConfigureServices (services IServiceCollection)
  {
+ services. AddHttpClient();
      services. AddControllers();
      services. AddSwaggerGen(c =>
      {
          c.SwaggerDoc (« v1 », nouveau OpenApiInfo { Titre = « TyeTest », Version = « v1 » });
      });
  }
```

### Utilisez HttpClient pour invoquer le service

Entrez WeatherForecastController, où nous utilisons HttpClient pour invoquer les services en aval et retourner les données qui en résultent：

```cs
en utilisant le système;
utilisant System.Collections.Generic;
utilisant System.Linq;
en utilisant System.Net.Http;
utilisant System.Text.Json;
utilisant System.Threading.Tasks;
en utilisant Microsoft.AspNetCore.Mvc;
en utilisant Microsoft.Extensions.Configuration;
'utilisation de Microsoft.Extensions.Logging;

'espace de nom TyeTest.Controllers
{
    [ApiController]
    [Route( »[controller]« )]
    classe publique WeatherForecastController : ControllerBase
    {
        privé readonly ILogger<WeatherForecastController> _logger;
        'IConfiguration privée _configuration;
        privé readonly HttpClient _httpClient;

        public WeatherForecastController (enregistreur<WeatherForecastController> ILogger, configuration
            IConfiguration,
            httpClient httpClient)
        {
            _logger = bûcheron;
            _configuration = configuration;
            _httpClient = httpClient;
        }

        [HttpGet]
        public async Task<string> Get ()
        {
            var serviceUri = _configuration. GetServiceUri (« tyetest2 »);
            Console.WriteLine (serviceUri);
            var httpResponseMessage = attendre _httpClient.GetAsync ($ »{serviceUri}WeatherForecast »);
            var json = attendez httpResponseMessage.Content.ReadAsStringAsync();
            json retour;
        }
    }
}
```

Il est à noter que：

1. L’IConfiguration`injectée dans`est un mécanisme intrinsèque d’Aspnet Core et ne nécessite pas d’enregistrement spécial.
2. `_configuration. GetServiceUri (« tyetest2 »)`point clé de cet exemple.Il obtient l’adresse Uri spécifique du service par un nom de service, qui masque les détails de l’adresse de service au moment du déploiement.

C’est ça, c’est fini.

L’étape suivante est`exécuter tye`vous pouvez afficher les services modifiés localement.L’interface du premier service est appelée et les données attendues du deuxième service peuvent être obtenues.

> Le véritable fonctionnement de la découverte de service à Tye se trouve dans la bibliothèque officielle pour： <https://github.com/dotnet/tye/blob/master/docs/reference/service_discovery.md#how-it-works-uris-in-development>

## Enfin, envoyez-le à K8S pour une interview

Pour publier sur k8s pour les tests, il suffit de suivre le contenu précédent et mis en place pour docker registre et l’entrée pour vérifier.

Les développeurs peuvent configurer et essayer eux-mêmes.

## Résumé

Dans cet article, nous avons terminé avec succès l’utilisation de Tye pour compléter l’utilisation du mécanisme de découverte de service.De cette façon, nous pouvons utiliser des noms de service pour nous appeler entre les services, masquer des détails de déploiement spécifiques et simplifier le développement.

Toutefois, dans la production du monde réel, il n’y a pas que des informations sur les hôtes et les ports entre les services.Parfois, vous devez également définir des noms d’utilisateur, des mots de passe et des paramètres supplémentaires.Typique est la gestion des chaînes de connexion de base de données.

Dans le prochain article, nous allons aller plus loin sur la façon de relier la base de données dans Tye.

<!-- md Footer-Newbe-Claptrap.md -->
