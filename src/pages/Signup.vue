<template>
  <section class="page page-signup">
    <h2>Signup</h2>
    <form @submit.prevent="onSubmit">
      <div>
        <label for="username">Username</label>
        <input id="username" v-model="form.username" required />
      </div>
      <div>
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" required />
      </div>
      <div>
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" required minlength="6" />
      </div>
      <div v-if="error" style="color:var(--primary);">{{ error }}</div>
      <button type="submit">Signup</button>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue'
import api from '../services/api'
import { useAuth } from '../stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuth()

const form = reactive({ username: '', email: '', password: '' })
const error = ref('')

async function onSubmit() {
  error.value = ''
  if (!form.email || !form.password || !form.username) {
    error.value = 'Please complete all fields.'
    return
  }

  try {
    const res = await api.post('/auth/register', { username: form.username, email: form.email, password: form.password })
    const { token, user } = res.data
    auth.setToken(token, user)
    router.push('/explore')
  } catch (err) {
    error.value = err.response?.data?.message || 'Signup failed'
  }
}
</script>

<style scoped>
.page { padding: 16px; }
form > div { margin-bottom: 8px }
button { padding: 8px 12px }
</style>
