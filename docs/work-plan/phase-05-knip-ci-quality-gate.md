# Phase 5: backend knip 導入+ quality スクリプト+ CI

> 前提: `docs/work-plan/README.md` と Phase 1〜4 完了(lint / type-check / test が両 app に揃っていること)

**ゴール:** 未使用コード検出を両 app 化し、各 app に品質フルチェックの単一入口(`quality` スクリプト)を作り、GitHub Actions で同一コマンドを CI 化する。これで `local-quality-mirrors-ci` ルール(Phase 7)の前提が実体になる。

**決定記録の適用:** D6、D7

### Task 1: backend knip 導入

**Files:**
- Create: `apps/backend/knip.config.js`
- Modify: `apps/backend/package.json`

- [x] **Step 1: インストールと設定**

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

- [x] **Step 2: 実行して 0 化**

```bash
cd apps/backend
npm run knip > /tmp/backend-knip.txt 2>&1; echo "exit=$?"
```

Read で全件確認。未使用 export・未使用依存が出たら削除する(生成物 `src/db/generated-types.ts` の未使用型が大量に出る場合は、`ignore: ['src/db/generated-types.ts']` を設定に追加し理由コメントを書く — codegen 生成物は全テーブル型を機械的に含むため)。

- [x] **Step 3: コミット依頼** 対象ファイルを提示し、ユーザーに `feat(backend): knip を導入し未使用コードを整理` でのコミットを依頼する(git commit はユーザー特権。README の Global Constraints 参照)

### Task 2: quality スクリプト(フルチェック単一入口)

**Files:**
- Modify: `apps/backend/package.json`
- Modify: `apps/frontend/package.json`

- [x] **Step 1: 両 app に追加**

backend:

```jsonc
"quality": "npm run lint && npm run type-check && npm run knip && npm run test && npm run build",
```

frontend:

```jsonc
"quality": "npm run lint && npm run type-check && npm run knip && npm run test && npm run build",
```

- [x] **Step 2: 両 app で実行し全通過を確認**

```bash
cd apps/backend && npm run quality > /tmp/backend-quality.txt 2>&1; echo "exit=$?"
cd ../frontend && npm run quality > /tmp/frontend-quality.txt 2>&1; echo "exit=$?"
```

期待: 両方 exit=0。Read で 0 エラー・0 警告を確認。

- [x] **Step 3: コミット依頼** 対象ファイルを提示し、ユーザーに `chore: 両 app に quality スクリプト(フル品質チェック単一入口)を追加` でのコミットを依頼する

### Task 3: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

- [x] **Step 1: workflow を作成**

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

- [x] **Step 2: ユーザーに commit + push を依頼する**

git commit / git push はユーザー特権のため、エージェントは以下をユーザーに依頼する:

```bash
# (ユーザーが実行)
git add .github/workflows/ci.yml && git commit -m "ci: 両 app の quality チェックを GitHub Actions 化"
git push
```

CI の結果はユーザー申告方式(README の Global Constraints 参照): fail 時のみユーザーが申告し、申告を受けたセッションが修正する。期待される結果は quality (backend) / quality (frontend) / compose-config すべて成功。fail 申告時の参考: actions/setup-node の `node-version-file` は root の `.node-version` を参照する(working-directory の影響でパス解決に失敗する場合はリポジトリルート相対に修正)。テストが外部接続で落ちた場合はモック側を直す(Task 3 の注記参照)。

## 受入基準

- [x] `apps/backend` / `apps/frontend` ともに `npm run quality` が exit 0・出力 0 エラー 0 警告
- [x] GitHub Actions が push/PR で両 app の quality + compose config 検証を実行する workflow を配置済み(green か否かはユーザー申告方式 — fail 時のみ申告を受けて修正する)
- [x] knip が両 app で 0 件(意図的 ignore には理由コメントがある — backend は ignore 不使用で 0 件)

## 引き継ぎ事項(実行セッションが追記)

実行日: 2026-07-19

### 計画との差異・追加判断

1. **git 操作の特権分離(セッション中のユーザー指示)**: `git commit` / `git push` 等はユーザー特権となった(README の Global Constraints に追記済み。正は `claude_settings/.claude/settings.json` の deny 一覧)。**指示前にエージェントが Task 1〜3 の 3 コミットを main に作成済み**(`c808696` / `a037fbf` / `56d1068`。メッセージ・内容は計画どおり)。指示後、Phase 5〜11 の全フェーズ文書のコミット手順を「コミット依頼」方式に書き換えた。
2. **backend knip の検出結果**: 未使用ファイル 2 件(`src/types/api.ts` / `src/types/index.ts` — grep で参照ゼロを確認し削除、`src/types/` ディレクトリごと除去)、未使用 export 1 件(`src/schemas/common.ts` の `HelloResponseSchema` — 削除)。`generated-types.ts` の大量検出は発生せず、`ignore` は不使用。
3. **knip.config.js の entry を計画から縮小**: 計画の entry のうち `src/index.ts` / `src/db/migrate.ts` / `vitest.config.ts` は knip が「Remove redundant entry pattern」と Configuration hints を出したため削除(デフォルト検出・package.json scripts・vitest プラグインで自動検出されるため冗長)。残した entry は `src/db/migrations/*.ts` と `.config/kysely.config.ts` のみ。
4. **backend eslint.config.mjs の allowDefaultProject に `knip.config.js` を追加**: 新規の `knip.config.js` が tsconfig include 外のため typed lint がパースエラーになった(Phase 4 引き継ぎで予告されていた事象)。抑制コメントではなく allowDefaultProject への追加で解決(D13 準拠)。

5. **CI 結果の確認方式(セッション中のユーザー指示)**: push 後の CI 結果はユーザー申告方式とした(fail 時のみユーザーが申告し、申告を受けたセッションが修正する。エージェントは CI 確認を残作業・待ち状態として扱わない)。README の Global Constraints に追記済み。
6. **環境情報**: エージェント環境では ssh-agent 未起動・`gh` CLI 未インストール。push 検証系の作業はユーザー実行前提で計画すること。
