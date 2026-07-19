# 今回のセッションへの指示

`docs/work-plan/` の作業計画に従い、**Phase 6(Claude Code 基盤: settings.json / CLAUDE.md / coder / commands / modern-web-guidance)** を実行してください。

## 手順

1. `docs/work-plan/README.md` を読む(ゴール・決定記録・移植マッピング表・共通完了条件)
2. `docs/work-plan/phase-06-claude-foundation.md` を読み、記載のタスクをタスク管理ツール(TaskCreate/TaskUpdate)に全ステップ登録してから、順に実行する
3. このフェーズのスコープ外の作業(次フェーズの先取り・無関係なリファクタ)はしない。スコープ外の発見は phase 文書の「引き継ぎ事項」に記録する

## フェーズ固有の注意

- **git 操作の特権分離(README の Global Constraints 参照)**: `git commit` / `git push` 等の deny 一覧の操作はユーザーだけの特権。エージェントは実行せず、コミットポイントで対象ファイルとメッセージを提示してユーザーに依頼する。push 後の CI 結果はユーザー申告方式(fail 時のみ申告される。エージェントから確認しない・残作業として扱わない)
- 移植元 `claude_settings/` は**読み取り専用**。コピー・書き換えの出力先は本プロジェクトの root / `.claude/` / `.agents/`
- この時点で CLAUDE.md が参照する rules / skills はまだ存在しない(Phase 7〜10 で作成)。参照整合は Phase 10 で最終検証するので、このフェーズでは気にせず最終形を書く
- 決定記録 D10(skills / commands の model 固定は維持)・D11(modern-web-guidance は vendored コーパスごとコピーし symlink 再現、内容は編集しない)を適用する
- **決定記録 D13: `eslint-disable`・`@ts-expect-error` 等の抑制コメントは一切禁止**(このフェーズはコード変更が無い想定だが、万一発生しても抑制ではなく実装側で解決する)
- 受入基準の「新しいセッションで CLAUDE.md が効いている」の簡易確認は、本セッション内では検証不能のためユーザーへの依頼事項として報告する

## セッション完了時(必須)

1. `docs/work-plan/README.md` の Phase 6 進捗チェックボックスを完了にする
2. `docs/work-plan/phase-06-claude-foundation.md` 末尾の「引き継ぎ事項」に実績(計画との差異・追加判断・未解決事項。無ければ「差異なし」)を追記する
3. **この `prompt.md` を「Phase 7 を実行する」内容に書き換える**(本ファイルと同じ構成で、フェーズ番号・文書名を次に進める。フェーズ固有の注意があれば追記する)
4. 変更内容(対象ファイル一覧+コミットメッセージ案)を提示し、コミットと push をユーザーに依頼する
