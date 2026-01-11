import { defineStore } from 'pinia'
import { decodeJWT } from '@/services/tokenHelpers'

export const useAuthStore = defineStore('auth', {
  state: () => {
    const token = localStorage.getItem('auth_token') || null
    const user = (() => {
      try { return JSON.parse(localStorage.getItem('auth_user')) || null } catch { return null }
    })()

    //add Id from token to user
    const userId = decodeJWT(token)?.sub || null

    console.debug('[auth] init token,user:', token, user) // <-- debug
    return { token, user, userId }
  },
  actions: {
    setAuth(token, user) {
      console.log(token, user);

      this.token = token
      if (user) this.user = user
      localStorage.setItem('auth_token', token)
      if (user) localStorage.setItem('auth_user', JSON.stringify(user))
    },
    clearAuth() {
      this.token = null
      this.user = null
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  },
})


export const useAuth = () => useAuthStore()
export default useAuthStore
