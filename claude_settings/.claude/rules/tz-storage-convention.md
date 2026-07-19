---
paths:
  - "apps/backend/src/db/**"
  - "apps/backend/src/repositories/**"
  - "apps/backend/src/services/**"
  - "apps/backend/src/auth/**"
  - "apps/backend/src/utils/**"
  - "infra/**/lib/**"
  - "**/src/db/**"
  - "**/src/repositories/**"
  - "**/src/auth/**"
---
# TZ ストレージ規約

## 適用条件

DB schema に datetime / date 列を追加・変更するとき、または app コードで時刻値を DB に書き込み・読み出し・変換するとき。

## 背景

本規約制定以前、backend は TZ 関連の workaround を多層に積み重ねていた:

- `TIMESTAMP WITHOUT TIME ZONE` 列 (61 列) + `AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo'` の二段変換 SQL
- pg-node が DATE 型を local-TZ 解釈で JS Date 化する挙動 + それを打ち消すための `toLocalDateString` ヘルパー
- Lambda env で `TZ=UTC` が default に依存
- `kysely.insertInto.values({ ..., col: new Date() })` で audit timestamp を JS 側から書き込む 4 call site (Node TZ ≠ PG TZ で ±9 時間ずれる)

これらは規約制定と同時にすべて解消し、本規約は「TZ 解釈レイヤを DB と app 層の境界に明示固定する」設計原則を 3 項目に集約することで今後の負債蓄積を防ぐ。

## 制約

### 1. datetime 列は TIMESTAMPTZ / date 列は DATE

新規スキーマで `TIMESTAMP WITHOUT TIME ZONE` (= `TIMESTAMP`) を **禁止**。datetime 列は **TIMESTAMPTZ** で絶対時刻保持 (session TZ 非依存)。日付のみの列は **DATE**。

- `DATE` 列は pg-node / PGlite の type parser で **string 返却** に統一済 (`db/connection.ts` + `tests/helpers/test-database.ts` + `package.json` の `generate-types --date-parser string`)
- kysely 生成型は `UserTimeTrackings.date: string` となる
- これにより `Date.toISOString().split('T')[0]` 等の workaround は不要 (= 禁止)

### 2. audit timestamp (created_at / updated_at / changed_at) は DB 側で生成

`created_at` / `updated_at` / `changed_at` 等の自動生成タイムスタンプは:

- INSERT 時は **DB の `DEFAULT now()`** に委ねる (アプリ層から `created_at: new Date()` を渡さない)
- UPDATE 時は **`sql\`NOW()\``** を渡す (アプリ層から `updated_at: new Date()` を渡さない)

理由: Node runtime と PG セッションの TZ が一致する保証がない (旧 W-Bug)。DB 側生成なら常に PG セッション TZ (= UTC) で絶対時刻が確定する。

### 3. JST 解釈は app 層で明示的に行う

JST (= Asia/Tokyo) 解釈が必要な場面:

- **アプリ層 (TypeScript)**: `utils/date-helpers.ts` の **`toJstDateString(d: Date): string`** を使う (`Intl.DateTimeFormat` + `'Asia/Tokyo'` で Node TZ 非依存)
- **SQL**: **`col AT TIME ZONE 'Asia/Tokyo'`** を 1 段で使う (TIMESTAMPTZ → JST wall-clock)

旧 `toLocalDateString` (Node TZ 依存の `getFullYear/getMonth/getDate` 経由) は廃止済、使用禁止。
旧 `(col AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo')::date` 二段変換は TIMESTAMP without TZ 時代の慣習で TIMESTAMPTZ では誤動作するため使用禁止。

## 禁止事項

- 新規 schema で `TIMESTAMP WITHOUT TIME ZONE` を使う (TIMESTAMPTZ を使え)
- `kysely.insertInto(...).values({...created_at: new Date()...})` / `kysely.updateTable(...).set({...updated_at: new Date()...})` の形で audit timestamp を JS から渡す (DB 側 `DEFAULT now()` / `sql\`NOW()\`` を使え)
- `Date.prototype.toISOString().split('T')[0]` で DATE 文字列を作る (parser config 後の `string` 直接代入で OK)
- `toLocalDateString` (削除済) / その復活 / 同等な Node TZ 依存の関数を新設する (`toJstDateString` を使え)
- SQL で `AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo'` の二段変換を書く (TIMESTAMPTZ には 1 段で十分)
- Lambda env で `TZ` を未設定にする (5 Lambda 全て `TZ: 'UTC'` 明示固定済、新規 Lambda も同様)

## 検証

機械的判定可能な grep コマンド (全て `apps/backend/` を起点に実行):

```bash
# [1] 新規 migration での TIMESTAMP without TZ 禁止 (down migration の言及を除外)
grep -rEn "TIMESTAMP\b[^T]" src/db/migrations/ | grep -v "TIMESTAMPTZ\|down\|UPDATE\|--\|^.*:.*\*"
# → 期待: 0 件 (新規 migration が TIMESTAMP without TZ を CREATE / ALTER していないこと)

# [2] W-Bug の INSERT 経路 (values + new Date)
grep -rEn "values\(\{[^}]*new Date\(\)" src/ | grep -v "\.test\.ts"
# → 期待: 0 件

# [3] W-Bug の UPDATE 経路 (.set + new Date)
grep -rEn "\.set\(\{[^}]*new Date\(\)" src/ | grep -v "\.test\.ts"
# → 期待: 0 件

# [4] toLocalDateString の復活防止 (関数定義 / import / 呼び出し)
grep -rn "toLocalDateString" src/ | grep -vE "^.*:.*(//|/\*|\*)"
# → 期待: 0 件 (歴史的経緯を説明する comment は許可)

# [5] R-Bug: toISOString().split で DATE 整形する経路
grep -rEn '\.toISOString\(\)\.split' src/ | grep -v "\.test\.ts"
# → 期待: 0 件

# [6] C-Bug: AT TIME ZONE 二段変換
grep -rn "AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Tokyo'" src/
# → 期待: 0 件
```

CDK 設定の検証 (`infra/lib/stacks/app-stack.ts`):

```bash
# [7] 全 Lambda Function に TZ=UTC 明示
grep -c "TZ: 'UTC'" infra/lib/stacks/app-stack.ts
# → 期待: 5 (proxy / backend / migration / githubBatch / fourKeysBatch)
```


## 関連ドキュメント

- 設計判断: [backlog/prd-22-tz-storage-architecture-overhaul.md](../../backlog/prd-22-tz-storage-architecture-overhaul.md) (PRD 完了時に削除)
- 関連ルール: [authz-update-schema-audit.md](authz-update-schema-audit.md) (mutable フィールドの監査)、[testing.md](testing.md) (integration test の TZ 制御)
