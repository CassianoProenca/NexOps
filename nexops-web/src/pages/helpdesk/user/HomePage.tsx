// [ROLE: END_USER]

import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Sparkles, CheckCircle2, ChevronRight, 
  ThumbsUp, Bot, User, Send, Tag, RefreshCw, Lightbulb, PlusCircle
} from 'lucide-react'
import { useMyTickets, useCreateTicket } from '@/hooks/helpdesk/useTickets'
import { useAnalyzeTicket } from '@/hooks/ai/useAi'
import { useDepartments } from '@/hooks/helpdesk/useDepartments'
import { useProblemTypes } from '@/hooks/helpdesk/useProblemTypes'
import { useAppStore } from '@/store/appStore'
import { formatRelativeTime, cn } from '@/lib/utils'
import AI_TIPS from '@/assets/data/ai-tips.json'

// ── Types ────────────────────────────────────────────────────────────────────

interface SuccessContent {
  ticketId: string
  pType?: string
  title?: string
}

interface Message {
  id: string
  sender: 'bot' | 'user'
  type: 'text' | 'suggestions' | 'dept-select' | 'success'
  content: string | SuccessContent
  timestamp: Date
}

// ── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const navigate = useNavigate()
  const user = useAppStore(s => s.user)
  const firstName = user?.nome?.split(' ')[0] ?? 'Usuário'

  // Dynamic Tip Selection (changes based on the hour)
  const currentTip = useMemo(() => {
    const now = new Date()
    const seed = now.getDate() + now.getHours()
    return AI_TIPS[seed % AI_TIPS.length]
  }, [])

  // Data Hooks
  const { data: tickets = [] } = useMyTickets()
  const { departments = [] } = useDepartments()
  const { problemTypes = [] } = useProblemTypes()
  const { analyze } = useAnalyzeTicket()
  const createTicket = useCreateTicket()

  // Chat State
  const [messages, setMessages] = useState<Message[]>([])
  const [userInput, setUserInput] = useState('')
  const [isBotTyping, setIsBotTyping] = useState(false)
  
  // Internal Flow State
  const [fullDescription, setFullDescription] = useState('')
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])

  const chatEndRef = useRef<HTMLDivElement>(null)

  // ── Initial Message ──
  useEffect(() => {
    setMessages([{
      id: '1',
      sender: 'bot',
      type: 'text',
      content: `Olá, ${firstName}! Descreva o que está acontecendo para que eu possa te ajudar.`,
      timestamp: new Date()
    }])
  }, [firstName])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isBotTyping])

  // ── Logic ──

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, {
      ...msg,
      id: Math.random().toString(36).substring(2, 11),
      timestamp: new Date()
    }])
  }

  const handleSend = async () => {
    if (!userInput.trim() || isBotTyping) return
    
    const text = userInput.trim()
    setUserInput('')
    setFullDescription(text)
    
    addMessage({ sender: 'user', type: 'text', content: text })
    
    setIsBotTyping(true)
    try {
      const res = await analyze({
        description: text,
        departments: departments.map(d => ({ id: d.id, name: d.name })),
        problemTypes: problemTypes.map(p => ({ id: p.id, name: p.name }))
      })
      
      setAiSuggestions(res.solutions || [])
      setIsBotTyping(false)

      if (res.solutions && res.solutions.length > 0) {
        addMessage({
          sender: 'bot',
          type: 'suggestions',
          content: 'Entendi. Antes de abrirmos um chamado, tente estas soluções simples:'
        })
      } else {
        // Se não houver sugestões, pula direto para a pergunta do departamento
        addMessage({
          sender: 'bot',
          type: 'dept-select',
          content: 'Entendido. Para me ajudar a triar seu atendimento, em qual departamento você trabalha?'
        })
      }
    } catch {
      setIsBotTyping(false)
      addMessage({ 
        sender: 'bot', 
        type: 'text', 
        content: 'Tive um problema ao analisar sua solicitação. Gostaria de tentar novamente ou abrir o chamado de forma manual?' 
      })
    }
  }

  const handleSolutionResolved = () => {
    addMessage({ sender: 'bot', type: 'text', content: 'Excelente! Fico feliz em ter ajudado. Precisando de algo mais, é só chamar!' })
  }

  const handleSolutionFailed = () => {
    addMessage({
      sender: 'bot',
      type: 'dept-select',
      content: 'Entendi. Para prosseguirmos com a abertura do chamado, informe em qual departamento você trabalha:'
    })
  }

  const handleDeptSelect = async (deptId: string) => {
    const deptName = departments.find(d => d.id === deptId)?.name
    addMessage({ sender: 'user', type: 'text', content: `Para o departamento: ${deptName}` })
    
    setIsBotTyping(true)
    try {
      const res = await analyze({
        description: fullDescription,
        departments: departments.map(d => ({ id: d.id, name: d.name })),
        problemTypes: problemTypes.map(p => ({ id: p.id, name: p.name }))
      })

      const pType = problemTypes.find(p => p.id === res.suggestedProblemTypeId)
      
      createTicket.mutate({
        title: res.suggestedTitle || 'Solicitação de Suporte',
        description: fullDescription,
        departmentId: deptId,
        problemTypeId: res.suggestedProblemTypeId || ''
      }, {
        onSuccess: (ticket) => {
          setIsBotTyping(false)
          addMessage({
            sender: 'bot',
            type: 'success',
            content: { ticketId: ticket.id, pType: pType?.name, title: res.suggestedTitle }
          })
        }
      })
    } catch {
      setIsBotTyping(false)
      addMessage({ sender: 'bot', type: 'text', content: 'Erro ao processar. Vamos tentar novamente?' })
    }
  }

  return (
    <div className="max-w-350 mx-auto h-[calc(100vh-64px)] flex flex-col lg:flex-row overflow-hidden bg-zinc-50/50">
      
      {/* ── LEFT: CHAT AREA ── */}
      <div className="flex-1 flex flex-col h-full bg-white lg:border-r border-zinc-200">
        
        {/* Chat Header */}
        <div className="px-8 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand flex items-center justify-center shadow-lg shadow-brand/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-black text-zinc-900 uppercase tracking-tight">Suporte Inteligente</h2>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase">IA Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 custom-scrollbar">
          {messages.map((m) => {
            const isBot = m.sender === 'bot'
            const isUser = m.sender === 'user'
            return (
              <div key={m.id} className={cn("flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300", isUser ? "flex-row-reverse" : "flex-row")}>
                <div className={cn(
                  "w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center shadow-sm border",
                  isBot ? "bg-white border-zinc-100 text-brand" : "bg-zinc-900 border-zinc-800 text-white"
                )}>
                  {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>

                <div className={cn("max-w-[85%] space-y-2", isUser ? "items-end text-right" : "items-start")}>
                  {m.type === 'text' && (
                    <div className={cn(
                      "px-5 py-3 rounded-3xl text-sm leading-relaxed shadow-sm border text-left",
                      isBot ? "bg-zinc-50 border-zinc-100 text-zinc-700 rounded-tl-none" : "bg-brand text-white border-brand/10 rounded-tr-none font-medium"
                    )}>
                      {m.content as string}
                    </div>
                  )}

                  {m.type === 'suggestions' && (
                    <div className="space-y-4 text-left">
                      <div className="px-5 py-3 rounded-3xl bg-zinc-50 border border-zinc-100 text-zinc-700 rounded-tl-none text-sm leading-relaxed">
                        {m.content as string}
                      </div>
                      <div className="grid gap-2">
                        {aiSuggestions.map((s, i) => (
                          <div key={i} className="flex gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl text-sm text-blue-900 font-medium">
                            <span className="w-5 h-5 rounded-lg bg-brand text-white flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</span>
                            {s}
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={handleSolutionResolved} className="flex-1 px-4 py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-all active:scale-95 shadow-lg shadow-green-600/10">Resolvido!</button>
                        <button onClick={handleSolutionFailed} className="flex-1 px-4 py-2.5 bg-zinc-900 text-white text-xs font-bold rounded-xl hover:bg-zinc-800 transition-all active:scale-95">Não resolveu</button>
                      </div>
                    </div>
                  )}

                  {m.type === 'dept-select' && (
                    <div className="space-y-4 text-left">
                      <div className="px-5 py-3 rounded-3xl bg-zinc-50 border border-zinc-100 text-zinc-700 rounded-tl-none text-sm leading-relaxed">
                        {m.content as string}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {departments.filter(d => d.active).map(d => (
                          <button key={d.id} onClick={() => handleDeptSelect(d.id)} className="px-4 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-600 hover:border-brand hover:text-brand hover:bg-brand/5 transition-all shadow-sm">
                            {d.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {m.type === 'success' && (
                    <div className="p-6 bg-green-50 border border-green-100 rounded-3xl rounded-tl-none space-y-4 text-left">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="text-sm font-black uppercase tracking-tight">Chamado Protocolado!</span>
                      </div>
                      <div className="bg-white/60 p-4 rounded-2xl space-y-2">
                        <p className="text-xs font-bold text-green-900">{(m.content as SuccessContent).title}</p>
                        <div className="flex items-center gap-2 text-[10px] text-green-700 font-bold opacity-70">
                          <Tag className="w-3.5 h-3.5" /> {(m.content as SuccessContent).pType}
                        </div>
                      </div>
                      <button onClick={() => navigate(`/app/helpdesk/chamado-usuario/${(m.content as SuccessContent).ticketId}`)} className="w-full py-3 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-green-600/20">
                        Ver Chamado <ChevronRight className="w-4 h-4 inline ml-1" />
                      </button>
                    </div>
                  )}

                  <span className="text-[9px] font-bold text-zinc-300 uppercase tracking-widest px-1 block">
                    {m.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )
          })}

          {isBotTyping && (
            <div className="flex gap-4 animate-in fade-in duration-300">
              <div className="w-10 h-10 rounded-2xl bg-white border border-zinc-100 flex items-center justify-center text-brand shadow-sm"><Bot className="w-5 h-5" /></div>
              <div className="bg-zinc-50 border border-zinc-100 px-5 py-3 rounded-3xl rounded-tl-none flex gap-1 items-center">
                <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" />
                <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white border-t border-zinc-100">
          <div className="max-w-3xl mx-auto relative">
            <textarea 
              value={userInput}
              onChange={e => setUserInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
              placeholder="O que está acontecendo? (Ex: Minha internet parou...)"
              className="w-full min-h-25 p-6 pr-16 bg-zinc-50 border-2 border-zinc-100 rounded-[32px] focus:bg-white focus:border-brand/30 outline-none transition-all resize-none text-base"
            />
            <button 
              disabled={!userInput.trim() || isBotTyping}
              onClick={handleSend}
              className="absolute right-6 bottom-6 p-1 text-zinc-400 hover:text-brand disabled:opacity-20 transition-colors active:scale-90"
            >
              {isBotTyping ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Send className={cn("w-6 h-6", userInput.trim() && "text-brand")} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT: SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-95 p-8 space-y-10 bg-white h-full overflow-y-auto shrink-0 border-l border-zinc-100">
        
        {/* RECENT TICKETS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Chamados Recentes</h3>
            <button onClick={() => navigate('/app/helpdesk/meus-chamados')} className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline">Ver Todos</button>
          </div>
          <div className="space-y-2">
            {tickets.slice(0, 3).map(t => (
              <button key={t.id} onClick={() => navigate(`/app/helpdesk/chamado-usuario/${t.id}`)} className="w-full p-3 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center gap-3 hover:bg-white hover:border-brand/30 hover:shadow-md transition-all text-left group">
                <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", t.status === 'CLOSED' ? "bg-zinc-300" : "bg-brand")} />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-bold text-zinc-800 truncate uppercase tracking-tight">{t.title}</p>
                  <p className="text-[9px] font-bold text-zinc-400 mt-0.5 uppercase">{formatRelativeTime(t.openedAt)}</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-brand" />
              </button>
            ))}
          </div>
        </section>

        <div className="space-y-6 flex-1 flex flex-col justify-end">
          {/* DYNAMIC TIPS */}
          <section className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:rotate-12 transition-transform"><Sparkles className="w-12 h-12 text-brand" /></div>
            <div className="relative z-10 space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Dica NexOps</h4>
              </div>
              <p className="text-xs font-bold leading-relaxed text-zinc-600 italic">"{currentTip}"</p>
            </div>
          </section>

          {/* MANUAL BUTTON (Highlighted) */}
          <div className="pt-6">
            <button 
              onClick={() => navigate('/app/helpdesk/novo')}
              className="w-full py-5 px-6 bg-blue-50 border-2 border-blue-100 text-brand rounded-[28px] flex flex-col items-center justify-center gap-2 hover:bg-brand hover:text-white hover:border-brand transition-all shadow-sm active:scale-[0.98] group"
            >
              <PlusCircle className="w-7 h-7 transition-transform group-hover:rotate-90 duration-300" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Abrir Chamado Manual</span>
            </button>
            <p className="text-[9px] text-center text-zinc-400 mt-4 font-medium px-4 leading-relaxed uppercase tracking-tighter">Pule a triagem por IA e preencha o formulário completo.</p>
          </div>
        </div>

      </aside>

    </div>
  )
}
