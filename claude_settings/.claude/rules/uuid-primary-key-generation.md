---
paths:
  - "apps/backend/src/db/**"
  - "apps/backend/tests/db/**"
  - "apps/backend/tests/migrations/**"
---

# uuid 主キー生成規約

## 適用条件

DB schema に新しいテーブルを追加するとき（migration で `CREATE TABLE` するとき）、または既存テーブルの主キー定義を変更するとき。

## 背景

uuid 単一主キー列の DB 側 `DEFAULT gen_random_uuid()` 宣言が全テーブルで揃っておらず、宣言する/しないが未文書化のまま割れていた（恣意的非対称）。一方でアプリ層は全 INSERT 経路が一様に `randomUUID()` で uuid を明示生成しており、DEFAULT の有無は挙動に影響しない backstop 差でしかなかった。本規約はこの非対称を「独立生成 uuid 主キーは DB 側 DEFAULT を宣言する」に固定して drift の再発を防ぐ。[`tz-storage-convention`](tz-storage-convention.md)（audit timestamp を DB 側 `now()` で生成する規約）の兄弟に当たる「DB 側生成」のスキーマ規約である。

## 制約

### 1. 独立生成される uuid 単一主キーは DB 側 `DEFAULT gen_random_uuid()` を宣言する

- uuid 型の単一列主キーには `DEFAULT gen_random_uuid()` を付与する（`CREATE TABLE` の列定義、または `ALTER COLUMN ... SET DEFAULT`）。
- アプリ層は引き続き `randomUUID()` を明示的に渡してよい。明示値が DEFAULT を上書きするため二重宣言は無害であり、DEFAULT は「uuid 未指定 INSERT を DB が補完する」backstop として働く（既存経路では不発火）。

### 2. FK を兼ねる共有/継承 PK は対象外

主キーが同時に FK である列（親テーブルの identity を継承する 1:1 の共有 PK。例: `user_google_tokens.user_uuid` → `users.uuid`）には DEFAULT を付与しない。値は親から継承されるべきで、独立生成の `gen_random_uuid()` は意味的に不適。

### 3. 複合主キー・自然キーは対象外

uuid 単一主キー列のみが本規約の対象。複合主キー・自然キーのテーブルは対象外。

### enforcement（実 DB introspection のメタテスト）

規約は grep（migration ソースの文字列一致）でなく、**全 migration 適用後の実 DB introspection のメタテスト** `apps/backend/tests/db/uuid-primary-key-default.test.ts` が強制する。同テストは「独立生成される全 uuid 単一主キー列の `column_default` が非 NULL（`gen_random_uuid()`）」を検証し、対象・除外（FK 兼用 PK / 複合・自然キー）の判定も introspection で行う。新規テーブルが DEFAULT を付け忘れると RED になる（対象テーブルの authoritative な列挙もこのテストの実行結果が持ち、本文には固定列挙しない）。

## 禁止事項

- 独立生成の uuid 単一主キーを `DEFAULT gen_random_uuid()` なしで `CREATE` すること（メタテストが RED になる）。
- FK を兼ねる共有/継承 PK に `gen_random_uuid()` DEFAULT を付けること（親 identity の継承に反する）。
- メタテストを弱体化・削除して DEFAULT 不在を通すこと（テスト削除でのエラー消しは禁止）。

## 検証

- メタテスト `apps/backend/tests/db/uuid-primary-key-default.test.ts` が GREEN。
- 新規追加した migration の uuid 単一主キー列に `DEFAULT gen_random_uuid()` 宣言がある（FK 兼用の共有 PK を除く）。

## 関連

- [`tz-storage-convention`](tz-storage-convention.md)（DB 側生成の兄弟規約。audit timestamp）
- [`testing.md`](testing.md)（integration / migration テストの配置・PGlite 規約）
