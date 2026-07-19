---
paths:
  - "apps/backend/src/services/*metrics*.ts"
  - "apps/backend/src/repositories/issue-logs.repository.ts"
  - "apps/backend/src/repositories/issues.repository.ts"
  - "apps/backend/src/utils/completed-estimate-sql.ts"
  - "apps/backend/src/apis/*metrics*.ts"
---
# メトリクス集計の母集団整合

## 適用条件

productivity 系メトリクス（estimate / completed_estimate / operation_time / efficiency / 分類別集計など）を **集計・追加・変更するとき**。具体的には metrics 系 service（project-metrics / daily-metrics）、その母集団を提供する repository（issues / issue-logs）、完了見積ヘルパ（completed-estimate-sql）、および新規 productivity 指標（チーム視点・レビュー効率等）を実装するとき。

## 背景

productivity 集計には「正しさ」を左右する 3 つの整合原則がある。これらは実装上は確立済（コメント・integration テストに体現）だが、本ルール制定まで明文の拘束力が無かった。母集団の取り違えは **値が一見もっともらしく出てしまう**ため静的解析・型でも検出されず、レビューで気づかないと誤った経営指標として混入する。直後に控えるメトリクス改修（メンバー別工数・フェーズ実績）が同じ集計コードを触るため、原則を拘束化して同型バグの再発を構造的に防ぐ。

## 制約

### 原則 1: 分子と分母の母集団を一致させる

ratio 指標（efficiency = completed_estimate / development_time 等）では、**分子と分母を同一の母集団で集計する**。一致させる軸:

- **期間**: 同じ日付範囲。期間は単一の SSOT（例: `resolvePhaseRangeKeys` / `unionRangeKeys` が返す半開区間キー `[startKey, endExclusiveKey)`）から導き、分子側の集計と分母側の集計が**同じ範囲値を消費**する。集計ごとに期間を独自再計算しない。
- **分類**: 同じ `task_classification_kbn` フィルタ（例: productivity は分子・分母とも DEVELOPMENT 限定）。
- **メンバー集合・除外規則**: 同じ包含/除外（例: project-manager 除外 + 退職者除外 + `github_id IS NOT NULL`）。これにより `Σ メンバー値 = プロジェクト全体値` 等の検算可能な不変条件が成立する。

期間境界は **JST 暦日キー + 半開区間**で扱う（保存時刻成分の UTC 前日ずれを排除）。詳細は [tz-storage-convention.md](tz-storage-convention.md)。

### 原則 2: 組織視点（Issue ユニーク）と個人視点（assignee 単位）を semantics で区別する

同一 Issue が複数 assignee を持つとき、集計には 2 つの異なる意味がある:

- **組織視点 = Issue ユニーク**: 複数 assignee Issue でも 1 件分のみ計上。「プロジェクト/組織が達成したタスク総量」。
- **個人視点 = assignee 単位**: assignee ごとに重複加算（1 user × 1 Issue は 1 回）。「個人の担当量」。

→ `Σ 個人視点 ≠ 組織視点` になるのは**正しい**（水増しではない）。新規集計を書くときは:

- どちらの視点かを決め、**メソッド名・戻り値型・docstring で明示する**（読者・将来の実装者が取り違えないように）。
- 2 視点を 1 つの数値へ混ぜない（`Σ 個人` を組織値として扱わない、逆も）。
- 視点に応じた包含規則を保つ（例: 組織視点の assignee count は退職者の github_id も含める＝過去の組織的事実を保つ）。

### 原則 3: snapshot 時点 vs 最新値を明示する

集計のソースには 2 つの時間意味がある:

- **現在値（`issues`）**: 再分類・status 変更が過去日にも波及する。「今この瞬間どうか」（現在断面メトリクス）。
- **snapshot（`issue_logs`）**: upsert 時点で確定し過去日不変。「各日時点でどうだったか」（日次推移・過去日メトリクス）。

→ 指標の意味で選ぶ: **日次推移・過去日**は snapshot、**現在断面**は現在値。両者を 1 系列に混在させない。snapshot 集計では「対象時点の最新 snapshot」述語（`latestSnapshotPredicate` 相当）と「終端 unlinked 除外」を必ず通す（再分類・紐づけ解除後の過去日不変性を保つため）。

### 横断: 完了見積の定義は単一根拠

「completed（完了見積）」の意味（完了 status 集合 + Doing-n 加重）は `completedEstimateSql` に集約し、全集計がこれを再利用する。分子の意味を集計ごとに独自実装しない（completed の定義 drift 防止 = 原則 1 の前提）。

## 禁止事項

- ratio 指標で分子と分母に**異なる期間 / 分類 / メンバー除外規則**を使うこと。
- 期間母集団を集計ごとに**独自再計算**すること（SSOT を経由せず分子分母が別々の境界を持つと、いずれ drift する）。
- **組織視点と個人視点を混在**させること（`Σ 個人` を組織値として返す / 1 つの数値に両視点を合算する）。
- **現在値（`issues`）と snapshot（`issue_logs`）を 1 系列・1 指標に混在**させること。
- snapshot 集計で **latest-snapshot 述語・終端 unlinked 除外を省く**こと（過去日が再分類で変わってしまう）。
- 「completed」の判定を `completedEstimateSql` 以外で**独自に再実装**すること。
- どの視点（組織/個人）・どの時間意味（現在値/snapshot）かを **docstring・命名で明示せず**に新規集計を追加すること。

## 検証

母集団整合は意味的性質のため、検証は **レビュー観点が主**で、grep は補助（網羅 gate にはしない）:

1. **新規/変更した ratio 指標**で、分子・分母の母集団（期間・分類・除外）が docstring に明示され、一致している。
2. **各集計メソッド**の視点（組織/個人）と時間意味（現在値/snapshot）が、命名または docstring から判別できる。
3. snapshot/現在値の選択が指標の意味（推移 vs 現在断面）と整合している。

補助の grep（集計エントリポイントの棚卸し = レビュー対象の列挙であり、合否判定ではない）:

```bash
cd apps/backend
# productivity 集計のエントリポイント候補を列挙し、各々で原則 1-3 を目視点検する
grep -rEn "calculate(Total|Completed)Estimate|aggregate(Estimates|CurrentPhase)|calculateDailyTotalsByPhase|resolvePhaseRangeKeys|unionRangeKeys|buildCumulativeMaps" \
  src/services src/repositories
```

## 関連

- [design-quality-gates.md](design-quality-gates.md)（DRY = 知識の重複排除 / 直交性。母集団定義の単一根拠化はこの一形態）
- [tz-storage-convention.md](tz-storage-convention.md)（JST 暦日キー・半開区間・`toJstDateString` / `AT TIME ZONE 'Asia/Tokyo'`）
- [rule-retroactive-application.md](rule-retroactive-application.md)（本ルール制定時の遡及監査要件）
- [documentation-drift-prevention.md](documentation-drift-prevention.md)（集計箇所を本文で逐語列挙せず、SSOT を不変性として記述する）

