<template>
  <div class="board-view">
    <main class="board-main">
      <h1>{{ board.title || 'Untitled board' }}</h1>
      <div class="small-muted">By: {{ board.owner?.username || 'unknown' }}</div>

      <section style="margin-top:18px">
        <h4>Labels</h4>
        <div v-if="board.labels?.length">
          <span class="tag" v-for="t in board.labels" :key="t">#{{ t }}</span>
        </div>
        <div v-else class="small-muted">No tags</div>
      </section>

      <section style="margin-top:18px">
        <h4>Elements</h4>
        <div class="elements-grid">
          <div v-for="el in board.elements||[]" :key="el._id" style="border-radius:8px; overflow:hidden; background:#f6f6f8">
            <img v-if="el.type==='image'" :src="el.src" style="width:100%; height:160px; object-fit:cover" />
            <div v-else style="padding:10px">{{ el.type }}: {{ el.src || el.text }}</div>
          </div>
        </div>
        <div v-if="!(board.elements && board.elements.length)" class="small-muted" style="margin-top:8px">No elements</div>
      </section>

      <section class="comments-box">
        <h4>Comments</h4>
        <CommentsList :boardId="board._id" :showTitle="false" />
        <CommentForm v-if="board._id" :boardId="board._id" @created="fetchBoard" />
      </section>
    </main>

    <aside class="board-side">
      <LikeButton :boardId="String(board._id)" :initialLiked="board.viewerHasLiked" :initialCount="board.likesCount||0" />
      <div style="margin-top:12px">
        <h4>Share</h4>
        <div class="small-muted">Link / Actions</div>
      </div>
    </aside>
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
.page { padding: 16px; }
</style>
