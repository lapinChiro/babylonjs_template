# CLAUDE.md

プロジェクト管理アプリケーションのモノレポ。

私への応答は必ず日本語にしてください。

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite + Tailwind CSS 4 + reka-ui 2
- **Docs**: VitePress（利用者向けマニュアル `apps/docs/`、同一ドメイン `/docs` 配信）
- **Backend**: Hono + Node.js + TypeScript + Kysely (PostgreSQL)
- **Database**: PostgreSQL 17 (PGlite for testing)
- **Infrastructure**: AWS CDK (CloudFront + S3 + API Gateway + Lambda + RDS)
- **Development**: Docker Compose

## Key Commands

> 品質チェック（lint / type-check / knip / test / mutation）の手順とコマンドは **/quality-check** を参照。各 workspace の全 script の正は各 `package.json`。本節は「まず動かす」ための起動・ビルド・DB・docker の最小セットのみを示す。

### Backend (apps/backend/)

```bash
npm run dev           # tsx watch (port 3000)
npm run build         # TypeScript compilation
npm run migrate       # Run DB migrations
npm run generate-types # Kysely codegen from DB schema
```

### Frontend (apps/frontend/)

```bash
npm run dev           # Vite dev server (port 5173)
npm run build         # type-check + build
npm run storybook     # Storybook dev server (port 6006)
```

### Batch Apps / Shared Packages

Batch apps (`apps/github_issue_fetch_batch/`, `apps/github_four_keys_fetch_batch/`) と shared packages (`packages/batch-utils/`) は `build` / `lint` / `type-check` / `quality` / `test` を共通に持ち、batch apps はさらに `dev` を持つ。`quality` の中身は batch apps が type-check + lint + test、shared packages が type-check + lint。

### Root Level

```bash
npm run dev            # Docker + Backend + Frontend concurrently
npm run db:migrate     # Run database migrations
npm run db:psql        # Open PostgreSQL console
```

### Docker

```bash
docker compose -f docker/compose.yaml up -d    # Start
docker compose -f docker/compose.yaml down      # Stop
docker compose -f docker/compose.yaml logs -f   # Logs
```

**Services**: PostgreSQL (port 5435), Backend (port 3000), Frontend (port 5173), Docs (VitePress, port 5174), github_issue_fetch_batch, github_four_keys_fetch_batch

**node_modules 隔離（host clean install 保護）**: 全 node サービスはコンテナ内 `npm install` の産物（root 所有）を host の `node_modules` に漏らさないよう、root と per-app の `node_modules` を匿名 volume で mask している（`docker/compose.yaml`）。これにより host の `rm -rf node_modules && npm install` が EACCES で壊れない。**運用注記**: 匿名 volume 内の `node_modules` は依存（`package.json` / lock）変更時に stale になりうる。各サービスは起動時に `npm install` するため通常は `up` で追従するが、依存削除や厳密な再現が要るときは `docker compose -f docker/compose.yaml up --renew-anon-volumes` か `docker compose -f docker/compose.yaml down -v` 後に `up` する。

## Architecture

### Monorepo Structure

- `apps/` — 実行アプリ（`backend` = Hono API / `frontend` = Vue SPA / `docs` = VitePress マニュアル / 各種 batch Lambda / `proxy-lambda` / tools 等。一覧は `ls apps/`）
- `packages/` — ワークスペース共有パッケージ（型・ユーティリティ等。一覧は `ls packages/`）
- `infra/` — AWS CDK インフラ定義

ドメインの意味・関係・生産性計測の不変条件は **[`domain/`](domain/index.md)**（OKF 形式の知識バンドル）を参照。各レイヤーの責務は以下の責務テーブルを参照。

### Backend (apps/backend/src/)

| ディレクトリ | 役割 |
|-------------|------|
| `apis/` | APIエンドポイントハンドラ（リソース別ハンドラ + 内部API。正確な一覧は `src/apis/` を参照） |
| `routes/` | ルート登録（auth / internal / google 連携認証 等。一覧は `src/routes/` を参照） |
| `repositories/` | データアクセス層（一覧は `src/repositories/` を参照） |
| `services/` | ビジネスロジック層 |
| `schemas/` | Zodバリデーションスキーマ |
| `middleware/` | 認証・エラーハンドリング・バリデーション・OpenAPI 設定等（一覧は `src/middleware/` を参照） |
| `db/` | Kysely接続、マイグレーション（`db/migrations/`）、型定義 |
| `auth/` | Google OAuth + JWT + 内部IAM認証 |
| `errors/` | カスタムエラー型 |
| `types/` | TypeScript型定義 |
| `utils/` | logger / 日付・route・crud ヘルパー / env / secrets 等の横断ユーティリティ（一覧は `src/utils/` を参照） |
| `testing/` | テスト支援（外部 API の MSW handler `external-api-mock/` / `fakes/`） |
| `dev/` | ローカル開発用エントリ（`tsx watch` 起動） |

**API実装パターン**: `@hono/zod-openapi` の `createRoute` でOpenAPI駆動のルート定義。CRUDエンドポイントは `utils/route-helpers.ts` のヘルパーを使用可。

**主要APIカテゴリ**: users, teams, offerings, projects, metrics (daily / catalog / values / evaluate), custom-metric-definitions (admin 定義カスタムメトリクス・dry-run validate・組み込み定義メタ), reviews, review-templates (種別×フェーズ割当), remark-tags, repositories, user-time-trackings, internal (issues/projects)

### Frontend (apps/frontend/src/)

| ディレクトリ | 役割 |
|-------------|------|
| `views/` | ページコンポーネント |
| `components/` | ドメインコンポーネント + `base/`（reka-uiベース） |
| `composables/` | Vue Composables |
| `api/` | APIクライアント層 |
| `router/` | Vue Router設定 |
| `types/` | 型定義 |
| `utils/` | ユーティリティ |

## Core Principles

以下の4原則を常に遵守すること:

- **KISS**: 過剰設計を避けよ。最小限の複雑さで現在の要件を満たすこと。
- **YAGNI**: 要求されていない機能・改善・拡張を作るな。今必要なものだけを実装せよ。
- **DRY + 直交性**: DRYは「知識の重複」を排除する原則であり、「コードの見た目の重複」を排除する原則ではない。共通化によってモジュール間の結合が増えるなら、重複を残せ。逆に、見た目が違っても抽象度を上げると同一の知識（同一の規則・不変条件）である場合は、コア + アダプタで知識部分を統一せよ。判定は双方向とも、差分が「射影・評価時点・文脈」か「規則そのもの」かを分類してから下す（手順の正は `design-quality-gates` rule）。
- **対称性**: 抽象レベルで同一視すべきものは同一の構造・扱いで表現せよ。扱いを変えるなら、それは抽象レベルの実際の差異を反映していなければならない。恣意的な非対称（同種なのに片側だけ実装・兄弟なのに別の形）も、別物を無理に揃える偽の対称も排除せよ。

## ルール索引（編集時に自動ロードされる path-scope rule）

以下 17 rule は **対象ファイルを context に入れると自動ロード**される（frontmatter の `paths` で scope。索引に glob は載せない＝二重管理回避）。命令形サマリのみ示す。詳細は各 rule 本文を正とする。

| rule | 編集時にすべきこと（命令形） |
|---|---|
| **authz-update-schema-audit** | **`apis/` に認可（`assert*` 等）を追加したら、同リソース UpdateSchema の mutable フィールド（scope 解決キー / 外部参照 uuid）を必ず監査**し、PUT 経由の scope escape を閉じる。 |
| **admin-managed-read-authz** | `/api/admin/*` に write を持つリソースの **read 認可は「非 admin 機能が読むか」で baseline/admin を決め**、authz 回帰テストを持たせる。 |
| **tz-storage-convention** | datetime=**TIMESTAMPTZ** / date=**DATE(string)** / audit timestamp は **DB 側生成**（JS の `new Date()` 禁止）/ JST 解釈は `toJstDateString` か `AT TIME ZONE 'Asia/Tokyo'` 1 段。 |
| **uuid-primary-key-generation** | 独立生成の uuid 単一主キーは **DB 側 `DEFAULT gen_random_uuid()` を宣言**（FK 兼用の共有 PK・複合/自然キーは対象外）。アプリの `randomUUID()` 明示渡しは許容（DB は backstop）。enforcement は実 DB introspection メタテスト。 |
| **soft-vs-hard-delete-policy** | エンティティテーブルの削除は**物理削除が既定**（CASCADE 除去・個別根拠コメント不要）、**論理削除は例外**で「削除後も参照・名前解決・監査追跡が要る」場合のみ採用し根拠を migration に co-locate。association/child/history は対象外。判断依存ゆえメタテストは持たず review 依存。 |
| **transient-schema-mismatch-policy** | wire 契約 / DB スキーマ変更時、**deploy 過渡期の frontend↔backend / backend↔DB 不整合は許容**し互換シム・旧形式二重受理・移行フラグを入れない（「後方互換」を受入条件・pin にしない）。**DB に保存されたデータの正しさは保証**＝不変条件は DB 制約で backstop・適用前監査・順序制約は保存データの正しさに必要な時だけ。 |
| **external-api-transport** | 外部 HTTP は **`utils/external-http.ts` seam 経由**（`isLambda` 分岐 / `fetch` 直書き禁止）、mock は **MSW handler 共有**、dev/test は production build から除外。 |
| **no-prd-references-in-code** | src / tests / scripts / infra のコメント・テスト名・ファイル名に **PRD 番号を残さない**（設計意図のみ）。完了時に grep cleanup。 |
| **code-comment-quality** | コメントは**コードから読み取れないこと（制約・不変条件 / 設計意図 / 外部要因）のみ**書く。コードの言い換え・変更経緯・管理用番号は書かず、実装変更時は周辺コメントを同時に追従（stale 即修正 or 即削除）。 |
| **file-size-limit-decomposition** | `max-lines` 超過は **行数稼ぎ（inline 化 / コメント削除）でなく凝集単位の本質的分割（+ テスト）か TODO 起票**で応える。 |
| **frontend-layout-spacing** | View / `AppLayoutView` 編集時、**ページ幅・縦 spacing（8pt）・下余白はシェルに委譲**、sidebar は固定幅 flex（`w-56` + `<aside>`）。 |
| **ux-evaluation** | View / component の user-facing UI 編集時、**UX floor（状態視認性=loading/空/エラー・破壊操作の確認 UI・一貫性・a11y baseline=キーボード/label/色非依存）を満たす**。レイアウトは `frontend-layout-spacing` が担い、フル評価（10原則・認知的ウォークスルー・a11y 手動）は `/ux-design` review に委譲。 |
| **documentation-drift-prevention** | CLAUDE.md / plan / backlog / TODO / report / rule で **関数名・件数・具体構文を自然文で再列挙しない**（source 参照 / 件数表 / 不変性 / 自己宣言 / 常時ロード文書は source・skill へ委譲）。 |
| **rule-retroactive-application** | `.claude/rules` / `.claude/skills` **新規作成**時は、**本体 + 既存コードへの遡及適用（+ 分割時は TODO 起票）を同時に**。 |
| **backlog-layer-model** | `plan.md` / `backlog/` / `TODO` / `TODO.archive` 編集時、**三層構造 + 退避層の役割・「TODO 出口は 2 つだけ」・層間整合の不変条件を維持**（完了痕跡は index の番号+短タグ・第 3 の出口禁止）。操作手続きは `backlog-management` skill。 |
| **metrics-aggregation-population** | メトリクス集計（metrics service / issues・issue-logs repository / completed-estimate）編集時、**分子と分母の母集団を一致** / **組織視点（Issue ユニーク）と個人視点（assignee 単位）を区別** / **snapshot 時点と最新値を明示**し、新規 productivity 指標は監査表へ追記。 |
| **referent-before-label** | 設計文書・PRD・調査報告・マニュアル・TODO 起票・命名時、**語より先に指示対象を固定**する。文書級は対応表（referent table）を本文より先に scratchpad へ独立保存し、初出定義のない造語・作業ラベル（目的・対象を省いた抽象名詞句）・一語多役を置かない。 |

この 17 rule に加え、以下も path-scope で遅延ロードされる: `testing`（test 編集時）/ `no-spec-distortion-for-tests`（test 編集時。テストのために仕様を歪めない＝フレーキー等は原因〔環境・ハーネス〕を直し、assertion の仕様述語を弱めない）/ `dependencies`（`package.json` 編集時）/ `design-quality-gates`（`**/src/**` 等コード編集時。KISS/YAGNI/DRY・対称性・直交性・結合度の判断軸 + 割れ窓調査観点。`prd-template` §3.2 / `refactoring-check` 等からも link 参照）/ `coverage-floor-not-ceiling`（`**/src/**`・`backlog/**`・`tests/**` 編集時。列挙した観点・確認項目は最低限の floor＝十分条件でない、対象固有リスクから動的に追加。`review-dev` / `review-prd` / `check-local` / `verification` からも link 参照）/ `todo-prioritization`（`TODO` / `TODO.archive` / `backlog/**` / `plan.md` 編集時。優先順位付けの 3 軸 = 直接的価値・レバレッジ・伝播防止）。常時ロードの broad rule: `verification` / `debugging` / `documentation` / `analysis`（分析＝観点を生成して対象を理解する場面の螺旋手順）/ `local-quality-mirrors-ci` / `task-tracking`（PRD 着手・複数ステップ作業はタスク管理ツールで全ステップを追跡）。

## Testing

テストは **unit**（`src/**/*.test.ts`、repository 除く）と **integration**（`tests/**` + `src/repositories/*.repository.test.ts`、PGlite 使用）の 2 プロジェクト構成（`vitest.config.ts` が正）。配置規約・`vi.mock` 可否・`TestDataFactory` / `ApiTester`・外部 API の MSW スタブ・TZ 制御等の詳細は、**test 編集時に自動ロードされる** `.claude/rules/testing.md`（テスト全般）/ `.claude/rules/external-api-transport.md`（外部 API。services/utils/testing 編集時に自動ロード）を正とする。

ローカル動作確認用の seed / 補助スクリプト (JWT 発行・各種 seed) は [apps/backend/scripts/README.md](apps/backend/scripts/README.md) を参照。

## Code Conventions

- `any` 型の使用禁止 — 適切な型を定義すること
- 非null assertion (`!`) の使用禁止 — 適切なnullチェックを行うこと
- production コードでは `T | undefined` 等を `as T` で narrow することも禁止（`!` と同様に実行時検査を伴わず null / undefined を消す断定のため）。正しい代替は**型ガード**または**明示 throw**。oxlint が `non-nullable-type-assertion-style` で「`!` を使え」と提示しても従わないこと（両ルールの同時有効化は意図的な構成）
- ESLint 7 層型安全構成（typed-linting は oxlint へ移譲）。設定の正は root の `eslint.config.base.mjs` / `oxlintrc.base.json` と各 workspace 設定（`apps/frontend` は Vue 専用。standalone は `apps/backend` / `apps/frontend` の `.oxlintrc.json` の 2 つ、他の workspace は `oxlintrc.base.json` を extends。正は各 workspace の設定ファイル）
- ES Modules (`"type": "module"`)

## Quality Standards

全ての変更に対し **0エラー・0警告** を維持すること:

1. TypeScriptエラー 0件
2. lint エラー・警告 0件
3. テスト全件合格
4. ビルド成功

**今回の変更に起因しないエラーも修正すること。**
テストを削除・弱体化してエラーを消すことは禁止。

## Gotchas

- 静的解析の出力確認は、必ずファイルにリダイレクトしてから Read ツールで確認する。`tail` や `grep` でのフィルタリングは出力が切れるリスクがあるため禁止

  ```bash
  npm run lint > /tmp/lint-result.txt 2>&1
  npx tsc --noEmit > /tmp/typecheck-result.txt 2>&1
  ```

- Node.js >= 24.15.0 が必要

- 長時間コマンド（mutation テスト・full build 等）は `run_in_background` で実行し**完了通知を待つ**。`while ps aux | grep ...; do sleep; done` 型の手動ポーリングは書かない（待機ループ自身が `ps aux` に自己マッチして無限ループ化する。`[s]` bracket トリックでも親 shell は除外不可）。存在判定が要るなら PID 直接指定 / `pgrep -x <名>` / マーカーファイルで

## モデル運用

メイン会話は常に Opus(正は `.claude/settings.json` の `model` / `fallbackModel`)。**コーディング作業(実装・コード編集・テスト実行・調査のための大量ファイル読み込み)は `coder` サブエージェント(Opus)へ委譲する**。設計判断・タスク管理・レビュー・評価はメインで行う。スキル/コマンド単位のモデル固定は各 frontmatter が正。セッション途中の `/model` 切替はキャッシュ無効化を伴うため原則行わない。

## ワークフロー

以下の状況では対応する Skill を必ず呼び出すこと:

- 新機能・バグ修正の着手 → /tdd
- テストコードを新規作成・変更する前 → /test-design (= /tdd 内のステップ 1 で必須呼出、独立利用も可)
- UI（frontend View / インタラクティブ component）を伴う機能の着手・PRD 作成時 → /ux-design discovery（テスト設計と並ぶ前さばき。UI を伴う変更の完了処理時は /ux-design review）
- 作業完了時（コミット前） → /quality-check
- 機能追加完了後 → /refactoring-check
- 開発セッションの最後（コミット前） → /todo-audit
- backlog/ の操作 → /backlog-management
- backlog/ が空で作業依頼を受けた → /backlog-replenishment
- PRD の作成 → /prd-template
- PRD の完了処理（全作業完了・コミット前） → 完了処理タスク列（refactoring-check / review-dev /〔UI を伴う変更のみ〕ux-design review / quality-check / todo-audit / check-local / prd-completion）を着手時に /tdd ステップ0 で登録し順に実行する。**列の登録・順序の正は /tdd ステップ0**。/prd-completion は列の最終タスク（PRD/TODO/plan.md ファイル処理 + PRD 番号 cleanup + 完了報告）
- TODO が空で作業依頼を受けた → /todo-replenishment
- 調査タスク → /investigation
- ルールの作成・変更・削除 → /rule-maintenance（操作の入口。個別レビュー + 全体統合チェック。1 ルールの書き方＝構造・記法は、この中で /rule-writing を参照する）

## 行動規範

- **判断軸のある質問**: 選択肢・メリデメ・推奨案を提示して確認する。「これでよいですか？」のような判断軸のない質問をしない。自分で判断できることは判断して進める
- **後回しの記録**: スコープ外の課題を発見したら、内容と理由を `TODO` に詳細に記録する
- **ドキュメント同期**: コード変更時に plan.md, README.md, CLAUDE.md, doc コメントが不正確になっていないか確認・更新する

## 自発的改善の原則

問題や不整合を発見したら、ユーザーに指摘される前に自発的に調査・修正すること。これはツール固有の話ではなく、開発全般に適用される原則である:

- 警告・エラー・不整合を「一時的な問題」として安易に無視しない
- 問題の根本原因を特定してから対処する
- 開発環境・ツールチェインの問題も自分の責任範囲として扱う
- 「動いているから良い」ではなく「正しい状態か」を基準にする

## 学習プロトコル

ユーザーからClaude自身の挙動に関する修正指示を受けたとき:

1. 指示を一般化・抽象化する（特定のケースではなくパターンとして）
2. 保存先を判断する:
   - プロジェクト固有の制約 → `.claude/rules/` に追記または新規作成
   - プロジェクト固有の手続き → `.claude/skills/<name>/SKILL.md` に作成
   - 個人的な好み → `~/.claude/CLAUDE.md` に追記
3. 書き込む内容と保存先をユーザーに提示し、確認を得てから書き込む
