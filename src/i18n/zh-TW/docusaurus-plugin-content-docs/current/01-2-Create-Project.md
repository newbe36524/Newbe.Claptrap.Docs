---
title: "第二步-創建專案"
description: "第二步-創建專案"
---

接上一篇 [第一步-開發環境準備](01-1-Preparation.md) ，我們繼續瞭解如何創建一個 Newbe.Claptrap 專案。

<!-- more -->

## 安裝項目模板

開啟主控主執行以下指令來安裝最新的項目樣本：

```bash
dotnet new --install Newbe.Claptrap.Template
```

安裝完畢後，可以在安裝結果中查看到已經安裝的項目模板。

![newbe.claptrap.template安裝完成](/images/20200709-001.png)

## 建立項目

選擇一個位置，建立一個文件夾，本範例選擇在`D:\Repo`下創建一個名為`HelloClaptrap`的文件夾。該文件夾將會作為新項目的源代碼文件夾。

打開控制台，並且將工作目錄切換到`D:\Repo\HelloClaptrap`。然後運行以下命令便可以建立出項目：

```bash
dotnet new newbe.claptrap --name HelloClaptrap
```

> 通常來說，我們建議將`D:\Repo\HelloClaptrap`標記為 Git 倉庫文件夾。通過版本控制來管理您的源代碼。

## 啟動專案

接下來，我們使用命令行啟動專案。將命令列切換到`C：\Repos\HelloClaptrap\HelloClaptrap`，運行以下命令：

```bash
tye run
```

啟動之後可以在 tye dashboard 上查看到專案範本包含的所有項目：

![newbe.claptrap service](/images/20210217-002.png)

> tye dashboard 的位址通常為 <http://localhost:8000>， 若埠被佔用將自動使用其他埠，可以查看命令列上的提示，以得到當前具體的位址。

我們可以在如上圖所示的介面上找到`helloclaptrap-webapi`服務的運行位址。例如，上圖所示，其終結點位址為<http://localhost:14285>。

因此，我們使用瀏覽器打開該位址，以查看 swagger 介面。

在 swagger 頁面上，嘗試呼叫`/AuctionItems/{itemId}/status`API：

![newbe.claptrap AuctionItems​](/images/20210217-003.png)

服務返回 200 說明當前服務各個元件已經正常啟動。

## 體驗專案

使用專案範本創建的項目實際上是一個類比拍賣競價業務的程式。

拍賣競價是一個典型的可能具有併發請求需要處理的業務場景。使用 Newbe.Claptrap 可以很簡單的解決該問題。後續的文檔中我們將連續使用該業務場景進行演示，因此，此處進行一下簡單的業務場景說明。

### 業務規則

業務規則大致如下：

1. 每個拍賣品由一個唯一的 `itemId`
2. 拍賣品只能在一段時間內進行競價拍賣
3. 拍賣品有一個起始拍賣價格
4. 所有的競拍者都擁有一個唯一的 `userId`
5. 競拍者在拍賣時間段內可以無限次對拍賣品進行出價，只要其出價大於當前最高出價，即可算作有效出價，並成為該拍賣品目前的得標人
6. 需要記錄所有成功出價的詳細情況，包括出價時間，出價額，出價人。

拍賣品的狀態如下：

- `0 Planned` 等待開拍
- `1 OnSell` 正在拍賣
- `2 Sold` 已經拍出
- `3 UnSold` 流拍

### API 設計

為了最簡單的展示效果，本樣例設計了以下這些 API ：

- `GET /AuctionItems/{itemId}/status` 獲取指定拍賣品當前的競價狀態
- `GET /AuctionItems/{itemId}` 獲取指定拍賣品的詳細資訊
- `POST /AuctionItems` 對指定的拍賣品進行出價

下面我們使用一個簡單的場景來體驗一下這些 API 的效果。

#### 尋找當前在拍的拍賣品

由於拍賣品的狀態受到時間的影響，為了讓開發者可以在任何時候都可以找到各種狀態的拍賣品，專案中使用了一些基於時間的演算法，來生成所有狀態的拍賣品。

開發者可以使用 0/1/2/3 四個 itemId 調用`GET /AuctionItems/{itemId}/status`獲取拍賣品當前的狀態。

其中至少存在一個狀態為 `1 OnSell` 的拍賣品。為了後續方便說明，我們假設其 itemId 為 1。

#### 查看拍賣品的詳細資訊

使用 `GET /AuctionItems/{itemId}` 可以查詢到拍賣品的詳細資訊。例如，我們使用 itemId 為 1 進行查詢，可能可以得到如下結果：

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

以上結果說明：

- 該拍賣品的起拍價格為 basePrice 10
- 競拍時間段為 startTime - endTime 時間的時段
- 當前的競拍記錄 biddingRecords 為空

其中時段可能由於啟動專案範本的時間發生變化，視具體專案啟動時間而定。

#### 嘗試出價

接下來，我們調用`POST /AuctionItems`嘗試對當前在拍的拍賣品進行出價，調用並傳入參數如下：

```json
{
  "userId": 1,
  "price": 36524,
  "itemId": 1
}
```

參數說明如下：

- 出價人 userId 為 1
- 出價為 36524
- 拍賣品為 itemId 1

這將得到結果：

```json
{
  "success": true,
  "userId": 1,
  "auctionItemStatus": 1,
  "nowPrice": 36524
}
```

傳回結果顯示：

- success 出價成功
- 出價人 userId 為 1
- 最新出價為 36524
- 拍賣品目前狀態為 `1 OnSell`

然後在使用 `GET /AuctionItems/{itemId}` 便可以查看到當前最新的拍賣品情況：

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

以上結果說明：

- 出價記錄已更新，添加了最新的一條競拍詳情。

這樣便完成了最簡單的出價演示。

開發者可以自行嘗試更多不同的狀態和參數體驗以上 API 的基礎用法。例如，出價小於當前最高出價，對非再拍商品進行出價等等操作。

## 停止專案

若想要停止當前正在運行的範本專案。只要在剛才運行`tye run`的控制臺上使用鍵盤按下`Ctrl`+`C`即可停止正在運行的程式。

## 小結

本篇我們瞭解了安裝專案範本和使用專案範本的基本步驟。

下一步，我們將介紹專案範本中包含的主要內容。

<!-- md Footer-Newbe-Claptrap.md -->
