<template>
  <Button
    variant="ghost"
    size="sm"
    @click="toggleDarkMode"
    class="w-9 px-0 relative overflow-hidden transition-all duration-300 hover:scale-110"
    aria-label="ダークモードの切り替え"
  >
    <Transition
      enter-active-class="transition-all duration-300 ease-out"
      enter-from-class="opacity-0 rotate-90 scale-50"
      enter-to-class="opacity-100 rotate-0 scale-100"
      leave-active-class="transition-all duration-300 ease-in"
      leave-from-class="opacity-100 rotate-0 scale-100"
      leave-to-class="opacity-0 rotate-90 scale-50"
      mode="out-in"
    >
      <Sun
        v-if="!isDark"
        key="sun"
        class="h-[1.2rem] w-[1.2rem] transition-all duration-300"
      />
      <Moon
        v-else
        key="moon"
        class="h-[1.2rem] w-[1.2rem] transition-all duration-300"
      />
    </Transition>
    <span class="sr-only">ダークモードの切り替え</span>
  </Button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-vue-next';

const isDark = ref(false);

// ダークモードの初期状態を取得
const initializeDarkMode = () => {
  // LocalStorageからテーマを取得、なければシステムの設定を使用
  const stored = localStorage.getItem('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (stored) {
    isDark.value = stored === 'dark';
  } else {
    isDark.value = systemDark;
  }

  updateDOMTheme();
};

// DOMのテーマクラスを更新
const updateDOMTheme = () => {
  const root = document.documentElement;
  if (isDark.value) {
    root.classList.add('dark');
    root.setAttribute('data-theme', 'dark');
  } else {
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
  }
};

// ダークモードを切り替え
const toggleDarkMode = () => {
  isDark.value = !isDark.value;
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
  updateDOMTheme();
};

// システムのカラースキーム変更を監視
const watchSystemTheme = () => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handleChange = () => {
    // LocalStorageにテーマが保存されていない場合のみ、システムの変更に追従
    if (!localStorage.getItem('theme')) {
      isDark.value = mediaQuery.matches;
      updateDOMTheme();
    }
  };

  mediaQuery.addEventListener('change', handleChange);

  // クリーンアップのためのreturn
  return () => {
    mediaQuery.removeEventListener('change', handleChange);
  };
};

onMounted(() => {
  initializeDarkMode();
  const cleanup = watchSystemTheme();

  // コンポーネントのアンマウント時にクリーンアップ
  return cleanup;
});
</script>