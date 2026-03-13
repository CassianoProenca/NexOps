import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Monitor, Laptop, Printer, Phone, Package, HelpCircle,
  Search, SearchX, Plus, X, ChevronLeft, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAssets, useRegisterAsset } from '@/hooks/inventory/useInventory'
import { useDepartments } from '@/hooks/helpdesk/useDepartments'
import type { AssetCategory, AssetStatus, RegisterAssetRequest } from '@/types/inventory.types'

// ── constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12

const CATEGORIES: AssetCategory[] = ['DESKTOP', 'NOTEBOOK', 'MONITOR', 'PRINTER', 'PHONE', 'OTHER']

const CATEGORY_LABEL: Record<AssetCategory, string> = {
  DESKTOP:  'Desktop',
  NOTEBOOK: 'Notebook',
  MONITOR:  'Monitor',
  PRINTER:  'Impressora',
  PHONE:    'Telefone',
  OTHER:    'Outro',
}

const STATUS_LABEL: Record<AssetStatus, string> = {
  REGISTERED:              'Registrado',
  AVAILABLE:               'Disponível',
  IN_USE:                  'Em Uso',
  IN_MAINTENANCE:          'Em Manutenção',
  DISCARDED:               'Descartado',
}

const STATUS_STYLE: Record<AssetStatus, string> = {
  REGISTERED:     'bg-zinc-100 text-zinc-600',
  AVAILABLE:      'bg-green-50 text-green-700',
  IN_USE:         'bg-blue-50 text-blue-700',
  IN_MAINTENANCE: 'bg-amber-50 text-amber-700',
  DISCARDED:      'bg-red-50 text-red-600',
}

function CategoryIcon({ category, className }: { category: AssetCategory; className?: string }) {
  const cls = cn('shrink-0', className)
  switch (category) {
    case 'DESKTOP':  return <Monitor  className={cls} />
    case 'NOTEBOOK': return <Laptop   className={cls} />
    case 'PRINTER':  return <Printer  className={cls} />
    case 'PHONE':    return <Phone    className={cls} />
    case 'MONITOR':  return <Monitor  className={cls} />
    default:         return <HelpCircle className={cls} />
  }
}

// ── register modal ────────────────────────────────────────────────────────────

function RegisterAssetModal({
  onClose,
  departments,
}: {
  onClose: () => void
  departments: { id: string; name: string }[]
}) {
  const registerAsset = useRegisterAsset()

  const [form, setForm] = useState<RegisterAssetRequest>({
    patrimonyNumber: '',
    name:            '',
    category:        'DESKTOP',
    serialNumber:    '',
    model:           '',
    manufacturer:    '',
    departmentId:    departments[0]?.id ?? '',
  })

  function set<K extends keyof RegisterAssetRequest>(k: K, v: RegisterAssetRequest[K]) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  function submit() {
    if (!form.patrimonyNumber.trim() || !form.name.trim() || !form.departmentId) return
    const payload: RegisterAssetRequest = {
      ...form,
      serialNumber: form.serialNumber?.trim() || undefined,
      model:        form.model?.trim()        || undefined,
      manufacturer: form.manufacturer?.trim() || undefined,
    }
    registerAsset.mutate(payload, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">Registrar Novo Ativo</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Número de patrimônio */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-xs font-medium text-zinc-600">Nº Patrimônio <span className="text-red-400">*</span></label>
            <input
              value={form.patrimonyNumber}
              onChange={(e) => set('patrimonyNumber', e.target.value)}
              placeholder="Ex: PAT-00123"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <label className="text-xs font-medium text-zinc-600">Categoria <span className="text-red-400">*</span></label>
            <select
              value={form.category}
              onChange={(e) => set('category', e.target.value as AssetCategory)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
              ))}
            </select>
          </div>

          {/* Nome */}
          <div className="space-y-1 col-span-2">
            <label className="text-xs font-medium text-zinc-600">Nome / Descrição <span className="text-red-400">*</span></label>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ex: Notebook Dell Inspiron 15"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            />
          </div>

          {/* Modelo */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600">Modelo</label>
            <input
              value={form.model ?? ''}
              onChange={(e) => set('model', e.target.value)}
              placeholder="Inspiron 15 3520"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            />
          </div>

          {/* Fabricante */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600">Fabricante</label>
            <input
              value={form.manufacturer ?? ''}
              onChange={(e) => set('manufacturer', e.target.value)}
              placeholder="Dell"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            />
          </div>

          {/* Número de série */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600">Número de Série</label>
            <input
              value={form.serialNumber ?? ''}
              onChange={(e) => set('serialNumber', e.target.value)}
              placeholder="SN-XXXX"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            />
          </div>

          {/* Departamento */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600">Departamento <span className="text-red-400">*</span></label>
            <select
              value={form.departmentId}
              onChange={(e) => set('departmentId', e.target.value)}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            >
              <option value="">Selecione…</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onClose}
            disabled={registerAsset.isPending}
            className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={!form.patrimonyNumber.trim() || !form.name.trim() || !form.departmentId || registerAsset.isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#4f6ef7] hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {registerAsset.isPending ? 'Registrando…' : 'Registrar Ativo'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function AssetsPage() {
  const navigate = useNavigate()

  const { data: assets = [], isLoading } = useAssets()
  const { departments } = useDepartments()

  const deptMap = useMemo(
    () => Object.fromEntries(departments.map((d) => [d.id, d.name])),
    [departments],
  )

  const [search,   setSearch]   = useState('')
  const [status,   setStatus]   = useState<AssetStatus | ''>('')
  const [category, setCategory] = useState<AssetCategory | ''>('')
  const [page,     setPage]     = useState(1)
  const [showModal, setShowModal] = useState(false)

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.patrimonyNumber.toLowerCase().includes(search.toLowerCase())) return false
      if (status   && a.status   !== status)   return false
      if (category && a.category !== category) return false
      return true
    })
  }, [assets, search, status, category])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const rangeStart  = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const rangeEnd    = Math.min(currentPage * PAGE_SIZE, filtered.length)

  const hasFilter = search !== '' || status !== '' || category !== ''

  // KPIs
  const kpi = useMemo(() => ({
    total:       assets.length,
    available:   assets.filter((a) => a.status === 'AVAILABLE').length,
    inUse:       assets.filter((a) => a.status === 'IN_USE').length,
    maintenance: assets.filter((a) => a.status === 'IN_MAINTENANCE').length,
  }), [assets])

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-12 bg-zinc-100 rounded-lg animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900">Ativos</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Equipamentos e patrimônios do tenant</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#4f6ef7] hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Registrar Ativo
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total',          value: kpi.total,       color: 'text-zinc-500',  bg: 'bg-zinc-100'  },
          { label: 'Disponíveis',    value: kpi.available,   color: 'text-green-600', bg: 'bg-green-50'  },
          { label: 'Em Uso',         value: kpi.inUse,       color: 'text-blue-600',  bg: 'bg-blue-50'   },
          { label: 'Em Manutenção',  value: kpi.maintenance, color: 'text-amber-600', bg: 'bg-amber-50'  },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-zinc-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-zinc-500">{k.label}</span>
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', k.bg)}>
                <Package className={cn('w-4 h-4', k.color)} />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-900">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar por nome ou patrimônio"
            className="pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] w-60"
          />
        </div>

        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value as AssetStatus | ''); setPage(1) }}
          className={cn('border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30', status ? 'text-zinc-800' : 'text-zinc-400')}
        >
          <option value="">Status</option>
          {(Object.keys(STATUS_LABEL) as AssetStatus[]).map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>

        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value as AssetCategory | ''); setPage(1) }}
          className={cn('border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30', category ? 'text-zinc-800' : 'text-zinc-400')}
        >
          <option value="">Categoria</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
          ))}
        </select>

        {hasFilter && (
          <button
            onClick={() => { setSearch(''); setStatus(''); setCategory(''); setPage(1) }}
            className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 px-3 py-2 rounded-lg hover:bg-zinc-100 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Limpar
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-100 bg-zinc-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Patrimônio</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Nome</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Categoria</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Departamento</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-400">
                    <SearchX className="w-10 h-10" />
                    <p className="text-sm font-medium">Nenhum ativo encontrado</p>
                    {hasFilter && (
                      <button
                        onClick={() => { setSearch(''); setStatus(''); setCategory(''); setPage(1) }}
                        className="text-xs text-[#4f6ef7] hover:underline"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              pageItems.map((asset) => (
                <tr
                  key={asset.id}
                  className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60 transition-colors"
                >
                  <td className="px-4 py-3 font-mono text-xs text-zinc-500">{asset.patrimonyNumber}</td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <CategoryIcon category={asset.category} className="w-4 h-4 text-zinc-400" />
                      <span className="font-medium text-zinc-800 truncate max-w-48">{asset.name}</span>
                    </div>
                    {asset.model && (
                      <p className="text-xs text-zinc-400 mt-0.5 pl-6">{asset.model}</p>
                    )}
                  </td>

                  <td className="px-4 py-3 text-xs text-zinc-500">{CATEGORY_LABEL[asset.category]}</td>

                  <td className="px-4 py-3">
                    <span className={cn('inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold', STATUS_STYLE[asset.status])}>
                      {STATUS_LABEL[asset.status]}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {asset.assignedDepartmentId ? (deptMap[asset.assignedDepartmentId] ?? '—') : '—'}
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/app/inventory/assets/${asset.id}`)}
                      className="text-xs font-medium text-[#4f6ef7] hover:underline"
                    >
                      Ver
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100 bg-zinc-50/50">
            <p className="text-xs text-zinc-400">
              Mostrando {rangeStart}–{rangeEnd} de {filtered.length} ativos
            </p>
            <div className="flex items-center gap-1">
              <button
                disabled={currentPage === 1}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-800 disabled:opacity-40 px-2 py-1.5 rounded hover:bg-zinc-100 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Anterior
              </button>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-800 disabled:opacity-40 px-2 py-1.5 rounded hover:bg-zinc-100 transition-colors"
              >
                Próximo
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <RegisterAssetModal
          onClose={() => setShowModal(false)}
          departments={departments}
        />
      )}
    </div>
  )
}
