import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Bath, Bed, Building2, CalendarDays, CheckCircle2, Clock3, Eye, Home, Layers, MapPin, Maximize2, Pencil, PhoneCall, Share2, SquareAsterisk, Star, Tag, Trash2, Trash, X } from 'lucide-react'
import { useProperty } from '@/hooks/useProperties'
import { useDeletePropertyMedia } from '@/hooks/useDeletePropertyMedia'
import { useDeleteProperty } from '@/hooks/useDeleteProperty'
import { useUpdatePropertyMedia } from '@/hooks/useUpdatePropertyMedia'
import { useUploadPropertyMedia } from '@/hooks/useUploadPropertyMedia'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatNpr } from '@/lib/nepalProperty'
import PropertyVerificationPanel from './components/PropertyVerificationPanel'

const STATUS_CONFIG = {
  draft: { label: 'Draft', variant: 'neutral' },
  available: { label: 'Available', variant: 'success' },
  under_negotiation: { label: 'Under Negotiation', variant: 'warning' },
  sold: { label: 'Sold', variant: 'error' },
  rented: { label: 'Rented', variant: 'info' },
  hidden: { label: 'Hidden', variant: 'neutral' },
  archived: { label: 'Archived', variant: 'neutral' },
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
  const { mutate: deleteMedia, isPending: isDeletingMedia } = useDeletePropertyMedia(id)
  const { mutate: deleteProperty, isPending: isDeletingProperty } = useDeleteProperty(id, {
    onSuccess: () => navigate('/properties'),
  })
  const updateMedia = useUpdatePropertyMedia(id)
  const uploadMedia = useUploadPropertyMedia(id)
  const [editingMedia, setEditingMedia] = useState(null)

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

  function handleDeleteMedia(mediaId) {
    const confirmed = window.confirm('Delete this media item? This cannot be undone.')
    if (!confirmed) return
    deleteMedia(mediaId)
  }

  function handleDeleteProperty() {
    const confirmed = window.confirm(`Delete ${property.title}? This cannot be undone.`)
    if (!confirmed) return
    deleteProperty()
  }

  async function handleShare() {
    const shareData = { title: property.title, text: property.short_description || property.title, url: window.location.href }
    if (navigator.share) await navigator.share(shareData)
    else {
      await navigator.clipboard.writeText(window.location.href)
      window.alert('Property link copied to clipboard.')
    }
  }

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
              {[property.tole, property.municipality || property.city, property.district, property.province].filter(Boolean).join(', ')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outlined" size="md" leftIcon={<Share2 size={15} />} onClick={handleShare}>
            Share
          </Button>
          <Button
            variant="danger"
            size="md"
            leftIcon={<Trash size={15} />}
            onClick={handleDeleteProperty}
            disabled={isDeletingProperty}
          >
            Delete Property
          </Button>
          <Button variant="primary" size="md" onClick={() => navigate(`/properties/${id}/edit`)}>
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

          <PropertyVerificationPanel propertyId={id} />

          <section className="rounded-2xl border border-[#DDE5E3] bg-white p-5 sm:p-6 space-y-5">
            <SectionTitle icon={<SquareAsterisk size={16} />} title="Property Details" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <DetailItem label="Land Area" value={formatMeasurement(property.land_area_value, property.land_area_unit)} icon={<Maximize2 size={14} />} />
              <DetailItem label="Built-up Area" value={formatMeasurement(property.built_up_area_value, property.built_up_area_unit)} icon={<Maximize2 size={14} />} />
              <DetailItem label="Road Access" value={formatMeasurement(property.road_access_value, property.road_access_unit)} icon={<Maximize2 size={14} />} />
              <DetailItem label="Classification" value={capWords(property.land_use_classification)} icon={<Tag size={14} />} />
              <DetailItem label="Road Type" value={capWords(property.road_type)} icon={<Maximize2 size={14} />} />
              <DetailItem label="Facing" value={capWords(property.facing_direction)} icon={<Home size={14} />} />
              <DetailItem label="Plot Shape" value={capWords(property.plot_shape)} icon={<SquareAsterisk size={14} />} />
              <DetailItem label="Mohada × Pichhad" value={property.mohada_value || property.pichhad_value ? `${property.mohada_value || '—'} × ${property.pichhad_value || '—'} ${property.plot_dimension_unit}` : '—'} icon={<Maximize2 size={14} />} />
              <DetailItem label="Major Route Distance" value={property.major_road_distance_value ? `${property.major_road_distance_value} ${property.major_road_distance_unit} to ${property.nearest_major_road || capWords(property.major_road_type)}` : '—'} icon={<MapPin size={14} />} />
              <DetailItem label="Latitude" value={property.latitude || '—'} icon={<MapPin size={14} />} />
              <DetailItem label="Longitude" value={property.longitude || '—'} icon={<MapPin size={14} />} />
              <DetailItem label="Assigned Agent" value={formatAgent(property.assigned_agent)} icon={<Building2 size={14} />} />
            </div>
            {property.land_area_conversions && <div className="rounded-xl bg-[#F8FAFA] p-4 text-xs text-[#637079]"><strong className="text-[#263238]">Area equivalents:</strong> {['ropani','aana','paisa','daam','bigha','kattha','dhur','sqft','sqm'].map((unit) => property.land_area_conversions[unit] ? `${Number(property.land_area_conversions[unit]).toLocaleString()} ${unit}` : null).filter(Boolean).join(' · ')}</div>}
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[['Per Aana', property.price_per_aana], ['Per Dhur', property.price_per_dhur], ['Per Kattha', property.price_per_kattha], ['Per sq ft', property.price_per_land_sqft]].map(([label, value]) => <MetaItem key={label} label={label} value={value ? formatNpr(value) : '—'} />)}
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {[['Water', property.has_water_supply], ['Electricity', property.has_electricity], ['Drainage', property.has_drainage], ['Sewage', property.has_sewage]].map(([label, value]) => <MetaItem key={label} label={label} value={value == null ? 'Unknown' : value ? 'Available' : 'Not available'} />)}
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
              <p><span className="font-medium text-[#263238]">Municipality:</span> {property.municipality || '—'}</p>
              <p><span className="font-medium text-[#263238]">Ward:</span> {property.ward_number || '—'}</p>
              <p><span className="font-medium text-[#263238]">Tole:</span> {property.tole || '—'}</p>
              <p><span className="font-medium text-[#263238]">Landmark / Chowk:</span> {property.landmark || '—'}</p>
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
            <div className="flex items-center justify-between gap-3"><SectionTitle icon={<Clock3 size={16} />} title="Media" /><label className="cursor-pointer rounded-lg bg-[#eef3f0] px-3 py-2 text-xs font-semibold text-[#496B5A]">{uploadMedia.isPending ? 'Uploading...' : 'Upload media'}<input type="file" accept="image/*,video/mp4,application/pdf" className="hidden" disabled={uploadMedia.isPending} onChange={(event) => { const file = event.target.files?.[0]; if (file) uploadMedia.mutate(file); event.target.value = '' }} /></label></div>
            {property.media?.length ? (
              <div className="grid grid-cols-2 gap-3">
                {property.media.map((mediaItem, index) => (
                  <div key={mediaItem.id || index} className="group relative overflow-hidden rounded-xl border border-[#DDE5E3] bg-[#F8FAFA]">
                    <img src={mediaItem.file} alt={mediaItem.title || `${property.title} media ${index + 1}`} className="h-28 w-full object-cover" />
                    {mediaItem.is_primary && <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[9px] font-bold">Primary</span>}
                    <div className="absolute inset-0 flex items-start justify-end gap-1 bg-black/20 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      {!mediaItem.is_primary && <Button type="button" variant="secondary" size="icon" className="h-8 w-8" onClick={() => updateMedia.mutate({ mediaId: mediaItem.id, payload: { is_primary: true } })} aria-label="Set primary"><Star size={13} /></Button>}
                      <Button type="button" variant="outlined" size="icon" className="h-8 w-8 bg-white" onClick={() => setEditingMedia(mediaItem)} aria-label="Edit media"><Pencil size={13} /></Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="icon"
                        className="h-8 w-8 shadow-md"
                        onClick={() => handleDeleteMedia(mediaItem.id)}
                        disabled={isDeletingMedia}
                        aria-label="Delete media"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#637079]">No media uploaded for this property yet.</p>
            )}
            {editingMedia && <MediaEditDialog media={editingMedia} onClose={() => setEditingMedia(null)} onSave={(payload) => updateMedia.mutate({ mediaId: editingMedia.id, payload }, { onSuccess: () => setEditingMedia(null) })} isSaving={updateMedia.isPending} />}
          </section>
        </aside>
      </div>
    </div>
  )
}

function MediaEditDialog({ media, onClose, onSave, isSaving }) {
  const [form, setForm] = useState({ title: media.title || '', caption: media.caption || '', sort_order: media.sort_order ?? 0, is_primary: Boolean(media.is_primary) })
  return <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/40 p-4" onClick={onClose}><form onSubmit={(event) => { event.preventDefault(); onSave({ ...form, sort_order: Number(form.sort_order) }) }} onClick={(event) => event.stopPropagation()} className="w-full max-w-md space-y-4 rounded-2xl bg-white p-6 shadow-2xl"><div className="flex items-center justify-between"><div><h3 className="font-semibold text-[#263238]">Edit media</h3><p className="text-xs text-[#637079]">Update display order and descriptive metadata.</p></div><button type="button" onClick={onClose}><X size={17} /></button></div><label className="block text-sm font-medium text-[#263238]">Title<input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-[#DDE5E3] px-3 text-sm outline-none focus:border-[#496B5A]" /></label><label className="block text-sm font-medium text-[#263238]">Caption<textarea value={form.caption} onChange={(event) => setForm((current) => ({ ...current, caption: event.target.value }))} rows="3" className="mt-1.5 w-full rounded-lg border border-[#DDE5E3] px-3 py-2 text-sm outline-none focus:border-[#496B5A]" /></label><label className="block text-sm font-medium text-[#263238]">Sort order<input type="number" value={form.sort_order} onChange={(event) => setForm((current) => ({ ...current, sort_order: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-[#DDE5E3] px-3 text-sm" /></label><label className="flex items-center gap-2 text-sm text-[#263238]"><input type="checkbox" checked={form.is_primary} onChange={(event) => setForm((current) => ({ ...current, is_primary: event.target.checked }))} />Use as primary image</label><div className="flex justify-end gap-2"><Button type="button" variant="outlined" onClick={onClose}>Cancel</Button><Button type="submit" loading={isSaving}>Save media</Button></div></form></div>
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
  return `${currency === 'NPR' ? formatNpr(n) : `${currency} ${n.toLocaleString()}`}${suffix}`
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

function capWords(value) {
  return value ? value.split('_').map(cap).join(' ') : '—'
}
