# Lighthouse DevTools Extension

Chrome DevTools拡張機能として動作するLighthouse監査ツールです。複数のURLに対してパフォーマンス、SEO、PWAスコアを一括で測定できます。

## 機能

- **複数URL一括監査**: 複数のURLを入力して一度に監査実行
- **詳細メトリクス**: ロード時間、First Paint、リソース数などの詳細情報
- **結果エクスポート**: JSON形式での結果エクスポート
- **結果保存**: Chrome拡張のローカルストレージに結果を保存
- **DevTools統合**: Chrome DevToolsパネルとして動作

## インストール方法

1. Chrome ブラウザを開く
2. `chrome://extensions/` にアクセス
3. 右上の「デベロッパーモード」を有効にする
4. 「パッケージ化されていない拡張機能を読み込む」をクリック
5. この `chrome-extension` フォルダを選択

## 使用方法

1. Chrome DevToolsを開く（F12キー）
2. 「Lighthouse Audit」タブをクリック
3. 監査したいURLを入力（複数可）
4. 「Start Evaluation」ボタンをクリック
5. 結果を確認・エクスポート

## スコア詳細

### Performance（パフォーマンス）
- ページの読み込み速度を評価
- 100点満点でスコア化

### SEO
- 検索エンジン最適化の基本要素をチェック
- title、meta description、h1タグなどの存在確認

### PWA（Progressive Web App）
- PWAとしての機能をチェック
- Service Worker、マニフェストファイル、HTTPS対応など

## 技術仕様

- **Chrome Extensions Manifest V3**対応
- **Chrome DevTools Protocol**を使用した実際のページ解析
- **Performance API**によるメトリクス取得
- **Chrome Storage API**による結果保存

## 制限事項

- Chrome拡張機能なので、Chromeブラウザでのみ動作
- 一度に一つのタブでの監査実行
- 複雑なSPA等では一部メトリクスが正確でない場合があります

## 元のWebアプリケーションとの違い

- **サーバー不要**: 完全にクライアントサイドで動作
- **認証ページ対応**: ログイン済みページでも監査可能
- **無料運用**: 追加コストなし
- **DevTools統合**: 開発ワークフローに自然に組み込める