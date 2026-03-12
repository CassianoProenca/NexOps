import { useState, useRef, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTenantSettings } from '@/hooks/auth/useTenantSettings'

// ── Helpers ────────────────────────────────────────────────────────────────────

function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <div className={cn(
      'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-900 text-white text-sm font-medium shadow-xl transition-all duration-300',
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
    )}>
      <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
      {message}
    </div>
  )
}

function Label({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-semibold text-zinc-700 mb-1.5">
      {children}
    </label>
  )
}

function Field({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('space-y-1', className)}>{children}</div>
}

function Input({
  id, value, onChange, placeholder, readOnly, className,
}: {
  id?: string
  value: string
  onChange?: (v: string) => void
  placeholder?: string
  readOnly?: boolean
  className?: string
}) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={cn(
        'w-full border rounded-lg px-3 py-2 text-sm transition-colors',
        readOnly
          ? 'bg-zinc-50 text-zinc-400 border-zinc-200 cursor-not-allowed select-none'
          : 'bg-white border-zinc-200 text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7]',
        className
      )}
    />
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TenantSettingsPage() {
  const { settings, isLoading, update, isSaving } = useTenantSettings()
  
  const [orgName, setOrgName]       = useState('')
  const [toast, setToast]           = useState({ message: '', visible: false })
  const toastTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (settings) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOrgName(settings.nomeFantasia)
    }
  }, [settings])

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, visible: true })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000)
  }

  async function handleSave() {
    try {
      await update({ nomeFantasia: orgName })
      showToast('Alterações salvas com sucesso.')
    } catch (e) {
      console.error(e)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
        <p className="text-sm text-zinc-400">Carregando configurações...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Configurações da Organização</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Personalize as informações e preferências do seu tenant.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-start">
        <div className="rounded-xl border bg-white p-6 space-y-5">
          <h2 className="text-sm font-semibold text-zinc-800">Informações Gerais</h2>

          <Field>
            <Label htmlFor="org-name">Nome da organização</Label>
            <Input id="org-name" value={orgName} onChange={setOrgName} placeholder="Ex: NexOps IT Solutions" />
          </Field>

          <Field>
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" value={settings?.cnpj || ''} readOnly />
          </Field>

          <Field>
            <Label htmlFor="email">E-mail de cobrança</Label>
            <Input id="email" value={settings?.email || ''} readOnly />
          </Field>

          <div className="flex justify-end pt-2 border-t border-zinc-100">
            <button
              onClick={handleSave}
              disabled={isSaving || orgName === settings?.nomeFantasia}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors shadow-sm disabled:opacity-40 flex items-center gap-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvar Alterações
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-800">Sobre as configurações</h2>
            <div className="space-y-3 text-xs text-zinc-500 leading-relaxed">
              <p>O nome da organização será exibido nos e-mails e relatórios gerados pelo sistema.</p>
              <p>O CNPJ e o E-mail são dados contratuais e não podem ser alterados diretamente. Entre em contato com o suporte para mudanças cadastrais.</p>
            </div>
          </div>
        </div>
      </div>

      <Toast {...toast} />
    </div>
  )
}
