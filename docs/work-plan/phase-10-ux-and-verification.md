# Phase 10: UX 層(ux-design)+ 全体整合性検証

> 前提: `docs/work-plan/README.md` と Phase 1〜9 完了(最終フェーズ)

**ゴール:** 最後の skill(ux-design)を構築し、設定群全体の整合性検証(リンクグラフ・残滓・ロード動作・品質フル再実行)で作業全体を検収する。

### Task 1: ux-design skill(適合)

- [ ] `.claude/skills/ux-design/SKILL.md` を作成。移植元を Read し以下を変更:
  - **手法フレームワーク(discovery / review の 2 モード、Tier T0〜T3 分類、ジョブストーリー / インパクトマップ / Nielsen 10 原則 / 認知的ウォークスルー / WCAG-AA)は無変更**
  - プロトペルソナ表を本プロジェクトの実画面で書き換える。例:

    | ペルソナ | 主要ゴール | 主要画面 |
    |---|---|---|
    | テンプレート利用開発者 | テンプレートを起動し、3D 描画と CRUD の動作を確認して自プロジェクトの土台にする | LoginView → DashboardView(BabylonCanvas / アイテム・画像管理) |
    | エンドユーザー(派生アプリの想定利用者) | ログインして 3D シーンを閲覧・操作し、データを管理する | LoginView / DashboardView |

  - Tier 分類の例示を本プロジェクトの変更種別(renderer のみの変更 = UI 表示への影響を確認して T0/T1 判定、View/フォーム変更 = T2、新規画面 = T3 等)で書き換える
  - 参照 rule `ux-evaluation` は Phase 7 で移植済み。`frontend-layout-spacing`(破棄)への参照が残っていれば削除

### Task 2: 全体整合性検証

- [ ] **Step 1: インベントリ突合**(README の移植マッピング表どおりに存在するか)

```bash
ls .claude/rules/ | wc -l        # 期待: 20
ls .claude/skills/ | wc -l       # 期待: 19 (18 skill + modern-web-guidance symlink)
ls .claude/commands/ .claude/agents/
ls .agents/skills/modern-web-guidance/SKILL.md
```

- [ ] **Step 2: リンクグラフ検証** — rules/skills/CLAUDE.md 内の相互参照(`.md` へのリンク・`/skill名` 言及)を機械的に抽出し、全て実在することを確認:

```bash
grep -rhoE '\((\.\./)*[a-z0-9/-]+\.md\)' .claude/rules/ .claude/skills/*/SKILL.md CLAUDE.md | sort -u > /tmp/links.txt
grep -rhoE '/(tdd|test-design|ux-design|quality-check|refactoring-check|review-dev|review-prd|check-local|todo-audit|prd-template|prd-completion|backlog-management|backlog-replenishment|todo-replenishment|track-management|investigation|rule-writing|rule-maintenance|modern-web-guidance)\b' .claude/ CLAUDE.md | sort -u
```

/tmp/links.txt の各リンクを実パスに解決して存在確認(Read で確認、または簡易スクリプト)。dangling があれば修正。

- [ ] **Step 3: 移植元残滓の最終 grep**

```bash
grep -rln "oxlint\|stryker\|PGlite\|storybook\|promana\|EXTERNAL_API_MODE\|reka-ui\|tailwind\|infra/lib\|packages/types\|batch-utils\|apps/docs\|プロジェクト管理アプリケーション\|bastion" .claude/ .agents/ CLAUDE.md plan.md TODO
```

期待: 0 件(`.agents/` の vendored ガイドは汎用コーパスなので偽陽性が出たら除外して判断)

- [ ] **Step 4: ロード動作の実機確認**(新しい Claude Code セッションで):
  1. 起動直後に CLAUDE.md が効いている(日本語応答)
  2. `apps/backend/src/db/migrations/` のファイルを Read させ、`soft-vs-hard-delete-policy` が自動ロードされる
  3. `plan.md` を Read させ、`backlog-layer-model` が自動ロードされる
  4. `/quality-check` `/tdd` が skill として呼び出せる
  5. coder サブエージェントに小さな作業(例: README の typo 探し)を委譲できる

- [ ] **Step 5: 品質フル再実行**

```bash
cd apps/backend && npm run quality > /tmp/backend-quality-final.txt 2>&1; echo "exit=$?"
cd ../frontend && npm run quality > /tmp/frontend-quality-final.txt 2>&1; echo "exit=$?"
```

期待: 両方 exit=0。Read で 0 エラー・0 警告確認。CI も green(`gh run list -L 1`)。

- [ ] **Step 6: rule-maintenance の全体統合チェックを 1 度実行**(`/rule-maintenance` を呼び、移植で構築した rule/skill 全体の重複・不整合を skill 自身の手順で点検させる — 設定群のセルフチェック)

### Task 3: クローズ

- [ ] README(本計画)の全フェーズ進捗チェックを完了にする
- [ ] `claude_settings/` の扱いをユーザーに確認する(参照資料として残す / 削除する)。**勝手に削除しない**
- [ ] コミット: `feat(claude): ux-design skill を追加し設定移植を完了`
- [ ] 最終報告: 構築した設定の全体像(rules 19 / skills 19 / commands 2 / agent 1 / CI)、破棄したものと理由(README マッピング表)、TODO への種入れ 6 件、今後の運用開始手順(/todo-replenishment または /backlog-replenishment から)をユーザーへ報告

## 受入基準

- [ ] インベントリが README マッピング表と完全一致
- [ ] リンクグラフに dangling なし・移植元残滓なし
- [ ] ロード動作 5 項目すべて確認済み
- [ ] 両 app quality + CI green

## 引き継ぎ事項(実行セッションが追記)

- (未実行)
