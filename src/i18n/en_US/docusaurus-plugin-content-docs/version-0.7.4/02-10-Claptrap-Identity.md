---
title: 'Claptrap Identity'
description: 'Claptrap Identity'
---


## Claptrap Identity is the unique identity for locating a Claptrap.

It is a struct.It contains the following main fields:

Claptrap Type Code, the Claptrap Classification Code.Classification code is code that the developer defines itself.It is usually related to the business associated with the corresponding Claptrap.It is interesting to note that there is no compulsive association between Claptrap and its Minion's Clatrap Type Code, but usually during development, Minion's Clatrap Type Code should be designed as part of its Master Clatrap, so that it is more beneficial for the business to understand.

Id, Claptrap Business Id.This is the business ID.This is usually the primary key of the business.In the actual code, the Claptrap Identity will appear in a full-name fashion, and when an Id appears, it usually means the Business Id.

## Claptrap Identity this is a design that is not related to the running platform.

Thus, when combined with a specific platform, it is necessary to clarify its closing points.

Claptrap Identity is reflected in Orleans.

Claptrap Type Code: In Orleans, typically each Claptrap is placed in ClaptrapBoxGrain.At this point, Claptrap Type Code is typically marked as a property tag on a class or interface.

Id: In Orleans, Grain has a PrimaryKey in itself.As a result, the PrimaryKey was also directly reused as Clatrap Id in the ClatrapBoxGrain.
