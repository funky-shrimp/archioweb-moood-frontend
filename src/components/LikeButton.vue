<template>
  <button class="like-btn" :class="{ liked }" @click="toggle" :disabled="loading" aria-pressed="liked">
    <svg v-if="liked" class="heart" viewBox="0 0 24 24" width="18" height="18"><path fill="currentColor" d="M12 21s-7-4.35-9-7.1C1.5 11.9 3 7.9 6 6.5 8 5.5 10 6 12 8c2-2 4-2.5 6-1.5 3 1.4 4.5 5.4 3 7.4-2 2.75-9 7.1-9 7.1z"/></svg>
    <svg v-else class="heart" viewBox="0 0 24 24" width="18" height="18"><path fill="none" stroke="currentColor" stroke-width="1.5" d="M12 21s-7-4.35-9-7.1C1.5 11.9 3 7.9 6 6.5 8 5.5 10 6 12 8c2-2 4-2.5 6-1.5 3 1.4 4.5 5.4 3 7.4-2 2.75-9 7.1-9 7.1z"/></svg>
    <span class="count">{{ count }}</span>
  </button>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
const props = defineProps({
  boardId: { type: String, required: true },
  initialLiked: { type: Boolean, default: false },
  initialCount: { type: Number, default: 0 }
})
const emit = defineEmits(['toggled'])
const auth = useAuthStore()
const liked = ref(!!props.initialLiked)
const count = ref(props.initialCount || 0)
const loading = ref(false)

async function toggle() {
  if (!auth.token) {
    // redirect to signup/login UX handled by router outside
    return
  }
  loading.value = true
  try {
    if (liked.value) {
      await api.post(`/boards/${props.boardId}/unlike`)
      liked.value = false
      count.value = Math.max(0, count.value - 1)
    } else {
      await api.post(`/boards/${props.boardId}/like`)
      liked.value = true
      count.value = count.value + 1
    }
    emit('toggled', { liked: liked.value, count: count.value })
  } catch (err) {
    console.error('Like toggle failed', err)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // conserve initial props
})
</script>

<style scoped>
.like-btn {
  display:inline-flex; align-items:center; gap:8px;
  padding:6px 10px; border-radius:20px; border:1px solid #ddd; background:#fff;
  cursor:pointer; font-size:14px;
}
.like-btn .heart { color:#444 }
.like-btn.liked { background: #ffeef0; border-color:#ffb3c6; color:#d81b60 }
.like-btn .count { font-weight:600 }
.like-btn:disabled { opacity:0.6; cursor:not-allowed }
</style>