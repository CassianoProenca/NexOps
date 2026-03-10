import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle, Package, Search, SearchX,
  Plus, X, ChevronLeft, ChevronRight, TrendingDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStockItems, useStockAlerts, useCreateStockItem } from '@/hooks/inventory/useInventory'
import type { CreateStockItemRequest } from '@/types/inventory.types'

// ── constants ─────────────────────────────────────────────────────────────────

const PAGE_SIZE = 12

// ── create modal ──────────────────────────────────────────────────────────────

function CreateStockModal({ onClose }: { onClose: () => void }) {
  const createStock = useCreateStockItem()

  const [form, setForm] = useState<CreateStockItemRequest>({
    name:            '',
    category:        '',
    unit:            'un',
    minimumQuantity: 1,
    location:        '',
  })

  function set<K extends keyof CreateStockItemRequest>(k: K, v: CreateStockItemRequest[K]) {
    setForm((prev) => ({ ...prev, [k]: v }))
  }

  function submit() {
    if (!form.name.trim() || !form.category.trim() || !form.unit.trim()) return
    const payload: CreateStockItemRequest = {
      ...form,
      location: form.location?.trim() || undefined,
    }
    createStock.mutate(payload, { onSuccess: onClose })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-zinc-900">Novo Item de Estoque</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Nome */}
          <div className="space-y-1 col-span-2">
            <label className="text-xs font-medium text-zinc-600">Nome <span className="text-red-400">*</span></label>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Ex: Cabo de rede Cat6"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            />
          </div>

          {/* Categoria */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600">Categoria <span className="text-red-400">*</span></label>
            <input
              value={form.category}
              onChange={(e) => set('category', e.target.value)}
              placeholder="Ex: Cabeamento"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            />
          </div>

          {/* Unidade */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600">Unidade <span className="text-red-400">*</span></label>
            <input
              value={form.unit}
              onChange={(e) => set('unit', e.target.value)}
              placeholder="un, m, caixa…"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            />
          </div>

          {/* Quantidade mínima */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600">Qtd. Mínima <span className="text-red-400">*</span></label>
            <input
              type="number"
              min={0}
              value={form.minimumQuantity}
              onChange={(e) => set('minimumQuantity', Number(e.target.value))}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            />
          </div>

          {/* Localização */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600">Localização</label>
            <input
              value={form.location ?? ''}
              onChange={(e) => set('location', e.target.value)}
              placeholder="Prateleira A3"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7] focus:ring-offset-1"
            />
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button
            onClick={onClose}
            disabled={createStock.isPending}
            className="px-4 py-2 text-sm text-zinc-500 hover:text-zinc-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={submit}
            disabled={!form.name.trim() || !form.category.trim() || !form.unit.trim() || createStock.isPending}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#4f6ef7] hover:opacity-90 disabled:opacity-40 transition-opacity"
          >
            {createStock.isPending ? 'Criando…' : 'Criar Item'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── page ──────────────────────────────────────────────────────────────────────

export default function StockPage() {
  const navigate = useNavigate()

  const { data: items = [],  isLoading } = useStockItems()
  const { data: alerts = [] }            = useStockAlerts()

  const [search,     setSearch]     = useState('')
  const [category,   setCategory]   = useState('')
  const [showAlerts, setShowAlerts] = useState(false)
  const [page,       setPage]       = useState(1)
  const [showModal,  setShowModal]  = useState(false)

  const categories = useMemo(
    () => [...new Set(items.map((i) => i.category))].sort(),
    [items],
  )

  const source = showAlerts ? alerts : items

  const filtered = useMemo(() => {
    return source.filter((i) => {
      if (search   && !i.name.toLowerCase().includes(search.toLowerCase())) return false
      if (category && i.category !== category) return false
      return true
    })
  }, [source, search, category])

  const totalPages  = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageItems   = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const rangeStart  = filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1
  const rangeEnd    = Math.min(currentPage * PAGE_SIZE, filtered.length)

  const hasFilter = search !== '' || category !== ''

  const kpi = useMemo(() => ({
    total:    items.length,
    alerts:   alerts.length,
    active:   items.filter((i) => i.active).length,
    inactive: items.filter((i) => !i.active).length,
  }), [items, alerts])

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
          <h1 className="text-xl font-bold text-zinc-900">Estoque</h1>
          <p className="text-sm text-zinc-400 mt-0.5">Consumíveis e materiais de TI</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white bg-[#4f6ef7] hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Novo Item
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-500">Total de Itens</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-zinc-500" />
            </div>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{kpi.total}</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 cursor-pointer hover:border-amber-400 transition-colors" onClick={() => { setShowAlerts((v) => !v); setPage(1) }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-amber-700">Alertas de Estoque</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <TrendingDown className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-amber-900">{kpi.alerts}</p>
          <p className="text-xs text-amber-600 mt-1">{showAlerts ? 'Mostrar todos' : 'Ver alertas'}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-500">Ativos</span>
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
              <Package className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{kpi.active}</p>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-zinc-500">Inativos</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
              <Package className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
          <p className="text-3xl font-bold text-zinc-900">{kpi.inactive}</p>
        </div>
      </div>

      {/* Alert banner */}
      {showAlerts && kpi.alerts > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
          <p className="text-sm text-amber-800">
            <span className="font-semibold">{kpi.alerts} item(s)</span> com estoque abaixo do mínimo.
          </p>
          <button
            onClick={() => { setShowAlerts(false); setPage(1) }}
            className="ml-auto text-xs text-amber-600 hover:text-amber-800 underline"
          >
            Ver todos
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Buscar item"
            className="pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-lg bg-white text-zinc-800 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30 focus:border-[#4f6ef7] w-52"
          />
        </div>

        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); setPage(1) }}
          className={cn('border border-zinc-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#4f6ef7]/30', category ? 'text-zinc-800' : 'text-zinc-400')}
        >
          <option value="">Categoria</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {hasFilter && (
          <button
            onClick={() => { setSearch(''); setCategory(''); setPage(1) }}
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
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Item</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Categoria</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Localização</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500">Qtd. Atual</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-zinc-500">Qtd. Mínima</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-400">
                    <SearchX className="w-10 h-10" />
                    <p className="text-sm font-medium">Nenhum item encontrado</p>
                    {hasFilter && (
                      <button
                        onClick={() => { setSearch(''); setCategory(''); setPage(1) }}
                        className="text-xs text-[#4f6ef7] hover:underline"
                      >
                        Limpar filtros
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              pageItems.map((item) => (
                <tr
                  key={item.id}
                  className={cn(
                    'border-b border-zinc-100 last:border-0 hover:bg-zinc-50/60 transition-colors',
                    item.isBelowMinimum && 'bg-amber-50/40',
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {item.isBelowMinimum && (
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      )}
                      <span className="font-medium text-zinc-800">{item.name}</span>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-xs text-zinc-500">{item.category}</td>

                  <td className="px-4 py-3 text-xs text-zinc-400">{item.location ?? '—'}</td>

                  <td className={cn('px-4 py-3 text-sm font-semibold text-right', item.isBelowMinimum ? 'text-amber-600' : 'text-zinc-800')}>
                    {item.currentQuantity} <span className="text-xs font-normal text-zinc-400">{item.unit}</span>
                  </td>

                  <td className="px-4 py-3 text-xs text-zinc-400 text-right">
                    {item.minimumQuantity} {item.unit}
                  </td>

                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold',
                      item.active ? 'bg-green-50 text-green-700' : 'bg-zinc-100 text-zinc-500',
                    )}>
                      {item.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <button
                      onClick={() => navigate(`/app/inventory/stock/${item.id}`)}
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
              Mostrando {rangeStart}–{rangeEnd} de {filtered.length} itens
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

      {showModal && <CreateStockModal onClose={() => setShowModal(false)} />}
    </div>
  )
}
