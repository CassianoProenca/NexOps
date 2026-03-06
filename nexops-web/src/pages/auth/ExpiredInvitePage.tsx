import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link2Off } from 'lucide-react'
import { cn } from '@/lib/utils'

const BRAND = '#4f6ef7'
const BRAND_HOVER = '#3d5ce8'
const BRAND_SUBTLE = '#eef0fe'

// ── Toast ──────────────────────────────────────────────────────────────────────

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

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ExpiredInvitePage() {
  const navigate  = useNavigate()
  const [toast, setToast]       = useState({ message: '', visible: false })
  const [btnHovered, setBtnHovered] = useState(false)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function showToast(msg: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ message: msg, visible: true })
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3500)
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ backgroundColor: '#fafafa', fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Logo */}
      <div className="mb-10">
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ fontFamily: "'Syne', 'DM Sans', sans-serif", color: BRAND }}
        >
          NexOps
        </h1>
      </div>

      {/* Card */}
      <div
        className="w-full max-w-sm text-center space-y-6"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e4e4e7',
          borderRadius: '16px',
          padding: '40px 32px',
        }}
      >
        {/* Icon */}
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
          style={{ backgroundColor: '#f4f4f5' }}
        >
          <Link2Off className="w-10 h-10" style={{ color: '#d4d4d8' }} />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2
            className="text-xl font-bold"
            style={{ color: '#18181b' }}
          >
            Link expirado ou inválido
          </h2>
          <p
            className="text-sm leading-relaxed"
            style={{ color: '#71717a' }}
          >
            Este link de convite não é mais válido. Ele pode ter expirado ou já ter sido utilizado.
          </p>
        </div>

        {/* Primary button */}
        <button
          type="button"
          onClick={() => showToast('Solicitação enviada. Aguarde contato do administrador.')}
          onMouseEnter={() => setBtnHovered(true)}
          onMouseLeave={() => setBtnHovered(false)}
          style={{
            width: '100%',
            backgroundColor: btnHovered ? BRAND_HOVER : BRAND,
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.15s',
            fontFamily: "'DM Sans', sans-serif",
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          Solicitar novo convite
        </button>

        {/* Secondary link */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            color: BRAND,
            fontFamily: "'DM Sans', sans-serif",
            textDecoration: 'none',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
          onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
        >
          Já tenho acesso — fazer login
        </button>
      </div>

      {/* Footer note */}
      <p className="mt-8 text-xs" style={{ color: '#a1a1aa' }}>
        &copy; {new Date().getFullYear()} NexOps · Todos os direitos reservados
      </p>

      <Toast {...toast} />
    </div>
  )
}
