/**
 * Knip configuration for Vue.js + shadcn-vue project
 *
 * This configuration is optimized for:
 * - Vue 3 with Vue Router
 * - shadcn-vue components (auto-generated UI components)
 * - VeeValidate forms
 * - Tailwind CSS
 * - Vite build system
 */

export default {
  "$schema": "https://unpkg.com/knip@5/schema.json",

  // Entry files - where the application starts
  entry: [
    "src/main.ts",
    "src/router/index.ts",
    "src/views/**/*.vue",
    "index.html"
  ],

  // Project files to analyze
  project: [
    "src/**/*.{js,ts,vue}",
    "!src/**/*.test.{js,ts}",
    "!src/**/__tests__/**",
    "!src/test/**"
  ],

  // Files and directories to ignore
  ignore: [
    // Type definitions
    "src/vite-env.d.ts",

    // shadcn-vue auto-generated components
    // These are copied into the project and have complex internal dependencies
    "src/components/ui/**/*",

    // LoginDialog is kept for backward compatibility but not used with router
    "src/components/LoginDialog.vue",

    // Style files that might not show direct imports
    "src/styles/**/*"
  ],

  // Dependencies to ignore from unused checks
  ignoreDependencies: [
    // Build tools and CSS
    "tailwindcss",
    "tw-animate-css",  // Used in CSS imports

    // UI libraries used by shadcn-vue components
    "@tanstack/vue-table",  // Used in table utils
    "vue-sonner",  // Used in sonner component

    // Form validation libraries
    "@vee-validate/yup",
    "yup"  // Required by @vee-validate/yup
  ],

  // Ignore exports that are only used in the same file
  ignoreExportsUsedInFile: {
    interface: true,
    type: true,
    enum: true
  },

  // Vue plugin configuration
  vue: {
    config: ["vite.config.{js,ts,mjs}"]
  },

  // Vite plugin configuration
  vite: {
    config: ["vite.config.{js,ts,mjs}"]
  },

  // Path alias configuration matching tsconfig and vite
  paths: {
    "@/*": ["./src/*"]
  },

  // Rules for different issue types
  rules: {
    files: "error",  // Unused files
    dependencies: "warn",  // Changed to warn due to complex shadcn-vue deps
    unlisted: "error",  // Dependencies used but not in package.json
    exports: "warn",  // Unused exports
    nsExports: "warn",  // Namespace exports
    classMembers: "off",  // Class members (often false positives in Vue)
    types: "warn",  // Unused types
    nsTypes: "warn",  // Namespace types
    enumMembers: "off",  // Enum members (often used implicitly)
    duplicates: "error"  // Duplicate exports
  }
};