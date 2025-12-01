<template>
  <section class="page page-login">
    <h2>Login</h2>
    <form @submit.prevent="onSubmit">
      <div>
        <label for="email">Email</label>
        <input id="email" v-model="form.email" type="email" required />
      </div>
      <div>
        <label for="password">Password</label>
        <input id="password" v-model="form.password" type="password" required minlength="6" />
      </div>
      <div v-if="error" style="color:var(--primary);">{{ error }}</div>
      <button type="submit">Login</button>
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

const form = reactive({ email: '', password: '' })
const error = ref('')

async function onSubmit() {
  error.value = ''
  if (!form.email || !form.password) {
    error.value = 'Please provide email and password.'
    return
  }

  try {
    const res = await api.post('/auth/login', { email: form.email, password: form.password })
    const { token, user } = res.data
    auth.setToken(token, user)
    router.push({ path: (router.currentRoute.value.query.redirect) || '/explore' })
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
  }
}
</script>

<style scoped>
.page { padding: 16px; }
form > div { margin-bottom: 8px }
button { padding: 8px 12px }
</style>
