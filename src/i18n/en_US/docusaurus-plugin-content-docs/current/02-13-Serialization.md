---
title: 'Serialization'
description: 'Serialization'
---


Due to the need for transmission and storage of events and states in the Claptrap system, it is necessary to serialize events and states so that they can cope with a wide variety of transport and storage scenarios.

## How to select a serialization method.

Optional serialization methods are available in a variety of ways, typically: JSON, MessagePack, Protobuf, etc.Serialization methods in actual projects can be considered on the following points:

1. Readability.If there is a higher requirement for readability, the more you should consider a text-focused serialization method.
2. Transfer efficiency, storage space utilization.If there are higher requirements for transfer efficiency and storage space, the more binary-based serialization methods should be considered.

In the Claptrap system, because each Claptrap has completely independent customization, developers can choose different serialization method for different Claptraps.However, the only thing to note is that once the serialization method is selected, it is difficult to change, so it needs to be carefully considered at the design stage.

## Serialization and carrier independence.

In the Claptrap framework, storage, transport, and serialization are independent of each other.In other words, a more readable JSON serialization can be used at the time of transmission, the binary serialization that is more conducive to the storage utilization at the time of storage, and vice versa.

## Serialization and the constraint of the carrier.

The manner in which serialization is also limited in the face of a particular storage or transport editing vector.For example, currently is using a database that does not support binary direct storage as a persistent layer of events, then it will become unfeasible to choose to want to save events by binary serialization.Therefore, before selecting a serialization method, priority needs to be given to the transport and storage scenario.

Currently, all the supported serialization method are published on nuget with the name " Newbe.Clatrap.DataSerializer. \*".
