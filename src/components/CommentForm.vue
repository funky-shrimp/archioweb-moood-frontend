<template>
  <form class="comment-form" @submit.prevent="submit">
    <textarea v-model="text" placeholder="Write a comment..." rows="3" />
    <div class="actions">
      <button type="submit" :disabled="loading || !text.trim()">Add comment</button>
    </div>
    <div v-if="error" class="error">{{ error }}</div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'
const props = defineProps({ boardId: { type: String, required: true } })
const emit = defineEmits(['created'])
const text = ref('')
const loading = ref(false)
const error = ref(null)

async function submit() {
  const body = text.value.trim()
  if (!body) return
  loading.value = true; error.value = null
  try {
    const res = await api.post(`/boards/${props.boardId}/comments`, { text: body })
    emit('created', res.data)
    text.value = ''
  } catch (err) {
    console.error(err); error.value = 'Impossible d\'ajouter le commentaire'
  } finally { loading.value = false }
}
</script>

<style scoped>
.comment-form { border-top:1px solid #eee; padding-top:12px }
.comment-form textarea { width:100%; padding:8px; border-radius:6px; border:1px solid #ddd; resize:vertical }
.comment-form .actions { margin-top:8px }
.comment-form button { padding:6px 12px; border-radius:8px; background:#111; color:#fff; border:none }
.comment-form .error { color:#c00; margin-top:8px }
</style>