<template>
  <div class="explore-page">
    <div class="hero card" style="padding:18px; max-width:980px; margin:18px auto;">
      <h1>Explore</h1>
      <p class="small-muted">Découvre les moodboards publics — clique pour entrer dans la board.</p>
    </div>

    <main style="max-width:980px; margin:0 auto 40px;">
      <section class="feed">
        <BoardCard v-for="b in boards" :key="b._id" :board="b" />
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import BoardCard from '../components/BoardCard.vue'
import { SAMPLE_BOARDS } from '../_dev/fixtures'

const boards = ref([])

async function fetchBoards() {
  try {
    const res = await api.get('/boards', { params: { public: true } })
    boards.value = Array.isArray(res.data) ? res.data : (res.data?.boards || SAMPLE_BOARDS)
  } catch (e) {
    boards.value = SAMPLE_BOARDS
  }
}

onMounted(fetchBoards)
</script>

<style scoped>
.feed { display:flex; flex-direction:column; gap:20px }
</style>
