# 作業計画書: 静的解析基盤の構築 + Claude Code 設定の移植

> **セッション運用**: この計画は 10 フェーズに分割されている。ユーザーはセッション開始時に「@prompt.md」とだけ入力する — root の `prompt.md` が「今回のセッションで実行するフェーズ」への指示書であり、そこから本 README と対象フェーズ文書(`phase-NN-*.md`)を読み込んで、そのフェーズだけを完了させること。フェーズ完了時は (1) 本 README の進捗チェックボックスを更新し、(2) フェーズ文書末尾の「引き継ぎ事項」に実績(発生した差異・追加判断)を記録し、(3) **`prompt.md` を次フェーズ実行の指示に書き換えて**からセッションを終える。
>
> **エージェント向け**: 各フェーズ実行時は superpowers:executing-plans(または subagent-driven-development)でタスク単位に実行する。作業は 3 ステップ以上あるためタスク管理ツール(TaskCreate/TaskUpdate)で全ステップを登録・追跡すること。

**ゴール:** `claude_settings/`(他プロジェクトで現役の Claude Code 設定群)を本プロジェクトに最適化して `.claude/` + `CLAUDE.md` として構築し、あわせてその設定が前提とする「強力な型安全を軸にした静的解析(自動テスト込み)」のツールチェーンを実体として整備する。

**アーキテクチャ:** 2 本柱・依存方向は「品質基盤 → 設定」。フェーズ 1〜5 で静的解析・テスト・CI を先に実体化し(設定が参照するコマンドを確定させるため)、フェーズ 6〜10 で Claude Code 設定を移植・書き換えする。設定移植は「汎用プロセス資産は移植、移植元アプリ固有資産は破棄、品質系は新ツールチェーンに合わせて書き直し」を原則とする。

**Tech Stack:** TypeScript (backend 7.0.2 / frontend 6.0.3), ESLint flat config + typescript-eslint (typed lint), Vitest, knip, GitHub Actions, Claude Code (rules / skills / commands / agents)

## Global Constraints

- 応答・ドキュメントは日本語(移植元 CLAUDE.md の方針を踏襲)
- npm パッケージは追加時点の latest を採用(README.md のバージョン方針を踏襲)。`npm install -D <pkg>@latest` で解決し、lock に固定する
- 品質基準: 全変更に対し **0 エラー・0 警告**(TypeScript / lint / テスト / ビルド)。テストの削除・弱体化でエラーを消すことは禁止
- `any` 禁止・非 null assertion (`!`) 禁止は lint でエラー強制する。`as` による narrowing 禁止はルール文書+レビューで担保(lint 強制は `as const` 等を巻き込むため)
- **`eslint-disable`(全形式)・`@ts-expect-error`・`@ts-ignore`・`@ts-nocheck` 等の抑制コメントは一切禁止**(ユーザー指示 2026-07-19)。誤検出と思われる場合もルール抑制ではなく実装側の書き換えで解決する。Phase 3 時点で存在する 2 箇所の `eslint-disable` は Phase 11(計画の一番最後)で適切な実装に置き換える
- 移植元 `claude_settings/` は**読み取り専用の参照資料**として本作業では変更しない(全フェーズ完了・検収後に削除してよい)
- root への package.json 追加(npm workspaces 化)は行わない。品質コマンドは各 app 内で完結させる
- コミットはフェーズ内の指示に従い小さく行う(git commit はユーザー承認の運用なら都度確認)

## 前提知識(全フェーズ共通のコンテキスト)

### 本プロジェクトの構成

- モノレポ風 2 app 構成(npm workspaces ではない): `apps/frontend`(Vue 3.5 + Vite 8 + Babylon.js 9 + Pinia + vee-validate/yup + ofetch), `apps/backend`(Hono 4 + @hono/zod-openapi + Kysely + PostgreSQL + MinIO + bcrypt)
- root: `compose.yml`(frontend / backend / postgres / minio)、`docker/Dockerfile.*`、`DESIGN.md`(3D 層の設計)、`VERIFICATION.md`、`README.md`。root に package.json は無い
- DB: serial PK、`timestamp`(timestamptz ではない)、デモデータを migration 内で seed
- 現状の品質基盤: backend に vitest(unit 2 ファイル、`vi.mock` で MinIO をモック済=外部接続なし)、frontend に knip のみ。**lint は両 app とも未導入**。tsconfig は `strict: true` だが強化余地あり
- git remote は GitHub (`lapinChiro/babylonjs_template`) → CI は GitHub Actions

### 移植元 `claude_settings/` の構成

- `CLAUDE.md` + `.claude/settings.json` + `.claude/rules/`(29 files) + `.claude/skills/`(18 skills) + `.claude/commands/`(2) + `.claude/agents/coder.md` + `.agents/skills/modern-web-guidance/`(汎用 Web ガイド集の vendored コーパス、`.claude/skills/modern-web-guidance` から symlink)
- 移植元プロジェクト: Vue3+Hono+PostgreSQL の「プロジェクト管理アプリ」。oxlint/ESLint 7 層 lint・Stryker mutation・PGlite 統合テスト・Storybook・Tailwind・AWS CDK・backlog/PRD ワークフローを持つ
- ルールのロード機構(移植先でも同じ): frontmatter なし rule = 常時ロード / `paths:` 付き rule = 対象ファイルを context に入れると自動ロード / skill = `/name` 呼び出し時のみ

## 決定記録(このセッションで確定した設計判断)

| # | 決定 | 理由 |
|---|---|---|
| D1 | lint は ESLint flat config + typescript-eslint の `strictTypeChecked` + `stylisticTypeChecked` に一本化(移植元の oxlint 併用構成は採らない) | 規模が小さく二重管理のコストが利益を上回る。typed lint は ESLint 側で完結できる |
| D2 | `no-explicit-any` / `no-non-null-assertion` をエラー強制。`as` narrowing 禁止は CLAUDE.md 規約+レビュー担保 | `consistent-type-assertions: never` は `as const` まで禁止してしまうため |
| D3 | `src/db/migrations/**` は `no-explicit-any` を off(`Kysely<any>` 許容) | migration は実行時点スキーマに対する操作で、現在の generated-types と型を共有しない(Kysely 公式の推奨パターン) |
| D4 | backend は tsconfig を typecheck 用(テスト含む全量)/ build 用(`tsconfig.build.json`)に分離 | テストコードも型検査対象にするため(現状はテストが型検査から漏れている) |
| D5 | frontend にテスト基盤として vitest + happy-dom を追加。当面 stores / services / renderer のロジック層を対象(Babylon Engine 実描画・Vue コンポーネント mount は対象外) | WebGL/Canvas はユニットテスト不適。テスト可能な純ロジックから floor を作る(DESIGN.md §11 の E2E 方針とも整合) |
| D6 | knip を backend にも導入し両 app 対象にする | 未使用コード検出を CI と同条件で全量化するため |
| D7 | 各 app に `quality` スクリプト(lint + type-check + knip + test + build)を設け、CI(GitHub Actions)も同一コマンドを実行 | `local-quality-mirrors-ci` ルールの前提(local と CI の同条件)を実体化する |
| D8 | backlog/PRD/plan.md/TODO ワークフロー(3 層モデル)は**採用**し、関連 rules/skills を移植する | 移植元設定の中核価値でありプロジェクト非依存の方法論。破棄すると設定群の過半が空洞化する |
| D9 | 移植元アプリのドメイン・インフラ固有 rule は破棄(下表)。うち将来検討に値するものは TODO ファイルへ種入れ | 対象実装が本プロジェクトに存在しない |
| D10 | skills / commands の model 固定(review 系 = claude-fable-5、coder/start_dev = claude-opus-4-8)は維持 | 移植元の運用実績を踏襲。変更する理由がない |
| D11 | `modern-web-guidance` は vendored コーパスごと `.agents/skills/` へコピーし symlink も再現(内容は編集しない) | 完全に汎用。Babylon.js の Canvas/UI 作業でむしろ有用 |
| D12 | 現 DB スキーマ(serial PK / timestamp 型)は本作業では変更しない。timestamptz 化・uuid PK 化は TODO へ記録 | スキーマ変更は設定構築と独立した意思決定。retroactive 適用のスコープ爆発を防ぐ |
| D13 | 抑制コメント(`eslint-disable` / `@ts-expect-error` / `@ts-ignore` 等)は全面禁止。既存分は最終フェーズ(Phase 11)で適切な実装に置き換え、以降のフェーズでは新規使用しない | lint は信頼性の高い静的解析の一翼であり、抑制コメントはそれを根本から覆すため(ユーザー指示 2026-07-19) |

## 移植マッピング表(全ファイルの処遇)

### rules(29 → 20 移植 + 9 破棄)

| 移植元 rule | 処遇 | フェーズ | 適合内容 |
|---|---|---|---|
| analysis / debugging / verification / documentation / rule-retroactive-application | コピー(ほぼそのまま) | 7 | 語句の微調整のみ |
| documentation-drift-prevention | コピー+例示調整 | 7 | `domain/` 等移植元固有の例を本プロジェクトの例に置換 |
| task-tracking | コピー+参照調整 | 7 | PRD-122 事例は背景として保持可。skill 参照は移植後の名前に一致させる |
| code-comment-quality / coverage-floor-not-ceiling / no-spec-distortion-for-tests / todo-prioritization / referent-before-label / ux-evaluation / design-quality-gates | コピー+glob・例示調整 | 7 | `infra/**`・`packages/**`・`apps/docs/**`・`domain/**` を glob から除去。design-quality-gates は移植元ドメイン例(LEADER 等)を削除 |
| backlog-layer-model / no-prd-references-in-code | コピー+glob 調整 | 7 | grep 対象を `apps/*/src apps/*/tests apps/*/scripts` に |
| testing | **書き直し** | 7 | 本プロジェクトの実態(両 app vitest unit / 外部サービスは `vi.mock` / restoreMocks)で新規作成 |
| local-quality-mirrors-ci | **書き直し(スリム化)** | 7 | 不変条件(完了根拠はフルモードのみ / 一時ファイルは gitignore / ファイル実在確認)を保持し、oxlint 事故史・git ls-files 機構の記述を除去 |
| dependencies | 適合 | 7 | latest 方針+特性テストの網は維持、Storybook 機構の節を vitest ベースに書き換え |
| soft-vs-hard-delete-policy | 適合 | 7 | glob を `apps/backend/src/db/**` に。物理削除既定の方針は現スキーマと整合 |
| tz-storage-convention | **破棄** | - | 現スキーマは `timestamp` 型で規約と矛盾。timestamptz 化検討を TODO へ(D12) |
| uuid-primary-key-generation | **破棄** | - | serial PK のため前提が成立しない。TODO へ |
| transient-schema-mismatch-policy | **破棄** | - | 独立デプロイ単位・本番運用が未存在。将来 CD 構築時に再検討(TODO へ) |
| file-size-limit-decomposition | **破棄** | - | max-lines lint 未導入のためトリガーが存在しない。lint に max-lines を足す案を TODO へ |
| authz-update-schema-audit / admin-managed-read-authz | **破棄** | - | 移植元の RBAC/admin 資産・route-helpers 前提。本プロジェクトは認可が薄い(JWT 認証のみ) |
| external-api-transport / frontend-layout-spacing / metrics-aggregation-population | **破棄** | - | Lambda transport seam / Tailwind シェル / メトリクスドメインは本プロジェクトに存在しない |

### skills(18 → 18 移植。うち 4 つは大幅書き換え)

| 移植元 skill | 処遇 | フェーズ | 適合内容 |
|---|---|---|---|
| rule-writing / rule-maintenance / investigation | コピー(ほぼそのまま) | 9 | — |
| test-design | 軽微適合 | 8 | fast-check 前提の記述を「未導入(導入時に適用拡大)」へ調整 |
| review-dev / refactoring-check | 軽微適合 | 8 | 参照 rule 名の整合のみ。model: claude-fable-5 維持 |
| review-prd | 軽微適合 | 9 | 同上 |
| tdd | 適合 | 8 | 完了処理タスク列は維持(全 skill 移植のため成立)。`apps/frontend` のテスト前提を新 vitest 構成へ |
| quality-check | **書き直し** | 8 | 新ツールチェーン(両 app の lint/type-check/knip/test/build、`quality` スクリプト)で全面書き換え。Stryker/knip-root/workspace 節を除去 |
| check-local | **書き直し** | 8 | `compose.yml`(root)・サービス名・デモログイン・Babylon 描画確認(DESIGN.md §11 のブラウザ検証 7 項目)で全面書き換え |
| todo-audit | 軽微適合 | 8 | grep 対象パスは同一(`apps/backend/src/ apps/frontend/src/`、`.ts`/`.vue`) |
| ux-design | 適合 | 10 | プロトペルソナ表を本プロジェクトの画面(LoginView / DashboardView / BabylonCanvas)で書き換え |
| backlog-management / backlog-replenishment / todo-replenishment / track-management / prd-template / prd-completion | 適合 | 9 | パス(`infra/lib`・`packages/*` 除去)、「プロジェクト管理アプリケーション」→本プロジェクトの目的文、prod デプロイ管理の記述を除去 |
| modern-web-guidance | vendored コピー | 6 | `.agents/skills/modern-web-guidance/` を丸ごとコピー+ symlink 再現 |

### その他

| 移植元 | 処遇 | フェーズ |
|---|---|---|
| CLAUDE.md | **書き直し**(構成は踏襲、内容は本プロジェクト) | 6 |
| .claude/settings.json | 適合(deny/allow 維持、bastion スクリプト等を除去、Skill allow を移植後の一覧に) | 6 |
| .claude/agents/coder.md | コピー(そのまま) | 6 |
| .claude/commands/start_dev.md, create-next-prd.md | コピー(ほぼそのまま) | 6 |
| (新規) plan.md / TODO / backlog/ の種ファイル | 新規作成 | 9 |
| (新規) .github/workflows/ci.yml | 新規作成 | 5 |

## フェーズ一覧と進捗

依存関係: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11(直列。各フェーズは前フェーズの完了を前提とする)

- [x] **Phase 1**: tsconfig 強化(両 app)+ type-check/build スクリプト整備 — `phase-01-tsconfig.md`
- [x] **Phase 2**: backend ESLint 導入+0 エラー化 — `phase-02-backend-eslint.md`
- [x] **Phase 3**: frontend ESLint 導入+0 エラー化 — `phase-03-frontend-eslint.md`
- [x] **Phase 4**: frontend vitest 導入+シードテスト — `phase-04-frontend-vitest.md`
- [ ] **Phase 5**: backend knip 導入+ quality スクリプト+ CI — `phase-05-knip-ci-quality-gate.md`
- [ ] **Phase 6**: Claude Code 基盤(settings.json / CLAUDE.md / coder / commands / modern-web-guidance) — `phase-06-claude-foundation.md`
- [ ] **Phase 7**: rules 移植(20 ファイル) — `phase-07-rules.md`
- [ ] **Phase 8**: 品質系 skills(quality-check / check-local / tdd / test-design / todo-audit / review-dev / refactoring-check) — `phase-08-quality-skills.md`
- [ ] **Phase 9**: ワークフロー層 skills + 種ファイル(plan.md / TODO / backlog/) — `phase-09-workflow-skills.md`
- [ ] **Phase 10**: UX 層(ux-design)+ 全体整合性検証 — `phase-10-ux-and-verification.md`
- [ ] **Phase 11**: 抑制コメント(eslint-disable 等)の全廃(D13) — `phase-11-remove-suppression-comments.md`

## 各フェーズ共通の完了条件

1. フェーズ文書内の全チェックボックスが完了している
2. `apps/backend` / `apps/frontend` で当該フェーズまでに導入済みの品質コマンドが全て 0 エラー・0 警告(導入前のコマンドは対象外)
3. 本 README の進捗チェックボックスを更新した
4. フェーズ文書末尾「引き継ぎ事項」に実績を追記した(差異なしなら「差異なし」と明記)
5. root の `prompt.md` を次フェーズ実行の指示に書き換えた(最終 Phase 11 完了時は「全フェーズ完了。claude_settings/ の扱い(残す/削除)をユーザーに確認する」という内容にする)
