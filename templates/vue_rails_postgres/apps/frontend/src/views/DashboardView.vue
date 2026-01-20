<template>
  <div>
    <header>
      <div>
        <h1>サンプルシステム</h1>
        <div>
          <span>{{ authStore.currentUser?.email }}</span>
          <button @click="handleLogout">ログアウト</button>
        </div>
      </div>
    </header>

    <main>
      <!-- Items Section -->
      <section>
        <h2>アイテム一覧</h2>
        <div>
          <input
            v-model="newItemName"
            placeholder="アイテム名を入力"
          />
          <button
            @click="handleAddItem"
            :disabled="!newItemName.trim() || itemsStore.loading"
          >
            {{ itemsStore.loading ? '追加中...' : '追加' }}
          </button>
        </div>
        <div v-if="itemsStore.loading">読み込み中...</div>
        <table v-else-if="itemsStore.filteredItems.length > 0">
          <thead>
            <tr>
              <th>行番号</th>
              <th>アイテム名</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, index) in itemsStore.filteredItems" :key="item.id">
              <td>{{ index + 1 }}</td>
              <td>{{ item.name }}</td>
              <td>
                <button @click="handleDeleteItem(item.id)">削除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else>アイテムが登録されていません</p>
      </section>

      <!-- Images Section -->
      <section>
        <h2>画像一覧</h2>
        <div>
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            hidden
            @change="handleFileSelect"
          />
          <button
            @click="triggerFileInput"
            :disabled="imagesStore.uploading"
          >
            {{ imagesStore.uploading ? 'アップロード中...' : 'アップロード' }}
          </button>
        </div>
        <div v-if="imagesStore.loading">読み込み中...</div>
        <table v-else-if="imagesStore.sortedImages.length > 0">
          <thead>
            <tr>
              <th>行番号</th>
              <th>画像</th>
              <th>ファイル名</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(image, index) in imagesStore.sortedImages" :key="image.id">
              <td>{{ index + 1 }}</td>
              <td>
                <img :src="image.url" :alt="image.original_name" width="50" height="50" />
              </td>
              <td>{{ image.original_name }}</td>
              <td>
                <button @click="handleDeleteImage(image.id)">削除</button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else>画像が登録されていません</p>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, useItemsStore, useImagesStore } from '@/stores';

const router = useRouter();
const authStore = useAuthStore();
const itemsStore = useItemsStore();
const imagesStore = useImagesStore();

// Items state
const newItemName = ref('');

// Images state
const fileInputRef = ref<HTMLInputElement | null>(null);

// Logout handler
const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};

// Items handlers
const handleAddItem = async () => {
  if (!newItemName.value.trim()) return;
  try {
    await itemsStore.addItem({ name: newItemName.value });
    newItemName.value = '';
  } catch (error) {
    alert('アイテムの追加に失敗しました');
  }
};

const handleDeleteItem = async (id: string) => {
  try {
    await itemsStore.deleteItem(id);
  } catch (error) {
    alert('アイテムの削除に失敗しました');
  }
};

// Images handlers
const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    await imagesStore.uploadImage(file);
  } catch (error) {
    alert('画像のアップロードに失敗しました');
  }

  // Reset input
  if (fileInputRef.value) {
    fileInputRef.value.value = '';
  }
};

const handleDeleteImage = async (id: string) => {
  try {
    await imagesStore.deleteImage(id);
  } catch (error) {
    alert('画像の削除に失敗しました');
  }
};

</script>
