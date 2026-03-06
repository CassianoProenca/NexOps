import { useState, useRef } from 'react'
import { Info, Eye, EyeOff, Zap, Sparkles, Check, X, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────

type AIProvider = 'openai' | 'gemini' | 'anthropic'

const PROVIDER_LABELS: Record<AIProvider, string> = {
  openai:    'OpenAI',
  gemini:    'Google Gemini',
  anthropic: 'Anthropic Claude',
}

const PROVIDER_MODELS: Record<AIProvider, { value: string; label: string }[]> = {
  openai: [
    { value: 'gpt-4o',       label: 'GPT-4o' },
    { value: 'gpt-4o-mini',  label: 'GPT-4o mini' },
    { value: 'gpt-4-turbo',  label: 'GPT-4 Turbo' },
  ],
  gemini: [
    { value: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
    { value: 'gemini-1.5-pro',   label: 'Gemini 1.5 Pro' },
  ],
  anthropic: [
    { value: 'claude-sonnet-4-20250514',    label: 'Claude Sonnet 4' },
    { value: 'claude-haiku-4-5-20251001',   label: 'Claude Haiku 4.5' },
  ],
}

const PROVIDER_KEY_LINKS: Record<AIProvider, string> = {
  openai:    'https://platform.openai.com/api-keys',
  gemini:    'https://aistudio.google.com/app/apikey',
  anthropic: 'https://console.anthropic.com/settings/keys',
}

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

// ── AI use cases ───────────────────────────────────────────────────────────────

const AI_USES = [
  {
    label: 'Triagem de chamados',
    description: 'Sugestão de tipo e prioridade ao abrir chamado',
    badge: 'Helpdesk',
  },
  {
    label: 'Assistente do técnico',
    description: 'Organização e priorização de chamados',
    badge: 'Helpdesk',
  },
  {
    label: 'Sugestões de resolução self-service',
    description: 'Respostas automáticas para usuários finais',
    badge: 'Helpdesk',
  },
]

// ── Page ───────────────────────────────────────────────────────────────────────

type TestState = 'idle' | 'loading' | 'success' | 'error'

export default function AISettingsPage() {
  const [enabled, setEnabled]     = useState(false)
  const [provider, setProvider]   = useState<AIProvider>('openai')
  const [apiKey, setApiKey]       = useState('')
  const [showKey, setShowKey]     = useState(false)
  const [model, setModel]         = useState(PROVIDER_MODELS.openai[0].value)
  const [testState, setTestState] = useState<TestState>('idle')
  const [testMsg, setTestMsg]     = useState('')
  const [toast, setToast]         = useState({ message: '', visible: false })
  const toastTimer                = useRef<ReturnType<typeof setTimeout> | null>(null)

  const disabled = !enabled

  function handleProviderChange(p: AIProvider) {
    setProvider(p)
    setModel(PROVIDER_MODELS[p][0].value)
    setTestState('idle')
    setTestMsg('')
  }

  function showToast(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message, visible: true })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000)
  }

  function handleTest() {
    if (!apiKey.trim()) {
      setTestState('error')
      setTestMsg('Informe a chave de API antes de testar.')
      return
    }
    setTestState('loading')
    setTestMsg('')
    setTimeout(() => {
      const ok = apiKey.length > 10
      setTestState(ok ? 'success' : 'error')
      setTestMsg(ok ? `Conexão com ${PROVIDER_LABELS[provider]} estabelecida.` : 'Chave de API inválida ou sem permissão.')
    }, 1400)
  }

  function handleSave() {
    showToast(enabled ? `Configuração de IA salva (${PROVIDER_LABELS[provider]}).` : 'IA desabilitada e configuração salva.')
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-zinc-900">Assistente IA (BYOK)</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Configure o provider de IA para funcionalidades assistidas.</p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-8 items-start">
        {/* Left: info banner + provider card */}
        <div className="space-y-5">
          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <Info className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
            <p className="text-xs text-blue-700 leading-relaxed">
              A IA é totalmente opcional. Nenhum fluxo do sistema depende dela para funcionar. Quando configurada, age sempre dentro
              das permissões do usuário que a acionou.
            </p>
          </div>

          {/* Provider card */}
          <div className="rounded-xl border bg-white p-6 space-y-5">
            <h2 className="text-sm font-semibold text-zinc-800">Provider de IA</h2>

            {/* Enable toggle */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 border border-zinc-100">
              <div>
                <p className="text-sm font-medium text-zinc-800">Habilitar IA</p>
                <p className="text-xs text-zinc-400 mt-0.5">Ativa as funcionalidades assistidas no sistema.</p>
              </div>
              <Toggle checked={enabled} onChange={setEnabled} />
            </div>

            <div className={cn('space-y-4 transition-opacity', disabled && 'opacity-50')}>
              <div>
                <Label htmlFor="ai-provider">Provider</Label>
                <NativeSelect
                  id="ai-provider"
                  value={provider}
                  onChange={(v) => handleProviderChange(v as AIProvider)}
                  disabled={disabled}
                  options={[
                    { value: 'openai',    label: 'OpenAI' },
                    { value: 'gemini',    label: 'Google Gemini' },
                    { value: 'anthropic', label: 'Anthropic Claude' },
                  ]}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="ai-key">Chave de API</Label>
                  <a
                    href={PROVIDER_KEY_LINKS[provider]}
                    target="_blank"
                    rel="noopener noreferrer"
                    tabIndex={disabled ? -1 : 0}
                    className={cn(
                      'flex items-center gap-1 text-[11px] text-[#4f6ef7] hover:underline',
                      disabled && 'pointer-events-none opacity-40'
                    )}
                  >
                    Como obter minha chave
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="relative">
                  <FieldInput
                    id="ai-key"
                    type={showKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={setApiKey}
                    placeholder={provider === 'openai' ? 'sk-...' : provider === 'gemini' ? 'AIza...' : 'sk-ant-...'}
                    disabled={disabled}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    disabled={disabled}
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 disabled:pointer-events-none"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="ai-model">Modelo</Label>
                <NativeSelect
                  id="ai-model"
                  value={model}
                  onChange={setModel}
                  disabled={disabled}
                  options={PROVIDER_MODELS[provider]}
                />
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
                  {testState === 'loading' ? 'Testando...' : 'Testar API Key'}
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
                className="px-5 py-2 text-sm font-semibold text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors shadow-sm"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>

        {/* Right: usage card */}
        <div className="rounded-xl border bg-white p-6 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-zinc-800">Uso da IA no sistema</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Funcionalidades ativadas automaticamente quando a IA está configurada.</p>
          </div>

          <div className="space-y-3">
            {AI_USES.map(({ label, description, badge }) => (
              <div key={label} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-100 bg-zinc-50">
                <div className="w-7 h-7 rounded-lg bg-[#eef1ff] flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#4f6ef7]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-xs font-semibold text-zinc-800">{label}</p>
                    <span className="text-[10px] font-bold bg-[#eef1ff] text-[#4f6ef7] border border-[#c7d0ff] px-1.5 py-0.5 rounded-full">
                      {badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Toast {...toast} />
    </div>
  )
}
