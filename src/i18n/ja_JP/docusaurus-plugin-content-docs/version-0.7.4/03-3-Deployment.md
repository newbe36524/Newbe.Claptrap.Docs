---
title: '展開します'
description: '列車発券システム - 展開'
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

## スタンドアロン展開

開発者は、ソース コードを使用して、オンプレミスの docker 環境で個別にデプロイできます。次の手順に従うだけで済みます。

1. docker 環境がローカルに正しくインストールされ、docker-compose / git を使用していることを確認します
2. プロジェクト ソースをチェックアウトします <https://github.com/newbe36524/Newbe.Claptrap.Examples>
3. src/Newbe.Claptrap.Ticketing フォルダで docker-compose build コマンドを実行して、プロジェクトのコンパイルを完了します
4. src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLite フォルダで docker-compose up -d を実行して、すべてのサービスを開始します
5. `http://localhost:10080` にアクセスしてインターフェイスを開きます。

要約すると、スクリプトは次のようになります：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-compose build
cd Docker/LocalClusterSQLite
docker-compose up -d
```

上記の手順は、SQLite をデータベースとして実行する方法であり、コード ベースには、異なるフォルダ内の up.cmd を実行するだけで実行できる他のいくつかの展開モードが含まれています：

| フォルダ                | 説明                              |
| ------------------- | ------------------------------- |
| LocalClusterMongodb | MongoDb マルチノード ロード バランシング バージョン |
| LocalClusterSQLite  | SQLite 単一ノード バージョン              |
| Tencent             | オンライン エクスペリエンスにデプロイされたバージョン     |

> - 現在中国本土にいて、netcore イメージのダウンロードが遅い場合は、[docker-mcr を使用して](https://github.com/newbe36524/Newbe.McrMirror)
> - 開発者は、[PWD](https://labs.play-with-docker.com/)にテストを展開するオプションがあります
> - 異なる展開モードを切り替えるには、docker-compose down を実行して最後の展開を閉じてください
> - Web ポートは、docker-compose.yml の設定を確認する必要がある展開モードによって異なる場合があります
