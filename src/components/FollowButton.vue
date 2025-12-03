<template>
  <!--
    Bouton “Follow / Following” pour un utilisateur.
    Pour l’instant il fonctionne uniquement en front (pas d’appel API), avec une petite animation.
  -->
  <button :class="['follow-btn', { following: isFollowing, anim: anim }]" @click="toggle">
    <span v-if="isFollowing">Following</span>
    <span v-else>Follow</span>
  </button>
</template>

<script setup>
import { ref, watch } from 'vue'

// Props :
//  - userId : identifiant de l’utilisateur à suivre (pour le backend plus tard)
//  - initialFollowing : état de follow initial
const props = defineProps({
  userId: { type: String, required: true },
  initialFollowing: { type: Boolean, default: false },
})

// Événement émis quand l’état change (permet au parent de synchroniser ses données)
const emit = defineEmits(['toggled'])

// État local : suivi ou non + flag pour déclencher l’animation CSS
const isFollowing = ref(!!props.initialFollowing)
const anim = ref(false)

function toggle() {
  // Toggle optimiste côté front uniquement + animation
  isFollowing.value = !isFollowing.value
  anim.value = true
  setTimeout(() => (anim.value = false), 500)
  emit('toggled', isFollowing.value)
  // Pas d’appel backend pour l’instant (mode fixtures). À brancher sur une API plus tard.
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
