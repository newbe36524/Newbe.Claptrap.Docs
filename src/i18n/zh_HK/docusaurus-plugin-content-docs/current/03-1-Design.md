---
title: 'Design.'
description: 'Train ticketing system - design.'
---


## Business analysis.

### Business boundaries.

The system only contains the remaining ticket management portion of the ticket.That is, query the remaining seats, order tickets to reduce seats.

Generating order information, payment, traffic control, request wind control, etc. are not included in the scope of this discussion.

### Business use cases.

- Check the remaining tickets to find out the number of trips available between the two stations and the number of seats remaining.
- Query the ticket ticket stake corresponding to the number of trains, can query the given number of trains, between the stations there are how many remaining seats.
- Seat selection is supported, and customers can select a given number of train and seats and place an order to buy a ticket.

## Difficulty analysis

### Ticketing management.

The difficulty of the management of train tickets for the rest of the ticket is in fact the peculiarity of the inventory of the remaining tickets.

The common e-commerce commodity, with SKUs as the smallest unit, is independent of each other and not affected by each other.

Train tickets are different because the remaining tickets will be affected by the start and end of the sold tickets.Here's a simple logical model to take a detailed look at this particularity.

Now, let's assume that there is a number of cars passing through four stations, a, b, c, d, and at the same time, we simplify the scenario, assuming that there is only one seat in the train.

So before anyone buys a ticket, the remaining tickets for this ride are as follows:

| Stations | The amount of remaining tickets. |
| -------- | -------------------------------- |
| a,b      | 1                                |
| a, c     | 1                                |
| a, d     | 1                                |
| b,c      | 1                                |
| b,d      | 1                                |
| c, d     | 1                                |

If a customer now has purchased a,c ticket.So since there is only one seat, there are no tickets other than c,d.The rest of the ticket situation becomes the following:

| Stations | The amount of remaining tickets. |
| -------- | -------------------------------- |
| a,b      | 0                                |
| a, c     | 0                                |
| a, d     | 0                                |
| b,c      | 0                                |
| b,d      | 0                                |
| c, d     | 1                                |

To put it more bluntly, if a customer buys a, d, all remaining tickets will become 0.Because the passenger was always sitting in the seat.

This is the special nature of the train ticket: the same seat of the same train, the number of remaining tickets at each end point will be affected by the starting point of the ticket sold.

What`s more, it's easy to conclude that there is no such effect between different seats in the same car.

### Remaining ticket inquiries.

As mentioned in the previous section, due to the particularity of the remaining ticket inventory.For the same train a, b, c, d, there are 6 possible ticket options.

And it's easy to conclude that the number of types selected is actually calculated by selecting a combination of 2 in the n sites, which is c (n, 2).

So if there is a car passing through 34 stations, the possible combination is c (34,2) s 561.

How to efficiently respond to multiple queries that may exist is also something that the system needs to address.

## Claptrap Main Design

![Train Ticketing System Design](/images/20200720-001.png)

### Each seat on the same train is designed as a Claptrap - SeatGrain.

The State of the Claptrap contains a basic information.

| Type                                   | Name       | Description                                                                                                                                                                            |
| -------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IList&lt;int&gt;           | Stations   | A list of the id of the Pathways Station, starting with the Origin Station, ending with the Terminal.The principal ticket is verified.                                                 |
| Dictionary&lt;int, int&gt; | StationDic | The index of the pad id is reverse dictionary.Stations are a list of index-id dictionaries, which are the dictionary of the corresponding id-index in order to expedite queries.       |
| List&lt;string&gt;         | RequestIds | Key properties.For each district, the ticket id has been purchased.For example, index is 0, which means ticket id for the station 0 to 1.If empty, indicate that there are no tickets. |

With the design of this data structure, two operations could be achieved.

#### Verify if purchase is possible

By passing into two stops ids, it can be asked if this is this SeatGrain.and search for all the interval between the end of the end.It is sufficient to determine whether all the interval segments are not billed Id from RequestIs.If none is available, indicate that it can be purchased.If there is any paragraph with Purchase Id, then it is no longer available.

The current Stations case, for example, is 10,11,12,13. The RequestIds are 0,1,0.

So, if the ticket 10->12 is to be purchased, it will not do so because the second period of requestIds has already been purchased.

However, if the tickets for 10->11 are to be purchased, they can be bought because the first period of the Request Ids is not yet purchased.

#### Buy

Use the ticket Id to set up for all interval segments in RequestIs.

### Designed for a Claptrap - TrainGran for all seats on the same car

The Claptrap State contains some basic information

| Type                                             | Name      | Description                                                                                                                                                                                                                                                                      |
| ------------------------------------------------ | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| IReadOnlyList&lt;int&gt;             | Stations  | A list of the id of the Pathways Station, starting with the Origin Station, ending with the Terminal.Verify while query.                                                                                                                                                         |
| IDictionary&lt;StationTuple, int&gt; | SeatCount | Key properties.The StationTuple represents a start to the end.The collection contains the rest of the ticket situation for all possible starting points.For example, according to the above, if the car passes through 34 locations, the dictionary contains 561 key-value pairs |

Based on the data structure above, you only need to synchronize the corresponding information to the Grain each time The SeatGrain completes placing the order.

For example, given a,c there was a single ticket, the surplus of a,c c /a,b b,c was reduced by one.

This can be done by using the Minion mechanism within this framework.

It is worth mentioning that this is a larger design than the “least competitive resources”.The search scene does not require absolute speed in the business scenario.This design reduces the complexity of the system.

## Id

![Train Ticketing System Id](/images/20200813-001.png)
