<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>画像削除確認</DialogTitle>
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
          画像「<span class="font-medium">{{ image?.original_name }}</span>」を削除しますか？
          この操作は取り消せません。
        </p>
        <div v-if="image" class="mt-4">
          <img
            :src="image.url"
            :alt="image.original_name"
            class="w-full h-32 object-cover rounded-lg"
          />
        </div>
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
import type { Image } from '@/types';

interface Props {
  open: boolean;
  image: Image | null;
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
  if (!props.image) return;

  loading.value = true;
  error.value = '';

  try {
    await emit('delete', props.image.id);
    handleClose();
  } catch (err) {
    error.value = '画像の削除に失敗しました。';
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
