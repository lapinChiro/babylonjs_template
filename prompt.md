# 今回のセッションへの指示

`docs/work-plan/` の作業計画に従い、**Phase 5(backend knip 導入+ quality スクリプト+ CI)** を実行してください。

## 手順

1. `docs/work-plan/README.md` を読む(ゴール・決定記録・移植マッピング表・共通完了条件)
2. `docs/work-plan/phase-05-knip-ci-quality-gate.md` を読み、記載のタスクをタスク管理ツール(TaskCreate/TaskUpdate)に全ステップ登録してから、順に実行する
3. このフェーズのスコープ外の作業(次フェーズの先取り・無関係なリファクタ)はしない。スコープ外の発見は phase 文書の「引き継ぎ事項」に記録する

## フェーズ固有の注意

- 決定記録 D6(knip を両 app 対象化)・D7(`quality` スクリプト= lint + type-check + knip + test + build を単一入口とし、CI も同一コマンドを実行)を適用する
- **決定記録 D13: `eslint-disable`・`@ts-expect-error` 等の抑制コメントは一切禁止**。誤検出と思われる場合も抑制ではなく実装側の書き換えで解決する(既存 2 箇所の置き換えは Phase 11 で実施。先取りしない)
- TypeScript は frontend 6.0.3 を維持する(TS 7 系は typescript-eslint の typed lint が動かないため不可。Phase 2 引き継ぎ参照)
- backend knip で未使用 export が出たら削除で対応。`src/db/generated-types.ts`(codegen 生成物)の未使用型が大量に出る場合のみ `ignore` +理由コメント(phase 文書 Task 1 Step 2 参照)
- CI のテストは外部サービス(PostgreSQL / MinIO)に接続しない前提(backend は `vi.mock` 済み、frontend は service モック)。CI で外部接続により落ちたらテスト側の欠陥として接続部をモックする側を直す
- Task 3 は push + `gh run watch` で green 確認まで含む。`actions/setup-node` の `node-version-file` は root の `.node-version` を参照(パス解決に失敗する場合は phase 文書の注記どおり修正)
- Phase 4 の引き継ぎ(`phase-04-frontend-vitest.md` 末尾参照): frontend は `tsconfig.vitest.json` 経由でテストも型検査対象。quality スクリプト追加時に新規ファイルを足す場合、tsconfig include 外だと typed lint がパースエラーになる点に注意

## セッション完了時(必須)

1. `docs/work-plan/README.md` の Phase 5 進捗チェックボックスを完了にする
2. `docs/work-plan/phase-05-knip-ci-quality-gate.md` 末尾の「引き継ぎ事項」に実績(計画との差異・追加判断・未解決事項。無ければ「差異なし」)を追記する
3. **この `prompt.md` を「Phase 6 を実行する」内容に書き換える**(本ファイルと同じ構成で、フェーズ番号・文書名を次に進める。フェーズ固有の注意があれば追記する)
4. 変更のコミットについてユーザーに確認する
