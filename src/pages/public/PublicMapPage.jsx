import { useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { usePublicProperties } from '@/hooks/usePublicAgency'
import Input from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatPrice } from './PublicAgencyPage'

export default function PublicMapPage() {
  const { agency } = useOutletContext(); const [location, setLocation] = useState('')
  const query = usePublicProperties(agency.license_number, { location, page_size: 60 })
  if (query.isLoading) return <div className="py-20"><PageSpinner /></div>
  const properties = query.data?.results || []; const focused = properties.find((item) => item.latitude && item.longitude)
  const mapUrl = focused ? `https://www.openstreetmap.org/export/embed.html?bbox=${Number(focused.longitude) - .03}%2C${Number(focused.latitude) - .02}%2C${Number(focused.longitude) + .03}%2C${Number(focused.latitude) + .02}&layer=mapnik&marker=${focused.latitude}%2C${focused.longitude}` : 'https://www.openstreetmap.org/export/embed.html?bbox=80.0%2C26.3%2C88.2%2C30.5&layer=mapnik'
  return <main className="mx-auto max-w-7xl space-y-5 px-4 py-8"><div><h1 className="text-3xl font-black">Map search</h1><p className="mt-1 text-sm text-[#637079]">Explore listings with geocoded locations.</p></div><Input label="Search location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, district, or neighbourhood" /><div className="grid min-h-[600px] gap-5 lg:grid-cols-[380px_1fr]"><div className="max-h-[650px] space-y-3 overflow-y-auto">{properties.map((item) => <Link key={item.id} to={`/agency/${agency.slug}/properties/${item.id}`}><Card className="mb-3"><p className="font-semibold">{item.title}</p><p className="mt-1 flex items-center gap-1 text-xs text-[#637079]"><MapPin size={12} />{item.location_display}</p><p className="mt-2 text-sm font-bold text-[var(--agency-color)]">{formatPrice(item.price, item.currency)}</p></Card></Link>)}</div><iframe title="Property map" src={mapUrl} className="h-[650px] w-full rounded-2xl border border-[#DDE5E3]" /></div></main>
}
