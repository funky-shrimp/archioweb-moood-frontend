<template>
  <section class="comments">
    <h4 v-if="showTitle">Comments</h4>
    <div v-if="loading">Loading comments...</div>
    <div v-if="error" class="error">{{ error }}</div>
    <ul v-else>
      <li v-for="c in comments" :key="c._id" class="comment-item">
        <div class="meta">
          <strong>{{ c.author?.username || 'anon' }}</strong>
          <small class="ts">{{ formatDate(c.createdAt) }}</small>
        </div>
        <div class="text">{{ c.text }}</div>
        <div class="c-actions">
          <button v-if="isOwn(c)" @click="del(c._id)" class="btn-small">Delete</button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
const props = defineProps({
  boardId: { type: String, required: true },
  showTitle: { type: Boolean, default: true } // <-- added prop
})
const emit = defineEmits(['deleted'])
const comments = ref([])
const loading = ref(false)
const error = ref(null)
const auth = useAuthStore()

async function fetchComments() {
  loading.value = true; error.value = null
  try {
    const res = await api.get(`/boards/${props.boardId}/comments`)
    comments.value = Array.isArray(res.data) ? res.data : (res.data?.comments || [])
  } catch (err) {
    console.error(err); error.value = 'Impossible de charger les commentaires'
    comments.value = []
  } finally { loading.value = false }
}

function isOwn(c) {
  return auth.user && c.author && c.author._id === auth.user._id
}

async function del(id) {
  if (!confirm('Supprimer ce commentaire ?')) return
  try {
    await api.delete(`/boards/${props.boardId}/comments/${id}`)
    comments.value = comments.value.filter(c => c._id !== id)
    emit('deleted', id)
  } catch (err) {
    console.error(err)
  }
}

function formatDate(s) {
  if (!s) return ''
  return new Date(s).toLocaleString()
}

onMounted(fetchComments)
</script>

<style scoped>
.comments { margin-top:16px }
.comment-item { padding:10px; border-radius:8px; background:#fafafa; margin-bottom:8px; border:1px solid #f0f0f0 }
.comment-item .meta { display:flex; gap:8px; align-items:center }
.comment-item .ts { color:#888; font-size:12px }
.comment-item .text { margin-top:6px }
.btn-small { padding:4px 8px; border-radius:6px; border:1px solid #ddd; background:#fff }
.error { color:#c00 }
</style>