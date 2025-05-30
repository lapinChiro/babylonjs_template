import { defineStore } from 'pinia'
import { ref } from 'vue'
import { TemplateServiceClient } from '../templateServiceClient'
import type { MemoData, MemoItem } from '../models/models'
import { getClientOptionsWithCredentials } from '../utils/credentialsPolicy'

export const useMemoStore = defineStore('memo', () => {
  const memos = ref<MemoItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const endpoint = location.hostname === 'localhost' ? 'http://localhost:3000' : location.origin + '/api'
  const clientOptions = getClientOptionsWithCredentials({
    allowInsecureConnection: true
  })
  const client = new TemplateServiceClient(endpoint, clientOptions)

  async function fetchMemos() {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await client.memoClient.list()
      memos.value = response.list || []
      return true
    } catch (err) {
      console.error('Failed to fetch memos:', err)
      error.value = 'メモの取得に失敗しました'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function createMemo(memoData: MemoData) {
    isLoading.value = true
    error.value = null
    
    try {
      await client.memoClient.create(memoData)
      await fetchMemos() // 作成後にリストを更新
      return true
    } catch (err) {
      console.error('Failed to create memo:', err)
      error.value = 'メモの作成に失敗しました'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updateMemo(uuid: string, memoData: MemoData) {
    isLoading.value = true
    error.value = null
    
    try {
      // APIに更新エンドポイントがない場合は、削除して新規作成で対応
      await client.memoClient.remove(uuid)
      await client.memoClient.create(memoData)
      await fetchMemos()
      return true
    } catch (err) {
      console.error('Failed to update memo:', err)
      error.value = 'メモの更新に失敗しました'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function deleteMemo(uuid: string) {
    isLoading.value = true
    error.value = null
    
    try {
      await client.memoClient.remove(uuid)
      await fetchMemos() // 削除後にリストを更新
      return true
    } catch (err) {
      console.error('Failed to delete memo:', err)
      error.value = 'メモの削除に失敗しました'
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function getMemo(uuid: string) {
    isLoading.value = true
    error.value = null
    
    try {
      const response = await client.memoClient.description(uuid)
      return response.data
    } catch (err) {
      console.error('Failed to get memo:', err)
      error.value = 'メモの取得に失敗しました'
      return null
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  return {
    memos,
    isLoading,
    error,
    fetchMemos,
    createMemo,
    updateMemo,
    deleteMemo,
    getMemo,
    clearError
  }
})