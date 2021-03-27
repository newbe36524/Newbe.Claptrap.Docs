---
date: 2020-08-16
title: 年輕的樵夫哟，你掉的是這個免費8核4G公網伺服器，還是這個隨時可用的Docker實驗平臺？
---

小孩子才做選擇，成年人全都要。那麼我們現在就來看看如何獲得一台免費的 8 核 4G 公網 Docker 實驗平台伺服器。

<!-- more -->

## Play With Docker

直接打開<https://labs.play-with-docker.com/>即可訪問 Play With Docker 平臺。 註冊一個 DockerHub 帳號便可以訪問這個網站，輕鬆地獲得一台 8 核 4G 的公網伺服器。 接下來我們就來瞭解一下如何使用這台伺服器進行一些 Docker 的操作。

## 部署 Nginx

本示例，我們部署一個 nginx ，並且通過將服務公開在一個公網位址上。

### 登錄並創建實例

這一步非常簡單，不多說明，成功創建完成之後便可以看到如下所示的介面。

![操作介面](/images/20200816-001.png)

### 拉取鏡像

運行以下命令，便可以拉取最新的 nginx 鏡像。

```bash
docker pull nginx
```

拉取速度非常快速，因為這個實例節點是部署在國外的，因此無需設置鏡像也可以極速下載。

### 啟動 nginx 容器

運行以下命令，便可以啟動一個 nginx container

```bash
docker run --name nginx-test -p 8080:80 -d nginx
```

### 公網訪問

部署完成之後，介面上會自動出現一個新的按鈕，表示當前可以已經部署成功的公網位址，如下圖所示：

![公網訪問的按鈕](/images/20200816-002.png)

點擊按鈕便可以在瀏覽器中訪問剛剛部署成功的 nginx 服務。

如果生成按鈕，也可以點擊"OPEN PORT"來選擇開放的埠。

## 部署火車票售票系統

如果只是部署一個簡單的 nginx 顯然不夠快樂。因此，我來部署一個稍微複雜一點的系統。

這是一個由 7 個容器構成的演示系統，參考[《火車票售票系統-部署》](https://claptrap.newbe.pro/zh_Hans/3-Sample/1-Newbe-Claptrap-Ticketing/3-Deployment)的說明，運行以下命令來啟動一個類比的火車票售票系統：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-compose build
cd Docker/LocalClusterMongodb
docker-compose up -d
```

文本運行完成之後，通過"OPEN PORT"打開 10080 連接埠，便可以查看剛剛部署完成的火車票類比售票系統。 ![類比售票系統介面](/images/20200816-003.png)

<!-- md Footer-Newbe-Claptrap.md -->
