<template>
  <section class="page page-board-edit">
    <h2>Edit Board</h2>
    <p>Édition du board: {{ id }}</p>
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
