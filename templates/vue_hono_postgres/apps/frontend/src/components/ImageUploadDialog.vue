<template>
  <Dialog :open="open" @update:open="handleClose">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>画像アップロード</DialogTitle>
        <DialogDescription>
          アップロードする画像を選択してください（JPEG, PNG, GIF, WebP / 最大10MB）
        </DialogDescription>
      </DialogHeader>

      <ErrorMessage
        v-if="error"
        :message="error"
        @close="error = ''"
      />

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <!-- ファイル選択エリア -->
        <div class="space-y-2">
          <div
            @click="triggerFileInput"
            @dragover.prevent="isDragging = true"
            @dragleave.prevent="isDragging = false"
            @drop.prevent="handleDrop"
            :class="[
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragging ? 'border-primary bg-primary/10' : 'border-muted hover:border-primary/50',
              selectedFile ? 'bg-muted/30' : ''
            ]"
          >
            <input
              ref="fileInput"
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              @change="handleFileSelect"
              class="hidden"
            />
            <div v-if="!selectedFile" class="flex flex-col items-center gap-2">
              <Upload class="size-12 text-muted-foreground" />
              <p class="text-sm font-medium">クリックまたはドラッグ＆ドロップ</p>
              <p class="text-xs text-muted-foreground">JPEG, PNG, GIF, WebP / 最大10MB</p>
            </div>
            <div v-else class="flex flex-col items-center gap-2">
              <ImageIcon class="size-12 text-primary" />
              <p class="text-sm font-medium truncate max-w-full">{{ selectedFile.name }}</p>
              <p class="text-xs text-muted-foreground">{{ formatFileSize(selectedFile.size) }}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                @click.stop="clearSelection"
                class="mt-2"
              >
                <X class="size-4 mr-2" />
                選択解除
              </Button>
            </div>
          </div>
        </div>

        <!-- プレビュー -->
        <div v-if="previewUrl" class="space-y-2">
          <Label>プレビュー</Label>
          <div class="relative aspect-video bg-muted rounded-lg overflow-hidden">
            <img
              :src="previewUrl"
              alt="Preview"
              class="w-full h-full object-contain"
            />
          </div>
        </div>

        <!-- アップロード進捗 -->
        <div v-if="uploading" class="space-y-2">
          <div class="flex items-center justify-between text-sm">
            <span>アップロード中...</span>
            <span>{{ uploadProgress }}%</span>
          </div>
          <div class="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              class="bg-primary h-full transition-all duration-300"
              :style="{ width: `${uploadProgress}%` }"
            ></div>
          </div>
        </div>

        <div class="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            @click="handleClose"
            class="flex-1"
            :disabled="uploading"
          >
            キャンセル
          </Button>
          <Button
            type="submit"
            class="flex-1"
            :disabled="!selectedFile || uploading"
          >
            <template v-if="uploading">
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
              アップロード中...
            </template>
            <template v-else>
              <Upload class="mr-2 h-4 w-4" />
              アップロード
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
import { Label } from '@/components/ui/label';
import { Upload, ImageIcon, X, Loader2 } from 'lucide-vue-next';
import ErrorMessage from '@/components/common/ErrorMessage.vue';

interface Props {
  open: boolean;
}

interface Emits {
  (e: 'close'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const previewUrl = ref<string>('');
const error = ref('');
const uploading = ref(false);
const uploadProgress = ref(0);
const isDragging = ref(false);

// プレビューURL生成
watch(selectedFile, (newFile) => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value);
  }
  if (newFile) {
    previewUrl.value = URL.createObjectURL(newFile);
  } else {
    previewUrl.value = '';
  }
});

// ファイル選択トリガー
const triggerFileInput = () => {
  fileInput.value?.click();
};

// ファイル選択処理
const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    validateAndSetFile(file);
  }
};

// ドラッグ＆ドロップ処理
const handleDrop = (event: DragEvent) => {
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file) {
    validateAndSetFile(file);
  }
};

// ファイルバリデーション
const validateAndSetFile = (file: File) => {
  error.value = '';

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    error.value = 'サポートされていない画像形式です';
    return;
  }

  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    error.value = 'ファイルサイズは10MB以下にしてください';
    return;
  }

  selectedFile.value = file;
};

// 選択解除
const clearSelection = () => {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// フォーム送信処理
const handleSubmit = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;
  uploadProgress.value = 0;
  error.value = '';

  try {
    // 直接storeのuploadImageを呼び出す
    const { useImagesStore } = await import('@/stores');
    const imagesStore = useImagesStore();

    // アップロード進捗をシミュレート
    const progressInterval = setInterval(() => {
      if (uploadProgress.value < 90) {
        uploadProgress.value += 10;
      }
    }, 200);

    await imagesStore.uploadImage(selectedFile.value);

    clearInterval(progressInterval);
    uploadProgress.value = 100;

    // 成功時はフォームをリセット
    setTimeout(() => {
      clearSelection();
      handleClose();
    }, 500);
  } catch (err: any) {
    console.error('ImageUploadDialog caught error:', err);

    if (err.message) {
      error.value = err.message;
    } else {
      error.value = '画像のアップロードに失敗しました。';
    }
    uploadProgress.value = 0;
  } finally {
    uploading.value = false;
  }
};

// ダイアログを閉じる処理
const handleClose = () => {
  if (!uploading.value) {
    clearSelection();
    error.value = '';
    emit('close');
  }
};

// ファイルサイズをフォーマット
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};
</script>
