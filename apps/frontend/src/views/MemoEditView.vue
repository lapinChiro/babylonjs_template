<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useMemoStore } from '../stores/memo'
import type { MemoData } from '../models/models'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const memoStore = useMemoStore()

const uuid = route.params.uuid as string
const title = ref('')
const content = ref('')
const isSubmitting = ref(false)
const isLoading = ref(true)
const validationErrors = ref<{ title?: string; content?: string }>({})

function validateForm(): boolean {
  validationErrors.value = {}
  let isValid = true

  if (!title.value.trim()) {
    validationErrors.value.title = 'タイトルは必須です'
    isValid = false
  } else if (title.value.length > 100) {
    validationErrors.value.title = 'タイトルは100文字以内で入力してください'
    isValid = false
  }

  if (!content.value.trim()) {
    validationErrors.value.content = '内容は必須です'
    isValid = false
  } else if (content.value.length > 1000) {
    validationErrors.value.content = '内容は1000文字以内で入力してください'
    isValid = false
  }

  return isValid
}

async function loadMemo() {
  isLoading.value = true
  
  try {
    const memo = await memoStore.getMemo(uuid)
    if (memo) {
      title.value = memo.title
      content.value = memo.content
    } else {
      alert('メモが見つかりませんでした')
      router.push('/memos')
    }
  } catch (error) {
    console.error('Failed to load memo:', error)
    alert('メモの読み込みに失敗しました')
    router.push('/memos')
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit() {
  if (!validateForm()) {
    return
  }

  isSubmitting.value = true

  const memoData: MemoData = {
    uuid: uuid,
    title: title.value.trim(),
    content: content.value.trim()
  }

  const success = await memoStore.updateMemo(uuid, memoData)
  
  if (success) {
    router.push('/memos')
  } else {
    alert('メモの更新に失敗しました')
    isSubmitting.value = false
  }
}

function handleCancel() {
  router.push('/memos')
}

onMounted(() => {
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }
  loadMemo()
})
</script>

<template>
  <div class="memo-edit-container">
    <div class="memo-edit-header">
      <h1>メモ編集</h1>
    </div>

    <div v-if="isLoading" class="loading">
      読み込み中...
    </div>

    <form v-else @submit.prevent="handleSubmit" class="memo-form">
      <div class="form-group">
        <label for="title" class="form-label">タイトル <span class="required">*</span></label>
        <input
          id="title"
          v-model="title"
          type="text"
          class="form-input"
          :class="{ 'error': validationErrors.title }"
          placeholder="メモのタイトルを入力"
          :disabled="isSubmitting"
          maxlength="100"
        />
        <span v-if="validationErrors.title" class="error-message">{{ validationErrors.title }}</span>
        <span class="char-count">{{ title.length }} / 100</span>
      </div>

      <div class="form-group">
        <label for="content" class="form-label">内容 <span class="required">*</span></label>
        <textarea
          id="content"
          v-model="content"
          class="form-textarea"
          :class="{ 'error': validationErrors.content }"
          placeholder="メモの内容を入力"
          :disabled="isSubmitting"
          rows="10"
          maxlength="1000"
        ></textarea>
        <span v-if="validationErrors.content" class="error-message">{{ validationErrors.content }}</span>
        <span class="char-count">{{ content.length }} / 1000</span>
      </div>

      <div class="form-actions">
        <button
          type="button"
          @click="handleCancel"
          class="btn-cancel"
          :disabled="isSubmitting"
        >
          キャンセル
        </button>
        <button
          type="submit"
          class="btn-submit"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? '更新中...' : '更新' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.memo-edit-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}

.memo-edit-header {
  margin-bottom: 2rem;
}

.memo-edit-header h1 {
  font-size: 2rem;
  color: #333;
  margin: 0;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

.memo-form {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-label {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 0.5rem;
}

.required {
  color: #dc3545;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.15s ease-in-out;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 0.2rem rgba(0, 102, 204, 0.25);
}

.form-input.error,
.form-textarea.error {
  border-color: #dc3545;
}

.form-input.error:focus,
.form-textarea.error:focus {
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}

.form-textarea {
  resize: vertical;
  min-height: 150px;
}

.error-message {
  display: block;
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.char-count {
  position: absolute;
  right: 0;
  bottom: -1.5rem;
  font-size: 0.875rem;
  color: #6c757d;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-cancel,
.btn-submit {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: opacity 0.15s ease-in-out;
}

.btn-cancel {
  background-color: #6c757d;
  color: white;
}

.btn-cancel:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-submit {
  background-color: #0066cc;
  color: white;
}

.btn-submit:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-cancel:disabled,
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .memo-edit-container {
    padding: 1rem;
  }

  .memo-form {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column-reverse;
  }

  .btn-cancel,
  .btn-submit {
    width: 100%;
  }
}
</style>