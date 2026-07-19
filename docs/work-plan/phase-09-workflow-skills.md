# Phase 9: ワークフロー層 skills + 種ファイル(plan.md / TODO / backlog/)

> 前提: `docs/work-plan/README.md` と Phase 1〜8 完了

**ゴール:** backlog/PRD/plan.md/TODO の三層ワークフローを支える skill 群(10 個)を構築し、ワークフローの実体ファイル(plan.md / TODO / backlog/)を種入れする。

**共通原則:** Phase 8 と同じ(frontmatter 踏襲、model 固定維持: prd-template / review-prd = claude-fable-5)。全 skill で移植元を Read → 適合指示を適用 → `.claude/skills/<name>/SKILL.md` へ Write。

### Task 1: そのままコピーする skill(3)

- [ ] `rule-writing` / `rule-maintenance` / `investigation`: 移植元をコピー。コピー後 Read して確認(事前調査でプロジェクト非依存と確認済み。investigation の出力先 `report/` 規約・referent-before-label 参照は維持)

### Task 2: ワークフロー skill の適合(6)

共通の置換(全ファイルに適用):
- grep・cleanup 対象パスの列挙: `apps/*/src apps/*/tests apps/*/scripts infra/lib packages/*/src` → `apps/*/src apps/*/tests apps/*/scripts`
- 「prod デプロイ管理」「本番反映待ち」等の prod 運用前提の記述: 削除(本プロジェクトは prod 未運用。将来 CD 導入時に復活検討)
- プロジェクト目的の言及: 「プロジェクト管理アプリケーション」→「Web 3D アプリケーションテンプレート(Vue 3 + Babylon.js + Hono + PostgreSQL + MinIO)」

個別の変更:

- [ ] **backlog-management**: 共通置換のみ。三層構造の操作手続き・`prd-{N}-{kebab}.md` 命名・「TODO 出口は 2 つだけ」は無変更
- [ ] **prd-template**: 共通置換に加え、§3.1「適切な実装」の判断基準は本プロジェクト構成で書き換える — 「フロント(vee-validate/yup)とバック(Zod)の両層バリデーション / エラーハンドリング(ApiError 変換・ユーザー可視のエラー表示)/ 認証(JWT middleware)/ DB 制約(NOT NULL・UNIQUE・FK)」。migration・ロールバック節は Kysely migration(`npm run migrate` / `migrate:down`)前提に書き換え。「prod 稼働中(2026-05-07〜)」の前提記述は削除
- [ ] **prd-completion**: 共通置換のみ(PRD 番号 grep cleanup のパスが変わる)。完了処理タスク列の位置づけ・「commit はユーザー権限」は無変更
- [ ] **review-prd**: 参照 rule(coverage-floor-not-ceiling / referent-before-label / documentation-drift-prevention)は移植済みなのでほぼ無変更。`model: claude-fable-5` 維持
- [ ] **backlog-replenishment**: 共通置換のみ
- [ ] **todo-replenishment**: プロジェクト目的の置換のみ
- [ ] **track-management**: 共通置換のみ(構造の正 = backlog-layer-model rule への委譲は維持)

### Task 3: ワークフロー種ファイル

**Files:**
- Create: `plan.md`
- Create: `TODO`
- Create: `backlog/.gitkeep`

- [ ] **Step 1: `plan.md` を作成**

```markdown
# plan.md

前向きの開発計画と完了 PRD の索引。構造の正は `.claude/rules/backlog-layer-model.md`、操作手続きは `/backlog-management`。

## 現在の計画

(まだ計画された PRD はない。`docs/work-plan/` の設定構築フェーズ完了後、/backlog-replenishment または /todo-replenishment から開始する)

## 完了 PRD

(なし)
```

- [ ] **Step 2: `TODO` を作成し、本作業(work-plan)で破棄した rule 由来の検討事項を種入れする**

```markdown
# TODO

三層モデルの最下層(未整理の課題置き場)。構造の正は `.claude/rules/backlog-layer-model.md`。

- [ ] DB スキーマの timestamptz 化を検討する。現状は `timestamp`(TZ なし)で、複数 TZ のクライアント・サーバ TZ 変更に対して曖昧。移植元の tz-storage-convention rule(datetime=TIMESTAMPTZ / audit timestamp は DB 側生成)の採用可否を、migration 影響(3 テーブル)と合わせて判断する
- [ ] PK の uuid 化(`gen_random_uuid()`)を検討する。現状は serial。テンプレートとして配布する際、推測可能な連番 ID を外部公開 API に露出する設計で良いかを判断する(採用時は移植元 uuid-primary-key-generation rule を復活)
- [ ] lint への max-lines / max-lines-per-function 導入を検討する(導入時は移植元 file-size-limit-decomposition rule を復活し、行数稼ぎでなく凝集単位の分割で応える運用にする)
- [ ] 本番デプロイ経路(CD)を設計する際、移植元 transient-schema-mismatch-policy rule(デプロイ過渡期の互換シム禁止・DB 制約による保存データ保証)の採用を再検討する
- [ ] frontend の renderer 層(createEngine のフォールバック分岐・BabylonRenderer の dispose 冪等性)へのユニットテスト追加を検討する(Babylon の Engine を vi.mock する構成の設計が必要)
- [ ] E2E テスト(初期化状態・engine backend・mesh 数・console error の検証。DESIGN.md §11 の方針)の導入を検討する
```

- [ ] **Step 3: `backlog/` ディレクトリを作成(`.gitkeep` 配置)**

### Task 4: 検証とコミット

- [ ] `.claude/skills/` 配下が 17 skill(modern-web-guidance symlink 含めて 18 エントリ)になっていることを確認(README マッピング表と突合。ux-design は Phase 10)

```bash
ls .claude/skills/
```

- [ ] Phase 8 の引き継ぎ事項にある「未存在参照」(あれば)が解消されたか確認
- [ ] backlog-layer-model rule の paths(`plan.md` / `backlog/**` / `TODO`)が実体を得たので、`plan.md` を context に入れて rule が自動ロードされることを新セッションで簡易確認
- [ ] コミット: `feat(claude): ワークフロー層 skills と plan.md/TODO/backlog を構築`

## 受入基準

- [ ] 10 skill(rule-writing / rule-maintenance / investigation / backlog-management / prd-template / prd-completion / review-prd / backlog-replenishment / todo-replenishment / track-management)が存在し、README マッピング表の Phase 9 行と一致している
- [ ] `plan.md` / `TODO` / `backlog/` が存在し、TODO に破棄 rule 由来の検討事項 6 件が種入れされている
- [ ] 「プロジェクト管理アプリケーション」「infra/lib」「packages/」「prod デプロイ」の残滓が `.claude/` に無い

## 引き継ぎ事項(実行セッションが追記)

- (未実行)
