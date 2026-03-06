import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, MailCheck } from 'lucide-react'
import {
  AUTH,
  AuthLeftPanel,
  AuthMobileLogo,
  FieldInput,
  PrimaryButton,
} from '@/components/layout/AuthLeftPanel'

// ── Step 1 — email form ────────────────────────────────────────────────────────

function StepEmail({ onSend }: { onSend: (email: string) => void }) {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [focused, setFocused] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (email.trim()) onSend(email.trim())
  }

  return (
    <div
      className="w-full p-8 space-y-6"
      style={{
        backgroundColor: AUTH.SURFACE,
        border: `1px solid ${AUTH.BORDER}`,
        borderRadius: '12px',
      }}
    >
      <div>
        <h2 className="text-xl font-bold" style={{ color: AUTH.TEXT_PRIMARY }}>
          Redefinir senha
        </h2>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: AUTH.TEXT_SECONDARY }}>
          Digite seu e-mail corporativo e enviaremos as instruções.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: AUTH.TEXT_PRIMARY }}>
            E-mail
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
              style={{ color: focused ? AUTH.BRAND : AUTH.TEXT_MUTED }}
            />
            <FieldInput
              type="email"
              placeholder="voce@empresa.com.br"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              hasError={false}
              style={{ paddingLeft: '36px' }}
            />
          </div>
        </div>

        <PrimaryButton
          isLoading={false}
          label="Enviar instruções"
        />
      </form>

      <div className="text-center">
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
            color: AUTH.BRAND,
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          ← Voltar para o login
        </button>
      </div>
    </div>
  )
}

// ── Step 2 — confirmation ──────────────────────────────────────────────────────

function StepConfirmation({ email }: { email: string }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)

  return (
    <div
      className="w-full p-8 space-y-6 text-center"
      style={{
        backgroundColor: AUTH.SURFACE,
        border: `1px solid ${AUTH.BORDER}`,
        borderRadius: '12px',
      }}
    >
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
        style={{ backgroundColor: AUTH.BRAND_SUBTLE }}
      >
        <MailCheck className="w-8 h-8" style={{ color: AUTH.BRAND }} />
      </div>

      {/* Text */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold" style={{ color: AUTH.TEXT_PRIMARY }}>
          Verifique seu e-mail
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: AUTH.TEXT_SECONDARY }}>
          Enviamos as instruções para{' '}
          <span className="font-semibold" style={{ color: AUTH.TEXT_PRIMARY }}>{email}</span>.
          {' '}Verifique sua caixa de entrada e a pasta de spam.
        </p>
      </div>

      {/* SMTP note */}
      <p className="text-xs leading-relaxed" style={{ color: AUTH.TEXT_MUTED }}>
        Se o SMTP não estiver configurado, o administrador receberá a solicitação manualmente.
      </p>

      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate('/login')}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          width: '100%',
          backgroundColor: hovered ? '#f4f4f5' : AUTH.SURFACE,
          color: AUTH.TEXT_PRIMARY,
          border: `1px solid ${AUTH.BORDER}`,
          borderRadius: '8px',
          padding: '10px',
          fontSize: '14px',
          fontWeight: '600',
          cursor: 'pointer',
          transition: 'background-color 0.15s',
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Voltar para o login
      </button>
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [step, setStep]   = useState<'email' | 'confirmation'>('email')
  const [email, setEmail] = useState('')

  function handleSend(sentEmail: string) {
    setEmail(sentEmail)
    setStep('confirmation')
  }

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: AUTH.BG }}
      className="flex h-screen"
    >
      <AuthLeftPanel />

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12">
        <AuthMobileLogo />

        <div className="w-full max-w-100">
          {step === 'email' ? (
            <StepEmail onSend={handleSend} />
          ) : (
            <StepConfirmation email={email} />
          )}
        </div>
      </div>
    </div>
  )
}
