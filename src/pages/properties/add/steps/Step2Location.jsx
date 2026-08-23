import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import LocationPicker from '@/components/maps/LocationPicker'

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

      <LocationPicker
        latitude={form.latitude}
        longitude={form.longitude}
        title="Property map location"
        description="Search for the property area or a nearby landmark, or click the map to place a draggable pin. The map starts from Nepal."
        savedLocationLabel="Saved property location"
        onChange={({ latitude, longitude }) => {
          onChange('latitude', latitude ?? '')
          onChange('longitude', longitude ?? '')
        }}
      />

      <label className="flex items-start gap-3 rounded-xl border border-[#DDE5E3] bg-[#F8FAFA] p-4 text-sm text-[#263238]">
        <input type="checkbox" className="mt-0.5" checked={form.show_exact_location_publicly !== false} onChange={(e) => onChange('show_exact_location_publicly', e.target.checked)} />
        <span><strong className="block">Show exact location publicly</strong><small className="mt-1 block text-[#637079]">Turn this off to show only municipality, district, and province while keeping the precise address inside the CRM.</small></span>
      </label>
    </div>
  )
}
