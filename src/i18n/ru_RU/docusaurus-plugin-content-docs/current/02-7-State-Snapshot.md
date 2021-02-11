---
title: 'State Snapshot'
description: 'State Snapshot'
---

## State Snapshot accelerates state restore speed.

An active Claptrap whose State is the current state of the most recent data.This is restored from the persistence layer by event sourcing.Sometimes, the number of events can be very large.It will take more time to restore State through events.Therefore, a state snapshot is provided in the Claptrap framework to persist the state of a particular Claptrap after a certain condition.This condition is usually the following:

1. After a number of events have been handled.
2. At the time of the Claptrap Deactive.
3. In a certain time period.

The presence of state snapshots increases the speed at which states are restored from the persistent layer.If a snapshot exists in the persistent layer, a state restore is usually performed in the following steps:

1. Read the state snapshot.
2. Start of the version number corresponding to the status snapshot and read the update of the status of all the events backwards.
3. Update the state until the persistent layer has no remaining events.

However, if there are no snapshots, the restore step changes to the following:

1. Create the initial state through a user-defined method.
2. Read all events from the event library to update the status.
3. Update the state until the persistent layer has no remaining events.

But.The presence of snapshots can also lead to some peculiarity.Combining the working steps above, it is easy for us to find out, once a snapshot is formed:

1. The user's custom method will no longer be executed.
2. Events smaller than the snapshot version number will not be executed again.

Currently, the framework can hold only one final snapshot for each Id.
