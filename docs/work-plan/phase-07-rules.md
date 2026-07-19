# Phase 7: rules 移植(20 ファイル)

> 前提: `docs/work-plan/README.md` と Phase 1〜6 完了。移植元: `claude_settings/.claude/rules/`(29 ファイル中 20 を移植、9 は破棄 — 処遇の正は README の移植マッピング表)

**ゴール:** `.claude/rules/` に 20 の rule を構築する。汎用 rule はコピー+調整、品質系 3 rule(testing / local-quality-mirrors-ci / dependencies)は本プロジェクトの実態で書き直す。

**作業の原則:**
- 各 rule は移植元ファイルを Read → 下記の適合指示を適用 → `.claude/rules/<同名>.md` へ Write
- frontmatter の `paths:` は**本プロジェクトに実在するパス**だけにする(`infra/**`・`packages/**`・`apps/docs/**`・`domain/**`・`TODO.dashboard` を除去)
- rule 間相互リンク(`[...](xxx.md)`)は移植 20 rule の範囲内でのみ張る。破棄 rule への参照は文ごと削除する
- 書き方の構造は `claude_settings/.claude/skills/rule-writing/SKILL.md` に従う(適用条件 / 制約 / 禁止事項 / 検証 / 関連)

### Task 1: そのままコピーする rule(5)

- [x] `analysis.md` / `debugging.md` / `verification.md` / `documentation.md` / `rule-retroactive-application.md` をコピー。コピー後に Read して移植元固有の参照が無いことを確認(事前調査では無し。verification.md の `local-quality-mirrors-ci` 参照は Task 3 で作るので維持)

### Task 2: glob・例示を調整してコピーする rule(12)

各ファイルの具体的な変更点:

- [x] **task-tracking.md**: そのまま可(PRD-122 の背景事例は移植元の事故史だが、ルール制定根拠として価値があるため「移植元プロジェクトでの事例」と明記して保持)。`/tdd` ステップ0・quality-check への参照は Phase 8 で作るため維持
- [x] **documentation-drift-prevention.md**: `domain/` bundle・`design.rbac.md` 等の事例段落を「移植元プロジェクトでの崩壊事例」と明記して保持(原則の根拠)。§5 の悪い例の `/quality-check` 参照は維持(Phase 8 で作る)
- [x] **code-comment-quality.md**: paths を `apps/**/src/**`, `apps/**/scripts/**` に(`infra/**/lib/**`, `packages/**/src/**` を削除)
- [x] **coverage-floor-not-ceiling.md**: paths を `apps/*/src/**`, `**/src/**`, `backlog/**` に(`packages/*/src/**`, `apps/backend/tests/**` を削除。本プロジェクトのテストは `src/**/*.test.ts` 同居なので `tests/**` glob は不要)
- [x] **no-spec-distortion-for-tests.md**: paths を `apps/*/src/**/*.test.ts`, `src/**/*.test.ts` に
- [x] **todo-prioritization.md**: paths は `TODO`, `TODO.archive`, `backlog/**`, `plan.md`, `**/plan.md` のまま
- [x] **referent-before-label.md**: paths から `domain/**`, `TODO.dashboard`, `apps/docs/**/*.md` を削除(`backlog/**`, `report/**`, `plan.md`, `TODO` を残す)
- [x] **ux-evaluation.md**: paths を `apps/frontend/src/views/**`, `apps/frontend/src/components/**`, `**/src/views/**` に。`frontend-layout-spacing` への参照(破棄 rule)を削除し、レイアウトの節は「ページレイアウトの一貫性は既存 View の構造を踏襲する」に置換
- [x] **design-quality-gates.md**: paths から `infra/**/lib/**`, `packages/*/src/**` を削除。移植元ドメインの具体例(LEADER・teams・role 序列等)を本プロジェクトの例(例: 「WebGL/WebGPU の 2 backend を `createEngine` の単一 seam で吸収している構造」)に置換。`prd-template` §3.2 / `refactoring-check` への link 参照は維持(Phase 8-9 で作る)
- [x] **backlog-layer-model.md**: paths は `plan.md`, `backlog/**`, `TODO`, `TODO.archive`, `**/plan.md` のまま。内容はワークフロー資産なのでほぼ無変更(「prod デプロイ管理」への言及があれば削除 — 本プロジェクトに prod 運用はまだ無い)
- [x] **no-prd-references-in-code.md**: grep cleanup の対象パス列挙を `apps/*/src apps/*/tests apps/*/scripts` に(`infra/lib`, `packages/*/src` を削除)
- [x] **soft-vs-hard-delete-policy.md**: paths を `apps/backend/src/db/**` に(`repositories/**` は本プロジェクトに無い)。`tz-storage-convention` / `uuid-primary-key-generation`(破棄)への sibling 参照を削除

### Task 3: 書き直す rule(3)

- [x] **testing.md** — 以下の内容で新規作成(移植元の PGlite/ApiTester/Stryker 構成は全て捨て、本プロジェクトの実態のみ):

````markdown
---
paths:
  - "apps/*/src/**/*.test.ts"
  - "apps/backend/vitest.config.ts"
  - "apps/frontend/vitest.config.ts"
---

# テスト規約

## 適用条件

テストコード・vitest 設定を作成・変更するとき。

## 構成

両 app とも vitest の unit テストのみ。配置は実装と同居(`src/**/*.test.ts`)。設定の正は各 app の `vitest.config.ts`(globals なし / restoreMocks: true / backend = node 環境 / frontend = happy-dom 環境)。

## 制約

1. **外部サービスに接続しない**: PostgreSQL / MinIO / HTTP API は `vi.mock` でモジュール境界をモックする(例: `apps/backend/src/utils/minio.test.ts` の `vi.mock('minio')` パターン)。ネットワーク・実 DB に触れるテストを書かない
2. **モックはモジュール境界で行う**: frontend は `@/services/*` または `./api`、backend はドライバ/SDK(`minio`, `pg`)を境界にする。内部実装の関数を spy して挙動を組み替えない
3. **テストデータの型は production 型を再利用する**: fixture の戻り値に独自型を定義しない(`import type { Item } from '@/types'` のように実型を使う)。`as` で型を握りつぶした fixture を作らない
4. **非同期 UI 状態の assert は `vi.waitFor` を使う**(マイクロタスク前提の即時 assert をしない)
5. **テスト名は「条件: 期待結果」形式**で日本語可(`describe` = 対象、`it` = 条件と期待)
6. frontend のテスト対象は stores / services / renderer の純ロジック層。Babylon Engine の実描画・Vue コンポーネントの mount はユニットテストの対象外(実機確認は `/check-local`、将来の E2E は DESIGN.md §11 の方針に従う)

## 禁止事項

- テストのために実装の仕様述語を弱めること(`.claude/rules/no-spec-distortion-for-tests.md`)
- 外部サービス接続を前提としたテスト(CI で落ちる)
- `as any` / `!` を使った fixture・assert(lint でも検出される)

## 関連

- rule: [`no-spec-distortion-for-tests.md`](no-spec-distortion-for-tests.md) / [`verification.md`](verification.md) / [`coverage-floor-not-ceiling.md`](coverage-floor-not-ceiling.md)
- skill: `/test-design`(テスト項目の洗い出し)/ `/quality-check`(実行手順)
````

- [x] **local-quality-mirrors-ci.md** — 以下の内容で新規作成(移植元の oxlint 事故史・git ls-files 機構を捨て、不変条件のみ):

````markdown
# Local quality check は CI と同じ条件・同じ file set で行う

## 適用条件

完了報告(「完了しました」「コミット可能」等)の前に local quality check を行うとき。

## 制約

完了報告前の検証は以下の不変条件を満たすこと。CI(`.github/workflows/ci.yml`)は各 app の `npm run quality` を実行しており、local も同一コマンドを根拠にする。

1. **完了根拠はフルモードのみ**: 変更ファイルに絞った lint / 影響テストのみの軽量チェック(`/quality-check` 軽量モード)は開発中の高速フィードバック専用。完了報告・CI pass の根拠にできるのは各 app の `npm run quality`(lint + type-check + knip + test + build)全通過のみ
2. **一時ファイルを lint 対象に紛れ込ませない**: 実験用・一時 `.ts`/`.vue` は gitignore 済みの場所に置くか報告前に削除する。`git status --short` で untracked を点検する
3. **検査はファイルが存在する状態で行う**: type-check / knip / test は設定の glob でファイルを列挙するため、ファイル削除後に回すと検出漏れになる。quality 実行時点の作業ツリーが commit 予定の内容と一致していることを確認する

## 禁止事項

- 軽量チェックの「0 errors」を完了報告の根拠にすること
- 「ローカルで通った」を根拠に、CI と異なる条件(コマンド・ファイルセット)のまま CI 通過を推定すること
- 一時ファイルを lint されないよう lint 設定の除外で回避すること(gitignore か削除で対応)

## 検証

- 完了報告が両 app(変更があった側)の `npm run quality` 全通過に基づいている
- `git status --short` にコミット対象外の untracked が残っていない

## 関連ルール / skill

- `.claude/skills/quality-check/SKILL.md`(具体手順)
- `.claude/rules/verification.md`(判定基準の事前定義)
````

- [x] **dependencies.md** — 移植元を Read し、以下を変更して作成: (1) paths は `package.json`, `**/package.json` のまま (2) latest 採用・互換性確認(`npm install` + type-check)の方針は維持 (3) Storybook / `storybookTest` を使う特性テストの節を「ライブラリ差し替え・挙動影響のある upgrade は、対象モジュールの vitest 特性テスト(現挙動の固定)を先に書いてから行う(/tdd の拡張適用)」に書き換え (4) 本プロジェクト固有の注意として「バージョン方針の正は README.md(Node 24 系固定・PostgreSQL 18 系・npm latest 追従)」を追記

### Task 4: 検証とコミット

- [x] **Step 1: 一覧と件数確認**

```bash
ls .claude/rules/ | wc -l   # 期待: 20
ls .claude/rules/
```

- [x] **Step 2: 破棄 rule への dangling 参照が無いことを確認**

```bash
grep -rln "tz-storage-convention\|uuid-primary-key\|transient-schema-mismatch\|file-size-limit\|authz-update-schema\|admin-managed-read\|external-api-transport\|frontend-layout-spacing\|metrics-aggregation" .claude/ CLAUDE.md
```

期待: 0 件(出たら該当参照を削除)。

- [x] **Step 3: paths glob が実在パスと整合するか確認**(各 rule の frontmatter の glob に対し、`ls` で対象ディレクトリの実在を確認。`backlog/` / `report/` / `plan.md` / `TODO` は Phase 9 で作るため未存在で可)

- [x] **Step 4: CLAUDE.md のルール索引(Phase 6 で作成)と rules の実体が一致しているか突合**(索引に載る rule 名・サマリが実体と一致。不一致があれば CLAUDE.md 側を修正)

- [x] **Step 5: コミット依頼** 対象ファイルを提示し、ユーザーに `feat(claude): rules 20 ファイルを移植(品質系 3 rule は新ツールチェーンで書き直し)` でのコミットを依頼する(git commit はユーザー特権。README の Global Constraints 参照)

## 受入基準

- [x] `.claude/rules/` に 20 ファイル。破棄 9 rule は存在しない
- [x] 全 rule の相互リンクが `.claude/rules/` 内で解決する(dangling なし)
- [x] testing / local-quality-mirrors-ci / dependencies が本プロジェクトの実コマンド・実構成のみを参照している(oxlint / Stryker / PGlite / Storybook / knip-root の残滓なし)
- [x] CLAUDE.md のルール索引と実体が一致

## 引き継ぎ事項(実行セッションが追記)

- 2026-07-19 実行。`.claude/rules/` に 20 ファイルを構築完了。計画との差異は下記 1 点のみで、成果物は計画どおり:
  - **`rule-retroactive-application.md`(Task1「そのままコピー」)を一部一般化した**: 移植元の背景段落が破棄 rule `authz-update-schema-audit` と移植元アプリ固有スキーマ名(`UpdateProjectReviewSchema` 等)を含んでおり、verbatim コピーだと受入基準「破棄 9 rule への dangling 参照 0 件」に反する。組織学習の教訓(制定と施行の乖離)は保持したまま固有名詞を除去した一般化文に書き換えた。phase 文書は「事前調査では破棄 rule 参照なし」としていたが実際は 1 件存在したため、受入基準を優先。
- Task2 の移植元アネクドート(task-tracking の PRD-122 / documentation-drift-prevention の design.rbac・`domain/` bundle 崩壊事例 / no-spec-distortion-for-tests の PRD-278)は計画どおり「移植元プロジェクトでの事例」と明記して保持。
- `design-quality-gates.md` の移植元ドメイン例(LEADER・role 序列・semi-additive メトリクス)は本プロジェクトの実構造に置換: `createEngine` の WebGL/WebGPU 単一 seam(コア+アダプタ)/ Vue-Pinia reactive state と Babylon 毎フレーム描画状態の境界(偽の対称回避)/ renderer の initialize-dispose 非対称。
- `ux-evaluation.md` の責務分界レイアウト節は「ページレイアウトの一貫性は既存 View の構造を踏襲する」に置換し `frontend-layout-spacing`(破棄)参照を全削除。
- 検証結果: rules 20 件 / 破棄 9 rule への参照 0 件(`.claude/` + `CLAUDE.md`)/ 移植元ツールチェーン残滓(oxlint・Stryker・PGlite・Storybook・knip-root)0 件 / frontmatter は本プロジェクト実在パスのみ / 相互リンクは 20 rule 内で解決(`documentation-drift-prevention.md` の `audit.md` は例示コードフェンス内で実リンクではない)/ CLAUDE.md ルール索引(常時 8 + path-scope 12 = 20)と実体が一致。
- 未解決事項: なし。skill への参照(`/tdd`・`/quality-check`・`../skills/*/SKILL.md` 等)は Phase 8〜10 で作成予定のため現時点で未解決リンクだが、これは計画上の既定挙動(参照整合の最終検証は Phase 10)。
- **Phase 8 への申し送り(スコープ外の発見)**: `phase-08-quality-skills.md` の「共通原則」に「Phase 7 の 19 rule の範囲内のみ」とあるが、Phase 7 で実際に移植したのは **20 rule**(README 移植マッピング表と一致)。Phase 8 で skill が参照してよい rule 名の母集合は `.claude/rules/` の実 20 ファイル。phase-08 文書の「19」は Phase 8 実行時に「20」へ訂正推奨。
