# 今回のセッションへの指示

`docs/work-plan/` の作業計画に従い、**Phase 9(ワークフロー層 skills 10 個 + 種ファイル: plan.md / TODO / backlog/ の構築)** を実行してください。

## 手順

1. `docs/work-plan/README.md` を読む(ゴール・決定記録・移植マッピング表・共通完了条件)
2. `docs/work-plan/phase-09-workflow-skills.md` を読み、記載のタスクをタスク管理ツール(TaskCreate/TaskUpdate)に全ステップ登録してから、順に実行する
3. このフェーズのスコープ外の作業(次フェーズの先取り・無関係なリファクタ)はしない。スコープ外の発見は phase 文書の「引き継ぎ事項」に記録する

## フェーズ固有の注意

- **git 操作の特権分離(README の Global Constraints 参照)**: `git commit` / `git push` 等の deny 一覧の操作はユーザーだけの特権。エージェントは実行せず、コミットポイントで対象ファイルとメッセージを提示してユーザーに依頼する。push 後の CI 結果はユーザー申告方式(fail 時のみ申告される。エージェントから確認しない・残作業として扱わない)
- 移植元 `claude_settings/` は**読み取り専用**。出力先は本プロジェクトの `.claude/skills/<name>/SKILL.md`(skill)と repo root(種ファイル `plan.md` / `TODO` / `backlog/`)
- 処遇の正は README の移植マッピング表。**Phase 9 の対象はワークフロー層 10 skill(rule-writing / rule-maintenance / investigation / backlog-management / prd-template / prd-completion / review-prd / backlog-replenishment / todo-replenishment / track-management)+ 種ファイル**。UX 層(ux-design)と全体整合性検証は Phase 10。各 skill の具体的な調整内容は phase-09 文書に記載
- frontmatter(`name` / `description` / `user-invocable` / `model`)は移植元を踏襲。**prd-template / review-prd の `model: claude-fable-5` は維持**(決定記録 D10)
- skill が参照してよい rule 名の母集合は `.claude/rules/` の**実 20 ファイル**(Phase 7 で移植済み)。破棄 9 rule への参照は張らない
- **決定記録 D13: `eslint-disable`・`@ts-expect-error` 等の抑制コメントは一切禁止・例外なし**。skill 本文に抑制コメントの例外運用を書かない(Phase 8 で quality-check / todo-audit を D13 に整合させた前例を踏襲する)
- **backlog-layer-model rule(Phase 7 移植済み)への委譲**を維持する。種ファイル(plan.md / TODO / backlog/)は同 rule の三層構造・「TODO 出口は 2 つだけ」等の不変条件を満たす形で作成する
- 種ファイル・skill 間の参照整合の最終検証は Phase 10。Phase 8 で作成済みの品質系 7 skill との相互参照(tdd 完了処理列 → review-dev/quality-check 等)は既に解決している

## セッション完了時(必須)

1. `docs/work-plan/README.md` の Phase 9 進捗チェックボックスを完了にする
2. `docs/work-plan/phase-09-workflow-skills.md` 末尾の「引き継ぎ事項」に実績(計画との差異・追加判断・未解決事項。無ければ「差異なし」)を追記する
3. **この `prompt.md` を「Phase 10 を実行する」内容に書き換える**(本ファイルと同じ構成で、フェーズ番号・文書名を次に進める。フェーズ固有の注意があれば追記する)
4. 変更内容(対象ファイル一覧+コミットメッセージ案)を提示し、コミットと push をユーザーに依頼する
