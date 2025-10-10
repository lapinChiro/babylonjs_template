<template>
  <div class="w-full">
    <!-- ヘッダー -->
    <div class="mb-6">
      <Button @click="showUploadDialog = true" class="gap-2">
        <Upload class="size-4" />
        画像アップロード
      </Button>
    </div>

    <!-- 画像グリッド -->
    <div v-if="imagesStore.sortedImages.length > 0" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <TransitionGroup
        name="grid"
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 scale-90"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-90"
        move-class="transition-transform duration-300"
      >
        <div
          v-for="image in imagesStore.sortedImages"
          :key="image.id"
          class="relative group aspect-square bg-muted rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200"
          @click="handleImageClick(image)"
        >
          <img
            :src="image.url"
            :alt="image.original_name"
            class="w-full h-full object-cover"
            loading="lazy"
          />
          <div class="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
            <div class="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                @click.stop="handleImageClick(image)"
                class="gap-2"
              >
                <Eye class="size-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                @click.stop="handleDeleteClick(image)"
                class="gap-2"
              >
                <Trash2 class="size-4" />
              </Button>
            </div>
          </div>
          <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
            <p class="text-white text-xs truncate">{{ image.original_name }}</p>
            <p class="text-white/70 text-xs">{{ formatFileSize(image.size) }}</p>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- 空状態 -->
    <div v-else class="flex flex-col items-center justify-center py-12 text-muted-foreground">
      <ImageIcon class="size-24 opacity-20 mb-4" />
      <p class="text-lg mb-2">画像が登録されていません</p>
      <p class="text-sm">「画像アップロード」ボタンから新しい画像を追加してください</p>
    </div>

    <!-- アップロードダイアログ -->
    <ImageUploadDialog
      :open="showUploadDialog"
      @close="showUploadDialog = false"
    />

    <!-- プレビューダイアログ -->
    <ImagePreviewDialog
      :open="showPreviewDialog"
      :image="selectedImage"
      @close="handleClosePreview"
      @delete="handleDeleteClick"
    />

    <!-- 削除確認ダイアログ -->
    <ImageDeleteDialog
      :open="showDeleteDialog"
      :image="selectedImage"
      @close="handleCloseDelete"
      @delete="handleConfirmDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, defineAsyncComponent } from 'vue';
import { Button } from '@/components/ui/button';
import { Upload, Eye, Trash2, ImageIcon } from 'lucide-vue-next';
import { useImagesStore } from '@/stores';
import type { Image } from '@/types';

// ダイアログコンポーネントの動的インポート
const ImageUploadDialog = defineAsyncComponent(() =>
  import('./ImageUploadDialog.vue')
);
const ImagePreviewDialog = defineAsyncComponent(() =>
  import('./ImagePreviewDialog.vue')
);
const ImageDeleteDialog = defineAsyncComponent(() =>
  import('./ImageDeleteDialog.vue')
);

const imagesStore = useImagesStore();

// ダイアログの表示状態
const showUploadDialog = ref(false);
const showPreviewDialog = ref(false);
const showDeleteDialog = ref(false);
const selectedImage = ref<Image | null>(null);

// 画像操作ハンドラー
const handleImageClick = (image: Image) => {
  selectedImage.value = image;
  showPreviewDialog.value = true;
};

const handleDeleteClick = (image: Image) => {
  selectedImage.value = image;
  showPreviewDialog.value = false;
  showDeleteDialog.value = true;
};

const handleConfirmDelete = async (id: string) => {
  await imagesStore.deleteImage(id);
  showDeleteDialog.value = false;
  selectedImage.value = null;
};

const handleClosePreview = () => {
  showPreviewDialog.value = false;
  selectedImage.value = null;
};

const handleCloseDelete = () => {
  showDeleteDialog.value = false;
  selectedImage.value = null;
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

<style scoped>
.grid-move {
  transition: transform 0.3s ease;
}
</style>
