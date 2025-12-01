<template>
  <div class="user-boards">
    <div class="boards-grid">
      <article v-for="b in boards" :key="b._id" class="mini-card" @click="open(b._id)">
        <div class="mini-thumb">
          <img :src="thumb(b)" alt="thumb" />
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const props = defineProps({ userId: { type: String, required: true } })
const boards = ref([])
const loading = ref(true)
const router = useRouter()

async function fetchBoards() {
  loading.value = true
  try {
    const res = await api.get(`/users/${props.userId}/boards`)
    const payload = res.data
    console.debug('user boards payload:', payload)

    if (!payload) {
      boards.value = []
    } else if (Array.isArray(payload)) {
      boards.value = payload
    } else if (Array.isArray(payload.boards)) {
      boards.value = payload.boards
    } else if (typeof payload === 'string') {
      try {
        const parsed = JSON.parse(payload)
        boards.value = Array.isArray(parsed) ? parsed : (parsed.boards || [])
      } catch {
        boards.value = []
      }
    } else {
      boards.value = []
    }
  } catch (err) {
    boards.value = []
  } finally {
    loading.value = false
  }
}

onMounted(fetchBoards)
watch(() => props.userId, fetchBoards)

function open(id) { router.push(`/board/${id}`) }
function thumb(b) { const el = (b.elements||[]).find(x=>x.type==='image'); return el?.src || '/placeholder-400x240.png' }
</script>

<style scoped>
.boards-grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap:18px }
.mini-card { border-radius:10px; overflow:hidden; border:1px solid #eee; background:#fff; height:220px; display:flex; align-items:center; justify-content:center; cursor:pointer }
.mini-thumb img { width:100%; height:100%; object-fit:cover; display:block }
.user-boards { margin-top: 16px }
</style>
