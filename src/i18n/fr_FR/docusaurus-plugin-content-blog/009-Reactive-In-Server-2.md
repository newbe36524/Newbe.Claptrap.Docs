---
date: 2020-06-28
title: Parlez de l’application de la programmation réactive du côté du service, de l’optimisation des opérations de base de données, d’accélérer Upsert
---

La programmation réactive est largement utilisée dans la programmation client, tandis que les applications actuelles du côté du service sont relativement moins mentionnées.Cet article décrit comment améliorer les performances des opérations de base de données en appliquant des programmes de réponse dans la programmation côté service.

<!-- more -->

<!-- md Header-Newbe-Claptrap.md -->

## L’ouverture est la conclusion

Suite à la dernière[« Parler de l’application de la programmation réactive du côté du service, l’optimisation des opérations de base de données, de 20 secondes à 0,5 seconds](008-Reactive-In-Server-1)cette fois, nous apportons une étude de cas de l’optimisation upsert avec la programmation réactive.Il est conseillé aux lecteurs de lire d’abord l’article précédent, ce qui facilite la lecture des méthodes décrites dans cet article.

C’est aussi un moyen de combiner les opérations upsert individuelles en vrac en utilisant l’idée de lots.L’objectif de réduction de la consommation de liens de base de données a été atteint afin d’améliorer considérablement les performances.

## Le scénario d’affaires

在最近的一篇文章[《十万同时在线用户，需要多少内存？——Newbe.Claptrap 框架水平扩展实验》](003-How-Many-RAMs-In-Used-While-There-Are-One-Hundred-Thousand-Users-Online)中。Nous vérifions rapidement la justesse de JWT en activant claptrap, un résident de mémoire multiple.

Cependant, il y avait un problème technique qui n’était pas resolved：

Le framework Newbe.Claptrap conçoit une feature：lorsque Claptrap Deactive, vous pouvez choisir d’enregistrer l’instantané dans la base de données immédiatement.Par conséquent, lorsque vous essayez d’arrêter un nœud d’un cluster, s’il y a un grand nombre de Claptrap sur le nœud, un grand nombre d’opérations upsert de base de données sont générées.Poussez instantanément la consommation de base de données et même causer quelques erreurs et ne parviennent pas à enregistrer.

## Un peu de code

Avec le précédent`IBatchOperator`, il reste très peu de code pour cet article.

Tout d’abord, écrivez un référentiel financé par l’action à l’aide de l’IBatchOperator du dernier article, comme le code：

```cs
classe publique BatchUpsert : IUpsertRepository
{
    privé readonly IDatabase _database;
    privé readonly IBatchOperator<(int, int), int> _batchOperator;

    batchupsert public (base de données IDatabase)
    {
        _database = base de données;
        options var = nouveaux BatchOperatorOptions<(int, int), int>
        {
            BufferCount = 100,
            BufferTime = TimeSpan.FromMilliseconds(50),
            DoManyFunc = DoManyFunc
        };
        _batchOperator = nouveau batchoperator<(int, int), int>(options);
    }

    tâche privée<int> DoManyFunc (IEnumerable<(int, int)> arg)
    {
        retour _database. UpsertMany (arg. ToDictionary(x => x.Item1, x => x.Item2));
    }

    tâche publique UpsertAsync (clé int, valeur int)
    { retour
        _batchOperator.CreateTask ((clé, valeur));
    }
}
```

Cette optimisation peut alors être bien faite en implémentant la méthode UpsertMany pour la base de données correspondante.

## Opérations sur diverses bases de données

Combiné avec le Newbe.Claptrap maintenant projet réel.Actuellement, SQLite, PostgreSQL, MySql et MongoDB sont pris en charge.Ci-dessous, les opérations Upsert en vrac pour différents types de bases de données sont décrites séparément.

Étant donné que les exigences Upsert dans le projet Newbe.Claptrap sont basées sur la clé principale comme clé de comparaison, cela n’est discuté que ci-dessous.

### Sqlite

Selon les documents officiels, `insérer ou remplacer dans` la nécessité de remplacer les données dans le premier conflit clé.

Les instructions spécifiques sont formatées comme follows：

```SQL
INSÉRER OU REMPLACER DANS TestTable (id, valeur)
VALEURS
(@id0 @value0),
...
(@idn @valuen);
```

Il suffit donc de coudre les instructions et les appels de paramètres directement.Il est important de noter que les paramètres passables de SQLite par défaut à 999, de sorte que le nombre de variables cousues ne devrait pas être plus élevé.

> [Le document officiel：INSERT](https://www.sqlite.org/lang_insert.html)

### Postgresql

众所周知，PostgreSQL 在进行批量写入时，可以使用高效的 COPY 语句来完成数据的高速导入，这远远快于 INSERT 语句。但可惜的是 COPY 并不能支持 ON CONFLICT DO UPDATE 子句。因此，无法使用 COPY 来完成 upsert 需求。

因此，我们还是回归使用 INSERT 配合 ON CONFLICT DO UPDATE 子句，以及 unnest 函数来完成批量 upsert 的需求。

Les instructions spécifiques sont formatées comme follows：

```SQL
INSÉRER DANS TestTable (id, valeur)
VALUES (unnest(@ids), unnest (@values))
ON CONFLICT ON CONTRATRAINT TestTable_pkey
DO UPDATE SET value=excluded.value;
```

Lorsque les ids et les valeurs sont deux objets de tableau tout aussi longs, la fonction la plus peu appropriée convertit les objets du tableau en données de ligne.

Notez qu’une commande ON CONFLICT DO UPDATE peut affecter la ligne d’une erreur de deuxième fois peut se produire.

Donc, si vous essayez d’utiliser le scénario ci-dessus, vous devez passer par elle à nouveau dans le programme avant de passer dans la base de données.En outre, en général, il est logique de faire une rentrée dans un programme pour réduire la quantité de données qui est transmise dans la base de données.

> [document officiel：fonction non](https://www.postgresql.org/docs/9.2/functions-array.html) > [document officiel：Insert statement](https://www.postgresql.org/docs/9.5/sql-insert.html)

### Mysql

MySql, similaire à SQLite, prend en charge`remplacer` syntaxe.Les déclarations spécifiques sont dans les：

```sql
REMPLACER DANS TestTable (id, valeur)
VALEURS
(@id0 @value0),
...
(@idn @valuen);
```

> [Le document officiel：replace](https://dev.mysql.com/doc/refman/8.0/en/replace.html)

### Mongodb

MongoDB prend en charge le mode de transport en vrac de bulkWrite, ainsi que la syntaxe upsert de replace.C’est donc très facile à faire.

Voici donc un coup d’œil à la façon de faire it：

```cs
private async Task SaveManyCoreMany(
    IDbFactory dbFactory,
    IEnumerable<StateEntity> entities)
{
    var array = entités comme StateEntity[] ?? entités. ToArray();
    var articles = tableau
        . Sélectionnez(x => nouveau MongoStateEntity
        {
            claptrap_id = x.ClaptrapId,
            claptrap_type_code = x.ClaptrapTypeCode, version
            = x.Version,
            state_data = x.StateData,
            updated_time = x.UpdatedTime,
        })
        . ToArray();

    client var = dbFactory.GetConnection (_connectionName);
    var db = client. GetDatabase (_databaseName);
    collection var = db. GetCollection<MongoStateEntity>(_stateCollectionName);

    var upsertModels = articles. Sélectionnez(x =>
    {
        filtre var = nouvelle<MongoStateEntity>expressionFilterDefinition (entité =>
            entity.claptrap_id == x.claptrap_id && entity.claptrap_type_code == x.claptrap_type_code);
        retourner de nouveaux<MongoStateEntity>ReplaceOneModel (filtre, x)
        {
            IsUpsert = true
        };
    });
    la collection. BulkWriteAsync (upsertModels);
}
```

C’est le code donné à partir du scénario d’affaires du projet Newbe.Claptrap, que les lecteurs peuvent modifier en conjonction avec leurs propres besoins.

> [Documents officiels：db.collection.bulkWrite()](https://docs.mongodb.com/manual/reference/method/db.collection.bulkWrite/#db.collection.bulkWrite)

### Solution universelle

L’essence de l’optimisation est de réduire l’utilisation des liens de base de données et de faire autant de travail que possible dans un seul lien.Par conséquent, si une base de données particulière ne prend pas en charge des opérations similaires pour les bases de données ci-dessus.Ensuite, il y a une solution：

1. Écrivez des données à une table temporaire aussi rapidement que possible
2. Le tableau cible qui met à jour les données du tableau temporaire à la mise à jour du tableau
3. Supprimer la table temporaire

> [MISE À JOUR avec une jointure](http://www.sql-workbench.eu/dbms_comparison.html)

## Tests de performance

Dans le cas de SQLite, essayez 2 opérations upsert sur 12345 données.

Le single-：1 minute et 6 secondes

Traitement par：2,9 secondes

[Le code pour le test peut être trouvé dans le lien.](https://github.com/newbe36524/Newbe.Demo/blob/master/src/BlogDemos/Newbe.Rx/Newbe.RxWorld/Newbe.RxWorld/UpsertTest.cs)

L’échantillon ne contient pas de mySql, PostgreSQL et MongoDB, car avant l’optimisation, le pool de connexion est essentiellement explosé sans augmenter le pool de connexion.Le résultat de toutes les optimisations est une solution directe au problème de disponibilité.

> [tout le code d’échantillon peut être trouvé dans la base de code](https://github.com/newbe36524/Newbe.Demo).Si Github Clone est en difficulté,[pouvez également cliquer ici pour Clone de Gitee](https://gitee.com/yks/Newbe.Demo)

## FAQ

Voici des réponses à certaines questions courantes.

### Le client attend-il le résultat d’une opération en vrac?

C’est une question soulevée par de nombreux net-citoyens.La réponse：oui.

Supposons que nous exposons un WebApi comme une interface, appelé par le navigateur.Si 100 navigateurs font des demandes en même temps.

Les 100 demandes sont ensuite fusionnées puis écrites à la base de données.Ces clients ne recevront pas de réponse du côté du service tant qu’ils ne seront pas écrits à la base de données et qu’ils n’attendront pas.

C’est également là que le schéma de fusion diffère du scénario habituel « écrire la file d’attente, écrire la bibliothèque plus tard ».

### En principe, à quoi bon cette voluminoscopie ?

Les deux ne sont pas pertinents et doivent avoir des fonctions qui fonctionnent en même temps. Tout d’abord, la base de données dans le code. InsertMany est la copie encombrante que vous avez mentionnée.

La clé de ce code n’est pas InsertMany, mais comment fusionner une seule demande d’insertion. Imaginez que vous pouvez exposer une API encombrante sur webapi. Toutefois, vous ne pouvez pas combiner les demandes de différents clients au sein d’une même API pour appeler la copie encombrante. Par exemple, avec 10 000 clients qui appellent votre API, comment combinez-vous ces demandes d’API ?

Si vous faites cela ci-dessus, bien que vous n’exposiez qu’une seule API insérée au public.Entre vous et la consolidation des demandes de différents clients, vous devenez en mesure d’utiliser la copie encombrante.C’est logique à des niveaux élevés.

En outre, cela fonctionne avec le principe open-close, parce que vous n’avez pas modifié l’interface InsertOne du référentiel, mais n’avez encombrante.

### Si une exception d’opération échoue dans une opération par lots, toutes les autres opérations qui ont été fusionnées échoueront-elles ?

Si le scénario d’affaires est que la consolidation a un impact, elle ne devrait certainement pas être fusionnée.

Une opération en vrac échoue, bien sûr, parce que la transaction de base de données sous-jacente échoue certainement ensemble.

Sauf si l’interface en vrac prend également en charge le traitement différentiel de chaque ID entrant.En règle générale, comme la copie encombrante de Mongodb, nous avons la possibilité de définir différents États tcs si nous pouvons retourner quels succès et quels échecs.

Ce qui doit et ne doit pas être fusionné dépend entièrement de l’entreprise.L’exemple donne comment vous devez fusionner si vous souhaitez fusionner.Tous ne sont pas tenus d’être fusionnés.

### Insérer et Upsert à la fois dit, qu’en est-il Supprimer et Sélectionnez?

L’auteur qualifie généralement ce modèle de « traitement réactif par lots ».Pour confirmer que le modèle est appliqué au scénario d’entreprise, vous devez avoir les deux éléments de base suivants requirements：

- La question de savoir si le traitement par lots en aval de l’entreprise sera plus rapide que le traitement unique cumulatif, le cas suivant, peut être utilisé
- S’il y aura une demande de fréquence d’éclatement courte en amont de l’entreprise, si oui, qui peut être utilisée

Bien sûr, il y a aussi des questions à considérer,：telles que la question de savoir si les opérations de lots en aval peuvent être divisées en résultats de chaque demande.Mais ces deux points doivent être pris en considération.

Alors prenez Supprimer comme un example：

- Supprimera-t-il où in sera plus rapide que supprimer ?Essayez-le
- Y aura-t-il une augmentation soudaine des exigences de suppression ?Pensez-y

## Zèle gadget

L’auteur est une procédure complète stockée ne peut pas être écrit hors de la personne.Accès aux documents de ces bases de données, le tout avec un document hors ligne appelé Zeal.Recommandé à vous, vous le méritez.

![Zèle](/images/20200627-010.png)

Discours officiel de Zèle：<https://zealdocs.org/>

<!-- md Footer-Newbe-Claptrap.md -->
