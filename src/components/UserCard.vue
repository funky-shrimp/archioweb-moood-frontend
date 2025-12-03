<template>
  <!--
    Petite carte utilisateur utilisée dans les résultats de recherche.
    Un clic redirige vers la page profil de l’utilisateur.
  -->
  <div @click="open" style="cursor:pointer;">
    <strong>{{ user.username }}</strong>
    <div v-if="user.bio">{{ user.bio }}</div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

// Props : objet utilisateur minimal (id, username, bio…)
const props = defineProps({ user: Object })
const router = useRouter()

function open() {
  if (!props.user || !props.user._id) return
  // On redirige vers la route de profil avec l’id dans les params
  router.push({ name: 'Profile', params: { id: props.user._id } })
}
</script>