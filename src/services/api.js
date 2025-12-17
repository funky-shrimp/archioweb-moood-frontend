import axios from 'axios'
import { SAMPLE_BOARDS, SAMPLE_USERS } from '../_dev/fixtures'

const USE_FIXTURES = import.meta.env.VITE_USE_FIXTURES === 'true' || import.meta.env.DEV
export const API_URL = import.meta.env.VITE_API_URL || '/api'

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
})

function delay(res, ms = 120) { return new Promise(r => setTimeout(() => r(res), ms)) }

const api = {
  get: (url, opts) => {
    if (USE_FIXTURES) {
      // /boards list
      if (url === '/boards' || url.startsWith('/boards?')) return delay({ data: SAMPLE_BOARDS })
      // /boards/:id
      let m = url.match(/^\/boards\/([^/]+)$/)
      if (m) {
        const b = SAMPLE_BOARDS.find(x => x._id === m[1]) || null
        return delay({ data: b })
      }
      // /boards/:id/comments
      if (/^\/boards\/[^/]+\/comments$/.test(url)) {
        return delay({ data: [{ _id: 'c1', text: 'Nice board!', author: SAMPLE_USERS[0], createdAt: new Date() }] })
      }
      // /users list
      if (url === '/users' || url.startsWith('/users?')) return delay({ data: SAMPLE_USERS })
      // /users/:id
      m = url.match(/^\/users\/([^/]+)$/)
      if (m) {
        const u = SAMPLE_USERS.find(x => x._id === m[1]) || null
        return delay({ data: u })
      }
      // /users/:id/boards
      if (/^\/users\/[^/]+\/boards$/.test(url)) return delay({ data: SAMPLE_BOARDS })
    }
    return axiosInstance.get(url, opts)
  },

  post: (url, body) => {
    if (USE_FIXTURES) {
      if (/\/boards\/[^/]+\/comments$/.test(url)) {
        const comment = { _id: 'c_' + Math.random().toString(36).slice(2,8), text: body?.text || '', author: { _id: 'dev', username: 'dev' }, createdAt: new Date() }
        return delay({ data: comment })
      }
      if (/\/boards\/[^/]+\/like$/.test(url) || /\/boards\/[^/]+\/unlike$/.test(url)) return delay({ data: { ok: true } })
      if (/\/users\/[^/]+\/follow$/.test(url) || /\/users\/[^/]+\/unfollow$/.test(url)) return delay({ data: { ok: true } })
      // auth
      if (url.endsWith('/auth/login') || url.endsWith('/auth/register')) {
        return delay({ data: { token: 'dev-token', user: { _id: 'dev', username: body?.username || 'dev' } } })
      }
    }
    return axiosInstance.post(url, body)
  },

  delete: (url) => {
    if (USE_FIXTURES) {
      if (/\/boards\/[^/]+\/comments\/[^/]+$/.test(url)) return delay({ data: { ok: true } })
    }
    return axiosInstance.delete(url)
  }
}

export default api
