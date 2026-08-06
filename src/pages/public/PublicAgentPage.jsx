import { Award, BriefcaseBusiness, Languages, MapPin } from 'lucide-react'
import { useOutletContext, useParams } from 'react-router-dom'
import { usePublicAgent } from '@/hooks/usePublicAgency'
import Avatar from '@/components/ui/Avatar'
import { PageSpinner } from '@/components/ui/Spinner'

export default function PublicAgentPage() {
  const { agency } = useOutletContext()
  const { agentId } = useParams()
  const query = usePublicAgent(agency.license_number, agentId)
  if (query.isLoading) return <div className="py-24"><PageSpinner /></div>
  if (query.isError) return <div className="py-24 text-center">Agent profile unavailable.</div>
  const agent = query.data
  return <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6"><div className="grid gap-8 rounded-3xl border border-[#DDE5E3] bg-white p-6 shadow-sm md:grid-cols-[260px_1fr] md:p-10"><div className="text-center"><Avatar alt={agent.full_name} src={agent.profile_image_url} size="xl" className="mx-auto" /><h1 className="mt-4 text-2xl font-bold">{agent.full_name}</h1><p className="text-sm text-[var(--agency-color)]">{agent.designation || 'Property Advisor'}</p><div className="mt-6 space-y-2 text-left text-sm text-[#637079]">{agent.location && <p className="flex items-center gap-2"><MapPin size={14} />{agent.location}</p>}<p className="flex items-center gap-2"><BriefcaseBusiness size={14} />{agent.years_experience || 0} years experience</p><p className="flex items-center gap-2"><Award size={14} />{agent.deals_closed || 0} deals closed</p>{agent.languages?.length > 0 && <p className="flex items-start gap-2"><Languages size={14} className="mt-1" />{agent.languages.join(', ')}</p>}</div></div><div><p className="text-sm font-semibold uppercase tracking-widest text-[var(--agency-color)]">About</p><p className="mt-4 whitespace-pre-line leading-8 text-[#637079]">{agent.bio || 'Contact this agent for personalized property advice.'}</p>{agent.specialties?.length > 0 && <div className="mt-8"><h2 className="font-semibold">Specialties</h2><div className="mt-3 flex flex-wrap gap-2">{agent.specialties.map((item) => <span key={item} className="rounded-full bg-[#eef3f0] px-3 py-1 text-xs font-medium text-[#496B5A]">{item}</span>)}</div></div>}<div className="mt-8 grid grid-cols-2 gap-4"><Metric label="Current listings" value={agent.current_listing_ids?.length || 0} /><Metric label="Sold or rented" value={agent.sold_property_ids?.length || 0} /></div></div></div></main>
}

function Metric({ label, value }) { return <div className="rounded-xl bg-[#F8FAFA] p-4"><p className="text-2xl font-bold text-[var(--agency-color)]">{value}</p><p className="text-xs text-[#637079]">{label}</p></div> }
