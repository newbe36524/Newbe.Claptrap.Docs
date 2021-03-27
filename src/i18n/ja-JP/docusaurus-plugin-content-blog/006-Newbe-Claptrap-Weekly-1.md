---
date: 2019-03-08
title: Newbe.Claptrapプロジェクトウィークレポート1 - まだ回転していない、最初のラウンドで実行します
---

Newbe.Claptrap プロジェクト 週報 1、最初の週のコードは少し書きました。しかし、主に理論的な実現可能性を考慮します。

<!-- more -->

## 週刊紙は?

オープンソースの成功は、コミュニティ貢献者の積極的な参加なしには成り立たない。新しい車輪プロジェクトとして、プロジェクトの共同創設者である月落は、その：

「私は、あなたのコード能力があまりよくないことを知っています、そして、あなたは毎週あなたの考えを明確にします。他の人にプロジェクトの価値を見せてください。より多くの人々がプロジェクトの価値を発見するのを待っている間、それは自然に、プロジェクトの開発に関与している場合でも、より多くの注意を与えます。だから、毎週来週の新聞を書くつがあります。週刊紙は、プロジェクトの概念と、プロジェクトを通じて実際の問題を解決する方法に焦点を当てるのが最善です。もちろん、プロジェクトの設計方法に関するいくつかのコンテンツを含めることができますが、適度に注意を払う必要があり、通常、プロジェクトの実装方法にあまり注意を払わないです。そして、プロジェクトがもたらす価値にもっと注意を払います。プロジェクトは：価値が生み出された場合にのみ成功します。 ”

だから、私は週に1回しか来週の新聞を書かなかったので、かろうじて生活しています。

## ホイールは、ホイールのサンプルを持っています

新しいラウンドは、新しいラウンドの外観を持っている必要があり、このフレームワークに関連する基本的な理論と作業原理は、「プロジェクトオープン」で紹介されています。関連する理論的な内容は、新しい読者にとってより疎遠であるため、このセクションでは、読者の思い出を刺激するために、上記の最も重要な要素を次のようにリストします。

アクタ のプロパティ 1：アクタの状態は、アクタの外部呼び出しによって変更されます。

![アクタの状態を更新します](/images/20190226-001.gif)

アクタ のプロパティは 1：アクタの状態は外部と共有されません。

![アクタの状態を共有します](/images/20190226-003.gif)

アクタ の状態は、外部で読み取：アクタ プロパティの補完 2 です。

![アクタの状態を読み取ります](/images/20190226-002.gif)

アクタ機能 2：アクタは一度に 1 つの要求しか処理できる "シングル スレッド" で動作します。

![アクタを同時に呼び出します](/images/20190226-004.gif)

アクタ機能は 1 を補完します：読み取り状態は "シングル スレッド" ではない可能性があります。

![アクタを同時に読み取ります](/images/20190226-005.gif)

フレームワーク定義のアクタの種類である Claptrap：イベント モードを使用してイベントを生成し、イベントを通じて状態を変更するアクタ。

![Claptrap](/images/20190228-001.gif)

フレームワーク定義のアクタ・タイプであるMinion：Claptrapとは対照的に、Minionはイベントを生成するのではなく、対応するClaptrapのイベントを読み取って状態を変更します。1 つの Claptrap に対して複数の Minion が存在することを許可します。

![Minion](/images/20190228-002.gif)

Claptrap と Minion の協力を得て、"転送" ビジネスを完了します。

![Claptrap & Minion](/images/20190228-003.gif)

> 月落大塚名言警句 1：には "銀弾" は存在しない.フレームワークのセットは、すべての問題を解決しません。 月面着陸の有名なフレーズ 2：システム設計の変更によってビジネスの複雑さが軽減され、ある場所から別の場所に移動します。

## まだ回転していない、最初のラウンドで実行します

これで、Claptrap と Minion の概念が確立されました。次に、いくつかのビジネス シナリオを組み合わせて、フレームワークがさまざまなビジネス ニーズに対応できるかどうかを実験します。

> 美しい技術的手段は、実際の需要や変化に対処できない、それは技術的な花瓶です。 - サイバータムXII量子コンピュータ命令セットの月が落ちて終了しました

### ビジネス シナリオ

これは、単純な電子ビジネスシステムです：

1. 緑色の結晶を1種類だけ販売し、説明の便宜上、この商品を「許しの結晶」と名付けます。
2. ユーザーは、自分のアカウントの残高を使用して許しクリスタルを購入することができます。残高は、外部支払システムを介して再充電されます。リチャージセクションは、当分の間、ビジネスシナリオで考慮すべきではありません。
3. また、各ユーザーは、偶然にも、このポイントのアイコンも緑色なので、"許しポイント"という名前のポイントがあります。
4. 赦しポイントは、：ユーザー登録、他のユーザー登録の招待、招待されたユーザーによる消費、招待者へのアクセス、赦しのマイニング、現実への赦しなど、さまざまな方法で取得されます。
5. 赦しポイントは、許しクリスタルの購入時に支払う金額の一部を控除することができます。
6. 赦しポイントは、将来的に他の用途を持っている可能性が高いです。
7. 赦しの結晶を購入する支払い方法は、おそらくバランスと赦しポイント以上のものになります。

これは、この電子ビジネス システムの要件の一部です。需要は将来変わるに違いない。

### 要素の検出

最も重要なビジネス シナリオである電子ビジネス システムは、当然、商品の取引に関連するビジネス シナリオです。他の要件シナリオがどんなに複雑であっても、トランザクション関連のビジネス シナリオは、分析と解決の矢面に立つ必要があります。

まず、プログラムが実行する必要があるビジネス コンテンツを簡単な言葉で説明するシナリオ「ユーザー確認購入許しクリスタル」について説明します：

1. ユーザーの残高が十分かどうかを確認する必要があります
2. ユーザーがクレジット クレジットを選択した場合は、ユーザーのクレジットが十分かどうかを確認する必要があります
3. 在庫が十分かどうかを確認する必要があります
4. ユーザーの残高を差し引く必要があります
5. 在庫の控除が必要です
6. ユーザーがポイント控除を選択した場合は、ユーザーのクレジットを差し引く必要があります

これらの 6 つの重要なポイントがデータ テーブルを直接操作する場合、ほとんどの開発者にとって非常に簡単です。データベース トランザクションを開き、少なくとも行レベルのロックを取得し、データを確認および更新すると、このビジネスを完了できます。さて,本フレームワークを用いた実現は,「業務の複雑さが減らない」という基本的な事実から,同様に6つのポイントを実現する必要がある.

### 預言者不明

まず,根拠をあまり議論せずに,筆者は上記の主体概念を中心に,以下のClaptrap：

| 概念          | 英語で命名       | 略語 |
| ----------- | ----------- | -- |
| 結晶をお許しします   | SKU         | S  |
| ポイントをお許しします | UserPoint   | P  |
| ユーザー残高      | UserBalance | B  |

### 絵の輪に従う

前編の「送金」ビジネスシナリオのプロセス設計に従って、購入ロジックを同じ方法で設計します。次の図に示すように：

![チェーンデザイン](/images/20190307-001.gif)

この設計を分析します：

ビジネス ロジックの順序に従って、在庫チェック、在庫控除、残高チェック、残高控除、ポイント チェック、ポイント控除のビジネス ステップが完了しました。

注: Client と Claptrap S の間の呼び出し線が存在する時間は、最初に、つまり、クライアントが少し待機する必要がある場合にのみ応答できます。

Claptrap S が Minion S にイベントをプッシュすると、新しい要求への応答を続行できます。複数のユーザーが同時に商品を購入すると、商品が売り切れになりすぎないため、インシデントへの対応が十分に短くなります。

ビジネス ロジック全体への入り口は S で、ユーザーが在庫をロックして支払いを行うことを保証し、ユーザーが商品を購入する方法がないことを回避します。

形状上の理由から、この設計スキームは **チェーン デザイン (Chain-Like Design) という名前**。

### 同じ材料、同じ車輪

別の設計スキームがあります。次の図に示すように：

![ツリーデザイン](/images/20190307-002.gif)

この設計を分析します：

新しい Claptrap W (What a amazing that I get a forgiven-crystal) がビジネスへの入り口として導入され、この Claptrap W は他の Claptrap を呼び出してビジネス プロセスを実装します。

Minion S、P、B は、前のセクションの設計と比較して、Claptrap W によって既に制御されているビジネス フロー制御に関与しなくなった。

また,Minion Wの存在により,この設計案は部分呼び出しをMinionに引き渡すこともできるので,この方式は次の2つの形式とすることができる.

![ツリーデザイン](/images/20190307-003.gif)

![ツリーデザイン](/images/20190307-004.gif)

形状上の理由から、この設計スキームは **ツリー デザイン (Tree-Like Design) という名前**。

さて、ここで選択がなされ、選択肢がある今、ここでは「月ボスのソフトウェア開発小妙手三十二則」に記載されている「WhyNot比較分析法」を用いて、どの設計案を使用するかを決める：

| オプション    | なぜだ?                                                                                                                                              | なぜだ!!                                                                                                                                                                                                                                                                                                        |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| チェーンデザイン |                                                                                                                                                   | ビジネス フロー転送プロセスの制御は、密結合設計である Minion によって接続されます。これは、Minion と Claptrap がビジネスを運営するコンテキストに相当します。明らかな質問：顧客がポイントの支払いを選択したかどうか、このロジックは、Minion B または Claptrap P で判断されますが、どちらの方法でも実際には合理的ではありません。<br/>このような設計は、プロセスが失敗した場合に対処するのが特に困難です。たとえば、最後の手順で顧客がクレジットが不足している場合、段階的なロールバックが必要になる可能性があり、これは非常に困難になる可能性があります。 |
| ツリーデザイン  | この設計により、ビジネスのコア・プロセスは、コンテンツ・セット内の関連するClaptrap WとMinion Wのペアを制御します。これは、高いまとまりの表現です。<br/>設計シナリオに基づいて、Claptrap S、P、B に基づいてより複雑なプロセスを簡単に構築できます。 |                                                                                                                                                                                                                                                                                                              |

実際、読者は、この選択の WhyNot 比較分析テーブルが実際には一方にダウンしているのを見つけるのは簡単です。ここで明らかに、ツリーデザインを選択します。

> 「月ボスソフトウェア開発小妙手三十二則」は、月落大塚が日々の開発過程でソフトウェア開発過程に用いたいくつかの小さな方法の収集と要約である。これらの方法のほとんどは、新しく発明されたものではありません。月は、単にこれらの方法を収集し、後世を啓発するために、いくつかの問題を分析し、判断するために、いくつかの小さな方法で、時には物事を組織することができます。「WhyNot比較分析」に加えて、よりよく知られている「5W1H要件記述」、非常に単純な「CheckListメモ」、広く言及されている「アイゼンハワーの法則」などがあります。

> WhyNot比較分析法は,簡単に言えば,複数のエージェントを選択して並べて比較し,それぞれ「選択すべきでない」と「選択すべきでない」という理由を列挙し,総合的に判断して決定する方法である.これは、複数の人が特定の選択について議論する際に使用する方法に特に適しています。方法論の基礎には、「理由の重み測定」や「人の声の測定」など、いくつかの他のバリアントがあります。この方法は、「優劣比較法」や「異質対照法」などの比較法や、「確率選択法」や「経験的選択法」などの選択法とは一定の関係と区別があります。この方法の命名は、月落大塚の創始者といわれるが、文法梗塞である。中国語では、「なぜですか? 「このような逆質問文は、オブジェクトを選択する理由を示し、「なぜ!! 「この祈りの文は、オブジェクトを選択しない理由を示します。 WhyNot は、実際には "なぜ" という 4 つの単語の直訳です。

### 良いホイールの外観も見て良いです

WhyNot コントラスト分析を初めて見た読者は 疑問を抱く：チェーンデザインを選ぶ理由はありませんか?

WhyNot 比較分析は固定シーンの分析であるため、シーンが変更された場合、解析の結果も変化します。つまり、**特定のシナリオでは、チェーン設計に必要な**。

説明する前に、チェーン設計とツリー設計の関係を解釈する別のアプローチを：

- Claptrapと対応するMinionをマージします
- "のために... だから..."の構文は、グラフの実線呼び出しの代わりに使用されます

![チェーンデザイン](/images/20190307-001.gif)

上の図のチェーン設計と組み合わせると、：

- S なので、B
- B なので、P

展開のセマンティクスは：

- 在庫は購入のために差し引かれ、残高はさらに差し引かれます
- 購入により残高が差し引かれたため、ポイントをさらに差し引く必要があります

![ツリーデザイン](/images/20190307-002.gif)

上のツリー デザインは、次のように表現：

- Wなので、S
- Wのため、B
- Wのため、P

展開のセマンティクスは：

- 購入のため、在庫が差し引かされました
- 購入のため、残高が差し引かされました
- 購入のため、ポイントが差し引かになります

筆者がここで説明している内容があまり明確でなくても、読者は「購入のために残高が差し引かれたので、さらにポイントを減額する」という文は、実際には合理的ではなく、両者は実際には明らかな前因効果を持つべきではないと観察することができます。

これは、チェーン設計がこのシナリオでは適用できない理由です：両方の呼び出し関係に明確な前原因と結果がない場合、2 つの設計は前後の呼び出しのチェーン関係です。その後、おそらく不合理なデザインを取得します。

逆に、：**を適用する場合。両者の間には合理的な原因と結果が存在する必要があります。**

ただし、需要分析プロセスでは、現在存在する可能性のある原因と結果は、後ではあまり合理的ではない可能性があります。ビジネス シナリオの変化と要件の不完全な安定性により、ツリー設計の採用は、より多くの問題に対処できるという事実につながりいます。

読者は、前のビジネス シナリオに残っているいくつかの要件を設計できます。

また,読者はオープせ編で用いた「振込」シナリオの設計を再考し,木型設計を採用する方が適切であろう.

## 実際には、新しいホイールです

オープナプターでは、アクタモードとCRUDモードの単純な同一性を比較しました。そして、現在、より一般的に言及されている設計スキームの別のカテゴリがあります: "ドメイン駆動型設計"。

ドメイン駆動型設計の概念については、ここではあまり説明されませんが、このコンテンツになじみのない読者は、Microsoft MVP のトン・シュワ先生の記事[「ドメイン駆動型設計のドメイン モデル」を参照](http://www.cnblogs.com/netfocus/archive/2011/10/10/2204949.html)

さて,読者がドメイン駆動設計を理解したら,本編で前述したClaptrap W,S,P,Bを組み合わせる.おそらく、Claptrap S、P、B は集約ルートですか?たぶん、Claptrap Wはアプリケーション・サービスですか?著者は、アクタモードは、実際には、ドメイン駆動設計のさらなる遊びであると：

- ドメイン駆動型設計では、設計モデル内でビジネスの同時実行は考慮されませんが、同時実行プログラミング モデルのセットとしてのアクタ パターンは、実際にはこの部分の不足を補います。
- 大多数のドメイン駆動フレームワークは,「倉庫から集約根を復元し,操作終了後に保存する」という一般的なプロセスを採用している.Orleans を例にとると、アクタ フレームワークは、アクティブ化されたアクタを一定期間メモリに保持します。

一般に、読者はドメイン駆動型設計の考え方をモデル化し、元の集約ルートとアプリケーション サービスをアクタとして設計し、理論的には、アクタで実装できるかどうかを理論的に試すことができます。おそらく、読者はそこからいくつかの異なる経験を見つけることができます。

ただし、このフレームワークは Actor パターンとイベント トレーサビリティ パターンを採用しているため、設計手法はドメイン駆動型モデルとは継承され、まったく同じではなく、その後に適切な記事が整理されるその他の注意点があります。

## 結節

この記事では、ビジネス シナリオの設計を通じて、このフレームワークの理論的な概念を使用してビジネスを実現する方法を読者に理解し、理解してもらう必要があります。これには、いくつかの著者のフレーズが含まれているため、読者が理解するためにより多くの時間を費やす必要があります。

著者の限られた経験と豊富な業界知識の欠如のために、フレームワークの設計コンセプトが特定の業界特性と一致しているかどうかの問題は、正確な判断を与えるのではなく、読者のより多くの思考を必要とします。支援が必要な質問がある場合は、このプロジェクトチームにお問い合わせください。

これに興味を持っている友人は、プロジェクトに従い、プロジェクトに参加することを歓迎します。

<!-- md Footer-Newbe-Claptrap.md -->