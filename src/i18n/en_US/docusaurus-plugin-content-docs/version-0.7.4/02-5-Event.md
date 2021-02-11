---
title: 'Event'
description: 'Event'
---

Claptrap is an event-sourcing based Actor pattern.Events naturally play a crucial role.

You need to pass events on if you want to operate Claptrap.Events are also the only parameters that change Claptrap State.Therefore, when you build a system with Claptrap, all system operations are converted to events and passed into Claptrap.Events have these characteristics:

## The events are orderly.

Each event contains a unique serial number.In this framework, this serial number is called version number.The version number of the event is a sequence that is incremented by 1 from 1.The orderonfness of the event ensures that the calculation of the state does not have concurrent problems.This is an important guarantee of state data reliability.

The order of events directly reflects the sequence in which Claptrap executes events.And because of the need to ensure this order, Claptrap has to process events on a case-by-case basis when performing events.This happens to have a natural fit with the single-threaded nature of the Actor pattern.

## Events are immutable.

Once an event is produced, it is immutable.Just because of the immutability of events, event sourcing makes the data reliable.Because as long as the event is read, it is possible to restore the state after any one event is executed.But immutability is not a physical limitation.You can still modify event data in physical storage.Please note, however, that this is dangerous and extremely unrecommended behavior.Let's relate to the "open and close principle" in design pattern, which can be summed up as "open to expansion, closed to modification".Why should there be an emphasis on "closed to modification"?In the author's opinion, the reason for the closure of the modification is actually due to the unknown nature brought about by the modification.Because of the code executed in the past, the data generated.They have all formed a certain degree of closure.They have been validated by existing tests.If you try to modify them, it is bound to be necessary to adjust the corresponding test, and this further aggrafies the modification, which is not a good thing.The immutable of the event is of a nature and more of a requirement.

Then if due to the fact that a BUG has resulted in incorrect data production in the past, it is now necessary to amend this BUG, what should be done?The writer's advice, do not try to revise the already existing events.New events and algorithms should be appended to fix the current state.Don't adjust old content.The author thinks that this is more in line with the principle of opening and closing.Developers are at their discretion.

## The event is permanent.

Events are an important parameter for ensuring the correctness of Claptrap State.Therefore, you need to ensure that the event is saved permanently.However, this is not an absolute case, and if the following conditions are met, the event is allowed to be lost:

1. There is a permanent State snapshot before the event is lost.
2. The corresponding Claptrap is dead and will never be activated again.

Conversely, if the above conditions are not met, then it is important to ensure that events in the production environment are properly preserved in the persistence layer and that there are appropriate disaster tolerance scans.

## ICON

![claptrap](/images/claptrap_icons/event.svg)
