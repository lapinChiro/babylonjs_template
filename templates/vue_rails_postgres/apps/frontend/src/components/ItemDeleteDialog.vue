<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>アイテム削除確認</DialogTitle>
        <DialogDescription>
          この操作は取り消すことができません
        </DialogDescription>
      </DialogHeader>

      <ErrorMessage
        v-if="error"
        :message="error"
        @close="error = ''"
      />

      <div class="py-4">
        <p>
          アイテム「<span class="font-medium">{{ item?.name }}</span>」を削除しますか？
          この操作は取り消せません。
        </p>
      </div>

      <div class="flex gap-2">
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
          @click="handleDelete"
          variant="destructive"
          class="flex-1"
          :disabled="loading"
        >
          <template v-if="loading">
            <Loader2 class="mr-2 h-4 w-4 animate-spin" />
            削除中...
          </template>
          <template v-else>
            削除
          </template>
        </Button>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-vue-next';
import ErrorMessage from '@/components/common/ErrorMessage.vue';
import type { Item } from '@/types';

interface Props {
  open: boolean;
  item: Item | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'delete', id: string): Promise<void>;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const error = ref('');
const loading = ref(false);

// 削除処理
const handleDelete = async () => {
  if (!props.item) return;

  loading.value = true;
  error.value = '';

  try {
    await emit('delete', props.item.id);
    handleClose();
  } catch (err) {
    error.value = 'アイテムの削除に失敗しました。';
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