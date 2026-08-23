import { useEffect, useState } from 'react'
import { Bath, Bed, CalendarDays, Check, Flag, MapPin, Maximize2, Phone, UserRound } from 'lucide-react'
import { useOutletContext, useParams } from 'react-router-dom'
import {
  usePublicInquiry,
  usePublicProperty,
  usePublicPropertyByShareSlug,
  usePublicSiteVisitRequest,
  useSimilarProperties,
} from '@/hooks/usePublicAgency'
import { reportPublicListing, trackPublicPropertyEvent } from '@/services/publicService'
import { PublicPropertyCard, formatPrice } from './PublicAgencyPage'
import Avatar from '@/components/ui/Avatar'
import Input from '@/components/ui/Input'
import PhoneInput from '@/components/ui/PhoneInput'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'

export default function PublicPropertyPage() {
  const { agency } = useOutletContext()
  const { propertyId, shareSlug } = useParams()
  const idQuery = usePublicProperty(agency.license_number, propertyId)
  const slugQuery = usePublicPropertyByShareSlug(agency.slug, shareSlug)
  const query = shareSlug ? slugQuery : idQuery
  const resolvedId = query.data?.id || propertyId
  const similarQuery = useSimilarProperties(agency.license_number, resolvedId)

  useEffect(() => {
    if (!resolvedId) return
    const marker = `nexora_view_${agency.license_number}_${resolvedId}`
    if (!sessionStorage.getItem(marker)) {
      sessionStorage.setItem(marker, '1')
      trackPublicPropertyEvent(agency.license_number, resolvedId, 'view').catch(() => {})
    }
  }, [agency.license_number, resolvedId])

  useEffect(() => {
    if (!query.data) return
    document.title = query.data.seo_title || `${query.data.title} | ${agency.name}`
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
    meta.content = query.data.seo_description || query.data.short_description || agency.seo_description || ''
  }, [agency.name, agency.seo_description, query.data])

  if (query.isLoading) return <div className="py-24"><PageSpinner /></div>
  if (query.isError) return <div className="mx-auto max-w-4xl px-4 py-24 text-center"><h1 className="text-2xl font-bold">Property unavailable</h1></div>
  const property = query.data
  const media = property.media || []

  return (
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6">
      <div className="grid gap-3 overflow-hidden rounded-2xl lg:grid-cols-[2fr_1fr]">
        <Media image={media[0]?.large || media[0]?.original} title={media[0]?.alt_text || property.title} className="h-[420px]" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">{media.slice(1, 3).map((item) => <Media key={item.id} image={item.card || item.large || item.original} title={item.alt_text || item.title || property.title} className="h-[204px]" />)}</div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <div><div><p className="text-sm font-semibold uppercase tracking-wider text-[var(--agency-color)]">{property.display_property_id} · For {property.purpose}</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">{property.title}</h1></div><p className="mt-3 flex items-center gap-2 text-[#637079]"><MapPin size={16} />{property.location_display}</p><p className="mt-5 text-3xl font-black text-[var(--agency-color)]">{formatPrice(property.price, property.currency, property.rent_period)}</p></div>
          <div className="grid grid-cols-2 gap-3 rounded-2xl border border-[#DDE5E3] bg-white p-5 sm:grid-cols-4"><Spec icon={Bed} label="Bedrooms" value={property.bedrooms ?? '—'} /><Spec icon={Bath} label="Bathrooms" value={property.bathrooms ?? '—'} /><Spec icon={Maximize2} label="Built-up area" value={property.built_up_area_value ? `${property.built_up_area_value} ${property.built_up_area_unit}` : '—'} /><Spec icon={Phone} label="Road access" value={property.road_access_value ? `${property.road_access_value} ${property.road_access_unit}` : '—'} /></div>
          {property.verification_summary?.level !== 'unverified' && <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800"><Check size={14} />{property.verification_summary.label} · {property.verification_summary.approved_documents}/{property.verification_summary.total_documents} documents resolved</div>}
          {property.availability_verified_at && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3"><p className="text-sm font-semibold text-emerald-900"><CalendarDays size={15} className="mr-2 inline" />Recently confirmed by {agency.name} on {new Date(property.availability_verified_at).toLocaleDateString()}</p><ReportListing agency={agency} property={property} /></div>}
          {!property.availability_verified_at && <div className="flex justify-end"><ReportListing agency={agency} property={property} /></div>}
          <Section title="Nepal property details">
            <div className="grid gap-3 rounded-2xl border border-[#DDE5E3] bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
              <Fact label="Land classification" value={words(property.land_use_classification)} />
              <Fact label="Administrative location" value={[property.tole, property.municipality, property.ward_number ? `Ward ${property.ward_number}` : '', property.district, property.province].filter(Boolean).join(', ')} />
              <Fact label="Landmark / Chowk" value={property.landmark} />
              <Fact label="Land area" value={property.land_area_value ? `${property.land_area_value} ${property.land_area_unit}` : ''} />
              <Fact label="Road" value={[property.road_access_value ? `${property.road_access_value} ${property.road_access_unit}` : '', words(property.road_type)].filter(Boolean).join(' · ')} />
              <Fact label="Facing / Shape" value={[words(property.facing_direction), words(property.plot_shape)].filter(Boolean).join(' · ')} />
              <Fact label="Mohada × Pichhad" value={property.mohada_value || property.pichhad_value ? `${property.mohada_value || '—'} × ${property.pichhad_value || '—'} ${property.plot_dimension_unit}` : ''} />
              <Fact label="Nearest major route" value={property.major_road_distance_value ? `${property.major_road_distance_value} ${property.major_road_distance_unit} to ${property.nearest_major_road || words(property.major_road_type)}` : ''} />
              <Fact label="Utilities" value={[[property.has_water_supply,'Water'],[property.has_electricity,'Electricity'],[property.has_drainage,'Drainage'],[property.has_sewage,'Sewage']].filter(([available]) => available === true).map(([,label]) => label).join(', ') || 'Not confirmed'} />
              <Fact label="Price / Aana" value={property.price_per_aana ? formatPrice(property.price_per_aana, property.currency) : ''} />
              <Fact label="Price / Dhur" value={property.price_per_dhur ? formatPrice(property.price_per_dhur, property.currency) : ''} />
              <Fact label="Price / Kattha" value={property.price_per_kattha ? formatPrice(property.price_per_kattha, property.currency) : ''} />
            </div>
          </Section>
          <Section title="About this property"><p className="whitespace-pre-line leading-8 text-[#637079]">{property.description || property.short_description}</p></Section>
          {property.amenities && <Section title="Amenities"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{String(property.amenities).split(',').map((item) => item.trim()).filter(Boolean).map((item) => <span key={item} className="flex items-center gap-2 text-sm text-[#637079]"><Check size={14} className="text-[var(--agency-color)]" />{item}</span>)}</div></Section>}
          {(property.video_tour_url || property.virtual_tour_url) && <Section title="Virtual viewing"><a href={property.video_tour_url || property.virtual_tour_url} target="_blank" rel="noreferrer" className="inline-flex rounded-lg bg-[var(--agency-color)] px-4 py-2 text-sm font-semibold text-white">Open property tour</a></Section>}
          {property.latitude && property.longitude && <Section title="Location"><iframe title="Property location" className="h-80 w-full rounded-2xl border border-[#DDE5E3]" src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(property.longitude) - .01}%2C${Number(property.latitude) - .01}%2C${Number(property.longitude) + .01}%2C${Number(property.latitude) + .01}&layer=mapnik&marker=${property.latitude}%2C${property.longitude}`} /></Section>}
          {property.assigned_agent_detail && <Section title="Your property advisor"><div className="flex items-start gap-4 rounded-2xl bg-white p-5"><Avatar size="lg" alt={property.assigned_agent_detail.full_name} src={property.assigned_agent_detail.profile_image} /><div><p className="font-semibold">{property.assigned_agent_detail.full_name}</p><p className="text-sm text-[#637079]">{property.assigned_agent_detail.designation}</p><p className="mt-2 text-sm leading-6 text-[#637079]">{property.assigned_agent_detail.bio}</p></div></div></Section>}
        </div>
        <LeadCapture agency={agency} property={property} />
      </div>

      {similarQuery.data?.length > 0 && <section><h2 className="text-2xl font-bold">Similar properties</h2><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{similarQuery.data.map((item) => <PublicPropertyCard key={item.id} agency={agency} property={item} />)}</div></section>}
    </main>
  )
}

function LeadCapture({ agency, property }) {
  const [mode, setMode] = useState('inquiry')
  const inquiry = usePublicInquiry(agency.license_number, property.id)
  const visit = usePublicSiteVisitRequest(agency.license_number, property.id)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', message: '', preferred_datetime: '' })
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  const mutation = mode === 'inquiry' ? inquiry : visit
  function submit(event) {
    event.preventDefault()
    const payload = mode === 'inquiry' ? { full_name: form.full_name, phone: form.phone, email: form.email, message: form.message } : { ...form, preferred_datetime: new Date(form.preferred_datetime).toISOString() }
    mutation.mutate(payload, { onSuccess: () => setForm({ full_name: '', phone: '', email: '', message: '', preferred_datetime: '' }) })
  }
  const track = (eventType) => trackPublicPropertyEvent(agency.license_number, property.id, eventType).catch(() => {})
  return <aside className="h-fit rounded-2xl border border-[#DDE5E3] bg-white p-5 shadow-lg lg:sticky lg:top-24"><div className="grid grid-cols-2 rounded-lg bg-[#EEF2F2] p-1"><button onClick={() => setMode('inquiry')} className={`rounded-md px-3 py-2 text-xs font-semibold ${mode === 'inquiry' ? 'bg-white text-[var(--agency-color)] shadow-sm' : 'text-[#637079]'}`}>Send inquiry</button><button onClick={() => setMode('visit')} className={`rounded-md px-3 py-2 text-xs font-semibold ${mode === 'visit' ? 'bg-white text-[var(--agency-color)] shadow-sm' : 'text-[#637079]'}`}>Request visit</button></div><form onSubmit={submit} className="mt-5 space-y-4"><Input label="Full name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required /><PhoneInput label="Phone" value={form.phone} onChange={(value) => set('phone', value)} required /><Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} />{mode === 'visit' && <Input label="Preferred date and time" type="datetime-local" value={form.preferred_datetime} onChange={(e) => set('preferred_datetime', e.target.value)} required />}<Textarea label="Message" rows={3} value={form.message} onChange={(e) => set('message', e.target.value)} /><Button type="submit" fullWidth size="lg" loading={mutation.isPending} leftIcon={mode === 'visit' ? <CalendarDays size={16} /> : <UserRound size={16} />}>{mode === 'visit' ? 'Request site visit' : 'Send inquiry'}</Button></form><div className="mt-4 grid grid-cols-2 gap-2">{agency.phone && <a href={`tel:${agency.phone}`} onClick={() => track('call_click')} className="rounded-lg border border-[#DDE5E3] px-3 py-2 text-center text-xs font-semibold text-[var(--agency-color)]">Call agency</a>}{agency.whatsapp_number && <a href={`https://wa.me/${agency.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" onClick={() => track('whatsapp_click')} className="rounded-lg border border-[#DDE5E3] px-3 py-2 text-center text-xs font-semibold text-[var(--agency-color)]">WhatsApp</a>}</div></aside>
}

function Media({ image, title, className }) { return <div className={`${className} overflow-hidden bg-[#EEF2F2]`}>{image?.url ? <img src={image.url} alt={title} width={image.width || 1280} height={image.height || 800} loading="lazy" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-[#8FAF9B]"><Maximize2 size={35} /></div>}</div> }
function Spec({ icon: Icon, label, value }) { return <div><Icon size={17} className="text-[var(--agency-color)]" /><p className="mt-2 text-xs text-[#8b969d]">{label}</p><p className="mt-1 text-sm font-semibold">{value}</p></div> }
function Section({ title, children }) { return <section><h2 className="mb-4 text-xl font-bold">{title}</h2>{children}</section> }
function Fact({ label, value }) { return <div><p className="text-xs text-[#8b969d]">{label}</p><p className="mt-1 text-sm font-semibold">{value || '—'}</p></div> }
function words(value) { return value ? String(value).split('_').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : '' }

function ReportListing({ agency, property }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ reason: '', message: '', full_name: '', email: '' })
  const [status, setStatus] = useState('idle')
  async function submit(event) { event.preventDefault(); setStatus('submitting'); try { await reportPublicListing(agency.slug, property.id, { full_name: form.full_name, email: form.email, message: form.message, metadata: { reason: form.reason }, source_page: window.location.pathname }); setStatus('success') } catch { setStatus('error') } }
  if (!open) return <button type="button" onClick={() => setOpen(true)} className="inline-flex items-center gap-1 text-xs font-semibold text-[#637079]"><Flag size={13} />Report listing</button>
  if (status === 'success') return <p className="text-xs font-semibold text-emerald-800">Thank you. The agency will review your report.</p>
  return <form onSubmit={submit} className="w-full space-y-2 sm:max-w-md"><select required value={form.reason} onChange={(event) => setForm({ ...form, reason: event.target.value })} className="h-9 w-full rounded-lg border border-emerald-200 bg-white px-3 text-xs"><option value="">Why are you reporting this listing?</option><option value="unavailable">No longer available</option><option value="already_sold">Already sold or rented</option><option value="duplicate">Duplicate listing</option><option value="incorrect_information">Incorrect information</option><option value="suspicious">Suspicious listing</option><option value="other">Other</option></select><textarea required rows="2" value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Tell the agency what appears wrong" className="w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-xs" /><div className="grid grid-cols-2 gap-2"><input value={form.full_name} onChange={(event) => setForm({ ...form, full_name: event.target.value })} placeholder="Name (optional)" className="h-9 rounded-lg border border-emerald-200 px-3 text-xs" /><input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email (optional)" className="h-9 rounded-lg border border-emerald-200 px-3 text-xs" /></div>{status === 'error' && <p className="text-xs text-red-700">Unable to send report.</p>}<div className="flex gap-2"><button type="submit" disabled={status === 'submitting'} className="rounded-lg bg-emerald-800 px-3 py-2 text-xs font-semibold text-white">{status === 'submitting' ? 'Sending…' : 'Send report'}</button><button type="button" onClick={() => setOpen(false)} className="text-xs text-[#637079]">Cancel</button></div></form>
}
