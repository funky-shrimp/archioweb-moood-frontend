<template>
  <!--
    Header principal de l’application.
    - Affiche la “brand” Moood
    - Barre de recherche qui redirige vers /search?q=...
    - Navigation (Explore + Login/Signup ou profil + Logout selon l’état de connexion)
  -->
  <header class="header">
    <div class="brand">Moood</div>

    <!-- barre de recherche globale des boards - visible uniquement si connecté -->
    <div v-if="auth.user" class="searchbar">
      <input v-model="q" placeholder="Search boards..." @keyup.enter="onSearch" />
      <button @click="onSearch">Search</button>
    </div>

    <nav class="nav">
      <router-link to="/explore">Explore</router-link>
      <!-- Si un user est connecté : lien vers son profil + bouton Logout -->
      <template v-if="auth.user">
        <router-link :to="`/profile/${auth.user._id}`">{{ auth.user.username }}</router-link>
        <button class="btn" @click="logout">Logout</button>
      </template>
      <!-- Sinon : liens Login / Signup -->
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

// Store d’auth pour savoir si un user est loggé
const auth = useAuthStore()
const router = useRouter()

// Texte de la barre de recherche
const q = ref('')

// Lance la recherche en naviguant vers /search avec un query param
function onSearch() {
  router.push({ path: '/search', query: { q: q.value || '' } })
}

// Déconnexion simple : on vide le store + localStorage et on retourne à la home
function logout() {
  auth.clearAuth()
  router.push('/')
}
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
  background: #666;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.searchbar button:hover {
  background: #555;
}
</style>
