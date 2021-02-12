---
date: 2020-08-16
title: 若い未亡人よ、あなたはこの無料の8コア4Gパブリックネットワークサーバー、またはこのすぐに利用可能なDocker実験プラットフォームを落としましたか?
---

小さな子供だけが選択をし、大人は必要です。次に、無料の 8 コア 4G パブリック Web Docker 実験プラットフォーム サーバーを取得する方法を見てみましょう。

<!-- more -->

## Play With Docker

Play With Docker プラットフォームにアクセスするには、<https://labs.play-with-docker.com/>を直接開きます。 DockerHub アカウントを登録すると、サイトにアクセスし、8 コア 4G のパブリック ネットワーク サーバーを簡単に取得できます。 次に、このサーバーを使用して Docker の操作を行う方法について説明します。

## Nginx をデプロイします

この例では、nginx を展開し、サービスをパブリック ネットワーク アドレスに公開します。

### ログインしてインスタンスを作成します

この手順は非常に単純で、あまり説明しませんが、作成が正常に完了すると、次のようなインターフェイスが表示されます。

![操作インターフェイス](/images/20200816-001.png)

### ミラーをプルします

次のコマンドを実行すると、最新の nginx イメージをプルできます。

```bash
docker pull nginx
```

プルは、このインスタンス ノードが海外に展開されるため、ミラーを設定することなくダウンロードできるため、非常に高速です。

### nginx コンテナを起動します

次のコマンドを実行すると、nginx container を起動できます

```bash
docker run --name nginx-test -p 8080:80 -d nginx
```

### パブリック ネットワーク アクセス

展開が完了すると、次の図に示すように、現在展開に成功したパブリック ネットワーク アドレスを示す新しいボタンがインターフェイスに自動的に表示されます：

![パブリック ネットワーク アクセスのボタン](/images/20200816-002.png)

ボタンをクリックすると、展開が成功したばかりの nginx サービスにブラウザーからアクセスできます。

ボタンを生成する場合は、「OPEN PORT」をタップしてオープンポートを選択することもできます。

## 列車のチケット販売システムを展開

単純な nginx を展開するだけの場合は、明らかに十分に幸せではありません。そこで、もう少し複雑なシステムを展開します。

これは、[「列車チケットシステム - 展開」](https://claptrap.newbe.pro/zh_Hans/3-Sample/1-Newbe-Claptrap-Ticketing/3-Deployment)の説明を参照して、シミュレートされた列車チケットシステムを起動するために次のコマンドを実行する7つのコンテナのデモシステムです：

```bash
git clone https://github.com/newbe36524/Newbe.Claptrap.Examples.git
cd Newbe.Claptrap.Examples/src/Newbe.Claptrap.Ticketing
docker-compose build
cd Docker/LocalClusterMongodb
docker-compose up -d
```

スクリプトの実行が完了したら、OPEN PORT を使用して 10080 ポートを開き、展開された列車のチケット シミュレーション チケット システムを確認できます。 ![チケット販売システムのインターフェイスをシミュレートします](/images/20200816-003.png)

<!-- md Footer-Newbe-Claptrap.md -->
