# a11yツール集

light-houseのチェックツールから、a11yを担保したパーツのテンプレートを用意するリポジトリです。

## 初回起動方法

```bash
# プロジェクトルートに移動して
. ./init.sh
```

## 通常起動方法

```bash
docker compose up -d
```

## Biome 実行

biome の実行はコンテナではなくホストマシン側で行うため、ホストマシン側にパッケージをインストールします。
以下のコマンドでフォーマット・静的検査を行います

```bash
npm run format
```

## ブラウザ

https://liff.line.me/2006520503-YQw3l2WK

## 追加したライブラリ

- LIFF 認証
  - [@line/liff](https://www.npmjs.com/package/@line/liff)
- scss
  - [scss](https://www.npmjs.com/package/sass)

## ディレクトリ構成

- [参考](https://www.notion.so/bulletgroup/Next-af4ff735fc8c48f28817307ed976664b?pvs=4#6480213f22da47ed930000e801b2ab35)
