# Phase 4: frontend vitest 導入+シードテスト

> 前提: `docs/work-plan/README.md` と Phase 1〜3 完了

**ゴール:** `apps/frontend` に vitest + happy-dom を導入し、ロジック層(stores / services)のシードテストを TDD の受け皿として整備する。テストコードも型検査・lint の対象に含める。

**決定記録の適用:** D5(対象は純ロジック層。Babylon Engine 実描画・コンポーネント mount は対象外)

### Task 1: vitest のインストールと設定

**Files:**
- Create: `apps/frontend/vitest.config.ts`
- Create: `apps/frontend/tsconfig.vitest.json`
- Modify: `apps/frontend/tsconfig.json`(references 追加)
- Modify: `apps/frontend/package.json`(devDependencies, scripts)

- [x] **Step 1: インストール**

```bash
cd apps/frontend
npm install -D vitest@latest happy-dom@latest @vitejs/plugin-vue@latest
```

(@vitejs/plugin-vue は既に devDeps にあるため実質 vitest / happy-dom の追加)

- [x] **Step 2: `apps/frontend/vitest.config.ts` を作成**

```ts
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: false,
    include: ['src/**/*.test.ts'],
    restoreMocks: true,
  },
})
```

(backend の vitest.config.ts と同じ規約: globals なし・restoreMocks・`src/**/*.test.ts` 同居配置)

- [x] **Step 3: `apps/frontend/tsconfig.vitest.json` を作成し、references に追加**

```jsonc
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.vitest.tsbuildinfo",
    "composite": true,
    "lib": [],
    "types": ["node"]
  },
  "include": ["src/**/*.test.ts", "vitest.config.ts"]
}
```

`apps/frontend/tsconfig.json` の references に `{ "path": "./tsconfig.vitest.json" }` を追加。

注: `tsconfig.app.json` は `src/**/*.test.ts` を exclude しているため相互に排他になる。`vue-tsc --build` が両プロジェクトを検査することを Step 6 で確認する。composite 制約でエラーが出る場合は create-vue 公式テンプレート(`npm create vue@latest` の vitest 選択時の構成)を参照して調整し、差分を引き継ぎ事項へ記録する。

- [x] **Step 4: scripts を追加(`apps/frontend/package.json`)**

```jsonc
"test": "vitest run",
"test:watch": "vitest",
```

### Task 2: シードテスト(items.store)

**Files:**
- Create: `apps/frontend/src/stores/items.store.test.ts`

対象の特性(事前調査済み): `useItemsStore` は defineStore(setup 形式)。`itemsService` 経由で CRUD、`ApiError(401)` で `authStore.handleAuthError()` 委譲、検索/ページネーションの computed を持つ。**store 定義末尾で `fetchItems()` を即時発火する**ため、テストでは service モジュールを `vi.mock` してから store を初期化する。

- [x] **Step 1: 失敗するテストを書く**

```ts
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Item } from '@/types'

const serviceMocks = vi.hoisted(() => ({
  getItems: vi.fn<() => Promise<Item[]>>(async () => []),
  createItem: vi.fn(),
  updateItem: vi.fn(),
  deleteItem: vi.fn(),
}))

vi.mock('@/services/items.service', () => serviceMocks)

import { useItemsStore } from './items.store'

function makeItem(id: string, name: string): Item {
  return { id, name, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-01T00:00:00Z' } as Item
}

describe('useItemsStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('検索クエリ設定時: 部分一致(大文字小文字無視)でフィルタされ、ページが 1 にリセットされる', () => {
    const store = useItemsStore()
    store.items = [makeItem('1', 'MacBook Pro'), makeItem('2', 'iPhone 15'), makeItem('3', 'iPad Air')]
    store.setCurrentPage(1)

    store.setSearchQuery('ip')

    expect(store.filteredItems.map(i => i.name)).toEqual(['iPhone 15', 'iPad Air'])
    expect(store.currentPage).toBe(1)
  })

  it('ページ設定時: 範囲外の値は 1..totalPages に丸められる', () => {
    const store = useItemsStore()
    store.items = Array.from({ length: 25 }, (_, i) => makeItem(String(i), `item-${i}`))

    store.setCurrentPage(99)
    expect(store.currentPage).toBe(3) // 25 件 / perPage 10 = 3 ページ

    store.setCurrentPage(0)
    expect(store.currentPage).toBe(1)
  })

  it('fetchItems 失敗時(非 401): error にメッセージが入り loading が解除される', async () => {
    // 注意: useItemsStore() は store 生成時に fetchItems() を自動発火するため、
    // mockRejectedValueOnce だと自動発火側が先に消費してしまう。Value(常時 reject)を使う
    serviceMocks.getItems.mockRejectedValue(new Error('network down'))
    const store = useItemsStore()

    await store.fetchItems()

    expect(store.error).toBe('network down')
    expect(store.loading).toBe(false)
  })
})
```

注: `Item` 型のフィールド名は `apps/frontend/src/types/item.types.ts` を Read して実物に合わせること(上のオブジェクトはひな型。`as Item` が lint(D2 の趣旨)に触れる場合は実フィールドを全部埋めて `as` を外す)。`fetchItems` のエラーメッセージ処理が Phase 3 の unknown 化でどう変わったかも実装を読んで期待値を合わせる。

- [x] **Step 2: 実行して意図どおりのテストになっていることを確認**

```bash
cd apps/frontend
npm test
```

期待: 実装は既存のため原則 PASS(このタスクは特性テスト=現挙動の固定)。FAIL した場合は期待値がずれている(実装を読み直して期待値を直す)か、実バグ。実バグなら**このフェーズでは修正せず**内容を引き継ぎ事項に記録し、テストは実挙動に合わせた上で `// NOTE: 現挙動の固定。修正候補` コメントを付す。

- [x] **Step 3: services のテストを 1 本追加(`src/services/items.service.test.ts`)**

`getItems` のクエリ組み立て(`_page`/`_limit` 等)と、非 ApiError → ApiError 変換を対象に、`vi.mock('./api')` で `api` をモックして 3 ケース程度(パラメータなし / あり / reject 時の変換)を書く。実装は `apps/frontend/src/services/items.service.ts` を Read して確認すること。

- [x] **Step 4: 型検査・lint がテストを対象に含むことを確認**

```bash
cd apps/frontend
npm run type-check && npm run lint && npm test && npm run build
```

期待: すべて 0 エラー(type-check は tsconfig.vitest.json 経由でテストも検査。lint はデフォルトで `src/**` 全体が対象)。knip がテストファイルを未使用と誤検出する場合は `knip.config.js` の project 除外(既に `!src/**/*.test.{js,ts}` あり)を確認。

- [x] **Step 5: コミット** `feat(frontend): vitest + happy-dom を導入し stores/services のシードテストを追加`

## 受入基準

- [x] `npm test` が PASS(store 3 ケース+ service 3 ケース以上)
- [x] テストコードが type-check / lint の対象に入っている(わざと型エラーをテストに入れて検出されることを 1 度確認し、戻す)
- [x] build / knip 回帰なし

## 引き継ぎ事項(実行セッションが追記)

実施日: 2026-07-19。導入バージョン: vitest 4.1.10 / happy-dom 20.11.0(@vitejs/plugin-vue は既存 6.0.8 のまま)。テストは store 3 + service 4 の計 7 件 PASS、type-check / lint / test / build / knip すべて 0 エラー・0 警告。実バグの発見なし(store の 3 特性は計画どおり成立)。

### 計画との差異: tsconfig.vitest.json は計画のひな型から 4 点変更

最終形:

```jsonc
{
  "extends": "./tsconfig.app.json",
  "compilerOptions": {
    "tsBuildInfoFile": "./node_modules/.tmp/tsconfig.vitest.tsbuildinfo",
    "types": ["node"]
  },
  "include": ["src/vite-env.d.ts", "src/**/*.test.ts", "vitest.config.ts"],
  "exclude": []
}
```

1. **`"exclude": []` を追加**: `tsconfig.app.json` の `exclude`(`src/**/*.test.ts` 等)が継承されて include を打ち消し、テストが型検査対象外になっていた(わざと型エラーを入れても検出されないことで発見)。create-vue 公式テンプレートと同じリセット
2. **`"composite": true` を削除**: composite は program 内全ファイルの列挙を要求するため、テストが import する src ファイル群で TS6307 が多発。referenced 先の `tsconfig.app.json` 自体が composite なしで `vue-tsc --build` から検査できている実績に合わせた(削除後もわざとの型エラーが検出されることを確認済み)
3. **`"lib": []` を削除**: program に取り込まれる `src/services/api.ts` 等が DOM 型(`localStorage` ほか)を要するため、`tsconfig.dom.json` 継承の lib(ES2022/DOM)を維持。実行環境も happy-dom なので DOM 前提で問題ない
4. **`src/vite-env.d.ts` を include に追加**: `api.ts` の `import.meta.env` の型解決に必要(TS2339 が出た)

### その他の実績・判断

- テストコードの lint 適合(D13 遵守・抑制コメントなしで解決): `importOriginal<typeof import('./api')>()` の `import()` 型注釈が `consistent-type-imports` に触れるため `import type * as apiModule from './api'` + `importOriginal<typeof apiModule>()` に書き換え。`vi.fn` の既定実装 `async () => []` は `require-await` に触れるため `() => Promise.resolve([])` に書き換え
- service テストは計画の 3 ケースに「ApiError がそのまま再 throw される(変換されない)」を加えた 4 ケースとした(変換ロジックの両側を固定するため)
- Phase 3 引き継ぎで想定していた `eslint.config.mjs` の `allowDefaultProject` への追加は**不要だった**(`vitest.config.ts` は `tsconfig.vitest.json` の include で projectService から解決された)
- `Item` 型の実フィールドは `created_at` / `updated_at`(計画ひな型の `createdAt` ではない)。実フィールドを全部埋めることで `as Item` なしで成立
