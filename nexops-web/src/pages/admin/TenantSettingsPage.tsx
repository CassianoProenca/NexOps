import { useState, useRef } from 'react'
import { Info, X, AlertTriangle, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'

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

function NativeSelect({
  id, value, onChange, options, disabled,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  disabled?: boolean
}) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'w-full appearance-none border border-zinc-200 rounded-lg px-3 py-2 pr-8 text-sm bg-white text-zinc-800 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors',
          disabled && 'bg-zinc-50 text-zinc-400 cursor-not-allowed'
        )}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <svg className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
      </svg>
    </div>
  )
}

// ── Deactivate confirm modal ───────────────────────────────────────────────────

function DeactivateModal({ orgName, onClose, onConfirm }: { orgName: string; onClose: () => void; onConfirm: () => void }) {
  const [input, setInput] = useState('')
  const backdropRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900">Desativar organização?</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Todos os usuários perderão acesso imediatamente. Esta ação pode ser revertida pelo suporte NexOps.
            </p>
          </div>
        </div>

        <div>
          <Label>Para confirmar, digite o nome da organização:</Label>
          <p className="text-xs font-mono text-zinc-600 bg-zinc-50 border border-zinc-200 rounded px-2 py-1 mb-2 select-all">{orgName}</p>
          <Input value={input} onChange={setInput} placeholder={orgName} />
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={input !== orgName}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Desativar organização
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function TenantSettingsPage() {
  const [orgName, setOrgName]       = useState('Prefeitura de Votorantim')
  const [timezone, setTimezone]     = useState('America/Sao_Paulo')
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [showDeactivate, setShowDeactivate] = useState(false)
  const [toast, setToast]           = useState({ message: '', visible: false })
  const toastTimer                  = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef                = useRef<HTMLInputElement>(null)

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, visible: true })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000)
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function handleSave() {
    showToast('Alterações salvas com sucesso.')
  }

  const initial = orgName.trim() ? orgName.trim()[0].toUpperCase() : 'O'

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Configurações da Organização</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Personalize as informações e preferências do seu tenant.</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-start">
        {/* Left: General info card */}
        <div className="rounded-xl border bg-white p-6 space-y-5">
          <h2 className="text-sm font-semibold text-zinc-800">Informações Gerais</h2>

          <Field>
            <Label htmlFor="org-name">Nome da organização</Label>
            <Input id="org-name" value={orgName} onChange={setOrgName} placeholder="Ex: Prefeitura de Votorantim" />
          </Field>

          <Field>
            <div className="flex items-center gap-1.5 mb-1.5">
              <Label htmlFor="subdomain">Subdomínio</Label>
              <div className="group relative">
                <Info className="w-3.5 h-3.5 text-zinc-400 cursor-default" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-zinc-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                    Entre em contato para alterar
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-900" />
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Input id="subdomain" value="votorantim" readOnly className="rounded-r-none border-r-0" />
              <span className="border border-zinc-200 border-l-0 bg-zinc-50 text-zinc-400 text-sm px-3 py-2 rounded-r-lg whitespace-nowrap">.nexops.com.br</span>
            </div>
          </Field>

          {/* Logo upload */}
          <Field>
            <Label>Logo da organização</Label>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-xl border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden bg-zinc-50 shrink-0 cursor-pointer hover:border-[#4f6ef7] transition-colors group"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-zinc-400 group-hover:text-[#4f6ef7] transition-colors">
                    <span className="text-xl font-bold leading-none">{initial}</span>
                    <Upload className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="block text-xs font-medium text-[#4f6ef7] hover:underline"
                >
                  Carregar imagem
                </button>
                {logoPreview && (
                  <button
                    onClick={() => { setLogoPreview(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                    Remover
                  </button>
                )}
                <p className="text-[11px] text-zinc-400">PNG ou SVG, máx. 512 KB</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/png,image/svg+xml,image/jpeg" className="hidden" onChange={handleLogoChange} />
            </div>
          </Field>

          <Field>
            <Label htmlFor="timezone">Fuso horário</Label>
            <NativeSelect
              id="timezone"
              value={timezone}
              onChange={setTimezone}
              options={[
                { value: 'America/Sao_Paulo',  label: 'America/Sao_Paulo (GMT-3)' },
                { value: 'America/Manaus',     label: 'America/Manaus (GMT-4)' },
                { value: 'America/Belem',      label: 'America/Belem (GMT-3)' },
                { value: 'America/Fortaleza',  label: 'America/Fortaleza (GMT-3)' },
              ]}
            />
          </Field>

          <Field>
            <Label htmlFor="language">Idioma</Label>
            <NativeSelect
              id="language"
              value="pt_BR"
              onChange={() => {}}
              options={[{ value: 'pt_BR', label: 'Português (BR)' }]}
            />
          </Field>

          <div className="flex justify-end pt-2 border-t border-zinc-100">
            <button
              onClick={handleSave}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors shadow-sm"
            >
              Salvar Alterações
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Info card */}
          <div className="rounded-xl border bg-white p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-800">Sobre as configurações</h2>
            <div className="space-y-3 text-xs text-zinc-500 leading-relaxed">
              <div>
                <p className="font-semibold text-zinc-700 mb-0.5">Subdomínio</p>
                <p>Identifica sua organização na plataforma (ex: <span className="font-mono text-zinc-600">votorantim.nexops.com.br</span>). Para alterá-lo, entre em contato com o suporte NexOps.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-700 mb-0.5">Logo</p>
                <p>Aparece no topo da sidebar e nos e-mails enviados pela plataforma. Formatos aceitos: PNG ou SVG com até 512 KB.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-700 mb-0.5">Fuso horário</p>
                <p>Usado para exibir datas e horários em chamados, relatórios e notificações de acordo com a região da organização.</p>
              </div>
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-4">
            <h2 className="text-sm font-semibold text-red-600 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Zona de Perigo
            </h2>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-zinc-800">Desativar organização</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Suspende o acesso de todos os usuários. Os dados são preservados e o acesso pode ser restaurado pelo suporte.
                </p>
              </div>
              <button
                onClick={() => setShowDeactivate(true)}
                className="shrink-0 px-4 py-2 text-sm font-medium text-red-600 border border-red-300 hover:bg-red-100 rounded-lg transition-colors"
              >
                Desativar
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeactivate && (
        <DeactivateModal
          orgName={orgName}
          onClose={() => setShowDeactivate(false)}
          onConfirm={() => { setShowDeactivate(false); showToast('Organização desativada.') }}
        />
      )}

      <Toast {...toast} />
    </div>
  )
}
