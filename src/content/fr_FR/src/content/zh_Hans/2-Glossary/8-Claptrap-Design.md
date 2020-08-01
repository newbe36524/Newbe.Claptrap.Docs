---
title: 'Claptrap Design'
metaTitle: 'Claptrap Design'
metaDescription: 'Claptrap Design'
---

> [La version actuellement vue est le résultat d’une correction simplifiée et manuelle traduite par la machine.S’il y a une mauvaise traduction dans le document, veuillez cliquer ici pour soumettre votre proposition de traduction.](https://crwd.in/newbeclaptrap)

## Claptrap Design 实现 Claptrap 的高可定制性

Claptrap a un haut degré de personnalisation.开发者可以为 Claptrap 对象设置自定义的 Event Loader/ Event Saver/ State Loader / State Saver / EventNotification Method 等等一系列组件。而这一切的自定义，都可以具体反映到 Claptrap Design 对象上。

Claptrap Design 就像一个设计图，决定了 Claptrap 的每个细节，常见的包括：

1. Quel événement Chargeur / Event Saver est utilisé pour gérer l’événement.
2. À quelle fréquence enregistrez-vous un instantané d’état.
3. Minion ，如果是，那么 Master 是谁。
4. Combien d’événements y a-t-il et quel est le gestionnaire d’événements correspondant.

这些细节都会在应用程序启动时，将会通过类型扫描、属性标记、连贯接口、配置文件等等多种方式进行配置。Il en résulte un claptrap design complet.En outre, Claptrap Design est validé pour le caractère raisonnable au démarrage pour s’assurer que Claptrap Design est essentiellement disponible.从而不会出现类似于“忘记编写 Event 对应的 Handler”这样低级的错误。

所有的 Claptrap Design 都会被集中保存在 IClaptrapDesignStore 这样一个内存对象中，以便 Claptrap Factory 在构建 Claptrap 检索。

开发者也可以基于 IClaptrapDesignStore 中的所有数据，来构成可供人类阅读的文本或者图形，以便更容易地从高层面来了解当前系统中 Claptrap 之间的相互关系和配置细节，源于代码却高于代码。

---

Ce qui suit est une description basée sur l’histoire pour aider à comprendre.Je m’en fiche.

Claptrap Design Design est une base importante pour la production Claptrap Factory Claptrap.Les périphériques personnalisés requis pour un type particulier de Claptrap sont documentés dans Design.Par exemple.：Décidez du module d’exécution des tâches dans le processeur de tâches multifonctions, décidez du modèle de périphérique pour la note de service de poche et décidez de la stratégie de récupération du contrôleur de récupération de mémoire.

La conception de Claptrap Design est une partie importante de s’assurer que le produit final répond à vos besoins avant de décider d’entrer en production.

## ICON

![Claptrap.](/images/claptrap_icons/claptrap_design.svg)
