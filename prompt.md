# 今回のセッションへの指示

`docs/work-plan/` の作業計画に従い、**Phase 3(frontend ESLint 導入+0 エラー化)** を実行してください。

## 手順

1. `docs/work-plan/README.md` を読む(ゴール・決定記録・移植マッピング表・共通完了条件)
2. `docs/work-plan/phase-03-frontend-eslint.md` を読み、記載のタスクをタスク管理ツール(TaskCreate/TaskUpdate)に全ステップ登録してから、順に実行する
3. このフェーズのスコープ外の作業(次フェーズの先取り・無関係なリファクタ)はしない。スコープ外の発見は phase 文書の「引き継ぎ事項」に記録する

## フェーズ固有の注意

- 決定記録 D1(ESLint 一本化)・D2(`any` / 非 null assertion のエラー強制)を適用する
- Phase 2 の引き継ぎ(`phase-02-backend-eslint.md` 末尾参照):
  - frontend の TypeScript は 6.0.3 で typescript-eslint@8.64.0 の peer 範囲(`>=4.8.4 <6.1.0`)内のため、backend で起きた ERESOLVE は発生しない想定。万一 TS 7 系へ上げる提案が出ても typed lint が動かなくなるため不可
  - flat config は `tseslint.config()` ではなく `eslint/config` の `defineConfig()` を使う(ESLint 10 では前者が deprecated で `no-deprecated` に自己検出される)
  - `eslint.config.mjs`(および tsconfig include 外の設定ファイル)は `projectService.allowDefaultProject` に列挙しないとパースエラーになる
  - zod 4 の `z.string().email()` / `.url()` / `.datetime()` は deprecated(`no-deprecated` でエラー)。frontend の yup には無関係だが、同種の deprecated API 検出が出た場合は新 API へ移行する

## セッション完了時(必須)

1. `docs/work-plan/README.md` の Phase 3 進捗チェックボックスを完了にする
2. `docs/work-plan/phase-03-frontend-eslint.md` 末尾の「引き継ぎ事項」に実績(計画との差異・追加判断・未解決事項。無ければ「差異なし」)を追記する
3. **この `prompt.md` を「Phase 4 を実行する」内容に書き換える**(本ファイルと同じ構成で、フェーズ番号・文書名を次に進める。フェーズ固有の注意があれば追記する)
4. 変更のコミットについてユーザーに確認する
