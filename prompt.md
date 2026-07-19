# 今回のセッションへの指示

`docs/work-plan/` の作業計画に従い、**Phase 2(backend ESLint 導入+0 エラー化)** を実行してください。

## 手順

1. `docs/work-plan/README.md` を読む(ゴール・決定記録・移植マッピング表・共通完了条件)
2. `docs/work-plan/phase-02-backend-eslint.md` を読み、記載のタスクをタスク管理ツール(TaskCreate/TaskUpdate)に全ステップ登録してから、順に実行する
3. このフェーズのスコープ外の作業(次フェーズの先取り・無関係なリファクタ)はしない。スコープ外の発見は phase 文書の「引き継ぎ事項」に記録する

## フェーズ固有の注意

- typescript-eslint のインストール時、backend の TypeScript 7.0.2 への peer 対応警告が出ないか確認する。警告が出た場合は内容を引き継ぎ事項に記録し、lint の実動作で採否を判断する(phase 文書 Task 1 Step 1 の注記)
- 決定記録 D1(ESLint 一本化)・D2(`any` / 非 null assertion のエラー強制)・D3(`src/db/migrations/**` は `no-explicit-any` off)を適用する
- Phase 1 の引き継ぎ: 両 app の `node_modules` はローカルに `npm ci` 済み。backend の `type-check` スクリプト(`tsc --noEmit`)が導入済みで 0 エラー

## セッション完了時(必須)

1. `docs/work-plan/README.md` の Phase 2 進捗チェックボックスを完了にする
2. `docs/work-plan/phase-02-backend-eslint.md` 末尾の「引き継ぎ事項」に実績(計画との差異・追加判断・未解決事項。無ければ「差異なし」)を追記する
3. **この `prompt.md` を「Phase 3 を実行する」内容に書き換える**(本ファイルと同じ構成で、フェーズ番号・文書名を次に進める。フェーズ固有の注意があれば追記する)
4. 変更のコミットについてユーザーに確認する
