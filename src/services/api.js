import axios from 'axios'
import { useFetch } from './useFetch.js'

export const API_URL = import.meta.env.VITE_API_URL || '/api'

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

const api = {
  // Boards
  boards: {
    list: () => axiosInstance.get('/boards'),
    get: (id) => axiosInstance.get(`/boards/${id}`),
    comments: (id) => axiosInstance.get(`/boards/${id}/comments`),
    like: (id) => axiosInstance.post(`/boards/${id}/like`),
    unlike: (id) => axiosInstance.post(`/boards/${id}/unlike`),
    createComment: (id, body) => axiosInstance.post(`/boards/${id}/comments`, body),
    deleteComment: (boardId, commentId) => axiosInstance.delete(`/boards/${boardId}/comments/${commentId}`),
  },

}

export default api