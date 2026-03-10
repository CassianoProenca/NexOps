import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import {
  AUTH,
  AuthLeftPanel,
  AuthMobileLogo,
  FieldInput,
  FieldError,
  PrimaryButton,
} from '@/components/layout/AuthLeftPanel'
import { useAuth } from '@/hooks/auth/useAuth'

const schema = z.object({
  tenantSlug: z.string().min(1, 'Identificador da organização obrigatório'),
  email: z.string().min(1, 'E-mail obrigatório').email('Formato de e-mail inválido'),
  password: z.string().min(6, 'Mínimo de 6 caracteres'),
  rememberMe: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoggingIn } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { rememberMe: false },
  })

  function onSubmit(data: FormData) {
    login(
      { email: data.email, password: data.password, tenantSlug: data.tenantSlug },
      {
        onError: () => {
          setError('password', { message: 'Credenciais inválidas. Verifique e tente novamente.' })
        },
      },
    )
  }

  return (
    <div
      style={{ fontFamily: "'DM Sans', sans-serif", backgroundColor: AUTH.BG }}
      className="flex h-screen"
    >
      <AuthLeftPanel />

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12">
        <AuthMobileLogo />

        <div
          className="w-full max-w-100 p-8"
          style={{
            backgroundColor: AUTH.SURFACE,
            border: `1px solid ${AUTH.BORDER}`,
            borderRadius: '12px',
          }}
        >
          <div className="mb-7">
            <h2 className="text-xl font-bold" style={{ color: AUTH.TEXT_PRIMARY }}>
              Bem-vindo de volta
            </h2>
            <p className="mt-1 text-sm" style={{ color: AUTH.TEXT_SECONDARY }}>
              Entre com suas credenciais para acessar o sistema.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Organização */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: AUTH.TEXT_PRIMARY }}>
                Organização
              </label>
              <FieldInput
                type="text"
                placeholder="prefeitura-votorantim"
                autoComplete="organization"
                hasError={!!errors.tenantSlug}
                {...register('tenantSlug')}
              />
              <FieldError message={errors.tenantSlug?.message} />
            </div>

            {/* E-mail */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: AUTH.TEXT_PRIMARY }}>
                E-mail
              </label>
              <FieldInput
                type="email"
                placeholder="voce@empresa.com.br"
                autoComplete="email"
                hasError={!!errors.email}
                {...register('email')}
              />
              <FieldError message={errors.email?.message} />
            </div>

            {/* Senha */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium" style={{ color: AUTH.TEXT_PRIMARY }}>
                  Senha
                </label>
                <button
                  type="button"
                  style={{
                    color: AUTH.BRAND,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: '12px',
                    fontWeight: 500,
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                  onClick={() => navigate('/forgot-password')}
                >
                  Esqueci minha senha
                </button>
              </div>

              <div className="relative">
                <FieldInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  hasError={!!errors.password}
                  style={{ paddingRight: '40px' }}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{
                    color: AUTH.TEXT_MUTED,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                  }}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError message={errors.password?.message} />
            </div>

            {/* Lembrar de mim */}
            <div className="flex items-center gap-2.5">
              <input
                type="checkbox"
                id="rememberMe"
                {...register('rememberMe')}
                style={{
                  width: '16px',
                  height: '16px',
                  accentColor: AUTH.BRAND,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              />
              <label
                htmlFor="rememberMe"
                className="text-sm select-none cursor-pointer"
                style={{ color: AUTH.TEXT_SECONDARY }}
              >
                Lembrar de mim
              </label>
            </div>

            <PrimaryButton isLoading={isLoggingIn} label="Entrar" loadingLabel="Entrando..." />
          </form>

          <p className="mt-6 text-center text-xs" style={{ color: AUTH.TEXT_MUTED }}>
            Acesso exclusivo por convite. Não tem conta?{' '}
            <span style={{ color: AUTH.TEXT_SECONDARY }}>Fale com o administrador.</span>
          </p>
        </div>
      </div>
    </div>
  )
}
