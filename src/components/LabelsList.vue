<template>
  <section>
    <h4>Labels</h4>
    <div v-if="!labels || labels.length===0">No tags</div>
    <div v-else>
      <span v-for="tag in labels" :key="tag" style="margin-right:6px;">#{{ tag }}</span>
    </div>
  </section>
</template>

<script setup>
const props = defineProps({ labels: { type: Array, default: () => [] } })
</script>