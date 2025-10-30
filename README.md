# アプリのテンプレート集

## 導入方法

```sh
# 以下から scopes: repo の権限を付けた GitHub Classic Token を作成する
# https://github.com/settings/tokens/new
export GIGET_AUTH=ghp_xxxxxclassicxxxx

# インポート先のディレクトリ
export MY_DIR=xxxx

# 使用したいテンプレート名（vue_hono_postgres, react_hono_postgres, vue_rails_postgres から選択）
export TARGET_TEMPLATE=xxxx

npx giget gh:UniqueVision/sc.app_template/templates/$TARGET_TEMPLATE $MY_DIR
```
