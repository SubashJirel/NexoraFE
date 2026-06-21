import { cn } from '@/lib/cn'
import Avatar from '@/components/ui/Avatar'
import Select from '@/components/ui/Select'
import { useAuthStore } from '@/store/authStore'

const MOCK_AGENTS = [
  { id: 1, full_name: 'Siddharth KC' },
  { id: 2, full_name: 'Priya Thapa' },
  { id: 3, full_name: 'Aarav Sharma' },
]

const STATUS_OPTIONS = [
  { value: 'draft',    label: 'Draft — save without publishing' },
  { value: 'active',   label: 'Active — visible on website' },
  { value: 'pending',  label: 'Pending — awaiting review' },
]

export default function Step6Publish({ form, errors, onChange }) {
  const user = useAuthStore((s) => s.user)

  return (
    <div className="space-y-5">
      {/* Assigned agent */}
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[#263238]">Assign to Agent</span>
        <div className="flex flex-wrap gap-2">
          {MOCK_AGENTS.map((agent) => {
            const active = form.assigned_agent === agent.id
            return (
              <button
                key={agent.id}
                type="button"
                onClick={() => onChange('assigned_agent', agent.id)}
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
                  <span className="text-[10px] bg-[#496B5A] text-white px-1.5 py-0.5 rounded-full">Primary</span>
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

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-4">
        <Toggle
          label="Public Visibility"
          hint="Visible on public website"
          checked={form.is_public ?? true}
          onChange={(v) => onChange('is_public', v)}
        />
        <Toggle
          label="Featured Listing"
          hint="Shown in featured section"
          checked={form.featured ?? false}
          onChange={(v) => onChange('featured', v)}
        />
      </div>

      {/* Summary card */}
      <div className="rounded-xl border border-[#DDE5E3] bg-[#F8FAFA] p-4 space-y-2">
        <p className="text-xs font-semibold text-[#496B5A] uppercase tracking-wide">Summary</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-[#637079]">
          <SummaryRow label="Title"    value={form.title      || '—'} />
          <SummaryRow label="Type"     value={form.property_type ? form.property_type.charAt(0).toUpperCase() + form.property_type.slice(1) : '—'} />
          <SummaryRow label="Purpose"  value={form.purpose    || '—'} />
          <SummaryRow label="Price"    value={form.price ? `NPR ${Number(form.price).toLocaleString()}` : '—'} />
          <SummaryRow label="Location" value={[form.city, form.district].filter(Boolean).join(', ') || '—'} />
          <SummaryRow label="Status"   value={form.status     || 'draft'} />
        </div>
      </div>
    </div>
  )
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
        <span
          className={cn(
            'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md',
            'transform transition-transform duration-200',
            checked ? 'translate-x-4' : 'translate-x-0'
          )}
        />
      </button>
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex gap-1.5">
      <span className="font-medium text-[#263238] w-16 shrink-0">{label}:</span>
      <span className="truncate">{value}</span>
    </div>
  )
}
