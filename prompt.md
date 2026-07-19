# 今回のセッションへの指示

`docs/work-plan/` の作業計画に従い、**Phase 4(frontend vitest 導入+シードテスト)** を実行してください。

## 手順

1. `docs/work-plan/README.md` を読む(ゴール・決定記録・移植マッピング表・共通完了条件)
2. `docs/work-plan/phase-04-frontend-vitest.md` を読み、記載のタスクをタスク管理ツール(TaskCreate/TaskUpdate)に全ステップ登録してから、順に実行する
3. このフェーズのスコープ外の作業(次フェーズの先取り・無関係なリファクタ)はしない。スコープ外の発見は phase 文書の「引き継ぎ事項」に記録する

## フェーズ固有の注意

- 決定記録 D5(対象は stores / services の純ロジック層。Babylon Engine 実描画・コンポーネント mount は対象外)を適用する
- **決定記録 D13: `eslint-disable`・`@ts-expect-error` 等の抑制コメントは一切禁止**。誤検出と思われる場合も抑制ではなく実装側の書き換えで解決する(既存 2 箇所の置き換えは Phase 11 で実施。先取りしない)
- TypeScript は 6.0.3 を維持する(TS 7 系は typescript-eslint の typed lint が動かないため不可。Phase 2 引き継ぎ参照)
- Phase 3 の引き継ぎ(`phase-03-frontend-eslint.md` 末尾参照):
  - ESLint は `withVueTs` + `allowComponentTypeUnsafety: false` 構成のため、**テストコードにも no-unsafe-* 系が全面適用される**。`as Item` のようなひな型は使わず実フィールドを全部埋める(phase 文書の注記どおり)
  - stores の catch は `toErrorMessage(err, fallback)`(`@/services/api`)経由になった。`new Error('network down')` を reject させた場合の `store.error` 期待値は `'network down'` で成立する
  - stores 末尾の初期フェッチは `void fetchItems()` / `void fetchImages()` に変更済み(自動発火の挙動は従来どおり。テストでは service を `vi.mock` してから store を初期化する)
  - 新規の `vitest.config.ts` が tsconfig include 外のままだと typed lint がパースエラーになる。`tsconfig.vitest.json` の include に入れる計画だが、projectService が解決しない場合は `eslint.config.mjs` の `projectService.allowDefaultProject` へ追加する

## セッション完了時(必須)

1. `docs/work-plan/README.md` の Phase 4 進捗チェックボックスを完了にする
2. `docs/work-plan/phase-04-frontend-vitest.md` 末尾の「引き継ぎ事項」に実績(計画との差異・追加判断・未解決事項。無ければ「差異なし」)を追記する
3. **この `prompt.md` を「Phase 5 を実行する」内容に書き換える**(本ファイルと同じ構成で、フェーズ番号・文書名を次に進める。フェーズ固有の注意があれば追記する)
4. 変更のコミットについてユーザーに確認する
