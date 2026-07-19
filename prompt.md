# 今回のセッションへの指示

`docs/work-plan/` の作業計画に従い、**Phase 8(品質系 skills 移植: quality-check / check-local / tdd / test-design / todo-audit / review-dev / refactoring-check の 7 ファイル)** を実行してください。

## 手順

1. `docs/work-plan/README.md` を読む(ゴール・決定記録・移植マッピング表・共通完了条件)
2. `docs/work-plan/phase-08-quality-skills.md` を読み、記載のタスクをタスク管理ツール(TaskCreate/TaskUpdate)に全ステップ登録してから、順に実行する
3. このフェーズのスコープ外の作業(次フェーズの先取り・無関係なリファクタ)はしない。スコープ外の発見は phase 文書の「引き継ぎ事項」に記録する

## フェーズ固有の注意

- **git 操作の特権分離(README の Global Constraints 参照)**: `git commit` / `git push` 等の deny 一覧の操作はユーザーだけの特権。エージェントは実行せず、コミットポイントで対象ファイルとメッセージを提示してユーザーに依頼する。push 後の CI 結果はユーザー申告方式(fail 時のみ申告される。エージェントから確認しない・残作業として扱わない)
- 移植元 `claude_settings/` は**読み取り専用**。出力先は本プロジェクトの `.claude/skills/<name>/SKILL.md`
- 処遇の正は README の移植マッピング表(skills 18 → 18 移植、うち 4 つは大幅書き換え)。**Phase 8 の対象は品質系 7 skill のみ**(quality-check / check-local は全面書き直し、tdd / test-design / todo-audit / review-dev / refactoring-check は移植元 Read → 適合)。ワークフロー層 skill・UX 層は Phase 9〜10。各 skill の具体的な調整内容は phase-08 文書に記載
- frontmatter(`name` / `description` / `user-invocable` / `model`)は移植元を踏襲。**review-dev / refactoring-check の `model: claude-fable-5` は維持**(決定記録 D10)
- skill が参照してよい rule 名の母集合は `.claude/rules/` の**実 20 ファイル**(Phase 7 で移植済み)。破棄 9 rule への参照は張らない。**注意: phase-08 文書「共通原則」に「Phase 7 の 19 rule」とあるが実際は 20 rule**(Phase 7 引き継ぎ事項参照)— 実体の `ls .claude/rules/` を正とし、phase-08 文書側の「19」は「20」へ訂正してよい
- **決定記録 D13: `eslint-disable`・`@ts-expect-error` 等の抑制コメントは一切禁止**(このフェーズはコード変更が無い想定だが、万一発生しても抑制ではなく実装側で解決する)
- Phase 9〜10 で作る skill・種ファイル(`/backlog-management`・`plan.md`・`TODO`・`ux-design` 等)への参照は維持してよい(参照整合の最終検証は Phase 10)

## セッション完了時(必須)

1. `docs/work-plan/README.md` の Phase 8 進捗チェックボックスを完了にする
2. `docs/work-plan/phase-08-quality-skills.md` 末尾の「引き継ぎ事項」に実績(計画との差異・追加判断・未解決事項。無ければ「差異なし」)を追記する
3. **この `prompt.md` を「Phase 9 を実行する」内容に書き換える**(本ファイルと同じ構成で、フェーズ番号・文書名を次に進める。フェーズ固有の注意があれば追記する)
4. 変更内容(対象ファイル一覧+コミットメッセージ案)を提示し、コミットと push をユーザーに依頼する
