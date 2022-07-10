---
title: "第二步-创建项目"
description: "第二步-创建项目"
---

接上一篇 [第一步-开发环境准备](01-1-Preparation.md) ，我们继续了解如何创建一个 Newbe.Claptrap 项目。

<!-- more -->

## 安裝項目模板

打开控制台运行以下命令来安装最新的项目模板：

```bash
dotnet new --install Newbe.Claptrap.Template
```

安裝完之後，可以响安裝結果入面睇到已經安裝的咗嘅項目模板。

![newbe.claptrap.template安裝完成](/images/20200709-001.png)

## 建立項目

選擇一個位置，建立一個文件夾，呢個例選擇响`D:\Repo`下創建一個叫做`HelloClaptrap`嘅文件夾。果個文件夾將會用作新項目的code folder。

打開控制台，並且將工作目錄切換到`D:\Repo\HelloClaptrap`。然後運行下面嘅命令就可以建立出項目：

```bash
dotnet new newbe.claptrap --name HelloClaptrap
```

> 通常黎講，我哋建議將`D:\Repo\HelloClaptrap`標記做 Git 倉庫嘅文件夾。通過版本控制來管理你嘅源代碼。

## 启动项目

接下来，我们使用命令行启动项目。将命令行切换到`C:\Repos\HelloClaptrap\HelloClaptrap`，运行以下命令：

```bash
tye run
```

启动之后可以在 tye dashboard 上查看到项目模板包含的所有项目：

![newbe.claptrap service](/images/20210217-002.png)

> tye dashboard 的地址通常为 <http://localhost:8000>， 若端口被占用将自动使用其他端口，可以查看命令行上的提示，以得到当前具体的地址。

我们可以在如上图所示的界面上找到`helloclaptrap-webapi`服务的运行地址。例如，上图所示，其终结点地址为<http://localhost:14285>。

因此，我们使用浏览器打开该地址，以查看 swagger 界面。

在 swagger 页面上，尝试调用`​/AuctionItems​/{itemId}​/status`API：

![newbe.claptrap AuctionItems​](/images/20210217-003.png)

服务返回 200 说明当前服务各个组件已经正常启动。

## 体验项目

使用项目模板创建的项目实际上是一个模拟拍卖竞价业务的程序。

拍卖竞价是一个典型的可能具有并发请求需要处理的业务场景。使用 Newbe.Claptrap 可以很简单的解决该问题。后续的文档中我们将连续使用该业务场景进行演示，因此，此处进行一下简单的业务场景说明。

### 业务规则

业务规则大致如下：

1. 每个拍卖品由一个唯一的 `itemId`
2. 拍卖品只能在一段时间内进行竞价拍卖
3. 拍卖品有一个起始拍卖价格
4. 所有的竞拍者都拥有一个唯一的 `userId`
5. 竞拍者在拍卖时间段内可以无限次对拍卖品进行出价，只要其出价大于当前最高出价，即可算作有效出价，并成为该拍卖品目前的得标人
6. 需要记录所有成功出价的详细情况，包括出价时间，出价额，出价人。

拍卖品的状态如下：

- `0 Planned` 等待开拍
- `1 OnSell` 正在拍卖
- `2 Sold` 已经拍出
- `3 UnSold` 流拍

### API 设计

为了最简单的演示效果，本样例设计了以下这些 API ：

- `GET /AuctionItems/{itemId}/status` 获取指定拍卖品当前的竞价状态
- `GET /AuctionItems/{itemId}` 获取指定拍卖品的详细信息
- `POST ​/AuctionItems` 对指定的拍卖品进行出价

下面我们使用一个简单的场景来体验一下这些 API 的效果。

#### 寻找当前在拍的拍卖品

由于拍卖品的状态受到时间的影响，为了让开发者可以在任何时候都可以找到各种状态的拍卖品，项目中使用了一些基于时间的算法，来生成所有状态的拍卖品。

开发者可以使用 0/1/2/3 四个 itemId 调用`GET /AuctionItems/{itemId}/status`获取拍卖品当前的状态。

其中至少存在一个状态为 `1 OnSell` 的拍卖品。为了后续方便说明，我们假设其 itemId 为 1。

#### 查看拍卖品的详细信息

使用 `GET /AuctionItems/{itemId}` 可以查询到拍卖品的详细信息。例如，我们使用 itemId 为 1 进行查询，可能可以得到如下结果:

```json
{
  "state": {
    "biddingRecords": null,
    "basePrice": 10,
    "startTime": "2021-02-27T12:59:12.673013+08:00",
    "endTime": "2021-02-27T16:59:12.673013+08:00"
  }
}
```

以上结果说明：

- 该拍卖品的起拍价格为 basePrice 10
- 竞拍时间段为 startTime - endTime 时间的时段
- 当前的竞拍记录 biddingRecords 为空

其中时段可能由于启动项目模板的时间发生变化，视具体项目启动时间而定。

#### 尝试出价

接下来，我们调用`POST ​/AuctionItems`尝试对当前在拍的拍卖品进行出价，调用并传入参数如下：

```json
{
  "userId": 1,
  "price": 36524,
  "itemId": 1
}
```

参数说明如下：

- 出价人 userId 为 1
- 出价为 36524
- 拍卖品为 itemId 1

这将得到结果：

```json
{
  "success": true,
  "userId": 1,
  "auctionItemStatus": 1,
  "nowPrice": 36524
}
```

返回结果表明：

- success 出价成功
- 出价人 userId 为 1
- 最新出价为 36524
- 拍卖品当前状态为 `1 OnSell`

然后在使用 `GET /AuctionItems/{itemId}` 便可以查看到当前最新的拍卖品情况：

```json
{
  "state": {
    "biddingRecords": {
      "36524": {
        "userId": 1,
        "price": 36524,
        "biddingTime": "2021-02-27T07:31:09.8954519+00:00"
      }
    },
    "basePrice": 10,
    "startTime": "2021-02-27T12:59:12.673013+08:00",
    "endTime": "2021-02-27T16:59:12.673013+08:00"
  }
}
```

以上结果说明：

- 出价记录已更新，添加了最新的一条竞拍详情。

这样便完成了最简单的出价演示。

开发者可以自行尝试更多不同的状态和参数体验以上 API 的基础用法。例如，出价小于当前最高出价，对非再拍商品进行出价等等操作。

## 停止项目

若想要停止当前正在运行的模板项目。只要在刚才运行`tye run`的控制台上使用键盘按下`Ctrl`+`C`即可停止正在运行的程序。

## 小結

本篇我们了解了安装项目模板和使用项目模板的基本步骤。

下一步，我们将介绍项目模板中包含的主要内容。

<!-- md Footer-Newbe-Claptrap.md -->
