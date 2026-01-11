<template>
  <div class="explore-page">
    <div class="hero card" style="padding:18px; max-width:980px; margin:18px auto;">
      <h1>Explore</h1>
      <p class="small-muted">Découvre les moodboards publics — clique pour entrer dans la board.</p>
    </div>

    <main style="max-width:980px; margin:0 auto 40px;">
      <!-- Loading state -->
      <div v-if="loading && boards.length === 0" class="loading" style="text-align: center; padding: 40px;">
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

        <!-- Sentinel element pour déclencher le chargement des prochains boards -->
        <div v-if="nextCursor && !loading" ref="sentinel" style="height: 20px; margin-top: 40px;"></div>

        <!-- Loading indicator pour les chargements supplémentaires -->
        <div v-if="loading && boards.length > 0" style="text-align: center; padding: 20px;">
          <p>Chargement de plus de moodboards...</p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import api from '../services/api'
import BoardCard from '../components/BoardCard.vue'

const boards = ref([])
const loading = ref(false)
const error = ref(null)
const nextCursor = ref(null)
const sentinel = ref(null)
const observerInstance = ref(null)

async function fetchBoards(cursor = null) {
  loading.value = true
  error.value = null
  
  try {
    const params = cursor ? { cursor } : {}
    const res = await api.boards.list(params)
    
    console.log('API Response:', res)
    
    const items = Array.isArray(res.data.items) ? res.data.items : res.data?.items || []
    
    if (cursor) {
      boards.value.push(...items)
    } else {
      boards.value = items
    }
    
    nextCursor.value = res.data.nextCursor || null
    
    console.log('Boards loaded:', boards.value.length, 'Next cursor:', nextCursor.value)
    
  } catch (e) {
    console.error('Failed to load public boards:', e)
    error.value = 'Impossible de charger les moodboards. Veuillez réessayer.'
    if (!cursor) {
      boards.value = []
    }
  } finally {
    loading.value = false
  }
}

// Intersection Observer pour déclencher le chargement quand on scroll
function setupObserver() {
  // Nettoyer l'ancien observer
  if (observerInstance.value) {
    observerInstance.value.disconnect()
    observerInstance.value = null
  }
  
  // Vérifier que sentinel existe et qu'il y a un nextCursor
  if (!sentinel.value || !nextCursor.value) {
    console.log('setupObserver: sentinel ou nextCursor manquants', !!sentinel.value, !!nextCursor.value)
    return
  }
  
  console.log('setupObserver: création de l\'observer')
  
  const observer = new IntersectionObserver(
    entries => {
      console.log('Intersection detected:', entries[0].isIntersecting, 'loading:', loading.value, 'nextCursor:', !!nextCursor.value)
      
      if (entries[0].isIntersecting && nextCursor.value && !loading.value) {
        console.log('Fetching more boards with cursor:', nextCursor.value)
        fetchBoards(nextCursor.value)
      }
    },
    { threshold: 0.1, rootMargin: '100px' }
  )
  
  observer.observe(sentinel.value)
  observerInstance.value = observer
}

onMounted(() => {
  fetchBoards()
  // Attendre le prochain tick pour que sentinel soit rendu
  nextTick(() => {
    setupObserver()
  })
})

// Reconfigurer l'observer quand nextCursor change
watch(() => nextCursor.value, () => {
  nextTick(() => {
    setupObserver()
  })
})

onUnmounted(() => {
  if (observerInstance.value) {
    observerInstance.value.disconnect()
  }
})
</script>

<style scoped>
.feed { display:flex; flex-direction:column; gap:20px }
.error { background-color: #ffebee; }
</style>
