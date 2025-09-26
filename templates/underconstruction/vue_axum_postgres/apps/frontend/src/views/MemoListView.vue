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

function formatDate(utsms: bigint): string {
  const date = new Date(Number(utsms))
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}`
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

    <div v-else class="memo-table-container">
      <table class="memo-table">
        <thead>
          <tr>
            <th class="th-title">タイトル</th>
            <th class="th-content">内容</th>
            <th class="th-created">作成日時</th>
            <th class="th-updated">更新日時</th>
            <th class="th-actions">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="memo in memoStore.memos" :key="memo.uuid">
            <td class="td-title">{{ memo.title }}</td>
            <td class="td-content">{{ memo.content }}</td>
            <td class="td-created">{{ formatDate(memo.createdUtsms) }}</td>
            <td class="td-updated">{{ formatDate(memo.updatedUtsms) }}</td>
            <td class="td-actions">
              <button @click="editMemo(memo.uuid)" class="btn-edit">
                編集
              </button>
              <button @click="deleteMemo(memo.uuid)" class="btn-delete">
                削除
              </button>
            </td>
          </tr>
        </tbody>
      </table>
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

.memo-table-container {
  overflow-x: auto;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.memo-table {
  width: 100%;
  border-collapse: collapse;
}

.memo-table thead {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}

.memo-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #495057;
  white-space: nowrap;
}

.memo-table tbody tr {
  border-bottom: 1px solid #dee2e6;
  transition: background-color 0.2s;
}

.memo-table tbody tr:hover {
  background-color: #f8f9fa;
}

.memo-table tbody tr:last-child {
  border-bottom: none;
}

.memo-table td {
  padding: 1rem;
  color: #333;
}

.th-title {
  width: 20%;
  min-width: 150px;
}

.th-content {
  width: 40%;
  min-width: 200px;
}

.th-created,
.th-updated {
  width: 15%;
  min-width: 120px;
}

.th-actions {
  width: 10%;
  min-width: 120px;
  text-align: center;
}

.td-title {
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 300px;
}

.td-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400px;
  color: #666;
}

.td-created,
.td-updated {
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
}

.td-actions {
  text-align: center;
  white-space: nowrap;
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
  
  .memo-table {
    font-size: 0.875rem;
  }
  
  .memo-table th,
  .memo-table td {
    padding: 0.5rem;
  }
  
  .th-content,
  .td-content {
    display: none;
  }
  
  .btn-edit,
  .btn-delete {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
  }
}
</style>