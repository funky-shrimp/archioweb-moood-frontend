<template>
  <!--
    Liste des commentaires pour un board donné.
    Elle va chercher les commentaires via l’API, les affiche, et permet de supprimer les siens.
  -->
  <section class="comments">
    <!-- Titre optionnel (peut être masqué via la prop showTitle) -->
    <h4 v-if="showTitle">Comments</h4>

    <!-- États de chargement / erreur -->
    <div v-if="loading">Loading comments...</div>
    <div v-if="error" class="error">{{ error }}</div>

    <!-- Liste des commentaires -->
    <ul v-else>
      <li v-for="c in comments" :key="c._id" class="comment-item">
        <div class="meta">
          <strong>{{ c.author?.username || 'anon' }}</strong>
          <small class="ts">{{ formatDate(c.createdAt) }}</small>
        </div>
        <div class="text">{{ c.text }}</div>
        <div class="c-actions">
          <!-- Le bouton Delete n’apparaît que pour l’auteur du commentaire -->
          <button v-if="isOwn(c)" @click="del(c._id)" class="btn-small">Delete</button>
        </div>
      </li>
    </ul>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'

// Props : id du board, et flag pour afficher/cacher le titre "Comments"
const props = defineProps({
  boardId: { type: String, required: true },
  showTitle: { type: Boolean, default: true }, // permet à BoardView de masquer le titre et gérer sa propre section
})

// Événement émis lorsqu’un commentaire est supprimé (pour le parent si besoin)
const emit = defineEmits(['deleted'])

// État local
const comments = ref([])
const loading = ref(false)
const error = ref(null)
const auth = useAuthStore()

// Charge les commentaires depuis l’API
async function fetchComments() {
  loading.value = true
  error.value = null
  try {
    const res = await api.get(`/boards/${props.boardId}/comments`)
    comments.value = Array.isArray(res.data) ? res.data : (res.data?.comments || [])
  } catch (err) {
    console.error(err)
    error.value = 'Impossible de charger les commentaires'
    comments.value = []
  } finally {
    loading.value = false
  }
}

// Vérifie si le commentaire appartient à l’utilisateur connecté
function isOwn(c) {
  return auth.user && c.author && c.author._id === auth.user._id
}

// Supprime un commentaire (avec confirmation) puis met à jour la liste locale
async function del(id) {
  if (!confirm('Supprimer ce commentaire ?')) return
  try {
    await api.delete(`/boards/${props.boardId}/comments/${id}`)
    comments.value = comments.value.filter(c => c._id !== id)
    emit('deleted', id)
  } catch (err) {
    console.error(err)
  }
}

// Formate la date de création pour l’affichage
function formatDate(s) {
  if (!s) return ''
  return new Date(s).toLocaleString()
}

// Charge les commentaires au montage du composant
onMounted(fetchComments)
</script>

<style scoped>
.comments { margin-top:16px }
.comment-item { padding:10px; border-radius:8px; background:#fafafa; margin-bottom:8px; border:1px solid #f0f0f0 }
.comment-item .meta { display:flex; gap:8px; align-items:center }
.comment-item .ts { color:#888; font-size:12px }
.comment-item .text { margin-top:6px }
.btn-small { padding:4px 8px; border-radius:6px; border:1px solid #ddd; background:#fff }
.error { color:#c00 }
</style>