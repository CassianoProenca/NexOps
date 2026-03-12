/**
 * DEV-ONLY hook — preview de permissões por perfil na sidebar e home.
 *
 * REMOVER ANTES DO DEPLOY EM PRODUÇÃO:
 *   1. Deletar este arquivo (src/hooks/useDevPermissions.ts)
 *   2. Em src/components/shared/Sidebar.tsx:
 *      - Remover import de useDevPermissions e FlaskConical
 *      - Remover constantes DEV_PROFILES, DEV_PROFILE_LABELS, DEV_PROFILE_COLORS, DEV_STORAGE_KEY
 *      - Remover componente DevProfileSwitcher
 *      - Trocar `const permissions = useDevPermissions(realPermissions)` de volta para
 *        `const permissions = realPermissions`
 *      - Remover o bloco `{import.meta.env.DEV && <DevProfileSwitcher ... />}` do JSX
 *   3. Em src/App.tsx:
 *      - Remover import de useDevPermissions
 *      - Trocar `const permissions = useDevPermissions(rawPermissions)` de volta para
 *        `const permissions = rawPermissions`
 */

import { useState, useEffect } from 'react'

export const DEV_STORAGE_KEY = 'nexops_dev_preview_profile'

export const DEV_PROFILES: Record<string, string[] | null> = {
  real:   null,
  user:   ['TICKET_CREATE', 'TICKET_VIEW_OWN'],
  tech:   ['TICKET_CREATE', 'TICKET_VIEW_OWN', 'TICKET_MANAGE', 'TICKET_ASSIGN', 'TICKET_RESOLVE', 'TICKET_VIEW_ALL', 'ASSET_VIEW', 'ASSET_CREATE', 'ASSET_EDIT', 'ASSET_MOVE'],
  gestor: ['TICKET_CREATE', 'TICKET_VIEW_OWN', 'TICKET_MANAGE', 'TICKET_ASSIGN', 'TICKET_RESOLVE', 'TICKET_DELETE', 'TICKET_VIEW_ALL', 'ASSET_VIEW', 'ASSET_CREATE', 'ASSET_EDIT', 'ASSET_MOVE', 'REPORT_VIEW_ALL', 'SLA_CONFIG', 'INVITE_CREATE'],
}

export const DEV_PROFILE_LABELS: Record<string, string> = {
  real:   'Suas permissões',
  user:   'Usuário Final',
  tech:   'Técnico',
  gestor: 'Gestor',
}

export const DEV_PROFILE_COLORS: Record<string, string> = {
  real:   'bg-zinc-100 text-zinc-600',
  user:   'bg-blue-50 text-blue-600',
  tech:   'bg-amber-50 text-amber-700',
  gestor: 'bg-purple-50 text-purple-700',
}

/** Retorna as permissões reais ou as do perfil de preview (só em DEV). */
export function useDevPermissions(realPermissions: string[]): string[] {
  const [profile, setProfile] = useState<string>(
    () => (import.meta.env.DEV ? localStorage.getItem(DEV_STORAGE_KEY) ?? 'real' : 'real')
  )

  useEffect(() => {
    if (!import.meta.env.DEV) return
    const handler = () => setProfile(localStorage.getItem(DEV_STORAGE_KEY) ?? 'real')
    window.addEventListener('nexops:dev-profile-change', handler)
    return () => window.removeEventListener('nexops:dev-profile-change', handler)
  }, [])

  if (!import.meta.env.DEV) return realPermissions
  const override = DEV_PROFILES[profile]
  return override !== null ? override : realPermissions
}
