---
title: 'Event'
metaTitle: 'Event'
metaDescription: 'Event'
---

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)

Claptrap is an event-sourcing based Actor pattern.Events naturally play a crucial role.

Wanting to operate Claptrap will need to pass an event on it.Events are also the only parameters that change Claptrap State.Therefore, when you build a system with Claptrap, all system operations are converted to events and passed into Claptrap.Events have these characteristics.：

## The events are orderly.

Each event contains a unique serial number.In this framework, this serial number is called version number.The version number of the event is a sequence that increments 1 by one.The orderofness of the event ensures that the state is calculated without concurrency.This is an important guarantee of state data reliability.

The order of events directly reflects the sequence in which Claptrap executes events.And because of the need to ensure this order, Claptrap must handle events on an incident-by-event basis.This happens to have a natural fit with the single-threaded nature of the Actor pattern.

## Events are immutable.

Once an event is produced, it is immutable.The origin of events, because of the immutability of events, makes the data reliable.Because as long as the event is read, it is possible to restore the state after any one event is executed.But immutability is not a physical limitation.You can still modify event data in physical storage.Please note, however, that this is dangerous and extremely unrecommended behavior.Let's relate to the "open and close principle" in design mode, which can be summed up as "open to expansion, closed to modification".Why should there be an emphasis on "closed to modification"?In the author's opinion, the reason for the closure of the modification is actually due to the unknown nature brought about by the modification.Because of past execution of the code, the data is generated.They have all formed a certain degree of closure.They have been validated by existing tests.If you try to modify them, you're bound to need to adjust the tests, which further exacerbates the modifications, which is not a good thing.The immutable nature of events is a requirement.

So what if the past generated event data is incorrect due to a BUG, and the bug needs to be fixed now?The author's advice is not to try to modify existing events.New events and algorithms should be appended to correct the current state.Don't adjust old content.The author thinks that this is more in line with the principle of opening and closing.Developers are at their discretion.

## The event is permanent.

Events are an important parameter for ensuring the correctness of Claptrap State.Therefore, you need to ensure that the event is saved permanently.However, this is not an absolute case, and if the following conditions are met, the event is allowed to be lost.：

1. There is a permanent State snapshot before the event is lost.
2. The corresponding Claptrap is dead and will never be activated again.

Conversely, if the above conditions are not met, then it is important to ensure that events in the production environment are properly preserved in the persistence layer and that there are appropriate disaster tolerance scans.

## ICON.

![Claptrap.](/images/claptrap_icons/event.svg)
