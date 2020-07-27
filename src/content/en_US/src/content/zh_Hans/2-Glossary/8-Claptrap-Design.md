---
title: 'Claptrap Design'
metaTitle: 'Claptrap Design'
metaDescription: 'Claptrap Design'
---

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)

Claptrap has a high degree of customization.Developers can specify a custom set of components for the Claptrap object, such as Event Loader/Event Saver/State Saver/State Saver/EventNotification Method, and so on.All of this can be customized to the Claptrap Design object.

Claptrap Design is like a design that determines every detail of Claptrap, with some common details below.：

1. What event Loader / Event Saver is used to handle the event.
2. How often do you save a State snapshot.
3. Whether or not a Minion, and if so, then master who.
4. How many events are there, and what is the corresponding Event Handler.

These details are configured in a variety of ways, such as type scanning, property tags, coherent interfaces, profiles, and so on, when the application starts.This results in a complete Claptrap Design.Also, Claptrap Design is validated for reasonableness at startup to ensure that Claptrap Design is basically available.There will be no low-level errors like "Forget to write Handler for Event."

All Claptrap Design sits centrally in a memory object such as the IClaptrap Design Store so that Claptrap Factory can look up in the building Claptrap.

Developers can also generate text or graphics that humans can read based on all the data in the IClaptrapDesign Store, making it easier to understand the interrelationships and configuration details between Claptrap in the current system at a high level, derived from code and higher than code.

---

The following is a story-based description to aid understanding.Don't care too much.

Claptrap Design Design is an important basis for Claptrap Factory's Claptrap production.The customized devices required for a particular type of Claptrap are documented in Design.For example.：Decide on the task execution module in the multifunction task processor, decide the device model for the handheld memo, and decide the recovery strategy of the memory recovery controller.

Designing Claptrap Design is an important part of ensuring that the final product meets your needs before deciding to go into production.

## ICON.

![Claptrap.](/images/claptrap_icons/claptrap_design.svg)
