<template>
  <!--
    Footer global de l’application.
    Ici il est très simple : une ligne de copyright affichée en bas de toutes les pages.
  -->
  <footer class="app-footer">
    <div>© Moood - 2025</div>
  </footer>
</template>

<script setup>
// Pas de logique pour l’instant : pur composant de présentation.
</script>

<style scoped>
.app-footer {
  padding: 12px 16px;
  text-align: center;
  border-top: 1px solid var(--muted-border);
  background: var(--bg-footer);
}
</style>
