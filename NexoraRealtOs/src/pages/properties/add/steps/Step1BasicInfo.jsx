import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { cn } from '@/lib/cn'

const PROPERTY_TYPES = ['house', 'apartment', 'land', 'commercial', 'villa', 'office']
const PURPOSES       = ['sale', 'rent', 'lease']

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
            <option key={t} value={t}>
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </option>
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

      {/* Price + Province */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price (NPR)"
          type="number"
          placeholder="e.g. 4500000"
          value={form.price}
          onChange={(e) => onChange('price', e.target.value)}
          error={errors.price}
          leftAddon={<span className="text-xs font-semibold text-[#8b969d]">NPR</span>}
        />
        <Input
          label="Province"
          placeholder="e.g. Bagmati Province"
          value={form.province}
          onChange={(e) => onChange('province', e.target.value)}
          error={errors.province}
        />
      </div>
    </div>
  )
}
