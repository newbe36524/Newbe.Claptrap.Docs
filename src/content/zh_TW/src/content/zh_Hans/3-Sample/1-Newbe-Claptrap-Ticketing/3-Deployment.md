---
title: '部署。'
metaTitle: '火車售票系統-部署。'
metaDescription: '火車售票系統-部署。'
---

> [當前查看的版本是由機器翻譯自簡體中文,並進行人工校對的結果。若文檔中存在任何翻譯不當的地方,歡迎點擊此處提交您的翻譯建議。](https://crwd.in/newbeclaptrap)


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

## 独立部署

开发者也可以使用源码在本地的 docker 环境进行独立部署。只需要按照以下的步骤进行操作即可。

1. 確保本地已經正確安裝了 docker 環境,並且能夠使用 docker-compose / git。
2. 簽出專案來源 <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. 在 src/Newbe.Claptrap.Ticketing 資料夾運行 docker-compose build 命令來完成專案編譯。
4. 在 src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLite 資料夾運行 docker-compose up -d 來啟動所有服務。
5. 訪問 `http://localhost:10080` 即可打開介面。

总结起来，脚本如下：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-compose build
cd Docker/LocalClusterSQLite
docker-compose up -d。
```

以上步骤是运行以 SQLite 为数据库的方法，代码库中还包含了其他若干种部署模式，只需要分别运行不同文件夹中的 up.cmd 即可：

| 文件夹                 | 说明                |
| ------------------- | ----------------- |
| LocalClusterMongodb | MongoDb 多节点负载均衡版本 |
| LocalClusterSQLite  | SQLite 单节点版本      |
| Tencent             | “在线体验”中部署的版本      |

> - 如果您當前正在中國大陸,並且遇到下載 netcore 鏡像緩慢的問題,可以嘗試使用[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
> - 開發者也可以選擇[PWD](https://labs.play-with-docker.com/)上部署該進行測試。
> - 在不同部署模式間切換是,注意先運行 docker-compose down 來關閉上一次部署。
> - 不同部署模式的 Web 連接埠可能不同,具體需要查看 docker-compose.yml 中的設定。
