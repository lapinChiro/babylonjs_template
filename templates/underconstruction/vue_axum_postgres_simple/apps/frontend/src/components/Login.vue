<script setup lang="ts">
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

const login = async () => {
  try {
    console.log('Login button clicked')
    await authStore.login()
  } catch (error) {
    console.error('Login error:', error)
  }
}
</script>

<template>
  <div class="login-container">
    <button type="button" @click="login" class="login-button">ログイン</button>
  </div>
</template>

<style scoped>
.login-container {
  margin: 20px 0;
}

.login-button {
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.login-button:hover {
  background-color: #45a049;
}
</style>