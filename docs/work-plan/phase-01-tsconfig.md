# Phase 1: tsconfig 強化(両 app)+ type-check/build スクリプト整備

> 前提: `docs/work-plan/README.md` を先に読むこと。依存フェーズ: なし(最初のフェーズ)

**ゴール:** 両 app の TypeScript 設定を強化し、テストコードも含めた全量が型検査される状態を作る。`type-check` スクリプトを両 app に整備する。

**背景(現状の問題):**
- backend の `tsconfig.json` は `exclude: ["src/**/*.test.ts"]` でテストが型検査されない。build 設定と型検査設定が兼用
- frontend の `tsconfig.app.json` も test ファイルを exclude(現状 frontend にテストは無いが、Phase 4 で追加する)
- `noUncheckedIndexedAccess` 等の追加 strict オプションが未設定

### Task 1: backend tsconfig の分離と強化

**Files:**
- Modify: `apps/backend/tsconfig.json`(typecheck 用=テスト含む全量・noEmit)
- Create: `apps/backend/tsconfig.build.json`(build 用=テスト除外・emit)
- Modify: `apps/backend/package.json`(scripts)

- [ ] **Step 1: `apps/backend/tsconfig.json` を以下の内容に置き換える**

```jsonc
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "noEmit": true,
    "types": ["node"],
    "jsx": "react-jsx",
    "jsxImportSource": "hono/jsx"
  },
  "include": ["src/**/*.ts", ".config/**/*.ts", "vitest.config.ts"]
}
```

ポイント: `exclude` からテストを外し、`.config/kysely.config.ts` と `vitest.config.ts` も型検査対象に含める。`rootDir`/`outDir` は build 側へ移す。

- [ ] **Step 2: `apps/backend/tsconfig.build.json` を新規作成**

```jsonc
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "noEmit": false,
    "rootDir": "./src",
    "outDir": "./dist"
  },
  "include": ["src/**/*.ts"],
  "exclude": ["src/**/*.test.ts"]
}
```

- [ ] **Step 3: `apps/backend/package.json` の scripts を変更**

```jsonc
"build": "tsc -p tsconfig.build.json",
"type-check": "tsc --noEmit",
```

(`build` は既存の `"tsc"` から変更。`type-check` は新規追加。他の scripts は変更しない)

- [ ] **Step 4: 型検査を実行し、出力をファイルに落として確認**

```bash
cd apps/backend
npm run type-check > /tmp/backend-typecheck.txt 2>&1; echo "exit=$?"
```

Read ツールで `/tmp/backend-typecheck.txt` を確認。期待: 新オプション(特に `noUncheckedIndexedAccess` / `noUnusedLocals` / テストファイルの検査対象化)によるエラーが出る可能性がある。**エラーが出たら全て修正する**(修正方針: 配列/Record アクセスは `undefined` ガードを追加、未使用変数は削除。型を握りつぶす `as`・`!` での回避は禁止)。

- [ ] **Step 5: build が従来どおり成功し dist にテストが含まれないことを確認**

```bash
cd apps/backend
rm -rf dist && npm run build && ls dist && ls dist/**/*.test.js 2>/dev/null; echo "test-js-should-be-absent"
```

期待: build 成功、`dist/` に `*.test.js` が存在しない。

- [ ] **Step 6: テスト実行で回帰がないことを確認**

```bash
cd apps/backend && npm test
```

期待: 全件 PASS。

- [ ] **Step 7: コミット** `chore(backend): tsconfig を typecheck/build に分離し strict オプションを強化`

### Task 2: frontend tsconfig の強化

**Files:**
- Modify: `apps/frontend/tsconfig.app.json`
- Modify: `apps/frontend/package.json`(scripts)

- [ ] **Step 1: `apps/frontend/tsconfig.app.json` の compilerOptions に追加**

既存の `"strict": true` 等はそのまま、以下を追加する:

```jsonc
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true,
```

(テスト用 tsconfig の追加は Phase 4 で vitest と同時に行う)

- [ ] **Step 2: `apps/frontend/package.json` に type-check スクリプトを追加**

```jsonc
"type-check": "vue-tsc --build --noEmit",
```

- [ ] **Step 3: 型検査を実行して確認**

```bash
cd apps/frontend
npm run type-check > /tmp/frontend-typecheck.txt 2>&1; echo "exit=$?"
```

Read ツールで確認。`noUncheckedIndexedAccess` 起因のエラー(例: `type.split('/')[1]` のような indexed access)が出たらガード追加で修正する。

- [ ] **Step 4: build 確認**

```bash
cd apps/frontend && npm run build
```

期待: 成功(`vue-tsc -b && vite build`)。

- [ ] **Step 5: コミット** `chore(frontend): tsconfig strict オプションを強化し type-check スクリプトを追加`

## 受入基準

- [ ] `apps/backend`: `npm run type-check` がテストファイル込みで 0 エラー
- [ ] `apps/backend`: `npm run build` 成功・`dist/` にテスト非含有・`npm test` 全 PASS
- [ ] `apps/frontend`: `npm run type-check` 0 エラー・`npm run build` 成功
- [ ] 両 app の tsconfig に `noUncheckedIndexedAccess` / `noImplicitOverride` が入っている

## 引き継ぎ事項(実行セッションが追記)

- (未実行)
