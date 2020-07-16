---
title: 'The first step - create a project and implement a simple shopping cart'
metaTitle: 'The first step - Create a project and implement a simple shopping cart . . . Newbe.Claptrap'
metaDescription: 'The first step - create a project and implement a simple shopping cart'
---

Let's implement a simple "e-commerce cart" requirement to see how to develop using Newbe.Claptrap.

<!-- more -->

## Business needs

Realize a simple "e-commerce shopping cart" requirement, where a few simple business：

- Get items and quantities in your current shopping cart
- Add items to your shopping cart
- Remove specific items from your shopping cart

## Install project templates

First, you need to make sure that you have installed the . NetCore SDK 3.1.[You can click here for the latest version for installation](https://dotnet.microsoft.com/download)。

Once the SDK is installed, open the console and run the following commands to install the latest project templates：

```bash
dotnet new --install Newbe.Claptrap.Template
```

Once installed, you can see the project templates that have already been installed in the installation results.

![Newbe.claptrap template installed](/images/20200709-001.png)

## Create a project

Select a location to create a folder, and this example selects the`D:\Repo` and Create a directory named `HelloClaptrap`.The folder will be used as a code folder for new projects.

Open the console and switch the work directory to`D:\Repo\HelloClaptrap`。Then run the following command to create a project：

```bash
dotnet new newbe.claptrap --name HelloClaptrap
```

> In general, we recommend that the`D:\Repo\HelloClaptrap` should be created as a Git repository.Manage your source code with version control.

## Compilation and startup

Once the project is created, you can compile the solution with your favorite IDE.

Once compiled, start both web and BackendServer projects with the Startup feature on the IDE.(VS needs to start the service as console, and if you use IIS Express, you need the developer to look at the port number to access the web page)

If it is started, you can visiti `http://localhost:36525/swagger` to view the API description of the sample.This includes three mainly APIs：

- `GET` `/api/Cart/{id}` Get items and quantities in a specific id shopping cart
- `POST` `/api/Cart/{id}` Add a new item to the purchase of the specified id
- `DELETE` `/api/Cart/{id}` Remove a specific item from the shopping cart of the specified id

You can try to make several calls to the API through the Try It Out button on the UI.

> - [How to start multiple projects in VS](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [How to start multiple projects in Rider](https://docs.microsoft.com/zh-cn/visualstudio/ide/how-to-set-multiple-startup-projects?view=vs-2019)
> - [Use Huawei Cloud to accelerate nuget restore speed (In China)](https://mirrors.huaweicloud.com/)

## It is no effect when add product at first time?

Yes, you're right.There are BUGS in the business implementation in the project template.

Next, let's open the project and troubleshoot and resolve these bugs by adding some breakpoints.

And by locating the BUG, you can understand the framework's code flow process.

## Add breakpoints

The following needto increase the location of breakpoints based on the different IDE instructions, and you can choose the IDE you are used to operating.

If you don't currently have an IDE on hand, you can also skip this section and read directly what follows.

### Visual Studio

Start both projects at the same time, as mentioned above.

Import breakpoints：Open the Breakpoint window, click the button, select from under the item`breakpoints.xml`File.The corresponding operating location can be found in the two screenshots below.

![Openpoints Breakpoints Window](/images/20200709-002.png)

![Import Breakpoints](/images/20200709-003.png)

### Rider

Start both projects at the same time, as mentioned above.

Rider does not currently have a breakpoint import feature.Therefore, you need to manually create breakpoints at the following locations：

| File                        | Line No. |
| --------------------------- | -------- |
| CartController              | 30       |
| CartController              | 34       |
| CartGrain                   | 24       |
| CartGrain                   | 32       |
| AddItemToCart Event Handler | 14       |
| AddItemToCart Event Handler | 28       |

> [Go To File lets you quickly locate where your files are located](https://www.jetbrains.com/help/rider/Navigation_and_Search__Go_to_File.html?keymap=visual_studio)

## Start debugging

Next, we take a request to see how the entire code runs.

First, let's send a POST request through the swagger interface and try adding items to the shopping cart.

### CartController Start

The first lifeline is the Controller code for the Web API layer：

```cs
(HttpPost){id}")]
public async Task<IActionResult> AddItemAsync (int id, [FromBody] AddItem Input Input)
{
    var cartgrain s _grainFactory.GetGrain<ICartGrain>(id. ToString ();
    Var items s await cartgrain.AddItemAsync (input. SkuId, input. Count);
    return Json (items);
}
```

In this code, we pass`_grainFactory`to create a`ICartGrain`Instance.

This instance is essentially a proxy that points to a specific grain in Backend Server.

The incoming id can be considered a unique identifier for the location instance.In this business context, it can be understood as "cart id" or "user id" (if each user has only one shopping cart).

Continue with debugging and move on to the next step, let's see how the inside of ICartGrain works.

### CartGrain Start

The next stop point is the CartGrain code.：

```cs
public async Task<Dictionary<string, int>> AddItemAsync (string skuId, int count)
{
    var evt s.this. CreateEvent (new AddItem ToCartEvent)
    {
        Count - Count,
        SkuId skuId,
    });
    await Claptrap.HandleEventAsync (evt);
    Return StateData.Items;
}
```

At this point, the code has run to a specific shopping cart object.

You can see through the debugger that both the incoming skuId and count are parameters passed from Controller.

Here you can do these things：

- Modify the data in Claptrap with events
- Read data saved in Claptrap

In this code, we create a`AddItemToCart Event`Object to represent a change to the shopping cart.

It is then passed to Claptrap for processing.

Claptrap updates its State data after accepting the event.

Finally, we return StateData.Items to the caller.(Actually, StateData.Items is a quick property for Claptrap.State.Data.Items.)So it's actually still read from Claptrap. )

With the debugger, you can see the data type of StateData as shown below：

```cs
public class CartState : IStateData
{
    public Dictionary<string, int> Items . . . get; set; . . . . . . . . . . . . . . .
}
```

This is the status of the shopping cart designed in the sample.We use a`Dictionary`to represent the SkuId in the current shopping cart and its corresponding quantity.

Continue debugging and move on to the next step to see how Claptrap handles incoming events.

### AddItemToCart Event Handler Start

Again the point of interruption is the following code：

```cs
public class AddItemCartEvent Handler
    : NormalEvent Handler<CartState, AddItemToCartEvent>
{
    public override ValueTask HandleEvent (CartState StateData, AddItemToCartEvent Event EventData,
        IEventContext EventContext)
    {
        Var items . . . stateData.Items ? new Dictionary<string, int>();
        if (items. TryGetValue (eventData.SkuId, out var itemCount))
        {
            itemCount s eventData.count;
        }
        else
        // {
        itemCount - eventData.Count;
        // }

        Items[eventData.SkuId] s itemCount;
        StateData.Items . . .
        return new ValueTask();
    }
}
```

This code contains two important parameters that represent the current shopping cart status`CartState`and events that need to be handled`AddItemToCart Event`。

We determine whether the dictionary in the state contains SkuId seamount according to business needs and update its number.

Continue debugging and the code will run until the end of this code.

At this point, through the debugger, you can see that the stateData.Items dictionary has increased by one, but the number is 0.The reason is actually because of the else snippet above, which is the cause of the BUG that always fails to add a shopping cart for the first time.

Here, do not interrupt debugging immediately.Let's go ahead and let the code go through to see how the whole process ends.

In fact, continuing debugging, the breakpoint hits the end of the cartGrain and CartController methods in turn.

## This is actually a three-tier architecture!

The vast majority of developers understand the three-tier architecture.In fact, we can also say that Newbe. Claptrap is actually a three-tier architecture.Let's compare it in a table.：

| Traditional three-tiered        | Newbe.Claptrap     | Description                                                                                                                  |
| ------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------- |
| Presentation Presentation Layer | Controller Layer   | Used to dock external systems to provide external interoperability                                                           |
| Business Business Tier          | Grain Layer        | Business processing based on incoming business parameters (sample does not actually write judgment, need to judge count > 0) |
| Persistence Persistence Layer   | EventHandler Layer | Update business results                                                                                                      |

Of course, the above analogy is a simple description.In the specific process, there is no need to be too entangled, this is only an auxiliary understanding of the statement.

## You also have a BUG to fix

Then we go back and fix the previous "First Join Products Don't Take Effect" issue.

### This is a framework for considering unit testing

There is a project in the project template`HelloClap.Actors.Tests`The project contains unit tests of the main business code.

We now know that`AddItemToCart Event Handler`The code in the comments is the main cause of the BUG.

We can use`dotnet test`If you run the unit tests in your test project, you get two errors:

```bash
A total of 1 test files matched the syd dh'fydd pattern.
  X AddFirstOne [130ms]
  Error Message:
   D'Value to be 10, but found 0.
  Stack Trace:
     at FluentS. Execution.LateTestBoundFramework.Throw (String Message)
   at FluentS. Execution.TestFramework Provider.T. Throw
   at FluentS. Execution.DefaultKStrategy.HandleFailure (String Message)
   At FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   At FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   at FluentS. Execution.Ax. Scope.FailWith (String message, Object?args)
   at FluentS.Numeric.NumericS'1.Be (T expected, String because, Object' becauseArgs)
   At HelloClaptrap.Actors.Tests.Cart.Events.AddItemCartEventHandler.AddFirstOne() in D:\Repo?HelloClaptrap?HelloClaptrap?HelloClaptrap.Actors.Tests?Cart?Events?AddToCartEventHandlerTest.cs: line 32
   At HelloClaptrap.Actors.Tests.Cart.Events.AddItemCartEventHandler.AddFirstOne() in D:\Repo?HelloClaptrap?HelloClaptrap?HelloClaptrap.Actors.Tests?Cart?Events?AddToCartEventHandlerTest.cs: line 32
   at NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter'1.GetResult ()
   at NUnit.Framework.Internal.AsyncToSyncAdapter.Await (Func'1 Invoke)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.RunTestMethod (TestExecution Context)
   at NUnit.Framework.Internal.Commands.TestMethod Command.Execute (TestExecution Context)
   at NUnit.Framework.Internal.Execution SimpleWorkItem.PerformWork()

  X RemoveOne [2ms]
  Error Message:
   D'Value to be 90, but found 100.
  Stack Trace:
     at FluentS. Execution.LateTestBoundFramework.Throw (String Message)
   at FluentS. Execution.TestFramework Provider.T. Throw
   at FluentS. Execution.DefaultKStrategy.HandleFailure (String Message)
   At FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   At FluentS. Execution.Ax. Scope.FailWith (Func'1 failReasonFunc)
   at FluentS. Execution.Ax. Scope.FailWith (String message, Object?args)
   at FluentS.Numeric.NumericS'1.Be (T expected, String because, Object' becauseArgs)
   At HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemCartEventHandlerHandler.RemoveOne() in D:\Repo?HelloClaptrap?HelloClap.Actors.Tests?Cart?Events\RMoveItem From CartEvent HandlerTest.cs: line 40
   At HelloClaptrap.Actors.Tests.Cart.Events.RemoveItemCartEventHandlerHandler.RemoveOne() in D:\Repo?HelloClaptrap?HelloClap.Actors.Tests?Cart?Events\RMoveItem From CartEvent HandlerTest.cs: line 40
   at NUnit.Framework.Internal.TaskAwaitAdapter.GenericAdapter'1.GetResult ()
   at NUnit.Framework.Internal.AsyncToSyncAdapter.Await (Func'1 Invoke)
   at NUnit.Framework.Internal.Commands.TestMethodCommand.RunTestMethod (TestExecution Context)
   at NUnit.Framework.Internal.Commands.TestMethod Command.Execute (TestExecution Context)
   at NUnit.Framework.Internal.Execution SimpleWorkItem.PerformWork()


Test Run Failed.
Total tests: 7
     Passed: 5
     Failed: 2

```

Let's look at the code for one of the faulty unit tests.：

```cs
[Test]
public async Task AddFirstOne ()
{
    using var mocker - AutoMock.GetStrict ();

    await use var handler s-mocker. Create<AddItemToCartEventHandler>();
    var state s new CartState ();
    var evt s new AddItemToCartEventEvent
    {
        SkuId skuId1,
        Count s 10
    };
    await handler. HandleEvent (state, evt, default);

    State. Items.Count.Down.) Be (1);
    var (key, value) s state. Items.Single();
    key. "What") Be (evt. SkuId);
    value. "What") Be (evt. Count);
}
```

`AddItemToCart Event Handler`is the main test component of this test, and since both stateData and event are manually built, it is easy for developers to build scenarios that need to be tested as needed.There is no need to build anything special.

Now, as long as the`AddItemToCart Event Handler`Restore the commented code and rerun the unit test.Unit tests pass.BUGS ARE ALSO NATURALLY FIXED.

Of course, there's another unit test of the deletion scenario above that fails.Developers can fix this problem by following the "breakpoint" and "unit test" ideas described above.

## The data has been persisted.

You can try restarting Backend Server and the Web, and you'll find that the data you worked on before has been persisted.

We will cover it further in a later chapter.

## Summary

Through this article, we have a preliminary understanding of how to create a basic project framework to implement a simple shopping cart scenario.

There's a lot here that we don't have a detailed description of.：Project structure, deployment, persistence, and more.You can read further to learn more.
