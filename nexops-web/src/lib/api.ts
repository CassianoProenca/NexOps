import axios from 'axios'
import { useAppStore } from '@/store/appStore'

/**
 * Base URL: o application.yaml define context-path: /api e os controllers
 * mapeiam /api/v1/... → URL real: http://localhost:8080/api/api/v1/...
 *
 * Para evitar o double-prefix, usamos baseURL = VITE_API_URL (= http://localhost:8080/api)
 * e os services chamam /v1/... como path relativo.
 *
 * Se o backend for corrigido para context-path vazio, basta ajustar VITE_API_URL.
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// ── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────
// Injeta Authorization + X-Tenant-ID em toda requisição autenticada
api.interceptors.request.use((config) => {
  const { accessToken, tenant } = useAppStore.getState()
  if (accessToken) {
    config.headers['Authorization'] = `Bearer ${accessToken}`
  }
  if (tenant) {
    config.headers['X-Tenant-ID'] = tenant
  }
  return config
})

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────
// Em 401: tenta refresh automático; em falha redireciona para /login
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value: unknown) => void
  reject: (reason: unknown) => void
}> = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token),
  )
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as typeof error.config & { _retry?: boolean }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Enfileira requisiçes que chegaram enquanto o refresh está em andamento
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const { refreshToken, setTokens, clearAuth, user, tenant, permissions } =
        useAppStore.getState()

      try {
        const { data } = await axios.post(`${BASE_URL}/v1/auth/refresh`, {
          refreshToken,
        })
        const newAccess: string = data.accessToken
        setTokens(newAccess, data.refreshToken)

        // Garante que user/tenant/permissions continuam no store
        if (user && tenant) {
          useAppStore.getState().setAuth(user, tenant, newAccess, data.refreshToken, permissions)
        }

        processQueue(null, newAccess)
        originalRequest.headers['Authorization'] = `Bearer ${newAccess}`
        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        clearAuth()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
