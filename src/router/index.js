import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/explore' },
  { path: '/login', component: () => import('../pages/Login.vue') },
  { path: '/signup', component: () => import('../pages/Signup.vue') },
  { path: '/profile/:id', component: () => import('../pages/Profile.vue'), props: true },
  { path: '/board/:id', component: () => import('../pages/BoardView.vue'), props: true },
  { path: '/board/:id/edit', component: () => import('../pages/BoardEdit.vue'), props: true },
  { path: '/explore', component: () => import('../pages/Explore.vue') },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
