<template>
  <section class="page page-profile">
    <h2>Profile</h2>
    <p>Profil utilisateur: {{ id }}</p>
  </section>
</template>

<script setup>
import { toRef } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const id = toRef(route.params, 'id')
</script>

<style scoped>
.page { padding: 16px; }
</style>
