# Phase 3: frontend ESLint 導入+0 エラー化

> 前提: `docs/work-plan/README.md` と Phase 1〜2 完了(Phase 2 の引き継ぎ事項に TypeScript peer 警告等があれば先に読む)

**ゴール:** `apps/frontend` に Vue 対応の typed lint を導入し、`.vue` 含む既存コードを 0 エラー・0 警告にする。

**決定記録の適用:** D1、D2

### Task 1: ESLint のインストールと設定

**Files:**
- Create: `apps/frontend/eslint.config.mjs`
- Modify: `apps/frontend/package.json`(devDependencies, scripts)

- [ ] **Step 1: パッケージをインストール**

```bash
cd apps/frontend
npm install -D eslint@latest eslint-plugin-vue@latest @vue/eslint-config-typescript@latest
```

(`@vue/eslint-config-typescript` が typescript-eslint を同梱し、`.vue` の `<script setup lang="ts">` に typed lint を適用する)

- [ ] **Step 2: `apps/frontend/eslint.config.mjs` を作成**

```js
import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default defineConfigWithVueTs(
  { ignores: ['dist/**'] },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.strictTypeChecked,
  vueTsConfigs.stylisticTypeChecked,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
)
```

注: `vueTsConfigs.strictTypeChecked` の正確な export 名はインストールされたバージョンの README で確認する(バージョンによって `defineConfigWithVueTs` ではなく `defineConfig` 系へ改名されている可能性がある)。確認は `node_modules/@vue/eslint-config-typescript/README.md` を Read する。

- [ ] **Step 3: scripts を追加(`apps/frontend/package.json`)**

```jsonc
"lint": "eslint .",
"lint:fix": "eslint . --fix",
```

### Task 2: 既存コードの 0 エラー化

- [ ] **Step 1: lint 実行・出力をファイルへ・Read で全件確認**

```bash
cd apps/frontend
npm run lint > /tmp/frontend-lint.txt 2>&1; echo "exit=$?"
```

- [ ] **Step 2: `npm run lint:fix` で自動修正を適用**

- [ ] **Step 3: 残エラーを手修正**

このコードベースで既知の違反箇所(事前調査済み)と修正方針:

| 箇所 | 違反 | 修正方針 |
|---|---|---|
| `src/services/api.ts` の `(ctx.options.headers as any)` | no-explicit-any | ofetch の `ctx.options.headers` 型に沿って `Headers` API または型付き object で設定し `as any` を除去 |
| `src/services/api.ts` の `error?.error \|\| error?.message` | no-unsafe-member-access(`response._data` が any) | `_data` を `unknown` として受け、型ガード関数(`isErrorBody`)で narrowing |
| `src/stores/*.store.ts` の `catch (err: any)` | no-explicit-any | `catch (err: unknown)` + `err instanceof ApiError` / `instanceof Error` narrowing(既に `instanceof ApiError` 分岐があるため自然に書き換え可能) |
| `err.message \|\| '...'` | prefer-nullish-coalescing ほか | narrowing 後に `??` へ |
| `src/stores/items.store.ts` 末尾の `fetchItems()` 呼び出し | no-floating-promises | `void fetchItems()` +意図コメント(store 初期化時の fire-and-forget) |
| vee-validate / yup / Babylon 由来の型ゆるみ | no-unsafe-* 系 | 境界で型を付ける。ライブラリ型定義の限界による場合のみ理由コメント付き 1 行 disable(引き継ぎ事項へ記録) |

**Vue テンプレート系の警告**(`vue/max-attributes-per-line` 等のスタイル)は `lint:fix` で自動整形される。自動整形後にテンプレートの見た目が壊れていないか `git diff` で確認する。

- [ ] **Step 4: 検証**

```bash
cd apps/frontend
npm run lint > /tmp/frontend-lint2.txt 2>&1; echo "exit=$?"
npm run type-check && npm run build && npm run knip
```

期待: すべて 0 エラー・0 警告。

- [ ] **Step 5: 動作確認(レンダリング回帰の目視)**

```bash
docker compose up --build -d
```

ブラウザで `http://localhost:5173/`(ポートは `.env` 未作成なら 5173。README.md 記載のとおり現在の `.env` では 15173 の場合あり)を開き、ログイン(test1@example.com / password123)→ Dashboard の Babylon Canvas が描画されることを確認。確認後 `docker compose stop`。

- [ ] **Step 6: コミット** `feat(frontend): Vue 対応 typed ESLint を導入し既存コードを 0 エラー化`

## 受入基準

- [ ] `npm run lint` 0 エラー・0 警告(`.vue` 含む)
- [ ] `as any` がコードベースから消えている(`grep -rn "as any" src/` が 0 件)
- [ ] type-check / build / knip も 0 エラー
- [ ] 実機でログイン〜3D 描画の回帰なし

## 引き継ぎ事項(実行セッションが追記)

- (未実行)
