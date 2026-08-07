import { cn } from '@/lib/cn'
import Avatar from '@/components/ui/Avatar'
import Select from '@/components/ui/Select'
import { Spinner } from '@/components/ui/index'
import { useAgents } from '@/hooks/useAgents'

const STATUS_OPTIONS = [
  { value: 'reserved',          label: 'Reserved — temporarily held' },
  { value: 'withdrawn',         label: 'Withdrawn — removed by owner or agency' },
  { value: 'draft',             label: 'Draft — save without publishing' },
  { value: 'available',         label: 'Available — visible on website' },
  { value: 'under_negotiation', label: 'Under Negotiation — deal in progress' },
  { value: 'sold',              label: 'Sold' },
  { value: 'rented',            label: 'Rented' },
  { value: 'hidden',            label: 'Hidden — not visible publicly' },
  { value: 'archived',          label: 'Archived — no longer active' },
]

export default function Step6Publish({ form, errors, onChange }) {
  const { data: agents = [], isLoading: agentsLoading, isError: agentsError } = useAgents()

  // The agent selected in the form (used in the summary card)
  const selectedAgent = agents.find((a) => a.id === form.assigned_agent)

  return (
    <div className="space-y-5">

      {/* ── Assign to Agent ───────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[#263238]">Assign to Agent</span>

        {agentsLoading && (
          <div className="flex items-center gap-2 text-sm text-[#637079] py-3">
            <Spinner size="sm" /> Loading agents…
          </div>
        )}

        {agentsError && (
          <p className="text-xs text-[#ef4444]">
            Failed to load agents. Check your connection.
          </p>
        )}

        {!agentsLoading && !agentsError && agents.length === 0 && (
          <p className="text-xs text-[#8b969d]">
            No agents found. Add agents from the Agents section first.
          </p>
        )}

        {!agentsLoading && agents.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {agents
              .filter((a) => a.is_active)   // only show active agents
              .map((agent) => {
                const active = form.assigned_agent === agent.id
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => onChange('assigned_agent', active ? null : agent.id)}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all duration-150',
                      active
                        ? 'border-[#496B5A] bg-[#eef3f0] shadow-sm'
                        : 'border-[#DDE5E3] bg-white hover:border-[#B8C9C5]'
                    )}
                  >
                    <Avatar alt={agent.full_name} size="sm" />
                    <div className="text-left">
                      <p className={cn(
                        'text-sm font-medium leading-tight',
                        active ? 'text-[#496B5A]' : 'text-[#263238]'
                      )}>
                        {agent.full_name}
                      </p>
                      <p className="text-[10px] text-[#8b969d]">{agent.email}</p>
                    </div>
                    {active && (
                      <span className="ml-1 text-[10px] bg-[#496B5A] text-white px-1.5 py-0.5 rounded-full shrink-0">
                        Selected
                      </span>
                    )}
                  </button>
                )
              })}
          </div>
        )}
      </div>

      {/* ── Status ───────────────────────────────────────── */}
      <Select
        label="Property Status"
        value={form.status}
        onChange={(e) => onChange('status', e.target.value)}
        error={errors.status}
      >
        {STATUS_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </Select>
      {form.status === 'withdrawn' && <div><label className="text-sm font-medium text-[#263238]">Reason for withdrawal<textarea rows="3" value={form.withdrawal_reason} onChange={(event) => onChange('withdrawal_reason', event.target.value)} className="mt-1.5 w-full rounded-lg border border-[#DDE5E3] px-3 py-2 text-sm outline-none focus:border-[#496B5A]" placeholder="e.g. Owner withdrew the listing" /></label></div>}

      {/* ── Toggles ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">
        <Toggle
          label="Publish to Website"
          hint="Sets is_published = true"
          checked={form.is_published}
          onChange={(v) => onChange('is_published', v)}
        />
        <Toggle
          label="Featured Listing"
          hint="Sets is_featured = true"
          checked={form.is_featured}
          onChange={(v) => onChange('is_featured', v)}
        />
      </div>

      {/* ── Submission summary ────────────────────────────── */}
      <div className="rounded-xl border border-[#DDE5E3] bg-[#F8FAFA] p-4 space-y-3">
        <p className="text-xs font-semibold text-[#496B5A] uppercase tracking-wide">
          Submission Summary
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-[#637079]">
          <SummaryRow label="Title"     value={form.title || '—'} />
          <SummaryRow label="Type"      value={cap(form.property_type) || '—'} />
          <SummaryRow label="Purpose"   value={cap(form.purpose) || '—'} />
          <SummaryRow label="Price"     value={form.price ? `${form.currency} ${Number(form.price).toLocaleString()}` : '—'} />
          <SummaryRow label="Location"  value={[form.city, form.district].filter(Boolean).join(', ') || '—'} />
          <SummaryRow label="Status"    value={cap(form.status) || 'draft'} />
          <SummaryRow label="Published" value={form.is_published ? 'Yes' : 'No'} />
          <SummaryRow label="Featured"  value={form.is_featured  ? 'Yes' : 'No'} />
          <SummaryRow label="Agent"     value={selectedAgent?.full_name || 'Unassigned'} />
          <SummaryRow label="Land area" value={form.land_area_value ? `${form.land_area_value} ${form.land_area_unit}` : '—'} />
        </div>
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────
function cap(s) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''
}

function Toggle({ label, hint, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#DDE5E3] bg-white px-4 py-3">
      <div>
        <p className="text-sm font-medium text-[#263238]">{label}</p>
        {hint && <p className="text-xs text-[#8b969d]">{hint}</p>}
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        className={cn(
          'relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
          'transition-colors duration-200',
          checked ? 'bg-[#496B5A]' : 'bg-[#DDE5E3]'
        )}
      >
        <span className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md',
          'transform transition-transform duration-200',
          checked ? 'translate-x-4' : 'translate-x-0'
        )} />
      </button>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex gap-1.5">
      <span className="font-medium text-[#263238] w-20 shrink-0">{label}:</span>
      <span className="truncate">{value}</span>
    </div>
  )
}
