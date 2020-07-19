---
title: 'Mode Acteur'
metaTitle: 'Mode Acteur'
metaDescription: 'Mode Acteur'
---

> [当前查看的版本是由机器翻译自简体中文，并进行人工校对的结果。若文档中存在任何翻译不当的地方，欢迎点击此处提交您的翻译建议。](https://crwd.in/newbeclaptrap)

Le modèle Actor est un modèle de programmation concomitant.L’application de ce modèle de programmation peut résoudre les problèmes de concurrence de certains systèmes.Le problème de concurrence mentionné ici est quand un ordinateur traite logiquement les mêmes données, ce qui peut provoquer des données incorrectes en raison de plusieurs demandes simultanées.Ce problème est un problème qui doit être rencontré lors de la programmation multithreaded.Pour prendre un exemple simple, si vous utilisez 100 threads sans verrouillage synchrone,`Int`Exécution variable`++`Opération.Le résultat final de cette variable est souvent inférieur à 100.Voici comment le modèle d’acteur évite ce problème.

Tout d’abord, pour faciliter la compréhension, les lecteurs peuvent penser à l’acteur comme un objet ici.Dans les langues orientées objet (Java, C, etc.), vous pouvez considérer actor comme un`Nouveau`Objet créé par le mot clé.Mais cet objet a quelques caractéristiques spéciales.：

**Posséder des ingons de leur propre état**。Les objets peuvent avoir leurs propres propriétés, ce qui est une caractéristique de base des langues orientées objet.Dans le modèle de l’acteur, ces propriétés sont collectivement appelées`L’état de l’acteur`。Le statut de l’acteur est maintenu par l’Acteur lui-même.

Cela met l’accent sur deux points.：

Tout d’abord, l’état de l’acteur ne peut être changé par lui-même, et pour changer l’état de l’acteur de l’extérieur, il ne peut être changé en appelant Acteur.

![Mettre à jour l’état de l’acteur](/images/20190226-001.gif)

Deuxièmement, l’état de l’acteur est maintenu uniquement à l’intérieur de l’acteur et n’est partagé avec aucun objet autre que l’acteur actuel.Le partage ici souligne également qu’il ne peut pas provoquer un changement dans l’état interne de l’acteur par un changement dans une propriété externe.Il s’agit principalement de distinguer les langages de programmation avec des caractéristiques linguistiques de « référence d’objet ».Par exemple,：En C.`Classe`Lla`Public`Propriété, s’il s’agit d’un type de référence, obtient alors cette`Classe`Et puis il peut être changé.`Classe`La propriété dans .Mais cela n’est pas autorisé dans le modèle de l’acteur.

![Partager le statut d’acteur](/images/20190226-003.gif)

Cependant, la lecture des données de l’intérieur de l’acteur à l’extérieur est toujours autorisé.

![Lire le statut d’acteur](/images/20190226-002.gif)

**À un seul filet**。L’acteur n’accepte habituellement qu’un seul appel en même temps.Les threads décrits ici ne se réfèrent pas exactement aux threads de l’ordinateur, et les mots utilisés pour mettre en évidence la « a caractéristique de l’acteur qui ne peut gérer une demande à la fois » sont utilisés.Si l’acteur actuel accepte un appel, les appels restants sont bloqués jusqu’à la fin de l’appel, et la demande suivante n’est pas autorisée à entrer.Ceci est en fait similaire à un mécanisme pour un verrou synchrone.Ce mécanisme évite la possibilité de problèmes de concurrence lors de la modification de l’état interne de l’acteur.Une description spécifique：Si vous utilisez 100 threads pour faire un appel simultané à un acteur, laissez l’acteur`Int`Variable à effectuer`++`Opération.La valeur finale pour cet état doit être de 100.

![Appel concurrent SActor](/images/20190226-004.gif)

Toutefois, les threads uniques ne sont pas absolus, permettant un traitement simultané en l’absence de demandes simultanées.Par exemple, la lecture de l’état dans l’acteur, qui n’a généralement pas de problèmes de concurrence, permet des opérations simultanées à l’heure actuelle.

![Acteur de lecture concomitante](/images/20190226-005.gif)
