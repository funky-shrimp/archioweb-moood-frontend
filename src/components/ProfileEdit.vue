<template>
  <div class="profile-edit">
    <h3>Edit profile</h3>
    <form @submit.prevent="onSubmit">
      <div>
        <label>Username</label>
        <input v-model="form.username" />
      </div>
      <div>
        <label>Bio</label>
        <textarea v-model="form.bio" />
      </div>
      <div style="margin-top:8px">
        <button type="submit">Save</button>
        <button type="button" @click="$emit('close')">Cancel</button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import api from '../services/api'

const props = defineProps({ user: { type: Object, required: true } })
const emits = defineEmits(['saved','close'])

const form = reactive({ username: props.user.username || '', bio: props.user.bio || '' })
const saving = ref(false)

async function onSubmit() {
  saving.value = true
  try {
    const res = await api.put('/users/me', { username: form.username, bio: form.bio })
    emits('saved', res.data)
  } catch (err) {
    // ignore for now
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.profile-edit { border: 1px solid var(--muted-border); padding: 12px; margin-top: 12px }
form > div { margin-bottom: 8px }
</style>
