import { SlidersHorizontal } from 'lucide-react'
import { cn } from '@/lib/cn'
import { usePropertyFilterOptions } from '@/hooks/usePropertyFilterOptions'

// Shown while the filter-options API is still loading
const LOADING_PLACEHOLDER = [{ value: '', label: 'Loading…' }]

export default function PropertyFilters({ filters, onChange }) {
  const { data: options, isLoading } = usePropertyFilterOptions()

  function set(key, value) {
    onChange({ ...filters, [key]: value })
  }

  const hasActive = Object.values(filters).some(Boolean)

  const propertyTypes = isLoading ? LOADING_PLACEHOLDER : (options?.propertyTypes ?? [])
  const statuses      = isLoading ? LOADING_PLACEHOLDER : (options?.statuses      ?? [])
  const locations     = isLoading ? LOADING_PLACEHOLDER : (options?.locations     ?? [])
  const agents        = isLoading ? LOADING_PLACEHOLDER : (options?.agents        ?? [])

  return (
    <div className="bg-white border border-[#DDE5E3] rounded-xl p-4">
      <div className="flex flex-wrap items-center gap-3">

        <FilterSelect
          label="Property Type"
          value={filters.property_type}
          options={propertyTypes}
          onChange={(v) => set('property_type', v)}
          disabled={isLoading}
        />

        <FilterSelect
          label="Status"
          value={filters.status}
          options={statuses}
          onChange={(v) => set('status', v)}
          disabled={isLoading}
        />

        <FilterSelect
          label="Location"
          value={filters.district}
          options={locations}
          onChange={(v) => set('district', v)}
          disabled={isLoading}
        />

        <FilterSelect
          label="Assigned Agent"
          value={filters.assigned_agent}
          options={agents}
          onChange={(v) => set('assigned_agent', v)}
          disabled={isLoading}
        />

        {/* Advanced filter button */}
        <button
          className={cn(
            'ml-auto flex h-9 w-9 items-center justify-center rounded-lg border transition-colors',
            hasActive
              ? 'border-[#496B5A] bg-[#eef3f0] text-[#496B5A]'
              : 'border-[#DDE5E3] text-[#637079] hover:border-[#B8C9C5] hover:bg-[#F8FAFA]'
          )}
          title="Advanced filters"
          aria-label="Advanced filters"
        >
          <SlidersHorizontal size={16} />
        </button>

        {hasActive && (
          <button
            onClick={() => onChange({ property_type: '', status: '', district: '', assigned_agent: '' })}
            className="text-xs text-[#637079] hover:text-[#496B5A] underline underline-offset-2 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  )
}

function FilterSelect({ label, value, options, onChange, disabled }) {
  return (
    <div className="flex flex-col gap-1 min-w-[140px]">
      <label className="text-[10px] font-semibold text-[#8b969d] uppercase tracking-wide px-1">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'h-9 rounded-lg border bg-white px-3 pr-8 text-sm text-[#263238]',
          'focus:outline-none focus:ring-2 focus:ring-[#496B5A]/30 focus:border-[#496B5A]',
          'transition-colors duration-150 cursor-pointer appearance-none',
          'bg-[right_0.5rem_center] bg-no-repeat',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          value ? 'border-[#496B5A] text-[#496B5A] font-medium' : 'border-[#DDE5E3] hover:border-[#B8C9C5]'
        )}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23637079' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
        }}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
