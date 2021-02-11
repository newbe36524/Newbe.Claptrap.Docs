---
title: 'Claptrap Design'
description: 'Claptrap Design'
---

## Clatrap Design realizes the high customizable nature of Claptrap

Claptrap has a high degree of customization.Developers can specify a custom set of components for the Claptrap object, such as Event Loader/Event Saver/State Saver/State Saver/Event Notification Method, and so on.All of this customization can be reflected on the Claptrap Design object.

Claptrap Design is like a design that determines every detail of Claptrap, commonly included:

1. What event Loader / Event Saver is used to handle the event.
2. How often do you save a State snapshot.
3. Minion? if so, then master who is it.
4. How many events are there, and what is the corresponding Event Handler.

These details will be configured in a number of ways by type scanning, attribute tags, coherent interfaces, configuration files, etc. when the application is launched.Thus the complete Clatraptrap Design is formed.Also, Claptrap Design is validated for reasonableness at startup to ensure that Claptrap Design is basically available.Thus there will not be a low-level error like "forgetting to write the Handler corresponding to the Event".

All Claprap Design will be centrally saved in a memory object such as IClatrapDesignStore so that the Clatraptrap Factory is being retrieved by building Claptrap.

Developers can also, based on all the data in the IClatrapDesignStore, make up the text or graphics available for human reading in order to more easily understand the correlation and configuration details between Claptrap in the current system from the high level, resulting from the code being higher than the code.

---

The following is a story-based description to aid understanding.Don't care too much.

Claptrap Design Design is an important basis for Claptrap Factory's Claptrap production.The customized devices required for a particular type of Claptrap are documented in Design.For example, Decide on the task execution module in the multifunction task processor, decide the device model for the handheld memo, and decide the recovery strategy of the memory recovery controller.

Before deciding on the commissioning of Claptrap, the design of the Claptrap Design is an important part of ensuring that the end product meets the requirements.

## ICON

![claptrap](/images/claptrap_icons/claptrap_design.svg)
