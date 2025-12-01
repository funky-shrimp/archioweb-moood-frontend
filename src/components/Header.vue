<template>
  <header class="header">
    <div class="brand">Moood</div>

    <div class="searchbar">
      <input v-model="q" placeholder="Search boards..." @keyup.enter="onSearch" />
      <button @click="onSearch">Search</button>
    </div>

    <nav class="nav">
      <router-link to="/explore">Explore</router-link>
      <template v-if="auth.user">
        <router-link :to="`/profile/${auth.user._id}`">{{ auth.user.username }}</router-link>
        <button class="btn" @click="logout">Logout</button>
      </template>
      <template v-else>
        <router-link to="/login">Login</router-link>
        <router-link to="/signup">Signup</router-link>
      </template>
    </nav>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()
const q = ref('')

function onSearch() {
  router.push({ path: '/search', query: { q: q.value || '' } })
}
function logout() { auth.clearAuth(); router.push('/') }
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid var(--muted-border);
  background: var(--bg-header);
}
.brand { font-weight: 700; }
nav a { margin: 0 8px; }
.searchbar {
  display: flex;
  align-items: center;
}
.searchbar input {
  padding: 8px;
  border: 1px solid var(--muted-border);
  border-radius: 4px;
  margin-right: 8px;
}
.searchbar button {
  padding: 8px 12px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.searchbar button:hover {
  background: var(--primary-dark);
}
</style>
