---
paths:
  - "apps/backend/src/apis/**"
  - "apps/backend/tests/api/**"
  - "**/src/apis/**"
---
# admin-managed リソースの read 認可方針

## 適用条件

`/api/admin/*` に write (POST/PUT/DELETE) を持つリソース (= admin-managed リソース) を新設・変更するとき。特に、その **GET (read) エンドポイントの認可レベル (baseline = 全認証ユーザー / admin)** を決める・変更するとき。

ただし本ルールが govern するのは「read を baseline にするか admin にするかが**判断対象になるマスタ/参照データ**」であり、**RBAC / 権限編集系の admin エンドポイント (roles / permission-overrides / user-effective-permissions)** は read も write も admin 専用で判断の余地が無いため**対象外**とする (RBAC の admin 専用モデルで設計確定。認可設計の正は「関連ルール / ドキュメント」節の `domain/authorization/rbac.md`)。

## 背景

admin 管理画面を `/admin/*` に集約した PRD で、frontend の管理画面を admin 限定化した際、「backend の GET 読み取りは非 admin でも叩ける」点が一見**不統一に見え、危うく GET を admin 限定化しかけた**。しかし調査の結果、read=baseline は**意図的な設計**だった: これらは非 admin の機能が消費する参照データである。一方 `review-templates` は非 admin の読み取り消費者を持たない (レビュー遂行時はサーバ側でテンプレをスナップショット解決) ため read も admin 限定。

この**判定基準が未明文化**だと、「管理画面が admin 限定だから API も admin 限定」という誤認で GET を admin 限定化し、**非 admin 機能を破壊する**事故が再発する。本ルールは判定基準を固定し、回帰テストの所在を明示する。

各リソースの read 認可・非 admin 消費者・authz 回帰テストの所在は下記**監査表**を単一の正とする (本節に例示を再列挙すると表との二重管理になり、片方だけが更新されてリソースを取りこぼす)。

## 制約

admin-managed リソースの read 認可は以下で決める:

1. **write は常に `/api/admin/*` (adminMiddleware で admin 限定)**。
2. **read は「非 admin の frontend 機能がそのデータを読むか」で決める**:
   - 読む → **baseline** (`/api/<resource>` で全認証ユーザーが GET 可)
   - 読まない → **admin** (`/api/admin/<resource>` で GET も admin 限定)
3. read 認可を決定/変更したら、**判定根拠 (どの非 admin 機能が消費するか、または「消費者なし」) を当該 `apis/<resource>.ts` の doc コメントに記し、本ルールの監査表を更新する**。
4. **authz 回帰テストを必ず持たせ、その所在を監査表に明記する**。共有の集約先と、リソース自身の `*.test.ts` のどちらでもよいが、監査表で実際の所在を追跡可能にすること:
   - write 非 admin → 403: 共有 `tests/api/auth-authorization.test.ts` の `adminEndpoints`
   - read=admin の GET 非 admin → 403: 同 `adminEndpoints` (GET エントリ)
   - read=baseline の GET 非 admin → 200: 当該リソーステスト (`<resource>.test.ts` の「非 admin GET 200」)
   - 未認証 401: 共有 `tests/api/auth-unauthenticated.test.ts` の `protectedEndpoints`、**または**当該リソーステスト (例: `reviewers` の 401 は `reviewers.test.ts` 内)

   注: 401/403 を共有配列 (`adminEndpoints`/`protectedEndpoints`) に集約するか各リソーステストに置くかは既存実装でリソース別に分かれている。本ルールは所在の統一を強制せず、**監査表で所在を正確に cite する**ことを要求する。

認可の最終ガードは backend middleware が担い、frontend は表示制御のみ (route guard 等) で security を持たせない。

## 監査表

**母集団**: `/api/admin/*` に **write (POST/PUT/DELETE) を持つ**リソース。`/api/admin/*` にあっても **write を持たない read-only エンドポイント (例: `/api/admin/review-statistics`) は本ルールの適用条件外ゆえ行を持たない**。RBAC / 権限編集系は「適用条件」節のとおり対象外。

**doc コメントと本表の役割分担**: read 認可の判定根拠は当該 `apis/<resource>.ts` の doc コメント (コードに co-locate し同じ編集で追従する) を**一次根拠**とし、本表は**リソース横断で baseline の妥当性を比較するためのビュー**とする (制約 3 番の構造)。

**テスト所在の記法**: **共有 403** = `tests/api/auth-authorization.test.ts` の `adminEndpoints` / **共有 401** = `tests/api/auth-unauthenticated.test.ts` の `protectedEndpoints`。リソーステストは `apps/backend/tests/api/` 配下。**行番号は書かない** (テスト編集で drift するため、ファイル名 + 配列名で cite する)。**(master 導出)** = `tests/helpers/admin-managed-masters.ts` の `ADMIN_MANAGED_GLOBAL_MASTERS` から write エントリが自動導出され `adminEndpoints` へ合流する (手で登録しない)。

| リソース | read 認可 | 非 admin 消費者 (または「なし」) | authz 回帰テスト所在 |
|---|---|---|---|
| `users` | baseline | プロジェクト作成/編集のメンバー選択・チームメンバー追加・ユーザー一覧 | write 403 = 共有 403 / GET 200 = `users.test.ts` / 401 = 共有 401 |
| `teams` | baseline | チーム一覧・チーム詳細・ダッシュボードのチーム軸・プロジェクト一覧のチーム絞り込み | write 403 = 共有 403 / GET 200 = `teams.test.ts` / 401 = 共有 401 |
| `team-users` | baseline | チーム詳細のメンバー表示・メンバー編集・プロジェクト一覧のチームメンバー解決 | write 403 = 共有 403 / GET 200 = `authz-list-filter.test.ts` (一覧)・`team-users.test.ts` (uuid 指定 / ネスト) / 401 = 共有 401 (一覧・write)・`team-users.test.ts` (uuid 指定 / ネスト) |
| `remark-tags` | baseline | サービスへのタグ付与 | write 403 = 共有 403 (master 導出) / GET 200 = `remark-tags.test.ts` / 401 = 共有 401 |
| `holidays` | baseline | ガント・スケジュールの営業日ハイライト・空き時間カレンダー | write 403 = 共有 403 (master 導出) / GET 200 = `holidays.test.ts` / 401 = 共有 401 |
| `sheet-destination-folders` | baseline | プロジェクト作成/編集の作成先フォルダ選択 | write 403 = 共有 403 (master 導出) / GET 200 = `sheet-destination-folders.test.ts` / 401 = 共有 401 |
| `meeting-rooms` | baseline | 同期レビューの空き時間検索でレビュー提出者が会議室を選択 | write 403 = 共有 403 (master 導出) / GET 200 = `meeting-rooms.test.ts` / 401 = 共有 401 |
| `project-kind-review-configs` | baseline | プロジェクト詳細・スケジュール表示でのレビュー実施要否 (`review_enabled`) の解決＝レビュー起票導線の出し分け (フェーズ列初期化は概念A の `project-kind-phase-presets` が担い、本リソースではない) | write 403 = 共有 403 (master 導出) / GET 200 = `project-kind-review-configs.test.ts` / 401 = 共有 401 |
| `project-kind-phase-presets` | baseline | プロジェクト作成フォームの種別フェーズ列初期化 | write 403 = 共有 403 (master 導出) / GET 200 = `project-kind-phase-presets.test.ts` / 401 = 共有 401 |
| `custom-metric-definitions` | baseline | ダッシュボード「ウィジェット追加」選択肢への定義の動的合流・式ウィジェット builder のオペランド語彙 (`/builtin` = 組み込み定義のメタ・write なし) | write 403 = 共有 403 (master 導出) / GET 200 = `custom-metric-definitions.test.ts` (本体 + `/builtin`) / 401 = 共有 401 |
| `reviewers` | baseline | レビュー提出時のレビュアー選択 (利用可能レビュアーの取得) | write 403 = 共有 403 (`/api/admin/reviewers/bulk-update`) / GET 200 = `reviewers.test.ts` / 401 = 共有 401 (write)・`reviewers.test.ts` (GET) |
| `review-templates` | **admin** | **なし** (レビュー遂行時はサーバ側でテンプレをスナップショット解決するため、非 admin 機能はテンプレ本体を読まない。消費者は管理画面のみ) | write 403 + GET 403 = 共有 403 / 401 = 共有 401 |
| `review-template-assignments` | **admin** | **なし** (同上・消費者は管理画面の割当設定のみ) | write 403 + GET 403 = 共有 403 / 401 = 共有 401 |

`Team` / `TeamMembership` は `RBAC_ENFORCED_RESOURCES` (`packages/types/src/rbac.ts`) に含まれず `can()` を経由しない binary gate (認証済みなら read 可・write は adminMiddleware) である。よって `teams` / `team-users` の read 認可は role grant 編集の影響を受けない。

## 禁止事項

- **「frontend 管理画面が admin 限定だから」だけを根拠に read を admin 限定化すること** (非 admin 消費者の有無を確認せよ。確認せず admin 化すると非 admin 機能が壊れる)。
- 非 admin 消費者の有無を確認せずに read 認可を決めること。
- read=admin にしたリソースの **GET 非 admin 403 を `adminEndpoints` に登録しないこと** (read=admin の回帰が無保護になる)。
- read 認可の**判定根拠を doc コメント / 監査表に残さないこと**。
- read=baseline を「不統一」と見なして説明なく admin へ寄せること (本ルールの監査表で baseline の根拠を確認してから判断せよ)。

## 検証

- `/api/admin/*` に write を持つ各リソースについて、GET の認可 (baseline/admin) と非 admin 消費者 (または「なし」) が本ルールの監査表に記載されている。
- 監査表の各行のリソースが、対応する `apis/` の doc コメントに本ルールを引用した判定根拠を持つ (制約 3 番の一次根拠と本表の整合)。**判定はリソース単位で行う** — `grep -rl "admin-managed-read-authz" apps/backend/src/apis/` はファイル単位だが、**リソースとファイルは 1:1 でない**ため件数は一致しない (`review-templates` / `review-template-assignments` は 2 リソースで同一ファイル / `reviewers` は 1 リソースが read と admin write でファイルに割れる)。件数の一致を確認条件にしないこと。
- read=admin リソースの GET が `adminEndpoints` にあり、`it.each` の「非 admin → 403」で検証される。機械的確認:

  ```bash
  # adminEndpoints に review-templates 系 GET (read=admin) が登録されている
  grep -nE "method: 'get'.*review-template" apps/backend/tests/api/auth-authorization.test.ts
  # → 期待: review-templates / review-template-assignments の GET エントリが存在

  # 新規 admin-managed リソースの write が adminEndpoints に登録されている
  # (`<new-resource>` は実際のリソース名に置換して実行する。そのままでは常に 0 件)
  grep -nE "/api/admin/<new-resource>" apps/backend/tests/api/auth-authorization.test.ts
  ```


## 関連ルール / ドキュメント

- [`rule-retroactive-application.md`](rule-retroactive-application.md) (本ルール制定時の遡及適用)
- [`authz-update-schema-audit.md`](authz-update-schema-audit.md) (mutable フィールドの認可監査)
- RBAC/権限編集系 (対象外) の認可設計: [`domain/authorization/rbac.md`](../../domain/authorization/rbac.md)
- 共有テスト所在: `apps/backend/tests/api/auth-authorization.test.ts` (`adminEndpoints` = 非admin 403) / `auth-unauthenticated.test.ts` (`protectedEndpoints` = 未認証 401)。ただしリソースによっては自身の `*.test.ts` で authz を検証する (監査表の「authz 回帰テスト所在」列が各リソースの実所在)
