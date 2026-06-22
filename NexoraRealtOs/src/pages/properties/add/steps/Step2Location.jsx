import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const NEPAL_DISTRICTS = [
  'Kathmandu', 'Lalitpur', 'Bhaktapur', 'Kavrepalanchok',
  'Sindhupalchok', 'Nuwakot', 'Dhading', 'Makwanpur',
  'Pokhara', 'Chitwan', 'Butwal', 'Birgunj', 'Biratnagar',
  'Dhankuta', 'Sunsari', 'Morang', 'Jhapa', 'Ilam',
]

export default function Step2Location({ form, errors, onChange }) {
  return (
    <div className="space-y-5">

      {/* District + City */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="District"
          value={form.district}
          onChange={(e) => onChange('district', e.target.value)}
          error={errors.district}
        >
          <option value="">Select district</option>
          {NEPAL_DISTRICTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </Select>

        <Input
          label="City / Municipality"
          placeholder="e.g. Koteshwor"
          value={form.city}
          onChange={(e) => onChange('city', e.target.value)}
          error={errors.city}
        />
      </div>

      {/* Neighbourhood */}
      <Input
        label="Neighbourhood / Tole"
        placeholder="e.g. Milan Chowk"
        value={form.neighbourhood}
        onChange={(e) => onChange('neighbourhood', e.target.value)}
        hint="Optional — helps buyers find the area faster"
      />

      {/* Full address */}
      <Input
        label="Full Address"
        placeholder="e.g. House No. 24, Lane 8, Milan Chowk"
        value={form.address}
        onChange={(e) => onChange('address', e.target.value)}
        error={errors.address}
      />

      {/* GPS coordinates */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Latitude"
          type="number"
          placeholder="e.g. 27.7172"
          value={form.latitude}
          onChange={(e) => onChange('latitude', e.target.value)}
          hint="Optional — for map pin"
        />
        <Input
          label="Longitude"
          type="number"
          placeholder="e.g. 85.3240"
          value={form.longitude}
          onChange={(e) => onChange('longitude', e.target.value)}
          hint="Optional — for map pin"
        />
      </div>

      {/* Map placeholder */}
      <div
        className="rounded-xl border border-dashed border-[#DDE5E3] bg-[#F8FAFA] h-40 flex flex-col items-center justify-center gap-2 text-[#8b969d] cursor-pointer hover:border-[#B8C9C5] transition-colors"
        onClick={() => {}}
      >
        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="12" cy="9" r="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p className="text-xs font-medium">Click to Pin Precise Location</p>
        <p className="text-[10px] text-[#b2b9be]">Interactive map — coming soon</p>
      </div>
    </div>
  )
}
