import { useState } from 'react'
import { Ticket, Package, ShieldCheck } from 'lucide-react'

/* ── Paleta compartilhada das telas de auth ── */
export const AUTH = {
  BRAND: '#4f6ef7',
  BRAND_HOVER: '#3d5ce8',
  BRAND_SUBTLE: '#eef0fe',
  TEXT_PRIMARY: '#18181b',
  TEXT_SECONDARY: '#71717a',
  TEXT_MUTED: '#a1a1aa',
  BORDER: '#e4e4e7',
  SURFACE: '#ffffff',
  BG: '#fafafa',
  ERROR: '#dc2626',
  SUCCESS: '#16a34a',
} as const

const pillars = [
  {
    icon: Ticket,
    title: 'Helpdesk Inteligente',
    description: 'Chamados com triagem por IA e chat em tempo real entre técnico e usuário.',
  },
  {
    icon: Package,
    title: 'Controle de Ativos',
    description: 'Inventário completo com histórico de movimentações e alertas de estoque.',
  },
  {
    icon: ShieldCheck,
    title: 'Governança e SLA',
    description: 'Relatórios automáticos e monitoramento de performance por técnico.',
  },
]

/* ── Painel de branding compartilhado ── */
export function AuthLeftPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center px-16"
      style={{ backgroundColor: '#f4f4f5', borderRight: `1px solid ${AUTH.BORDER}` }}
    >
      <div className="max-w-sm w-full">
        <div className="mb-12">
          <h1 className="text-5xl font-bold tracking-tight" style={{ color: AUTH.TEXT_PRIMARY }}>
            Nex<span style={{ color: AUTH.BRAND }}>Ops</span>
          </h1>
          <p className="mt-3 text-lg leading-relaxed" style={{ color: AUTH.TEXT_SECONDARY }}>
            Gestão e Governança de TI em um único lugar.
          </p>
        </div>

        <div className="space-y-6">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="flex items-start gap-4">
              <div
                className="shrink-0 w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: AUTH.BRAND_SUBTLE }}
              >
                <pillar.icon className="w-4 h-4" style={{ color: AUTH.BRAND }} />
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: AUTH.TEXT_PRIMARY }}>
                  {pillar.title}
                </p>
                <p className="text-sm mt-0.5 leading-relaxed" style={{ color: AUTH.TEXT_SECONDARY }}>
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-16 text-xs" style={{ color: AUTH.TEXT_MUTED }}>
          &copy; {new Date().getFullYear()} NexOps · Todos os direitos reservados
        </p>
      </div>
    </div>
  )
}

/* ── Logo mobile — usada nas telas de auth ── */
export function AuthMobileLogo() {
  return (
    <div className="lg:hidden mb-10 text-center">
      <h1 className="text-4xl font-bold tracking-tight" style={{ color: AUTH.TEXT_PRIMARY }}>
        Nex<span style={{ color: AUTH.BRAND }}>Ops</span>
      </h1>
    </div>
  )
}

/* ── Input com estado de foco ── */
export interface FieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError: boolean
}

export function FieldInput({ hasError, style, onFocus, onBlur, ...props }: FieldInputProps) {
  const [focused, setFocused] = useState(false)
  const borderColor = hasError ? AUTH.ERROR : focused ? AUTH.BRAND : AUTH.BORDER

  return (
    <input
      {...props}
      onFocus={(e) => { setFocused(true); onFocus?.(e) }}
      onBlur={(e) => { setFocused(false); onBlur?.(e) }}
      style={{
        borderRadius: '8px',
        border: `1px solid ${borderColor}`,
        backgroundColor: AUTH.BG,
        padding: '9px 12px',
        fontSize: '14px',
        color: AUTH.TEXT_PRIMARY,
        width: '100%',
        outline: 'none',
        transition: 'border-color 0.15s',
        fontFamily: "'DM Sans', sans-serif",
        ...style,
      }}
    />
  )
}

/* ── Mensagem de erro inline ── */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="text-xs font-medium" style={{ color: AUTH.ERROR }}>
      {message}
    </p>
  )
}

/* ── Botão primário reutilizável ── */
interface PrimaryButtonProps {
  isLoading?: boolean
  label: string
  loadingLabel?: string
  type?: 'submit' | 'button'
  onClick?: () => void
}

export function PrimaryButton({
  isLoading = false,
  label,
  loadingLabel,
  type = 'submit',
  onClick,
}: PrimaryButtonProps) {
  const [hovered, setHovered] = useState(false)
  const bg = isLoading ? '#7b8ef9' : hovered ? AUTH.BRAND_HOVER : AUTH.BRAND

  return (
    <button
      type={type}
      disabled={isLoading}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%',
        backgroundColor: bg,
        color: '#ffffff',
        border: 'none',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '14px',
        fontWeight: '600',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        transition: 'background-color 0.15s',
        fontFamily: "'DM Sans', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
      }}
    >
      {isLoading ? (
        <>
          <span
            className="animate-spin rounded-full border-2 border-white/40 border-t-white"
            style={{ width: '16px', height: '16px', flexShrink: 0 }}
          />
          {loadingLabel ?? label}
        </>
      ) : (
        label
      )}
    </button>
  )
}
