# 今回のセッションへの指示

`docs/work-plan/` の作業計画に従い、**Phase 7(rules 移植: 20 ファイル)** を実行してください。

## 手順

1. `docs/work-plan/README.md` を読む(ゴール・決定記録・移植マッピング表・共通完了条件)
2. `docs/work-plan/phase-07-rules.md` を読み、記載のタスクをタスク管理ツール(TaskCreate/TaskUpdate)に全ステップ登録してから、順に実行する
3. このフェーズのスコープ外の作業(次フェーズの先取り・無関係なリファクタ)はしない。スコープ外の発見は phase 文書の「引き継ぎ事項」に記録する

## フェーズ固有の注意

- **git 操作の特権分離(README の Global Constraints 参照)**: `git commit` / `git push` 等の deny 一覧の操作はユーザーだけの特権。エージェントは実行せず、コミットポイントで対象ファイルとメッセージを提示してユーザーに依頼する。push 後の CI 結果はユーザー申告方式(fail 時のみ申告される。エージェントから確認しない・残作業として扱わない)
- 移植元 `claude_settings/` は**読み取り専用**。出力先は本プロジェクトの `.claude/rules/`
- 処遇の正は README の移植マッピング表(29 rule 中 20 移植・9 破棄)。破棄 rule はコピーせず、破棄 rule への相互参照は文ごと削除する
- frontmatter の `paths:` は**本プロジェクトに実在するパス**だけにする(`infra/**`・`packages/**`・`apps/docs/**`・`domain/**`・`TODO.dashboard` を除去)。各 rule の具体的な調整内容は phase 文書に記載
- 品質系 3 rule(`testing` / `local-quality-mirrors-ci` / `dependencies`)は本プロジェクトの実態で**書き直し**(内容は phase 文書に記載)
- rule の書き方の構造は `claude_settings/.claude/skills/rule-writing/SKILL.md` に従う
- Phase 8〜9 で作る skill(`/tdd`・`/quality-check` 等)への参照は維持してよい(参照整合は Phase 10 で最終検証)
- **決定記録 D13: `eslint-disable`・`@ts-expect-error` 等の抑制コメントは一切禁止**(このフェーズはコード変更が無い想定だが、万一発生しても抑制ではなく実装側で解決する)
- 前フェーズからの依頼: セッション冒頭で CLAUDE.md が読み込まれ日本語応答・ワークフロー指示が効いていることを簡易確認し、phase-06 文書の受入基準最終項目にチェックを入れる

## セッション完了時(必須)

1. `docs/work-plan/README.md` の Phase 7 進捗チェックボックスを完了にする
2. `docs/work-plan/phase-07-rules.md` 末尾の「引き継ぎ事項」に実績(計画との差異・追加判断・未解決事項。無ければ「差異なし」)を追記する
3. **この `prompt.md` を「Phase 8 を実行する」内容に書き換える**(本ファイルと同じ構成で、フェーズ番号・文書名を次に進める。フェーズ固有の注意があれば追記する)
4. 変更内容(対象ファイル一覧+コミットメッセージ案)を提示し、コミットと push をユーザーに依頼する
