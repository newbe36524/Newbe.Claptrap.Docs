---
title: 'Claptrap ライフサイクル (Claptrap Lifetime Scope)'
description: 'Claptrap ライフサイクル (Claptrap Lifetime Scope)'
---


Claptrap ライフサイクルは、著者の見解に従って、ランタイム ライフサイクルとデザイン時ライフサイクルの 2 つのカテゴリに：づいて説明されています。

## ランタイム のライフ サイクル

ランタイム ライフサイクルとは、Claptrap システムが実行中にメモリ内の個々のオブジェクトのライフサイクル動作を指します。たとえば：Web システムでは、通常、各 Web 要求は 1 つのライフサイクルとして割り当てられますが、Claptrap システムにも同様のライフサイクル設計があります。これらのライフサイクルは、開発者がコンポーネントを拡張したり、ビジネス開発を行ったりする上で大きな影響を与えます。Claptrap フレームワークのランタイム ライフサイクルは、：プロセス レベル (Process)、Claptrap レベル、およびイベント プロセッサ レベル (Event Handler) に分類されます。

プロセス レベル。プロセス レベルのライフ サイクルのオブジェクトとして設計され、通常の意味でのシングルケース オブジェクトです。実行中の各 Claptrap プロセスには、独自のシングルサインオン オブジェクトがあります。通常、Claptrap フレームワークでは、永続層へのイベントの書き込み速度を向上させるために、各永続層ターゲットはバッチ プロセッサ (Batch Event Saver) に対応します。プロセス全体のライフ サイクルを通じて、対応する永続層に 1 対 1 で対応するインスタンスが 1 つだけあるため、永続層にイベントをマージして書き込みパフォーマンスを向上させることができます。一般に、プロセス レベルのライフサイクルのオブジェクトは、次の特性の 1 つ以上を持：

1. プロセスのライフ サイクルを通じて 1 回だけ実行する必要があるロジックまたはコード。通常、Lazy とシングルケースの方法で実装できます。
2. プロセスのライフ サイクル全体で必要なオブジェクトは 1 つだけです。たとえば、Claptrap Design Store、Claptrap Options などです。
3. プロセスのライフ サイクル全体を通じて 1 つのオブジェクトのみを持つ必要があります。たとえば、Orleans Client などです。

Claptrap レベル。Claptrap レベルのライフサイクルのオブジェクトは、Claptrap のアクティブ化に伴って作成され、Claptrap の不活性化とともに解放されます。これらのオブジェクトは、通常、Claptrap Identity と強く関連付けられます。たとえば、Claptrap Identity に関連付けられている Claptrap Design、Event Saver、Event Loader、State Saver、State Loader などです。

イベント プロセッサ レベル (Event Handler)。イベント プロセッサ レベルのライフサイクル オブジェクトは、イベント プロセッサの作成時に作成され、イベント プロセッサが解放されると解放されます。Web に対応する場合、このレベルのライフサイクルは Web 要求のライフ サイクルに似ています。一般的に、統合データベース トランザクションの作業単位 (Unit of Work) はこのレベルです。

## デザイン時のライフ サイクル

デザイン時ライフサイクルとは、Claptrap に対応するビジネス オブジェクトのライフ サイクルを指します。これは、プログラムが実行されているかどうか、またはプログラムを使用するかどうかとは無関係です。具体的な例として、従来の電子ビジネス システムの注文を示します。注文のアクティブなビジネス時間制限は、通常、3 ~ 6 か月を超えはありません。この制限時間を超えた場合、注文のデータは変更できません。ここでは、この "3 ~ 6 か月" の期間を注文の設計時ライフサイクルと呼ばれます。Claptrap システムでは、オブジェクトがデザイン時のライフ サイクルを超えた場合、"ビジネス上、この Claptrap をアクティブにする必要はありません" と表示されます。これにより,以下の推論が得られる：

1. Claptrap が保存したイベントは意味を失い、イベントを削除すると空き領域が解放されます。
2. Claptrap のビジネス コードはメンテナンスが不要で、参照を削除するか、コードを削除するかを選択できます。

したがって、Claptrap の設計時ライフサイクルが短いほど、リソースのフットプリントとコード保守コストが削減され、ストレージ コストと保守が困難になります。したがって、Claptrap システムを設計する場合、設計時のライフ サイクルが短くなる傾向があります。そして、この名詞は、実際には完全に「デザイン」によって決定される直接反応します。 次に、一般的なデザイン時ライフサイクル分割をいくつか挙げる。

### ビジネス境界の分割

これは、最も一般的な分割です。ドメイン モデリングの要件に基づいてビジネス オブジェクトを分割します。また、これらのビジネス オブジェクトには、通常、一定のライフ サイクルがあります。前述の「注文」は、ビジネス境界に従ってライフサイクルを分割する一般的な例です。この方法を使用して分割する場合、Claptrap が "最小競合リソース範囲以上" の基本要件を満たしていることを確認するだけで十分です。開発者は、「列車のチケットシステム」の例を通して、この分割を体験することができます。

### 条件付き境界分割

一般に、ビジネス境界に基づく分割は、合理的なライフ サイクルを分割することができます。ただし、ビジネス境界だけで分割すると、デザイン時のライフ サイクルが永続的なオブジェクトとして表示される場合があります。これらのオブジェクトには、非常に集中的なイベント アクションがある場合。その後、生成されるイベントの量は例外的に多になります。そのために、設計時のライフサイクルを短縮する人間制御アプローチを導入しています。この分割は、特定の条件に基づいて行されます。したがって,条件付き境界分割法と呼ぶ.そして、ここで最も古典的なのは、「時間制限」を使用して分割されています。

ここでは、クイック スタートの例のショッピング カート オブジェクトを使用して、この分割方法を説明します。第 1 に、ショッピング カートはユーザーに関連するオブジェクトであり、ユーザーがシステムに存在する限り、アクティブ化される可能性があります。したがって、関連するイベントを削除するには、ショッピング カート データの正確性を確保するために永続的に保存する必要があります。しかし、1 年前にショッピング カートで発生したイベントについて、もう気にしていない場合。個々のユーザーのショッピング カートを年ごとに手動で分割できます。同時に、隣接する2つの年のショッピングカートに「ステータスコピー」を行うことができます。これにより、前年度の状態データが継続され、ユーザーのショッピング カートがビジネスに影響を与えなく、デザイン時のライフ サイクルが短くなります。この時間ベースの設計時のライフサイクル分割は、中国の古典的な伝説的な物語「愚か者移動」によって理解することができます。物語の中で、愚か者は人間であり、長生きすることはできませんが(短い設計時間ライフサイクル)、愚か者の精神(長い設計時間ライフサイクル)は、将来の世代とともに継続し、したがって、山を移動する偉業を達成することができます。「愚か者」の世代が変わったとき、上記の「状態コピー」(精神的な継続)が起こります。これにより、設計時ライフサイクルが短くなり、設計時ライフサイクルの要件が長くなり、永続的になります。

> 「愚公移山」 太行、王屋の2つの山は、700マイル、高さ7、8千フィートで、もともと黄河の北岸の南にある。 北山の下には、90歳近くで山の真向かいに住んでいる愚公という男がいました。彼は山の北の閉塞に苦しんで、中に入ると、彼は家族全員を招集し、「私は、道路が南のYuzhouに通じ、漢水の南岸に到達するために、険しい山を掘るために最善を尽くします」と、家族全員に相談しました：賛同が相次いた。彼の妻は疑問を提起し、「：あなたの力によって、クイの父でさえ、この丘を平らにできない、太行、王屋はどうですか?また、土や石はどこに掘られたのですか? 群衆は「：の端に投げ込み、地球の北に隠します」と言いました。 だから、愚か者は、山に登り、石を掘って、土を掘って、ボーハイの端にトンボで運んだ3人の子供や孫を率いました。隣人の北京の未亡人は孤児で、7歳か8歳で、彼を助けるために飛び跳ねていました。冬と夏は季節が変わり、往復は1回のみ。 河曲の智は愚か者を笑い、彼がこのことをするのを止めて、「あなたは：愚かだ」と言った。あなたの残りの年によって、残りの力は山の草の1つでも動かないし、土の石をいかがでもいかがですか。 「北山愚公はため息をつきました：あなたの心は頑固で、孤児の未亡人でさえ、決して知らないほど頑固です。私が死んでも、息子は孫を産み、孫は息子を産み、息子と息子は孫を産む。 河曲智は答えなし。 蛇を握った山神は、彼が天帝に報告するために、それを掘り起こすのを恐れて、それについて聞きました。天帝は愚か者の誠実さに感動し、ヘラクレス・クォーシュの2人の息子に2つの山を背負わせ、1つはシャンシャンの東、1つはシャンゾウの南に置きました。この時から、長州南部から漢水の南岸まで、山は妨げられない。
