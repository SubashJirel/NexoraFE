import { useState, useMemo } from 'react'
import {
  Search, CalendarCheck, MapPin, User, Building2,
  Calendar, Clock, SlidersHorizontal, X, Plus,
  Phone, FileText,
  CheckCircle2, Pencil, RefreshCw, Trash2,
} from 'lucide-react'
import {
  useSiteVisits,
  useCreateSiteVisit,
  useSiteVisit,
  useUpdateSiteVisit,
  useDeleteSiteVisit,
} from '@/hooks/useSiteVisits'
import { useAgents } from '@/hooks/useAgents'
import { useAuthStore } from '@/store/authStore'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { PageSpinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
import {
  SITE_VISIT_STATUSES, STATUS_MAP,
  formatScheduledAt, formatDate,
} from './siteVisitsConstants'

const EMPTY_FILTERS = {
  status:          '',
  assigned_agent:  '',
  date_from:       '',
  date_to:         '',
}

export default function SiteVisitsPage() {
  const [search,  setSearch]  = useState('')
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [showFilters, setShowFilters] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [drawerVisitId, setDrawerVisitId] = useState(null)

  // Build server-side query params — search + filters all go to the API
  const queryParams = useMemo(() => ({
    ...filters,
    ...(search.trim() ? { search: search.trim() } : {}),
  }), [filters, search])

  const { data: visits = [], isLoading, isError, isFetching, refetch } = useSiteVisits(queryParams)
  const { data: agents = [] } = useAgents()

  // ── Stats ─────────────────────────────────────────────────
  // Fetch unfiltered totals for the stats strip
  const { data: allVisits = [] } = useSiteVisits({})
  const stats = useMemo(() => ({
    total:      allVisits.length,
    requested:  allVisits.filter((v) => v.status === 'requested').length,
    scheduled:  allVisits.filter((v) => v.status === 'scheduled').length,
    completed:  allVisits.filter((v) => v.status === 'completed').length,
    no_show:    allVisits.filter((v) => v.status === 'no_show').length,
  }), [allVisits])

  const hasActiveFilters = Object.values(filters).some(Boolean) || search.trim()

  function clearAll() {
    setSearch('')
    setFilters(EMPTY_FILTERS)
  }

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">

      {/* ── Page header ─────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#263238]">Site Visits</h2>
          <p className="mt-1 text-sm text-[#637079]">
            Track and manage property site visits for your leads
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outlined"
            size="md"
            leftIcon={<RefreshCw size={15} className={isFetching ? 'animate-spin' : ''} />}
            onClick={() => refetch()}
            disabled={isFetching}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus size={15} />}
            onClick={() => setScheduleOpen(true)}
          >
            Schedule Visit
          </Button>
        </div>
      </div>

      {/* ── Stats strip ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Visits',  value: stats.total,     color: 'text-[#263238]' },
          { label: 'Requested',     value: stats.requested, color: 'text-violet-600' },
          { label: 'Scheduled',     value: stats.scheduled, color: 'text-blue-600'  },
          { label: 'Completed',     value: stats.completed, color: 'text-[#496B5A]' },
          { label: 'No Show',       value: stats.no_show,   color: 'text-amber-500' },
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

      {/* ── Search + filter bar ──────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b969d] pointer-events-none"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search lead, phone, property, notes…"
            className={cn(
              'w-full h-9 rounded-xl border border-[#DDE5E3] bg-white pl-9 pr-3',
              'text-sm text-[#263238] placeholder:text-[#8b969d]',
              'focus:outline-none focus:ring-2 focus:ring-[#496B5A]/30 focus:border-[#496B5A]',
              'transition-all duration-150'
            )}
          />
        </div>

        {/* Status filter pill */}
        <FilterPill
          value={filters.status}
          onChange={(v) => setFilter('status', v)}
          placeholder="Status: All"
          options={SITE_VISIT_STATUSES.map((s) => ({ value: s.value, label: s.label }))}
        />

        {/* Agent filter pill */}
        <FilterPill
          value={filters.assigned_agent}
          onChange={(v) => setFilter('assigned_agent', v)}
          placeholder="Agent: All"
          options={agents.map((a) => ({ value: String(a.id), label: a.full_name }))}
        />

        {/* Date range toggle */}
        <button
          onClick={() => setShowFilters((p) => !p)}
          className={cn(
            'h-9 px-3 flex items-center gap-1.5 rounded-xl border text-sm transition-colors',
            (filters.date_from || filters.date_to || showFilters)
              ? 'border-[#496B5A] bg-[#eef3f0] text-[#496B5A] font-medium'
              : 'border-[#DDE5E3] text-[#637079] hover:border-[#B8C9C5] bg-white'
          )}
        >
          <SlidersHorizontal size={14} />
          <span className="hidden sm:inline">Date Range</span>
        </button>

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-[#637079] hover:text-[#ef4444] transition-colors px-1"
          >
            <X size={12} />
            Clear all
          </button>
        )}
      </div>

      {/* ── Date range panel ─────────────────────────────── */}
      {showFilters && (
        <div className="bg-white border border-[#DDE5E3] rounded-xl p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-[10px] font-semibold text-[#8b969d] uppercase tracking-wide">
                From Date
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilter('date_from', e.target.value)}
                className={cn(
                  'h-9 rounded-lg border bg-white px-3 text-sm text-[#263238]',
                  'focus:outline-none focus:ring-2 focus:ring-[#496B5A]/30 focus:border-[#496B5A]',
                  'border-[#DDE5E3] transition-colors'
                )}
              />
            </div>
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-[10px] font-semibold text-[#8b969d] uppercase tracking-wide">
                To Date
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilter('date_to', e.target.value)}
                className={cn(
                  'h-9 rounded-lg border bg-white px-3 text-sm text-[#263238]',
                  'focus:outline-none focus:ring-2 focus:ring-[#496B5A]/30 focus:border-[#496B5A]',
                  'border-[#DDE5E3] transition-colors'
                )}
              />
            </div>
            {(filters.date_from || filters.date_to) && (
              <button
                onClick={() => setFilters((p) => ({ ...p, date_from: '', date_to: '' }))}
                className="h-9 text-xs text-[#637079] hover:text-[#ef4444] transition-colors"
              >
                Clear dates
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Result count ─────────────────────────────────── */}
      {!isLoading && !isError && (
        <p className="text-xs text-[#8b969d]">
          Showing{' '}
          <span className="font-semibold text-[#263238]">{visits.length}</span>{' '}
          site visit{visits.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* ── Content ──────────────────────────────────────── */}
      {isLoading ? (
        <PageSpinner />
      ) : isError ? (
        <ErrorState />
      ) : visits.length === 0 ? (
        <EmptyState hasFilters={Boolean(hasActiveFilters)} onClear={clearAll} />
      ) : (
        <SiteVisitsTable visits={visits} onRowClick={(v) => setDrawerVisitId(v.id)} />
      )}

      {/* ── Modal ────────────────────────────────────────── */}
      {scheduleOpen && (
        <ScheduleVisitModal onClose={() => setScheduleOpen(false)} />
      )}

      {/* ── Detail drawer ────────────────────────────────── */}
      {drawerVisitId && (
        <SiteVisitDrawer
          visitId={drawerVisitId}
          onClose={() => setDrawerVisitId(null)}
        />
      )}
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────────
function SiteVisitsTable({ visits, onRowClick }) {
  return (
    <div className="bg-white rounded-2xl border border-[#DDE5E3] overflow-hidden">
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#DDE5E3] bg-[#F8FAFA]">
              <Th>Lead</Th>
              <Th>Property</Th>
              <Th>Agent</Th>
              <Th>Scheduled</Th>
              <Th>Status</Th>
              <Th>Notes</Th>
            </tr>
          </thead>
          <tbody>
            {visits.map((visit) => (
              <tr
                key={visit.id}
                onClick={() => onRowClick(visit)}
                className="border-b border-[#DDE5E3] last:border-0 transition-colors hover:bg-[#F8FAFA] cursor-pointer"
              >
                {/* Lead */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-full bg-[#eef3f0] flex items-center justify-center shrink-0 text-xs font-bold text-[#496B5A]">
                      {(visit.lead_name || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-[#263238] text-sm leading-tight">
                        {visit.lead_name || `Lead #${visit.lead}`}
                      </p>
                      <p className="text-[11px] text-[#8b969d]">ID #{visit.lead}</p>
                    </div>
                  </div>
                </td>

                {/* Property */}
                <td className="px-4 py-3">
                  <div className="flex items-start gap-1.5">
                    <Building2 size={13} className="text-[#8b969d] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm text-[#263238] font-medium leading-tight">
                        {visit.property_title || `Property #${visit.property}`}
                      </p>
                      {visit.property_location && (
                        <p className="text-[11px] text-[#8b969d] flex items-center gap-1 mt-0.5">
                          <MapPin size={10} />
                          {visit.property_location}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Agent */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-[#637079]">
                    <User size={13} className="shrink-0" />
                    <span className="text-sm">
                      {visit.assigned_agent_name || 'Unassigned'}
                    </span>
                  </div>
                </td>

                {/* Scheduled at */}
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm text-[#263238] flex items-center gap-1">
                      <Calendar size={12} className="text-[#8b969d]" />
                      {formatDate(visit.scheduled_at)}
                    </span>
                    <span className="text-[11px] text-[#8b969d] flex items-center gap-1 pl-4">
                      <Clock size={10} />
                      {visit.scheduled_at
                        ? new Date(visit.scheduled_at).toLocaleTimeString('en-IN', {
                            hour: '2-digit', minute: '2-digit',
                          })
                        : '—'}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="px-4 py-3">
                  <StatusBadge status={visit.status} />
                </td>

                {/* Notes */}
                <td className="px-4 py-3 max-w-[200px]">
                  {visit.notes ? (
                    <p className="text-xs text-[#637079] truncate" title={visit.notes}>
                      {visit.notes}
                    </p>
                  ) : (
                    <span className="text-xs text-[#DDE5E3]">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden divide-y divide-[#DDE5E3]">
        {visits.map((visit) => (
          <SiteVisitCard key={visit.id} visit={visit} onClick={() => onRowClick(visit)} />
        ))}
      </div>
    </div>
  )
}

function Th({ children }) {
  return (
    <th className="px-4 py-3 text-left text-[10px] font-semibold text-[#8b969d] uppercase tracking-wider">
      {children}
    </th>
  )
}

// ── Mobile card ───────────────────────────────────────────────
function SiteVisitCard({ visit, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 space-y-3 hover:bg-[#F8FAFA] transition-colors"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-9 w-9 rounded-full bg-[#eef3f0] flex items-center justify-center shrink-0 text-sm font-bold text-[#496B5A]">
            {(visit.lead_name || '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-[#263238] text-sm truncate">
              {visit.lead_name || `Lead #${visit.lead}`}
            </p>
            <p className="text-[11px] text-[#8b969d] truncate">
              {visit.property_title || `Property #${visit.property}`}
            </p>
          </div>
        </div>
        <StatusBadge status={visit.status} />
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-2 text-xs text-[#637079]">
        <div className="flex items-center gap-1.5">
          <Calendar size={11} className="shrink-0" />
          <span>{formatScheduledAt(visit.scheduled_at)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User size={11} className="shrink-0" />
          <span className="truncate">{visit.assigned_agent_name || 'Unassigned'}</span>
        </div>
        {visit.property_location && (
          <div className="flex items-center gap-1.5 col-span-2">
            <MapPin size={11} className="shrink-0" />
            <span className="truncate">{visit.property_location}</span>
          </div>
        )}
      </div>

      {/* Notes */}
      {visit.notes && (
        <p className="text-xs text-[#637079] bg-[#F8FAFA] rounded-lg px-3 py-2 leading-relaxed">
          {visit.notes}
        </p>
      )}
    </button>
  )
}

// ── Shared helpers ────────────────────────────────────────────
function StatusBadge({ status }) {
  const info = STATUS_MAP[status]
  return (
    <Badge variant={info?.badge ?? 'neutral'} dot size="sm">
      {info?.label ?? status}
    </Badge>
  )
}

function FilterPill({ value, onChange, placeholder, options }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          'h-9 rounded-xl border text-sm pl-3 pr-8 appearance-none cursor-pointer bg-white',
          'focus:outline-none focus:ring-2 focus:ring-[#496B5A]/30 focus:border-[#496B5A]',
          'transition-colors',
          value
            ? 'border-[#496B5A] text-[#496B5A] font-medium'
            : 'border-[#DDE5E3] text-[#637079]'
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

function EmptyState({ hasFilters, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="h-16 w-16 rounded-2xl bg-[#eef3f0] flex items-center justify-center">
        {hasFilters
          ? <Search size={28} className="text-[#496B5A]" />
          : <CalendarCheck size={28} className="text-[#496B5A]" />
        }
      </div>
      <div>
        <p className="text-base font-semibold text-[#263238]">
          {hasFilters ? 'No matching site visits' : 'No site visits yet'}
        </p>
        <p className="mt-1 text-sm text-[#637079]">
          {hasFilters
            ? 'Try adjusting your search or filters.'
            : 'Site visits will appear here once scheduled.'}
        </p>
      </div>
      {hasFilters && (
        <Button variant="outlined" size="sm" onClick={onClear}>Clear filters</Button>
      )}
    </div>
  )
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
      <p className="text-base font-semibold text-[#263238]">Failed to load site visits</p>
      <p className="text-sm text-[#637079]">Check your connection and try again.</p>
      <Button variant="outlined" size="sm" onClick={() => window.location.reload()}>Retry</Button>
    </div>
  )
}

// ── Schedule Visit Modal ──────────────────────────────────────
const EMPTY_FORM = {
  lead:            '',
  property:        '',
  assigned_agent:  '',
  scheduled_at:    '',
  status:          'scheduled',
  notes:           '',
}

function ScheduleVisitModal({ onClose }) {
  const { data: agents = [] } = useAgents()
  const [form, setForm]     = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  const createMutation = useCreateSiteVisit({ onSuccess: onClose })

  function set(field, value) {
    setForm((p) => ({ ...p, [field]: value }))
    if (errors[field]) setErrors((p) => ({ ...p, [field]: undefined }))
  }

  function validate() {
    const e = {}
    if (!form.lead.toString().trim())         e.lead         = 'Lead ID is required.'
    if (!form.property.toString().trim())     e.property     = 'Property ID is required.'
    if (!form.scheduled_at)                   e.scheduled_at = 'Scheduled date & time is required.'
    return e
  }

  function handleSubmit(ev) {
    ev.preventDefault()
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }

    createMutation.mutate({
      lead:           Number(form.lead),
      property:       Number(form.property),
      assigned_agent: form.assigned_agent ? Number(form.assigned_agent) : null,
      // Convert local datetime-local value to ISO string
      scheduled_at:   new Date(form.scheduled_at).toISOString(),
      status:         form.status,
      notes:          form.notes || null,
    })
  }

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-visit-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDE5E3] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#eef3f0] flex items-center justify-center">
              <CalendarCheck size={16} className="text-[#496B5A]" />
            </div>
            <h2 id="schedule-visit-title" className="text-base font-semibold text-[#263238]">
              Schedule Site Visit
            </h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#637079] hover:bg-[#F8FAFA] transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto flex-1">
          <div className="px-6 py-5 space-y-5">

            {/* Visit details */}
            <FormSection title="Visit Details">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Lead ID *"
                  type="number"
                  placeholder="e.g. 12"
                  value={form.lead}
                  onChange={(e) => set('lead', e.target.value)}
                  error={errors.lead}
                  disabled={createMutation.isPending}
                  autoFocus
                />
                <Input
                  label="Property ID *"
                  type="number"
                  placeholder="e.g. 5"
                  value={form.property}
                  onChange={(e) => set('property', e.target.value)}
                  error={errors.property}
                  disabled={createMutation.isPending}
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Scheduled At *"
                    type="datetime-local"
                    value={form.scheduled_at}
                    onChange={(e) => set('scheduled_at', e.target.value)}
                    error={errors.scheduled_at}
                    disabled={createMutation.isPending}
                  />
                </div>
              </div>
            </FormSection>

            {/* Assignment & status */}
            <FormSection title="Assignment">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Assigned Agent"
                  value={form.assigned_agent}
                  onChange={(e) => set('assigned_agent', e.target.value)}
                  disabled={createMutation.isPending}
                >
                  <option value="">— Unassigned —</option>
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>{a.full_name}</option>
                  ))}
                </Select>
                <Select
                  label="Status"
                  value={form.status}
                  onChange={(e) => set('status', e.target.value)}
                  disabled={createMutation.isPending}
                >
                  {SITE_VISIT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </Select>
              </div>
            </FormSection>

            {/* Notes */}
            <FormSection title="Notes">
              <Textarea
                placeholder="Any special instructions or notes for this visit…"
                rows={3}
                value={form.notes}
                onChange={(e) => set('notes', e.target.value)}
                disabled={createMutation.isPending}
              />
            </FormSection>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-6 pb-5 shrink-0">
            <Button
              variant="outlined"
              size="md"
              type="button"
              onClick={onClose}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              loading={createMutation.isPending}
            >
              Schedule Visit
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function FormSection({ title, children }) {
  return (
    <div>
      <p className="text-xs font-semibold text-[#8b969d] uppercase tracking-wider mb-3">{title}</p>
      {children}
    </div>
  )
}

// ── Site Visit Drawer ─────────────────────────────────────────
function SiteVisitDrawer({ visitId, onClose }) {
  const { data: visit, isLoading, isError } = useSiteVisit(visitId)

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[250] bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed right-0 top-0 z-[260] h-screen w-full max-w-md bg-white shadow-2xl flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Site visit details"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DDE5E3] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#eef3f0] flex items-center justify-center shrink-0">
              <CalendarCheck size={15} className="text-[#496B5A]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#263238]">Site Visit Details</p>
              {visit && (
                <p className="text-[11px] text-[#8b969d]">Visit #{visit.id}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[#637079] hover:bg-[#F8FAFA] transition-colors"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center h-full">
              <div className="h-6 w-6 rounded-full border-2 border-[#496B5A] border-t-transparent animate-spin" />
            </div>
          )}

          {isError && (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <p className="text-sm font-semibold text-[#263238]">Failed to load visit</p>
              <p className="text-xs text-[#637079]">Check your connection and try again.</p>
            </div>
          )}

          {visit && (
            <div className="p-5 space-y-6">

              {/* Status banner */}
              <div className="flex items-center justify-between bg-[#F8FAFA] rounded-xl border border-[#DDE5E3] px-4 py-3">
                <span className="text-xs font-semibold text-[#8b969d] uppercase tracking-wider">Status</span>
                <StatusBadge status={visit.status} />
              </div>

              <VisitLifecycle visit={visit} onDeleted={onClose} />

              {/* Lead */}
              <DrawerSection title="Lead">
                <DrawerRow icon={User} label="Name"    value={visit.lead_name     || `Lead #${visit.lead}`} />
                <DrawerRow icon={FileText} label="Lead ID" value={`#${visit.lead}`} />
                {visit.created_by_name && (
                  <DrawerRow icon={User} label="Created by" value={visit.created_by_name} />
                )}
              </DrawerSection>

              {/* Property */}
              <DrawerSection title="Property">
                <DrawerRow icon={Building2} label="Title"    value={visit.property_title    || `Property #${visit.property}`} />
                <DrawerRow icon={MapPin}    label="Location" value={visit.property_location || '—'} />
                <DrawerRow icon={FileText}  label="Property ID" value={`#${visit.property}`} />
              </DrawerSection>

              {/* Schedule */}
              <DrawerSection title="Schedule">
                <DrawerRow
                  icon={Calendar}
                  label="Date"
                  value={formatDate(visit.scheduled_at)}
                />
                <DrawerRow
                  icon={Clock}
                  label="Time"
                  value={
                    visit.scheduled_at
                      ? new Date(visit.scheduled_at).toLocaleTimeString('en-IN', {
                          hour: '2-digit', minute: '2-digit',
                        })
                      : '—'
                  }
                />
                <DrawerRow icon={User} label="Agent" value={visit.assigned_agent_name || 'Unassigned'} />
              </DrawerSection>

              {/* Notes */}
              {visit.notes && (
                <DrawerSection title="Notes">
                  <p className="text-sm text-[#637079] leading-relaxed whitespace-pre-line">
                    {visit.notes}
                  </p>
                </DrawerSection>
              )}

              {(visit.outcome || visit.cancellation_reason) && (
                <DrawerSection title="Result">
                  {visit.outcome && <DrawerRow icon={CheckCircle2} label="Outcome" value={visit.outcome} />}
                  {visit.cancellation_reason && <DrawerRow icon={X} label="Cancelled" value={visit.cancellation_reason} valueClassName="text-red-500" />}
                  {visit.completed_at && <DrawerRow icon={CalendarCheck} label="Completed" value={formatScheduledAt(visit.completed_at)} />}
                </DrawerSection>
              )}

              {/* Meta */}
              <DrawerSection title="Meta">
                <DrawerRow
                  icon={Calendar}
                  label="Created"
                  value={formatScheduledAt(visit.created_at)}
                />
                <DrawerRow
                  icon={Calendar}
                  label="Updated"
                  value={formatScheduledAt(visit.updated_at)}
                />
                {visit.scheduled_email_sent_at && (
                  <DrawerRow
                    icon={Phone}
                    label="Email sent"
                    value={formatScheduledAt(visit.scheduled_email_sent_at)}
                  />
                )}
                {visit.scheduled_email_error && (
                  <DrawerRow
                    icon={Phone}
                    label="Email error"
                    value={visit.scheduled_email_error}
                    valueClassName="text-red-500"
                  />
                )}
                {visit.reminder_sent_at && <DrawerRow icon={CheckCircle2} label="Reminder" value={formatScheduledAt(visit.reminder_sent_at)} />}
                {visit.reminder_error && <DrawerRow icon={X} label="Reminder error" value={visit.reminder_error} valueClassName="text-red-500" />}
              </DrawerSection>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function VisitLifecycle({ visit, onDeleted }) {
  const role = useAuthStore((state) => state.user?.role)
  const { data: agents = [] } = useAgents()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState(() => ({
    scheduled_at: toLocalDateTime(visit.scheduled_at),
    status: visit.status,
    assigned_agent: visit.assigned_agent || '',
    notes: visit.notes || '',
    outcome: visit.outcome || '',
    cancellation_reason: visit.cancellation_reason || '',
  }))
  const update = useUpdateSiteVisit(visit.id, { onSuccess: () => setEditing(false) })
  const remove = useDeleteSiteVisit(visit.id, { onSuccess: onDeleted })
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  function submit(event) {
    event.preventDefault()
    update.mutate({
      scheduled_at: new Date(form.scheduled_at).toISOString(),
      status: form.status,
      notes: form.notes,
      outcome: form.outcome,
      cancellation_reason: form.cancellation_reason,
      ...(role !== 'agent' ? { assigned_agent: form.assigned_agent ? Number(form.assigned_agent) : null } : {}),
    })
  }

  if (!editing) {
    return (
      <div className="flex gap-2">
        <Button size="sm" variant="outlined" leftIcon={<Pencil size={13} />} onClick={() => setEditing(true)}>Manage visit</Button>
        <Button size="sm" variant="ghost-danger" leftIcon={<Trash2 size={13} />} loading={remove.isPending} onClick={() => window.confirm('Delete this site visit?') && remove.mutate()}>Delete</Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-[#DDE5E3] bg-[#F8FAFA] p-4">
      <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wider text-[#637079]">Manage lifecycle</p><button type="button" onClick={() => setEditing(false)}><X size={15} /></button></div>
      <Input label="Scheduled at" type="datetime-local" size="sm" value={form.scheduled_at} onChange={(e) => set('scheduled_at', e.target.value)} required />
      <div className="grid grid-cols-2 gap-3">
        <Select label="Status" size="sm" value={form.status} onChange={(e) => set('status', e.target.value)}>{SITE_VISIT_STATUSES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</Select>
        {role !== 'agent' && <Select label="Assigned agent" size="sm" value={form.assigned_agent} onChange={(e) => set('assigned_agent', e.target.value)}><option value="">Unassigned</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.full_name}</option>)}</Select>}
      </div>
      {form.status === 'completed' && <Textarea label="Outcome" rows={2} value={form.outcome} onChange={(e) => set('outcome', e.target.value)} />}
      {form.status === 'cancelled' && <Textarea label="Cancellation reason" rows={2} value={form.cancellation_reason} onChange={(e) => set('cancellation_reason', e.target.value)} required />}
      <Textarea label="Notes" rows={2} value={form.notes} onChange={(e) => set('notes', e.target.value)} />
      <div className="flex justify-end gap-2"><Button type="button" size="sm" variant="outlined" onClick={() => setEditing(false)}>Cancel</Button><Button type="submit" size="sm" loading={update.isPending}>Save</Button></div>
    </form>
  )
}

function toLocalDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function DrawerSection({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-[#8b969d] uppercase tracking-wider mb-2.5">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function DrawerRow({ icon: Icon, label, value, valueClassName }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-7 w-7 rounded-lg bg-[#F8FAFA] border border-[#DDE5E3] flex items-center justify-center shrink-0">
        <Icon size={13} className="text-[#637079]" />
      </div>
      <span className="text-xs text-[#8b969d] w-20 shrink-0">{label}</span>
      <span className={cn('text-sm text-[#263238] font-medium', valueClassName)}>{value}</span>
    </div>
  )
}
