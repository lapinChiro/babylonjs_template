<template>
  <div class="home">
    <h2>User Management</h2>
    <div class="test-section">
      <h3>Create User</h3>
      <div class="form-group">
        <input v-model="username" placeholder="Enter username" @keyup.enter="createUser" />
        <input v-model="email" placeholder="Enter email (optional)" @keyup.enter="createUser" />
        <button @click="createUser">Create User</button>
      </div>
      <p v-if="userResponse" class="response">{{ userResponse }}</p>
    </div>
    <div class="users-section">
      <h3>Users List</h3>
      <div v-if="loading" class="loading">Loading...</div>
      <div v-else-if="users.length === 0" class="no-users">No users yet</div>
      <table v-else class="users-table">
        <thead>
          <tr>
            <th>UUID</th>
            <th>User Code</th>
            <th>Name</th>
            <th>Email</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.uuid">
            <td class="uuid">{{ formatUuid(user.uuid) }}</td>
            <td>{{ user.user_code }}</td>
            <td>{{ user.name }}</td>
            <td>{{ user.mail }}</td>
            <td>{{ formatDate(user.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface User {
  uuid: string
  user_code: string
  name: string
  mail: string
  last_login_at: string | null
  created_at: string | null
}

const username = ref('')
const email = ref('')
const userResponse = ref('')
const users = ref<User[]>([])
const loading = ref(false)

const fetchUsers = async () => {
  loading.value = true
  try {
    const response = await fetch('http://localhost:3000/api/users')
    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }
    users.value = await response.json()
  } catch (e) {
    console.error('Error fetching users:', e)
  } finally {
    loading.value = false
  }
}

const createUser = async () => {
  userResponse.value = ''
  if (!username.value) {
    userResponse.value = 'Please enter a username'
    return
  }

  try {
    const body: any = { username: username.value }
    if (email.value) {
      body.email = email.value
    }

    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    if (!response.ok) {
      throw new Error('Failed to create user')
    }
    const data = await response.json()
    userResponse.value = `User created successfully!`
    username.value = ''
    email.value = ''
    // Refresh the users list
    await fetchUsers()
  } catch (e) {
    userResponse.value = e instanceof Error ? e.message : 'Unknown error'
  }
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

const formatUuid = (uuid: string) => {
  if (!uuid) return ''
  return uuid.slice(0, 8) + '...'
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.home {
  max-width: 1200px;
  margin: 0 auto;
}

h2 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.test-section, .users-section {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.response {
  margin-top: 1rem;
  padding: 0.5rem;
  background: #f0f0f0;
  border-radius: 4px;
  color: #42b883;
  font-weight: bold;
}

input {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 200px;
}

button {
  padding: 0.5rem 1rem;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

button:hover {
  background: #35a372;
}

.loading {
  text-align: center;
  color: #666;
  padding: 2rem;
}

.no-users {
  text-align: center;
  color: #999;
  padding: 2rem;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.users-table th {
  background: #f5f5f5;
  padding: 0.75rem;
  text-align: left;
  border-bottom: 2px solid #ddd;
  color: #333;
}

.users-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
}

.users-table tr:hover {
  background: #fafafa;
}

.uuid {
  font-family: monospace;
  font-size: 0.9em;
  color: #666;
}
</style>