// [ROLE: ADMIN, MANAGER]

import { useState, useMemo } from 'react'
import { 
  Save, Trash2, Plus, Clock, ShieldCheck, 
  Building2, AlertCircle, ChevronRight, ChevronLeft,
  Settings2, BellRing, Zap, Filter
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useSlaConfigs, useUpdateSlaConfig } from '@/hooks/governance/useGovernance'

// ── Types ─────────────────────────────────────────────────────────────────────

interface LevelConfig {
  id: string
  response: number
  resolution: number
}

interface CustomRule {
  id: string
  name: string
  condition: string
  action: string
  active: boolean
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const LEVEL_META = {
  N1: { label: 'NÍVEL 1', color: 'text-blue-600', desc: 'Suporte de Primeiro Nível (Triagem e Problemas Comuns)' },
  N2: { label: 'NÍVEL 2', color: 'text-amber-600', desc: 'Suporte Técnico Especializado' },
  N3: { label: 'NÍVEL 3', color: 'text-red-600', desc: 'Alta Complexidade / Engenharia / Hardware' },
}

const MOCK_RULES: CustomRule[] = [
  { id: '1', name: 'Alerta Diretor (Crítico)', condition: 'Se Prioridade = Crítica e Tempo > 1h', action: 'Notificar Diretor TI', active: true },
  { id: '2', name: 'Escalonamento Automático', condition: 'Se Tempo Resposta > 4h', action: 'Mover para N2', active: true },
  { id: '3', name: 'Aviso Cliente VIP', condition: 'Se Cliente = VIP e Status = Aberto', action: 'Email de Boas Vindas', active: false },
]

function NumInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
        className="w-20 h-10 bg-zinc-50 border border-zinc-200 rounded-xl px-3 text-sm font-black text-zinc-900 focus:bg-white focus:border-brand/30 outline-none transition-all"
      />
      <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">horas</span>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

export default function SLAConfigPage() {
  const { data: slaConfigs = [] } = useSlaConfigs()
  const updateSlaConfig = useUpdateSlaConfig()

  // Níveis
  const [levels, setLevels] = useState<Record<'N1' | 'N2' | 'N3', LevelConfig>>({
    N1: { id: '', response: 2, resolution: 8 },
    N2: { id: '', response: 4, resolution: 24 },
    N3: { id: '', response: 8, resolution: 72 },
  })

  // Regras
  const [rules, setRules] = useState<CustomRule[]>(MOCK_RULES)
  const [page, setPage] = useState(1)
  const rulesPerPage = 3
  const totalPages = Math.ceil(rules.length / rulesPerPage)
  const paginatedRules = rules.slice((page - 1) * rulesPerPage, page * rulesPerPage)

  const handleUpdateLevel = (lvl: 'N1' | 'N2' | 'N3', field: keyof LevelConfig, val: number) => {
    setLevels(prev => ({ ...prev, [lvl]: { ...prev[lvl], [field]: val } }))
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden font-sans">
      
      {/* ── HEADER ── */}
      <header className="px-10 py-6 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white shadow-sm z-10">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-1">
            <Settings2 className="w-3 h-3 text-brand" /> Parâmetros de Governança
          </div>
          <h1 className="text-xl font-black text-zinc-900 tracking-tight uppercase">Configurações de SLA</h1>
        </div>

        <Button className="bg-brand hover:bg-brand/90 text-white px-8 py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-lg shadow-brand/20 transition-all active:scale-95">
          <Save className="w-4 h-4 mr-2" /> Salvar Tudo
        </Button>
      </header>

      {/* ── CONTENT ── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-5xl mx-auto p-10 space-y-16">
          
          {/* SEÇÃO 1: NÍVEIS DE ATENDIMENTO (LISTA ALINHADA) */}
          <section className="space-y-8">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-zinc-400" />
              <h2 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.3em]">Tempos Padrão por Nível</h2>
            </div>

            <div className="space-y-0 border border-zinc-100 rounded-[32px] overflow-hidden">
              {(['N1', 'N2', 'N3'] as const).map((lvl, idx) => {
                const meta = LEVEL_META[lvl]
                return (
                  <div key={lvl} className={cn("p-8 flex items-center gap-12 group transition-colors", idx !== 2 && "border-b border-zinc-50")}>
                    <div className="w-32 shrink-0">
                      <span className={cn("text-xs font-black tracking-widest", meta.color)}>{meta.label}</span>
                      <p className="text-[9px] font-bold text-zinc-400 mt-1 uppercase leading-tight">{meta.desc}</p>
                    </div>
                    
                    <div className="flex-1 flex items-center gap-16">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Resposta Inicial</label>
                        <NumInput value={levels[lvl].response} onChange={v => handleUpdateLevel(lvl, 'response', v)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Resolução Final</label>
                        <NumInput value={levels[lvl].resolution} onChange={v => handleUpdateLevel(lvl, 'resolution', v)} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-black text-zinc-400 uppercase">Status: Ativo</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <Separator className="bg-zinc-100" />

          {/* SEÇÃO 2: REGRAS DE ESCALONAMENTO (LISTA PAGINADA) */}
          <section className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-zinc-400" />
                <h2 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.3em]">Regras de Escalonamento e Alerta</h2>
              </div>
              <Button variant="ghost" className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline hover:bg-brand/5">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Adicionar Regra
              </Button>
            </div>

            <div className="border border-zinc-100 rounded-[32px] overflow-hidden bg-zinc-50/30">
              <div className="divide-y divide-zinc-100">
                {paginatedRules.map((rule) => (
                  <div key={rule.id} className="p-8 flex items-center justify-between bg-white hover:bg-zinc-50/50 transition-colors">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center text-brand">
                        <BellRing className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-tight">{rule.name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[10px] font-medium text-zinc-500 italic">"{rule.condition}"</span>
                          <ChevronRight className="w-3 h-3 text-zinc-300" />
                          <span className="text-[10px] font-black text-brand uppercase">{rule.action}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{rule.active ? 'Ativa' : 'Pausada'}</span>
                        <Switch checked={rule.active} onCheckedChange={() => {}} className="data-[state=checked]:bg-brand scale-75" />
                      </div>
                      <button className="p-2 text-zinc-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Paginação da Lista de Regras */}
              <div className="px-8 py-4 bg-white border-t border-zinc-100 flex items-center justify-between">
                <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Página {page} de {totalPages}</p>
                <div className="flex items-center gap-2">
                  <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="p-2 text-zinc-400 hover:text-brand disabled:opacity-20"><ChevronLeft className="w-4 h-4" /></button>
                  <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="p-2 text-zinc-400 hover:text-brand disabled:opacity-20"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          </section>

          <Separator className="bg-zinc-100" />

          {/* SEÇÃO 3: EXCEÇÕES POR DEPARTAMENTO */}
          <section className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-zinc-400" />
                <h2 className="text-[11px] font-black text-zinc-900 uppercase tracking-[0.3em]">Exceções por Departamento</h2>
              </div>
              <Button variant="ghost" className="text-[10px] font-black text-brand uppercase tracking-widest hover:underline hover:bg-brand/5">
                <Plus className="w-3.5 h-3.5 mr-1.5" /> Adicionar Departamento
              </Button>
            </div>

            <div className="p-12 border-2 border-dashed border-zinc-100 rounded-[40px] flex flex-col items-center justify-center text-center gap-4 group hover:border-brand/30 transition-all">
              <div className="w-16 h-16 rounded-[24px] bg-zinc-50 flex items-center justify-center text-zinc-300 group-hover:bg-brand/5 group-hover:text-brand transition-all">
                <Filter className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-black text-zinc-900 uppercase tracking-tight">Nenhuma exceção configurada</p>
                <p className="text-[10px] font-medium text-zinc-400 uppercase mt-1 leading-relaxed">Departamentos sem configuração própria herdam os tempos padrão.</p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  )
}
