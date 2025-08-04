# ベースイメージとしてRust公式イメージを使用
FROM rust:1.88

# Node.jsとnpm,yarn,pnpmをインストール
# 公式の手順を参考にバージョンを指定 (例: v20.x)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get install -y nodejs
RUN npm install -g yarn pnpm

# Wasmビルドツールをインストール
RUN cargo install wasm-pack

# 作業ディレクトリを作成
WORKDIR /usr/src/app

# ホストのファイルをコンテナにコピー
COPY . .

# コンテナ起動時に実行されるデフォルトコマンド
CMD ["bash"]