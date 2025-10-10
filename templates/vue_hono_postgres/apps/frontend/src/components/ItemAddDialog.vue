<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>アイテム追加</DialogTitle>
        <DialogDescription>
          新しいアイテムの情報を入力してください
        </DialogDescription>
      </DialogHeader>

      <ErrorMessage
        v-if="error"
        :message="error"
        @close="error = ''"
      />

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="name">アイテム名</Label>
          <Input
            id="name"
            v-model="name"
            placeholder="アイテム名を入力"
            :maxlength="255"
            required
          />
          <p v-if="name.length > 255" class="text-sm text-destructive">
            アイテム名は255文字以内で入力してください
          </p>
        </div>

        <div class="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            @click="handleClose"
            class="flex-1"
            :disabled="loading"
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            class="flex-1"
            :disabled="!isFormValid || loading"
          >
            <template v-if="loading">
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
              追加中...
            </template>
            <template v-else>
              追加
            </template>
          </Button>
        </div>
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

interface Props {
  open: boolean;
}

interface Emits {
  (e: 'close'): void;
  (e: 'add', name: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const name = ref('');
const error = ref('');
const loading = ref(false);

// バリデーション
const isNameValid = computed(() =>
  name.value.trim().length > 0 && name.value.length <= 255
);
const isFormValid = computed(() => isNameValid.value);

// フォーム送信処理
const handleSubmit = async () => {
  if (!isFormValid.value) return;

  loading.value = true;
  error.value = '';

  try {
    // 直接storeのaddItemを呼び出す
    const { useItemsStore } = await import('@/stores');
    const itemsStore = useItemsStore();

    await itemsStore.addItem({
      name: name.value.trim()
    });

    // 成功時はフォームをリセット
    name.value = '';
    handleClose();
  } catch (err: any) {
    // バックエンドからのエラーメッセージを適切に表示
    if (err.message) {
      error.value = err.message;
    } else {
      error.value = 'アイテムの追加に失敗しました。';
    }
    // エラーの場合はダイアログを閉じない
  } finally {
    loading.value = false;
  }
};

// ダイアログを閉じる処理
const handleClose = () => {
  name.value = '';
  error.value = '';
  emit('close');
};
</script>