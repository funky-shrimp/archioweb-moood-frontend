<template>
  <div class="explore-page">
    <div class="hero card" style="padding:18px; max-width:980px; margin:18px auto;">
      <h1>Explore</h1>
      <p class="small-muted">Découvre les moodboards publics — clique pour entrer dans la board.</p>
    </div>

    <main style="max-width:980px; margin:0 auto 40px;">
      <!-- Loading state -->
      <div v-if="loading" class="loading" style="text-align: center; padding: 40px;">
        <p>Chargement des moodboards...</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="error card" style="padding: 18px; max-width: 980px; margin: 18px auto; border-left: 4px solid #d32f2f;">
        <p style="color: #d32f2f; margin: 0;">❌ {{ error }}</p>
      </div>

      <!-- Success state -->
      <section v-else class="feed">
        <div v-if="boards.length === 0" style="text-align: center; padding: 40px; color: #999;">
          <p>Aucun moodboard public trouvé.</p>
        </div>
        <BoardCard v-for="b in boards" :key="b._id" :board="b" />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import BoardCard from '../components/BoardCard.vue'

const boards = ref([])
const loading = ref(false)
const error = ref(null)

async function fetchBoards() {
  loading.value = true
  error.value = null
  
  try {
    const res = await api.boards.list()
    console.log(res);
    
    boards.value = Array.isArray(res.data.items) ? res.data.items : res.data?.items || []
    console.log('Boards loaded:', boards.value)
    
  } catch (e) {
    console.error('Failed to load public boards:', e)
    error.value = 'Impossible de charger les moodboards. Veuillez réessayer.'
    boards.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchBoards)
</script>

<style scoped>
.feed { display:flex; flex-direction:column; gap:20px }
.error { background-color: #ffebee; }
</style>
