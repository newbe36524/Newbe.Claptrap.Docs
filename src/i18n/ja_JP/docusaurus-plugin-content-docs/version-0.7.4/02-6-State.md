---
title: 'ステータス（State）'
description: 'ステータス（State）'
---

State はActor のオブジェクトの現在のデータ表現を表します。Claptrap では、このイベントのみを更新するだけで：「state はイベントへの全てのバックログのアップデート」でありました。イベントソースに依存する基盤は信頼性が高く、クラプトレイプでは他のモデルも信頼性が向上していた。

## ステージのビルド番号

Claptrap の state に Version プロパティが存在し、state は現在のバージョンを示しています。バージョン番号は、0 から始まる自己増分です。イベントの処理をするたびに増分します。

バージョン番号は、0 の state です。Claptrap の初期stateであり、創造のstate としても知られています。初期状態は、ビジネス ニーズに合わせて変更することができます。

クラップとMinion はバージョン番号で区別される区別があります。

Claptrap は Claptrap はイベントのプロデューサーであり、イベント号のバージョンコード自体が Claptrap によって許可されている。例えば、一日のうち，以下の場合に発生します：

1. State Verison = 10000
2. Event on = State Version + 1 = 1001 の Version を処理します。
3. Event 処理完了、State Version = 1001 を更新

Minion の場合は Claptrap イベントの購入者のようですそのため、バージョンの処理は少し異なる。たとえば，親イベントを処理する際，次のイベントは順で起きます：

1. State Verison = 10000
2. Event Version 1001 イベントを読んだ時
3. Event 処理完了、State Version = 1001 を更新

State のバージョン番号とEvent ビルド番号が相互依存し、相互認証はイベントの順序であることを意味する。State が成功したときにビルド番号とEvent ビルド番号が一致しない場合は深刻な問題となります。バージョン番号の不一致, そしてふたつのみ：

1. 永続化レイヤーに問題が発生しています
2. フレームワークのごろつき BUG

## ICON

![claptrap](/images/claptrap_icons/state.svg)
