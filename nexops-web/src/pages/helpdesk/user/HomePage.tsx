// [ROLE: END_USER]

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, CheckCircle2, ChevronRight } from 'lucide-react'
import { useMyTickets } from '@/hooks/helpdesk/useTickets'
import { useAppStore } from '@/store/appStore'
import { formatRelativeTime } from '@/lib/utils'
import type { TicketStatus } from '@/types/helpdesk.types'

// ── Status mapping (backend enum → display) ───────────────────────────────────

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

export default function HomePage() {
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const firstName = user?.name?.split(' ')[0] ?? user?.email ?? 'Olá'

  const [description, setDescription] = useState('')
  const [textareaFocused, setTextareaFocused] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: tickets = [], isLoading } = useMyTickets()

  // Only show active (non-closed) tickets — up to 3
  const activeTickets = tickets
    .filter((t) => t.status !== 'CLOSED')
    .slice(0, 3)

  const isDisabled = !description.trim() || isSubmitting

  function handleSubmit() {
    if (isDisabled) return
    setIsSubmitting(true)
    setTimeout(() => {
      navigate('/app/helpdesk/novo', { state: { description } })
    }, 1000)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Olá, {firstName}.</h1>
        <p className="mt-1 text-text-secondary">Como podemos ajudar você hoje?</p>
      </div>

      {/* Dois painéis */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ── Painel principal — Nova solicitação (60%) ── */}
        <div className="w-full lg:w-[60%]">
          <div className="p-6 rounded-xl border bg-surface space-y-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Nova solicitação</h2>
              <p className="text-xs mt-0.5 text-text-secondary">
                Descreva o problema e nossa equipe irá ajudar. Em breve com sugestões inteligentes.
              </p>
            </div>

            <div className="relative">
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0, MAX_CHARS))}
                onFocus={() => setTextareaFocused(true)}
                onBlur={() => setTextareaFocused(false)}
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
                  backgroundColor: '#fafafa',
                  outline: 'none',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                  lineHeight: '1.6',
                  transition: 'border-color 0.15s',
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
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f4f4f5]">
                <Sparkles className="w-3.5 h-3.5 text-[#a1a1aa]" />
                <span className="text-xs text-[#a1a1aa]">IA indisponível</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={isDisabled}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isDisabled ? '#a5b4fc' : '#4f6ef7',
                  border: 'none',
                  fontFamily: 'inherit',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                }}
                onMouseEnter={(e) => {
                  if (!isDisabled) e.currentTarget.style.backgroundColor = '#3d5ce8'
                }}
                onMouseLeave={(e) => {
                  if (!isDisabled) e.currentTarget.style.backgroundColor = '#4f6ef7'
                }}
              >
                {isSubmitting ? (
                  <>
                    <span
                      className="animate-spin rounded-full border-2 border-white/40 border-t-white"
                      style={{ width: '14px', height: '14px', flexShrink: 0 }}
                    />
                    Abrindo...
                  </>
                ) : (
                  'Abrir Chamado'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ── Painel lateral — Meus chamados ativos (40%) ── */}
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
                      onClick={() => navigate(`/app/helpdesk/chamado-usuario/${ticket.id}`)}
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
        </div>

      </div>
    </div>
  )
}
