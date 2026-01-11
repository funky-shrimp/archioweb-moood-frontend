<template>
  <div class="user-boards">
    <div class="boards-grid">
      <article class="mini-card mini-card-add" @click="createBoard">
        <div class="mini-thumb">
          <span class="plus">+</span>
        </div>
        <div class="meta">
          <div class="title">New board</div>
        </div>
      </article>

      <article
        v-for="b in boards"
        :key="b._id"
        class="mini-card"
      >
        <button 
          v-if="canDelete" 
          class="delete-btn" 
          @click.stop="deleteBoard(b._id)"
          title="Delete board"
        >
          ✕
        </button>
        <div class="mini-thumb" @click="open(b._id)">
          <img :src="thumb(b)" alt="thumb" />
        </div>
        <div class="meta">
          <div class="title" @click="open(b._id)">{{ b.title || 'Untitled board' }}</div>
          <div class="subtitle small-muted">
            {{ (b.labels || []).slice(0, 2).map(t => `#${t}`).join(', ') }}
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { useAuth } from '../stores/auth'

const props = defineProps({ userId: { type: String, required: true } })
const boards = ref([])
const loading = ref(true)
const router = useRouter()
const auth = useAuth()

// Vérifie si l'utilisateur connecté peut supprimer les boards (propriétaire)
const canDelete = computed(() => {
  return auth.user && auth.user._id === props.userId
})

async function fetchBoards() {
  loading.value = true
  try {
    const res = await api.user.getBoards(props.userId)
    const payload = res.data
    console.debug('user boards payload:', payload)

    if (!payload) {
      boards.value = []
    } else if (Array.isArray(payload)) {
      boards.value = payload
    } else if (Array.isArray(payload.items)) {
      boards.value = payload.items
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
function createBoard() { router.push({ name: 'BoardCreate' }) }
function thumb(b) { const el = (b.elements||[]).find(x=>x.type==='image'); return el?.src || '/placeholder-400x240.png' }

async function deleteBoard(boardId) {
  if (!confirm('Are you sure you want to delete this board?')) return
  
  try {
    // Appel API (fixture pour le moment)
    await api.delete(`/boards/${boardId}`)
    
    // Retire le board de la liste locale
    boards.value = boards.value.filter(b => b._id !== boardId)
  } catch (err) {
    console.error('Failed to delete board:', err)
    alert('Failed to delete board. Please try again.')
  }
}
</script>

<style scoped>
.user-boards {
  margin-top: 12px;
}

.boards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.mini-card {
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid #eee;
  background: #f5f5f7;
  height: 180px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  position: relative;
}

.mini-card-add {
  background: #f3f4f6;
  border-style: dashed;
  border-color: #d1d5db;
  align-items: center;
  justify-content: center;
}

.mini-thumb {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.mini-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.plus {
  font-size: 28px;
  color: #6b7280;
}

.meta {
  padding: 8px 10px 10px;
}

.title {
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.subtitle {
  margin-top: 2px;
  font-size: 12px;
}

.delete-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  color: #ef4444;
  font-weight: 600;
  z-index: 10;
  transition: all 0.2s ease;
}

.delete-btn:hover {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
  transform: scale(1.1);
}
</style>
