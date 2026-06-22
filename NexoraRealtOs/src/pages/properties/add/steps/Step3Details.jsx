import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

// ── Amenity chips — serialised as comma-joined string for the API ──
const AMENITY_OPTIONS = [
  '24/7 Water', 'Electricity', 'Car Parking', 'Drainage',
  'Backyard', 'Solar Panel', 'Earthquake-Safe', 'Vastu Compliant',
  'CCTV', 'Internet', 'Lift', 'Swimming Pool',
]

const AREA_UNITS      = ['aana', 'ropani', 'sqft', 'sqm', 'dhur', 'bigha', 'kattha']
const ROAD_UNITS      = ['ft', 'm']

function Counter({ label, value, onChange, min = 0, max = 30 }) {
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

// Value + unit side-by-side field
function MeasurementField({ label, valueKey, unitKey, valuePlaceholder, units, form, errors, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-[#263238]">{label}</span>
      <div className="flex gap-2">
        <Input
          placeholder={valuePlaceholder}
          type="number"
          value={form[valueKey]}
          onChange={(e) => onChange(valueKey, e.target.value)}
          error={errors?.[valueKey]}
          className="flex-1"
        />
        <Select
          value={form[unitKey]}
          onChange={(e) => onChange(unitKey, e.target.value)}
          className="w-28 shrink-0"
        >
          {units.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
        </Select>
      </div>
      {errors?.[valueKey] && (
        <p className="text-xs text-[#ef4444]">{errors[valueKey]}</p>
      )}
    </div>
  )
}

export default function Step3Details({ form, errors, onChange }) {
  const isLand = form.property_type === 'land'

  // amenities is a comma-joined string in the API
  function toggleAmenity(item) {
    const current = form.amenities
      ? form.amenities.split(',').map((s) => s.trim()).filter(Boolean)
      : []
    const next = current.includes(item)
      ? current.filter((a) => a !== item)
      : [...current, item]
    onChange('amenities', next.join(', '))
  }

  const selectedAmenities = form.amenities
    ? form.amenities.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  return (
    <div className="space-y-6">

      {/* Bed / Bath / Floors counters — not shown for land */}
      {!isLand && (
        <div className="grid grid-cols-3 gap-6">
          <Counter label="Bedrooms"  value={form.bedrooms}  onChange={(v) => onChange('bedrooms',  v)} />
          <Counter label="Bathrooms" value={form.bathrooms} onChange={(v) => onChange('bathrooms', v)} />
          <Counter label="Floors"    value={form.floors}    onChange={(v) => onChange('floors',    v)} />
        </div>
      )}

      {/* Land area */}
      <MeasurementField
        label="Land Area"
        valueKey="land_area_value"
        unitKey="land_area_unit"
        valuePlaceholder="e.g. 5"
        units={AREA_UNITS}
        form={form}
        errors={errors}
        onChange={onChange}
      />

      {/* Built-up area — not relevant for land */}
      {!isLand && (
        <MeasurementField
          label="Built-up Area"
          valueKey="built_up_area_value"
          unitKey="built_up_area_unit"
          valuePlaceholder="e.g. 1500"
          units={AREA_UNITS}
          form={form}
          errors={errors}
          onChange={onChange}
        />
      )}

      {/* Road access */}
      <MeasurementField
        label="Road / Access Width"
        valueKey="road_access_value"
        unitKey="road_access_unit"
        valuePlaceholder="e.g. 13"
        units={ROAD_UNITS}
        form={form}
        errors={errors}
        onChange={onChange}
      />

      {/* Amenities */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-[#263238]">Features &amp; Amenities</span>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map((item) => {
            const active = selectedAmenities.includes(item)
            return (
              <button
                key={item}
                type="button"
                onClick={() => toggleAmenity(item)}
                className={cn(
                  'px-3 py-1.5 rounded-lg border text-xs font-medium transition-all duration-150',
                  active
                    ? 'bg-[#496B5A] text-white border-[#496B5A]'
                    : 'bg-white text-[#637079] border-[#DDE5E3] hover:border-[#496B5A] hover:text-[#496B5A]'
                )}
              >
                {item}
              </button>
            )
          })}
        </div>
        {selectedAmenities.length > 0 && (
          <p className="text-xs text-[#8b969d]">
            Selected: {selectedAmenities.join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}
