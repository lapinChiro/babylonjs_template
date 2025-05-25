<script setup lang="ts">
import { createLoginClientContext } from '../api/loginClient/loginClientContext'
import { login as loginOperation } from '../api/loginClient/loginClientOperations'
import { getClientOptionsWithCredentials } from '../utils/credentialsPolicy'

const login = async () => {
  try {
    console.log('Login button clicked')
    const clientOptions = getClientOptionsWithCredentials({
      allowInsecureConnection: true
    })
    const client = createLoginClientContext("http://localhost:3000/", clientOptions)
    const result = await loginOperation(client)
    console.log('Login result:', result)
    
    if (result.data?.url) {
      window.location.href = result.data.url
    }
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