# Phase 8: 品質系 skills(quality-check / check-local / tdd / test-design / todo-audit / review-dev / refactoring-check)

> 前提: `docs/work-plan/README.md` と Phase 1〜7 完了(rules が存在し、両 app に `quality` スクリプトがあること)

**ゴール:** TDD サイクルと完了処理タスク列を支える品質系 skill 7 つを `.claude/skills/<name>/SKILL.md` として構築する。quality-check と check-local は全面書き直し、他 5 つは移植元を Read して適合。

**共通原則:** frontmatter(`name` / `description` / `user-invocable` / `model`)は移植元を踏襲(review-dev / refactoring-check の `model: claude-fable-5` 維持)。参照する rule 名は Phase 7 の 19 rule の範囲内のみ。

### Task 1: quality-check(全面書き直し)

- [ ] `.claude/skills/quality-check/SKILL.md` を以下の内容で作成:

````markdown
---
name: quality-check
description: 作業完了時(コミット前)の静的品質チェック手順。変更のあった app で lint / type-check / knip / test / build を実行し 0 エラー・0 警告を確認する(静的解析+自動テストの範囲。実機での動作確認は含まない= /check-local の領分)
user-invocable: true
---

# 品質チェック

## モード

- **軽量モード**(開発中の高速フィードバック): 変更ファイルへの `npx eslint <files>` / 対象テストのみの `npx vitest run <file>`。**完了報告の根拠にはできない**(`.claude/rules/local-quality-mirrors-ci.md`)
- **フルモード**(完了報告・コミット前の唯一の根拠): 以下の手順

## フルモード手順

1. **影響 app の特定**: `git status --short` / `git diff --name-only` で `apps/backend` / `apps/frontend` のどちらに変更があるか確認。両方なら両方実行
2. **一時ファイルの点検**: untracked に実験用ファイルが無いか確認(あれば削除か gitignore)
3. **フルチェック実行**(app ごと):

   ```bash
   cd apps/<app>
   npm run quality > /tmp/<app>-quality.txt 2>&1; echo "exit=$?"
   ```

   出力は必ずファイルへリダイレクトし Read ツールで全件確認する(`tail`/`grep` 禁止 — CLAUDE.md Gotchas)。`quality` = lint + type-check + knip + test + build(正は各 `package.json`)
4. **0 化**: エラー・警告は今回の変更に起因しないものも含め全て修正する。テストの削除・弱体化での解消は禁止(`.claude/rules/no-spec-distortion-for-tests.md`)
5. **判定**: テスト件数等の数値も検算し(`.claude/rules/verification.md`)、全 app exit=0・0 エラー・0 警告で合格

## 禁止事項

- 軽量モードの結果で完了報告すること
- lint 出力を `tail` / `grep` で確認すること
- エラー解消のための `eslint-disable` 追加(正当な例外は理由コメント必須+ユーザーへ報告)

## 関連

- rule: `local-quality-mirrors-ci` / `verification` / `testing`
- skill: `/check-local`(実機確認)/ `/test-design`(テスト追加時)
````

### Task 2: check-local(全面書き直し)

- [ ] `.claude/skills/check-local/SKILL.md` を作成。移植元 `claude_settings/.claude/skills/check-local/SKILL.md` を Read し、**構造(計画→環境準備→実行→判定、「環境準備は Claude が自分で行い、目視確認のみユーザーへ委譲」の絶対原則、MECE チェックリスト表)を維持**したまま、機構を本プロジェクトへ全面置換する。置換内容:
  - 起動: `docker compose up --build -d`(root `compose.yml`。サービス: frontend / backend / postgres / minio)。ポートは `.env` が正(未作成なら 5173/3000/5432/9000/9001)
  - seed: 初回起動時に migration + デモユーザー(`test1@example.com` / `password123`)が自動投入される。追加 seed スクリプトは無い
  - API 疎通: `curl http://localhost:3000/`(health)、Swagger UI `http://localhost:3000/swagger-ui`
  - DB 確認: `PGPASSWORD=password psql -h localhost -p 5432 -U postgres -d dev`
  - **ブラウザ検証の floor** は `DESIGN.md` §11 の 7 項目(WebGL 描画+camera 操作 / resize 後の縦横比 / route 遷移・HMR 後の render loop 重複なし / background tab で停止・復帰 / WebGPU 指定時のフォールバック / context lost 復帰 / reduced motion・keyboard focus・mobile pointer)を組み込み、変更内容固有の確認項目を `coverage-floor-not-ceiling` に従い動的に追加する
  - 移植元の `EXTERNAL_API_MODE` / MSW live-mode 節・promana コンテナ名・bastion は削除

### Task 3: tdd(適合)

- [ ] `.claude/skills/tdd/SKILL.md` を作成。移植元を Read し以下を変更:
  - ステップ 0(タスク登録)と完了処理タスク列(refactoring-check → review-dev →〔UI 変更のみ〕ux-design review → quality-check → todo-audit → check-local → prd-completion)は**そのまま維持**(全 skill が移植されるため成立)
  - frontend 作業前の `/modern-web-guidance` 先行調査・UI 着手時の `/ux-design discovery` 指示は維持
  - テスト実行コマンド例を本プロジェクトに合わせる: `cd apps/<app> && npx vitest run <file>`(両 app とも vitest。frontend も Phase 4 で導入済み)
  - RED ステップの記述で「バグ修正はまず再現テストを書く」原則を維持
  - REFACTOR ステップの軽量 quality-check 参照は Task 1 の軽量モードと整合させる
  - 移植元固有(PGlite・`apps/frontend/src/**` の Storybook 等)の記述があれば削除

### Task 4: test-design(軽微適合)

- [ ] `.claude/skills/test-design/SKILL.md` を作成。移植元を Read し以下のみ変更:
  - fast-check の節: 「backend/frontend とも導入済」→「未導入。property-based testing が有効な対象(パーサ・数値変換・純関数)が増えたら導入を検討し、導入時に本節を必須化する」に変更
  - DB 固有のリスク例(DST/JST・SQL DISTINCT)は「本プロジェクトでは backend の日付/ページネーション/バリデーション境界、frontend の検索/ページネーション computed、renderer の resize/dispose 状態遷移」等の本プロジェクトの例に置換
  - 技法カタログ(境界値 / 状態遷移 / デシジョンテーブル / ペアワイズ / エラー推測)と 8 ステップ構造は無変更

### Task 5: todo-audit(軽微適合)

- [ ] `.claude/skills/todo-audit/SKILL.md` を作成。移植元を Read。grep 対象(`apps/backend/src/ apps/frontend/src/`、`*.ts` `*.vue`)は本プロジェクトと同一なのでほぼ無変更。検出マーカー(`TODO|FIXME|HACK|WORKAROUND|XXX`、`as any`・`@ts-ignore` 等)も維持

### Task 6: review-dev / refactoring-check(軽微適合)

- [ ] `.claude/skills/review-dev/SKILL.md`: 移植元を Read してコピー。`model: claude-fable-5` 維持。参照 rule(`coverage-floor-not-ceiling` / `design-quality-gates` / `no-prd-references-in-code`)は全て Phase 7 で移植済みなので維持。frontend 節の `/modern-web-guidance` 参照も維持
- [ ] `.claude/skills/refactoring-check/SKILL.md`: 移植元を Read してコピー。`model: claude-fable-5` 維持。記録先(backlog PRD / plan.md / TODO)の三層参照は維持(Phase 9 で種ファイルを作る)

### Task 7: 検証とコミット

- [ ] skill 間・rule への参照が全て解決することを確認:

```bash
grep -rhoE '(/[a-z-]+|\.claude/rules/[a-z-]+\.md)' .claude/skills/*/SKILL.md | sort -u
```

出力の各参照先が実在する(rules は Phase 7 の 19 ファイル、skills はこのフェーズ+ Phase 9-10 で作る一覧= README マッピング表)ことを突合。Phase 9-10 分は未存在で可(メモを引き継ぎ事項へ)

- [ ] oxlint / Stryker / PGlite / Storybook / knip-root / promana / EXTERNAL_API_MODE の残滓 grep:

```bash
grep -rln "oxlint\|stryker\|PGlite\|storybook\|EXTERNAL_API_MODE\|promana" .claude/
```

期待: 0 件

- [ ] コミット依頼: 対象ファイルを提示し、ユーザーに `feat(claude): 品質系 skills 7 つを構築(quality-check/check-local は新ツールチェーンで書き直し)` でのコミットを依頼する(git commit はユーザー特権。README の Global Constraints 参照)

## 受入基準

- [ ] 7 skill が `.claude/skills/*/SKILL.md` に存在し、`/quality-check` 等で呼び出せる
- [ ] quality-check のフルモードが Phase 5 の `quality` スクリプトと 1:1 対応
- [ ] check-local が本プロジェクトの compose 構成・DESIGN.md §11 と整合
- [ ] 移植元固有ツールの残滓 0 件

## 引き継ぎ事項(実行セッションが追記)

- (未実行)
