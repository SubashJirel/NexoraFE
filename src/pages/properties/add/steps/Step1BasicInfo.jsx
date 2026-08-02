import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/cn'

const PROPERTY_TYPES = [
  { value: 'house',        label: 'House' },
  { value: 'land',         label: 'Land' },
  { value: 'apartment',    label: 'Apartment' },
  { value: 'flat',         label: 'Flat' },
  { value: 'commercial',   label: 'Commercial' },
  { value: 'office_space', label: 'Office Space' },
]

const PURPOSES = ['sale', 'rent', 'lease']

const CURRENCIES = ['NPR', 'USD', 'INR']

export default function Step1BasicInfo({ form, errors, onChange }) {
  return (
    <div className="space-y-5">

      {/* Title */}
      <Input
        label="Property Title"
        placeholder="e.g. Modern 4-Bedroom Villa in Bhaisepati"
        value={form.title}
        onChange={(e) => onChange('title', e.target.value)}
        error={errors.title}
        autoFocus
      />

      {/* Type + Purpose */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Property Type"
          value={form.property_type}
          onChange={(e) => onChange('property_type', e.target.value)}
          error={errors.property_type}
        >
          <option value="">Select type</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>

        {/* Purpose pill selector */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[#263238]">Purpose</span>
          <div className="flex gap-2">
            {PURPOSES.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChange('purpose', p)}
                className={cn(
                  'flex-1 h-10 rounded-lg border text-sm font-semibold transition-all duration-150',
                  form.purpose === p
                    ? 'bg-[#496B5A] text-white border-[#496B5A]'
                    : 'bg-white text-[#637079] border-[#DDE5E3] hover:border-[#496B5A] hover:text-[#496B5A]'
                )}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
          {errors.purpose && <p className="text-xs text-[#ef4444]">{errors.purpose}</p>}
        </div>
      </div>

      {/* Price + Currency */}
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <Input
            label="Price"
            type="number"
            placeholder="e.g. 4500000"
            value={form.price}
            onChange={(e) => onChange('price', e.target.value)}
            error={errors.price}
          />
        </div>
        <Select
          label="Currency"
          value={form.currency}
          onChange={(e) => onChange('currency', e.target.value)}
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </Select>
      </div>

      {/* Province */}
      <Input
        label="Province"
        placeholder="e.g. Bagmati Province"
        value={form.province}
        onChange={(e) => onChange('province', e.target.value)}
        error={errors.province}
      />
    </div>
  )
}
