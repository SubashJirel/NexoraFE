import { useMemo, useState } from 'react'
import { Building2, Check, GitCompareArrows, MapPin, Search, X } from 'lucide-react'
import { useProperties } from '@/hooks/useProperties'
import operationsService from '@/services/operationsService'
import Button from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'

const FEATURES = [
  { key: 'price', label: 'Price', format: (item) => formatPrice(item.price, item.currency) },
  { key: 'property_type', label: 'Property type' },
  { key: 'purpose', label: 'Purpose' },
  { key: 'location', label: 'Location', format: (item) => [item.city, item.district].filter(Boolean).join(', ') || '—' },
  { key: 'bedrooms', label: 'Bedrooms' },
  { key: 'bathrooms', label: 'Bathrooms' },
  { key: 'land_area_value', label: 'Land area', format: (item) => withUnit(item.land_area_value, item.land_area_unit) },
  { key: 'built_up_area_value', label: 'Built-up area', format: (item) => withUnit(item.built_up_area_value, item.built_up_area_unit) },
  { key: 'amenities', label: 'Amenities', format: (item) => formatAmenities(item.amenities) },
]

export default function ComparePage() {
  const query = useProperties({})
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState([])
  const [rows, setRows] = useState([])
  const [comparing, setComparing] = useState(false)
  const [error, setError] = useState('')

  const properties = useMemo(() => query.data || [], [query.data])
  const selectedProperties = selected
    .map((id) => properties.find((property) => String(property.id) === String(id)))
    .filter(Boolean)
  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return properties
    return properties.filter((item) => [item.title, item.city, item.district, item.property_type]
      .some((value) => String(value || '').toLowerCase().includes(needle)))
  }, [properties, search])

  function toggle(id) {
    setRows([])
    setError('')
    setSelected((current) => {
      if (current.includes(id)) return current.filter((value) => value !== id)
      return current.length < 4 ? [...current, id] : current
    })
  }

  async function compare() {
    setComparing(true)
    setError('')
    try {
      const response = await operationsService.compare(selected)
      const byId = new Map(response.map((item) => [String(item.id), item]))
      setRows(selected.map((id) => byId.get(String(id))).filter(Boolean))
    } catch (requestError) {
      setError(requestError.response?.data?.detail || 'Unable to compare these properties. Please try again.')
    } finally {
      setComparing(false)
    }
  }

  if (query.isLoading) return <PageSpinner />

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#263238]">Property comparison</h2>
          <p className="mt-1 text-sm text-[#637079]">Select two to four listings and compare their most important details side by side.</p>
        </div>
        <div className="rounded-xl border border-[#DDE5E3] bg-white px-4 py-2 text-sm text-[#637079]">
          <span className="font-bold text-[#496B5A]">{selected.length}</span> of 4 selected
        </div>
      </div>

      <Card className="space-y-4">
        <div className="relative">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b969d]" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title, location, or property type…"
            className="h-10 w-full rounded-lg border border-[#DDE5E3] pl-9 pr-3 text-sm outline-none transition focus:border-[#496B5A] focus:ring-2 focus:ring-[#496B5A]/20"
          />
        </div>

        {query.isError ? (
          <p className="py-8 text-center text-sm text-red-600">Unable to load properties.</p>
        ) : filtered.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((property) => (
              <PropertyChoice
                key={property.id}
                property={property}
                selected={selected.includes(property.id)}
                disabled={selected.length === 4 && !selected.includes(property.id)}
                onClick={() => toggle(property.id)}
              />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-[#637079]">No matching properties found.</p>
        )}

        <div className="flex flex-col gap-3 border-t border-[#EEF2F2] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-h-8 flex-wrap gap-2">
            {selectedProperties.map((property) => (
              <button key={property.id} type="button" onClick={() => toggle(property.id)} className="flex items-center gap-1.5 rounded-full bg-[#eef3f0] px-3 py-1.5 text-xs font-semibold text-[#496B5A]">
                <span className="max-w-36 truncate">{property.title}</span><X size={12} />
              </button>
            ))}
          </div>
          <Button leftIcon={<GitCompareArrows size={15} />} disabled={selected.length < 2} loading={comparing} onClick={compare}>
            Compare selected
          </Button>
        </div>
        {selected.length === 4 && <p className="text-xs text-[#8b969d]">Four is the maximum. Remove one selection to choose another property.</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}
      </Card>

      {rows.length > 0 && <ComparisonTable rows={rows} propertyLookup={properties} />}
    </div>
  )
}

function PropertyChoice({ property, selected, disabled, onClick }) {
  const image = primaryImage(property)
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'flex overflow-hidden rounded-xl border bg-white text-left transition',
        selected ? 'border-[#496B5A] ring-2 ring-[#496B5A]/15' : 'border-[#DDE5E3] hover:border-[#B8C9C5]',
        disabled && 'cursor-not-allowed opacity-45'
      )}
    >
      <div className="h-24 w-28 shrink-0 bg-[#EEF2F2]">
        {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center"><Building2 size={22} className="text-[#8FAF9B]" /></div>}
      </div>
      <div className="min-w-0 flex-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-semibold text-[#263238]">{property.title}</p>
          <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border', selected ? 'border-[#496B5A] bg-[#496B5A] text-white' : 'border-[#B8C9C5]')}>
            {selected && <Check size={12} />}
          </span>
        </div>
        <p className="mt-1 text-xs font-semibold text-[#496B5A]">{formatPrice(property.price, property.currency)}</p>
        <p className="mt-1 flex items-center gap-1 truncate text-[11px] text-[#8b969d]"><MapPin size={10} />{[property.city, property.district].filter(Boolean).join(', ') || 'Location unavailable'}</p>
      </div>
    </button>
  )
}

function ComparisonTable({ rows, propertyLookup }) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="border-b border-[#DDE5E3] px-5 py-4">
        <h3 className="font-bold text-[#263238]">Side-by-side comparison</h3>
        <p className="mt-0.5 text-xs text-[#637079]">Cells with different values are lightly highlighted.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] table-fixed text-sm">
          <thead>
            <tr className="bg-[#F8FAFA]">
              <th className="w-40 px-5 py-4 text-left text-xs uppercase tracking-wide text-[#637079]">Feature</th>
              {rows.map((item) => {
                const full = propertyLookup.find((property) => String(property.id) === String(item.id))
                return <th key={item.id} className="px-4 py-4 text-left"><p className="line-clamp-2 font-semibold text-[#263238]">{item.title}</p><p className="mt-1 text-[11px] font-normal text-[#8b969d]">{full?.display_property_id || `Property #${item.id}`}</p></th>
              })}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((feature) => {
              const values = rows.map((item) => displayFeature(item, feature))
              const differs = new Set(values.map((value) => String(value).toLowerCase())).size > 1
              return (
                <tr key={feature.key} className="border-t border-[#EEF2F2] align-top">
                  <td className="px-5 py-4 font-semibold text-[#263238]">{feature.label}</td>
                  {rows.map((item, index) => <td key={item.id} className={cn('break-words px-4 py-4 capitalize text-[#637079]', differs && 'bg-amber-50/45')}>{values[index]}</td>)}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

function displayFeature(item, feature) {
  const value = feature.format ? feature.format(item) : item[feature.key]
  if (value === null || value === undefined || value === '') return '—'
  return String(value).replaceAll('_', ' ')
}

function primaryImage(property) {
  const media = property.media || []
  const item = media.find((entry) => entry.media_type === 'image' && entry.is_primary)
    || media.find((entry) => entry.media_type === 'image')
  return item?.card_image || item?.thumbnail || item?.file || null
}

function formatPrice(value, currency = 'NPR') {
  if (value === null || value === undefined || value === '') return '—'
  try {
    return new Intl.NumberFormat('en-NP', { style: 'currency', currency, maximumFractionDigits: 0 }).format(Number(value))
  } catch {
    return `${currency} ${Number(value).toLocaleString('en-IN')}`
  }
}

function withUnit(value, unit) {
  return value === null || value === undefined || value === '' ? '—' : `${value} ${String(unit || '').replaceAll('_', ' ')}`.trim()
}

function formatAmenities(value) {
  if (Array.isArray(value)) return value.length ? value.join(', ') : '—'
  return String(value || '').trim() || '—'
}
