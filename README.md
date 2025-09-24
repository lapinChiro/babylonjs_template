# アプリのテンプレート集

## 導入方法

```sh
# scope: repoの権限を付けたGitHub Classic Token
export GIGET_AUTH=ghp_xxxxxclassicxxxx

# インポート先のディレクトリ
export MY_DIR=xxxx

# 使用したいテンプレート名（vue_axum_postgres, vue_hono_postgres, vue_rails_postgresから選択）
export TARGET_TEMPLATE=xxxx


npx giget gh:UniqueVision/sc.app_template/templates/$TARGET_TEMPLATE $MY_DIR
```
