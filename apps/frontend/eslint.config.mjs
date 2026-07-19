import pluginVue from 'eslint-plugin-vue'
import { withVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'

export default withVueTs(
  // 第 1 引数はプロジェクトオプション(config と区別するため明示的に指定)
  {
    rootDir: import.meta.dirname,
    // 既定 true は no-unsafe-* 系を緩和してしまうため、strictTypeChecked を全ファイルに適用する
    allowComponentTypeUnsafety: false,
  },
  { ignores: ['dist/**'] },
  pluginVue.configs['flat/recommended'],
  vueTsConfigs.strictTypeChecked,
  vueTsConfigs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        // tsconfig の include 外にある設定ファイルは default project で型付けする
        projectService: {
          allowDefaultProject: ['eslint.config.mjs', 'vite.config.ts', 'knip.config.js'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
)
