# 今回のセッションへの指示

`docs/work-plan/` の作業計画に従い、**Phase 11(抑制コメント〔eslint-disable 等〕の全廃・D13)** を実行してください。これは計画の最終フェーズです。

## 手順

1. `docs/work-plan/README.md` を読む(ゴール・決定記録・移植マッピング表・共通完了条件)
2. `docs/work-plan/phase-11-remove-suppression-comments.md` を読み、記載のタスクをタスク管理ツール(TaskCreate/TaskUpdate)に全ステップ登録してから、順に実行する
3. このフェーズのスコープ外の作業(無関係なリファクタ)はしない。スコープ外の発見は phase 文書の「引き継ぎ事項」に記録する

## フェーズ固有の注意

- **git 操作の特権分離(README の Global Constraints 参照)**: `git commit` / `git push` 等の deny 一覧の操作はユーザーだけの特権。エージェントは実行せず、コミットポイントで対象ファイルとメッセージを提示してユーザーに依頼する。push 後の CI 結果はユーザー申告方式(fail 時のみ申告される。エージェントから確認しない・残作業として扱わない)
- **決定記録 D13(このフェーズの主眼)**: `eslint-disable`(全形式)・`@ts-expect-error` / `@ts-ignore` / `@ts-nocheck` を**完全排除**する。抑制していた検出は**ルール本体の off 化・severity 引き下げではなく、検出が起きない構造への実装書き換え**で解決する(誤検出と思われる場合も同様)。挙動が変わる書き換えはテストで挙動を固定してから行う
- **既知 2 箇所**: `apps/frontend/src/main.ts`(`.vue` import の型解決 → `declare module '*.vue'` shim)/ `apps/frontend/src/renderer/BabylonRenderer.ts`(await 跨ぎの narrowing 誤検出 → メソッド経由読み取りへの構造変更)。置き換え方針の詳細は phase-11 文書 Task 1 の表を参照。着手前に grep で全量を再棚卸しし、Phase 4〜10 で増えていないか確認する
- **例外(維持する既存決定)**: `src/db/migrations/**` の `no-explicit-any` off(D3)は migration の正当な設定 override であり維持する。これは抑制コメントではない
- **再発防止の機械化(Task 3)**: `@eslint-community/eslint-plugin-eslint-comments` の `no-use` で `eslint-disable` 系の使用自体をエラー化。`@ts-expect-error` 等は typescript-eslint の `ban-ts-comment` を全面禁止設定に強化して担保する
- **実機確認**: `BabylonRenderer.initialize()` を変更するため、ログイン〜3D 描画の回帰を `/check-local` で確認する(受入基準)
- **コーディング作業の委譲**: 実装・テスト実行・大量読み込みは coder サブエージェントへ委譲する(CLAUDE.md モデル運用)。設計判断・レビュー・検収はメインで行う
- **package.json 編集**: 依存追加時は `dependencies` rule(package.json 編集で auto-load)と latest 方針に従う

## セッション完了時(必須・最終フェーズ)

1. `docs/work-plan/README.md` の Phase 11 進捗チェックボックスを完了にする(これで全 11 フェーズ完了)
2. `docs/work-plan/phase-11-remove-suppression-comments.md` 末尾の「引き継ぎ事項」に実績(計画との差異・追加判断・未解決事項。無ければ「差異なし」)を追記する
3. **この `prompt.md` を「全フェーズ完了。`claude_settings/` の扱い(残す/削除)をユーザーに確認する」という内容に書き換える**(README §各フェーズ共通の完了条件 5)
4. 変更内容(対象ファイル一覧+コミットメッセージ案)を提示し、コミットと push をユーザーに依頼する
