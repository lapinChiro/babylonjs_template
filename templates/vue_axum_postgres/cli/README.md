# atmp
UniqueVision でプロジェクト開発を便利にするためのCLIツールの雛形


## インストール
### uv コマンドを利用している場合
git からクローンするのではなく、 uv コマンドを経由してインストールする。
`atmp cd` コマンドなどが使えるようになる。

```sh
uv add app_template

# `atmp` コマンドを認識させる
eval $(uv init -)
```


### 初期化
必要なツールのインストールやAWSのCONFIG設定などを行う。

```sh
atmp init
```

Shell の立ち上げ時に必要な機能を読み込ませる（環境変数・補完の設定など）。

```sh
# bash の場合
echo "[[ -x `which atmp` ]] && eval \"$(atmp init -)\"" >> ~/.bash_profile

# zsh の場合
echo "[[ -x `which atmp` ]] && eval \"$(atmp init -)\"" >> ~/.zsh_profile
```


## 開発
### 開発環境の立ち上げ/立ち下げ
関連するすべての環境を一度に操作したい場合、 `atmp` を `uv` に置き換えて実行する。

```sh
# ビルド
atmp build
# 開発環境の立ち上げ
atmp start
# データベースのデータ投入
atmp prepare

# 開発環境の立ち下げ
atmp stop
```

### 実行状態の確認
```sh
atmp ps
```


### レポジトリ内のディレクトリに移動
```sh
atmp cd
```


### エディタでプロジェクトを開く
```sh
atmp edit
```
