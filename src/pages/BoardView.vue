<template>
  <div class="board-view page">
    <main class="board-main card">
      <header class="board-header">
        <div>
          <h1>{{ board.title || 'Untitled board' }}</h1>
          <div class="small-muted">
            By
            <strong>{{ board.owner?.username || 'unknown' }}</strong>
          </div>
        </div>
      </header>

      <BoardCanvas v-if="board.elements?.length" :elements="board.elements" />
      <div v-else class="empty-canvas small-muted">Aucun élément pour le moment.</div>

      <section class="board-actions card-subtle">
        <div class="action-block">
          <LikeButton
            :boardId="String(board._id)"
            :initialLiked="board.viewerHasLiked"
            :initialCount="board.likesCount || 0"
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
        <CommentsList :boardId="board._id" :showTitle="false" />
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
import BoardCanvas from '../components/BoardCanvas.vue'
import { useRoute } from 'vue-router'

const board = ref({})
const route = useRoute()
const id = route.params.id

async function fetchBoard() {
  try {
    const res = await api.get(`/boards/${id}`)
    board.value = res.data || {}
  } catch (err) {
    console.warn('Board load failed, fallback empty', err)
    board.value = {}
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

.board-section {
  margin-top: 24px;
}

.board-section h4 {
  margin: 0 0 8px;
}

.empty-canvas {
  margin: 24px 0;
  text-align: center;
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
</style>
