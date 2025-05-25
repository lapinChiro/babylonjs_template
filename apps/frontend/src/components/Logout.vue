<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const logout = async () => {
  try {
    console.log('Logout button clicked')
    await authStore.logout()
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<template>
  <div class="logout-container">
    <button type="button" @click="logout" class="logout-button">ログアウト</button>
  </div>
</template>

<style scoped>
.logout-container {
  margin: 20px 0;
}

.logout-button {
  background-color: #f44336;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.logout-button:hover {
  background-color: #da190b;
}
</style>