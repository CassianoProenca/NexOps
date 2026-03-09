import { useState, useEffect } from 'react'
import { Building2, Clock, Sun, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Mock data ─────────────────────────────────────────────────────────────────

interface OpenTicket {
  id: string
  type: string
  department: string
  openMinutes: number
}

interface ActiveTicket {
  id: string
  type: string
  department: string
  techName: string
  techInitials: string
}

const OPEN_SETS: OpenTicket[][] = [
  [
    { id: '#1042', type: 'Impressora não responde',     department: 'Secretaria de Finanças', openMinutes: 148 },
    { id: '#1039', type: 'VPN sem acesso',              department: 'RH',                    openMinutes: 127 },
    { id: '#1031', type: 'Servidor de arquivos offline', department: 'Saúde',                openMinutes: 95  },
    { id: '#1028', type: 'Monitor com tela piscando',   department: 'Educação',              openMinutes: 74  },
    { id: '#1024', type: 'E-mail não sincroniza',       department: 'Secretaria de Finanças', openMinutes: 52 },
    { id: '#1019', type: 'Teclado sem resposta',        department: 'RH',                    openMinutes: 35  },
    { id: '#1014', type: 'Sistema lento',               department: 'Saúde',                 openMinutes: 18  },
    { id: '#1008', type: 'Reset de senha AD',           department: 'Educação',              openMinutes: 7   },
  ],
  [
    { id: '#1043', type: 'Switch de andar offline',     department: 'Saúde',                 openMinutes: 163 },
    { id: '#1040', type: 'Notebook não liga',           department: 'RH',                    openMinutes: 131 },
    { id: '#1033', type: 'Impressora HP sem toner',     department: 'Educação',              openMinutes: 88  },
    { id: '#1029', type: 'Acesso bloqueado no sistema', department: 'Secretaria de Finanças', openMinutes: 65 },
    { id: '#1025', type: 'HD barulhento',               department: 'RH',                    openMinutes: 47  },
    { id: '#1020', type: 'Mouse sem funcionar',         department: 'Saúde',                 openMinutes: 29  },
    { id: '#1015', type: 'Atualização travada',         department: 'Secretaria de Finanças', openMinutes: 14 },
    { id: '#1009', type: 'Conta sem permissão de rede', department: 'Educação',              openMinutes: 4   },
  ],
]

const ACTIVE_SETS: ActiveTicket[][] = [
  [
    { id: '#1037', type: 'Troca de HD defeituoso',    department: 'Saúde',                 techName: 'Carlos Mendes', techInitials: 'CM' },
    { id: '#1035', type: 'Configuração de VPN',       department: 'RH',                    techName: 'Ana Lima',      techInitials: 'AL' },
    { id: '#1032', type: 'Formatação de workstation', department: 'Educação',              techName: 'Pedro Alves',   techInitials: 'PA' },
    { id: '#1027', type: 'Instalação de software',    department: 'Secretaria de Finanças', techName: 'Carlos Mendes', techInitials: 'CM' },
    { id: '#1021', type: 'Backup de dados',           department: 'Saúde',                 techName: 'Ana Lima',      techInitials: 'AL' },
  ],
  [
    { id: '#1038', type: 'Reinstalação do Windows',   department: 'Educação',              techName: 'Pedro Alves',   techInitials: 'PA' },
    { id: '#1036', type: 'Expansão de memória RAM',   department: 'Secretaria de Finanças', techName: 'Carlos Mendes', techInitials: 'CM' },
    { id: '#1030', type: 'Configuração de e-mail',    department: 'RH',                    techName: 'Ana Lima',      techInitials: 'AL' },
    { id: '#1026', type: 'Troca de cabo de rede',     department: 'Saúde',                 techName: 'Pedro Alves',   techInitials: 'PA' },
    { id: '#1018', type: 'Deploy de atualização',     department: 'Educação',              techName: 'Carlos Mendes', techInitials: 'CM' },
  ],
]

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMinutes(min: number): string {
  if (min < 60) return `${min}min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function timeColorDark(min: number): string {
  if (min > 120) return 'text-red-400'
  if (min >= 60)  return 'text-amber-400'
  return 'text-zinc-400'
}

function timeColorLight(min: number): string {
  if (min > 120) return 'text-red-600'
  if (min >= 60)  return 'text-amber-600'
  return 'text-zinc-400'
}

function zeroPad(n: number): string {
  return String(n).padStart(2, '0')
}

// ── Theme tokens ──────────────────────────────────────────────────────────────

const dark = {
  page:          'bg-zinc-900',
  separator:     'border-zinc-700',
  logoText:      'text-white',
  subtitle:      'text-zinc-400',
  clock:         'text-zinc-300',
  colTitle:      'text-white',
  openBadge:     'bg-zinc-700 text-zinc-300',
  activeBadge:   'bg-blue-900 text-blue-300',
  card:          'bg-zinc-800 border-zinc-700',
  cardId:        'text-zinc-500',
  statusOpen:    'bg-zinc-700 text-zinc-400',
  statusActive:  'bg-blue-900/50 text-blue-400',
  cardTitle:     'text-white',
  cardDept:      'text-zinc-500',
  cardDeptText:  'text-zinc-400',
  techName:      'text-zinc-300',
  footer:        'text-zinc-600',
  footerRight:   'text-zinc-500',
  toggleBtn:     'bg-zinc-800 border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500',
  timeColor:     timeColorDark,
}

const light = {
  page:          'bg-zinc-50',
  separator:     'border-zinc-200',
  logoText:      'text-zinc-900',
  subtitle:      'text-zinc-500',
  clock:         'text-zinc-700',
  colTitle:      'text-zinc-800',
  openBadge:     'bg-zinc-200 text-zinc-600',
  activeBadge:   'bg-blue-100 text-blue-700',
  card:          'bg-white border-zinc-200',
  cardId:        'text-zinc-400',
  statusOpen:    'bg-zinc-100 text-zinc-500',
  statusActive:  'bg-blue-50 text-blue-600',
  cardTitle:     'text-zinc-900',
  cardDept:      'text-zinc-400',
  cardDeptText:  'text-zinc-500',
  techName:      'text-zinc-700',
  footer:        'text-zinc-400',
  footerRight:   'text-zinc-500',
  toggleBtn:     'bg-white border-zinc-200 text-zinc-500 hover:text-zinc-800 hover:border-zinc-300',
  timeColor:     timeColorLight,
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function QueuePanelPage() {
  const [tick,  setTick]  = useState(0)
  const [time,  setTime]  = useState(new Date())
  const [isDark, setIsDark] = useState(false) // light is default

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % 2), 30_000)
    return () => clearInterval(id)
  }, [])

  const openTickets   = OPEN_SETS[tick]
  const activeTickets = ACTIVE_SETS[tick]
  const T = isDark ? dark : light

  const hh = zeroPad(time.getHours())
  const mm = zeroPad(time.getMinutes())
  const ss = zeroPad(time.getSeconds())

  return (
    <div className={cn('h-screen w-screen overflow-hidden flex flex-col p-6 gap-4 font-sans transition-colors duration-300', T.page)}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#4f6ef7] flex items-center justify-center shadow-md">
            <span className="text-white font-bold text-lg leading-none">N</span>
          </div>
          <div>
            <span className={cn('font-bold text-lg tracking-tight', T.logoText)}>NexOps</span>
            <p className={cn('text-xs leading-tight', T.subtitle)}>Painel de Atendimento</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className={cn('text-xl font-mono tracking-widest', T.clock)}>
            {hh}:{mm}:{ss}
          </span>

          {/* Theme toggle */}
          <button
            onClick={() => setIsDark((d) => !d)}
            className={cn(
              'h-8 w-8 rounded-lg border flex items-center justify-center transition-colors duration-200',
              T.toggleBtn
            )}
            title={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
          >
            {isDark
              ? <Sun  className="h-4 w-4" />
              : <Moon className="h-4 w-4" />
            }
          </button>
        </div>
      </div>

      <div className={cn('border-t shrink-0', T.separator)} />

      {/* ── Main grid ── */}
      <div className="grid grid-cols-2 gap-6 flex-1 min-h-0">

        {/* ── Left: Em Aberto ── */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex items-center gap-2 shrink-0">
            <h2 className={cn('font-semibold text-base', T.colTitle)}>Em Aberto</h2>
            <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', T.openBadge)}>
              {openTickets.length}
            </span>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto scrollbar-none">
            {openTickets.map((t) => (
              <div key={t.id} className={cn('border rounded-lg p-4 space-y-1.5 transition-colors duration-300', T.card)}>
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-mono', T.cardId)}>{t.id}</span>
                  <span className={cn('text-xs rounded-full px-2 py-px', T.statusOpen)}>Aberto</span>
                </div>
                <p className={cn('font-medium text-sm', T.cardTitle)}>{t.type}</p>
                <div className="flex items-center gap-1.5">
                  <Building2 className={cn('h-3 w-3 shrink-0', T.cardDept)} />
                  <span className={cn('text-xs', T.cardDeptText)}>{t.department}</span>
                </div>
                <div className={cn('flex items-center gap-1.5', T.timeColor(t.openMinutes))}>
                  <Clock className="h-3 w-3 shrink-0" />
                  <span className="text-xs font-semibold">Aberto há {formatMinutes(t.openMinutes)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Em Andamento ── */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex items-center gap-2 shrink-0">
            <h2 className={cn('font-semibold text-base', T.colTitle)}>Em Andamento</h2>
            <span className={cn('text-xs font-bold px-2 py-0.5 rounded-full', T.activeBadge)}>
              {activeTickets.length}
            </span>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto scrollbar-none">
            {activeTickets.map((t) => (
              <div
                key={t.id}
                className={cn('border border-l-[3px] border-l-[#4f6ef7] rounded-lg p-4 space-y-1.5 transition-colors duration-300', T.card)}
              >
                <div className="flex items-center gap-2">
                  <span className={cn('text-xs font-mono', T.cardId)}>{t.id}</span>
                  <span className={cn('text-xs rounded-full px-2 py-px', T.statusActive)}>Em Andamento</span>
                </div>
                <p className={cn('font-medium text-sm', T.cardTitle)}>{t.type}</p>
                <div className="flex items-center gap-1.5">
                  <Building2 className={cn('h-3 w-3 shrink-0', T.cardDept)} />
                  <span className={cn('text-xs', T.cardDeptText)}>{t.department}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#4f6ef7] flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold leading-none">{t.techInitials}</span>
                  </div>
                  <span className={cn('text-sm', T.techName)}>{t.techName}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <div className={cn('border-t shrink-0', T.separator)} />
      <div className="flex items-center justify-between shrink-0">
        <p className={cn('text-xs', T.footer)}>Atualizado automaticamente · NexOps</p>
        <p className={cn('text-xs', T.footerRight)}>Total hoje: 47 chamados finalizados</p>
      </div>

    </div>
  )
}
