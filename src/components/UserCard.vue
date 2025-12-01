<template>
  <div @click="open" style="cursor:pointer;">
    <strong>{{ user.username }}</strong>
    <div v-if="user.bio">{{ user.bio }}</div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const props = defineProps({ user: Object })
const router = useRouter()
function open() {
  if (!props.user || !props.user._id) return
  router.push({ name: 'Profile', params: { id: props.user._id } })
}
</script>