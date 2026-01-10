<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-box">
        <h2 class="auth-title">Login</h2>
        
        <form @submit.prevent="onSubmit" class="auth-form">
          <div class="form-group">
           <label for="username">Username</label>
            <input id="username" v-model="form.username" required />
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" v-model="form.password" type="password" required minlength="6" />
          </div>
          
          <div v-if="error" class="error-message">{{ error }}</div>
          
          <button type="submit" class="submit-btn">Login</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import api from '../services/api'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import {connectToNotifications} from '@/websocket/wsClient'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({ email: '', password: '' })
const error = ref('')

async function onSubmit() {
  error.value = ''
  if (!form.username || !form.password) {
    error.value = 'Please provide username and password.'
    return
  }

  try {
    const res = await api.auth.login({ username: form.username, password: form.password })
    console.log(res);
    const { token } = res.data
    auth.setAuth(token, form.username)

    // Connect to WebSocket for notifications
    connectToNotifications(token).then(() => {
      console.log('Connected to notifications WebSocket')
    }).catch((err) => {
      console.error('Failed to connect to notifications WebSocket:', err)
    })

    router.push({ path: (router.currentRoute.value.query.redirect) || '/explore' })
  } catch (err) {
    error.value = err.response?.data?.message || 'Login failed'
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f7;
  padding: 20px;
}

.auth-container {
  width: 100%;
  max-width: 440px;
}

.auth-box {
  background: #fff;
  border-radius: 12px;
  padding: 48px 40px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.auth-title {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 32px;
  text-align: center;
  color: #1d1d1f;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #1d1d1f;
}

.form-group input {
  padding: 12px 16px;
  border: 1px solid #d2d2d7;
  border-radius: 8px;
  font-size: 15px;
  background: #fafafa;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #0071e3;
  background: #fff;
}

.error-message {
  color: #d32f2f;
  font-size: 14px;
  padding: 10px;
  background: #ffebee;
  border-radius: 6px;
}

.submit-btn {
  background: #1d1d1f;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 8px;
}

.submit-btn:hover {
  background: #2d2d2f;
}

.submit-btn:active {
  transform: scale(0.98);
}
</style>
