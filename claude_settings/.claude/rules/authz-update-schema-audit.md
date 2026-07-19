---
paths:
  - "apps/backend/src/apis/**"
  - "apps/backend/src/schemas/**"
  - "apps/backend/src/utils/route-helpers.ts"
  - "apps/backend/src/middleware/authz.ts"
  - "**/src/apis/**"
  - "**/src/schemas/**"
  - "**/middleware/authz.ts"
---
# 認可追加時の UpdateSchema 監査

## 適用条件

API エンドポイントに認可（assert* ヘルパー呼び出し、ロールベース検証、所属検証など）を追加・変更するとき。

## 背景

PRD-1 で `PUT /api/project-review-reviewees` の `project_review_uuid` mutable による **C1 クロスプロジェクト scope escape** を閉塞した。その直後の PRD-2 で、**同型の穴を `PUT /api/project-review-reviewers` に残した**（レビューで発見・修正）。いずれも「POST に認可を追加したが、PUT で同じ scope 属性を書き換え可能であることを見逃した」というパターン。

認可ロジックが「既存レコードの属性」を読んで scope 判定する場合、PUT で属性を書き換えれば scope 判定を迂回できる。これは **Cross-Object Reference Tampering** として知られる OWASP レベルの脆弱性パターン。

## 制約

POST ハンドラに認可検証（`assert*`, ValidationError for business rule, etc.）を追加・変更したときは、同一リソースの **Update スキーマ（`Update*Schema` / `Patch*Schema`）で mutable な全フィールド** を監査し、以下のいずれかを満たすこと:

1. **scope / 制約に関わるフィールドは Update スキーマに含まない**（削除する）
2. **Update ハンドラでも同等の検証を行う**（POST と同じ assert 呼び出し + 新旧値両方に対する scope 再判定）
3. **PUT エンドポイント自体を提供しない**（`registerCrudRoutes` の `schemas.update` と `handlers.update` を共に省略）

### 監査対象フィールドの典型

| カテゴリ | 例 | 理由 |
|---|---|---|
| **scope 解決キー** | `project_uuid` / `project_review_uuid` / `team_uuid` | authz ヘルパーの引数になる。変更されれば authz が的外れの scope で通過する |
| **外部参照 uuid** | `user_uuid` / `reviewer_user_uuid` / `reviewee_user_uuid` | 参照先ユーザーの属性（ロール、メンバーシップ）に依存する制約（プロジェクトメンバー要件 等）を迂回される |
| **不変条件保持フィールド** | `owner_user_uuid` / `created_by_user_uuid` | 作成者の identity を書き換えると監査追跡性が壊れる |

### 実装パターン（クロスプロジェクト scope escape 対策と共通）

PUT 廃止が選択された場合:

```typescript
// schemas/<resource>.ts
// 更新スキーマは意図的に提供しない（同型の scope escape 対策）。
// <resource> record は immutable な紐付けであり、PUT による mutation は
// (a) scope 解決キー変更によるクロスプロジェクト scope escape、
// (b) 外部参照 uuid 変更による制約（プロジェクトメンバー要件 等）の迂回、を招く。
// 変更したい場合は DELETE + POST で表現する。
```

```typescript
// apis/<resource>.ts
function build<Resource>CrudHandlers(repository) {
  const base = createCrudHandlers<T>(repository)
  // 意図的に update を含めない: PUT エンドポイント廃止
  return { getAll: base.getAll, getById: base.getById, create, delete: remove }
}

registerCrudRoutes(app, {
  basePath: '...',
  schemas: {
    entity, create, list, params,
    // update を省略することで PUT route は登録されない
  },
  handlers: buildCrudHandlers(repository),
})
```

### regression test の必須化

PUT 廃止が選択された場合、以下 3 種のテストを該当リソースの authz テスト（`tests/api/authz-<resource>.test.ts`、例: `authz-review-reviewer-assignment.test.ts` / `authz-project-review-reviewees.test.ts`）に追加する:

1. **admin による単純な PUT**: 200 が返らないことを確認（`expect(response.status).not.toBe(200)`）+ record が実際に変更されていないことを DB 経由で確認
2. **クロスプロジェクト scope escape 攻撃**: project A のリーダーが PUT で project B へ move を試み、200 が返らない + レコードは A に残ることを確認
3. **制約迂回攻撃**: 非 admin が PUT で制約対象（例: プロジェクトメンバー要件）をセットしようとしても 200 が返らないことを確認

## 禁止事項

- POST に認可を追加した後、Update スキーマの mutable フィールドを監査せずに PR を出すこと
- 「scope 解決キーは通常書き換えないだろう」と *前提* して Update スキーマに残すこと（攻撃者は前提を裏切る）
- PUT 廃止をしたのに regression test を追加しないこと（route 登録の有無は実装者が気付かず復活させうる）

## 検証

- 新規 PR に POST 認可追加がある場合、対応するリソースの `schemas/<resource>.ts` の Update スキーマを grep し、mutable フィールドが「scope 解決キー」「外部参照 uuid」に該当しないことを確認できる
- PUT を廃止したリソースには、`registerCrudRoutes` の `schemas.update` と `handlers.update` が両方省略されている
- PUT 廃止リソースには上記 3 種の regression test が存在する

## createCrudHandlers の body strip（旧「生 body 問題」は解消済）

`apps/backend/src/utils/route-helpers.ts` の `createCrudHandlers.create/update` は **`getValidatedJson(c)`（= `c.req.valid('json')`、OpenAPIHono の Zod 検証 + strip 済 body）** で body を取得し `repository.create/update` に渡す。よって:

- Update スキーマから sensitive フィールドを削除すれば、**ランタイムでも client が body にそのキーを含めると strip され DB に到達しない**（schema 定義が runtime 防御としても機能する）
- かつて `createCrudHandlers.update` が `c.req.json()` で生 JSON を strip 無しに渡していた構造的問題は、validated JSON 経由への移行で**解消済**

ただし strip は「未知キーを黙って落とす」挙動のため、**禁止フィールドの送信を明示的に弾きたい（400 で気付かせたい）場合は個別 updateHandler でガードする**（`project-reviews.ts` を参照）。custom handler が `getValidatedJson` を経ず生 body を読む経路を新設する場合は、その handler 側で strip / 値域検証を担保すること。

