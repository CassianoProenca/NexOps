import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AuthenticatedUser } from '@/types/auth.types'

interface AppStore {
  // ── state ─────────────────────────────────────────────────────────────────
  user: AuthenticatedUser | null
  tenant: string | null          // tenantId UUID — used for tenant-scoped operations
  accessToken: string | null
  refreshToken: string | null
  permissions: string[]          // array of permission codes
  sidebarCollapsed: boolean

  // ── actions ───────────────────────────────────────────────────────────────
  setAuth: (
    user: AuthenticatedUser,
    tenant: string,
    accessToken: string,
    refreshToken: string,
    permissions: string[],
  ) => void
  setTokens: (accessToken: string, refreshToken: string) => void
  clearAuth: () => void
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (...perms: string[]) => boolean
  toggleSidebar: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      user: null,
      tenant: null,
      accessToken: null,
      refreshToken: null,
      permissions: [],
      sidebarCollapsed: false,

      setAuth(user, tenant, accessToken, refreshToken, permissions) {
        set({ user, tenant, accessToken, refreshToken, permissions })
      },

      setTokens(accessToken, refreshToken) {
        set({ accessToken, refreshToken })
      },

      clearAuth() {
        set({
          user: null,
          tenant: null,
          accessToken: null,
          refreshToken: null,
          permissions: [],
        })
      },

      hasPermission(permission: string) {
        return get().permissions.includes(permission)
      },

      hasAnyPermission(...perms: string[]) {
        const current = get().permissions
        return perms.some((p) => current.includes(p))
      },

      toggleSidebar() {
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed }))
      },
    }),
    {
      name: 'nexops-auth',
      partialize: (s) => ({
        user: s.user,
        tenant: s.tenant,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
        permissions: s.permissions,
      }),
    },
  ),
)
