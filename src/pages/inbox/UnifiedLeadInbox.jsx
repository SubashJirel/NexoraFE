import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  CalendarClock, FileText, Home, Inbox, MapPin, MessageSquarePlus,
  Paperclip, Search, Upload, WalletCards,
} from 'lucide-react'
import { useAgents } from '@/hooks/useAgents'
import {
  useCreateInteraction, useLeadWorkspace, useLeads, useUpdateLead,
  useUploadLeadDocument,
} from '@/hooks/useLeads'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Spinner from '@/components/ui/Spinner'
import { LEAD_SOURCES, LEAD_STATUSES, STATUS_MAP } from '@/pages/leads/leadsConstants'
import { cn } from '@/lib/cn'
import { useAuthStore } from '@/store/authStore'

const TABS = [
  ['activity', 'Communication'],
  ['visits', 'Site visits'],
  ['offers', 'Offers'],
  ['documents', 'Documents'],
]

export default function UnifiedLeadInbox() {
  const [searchParams] = useSearchParams()
  const query = useLeads()
  const leads = useMemo(() => query.data || [], [query.data])
  const [selectedId, setSelectedId] = useState(() => {
    const requested = Number(searchParams.get('lead'))
    return Number.isFinite(requested) && requested > 0 ? requested : null
  })
  const [filters, setFilters] = useState({ search: '', source: '', status: '', followUp: '' })
  const filtered = useMemo(() => leads.filter((lead) => {
    if (filters.source && lead.source !== filters.source) return false
    if (filters.status && lead.status !== filters.status) return false
    if (filters.followUp === 'overdue' && (!lead.next_follow_up_at || new Date(lead.next_follow_up_at) >= new Date())) return false
    if (filters.followUp === 'due' && !lead.next_follow_up_at) return false
    if (filters.search) {
      const property = lead.interested_property?.title || ''
      const text = `${lead.full_name} ${lead.phone} ${lead.email} ${property} ${lead.assigned_agent_name}`.toLowerCase()
      if (!text.includes(filters.search.toLowerCase())) return false
    }
    return true
  }), [filters, leads])
  const activeId = selectedId || filtered[0]?.id

  return <div className="grid min-h-[720px] overflow-hidden rounded-2xl border border-[#DDE5E3] bg-white shadow-sm lg:grid-cols-[360px_1fr]">
    <section className={cn('border-r border-[#DDE5E3]', selectedId && 'hidden lg:block')}>
      <LeadFilters filters={filters} setFilters={setFilters} />
      <LeadList leads={filtered} activeId={activeId} onSelect={setSelectedId} loading={query.isLoading} />
    </section>
    <section className={cn(!selectedId && 'hidden lg:block')}>
      {activeId ? <LeadWorkspace leadId={activeId} onBack={() => setSelectedId(null)} /> : <EmptyInbox />}
    </section>
  </div>
}

function LeadFilters({ filters, setFilters }) {
  const set = (field, value) => setFilters((current) => ({ ...current, [field]: value }))
  return <div className="space-y-3 border-b border-[#DDE5E3] p-4">
    <div className="relative"><Search size={15} className="absolute left-3 top-3 text-[#8b969d]" /><input value={filters.search} onChange={(event) => set('search', event.target.value)} placeholder="Search leads or properties..." className="h-10 w-full rounded-lg border border-[#DDE5E3] bg-[#F8FAFA] pl-9 pr-3 text-sm outline-none focus:border-[#496B5A]" /></div>
    <div className="grid grid-cols-3 gap-2">
      <MiniSelect value={filters.source} onChange={(value) => set('source', value)} placeholder="Source" options={LEAD_SOURCES} />
      <MiniSelect value={filters.status} onChange={(value) => set('status', value)} placeholder="Status" options={LEAD_STATUSES} />
      <MiniSelect value={filters.followUp} onChange={(value) => set('followUp', value)} placeholder="Follow-up" options={[{ value: 'due', label: 'Scheduled' }, { value: 'overdue', label: 'Overdue' }]} />
    </div>
  </div>
}

function LeadList({ leads, activeId, onSelect, loading }) {
  if (loading) return <Centered><Spinner /></Centered>
  if (!leads.length) return <Centered>No inquiries match these filters.</Centered>
  return <div className="max-h-[650px] divide-y divide-[#EEF2F2] overflow-y-auto">{leads.map((lead) => <button key={lead.id} type="button" onClick={() => onSelect(lead.id)} className={cn('w-full p-4 text-left transition hover:bg-[#F8FAFA]', String(activeId) === String(lead.id) && 'bg-[#eef3f0]')}>
    <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#263238]">{lead.full_name}</p><p className="mt-0.5 text-xs text-[#637079]">{lead.phone}</p></div>{lead.unread_messages_count > 0 && <span className="rounded-full bg-[#496B5A] px-2 py-0.5 text-[10px] font-bold text-white">{lead.unread_messages_count}</span>}</div>
    <p className="mt-2 truncate text-xs font-medium text-[#496B5A]">{lead.interested_property?.title || 'No property linked'}</p>
    <div className="mt-2 flex flex-wrap items-center gap-2"><Badge size="sm" variant="neutral">{lead.source_display || words(lead.source)}</Badge><Badge size="sm" variant={STATUS_MAP[lead.status]?.badge || 'neutral'}>{lead.status_display || words(lead.status)}</Badge></div>
    <div className="mt-2 flex items-center justify-between text-[10px] text-[#8b969d]"><span>{lead.assigned_agent_name || 'Unassigned'}</span><span>{lead.next_follow_up_at ? `Follow-up ${shortDate(lead.next_follow_up_at)}` : `Last ${shortDate(lead.last_contacted_at)}`}</span></div>
  </button>)}</div>
}

function LeadWorkspace({ leadId, onBack }) {
  const { data, isLoading, isError } = useLeadWorkspace(leadId)
  const [tab, setTab] = useState('activity')
  if (isLoading) return <Centered><Spinner /></Centered>
  if (isError || !data) return <Centered>Unable to load this lead workspace.</Centered>
  const lead = data.lead
  return <div className="flex min-h-[720px] flex-col">
    <div className="border-b border-[#DDE5E3] p-4 sm:p-5">
      <div className="flex items-start gap-3"><button type="button" onClick={onBack} className="mt-1 text-sm text-[#637079] lg:hidden">Back</button><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-bold text-[#263238]">{lead.full_name}</h3><StatusControl lead={lead} /><Badge variant="neutral">{lead.source_display}</Badge></div><p className="mt-1 text-xs text-[#637079]">{lead.phone}{lead.email ? ` · ${lead.email}` : ''}</p></div><AgentAssignment lead={lead} /></div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4"><Summary icon={Home} label="Interested property" value={lead.interested_property?.title || 'Not linked'} detail={lead.interested_property?.location} /><Summary icon={CalendarClock} label="Next follow-up" value={dateTime(lead.next_follow_up_at) || 'Not scheduled'} detail={`Last contact: ${dateTime(lead.last_contacted_at) || 'None'}`} /><Summary icon={MapPin} label="Requirement" value={[words(lead.purpose), words(lead.property_type)].filter(Boolean).join(' · ') || 'Not specified'} detail={lead.preferred_location} /><Summary icon={WalletCards} label="Activity" value={`${lead.site_visits_count} visits · ${lead.offers_count} offers`} detail={`${lead.documents_count} attached documents`} /></div>
    </div>
    <div className="flex border-b border-[#DDE5E3] px-4">{TABS.map(([value, label]) => <button key={value} type="button" onClick={() => setTab(value)} className={cn('mr-5 border-b-2 py-3 text-xs font-semibold', tab === value ? 'border-[#496B5A] text-[#496B5A]' : 'border-transparent text-[#637079]')}>{label}</button>)}</div>
    <div className="flex-1 overflow-y-auto bg-[#F8FAFA] p-4 sm:p-5">
      {tab === 'activity' && <ActivityTab lead={lead} data={data} />}
      {tab === 'visits' && <VisitsTab visits={data.site_visits} />}
      {tab === 'offers' && <OffersTab deals={data.deals} offers={data.offers} />}
      {tab === 'documents' && <DocumentsTab leadId={lead.id} documents={data.documents} />}
    </div>
  </div>
}

function AgentAssignment({ lead }) {
  const role = useAuthStore((state) => state.user?.role)
  const { data: agents = [] } = useAgents()
  const mutation = useUpdateLead(lead.id)
  if (role === 'agent') return <span className="rounded-lg bg-[#F8FAFA] px-3 py-2 text-xs text-[#637079]">{lead.assigned_agent_name || 'Unassigned'}</span>
  return <select aria-label="Assigned agent" value={lead.assigned_agent || ''} onChange={(event) => mutation.mutate({ assigned_agent: event.target.value ? Number(event.target.value) : null })} disabled={mutation.isPending} className="h-9 max-w-44 rounded-lg border border-[#DDE5E3] px-2 text-xs"><option value="">Unassigned</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.full_name}</option>)}</select>
}

function StatusControl({ lead }) {
  const mutation = useUpdateLead(lead.id)
  const options = LEAD_STATUSES.some((status) => status.value === lead.status)
    ? LEAD_STATUSES
    : [{ value: lead.status, label: lead.status_display }, ...LEAD_STATUSES]
  function changeStatus(value) {
    if (value === 'lost') {
      const lostReason = window.prompt('Why was this lead lost?')
      if (!lostReason) return
      mutation.mutate({ status: value, lost_reason: lostReason })
      return
    }
    mutation.mutate({ status: value })
  }
  return <select aria-label="Lead status" value={lead.status} onChange={(event) => changeStatus(event.target.value)} disabled={mutation.isPending} className="h-7 rounded-full border border-[#DDE5E3] bg-white px-2 text-[11px] font-semibold text-[#496B5A]">{options.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select>
}

function ActivityTab({ lead, data }) {
  const [showComposer, setShowComposer] = useState(false)
  const automatedSocialNotes = /^(Inbound|Outbound) (facebook|instagram|whatsapp) message:/i
  const items = [
    ...data.interactions.filter((item) => !automatedSocialNotes.test(item.note || '')).map((item) => ({ id: `interaction-${item.id}`, date: item.created_at, channel: item.interaction_type, direction: item.direction, text: item.note, agent: item.agent_name })),
    ...data.social_messages.map((item) => ({ id: `message-${item.id}`, date: item.sent_at, channel: item.platform, direction: item.direction, text: item.text || `[${item.message_type}]` })),
    ...data.status_history.map((item) => ({ id: `status-${item.id}`, date: item.created_at, channel: 'status', direction: 'internal', text: `${words(item.from_status || 'new')} → ${words(item.to_status)}`, agent: item.changed_by_name })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))
  return <div className="space-y-4"><div className="flex items-center justify-between"><div><h4 className="text-sm font-semibold text-[#263238]">Communication history</h4><p className="text-xs text-[#637079]">Calls, messages, meetings, notes and status changes.</p></div><Button size="sm" leftIcon={<MessageSquarePlus size={14} />} onClick={() => setShowComposer((value) => !value)}>Log contact</Button></div>{showComposer && <CommunicationForm leadId={lead.id} onDone={() => setShowComposer(false)} />}{items.length ? <div className="space-y-2">{items.map((item) => <div key={item.id} className="rounded-xl border border-[#DDE5E3] bg-white p-3"><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><Badge size="sm" variant={item.direction === 'inbound' ? 'info' : item.direction === 'outbound' ? 'success' : 'neutral'}>{words(item.channel)}</Badge><span className="text-[10px] font-semibold uppercase text-[#8b969d]">{words(item.direction)}</span></div><span className="text-[10px] text-[#8b969d]">{dateTime(item.date)}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-[#263238]">{item.text}</p>{item.agent && <p className="mt-1 text-[10px] text-[#8b969d]">Handled by {item.agent}</p>}</div>)}</div> : <Empty text="No communication recorded yet." />}</div>
}

function CommunicationForm({ leadId, onDone }) {
  const [form, setForm] = useState({ interaction_type: 'call', direction: 'outbound', note: '', follow_up_date: '' })
  const mutation = useCreateInteraction(leadId, { onSuccess: onDone })
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }))
  function submit(event) { event.preventDefault(); mutation.mutate({ ...form, follow_up_date: form.follow_up_date || null }) }
  return <form onSubmit={submit} className="grid gap-3 rounded-xl border border-[#DDE5E3] bg-white p-4 sm:grid-cols-2"><select value={form.interaction_type} onChange={(event) => set('interaction_type', event.target.value)} className="h-10 rounded-lg border border-[#DDE5E3] px-3 text-sm"><option value="call">Phone call</option><option value="whatsapp">WhatsApp</option><option value="viber">Viber</option><option value="facebook">Facebook</option><option value="instagram">Instagram</option><option value="email">Email</option><option value="meeting">Meeting</option><option value="walk_in">Walk-in</option><option value="property_portal">Property portal</option><option value="note">Internal note</option></select><select value={form.direction} onChange={(event) => set('direction', event.target.value)} className="h-10 rounded-lg border border-[#DDE5E3] px-3 text-sm"><option value="inbound">Inbound</option><option value="outbound">Outbound</option><option value="internal">Internal note</option></select><textarea required rows="3" value={form.note} onChange={(event) => set('note', event.target.value)} placeholder="What was discussed?" className="rounded-lg border border-[#DDE5E3] p-3 text-sm sm:col-span-2" /><label className="text-xs text-[#637079]">Next follow-up<input type="datetime-local" value={form.follow_up_date} onChange={(event) => set('follow_up_date', event.target.value)} className="mt-1 h-10 w-full rounded-lg border border-[#DDE5E3] px-3 text-sm" /></label><div className="flex items-end justify-end gap-2"><Button type="button" variant="outlined" size="sm" onClick={onDone}>Cancel</Button><Button type="submit" size="sm" loading={mutation.isPending}>Save</Button></div></form>
}

function VisitsTab({ visits }) {
  return <div className="space-y-3"><Header title="Site visits" action="Manage visits" to="/site-visits" />{visits.length ? visits.map((visit) => <div key={visit.id} className="rounded-xl border border-[#DDE5E3] bg-white p-4"><div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold text-[#263238]">{visit.property_title || `Property #${visit.property}`}</p><Badge variant={visit.status === 'completed' ? 'success' : visit.status === 'cancelled' ? 'error' : 'warning'}>{words(visit.status)}</Badge></div><p className="mt-2 text-xs text-[#637079]">{dateTime(visit.scheduled_at)} · {visit.assigned_agent_name || 'Unassigned'}</p>{visit.outcome && <p className="mt-2 text-sm text-[#263238]">Outcome: {visit.outcome}</p>}</div>) : <Empty text="No site visits scheduled." />}</div>
}

function OffersTab({ deals, offers }) {
  return <div className="space-y-3"><Header title="Offers and negotiations" action="Manage offers" to="/offers" />{deals.length ? deals.map((deal) => <div key={deal.id} className="rounded-xl border border-[#DDE5E3] bg-white p-4"><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-[#263238]">{deal.title}</p><p className="mt-1 text-xs text-[#637079]">{deal.property_title || 'No property'} · {money(deal.value, deal.currency)}</p></div><Badge variant={deal.stage === 'closed_won' ? 'success' : 'warning'}>{words(deal.stage)}</Badge></div><div className="mt-3 space-y-2">{offers.filter((offer) => String(offer.deal) === String(deal.id)).map((offer) => <div key={offer.id} className="flex items-center justify-between rounded-lg bg-[#F8FAFA] px-3 py-2 text-xs"><span className="font-semibold text-[#263238]">{money(offer.amount, offer.currency)}</span><span className="text-[#637079]">{words(offer.status)}{offer.terms ? ` · ${offer.terms}` : ''}</span></div>)}</div></div>) : <Empty text="No deal or negotiation has been created for this lead." />}</div>
}

function DocumentsTab({ leadId, documents }) {
  const [showUpload, setShowUpload] = useState(false)
  return <div className="space-y-3"><div className="flex items-center justify-between"><h4 className="text-sm font-semibold text-[#263238]">Attached documents</h4><Button size="sm" leftIcon={<Upload size={13} />} onClick={() => setShowUpload((value) => !value)}>Attach</Button></div>{showUpload && <DocumentUpload leadId={leadId} onDone={() => setShowUpload(false)} />}{documents.length ? documents.map((document) => <a key={document.id} href={document.file_url || document.file} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl border border-[#DDE5E3] bg-white p-4 hover:border-[#496B5A]"><FileText size={18} className="text-[#496B5A]" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-[#263238]">{document.title}</p><p className="text-xs text-[#637079]">{words(document.category)} · {document.uploaded_by_name || 'Agency'}</p></div><Paperclip size={14} className="text-[#8b969d]" /></a>) : <Empty text="No documents attached to this lead." />}</div>
}

function DocumentUpload({ leadId, onDone }) {
  const [form, setForm] = useState({ title: '', category: 'other', description: '', file: null })
  const mutation = useUploadLeadDocument(leadId, { onSuccess: onDone })
  function submit(event) { event.preventDefault(); if (form.file) mutation.mutate(form) }
  return <form onSubmit={submit} className="grid gap-3 rounded-xl border border-[#DDE5E3] bg-white p-4 sm:grid-cols-2"><input required value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Document title" className="h-10 rounded-lg border border-[#DDE5E3] px-3 text-sm" /><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="h-10 rounded-lg border border-[#DDE5E3] px-3 text-sm"><option value="identity">Identity</option><option value="contract">Contract</option><option value="receipt">Receipt</option><option value="ownership">Ownership</option><option value="other">Other</option></select><input required type="file" accept=".pdf,image/jpeg,image/png,image/webp" onChange={(event) => setForm({ ...form, file: event.target.files?.[0] || null })} className="text-xs sm:col-span-2" /><textarea rows="2" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description (optional)" className="rounded-lg border border-[#DDE5E3] p-3 text-sm sm:col-span-2" /><div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="outlined" size="sm" onClick={onDone}>Cancel</Button><Button type="submit" size="sm" loading={mutation.isPending}>Upload</Button></div></form>
}

function Summary({ icon: Icon, label, value, detail }) { return <div className="rounded-xl border border-[#EEF2F2] bg-[#F8FAFA] p-3"><div className="flex items-center gap-2 text-[10px] font-semibold uppercase text-[#8b969d]"><Icon size={13} />{label}</div><p className="mt-2 truncate text-sm font-semibold text-[#263238]">{value}</p>{detail && <p className="mt-1 truncate text-[10px] text-[#637079]">{detail}</p>}</div> }
function Header({ title, action, to }) { return <div className="flex items-center justify-between"><h4 className="text-sm font-semibold text-[#263238]">{title}</h4><Link to={to} className="text-xs font-semibold text-[#496B5A]">{action}</Link></div> }
function MiniSelect({ value, onChange, placeholder, options }) { return <select value={value} onChange={(event) => onChange(event.target.value)} className="h-8 min-w-0 rounded-lg border border-[#DDE5E3] bg-white px-2 text-[11px]"><option value="">{placeholder}</option>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> }
function Centered({ children }) { return <div className="flex min-h-52 items-center justify-center p-6 text-center text-sm text-[#637079]">{children}</div> }
function Empty({ text }) { return <div className="rounded-xl border border-dashed border-[#B8C9C5] bg-white p-8 text-center text-sm text-[#637079]">{text}</div> }
function EmptyInbox() { return <div className="flex min-h-[720px] flex-col items-center justify-center text-center"><Inbox size={30} className="text-[#496B5A]" /><p className="mt-3 font-semibold text-[#263238]">Select a lead</p><p className="text-sm text-[#637079]">The complete inquiry history will appear here.</p></div> }
function words(value) { return value ? String(value).replaceAll('_', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : '' }
function dateTime(value) { return value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '' }
function shortDate(value) { return value ? new Date(value).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'never' }
function money(value, currency = 'NPR') { return value == null ? '—' : `${currency} ${Number(value).toLocaleString('en-IN')}` }
