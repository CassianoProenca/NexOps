import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, XCircle, CheckCircle2 } from 'lucide-react'
import { jwtDecode } from 'jwt-decode'
import {
  AUTH,
  AuthLeftPanel,
  AuthMobileLogo,
  FieldInput,
  FieldError,
  PrimaryButton,
} from '@/components/layout/AuthLeftPanel'
import { authService } from '@/services/auth.service'
import { useAppStore } from '@/store/appStore'
import type { AuthenticatedUser } from '@/types/auth.types'

/* ─────────────────────────── Validação ─────────────────────────── */

interface JwtPayload {
  sub: string
  nome: string
  email: string
  tenantId: string
  permissions: string[]
  exp: number
}

const schema = z
  .object({
    nome: z.string().min(3, 'Mínimo de 3 caracteres'),
    email: z.string().min(1, 'E-mail obrigatório').email('Formato inválido'),
    senha: z
      .string()
      .min(8, 'Mínimo de 8 caracteres')
      .regex(/[A-Z]/, 'Deve conter ao menos uma letra maiúscula')
      .regex(/[a-z]/, 'Deve conter ao menos uma letra minúscula')
      .regex(/[0-9]/, 'Deve conter ao menos um número'),
    confirmacaoSenha: z.string(),
    terms: z.boolean().refine((v) => v === true, {
      message: 'Você deve aceitar os Termos de Uso',
    }),
  })
  .refine((data) => data.senha === data.confirmacaoSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmacaoSenha'],
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

function FormState({
  token,
}: {
  token: string
  onSuccess?: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const setAuth = useAppStore((s) => s.setAuth)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { terms: false },
  })

  const senhaValue = watch('senha', '')

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    setApiError(null)
    try {
      const tokens = await authService.firstAccess({
        token,
        nome: data.nome,
        email: data.email,
        senha: data.senha,
        confirmacaoSenha: data.confirmacaoSenha,
      })

      const decoded = jwtDecode<JwtPayload>(tokens.accessToken)
      const authUser: AuthenticatedUser = {
        userId: decoded.sub,
        nome: decoded.nome,
        email: decoded.email,
        tenantId: decoded.tenantId,
      }
      setAuth(
        authUser,
        decoded.tenantId,
        tokens.accessToken,
        tokens.refreshToken,
        decoded.permissions ?? [],
      )
      navigate('/app')
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erro ao ativar conta. Tente novamente.'
      setApiError(message)
    } finally {
      setIsLoading(false)
    }
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

      {apiError && (
        <div
          className="mb-4 p-3 rounded-lg text-sm"
          style={{ backgroundColor: '#fef2f2', color: AUTH.ERROR, border: `1px solid #fecaca` }}
        >
          {apiError}
        </div>
      )}

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
            hasError={!!errors.nome}
            {...register('nome')}
          />
          <FieldError message={errors.nome?.message} />
        </div>

        {/* E-mail */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: AUTH.TEXT_PRIMARY }}>
            E-mail do convite
          </label>
          <FieldInput
            type="email"
            placeholder="voce@empresa.com.br"
            autoComplete="email"
            hasError={!!errors.email}
            {...register('email')}
          />
          <FieldError message={errors.email?.message} />
          <p className="text-xs" style={{ color: AUTH.TEXT_MUTED }}>
            Deve coincidir com o e-mail do convite.
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
              hasError={!!errors.senha}
              style={{ paddingRight: '40px' }}
              {...register('senha')}
            />
            <TogglePasswordButton
              visible={showPassword}
              onToggle={() => setShowPassword((p) => !p)}
            />
          </div>
          <PasswordStrengthBar password={senhaValue} />
          <FieldError message={errors.senha?.message} />
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
              hasError={!!errors.confirmacaoSenha}
              style={{ paddingRight: '40px' }}
              {...register('confirmacaoSenha')}
            />
            <TogglePasswordButton
              visible={showConfirm}
              onToggle={() => setShowConfirm((p) => !p)}
            />
          </div>
          <FieldError message={errors.confirmacaoSenha?.message} />
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
      <PrimaryButton type="button" label="Ir para o painel" onClick={onNavigate} />
    </div>
  )
}

/* ─────────────────────────── Componente principal ─────────────────────────── */

export default function FirstAccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [pageState, setPageState] = useState<PageState>('loading')
  const [token, setToken] = useState<string>('')

  useEffect(() => {
    const t = searchParams.get('token')
    if (!t || t.trim() === '') {
      setPageState('invalid')
    } else {
      setToken(t)
      setPageState('form')
    }
  }, [searchParams])

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: AUTH.BG }}
      className="flex h-screen"
    >
      <AuthLeftPanel />

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 overflow-y-auto">
        <AuthMobileLogo />

        <div className="w-full max-w-110">
          {pageState === 'loading' && <LoadingState />}
          {pageState === 'invalid' && (
            <InvalidState onBack={() => navigate('/login')} />
          )}
          {pageState === 'form' && (
            <FormState token={token} onSuccess={() => setPageState('success')} />
          )}
          {pageState === 'success' && (
            <SuccessState onNavigate={() => navigate('/app')} />
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
