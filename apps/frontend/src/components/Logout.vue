<script setup lang="ts">
import { createLoginClientContext } from '../api/loginClient/loginClientContext'
import { logout as logoutOperation } from '../api/loginClient/loginClientOperations'
import { getClientOptionsWithCredentials } from '../utils/credentialsPolicy'

const logout = async () => {
  try {
    console.log('Logout button clicked')
    const clientOptions = getClientOptionsWithCredentials({
      allowInsecureConnection: true
    })
    const client = createLoginClientContext("http://localhost:3000/", clientOptions)
    const result = await logoutOperation(client)
    console.log('Logout result:', result)
    
    // ログアウト成功後の処理（例：ホームページへリダイレクト）
    if (result.resultCode === "success") {
      window.location.href = '/'
    }
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