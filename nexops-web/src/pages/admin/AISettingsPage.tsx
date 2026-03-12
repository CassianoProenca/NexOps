import { useState, useEffect } from 'react'
import { Sparkles, Check, ExternalLink, Loader2, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useExtraSettings } from '@/hooks/auth/useTenantSettings'

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

// ── Page ───────────────────────────────────────────────────────────────────────

export default function AISettingsPage() {
  const { extra, isLoading, updateAi, isSavingAi } = useExtraSettings()

  const [provider, setProvider] = useState<'OPENAI' | 'GOOGLE' | 'ANTHROPIC'>('OPENAI')
  const [apiKey, setApiKey]     = useState('')
  const [model, setModel]       = useState('')
  const [enabled, setEnabled]   = useState(false)
  const [showKey, setShowKey]   = useState(false)
  
  const [toast, setToast]       = useState({ message: '', visible: false })

  useEffect(() => {
    if (extra) {
      /* eslint-disable react-hooks/set-state-in-effect */
      setProvider((extra.aiProvider as 'OPENAI' | 'GOOGLE' | 'ANTHROPIC') ?? 'OPENAI')
      setApiKey(extra.aiApiKey || '')
      setModel(extra.aiModel || '')
      setEnabled(extra.aiEnabled ?? false)
      /* eslint-enable react-hooks/set-state-in-effect */
    }
  }, [extra])

  function showToast(message: string) {
    setToast({ message, visible: true })
    setTimeout(() => setToast({ message: '', visible: false }), 3000)
  }

  async function handleSave() {
    try {
      await updateAi({
        aiProvider: provider,
        aiApiKey: apiKey,
        aiModel: model,
        aiEnabled: enabled
      })
      showToast('Configurações de IA salvas.')
    } catch (e) {
      console.error(e)
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-100 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
        <p className="text-sm text-zinc-400">Carregando configurações de IA...</p>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Inteligência Artificial (BYOK)</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Traga sua própria chave para ativar recursos inteligentes no Helpdesk.</p>
        </div>
        <div className="flex items-center gap-2 bg-zinc-100 p-1 rounded-lg">
          <button
            onClick={() => setEnabled(false)}
            className={cn('px-3 py-1.5 text-xs font-semibold rounded-md transition-all', !enabled ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-500')}
          >
            Desativado
          </button>
          <button
            onClick={() => setEnabled(true)}
            className={cn('px-3 py-1.5 text-xs font-semibold rounded-md transition-all', enabled ? 'bg-green-500 text-white shadow-sm' : 'text-zinc-500')}
          >
            Ativado
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8 items-start">
        <div className={cn('rounded-xl border bg-white p-6 space-y-6 transition-opacity', !enabled && 'opacity-60 grayscale-[0.5]')}>
          <div className="space-y-4">
            <div>
              <Label>Provedor de IA</Label>
              <div className="grid grid-cols-3 gap-3">
                {(['OPENAI', 'GOOGLE', 'ANTHROPIC'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setProvider(p)}
                    disabled={!enabled}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                      provider === p ? 'border-[#4f6ef7] bg-[#eef1ff]/30' : 'border-zinc-100 hover:border-zinc-200'
                    )}
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-50 flex items-center justify-center">
                      <Sparkles className={cn('w-4 h-4', provider === p ? 'text-[#4f6ef7]' : 'text-zinc-400')} />
                    </div>
                    <span className={cn('text-xs font-bold', provider === p ? 'text-zinc-900' : 'text-zinc-500')}>{p}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="api-key">API Key</Label>
              <div className="relative">
                <input
                  id="api-key"
                  type={showKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  disabled={!enabled}
                  placeholder="sk-..."
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  disabled={!enabled}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="model">Modelo específico (opcional)</Label>
              <input
                id="model"
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                disabled={!enabled}
                placeholder={provider === 'OPENAI' ? 'gpt-4o' : provider === 'GOOGLE' ? 'gemini-1.5-pro' : 'claude-3-sonnet'}
                className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-zinc-100">
            <button
              onClick={handleSave}
              disabled={isSavingAi}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#4f6ef7] hover:bg-[#3d5ce6] rounded-lg transition-colors shadow-sm disabled:opacity-40 flex items-center gap-2"
            >
              {isSavingAi && <Loader2 className="w-4 h-4 animate-spin" />}
              Salvar Configurações
            </button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-6 space-y-4">
            <h2 className="text-sm font-semibold text-zinc-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Recursos Ativados
            </h2>
            <ul className="space-y-3">
              {[
                'Sugestão automática de solução',
                'Categorização inteligente de chamados',
                'Resumo de histórico de atendimento',
                'Análise de sentimento do cliente'
              ].map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-xs text-zinc-500">
                  <Check className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border bg-zinc-50 p-6 space-y-3">
            <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-widest">Links úteis</h3>
            <div className="space-y-2">
              <a href="#" className="flex items-center justify-between text-xs text-[#4f6ef7] hover:underline">
                Obter chave OpenAI
                <ExternalLink className="w-3 h-3" />
              </a>
              <a href="#" className="flex items-center justify-between text-xs text-[#4f6ef7] hover:underline">
                Preços Google AI
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <Toast {...toast} />
    </div>
  )
}
