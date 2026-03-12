// [ROLE: END_USER]

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, CheckCircle2, ChevronRight, Lightbulb, ThumbsUp, ArrowRight, Loader2 } from 'lucide-react'
import { useMyTickets } from '@/hooks/helpdesk/useTickets'
import { useSuggestSolutions } from '@/hooks/ai/useAi'
import { useAppStore } from '@/store/appStore'
import { formatRelativeTime } from '@/lib/utils'
import type { TicketStatus } from '@/types/helpdesk.types'

// ── Status mapping ────────────────────────────────────────────────────────────

type DisplayStatus = 'Aberto' | 'Em Andamento' | 'Pausado' | 'Finalizado'

const STATUS_DISPLAY: Record<TicketStatus, DisplayStatus> = {
  OPEN:        'Aberto',
  IN_PROGRESS: 'Em Andamento',
  PAUSED:      'Pausado',
  CLOSED:      'Finalizado',
}

const STATUS_COLOR: Record<DisplayStatus, string> = {
  'Aberto':       '#4f6ef7',
  'Em Andamento': '#d97706',
  'Pausado':      '#71717a',
  'Finalizado':   '#16a34a',
}

const STATUS_BADGE_BG: Record<DisplayStatus, string> = {
  'Aberto':       '#eef1ff',
  'Em Andamento': '#fffbeb',
  'Pausado':      '#f4f4f5',
  'Finalizado':   '#f0fdf4',
}

const MAX_CHARS = 1000

// ── Types ────────────────────────────────────────────────────────────────────

type FlowState = 'idle' | 'loading' | 'suggestions' | 'resolved' | 'error'

// ── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const firstName = user?.nome?.split(' ')[0] ?? user?.email ?? 'Olá'

  const [description, setDescription] = useState('')
  const [textareaFocused, setTextareaFocused] = useState(false)
  const [flowState, setFlowState] = useState<FlowState>('idle')
  const [solutions, setSolutions] = useState<string[]>([])
  const [aiErrorMsg, setAiErrorMsg] = useState<string>('')

  const { data: tickets = [], isLoading } = useMyTickets()
  const { suggestAsync, isLoading: isLoadingAi } = useSuggestSolutions()

  const activeTickets = tickets
    .filter((t) => t.status !== 'CLOSED')
    .slice(0, 3)

  const canSubmit = description.trim().length >= 10

  async function handleAnalyze() {
    if (!canSubmit) return
    setFlowState('loading')
    try {
      const result = await suggestAsync(description)
      if (result.solutions && result.solutions.length > 0) {
        setSolutions(result.solutions)
        setFlowState('suggestions')
      } else {
        setFlowState('error')
      }
    } catch (err: unknown) {
      // Extract backend message from Axios error response when available
      const axiosMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      const msg = axiosMsg ?? (err instanceof Error ? err.message : String(err))
      setAiErrorMsg(msg)
      setFlowState('error')
    }
  }

  function openTicket(aiContext?: string) {
    const enrichedDescription = aiContext
      ? `${description}\n\n---\nSoluções sugeridas pela IA que não resolveram:\n${aiContext}`
      : description
    navigate('/app/helpdesk/novo', { state: { description: enrichedDescription } })
  }

  function handleNotResolved() {
    const aiContext = solutions.map((s, i) => `${i + 1}. ${s}`).join('\n')
    openTicket(aiContext)
  }

  function handleResolved() {
    setFlowState('resolved')
  }

  function handleReset() {
    setFlowState('idle')
    setDescription('')
    setSolutions([])
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Olá, {firstName}.</h1>
        <p className="mt-1 text-text-secondary">Como podemos ajudar você hoje?</p>
      </div>

      {/* Two panels */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Main panel — Request (60%) ── */}
        <div className="w-full lg:w-[60%]">
          <div className="p-6 rounded-xl border bg-surface space-y-4">

            {/* ── State: resolved ── */}
            {flowState === 'resolved' && (
              <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#f0fdf4' }}>
                  <ThumbsUp className="w-6 h-6" style={{ color: '#16a34a' }} />
                </div>
                <div>
                  <p className="text-base font-semibold text-text-primary">Que ótimo!</p>
                  <p className="text-sm text-text-secondary mt-1">Fico feliz que o problema tenha sido resolvido.</p>
                </div>
                <button
                  onClick={handleReset}
                  className="mt-2 text-sm font-medium text-brand hover:underline"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Nova solicitação
                </button>
              </div>
            )}

            {/* ── State: error ── */}
            {flowState === 'error' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-4 rounded-lg border" style={{ backgroundColor: '#fef9ec', borderColor: '#fcd34d' }}>
                  <span className="text-lg shrink-0">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-zinc-800">IA indisponível no momento</p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      O assistente não conseguiu analisar seu problema. Verifique se a IA está configurada e ativada nas configurações do sistema, ou abra o chamado diretamente.
                    </p>
                    {aiErrorMsg && (
                      <p className="text-xs font-mono text-zinc-400 mt-2 break-all">{aiErrorMsg}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-[#e4e4e7] bg-surface hover:bg-[#f4f4f5] transition-colors text-text-secondary"
                    style={{ fontFamily: 'inherit', cursor: 'pointer' }}
                  >
                    ← Voltar
                  </button>
                  <button
                    onClick={() => openTicket()}
                    className="flex-1 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
                    style={{ backgroundColor: '#4f6ef7', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    Abrir chamado mesmo assim
                  </button>
                </div>
              </div>
            )}

            {/* ── State: suggestions ── */}
            {flowState === 'suggestions' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-4 h-4" style={{ color: '#4f6ef7' }} />
                    <h2 className="text-base font-semibold text-text-primary">Sugestões da IA</h2>
                  </div>
                  <p className="text-xs text-text-secondary">
                    Antes de abrir um chamado, tente estas soluções simples:
                  </p>
                </div>

                <div className="space-y-2.5">
                  {solutions.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-4 rounded-lg border"
                      style={{ backgroundColor: '#f8faff', borderColor: '#c7d2fe' }}
                    >
                      <span
                        className="shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                        style={{ backgroundColor: '#4f6ef7' }}
                      >
                        {i + 1}
                      </span>
                      <p className="text-sm text-text-primary leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={handleResolved}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-colors"
                    style={{ backgroundColor: '#16a34a', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Problema resolvido!
                  </button>
                  <button
                    onClick={handleNotResolved}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    style={{
                      backgroundColor: '#fafafa',
                      border: '1px solid #e4e4e7',
                      color: '#18181b',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    <ArrowRight className="w-4 h-4" />
                    Não resolveu, abrir chamado
                  </button>
                </div>

                <button
                  onClick={handleReset}
                  className="text-xs text-text-muted hover:text-text-secondary transition-colors"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  ← Voltar e editar descrição
                </button>
              </div>
            )}

            {/* ── State: idle / loading ── */}
            {(flowState === 'idle' || flowState === 'loading') && (
              <>
                <div>
                  <h2 className="text-base font-semibold text-text-primary">Nova solicitação</h2>
                  <p className="text-xs mt-0.5 text-text-secondary">
                    Descreva o problema. A IA vai sugerir soluções antes de abrir um chamado.
                  </p>
                </div>

                <div className="relative">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value.slice(0, MAX_CHARS))}
                    onFocus={() => setTextareaFocused(true)}
                    onBlur={() => setTextareaFocused(false)}
                    disabled={flowState === 'loading'}
                    placeholder="Descreva o que está acontecendo... Ex: Minha impressora não está imprimindo desde ontem."
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      borderRadius: '8px',
                      border: `1px solid ${textareaFocused ? '#4f6ef7' : '#e4e4e7'}`,
                      padding: '12px',
                      paddingBottom: description.length > 0 ? '32px' : '12px',
                      fontSize: '14px',
                      color: '#18181b',
                      backgroundColor: flowState === 'loading' ? '#f4f4f5' : '#fafafa',
                      outline: 'none',
                      resize: 'vertical',
                      fontFamily: 'inherit',
                      lineHeight: '1.6',
                      transition: 'border-color 0.15s',
                      cursor: flowState === 'loading' ? 'not-allowed' : 'text',
                    }}
                  />
                  {description.length > 0 && (
                    <span
                      className="absolute bottom-3 right-3 text-xs select-none pointer-events-none"
                      style={{ color: description.length >= MAX_CHARS ? '#dc2626' : '#a1a1aa' }}
                    >
                      {description.length} / {MAX_CHARS}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4">
                  {/* AI badge */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: '#eef1ff' }}>
                    <Sparkles className="w-3.5 h-3.5" style={{ color: '#4f6ef7' }} />
                    <span className="text-xs font-medium" style={{ color: '#4f6ef7' }}>IA disponível</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Skip AI — open ticket directly */}
                    <button
                      onClick={() => openTicket()}
                      disabled={!canSubmit || flowState === 'loading'}
                      className="px-3 py-2 rounded-lg text-sm text-text-secondary border border-[#e4e4e7] bg-surface hover:bg-[#f4f4f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      style={{ fontFamily: 'inherit', cursor: canSubmit ? 'pointer' : 'not-allowed' }}
                    >
                      Abrir chamado
                    </button>

                    {/* Main CTA — Analyze with AI */}
                    <button
                      onClick={handleAnalyze}
                      disabled={!canSubmit || isLoadingAi}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: !canSubmit || isLoadingAi ? '#a5b4fc' : '#4f6ef7',
                        border: 'none',
                        fontFamily: 'inherit',
                        cursor: !canSubmit || isLoadingAi ? 'not-allowed' : 'pointer',
                      }}
                    >
                      {isLoadingAi ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Analisar com IA
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Side panel — Active tickets (40%) ── */}
        <div className="w-full lg:w-[40%]">
          <div className="p-6 rounded-xl border bg-surface space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-primary">Meus chamados</h2>
              <button
                onClick={() => navigate('/app/helpdesk/meus-chamados')}
                className="text-xs font-medium transition-colors"
                style={{ color: '#4f6ef7', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Ver todos →
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-14 rounded-lg border border-[#e4e4e7] bg-zinc-50 animate-pulse" />
                ))}
              </div>
            ) : activeTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <CheckCircle2 className="w-8 h-8" style={{ color: '#16a34a' }} />
                <p className="text-sm text-text-secondary text-center">
                  Nenhum chamado aberto. Tudo certo por aqui!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {activeTickets.map((ticket) => {
                  const displayStatus = STATUS_DISPLAY[ticket.status]
                  return (
                    <button
                      key={ticket.id}
                      onClick={() => navigate(`/app/helpdesk/meu-chamado/${ticket.id}`)}
                      className="w-full text-left group"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
                    >
                      <div className="flex items-center gap-3 p-3 rounded-lg border border-[#e4e4e7] group-hover:border-[#4f6ef7]/40 group-hover:shadow-sm transition-all bg-background/30">
                        <div
                          className="shrink-0 w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: STATUS_COLOR[displayStatus] }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-text-primary truncate">
                            {ticket.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{
                                backgroundColor: STATUS_BADGE_BG[displayStatus],
                                color: STATUS_COLOR[displayStatus],
                              }}
                            >
                              {displayStatus}
                            </span>
                            <span className="text-[10px] text-text-muted">
                              {formatRelativeTime(ticket.openedAt)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* AI hint */}
          <div className="mt-3 p-4 rounded-xl border bg-surface">
            <div className="flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#d97706' }} />
              <p className="text-xs text-text-secondary leading-relaxed">
                <span className="font-semibold text-text-primary">Dica: </span>
                Antes de abrir um chamado, deixe a IA sugerir soluções rápidas. Muitos problemas comuns
                podem ser resolvidos em minutos sem precisar esperar um técnico.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
