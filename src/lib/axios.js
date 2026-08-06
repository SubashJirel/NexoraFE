import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')
const REFRESH_URL = '/auth/token/refresh/'

const defaultHeaders = {
  'Content-Type': 'application/json',
}

if (import.meta.env.VITE_NGROK_SKIP_WARNING === 'true') {
  defaultHeaders['ngrok-skip-browser-warning'] = 'true'
}

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: defaultHeaders,
  timeout: 15000,
})

function getPersistedAuthState() {
  try {
    const raw = localStorage.getItem('nexora_auth')
    return raw ? JSON.parse(raw)?.state : null
  } catch {
    return null
  }
}

function redirectToLogin() {
  useAuthStore.getState().clearAuth()
  window.location.href = '/login'
}

let refreshPromise = null

async function refreshAccessToken() {
  if (!refreshPromise) {
    const refreshToken = useAuthStore.getState().refreshToken || getPersistedAuthState()?.refreshToken

    if (!refreshToken) {
      throw new Error('Missing refresh token')
    }

    refreshPromise = axios
      .post(`${BASE_URL}${REFRESH_URL}`, { refresh: refreshToken }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      })
      .then(({ data }) => {
        if (!data?.access) {
          throw new Error('Refresh response missing access token')
        }

        useAuthStore.getState().setTokens({
          access: data.access,
          refresh: data.refresh,
        })

        return data.access
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

// ── Request interceptor: attach JWT from zustand-persist store
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token || getPersistedAuthState()?.token
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor: refresh expired access token once ──
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const requestUrl = originalRequest.url || ''
      const isRefreshRequest = requestUrl.includes(REFRESH_URL)
      const isLoginRequest = requestUrl.includes('/auth/login/')

      if (isRefreshRequest || isLoginRequest) {
        redirectToLogin()
        return Promise.reject(error)
      }

      originalRequest._retry = true

      try {
        const newAccessToken = await refreshAccessToken()
        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return apiClient(originalRequest)
      } catch (refreshError) {
        redirectToLogin()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default apiClient
