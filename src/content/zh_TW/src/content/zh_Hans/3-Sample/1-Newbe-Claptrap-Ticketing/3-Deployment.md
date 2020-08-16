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

1. 确保本地已经正确安装了 docker 环境，并且能够使用 docker-compose / git
2. 簽出專案來源 <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. 在 src/Newbe.Claptrap.Ticketing 文件夹运行 docker-compose build 命令来完成项目编译
4. 在 src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLite 文件夹运行 docker-compose up -d 来启动所有服务
5. 訪問 `http://localhost:10080` 即可打開介面。

总结起来，脚本如下：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-compose build
cd Docker/LocalClusterSQLite
docker-compose up -d
```

以上步骤是运行以 SQLite 为数据库的方法，代码库中还包含了其他若干种部署模式，只需要分别运行不同文件夹中的 up.cmd 即可：

| 文件夹                 | 说明                |
| ------------------- | ----------------- |
| LocalClusterMongodb | MongoDb 多节点负载均衡版本 |
| LocalClusterSQLite  | SQLite 单节点版本      |
| Tencent             | “在线体验”中部署的版本      |

> - 如果您当前正在中国大陆，并且遇到下载 netcore 镜像缓慢的问题，可以尝试使用[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror)
> - 开发者也可以选择[PWD](https://labs.play-with-docker.com/)上部署该进行测试
> - 在不同部署模式间切换是，注意先运行 docker-compose down 来关闭上一次部署
> - 不同部署模式的 Web 端口可能不同，具体需要查看 docker-compose.yml 中的设置
