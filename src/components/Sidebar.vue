<template>
  <aside class="app-sidebar">
    <slot />
  </aside>
</template>

<script setup>
</script>

<style scoped>
.app-sidebar {
  width: 240px;
  padding: 12px;
  border-right: 1px solid var(--muted-border);
}
</style>
