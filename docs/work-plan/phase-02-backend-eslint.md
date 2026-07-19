# Phase 2: backend ESLint 導入+0 エラー化

> 前提: `docs/work-plan/README.md` と Phase 1 完了(type-check スクリプトが存在すること)

**ゴール:** `apps/backend` に typed lint(ESLint flat config + typescript-eslint strictTypeChecked/stylisticTypeChecked)を導入し、既存コードを 0 エラー・0 警告にする。

**決定記録の適用:** D1(ESLint 一本化)、D2(any / 非 null assertion のエラー強制)、D3(migrations の `Kysely<any>` 許容)

### Task 1: ESLint のインストールと設定

**Files:**
- Create: `apps/backend/eslint.config.mjs`
- Modify: `apps/backend/package.json`(devDependencies, scripts)

- [ ] **Step 1: パッケージをインストール**

```bash
cd apps/backend
npm install -D eslint@latest @eslint/js@latest typescript-eslint@latest
```

注意: typescript-eslint が backend の TypeScript 7.0.2 に peer 対応しているか npm の警告を確認する。未対応警告が出た場合は警告内容を引き継ぎ事項に記録し、動作(次 Step の lint 実行)で判断する。

- [ ] **Step 2: `apps/backend/eslint.config.mjs` を作成**

```js
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist/**'] },
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  {
    // migration は実行時点スキーマへの操作であり generated-types と型を共有しない
    // (Kysely 公式推奨の Kysely<any> パターンを許容する。決定記録 D3)
    files: ['src/db/migrations/**/*.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
    },
  },
)
```

- [ ] **Step 3: scripts を追加(`apps/backend/package.json`)**

```jsonc
"lint": "eslint .",
"lint:fix": "eslint . --fix",
```

### Task 2: 既存コードの 0 エラー化

- [ ] **Step 1: lint を実行し、出力をファイルへ**

```bash
cd apps/backend
npm run lint > /tmp/backend-lint.txt 2>&1; echo "exit=$?"
```

Read ツールで `/tmp/backend-lint.txt` を全件確認(`tail`/`grep` での確認は禁止 — 出力切れリスク)。

- [ ] **Step 2: 自動修正可能なものを適用**

```bash
cd apps/backend && npm run lint:fix
```

- [ ] **Step 3: 残エラーを手修正する**

想定される違反クラスと修正方針(これ以外も 0 になるまで同じ原則で修正):

| 違反 | 修正方針 |
|---|---|
| `catch (err: any)` | `catch (err: unknown)` + `instanceof` narrowing(`err instanceof Error ? err.message : ...`) |
| `no-unsafe-*`(`any` 値の伝播) | 境界で型を付ける(Zod parse 済みの値は推論に任せる。`as` での断定は禁止) |
| `prefer-nullish-coalescing`(`\|\|` → `??`) | 意味が変わらないことを確認して `??` へ(`''` や `0` を falsy として扱う意図がある箇所はコメントで意図を明示し、条件式に書き換え) |
| `no-floating-promises` | `await` する。fire-and-forget が意図なら `void` 演算子+意図コメント |
| `restrict-template-expressions` | `String()` 変換または型を絞る |
| 非 null assertion `!` | 型ガードまたは明示 throw に置換 |

**禁止事項:** ルールの無効化・`eslint-disable` コメントでの回避(migrations override 以外)。どうしても正当な例外が必要な場合は、理由コメント付き 1 行 disable とし、引き継ぎ事項へ記録する。

- [ ] **Step 4: 検証(lint / type-check / test / build 全通し)**

```bash
cd apps/backend
npm run lint > /tmp/backend-lint2.txt 2>&1; echo "exit=$?"
npm run type-check && npm test && npm run build
```

期待: すべて exit=0、lint 出力に error/warning 0 件(Read で確認)。

- [ ] **Step 5: コミット** `feat(backend): typed ESLint (strictTypeChecked) を導入し既存コードを 0 エラー化`

## 受入基準

- [ ] `npm run lint` が 0 エラー・0 警告
- [ ] `eslint.config.mjs` に strictTypeChecked + stylisticTypeChecked + projectService が設定されている
- [ ] migrations 以外に `eslint-disable` が存在しない(あれば理由コメント付きで引き継ぎ事項に列挙)
- [ ] type-check / test / build も引き続き 0 エラー

## 引き継ぎ事項(実行セッションが追記)

- (未実行)
