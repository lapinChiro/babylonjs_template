<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>アイテム編集</DialogTitle>
        <DialogDescription>
          アイテム情報を編集してください
        </DialogDescription>
      </DialogHeader>

      <ErrorMessage
        v-if="error"
        :message="error"
        @close="error = ''"
      />

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="space-y-2">
          <Label for="edit-name">アイテム名</Label>
          <Input
            id="edit-name"
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
              更新中...
            </template>
            <template v-else>
              更新
            </template>
          </Button>
        </div>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
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
import type { Item } from '@/types';

interface Props {
  open: boolean;
  item: Item | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'update', id: string, name: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const name = ref('');
const error = ref('');
const loading = ref(false);

// アイテムが変更されたときにフォームの値を更新
watch(() => props.item, (newItem) => {
  if (newItem) {
    name.value = newItem.name;
  }
}, { immediate: true });

// バリデーション
const isNameValid = computed(() =>
  name.value.trim().length > 0 && name.value.length <= 255
);
const isFormValid = computed(() => isNameValid.value);

// フォーム送信処理
const handleSubmit = async () => {
  if (!isFormValid.value || !props.item) return;

  loading.value = true;
  error.value = '';

  try {
    // 直接storeのupdateItemを呼び出す
    const { useItemsStore } = await import('@/stores');
    const itemsStore = useItemsStore();

    await itemsStore.updateItem(props.item.id, {
      name: name.value.trim()
    });

    handleClose();
  } catch (err: any) {
    // バックエンドからのエラーメッセージを適切に表示
    if (err.message) {
      error.value = err.message;
    } else {
      error.value = 'アイテムの更新に失敗しました。';
    }
    // エラーの場合はダイアログを閉じない
  } finally {
    loading.value = false;
  }
};

// ダイアログを閉じる処理
const handleClose = () => {
  error.value = '';
  emit('close');
};
</script>