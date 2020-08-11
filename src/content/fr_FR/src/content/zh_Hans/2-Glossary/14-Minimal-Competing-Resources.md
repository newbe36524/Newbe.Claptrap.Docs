---
title: 'Ressources concurrentielles minimales'
metaTitle: 'Ressources concurrentielles minimales'
metaDescription: 'Ressources concurrentielles minimales'
---

> [La version actuellement vue est le résultat d’une correction simplifiée et manuelle traduite par la machine.S’il y a une mauvaise traduction dans le document, veuillez cliquer ici pour soumettre votre proposition de traduction.](https://crwd.in/newbeclaptrap)

Un concept qui est important lors de l’utilisation du cadre Claptrap pour des ressources compétitives minimales.Comprendre ce concept aide les développeurs à mieux concevoir l’état de Claptrap et à éviter la mauvaise conception.

## Quelle est la plus petite ressource concurrentielle.

Le concept de « concurrence des ressources » dans les programmes analogiques et multithreaded, où le concept de « ressources concurrentielles minimales » est proposé dans un système d’affaires.Avec ce concept, il est facile de trouver des points de conception pour la façon d’appliquer Newbe.Claptrap.

Dans le cas du commerce électronique, par exemple, chaque produit est une « ressource concurrentielle minimale ».Notez que cela ne veut pas dire que tous les biens sont une « ressource concurrentielle minimale ».Parce que, si 10 000 marchandises sont numérotées, alors la ruée vers l’achat de marchandises 1 et 2, il n’y a pas de concurrence en soi.Par conséquent, chaque produit est une ressource concurrentielle minimale.

Voici quelques exemples available：

- Dans un système d’entreprise qui n’autorise que les connexions à une seule fin, le ticket de connexion d’un utilisateur est la ressource la moins compétitive.
- Dans un système de configuration, chaque élément de configuration est la ressource la moins compétitive.
- Dans un marché boursier, chaque commande d’achat ou de vente est la plus petite ressource concurrentielle.

Dans certains scénarios, la plus petite ressource concurrentielle est également connue sous le nom d'« Unité minimale concurrente »

## L’État de Claptrap devrait être au moins plus grand ou égal à la gamme de « ressources concurrentielles minimales ».

Combiné avec l’exemple d’un snap e-commerce, si tous les produits sont conçus dans le même État Claptrap (plus grande que la plus petite ressource concurrentielle).« nsuite, différents utilisateurs achètent des éléments qui se touchent les uns les autres parce que le modèle d’acteur basé sur Claptrap est mis en file d’attente pour traiter les demandes. »Autrement dit, en supposant que chaque article doit traiter 10ms, puis le besoin le plus rapide s 10000 s 10 ms pour traiter toutes les demandes d’achat.Mais si chaque élément est numéroté, chaque élément est conçu comme un état Claptrap séparé.Donc parce qu’ils n’ont aucun rapport.La vente de toutes les marchandises ne coûterait théoriquement que 10 m.

Il est donc facile de conclure que si l’État de Claptrap est plus grand que la ressource concurrentielle minimale, le système n’aura pas de problème de justesse, mais il peut y avoir des pénalités de performance. En outre, si l’état de Claptrap est plus petit que la ressource concurrentielle minimale, la relation entre Claptrap devient difficile et risquée.Étant donné que cela équivaut à diviser une ressource concurrentielle minimale en plusieurs parties, et que la plus petite ressource concurrentielle doit généralement être traitée dans une seule transaction, ce qui revient au problème très courant des transactions distribuées dans des pièces distribuées qui sont difficiles à gérer.
