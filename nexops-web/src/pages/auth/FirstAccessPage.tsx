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
  status: string
  exp: number
}

const schema = z
  .object({
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
          <div key={bar} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ backgroundColor: bar <= level ? color : AUTH.BORDER }} />
        ))}
      </div>
      <p className="text-xs font-medium" style={{ color }}>Força da senha: {label}</p>
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

function FormState({
  token,
  onSuccess
}: {
  token?: string
  onSuccess?: () => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  
  const { user, setAuth } = useAppStore()
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
      if (token) {
        // Fluxo legado de convite por token (opcional manter)
        const tokens = await authService.firstAccess({
          token,
          nome: user?.nome || 'Usuário',
          email: user?.email || '',
          senha: data.senha,
          confirmacaoSenha: data.confirmacaoSenha,
        })
        const decoded = jwtDecode<JwtPayload>(tokens.accessToken)
        setAuth({
          userId: decoded.sub,
          nome: decoded.nome,
          email: decoded.email,
          tenantId: decoded.tenantId,
          status: decoded.status,
        }, decoded.tenantId, tokens.accessToken, tokens.refreshToken, decoded.permissions ?? [])
      } else {
        // Novo fluxo: Usuário já logado como PENDING
        await authService.activateAccount(data.senha)
        if (user) {
          setAuth({ ...user, status: 'ACTIVE' }, user.tenantId, useAppStore.getState().accessToken!, useAppStore.getState().refreshToken!, useAppStore.getState().permissions)
        }
      }
      onSuccess?.()
    } catch (err: unknown) {
      const message = (err as any)?.response?.data?.message || 'Erro ao ativar conta.'
      setApiError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div style={CARD_STYLE}>
      <div className="mb-7">
        <h2 className="text-xl font-bold" style={{ color: AUTH.TEXT_PRIMARY }}>Configure seu acesso</h2>
        <p className="mt-1 text-sm leading-relaxed" style={{ color: AUTH.TEXT_SECONDARY }}>
          {user?.nome}, defina sua senha definitiva para ativar sua conta no NexOps.
        </p>
      </div>

      {apiError && (
        <div className="mb-4 p-3 rounded-lg text-sm" style={{ backgroundColor: '#fef2f2', color: AUTH.ERROR, border: `1px solid #fecaca` }}>
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: AUTH.TEXT_PRIMARY }}>Nova Senha</label>
          <div className="relative">
            <FieldInput type={showPassword ? 'text' : 'password'} placeholder="••••••••" hasError={!!errors.senha} style={{ paddingRight: '40px' }} {...register('senha')} />
            <TogglePasswordButton visible={showPassword} onToggle={() => setShowPassword((p) => !p)} />
          </div>
          <PasswordStrengthBar password={senhaValue} />
          <FieldError message={errors.senha?.message} />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium" style={{ color: AUTH.TEXT_PRIMARY }}>Confirmar Nova Senha</label>
          <div className="relative">
            <FieldInput type={showConfirm ? 'text' : 'password'} placeholder="••••••••" hasError={!!errors.confirmacaoSenha} style={{ paddingRight: '40px' }} {...register('confirmacaoSenha')} />
            <TogglePasswordButton visible={showConfirm} onToggle={() => setShowConfirm((p) => !p)} />
          </div>
          <FieldError message={errors.confirmacaoSenha?.message} />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-start gap-2.5">
            <input type="checkbox" id="terms" {...register('terms')} style={{ width: '16px', height: '16px', marginTop: '2px', accentColor: AUTH.BRAND, cursor: 'pointer', flexShrink: 0 }} />
            <label htmlFor="terms" className="text-sm select-none cursor-pointer leading-snug" style={{ color: AUTH.TEXT_SECONDARY }}>
              Li e concordo com os <button type="button" style={{ color: AUTH.BRAND, background: 'none', border: 'none', padding: 0, cursor: 'pointer', fontSize: 'inherit', fontFamily: 'inherit', fontWeight: 500 }}>Termos de Uso</button>
            </label>
          </div>
          <FieldError message={errors.terms?.message} />
        </div>

        <PrimaryButton isLoading={isLoading} label="Ativar minha conta" loadingLabel="Ativando..." />
      </form>
    </div>
  )
}

export default function FirstAccessPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const user = useAppStore((s) => s.user)
  const [pageState, setPageState] = useState<PageState>('form')
  const [token, setToken] = useState<string | undefined>()

  useEffect(() => {
    const t = searchParams.get('token')
    if (t) setToken(t)
    
    // Se não tem token e não está logado como pending, volta pro login
    if (!t && (!user || user.status !== 'PENDING')) {
      navigate('/login')
    }
  }, [searchParams, user, navigate])

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: AUTH.BG }} className="flex h-screen">
      <AuthLeftPanel />
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 overflow-y-auto">
        <AuthMobileLogo />
        <div className="w-full max-w-110">
          {pageState === 'form' && <FormState token={token} onSuccess={() => setPageState('success')} />}
          {pageState === 'success' && (
            <div style={CARD_STYLE} className="text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 mx-auto" style={{ color: AUTH.SUCCESS }} />
              <div>
                <h2 className="text-lg font-bold" style={{ color: AUTH.TEXT_PRIMARY }}>Tudo pronto!</h2>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: AUTH.TEXT_SECONDARY }}>Sua senha foi definida e sua conta está ativa.</p>
              </div>
              <PrimaryButton type="button" label="Acessar o NexOps" onClick={() => navigate('/app')} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TogglePasswordButton({ visible, onToggle }: { visible: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: AUTH.TEXT_MUTED, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
      {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  )
}
