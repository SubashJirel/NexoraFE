import { useState } from 'react'
import {
  Activity, AlertTriangle, Check, Clock3, Gauge, Play, Plus,
  RefreshCw, ShieldAlert, Trash2, UserRoundCheck, UsersRound, X,
} from 'lucide-react'
import { useAgents } from '@/hooks/useAgents'
import {
  useCreateLeadAssignmentRule,
  useDeleteLeadAssignmentRule,
  useLeadAssignmentRules,
  useLeadAutomationDashboard,
  useLeadAutomationEvents,
  useLeadAutomationSettings,
  useLeadDuplicates,
  useReviewLeadDuplicate,
  useRunLeadAutomation,
  useUpdateLeadAssignmentRule,
  useUpdateLeadAutomationSettings,
} from '@/hooks/useLeadAutomation'
import { useProperties } from '@/hooks/useProperties'
import { useAuthStore } from '@/store/authStore'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

const PROPERTY_TYPES = [
  ['house', 'House'], ['land', 'Land'], ['apartment', 'Apartment'],
  ['flat', 'Flat'], ['commercial', 'Commercial'], ['office_space', 'Office space'],
]

export default function LeadAutomationPanel() {
  const role = useAuthStore((state) => state.user?.role)
  const canManage = ['agency_owner', 'agency_manager', 'super_admin'].includes(role)
  const settings = useLeadAutomationSettings()
  const dashboard = useLeadAutomationDashboard()
  const events = useLeadAutomationEvents()
  const duplicates = useLeadDuplicates('pending')
  const run = useRunLeadAutomation()

  if (settings.isLoading || dashboard.isLoading) return <PanelMessage text="Loading automation workspace..." />
  if (settings.isError || dashboard.isError) return <PanelMessage text="Unable to load lead automation." error />

  return <div className="space-y-5">
    <div className="flex flex-col justify-between gap-3 rounded-2xl border border-[#DDE5E3] bg-[#F8FAFA] p-5 sm:flex-row sm:items-center">
      <div>
        <div className="flex items-center gap-2"><Activity size={18} className="text-[#496B5A]" /><h3 className="font-semibold text-[#263238]">Rule-based accountability</h3></div>
        <p className="mt-1 text-sm text-[#637079]">Route every inquiry consistently, measure response time, and surface neglected leads.</p>
      </div>
      {canManage && <Button variant="outlined" onClick={() => run.mutate()} loading={run.isPending}><Play size={14} />Run checks now</Button>}
    </div>

    <Metrics data={dashboard.data} />
    <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
      <AgentAccountability agents={dashboard.data?.agents || []} />
      {settings.data && <SettingsForm key={settings.data.updated_at} initial={settings.data} canManage={canManage} />}
    </div>
    <Rules canManage={canManage} />
    <div className="grid gap-5 xl:grid-cols-2">
      <DuplicateReview items={duplicates.data || []} canManage={canManage} loading={duplicates.isLoading} />
      <RecentEvents items={events.data || []} loading={events.isLoading} />
    </div>
  </div>
}

function Metrics({ data = {} }) {
  const summary = data.summary || {}
  const cards = [
    ['Active leads', summary.active_leads || 0, UsersRound, 'text-[#496B5A]', 'bg-[#eef3f0]'],
    ['Unassigned', summary.unassigned_leads || 0, UserRoundCheck, 'text-amber-700', 'bg-amber-50'],
    ['Response overdue', summary.overdue_responses || 0, Clock3, 'text-red-700', 'bg-red-50'],
    ['Duplicate reviews', summary.pending_duplicates || 0, ShieldAlert, 'text-violet-700', 'bg-violet-50'],
  ]
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, Icon, color, bg]) => <Card key={label} padding="sm" className="flex items-center gap-3"><span className={`rounded-xl p-2.5 ${bg} ${color}`}><Icon size={18} /></span><div><p className="text-2xl font-bold text-[#263238]">{value}</p><p className="text-xs text-[#637079]">{label}</p></div></Card>)}</div>
}

function AgentAccountability({ agents }) {
  return <Card padding="none" className="overflow-hidden">
    <div className="p-5"><CardTitle>Agent accountability</CardTitle><p className="mt-1 text-xs text-[#637079]">Current workload and first-response performance.</p></div>
    <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-sm">
      <thead><tr className="border-y border-[#EEF2F2] bg-[#F8FAFA] text-left text-[11px] uppercase tracking-wide text-[#637079]"><th className="px-5 py-3">Agent</th><th className="px-3 py-3">Active</th><th className="px-3 py-3">Awaiting</th><th className="px-3 py-3">Overdue</th><th className="px-5 py-3">Avg. response</th></tr></thead>
      <tbody>{agents.length ? agents.map((agent) => <tr key={agent.id} className="border-b border-[#EEF2F2] last:border-0"><td className="px-5 py-3 font-semibold text-[#263238]">{agent.name}</td><td className="px-3 py-3">{agent.active_leads}</td><td className="px-3 py-3">{agent.awaiting_response}</td><td className="px-3 py-3"><span className={agent.overdue_responses ? 'font-semibold text-red-600' : ''}>{agent.overdue_responses}</span></td><td className="px-5 py-3 text-[#637079]">{formatDuration(agent.average_response_seconds)}</td></tr>) : <tr><td colSpan="5" className="px-5 py-8 text-center text-[#637079]">No active agents.</td></tr>}</tbody>
    </table></div>
  </Card>
}

function SettingsForm({ initial, canManage }) {
  const [form, setForm] = useState(initial)
  const mutation = useUpdateLeadAutomationSettings()
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const numeric = (key, label, hint) => <Input label={label} type="number" min="1" value={form[key]} onChange={(event) => set(key, Number(event.target.value))} hint={hint} disabled={!canManage} />
  return <Card>
    <CardHeader><div><CardTitle>Automation settings</CardTitle><p className="mt-1 text-xs text-[#637079]">Agency-wide limits and timing.</p></div><Toggle checked={form.is_enabled} onChange={(value) => set('is_enabled', value)} disabled={!canManage} label="Enabled" /></CardHeader>
    <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <Select label="Fallback assignment" value={form.fallback_assignment} onChange={(event) => set('fallback_assignment', event.target.value)} disabled={!canManage}><option value="listing_agent">Listing agent, then round robin</option><option value="round_robin">Round robin</option><option value="unassigned">Leave unassigned</option></Select>
      {numeric('max_active_leads_per_agent', 'Maximum active leads', 'Per agent')}
      {numeric('response_sla_minutes', 'Response SLA (minutes)', 'Response-time target')}
      {numeric('escalation_minutes', 'Escalate after (minutes)', 'Manager and agent alert')}
      {numeric('manager_alert_hours', 'Neglect alert (hours)', 'No agent activity')}
      {numeric('inactive_reassign_hours', 'Reassign after (hours)', 'No agent activity')}
      {numeric('follow_up_reminder_hours', 'Follow-up notice (hours)', 'Before follow-up is due')}
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2"><Toggle checked={form.auto_detect_duplicates} onChange={(value) => set('auto_detect_duplicates', value)} disabled={!canManage} label="Detect duplicate leads" /><Toggle checked={form.auto_reassign_inactive} onChange={(value) => set('auto_reassign_inactive', value)} disabled={!canManage} label="Reassign inactive leads" /></div>
    {canManage && <div className="mt-5 flex justify-end"><Button onClick={() => mutation.mutate(form)} loading={mutation.isPending}>Save settings</Button></div>}
  </Card>
}

const EMPTY_RULE = { name: '', priority: 100, is_active: true, match_property: '', match_location: '', match_property_type: '', assignment_method: 'round_robin', assign_to_agent: '' }

function Rules({ canManage }) {
  const query = useLeadAssignmentRules()
  const { data: agents = [] } = useAgents()
  const { data: properties = [] } = useProperties({})
  const create = useCreateLeadAssignmentRule()
  const update = useUpdateLeadAssignmentRule()
  const remove = useDeleteLeadAssignmentRule()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_RULE)
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const close = () => { setEditing(null); setForm(EMPTY_RULE) }
  const edit = (rule) => { setEditing(rule.id); setForm({ ...EMPTY_RULE, ...rule, match_property: rule.match_property || '', assign_to_agent: rule.assign_to_agent || '' }) }
  const submit = (event) => {
    event.preventDefault()
    const payload = { ...form, priority: Number(form.priority), match_property: form.match_property ? Number(form.match_property) : null, assign_to_agent: form.assign_to_agent ? Number(form.assign_to_agent) : null }
    const options = { onSuccess: close }
    if (editing) update.mutate({ id: editing, payload }, options)
    else create.mutate(payload, options)
  }

  return <Card>
    <CardHeader><div><CardTitle>Assignment rules</CardTitle><p className="mt-1 text-xs text-[#637079]">Lower priority numbers run first. Conditions within a rule must all match.</p></div>{canManage && !editing && <Button size="sm" onClick={() => setEditing('new')}><Plus size={14} />Add rule</Button>}</CardHeader>
    {canManage && editing && <form onSubmit={submit} className="mt-5 rounded-xl border border-[#DDE5E3] bg-[#F8FAFA] p-4">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Input label="Rule name" value={form.name} onChange={(event) => set('name', event.target.value)} required /><Input label="Priority" type="number" min="0" value={form.priority} onChange={(event) => set('priority', event.target.value)} required /><Select label="Property" value={form.match_property} onChange={(event) => set('match_property', event.target.value)}><option value="">Any property</option>{properties.map((property) => <option key={property.id} value={property.id}>{property.title}</option>)}</Select><Input label="Location contains" value={form.match_location} onChange={(event) => set('match_location', event.target.value)} placeholder="e.g. Baneshwor" /><Select label="Property type" value={form.match_property_type} onChange={(event) => set('match_property_type', event.target.value)}><option value="">Any type</option>{PROPERTY_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select><Select label="Assignment method" value={form.assignment_method} onChange={(event) => set('assignment_method', event.target.value)}><option value="round_robin">Round robin</option><option value="listing_agent">Listing agent</option><option value="specific_agent">Specific agent</option></Select>{form.assignment_method === 'specific_agent' && <Select label="Assign to" value={form.assign_to_agent} onChange={(event) => set('assign_to_agent', event.target.value)} required><option value="">Choose agent</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.full_name}</option>)}</Select>}<div className="flex items-end"><Toggle checked={form.is_active} onChange={(value) => set('is_active', value)} label="Rule active" /></div></div>
      <div className="mt-4 flex justify-end gap-2"><Button type="button" variant="outlined" onClick={close}>Cancel</Button><Button type="submit" loading={create.isPending || update.isPending}>{editing === 'new' ? 'Create rule' : 'Save rule'}</Button></div>
    </form>}
    <div className="mt-4 space-y-2">{query.isLoading ? <p className="py-6 text-center text-sm text-[#637079]">Loading rules...</p> : (query.data || []).length ? query.data.map((rule) => <div key={rule.id} className="flex flex-col gap-3 rounded-xl border border-[#EEF2F2] p-4 sm:flex-row sm:items-center"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#eef3f0] text-xs font-bold text-[#496B5A]">{rule.priority}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-[#263238]">{rule.name}</p><Badge variant={rule.is_active ? 'success' : 'neutral'}>{rule.is_active ? 'Active' : 'Paused'}</Badge></div><p className="mt-1 text-xs text-[#637079]">{ruleDescription(rule)}</p></div>{canManage && <div className="flex gap-2"><Button size="sm" variant="outlined" onClick={() => edit(rule)}>Edit</Button><Button size="icon" variant="ghost" aria-label="Delete rule" onClick={() => window.confirm(`Delete ${rule.name}?`) && remove.mutate(rule.id)}><Trash2 size={15} className="text-red-600" /></Button></div>}</div>) : <p className="py-6 text-center text-sm text-[#637079]">No rules yet. The fallback assignment is currently used.</p>}</div>
  </Card>
}

function DuplicateReview({ items, canManage, loading }) {
  const review = useReviewLeadDuplicate()
  return <Card><CardHeader><div><CardTitle>Duplicate review</CardTitle><p className="mt-1 text-xs text-[#637079]">Exact Nepal phone formats, email matches, and likely repeated inquiries.</p></div><Badge variant={items.length ? 'warning' : 'success'}>{items.length} pending</Badge></CardHeader><div className="mt-4 max-h-[360px] space-y-3 overflow-y-auto">{loading ? <p className="py-6 text-center text-sm text-[#637079]">Loading reviews...</p> : items.length ? items.map((item) => <div key={item.id} className="rounded-xl border border-[#EEF2F2] p-4"><div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-[#263238]">{item.lead_name} <span className="font-normal text-[#8b969d]">and</span> {item.candidate_name}</p><Badge variant={item.score >= 100 ? 'error' : 'warning'}>{item.score}%</Badge></div><p className="mt-1 text-xs text-[#637079]">{item.reasons.join(' · ')}</p>{canManage && <div className="mt-3 flex gap-2"><Button size="sm" onClick={() => review.mutate({ id: item.id, status: 'confirmed' })}><Check size={13} />Confirm</Button><Button size="sm" variant="outlined" onClick={() => review.mutate({ id: item.id, status: 'dismissed' })}><X size={13} />Dismiss</Button></div>}</div>) : <p className="py-8 text-center text-sm text-[#637079]">No duplicate leads need review.</p>}</div></Card>
}

function RecentEvents({ items, loading }) {
  return <Card><CardHeader><div><CardTitle>Recent automation activity</CardTitle><p className="mt-1 text-xs text-[#637079]">Assignments, first responses, reminders, and escalations.</p></div><RefreshCw size={16} className="text-[#637079]" /></CardHeader><div className="mt-4 max-h-[360px] space-y-1 overflow-y-auto">{loading ? <p className="py-6 text-center text-sm text-[#637079]">Loading activity...</p> : items.length ? items.slice(0, 30).map((event) => <div key={event.id} className="flex gap-3 border-b border-[#EEF2F2] py-3 last:border-0"><span className={`mt-0.5 rounded-lg p-2 ${event.event_type === 'escalated' || event.event_type === 'neglect_alert' ? 'bg-red-50 text-red-600' : 'bg-[#eef3f0] text-[#496B5A]'}`}>{event.event_type === 'escalated' ? <AlertTriangle size={14} /> : <Gauge size={14} />}</span><div><p className="text-sm font-medium text-[#263238]">{event.summary}</p><p className="mt-0.5 text-[11px] text-[#8b969d]">{formatDate(event.created_at)}</p></div></div>) : <p className="py-8 text-center text-sm text-[#637079]">Automation activity will appear here.</p>}</div></Card>
}

function Toggle({ checked, onChange, label, disabled }) {
  return <label className={`flex items-center gap-2 text-sm font-medium text-[#263238] ${disabled ? 'opacity-60' : 'cursor-pointer'}`}><input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} disabled={disabled} className="h-4 w-4 accent-[#496B5A]" />{label}</label>
}

function PanelMessage({ text, error }) {
  return <div className={`flex min-h-64 items-center justify-center rounded-2xl border border-[#DDE5E3] bg-white text-sm ${error ? 'text-red-600' : 'text-[#637079]'}`}>{text}</div>
}

function ruleDescription(rule) {
  const conditions = [rule.match_property_title, rule.match_location, PROPERTY_TYPES.find(([value]) => value === rule.match_property_type)?.[1]].filter(Boolean)
  const target = rule.assignment_method === 'specific_agent' ? rule.assign_to_agent_name : rule.assignment_method.replace('_', ' ')
  return `${conditions.length ? `When ${conditions.join(' + ')}` : 'All unmatched inquiries'} → ${target}`
}

function formatDuration(seconds) {
  if (!seconds) return 'No responses yet'
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`
  return `${(seconds / 3600).toFixed(1)}h`
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : ''
}
