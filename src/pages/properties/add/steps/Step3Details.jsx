import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { AREA_UNITS, formatAreaConversions, formatNpr, pricePerUnit } from '@/lib/nepalProperty'

// ── Amenity chips — serialised as comma-joined string for the API ──
const AMENITY_OPTIONS = [
  '24/7 Water', 'Electricity', 'Car Parking', 'Drainage',
  'Backyard', 'Solar Panel', 'Earthquake-Safe', 'Vastu Compliant',
  'CCTV', 'Internet', 'Lift', 'Swimming Pool',
]

const ROAD_UNITS = [
  { value: 'ft', label: 'Feet' },
  { value: 'm',  label: 'Meter' },
]

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
            <option key={u.value} value={u.value}>{u.label}</option>
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
  const conversions = formatAreaConversions(form.land_area_value, form.land_area_unit)
  const rates = ['aana', 'dhur', 'kattha', 'sqft'].map((unit) => ({ unit, value: pricePerUnit(form.price, form.land_area_value, form.land_area_unit, unit) }))

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
      {conversions.length > 0 && (
        <div className="rounded-xl border border-[#DDE5E3] bg-[#F8FAFA] p-4">
          <p className="text-xs font-semibold text-[#263238]">Automatic area conversion</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {conversions.map(({ unit, value }) => <span key={unit} className="rounded-md bg-white px-2 py-1 text-xs text-[#637079]">{Number(value.toFixed(4))} {unit}</span>)}
          </div>
          <p className="mt-3 text-xs font-semibold text-[#263238]">Price rates</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {rates.map(({ unit, value }) => <span key={unit} className="text-xs text-[#637079]">Per {unit}: <strong>{value ? formatNpr(value) : '—'}</strong></span>)}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Land Classification" value={form.land_use_classification} onChange={(e) => onChange('land_use_classification', e.target.value)}>
          <option value="">Not specified</option>
          <option value="residential">Residential</option><option value="commercial">Commercial</option>
          <option value="agricultural">Agricultural</option><option value="plotting">Plotting</option>
          <option value="mixed_use">Mixed Use</option><option value="industrial">Industrial</option>
        </Select>
        <Select label="Property Facing" value={form.facing_direction} onChange={(e) => onChange('facing_direction', e.target.value)}>
          <option value="">Not specified</option>
          {['north','south','east','west','north_east','north_west','south_east','south_west'].map((value) => <option key={value} value={value}>{value.replace('_', '-')}</option>)}
        </Select>
      </div>

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

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Road Type" value={form.road_type} onChange={(e) => onChange('road_type', e.target.value)}>
          <option value="">Not specified</option><option value="blacktopped">Blacktopped / Pitched</option>
          <option value="concrete">Concrete</option><option value="gravel">Gravel</option>
          <option value="unpaved">Unpaved</option><option value="other">Other</option>
        </Select>
        <Select label="Plot Shape" value={form.plot_shape} onChange={(e) => onChange('plot_shape', e.target.value)}>
          <option value="">Not specified</option>{['rectangular','square','regular','irregular','triangular','corner','other'].map((value) => <option key={value} value={value}>{value}</option>)}
        </Select>
      </div>

      <div className="grid grid-cols-[1fr_1fr_110px] gap-3">
        <Input label="Mohada (frontage)" type="number" value={form.mohada_value} onChange={(e) => onChange('mohada_value', e.target.value)} />
        <Input label="Pichhad (depth)" type="number" value={form.pichhad_value} onChange={(e) => onChange('pichhad_value', e.target.value)} />
        <Select label="Unit" value={form.plot_dimension_unit} onChange={(e) => onChange('plot_dimension_unit', e.target.value)}><option value="ft">Feet</option><option value="m">Metres</option></Select>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium text-[#263238]">Utilities</span>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[['has_water_supply','Water'],['has_electricity','Electricity'],['has_drainage','Drainage'],['has_sewage','Sewage']].map(([key,label]) => (
            <Select key={key} label={label} value={form[key] == null ? '' : String(form[key])} onChange={(e) => onChange(key, e.target.value === '' ? null : e.target.value === 'true')}>
              <option value="">Unknown</option><option value="true">Available</option><option value="false">Not available</option>
            </Select>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Select label="Nearest Major Route Type" value={form.major_road_type} onChange={(e) => onChange('major_road_type', e.target.value)}>
          <option value="">Not specified</option><option value="ring_road">Ring Road</option><option value="highway">Highway</option><option value="main_road">Major Road</option>
        </Select>
        <Input label="Nearest Ring Road / Highway" placeholder="e.g. Kathmandu Ring Road" value={form.nearest_major_road} onChange={(e) => onChange('nearest_major_road', e.target.value)} />
      </div>
      <MeasurementField label="Distance to Major Route" valueKey="major_road_distance_value" unitKey="major_road_distance_unit" valuePlaceholder="e.g. 500" units={[{ value: 'm', label: 'Metres' }, { value: 'km', label: 'Kilometres' }]} form={form} errors={errors} onChange={onChange} />

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
