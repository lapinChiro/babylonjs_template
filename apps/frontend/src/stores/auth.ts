import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createLoginClientContext } from '../api/loginClient/loginClientContext'
import { session as sessionOperation, login as loginOperation, logout as logoutOperation, oauth as oauthOperation } from '../api/loginClient/loginClientOperations'
import { getClientOptionsWithCredentials } from '../utils/credentialsPolicy'
import type { OAuthResult } from '../models/models'

export const useAuthStore = defineStore('auth', () => {
  const isLoggedIn = ref(false)
  const isLoading = ref(false)
  const userName = ref<string | null>(null)
  const userEmail = ref<string | null>(null)

  const createLoginClient = () => {
    const clientOptions = getClientOptionsWithCredentials({
      allowInsecureConnection: true
    })
    
    // Determine endpoint based on current host
    const endpoint = window.location.hostname === 'localhost' 
      ? 'http://localhost:3000/' 
      : `${window.location.protocol}//${window.location.host}/api/`
    
    return createLoginClientContext(endpoint, clientOptions)
  }

  const checkSession = async () => {
    isLoading.value = true
    try {
      const client = createLoginClient()
      const result = await sessionOperation(client)
      
      isLoggedIn.value = result.resultCode === 'success'
      
      if (isLoggedIn.value && result.data) {
        userName.value = result.data.name
        userEmail.value = result.data.email
      } else {
        userName.value = null
        userEmail.value = null
      }
      
      return isLoggedIn.value
    } catch (error) {
      console.error('Session check error:', error)
      isLoggedIn.value = false
      userName.value = null
      userEmail.value = null
      return false
    } finally {
      isLoading.value = false
    }
  }

  const login = async () => {
    try {
      const client = createLoginClient()
      const result = await loginOperation(client)
      
      if (result.data?.url) {
        window.location.href = result.data.url
      }
      return result
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      const client = createLoginClient()
      const result = await logoutOperation(client)
      
      if (result.resultCode === "success") {
        isLoggedIn.value = false
        userName.value = null
        userEmail.value = null
        window.location.href = '/'
      }
      return result
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const handleOAuthCallback = async (oauthResult: OAuthResult) => {
    try {
      const client = createLoginClient()
      const result = await oauthOperation(client, oauthResult)
      
      if (result.resultCode === 'success') {
        // Check session after successful OAuth to update user state
        await checkSession()
      }
      
      return result
    } catch (error) {
      console.error('OAuth callback error:', error)
      throw error
    }
  }

  return {
    isLoggedIn,
    isLoading,
    userName,
    userEmail,
    checkSession,
    login,
    logout,
    handleOAuthCallback
  }
})