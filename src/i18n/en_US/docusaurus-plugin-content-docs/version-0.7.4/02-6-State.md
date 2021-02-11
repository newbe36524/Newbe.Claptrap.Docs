---
title: 'State'
description: 'State'
---

State represents the current data of the Actor object in the Actor pattern.Claptrap just adds a limit to this.："State can only be updated in an event-sourcing manner."State in Claptrap has better reliability due to the reliability of event sourcing.

## The version number of State.

The State in Clatrap has a property called Version, which represents the current version of the State.The version number is a self-increasing number starting from 0, which will be self-increasing after each processing of an event.

The State of which the version number is 0 is the initial state of the Clatrap, or it can also be called the genesis state.The initial state can be customized according to the business needs.

Claptrap and Minion also make some difference in the processing of version numbers.

For Claptrap, Claptrap is the producer of the event, so the version number of the event itself is given by Claptrap.For example, during the processing of an event, the following things will occur in turn.：

1. State Version = 1000
2. Start processing the Event, its Version = State Version + 1 = 1001
3. Event processed, updated State Version = 1001

For Minion, because it is a consumer of The Claptrap event.Therefore, the processing of the version number is slightly different.For example, during the processing of an event, the following events occur in turn.：

1. State Version = 1000
2. Read the event that Event Version is 1001.
3. Event processed, updated State Version = 1001

State's version number and Event's version number are interdependent and mutually verified, which is key to event ordering.If there is a mismatch between The State's version number and Event's version number during processing, this can be a serious problem.Usually, the appearance version number does not match, there are only two cases：

1. There has been a loss of events in the persistence layer
2. Frame malignant BUG

## ICON

![claptrap](/images/claptrap_icons/state.svg)
