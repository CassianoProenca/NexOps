import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, XCircle, CheckCircle2 } from 'lucide-react'
import {
  AUTH,
  AuthLeftPanel,
  AuthMobileLogo,
  FieldInput,
  FieldError,
  PrimaryButton,
} from '@/components/layout/AuthLeftPanel'

/* ─────────────────────────── Validação ─────────────────────────── */

const schema = z
  .object({
    name: z.string().min(3, 'Mínimo de 3 caracteres'),
    password: z
      .string()
      .min(8, 'Mínimo de 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter ao menos uma letra maiúscula')
      .regex(/[a-z]/, 'Deve conter ao menos uma letra minúscula')
      .regex(/[0-9]/, 'Deve conter ao menos um número'),
    confirmPassword: z.string(),
    terms: z.boolean().refine((v) => v === true, {
      message: 'Você deve aceitar os Termos de Uso',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

/* ─────────────────────────── Força da senha ─────────────────────────── */

function getPasswordStrength(password: string): 1 | 2 | 3 | 4 {
  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const types = [hasUpper, hasLower, hasNumber].filter(Boolean).length

  if (types === 3 && password.length >= 10) return 4
  if (types === 3) return 3
  if (types === 2) return 2
  return 1
}

const STRENGTH_CONFIG: Record<1 | 2 | 3 | 4, { color: string; label: string }> = {
  1: { color: '#dc2626', label: 'Fraca' },
  2: { color: '#d97706', label: 'Regular' },
  3: { color: '#84cc16', label: 'Boa' },
  4: { color: '#16a34a', label: 'Forte' },
}

function PasswordStrengthBar({ password }: { password: string }) {
  if (!password) return null

  const level = getPasswordStrength(password)
  const { color, label } = STRENGTH_CONFIG[level]

  return (
    <div className="space-y-1.5 pt-0.5">
      <div className="flex gap-1.5">
        {([1, 2, 3, 4] as const).map((bar) => (
          <div
            key={bar}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: bar <= level ? color : AUTH.BORDER }}
          />
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color }}>
        Força da senha: {label}
      </p>
    </div>
  )
}

/* ─────────────────────────── Estados da página ─────────────────────────── */

type PageState = 'loading' | 'invalid' | 'form' | 'success'

const CARD_STYLE: React.CSSProperties = {
  backgroundColor: AUTH.SURFACE,
  border: `1px solid ${AUTH.BORDER}`,
  borderRadius: '12px',
  padding: '32px',
}

/* Estado 1 — Carregando */
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16">
      <span
        className="animate-spin rounded-full border-2 border-t-transparent"
        style={{
          width: '36px',
          height: '36px',
          borderColor: `${AUTH.BORDER} ${AUTH.BORDER} ${AUTH.BORDER} ${AUTH.BRAND}`,
        }}
      />
      <p className="text-sm" style={{ color: AUTH.TEXT_SECONDARY }}>
        Validando convite...
      </p>
    </div>
  )
}

/* Estado 2 — Token inválido */
function InvalidState({ onBack }: { onBack: () => void }) {
  return (
    <div style={CARD_STYLE} className="text-center space-y-4">
      <XCircle className="w-12 h-12 mx-auto" style={{ color: AUTH.ERROR }} />
      <div>
        <h2 className="text-lg font-bold" style={{ color: AUTH.TEXT_PRIMARY }}>
          Convite inválido
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: AUTH.TEXT_SECONDARY }}>
          Este link de convite é inválido ou já foi utilizado. Solicite um novo convite ao
          administrador.
        </p>
      </div>
      <SecondaryButton onClick={onBack}>Voltar para o login</SecondaryButton>
    </div>
  )
}

/* Estado 3 — Formulário de primeiro acesso */
function FormState({ onSuccess }: { onSuccess: () => void }) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { terms: false },
  })

  const passwordValue = watch('password', '')

  function onSubmit(data: FormData) {
    setIsLoading(true)
    setTimeout(() => {
      console.log('Primeiro acesso:', data)
      onSuccess()
    }, 1500)
  }

  return (
    <div style={CARD_STYLE}>
      <div className="mb-7">
        <h2 className="text-xl font-bold" style={{ color: AUTH.TEXT_PRIMARY }}>
          Configure seu acesso
        </h2>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: AUTH.TEXT_SECONDARY }}>
          Bem-vindo ao NexOps. Defina suas informações para ativar sua conta.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {/* Nome completo */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: AUTH.TEXT_PRIMARY }}>
            Nome completo
          </label>
          <FieldInput
            type="text"
            placeholder="Seu nome completo"
            autoComplete="name"
            hasError={!!errors.name}
            {...register('name')}
          />
          <FieldError message={errors.name?.message} />
        </div>

        {/* E-mail (somente leitura) */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: AUTH.TEXT_PRIMARY }}>
            E-mail
          </label>
          <input
            type="email"
            value="usuario@empresa.com.br"
            readOnly
            style={{
              borderRadius: '8px',
              border: `1px solid ${AUTH.BORDER}`,
              backgroundColor: '#f4f4f5',
              padding: '9px 12px',
              fontSize: '14px',
              color: AUTH.TEXT_SECONDARY,
              width: '100%',
              outline: 'none',
              cursor: 'not-allowed',
              fontFamily: "'DM Sans', sans-serif",
            }}
          />
          <p className="text-xs" style={{ color: AUTH.TEXT_MUTED }}>
            O e-mail não pode ser alterado.
          </p>
        </div>

        {/* Senha */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: AUTH.TEXT_PRIMARY }}>
            Senha
          </label>
          <div className="relative">
            <FieldInput
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              hasError={!!errors.password}
              style={{ paddingRight: '40px' }}
              {...register('password')}
            />
            <TogglePasswordButton
              visible={showPassword}
              onToggle={() => setShowPassword((p) => !p)}
            />
          </div>
          <PasswordStrengthBar password={passwordValue} />
          <FieldError message={errors.password?.message} />
        </div>

        {/* Confirmar senha */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: AUTH.TEXT_PRIMARY }}>
            Confirmar senha
          </label>
          <div className="relative">
            <FieldInput
              type={showConfirm ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="new-password"
              hasError={!!errors.confirmPassword}
              style={{ paddingRight: '40px' }}
              {...register('confirmPassword')}
            />
            <TogglePasswordButton
              visible={showConfirm}
              onToggle={() => setShowConfirm((p) => !p)}
            />
          </div>
          <FieldError message={errors.confirmPassword?.message} />
        </div>

        {/* Termos de uso */}
        <div className="space-y-1.5">
          <div className="flex items-start gap-2.5">
            <input
              type="checkbox"
              id="terms"
              {...register('terms')}
              style={{
                width: '16px',
                height: '16px',
                marginTop: '2px',
                accentColor: AUTH.BRAND,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            />
            <label
              htmlFor="terms"
              className="text-sm select-none cursor-pointer leading-snug"
              style={{ color: AUTH.TEXT_SECONDARY }}
            >
              Li e concordo com os{' '}
              <button
                type="button"
                style={{
                  color: AUTH.BRAND,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  fontSize: 'inherit',
                  fontFamily: 'inherit',
                  fontWeight: 500,
                }}
                onClick={() => console.log('Abrir Termos de Uso')}
              >
                Termos de Uso
              </button>
            </label>
          </div>
          <FieldError message={errors.terms?.message} />
        </div>

        <PrimaryButton isLoading={isLoading} label="Ativar conta" loadingLabel="Ativando..." />
      </form>
    </div>
  )
}

/* Estado 4 — Sucesso */
function SuccessState({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div style={CARD_STYLE} className="text-center space-y-4">
      <CheckCircle2 className="w-12 h-12 mx-auto" style={{ color: AUTH.SUCCESS }} />
      <div>
        <h2 className="text-lg font-bold" style={{ color: AUTH.TEXT_PRIMARY }}>
          Conta ativada!
        </h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: AUTH.TEXT_SECONDARY }}>
          Sua conta foi configurada com sucesso. Você já pode acessar o NexOps.
        </p>
      </div>
      <PrimaryButton type="button" label="Ir para o login" onClick={onNavigate} />
    </div>
  )
}

/* ─────────────────────────── Componente principal ─────────────────────────── */

export default function FirstAccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [pageState, setPageState] = useState<PageState>('loading')

  useEffect(() => {
    const token = searchParams.get('token')
    const timer = setTimeout(() => {
      setPageState(!token || token === 'invalido' ? 'invalid' : 'form')
    }, 1500)
    return () => clearTimeout(timer)
  }, [searchParams])

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: AUTH.BG }}
      className="flex h-screen"
    >
      <AuthLeftPanel />

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 overflow-y-auto">
        <AuthMobileLogo />

        <div className="w-full max-w-[440px]">
          {pageState === 'loading' && <LoadingState />}
          {pageState === 'invalid' && (
            <InvalidState onBack={() => navigate('/login')} />
          )}
          {pageState === 'form' && (
            <FormState onSuccess={() => setPageState('success')} />
          )}
          {pageState === 'success' && (
            <SuccessState onNavigate={() => navigate('/login')} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────── Sub-componentes locais ─────────────────────────── */

function TogglePasswordButton({
  visible,
  onToggle,
}: {
  visible: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="absolute right-3 top-1/2 -translate-y-1/2"
      style={{
        color: AUTH.TEXT_MUTED,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        display: 'flex',
      }}
      aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
    >
      {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  )
}

function SecondaryButton({
  children,
  onClick,
}: {
  children: React.ReactNode
  onClick: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
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
      {children}
    </button>
  )
}
