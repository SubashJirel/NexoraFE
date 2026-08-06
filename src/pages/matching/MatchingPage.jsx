import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { useLeads } from '@/hooks/useLeads'
import operationsService from '@/services/operationsService'
import Button from '@/components/ui/Button'
import Select from '@/components/ui/Select'
import { Card } from '@/components/ui/Card'

export default function MatchingPage() {
  const leads = useLeads(); const [leadId, setLeadId] = useState(''); const [matches, setMatches] = useState([]); const [busy, setBusy] = useState(false)
  async function match() { setBusy(true); try { setMatches(await operationsService.matches(leadId)) } finally { setBusy(false) } }
  return <div className="space-y-6"><div><h2 className="text-2xl font-bold text-[#263238]">Smart matching</h2><p className="mt-1 text-sm text-[#637079]">Rank available properties by a lead’s purpose, type, preferred location, and budget.</p></div><Card className="flex flex-col gap-3 sm:flex-row sm:items-end"><Select label="Lead" value={leadId} onChange={(e) => setLeadId(e.target.value)}><option value="">Choose a lead</option>{(leads.data || []).map((lead) => <option key={lead.id} value={lead.id}>{lead.full_name} · {lead.preferred_location || 'Any location'}</option>)}</Select><Button disabled={!leadId} loading={busy} leftIcon={<Sparkles size={16} />} onClick={match}>Find matches</Button></Card><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{matches.map((item) => <Card key={item.property_id}><div className="flex items-start justify-between gap-3"><p className="font-semibold text-[#263238]">{item.title}</p><span className="rounded-full bg-[#eef3f0] px-2.5 py-1 text-xs font-bold text-[#496B5A]">{item.score}%</span></div><p className="mt-2 text-sm text-[#637079]">{item.location}</p><p className="mt-3 font-bold text-[#496B5A]">{item.currency} {Number(item.price).toLocaleString()}</p><div className="mt-4 flex flex-wrap gap-1.5">{item.reasons.map((reason) => <span key={reason} className="rounded bg-[#F2F5F4] px-2 py-1 text-[10px] text-[#637079]">{reason}</span>)}</div></Card>)}</div></div>
}
