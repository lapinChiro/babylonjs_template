# アプリのテンプレート集

## 導入方法

```sh
# 以下から scopes: repo の権限を付けた GitHub Classic Token を作成する
# https://github.com/settings/tokens/new
export GIGET_AUTH=ghp_xxxxxclassicxxxx

# インポート先のディレクトリ
export MY_DIR=xxxx

# 使用したいテンプレート名（vue_hono_postgres, vue_rails_postgres, vue_axum_postgres_simple から選択）
export TARGET_TEMPLATE=xxxx

npx giget gh:UniqueVision/sc.app_template/templates/$TARGET_TEMPLATE $MY_DIR
```

## 要確認

### underconstruction/vue_axum_postgresについて

動作未検証です。
Googleログイン前提になっているなど、利用時に修正しなければいけない内容が残されています。
compose.ymlのパスとポート番号は対応済みですが、正しく採点できない可能性があります。

以下の設定で入手可能です

```sh
export TARGET_TEMPLATE=underconstruction/vue_axum_postgres
```
