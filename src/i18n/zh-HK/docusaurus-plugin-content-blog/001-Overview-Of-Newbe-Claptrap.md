---
date: 2019-02-28
title: Newbe.Claptrap-一套以“事件溯源”和“Actor模式”作为基本理论的服务端开发框架
---

本文是关于 Newbe.Claptrap 项目主体内容的介绍，读者可以通过这篇文章，大体了解项目内容。

<!-- more -->

## 轮子源于需求

随着互联网应用的蓬勃发展，相关的技术理论和实现手段也在被不断创造出来。诸如“云原生架构”、“微服务架构”、“DevOps”等一系列关键词越来越多的出现在工程师的视野之中。总结来看，这些新理论和新技术的出现，都是为了解决互联网应用中出现的一些技术痛点：

**更高的容量扩展性要求**。在商业成功的基础前提下，互联网应用的用户数量、系统压力和硬件设备数量等方面都会随着时间的推移出现明显的增长。这就对应用本省的容量可扩展性提出了要求。这种容量可扩展性通常被描述为“应用需要支持水平扩展”。

**更高的系统稳定性要求**。应用程序能够不间断运行，确保商业活动的持续进展，这是任何与这个应用系统相关的人员都希望见到的。但是要做到这点，通常来说是十分困难的。而现今的互联网应用在面对诸多同类竞争者的情况下，如果在这方面做得不够健全，那么很可能会失去一部分用户的青睐。

**更高的功能扩展性要求**。“拥抱变化”，当人们提到“敏捷项目管理”相关的内容时，都会涉及到的一个词语。这个词语充分体现了当今的互联网应用若要成功，在功能性上做到出彩做到成功是多么的重要。也从一个侧面体现了当前互联网环境下产品需求的多变。而作为系统工程师，在应用建立之初就应该考虑这点。

**更高的开发易用度要求**。这里所属的开发易用度是指，在应用系统自身在进行开发时的难易程度。要做到越易于开发，在应用自身的代码结构，可测试性，可部署性上都需要作出相应的努力。

**更高的性能要求**。这里提到的性能要求，是特指在系统容量增加时的性能要求。避免系统的单点性能问题，让应用系统具备可水平扩展的特性。通常来说，在性能出现问题时，若可以通过增加物理设备来解决问题，通常来说是最为简单的办法。而在不同的系统容量之下，系统性能的优化方案通常是不同的。因此结合应用场景进行技术方案的选型一直都是系统工程师所需要考虑的问题。

本项目，就是基于以上这些系统功能特性要求所总结出来的一套开发框架。这其中包含了相关的理论基石、开发类库和技术规约。

> 世界上本也不存在“银弹”。一套框架解决不了所有问题。 ——不愿意透露姓名的月落

## 从需求出发

在讲解分布式系统时，常常会用到“账号转账”这个简单的业务场景来配合描述。这里阐述一下这个业务场景。

假设我们需要建设一个具备账号体系的业务系统。每个账号都有余额。现在需要执行一次转账操作，将账号 A 的余额中的 300 划转给账号 B。另外，基于上节的基本要求，我们在实现这个场景时，需要考虑以下这些内容：

- 需要应对系统容量的激增。应用初期可能只有 1000 个初始用户。由于应用推广效果良好以及机器人账号的涌入，用户数量实现了在一个月内实现了三个数量级的攀升，也就是增长到了百万级别。
- 需要考虑系统的稳定性和可恢复性。尽可能减少系统整体的平均故障时间，即使出现系统故障也应该是尽可能易于恢复的。也就是，要避免出现单点故障。
- 需要考虑业务的可扩展性。后续可能需要增加一些业务逻辑：按照账户等级限制日转账额、转账成功后进行短信通知、转账支持一定额度的免密转账、特定的账号实现“T+1”到账。
- 需要考虑代码的可测试性。系统的业务代码和系统代码能够良好的分离，能够通过单元测试的手段初步验证业务代码和系统代码的正确性和性能。

## 轮子的理论

本节将介绍一些和本框架紧密结合的理论内容，便于读者在后续的过程中理解本框架的工作过程。

### Actor 模式

Actor 模式係併發編程嘅一種模型。透過呢種編程模型編寫嘅應用程式可以很好咁去處理一哋系統性嘅併發問題。當中提到嘅併發問題係指程式對同一數據進行邏輯處理嘅時候，可能由於同時發起多個請求產生數據出現唔正確嘅問題。喺多線程編程入面一定會遇到嘅問題。舉例而言，假如喺唔加SyncLock 嘅情況下，用 100 個threads併發對相同嘅一個`int`變量執行`++`操作。 到最後，呢個變量嘅結果往往會小於 100。到最後，呢個變量嘅結果往往會小於 100。後續會講下 Actor 模式係點樣避免呢類問題既。

首先，為了便於理解，讀者在此處可以將 Actor 認為是一個物件。在物件導向程式設計的語言（Java、C#等）當中，可以認為 Actor 就是通過`new`關鍵詞創建出來的物件。不過這個物件有一些特別的特性：

**擁有屬於自身的狀態**。物件都可以擁有自身的屬性，這是物件導向語言基本都具備的功能。在 Actor 模式中，这些属性都被统称为 Actor 的状态（State）。Actor 的狀態由 Actor 自身進行維護。

這就強調了兩點：

第一、Actor 的狀態只能由自身進行改變，若要從外部改變 Actor 的狀態，只能通過調用 Actor 才能改變。

![更新Actor狀態](/images/20190226-001.gif)

第二、Actor 的狀態只在 Actor 內部進行維護，不與當前 Actor 之外的任何對象共享。這裏說的不共享也是強調其不能通過外部某個屬性的改變而導致 Actor 內部狀態的變化。這點主要是為了區別於一些具備“物件導向”語言特性的編程語言而言的。例如：在 C#的 class 的 public 属性，假如是引用类型，那么在外部获得这个 class 之后是可以改变 class 中的属性的。但是這在 Actor 模式當中是不被允許的。

![共享Actor狀態](/images/20190226-003.gif)

不過從 Actor 內部讀取數據到外部，這仍然是允許的。

![讀取Actor狀態](/images/20190226-002.gif)

**單線程**。Actor 通常同一時間只能接受一個呼叫（做一件事）。這裏所述的線程不完全是指電腦領域中的線程，是為了凸顯“Actor 同一時間只能處理一個請求的特性”而使用的詞語。假如當前 Actor 正在接受一個呼叫，那麼剩餘的呼叫都會阻塞，直到呼叫結束，下一個請求才允許被進入。這其實類似於一個同步鎖的機制。透過這種機制就避免了對 Actor 內部狀態進行修改時，存在併發問題的可能性。具体一点说明：如果使用 100 个线程对一个 Actor 进行并发调用，让 Actor 对状态中的一个 int 变量进行 ++ 操作。最終這個狀態的數值一定是 100。

![併發執行Actor](/images/20190226-004.gif)

不過單線程也不是絕對的，在不存在併發問題的請求情況下，允許併發處理。例如讀取 Actor 中的狀態，這通常不會有併發問題，那麼此時就允許進行併發操作。

![併發讀取Actor](/images/20190226-005.gif)

> 读到 Actor 单线程特性时，通常读者会考虑到这是否会导致 Actor 本身处理过慢而产生性能问题呢？关于这点，希望读者继续持有这个问题往后阅读，寻找答案。

### 事件溯源模式

事件溯源模式係一種軟體設計嘅思路。呢種設計思路通常跟傳統用到以CRUD為主嘅系統設計思路有啲唔同。CRUD 系統通常存在一哋局限性：

1. 通常黎講 CRUD 系統會採用直接操作數據存儲嘅做法。咁樣嘅實現方式可能會因為Database優化唔夠而發生性能瓶頸，並且呢種做法會較難實現應用伸縮。
2. 喺特定嘅領域通常存在一哋數據併發嘅問題需要進行處理，防止數據更新引致嘅錯誤。通常我地會引入“Lock”、“Transaction”呢哋相關嘅技術嚟避免此類問題。但咁做又有可能引發性能上嘅損失。
3. 除非增加額外的審計手段，否則通常來說數據的變更歷史是不可追蹤的。因為數據存儲中通常保存嘅係數據最終狀態。

跟 CRUD 做法對比，事件溯源則由設計上避免咗上述描述嘅局限性。跟住落黎圍繞上文中提到嘅“轉賬”業務場景簡述一下事件溯源嘅基礎工作方式。

採用 CRUD 嘅方法實現“轉賬”。

![採用CRUD的方法實現“轉賬”](/images/20190226-006.gif)

採用事件溯源嘅方式實現“轉賬”。

![採用事件溯源的方法實現“轉賬”](/images/20190227-001.gif)

如上圖所示，通過事件溯源模式將轉賬業務涉及嘅余額變動採用事件方式進行存儲。同樣亦實現咗業務本身，但係就帶嚟咗一哋好處：

- 通過事件，可以還原出賬號任何階段嘅余額，咁就一定程度實現咗對賬號余額嘅跟蹤。
- 由於兩個賬號事件是係獨立處理嘅。因此，兩個賬號嘅處理速度唔會相互影響。例如，賬號 B 嘅轉入可能由於需要額外處理，稍有延遲，但賬號 A 仍然可以繼續轉出。
- 可以通過訂閱事件嚟做一哋業務的嘅異步處理。例如：更新數據庫入面嘅統計數據，發送SMS通知等其他一些異步嘅操作。

當然引入事件溯源模式之後也就引入了事件溯源相關嘅一些技術問題。例如：事件所消耗的存儲可能較為巨大；不得不應用最終一致性；事件具備不可變性，重構時可能較為困難等。相關的這些問題在一些文章中會有較為細緻的說明。讀者可以閱讀後續嘅延伸閱讀內容，更進一步了解及評估可行性。

> 业务复杂度是不会因为系统设计变化而减少的，它只是从一个地方转移到了另外的地方。——总说自己菜的月落

## 让轮子转起来

基于读者已经大体理解了上节理论的基础上，本节将结合上述描述的“转账”业务场景，介绍本框架的工作原理。首先读者需要了解一下本框架的两个名词。

### Claptrap

![Claptrap](/images/20190228-001.gif)

Claptrap 是本框架定義的一種特殊 Actor。除了上文中提到 Actor 兩種特性之外，Claptrap 還被定義為具有以下特性：

**狀態由事件進行控制**。Actor 的狀態在 Actor 內部進行維護。Claptrap 同样也是如此，不过改变 Claptrap 的状态除了限定在 Actor 内修改之外，还限定其只能通过事件进行改变。这就将事件溯源模式与 Actor 模式进行了结合。通過事件溯源模式保證了 Actor 狀態的正確性和可追溯性。這些改變 Claptrap 狀態的事件是由 Claptrap 自身產生的。事件產生的原因可以是外部的調用也可以是 Claptrap 內部的類別 觸發器機制產生的。

### Minion

![Minion](/images/20190228-002.gif)

Minion 是本框架定义的一种特殊 Actor。喺 Claptrap 基礎上做出嘅調整。佢具備以下呢哋特性：

**從對應的 Claptrap 讀取事件**。跟 Claptrap 一樣，Minion 嘅狀態亦都係由事件進行控制。唔同嘅係，Minion 就好似佢字面意思一樣，總係由對應嘅 Claptrap 攞到事件，從而改變自身狀態。因此，佢可以異步的處理 Claptrap 產生事件之後嘅後續操作。

### 业务实现

接下来有了前面的基础介绍，现在介绍一下本框架如何实现上文中的“转账”场景。首先可以通过下图来了解一下主要的流程：

![Claptrap & Minion](/images/20190228-003.gif)

如上图所示，整个流程便是本框架实现业务场景的大体过程。另外，还有一些需要指出的是：

- 图中 Client 与 Claptrap 的调用等待只有第一阶段的时候存在，也就是说，这使得 Client 可以更快的得到响应，不必等待整个流程结束。
- Claptrap A 在处理完自身请求，并将事件发送给 Minion A 之后就可以重新接受请求，这样提高了 Claptrap A 的吞吐量。
- Minion 不仅仅只能处理 Claptrap 之间的调用代理。在 Minion 当中还可以根据业务需求进行：发送短信，更新数据库统计数据等其他操作。
- Minion 也可以具备自己的状态，将部分数据维持在自身的状态中以便外部可以从自身进行查询，而不需要从对应的 Claptrap 中进行查询。例如：统计该账号最近 24 小时的转账变动，以便快速查询。

### 业务容量

前文提到本框架需要建设的是一个可以水平扩展的系统架构，只有如此才能应对业务容量的持续增长。在这点上，本框架现阶段采用的是微软开源的[Orleans](https://github.com/dotnet/orleans)实现应用程序和物理设备的放缩。当然，涉及数据存储部分时势必也涉及到数据库集群等一系列问题。这些属于技术应用的细节，而非框架理论设计的内容。因此，此处只表明本框架可以基于以上的开源架构进行容量放缩。应用过程中的实际问题，读者可以在后续的项目内容中寻求解答。

## 延伸阅读

以下这些内容都对本框架产生了深远的影响。读者可以通过阅读以下这些内容，增加对本框架的理解。

- [基於 Actor 框架 Orleans 構建的分布式、事件溯源、事件驅動、最終一致性的高性能框架——Ray](https://github.com/RayTale/Ray)
- [Event Sourcing Pattern](https://docs.microsoft.com/en-us/previous-versions/msp-n-p/dn589792%28v%3dpandp.10%29)
- [Event Sourcing Pattern 中文譯文](https://www.infoq.cn/article/event-sourcing)
- [Orleans - Distributed Virtual Actor Model](https://github.com/dotnet/orleans)
- [Service Fabric](https://docs.microsoft.com/zh-cn/azure/service-fabric/)
- [ENode 1.0 - Saga 的思想與實現](http://www.cnblogs.com/netfocus/p/3149156.html)

<!-- md Footer-Newbe-Claptrap.md -->
