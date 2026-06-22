import { cn } from '@/lib/cn'
import Avatar from '@/components/ui/Avatar'
import Select from '@/components/ui/Select'

const MOCK_AGENTS = [
  { id: 1, full_name: 'Siddharth KC' },
  { id: 2, full_name: 'Priya Thapa' },
  { id: 3, full_name: 'Aarav Sharma' },
]

const STATUS_OPTIONS = [
  { value: 'draft',   label: 'Draft — save without publishing' },
  { value: 'active',  label: 'Active — visible on website' },
  { value: 'pending', label: 'Pending — awaiting review' },
]

export default function Step6Publish({ form, errors, onChange }) {
  return (
    <div className="space-y-5">

      {/* Assign to agent — maps to assigned_agent (id) */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[#263238]">Assign to Agent</span>
        <div className="flex flex-wrap gap-2">
          {MOCK_AGENTS.map((agent) => {
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
                <span className={cn('text-sm font-medium', active ? 'text-[#496B5A]' : 'text-[#263238]')}>
                  {agent.full_name}
                </span>
                {active && (
                  <span className="text-[10px] bg-[#496B5A] text-white px-1.5 py-0.5 rounded-full">
                    Primary
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Status */}
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

      {/* is_published + is_featured toggles */}
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

      {/* Pre-submit summary */}
      <div className="rounded-xl border border-[#DDE5E3] bg-[#F8FAFA] p-4 space-y-3">
        <p className="text-xs font-semibold text-[#496B5A] uppercase tracking-wide">
          Submission Summary
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-[#637079]">
          <SummaryRow label="Title"        value={form.title        || '—'} />
          <SummaryRow label="Type"         value={cap(form.property_type) || '—'} />
          <SummaryRow label="Purpose"      value={cap(form.purpose) || '—'} />
          <SummaryRow label="Price"        value={form.price ? `${form.currency} ${Number(form.price).toLocaleString()}` : '—'} />
          <SummaryRow label="Location"     value={[form.city, form.district].filter(Boolean).join(', ') || '—'} />
          <SummaryRow label="Status"       value={cap(form.status)  || 'draft'} />
          <SummaryRow label="Published"    value={form.is_published ? 'Yes' : 'No'} />
          <SummaryRow label="Featured"     value={form.is_featured  ? 'Yes' : 'No'} />
          <SummaryRow label="Agent"        value={MOCK_AGENTS.find((a) => a.id === form.assigned_agent)?.full_name || 'Unassigned'} />
          <SummaryRow label="Land area"    value={form.land_area_value ? `${form.land_area_value} ${form.land_area_unit}` : '—'} />
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
