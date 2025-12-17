<template>
  <!--
    Header principal de l’application.
    - Affiche la “brand” Moood
    - Barre de recherche qui redirige vers /search?q=...
    - Navigation (Explore + Login/Signup ou profil + Logout selon l’état de connexion)
  -->
  <header class="header">
    <div class="brand">
      <img src="/logo.png" alt="Moood" class="logo logo-desktop" />
      <img src="/logoMobile.png" alt="Moood" class="logo logo-mobile" />
    </div>

    <!-- barre de recherche globale des boards - visible uniquement si connecté -->
    <div v-if="auth.user" class="searchbar">
      <input v-model="q" placeholder="Search boards..." @keyup.enter="onSearch" />
      <button @click="onSearch">Search</button>
    </div>

    <!-- Navigation desktop -->
    <nav class="nav desktop-nav">
      <button class="nav-btn" @click="router.push('/explore')">Explore</button>
      <!-- Si un user est connecté : lien vers son profil + bouton Logout -->
      <template v-if="auth.user">
        <button class="nav-btn" @click="router.push(`/profile/${auth.user._id}`)">{{ auth.user.username }}</button>
        <button class="nav-btn logout-btn" @click="logout">Logout</button>
      </template>
      <!-- Sinon : liens Login / Signup -->
      <template v-else>
        <button class="nav-btn" @click="router.push('/login')">Login</button>
        <button class="nav-btn" @click="router.push('/signup')">Signup</button>
      </template>
    </nav>

    <!-- Burger menu mobile -->
    <button class="burger-btn" @click="toggleMenu" aria-label="Menu">
      <span class="burger-line"></span>
      <span class="burger-line"></span>
      <span class="burger-line"></span>
    </button>

    <!-- Menu mobile overlay -->
    <div v-if="menuOpen" class="mobile-menu" @click="closeMenu">
      <div class="mobile-menu-content" @click.stop>
        <div class="mobile-menu-header">
          <img src="/logo.png" alt="Moood" class="logo" />
          <button class="close-btn" @click="closeMenu">✕</button>
        </div>

        <nav class="mobile-nav">
          <button class="mobile-nav-item" @click="navigateTo('/explore')">
            Explore
          </button>

          <template v-if="auth.user">
            <button class="mobile-nav-item account-item" @click="navigateTo(`/profile/${auth.user._id}`)">
              <div class="account-info">
                <div class="avatar-circle">
                  {{ (auth.user.username || 'U').charAt(0).toUpperCase() }}
                </div>
                <span>{{ auth.user.username }}</span>
              </div>
            </button>
            <button class="mobile-nav-item logout-item" @click="logout">
              Logout
            </button>
          </template>

          <template v-else>
            <button class="mobile-nav-item" @click="navigateTo('/login')">
              Login
            </button>
            <button class="mobile-nav-item" @click="navigateTo('/signup')">
              Signup
            </button>
          </template>
        </nav>
      </div>
    </div>
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

// État du menu mobile
const menuOpen = ref(false)

// Lance la recherche en naviguant vers /search avec un query param
function onSearch() {
  router.push({ path: '/search', query: { q: q.value || '' } })
}

// Déconnexion simple : on vide le store + localStorage et on retourne à la home
function logout() {
  auth.clearAuth()
  closeMenu()
  router.push('/')
}

// Gestion du menu mobile
function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function navigateTo(path) {
  router.push(path)
  closeMenu()
}
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid #e5e5e5;
  background: #ffffff;
}

.brand {
  display: flex;
  align-items: center;
}

.logo {
  height: 40px;
  width: auto;
}

.logo-mobile {
  display: none;
}

.logo-desktop {
  display: block;
}

.nav {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-btn {
  padding: 8px 16px;
  background: transparent;
  color: #1d1d1f;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.nav-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.searchbar {
  display: flex;
  align-items: center;
  flex: 1;
  max-width: 500px;
  margin: 0 32px;
}

.searchbar input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  margin-right: 8px;
  font-size: 14px;
  outline: none;
}

.searchbar input:focus {
  border-color: #9ca3af;
}

.searchbar button {
  padding: 8px 16px;
  background: #1d1d1f !important;
  color: #ffffff !important;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: none;
}

.logout-btn {
  background: #ef4444 !important;
  color: #ffffff !important;
  border-color: #ef4444 !important;
}

.logout-btn:hover {
  background: #dc2626 !important;
  border-color: #dc2626 !important;
}

/* Burger menu - caché sur desktop */
.burger-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
}

.burger-line {
  width: 25px;
  height: 3px;
  background: #1d1d1f;
  border-radius: 2px;
  transition: all 0.3s ease;
}

/* Menu mobile overlay */
.mobile-menu {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 200;
}

.mobile-menu-content {
  position: absolute;
  top: 0;
  right: 0;
  width: 80%;
  max-width: 320px;
  height: 100%;
  background: #ffffff;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.mobile-menu-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e5e5;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #1d1d1f;
  padding: 4px;
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  padding: 20px 0;
}

.mobile-nav-item {
  width: 100%;
  padding: 16px 20px;
  background: transparent;
  border: none;
  border-bottom: 1px solid #f3f4f6;
  text-align: left;
  font-size: 16px;
  font-weight: 500;
  color: #1d1d1f;
  cursor: pointer;
  transition: background 0.2s ease;
}

.mobile-nav-item:hover {
  background: #f9fafb;
}

.account-item {
  padding: 12px 20px;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
}

.logout-item {
  color: #ef4444;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .desktop-nav {
    display: none !important;
  }

  .logo-desktop {
    display: none;
  }

  .logo-mobile {
    display: block;
  }

  .burger-btn {
    display: flex;
  }

  .mobile-menu {
    display: block;
  }

  .searchbar {
    flex: 1;
    margin: 0 12px;
    max-width: none;
  }

  .searchbar input {
    font-size: 13px;
    padding: 6px 10px;
  }

  .searchbar button {
    padding: 6px 12px;
    font-size: 13px;
  }

  .header {
    padding: 12px 16px;
  }
}
</style>
