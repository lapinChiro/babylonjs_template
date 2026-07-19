# Phase 5: backend knip 導入+ quality スクリプト+ CI

> 前提: `docs/work-plan/README.md` と Phase 1〜4 完了(lint / type-check / test が両 app に揃っていること)

**ゴール:** 未使用コード検出を両 app 化し、各 app に品質フルチェックの単一入口(`quality` スクリプト)を作り、GitHub Actions で同一コマンドを CI 化する。これで `local-quality-mirrors-ci` ルール(Phase 7)の前提が実体になる。

**決定記録の適用:** D6、D7

### Task 1: backend knip 導入

**Files:**
- Create: `apps/backend/knip.config.js`
- Modify: `apps/backend/package.json`

- [ ] **Step 1: インストールと設定**

```bash
cd apps/backend && npm install -D knip@latest
```

`apps/backend/knip.config.js`:

```js
export default {
  $schema: 'https://unpkg.com/knip@latest/schema.json',
  entry: [
    'src/index.ts',
    'src/db/migrate.ts',
    'src/db/migrations/*.ts',
    '.config/kysely.config.ts',
    'vitest.config.ts',
  ],
  project: ['src/**/*.ts', '.config/**/*.ts'],
  ignoreExportsUsedInFile: { interface: true, type: true },
}
```

scripts に追加: `"knip": "knip"`

- [ ] **Step 2: 実行して 0 化**

```bash
cd apps/backend
npm run knip > /tmp/backend-knip.txt 2>&1; echo "exit=$?"
```

Read で全件確認。未使用 export・未使用依存が出たら削除する(生成物 `src/db/generated-types.ts` の未使用型が大量に出る場合は、`ignore: ['src/db/generated-types.ts']` を設定に追加し理由コメントを書く — codegen 生成物は全テーブル型を機械的に含むため)。

- [ ] **Step 3: コミット** `feat(backend): knip を導入し未使用コードを整理`

### Task 2: quality スクリプト(フルチェック単一入口)

**Files:**
- Modify: `apps/backend/package.json`
- Modify: `apps/frontend/package.json`

- [ ] **Step 1: 両 app に追加**

backend:

```jsonc
"quality": "npm run lint && npm run type-check && npm run knip && npm run test && npm run build",
```

frontend:

```jsonc
"quality": "npm run lint && npm run type-check && npm run knip && npm run test && npm run build",
```

- [ ] **Step 2: 両 app で実行し全通過を確認**

```bash
cd apps/backend && npm run quality > /tmp/backend-quality.txt 2>&1; echo "exit=$?"
cd ../frontend && npm run quality > /tmp/frontend-quality.txt 2>&1; echo "exit=$?"
```

期待: 両方 exit=0。Read で 0 エラー・0 警告を確認。

- [ ] **Step 3: コミット** `chore: 両 app に quality スクリプト(フル品質チェック単一入口)を追加`

### Task 3: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: workflow を作成**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  quality:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        app: [backend, frontend]
    defaults:
      run:
        working-directory: apps/${{ matrix.app }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version-file: .node-version
          cache: npm
          cache-dependency-path: apps/${{ matrix.app }}/package-lock.json
      - run: npm ci
      - run: npm run quality

  compose-config:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker compose config -q
```

注: テストは外部サービス(PostgreSQL / MinIO)に接続しない前提(backend の MinIO は `vi.mock` 済み、frontend は service モック)。もし CI でテストが外部接続で落ちたら、それはテストの欠陥なので接続部をモックする側を直す(DESIGN.md §11 の方針)。

- [ ] **Step 2: push して CI が green になることを確認**

```bash
git add .github/workflows/ci.yml && git commit -m "ci: 両 app の quality チェックを GitHub Actions 化"
git push
gh run watch --exit-status
```

期待: quality (backend) / quality (frontend) / compose-config すべて成功。actions/setup-node の `node-version-file` は root の `.node-version` を参照する(working-directory の影響でパス解決に失敗する場合は `node-version-file: '.node-version'` をリポジトリルート相対に修正)。

## 受入基準

- [ ] `apps/backend` / `apps/frontend` ともに `npm run quality` が exit 0・出力 0 エラー 0 警告
- [ ] GitHub Actions が push/PR で両 app の quality + compose config 検証を実行し green
- [ ] knip が両 app で 0 件(意図的 ignore には理由コメントがある)

## 引き継ぎ事項(実行セッションが追記)

- (未実行)
