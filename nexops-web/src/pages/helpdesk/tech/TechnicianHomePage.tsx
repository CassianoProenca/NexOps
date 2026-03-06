import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListTodo, Briefcase, Sparkles, ArrowRight } from 'lucide-react'

const ACCENT = '#4f6ef7'
const ACCENT_SUBTLE = '#eef1ff'

const MOCK_QUEUE = [
  { id: 1, title: 'Impressora não responde', tier: 'N2', time: '14min' },
  { id: 2, title: 'Reset de senha SAM', tier: 'N1', time: '32min' },
  { id: 3, title: 'Notebook não liga', tier: 'N3', time: '1h' },
  { id: 4, title: 'VPN sem conexão após atualização', tier: 'N2', time: '2h' },
  { id: 5, title: 'Monitor sem sinal na sala 204', tier: 'N1', time: '3h' },
]

const TIER_STYLE: Record<string, string> = {
  N1: 'bg-zinc-100 text-zinc-600',
  N2: 'bg-amber-50 text-amber-500',
  N3: 'bg-red-50 text-red-600',
}

const SUGGESTIONS = [
  'Organize meus chamados por prioridade',
  'Qual chamado devo atender primeiro?',
  'Resuma o status dos meus trabalhos',
]

export default function TechnicianHomePage() {
  const navigate = useNavigate()
  const [prompt, setPrompt] = useState('')
  const [response, setResponse] = useState<string | null>(null)

  function handleSend() {
    if (!prompt.trim()) return
    setResponse('Funcionalidade disponível após configuração do provider de IA.')
  }

  return (
    <div className="p-8 space-y-6">

      {/* Linha 1 — Header */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Bom dia, Cassiano</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Aqui está um resumo do seu dia.</p>
      </div>

      {/* Linha 2 — Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6 items-start">

        {/* Coluna esquerda — Fila de Chamados */}
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <h2 className="text-sm font-semibold text-zinc-900">Fila de Chamados</h2>
            <span className="text-xs bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-full font-medium">
              12 aguardando
            </span>
          </div>

          <div className="flex-1 divide-y divide-zinc-100">
            {MOCK_QUEUE.map((ticket) => (
              <div key={ticket.id} className="flex items-center gap-3 px-6 py-3.5">
                <p className="flex-1 text-sm text-zinc-700 truncate">{ticket.title}</p>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${TIER_STYLE[ticket.tier]}`}>
                  {ticket.tier}
                </span>
                <span className="text-xs text-zinc-400 whitespace-nowrap">{ticket.time}</span>
              </div>
            ))}
          </div>

          <div className="px-6 py-4 border-t border-zinc-100">
            <button
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-opacity"
              style={{ background: ACCENT }}
            >
              Atender Próximo
            </button>
          </div>
        </div>

        {/* Coluna direita — Ações rápidas */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => navigate('/app/helpdesk/fila')}
            className="flex items-center gap-4 p-6 rounded-xl border border-zinc-200 bg-white text-left hover:border-[#4f6ef7] hover:shadow-sm transition-all group"
          >
            <div className="rounded-lg p-3 shrink-0" style={{ background: ACCENT_SUBTLE }}>
              <ListTodo className="w-6 h-6" style={{ color: ACCENT }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-zinc-900">Ver Fila</p>
              <p className="text-sm text-zinc-500 mt-0.5">Chamados aguardando atendimento</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-[#4f6ef7] transition-colors shrink-0" />
          </button>

          <button
            onClick={() => navigate('/app/helpdesk/meus-trabalhos')}
            className="flex items-center gap-4 p-6 rounded-xl border border-zinc-200 bg-white text-left hover:border-[#4f6ef7] hover:shadow-sm transition-all group"
          >
            <div className="rounded-lg p-3 shrink-0" style={{ background: ACCENT_SUBTLE }}>
              <Briefcase className="w-6 h-6" style={{ color: ACCENT }} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-zinc-900">Meus Trabalhos</p>
              <p className="text-sm text-zinc-500 mt-0.5">Chamados vinculados a você</p>
            </div>
            <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-[#4f6ef7] transition-colors shrink-0" />
          </button>
        </div>
      </div>

      {/* Linha 3 — Assistente IA (largura total) */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 py-4 border-b border-zinc-100">
          <Sparkles className="w-4 h-4 text-zinc-500" />
          <h2 className="text-sm font-semibold text-zinc-900">Assistente IA</h2>
          <span className="text-xs bg-zinc-200 text-zinc-500 px-2 py-0.5 rounded-full font-medium">
            Beta
          </span>
        </div>

        <div className="p-6 space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={1000}
            placeholder="Ex: organize meus chamados por complexidade e me indique a melhor ordem de resolução..."
            className="w-full resize-y rounded-lg border border-zinc-200 p-3 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            style={{ minHeight: 80, maxHeight: 240 }}
          />
          <p className="text-xs text-zinc-400 text-right -mt-1">{prompt.length}/1000</p>

          <div className="flex flex-wrap items-center gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setPrompt(s)}
                className="text-xs border border-zinc-200 rounded-full px-3 py-1 text-zinc-600 hover:bg-zinc-50 transition-colors"
              >
                {s}
              </button>
            ))}
            <div className="ml-auto">
              <button
                onClick={handleSend}
                disabled={!prompt.trim()}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
                style={{ background: ACCENT }}
              >
                Enviar
              </button>
            </div>
          </div>

          {response && (
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
              {response}
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
