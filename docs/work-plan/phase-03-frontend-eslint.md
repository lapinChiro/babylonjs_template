# Phase 3: frontend ESLint 導入+0 エラー化

> 前提: `docs/work-plan/README.md` と Phase 1〜2 完了(Phase 2 の引き継ぎ事項に TypeScript peer 警告等があれば先に読む)

**ゴール:** `apps/frontend` に Vue 対応の typed lint を導入し、`.vue` 含む既存コードを 0 エラー・0 警告にする。

**決定記録の適用:** D1、D2

### Task 1: ESLint のインストールと設定

**Files:**
- Create: `apps/frontend/eslint.config.mjs`
- Modify: `apps/frontend/package.json`(devDependencies, scripts)

- [x] **Step 1: パッケージをインストール**

```bash
cd apps/frontend
npm install -D eslint@latest eslint-plugin-vue@latest @vue/eslint-config-typescript@latest
```

(`@vue/eslint-config-typescript` が typescript-eslint を同梱し、`.vue` の `<script setup lang="ts">` に typed lint を適用する)

- [x] **Step 2: `apps/frontend/eslint.config.mjs` を作成**

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

- [x] **Step 3: scripts を追加(`apps/frontend/package.json`)**

```jsonc
"lint": "eslint .",
"lint:fix": "eslint . --fix",
```

### Task 2: 既存コードの 0 エラー化

- [x] **Step 1: lint 実行・出力をファイルへ・Read で全件確認**

```bash
cd apps/frontend
npm run lint > /tmp/frontend-lint.txt 2>&1; echo "exit=$?"
```

- [x] **Step 2: `npm run lint:fix` で自動修正を適用**

- [x] **Step 3: 残エラーを手修正**

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

- [x] **Step 4: 検証**

```bash
cd apps/frontend
npm run lint > /tmp/frontend-lint2.txt 2>&1; echo "exit=$?"
npm run type-check && npm run build && npm run knip
```

期待: すべて 0 エラー・0 警告。

- [x] **Step 5: 動作確認(レンダリング回帰の目視)**

```bash
docker compose up --build -d
```

ブラウザで `http://localhost:5173/`(ポートは `.env` 未作成なら 5173。README.md 記載のとおり現在の `.env` では 15173 の場合あり)を開き、ログイン(test1@example.com / password123)→ Dashboard の Babylon Canvas が描画されることを確認。確認後 `docker compose stop`。

- [ ] **Step 6: コミット** `feat(frontend): Vue 対応 typed ESLint を導入し既存コードを 0 エラー化`

## 受入基準

- [x] `npm run lint` 0 エラー・0 警告(`.vue` 含む)
- [x] `as any` がコードベースから消えている(`grep -rn "as any" src/` が 0 件)
- [x] type-check / build / knip も 0 エラー
- [x] 実機でログイン〜3D 描画の回帰なし

## 引き継ぎ事項(実行セッションが追記)

- **実行日**: 2026-07-19。全受入基準を満たして完了(lint 0 エラー・0 警告 / `as any` 0 件 / type-check・build・knip 0 エラー / 実機でログイン〜Babylon 描画を確認)
- **導入バージョン**: eslint@10.7.0 / eslint-plugin-vue@10.9.2 / @vue/eslint-config-typescript@14.9.0(typescript-eslint@8.64.0 同梱)。TS 6.0.3 のままで ERESOLVE は発生せず(Phase 2 引き継ぎの想定どおり)
- **計画例からの差異 3 点**:
  - `defineConfigWithVueTs` は v14.9 で旧 API 扱いになったため、README 推奨の `withVueTs(options, ...configs)` を採用(計画注記が委ねた「README で確認」の結果)
  - **`allowComponentTypeUnsafety: false` を明示指定**。既定 true は `no-unsafe-argument/assignment/return/call/member-access` の 5 ルールを **`.vue` だけでなく全 `.ts` ファイルで off にする**(dist 実装で確認)ため、strictTypeChecked の趣旨に反すると判断。false 化により `response._data`(any)への unsafe アクセス等が検出可能になった
  - `projectService.allowDefaultProject` には `eslint.config.mjs` に加え、tsconfig include 外の `vite.config.ts` / `knip.config.js` も列挙が必要だった
- **eslint-disable は 2 箇所**(いずれも理由コメント付き 1 行、ライブラリ/TS の限界による誤検出)。**このセッション中のユーザー指示(D13)により抑制コメントは全面禁止となったため、この 2 箇所は Phase 11 で適切な実装に置き換える**(置き換え方針は `phase-11-remove-suppression-comments.md` に記載済み)。以降のフェーズでは新規の抑制コメントを一切使わないこと:
  - `src/main.ts` の `createApp(App)`: no-unsafe-argument。typescript-eslint が `.vue` import の型を解決できずフォールバック型になる既知の制限(allowComponentTypeUnsafety が既定 true な理由そのもの)。型検査自体は vue-tsc が担保
  - `src/renderer/BabylonRenderer.ts` initialize(): no-unnecessary-condition。await 中に `dispose()` が呼ばれ得る正当な再チェックだが、TS が await を跨いで narrowing を維持するため「常に falsy」と誤検出
- **0 エラー化の主な追加判断**(初回 117 件 → 自動修正で warning 57 件解消 → 手修正 59 件+false 化で顕在化した 1 件):
  - `services/api.ts`: onRequest は ofetch の `ctx.options.headers`(Headers 型)に `.set()` で付与し `as any` を除去。エラーボディは `unknown` で受けて `extractErrorMessage`(in + typeof narrowing)で抽出。401 分岐も `message` キーを参照するようになった(旧実装は `error` キーのみ。軽微な挙動差)
  - `toErrorMessage(err: unknown, fallback)` を `services/api.ts` に追加し、stores の `catch (err: any)` 7 箇所を `catch (err)` + narrowing に統一(`err.message || fallback` の空文字 fallback 挙動を保存)
  - `router/index.ts`: vue-router の `RouteMeta` を module augmentation で型付けし `to.meta.title` の no-base-to-string を解消
  - `stores/auth.store.ts`: login の `if (response && response.user)` は型上到達不能のため分岐ごと削除(失敗は throw 経由)。LocalStorage 復元値は `unknown` + `isStoredUser` 型ガードで検証してから採用
  - `utils/vee-validate-config.ts`: `generateMessage` の `(context: any)` を注釈なしの contextual typing に(`FieldValidationMetaInfo` は vee-validate 非公開型のため import 不可)。`params` は配列/オブジェクトの union を narrowing してから参照
  - stores 末尾の初期フェッチは `void fetchItems()` / `void fetchImages()` +意図コメント
- **スコープ外の発見**: ブラウザ console に favicon 系の 404 が 2 件(初回ロード時のみ、アプリ動作に影響なし)。Phase 4 以降の対象外事項として記録のみ
- **未解決事項**: なし
