<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Login from './Login.vue'
import Logout from './Logout.vue'
import { useAuthStore } from '../stores/auth'

defineProps<{ msg: string }>()

const count = ref(0)
const authStore = useAuthStore()

onMounted(() => {
  authStore.checkSession()
})
</script>

<template>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <div v-if="authStore.isLoading" class="loading-container">
    <p>ログイン状態を確認中...</p>
  </div>
  <Logout v-else-if="authStore.isLoggedIn" />
  <Login v-else />
  
  <div v-if="authStore.isLoggedIn && authStore.userName" class="user-info">
    <p>ログイン中: {{ authStore.userName }} ({{ authStore.userEmail }})</p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}

.loading-container {
  margin: 20px 0;
  text-align: center;
  color: #666;
}

.user-info {
  margin: 10px 0;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  text-align: center;
  color: #333;
}
</style>
