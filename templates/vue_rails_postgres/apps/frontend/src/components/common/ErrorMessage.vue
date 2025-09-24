<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 transform translate-y-2 scale-95"
    enter-to-class="opacity-100 transform translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 transform translate-y-0 scale-100"
    leave-to-class="opacity-0 transform translate-y-2 scale-95"
  >
    <div
      v-if="visible"
      class="mb-4 p-3 bg-destructive/15 border border-destructive/20 rounded-md flex-between shadow-lg"
      role="alert"
      aria-live="polite"
    >
      <div class="flex items-center gap-2">
        <AlertCircle class="size-4 text-destructive animate-pulse" />
        <span class="text-destructive font-medium">{{ message }}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        @click="handleClose"
        class="button-action h-auto p-1 text-destructive hover:bg-destructive/20"
        aria-label="エラーを閉じる"
      >
        <X class="size-4" />
      </Button>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { Button } from '@/components/ui/button';
import { X, AlertCircle } from 'lucide-vue-next';

interface Props {
  message: string;
}

interface Emits {
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const visible = ref(true);
let timer: ReturnType<typeof setTimeout> | null = null;

const handleClose = () => {
  visible.value = false;
  emit('close');
};

const startTimer = () => {
  if (timer) {
    clearTimeout(timer);
  }
  timer = setTimeout(() => {
    handleClose();
  }, 3000);
};

onMounted(() => {
  startTimer();
});

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});

// メッセージが変更されたら、タイマーをリセット
watch(() => props.message, () => {
  visible.value = true;
  startTimer();
});
</script>