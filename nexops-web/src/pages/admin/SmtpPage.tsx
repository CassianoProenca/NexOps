import { useState, useRef, useEffect } from 'react'
import { Info, Eye, EyeOff, Zap, Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExtraSettings } from '@/hooks/auth/useTenantSettings'

// ── Shared ─────────────────────────────────────────────────────────────────────

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

function FieldInput({
  id, type = 'text', value, onChange, placeholder, disabled, className,
}: {
  id?: string
  type?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(
        'w-full border rounded-lg px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7]',
        disabled
          ? 'bg-zinc-50 text-zinc-400 border-zinc-200 cursor-not-allowed'
          : 'bg-white border-zinc-200 text-zinc-800',
        className
      )}
    />
  )
}

// ── Toggle ─────────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200',
        disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer',
        checked ? 'bg-[#4f6ef7]' : 'bg-zinc-200'
      )}
    >
      <span className={cn(
        'pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
        checked ? 'translate-x-4' : 'translate-x-0'
      )} />
    </button>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

type TestState = 'idle' | 'loading' | 'success' | 'error'

export default function SmtpPage() {
  const { extra, isLoading, updateSmtp, testSmtp, isSavingSmtp, isTestingSmtp } = useExtraSettings()

  const [enabled, setEnabled]     = useState(false)
  const [host, setHost]           = useState('')
  const [port, setPort]           = useState('587')
  const [user, setUser]           = useState('')
  const [password, setPassword]   = useState('')
  const [showPass, setShowPass]   = useState(false)
  const [fromEmail, setFromEmail] = useState('')
  const [fromName, setFromName]   = useState('')
  const [useTls, setUseTls]       = useState(true)
  const [testState, setTestState] = useState<TestState>('idle')
  const [testMsg, setTestMsg]     = useState('')
  const [toast, setToast]         = useState({ message: '', visible: false })
  const toastTimer                = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (extra) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setEnabled(!!extra.smtpHost)
      setHost(extra.smtpHost || '')
      setPort(extra.smtpPort?.toString() || '587')
      setUser(extra.smtpUsername || '')
      // Se já tem senha salva, deixamos um placeholder visual, mas não carregamos a senha real por segurança
      setPassword(extra.hasSmtpPassword ? '********' : '')
      setFromEmail(extra.smtpFromEmail || '')
      setFromName(extra.smtpFromName || '')
      setUseTls(extra.smtpUseTls ?? true)
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [extra])

  const disabled = !enabled

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, visible: true })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000)
  }

  async function handleTest() {
    if (!host || !port) {
      setTestState('error')
      setTestMsg('Preencha Host e Porta para testar.')
      return
    }
    setTestState('loading')
    setTestMsg('')
    try {
      // Enviamos os dados ATUAIS da tela para o teste
      const result = await testSmtp({
        host,
        port: parseInt(port),
        username: user,
        password: password === '********' ? undefined : password, // Não enviamos o placeholder
        fromEmail,
        fromName,
        useTls
      })
      setTestState('success')
      setTestMsg(result.message)
    } catch (e: unknown) {
      setTestState('error')
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      setTestMsg(msg || 'Não foi possível conectar ao servidor SMTP.')
    }
  }

  async function handleSave() {
    try {
      await updateSmtp({
        host: enabled ? host : '', // Se desabilitado, limpamos no banco
        port: parseInt(port),
        username: user,
        password: password === '********' ? undefined : password, // Só envia se mudou
        fromEmail: fromEmail,
        fromName: fromName,
        useTls: useTls
      })
      showToast(enabled ? 'Configuração SMTP salva.' : 'SMTP desabilitado e configuração salva.')
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
        <h1 className="text-xl font-bold text-zinc-900">Configuração de E-mail (SMTP)</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Defina o servidor de e-mail para envio de notificações e convites.</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-start">
        {/* Left: info banner + config card */}
        <div className="space-y-5">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              Quando o SMTP não está configurado, convites e notificações geram links copiáveis em vez de e-mails automáticos.
              O sistema funciona normalmente sem SMTP.
            </p>
          </div>

          {/* Config card */}
          <div className="rounded-xl border bg-white p-6 space-y-5">
            <h2 className="text-sm font-semibold text-zinc-800">Configuração SMTP</h2>

            {/* Enable toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-100">
              <div>
                <p className="text-sm font-medium text-zinc-800">Habilitar SMTP</p>
                <p className="text-xs text-zinc-400 mt-0.5">Ativa o envio de e-mails automáticos pelo sistema.</p>
              </div>
              <Toggle checked={enabled} onChange={setEnabled} />
            </div>

            <div className={cn('space-y-4 transition-opacity', disabled && 'opacity-50')}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp-host">Servidor SMTP</Label>
                  <FieldInput id="smtp-host" value={host} onChange={setHost} placeholder="smtp.gmail.com" disabled={disabled} />
                </div>
                <div>
                  <Label htmlFor="smtp-port">Porta</Label>
                  <FieldInput id="smtp-port" type="number" value={port} onChange={setPort} placeholder="587" disabled={disabled} />
                </div>
              </div>

              <div>
                <Label htmlFor="smtp-user">Usuário</Label>
                <FieldInput id="smtp-user" value={user} onChange={setUser} placeholder="usuario@empresa.com" disabled={disabled} />
              </div>

              <div>
                <Label htmlFor="smtp-pass">Senha</Label>
                <div className="relative">
                  <FieldInput
                    id="smtp-pass"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={setPassword}
                    placeholder="••••••••"
                    disabled={disabled}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    disabled={disabled}
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 disabled:pointer-events-none"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="from-email">E-mail remetente</Label>
                  <FieldInput id="from-email" value={fromEmail} onChange={setFromEmail} placeholder="ti@prefeitura.sp.gov.br" disabled={disabled} />
                </div>
                <div>
                  <Label htmlFor="from-name">Nome do remetente</Label>
                  <FieldInput id="from-name" value={fromName} onChange={setFromName} placeholder="TI — NexOps" disabled={disabled} />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-100">
                <div>
                  <p className="text-sm font-medium text-zinc-800">Usar TLS</p>
                  <p className="text-xs text-zinc-400 mt-0.5">Recomendado para comunicação segura (porta 587).</p>
                </div>
                <Toggle checked={useTls} onChange={setUseTls} disabled={disabled} />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100 gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={disabled}
                  onClick={handleTest}
                  className="flex items-center gap-1.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 px-3 py-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Zap className="w-4 h-4" />
                  {isTestingSmtp ? 'Testando...' : 'Testar Conexão'}
                </button>

                {testState === 'success' && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                    <Check className="w-3.5 h-3.5" /> {testMsg}
                  </span>
                )}
                {testState === 'error' && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-red-600">
                    <X className="w-3.5 h-3.5" /> {testMsg}
                  </span>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={isSavingSmtp}
                className="px-5 py-2 text-sm font-semibold text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors shadow-sm disabled:opacity-40 flex items-center gap-2"
              >
                {isSavingSmtp && <Loader2 className="w-4 h-4 animate-spin" />}
                Salvar
              </button>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Status banner */}
          {enabled ? (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-50 border border-green-200">
              <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
              <span className="text-sm font-semibold text-green-700">SMTP ativo</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-zinc-100 border border-zinc-200">
              <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />
              <span className="text-sm font-semibold text-zinc-500">SMTP não configurado</span>
            </div>
          )}

          {/* How-to card */}
          <div className="rounded-xl border bg-white p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-800">Como configurar</h2>
            <div className="space-y-4 text-xs text-zinc-500 leading-relaxed">
              <div>
                <p className="font-semibold text-zinc-700 mb-1">Gmail</p>
                <p>Ative a autenticação de 2 fatores e gere uma senha de app em <span className="font-medium text-zinc-600">Segurança → Senhas de app</span>. Use a senha gerada no campo Senha acima.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-700 mb-1">Outlook / Office 365</p>
                <p>Use <span className="font-mono text-zinc-600">smtp.office365.com</span> porta <span className="font-mono text-zinc-600">587</span> com suas credenciais corporativas da Microsoft.</p>
              </div>
              <div>
                <p className="font-semibold text-zinc-700 mb-1">SMTP próprio</p>
                <p>Use as credenciais do seu servidor de e-mail. Consulte a documentação do provedor para obter host, porta e modo de autenticação.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Toast {...toast} />
    </div>
  )
}
