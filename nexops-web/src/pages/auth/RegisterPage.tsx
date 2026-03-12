import { useState } from 'react'
import { Link } from 'react-router-dom'
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
import { Navigate } from 'react-router-dom'
import { useAppStore } from '@/store/appStore'

function maskCnpj(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  return digits
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

const schema = z
  .object({
    cnpj: z
      .string()
      .min(1, 'CNPJ obrigatório')
      .transform((v) => v.replace(/\D/g, ''))
      .refine((v) => v.length === 14, { message: 'CNPJ deve ter 14 dígitos' }),
    nomeFantasia: z.string().min(2, 'Nome da empresa obrigatório'),
    email: z.string().min(1, 'E-mail obrigatório').email('Formato de e-mail inválido'),
    senha: z.string().min(6, 'Mínimo de 6 caracteres'),
    confirmacaoSenha: z.string(),
  })
  .refine((data) => data.senha === data.confirmacaoSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmacaoSenha'],
  })

type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)
  const { register: registerFn, isRegistering } = useAuth()
  const user = useAppStore((s) => s.user)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  if (user) return <Navigate to="/app" replace />

  function onSubmit(data: FormData) {
    setApiError(null)
    registerFn(
      {
        cnpj: data.cnpj,
        nomeFantasia: data.nomeFantasia,
        email: data.email,
        senha: data.senha,
        confirmacaoSenha: data.confirmacaoSenha,
      },
      {
        onError: (err: unknown) => {
          const message =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Erro ao cadastrar. Tente novamente.'
          setApiError(message)
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

      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 py-12 overflow-y-auto">
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
              Cadastrar empresa
            </h2>
            <p className="mt-1 text-sm" style={{ color: AUTH.TEXT_SECONDARY }}>
              Crie sua conta de administrador para o NexOps.
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
            {/* CNPJ */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: AUTH.TEXT_PRIMARY }}>
                CNPJ
              </label>
              <FieldInput
                type="text"
                placeholder="00.000.000/0000-00"
                autoComplete="off"
                maxLength={18}
                hasError={!!errors.cnpj}
                {...register('cnpj', {
                  onChange: (e) => {
                    e.target.value = maskCnpj(e.target.value)
                  },
                })}
              />
              <FieldError message={errors.cnpj?.message} />
            </div>

            {/* Nome Fantasia */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: AUTH.TEXT_PRIMARY }}>
                Nome da empresa
              </label>
              <FieldInput
                type="text"
                placeholder="Prefeitura de Votorantim"
                autoComplete="organization"
                hasError={!!errors.nomeFantasia}
                {...register('nomeFantasia')}
              />
              <FieldError message={errors.nomeFantasia?.message} />
            </div>

            {/* E-mail */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium" style={{ color: AUTH.TEXT_PRIMARY }}>
                E-mail do administrador
              </label>
              <FieldInput
                type="email"
                placeholder="admin@empresa.com.br"
                autoComplete="email"
                hasError={!!errors.email}
                {...register('email')}
              />
              <FieldError message={errors.email?.message} />
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
                <button
                  type="button"
                  onClick={() => setShowConfirm((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{
                    color: AUTH.TEXT_MUTED,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                  }}
                  aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <FieldError message={errors.confirmacaoSenha?.message} />
            </div>

            <PrimaryButton
              isLoading={isRegistering}
              label="Criar conta"
              loadingLabel="Criando..."
            />
          </form>

          <p className="mt-6 text-center text-xs" style={{ color: AUTH.TEXT_MUTED }}>
            Já tem uma conta?{' '}
            <Link
              to="/login"
              style={{ color: AUTH.BRAND, fontWeight: 500, textDecoration: 'none' }}
            >
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
