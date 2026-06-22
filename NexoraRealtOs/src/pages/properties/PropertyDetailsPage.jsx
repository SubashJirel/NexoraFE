import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bath, Bed, Building2, CalendarDays, CheckCircle2, Clock3, Eye, Home, Layers, MapPin, Maximize2, PhoneCall, Share2, SquareAsterisk, Tag } from 'lucide-react'
import { useProperty } from '@/hooks/useProperties'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'

const STATUS_CONFIG = {
  active: { label: 'Active', variant: 'success' },
  pending: { label: 'Pending', variant: 'warning' },
  draft: { label: 'Draft', variant: 'neutral' },
  sold: { label: 'Sold', variant: 'error' },
  inactive: { label: 'Inactive', variant: 'neutral' },
}

const PURPOSE_CONFIG = {
  sale: 'For Sale',
  rent: 'For Rent',
  lease: 'Lease',
}

export default function PropertyDetailsPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: property, isLoading, isError } = useProperty(id)

  const primaryMedia = useMemo(() => {
    if (!property?.media?.length) return null
    return property.media.find((media) => media.is_primary) || property.media[0]
  }, [property])

  if (isLoading) return <PageSpinner />

  if (isError || !property) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <p className="text-base font-semibold text-[#263238]">Failed to load property details</p>
        <p className="text-sm text-[#637079]">The property may no longer exist or the server is unreachable.</p>
        <Button variant="outlined" size="sm" onClick={() => navigate('/properties')}>
          Back to properties
        </Button>
      </div>
    )
  }

  const status = STATUS_CONFIG[property.status] || { label: property.status || 'Unknown', variant: 'neutral' }
  const purpose = PURPOSE_CONFIG[property.purpose] || property.purpose || 'Unknown'
  const imageUrl = primaryMedia?.file || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Button
            variant="outlined"
            size="sm"
            leftIcon={<ArrowLeft size={15} />}
            onClick={() => navigate('/properties')}
          >
            Back to Properties
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant={status.variant} size="sm">{status.label}</Badge>
              {property.is_featured && <Badge variant="warning" size="sm">Featured</Badge>}
              <Badge variant="neutral" size="sm">{purpose}</Badge>
            </div>
            <h2 className="text-2xl font-bold text-[#263238]">{property.title}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-[#637079]">
              <MapPin size={14} className="text-[#8FAF9B]" />
              {[property.city, property.district, property.province].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outlined" size="md" leftIcon={<Share2 size={15} />}>
            Share
          </Button>
          <Button variant="primary" size="md">
            Edit Property
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl border border-[#DDE5E3] bg-white shadow-[0_1px_3px_0_rgb(0_0_0/0.06)]">
            <div className="relative aspect-[16/9] bg-[#EEF2F2]">
              <img src={imageUrl} alt={property.title} className="h-full w-full object-cover" />
            </div>
            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm text-[#637079]">Property Price</p>
                  <p className="text-3xl font-extrabold tracking-tight text-[#263238]">
                    {formatPrice(property.price, property.purpose, property.currency)}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#637079]">
                  <StatChip icon={<Eye size={11} />} value="0" label="VIEWS" />
                  <StatChip icon={<PhoneCall size={11} />} value="0" label="LEADS" />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#DDE5E3] bg-white p-5 sm:p-6 space-y-5">
            <SectionTitle icon={<Home size={16} />} title="Overview" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <DetailItem label="Property Type" value={cap(property.property_type)} icon={<Building2 size={14} />} />
              <DetailItem label="Purpose" value={purpose} icon={<Tag size={14} />} />
              <DetailItem label="Status" value={status.label} icon={<CheckCircle2 size={14} />} />
              <DetailItem label="Bedrooms" value={property.bedrooms ?? '—'} icon={<Bed size={14} />} />
              <DetailItem label="Bathrooms" value={property.bathrooms ?? '—'} icon={<Bath size={14} />} />
              <DetailItem label="Floors" value={property.floors ?? '—'} icon={<Layers size={14} />} />
            </div>
          </section>

          <section className="rounded-2xl border border-[#DDE5E3] bg-white p-5 sm:p-6 space-y-5">
            <SectionTitle icon={<SquareAsterisk size={16} />} title="Property Details" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <DetailItem label="Land Area" value={formatMeasurement(property.land_area_value, property.land_area_unit)} icon={<Maximize2 size={14} />} />
              <DetailItem label="Built-up Area" value={formatMeasurement(property.built_up_area_value, property.built_up_area_unit)} icon={<Maximize2 size={14} />} />
              <DetailItem label="Road Access" value={formatMeasurement(property.road_access_value, property.road_access_unit)} icon={<Maximize2 size={14} />} />
              <DetailItem label="Latitude" value={property.latitude || '—'} icon={<MapPin size={14} />} />
              <DetailItem label="Longitude" value={property.longitude || '—'} icon={<MapPin size={14} />} />
              <DetailItem label="Assigned Agent" value={formatAgent(property.assigned_agent)} icon={<Building2 size={14} />} />
            </div>
          </section>

          <section className="rounded-2xl border border-[#DDE5E3] bg-white p-5 sm:p-6 space-y-5">
            <SectionTitle icon={<CalendarDays size={16} />} title="Description & Metadata" />
            <div className="space-y-4">
              <TextBlock label="Short Description" value={property.short_description} />
              <TextBlock label="Description" value={property.description} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <MetaItem label="Published At" value={formatDate(property.published_at)} />
              <MetaItem label="Created At" value={formatDate(property.created_at)} />
              <MetaItem label="Updated At" value={formatDate(property.updated_at)} />
              <MetaItem label="Published" value={property.is_published ? 'Yes' : 'No'} />
              <MetaItem label="Featured" value={property.is_featured ? 'Yes' : 'No'} />
              <MetaItem label="Agency" value={property.agency ?? '—'} />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-[#DDE5E3] bg-white p-5 sm:p-6 space-y-4">
            <SectionTitle icon={<MapPin size={16} />} title="Location" />
            <div className="space-y-2 text-sm text-[#637079]">
              <p><span className="font-medium text-[#263238]">Province:</span> {property.province || '—'}</p>
              <p><span className="font-medium text-[#263238]">District:</span> {property.district || '—'}</p>
              <p><span className="font-medium text-[#263238]">City:</span> {property.city || '—'}</p>
              <p><span className="font-medium text-[#263238]">Neighbourhood:</span> {property.neighbourhood || '—'}</p>
              <p><span className="font-medium text-[#263238]">Address:</span> {property.address || '—'}</p>
            </div>
          </section>

          <section className="rounded-2xl border border-[#DDE5E3] bg-white p-5 sm:p-6 space-y-4">
            <SectionTitle icon={<PhoneCall size={16} />} title="Contact" />
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-[#eef3f0] flex items-center justify-center text-[#496B5A] font-semibold text-sm">
                {agentBadge(property.assigned_agent)}
              </div>
              <div>
                <p className="text-sm font-semibold text-[#263238]">{formatAgent(property.assigned_agent)}</p>
                <p className="text-xs text-[#637079]">Linked agent record from the property payload</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#DDE5E3] bg-white p-5 sm:p-6 space-y-4">
            <SectionTitle icon={<Clock3 size={16} />} title="Media" />
            {property.media?.length ? (
              <div className="grid grid-cols-2 gap-3">
                {property.media.map((mediaItem, index) => (
                  <div key={mediaItem.id || index} className="overflow-hidden rounded-xl border border-[#DDE5E3] bg-[#F8FAFA]">
                    <img src={mediaItem.file} alt={mediaItem.title || `${property.title} media ${index + 1}`} className="h-28 w-full object-cover" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#637079]">No media uploaded for this property yet.</p>
            )}
          </section>
        </aside>
      </div>
    </div>
  )
}

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#eef3f0] text-[#496B5A]">{icon}</span>
      <h3 className="text-sm font-semibold text-[#263238]">{title}</h3>
    </div>
  )
}

function DetailItem({ label, value, icon }) {
  return (
    <div className="rounded-xl border border-[#EEF2F2] bg-[#F8FAFA] p-4">
      <div className="flex items-center gap-2 text-xs font-medium text-[#637079]">
        <span className="text-[#8FAF9B]">{icon}</span>
        <span>{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-[#263238]">{value}</p>
    </div>
  )
}

function MetaItem({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-[#637079]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#263238]">{value}</p>
    </div>
  )
}

function TextBlock({ label, value }) {
  return (
    <div>
      <p className="text-xs font-medium text-[#637079]">{label}</p>
      <p className="mt-1 rounded-xl border border-[#EEF2F2] bg-[#F8FAFA] p-4 text-sm leading-6 text-[#263238] whitespace-pre-line">
        {value || '—'}
      </p>
    </div>
  )
}

function StatChip({ icon, value, label }) {
  return (
    <span className="flex flex-col items-center gap-0.5">
      <span className="flex items-center gap-0.5">{icon} {value}</span>
      <span className="tracking-wider">{label}</span>
    </span>
  )
}

function formatPrice(price, purpose, currency = 'NPR') {
  const n = Number(price)
  if (Number.isNaN(n)) return `${currency} ${price}`
  const suffix = purpose === 'rent' ? '/mo' : ''
  return `${currency} ${n.toLocaleString()}${suffix}`
}

function formatMeasurement(value, unit) {
  if (value == null || value === '') return '—'
  return unit ? `${value} ${unit}` : String(value)
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

function formatAgent(value) {
  if (value == null || value === '') return 'Unassigned'
  if (typeof value === 'object') {
    return value.full_name || value.name || `Agent #${value.id ?? '—'}`
  }
  return `Agent #${value}`
}

function agentBadge(value) {
  if (value == null || value === '') return 'NA'
  if (typeof value === 'object') {
    return value.full_name ? value.full_name.slice(0, 2).toUpperCase() : 'AG'
  }
  return `#${value}`
}

function cap(value) {
  if (!value) return '—'
  return value.charAt(0).toUpperCase() + value.slice(1)
}
