<template>
  <button :class="['follow-btn', { following: isFollowing, anim: anim }]" @click="toggle">
    <span v-if="isFollowing">Following</span>
    <span v-else>Follow</span>
  </button>
</template>

<script setup>
import { ref, watch } from 'vue'
const props = defineProps({
  userId: { type: String, required: true },
  initialFollowing: { type: Boolean, default: false }
})
const emit = defineEmits(['toggled'])
const isFollowing = ref(!!props.initialFollowing)
const anim = ref(false)

function toggle() {
  // front-only optimistic toggle + animation
  isFollowing.value = !isFollowing.value
  anim.value = true
  setTimeout(() => (anim.value = false), 500)
  emit('toggled', isFollowing.value)
  // do not call backend in fixture-only dev; if real backend available, replace with API call
}
</script>

<style scoped>
.follow-btn { border:1px solid #ddd; padding:6px 10px; border-radius:18px; background:#fff; cursor:pointer; font-weight:600; transition:transform 180ms ease }
.follow-btn.following { background:#fff; border-color:#bbb }
.follow-btn.anim { animation: pulse 420ms ease }
@keyframes pulse {
  0% { transform: scale(1) }
  40% { transform: scale(1.12) }
  100% { transform: scale(1) }
}
</style>
