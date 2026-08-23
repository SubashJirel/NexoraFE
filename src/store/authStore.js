import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { queryClient } from '@/lib/queryClient'

/**
 * Auth store — persisted to localStorage.
 *
 * user shape (normalised from API):
 * {
 *   id, email, name, role, avatarUrl
 * }
 *
 * agency shape:
 * {
 *   id, name, license_number
 * }
 *
 * API roles: 'agency_owner' | 'agent' | 'super_admin'
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      agency: null,
      token: null,         // access token
      refreshToken: null,
      isAuthenticated: false,

      /**
       * Called after successful login or register.
       * Normalises the API response shape into the store.
       *
       * @param {object} apiUser   - { id, email, full_name, role }
       * @param {string} access    - JWT access token
       * @param {string} refresh   - JWT refresh token
       * @param {object} agency    - { id, name, license_number }
       */
      setAuth: (apiUser, access, refresh, agency) => {
        // React Query lives longer than an authenticated session. Without
        // clearing it here, a second agency signing in within the same SPA can
        // briefly receive the previous agency's still-fresh cached records.
        queryClient.clear()
        const user = {
          id: apiUser.id,
          email: apiUser.email,
          name: apiUser.full_name,
          role: apiUser.role,
          avatarUrl: null,
        }
        set({
          user,
          agency,
          token: access,
          refreshToken: refresh,
          isAuthenticated: true,
        })
      },

      updateUser: (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }))
      },

      updateAgency: (updates) => {
        set((state) => ({ agency: { ...state.agency, ...updates } }))
      },

      setTokens: ({ access, refresh }) => {
        set((state) => ({
          token: access ?? state.token,
          refreshToken: refresh ?? state.refreshToken,
          isAuthenticated: Boolean((access ?? state.token) && state.user),
        }))
      },

      clearAuth: () => {
        // Tenant-owned API data must never survive logout or an expired session.
        queryClient.clear()
        set({
          user: null,
          agency: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        })
      },

      getRole: () => get().user?.role ?? null,

      hasRole: (...roles) => roles.includes(get().user?.role),
    }),
    {
      name: 'nexora_auth',
      partialize: (state) => ({
        user: state.user,
        agency: state.agency,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
