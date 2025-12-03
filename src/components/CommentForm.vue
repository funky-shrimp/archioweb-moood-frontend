<template>
  <!--
    Formulaire pour ajouter un commentaire à un board.
    Il gère la saisie, l’appel API, l’état de chargement et remonte le commentaire créé au parent.
  -->
  <form class="comment-form" @submit.prevent="submit">
    <!-- zone de texte du commentaire -->
    <textarea v-model="text" placeholder="Write a comment..." rows="3" />
    <div class="actions">
      <!-- bouton désactivé si on charge ou si le texte est vide -->
      <button type="submit" :disabled="loading || !text.trim()">Add comment</button>
    </div>
    <!-- message d’erreur simple si l’API échoue -->
    <div v-if="error" class="error">{{ error }}</div>
  </form>
</template>

<script setup>
import { ref } from 'vue'
import api from '../services/api'

// Props : l’identifiant du board sur lequel on commente
const props = defineProps({ boardId: { type: String, required: true } })

// Événement émis quand un commentaire est créé avec succès
const emit = defineEmits(['created'])

// État local du formulaire
const text = ref('')
const loading = ref(false)
const error = ref(null)

// Soumission du formulaire
async function submit() {
  const body = text.value.trim()
  if (!body) return // on ne soumet pas les commentaires vides
  loading.value = true
  error.value = null
  try {
    // appel API pour créer un commentaire sur le board
    const res = await api.post(`/boards/${props.boardId}/comments`, { text: body })
    emit('created', res.data) // le parent peut mettre à jour sa liste
    text.value = '' // on vide le champ
  } catch (err) {
    console.error(err)
    error.value = "Impossible d'ajouter le commentaire"
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.comment-form { border-top:1px solid #eee; padding-top:12px }
.comment-form textarea { width:100%; padding:8px; border-radius:6px; border:1px solid #ddd; resize:vertical }
.comment-form .actions { margin-top:8px }
.comment-form button { padding:6px 12px; border-radius:8px; background:#111; color:#fff; border:none }
.comment-form .error { color:#c00; margin-top:8px }
</style>