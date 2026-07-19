# Phase 10: UX 層(ux-design)+ 全体整合性検証

> 前提: `docs/work-plan/README.md` と Phase 1〜9 完了(最終フェーズ)

**ゴール:** 最後の skill(ux-design)を構築し、設定群全体の整合性検証(リンクグラフ・残滓・ロード動作・品質フル再実行)で作業全体を検収する。

### Task 1: ux-design skill(適合)

- [x] `.claude/skills/ux-design/SKILL.md` を作成。移植元を Read し以下を変更:
  - **手法フレームワーク(discovery / review の 2 モード、Tier T0〜T3 分類、ジョブストーリー / インパクトマップ / Nielsen 10 原則 / 認知的ウォークスルー / WCAG-AA)は無変更**
  - プロトペルソナ表を本プロジェクトの実画面で書き換える。例:

    | ペルソナ | 主要ゴール | 主要画面 |
    |---|---|---|
    | テンプレート利用開発者 | テンプレートを起動し、3D 描画と CRUD の動作を確認して自プロジェクトの土台にする | LoginView → DashboardView(BabylonCanvas / アイテム・画像管理) |
    | エンドユーザー(派生アプリの想定利用者) | ログインして 3D シーンを閲覧・操作し、データを管理する | LoginView / DashboardView |

  - Tier 分類の例示を本プロジェクトの変更種別(renderer のみの変更 = UI 表示への影響を確認して T0/T1 判定、View/フォーム変更 = T2、新規画面 = T3 等)で書き換える
  - 参照 rule `ux-evaluation` は Phase 7 で移植済み。`frontend-layout-spacing`(破棄)への参照が残っていれば削除

### Task 2: 全体整合性検証

- [x] **Step 1: インベントリ突合**(README の移植マッピング表どおりに存在するか)

```bash
ls .claude/rules/ | wc -l        # 期待: 20
ls .claude/skills/ | wc -l       # 期待: 19 (18 skill + modern-web-guidance symlink)
ls .claude/commands/ .claude/agents/
ls .agents/skills/modern-web-guidance/SKILL.md
```

- [x] **Step 2: リンクグラフ検証** — rules/skills/CLAUDE.md 内の相互参照(`.md` へのリンク・`/skill名` 言及)を機械的に抽出し、全て実在することを確認:

```bash
grep -rhoE '\((\.\./)*[a-z0-9/-]+\.md\)' .claude/rules/ .claude/skills/*/SKILL.md CLAUDE.md | sort -u > /tmp/links.txt
grep -rhoE '/(tdd|test-design|ux-design|quality-check|refactoring-check|review-dev|review-prd|check-local|todo-audit|prd-template|prd-completion|backlog-management|backlog-replenishment|todo-replenishment|track-management|investigation|rule-writing|rule-maintenance|modern-web-guidance)\b' .claude/ CLAUDE.md | sort -u
```

/tmp/links.txt の各リンクを実パスに解決して存在確認(Read で確認、または簡易スクリプト)。dangling があれば修正。

- [x] **Step 3: 移植元残滓の最終 grep**

```bash
grep -rln "oxlint\|stryker\|PGlite\|storybook\|promana\|EXTERNAL_API_MODE\|reka-ui\|tailwind\|infra/lib\|packages/types\|batch-utils\|apps/docs\|プロジェクト管理アプリケーション\|bastion" .claude/ .agents/ CLAUDE.md plan.md TODO
```

期待: 0 件(`.agents/` の vendored ガイドは汎用コーパスなので偽陽性が出たら除外して判断)

- [x] **Step 4: ロード動作の実機確認**(新しい Claude Code セッションで):
  1. 起動直後に CLAUDE.md が効いている(日本語応答)
  2. `apps/backend/src/db/migrations/` のファイルを Read させ、`soft-vs-hard-delete-policy` が自動ロードされる
  3. `plan.md` を Read させ、`backlog-layer-model` が自動ロードされる
  4. `/quality-check` `/tdd` が skill として呼び出せる
  5. coder サブエージェントに小さな作業(例: README の typo 探し)を委譲できる

- [x] **Step 5: 品質フル再実行**

```bash
cd apps/backend && npm run quality > /tmp/backend-quality-final.txt 2>&1; echo "exit=$?"
cd ../frontend && npm run quality > /tmp/frontend-quality-final.txt 2>&1; echo "exit=$?"
```

期待: 両方 exit=0。Read で 0 エラー・0 警告確認。CI の結果はユーザー申告方式(fail 時のみ申告。README の Global Constraints 参照)。

- [x] **Step 6: rule-maintenance の全体統合チェックを 1 度実行**(`/rule-maintenance` を呼び、移植で構築した rule/skill 全体の重複・不整合を skill 自身の手順で点検させる — 設定群のセルフチェック)

### Task 3: クローズ

- [ ] README(本計画)の全フェーズ進捗チェックを完了にする
- [ ] `claude_settings/` の扱いをユーザーに確認する(参照資料として残す / 削除する)。**勝手に削除しない**
- [ ] コミット依頼: 対象ファイルを提示し、ユーザーに `feat(claude): ux-design skill を追加し設定移植を完了` でのコミットを依頼する(git commit はユーザー特権。README の Global Constraints 参照)
- [ ] 最終報告: 構築した設定の全体像(rules 19 / skills 19 / commands 2 / agent 1 / CI)、破棄したものと理由(README マッピング表)、TODO への種入れ 6 件、今後の運用開始手順(/todo-replenishment または /backlog-replenishment から)をユーザーへ報告

## 受入基準

- [x] インベントリが README マッピング表と完全一致
- [x] リンクグラフに dangling なし・移植元残滓なし
- [x] ロード動作 5 項目すべて確認済み
- [x] 両 app quality が exit 0(CI はユーザー申告方式 — fail 申告が無いことをもって green とみなす)

## 引き継ぎ事項(実行セッションが追記)

### 実績(2026-07-19 実行)

- **Task 1(ux-design skill)**: 計画どおり作成。手法フレームワーク(discovery/review 2 モード・Tier T0〜T3・ジョブストーリー/インパクトマップ/Nielsen 10 原則/認知的ウォークスルー/WCAG-AA)は無変更。プロトペルソナ表を本プロジェクトの実画面(LoginView / DashboardView / BabylonCanvas)へ、Tier 分類例を本プロジェクトの変更種別(renderer のみ=T0/T1 判定・View/フォーム=T2・複数画面横断=T3)へ書き換え。破棄 rule `frontend-layout-spacing` への参照は移植元 SKILL に 1 件あったため削除し、代わりに `check-local`(Babylon 実描画のブラウザ検証)への責務分界リンクを追加。
- **Task 2 検証結果**:
  - Step 1 インベントリ: rules 20 / skills 19(18 skill + `modern-web-guidance` symlink)/ commands 2 / agents 1 / `.agents/skills/modern-web-guidance/SKILL.md` 実在。symlink 解決 OK。README マッピング表と完全一致。
  - Step 2 リンクグラフ: `.md` リンク 84 件・`/skill` 言及 19 件を機械抽出し全解決。実 dangling 0 件(検出 4 件はいずれも `documentation-drift-prevention` / `rule-writing` の**例示プレースホルダ**〔悪い例/良い例内の `audit.md` / `X.md`〕で実リンクではない)。
  - Step 3 残滓 grep: `.claude/` `CLAUDE.md` `plan.md` `TODO` で 0 件。`.agents/` vendored コーパスにも該当語なし。
  - Step 4 ロード動作: **本セッションが Phase 9 完了後に開始しているため実挙動を実機確認できた** — migration ファイル Read で `soft-vs-hard-delete-policy` が、`plan.md` Read で `backlog-layer-model`(+ `todo-prioritization` / `referent-before-label`)が auto-load 発火。日本語応答・skill 呼出可・coder 委譲(Step 5 を委譲実行)も確認。5 項目すべて充足。
  - Step 5 品質フル再実行: coder サブエージェントへ委譲。**両 app とも exit=0・0 エラー・0 警告**(backend test 8 / frontend test 7、計 15 件 pass、frontend build 1.25s)。出力ファイルをメイン側でも独立検算(error/warning/failed 語 0 件)。
  - Step 6 rule-maintenance 統合チェック: 個別レビュー = ux-design は `/rule-writing` 構造(トリガー/アクション/禁止事項/検証/関連)に準拠。全体統合 = rules 20 + skills 18 + symlink 1 で目安 20 を超えるが、これは D8 で意図的に採用した一貫した方法論スイートであり有機的肥大ではない。トリガ重複を主要ペア(ux-design↔ux-evaluation の floor/full、test-design↔ux-design、review-dev↔review-prd、backlog-management↔backlog-layer-model、verification↔quality-check)で点検し、いずれも文書化された責務分界で真の重複なし。合併・削除提案なし。

### 計画との差異・追加判断

- **rule-retroactive-application の適用判断**: ux-design は新規 skill だが、UI 制約そのもの(floor)ではなく**手順 skill**であり、UX 制約の本体 `ux-evaluation`(floor rule)は Phase 7 で移植済み。移植済み workflow skill 群(tdd / review-dev 等)と同様、per-skill の既存コードへの遡及リメディエーション(既存 3 画面のフル UX レビュー)は Phase 10 の移植・検収スコープ外と判断し TODO 起票はしていない(計画の「TODO 種入れ 6 件」を逸脱しない)。既存画面のフル `/ux-design` review は運用開始後に随時実施すればよい。
- **Phase 10 は最終フェーズではない(prompt.md の前提と README の矛盾を発見)**: 実行指示の `prompt.md` は「Phase 10 が最終」「全フェーズ完了」を前提としていたが、README のフェーズ一覧・決定記録 **D13**・Global Constraints は **Phase 11(抑制コメント全廃)** を残フェーズとして明示しており、対象の `eslint-disable` が実際に 2 箇所(`apps/frontend/src/main.ts` / `apps/frontend/src/renderer/BabylonRenderer.ts`)残存している(`docs/work-plan/phase-11-remove-suppression-comments.md` も存在)。したがって Phase 10 完了時点で「全フェーズ完了」とは宣言できない。README §完了条件 5 の規約(最終 Phase 11 完了時のみ prompt.md を「全フェーズ完了」にする)に従い、prompt.md は **Phase 11 実行指示**へ書き換えるのが整合的。この矛盾と、それに伴う「claude_settings/ の扱い確認を今行うか Phase 11 後に回すか」はユーザーへ提示し、以下の判断を得た:
  - **prompt.md → Phase 11 実行指示へ書き換え**(「全フェーズ完了」宣言は Phase 11 完了後)。本セッションで書き換え済み。
  - **claude_settings/ は Phase 11 完了後まで参照資料として残す**(今削除しない)。削除可否は全フェーズ完了時に改めて確認する。
