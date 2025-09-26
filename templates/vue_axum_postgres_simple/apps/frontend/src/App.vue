<script setup lang="ts">
</script>

<template>
  <div id="app">
    <header class="app-header">
      <h1>Vue + Axum + PostgreSQL</h1>
    </header>
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: #2c3e50;
  color: white;
  padding: 1rem 2rem;
}

.app-header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.main-content {
  flex: 1;
  padding: 2rem;
  background-color: #f5f5f5;
}
</style>