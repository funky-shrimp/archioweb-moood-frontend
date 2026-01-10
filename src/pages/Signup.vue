<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-box">
        <h2 class="auth-title">Signup</h2>

        <form @submit.prevent="onSubmit" class="auth-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input id="username" v-model="form.username" required />
          </div>

          <div class="form-group">
            <label for="email">e-mail address</label>
            <input id="email" v-model="form.email" type="email" required />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input id="password" v-model="form.password" type="password" required minlength="8" />
          </div>

          <div class="form-group">
            <label for="avatar">Profil Picture</label>
            <div class="avatar-upload">
              <input id="avatar" type="file" accept="image/*" @change="onAvatarChange" style="display:none"
                ref="fileInput" />
              <button type="button" class="file-btn" @click="$refs.fileInput.click()">add a file</button>
              <div class="avatar-preview">
                <img v-if="avatarPreview" :src="avatarPreview" alt="avatar" />
                <div v-else class="avatar-placeholder">👤</div>
              </div>
            </div>
          </div>

          <div v-if="error" class="error-message">{{ error }}</div>

          <button type="submit" class="submit-btn">Signup</button>
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

const router = useRouter()
const auth = useAuthStore()

const form = reactive({ username: '', email: '', password: '', avatar: null })
const error = ref('')
const avatarPreview = ref('')
const fileInput = ref(null)

function onAvatarChange(e) {
  const file = e.target.files?.[0]
  if (file) {
    form.avatar = file
    const reader = new FileReader()
    reader.onload = (ev) => { avatarPreview.value = ev.target.result }
    reader.readAsDataURL(file)
  }
}

async function onSubmit() {
  error.value = ''
  if (!form.email || !form.password || !form.username) {
    error.value = 'Please complete all fields.'
    return
  }

  try {
    console.log(form.email + " " + form.password + " " + form.username)
    const res = await api.auth.register({ "username": form.username, "email": form.email, "password": form.password })
    router.push('/login')
  } catch (err) {
    error.value = err.response?.data?.message || 'Signup failed'
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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"] {
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

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.file-btn {
  padding: 8px 16px;
  border: 1px solid #d2d2d7;
  border-radius: 6px;
  background: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.file-btn:hover {
  background: #fafafa;
  border-color: #a1a1a6;
}

.avatar-preview {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  overflow: hidden;
  background: #e5e5e7;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #d2d2d7;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 28px;
  color: #86868b;
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
