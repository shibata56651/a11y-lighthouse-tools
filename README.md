# SI Next.js LIFF Template

## これは何か

SI 事業部で Next を使った LINE ミニアプリ開発の雛形となるテンプレートです。

## 事前準備

サーバー証明書を発行するために[mkcert](https://formulae.brew.sh/formula/mkcert)を導入します。
※開発サーバで LIFF 認証を行うために https で立ち上げる必要があります。

- Mac の場合

  1. [Homebrew](https://brew.sh/ja/)をインストールしていない場合はインストールしてください。
  2. プロジェクトルートに移動し

  ```bash
  brew install mkcert
  mkcert -install
  mkdir app/certificates
  cd app/certificates
  mkcert localhost
  ```

- Windows の場合
  1. PowerShell を起動します。
  2. プロジェクトルートに移動し
  ```bash
  choco install mkcert
  mkcert -install
  mkdir app/certificates
  cd app/certificates
  mkcert localhost
  ```

## LIFF 関連

https://developers.line.biz/console/channel/2006520503
こちらのチャネルを利用します。

- NEXT_PUBLIC_LIFF_ID に該当チャネルの LIFF ID を設定してください。

  ```env
  NEXT_PUBLIC_LIFF_ID={ここに設定}
  NEXT_PUBLIC_APP_ENV=local
  ```

- 権限設定より `Tester` 権限が付与されていることを確認します。
- バックエンド側の環境変数 `LINE_CHANNEL_ID` に該当のチャネル ID が設定されていることを確認します。

## 空コミット設定

設定を行っていない方はこちらの設定を行ってください。
[auto-empty-commit](https://github.com/si-bullbase/auto-empty-commit)

## 初回起動方法

```bash
# プロジェクトルートに移動して
. ./init.sh
```

## 通常起動方法

```bash
docker compose up -d
```

## Biome実行
biomeの実行はコンテナではなくホストマシン側で行うため、ホストマシン側にパッケージをインストールします。
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
