// [ROLE: END_USER]

import { useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Lightbulb, Upload } from 'lucide-react'

/* ── Schema ── */
const schema = z.object({
  title: z.string().min(5, 'Mínimo de 5 caracteres'),
  type: z.string().min(1, 'Selecione um tipo de problema'),
  department: z.string().min(1, 'Selecione um departamento'),
  description: z.string().min(20, 'Mínimo de 20 caracteres'),
})

type FormData = z.infer<typeof schema>

/* ── Constantes ── */
const PROBLEM_TYPES = ['Hardware', 'Software', 'Acessos', 'Rede', 'Impressora', 'Outro']
const DEPARTMENTS = ['RH', 'Finanças', 'Saúde', 'Educação', 'Jurídico', 'Secretaria', 'TI']

const TIPS = [
  'Inclua o nome do equipamento ou sistema afetado.',
  'Descreva quando o problema começou e o que você já tentou fazer.',
  'Se houver mensagem de erro, copie o texto exato.',
]

const FIELD_STYLE: React.CSSProperties = {
  width: '100%',
  height: '40px',
  borderRadius: '8px',
  border: '1px solid #e4e4e7',
  backgroundColor: '#fafafa',
  padding: '0 12px',
  fontSize: '14px',
  color: '#18181b',
  outline: 'none',
  fontFamily: 'inherit',
  transition: 'border-color 0.15s',
}

const SELECT_STYLE: React.CSSProperties = {
  ...FIELD_STYLE,
  cursor: 'pointer',
  appearance: 'none',
  paddingRight: '32px',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 10px center',
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs font-medium mt-1" style={{ color: '#dc2626' }}>{message}</p>
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-medium text-text-primary mb-1.5">
      {children}
    </label>
  )
}

/* ── Componente principal ── */
export default function NewCasePage() {
  const navigate = useNavigate()
  const locationState = useLocation().state as { description?: string } | null
  const prefillDescription = locationState?.description ?? ''

  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      type: '',
      department: '',
      description: prefillDescription,
    },
  })

  const descriptionValue = watch('description', prefillDescription)
  const MAX_DESC = 2000

  function onSubmit(_data: FormData) {
    setIsLoading(true)
    setTimeout(() => {
      navigate('/app/helpdesk/meus-chamados')
    }, 1500)
  }

  return (
    <div className="p-8 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-text-muted">
        <span>Home</span>
        <span className="text-border">/</span>
        <span>Helpdesk</span>
        <span className="text-border">/</span>
        <span className="text-brand">Abrir Chamado</span>
      </div>

      {/* Título */}
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Abrir Chamado</h1>
        <p className="mt-1 text-sm text-text-secondary">
          Preencha as informações abaixo. Quanto mais detalhes, mais rápido o atendimento.
        </p>
      </div>

      {/* Layout: formulário + painel lateral */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex gap-8 items-start">

          {/* ── Formulário principal ── */}
          <div className="flex-1 max-w-180">
            <div className="p-6 rounded-xl border bg-surface space-y-5">

              {/* Título */}
              <div>
                <FieldLabel>Título <span style={{ color: '#dc2626' }}>*</span></FieldLabel>
                <FocusableInput
                  type="text"
                  placeholder="Resuma o problema em uma frase"
                  maxLength={120}
                  hasError={!!errors.title}
                  {...register('title')}
                />
                <FieldError message={errors.title?.message} />
              </div>

              {/* Tipo de Problema + Departamento — linha */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <FieldLabel>Tipo de Problema <span style={{ color: '#dc2626' }}>*</span></FieldLabel>
                  <FocusableSelect hasError={!!errors.type} {...register('type')}>
                    <option value="">Selecione...</option>
                    {PROBLEM_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </FocusableSelect>
                  <FieldError message={errors.type?.message} />
                </div>

                <div>
                  <FieldLabel>Departamento <span style={{ color: '#dc2626' }}>*</span></FieldLabel>
                  <FocusableSelect hasError={!!errors.department} {...register('department')}>
                    <option value="">Selecione...</option>
                    {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                  </FocusableSelect>
                  <FieldError message={errors.department?.message} />
                </div>
              </div>

              {/* Descrição */}
              <div>
                <FieldLabel>Descrição <span style={{ color: '#dc2626' }}>*</span></FieldLabel>
                <div className="relative">
                  <FocusableTextarea
                    placeholder="Descreva o problema com detalhes: quando começou, o que você tentou fazer, mensagens de erro..."
                    maxLength={MAX_DESC}
                    hasError={!!errors.description}
                    showCounter={descriptionValue.length > 0}
                    counterValue={`${descriptionValue.length} / ${MAX_DESC}`}
                    counterOverLimit={descriptionValue.length >= MAX_DESC}
                    {...register('description')}
                  />
                </div>
                <FieldError message={errors.description?.message} />
              </div>

              {/* Anexos */}
              <div>
                <FieldLabel>Anexos</FieldLabel>
                <div
                  onDragEnter={() => setDragActive(true)}
                  onDragLeave={() => setDragActive(false)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); setDragActive(false) }}
                  className="flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed transition-colors cursor-pointer"
                  style={{
                    borderColor: dragActive ? '#4f6ef7' : '#e4e4e7',
                    backgroundColor: dragActive ? '#eef1ff' : '#fafafa',
                  }}
                >
                  <Upload
                    className="w-7 h-7"
                    style={{ color: dragActive ? '#4f6ef7' : '#a1a1aa' }}
                  />
                  <p className="text-sm font-medium text-text-secondary">
                    Arraste arquivos ou clique para selecionar
                  </p>
                  <p className="text-xs text-text-muted">PNG, JPG, PDF até 10MB</p>
                </div>
              </div>

              {/* Botões */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/app/helpdesk/meus-chamados')}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold text-text-secondary border border-[#e4e4e7] bg-surface hover:bg-[#f4f4f5] transition-colors"
                  style={{ fontFamily: 'inherit', cursor: 'pointer' }}
                >
                  Cancelar
                </button>

                <PrimaryButton isLoading={isLoading} />
              </div>
            </div>
          </div>

          {/* ── Painel lateral — Dica (desktop only) ── */}
          <div className="hidden lg:block w-70 shrink-0">
            <div className="p-5 rounded-xl border bg-surface">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4" style={{ color: '#d97706' }} />
                <h3 className="text-sm font-semibold text-text-primary">Dica</h3>
              </div>
              <p className="text-sm text-text-secondary leading-relaxed mb-4">
                Chamados com descrição detalhada são resolvidos em média{' '}
                <span className="font-semibold text-text-primary">40% mais rápido.</span>
              </p>
              <ul className="space-y-2.5">
                {TIPS.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span
                      className="shrink-0 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white mt-0.5"
                      style={{ backgroundColor: '#4f6ef7' }}
                    >
                      {i + 1}
                    </span>
                    <p className="text-xs text-text-secondary leading-relaxed">{tip}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

        </div>
      </form>
    </div>
  )
}

/* ── Sub-componentes com foco controlado ── */

interface FocusableInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError: boolean
}

function FocusableInput({ hasError, style, onFocus, onBlur, ...props }: FocusableInputProps) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      {...props}
      onFocus={(e) => { setFocused(true); onFocus?.(e) }}
      onBlur={(e) => { setFocused(false); onBlur?.(e) }}
      style={{
        ...FIELD_STYLE,
        borderColor: hasError ? '#dc2626' : focused ? '#4f6ef7' : '#e4e4e7',
        ...style,
      }}
    />
  )
}

interface FocusableSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  hasError: boolean
}

function FocusableSelect({ hasError, children, onFocus, onBlur, ...props }: FocusableSelectProps) {
  const [focused, setFocused] = useState(false)
  return (
    <select
      {...props}
      onFocus={(e) => { setFocused(true); onFocus?.(e) }}
      onBlur={(e) => { setFocused(false); onBlur?.(e) }}
      style={{
        ...SELECT_STYLE,
        borderColor: hasError ? '#dc2626' : focused ? '#4f6ef7' : '#e4e4e7',
      }}
    >
      {children}
    </select>
  )
}

interface FocusableTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  hasError: boolean
  showCounter: boolean
  counterValue: string
  counterOverLimit: boolean
}

function FocusableTextarea({
  hasError,
  showCounter,
  counterValue,
  counterOverLimit,
  onFocus,
  onBlur,
  ...props
}: FocusableTextareaProps) {
  const [focused, setFocused] = useState(false)
  return (
    <div className="relative">
      <textarea
        {...props}
        onFocus={(e) => { setFocused(true); onFocus?.(e) }}
        onBlur={(e) => { setFocused(false); onBlur?.(e) }}
        style={{
          width: '100%',
          minHeight: '160px',
          borderRadius: '8px',
          border: `1px solid ${hasError ? '#dc2626' : focused ? '#4f6ef7' : '#e4e4e7'}`,
          backgroundColor: '#fafafa',
          padding: '12px',
          paddingBottom: showCounter ? '32px' : '12px',
          fontSize: '14px',
          color: '#18181b',
          outline: 'none',
          resize: 'vertical',
          fontFamily: 'inherit',
          lineHeight: '1.6',
          transition: 'border-color 0.15s',
        }}
      />
      {showCounter && (
        <span
          className="absolute bottom-3 right-3 text-xs select-none pointer-events-none"
          style={{ color: counterOverLimit ? '#dc2626' : '#a1a1aa' }}
        >
          {counterValue}
        </span>
      )}
    </div>
  )
}

function PrimaryButton({ isLoading }: { isLoading: boolean }) {
  const [hovered, setHovered] = useState(false)
  const bg = isLoading ? '#7b8ef9' : hovered ? '#3d5ce8' : '#4f6ef7'

  return (
    <button
      type="submit"
      disabled={isLoading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
      style={{
        backgroundColor: bg,
        border: 'none',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit',
        transition: 'background-color 0.15s',
      }}
    >
      {isLoading ? (
        <>
          <span
            className="animate-spin rounded-full border-2 border-white/40 border-t-white"
            style={{ width: '14px', height: '14px', flexShrink: 0 }}
          />
          Abrindo...
        </>
      ) : (
        'Abrir Chamado'
      )}
    </button>
  )
}
