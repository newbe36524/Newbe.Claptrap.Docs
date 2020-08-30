---
title: '展開します。'
metaTitle: '列車のチケットシステム - 展開。'
metaDescription: '列車のチケットシステム - 展開。'
---

> [現在表示されているバージョンは、機械が簡体字中国語から翻訳され、手動校正の結果です。ドキュメントに不適切な翻訳がある場合は、こちらをクリックして翻訳提案を提出してください。](https://crwd.in/newbeclaptrap)


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

1. docker 環境がローカルに正しくインストールされ、docker-compose / git を使用できることを確認します。
2. プロジェクト ソース <https://github.com/newbe36524/Newbe.Claptrap.Examples>をチェックアウトする
3. src/Newbe.Claptrap.Ticketing フォルダーで docker-compose build コマンドを実行して、プロジェクトのコンパイルを完了します。
4. src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLiteフォルダーでdocker-compose up-dを実行して、すべてのサービスを開始する。
5. `http://localhost:10080` にアクセスしてインターフェイスを開きます。

总结起来，脚本如下：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-compose build
cd docker/LocalClusterSQLite
docker-compose up -d。
```

以上步骤是运行以 SQLite 为数据库的方法，代码库中还包含了其他若干种部署模式，只需要分别运行不同文件夹中的 up.cmd 即可：

| 文件夹                 | 说明                |
| ------------------- | ----------------- |
| LocalClusterMongodb | MongoDb 多节点负载均衡版本 |
| LocalClusterSQLite  | SQLite 单节点版本      |
| Tencent             | “在线体验”中部署的版本      |

> - 現在中国本土で、netcore ミラーのダウンロードが遅い問題が発生した場合は、[docker-mcr を使用して](https://github.com/newbe36524/Newbe.McrMirror)
> - 開発者は、[PWD](https://labs.play-with-docker.com/)にテストを展開することもできます。
> - 異なる展開モード間で切り替えるには、最初に docker-compose down を実行して最後のデプロイを閉じるように注意してください。
> - Web ポートは、デプロイ モードによって異なる場合があり、docker-compose.yml の設定を確認する必要があります。
