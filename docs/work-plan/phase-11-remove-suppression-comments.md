# Phase 11: 抑制コメント(eslint-disable 等)の全廃

> 前提: `docs/work-plan/README.md` と Phase 1〜10 完了

**ゴール:** コードベースから `eslint-disable`(全形式)・`@ts-expect-error`・`@ts-ignore`・`@ts-nocheck` を完全に排除し、抑制していた検出を**適切な実装への書き換え**で解決する。あわせて再発を lint 自体で機械的に防止する。

**決定記録の適用:** D13(抑制コメント全面禁止。ユーザー指示 2026-07-19)

**背景:** lint は信頼性の高い静的解析の一翼であり、抑制コメントはそれを根本から覆す。誤検出と思われる場合も抑制ではなく、検出が起きない構造への実装書き換えで解決する。

### Task 1: 既存の抑制コメントの棚卸し

- [ ] **Step 1: 全量を洗い出す**

```bash
grep -rn "eslint-disable\|@ts-expect-error\|@ts-ignore\|@ts-nocheck" apps/frontend/src apps/backend/src apps/frontend/*.ts apps/frontend/*.mjs apps/backend/*.ts apps/backend/*.mjs 2>/dev/null
```

Phase 3 完了時点の既知 2 箇所(以降のフェーズで増えていれば追加で棚卸し):

| 箇所 | 抑制していたルール | 置き換え方針(候補) |
|---|---|---|
| `apps/frontend/src/main.ts` の `createApp(App)` | `@typescript-eslint/no-unsafe-argument` | typescript-eslint が `.vue` import を解決できずフォールバック型になることが原因。`src/vite-env.d.ts` 等に `declare module '*.vue'` shim(`DefineComponent` を返す標準形)を追加して import 自体を型付けする。shim が vue-tsc の精密な型を上書きしないこと(type-check・エディタ体験の回帰なし)を確認する |
| `apps/frontend/src/renderer/BabylonRenderer.ts` `initialize()` | `@typescript-eslint/no-unnecessary-condition` | await 中の `dispose()` を検出する正当な再チェックだが、TS が await を跨いで narrowing を維持するため誤検出になる。プロパティ直接参照をやめ `private isDisposed(): boolean` メソッド経由の読み取りに変える(メソッド戻り値は narrowing が持続しないため検出されない)等、構造の書き換えで解決する |

### Task 2: 置き換え実装

- [ ] **Step 1: 各箇所を上表の方針で書き換え、抑制コメントを削除する**

**禁止事項:** ルール本体の off 化・severity 引き下げによる回避(migrations の設定 override(D3)は既存決定として維持)。書き換えで挙動が変わる場合はテストで挙動を固定してから行う。

- [ ] **Step 2: 検証(両 app のフル品質コマンド)**

```bash
cd apps/frontend && npm run quality
cd apps/backend && npm run quality
```

期待: すべて 0 エラー・0 警告。

### Task 3: 再発防止の機械化

- [ ] **Step 1: 抑制コメント自体を lint エラーにする**

`@eslint-community/eslint-plugin-eslint-comments` を両 app に導入し、`no-use`(allowWhitelistDirectives なし)で `eslint-disable` 系コメントの使用自体をエラー化する。`@ts-expect-error` 等は typescript-eslint の `ban-ts-comment`(strictTypeChecked に含まれる。`ts-expect-error` も含め全面禁止に設定を強化)で担保する。

- [ ] **Step 2: 検証** 試しに `// eslint-disable-next-line` を書いた一時ファイルで検出されることを確認し、削除する

- [ ] **Step 3: コミット** `refactor: 抑制コメントを全廃し適切な実装に置き換え、再発を lint で防止`

## 受入基準

- [ ] `grep -rn "eslint-disable\|@ts-expect-error\|@ts-ignore\|@ts-nocheck"` が両 app のソース・設定ファイルで 0 件
- [ ] 抑制コメントの使用自体が lint エラーになる(再発防止が機械化されている)
- [ ] 両 app の quality(lint / type-check / knip / test / build)が 0 エラー・0 警告
- [ ] 実機でログイン〜3D 描画の回帰なし(BabylonRenderer 変更のため)

## 引き継ぎ事項(実行セッションが追記)

- (未実行)
