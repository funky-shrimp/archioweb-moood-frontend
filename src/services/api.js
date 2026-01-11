import axios from "axios";
import { useAuth } from "@/stores/auth.js";

export const API_URL = import.meta.env.VITE_API_URL || "/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

const api = {
  // Boards
  boards: {
    list: () =>
      axiosInstance.get("/boards", {
        headers: {
          Authorization: `Bearer ${useAuth().$state.token}`,
        },
      }),
    create: (boardData) => axiosInstance.post('/boards', boardData, {
      headers: {
        'Authorization': `Bearer ${useAuth().$state.token}`
      }
    }),
    delete: (id) =>
      axiosInstance.delete(`/boards/${id}`, {
        headers: {
          Authorization: `Bearer ${useAuth().$state.token}`,
        },
      }),
    get: (id) =>
      axiosInstance.get(`/boards/${id}`, {
        headers: {
          Authorization: `Bearer ${useAuth().$state.token}`,
        },
      }),
    comments: (id) =>
      axiosInstance.get(`/boards/${id}/comments`, {
        headers: {
          Authorization: `Bearer ${useAuth().$state.token}`,
        },
      }),
    like: (id) =>
      axiosInstance.post(
        `/boardslike/${id}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${useAuth().$state.token}`,
          },
        }
      ),
    unlike: (id) =>
      axiosInstance.delete(`/boardslike/${id}`, {
        headers: {
          Authorization: `Bearer ${useAuth().$state.token}`,
        },
      }),
    createComment: (id, content) =>
      axiosInstance.post(`/boards/${id}/comments`, content, {
        headers: {
          Authorization: `Bearer ${useAuth().$state.token}`,
        },
      }),
    deleteComment: (commentId) =>
      axiosInstance.delete(`/comments/${commentId}`, {
        headers: {
          Authorization: `Bearer ${useAuth().$state.token}`,
        },
      }),
  },
  auth: {
    login: (credentials) => {
      console.log(credentials);

      const auth = btoa(`${credentials.username}:${credentials.password}`);
      console.log(auth);

      return axiosInstance.post(
        "/auth/login",
        {},
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
        }
      );
    },
    register: (body) => axiosInstance.post("/auth/register", body),
  },
  user: {
    getById: (id) =>
      axiosInstance.get(`/users/${id}`, {
        headers: {
          Authorization: `Bearer ${useAuth().$state.token}`,
        },
      }),
    getBoards: (userId) =>
      axiosInstance.get(`/boards?userId=${userId}`, {
        headers: {
          Authorization: `Bearer ${useAuth().$state.token}`,
        },
      }),
  },
};

export default api;
