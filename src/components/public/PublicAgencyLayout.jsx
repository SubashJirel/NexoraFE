import { Building2, Clock3, Mail, MapPin, Phone } from 'lucide-react'
import { Link, Outlet, useParams } from 'react-router-dom'
import { usePublicAgency } from '@/hooks/usePublicAgency'
import { PageSpinner } from '@/components/ui/Spinner'

export default function PublicAgencyLayout() {
  const { slug } = useParams()
  const query = usePublicAgency(slug)

  if (query.isLoading) return <div className="min-h-screen bg-[#F8FAFA] pt-24"><PageSpinner /></div>
  if (query.isError) return <PublicNotFound />

  const agency = query.data
  const color = agency.primary_color || '#496B5A'

  return (
    <div className="min-h-screen bg-[#F8FAFA] text-[#263238]" style={{ '--agency-color': color }}>
      <header className="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
          <Link to={`/agency/${agency.slug}`} className="flex min-w-0 items-center gap-3">
            {agency.logo ? <img src={agency.logo} alt="" className="h-10 w-10 rounded-lg object-cover" /> : <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--agency-color)] text-white"><Building2 size={19} /></span>}
            <span className="truncate font-bold">{agency.name}</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4 text-sm font-medium">
            <Link to={`/agency/${agency.slug}`} className="hover:text-[var(--agency-color)]">Properties</Link>
            <Link to={`/agency/${agency.slug}/map`} className="hidden hover:text-[var(--agency-color)] sm:block">Map</Link>
            <a href="#agents" className="hidden hover:text-[var(--agency-color)] sm:block">Agents</a>
            <a href="#contact" className="rounded-lg bg-[var(--agency-color)] px-4 py-2 text-white">Contact</a>
          </nav>
        </div>
      </header>

      <Outlet context={{ agency }} />

      <footer className="mt-16 bg-[#263238] text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-2">
          <div><p className="text-lg font-bold">{agency.name}</p><p className="mt-2 max-w-xl text-sm leading-6 text-white/60">{agency.about || 'Professional real-estate service and trusted local property expertise.'}</p></div>
          <div className="grid gap-2 text-sm text-white/70 sm:grid-cols-2">
            {agency.phone && <a href={`tel:${agency.phone}`} className="flex items-center gap-2"><Phone size={14} />{agency.phone}</a>}
            {agency.email && <a href={`mailto:${agency.email}`} className="flex items-center gap-2"><Mail size={14} />{agency.email}</a>}
            {agency.address && <span className="flex items-center gap-2"><MapPin size={14} />{agency.address}</span>}
            {agency.business_hours && <span className="flex items-center gap-2"><Clock3 size={14} />{agency.business_hours}</span>}
          </div>
        </div>
      </footer>
    </div>
  )
}

function PublicNotFound() {
  return <div className="flex min-h-screen items-center justify-center bg-[#F8FAFA] p-6 text-center"><div><Building2 size={40} className="mx-auto text-[#496B5A]" /><h1 className="mt-4 text-2xl font-bold">Agency unavailable</h1><p className="mt-2 text-sm text-[#637079]">This agency page does not exist or its subscription is inactive.</p><Link to="/login" className="mt-5 inline-block text-sm font-semibold text-[#496B5A]">Nexora login</Link></div></div>
}
