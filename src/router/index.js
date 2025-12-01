import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/explore' },
  { path: '/login', component: () => import('../pages/Login.vue') },
  { path: '/signup', component: () => import('../pages/Signup.vue') },
  { path: '/profile', component: () => import('../pages/Profile.vue'), meta: { requiresAuth: true } },
  { path: '/profile/:id', component: () => import('../pages/Profile.vue'), props: true, meta: { requiresAuth: true } },
  {
    path: '/board/:id',
    name: 'BoardView',
    component: () => import('../pages/BoardView.vue')
  },
  { path: '/board/:id/edit', component: () => import('../pages/BoardEdit.vue'), props: true, meta: { requiresAuth: true } },
  { path: '/explore', component: () => import('../pages/Explore.vue'), meta: { requiresAuth: true } },
  // Ajoute la route /search (assure-toi d'avoir import ou lazy-load)
  {
    path: '/search',
    name: 'Search',
    component: () => import('../pages/Search.vue'),
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Simple navigation guard using token stored in localStorage
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')
  const requiresAuth = to.meta && to.meta.requiresAuth

  if (requiresAuth && !token) {
    // redirect unauthenticated users to signup (project requirement: must create account first)
    return next({ path: '/signup', query: { redirect: to.fullPath } })
  }

  // prevent logged-in user from visiting auth pages
  if ((to.path === '/login' || to.path === '/signup') && token) {
    return next({ path: '/explore' })
  }

  return next()
})

export default router
