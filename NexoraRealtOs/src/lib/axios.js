import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// ── Request interceptor: attach JWT from zustand-persist store
apiClient.interceptors.request.use(
  (config) => {
    // Zustand persist stores state under the key 'nexora_auth'
    try {
      const raw = localStorage.getItem('nexora_auth')
      const token = raw ? JSON.parse(raw)?.state?.token : null
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // ignore JSON parse errors
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: handle auth errors ─────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear persisted auth state and redirect
      localStorage.removeItem('nexora_auth')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default apiClient
