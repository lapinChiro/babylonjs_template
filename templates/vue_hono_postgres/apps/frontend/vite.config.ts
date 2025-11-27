import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: process.env.BASE_PATH ? `${process.env.BASE_PATH}/` : '/',
  plugins: [vue(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // 開発サーバーの最適化
  server: {
    port: 5173,
    host: '0.0.0.0',
    allowedHosts: [process.env.HOST],
    hmr: {
      overlay: true,
    },
    // HTTP/2を有効化（HMR維持）
    https: false,
    // より良いエラーハンドリング
    strictPort: false,
    // ファイルウォームアップで開発時パフォーマンス向上
    warmup: {
      clientFiles: ['./src/components/**/*.vue', './src/views/**/*.vue', './src/stores/**/*.ts']
    },
    fs: {
      allow: ['..']
    }
  },
  // 依存関係の事前ビルド最適化
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@vueuse/core',
      'lucide-vue-next',
      'ofetch',
      'yup',
      'vee-validate',
      '@vee-validate/yup',
      'tailwind-merge',
      'class-variance-authority',
      'clsx'
    ],
    exclude: ['@tailwindcss/vite'],
    // アグレッシブな最適化
    entries: [
      './src/main.ts',
      './src/**/*.vue',
    ],
    force: false,
  },
  // ビルド最適化
  build: {
    // チャンク分割戦略
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'ui-vendor': ['lucide-vue-next', 'reka-ui', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          'validation': ['vee-validate', '@vee-validate/yup', 'yup'],
          'utils': ['@vueuse/core', 'ofetch', 'vue-sonner'],
        },
        // チャンクファイル名の最適化
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
          return `js/[name]-${facadeModuleId}-[hash].js`;
        },
        assetFileNames: 'assets/[name]-[hash].[ext]',
        entryFileNames: 'js/[name]-[hash].js',
      },
    },
    // チャンクサイズ警告の調整
    chunkSizeWarningLimit: 1000,
    // CSS Code Splitting
    cssCodeSplit: true,
    // Source Map（開発環境のみ）
    sourcemap: process.env.NODE_ENV === 'development',
    // Terserオプション（本番ビルド用）
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
    // アセットのインライン制限
    assetsInlineLimit: 4096,
  },
  // ESBuildの最適化
  esbuild: {
    target: 'es2020',
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    // ログレベルの削除（本番環境）
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
  },
})
