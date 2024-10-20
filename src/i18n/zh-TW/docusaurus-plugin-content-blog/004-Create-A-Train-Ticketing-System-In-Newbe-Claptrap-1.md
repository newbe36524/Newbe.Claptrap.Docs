---
date: 2020-07-20
title: 構建一個簡易的火車票售票系統，Newbe.Claptrap框架用例，第一步——業務分析
---

Newbe.Claptrap 框架非常適合於解決具有併發問題的業務系統。火車票售票系統，就是一個非常典型的場景用例。

本系列我們將逐步從業務、代碼、測試和部署多方面來介紹，如何使用 Newbe.Claptrap 框架來構建一個簡易的火車票售票系統。

<!-- more -->

## 吹牛先打草稿

讓我們來首先界定一下這個簡易的火車售票系統所需要實現的業務邊界和性能要求。

### 業務邊界

該系統僅包含車票的餘票管理部分。即查詢剩餘座位，下單買票減座。

而生成訂單資訊，付款，流量控制，請求風控等等都不包含在本次討論的範圍中。

### 業務用例

- 查詢余票，能夠查詢兩個車站間可用的車次以及剩餘座位數量。
- 查詢車次對應的車票餘票，能夠查詢給定的車次，在各個車站之間還有多少剩餘座位。
- 支援選座下單，客戶能夠選擇給定的車次及座位，並下單買票。

### 性能要求

- 查詢余票和下單購票消耗平均不得超過 20ms。該時間僅包含服務端處理時間，即頁面網路傳輸，頁面渲染等等不是框架關心的部分不計算在內。
- 餘票查詢可以存在延時，但不是超過 5 秒鐘。延時，即表示，可能查詢有票，但是下單無票的情況是被允許的。

## 難點分析

### 餘票管理

火車票餘票管理的難點，其實就在於其餘票庫存的特殊性。

普通的電商商品，以 SKU 為最小單位，每個 SKU 之間相互獨立，互不影響。

例如：當前我正在售賣原產自賽博坦星球的阿姆斯壯迴旋加速炮，紅色和白色兩款分別一萬個。那麼使用者在下單時，只要分別控制紅色和白色兩款的庫存分別不超賣即可。他們之間沒有相互關係。

但是火車票餘票，卻有所不同，因為余票會受到已賣票起終點而受到影響。下面結合一個簡單的邏輯模型，來詳細的瞭解一下這種特殊性。

現在，我們假設存在一個車次，分別經過 a，b，c，d 四個網站，同時，我們簡化場景，假設車次中只有一個座位。

那麼在沒有任何人購票之前，這個車次的餘票情況就如下所示：

| 起終點 | 餘票量 |
| --- | --- |
| a,b | 1   |
| a,c | 1   |
| a,d | 1   |
| b,c | 1   |
| b,d | 1   |
| c,d | 1   |

如果現在有一位客戶購買了一張 a，c 的車票。那麼由於只有一個座位，所以，除了 c，d 其他的餘票就都沒有。餘票情況就變成了如下所示：

| 起終點 | 餘票量 |
| --- | --- |
| a,b | 0   |
| a,c | 0   |
| a,d | 0   |
| b,c | 0   |
| b,d | 0   |
| c,d | 1   |

更直白一點，如果有一位客戶購買了全程車票 a，d，那麼所有的餘票都將全部變為 0。因為這個座位上始終都坐著這位乘客。

這也就是火車票的特殊性：同一個車次的同一個座位，其各個起終點的餘票數量，會受到已售出的車票的起終點的影響。

延伸一點，很容易得出，同一車次的不同座位之間是沒有這種影響的。

### 餘票查詢

正如上一節所述，由於余票庫存的特殊性。對於同一個車次 a，b，c，d，其可能的購票選擇就有 6 種。

並且我們很容易就得出，選擇的種類數的計算方法實際上就是在 n 個網站中選取 2 個的組合數，即 c（n，2） 。

那麼如果有一輛經過 34 個網站的車次，其可能的組合就是 c（34，2） = 561 。

如何高效應對可能存在的多種查詢也是該系統需要解決的問題。

## Claptrap 邏輯設計

Actor 模式是天生適合於解決併發問題的設計模式。基於該理念之上的 Newbe.Claptrap 框架自然也能夠應對以上提到的難點。

### 最小競爭資源

類比多線程程式設計中"資源競爭"的概念，這裡筆者提出在業務系統中的"最小競爭資源"概念。借助這個概念可以很簡單的找到如何應用 Newbe.Claptrap 的設計點。

例如在筆者售賣阿布斯特朗迴旋加速炮的例子中，同款顏色下的每個商品都是一個"最小競爭資源"。

注意，這裡不是說，同款顏色下的所有商品是一個"最小競爭資源"。因為，如果對一萬個商品進行編號，那麼搶購一號商品和二號商品，本身其實不存在競爭關係。因此，每個商品都是一個最小競爭資源。

那麼在火車票餘票的例子中，最小競爭資源則是：同一車次上的同一個座位。

正如上面所述，同一車次上的同一座位，在選擇不同的起終點是，餘票情況時存在競爭關係的。具體一點，比如筆者想購買 a，c 的車票，而讀者想買 a，b 的車票。那麼我們就有競爭關係，我們只會有一個人能夠成功的購買到這個"最小競爭資源"。

這裡有一些筆者認為可用的例子：

- 在一個只允許單端登錄的業務系統中，一個使用者的登錄票據就是最小競爭資源
- 在一個配置系統中，每個配置項都是最小競爭資源
- 在一個股票交易市場中，每個買單或者賣單都是最小競爭資源

> 這是筆者自己的臆造詞，沒有參考其他資料，如果有類似資料或者名詞可以佐證該內容，也希望讀者可以留言說明。

### 最小競爭資源 與 Claptrap

之所以要提及"最小競爭資源"，是因為在設計 Claptrap 的 State 時，區別最小競爭資源是對系統設計的一個重要依據。

這裡列出一條筆者的結論：**Claptrap 的 State 至少應該大於等於「最小競爭資源」的範圍。**

結合阿布斯特朗迴旋加速炮的例子，如果同款顏色的所有商品設計在同一個 Claptrap 的 State 中（大於最小競爭資源）。那麼，不同用戶購買商品就會相互影響，因為，Claptrap 基於的 Actor 模式是排隊處理請求的。也就是說，假設每個商品需要處理 10ms，那麼最快也需要 10000 \* 10 ms 來處理所有的購買請求。但如果每個商品都進行編號，每個商品設計為單獨的 Claptrap 的 State。那麼由於他們是互不相關的。賣掉所有商品，理論上就只需要 10ms。

也就是說：**如果 Claptrap 的 State 大於最小競爭資源的範圍，系統不會有正確性的問題，但可能有一些性能損失。**

再進一步，前文提到在火車售票的例子中，同一車次上的同一個座位是最小競爭資源，因此，我們可以將這個業務實體設計為 Claptrap 的 State 。但如果設計範圍比這個還小呢？

例如：我們將 Claptrap 的 State 設計為同一車次上同一座位在不同起終點的餘票。那麼，就會遇到一個很傳統的問題：「如何確保分散式系統中數據的正確性」。對於這點，筆者無法展開來說，因為筆者也說不清楚，就只是草率的丟下一句結論：**"如果 Claptrap 的 State 小於最小競爭資源的範圍，Claptrap 間的關係將會變得難以處理，存在風險。"**

### Claptrap 主體設計

接下來，結合上面所述的理論。我們直接丟出設計方案。

![Train Ticketing System Design](/images/20200720-001.png)

#### 將同一車次上的每個座位都設計為一個 Claptrap - SeatGrain

該 Claptrap 的 State 包含有一個基本資訊

| 類型                                     | 名稱         | 说明                                                                    |
| -------------------------------------- | ---------- | --------------------------------------------------------------------- |
| IList&lt;int&gt;           | Stations   | 途徑車站的 id 清單，開頭為始發站，結尾為終點站。主要購票時進行驗證。                                  |
| Dictionary&lt;int, int&gt; | StationDic | 途徑車站 id 的索引反向字典。Stations 是 index-id 的清單，而該字典是對應的 id-index 的字典，為了加快查詢。 |
| List&lt;string&gt;         | RequestIds | 關鍵屬性。每個區間上，已購票的購票 id。例如，index 為 0 ，即表示車站 0 到車站 1 的購票 id。如果為空則表示暫無認購票。 |

有了這數據結構的設計，那麼就可以來實現兩個業務了。

##### 驗證是否可以購買

透過傳入兩個車站 id，可以查詢到這個作為是否屬於這個 SeatGrain 。並且查詢到起終點對應的所有區間段。只要判斷這個從 RequestIds 中判斷是否所有的區間段都沒有購票 Id 即可。若都沒有，則說明可以購買。如果有任何一段上已有購票 Id，則說明已經無法購買了。

舉例來說，當前 Stations 的情況是 10，11，12，13. 而 RequestIds 是 0，1，0。

那麼，如果要購買 10->12 的車票，則不行，因為 RequestIds 第二個區間已經被購買。

但是，如果要購買 10->11 的車票，則可以，因為 RequestIds 第一個區間還無人購買。

##### 購買

將起終點對應在 RequestIds 中所有的區間段設置上購票 Id 即可。

##### 單元測試用例

可以通過以下連結來查看關於以上演算法的代碼實現：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/blob/master/src/Newbe.Claptrap.Ticketing/Newbe.Claptrap.Ticketing.Actors.Tests/TicketingTest.cs)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/blob/master/src/Newbe.Claptrap.Ticketing/Newbe.Claptrap.Ticketing.Actors.Tests/TicketingTest.cs)

#### 將同一車次上的所有座位的餘票情況設計為一個 Claptrap - TrainGran

該 Claptrap 的 State 包含有一些基本資訊

| 類型                                               | 名稱        | 说明                                                                                   |
| ------------------------------------------------ | --------- | ------------------------------------------------------------------------------------ |
| IReadOnlyList&lt;int&gt;             | Stations  | 途徑車站的 id 清單，開頭為始發站，結尾為終點站。主查詢時進行驗證。                                                  |
| IDictionary&lt;StationTuple, int&gt; | SeatCount | 關鍵屬性。StationTuple 表示一個起終點。集合包含了所有可能的起終點的餘票情況。例如，根據上文，如果該車次經過 34 個地點，則該字典包含有 561 個鍵值對 |

基於以上的數據結構，只需要在每次 SeatGrain 完成下單後，將對應的資訊同步到該 Grain 即可。

例如，假如 a，c 發生了一次購票，則將 a，c / a，b / b，c 的餘票都減一即可。

這裡可以藉助本框架內置的 Minion 機制來實現。

值得一提的是，這是一個比"最小競爭資源"大的設計。因為查詢場景在該業務場景中不需要絕對的快速。這樣設計可以減少系統的複雜度。

## 小結

本篇，我們通過業務分析，得出了火車票餘票管理和 Newbe.Claptrap 的結合點。

後續我們將圍繞本篇的設計，說明如何進行開發、測試和部署。

實際上，專案源碼已經構建完畢，讀者可以從以下地址獲取：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples)

特別感謝[wangjunjx8868](https://github.com/wangjunjx8868)採用 Blazor 為本樣例製作的介面。

<!-- md Footer-Newbe-Claptrap.md -->
