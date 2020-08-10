---
title: 'Claptrap Lifetime Scope'
metaTitle: 'Claptrap Lifetime Scope'
metaDescription: 'Claptrap Lifetime Scope'
---

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)

The claptrap lifetime scope is divided into two major categories according to the writer's view of the, runtime lifetime scope and the design lifetime scope.

## The runtime lifetime scope

The runtime lifetime scope is the lifetime scope behavior of each object in memory during the operation of the Claptrap system.For example, In a Web system, each Web request is typically assigned as a lifetime scope, and the Claptrap system has a similar lifetime scope design.These lifetime scopes have an impact on developers' component extensions or business development.The runtime lifetime scope of the Claptrap framework is divided into, Process Level, Claptrap Level, and Event Handler Level.

Process-levelAn object designed as a lifetime scope at the process level is a singleton object in the general sense.Each running Claptrap process has its own singleton object.Typically, for example in the Claptrap framework, in order to improve the speed at which an event is written to a persistent layer, each persistent layer destination corresponds to a batch processor (Batch Event Saver).They have only one instance in the lifetime scope of the entire process, corresponding to the persistent layer, respectively, so that the event can be merged into the persistent layer, thereby boosting the write performance.In general, objects that are designed to be process-level lifecycles have one or more of the following characteristics:

1. Just have the logic or code that you want to run once in the entire process lifetime scope.It can usually be achieved with the help of Lazy as well as a single case.
2. Only a single object is required in the entire process lifecycle.For example Claptrap Design Store, Claprap Options and so on.
3. There can only be a single object in the entire process lifetime scope.For example, Orleans Client.

Claptrap levelObjects in the Claptrap-level lifetime scope are created with the activation of Claptrap and are released with the inactivation of Claptrap.These objects are usually strongly associated with a Claptrap Identity.For example, Claptrap Design, Event Saver, Event Loader, State Saver, State Loader, and so on associated with this Claptrap Identity.

Event Handler LevelEvent Handler level lifetime scope objects are created as the event handler is created and released with the event handler release.This level of lifetime scope is similar to the Web request lifetime scope in Web.Typically, unit of work for a unified database transaction falls to this level.

## Design lifetime scope

Design lifetime scope are the lifetime scope of business objects for Claptrap.This has nothing to do with whether the program is running or not, or even whether or not the program is used.To give a specific example, orders in a regular e-commerce system.The activity business time limit for an order will generally not exceed three to six months.When more than this time limit is exceeded, the data of the order cannot already be modified.Here, this "three to six months" time limit is called the design lifetime scope of an order.In a Claptrap system, if an object has exceeded its design lifetime scope, it manifests itself as "there is no longer a need to activate this Claptrap in business."The following inferences can be obtained from this:

1. The events that the Claptrap has already stored have lost their meaning and deleting them can free up the available space.
2. The business code corresponding to this Claptrap no longer needs to be maintained, and it is possible to choose to be removed from the reference or to remove the code.

Therefore, the shorter the design lifetime scope of Claptrap, it is more conducive to reducing resource footprint and code maintenance costs, and vice versa, increasing storage costs and maintenance difficulties.Therefore, when designing Claptrap systems, there is a tendency to use a shorter design lifetime scope.And this noun, also directly reflects the actual entirely by "design" to determine. Next, let's list some common design lifetime scope classification.

### Business boundary demarcation

This is the most common division.The business objects are divided based on the requirements of domain modeling.And these business objects often have a fixed lifetime scope.As in the previous "order" is a common example of dividing the life cycle by business boundaries.When dividing using this method, you only need to note that Claptrap meets the basic requirement that "the minimum competitive resource range is greater than or equal to".Developers can experience this division with an example of a "train ticketing system".

### Conditional boundary demarcation.

In general, the business boundary-based division method has been able to divide a reasonable lifetime scope.However, if you are simply divided along business boundaries, you may have objects with 'permanent' design lifetime scope.If these objects have a very intensive event operation.Then the number of events generated will be unusually large.To do this, we introduce human-controlled ways to shorten the design lifetime scope.This division is based on specific conditions.It is therefore called conditional boundary demarcation.And the most classic of these is the use of "time limit" to divide.

Here we illustrate this division by using the shopping cart object in the Quick Start example.First, a shopping cart is a user-related object, and as long as the user has been in the system, it is possible to be activated, that is, its design lifetime scope is "permanent".Therefore, you cannot delete related events, and they must be permanently saved to ensure that the shopping cart data is correct.But, if we are no longer concerned about the events that the shopping cart has produced over a year ago.We can divide the shopping cart of a single user manually according to the year.At the same time, we can make a "state copy" of the shopping cart in two adjacent years.In this way the state data of the previous year is continued, so that the shopping cart of the user is produced shorter on the design lifetime scope, and this does not affect the business as well.We can use a classic Chinese legend story, "The Fool's Move Mountain", to understand this time-based design life cycle classification.In the story, fools are mortals, and although they cannot live forever (shorter design-time life cycles), the spirit of fools (longer design-time life cycles) can continue with future generations, and thus can complete the great cause of mountain migration.When each generation of "fools" is replaced, the "state copy" (spiritual continuation) mentioned above occurs.Thus, the requirements of the lifetime scope when a longer or even permanent design is achieved with a shorter design lifetime scope.

> 《愚公移山》 太行、王屋两座山，方圆七百里，高七八千丈，本来在冀州南边，黄河北岸的北边。 北山下面有个名叫愚公的人，年纪快到 90 岁了，在山的正对面居住。他苦于山区北部的阻塞，出来进去都要绕道，就召集全家人商量说：“我跟你们尽力挖平险峻的大山，使道路一直通到豫州南部，到达汉水南岸，好吗？”大家纷纷表示赞同。他的妻子提出疑问说：“凭你的力气，连魁父这座小山都不能削平，能把太行、王屋怎么样呢？再说，往哪儿搁挖下来的土和石头？”众人说：“把它扔到渤海的边上，隐土的北边。”于是愚公率领儿孙中能挑担子的三个人上了山，凿石头，挖土，用箕畚运到渤海边上。邻居京城氏的寡妇有个孤儿，刚七八岁，蹦蹦跳跳地去帮助他。冬夏换季，才能往返一次。 河曲的智叟讥笑愚公，阻止他干这件事，说：“你简直太愚蠢了！就凭你残余的岁月、剩下的力气连山上的一棵草都动不了，又能把泥土石头怎么样呢？”北山愚公长叹说：“你的思想真顽固，顽固得没法开窍，连孤儿寡妇都比不上。即使我死了，还有儿子在呀；儿子又生孙子，孙子又生儿子；儿子又有儿子，儿子又有孙子；子子孙孙无穷无尽，可是山却不会增高加大，还怕挖不平吗？”河曲智叟无话可答。 握着蛇的山神听说了这件事，怕他没完没了地挖下去，向天帝报告了。天帝被愚公的诚心感动，命令大力神夸娥氏的两个儿子背走了那两座山，一座放在朔方的东部，一座放在雍州的南部。从这时开始，冀州的南部直到汉水南岸，再也没有高山阻隔了。
