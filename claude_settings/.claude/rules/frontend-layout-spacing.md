---
paths:
  - "apps/frontend/src/views/**"
  - "apps/frontend/src/components/OfferingLayoutWrapper.vue"
  - "**/src/views/**"
  - "**/components/OfferingLayoutWrapper.vue"
---
# frontend レイアウト spacing 規約

## 適用条件

`apps/frontend/src/views/*.vue`（ルーティングされる画面）、共通シェル `AppLayoutView.vue`、または共通レイアウトシェル（`OfferingLayoutWrapper.vue` 等、sidebar 構造＝制約 4 を実装する wrapper）で、以下を追加・変更するとき:

- View root 要素の**ページ最大幅** (`max-w-*`)
- View root / 直下セクションコンテナ間の**レイアウトレベル縦 spacing** (`space-y-*` / `gap-*` / `mb-*` / `mt-*` / `my-*` / `pt-*` / `pb-*` / `py-*`)
- 画面下端の**下余白**

## 背景

全画面共通シェル `AppLayoutView.vue` の `<main>` が画面の余白・最大幅を一元的に担保する設計だが、規約不在のため以下のばらつきが生じていた:

- 下余白がシェルの `py-8` 由来 32px のみで、縦長画面でコンテンツがビューポート下端に近接 (主訴)
- `<main>` に `max-w-*` が無く超ワイドで間延び。一方一部 View だけ独自 `max-w-*` を持ち中央寄せの有無が混在
- 一部 View が `min-h-screen` + 独自 `max-w-*` でシェルをネストで二重化 (ReviewDetailView)

これらはシェル 1 箇所に余白・最大幅の責務を集約することで解消できる。本規約は「ページ幅・下余白はシェルが持ち、View はセクション内容のみを持つ」責務分担と、縦リズムの 8pt grid 統一を固定する。

## 制約

### 1. ページ最大幅は共通シェルに委ねる (View root の max-w を限定)

- 通常 View は **root 要素に独自の `max-w-*` を足さない**。ページ横幅は共通シェル `AppLayoutView.vue` の `<main>` が **3 段 breakpoint 階段** (`max-w-7xl` 1280 → `2xl:max-w-[1760px]` → `3xl:max-w-[2048px]`) で担保する。`3xl` は `assets/main.css` の `@theme { --breakpoint-3xl: 2200px; }` で定義。
- **例外**: 入力可読性のため意図的に狭くする**フォーム特化 View** (現状 `CreateProjectView` / `EditProjectView`) は root に `max-w-*` を持ってよい。ただし**その意図を root 要素直上のコメントで明示**する。
- **副 sidebar を持つ view** (`OfferingDetailView` / `OfferingTeamsView` / `OfferingRepositoriesView`) は内部で `flex` + `w-56 flex-shrink-0` の副 sidebar を持つ。主 sidebar と同型構造に揃え、比例 grid (`col-span-N`) を使わない。
- **本制約 (1) の対象は View root 要素の `max-w-*` のみ**。View 内部のコンテンツ要素に付く `max-w-*` (フォーム入力欄を絞る `max-w-md`、テーブルセルの `max-w-xs truncate` / `max-w-[Npx] truncate`、チャート幅制約など「ページ幅」でなく「コンテンツ幅」の制御) は対象外。

### 2. レイアウトレベル縦 spacing は 8pt grid

View root / 直下セクションコンテナ間の縦 spacing は **8 の倍数**に対応する Tailwind スケールを用いる:

| 用途 | クラス | px |
|---|---|---|
| 要素間の最小間隔 | `*-2` | 8 |
| カード内 / 小セクション | `*-4` | 16 |
| セクション内グループ | `*-6` | 24 |
| トップレベルセクション間 | `*-8` | 32 |
| 大セクション間 | `*-12` | 48 |
| ページ下余白 | `*-16` | 64 |
| 特大マージン | `*-24` | 96 |

半端な値 (`*-3`=12 / `*-5`=20 / `*-7`=28 / `*-9`〜`*-11` / `*-14`=56) を**レイアウトレベルで使わない**。

- **対象外**: コンポーネント内部の micro-spacing (ボタン padding `px-4 py-2`、テーブルセル `px-6 py-3`、カード内の見出し下 `mb-3` 等) は 4px サブグリッド許容で本制約の対象外。

### 3. 下余白はシェルが担保する

- 通常 View は末尾に独自の `pb-*` を足さない。画面下端の余白は共通シェル `<main class="… pb-16">` (= 64px) が全画面一律に担保する。

### 4. Sidebar layout は固定幅 flex で統一

主・副 sidebar を持つレイアウトは、**比例 grid (`grid-cols-N` + `col-span-M`) ではなく `flex gap-* + w-56 flex-shrink-0 + flex-1 min-w-0`** で構築する。

- 比例 grid を使うと sidebar 幅が main 幅と連動して肥大する欠陥がある (大画面で sidebar が無意味に巨大化)
- `flex-1 min-w-0` は flex item の子に `overflow-x-auto` 等が来たとき正常に動作させる定番イディオム
- sidebar は a11y semantic 化のため `<aside>` で markup する
- 例外: 12-col grid を「カラムレイアウト本体」として使う view (ダッシュボードの card 並び等) は対象外

## 禁止事項

- 通常 View の root に `max-w-*` を足してページ幅を View 個別に制御すること (シェルへ委ねる。フォーム特化 View の例外はコメント明示が条件)
- フォーム特化 View で root `max-w-*` を持つのに**意図コメントを書かない**こと
- View root に `min-h-screen` を置いてシェルの画面高・背景をネストで二重化すること
- View 内にシェルの max-w class set (`max-w-7xl` / `2xl:max-w-[1760px]` / `3xl:max-w-[2048px]`) を含むラッパーを置いてシェルの最大幅・左右 padding を再実装すること
- レイアウトレベルの縦 spacing に半端値 (`mb-3` / `space-y-5` / `gap-7` 等) を使うこと
- 通常 View 末尾に `pb-*` を足して下余白を View 個別に足すこと (シェルが担保済)
- 効果のない `mx-auto` (max-w を伴わない中央寄せ) を root に残すこと (dead class)
- Sidebar layout に比例 grid (`grid-cols-N` + `col-span-M`) を使うこと (主 / 副 sidebar とも `flex` + `w-56 flex-shrink-0` で統一)

## 検証

機械的判定可能な grep (`apps/frontend/` を起点に実行):

```bash
# [1] 共通シェルが必須トークン (max-w 階段 / mx-auto / pt-8 / pb-16) を個別に持つ
#     (順序非依存・class 文字列拡張耐性のための atomic 分解)
grep -nE 'class="[^"]*max-w-7xl' src/views/AppLayoutView.vue                # 期待: 1 件
grep -nE 'class="[^"]*2xl:max-w-\[1760px\]' src/views/AppLayoutView.vue     # 期待: 1 件
grep -nE 'class="[^"]*3xl:max-w-\[2048px\]' src/views/AppLayoutView.vue     # 期待: 1 件
grep -nE 'class="[^"]*mx-auto' src/views/AppLayoutView.vue                  # 期待: 1 件
grep -nE 'class="[^"]*pt-8' src/views/AppLayoutView.vue                     # 期待: 1 件
grep -nE 'class="[^"]*pb-16' src/views/AppLayoutView.vue                    # 期待: 1 件

# [2] 通常 View root にシェルの max-w class set のいずれも含まれない
grep -rnE 'class="[^"]*(max-w-7xl|2xl:max-w-\[1760px\]|3xl:max-w-\[2048px\])' src/views/*.vue | grep -v 'AppLayoutView'
# → 期待: 0 件 (シェル以外の View がシェル max-w class set を持たない)

# [3] view root に min-h-screen を持たない (シェル + 認証フローのみ可)
grep -rn 'min-h-screen' src/views/*.vue | grep -v 'AppLayoutView\|LoginView\|AuthCallbackView\|ProfileSetupView'
# → 期待: 0 件

# [4] シェルが旧 grid 構造を持たない (regression guard — flex 化後に grid を残すと二重レイアウト)
grep -nE 'grid-cols-12|col-span-2\b|col-span-10' src/views/AppLayoutView.vue
# → 期待: 0 件

# [5] レイアウトレベル半端値の候補抽出 (hit は root/セクション or component 内部かを目視仕分け)
grep -rnE 'class="[^"]*(space-y|gap|mb|mt|my|pt|pb|py)-(3|5|7|9|10|11|14)\b' src/views
# → hit はすべて component 内部の micro-spacing (table cell / card 内見出し / button padding) であること
```


## 関連ドキュメント

- 関連ルール: [rule-retroactive-application.md](rule-retroactive-application.md) (本規約制定時の遡及適用)、[documentation-drift-prevention.md](documentation-drift-prevention.md) (drift 耐性の記述形式・report 非委譲)
