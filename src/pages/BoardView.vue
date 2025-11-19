<template>
  <section class="page page-board">
    <h2>Board</h2>
    <p>Affichage du board: {{ id }}</p>
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
