---
title: 'Claptrap Identity'
description: 'Claptrap Identity'
---


## Claptrap Identity является единственным удостоверением для поиска Claptrap

Это структура.Он содержит несколько основных полей：

Код классификации Claptrap Type Code, Claptrap.Код классификации — это код, определяемый разработчиком.Обычно это связано с бизнесом, связанным с Claptrap.Примечательно, что нет обязательной корреляции между Claptrap и его Minion Claptrap Type Code, но, как правило, в процессе разработки, Minion Claptrap Type Code должен быть разработан как часть своего Master Claptrap, что делает его более полезным для понимания бизнеса.

Id, Claptrap Бизнес Id.Это идентификатор бизнеса.Обычно является первисмным ключом для бизнеса.В фактическом коде и документации Claptrap Identity появляется в полном названии, в то время как идентификатор обычно относится к бизнес-идентификатору при его появлении.

## Claptrap Identity это дизайн, который не имеет ничего общего с запуском платформы

Таким образом, в сочетании с конкретной платформой, необходимо четко определить точку интеграции.

Воплощение Claptrap Identity в Orleans.

Claptrap Type Code：в Orleans, как правило, каждый Claptrap помещается в ClaptrapBoxGrain для запуска.На этом этапе Claptrap Type Code обычно помечается на классе или интерфейсе в качестве тега свойства.

Id：в Orleans, Grain сам поставляется с PrimaryKey.Таким образом, PrimaryKey был повторно использован непосредственно в качестве идентификатора Claptrap в ClaptrapBoxGrain.
