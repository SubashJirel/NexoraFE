import { useState, useMemo } from 'react'
import { Plus, Search, LayoutGrid, Table2, Trash2, PhoneCall } from 'lucide-react'
import { useLeads, useDeleteLead } from '@/hooks/useLeads'
import { useAgents } from '@/hooks/useAgents'
import Button from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'

import LeadsKanban    from './components/LeadsKanban'
import LeadsTable     from './components/LeadsTable'
import LeadFormModal  from './components/LeadFormModal'
import LeadDrawer     from './components/LeadDrawer'
import { LEAD_STATUSES, LEAD_SOURCES, STATUS_MAP } from './leadsConstants'

export default function LeadsPage() {
  const { data: leads = [], isLoading, isError } = useLeads()
  const { data: agents = [] } = useAgents()

  // ── View / filters ────────────────────────────────────────
  const [view,         setView]        = useState('kanban') // kanban | table
  const [search,       setSearch]      = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterAgent,  setFilterAgent]  = useState('')
  const [filterStatus, setFilterStatus] = useState('')

  // ── Modals / drawer ───────────────────────────────────────
  const [addOpen,      setAddOpen]      = useState(false)
  const [editLead,     setEditLead]     = useState(null)
  const [drawerLead,   setDrawerLead]   = useState(null)
  const [deleteLead,   setDeleteLead]   = useState(null)

  // ── Filtered leads ────────────────────────────────────────
  const filtered = useMemo(() => {
    return leads.filter((l) => {
      if (filterSource && l.source !== filterSource)                      return false
      if (filterStatus && l.status !== filterStatus)                      return false
      if (filterAgent  && String(
        typeof l.assigned_agent === 'object' ? l.assigned_agent?.id : l.assigned_agent
      ) !== filterAgent) return false
      if (search) {
        const q = search.toLowerCase()
        const hay = `${l.full_name} ${l.phone} ${l.email} ${l.preferred_location}`.toLowerCase()
        if (!hay.includes(q)) return false
      }
      return true
    })
  }, [leads, filterSource, filterStatus, filterAgent, search])

  // ── Stats ─────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total    = leads.length
    const newCount = leads.filter((l) => l.status === 'new').length
    const hot      = leads.filter((l) => ['interested','negotiation'].includes(l.status)).length
    const closed   = leads.filter((l) => l.status === 'closed').length
    return { total, newCount, hot, closed }
  }, [leads])

  // Sync drawer lead with updated data
  const liveDrawerLead = drawerLead
    ? (leads.find((l) => String(l.id) === String(drawerLead.id)) ?? drawerLead)
    : null

  if (isLoading) return <PageSpinner />
  if (isError)   return <ErrorState />

  return (
    <div className="space-y-5">

      {/* ── Page header ──────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#263238]">Leads CRM</h2>
          <p className="mt-1 text-sm text-[#637079]">
            Manage your property pipeline and conversions
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-[#DDE5E3] bg-white overflow-hidden">
            <ViewToggle active={view === 'kanban'} onClick={() => setView('kanban')} label="Kanban">
              <LayoutGrid size={15} />
              <span className="hidden sm:inline text-xs">Kanban</span>
            </ViewToggle>
            <ViewToggle active={view === 'table'} onClick={() => setView('table')} label="Table">
              <Table2 size={15} />
              <span className="hidden sm:inline text-xs">Table</span>
            </ViewToggle>
          </div>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={15} />}
            onClick={() => setAddOpen(true)}
          >
            Add New Lead
          </Button>
        </div>
      </div>

      {/* ── Stats strip ──────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Leads',  value: stats.total,    color: 'text-[#263238]' },
          { label: 'New Inquiries',value: stats.newCount, color: 'text-blue-600'  },
          { label: 'Hot Leads',    value: stats.hot,      color: 'text-amber-500' },
          { label: 'Closed',       value: stats.closed,   color: 'text-[#496B5A]' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-[#DDE5E3] px-4 py-3 flex items-center justify-between"
          >
            <span className="text-xs text-[#637079] font-medium">{s.label}</span>
            <span className={cn('text-xl font-bold', s.color)}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* ── Filters bar ──────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b969d] pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads, phone, location…"
            className={cn(
              'w-full h-9 rounded-xl border border-[#DDE5E3] bg-white pl-9 pr-3',
              'text-sm text-[#263238] placeholder:text-[#8b969d]',
              'focus:outline-none focus:ring-2 focus:ring-[#496B5A]/30 focus:border-[#496B5A]',
              'transition-all duration-150'
            )}
          />
        </div>

        <FilterPill
          value={filterSource}
          onChange={setFilterSource}
          placeholder="Source: All"
          options={LEAD_SOURCES}
        />
        <FilterPill
          value={filterAgent}
          onChange={setFilterAgent}
          placeholder="Agent: All"
          options={agents.map((a) => ({ value: String(a.id), label: a.full_name }))}
        />
        <FilterPill
          value={filterStatus}
          onChange={setFilterStatus}
          placeholder="Status: All"
          options={LEAD_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
        />

        {(filterSource || filterAgent || filterStatus || search) && (
          <button
            onClick={() => { setFilterSource(''); setFilterAgent(''); setFilterStatus(''); setSearch('') }}
            className="text-xs text-[#637079] hover:text-[#ef4444] transition-colors px-2"
          >
            Clear all
          </button>
        )}
      </div>

      {/* ── Result count ─────────────────────────────────── */}
      <p className="text-xs text-[#8b969d]">
        Showing <span className="font-semibold text-[#263238]">{filtered.length}</span> of {leads.length} leads
      </p>

      {/* ── Content ──────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <EmptyState
          hasFilters={Boolean(filterSource || filterAgent || filterStatus || search)}
          onClear={() => { setFilterSource(''); setFilterAgent(''); setFilterStatus(''); setSearch('') }}
          onAdd={() => setAddOpen(true)}
        />
      ) : view === 'kanban' ? (
        <LeadsKanban
          leads={filtered}
          onCardClick={(lead) => setDrawerLead(lead)}
          onEdit={(lead) => setEditLead(lead)}
          onDelete={(lead) => setDeleteLead(lead)}
        />
      ) : (
        <LeadsTable
          leads={filtered}
          onRowClick={(lead) => setDrawerLead(lead)}
          onEdit={(lead) => setEditLead(lead)}
          onDelete={(lead) => setDeleteLead(lead)}
        />
      )}

      {/* ── Modals ───────────────────────────────────────── */}
      {addOpen && (
        <LeadFormModal onClose={() => setAddOpen(false)} />
      )}

      {editLead && (
        <LeadFormModal
          lead={editLead}
          onClose={() => setEditLead(null)}
        />
      )}

      {liveDrawerLead && (
        <LeadDrawer
          lead={liveDrawerLead}
          onClose={() => setDrawerLead(null)}
          onEdit={() => { setEditLead(liveDrawerLead); setDrawerLead(null) }}
        />
      )}

      {deleteLead && (
        <DeleteConfirmModal
          lead={deleteLead}
          onClose={() => setDeleteLead(null)}
        />
      )}
    </div>
  )
}

// ── DeleteConfirmModal ─────────────────────────────────────────
function DeleteConfirmModal({ lead, onClose }) {
  const deleteMutation = useDeleteLead(lead.id, { onSuccess: onClose })

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-4"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <Trash2 size={18} className="text-[#ef4444]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#263238]">Delete Lead</p>
            <p className="text-xs text-[#637079]">This cannot be undone.</p>
          </div>
        </div>
        <p className="text-sm text-[#637079]">
          Delete <span className="font-semibold text-[#263238]">{lead.full_name}</span> and all their interactions and interests?
        </p>
        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outlined" size="md" onClick={onClose} disabled={deleteMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            size="md"
            loading={deleteMutation.isPending}
            onClick={() => deleteMutation.mutate()}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────
function ViewToggle({ active, onClick, label, children }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        'flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors',
        active ? 'bg-[#496B5A] text-white' : 'text-[#637079] hover:bg-[#F8FAFA]'
      )}
    >
      {children}
    </button>
  )
}

function FilterPill({ value, onChange, placeholder, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-9 rounded-xl border text-sm pl-3 pr-8 appearance-none cursor-pointer',
          'focus:outline-none focus:ring-2 focus:ring-[#496B5A]/30 focus:border-[#496B5A]',
          'transition-colors bg-white',
          value ? 'border-[#496B5A] text-[#496B5A] font-medium' : 'border-[#DDE5E3] text-[#637079]'
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23637079' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundRepeat:   'no-repeat',
          backgroundPosition: 'right 0.6rem center',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

function EmptyState({ hasFilters, onClear, onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-[#eef3f0] flex items-center justify-center">
        {hasFilters
          ? <Search size={28} className="text-[#496B5A]" />
          : <PhoneCall size={28} className="text-[#496B5A]" />
        }
      </div>
      <div>
        <p className="text-base font-semibold text-[#263238]">
          {hasFilters ? 'No matching leads' : 'No leads yet'}
        </p>
        <p className="mt-1 text-sm text-[#637079]">
          {hasFilters ? 'Adjust your filters or search.' : 'Add your first lead to start your pipeline.'}
        </p>
      </div>
      {hasFilters
        ? <Button variant="outlined" size="sm" onClick={onClear}>Clear filters</Button>
        : <Button variant="primary" size="sm" leftIcon={<Plus size={14} />} onClick={onAdd}>Add Lead</Button>
      }
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
      <p className="text-base font-semibold text-[#263238]">Failed to load leads</p>
      <p className="text-sm text-[#637079]">Check your connection and try again.</p>
      <Button variant="outlined" size="sm" onClick={() => window.location.reload()}>Retry</Button>
    </div>
  )
}
