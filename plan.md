# plan.md

前向きの開発計画と完了 PRD の索引。構造の正は `.claude/rules/backlog-layer-model.md`、操作手続きは `/backlog-management`。

## 現在の計画

現在アクティブなトラックはない。開発は `TODO` の production コード品質項目から単発 PRD として着手直前に `prd-template` で materialize する（優先順は `TODO` を正とする: DB エラーハンドリング共通化 → メール重複の HTTP ステータス → migration up/down 非対称）。`#5`(DB エラーハンドリング) と `#2`(HTTP ステータス) は同一 handler 群でバッチ化候補。

旧トラック B「3D renderer テストカバレッジ」はユーザー判断で中断し、単位（renderer unit test / E2E）を `TODO.archive` へ退避した（再開条件は `TODO.archive` を参照）。

## 完了 PRD

（番号 + 短タグ・最新 10 件・新しい順）

| PRD | 短タグ |
|---|---|
| 2 | DB スキーマ uuid+timestamptz 化 |
| 1 | router ガード戻り値化 |
