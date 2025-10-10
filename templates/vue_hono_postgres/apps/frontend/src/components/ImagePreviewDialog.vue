<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle>画像プレビュー</DialogTitle>
        <DialogDescription v-if="image">
          {{ image.original_name }}
        </DialogDescription>
      </DialogHeader>

      <div v-if="image" class="space-y-4">
        <!-- 画像プレビュー -->
        <div class="relative w-full bg-muted rounded-lg overflow-hidden" style="max-height: 60vh;">
          <img
            :src="image.url"
            :alt="image.original_name"
            class="w-full h-full object-contain"
          />
        </div>

        <!-- 画像情報 -->
        <div class="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg text-sm">
          <div>
            <p class="text-muted-foreground">ファイル名</p>
            <p class="font-medium truncate">{{ image.original_name }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">ファイルサイズ</p>
            <p class="font-medium">{{ formatFileSize(image.size) }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">形式</p>
            <p class="font-medium">{{ image.mime_type }}</p>
          </div>
          <div>
            <p class="text-muted-foreground">アップロード日時</p>
            <p class="font-medium">{{ formatDate(image.created_at) }}</p>
          </div>
        </div>

        <!-- アクション -->
        <div class="flex gap-2 pt-2">
          <Button
            variant="outline"
            @click="handleClose"
            class="flex-1"
          >
            閉じる
          </Button>
          <Button
            variant="outline"
            @click="handleDownload"
            class="gap-2"
          >
            <Download class="size-4" />
            ダウンロード
          </Button>
          <Button
            variant="destructive"
            @click="handleDeleteClick"
            class="gap-2"
          >
            <Trash2 class="size-4" />
            削除
          </Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, Trash2 } from 'lucide-vue-next';
import type { Image } from '@/types';

interface Props {
  open: boolean;
  image: Image | null;
}

interface Emits {
  (e: 'close'): void;
  (e: 'delete', image: Image): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// ダイアログを閉じる処理
const handleClose = () => {
  emit('close');
};

// 削除ボタン処理
const handleDeleteClick = () => {
  if (props.image) {
    emit('delete', props.image);
  }
};

// ダウンロード処理
const handleDownload = () => {
  if (!props.image) return;

  const link = document.createElement('a');
  link.href = props.image.url;
  link.download = props.image.original_name;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// ファイルサイズをフォーマット
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

// 日付をフォーマット
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};
</script>
