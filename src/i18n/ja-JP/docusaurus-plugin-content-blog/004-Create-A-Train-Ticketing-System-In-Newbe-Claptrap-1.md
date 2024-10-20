---
date: 2020-07-20
title: 簡単な列車チケットシステム、Newbe.Claptrapフレームワークユースケース、最初のステップ - ビジネス分析を構築します
---

Newbe.Claptrap フレームワークは、同時実行の問題を解決するビジネス システムに最適です。列車のチケット販売システムは、非常に典型的なシナリオのユースケースです。

このシリーズでは、Newbe.Claptrap フレームワークを使用して簡単な列車チケット システムを構築する方法について、ビジネス、コード、テスト、および展開の側面から順を追って説明します。

<!-- more -->

## 自慢は、最初にドラフトをヒット

まず、この単純な列車の発券システムに必要なビジネス境界とパフォーマンス要件を定義します。

### ビジネス境界

このシステムには、チケットの残券管理部分のみが含まれています。つまり、残りの座席を照会し、チケットを購入し、座席を減らします。

注文情報の生成、支払い、フロー制御、要求風制御などは、この議論の範囲外です。

### ビジネスユースケース

- 残券を照会し、2つの駅間で利用可能な車両数と残りの座席数を照会することができます。
- チケットの残券を照会し、特定のチケットを照会し、各駅の間に残っている座席の数を確認できます。
- 座席指定をサポートし、お客様は特定の座席と座席を選択し、チケットを購入することができます。

### パフォーマンス要件

- 残りのチケットと注文されたチケットの平均消費は、平均 20 ms を超えてはなしません。この時間には、サービス側の処理時間、つまりページ ネットワーク転送、ページ レンダリングなどが含まれますが、フレームワークの関心事項は計算されません。
- 残りのチケット クエリには遅延がありますが、5 秒以上は存在しません。遅延は、チケットが照会される可能性があるが、注文がチケットなしで許可されている場合を示します。

## 難しい分析

### チケット管理

列車のチケット管理の難しさは、実際には、残りのチケット在庫の特殊性です。

SKU を最小単位とし、各 SKU は互いに独立し、互いに影響しない一般的な電子ビジネス商品です。

例：現在、サイバータンの惑星から1万発のアームストロング・サイクロン・サイクロン・アクセラレーション・キャノンを販売しています。その後、ユーザーは、赤と白の在庫がそれぞれ売り過ぎではない限り、注文を注文します。彼らの間には関係がない。

しかし、列車のチケットの残りのチケットは、販売されたチケットの終点によって影響を受けるため、異なります。ここでは、単純な論理モデルを組み合わせて、この特殊性を詳しく説明します。

ここで、a、b、c、d の 4 つのサイトをそれぞれ通過する 1 つの車両が存在すると仮定し、同時に、車両に 1 つの座席しきがあると仮定して、シナリオを簡略化します。

そして、誰もチケットを購入する前に、このチケットの残りの部分は次のようになります：

| 始点と終点 | 残券 |
| ----- | -- |
| a,b   | 1  |
| a,c   | 1  |
| a,d   | 1  |
| b,c   | 1  |
| b,d   | 1  |
| c,d   | 1  |

現在、a,c のチケットを購入している顧客がある場合。座席が1つしいので、c、d以外の残りのチケットはありません。残りのチケットは次のようになります：

| 始点と終点 | 残券 |
| ----- | -- |
| a,b   | 0  |
| a,c   | 0  |
| a,d   | 0  |
| b,c   | 0  |
| b,d   | 0  |
| c,d   | 1  |

より明確にすると、顧客がフルチケットa,dを購入した場合、残りのチケットはすべて0になります。なぜなら、この席はいつも乗客が座っているから。

これは、列車のチケットの特殊性です：同じ列車の同じ座席で、各始点と終点の残券の数は、販売されたチケットの始点と終点によって影響を受けます。

少し伸ばすと、同じ車の異なる座席の間にそのような影響がないことを簡単に引き出すことができます。

### 残券照会

前のセクションで説明したように、残りのチケットの在庫の特殊性のために。同じチケット a、b、c、d の場合、6 つの可能なチケットオプションがあります。

また、選択したカテゴリ数の計算方法は、実際には n 個のサイトで 2 つの組み合わせ数 (c(n,2) を選択することです。

34 のサイトを通過する車両がある場合、可能な組み合わせは c (34,2) = 561 です。

存在する可能性のある複数のクエリに効率的に対処する方法も、システムが解決する必要がある問題です。

## クラプトラックの論理設計

アクタ モードは、同時実行の問題を解決するのに生まれながらのデザイン パターンです。この考え方に基づく Newbe.Claptrap フレームワークは、当然、上記の困難にも対処できます。

### 最小競合リソース

多スレッドプログラミングにおける「資源競争」の概念を例にとり、ここでは、ビジネスシステムにおける「最小競合資源」の概念を提案する。この概念を使用すると、Newbe.Claptrap の設計ポイントを適用する方法を簡単に見つけることができます。

例えば、筆者がアブストロング・サイクロン・アクセラレーション・キャノンを販売した例では、同じ色の下の各商品は「最小競争資源」です。

ここでは、同じ色のすべての商品が「最小競合リソース」であることを意味しません。なぜなら、1万の商品に番号を付ければ、商品1と2をスナップし、それ自体が競争関係を持つからである。したがって、各商品は最小の競争リソースです。

列車のチケットの残りのチケットの場合、最小競合リソースは：同じ列車の同じ座席です。

前述したように,同じ乗り回りの同じ座席は,異なる始点と終点を選択する際に,残券の場合と競合関係にある.具体的には、例えば、著者はa,cのチケットを購入したいが、読者はa,bのチケットを購入したい。その後、我々は競争関係を持っているし、我々はこの「最小競争リソース」を購入するために成功することができる唯一の人を持っています。

ここでは、著者が使用できると思ういくつかの例があります：

- シングル エンド ログオンのみを許可するビジネス システムでは、1 人のユーザーのログイン チケットが最小競合リソースです
- 1 つの構成システムでは、各構成項目は最小競合リソースです
- 株式取引市場では、すべての買い注文または売り注文は最小の競争リソースです

> これは、著者自身の作詞であり、他の資料を参照していない、同様の情報や名詞は、コンテンツを証明することができる場合、また、読者が説明を残すことができます願っています。

### Claptrap との最小競合リソース

「最小競合リソース」と呼ばれるのは、Claptrap の State を設計する際に、最小競合リソースを区別することがシステム設計の重要な基礎となるためです。

ここでは、Claptrap の state：**最小競合リソース" の範囲以上である必要があるという著者の結論を示します。**

アブストロング旋回加速砲の例と組み合わせると、同じ色のすべての商品が同じクラプトラックのステート(最小競合リソースよりも大きい)で設計されている場合。Claptrap が基づいているアクタ モードは要求を処理するためにキューに入れられるため、異なるユーザーが商品を購入すると相互に影響します。つまり、各商品が 10 ms を処理する必要があると仮定すると、すべての購入要求を処理するには、最速で 10000 \* 10 ms が必要です。ただし、各商品に番号が付けされている場合、各商品は個別の Claptrap の State として設計されています。そして、彼らは互いに関連していないので。すべての商品を販売するには、理論的にはわずか10msです。

つまり：**Claptrap の State が最小競合リソースの範囲より大きい場合、システムは正確性に問題はありませんが、パフォーマンスが低下する可能性があります。**

さらに、列車のチケット販売の例では、同じ列車の同じ座席が最小競合リソースであるため、この事業体を Claptrap のステートとして設計できます。しかし、設計範囲がこれよりも小さい場合はどうなりますか?

たとえば：Claptrap の State を、同じ車両で同じ座席で異なる始点と終点の残券として設計しました。「分散システムにおけるデータの正確性を：」という従来の問題が生まれます。この点について、筆者は「ClaptrapのStateが最小競合：**資源の範囲を下回ると、Claptrap間の関係が扱いにくくなり、リスクがある」と結論づけただけである。**

### クラプトトラックのボディデザイン

次に、上記の理論を組み合わせる。私たちは直接設計をドロップします。

![Train Ticketing System Design](/images/20200720-001.png)

#### 同じバスの各座席を1つのClaptrap - SeatGrainとして設計します

Claptrap の State には、基本的な情報が含まれています

| 型                                      | 名前         | 説明                                                                                                  |
| -------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| IList&lt;int&gt;           | Stations   | 始発駅から始点、終点で終わるパスステーションの id リスト。主要なチケット購入時に検証します。                                                    |
| Dictionary&lt;int, int&gt; | StationDic | ルート ステーション ID のインデックス逆ディクショナリ。Stations は、クエリを高速化するために対応する id-index のディクショナリである index-id のリストです。     |
| List&lt;string&gt;         | RequestIds | 重要なプロパティ。各区間で、購入されたチケットのチケット ID。たとえば、index が 0 の場合、駅 0 から駅 1 へのチケット ID を表します。空白の場合、サブスクリプションはありません。 |

このデータ構造の設計により、2 つのビジネスを実現できます。

##### 購入できることを確認します

2 つのステーション ID を渡して、この SeatGrain に属しているかどうかを照会できます。また,始点から終点に対応するすべての区間を問い合わせる.この RequestIds から、すべての区間にチケット Id がないかどうかを判断すればよい.そうでない場合は、購入することができます。チケット ID が既にある段落がある場合は、もう購入できません。

たとえば、現在の Stations の場合は 10,11,12,13 です。 RequestIds は 0,1,0 です。

さて、10->12のチケットを購入する場合、RequestIdsの2番目の区間はすでに購入されています。

ただし、10->11 のチケットを購入する場合は、RequestIds の最初の区間はまだ購入されていないので、問題はありません。

##### 購入

始点と終点を RequestIds 内のすべての区間に対応してチケット Id を購入すればよい.

##### テスト ケースを単位として使用します

上記のアルゴリズムのコード実装については、次のリンクを参照してください：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples/blob/master/src/Newbe.Claptrap.Ticketing/Newbe.Claptrap.Ticketing.Actors.Tests/TicketingTest.cs)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples/blob/master/src/Newbe.Claptrap.Ticketing/Newbe.Claptrap.Ticketing.Actors.Tests/TicketingTest.cs)

#### 同じバスのすべての座席の残券を1つのクプトラック-TrainGranとして設計します

Claptrap の State には、いくつかの基本的な情報が含まれています

| 型                                                | 名前        | 説明                                                                                                                                |
| ------------------------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------- |
| IReadOnlyList&lt;int&gt;             | Stations  | 始発駅から始点、終点で終わるパスステーションの id リスト。メイン クエリで検証します。                                                                                     |
| IDictionary&lt;StationTuple, int&gt; | SeatCount | 重要なプロパティ。StationTuple は始点と終点を表します。コレクションには、すべての可能な始点と終点の残りのチケットが含まれています。たとえば、上記のように、車両が 34 か所を通過する場合、ディクショナリには 561 のキーと値のペアが含まれます |

上記のデータ構造に基づいて、SeatGrain が注文を完了するたびに、対応する情報をその Grain に同期するだけで済みます。

たとえば、a,c でチケットが 1 回購入された場合、a,c/ a,b / b,c の残りのチケットを 1 つ減らします。

これは、このフレームワークに組み込まれている Minion メカニズムを使用して実現できます。

これは「最小競合リソース」よりも大きな設計であることを言及する価値があります。クエリ シナリオは、そのビジネス シナリオで絶対に高速である必要はありません。これにより、システムの複雑さが軽減されます。

## 小さな結び目

この記事では、ビジネス分析を通じて、列車のチケット残高管理と Newbe.Claptrap の結合点を導き出します。

その後、この記事の設計を中心に、開発、テスト、および展開の方法について説明します。

実際には、プロジェクトのソースが構築され、読者は次のアドレスから：

- [Github](https://github.com/newbe36524/Newbe.Claptrap.Examples)
- [Gitee](https://gitee.com/yks/Newbe.Claptrap.Examples)

特に[wangjunjx8868](https://github.com/wangjunjx8868)Blazor がこのサンプル用に作成したインターフェイスを使用します。

<!-- md Footer-Newbe-Claptrap.md -->
