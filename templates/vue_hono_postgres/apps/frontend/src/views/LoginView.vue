<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-md space-y-6">
      <!-- ヘッダー -->
      <div class="text-center space-y-2">
        <h1 class="text-3xl font-bold">サンプルシステム</h1>
        <p class="text-muted-foreground">
          メールアドレスとパスワードを入力してログインしてください
        </p>
        <!-- デモアカウント情報 -->
        <div
          class="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 space-y-3">
          <div class="text-sm font-medium text-blue-700 dark:text-blue-300 text-center">
            デモアカウント
          </div>

          <div class="space-y-2">
            <!-- Email -->
            <div class="flex items-center gap-2">
              <Label class="text-xs text-blue-600 dark:text-blue-400 min-w-[80px]">Email:</Label>
              <div class="flex-1 bg-white dark:bg-blue-900/30 rounded px-2 py-1 text-sm font-mono border">
                {{ demoEmail }}
              </div>
              <Button type="button" variant="ghost" size="sm" @click="copyToClipboard(demoEmail, 'email')"
                class="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300"
                :title=" copyStates.email.copied ? 'コピー済み!' : 'メールアドレスをコピー' ">
                <Check v-if="copyStates.email.copied" class="h-3 w-3" />
                <Copy v-else class="h-3 w-3" />
              </Button>
              <Button type="button" variant="ghost" size="sm" @click=" fillEmail "
                class="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300"
                title="入力フィールドに設定">
                <ArrowDown class="h-3 w-3" />
              </Button>
            </div>

            <!-- Password -->
            <div class="flex items-center gap-2">
              <Label class="text-xs text-blue-600 dark:text-blue-400 min-w-[80px]">Password:</Label>
              <div class="flex-1 bg-white dark:bg-blue-900/30 rounded px-2 py-1 text-sm font-mono border">
                {{ showPassword ? demoPassword : '••••••••••••' }}
              </div>
              <Button type="button" variant="ghost" size="sm" @click=" togglePasswordVisibility "
                class="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300"
                :title=" showPassword ? 'パスワードを隠す' : 'パスワードを表示' ">
                <EyeOff v-show="showPassword" class="h-3 w-3" />
                <Eye v-show="!showPassword" class="h-3 w-3" />
              </Button>
              <Button type="button" variant="ghost" size="sm" @click="copyToClipboard(demoPassword, 'password')"
                class="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300"
                :title=" copyStates.password.copied ? 'コピー済み!' : 'パスワードをコピー' ">
                <Check v-if="copyStates.password.copied" class="h-3 w-3" />
                <Copy v-else class="h-3 w-3" />
              </Button>
              <Button type="button" variant="ghost" size="sm" @click=" fillPassword "
                class="h-7 w-7 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300"
                title="入力フィールドに設定">
                <ArrowDown class="h-3 w-3" />
              </Button>
            </div>
          </div>

          <!-- 一括設定ボタン -->
          <div class="pt-2 border-t border-blue-200 dark:border-blue-800">
            <Button type="button" variant="outline" size="sm" @click=" fillBothFields "
              class="w-full text-xs h-7 border-blue-200 text-blue-700 hover:bg-blue-100 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-900/50">
              両方とも入力フィールドに設定
            </Button>
          </div>
        </div>
      </div>

      <!-- ログインフォーム -->
      <Card>
        <CardHeader>
          <CardTitle>ログイン</CardTitle>
        </CardHeader>
        <CardContent>
          <ErrorMessage v-if="error" :message=" error " @close="error = ''" />

          <form @submit.prevent=" handleSubmit " class="space-y-4">
            <div class="space-y-2">
              <Label for="email">メールアドレス</Label>
              <Input id="email" v-model=" email " type="email" placeholder="メールアドレスを入力" required />
            </div>

            <div class="space-y-2">
              <Label for="password">パスワード</Label>
              <Input id="password" v-model=" password " type="password" placeholder="パスワードを入力" required />
            </div>

            <Button type="submit" class="w-full" :disabled=" !isFormValid || loading ">
              <template v-if="loading">
                <Loader2 class="mr-2 h-4 w-4 animate-spin" />
                ログイン中...
              </template>
              <template v-else>
                ログイン
              </template>
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Copy, Check, Eye, EyeOff, ArrowDown } from 'lucide-vue-next';
import ErrorMessage from '@/components/common/ErrorMessage.vue';
import { useAuthStore } from '@/stores';

const router = useRouter();
const authStore = useAuthStore();

// フォームの状態
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

// デモアカウント情報
const demoEmail = 'test1@example.com';
const demoPassword = 'password123';

// デモアカウント表示の状態
const showPassword = ref(false);
const copyStates = ref({
  email: { copied: false },
  password: { copied: false }
});

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
      // ログイン成功時はアイテム管理画面にリダイレクト
      email.value = '';
      password.value = '';
      router.push('/items');
    } else {
      error.value = authStore.error || 'ログインに失敗しました。メールアドレスとパスワードを確認してください。';
    }
  } catch (err) {
    error.value = 'ログインに失敗しました。メールアドレスとパスワードを確認してください。';
  } finally {
    loading.value = false;
  }
};

// デモアカウント関連の機能
/**
 * クリップボードにテキストをコピー
 */
const copyToClipboard = async (text: string, type: 'email' | 'password') => {
  try {
    await navigator.clipboard.writeText(text);

    // コピー成功の視覚的フィードバック
    copyStates.value[type].copied = true;

    // 2秒後にリセット
    setTimeout(() => {
      copyStates.value[type].copied = false;
    }, 2000);
  } catch (err) {
    console.error('クリップボードへのコピーに失敗しました:', err);

    // フォールバック: 旧来のメソッドを試す
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);

      copyStates.value[type].copied = true;
      setTimeout(() => {
        copyStates.value[type].copied = false;
      }, 2000);
    } catch (fallbackErr) {
      console.error('フォールバック方法も失敗しました:', fallbackErr);
    }
  }
};

/**
 * パスワード表示/非表示切り替え
 */
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};

/**
 * メールアドレスを入力フィールドに設定
 */
const fillEmail = () => {
  email.value = demoEmail;
};

/**
 * パスワードを入力フィールドに設定
 */
const fillPassword = () => {
  password.value = demoPassword;
};

/**
 * メールアドレスとパスワードの両方を入力フィールドに設定
 */
const fillBothFields = () => {
  email.value = demoEmail;
  password.value = demoPassword;
};
</script>