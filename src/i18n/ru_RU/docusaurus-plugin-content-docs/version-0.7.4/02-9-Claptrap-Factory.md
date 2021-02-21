---
title: 'Завод Claptrap (Claptrap Factory)'
description: 'Завод Claptrap (Claptrap Factory)'
---


## Claptrap Factory собирает Claptrap

Claptrap имеет высокую настраиваемость.Разработчики могут указать ряд компонентов, таких как пользовательский Event Loader/Event Saver/State Loader/ State Saver/ Event Notification Method и многое другое для объекта Claptrap.Чтобы адаптироваться к этой настраиваемости, необходимо выбрать хороший сценарий для сборки объектов Claptrap.

В настоящее время платформа выбрана Autofac в качестве сборщика.Основная причина заключается в том, что Autofac поддерживает Delegate Factory / Decorator / Generic Type / Module и другие функции, которые являются более богатыми, чем System.Depenedency Injection.

## Claptrap Factory управляет жизненным циклом Claptrap

Поскольку Claptrap Factory является производителем Claptrap, он также, как правило, отвечает за управление жизненным циклом на уровне Claptrap.В Claptrap Factory, реализованной на основе Autofac, этот контроль жизненного цикла проявляется в использовании объекта LifetimeScope Autofac для управления всем процессом загрузки, создания и выгрузки.

---

Ниже приведено описание истории для дополнительного понимания.Не обижись слишком много.

Claptrap Factory является основным местом для производства Claptrap.Он будет выполнять индивидуальную сборку каждого заводского Claptrap в соответствии с заданным Claptrap Design, который имеет очень высокую скорость прохождения продукта и производительность.

## ICON

![claptrap](/images/claptrap_icons/claptrap_factory.svg)
