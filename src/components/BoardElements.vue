<template>
  <section>
    <h4>Elements</h4>
    <div v-if="!board?.elements || board.elements.length===0">No elements</div>
    <div v-for="el in board.elements" :key="el._id" style="margin-bottom:8px;">
      <template v-if="el.type==='image'">
        <img :src="el.src" :alt="el.alt||'image'" style="max-width:200px; display:block;" />
      </template>
      <template v-else-if="el.type==='text'">
        <div>{{ el.text }}</div>
      </template>
      <template v-else-if="el.type==='video'">
        <div>Video: {{ el.src }}</div>
      </template>
      <template v-else-if="el.type==='audio'">
        <div>Audio: {{ el.src }}</div>
      </template>
      <template v-else>
        <div>Unknown element type</div>
      </template>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({ board: Object })
</script>