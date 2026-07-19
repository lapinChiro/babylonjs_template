# 今回のセッションへの指示

`docs/work-plan/` の作業計画に従い、**Phase 10(UX 層 skill: ux-design + 設定群全体の整合性検証・検収)** を実行してください。これは最終フェーズです。

## 手順

1. `docs/work-plan/README.md` を読む(ゴール・決定記録・移植マッピング表・共通完了条件)
2. `docs/work-plan/phase-10-ux-and-verification.md` を読み、記載のタスクをタスク管理ツール(TaskCreate/TaskUpdate)に全ステップ登録してから、順に実行する
3. このフェーズのスコープ外の作業(無関係なリファクタ)はしない。スコープ外の発見は phase 文書の「引き継ぎ事項」に記録する

## フェーズ固有の注意

- **git 操作の特権分離(README の Global Constraints 参照)**: `git commit` / `git push` 等の deny 一覧の操作はユーザーだけの特権。エージェントは実行せず、コミットポイントで対象ファイルとメッセージを提示してユーザーに依頼する。push 後の CI 結果はユーザー申告方式(fail 時のみ申告される。エージェントから確認しない・残作業として扱わない)
- 移植元 `claude_settings/` は**読み取り専用**。出力先は本プロジェクトの `.claude/skills/ux-design/SKILL.md`。**`claude_settings/` の削除可否は Task 3 でユーザーに確認する(勝手に削除しない)**
- **ux-design の適合(phase-10 Task 1)**: 手法フレームワーク(discovery/review 2 モード・Tier T0〜T3・ジョブストーリー / インパクトマップ / Nielsen 10 原則 / 認知的ウォークスルー / WCAG-AA)は無変更。プロトペルソナ表・Tier 分類例を本プロジェクトの実画面(LoginView / DashboardView / BabylonCanvas)で書き換える。参照 rule `ux-evaluation` は Phase 7 移植済み。**破棄 rule(`frontend-layout-spacing` 等)への参照が残っていれば削除**
- skill が参照してよい rule 名の母集合は `.claude/rules/` の**実 20 ファイル**(Phase 7 移植済み)。破棄 9 rule への参照は張らない
- **決定記録 D13: `eslint-disable`・`@ts-expect-error` 等の抑制コメントは一切禁止・例外なし**。skill 本文に抑制コメントの例外運用を書かない
- **全体整合性検証(phase-10 Task 2)がこのフェーズの主眼**: インベントリ突合(rules 20 / skills 19 = 18 skill + modern-web-guidance symlink)、リンクグラフの dangling 検査、移植元残滓の最終 grep、ロード動作の実機確認(新セッション)、両 app `npm run quality` フル再実行(exit 0)、`/rule-maintenance` の全体統合チェック。Phase 9 までで各フェーズ内の参照解決は確認済みだが、**全体横断の最終整合検証はこのフェーズが担う**
- ロード動作確認・auto-load 実挙動確認は**新しいセッションでの実機確認**が必要(rule レジストリはセッション開始時に構築されるため。Phase 9 で種ファイル plan.md/TODO/backlog が実体を得ており、`backlog-layer-model` の auto-load はこのフェーズで確認する)

## セッション完了時(必須・最終フェーズ)

1. `docs/work-plan/README.md` の Phase 10 進捗チェックボックスを完了にする(全フェーズ完了)
2. `docs/work-plan/phase-10-ux-and-verification.md` 末尾の「引き継ぎ事項」に実績(計画との差異・追加判断・未解決事項。無ければ「差異なし」)を追記する
3. **この `prompt.md` を「全フェーズ完了。`claude_settings/` の扱い(残す/削除)をユーザーに確認する」という内容に書き換える**
4. 変更内容(対象ファイル一覧+コミットメッセージ案)を提示し、コミットと push をユーザーに依頼する
