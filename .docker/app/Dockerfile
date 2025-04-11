# ✅ Node.js の公式イメージを使用
FROM node:22.13.1-bookworm

# ✅ Lighthouse CLI をグローバルにインストール
RUN npm install -g lighthouse

# ✅ Chrome 関連パッケージのインストール
RUN apt update && apt install -y wget curl gnupg2 ca-certificates dbus

# ✅ Chrome GPG キーとリポジトリの登録
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg && \
    chmod a+r /etc/apt/keyrings/google-chrome.gpg

RUN echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" \
    | tee /etc/apt/sources.list.d/google-chrome.list

# ✅ Google Chrome のインストール
RUN apt update && apt install -y --no-install-recommends google-chrome-stable || \
    (curl -fsSL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o /tmp/chrome.deb && \
    dpkg -i /tmp/chrome.deb || apt --fix-broken install -y && rm /tmp/chrome.deb)

# ✅ 最新の npm に更新
RUN npm install -g npm

# ✅ アプリユーザーで動かす
USER node

# ✅ 環境変数
ENV CHROME_PATH="/usr/bin/google-chrome"
ENV NODE_ENV=production

# ✅ 作業ディレクトリ
WORKDIR /home/node/app

# ✅ アプリファイルをコピー（Next.jsと共存ならserverディレクトリだけコピーでもOK）
COPY . .

# ✅ 依存関係をインストール
RUN npm install

# ✅ 必要であれば TypeScript のビルド（or ts-node で起動）
RUN npm install -D ts-node typescript @types/node

# ✅ アプリ起動ポート（Railwayが自動で設定する）
EXPOSE 3000

# ✅ サーバーを起動（ts-node使用）
CMD ["npx", "ts-node", "index.ts"]
