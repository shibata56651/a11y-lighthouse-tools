# A11y Lighthouse Tools

アクセシビリティとパフォーマンスの監査を行うためのLighthouse Chrome拡張機能です。

## 概要

このプロジェクトは、WebサイトのLighthouse監査をChrome DevTools拡張機能として実行できるツールです。従来のサーバーベースのアプローチから、完全にクライアントサイドで動作するChrome拡張機能に移行しました。

## 主な機能

- 🚀 **複数URL一括監査**: 複数のURLを同時に監査
- 📊 **Core Web Vitals**: FCP、LCP、CLS、SI、TBTの詳細分析
- 💡 **インサイト**: パフォーマンス改善のための具体的な提案
- 🔧 **診断**: SEO、アクセシビリティ、最適化の問題点と解決策
- 📁 **結果エクスポート**: JSON形式での監査結果の保存
- 🇯🇵 **日本語対応**: すべてのUIと説明が日本語

## インストール

詳細なインストール手順は [`lighthouse-chrome-extension/INSTALL.md`](./lighthouse-chrome-extension/INSTALL.md) をご覧ください。

### 簡単な手順

1. Chrome ブラウザで `chrome://extensions/` を開く
2. 「デベロッパーモード」を有効にする
3. 「パッケージ化されていない拡張機能を読み込む」をクリック
4. `lighthouse-chrome-extension` フォルダを選択

## 使用方法

1. Chrome DevToolsを開く（F12キー）
2. 「Lighthouse Audit」タブを選択
3. 監査したいURLを入力
4. 「評価開始」ボタンをクリック
5. 結果を確認し、必要に応じてエクスポート

## プロジェクト構造

```
├── lighthouse-chrome-extension/    # Chrome拡張機能のメインコード
│   ├── manifest.json              # 拡張機能の設定
│   ├── background.js              # バックグラウンドスクリプト
│   ├── devtools.html              # DevToolsエントリーポイント
│   ├── panel.html                 # 監査パネルのUI
│   ├── panel.js                   # パネルのロジック
│   ├── audit-script.js            # 監査実行スクリプト
│   └── README.md                  # 拡張機能の詳細ドキュメント
└── .github/workflows/             # CI/CD設定
    └── build.yml                  # Chrome拡張機能のビルド・検証
```

## 技術仕様

- **Manifest V3**: 最新のChrome拡張機能仕様に対応
- **DevTools Integration**: Chrome DevToolsパネルとして動作
- **Performance API**: 現代的なWebパフォーマンス測定API使用
- **CSP Compliant**: Content Security Policyに完全準拠

## 監査項目

### Performance（パフォーマンス）
- ページ読み込み時間の最適化
- Core Web Vitalsの詳細分析
- リソースサイズと数の評価

### SEO
- メタタグの存在確認
- 構造化データの評価
- アクセシビリティ基本要素

### PWA
- Progressive Web Appとしての機能評価
- Service Worker、マニフェストファイルの確認

## 貢献

プロジェクトへの貢献を歓迎します！

1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. Pull Requestを作成

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。