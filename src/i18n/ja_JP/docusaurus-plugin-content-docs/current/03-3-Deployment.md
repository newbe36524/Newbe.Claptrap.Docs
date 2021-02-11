---
title: 'デプロイする'
description: '電車の切符号 - 配備'
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

## 個別デプロイ

tarball はソースコードがローカルマシンガン環境で使用することも可能です。以下の手順に従ってすぐに実行します。

1. お使いのローカルがインストールされている docker の環境が適切に設定されていることを確認し、git も docker-compose / git を使用できます。
2. 以下はプロジェクトソースコード [https://github.com/newbe365/Newbe.Claptrap.Examples](https://github.com/newbe36524/Newbe.Claptrap.Examples)
3. src/Newbe.Claptrap.Ticketing フォルダーに docker-compose build コマンドが実行され、プロジェクトのビルド・コンパイル
4. src/Newbe.Claptrap.Ticketing/docker/Docker/LocalClusterSQLiteフォルダを実行してすべてのサービスを起動する
5. ブラウザでインターフェイスを開けるには `http://localhost:10080` にアクセスしてください。

まとめると スクリプトは、以下のように：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-compose build
cd Docker/LocalClusterSQLite
docker-compose up -d
```

上記の手順は、データベースのSQLite で動く方法です。ソースライブラリは様々な種類のデプロイパターンを含んでいますが、それぞれ異なるフォルダで up.cmd を実行するには：

| フォルダ                | 説明                       |
| ------------------- | ------------------------ |
| LocalClusterMongodb | MongoDb マルチタッチバランサーバージョン |
| LocalClusterSQLite  | SQLiteノードのバージョン          |
| Tencent             | “オンライン 体験”によって展開されたバージョン |

> - 現在中国本土で、netcore イメージの読み込みに問題がある場合、[docker-mcr](https://github.com/newbe36524/Newbe.McrMirror) を使用することが出来ます
> - 開発者はテストを行うために[PWD](https://labs.play-with-docker.com/)を選択します。
> - 配付用モードの間に変数が変更されてから、docker-compose downで最新のデプロイをオフにすることに注意してください
> - これはデプロファイラモードごとに異なる方法に依存し、docker-compose.ymlの設定を参照してください
