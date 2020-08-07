---
title: 'State Snapshot'
metaTitle: 'State Snapshot'
metaDescription: 'State Snapshot'
---

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)

## State Snapshot accelerates state restore speed.

An active Claptrap whose State is the current state of the most recent data.This is restored from the persistence layer by event sourcing.Sometimes, the number of events can be very large.It will take more time to restore State through events.Therefore, a state snapshot is provided in the Claptrap framework to persist the state of a particular Claptrap after a certain condition.This condition is usually the following:

1. After a number of events have been handled.
2. At Claptrap Deactive.
3. In a certain time period.

The presence of event snapshots increases the speed at which states are restored from the persistent layer.If a snapshot exists in the persistent layer, a state restore is usually performed in the following steps.：

1. Read the state snapshot.
2. Starting with the version number corresponding to the state snapshot, read all events backward for status updates.
3. Update the state until the persistent layer has no remaining events.

However, if there are no snapshots, the restore step changes to the following.：

1. Create the initial state through a user-defined method.
2. Read all events from the event library to update the status.
3. Update the state until the persistent layer has no remaining events.

But.The presence of snapshots also brings some speciality.Combined with the above work steps, it is easy to see that once a snapshot is formed.：

1. The user's custom method will no longer be executed.
2. Events that are less than the snapshot version number will not be executed again.

Currently, the framework can hold only one final snapshot for each Id.
