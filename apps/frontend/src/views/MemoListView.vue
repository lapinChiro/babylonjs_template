<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useMemoStore } from '../stores/memo'

const router = useRouter()
const authStore = useAuthStore()
const memoStore = useMemoStore()


async function deleteMemo(uuid: string) {
  if (!confirm('このメモを削除してもよろしいですか？')) {
    return
  }
  
  const success = await memoStore.deleteMemo(uuid)
  if (!success) {
    alert('メモの削除に失敗しました')
  }
}

function createMemo() {
  router.push('/memos/new')
}

function editMemo(uuid: string) {
  router.push(`/memos/${uuid}/edit`)
}

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  memoStore.fetchMemos()
})
</script>

<template>
  <div class="memo-list-container">
    <div class="memo-header">
      <h1>メモ一覧</h1>
      <button @click="createMemo" class="btn-primary">
        <span class="icon">➕</span>
        新規作成
      </button>
    </div>

    <div v-if="memoStore.isLoading" class="loading">
      読み込み中...
    </div>

    <div v-else-if="memoStore.error" class="error">
      {{ memoStore.error }}
    </div>

    <div v-else-if="memoStore.memos.length === 0" class="empty">
      メモがありません
    </div>

    <div v-else class="memo-grid">
      <div v-for="memo in memoStore.memos" :key="memo.uuid!" class="memo-card">
        <h3 class="memo-title">{{ memo.title }}</h3>
        <p class="memo-content">{{ memo.content }}</p>
        <div class="memo-actions">
          <button @click="editMemo(memo.uuid!)" class="btn-edit">
            編集
          </button>
          <button @click="deleteMemo(memo.uuid!)" class="btn-delete">
            削除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.memo-list-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.memo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.memo-header h1 {
  font-size: 2rem;
  color: #333;
  margin: 0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: #0066cc;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-primary:hover {
  background-color: #0056b3;
}

.loading, .error, .empty {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.error {
  color: #dc3545;
}

.memo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.memo-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  transition: box-shadow 0.3s;
}

.memo-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.memo-title {
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.memo-content {
  color: #666;
  margin: 0 0 1rem 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.5;
}

.memo-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-edit, .btn-delete {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.3s;
}

.btn-edit {
  background-color: #28a745;
  color: white;
}

.btn-edit:hover {
  opacity: 0.9;
}

.btn-delete {
  background-color: #dc3545;
  color: white;
}

.btn-delete:hover {
  opacity: 0.9;
}

.icon {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .memo-list-container {
    padding: 1rem;
  }
  
  .memo-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .btn-primary {
    justify-content: center;
  }
  
  .memo-grid {
    grid-template-columns: 1fr;
  }
}
</style>