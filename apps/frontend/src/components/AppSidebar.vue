<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <aside class="app-sidebar">
    <nav class="sidebar-nav">
      <router-link to="/" class="nav-item">
        <i class="icon">🏠</i>
        <span>Home</span>
      </router-link>
      <router-link to="/about" class="nav-item">
        <i class="icon">ℹ️</i>
        <span>About</span>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.app-sidebar {
  width: 250px;
  background-color: #f8f9fa;
  height: calc(100vh - 60px); /* ヘッダーの高さを引く */
  position: sticky;
  top: 60px; /* ヘッダーの高さ */
  overflow-y: auto;
  border-right: 1px solid #e9ecef;
}

.sidebar-nav {
  padding: 1rem 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: #495057;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background-color: #e9ecef;
  color: #212529;
}

.nav-item.router-link-exact-active {
  background-color: #e7f3ff;
  color: #0066cc;
  border-left-color: #0066cc;
  font-weight: 600;
}

.icon {
  font-size: 1.2rem;
  width: 1.5rem;
  text-align: center;
}

/* レスポンシブ対応 */
@media (max-width: 768px) {
  .app-sidebar {
    width: 200px;
  }
  
  .nav-item {
    padding: 0.6rem 1rem;
  }
}
</style>