<template>
  <div class="board-view page">
    <!-- Loading state -->
    <div v-if="loading" class="loading" style="text-align: center; padding: 40px;">
      <p>Chargement du moodboard...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error card" style="padding: 18px; max-width: 980px; margin: 18px auto; border-left: 4px solid #d32f2f;">
      <p style="color: #d32f2f; margin: 0;">❌ {{ error }}</p>
    </div>

    <!-- Success state -->
    <main v-else class="board-main card">
      <header class="board-header">
        <div>
          <h1>{{ board.title || 'Untitled board' }}</h1>
          <div class="small-muted">
            By
            <strong>{{ board.user || 'unknown' }}</strong>
          </div>
        </div>
      </header>

      <!-- Affichage de l'image -->
      <div v-if="board.imageUrl" class="board-image">
        <img :src="board.imageUrl" :alt="board.title" />
      </div>
      <div v-else class="empty-canvas small-muted">Aucun élément pour le moment.</div>

      <section class="board-actions card-subtle">
        <div class="action-block">
          <LikeButton
            :boardId="String(board._id)"
            :username="board.user"
            :initialLiked="board.likedByUser || false"
            :initialCount="board.likes || 0"
          />
        </div>
      </section>

      <section class="board-section board-labels">
        <h4>Labels</h4>
        <div v-if="board.labels?.length">
          <span class="tag" v-for="t in board.labels" :key="t">#{{ t }}</span>
        </div>
        <div v-else class="small-muted">No tags</div>
      </section>

      <section class="board-section comments-box">
        <h4>Comments</h4>
        <CommentsList v-if="board._id" :boardId="board._id" :showTitle="false" />
        <CommentForm v-if="board._id" :boardId="board._id" @created="fetchBoard" />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import CommentsList from '../components/CommentsList.vue'
import CommentForm from '../components/CommentForm.vue'
import LikeButton from '../components/LikeButton.vue'
import { useRoute } from 'vue-router'

const board = ref({})
const loading = ref(false)
const error = ref(null)
const route = useRoute()

async function fetchBoard() {
  loading.value = true
  error.value = null
  
  try {
    const id = route.params.id
    console.log("Fetching board with id:", id)
    
    if (id) {
      const res = await api.boards.get(id)
      console.log("Board data:", res.data)
      board.value = res.data || {}
    }
  } catch (err) {
    console.error('Board load failed:', err)
    error.value = 'Impossible de charger le moodboard. Veuillez réessayer.'
    board.value = {}
  } finally {
    loading.value = false
  }
}

onMounted(fetchBoard)
</script>

<style scoped>
.board-view {
  display: flex;
  justify-content: center;
}

.board-main {
  padding: 24px;
  max-width: 980px;
  width: 100%;
}

.board-header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--muted-border);
  margin-bottom: 12px;
}

.board-header h1 {
  margin: 0 0 6px;
}

/* Image container avec ratio 9:16 */
.board-image {
  margin: 24px auto;
  border-radius: 12px;
  overflow: hidden;
  background: #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  
  /* Ratio 9:16 */
  aspect-ratio: 9 / 16;
  max-width: 360px;
  width: 100%;
}

.board-image img {
  width: 100%;
  height: 100%;
  display: block;
}

.board-section {
  margin-top: 24px;
}

.board-section h4 {
  margin: 0 0 8px;
}

.empty-canvas {
  margin: 24px auto;
  text-align: center;
  padding: 40px 20px;
  background: #f9fafb;
  border-radius: 8px;
  
  /* Même ratio que l'image */
  aspect-ratio: 9 / 16;
  max-width: 360px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.board-actions {
  margin-top: 24px;
  padding: 18px 20px;
  border-radius: 14px;
  border: 1px solid var(--muted-border);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  background: #f9fafb;
}

.action-block h4 {
  margin: 0 0 4px;
}

.card-subtle {
  background: #fdfdfd;
}

/* Responsive */
@media (max-width: 768px) {
  .board-header h1 {
    font-size: 24px;
  }

  .board-main {
    padding: 16px;
  }

  .board-section {
    margin-top: 16px;
  }

  .board-image {
    max-width: 100%;
  }

  .empty-canvas {
    max-width: 100%;
  }
}
</style>
