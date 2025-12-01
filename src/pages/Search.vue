<template>
  <div>
    <h2>Search results for "{{ q }}"</h2>

    <div v-if="loading">Loading...</div>
    <div v-if="error">{{ error }}</div>

    <section>
      <h3>Boards</h3>
      <div v-if="boards.length === 0">No boards</div>
      <div v-for="b in boards" :key="b._id">
        <BoardCard :board="b" />
      </div>
    </section>

    <section>
      <h3>Users</h3>
      <div v-if="users.length === 0">No users</div>
      <div v-for="u in users" :key="u._id">
        <UserCard :user="u" />
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../services/api'
import BoardCard from '../components/BoardCard.vue'
import UserCard from '../components/UserCard.vue'

const route = useRoute()
const q = ref(route.query.q || '')
const boards = ref([])
const users = ref([])
const loading = ref(false)
const error = ref(null)

async function doSearch() {
  if (!q.value) {
    boards.value = []
    users.value = []
    return
  }
  loading.value = true
  error.value = null
  try {
    const [bRes, uRes] = await Promise.all([
      api.get('/boards', { params: { search: q.value, public: true } }),
      api.get('/users', { params: { search: q.value } })
    ])
    boards.value = bRes.data?.boards || bRes.data || []
    users.value = uRes.data?.users || uRes.data || []
  } catch (err) {
    console.error(err)
    error.value = 'Search failed'
  } finally {
    loading.value = false
  }
}

watch(() => route.query.q, (val) => { q.value = val || ''; doSearch() })
onMounted(doSearch)
</script>