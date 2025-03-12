# ✅ Node.js の公式イメージを使用（bookworm ベース）
FROM node:22.13.1-bookworm

# ✅ Lighthouse CLI をグローバルにインストール
RUN npm install -g lighthouse

# ✅ 必要なパッケージをインストール
# RUN apt update && apt install -y wget curl gnupg2 ca-certificates

# 必要なパッケージをインストール
RUN apt update && apt install -y wget curl gnupg2 ca-certificates dbus

# ✅ 最新の Google Chrome の GPG キーを取得（新しいキー）
RUN mkdir -p /etc/apt/keyrings && \
    curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /etc/apt/keyrings/google-chrome.gpg && \
    chmod a+r /etc/apt/keyrings/google-chrome.gpg

# ✅ Google Chrome のリポジトリを追加
RUN echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/google-chrome.gpg] http://dl.google.com/linux/chrome/deb/ stable main" \
    | tee /etc/apt/sources.list.d/google-chrome.list

# ✅ APT キャッシュを更新 & Google Chrome を手動でインストール
RUN apt update && apt install -y --no-install-recommends google-chrome-stable || \
    (curl -fsSL https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb -o /tmp/chrome.deb && \
    dpkg -i /tmp/chrome.deb || apt --fix-broken install -y && rm /tmp/chrome.deb)

# ✅ npm を最新バージョンに更新
RUN npm install -g npm

# ✅ `node` ユーザーとして実行
USER node

# ✅ CHROME_PATH 環境変数をセット
ENV CHROME_PATH="/usr/bin/chromium"

EXPOSE 9222

# ✅ 環境変数を設定
ENV NODE_ENV development

# ✅ 作業ディレクトリ
WORKDIR /home/node/app
