import { useState } from 'react'
import { Save, Trash2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { useSlaConfigs, useUpdateSlaConfig } from '@/hooks/governance/useGovernance'

// ── Types ─────────────────────────────────────────────────────────────────────

interface LevelConfig {
  id: string
  response: number    // hours
  resolution: number  // hours
  notifyAt: number    // percent
}

interface DepartmentRow {
  id: number
  name: string
  n1: { response: number; resolution: number }
  n2: { response: number; resolution: number }
  n3: { response: number; resolution: number }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const LEVEL_META = {
  N1: { label: 'N1', color: 'bg-blue-100 text-blue-700',   desc: 'Primeiro atendimento'      },
  N2: { label: 'N2', color: 'bg-amber-100 text-amber-700', desc: 'Suporte especializado'     },
  N3: { label: 'N3', color: 'bg-red-100 text-red-700',     desc: 'Escalado / Hardware'        },
}

function minutesToHours(min: number) { return Math.round(min / 60) }
function hoursToMinutes(h: number)   { return h * 60 }

function NumInput({
  value,
  onChange,
  compact = false,
}: {
  value: number
  onChange: (v: number) => void
  compact?: boolean
}) {
  return (
    <div className={`flex items-center gap-1 ${compact ? 'w-20' : 'w-full'}`}>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
        className={`border border-zinc-200 rounded-md text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] transition-colors
          ${compact ? 'h-8 text-xs px-2 w-14' : 'h-9 text-sm px-3 w-full'}`}
      />
      <span className={`text-zinc-400 shrink-0 ${compact ? 'text-xs' : 'text-sm'}`}>h</span>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
// [ROLE: ADMIN]

export default function SLAConfigPage() {
  const { data: slaConfigs = [] } = useSlaConfigs()
  const updateSlaConfig = useUpdateSlaConfig()

  // Build initial levels from API data (first config per level)
  function buildInitialLevels(): Record<'N1' | 'N2' | 'N3', LevelConfig> {
    const defaults: Record<'N1' | 'N2' | 'N3', LevelConfig> = {
      N1: { id: '', response: 2,  resolution: 8,  notifyAt: 80 },
      N2: { id: '', response: 4,  resolution: 24, notifyAt: 80 },
      N3: { id: '', response: 8,  resolution: 72, notifyAt: 80 },
    }
    for (const cfg of slaConfigs) {
      const lvl = cfg.slaLevel as 'N1' | 'N2' | 'N3'
      if (!defaults[lvl].id) {
        defaults[lvl] = {
          id:         cfg.id,
          response:   minutesToHours(cfg.responseMinutes),
          resolution: minutesToHours(cfg.resolutionMinutes),
          notifyAt:   cfg.notifyManagerAtPercent,
        }
      }
    }
    return defaults
  }

  // Editable local state: one entry per SLA level
  const [levels, setLevels] = useState<Record<'N1' | 'N2' | 'N3', LevelConfig>>(buildInitialLevels)

  // Departament exceptions — local only, no backend endpoint
  const [departments, setDepartments] = useState<DepartmentRow[]>([])

  const [notify80,      setNotify80]      = useState(true)
  const [notifyBreach,  setNotifyBreach]  = useState(true)
  const [dailyReport,   setDailyReport]   = useState(false)

  function updateLevel(level: 'N1' | 'N2' | 'N3', field: keyof LevelConfig, value: number | string) {
    setLevels((prev) => ({ ...prev, [level]: { ...prev[level], [field]: value } }))
  }

  function updateDept(id: number, level: 'n1' | 'n2' | 'n3', field: 'response' | 'resolution', value: number) {
    setDepartments((prev) =>
      prev.map((d) => d.id === id ? { ...d, [level]: { ...d[level], [field]: value } } : d)
    )
  }

  function removeDept(id: number) {
    setDepartments((prev) => prev.filter((d) => d.id !== id))
  }

  async function handleSave() {
    const promises: Promise<unknown>[] = []
    for (const lvl of ['N1', 'N2', 'N3'] as const) {
      const cfg = levels[lvl]
      if (!cfg.id) continue
      promises.push(
        new Promise<void>((resolve, reject) =>
          updateSlaConfig.mutate(
            {
              id: cfg.id,
              data: {
                responseMinutes:        hoursToMinutes(cfg.response),
                resolutionMinutes:      hoursToMinutes(cfg.resolution),
                notifyManagerAtPercent: cfg.notifyAt,
              },
            },
            { onSuccess: () => resolve(), onError: reject }
          )
        )
      )
    }
    await Promise.allSettled(promises)
  }

  return (
    <div className="p-8 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
            <span>Governança</span>
            <span className="text-zinc-300">/</span>
            <span className="text-[#4f6ef7]">Configuração de SLA</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 mt-1">
            Configuração de SLA
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Defina os tempos de atendimento por nível e departamento
          </p>
        </div>

        <Button
          className="bg-[#4f6ef7] hover:bg-[#3d5de6] text-white gap-2 shrink-0"
          onClick={handleSave}
          disabled={updateSlaConfig.isPending}
        >
          <Save className="h-4 w-4" />
          {updateSlaConfig.isPending ? 'Salvando…' : 'Salvar alterações'}
        </Button>
      </div>

      {/* ── Seção 1 — Tempos por Nível ── */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-5">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
          Tempos por Nível
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {(['N1', 'N2', 'N3'] as const).map((lvl) => {
            const meta = LEVEL_META[lvl]
            return (
              <div key={lvl} className="rounded-lg border border-zinc-200 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className={`${meta.color} hover:${meta.color} font-bold`}>{meta.label}</Badge>
                  <span className="text-xs text-zinc-500">{meta.desc}</span>
                </div>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Tempo de primeira resposta
                    </label>
                    <NumInput
                      value={levels[lvl].response}
                      onChange={(v) => updateLevel(lvl, 'response', v)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                      Tempo de resolução
                    </label>
                    <NumInput
                      value={levels[lvl].resolution}
                      onChange={(v) => updateLevel(lvl, 'resolution', v)}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Seção 2 — Exceções por Departamento ── */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <div className="p-6 border-b border-zinc-100 space-y-0.5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
            Exceções por Departamento
          </h2>
          <p className="text-xs text-zinc-400">
            Departamentos sem configuração específica herdam os tempos padrão por nível.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-zinc-100 bg-zinc-50/60">
                <th className="text-left px-5 py-3 font-semibold uppercase tracking-wider text-zinc-400 min-w-40">
                  Departamento
                </th>
                {(['N1', 'N2', 'N3'] as const).map((lvl) => (
                  <>
                    <th key={`${lvl}-resp`} className="text-center px-3 py-3 font-semibold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1`}>
                        <span className={`font-bold ${lvl === 'N1' ? 'text-blue-600' : lvl === 'N2' ? 'text-amber-600' : 'text-red-600'}`}>{lvl}</span>
                        Resposta (h)
                      </span>
                    </th>
                    <th key={`${lvl}-res`} className="text-center px-3 py-3 font-semibold uppercase tracking-wider text-zinc-400 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1`}>
                        <span className={`font-bold ${lvl === 'N1' ? 'text-blue-600' : lvl === 'N2' ? 'text-amber-600' : 'text-red-600'}`}>{lvl}</span>
                        Resolução (h)
                      </span>
                    </th>
                  </>
                ))}
                <th className="text-center px-3 py-3 font-semibold uppercase tracking-wider text-zinc-400">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, i) => (
                <tr
                  key={dept.id}
                  className={`border-b border-zinc-100 last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-zinc-50/40'}`}
                >
                  <td className="px-5 py-3 font-medium text-zinc-700">{dept.name}</td>

                  {/* N1 */}
                  <td className="px-3 py-3">
                    <NumInput compact value={dept.n1.response}   onChange={(v) => updateDept(dept.id, 'n1', 'response',   v)} />
                  </td>
                  <td className="px-3 py-3">
                    <NumInput compact value={dept.n1.resolution} onChange={(v) => updateDept(dept.id, 'n1', 'resolution', v)} />
                  </td>

                  {/* N2 */}
                  <td className="px-3 py-3">
                    <NumInput compact value={dept.n2.response}   onChange={(v) => updateDept(dept.id, 'n2', 'response',   v)} />
                  </td>
                  <td className="px-3 py-3">
                    <NumInput compact value={dept.n2.resolution} onChange={(v) => updateDept(dept.id, 'n2', 'resolution', v)} />
                  </td>

                  {/* N3 */}
                  <td className="px-3 py-3">
                    <NumInput compact value={dept.n3.response}   onChange={(v) => updateDept(dept.id, 'n3', 'response',   v)} />
                  </td>
                  <td className="px-3 py-3">
                    <NumInput compact value={dept.n3.resolution} onChange={(v) => updateDept(dept.id, 'n3', 'resolution', v)} />
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-3 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-zinc-400 hover:text-red-500 hover:bg-red-50"
                      onClick={() => removeDept(dept.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-zinc-100">
          <Button variant="ghost" size="sm" className="gap-2 text-zinc-500 hover:text-[#4f6ef7]">
            <Plus className="h-4 w-4" />
            Adicionar departamento
          </Button>
        </div>
      </div>

      {/* ── Seção 3 — Notificações ── */}
      <div className="rounded-xl border border-zinc-200 bg-white p-6 space-y-5">
        <div className="space-y-0.5">
          <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
            Alertas Proativos
          </h2>
          <p className="text-xs text-zinc-400">
            Visível apenas para perfis com permissão REPORT_VIEW_ALL.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4 py-3 border-b border-zinc-100">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-zinc-700">
                Notificar gestor ao atingir 80% do tempo de SLA
              </p>
              <p className="text-xs text-zinc-400">
                Envia alerta quando restam 20% do prazo acordado
              </p>
            </div>
            <Switch checked={notify80} onCheckedChange={setNotify80} />
          </div>

          <div className="flex items-start justify-between gap-4 py-3 border-b border-zinc-100">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-zinc-700">
                Notificar gestor ao breach de SLA
              </p>
              <p className="text-xs text-zinc-400">
                Envia alerta imediato quando o prazo é ultrapassado
              </p>
            </div>
            <Switch checked={notifyBreach} onCheckedChange={setNotifyBreach} />
          </div>

          <div className="flex items-start justify-between gap-4 py-3">
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-zinc-700">
                Enviar resumo diário de performance
              </p>
              <p className="text-xs text-zinc-400">
                E-mail consolidado com indicadores do dia anterior
              </p>
            </div>
            <Switch checked={dailyReport} onCheckedChange={setDailyReport} />
          </div>
        </div>

        <p className="text-xs text-zinc-400 pt-1 border-t border-zinc-100">
          As notificações são enviadas por e-mail. Requer SMTP configurado.
        </p>
      </div>

    </div>
  )
}
