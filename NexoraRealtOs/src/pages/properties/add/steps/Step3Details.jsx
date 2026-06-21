import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import Input from '@/components/ui/Input'

const FEATURES = [
  '24/7 Water', 'Electricity', 'Car Parking', 'Drainage',
  'Backyard',   'Solar Panel', 'Earthquake-Safe', 'Vastu Compliant',
]

function Counter({ label, value, onChange, min = 0, max = 20 }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[#263238]">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          disabled={value <= min}
          className="h-9 w-9 rounded-lg border border-[#DDE5E3] flex items-center justify-center text-[#496B5A] hover:bg-[#eef3f0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Minus size={14} />
        </button>
        <span className="w-8 text-center text-sm font-semibold text-[#263238]">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          disabled={value >= max}
          className="h-9 w-9 rounded-lg border border-[#DDE5E3] flex items-center justify-center text-[#496B5A] hover:bg-[#eef3f0] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

export default function Step3Details({ form, errors, onChange }) {
  const isCommercial = form.property_type === 'commercial' || form.property_type === 'land'

  function toggleFeature(feature) {
    const current = form.features || []
    onChange(
      'features',
      current.includes(feature)
        ? current.filter((f) => f !== feature)
        : [...current, feature]
    )
  }

  return (
    <div className="space-y-6">
      {/* Counters */}
      {!isCommercial && (
        <div className="grid grid-cols-3 gap-6">
          <Counter
            label="Bedrooms"
            value={form.bedrooms || 0}
            onChange={(v) => onChange('bedrooms', v)}
          />
          <Counter
            label="Bathrooms"
            value={form.bathrooms || 0}
            onChange={(v) => onChange('bathrooms', v)}
          />
          <Counter
            label="Floors"
            value={form.floors || 0}
            onChange={(v) => onChange('floors', v)}
          />
        </div>
      )}

      {/* Area + Built-up area */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Land Area"
          placeholder="e.g. 5 Aana / 1500 sqft"
          value={form.land_area}
          onChange={(e) => onChange('land_area', e.target.value)}
          error={errors.land_area}
        />
        <Input
          label="Built-up Area"
          placeholder="e.g. 1500 sqft"
          value={form.built_up_area}
          onChange={(e) => onChange('built_up_area', e.target.value)}
          error={errors.built_up_area}
        />
      </div>

      {/* Road access */}
      <Input
        label="Road / Access (optional)"
        placeholder="e.g. 13"
        value={form.road_access}
        onChange={(e) => onChange('road_access', e.target.value)}
      />

      {/* Features / Amenities */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-[#263238]">Features & Amenities</span>
        <div className="flex flex-wrap gap-2">
          {FEATURES.map((f) => {
            const active = (form.features || []).includes(f)
            return (
              <button
                key={f}
                type="button"
                onClick={() => toggleFeature(f)}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150',
                  active
                    ? 'bg-[#496B5A] text-white border-[#496B5A]'
                    : 'bg-white text-[#637079] border-[#DDE5E3] hover:border-[#496B5A] hover:text-[#496B5A]'
                )}
              >
                {f}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
