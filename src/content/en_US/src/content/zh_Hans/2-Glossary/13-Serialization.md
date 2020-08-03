---
title: 'Serialization'
metaTitle: 'Serialization'
metaDescription: 'Serialization'
---

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)

Because events and states need to be transferred and stored in The Claptrap system, events and states need to be serialized to be able to handle a wide variety of transport and storage scenarios.

## How to select a serialization scheme.

Optional serialization methods are available in a variety of ways, typically.：JSON, MessagePack, Protobuf, etc.Serialization schemes in actual projects can be considered on the following points.：

1. Readability.If there are higher requirements for readability, the more you should consider text-based serialization scenarios.
2. Transfer efficiency, storage space utilization.If there are higher requirements for transfer efficiency and storage space, the more binary-based serialization scenarios should be considered.

In the Claptrap system, because each Claptrap has completely independent customization, developers can choose different serialization scenarios for different Claptraps.However, the only thing to note is that once the serialization scheme is selected, it is difficult to change, so it needs to be carefully considered at the design stage.

## Serialization and carrier independence.

In the Claptrap framework, storage, transport, and serialization are independent of each other.In other words, you can use jSON serialization, which is more readable, when transferred, and binary serialization that is more conducive to storage utilization, and vice versa.

## Serialization and the constraint of the carrier.

The manner in which serialization is also limited in the face of a particular storage or transport editing vector.For example.：Currently using a database that does not support binaries for direct storage as a persistent layer of events, it becomes impractical to choose to save events through binary serialization.Therefore, before selecting a serialization scheme, priority needs to be given to the transport and storage scenario.

Currently, all supported serialization schemes are published on nuget under the name "Newbe.Claptrap.DataSerializer."
