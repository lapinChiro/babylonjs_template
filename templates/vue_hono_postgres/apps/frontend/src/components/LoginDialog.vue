<template>
  <Dialog :open="open">
    <DialogContent class="sm:max-w-md [&>button]:hidden">
      <DialogHeader>
        <DialogTitle>ログイン</DialogTitle>
        <DialogDescription>
          メールアドレスとパスワードを入力してログインしてください
        </DialogDescription>
      </DialogHeader>

      <ErrorMessage
        v-if="error"
        :message="error"
        @close="error = ''"
      />

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="email">メールアドレス</Label>
          <Input
            id="email"
            v-model="email"
            type="email"
            placeholder="メールアドレスを入力"
            required
          />
        </div>

        <div class="space-y-2">
          <Label for="password">パスワード</Label>
          <Input
            id="password"
            v-model="password"
            type="password"
            placeholder="パスワードを入力"
            required
          />
        </div>

        <Button
          type="submit"
          class="w-full"
          :disabled="!isFormValid || loading"
        >
          <template v-if="loading">
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            ログイン中...
          </template>
          <template v-else>
            ログイン
          </template>
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-vue-next';
import ErrorMessage from '@/components/common/ErrorMessage.vue';
import { useAuthStore } from '@/stores';

interface Props {
  open: boolean;
}

interface Emits {
  (e: 'success'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

// バリデーション
const isEmailValid = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
);
const isPasswordValid = computed(() => password.value.length >= 6);
const isFormValid = computed(() => isEmailValid.value && isPasswordValid.value);

// フォーム送信処理
const handleSubmit = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  error.value = '';

  try {
    const success = await authStore.login({
      email: email.value,
      password: password.value
    });

    if (success) {
      // ログイン成功時はフォームをリセット
      email.value = '';
      password.value = '';
      emit('success');
    } else {
      error.value = authStore.error || 'ログインに失敗しました。メールアドレスとパスワードを確認してください。';
    }
  } catch (err) {
    error.value = 'ログインに失敗しました。メールアドレスとパスワードを確認してください。';
  } finally {
    loading.value = false;
  }
};
</script>