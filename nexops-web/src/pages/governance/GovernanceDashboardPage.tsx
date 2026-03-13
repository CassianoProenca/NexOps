// [ROLE: MANAGER, ADMIN]

import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ComposedChart, Area, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, PieChart, Pie, Cell, Line
} from 'recharts'
import {
  CalendarDays, Trophy, TrendingUp, Clock, ChevronRight, 
  Sparkles, Target, BarChart3, Activity, AlertTriangle,
  Send, Bot, User, Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from '@/lib/utils'
import { useGovernanceDashboard } from '@/hooks/governance/useGovernance'
import { useGenerateReport } from '@/hooks/ai/useAi'

// ── Helpers ───────────────────────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-zinc-200 p-3 rounded-lg shadow-xl shadow-zinc-200/50">
        <p className="text-[10px] font-bold text-zinc-400 mb-2 uppercase tracking-widest border-b border-zinc-100 pb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-6 py-0.5">
            <span className="text-[10px] font-bold text-zinc-500 uppercase">{entry.name}:</span>
            <span className="text-xs font-black" style={{ color: entry.color }}>
              {entry.value}{entry.name === 'SLA' ? '%' : ''}
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

// ── Chat Components ─────────────────────────────────────────────────────────

interface ChatMessage {
  role: 'bot' | 'user'
  text: string
}

function AiChatSheet({ metrics, period }: { metrics: any, period: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const { generate, isLoading } = useGenerateReport()
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (messages.length === 0) {
      handleInitialReport()
    }
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  async function handleInitialReport() {
    const metricsSummary = metrics ? `SLA: ${metrics.slaCompliancePercent}%, Total: ${metrics.totalTickets}, Abertos: ${metrics.openTickets}, Em Curso: ${metrics.inProgressTickets}, Finalizados: ${metrics.closedTickets}` : 'Dados não disponíveis'
    try {
      const res = await generate({ period, metricsData: metricsSummary })
      setMessages([{ role: 'bot', text: res.report }])
    } catch (err) {
      setMessages([{ role: 'bot', text: 'Desculpe, tive um problema ao gerar o relatório inicial.' }])
    }
  }

  async function handleSendMessage() {
    if (!input.trim() || isLoading) return
    const userText = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userText }])

    const metricsSummary = metrics ? `SLA: ${metrics.slaCompliancePercent}%, Total: ${metrics.totalTickets}, Abertos: ${metrics.openTickets}, Em Curso: ${metrics.inProgressTickets}, Finalizados: ${metrics.closedTickets}` : 'Dados não disponíveis'

    try {
      const res = await generate({ 
        period, 
        metricsData: `PERGUNTA DO USUÁRIO: ${userText}\n\nCONTEXTO DAS MÉTRICAS:\n${metricsSummary}` 
      })
      setMessages(prev => [...prev, { role: 'bot', text: res.report }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Tive um erro ao processar sua pergunta.' }])
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-zinc-50/30 font-sans">
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((m, i) => (
          <div key={i} className={cn("flex gap-3", m.role === 'user' ? "flex-row-reverse" : "flex-row")}>
            <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border", 
              m.role === 'bot' ? "bg-brand/10 border-brand/20 text-brand" : "bg-white border-zinc-200 text-zinc-500")}>
              {m.role === 'bot' ? <Bot className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
            </div>
            <div className={cn("max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed shadow-sm border",
              m.role === 'bot' ? "bg-white border-zinc-100 text-zinc-700 rounded-tl-none" : "bg-brand text-white border-brand/10 rounded-tr-none font-medium")}>
              {m.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-white border border-zinc-100 px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center shadow-sm">
              <div className="w-1 h-1 bg-brand rounded-full animate-bounce" />
              <div className="w-1 h-1 bg-brand rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1 h-1 bg-brand rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="p-4 bg-white border-t border-zinc-100">
        <div className="relative">
          <textarea 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
            placeholder="Dúvidas sobre o SLA ou performance?"
            className="w-full min-h-20 p-4 pr-12 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:bg-white focus:border-brand/30 outline-none transition-all resize-none text-sm"
          />
          <button 
            disabled={!input.trim() || isLoading}
            onClick={handleSendMessage}
            className="absolute right-3 bottom-3 p-2 text-zinc-400 hover:text-brand disabled:opacity-20 transition-all active:scale-90"
          >
            <Send className={cn("w-5 h-5", input.trim() && "text-brand")} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function GovernanceDashboardPage() {
  const navigate = useNavigate()
  const [dateFrom, setDateFrom] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10))
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10))
  
  const { data: metrics } = useGovernanceDashboard(dateFrom, dateTo)

  const kpis = useMemo(() => {
    if (!metrics) return { sla: 0, total: 0, tmr: '0h 0m', breach: 0 }
    const tmr = metrics.avgResolutionMinutes ?? 0
    return {
      sla: Math.round(metrics.slaCompliancePercent),
      total: metrics.totalTickets,
      tmr: `${Math.floor(tmr / 60)}h ${Math.round(tmr % 60)}m`,
      breach: metrics.slaBreachCount
    }
  }, [metrics])

  const statusData = useMemo(() => [
    { name: 'Abertos', value: metrics?.openTickets || 0, color: '#4f6ef7' },
    { name: 'Em Curso', value: metrics?.inProgressTickets || 0, color: '#f59e0b' },
    { name: 'Finalizados', value: metrics?.closedTickets || 0, color: '#22c55e' },
  ], [metrics])

  const chartData = useMemo(() => {
    if (!metrics?.timeSeries) return []
    return metrics.timeSeries.map(p => ({
      name: new Date(p.date).toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
      tickets: p.tickets,
      sla: Math.round(p.slaCompliance)
    }))
  }, [metrics])

  const categoryRanking = useMemo(() => {
    if (!metrics?.slaComplianceByProblemType) return []
    return Object.entries(metrics.slaComplianceByProblemType)
      .map(([name, sla]) => ({
        label: name,
        val: Math.round(sla),
        count: metrics.ticketsByProblemType[name] || 0
      }))
      .sort((a, b) => b.val - a.val)
  }, [metrics])

  const techRanking = useMemo(() => {
    if (!metrics?.slaComplianceByTechnician) return []
    return Object.entries(metrics.slaComplianceByTechnician)
      .map(([name, sla]) => ({
        name,
        sla: Math.round(sla),
        res: metrics.ticketsByTechnician[name] || 0,
        img: name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        id: metrics.technicianIds?.[name] ?? null,
      }))
      .sort((a, b) => b.sla - a.sla)
  }, [metrics])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-[#f5f5f5] overflow-hidden font-sans">
      
      {/* ── HEADER ── */}
      <header className="px-8 py-5 border-b border-zinc-200 flex items-center justify-between shrink-0 bg-white z-20">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-brand/5 flex items-center justify-center text-brand border border-brand/10">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-zinc-900 uppercase tracking-tighter">Governança & Performance</h1>
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Painel Analítico Operacional</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg shadow-sm">
            <CalendarDays className="w-3.5 h-3.5 text-zinc-400" />
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="text-[10px] font-bold uppercase outline-none text-zinc-600 bg-transparent" />
            <span className="text-zinc-300">/</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="text-[10px] font-bold uppercase outline-none text-zinc-600 bg-transparent" />
          </div>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button className="bg-zinc-900 hover:bg-black text-white px-4 py-2 rounded-lg font-black uppercase tracking-widest text-[9px] shadow-sm transition-all flex items-center gap-2">
                <Sparkles className="w-3 h-3 text-brand" />
                Relatório IA
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="p-0 flex flex-col sm:max-w-md border-l border-zinc-200 shadow-2xl">
              <SheetHeader className="p-6 border-b border-zinc-100 shrink-0 bg-white">
                <SheetTitle className="text-sm font-black uppercase tracking-tighter flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand" /> NexOps AI Analyst
                </SheetTitle>
              </SheetHeader>
              <AiChatSheet metrics={metrics} period={`${dateFrom} a ${dateTo}`} />
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        
        {/* ROW 1: KPI CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'SLA Cumprido', val: `${kpis.sla}%`, sub: 'Meta > 85%', dot: '#4f6ef7' },
            { label: 'Volumetria Total', val: kpis.total, sub: 'Chamados abertos', dot: '#1a1a2e' },
            { label: 'TMR Médio', val: kpis.tmr, sub: 'Resolução final', dot: '#1a1a2e' },
            { label: 'Breaches', val: kpis.breach, sub: 'Ação imediata', dot: '#ef4444' },
          ].map((k, i) => (
            <div key={i} className="bg-white border border-zinc-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: k.dot }} />
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{k.label}</p>
              </div>
              <p className="text-2xl font-black text-zinc-900 tracking-tighter leading-none">{k.val}</p>
              <p className="text-[9px] font-bold text-zinc-400 uppercase mt-1 opacity-60">{k.sub}</p>
            </div>
          ))}
        </section>

        {/* ROW 2: MAIN CHARTS */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col h-105">
            <div className="flex items-center justify-between mb-8 shrink-0">
              <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest">Histórico de Eficiência</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-brand" /><span className="text-[9px] font-black text-zinc-400 uppercase">SLA%</span></div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-zinc-100 border border-zinc-200" /><span className="text-[9px] font-black text-zinc-400 uppercase">Volume</span></div>
              </div>
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ left: -20, bottom: 0, top: 0, right: 10 }}>
                  <defs>
                    <linearGradient id="colorSla" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f6ef7" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f6ef7" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#aaa'}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#aaa'}} />
                  <RTooltip content={<CustomTooltip />} />
                  <Bar dataKey="tickets" name="Volume" fill="#f0f0f0" radius={[4, 4, 0, 0]} maxBarSize={30} />
                  <Area type="monotone" dataKey="sla" name="SLA" stroke="#4f6ef7" strokeWidth={3} fill="url(#colorSla)" />
                  <Line type="monotone" dataKey="sla" stroke="#4f6ef7" strokeWidth={3} dot={{ r: 3, fill: '#fff', stroke: '#4f6ef7', strokeWidth: 2 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Status Donut Fixed */}
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm flex flex-col h-105">
            <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest mb-4 shrink-0">Distribuição de Status</h3>
            
            <div className="flex-1 flex flex-col items-center justify-center min-h-0 pt-2">
              <div className="relative w-full h-45 flex items-center justify-center shrink-0">
                <div className="absolute flex flex-col items-center justify-center pointer-events-none text-center z-10">
                  <span className="text-[9px] font-black text-zinc-300 uppercase tracking-widest">Total</span>
                  <span className="text-3xl font-black text-zinc-900 tracking-tighter leading-none">{kpis.total}</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={statusData} 
                      innerRadius={55} 
                      outerRadius={75} 
                      paddingAngle={5} 
                      dataKey="value" 
                      stroke="none"
                      cx="50%"
                      cy="50%"
                    >
                      {statusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="w-full mt-auto space-y-2 pt-4">
                {statusData.map(d => (
                  <div key={d.name} className="flex items-center justify-between p-3 bg-white border border-zinc-100 rounded-xl shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{background: d.color}} />
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{d.name}</span>
                    </div>
                    <span className="text-xs font-black text-zinc-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ROW 3: CATEGORY & TECH RANKING */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest mb-8 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-zinc-400" /> Conformidade por Categoria
            </h3>
            <div className="space-y-6">
              {categoryRanking.length > 0 ? categoryRanking.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{item.label}</span>
                    <span className="text-[10px] font-black text-zinc-900">{item.val}% SLA <span className="text-zinc-300 ml-1">({item.count})</span></span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-1000", item.val > 90 ? "bg-brand" : item.val > 80 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${item.val}%` }} />
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
                  <Activity className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Sem dados no período</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-[11px] font-black text-zinc-900 uppercase tracking-widest mb-8 flex items-center justify-between">
              <div className="flex items-center gap-2"><Trophy className="w-4 h-4 text-amber-500" /> Performance dos Técnicos</div>
              <ChevronRight className="w-4 h-4 text-zinc-300" />
            </h3>
            <div className="space-y-1">
              {techRanking.length > 0 ? techRanking.map((t, idx) => (
                <div key={idx} className="flex items-center gap-4 py-3 px-3 rounded-lg hover:bg-zinc-50 transition-colors" style={t.id ? { cursor: 'pointer' } : undefined} onClick={() => t.id && navigate(`/app/governance/technicians/${t.id}`, { state: { name: t.name } })}>
                  <span className={cn("text-[10px] font-black w-4", idx === 0 ? "text-amber-500" : "text-zinc-300")}>{idx + 1}</span>
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-500 border border-zinc-200 uppercase">{t.img}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-zinc-800 uppercase truncate tracking-tight">{t.name}</p>
                    <p className="text-[9px] font-bold text-zinc-400 uppercase">{t.res} resolvidos</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-brand tracking-tighter">{t.sla}%</p>
                    <p className="text-[8px] font-black text-zinc-300 uppercase">SLA</p>
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
                  <Trophy className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">Sem performance registrada</p>
                </div>
              )}
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
