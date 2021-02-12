---
title: '部署'
description: '火車售票系統-部署'
---


<!--
## 在线体验

该样例已经被部署在 <http://ticketing.newbe.pro> 网站上。

### 限时开放（还在备案）

由于运营成本的原因，该系统仅在以下特定的时段开放：

| 日期   | 时段        |
| ------ | ----------- |
| 工作日 | 12:00-14:00 |
| 工作日 | 20:00-22:00 |
| 周末   | 19:00-23:00 |

每次重新开放时，系统将会被重置，上一次开放的所有数据将被清空。

#### swagger 文档

为了更有效的抢票，开发者可以根据 swagger 文档给出的 API 开发自动抢票工具。文档地址<http://ticketing.newbe.pro/swagger> -->

## 獨立部署

開發者也可以使用源碼在本地的 docker 環境進行獨立部署。只需要按照以下的步驟進行操作即可。

1. 確保本地已經正確安裝了 docker 環境，並且能夠使用 docker-compose / git
2. 簽出專案來源 <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. 在 src/Newbe.Claptrap.Ticketing 資料夾運行 docker-compose build 命令來完成專案編譯
4. 在 src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLite 資料夾運行 docker-compose up -d 來啟動所有服務
5. 訪問 `http://localhost:10080` 即可打開介面。

總結起來，腳本如下：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-compose build
cd Docker/LocalClusterSQLite
docker-compose up -d
```

以上步驟是運行以 SQLite 為資料庫的方法，程式庫中還包含了其他若干種部署模式，只需要分別運行不同資料夾中的 up.cmd 即可：

| 資料夾                 | 说明                |
| ------------------- | ----------------- |
| LocalClusterMongodb | MongoDb 多節點負載均衡版本 |
| LocalClusterSQLite  | SQLite 單節點版本      |
| Tencent             | "線上體驗"中部署的版本      |

> - 如果您當前正在中國大陸，並且遇到下載 netcore 鏡像緩慢的問題，可以嘗試使用[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
> - 開發者也可以選擇[PWD](https://labs.play-with-docker.com/)上部署該進行測試
> - 在不同部署模式間切換是，注意先運行 docker-compose down 來關閉上一次部署
> - 不同部署模式的 Web 連接埠可能不同，具體需要查看 docker-compose.yml 中的設定
