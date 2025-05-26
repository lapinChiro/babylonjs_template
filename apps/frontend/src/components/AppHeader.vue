<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  // ヘッダーがマウントされたときにセッションをチェック
  authStore.checkSession()
})

const goHome = () => {
  router.push('/')
}

const logout = async () => {
  try {
    await authStore.logout()
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<template>
  <header class="app-header">
    <div class="header-content">
      <h1 class="logo" @click="goHome">App Template</h1>
      
      <div class="user-section">
        <div v-if="authStore.isLoading" class="loading">
          読み込み中...
        </div>
        <div v-else-if="authStore.isLoggedIn" class="user-info">
          <span class="username">{{ authStore.userName }}</span>
          <button @click="logout" class="logout-btn">ログアウト</button>
        </div>
        <div v-else class="guest-info">
          <span>ゲスト</span>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
  width: 100%;
}

.header-content {
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  margin: 0;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s;
}

.logo:hover {
  color: #42b883;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.loading {
  color: #95a5a6;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  font-weight: 500;
}

.logout-btn {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: #c0392b;
}

.guest-info {
  color: #95a5a6;
}
</style>