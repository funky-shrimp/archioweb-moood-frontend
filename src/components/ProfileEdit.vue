<template>
  <!--
    Petit formulaire d’édition du profil.
    Il permet de modifier le username et la bio, en appelant l’API puis en remontant
    le nouvel utilisateur au parent via l’événement `saved`.
  -->
  <div class="profile-edit">
    <h3>Edit profile</h3>
    <form @submit.prevent="onSubmit">
      <div>
        <label>Username</label>
        <!-- liaison bi‑directionnelle avec le state local `form.username` -->
        <input v-model="form.username" />
      </div>
      <div>
        <label>Bio</label>
        <textarea v-model="form.bio" />
      </div>
      <div style="margin-top:8px">
        <button type="submit">Save</button>
        <!-- bouton pour fermer le composant sans sauvegarder -->
        <button type="button" @click="$emit('close')">Cancel</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import api from '../services/api'

// Props : l’utilisateur courant dont on édite les infos
const props = defineProps({ user: { type: Object, required: true } })

// Événements :
//  - saved : renvoie l’utilisateur mis à jour
//  - close : demande au parent de masquer le formulaire
const emits = defineEmits(['saved', 'close'])

// State local initialisé à partir des props
const form = reactive({ username: props.user.username || '', bio: props.user.bio || '' })
const saving = ref(false)

// Soumission du formulaire d’édition
async function onSubmit() {
  saving.value = true
  try {
    // Appel API pour mettre à jour le profil connecté
    const res = await api.put('/users/me', { username: form.username, bio: form.bio })
    emits('saved', res.data)
  } catch (err) {
    // En mode dév/fixtures, on peut ignorer les erreurs pour l’instant
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-edit { border: 1px solid var(--muted-border); padding: 12px; margin-top: 12px }
form > div { margin-bottom: 8px }
</style>
