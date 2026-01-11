<template>
  <section class="page page-profile">
    <div class="profile-shell card">
      <div v-if="loading" class="profile-loading">Loading...</div>

      <template v-else-if="user">
        <header class="profile-header">
          <div class="avatar-wrap">
            <div class="avatar-circle">
              <!-- Avatar fixture -->
              <span class="avatar-initial">
                {{ (user.username || "U").charAt(0).toUpperCase() }}
              </span>
            </div>
          </div>

          <div class="profile-main">
            <div class="name-row">
              <h1 class="username">{{ user.username }}</h1>
              <button
                v-if="isOwnProfile"
                class="edit-btn"
                type="button"
                @click="openEdit"
              >
                Edit account
              </button>
              <FollowButton
                v-else
                :userId="user._id"
                :initialFollowing="user.isFollowing"
              />
            </div>
            <p class="bio" v-if="user.bio">
              {{ user.bio }}
            </p>
          </div>

          <div class="profile-stats">
            <div class="stat">
              <div class="stat-number">0</div>
              <div class="stat-label">Followers</div>
            </div>
            <div class="stat">
              <div class="stat-number">0</div>
              <div class="stat-label">Following</div>
            </div>
          </div>
        </header>

        <section class="boards-section">
          <div class="boards-header">
            <h2>Boards</h2>
          </div>
          <UserBoardsList v-if="user && user._id" :userId="user._id" />
        </section>
      </template>

      <div v-else class="small-muted">
        Impossible de charger le profil (mode dév / fixtures).
      </div>
    </div>

    <ProfileEdit
      v-if="showEdit && user"
      :user="user"
      @saved="onSaved"
      @close="showEdit = false"
    />
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute } from "vue-router";
import api from "../services/api";
import { useAuth } from "../stores/auth";
import UserBoardsList from "../components/UserBoardsList.vue";
import FollowButton from "../components/FollowButton.vue";
import ProfileEdit from "../components/ProfileEdit.vue";
import { SAMPLE_USERS } from "../_dev/fixtures";
import { watch } from "vue";

const route = useRoute();
const auth = useAuth();

const user = ref(null);
const loading = ref(true);
const error = ref(null);
const showEdit = ref(false);

// ID utilisateur depuis l'URL
const userId = computed(() => route.params.id);

// Est-ce le profil de l'utilisateur connecté ?
const isOwnProfile = computed(() =>
  auth.isAuthenticated && auth.user?._id === userId.value
);

function fallbackProfile(id) {
  if (id) {
    const found = SAMPLE_USERS.find((u) => u._id === id);
    if (found) return found;
  }
  if (auth.user) {
    return {
      _id: auth.user._id,
      username: auth.user.username,
      bio: "Fixture profile (dev)",
    };
  }
  return SAMPLE_USERS[0] || { _id: "fixture", username: "Unknown", bio: "" };
}

async function fetchUser() {
  loading.value = true;
  error.value = null;

  try {
    console.log("Fetching user profile for ID:", auth.userId);

    const res = await api.user.getById(auth.userId);
    user.value = res.data;

    console.log("User profile loaded:", auth.user);
  } catch (e) {
    console.error("Failed to fetch user:", e);
    error.value = "Impossible de charger le profil utilisateur";
    user.value = null;
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  if (userId.value) {
    fetchUser();
  } else {
    error.value = "ID utilisateur manquant";
    loading.value = false;
  }
});

watch(
  () => route.params.id,
  (newId) => {
    fetchUser();
  }
);

function openEdit() {
  showEdit.value = true;
}

function onSaved(updatedUser) {
  user.value = { ...user.value, ...updatedUser };
  // If we edited own profile, update auth store
  if (isOwnProfile.value) {
    auth.user = user.value;
    localStorage.setItem("auth_user", JSON.stringify(user.value));
  }
  showEdit.value = false;
}
</script>

<style scoped>
.page {
  padding: 24px 16px;
  display: flex;
  justify-content: center;
}

.profile-shell {
  width: 100%;
  max-width: 980px;
  padding: 24px 24px 28px;
}

.profile-loading {
  padding: 32px 0;
}

.profile-header {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 24px;
  border-bottom: 1px solid var(--muted-border);
  padding-bottom: 20px;
  margin-bottom: 16px;
}

.avatar-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-circle {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: linear-gradient(145deg, #f97316, #facc15);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.25);
}

.avatar-initial {
  font-size: 32px;
  color: #fff;
  font-weight: 700;
}

.profile-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.username {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
}

.bio {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.edit-btn {
  padding: 6px 14px;
  background: transparent;
  color: #1d1d1f;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.profile-stats {
  display: flex;
  gap: 24px;
  font-size: 13px;
}

.stat-number {
  font-weight: 600;
  font-size: 16px;
}

.stat-label {
  color: #9ca3af;
}

.boards-section {
  margin-top: 20px;
}

.boards-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.boards-header h2 {
  margin: 0;
  font-size: 16px;
}

@media (max-width: 768px) {
  .profile-shell {
    padding: 16px;
  }

  .profile-header {
    grid-template-columns: auto minmax(0, 1fr);
    grid-template-rows: auto auto;
    row-gap: 12px;
  }

  .profile-stats {
    grid-column: 1 / -1;
  }
}
</style>
