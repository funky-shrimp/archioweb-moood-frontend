<template>
  <section class="page page-profile">
    <h2>Profile</h2>

    <div v-if="loading">Loading...</div>

    <div v-else>
      <div>
        <strong>{{ profile.username }}</strong>
        <div>{{ profile.bio }}</div>
      </div>

      <div style="margin-top:12px">
        <template v-if="isOwn">
          <button @click="openEdit">Edit profile</button>
        </template>
        <template v-else>
          <FollowButton :userId="profile._id" :initialFollowing="profile.isFollowing" />
        </template>
      </div>

      <UserBoardsList :userId="profile._id" />
    </div>

    <ProfileEdit v-if="showEdit" :user="profile" @saved="onSaved" @close="showEdit=false" />
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import { useAuth } from '../stores/auth'
import UserBoardsList from '../components/UserBoardsList.vue'
import FollowButton from '../components/FollowButton.vue'
import ProfileEdit from '../components/ProfileEdit.vue'

const route = useRoute()
const auth = useAuth()

const paramId = route.params.id
const profile = ref(null)
const loading = ref(true)
const showEdit = ref(false)

const isOwn = computed(() => {
  if (!profile.value) return false
  return auth.user && profile.value._id === auth.user._id
})

async function fetchProfile(id) {
  loading.value = true
  try {
    const res = id ? await api.get(`/users/${id}`) : await api.get('/users/me')
    profile.value = res.data
  } catch (err) {
    profile.value = { username: 'Unknown', bio: '' }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProfile(paramId)
})

function openEdit() { showEdit.value = true }

function onSaved(updatedUser) {
  profile.value = { ...profile.value, ...updatedUser }
  // If we edited own profile, update auth store
  if (isOwn.value) {
    auth.user = profile.value
    localStorage.setItem('auth_user', JSON.stringify(profile.value))
  }
  showEdit.value = false
}
</script>

<style scoped>
.page { padding: 16px }
</style>
