---
title: '展開します。'
metaTitle: '列車のチケットシステム - 展開。'
metaDescription: '列車のチケットシステム - 展開。'
---

> [現在表示されているバージョンは、機械が簡体字中国語から翻訳され、手動校正の結果です。ドキュメントに不適切な翻訳がある場合は、こちらをクリックして翻訳提案を提出してください。](https://crwd.in/newbeclaptrap)

## オンライン体験。

このサンプルは、 <http://ticketing.newbe.pro> Web サイトに展開されています。

### 限时开放（还在备案）

運用コストにより、システムは次の特定の時間帯にのみ開：

| 日付。  | 期間。          |
| ---- | ------------ |
| 稼働日。 | 12:00-14:00。 |
| 稼働日。 | 20:00-22:00。 |
| 週末。  | 19:00-23:00。 |

再開するたびに、システムはリセットされ、最後に開いたすべてのデータが空になります。

#### swagger ドキュメント。

より効果的なチケット奪取のために、開発者はswaggerドキュメントで与えられたAPIに基づいて自動チケットグラブツールを開発することができます。ドキュメント アドレス<http://ticketing.newbe.pro/swagger>

## スタンドアロン展開。

開発者は、ソースコードを使用して、ローカルの docker 環境でスタンドアロン展開することもできます。次の手順に従う必要があります。

1. docker 環境がローカルに正しくインストールされ、docker-compose / git を使用できることを確認します。
2. プロジェクト ソース <https://github.com/newbe36524/Newbe.Claptrap.Examples>をチェックアウトする
3. src/Newbe.Claptrap.Ticketing フォルダーで docker-compose build コマンドを実行して、プロジェクトのコンパイルを完了します。
4. src/Newbe.Claptrap.Ticketing/Docker/LocalClusterSQLiteフォルダーでdocker-compose up-dを実行して、すべてのサービスを開始する。
5. `http://localhost:10080` にアクセスしてインターフェイスを開きます。

まとめると、スクリプトは次の：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-compose build
cd docker/LocalClusterSQLite
docker-compose up -d。
```

上記の手順は、SQLite をデータベースとして実行する方法であり、コード ベースには、異なるフォルダ内の up.cmd を個別に実行するだけで、他のいくつかの展開モードが含まれています：

| フォルダ。                | 説明。                              |
| -------------------- | -------------------------------- |
| LocalClusterMongodb. | MongoDb マルチノード ロード バランシング バージョン。 |
| LocalClusterSQLite。  | SQLite 単一ノード バージョン。              |
| テンセン                 | オンライン エクスペリエンスで展開されたバージョン。       |

> - 現在中国本土で、netcore ミラーのダウンロードが遅い問題が発生した場合は、[docker-mcr を使用して](https://github.com/newbe36524/Newbe.McrMirror)
> - 開発者は、[PWD](https://labs.play-with-docker.com/)にテストを展開することもできます。
> - 異なる展開モード間で切り替えるには、最初に docker-compose down を実行して最後のデプロイを閉じるように注意してください。
> - Web ポートは、デプロイ モードによって異なる場合があり、docker-compose.yml の設定を確認する必要があります。
