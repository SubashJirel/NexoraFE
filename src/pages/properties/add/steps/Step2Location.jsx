import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const NEPAL_DISTRICTS = [
  'Achham', 'Arghakhanchi', 'Baglung', 'Baitadi', 'Bajhang', 'Bajura', 'Banke', 'Bara',
  'Bardiya', 'Bhaktapur', 'Bhojpur', 'Chitwan', 'Dadeldhura', 'Dailekh', 'Dang', 'Darchula',
  'Dhading', 'Dhankuta', 'Dhanusha', 'Dolakha', 'Dolpa', 'Doti', 'Eastern Rukum', 'Gorkha',
  'Gulmi', 'Humla', 'Ilam', 'Jajarkot', 'Jhapa', 'Jumla', 'Kailali', 'Kalikot',
  'Kanchanpur', 'Kapilvastu', 'Kaski', 'Kathmandu', 'Kavrepalanchok', 'Khotang', 'Lalitpur',
  'Lamjung', 'Mahottari', 'Makwanpur', 'Manang', 'Morang', 'Mugu', 'Mustang', 'Myagdi',
  'Nawalpur', 'Nuwakot', 'Okhaldhunga', 'Palpa', 'Panchthar', 'Parasi', 'Parbat', 'Parsa',
  'Pyuthan', 'Ramechhap', 'Rasuwa', 'Rautahat', 'Rolpa', 'Rupandehi', 'Salyan',
  'Sankhuwasabha', 'Saptari', 'Sarlahi', 'Sindhuli', 'Sindhupalchok', 'Siraha', 'Solukhumbu',
  'Sunsari', 'Surkhet', 'Syangja', 'Tanahun', 'Taplejung', 'Terhathum', 'Udayapur', 'Western Rukum',
]

export default function Step2Location({ form, errors, onChange }) {
  return (
    <div className="space-y-5">

      {/* Administrative address */}
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
          label="City / Locality"
          placeholder="e.g. Kathmandu"
          value={form.city}
          onChange={(e) => onChange('city', e.target.value)}
          error={errors.city}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Municipality / Rural Municipality"
          placeholder="e.g. Kageshwori Manohara"
          value={form.municipality}
          onChange={(e) => onChange('municipality', e.target.value)}
          error={errors.municipality}
        />
        <Input
          label="Ward Number"
          type="number"
          min="1"
          max="99"
          placeholder="e.g. 9"
          value={form.ward_number}
          onChange={(e) => onChange('ward_number', e.target.value)}
          error={errors.ward_number}
        />
      </div>

      {/* Neighbourhood */}
      <Input
        label="Neighbourhood (legacy)"
        placeholder="e.g. Milan Chowk"
        value={form.neighbourhood}
        onChange={(e) => onChange('neighbourhood', e.target.value)}
        hint="Optional — helps buyers find the area faster"
      />

      <div className="grid grid-cols-2 gap-4">
        <Input label="Tole" placeholder="e.g. Milan Tole" value={form.tole} onChange={(e) => onChange('tole', e.target.value)} />
        <Input label="Nearby Landmark / Chowk" placeholder="e.g. 200m from Pepsicola Chowk" value={form.landmark} onChange={(e) => onChange('landmark', e.target.value)} />
      </div>

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
