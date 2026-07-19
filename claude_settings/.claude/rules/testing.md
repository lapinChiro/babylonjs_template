---
paths:
  - "apps/backend/tests/**"
  - "tests/**"
  - "apps/backend/src/**/*.test.ts"
  - "src/**/*.test.ts"
  - "apps/backend/src/repositories/**/*.test.ts"
  - "src/repositories/**/*.test.ts"
  - "apps/backend/vitest.config.ts"
  - "vitest.config.ts"
---

# テスト規約

## 適用条件

テストコードを新規作成または変更するとき。

## 制約

### テストの分類と配置

| プロジェクト | 配置 | 特徴 |
|-------------|------|------|
| **unit** | `src/**/*.test.ts`（repository を除く） | vi.mock 許可、process.env 操作許可 |
| **integration** | `tests/**/*.test.ts` + `src/repositories/*.repository.test.ts` | PGlite 使用、vi.mock/vi.spyOn 禁止、process.env 操作禁止 |

- Repository テスト → integration。PGlite + `TestDataFactory` を使用
- API テスト → `tests/api/`。`ApiTester` + `TestDataFactory` を使用
- 純粋ロジックテスト → unit（`src/` 配下）

### integration テストでの禁止事項（ESLint で強制）

- `vi.mock()` — モジュールモックの使用禁止（`isolate: false` でリークする）
- `vi.spyOn()` — テスト間干渉の原因
- モジュールレベルの `process.env` 操作 — 環境変数汚染

### テストデータの分離

- `TestDataFactory` で `crypto.randomUUID()` を使用 → テスト間衝突なし
- カウント系: テスト前後の差分で検証（絶対値ではなく）
- 一覧系: 作成したデータが含まれることを検証（全件一致ではなく）

### fixture / factory の型はプロダクションコードの型を使う

テストデータを生成する factory / fixture の**戻り型は、プロダクションコードが使う型を import して用いる**（frontend / backend 両層に適用）:

- frontend: `@/api`（production component が消費する wire 型の公開窓口）を import し、`make<型名>(overrides: Partial<T> = {}): T` の `T` とする（共有先 `apps/frontend/src/test-helpers/factories.ts`）
- backend: `db/types` / schema 推論型 / `NewXxx`（production が使う型）を用いる（DB INSERT 系の namespace factory `factory.<entity>.create` とその pure builder `buildNewX`、純データ系 pure `make*`）

**狙い**: プロダクション型を変更すると、factory とそれを使う全テストが**コンパイル時に追従を強制**され、「**テストが green ＝プロダクション型と整合している**」ことが型で裏打ちされる。テスト専用の手書き型を挟むと、プロダクション型と乖離してもテストが通り、この裏打ちが失われる（実在しない shape を検証してしまう）。

fixture は default 入りの最小有効インスタンスを返し、差分は `overrides` で上書きする（型 shape ＝知識を単一情報源化し、プロパティ追加時の追従を 1 箇所に集約する）。

### frontend の `@/api` mock は番兵ヘルパ（`createApiMock`）を基底にする

frontend view / component / composable テストで `vi.mock('@/api', ...)` を書くとき、**新規・改修するテストは `createApiMock`（`apps/frontend/src/test-helpers/api-mock.ts`）を基底にする**。`vi.mock` factory 内で `createApiMock(await importOriginal<typeof import('@/api')>(), overrides)` を返し、テストが使う method のみ `overrides` に渡す。未指定 method は「呼ばれたら同期 throw する番兵」になる。

**狙い**（factory 規約の mock 宣言版）: production の `@/api` に method が増えても、それを叩くのに未宣言のテストは `unmocked @/api call: <path>` の明示エラーで落ちる（従来の `undefined is not a function` の原因不明失敗を解消）。各テストは使う method だけ宣言すれば済み、mock 宣言の重複が減る。dashboard test family は共有ハーネス `test-helpers/dashboard-harness.ts` が gridstack fake / stub / `@/api` overrides を集約する（同種の高密度箇所を書くときはハーネス化を検討する）。

**漸進適用**: 既存の直書き `vi.mock('@/api')` の一括変換は行わない（YAGNI）。触れたテストを改修する機会に `createApiMock` へ寄せる。

### テストヘルパー

| ヘルパー | 用途 | 場所 |
|---------|------|------|
| `makeTestDataFactory` / 型 `TestDataFactory` | テストデータ生成（UUID で衝突回避）。`makeTestDataFactory(db)` が namespace facade（`factory.<entity>.create(...)`）を返す | `tests/helpers/test-data-factory/`（`index.ts` が facade） |
| `ApiTester` | API integration テスト用ユーティリティ | `tests/helpers/api-tester.ts` |
| `AuthHelper` | 認証ヘルパー | `tests/helpers/auth-helper.ts` |
| `TestUserHelper` | テストユーザー管理 | `tests/helpers/test-user-helper.ts` |
| `testDatabase` | PGlite インスタンス管理 | `tests/helpers/test-database.ts` |

### 非同期 UI 反映を読む assert は実条件待ち（`vi.waitFor`）

view / component テストで **ユーザー操作（`.trigger()` / component の `$emit` / `.setValue()`）の結果として反映される DOM / state / mock 呼び出しを読む assert** は、固定回数の `await flushPromises()` / `await nextTick()` の直後に即時 assert してはならない。**`await vi.waitFor(() => { expect(...) })`（条件成立まで polling）で実条件を待つ**。

理由: `flushPromises`（`setImmediate` ベース）も `nextTick`（microtask）も **1 回 await しただけでは「単一 microtask / 単一 tick を超える async」が settle しない**。高並列 CPU 競合下で wall が膨張すると、反映前の DOM/state を読む **stale-read** で非決定的に失敗する。`vi.waitFor` は条件成立まで再評価するため wall 膨張に堅牢。

**判定基準（一律変換ではない）**: assert が読む状態が以下の **macrotask 遅延**に依存するなら `vi.waitFor` 化する。依存しない（単一 microtask / 単一 tick で settle する純粋な静的描画。例: `mount` 直後の初期描画）なら据え置く（変換は churn のみで無益）:

- reka-ui（floating-ui）の open（Combobox / Select / Popover / Tooltip / Dialog / DatePicker。`setTimeout` / `requestAnimationFrame` 駆動）や Tabs/Trigger の activate
- `<Transition>` 等アニメーション後の DOM
- 単一 await で drain しきれない多段 async chain（resolve → 別の async を再 queue する連鎖。「操作 → watcher → 再 fetch / 再描画」の cascade）や、コード側の `setTimeout` / `debounce`
- 判定が曖昧な箇所は「最悪負荷下で当該 assert が落ちるか」を基準にする（落ちる = macrotask 依存 = 変換対象）

**書き換え形**: `await flushPromises(); expect(X).toBe(Y)` → `await vi.waitFor(() => { expect(X).toBe(Y) })`。複数 assert が連続するなら、timing に依存する最終状態を待つ 1 つの `vi.waitFor` に集約する。

**否定 assert（`not.toHaveBeenCalled` / `not.toContain`）の扱い**: 否定条件は最初の poll で即成立してしまい `vi.waitFor` では「まだ起きていないだけ」と区別できない。対になる **肯定の結果**（同時に起きるべき push / emit / 表示）を `vi.waitFor` で待ってから否定を assert する（肯定が settle した時点なら否定の不在は確定的）。

**fake timer（`vi.useFakeTimers()`）使用 test は対象外**: `vi.waitFor` は既定で実タイマー駆動のため fake timer 下では非互換（hang しうる）。fake timer 系 test は機械的変換から外し、flaky が観測された場合のみ個別に timer 制御を含めて是正する。

### テスト有効性の検証（カバレッジは「実行」、mutation は「検知」を測る）

カバレッジ % はテストの良し悪しを測らない。行が **実行された** ことしか保証せず、アサーションが弱くても緑になる。検出力は 2 層で担保する:

- **実行の床**: vitest coverage 閾値（`vitest.config.ts`）。CI で強制。これは最低床であり、充足は「検出力が十分」を意味しない。
- **検知の検証 (mutation testing)**: 回帰が致命的なモジュール（認可 / 日付 / 金額 / 共有純粋ロジック＝レビュー状態機械・RBAC 述語等）の unit テストは、故障注入で **生存 mutant が出ないこと** で有効性を検証する。ツールは Stryker（backend / frontend / packages/types / packages/batch-utils に導入・各 `npm run test:mutation -w <workspace>`、mutate スコープの正は各 `stryker.conf.json`）。**実行は PR CI ではなく PRD 完了処理に集約する**（コスト上 PR ゲートに乗せない）。手順は [quality-check](../skills/quality-check/SKILL.md) skill を参照。**スコープを絞る理由**: mutation はレイヤー B（アサーション強度）の唯一の検証手段だが高コストで全体適用は非現実的。回帰が致命的な基盤領域に限定して実用域に収める（捨てるのではなくスコープを絞る）。殺せない equivalent mutant（型ナローイング専用ガード・定数 data table の意味不変 mutation・到達不能 defensive throw 等）は理由を明示して break threshold で許容する（テスト不足を threshold で逃げるのは禁止）。

## 禁止事項

- integration テストに `vi.mock()` / `vi.spyOn()` を使用すること
- テスト間で可変な状態を共有すること
- テストを削除・弱体化してエラーを消すこと
- fixture / factory の戻り型に**テスト専用の手書き型・独自 interface** を使うこと（プロダクションコードの型を import して使う。プロダクション型変更のコンパイル時追従を担保するため）
- プロダクション型と**乖離した shape** の fixture を作ること（テストが実在しない形を検証することになる）
- カバレッジ閾値の充足だけを根拠に「テストは十分」と判断すること（実行 ≠ 検知。検知の検証は mutation testing で行う）
- ユーザー操作の結果（macrotask 遅延に依存する DOM / state / mock 呼び出し）を、固定回数の `flushPromises` / `nextTick` の直後に即時 assert すること（負荷下の stale-read で flaky 化する。`vi.waitFor` で実条件を待つ）
- flaky を `vi.waitFor` の timeout 延長 / `testTimeout` 引き上げ / vitest `retry` で覆い隠すこと（systemic 問題に無力 / 回帰検出力を毀損する。根本は実条件待ちへの是正）
