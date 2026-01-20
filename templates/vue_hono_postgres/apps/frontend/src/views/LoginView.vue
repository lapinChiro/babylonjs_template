<template>
  <div>
    <h1>サンプルシステム</h1>
    <form @submit.prevent="handleSubmit">
      <div>
        <label for="email">メールアドレス</label>
        <input
          id="email"
          v-model="email"
          type="email"
          placeholder="メールアドレスを入力"
          required
        />
      </div>
      <div>
        <label for="password">パスワード</label>
        <input
          id="password"
          v-model="password"
          type="password"
          placeholder="パスワードを入力"
          required
        />
      </div>
      <div v-if="error">{{ error }}</div>
      <button type="submit" :disabled="!isFormValid || loading">
        {{ loading ? 'ログイン中...' : 'ログイン' }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';

const router = useRouter();
const authStore = useAuthStore();

// Form state
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

// Validation
const isEmailValid = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)
);
const isPasswordValid = computed(() => password.value.length >= 6);
const isFormValid = computed(() => isEmailValid.value && isPasswordValid.value);

// Form submission
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
      email.value = '';
      password.value = '';
      router.push('/dashboard');
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
