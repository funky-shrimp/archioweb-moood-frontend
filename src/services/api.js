import axios from 'axios'
import { useAuth } from '@/stores/auth.js'

export const API_URL = import.meta.env.VITE_API_URL || '/api'

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

const api = {
  // Boards
  boards: {
    list: (token) => axiosInstance.get('/boards', {
      headers: {
        'Authorization': `Bearer ${useAuth().$state.token}`
      }
    }),
    get: (id) => axiosInstance.get(`/boards/${id}`, {
      headers: {
        'Authorization': `Bearer ${useAuth().$state.token}`
      }
    }),
    comments: (id) => axiosInstance.get(`/boards/${id}/comments`, {
      headers: {
        'Authorization': `Bearer ${useAuth().$state.token}`
      }
    }),
    like: (id) => axiosInstance.post(`/boards/${id}/like`, {
      headers: {
        'Authorization': `Bearer ${useAuth().$state.token}`
      }
    }),
    unlike: (id) => axiosInstance.post(`/boards/${id}/unlike`, {
      headers: {
        'Authorization': `Bearer ${useAuth().$state.token}`
      }
    }),
    createComment: (id, body) => axiosInstance.post(`/boards/${id}/comments`, {
      headers: {
        'Authorization': `Bearer ${useAuth().$state.token}`
      }
    }, body),
    deleteComment: (boardId, commentId) => axiosInstance.delete(`/boards/${boardId}/comments/${commentId}`, {
      headers: {
        'Authorization': `Bearer ${useAuth().$state.token}`
      }
    }),
  },
  auth: {
    login: (credentials) => {
      console.log(credentials);

      const auth = btoa(`${credentials.username}:${credentials.password}`)
      console.log(auth);

      return axiosInstance.post('/auth/login', {}, {
        headers: {
          'Authorization': `Basic ${auth}`
        }
      })
    },
    register: (body) => axiosInstance.post('/auth/register', body),
  },
  user:{
    
  }
}

export default api