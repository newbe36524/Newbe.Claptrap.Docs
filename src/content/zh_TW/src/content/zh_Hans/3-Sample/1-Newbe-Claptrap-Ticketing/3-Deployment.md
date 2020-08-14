---
title: '部署。'
metaTitle: '火車售票系統-部署。'
metaDescription: '火車售票系統-部署。'
---

> [當前查看的版本是由機器翻譯自簡體中文,並進行人工校對的結果。若文檔中存在任何翻譯不當的地方,歡迎點擊此處提交您的翻譯建議。](https://crwd.in/newbeclaptrap)

## 在線體驗。

該樣例已經被部署在 <http://ticketing.newbe.pro> 網站上。

### 限時開放。

由於運營成本的原因,該系統僅在以下特定的時段開放：

| 日期。  | 時段。          |
| ---- | ------------ |
| 工作日。 | 12:00-14:00。 |
| 工作日。 | 20:00-22:00。 |
| 週末。  | 19:00-23:00。 |

每次重新開放時,系統將會被重置,上一次開放的所有數據將被清空。

#### swagger 文檔。

為了更有效的搶票,開發者可以根據 swagger 文檔給出的 API 開發自動搶票工具。文件位址<http://ticketing.newbe.pro/swagger>

## 獨立部署。

開發者也可以使用源碼在本地的 docker 環境進行獨立部署。只需要按照以下的步驟進行操作即可。

1. 確保本地已經正確安裝了 docker 環境,並且能夠使用 docker-compose。
2. 簽出專案來源 <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. 在 `src/Newbe.Claptrap.Ticketing` 資料夾運行 `docker-compose build` 命令來完成專案編譯。
4. 在`src/Newbe.Claptrap.Ticketing/LocalCluster` 資料夾運行 `docker-compose up -d` 來啟動所有服務。
5. 訪問 `http://localhost:10080` 即可打開介面。

> 如果您當前正在中國大陸,並且遇到下載 netcore 鏡像緩慢的問題,可以嘗試使用[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
