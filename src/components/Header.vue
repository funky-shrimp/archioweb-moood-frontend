<template>
  <header class="app-header">
    <div class="brand">Moood</div>
    <nav class="main-nav">
      <router-link to="/explore">Explore</router-link>
    </nav>
    <div class="actions">
      <router-link to="/login">Login</router-link>
      <router-link to="/signup">Signup</router-link>
    </div>
  </header>
</template>

<script setup>
</script>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--muted-border);
  background: var(--bg-header);
}
.brand { font-weight: 700; }
.main-nav a { margin: 0 8px; }
.actions a { margin-left: 12px; }
</style>
