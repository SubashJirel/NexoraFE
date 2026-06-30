import { useState, useMemo } from 'react'
import {
  Search, CalendarCheck, MapPin, User, Building2,
  Calendar, Clock, SlidersHorizontal, X,
} from 'lucide-react'
import { useSiteVisits } from '@/hooks/useSiteVisits'
import { useAgents } from '@/hooks/useAgents'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
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

  // Build server-side query params — search + filters all go to the API
  const queryParams = useMemo(() => ({
    ...filters,
    ...(search.trim() ? { search: search.trim() } : {}),
  }), [filters, search])

  const { data: visits = [], isLoading, isError } = useSiteVisits(queryParams)
  const { data: agents = [] } = useAgents()

  // ── Stats ─────────────────────────────────────────────────
  // Fetch unfiltered totals for the stats strip
  const { data: allVisits = [] } = useSiteVisits({})
  const stats = useMemo(() => ({
    total:      allVisits.length,
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
      </div>

      {/* ── Stats strip ─────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Visits',  value: stats.total,     color: 'text-[#263238]' },
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
        <SiteVisitsTable visits={visits} />
      )}
    </div>
  )
}

// ── Table ─────────────────────────────────────────────────────
function SiteVisitsTable({ visits }) {
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
            {visits.map((visit, i) => (
              <tr
                key={visit.id}
                className={cn(
                  'border-b border-[#DDE5E3] last:border-0 transition-colors hover:bg-[#F8FAFA]',
                )}
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
          <SiteVisitCard key={visit.id} visit={visit} />
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
function SiteVisitCard({ visit }) {
  return (
    <div className="p-4 space-y-3">
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
    </div>
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
