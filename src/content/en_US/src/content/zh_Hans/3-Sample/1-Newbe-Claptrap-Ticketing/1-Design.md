---
title: 'Design.'
metaTitle: 'Train ticketing system - design.'
metaDescription: 'Train ticketing system - design.'
---

> [The version currently viewed is the result of machine-translated Chinese Simplified and manual proofreading.If there is any mistranslation in the document, please click here to submit your translation proposal.](https://crwd.in/newbeclaptrap)

## Business analysis.

### Business boundaries.

The system only contains the remaining ticket management portion of the ticket.That is, query the remaining seats, order tickets to reduce seats.

Generating order information, payment, traffic control, request wind control, etc. are not included in the scope of this discussion.

### Business use cases.

- Check the remaining tickets to find out the number of trips available between the two stations and the number of seats remaining.
- Query the ticket ticket stake corresponding to the number of trains, can query the given number of trains, between the stations there are how many remaining seats.
- Seat selection is supported, and customers can select a given number of cars and seats and place an order to buy a ticket.

## Implement difficult yiter analysis.

### Residual ticket management.

The difficulty of train ticket surplus ticket management lies in the particularity of the rest of the ticket inventory.

Ordinary e-commerce goods, with SKUs as the smallest unit, each SKU is independent of each other and does not affect each other.

Train tickets are different because the remaining tickets will be affected by the start and end of the sold tickets.Here's a simple logical model to take a detailed look at this particularity.

Now, let's assume that there is a number of cars passing through four stations, a, b, c, d, and at the same time, we simplify the scenario, assuming that there is only one seat in the row.

So before anyone buys a ticket, the remaining tickets for this ride are as follows：

| From the end. | The amount of remaining tickets. |
| ------------- | -------------------------------- |
| a,b.          | 1。                               |
| a, c.         | 1。                               |
| a, d.         | 1。                               |
| b,c.          | 1。                               |
| b,d.          | 1。                               |
| c, d.         | 1。                               |

If a customer now has purchased a,c ticket.So since there is only one seat, a, b and b, c have no remaining tickets.The remaining votes become the following：

| From the end. | The amount of remaining tickets. |
| ------------- | -------------------------------- |
| a,b.          | 0。                               |
| a, c.         | 0。                               |
| a, d.         | 1。                               |
| b,c.          | 0。                               |
| b,d.          | 1。                               |
| c, d.         | 1。                               |

To put it more bluntly, if a customer buys a, d, all remaining tickets will become 0.Because the passenger was always sitting in the seat.

This is the special nature of the train ticket：the same seat of the same train, the number of remaining tickets at each end point will be affected by the starting point of the ticket sold.

Extending a little, it's easy to conclude that there is no such effect between different seats in the same car.

### Remaining ticket inquiries.

As mentioned in the previous section, due to the particularity of the remaining ticket inventory.For the same train a, b, c, d, there are 6 possible ticket options.

And it's easy to conclude that the number of types selected is actually calculated by selecting a combination of 2 in the n sites, which is c (n, 2).

So if there is a car passing through 34 stations, the possible combination is c (34,2) s 561.

How to deal with the many kinds of queries that may exist effectively is also a problem that the system needs to solve.

## Claptrap body design.

![Train Ticketing System Design.](/images/20200720-001.png)

### Each seat on the same train is designed as a Claptrap- SeatGrain.

The State of the Claptrap contains a basic information.

| Type.                                  | Name.       | Description                                                                                                                                                                                                           |
| -------------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IList&lt;int&gt;           | Stations.   | The list of ids for the path station begins with the origin station and ends with the terminal.Verification at the time of major purchase.                                                                            |
| Dictionary&lt;int, int&gt; | StationDic. | The index reverse dictionary of the road station id.Stations are a list of index-ids, and the dictionary is the corresponding id-index dictionary in order to speed up the query.                                     |
| List&lt;string&gt;         | RequestIds. | Key properties.On each interval, the ticket id for the purchase purchase.For example, index is 0, which means the ticket id from station 0 to station 1.If it is empty, there is no subscription ticket at this time. |

With this data structure design, you can implement two businesses.

#### Verify that it is available for purchase.

By passing in two station ids, you can find out if this as belongs to this SeatGrain.And query all interval segments for the starting and ending points.Just tell if this doesn't have a ticket Id for all segments that you tell from RequestIds.If not, it means it can be purchased.If you have an ID on any of the paragraphs, you canno.

For example, the current Stations situation is 10, 11, 12, 13. RequestIds, on the other hand, is 0,1,0.

So, if you want to buy a ticket for 10->12, not because the second range of RequestIds has already been purchased.

However, if you want to buy a ticket for 10->11, you can, because the first range of RequestIds is not yet available.

#### Buy.

You can assign the start ingon to the ticket Id on all interval settings in RequestIds.

### The remaining tickets for all seats on the same train are designed as a Claptrap-TrainGran.

The State of The Claptrap contains some basic information.

| Type.                                            | Name.      | Description                                                                                                                                                                                                               |
| ------------------------------------------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IReadOnlyList&lt;int&gt;             | Stations.  | The list of ids for the path station begins with the origin station and ends with the terminal.Validate sit on the primary query.                                                                                         |
| IDictionary&lt;StationTuple, int&gt; | SeatCount. | Key properties.Station Tuple represents a starting point.The collection contains all possible ticketing for the start and end.For example, if the car passes through 34 locations, the dictionary contains 561 key pairs. |

Based on the data structure above, you only need to synchronize the corresponding information to the Grain each time The SeatGrain completes placing the order.

For example, if a, c has a ticket purchase, the remaining tickets for a, c/a, b/b, c will be reduced by one.

This can be done here with the help of the Minion mechanism built into this framework.

It is worth mentioning that this is a larger design than the "least competitive resources".Because the query scenario does not need absolute speed in that business scenario.This design reduces the complexity of the system.

## Id.

![Train Ticketing System Id.](/images/20200813-001.png)
