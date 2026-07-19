# Phase 11: 抑制コメント(eslint-disable 等)の全廃

> 前提: `docs/work-plan/README.md` と Phase 1〜10 完了

**ゴール:** コードベースから `eslint-disable`(全形式)・`@ts-expect-error`・`@ts-ignore`・`@ts-nocheck` を完全に排除し、抑制していた検出を**適切な実装への書き換え**で解決する。あわせて再発を lint 自体で機械的に防止する。

**決定記録の適用:** D13(抑制コメント全面禁止。ユーザー指示 2026-07-19)

**背景:** lint は信頼性の高い静的解析の一翼であり、抑制コメントはそれを根本から覆す。誤検出と思われる場合も抑制ではなく、検出が起きない構造への実装書き換えで解決する。

### Task 1: 既存の抑制コメントの棚卸し

- [x] **Step 1: 全量を洗い出す**

```bash
grep -rn "eslint-disable\|@ts-expect-error\|@ts-ignore\|@ts-nocheck" apps/frontend/src apps/backend/src apps/frontend/*.ts apps/frontend/*.mjs apps/backend/*.ts apps/backend/*.mjs 2>/dev/null
```

Phase 3 完了時点の既知 2 箇所(以降のフェーズで増えていれば追加で棚卸し):

| 箇所 | 抑制していたルール | 置き換え方針(候補) |
|---|---|---|
| `apps/frontend/src/main.ts` の `createApp(App)` | `@typescript-eslint/no-unsafe-argument` | typescript-eslint が `.vue` import を解決できずフォールバック型になることが原因。`src/vite-env.d.ts` 等に `declare module '*.vue'` shim(`DefineComponent` を返す標準形)を追加して import 自体を型付けする。shim が vue-tsc の精密な型を上書きしないこと(type-check・エディタ体験の回帰なし)を確認する |
| `apps/frontend/src/renderer/BabylonRenderer.ts` `initialize()` | `@typescript-eslint/no-unnecessary-condition` | await 中の `dispose()` を検出する正当な再チェックだが、TS が await を跨いで narrowing を維持するため誤検出になる。プロパティ直接参照をやめ `private isDisposed(): boolean` メソッド経由の読み取りに変える(メソッド戻り値は narrowing が持続しないため検出されない)等、構造の書き換えで解決する |

### Task 2: 置き換え実装

- [x] **Step 1: 各箇所を上表の方針で書き換え、抑制コメントを削除する**

**禁止事項:** ルール本体の off 化・severity 引き下げによる回避(migrations の設定 override(D3)は既存決定として維持)。書き換えで挙動が変わる場合はテストで挙動を固定してから行う。

- [x] **Step 2: 検証(両 app のフル品質コマンド)**

```bash
cd apps/frontend && npm run quality
cd apps/backend && npm run quality
```

期待: すべて 0 エラー・0 警告。

### Task 3: 再発防止の機械化

- [x] **Step 1: 抑制コメント自体を lint エラーにする**

`@eslint-community/eslint-plugin-eslint-comments` を両 app に導入し、`no-use`(allowWhitelistDirectives なし)で `eslint-disable` 系コメントの使用自体をエラー化する。`@ts-expect-error` 等は typescript-eslint の `ban-ts-comment`(strictTypeChecked に含まれる。`ts-expect-error` も含め全面禁止に設定を強化)で担保する。

- [x] **Step 2: 検証** 試しに `// eslint-disable-next-line` を書いた一時ファイルで検出されることを確認し、削除する

- [x] **Step 3: コミット依頼** 対象ファイルを提示し、ユーザーに `refactor: 抑制コメントを全廃し適切な実装に置き換え、再発を lint で防止` でのコミットを依頼する(git commit はユーザー特権。README の Global Constraints 参照)

## 受入基準

- [x] `grep -rn "eslint-disable\|@ts-expect-error\|@ts-ignore\|@ts-nocheck"` が両 app のソース・設定ファイルで 0 件
- [x] 抑制コメントの使用自体が lint エラーになる(再発防止が機械化されている)
- [x] 両 app の quality(lint / type-check / knip / test / build)が 0 エラー・0 警告
- [x] 実機でログイン〜3D 描画の回帰なし(BabylonRenderer 変更のため)

## 引き継ぎ事項(実行セッションが追記)

**実施日**: 2026-07-19。**結果**: 計画どおり完遂。以下は差異・追加判断・スコープ外発見。

### 棚卸し実績
- 抑制コメントは既知 2 箇所(`main.ts` / `BabylonRenderer.ts`)のみで、Phase 4〜10 での増加なし(再 grep で確認)。

### 置き換え実装(計画どおり + 補足判断)
- **`main.ts`**: `apps/frontend/src/vite-env.d.ts` に `declare module '*.vue'` shim を追加。`any` 禁止のため `DefineComponent` を**型引数省略**(全デフォルト)で返す形にした。vue-tsc(Volar)は実 `.vue` を実体解決し ambient wildcard より優先するため精密型は温存され、type-check は 0 エラー(shim による型の緩みなし)。抑制コメントと理由コメント 2 行を削除。
- **`BabylonRenderer.ts`**: `private isDisposed(): boolean` を追加し、`initialize()` 内の disposed 判定 2 箇所(入口ガード + await 後の再チェック)を method 経由に統一。`startRendering()` / `dispose()` の直読は **narrowing 問題が無く KISS のため変更しない**判断とした(method 化は await 跨ぎ対策専用)。挙動は完全に不変。await 後再チェックの設計意図コメントは抑制メカニズム言及を除いて 1 行に整理。

### 再発防止の機械化(計画どおり + 追加調整)
- `@eslint-community/eslint-plugin-eslint-comments@4.7.2` を両 app に追加。`recommended` エクスポートが legacy 形式だったため flat config では `plugins: { '@eslint-community/eslint-comments': eslintComments }` で手動登録し `no-use: 'error'` を設定。
- `@typescript-eslint/ban-ts-comment` を `ts-expect-error: true`(description ありも禁止)含む全面禁止に強化(`ts-check` は検査有効化のため許容)。
- **追加判断**: eslint 設定内の説明コメントから `eslint-disable` の文字列を除去し、受入 grep が真に 0 件になるようにした(将来の監査 grep のノイズ回避)。
- probe ファイルで両 app とも `no-use`(eslint-disable 系)と `ban-ts-comment`(@ts-expect-error)がエラー発火することを確認し削除。

### 検証実績
- 両 app `npm run quality` 全ステップ 0 エラー・0 警告(frontend test 7/7、backend test 8/8)。
- 実機(docker compose 起動): health 200 / login API 200 / frontend 200 / backend エラーログなしを CLI で確認。ブラウザ目視で WebGL2 描画・camera 操作・route 往復(dispose-during-init 経路)いずれも回帰なしをユーザー確認。

### スコープ外の発見(未対応 = Phase 11 スコープ外)
- **`apps/frontend/src/router/index.ts`**: ナビゲーションガードが非推奨の `next()` コールバック方式(行 71/77/88)を使用し、実機コンソールに `[VUE_ROUTER_R0025] next() is deprecated` 警告が出る。**`TODO` に起票済み**(vue-router 推奨の戻り値方式へ書き換え)。
- `favicon.ico` 404(favicon 未配置。軽微・無関係のため記録のみ)。
- vite dev サーバの `vitest` import pre-transform 警告(`items.store.test.ts` 由来)。test ファイルはアプリのエントリから import されず描画に非影響。Phase 4 のテスト導入時から存在する既存挙動で Phase 11 とは無関係(未対応)。
