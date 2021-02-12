---
date: 2020-06-18
title: 十萬同時在線使用者，需要多少記憶體？ ——Newbe.Claptrap框架水平擴展實驗
---

Newbe.Claptrap 專案是筆者正在構建以`反應式`、`Actor模式`和`事件溯源`為理論基礎的一套服務端開發框架。本篇我們將來瞭解一下框架在水平擴展方面的能力。

<!-- more -->

## 前情提要

時隔許久，今日我們再次見面。首先介紹一下過往的項目情況：

[第一次接觸本框架的讀者，可以先點擊此處閱讀本框架相關的基礎理論和工作原理。](001-Overview-Of-Newbe-Claptrap)

日前，我們也編寫了一些預熱文章和工具，讀者可以通過以下連結進行瞭解：

- [談反應式程式設計在服務端中的應用，資料庫操作優化，從 20 秒到 0.5 秒](008-Reactive-In-Server-1)
- [Newbe.Claptrap 專案週報 1-還沒輪影，先用輪跑](006-Newbe-Claptrap-Weekly-1)

## 今日主題

今天，我們來做一套實驗預演，來驗證 Newbe.Claptrap 框架，如何通過水準擴展的形式來適應逐漸增長的同時在線用戶數。

## 業務需求說明

先看看今天要實現的業務場景：

- 用戶透過 API 登入後生成一個 JWT token
- 用戶調用 API 時驗證 JWT token 的有效性
- 沒有使用常規的 JWS 公私鑰方式進行 JWT token 頒發，而是為每個使用者單獨使用 secret 進行哈希驗證
- 驗證看不同的在線使用者需要消耗的記憶體情況
- 使用者登錄到生成 token 所消耗時間不得超過 200 ms
- tokn 的驗證耗時不得超過 10 ms

### 吹牛先打草稿

筆者沒有搜索到於「在線用戶數」直接相關的理論定義，因此，為了避免各位的理解存在差異。筆者先按照自己的理解來點明：在線用戶數到底意味著什麼樣的技術要求？

#### 未在線使用者若上線，不應該受到已在線用戶數的影響

如果一個用戶登錄上線需要消耗 100 ms。那麼不論當前在線的用戶數是十人還是百萬人。這個登錄上線所消耗的時間都不會明顯的超過 100 ms。

當然，有限的物理硬體肯定會使得，當在線用戶數超過一個閾值（例如兩百萬）時，新用戶登錄上線會變慢甚至出錯。

但是，增加物理機器就能提高這個閾值，我們就可以認為水準擴展設計是成功的。

#### 對於任意一個已在線使用者，得到的系統性能反饋應當相同

例如已在線的用戶查詢自己的訂單詳情，需要消耗 100 ms。那麼當前任何一個用戶進行訂單查詢的平均消耗都應該穩定在 100 ms。

當然，這裡需要排除類似於"搶購"這種高集中性能問題。此處主要還是討論日常穩定的容量增加。（我們以後會另外討論"搶購"這種問題）

具體一點可以這樣理解。假設我們做的是一個雲筆記產品。

那麼，如果增加物理機器就能增加同時使用雲端筆記產品的用戶數，而且不犧牲任何一個使用者的性能體驗，我們就認為水準擴展設計是成功的。

在此次的實驗中，若使用者已經登錄，則驗證 JWT 有效性的時長大約為 0.5 ms。

## 調用時序關係

![Timing diagram](/images/20200621-001.png)

簡要說明：

1. 用戶端發起登錄請求將會逐層傳達到 UserGrain 中
2. UserGrain 將會在內部啟動一個 Claptrap 來進行維持 UserGrain 中的狀態數據。包括使用者名、密碼和用於 JWT 簽署的 Secret。
3. 隨後的生成 JWT 生成和驗證都將直接使用 UserGrain 中的數據。由於 UserGrain 中的數據是在一段時間內是「緩存」 在記憶體中的。所以之後的 JWT 生成和驗證將非常快速。實測約為 0.5 ms。

## 物理結構設計

![物理結構設計](/images/20200618-001.png)

如上圖所示，便是此次進行測試的物理元件：

| 名稱                  | 说明                                                            |
| ------------------- | ------------------------------------------------------------- |
| WebAPI              | 公開給外部調用 WebAPI 介面。提供登錄和驗證 token 的介面。                          |
| Orleans Cluster     | 託管 Grain 的核心進程.                                               |
| Orleans Gateway     | 於 Orleans Cluster 基本相同，但是 WebAPI 只能與 Gateway 進行通訊             |
| Orleans Dashboard   | 於 Orleans Gateway 基本相同，但增加了 Dashboard 的展示，以查看整個 Orleans 集群的情況 |
| Consul              | 用於 Orleans 集群的集群發現和維護                                         |
| Claptrap DB         | 用於保存 Newbe.Claptrap 框架的事件和狀態數據                                |
| Influx DB & Grafana | 用於監控 Newbe.Claptrap 相關的性能指標數據                                 |

此次實驗的 Orleans 集群節點的數量實際上是 Cluster + Gateway + Dashboard 的總數。以上的劃分實際上是由於功能設定的不同而進行的區分。

此次測試「水平擴展」特性的物理節點主要是 Orleans Cluster 和 Orleans Gateway 兩個部分。將會分別測試以下這些情況的記憶體使用方式。

| Orleans Dashboard | Orleans Gateway | Orleans Cluster |
| ----------------- | --------------- | --------------- |
| 1                 | 0               | 0               |
| 1                 | 1               | 1               |
| 1                 | 3               | 5               |

此次實驗採用的是 Windows Docker Desktop 結合 WSL 2 進行的部署測試。

以上的物理結構實際上是按照最為此次實驗最為複雜的情況設計的。實際上，如果業務場景足夠簡單，該物理結構可以進行裁剪。詳細可以查看下文"常見問題解答"中的說明。

## 實際測試數據

以下，分別對不同的集群規模和用戶數量進行測試

### 0 Gateway 0 Cluster

默認情況下，剛剛啟動 Dashboard 節點時，通過 portainer 可以查看 container 佔用的記憶體約為 200 MB 左右，如下圖所示：

![初始記憶體佔用](/images/20200621-002.png)

通過測試主控台，向 WebAPI 發出 30，000 次請求。每批 100 個請求，分批發送。

經過約兩分鐘的等待后，再次查看記憶體情況，約為 9.2 GB，如下圖所示：

![三萬使用者](/images/20200621-003.png)

因此，我們簡單的估算每個在線使用者需要消耗的記憶體情況約為 （9.2\*1024-200）/30000 = 0.3 MB。

另外，可以查看一些輔助資料：

CPU 使用方式

![CPU使用方式](/images/20200621-004.png)

網路輸送量

![網路輸送量](/images/20200621-005.png)

Orleans Dashboard 情況。左上角的 TOTAL ACTIVATIONS 中 30，000 即表示當前記憶體中存在的 UserGrain 數量，另外的 3 個為 Dashboard 使用的 Grain。

![Orleans Dashboard 情況](/images/20200621-006.png)

Grafana 中查看 Newbe.Claptrap 的事件平均處理時長約為 100-600 ms。此次測試的主要是記憶體情況，處理時長的採集時間為 30s 一次，因此樣本數並不多。關於處理時長我們將在後續的文章中進行詳細測試。

![時間平均處理時長](/images/20200621-007.png)

Grafana 中查看 Newbe.Claptrap 的事件的保存花費的平均時長約為 50-200 ms。事件的保存時長是事件處理的主要部分。

![三萬使用者](/images/20200621-009.png)

Grafana 中查看 Newbe.Claptrap 的事件已處理總數。一種登錄了三萬次，因此事件總數也是三萬。

![事件處理的總數](/images/20200621-008.png)

### 1 Gateway 1 Cluster

接下來，我們測試額外增加兩個節點進行測試。

還是再提一下，Orleans 集群節點的數量實際上是 Cluster + Gateway + Dashboard 的總數。因此，對比上一個測試，該測試的節點數為 3。

測試得到的記憶體使用方式如下：

| 用戶數   | 節點平均記憶體 | 記憶體總佔用             |
| ----- | ------- | ------------------ |
| 10000 | 1.8 GB  | 1.8\*3 = 5.4 GB  |
| 20000 | 3.3 GB  | 3.3\*3 = 9.9 GB  |
| 30000 | 4.9 GB  | 4.9\*3 = 14.7 GB |

那麼，以三萬使用者為例，平均每個使用者佔用的記憶體約為 （14.7\*1024-200\*3）/30000 = 0.48 MB

為什麼節點數增加了，平均消耗記憶體上升了呢？筆者推測，沒有進行過驗證：節點增加，實際上節點之間的通訊還需要消耗額外的記憶體，因此平均來說有所增加。

### 3 Gateway 5 Cluster

我們再次增加節點。總結點數為 1 （dashboard） + 3 （cluster） + 5 （gateway） = 9 節點

測試得到的記憶體使用方式如下：

| 用戶數   | 節點平均記憶體 | 記憶體總佔用             |
| ----- | ------- | ------------------ |
| 20000 | 1.6 GB  | 1.6\*9 = 14.4 GB |
| 30000 | 2 GB    | 2\*9 = 18 GB     |

那麼，以三萬使用者為例，平均每個使用者佔用的記憶體約為 （18\*1024-200\*9）/30000 = 0.55 MB

### 十萬使用者究竟要多少記憶體？

以上所有的測試都是以三萬為用戶數進行的測試，這是一個特殊的數位。因為繼續增加用戶數的話，記憶體將會超出測試機的記憶體餘量。（求贊助兩條 16G）

如果繼續增加用戶數，將會開始使用作業系統的虛擬記憶體。雖然可以運行，但是運行效率會降低。原來登錄可能只需要 100 ms。使用到虛擬記憶體的使用者則需要 2 s。

因此，速度降低的情況下，在驗證需要多少記憶體意義可能不大。

但是，這不意味著不能夠繼續登錄，以下便是 1+1+1 的情況下，十萬使用者全部登錄后的情況。（有十萬用戶同時在線，加點記憶體吧，不差錢了。)

![十萬使用者](/images/20200621-010.png)

## 源碼構建說明

此次測試的代碼均可以在文末的樣例代碼庫中找到。為了方便讀者自行實驗，主要採用的是 docker-compose 進行構建和部署。

因此對於測試機的唯一環境需求就是要正確的安裝好 Docker Desktop 。

可以從以下任一位址取得最新的樣例代碼：

- <https://github.com/newbe36524/Newbe.Claptrap.Examples>
- <https://gitee.com/yks/Newbe.Claptrap.Examples>

### 快速啟動

使用主控台進入 `src/Newbe.Claptrap.Auth/LocalCluster` 資料夾。執行以下指令便可以在本地啟動所有的元件：

```
docker-compose up -d
```

途中需要拉取一些託管於 Dockerhub 上的公共鏡像，請確保本地已經正確配置了相關的加速器，以便您可以快速構建。[可以參看這篇文件進行設定](https://www.runoob.com/docker/docker-mirror-acceleration.html)

成功啟動之後可以通過`docker ps` 查看到所有的元件。

```bash
PS>docker ps
CONTAINER ID        IMAGE                                                                            COMMAND                  CREATED             STATUS              PORTS                                                                                                                              NAMES
66470e5393e2        registry.cn-hangzhou.aliyuncs.com/newbe36524/newbe-claptrap-auth-webapi          "dotnet Newbe.Claptr…"   4 hours ago         Up About an hour    0.0.0.0:10080->80/tcp                                                                                                              localcluster_webapi_1
3bbaf5538ab9        registry.cn-hangzhou.aliyuncs.com/newbe36524/newbe-claptrap-auth-backendserver   "dotnet Newbe.Claptr…"   4 hours ago         Up About an hour    80/tcp, 443/tcp, 0.0.0.0:19000->9000/tcp, 0.0.0.0:32785->11111/tcp, 0.0.0.0:32784->30000/tcp                                       localcluster_dashboard_1
3f60f51e4641        registry.cn-hangzhou.aliyuncs.com/newbe36524/newbe-claptrap-auth-backendserver   "dotnet Newbe.Claptr…"   4 hours ago         Up About an hour    80/tcp, 443/tcp, 9000/tcp, 0.0.0.0:32787->11111/tcp, 0.0.0.0:32786->30000/tcp                                                      localcluster_cluster_gateway_1
7d516ada2b26        registry.cn-hangzhou.aliyuncs.com/newbe36524/newbe-claptrap-auth-backendserver   "dotnet Newbe.Claptr…"   4 hours ago         Up About an hour    80/tcp, 443/tcp, 9000/tcp, 30000/tcp, 0.0.0.0:32788->11111/tcp                                                                     localcluster_cluster_core_1
fc89fcd973f9        grafana/grafana                                                                  "/run.sh"                4 hours ago         Up 6 seconds        0.0.0.0:23000->3000/tcp                                                                                                            localcluster_grafana_1
1f10ed0eb25f        postgres                                                                         "docker-entrypoint.s…"   4 hours ago         Up About an hour    0.0.0.0:32772->5432/tcp                                                                                                            localcluster_claptrap_db_1
d5d2bec74311        adminer                                                                          "entrypoint.sh docke…"   4 hours ago         Up About an hour    0.0.0.0:58080->8080/tcp                                                                                                            localcluster_adminer_1
4c4be69f2f41        bitnami/consul                                                                   "/opt/bitnami/script…"   4 hours ago         Up About an hour    8300-8301/tcp, 8500/tcp, 8301/udp, 8600/tcp, 8600/udp                                                                              localcluster_consulnode3_1
88811d3aa0d2        influxdb                                                                         "/entrypoint.sh infl…"   4 hours ago         Up 6 seconds        0.0.0.0:29086->8086/tcp                                                                                                            localcluster_influxdb_1
d31c73b62a47        bitnami/consul                                                                   "/opt/bitnami/script…"   4 hours ago         Up About an hour    8300-8301/tcp, 8500/tcp, 8301/udp, 8600/tcp, 8600/udp                                                                              localcluster_consulnode2_1
72d4273eba2c        bitnami/consul                                                                   "/opt/bitnami/script…"   4 hours ago         Up About an hour    0.0.0.0:8300-8301->8300-8301/tcp, 0.0.0.0:8500->8500/tcp, 0.0.0.0:8301->8301/udp, 0.0.0.0:8600->8600/tcp, 0.0.0.0:8600->8600/udp   localcluster_consulnode1_1
```

啟動完成之後，便可以通過以下連結來查看相關的介面

| 位址                       | 说明                                     |
| ------------------------ | -------------------------------------- |
| <http://localhost:19000> | Orleans Dashboard 查看 Orleans 集群中各節點的狀態 |
| <http://localhost:10080> | Web API 基位址，此次使用所測試的 API 基位址           |
| <http://localhost:23000> | Grafana 位址，查看 Newbe.Claptrap 相關的性能指標情況 |

### 源碼構建

使用主控台進入 `src/Newbe.Claptrap.Auth` 資料夾。執行以下指令便可以在本地完成代碼的建構：

```bash
./LocalCluster/pullimage.cmd
docker-compose build
```

等待構建完畢之後，本地便生成好了相關的鏡像。接下來便可以初次嘗試在本地啟動應用：

使用主控台進入 `src/Newbe.Claptrap.Auth/LocalCluster` 資料夾。執行以下指令便可以啟動相關的容器：

```bash
docker-compose up -d
```

## 常見問題解答

### 文中為何沒有說明代碼和配置的細節？

本文主要為讀者展示該方案的實驗可行性，具體應該如何應用 Newbe.Claptrap 框架編寫代碼，並非本文的主旨，因此沒有提及。

當然，另外一點就是目前框架沒有最終定版，所有內容都有可能發生變化，講解代碼細節意義不大。

但可以提前說明的是：編寫非常簡單，由於本樣例的業務需求非常簡單，因此代碼內容也不多。全部都可以在示例倉庫中找到。

### 用 Redis 儲存 Token 也可以實現上面的需求，為什麼要選擇這個框架？

目前來說，筆者沒有十足的理由說服讀者必須使用哪種方案，此處也只是提供一種可行方案，至於實際應該選擇哪種方案，應該有讀者自己來考量，畢竟工具是否趁手還是需要試試才知道。

### 如果是最多 100 個在線使用者，那怎麼裁剪系統？

必要的元件只有 Orleans Dashboard 、 WebAPI 和 Claptrap Db。其他的元件全部都是非必要的。而且如果修改代碼， Orleans Dashboard 和 WebAPI 是可以合併的。

所以最小規模就是一個進程加一個資料庫。

### Grafana 為什麼沒有報表？

Grafana 首次啟動之後需要手動的創建 DataSource 和導入 Dashboard.

本實驗相關的參數如下：

DataSource

- URL： http://influxdb:8086
- Database： metricsdatabase
- User： claptrap
- Password： claptrap

[點擊此處獲取 Dashboard 定義檔](https://github.com/newbe36524/Newbe.Claptrap/blob/develop/src/Docker/Monitor/grafana/claptrap.json)

### 測試機的物理配置是什麼？

沒有專門騰記憶體，未開始測試前已佔用 16GB 記憶體。以下是測試機的身材數據（洋垃圾，3500 元左右）：

處理器 英特爾 Xeon（至強） E5-2678 v3 @ 2.50GHz 12 核 24 線程 主機板 HUANANZHI X99-AD3 GAMING （ Wellsburg ） 顯卡 Nvidia GeForce GTX 750 Ti （ 2 GB / Nvidia ） 記憶體 32 GB （ 三星 DDR3L 1600MHz ） 2013 年產 高齡記憶體 主硬碟 金士頓 SA400S37240G （ 240 GB / 固態硬碟 ）

如果您有更好的物理配置，相信可以得出更加優秀的數據。

### 即使是 0.3 MB 平均每使用者的佔用的我也覺得太高了

框架還在優化。未來會更好。

<!-- md Footer-Newbe-Claptrap.md -->
