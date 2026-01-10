<template>
  <!--
    Petit formulaire d’édition du profil.
    Il permet de modifier le username et la bio, en appelant l’API puis en remontant
    le nouvel utilisateur au parent via l’événement `saved`.
  -->
  <div class="profile-edit-overlay" @click="$emit('close')">
    <div class="profile-edit-modal" @click.stop>
      <div class="modal-header">
        <h3>Edit profile</h3>
        <button class="close-btn" type="button" @click="$emit('close')">✕</button>
      </div>

      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label>Username</label>
          <input v-model="form.username" type="text" required />
        </div>
        <div class="form-group">
          <label>Bio</label>
          <textarea v-model="form.bio" rows="4"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="$emit('close')">Cancel</button>
          <button type="submit" class="btn-save" :disabled="saving">
            {{ saving ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </form>
    </div>
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
.profile-edit-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}

.profile-edit-modal {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #e5e5e5;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #1d1d1f;
  padding: 4px;
  transition: color 0.2s ease;
}

.close-btn:hover {
  color: #6b7280;
}

form {
  padding: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  font-size: 14px;
  color: #1d1d1f;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #9ca3af;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn-cancel,
.btn-save {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-cancel {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #1d1d1f;
}

.btn-cancel:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.btn-save {
  background: #1d1d1f;
  border: none;
  color: #ffffff;
}

.btn-save:hover:not(:disabled) {
  background: #111827;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
