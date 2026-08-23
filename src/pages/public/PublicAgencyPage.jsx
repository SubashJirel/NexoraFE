/* eslint-disable react-refresh/only-export-components */
import { useEffect, useState } from 'react'
import { ArrowRight, Bath, Bed, Building2, MapPin, Search, Star } from 'lucide-react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  usePublicAgencyContact,
  usePublicAgents,
  usePublicProperties,
  usePublicPropertyOptions,
} from '@/hooks/usePublicAgency'
import Avatar from '@/components/ui/Avatar'
import Input from '@/components/ui/Input'
import PhoneInput from '@/components/ui/PhoneInput'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'

export default function PublicAgencyPage() {
  const { agency } = useOutletContext()
  const [filters, setFilters] = useState({ search: '', property_type: '', purpose: '', location: '', ordering: 'latest', page: 1, page_size: 24 })
  const propertiesQuery = usePublicProperties(agency.license_number, filters)
  const optionsQuery = usePublicPropertyOptions(agency.license_number)
  const agentsQuery = usePublicAgents(agency.license_number)
  const propertyPage = propertiesQuery.data || { count: 0, results: [] }
  const properties = propertyPage.results || []
  const agents = agentsQuery.data || []
  const set = (field, value) => setFilters((current) => ({ ...current, [field]: value, page: field === 'page' ? value : 1 }))
  const locationOptions = Object.values(optionsQuery.data?.locations || {}).flat().filter(
    (item, index, all) => all.findIndex((candidate) => candidate.value.toLocaleLowerCase() === item.value.toLocaleLowerCase()) === index
  )

  useEffect(() => {
    document.title = agency.seo_title || `${agency.name} Properties`
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) { meta = document.createElement('meta'); meta.name = 'description'; document.head.appendChild(meta) }
    meta.content = agency.seo_description || agency.about || ''
  }, [agency])

  return (
    <main>
      <section className="relative overflow-hidden bg-[#263238] text-white">
        {agency.cover_image && <img src={agency.cover_image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />}
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">Licensed real-estate professionals</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight sm:text-6xl">Find a property that feels like yours.</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-white/70">{agency.about || `Explore verified listings from ${agency.name}.`}</p>
          <div className="mt-8 flex max-w-2xl rounded-xl bg-white p-2 shadow-2xl">
            <Search size={19} className="ml-2 mt-2.5 text-[#637079]" />
            <input value={filters.search} onChange={(e) => set('search', e.target.value)} placeholder="Search by title or location" className="h-10 min-w-0 flex-1 px-3 text-sm text-[#263238] outline-none" />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl space-y-6 px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-sm font-semibold text-[var(--agency-color)]">Available properties</p><h2 className="mt-1 text-3xl font-bold">Explore our listings</h2></div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <PublicSelect value={filters.property_type} onChange={(e) => set('property_type', e.target.value)} label="All types" options={optionsQuery.data?.property_types} />
            <PublicSelect value={filters.purpose} onChange={(e) => set('purpose', e.target.value)} label="Any purpose" options={optionsQuery.data?.purposes} />
            <PublicSelect value={filters.location} onChange={(e) => set('location', e.target.value)} label="All locations" options={locationOptions} />
            <PublicSelect value={filters.ordering} onChange={(e) => set('ordering', e.target.value)} options={[{ value: 'latest', label: 'Newest' }, { value: 'featured', label: 'Featured' }, { value: 'price_asc', label: 'Price low-high' }, { value: 'price_desc', label: 'Price high-low' }, { value: 'oldest', label: 'Oldest' }]} />
          </div>
        </div>

        {propertiesQuery.isLoading ? <LoadingGrid /> : properties.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {properties.map((property) => <PublicPropertyCard key={property.id} agency={agency} property={property} />)}
          </div>
        ) : <div className="rounded-2xl border border-dashed border-[#B8C9C5] py-20 text-center text-[#637079]">No available properties match your search.</div>}
        {propertyPage.count > 24 && <div className="flex items-center justify-center gap-3"><Button variant="outlined" disabled={!propertyPage.previous} onClick={() => set('page', Math.max(1, filters.page - 1))}>Previous</Button><span className="text-sm text-[#637079]">Page {filters.page} of {Math.ceil(propertyPage.count / 24)}</span><Button variant="outlined" disabled={!propertyPage.next} onClick={() => set('page', filters.page + 1)}>Next</Button></div>}
      </section>

      <section id="agents" className="bg-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <p className="text-sm font-semibold text-[var(--agency-color)]">Meet the team</p><h2 className="mt-1 text-3xl font-bold">Local experts, personal service</h2>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => <Link key={agent.id} to={`/agency/${agency.slug}/agents/${agent.id}`} className="group rounded-2xl border border-[#DDE5E3] p-5 transition hover:-translate-y-1 hover:shadow-lg"><div className="flex items-center gap-4"><Avatar alt={agent.full_name} src={agent.profile_image_url} size="lg" /><div><p className="font-semibold group-hover:text-[var(--agency-color)]">{agent.full_name}</p><p className="text-sm text-[#637079]">{agent.designation || 'Property Advisor'}</p></div></div><p className="mt-4 line-clamp-2 text-sm leading-6 text-[#637079]">{agent.bio || `${agent.years_experience || 0} years of local market experience.`}</p><div className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--agency-color)]">View profile <ArrowRight size={13} /></div></Link>)}
          </div>
        </div>
      </section>

      <ContactSection agency={agency} />
    </main>
  )
}

export function PublicPropertyCard({ agency, property }) {
  const image = property.primary_image?.url || property.media?.find((item) => item.is_primary)?.file || property.media?.[0]?.file
  return (
    <Link to={property.share_slug ? `/agency/${agency.slug}/listings/${property.share_slug}` : `/agency/${agency.slug}/properties/${property.id}`} className="group overflow-hidden rounded-2xl border border-[#DDE5E3] bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-52 bg-[#EEF2F2]">{image ? <img src={image} alt={property.primary_image?.alt_text || property.title} width={property.primary_image?.width || 720} height={property.primary_image?.height || 450} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center text-[#8FAF9B]"><Building2 size={35} /></div>}{property.is_featured && <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-400 px-2 py-1 text-[10px] font-bold"><Star size={10} />Featured</span>}</div>
      <div className="space-y-3 p-5"><div><p className="text-lg font-bold text-[var(--agency-color)]">{formatPrice(property.price, property.currency, property.rent_period)}</p><h3 className="mt-1 line-clamp-1 font-semibold">{property.title}</h3></div><p className="flex items-center gap-1 truncate text-xs text-[#637079]"><MapPin size={12} />{property.location_display}</p><div className="flex gap-4 border-t border-[#EEF2F2] pt-3 text-xs text-[#637079]">{property.bedrooms != null && <span className="flex items-center gap-1"><Bed size={13} />{property.bedrooms}</span>}{property.bathrooms != null && <span className="flex items-center gap-1"><Bath size={13} />{property.bathrooms}</span>}<span className="ml-auto capitalize">For {property.purpose}</span></div></div>
    </Link>
  )
}

function ContactSection({ agency }) {
  const mutation = usePublicAgencyContact(agency.license_number)
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', message: '' })
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  function submit(event) { event.preventDefault(); mutation.mutate(form, { onSuccess: () => setForm({ full_name: '', phone: '', email: '', message: '' }) }) }
  return <section id="contact" className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-2"><div><p className="text-sm font-semibold text-[var(--agency-color)]">Contact us</p><h2 className="mt-1 text-3xl font-bold">Let’s find your next property</h2><p className="mt-4 max-w-lg leading-7 text-[#637079]">Tell us what you are looking for. Our team will respond and create a personalized property shortlist.</p><div className="mt-6 space-y-2 text-sm text-[#637079]">{agency.phone && <p>{agency.phone}</p>}{agency.email && <p>{agency.email}</p>}{agency.address && <p>{agency.address}</p>}</div></div><form onSubmit={submit} className="space-y-4 rounded-2xl border border-[#DDE5E3] bg-white p-6 shadow-sm"><div className="grid gap-4 sm:grid-cols-2"><Input label="Full name" value={form.full_name} onChange={(e) => set('full_name', e.target.value)} required /><PhoneInput label="Phone" value={form.phone} onChange={(value) => set('phone', value)} required /></div><Input label="Email" type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /><Textarea label="Message" rows={4} value={form.message} onChange={(e) => set('message', e.target.value)} /><Button type="submit" size="lg" loading={mutation.isPending}>Send message</Button></form></section>
}

function PublicSelect({ label, options = [], ...props }) { return <select {...props} className="h-10 min-w-0 rounded-lg border border-[#DDE5E3] bg-white px-3 text-xs text-[#637079] outline-none focus:border-[var(--agency-color)]"><option value="">{label}</option>{options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select> }
function LoadingGrid() { return <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <div key={item} className="h-80 animate-pulse rounded-2xl bg-[#EEF2F2]" />)}</div> }
export function formatPrice(value, currency = 'NPR', rentPeriod = '') { const amount = Number(value); const price = Number.isFinite(amount) ? `${currency} ${amount.toLocaleString()}` : `${currency} ${value}`; return `${price}${rentPeriod ? ` / ${rentPeriod}` : ''}` }
