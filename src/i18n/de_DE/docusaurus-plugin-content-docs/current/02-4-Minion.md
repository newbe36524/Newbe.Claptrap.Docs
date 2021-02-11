---
title: 'Minion'
description: 'Minion'
---

![Minion](/images/20190228-002.gif)

Minion is a special Claptrap defined by this framework.it's an adjustment based on Claptrap.It has the following features：

**Read event from the corresponding Claptrap**。Like Claptrap, minion's state is controlled by events.The difference is that Minion, like its literal meaning, always gets events from the corresponding Claptrap, changing its state.Therefore, it can asynchronously handle subsequent actions after The Claptrap-generated event.

> Minion is from a game of luck played by newbe36524[The Legend of furnace stone](https://zh.moegirl.org/%E7%82%89%E7%9F%B3%E4%BC%A0%E8%AF%B4), where "随从" is described in the English version as "minion".

---

The following is a story-based description of Minion to aid understanding.Don't care too much.

For more complex tasks, a single Claptrap can be difficult to complete.Therefore, when designing this type of Claptrap, a few younger brothers are added to the Claptrap as needed to assist it with the task at hand.These little brothers are called Minions.Minion's essence is also a Claptrap robot, but they reduce the handheld memo device compared to the full version of Claptrap.This is why it works slightly differently from Claptrap.

Minions can only complete tasks by collaborating with Claptrap, and they cannot decide whether to do a task.So a handheld memo that records the details of the task as long as claptrap holds it.When Claptrap completes a task, it informs his Minions about the details of the task.This allows Minion to synchronize the content of the task and use it to update your memory.Let's explain this pattern of work in an example.

Let's say we've now put a Claptrap robot in a neighborhood to act as a doorman robot.Its job responsibilities includes as the following：

1. Responsible for inspecting and releasing vehicles in the concierge
2. Responsible for dealing with all kinds of inquiries from passers-by

We now know that Claptrap robots can only handle one thing at once while working.That is, if it is inspecting and releasing a vehicle, it will not be able to handle inquiries from passers-by.Similarly, if it is being questioned by passers-by, it will not be able to handle the inspection and release of the vehicle.It's not efficient.Therefore, we added a Minion to this Claptrap to assist it with the task of being asked by passers-by.

The specific way of working is this：Every day, Claptrap checks the situation around the neighborhood and records all the specific information in a handheld memo.And it informs its Minion of the details of these tasks.So Minion knew all the details about the neighborhood, so it was able to easily deal with questions from passers-by.

This collaboration allows Claptrap to focus more efficiently on vehicle inspection and release, while passers-by' inquiries are left to Minion.

However, additional explanations are needed for some details to be understood by the reader：

Why not add a new Claptrap to handle passers-by' inquiries directly?A new Claptrap means a new entity that can complete tasks independently, which increases the cost of management.But if you add only one Minion, it can be managed by the Claptrap it belongs to, which is easier to manage than it is.Of course, in order to add a little sense of generation, you can also understand so：Minion lacks the handheld memo device compared to the regular Claptrap.The cost of this device is 99% of the total hardware cost.Reduce costs to accomplish the same task, why not?

Will the cost of Notifying Minion of task details by Claptrap is high?No, it won't.Claptrap and Minion are generally gang jobs, and as wireless network technology continues to improve, the cost will become smaller and smaller.5G empowerment, future.

Now, let's consider an extra scenario.：If the property manager wants Claptrap to report regularly on vehicle movements in the area.Similarly, in order to increase the sense of admission, we may as well assume that the community is very busy, with vehicles coming in and out 24 hours a day.So if you let it come up with time to report on vehicle access, it's likely that the neighborhood gate will be blocked because of Claptrap's single-threaded nature.

With the experience we've had earlier, we can also equip this Claptrap with a new Minion to handle the task of reporting to the property manager.Because Claptrap will notify Minion of the details when the vehicle is being inspected.So Minion knows all the details about today's vehicle access and makes a statement, which is a small case.

Let's add another scene.：We need to take a census of the population.Then only need to check the access personnel at the community doorman Claptrap, the person's information is recorded.Similarly, we'll add a Minion to compile those core data and put the parent department in.Coincidentally, the parent department also receives the subordinate's data report through a Claptrap robot, and it also has a Minion that summarizes the data from the subordinate report and reports it to its superior.That's it Claptrap1 -> Minion1 -> Claptrap2 -> Minion2 -> Claptrap3 …… upward.So we finished the data aggregation nationally and even globally.

So we can summarize.With Minion's addition, you can do at least three things better for Claptrap：

1. Assist in sharing the original query class tasks
2. Assist ingup statistics, notifications, and more that can be handled asynchronously
3. Assist inge with other Claptraps to accomplish larger tasks
