import { useState } from 'react'
import {
  X, Phone, Mail, MapPin, Home, DollarSign,
  MessageSquare, Star, Plus, Trash2, Calendar,
  User, Tag, ChevronRight, History, CheckCircle2,
} from 'lucide-react'
import Avatar from '@/components/ui/Avatar'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import Spinner from '@/components/ui/Spinner'
import {
  useInteractions, useCreateInteraction, useDeleteInteraction,
  useInterests,    useCreateInterest,    useDeleteInterest,
  useUpdateLead,
  useLeadTimeline, useCompleteLeadFollowUp,
} from '@/hooks/useLeads'
import {
  STATUS_MAP, LEAD_STATUSES, INTERACTION_TYPES,
  INTEREST_LEVELS, formatBudget,
} from '../leadsConstants'
import { cn } from '@/lib/cn'

// ── Drawer shell ──────────────────────────────────────────────
export default function LeadDrawer({ lead, onClose, onEdit }) {
  const [tab, setTab] = useState('overview')

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[250] bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed right-0 top-0 z-[260] h-screen w-full max-w-lg bg-white shadow-2xl flex flex-col">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-[#DDE5E3] shrink-0">
          <div className="flex items-start gap-3 min-w-0">
            <Avatar alt={lead.full_name} size="lg" />
            <div className="min-w-0">
              <p className="text-base font-semibold text-[#263238] truncate">{lead.full_name}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <StatusBadge status={lead.status} />
                {lead.source && (
                  <span className="text-[10px] font-semibold text-[#8b969d] uppercase tracking-wide">
                    {lead.source.replace('_', ' ')}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button variant="outlined" size="sm" onClick={onEdit}>Edit</Button>
            <button
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-[#637079] hover:bg-[#F8FAFA] transition-colors"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* ── Status stepper ── */}
        <StatusStepper lead={lead} />

        {/* ── Tabs ── */}
        <div className="flex border-b border-[#DDE5E3] px-5 shrink-0">
          {[
            { id: 'overview',     label: 'Overview'     },
            { id: 'interactions', label: 'Interactions' },
            { id: 'interests',    label: 'Interests'    },
            { id: 'timeline',     label: 'Timeline'     },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'px-1 pb-3 pt-3 mr-5 text-sm font-medium border-b-2 transition-colors',
                tab === t.id
                  ? 'border-[#496B5A] text-[#496B5A]'
                  : 'border-transparent text-[#637079] hover:text-[#263238]'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Tab content ── */}
        <div className="hover-scrollbar flex-1 overflow-y-auto">
          {tab === 'overview'     && <OverviewTab     lead={lead} />}
          {tab === 'interactions' && <InteractionsTab lead={lead} />}
          {tab === 'interests'    && <InterestsTab    lead={lead} />}
          {tab === 'timeline'     && <TimelineTab     lead={lead} />}
        </div>
      </div>
    </>
  )
}

// ── Status stepper ────────────────────────────────────────────
function StatusStepper({ lead }) {
  const updateMutation = useUpdateLead(lead.id)
  const pipeline = LEAD_STATUSES
    .filter((status) => !['lost', 'follow_up_later', 'archived'].includes(status.value))
    .map((status) => status.value)
  const currentIdx = pipeline.indexOf(lead.status)

  return (
    <div className="px-5 py-3 bg-[#F8FAFA] border-b border-[#DDE5E3] shrink-0">
      <div className="flex items-center gap-1 overflow-x-auto hover-scrollbar">
        {pipeline.map((s, i) => {
          const info   = STATUS_MAP[s]
          const past   = i < currentIdx
          const active = i === currentIdx
          return (
            <button
              key={s}
              onClick={() => !active && updateMutation.mutate({ status: s })}
              disabled={updateMutation.isPending}
              className={cn(
                'flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0',
                'transition-all duration-150',
                active  && 'bg-[#496B5A] text-white',
                past    && 'bg-[#d5e3da] text-[#496B5A]',
                !active && !past && 'bg-white text-[#8b969d] border border-[#DDE5E3] hover:border-[#496B5A]'
              )}
            >
              {info?.label ?? s}
              {i < pipeline.length - 1 && !active && (
                <ChevronRight size={10} className="text-[#8b969d]" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Overview tab ──────────────────────────────────────────────
function OverviewTab({ lead }) {
  return (
    <div className="p-5 space-y-5">
      {/* Contact */}
      <InfoSection title="Contact">
        <InfoRow icon={Phone}  label="Phone"  value={lead.phone || '—'} />
        <InfoRow icon={Mail}   label="Email"  value={lead.email || '—'} />
        <InfoRow icon={User}   label="Agent"
          value={
            typeof lead.assigned_agent === 'object'
              ? lead.assigned_agent?.full_name
              : lead.assigned_agent || 'Unassigned'
          }
        />
      </InfoSection>

      {/* Requirement */}
      <InfoSection title="Property Requirement">
        <InfoRow icon={Home}       label="Type"     value={lead.property_type || '—'} capitalize />
        <InfoRow icon={Tag}        label="Purpose"  value={lead.purpose       || '—'} capitalize />
        <InfoRow icon={MapPin}     label="Location" value={lead.preferred_location || '—'} />
        <InfoRow icon={DollarSign} label="Budget"
          value={
            lead.budget_min || lead.budget_max
              ? `${formatBudget(lead.budget_min) ?? '—'} – ${formatBudget(lead.budget_max) ?? '—'}`
              : '—'
          }
        />
      </InfoSection>

      {/* Notes */}
      {lead.notes && (
        <InfoSection title="Notes">
          <p className="text-sm text-[#637079] leading-relaxed whitespace-pre-line">{lead.notes}</p>
        </InfoSection>
      )}

      {/* Meta */}
      <InfoSection title="Meta">
        <InfoRow icon={Calendar} label="Created"
          value={lead.created_at
            ? new Date(lead.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '—'}
        />
      </InfoSection>
    </div>
  )
}

function InfoSection({ title, children }) {
  return (
    <div>
      <p className="text-[10px] font-semibold text-[#8b969d] uppercase tracking-wider mb-2">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value, capitalize }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-7 w-7 rounded-lg bg-[#F8FAFA] border border-[#DDE5E3] flex items-center justify-center shrink-0">
        <Icon size={13} className="text-[#637079]" />
      </div>
      <span className="text-xs text-[#8b969d] w-20 shrink-0">{label}</span>
      <span className={cn('text-sm text-[#263238] font-medium', capitalize && 'capitalize')}>{value}</span>
    </div>
  )
}

// ── Interactions tab ──────────────────────────────────────────
function InteractionsTab({ lead }) {
  const { data: items = [], isLoading } = useInteractions(lead.id)
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#263238]">
          Interaction log <span className="text-[#8b969d] font-normal">({items.length})</span>
        </p>
        <Button
          variant="outlined" size="sm"
          leftIcon={<Plus size={13} />}
          onClick={() => setShowForm(true)}
        >
          Log
        </Button>
      </div>

      {showForm && (
        <InteractionForm leadId={lead.id} onDone={() => setShowForm(false)} />
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : items.length === 0 ? (
        <EmptyTab icon={MessageSquare} text="No interactions logged yet." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <InteractionCard key={item.id} item={item} leadId={lead.id} />
          ))}
        </div>
      )}
    </div>
  )
}

function InteractionForm({ leadId, onDone }) {
  const [form, setForm] = useState({
    interaction_type: 'call',
    note:             '',
    follow_up_date:   '',
  })
  const createMutation = useCreateInteraction(leadId, { onSuccess: onDone })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.note.trim()) return
    createMutation.mutate({
      ...form,
      follow_up_date: form.follow_up_date || null,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#F8FAFA] rounded-xl border border-[#DDE5E3] p-4 space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Type"
          size="sm"
          value={form.interaction_type}
          onChange={(e) => setForm((p) => ({ ...p, interaction_type: e.target.value }))}
          disabled={createMutation.isPending}
        >
          {INTERACTION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
          ))}
        </Select>
        <Input
          label="Follow-up Date"
          type="datetime-local"
          size="sm"
          value={form.follow_up_date}
          onChange={(e) => setForm((p) => ({ ...p, follow_up_date: e.target.value }))}
          disabled={createMutation.isPending}
        />
      </div>
      <Textarea
        label="Note *"
        rows={2}
        placeholder="What happened in this interaction?"
        value={form.note}
        onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))}
        disabled={createMutation.isPending}
      />
      <div className="flex gap-2 justify-end">
        <Button variant="outlined" size="sm" type="button" onClick={onDone}>Cancel</Button>
        <Button variant="primary" size="sm" type="submit" loading={createMutation.isPending}>Save</Button>
      </div>
    </form>
  )
}

function InteractionCard({ item, leadId }) {
  const deleteMutation = useDeleteInteraction(leadId, item.id)
  const typeInfo = INTERACTION_TYPES.find((t) => t.value === item.interaction_type)

  return (
    <div className="flex gap-3 group">
      {/* Timeline dot */}
      <div className="flex flex-col items-center">
        <div className="h-7 w-7 rounded-full bg-[#eef3f0] flex items-center justify-center text-base shrink-0">
          {typeInfo?.icon ?? '📝'}
        </div>
        <div className="flex-1 w-px bg-[#DDE5E3] mt-1" />
      </div>

      {/* Content */}
      <div className="pb-4 flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-xs font-semibold text-[#263238]">{typeInfo?.label ?? item.interaction_type}</span>
            {item.agent_name && (
              <span className="text-xs text-[#8b969d]"> · {item.agent_name}</span>
            )}
            <p className="text-[11px] text-[#8b969d] mt-0.5">
              {new Date(item.created_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button
            onClick={() => deleteMutation.mutate()}
            disabled={deleteMutation.isPending}
            className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center rounded text-[#8b969d] hover:text-[#ef4444]"
            aria-label="Delete interaction"
          >
            <Trash2 size={12} />
          </button>
        </div>
        {item.note && (
          <p className="text-sm text-[#637079] mt-1 leading-relaxed">{item.note}</p>
        )}
        {item.follow_up_date && (
          <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-amber-600 bg-amber-50 rounded px-2 py-0.5">
            <Calendar size={10} />
            Follow-up: {new Date(item.follow_up_date).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Interests tab ─────────────────────────────────────────────
function InterestsTab({ lead }) {
  const { data: items = [], isLoading } = useInterests(lead.id)
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="p-5 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-[#263238]">
          Property interests <span className="text-[#8b969d] font-normal">({items.length})</span>
        </p>
        <Button
          variant="outlined" size="sm"
          leftIcon={<Plus size={13} />}
          onClick={() => setShowForm(true)}
        >
          Add
        </Button>
      </div>

      {showForm && (
        <InterestForm leadId={lead.id} onDone={() => setShowForm(false)} />
      )}

      {isLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : items.length === 0 ? (
        <EmptyTab icon={Star} text="No property interests added yet." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <InterestCard key={item.id} item={item} leadId={lead.id} />
          ))}
        </div>
      )}
    </div>
  )
}

function InterestForm({ leadId, onDone }) {
  const [form, setForm] = useState({
    property:       '',
    interest_level: 'medium',
    notes:          '',
  })
  const createMutation = useCreateInterest(leadId, { onSuccess: onDone })

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.property) return
    createMutation.mutate({
      property:       Number(form.property),
      interest_level: form.interest_level,
      notes:          form.notes || null,
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-[#F8FAFA] rounded-xl border border-[#DDE5E3] p-4 space-y-3"
    >
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Property ID *"
          type="number"
          size="sm"
          placeholder="e.g. 42"
          value={form.property}
          onChange={(e) => setForm((p) => ({ ...p, property: e.target.value }))}
          disabled={createMutation.isPending}
        />
        <Select
          label="Interest Level"
          size="sm"
          value={form.interest_level}
          onChange={(e) => setForm((p) => ({ ...p, interest_level: e.target.value }))}
          disabled={createMutation.isPending}
        >
          {INTEREST_LEVELS.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </Select>
      </div>
      <Textarea
        label="Notes"
        rows={2}
        placeholder="Why is this property interesting?"
        value={form.notes}
        onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
        disabled={createMutation.isPending}
      />
      <div className="flex gap-2 justify-end">
        <Button variant="outlined" size="sm" type="button" onClick={onDone}>Cancel</Button>
        <Button variant="primary" size="sm" type="submit" loading={createMutation.isPending}>Save</Button>
      </div>
    </form>
  )
}

function InterestCard({ item, leadId }) {
  const deleteMutation = useDeleteInterest(leadId, item.id)
  const levelInfo = INTEREST_LEVELS.find((l) => l.value === item.interest_level)

  return (
    <div className="group rounded-xl border border-[#DDE5E3] bg-white p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#263238] truncate">
              {item.property_title || `Property #${item.property}`}
            </p>
            <Badge variant={levelInfo?.badge ?? 'neutral'} size="sm">{levelInfo?.label}</Badge>
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {item.property_price && (
              <span className="text-xs text-[#496B5A] font-semibold">{item.property_price}</span>
            )}
            {item.property_location && (
              <span className="text-xs text-[#637079] flex items-center gap-1">
                <MapPin size={10} />{item.property_location}
              </span>
            )}
          </div>
          {item.notes && (
            <p className="text-xs text-[#637079] mt-1.5">{item.notes}</p>
          )}
        </div>
        <button
          onClick={() => deleteMutation.mutate()}
          disabled={deleteMutation.isPending}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 flex items-center justify-center rounded text-[#8b969d] hover:text-[#ef4444] shrink-0"
          aria-label="Delete interest"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  )
}

function TimelineTab({ lead }) {
  const { data, isLoading } = useLeadTimeline(lead.id)
  const [showFollowUp, setShowFollowUp] = useState(false)

  const timeline = [
    ...(data?.interactions || []).map((item) => ({ ...item, kind: 'interaction', date: item.created_at })),
    ...(data?.status_history || []).map((item) => ({ ...item, kind: 'status', date: item.created_at })),
    ...(data?.site_visits || []).map((item) => ({ ...item, kind: 'visit', date: item.scheduled_at || item.created_at })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <div className="space-y-4 p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[#263238]">Complete history</p>
          <p className="text-xs text-[#8b969d]">Interactions, status changes, and site visits.</p>
        </div>
        <Button size="sm" leftIcon={<CheckCircle2 size={13} />} onClick={() => setShowFollowUp((value) => !value)}>Complete follow-up</Button>
      </div>

      {showFollowUp && <CompleteFollowUpForm lead={lead} onDone={() => setShowFollowUp(false)} />}

      {isLoading ? <div className="flex justify-center py-8"><Spinner /></div> : timeline.length ? (
        <div className="space-y-0">
          {timeline.map((item) => <TimelineItem key={`${item.kind}-${item.id}`} item={item} />)}
        </div>
      ) : <EmptyTab icon={History} text="No timeline activity yet." />}
    </div>
  )
}

function CompleteFollowUpForm({ lead, onDone }) {
  const [form, setForm] = useState({ note: 'Follow-up completed.', interaction_type: 'call', next_follow_up_at: '' })
  const mutation = useCompleteLeadFollowUp(lead.id, { onSuccess: onDone })
  function submit(event) {
    event.preventDefault()
    mutation.mutate({ ...form, next_follow_up_at: form.next_follow_up_at ? new Date(form.next_follow_up_at).toISOString() : null })
  }
  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-[#DDE5E3] bg-[#F8FAFA] p-4">
      <div className="grid grid-cols-2 gap-3">
        <Select label="Interaction" size="sm" value={form.interaction_type} onChange={(e) => setForm((value) => ({ ...value, interaction_type: e.target.value }))}>{INTERACTION_TYPES.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</Select>
        <Input label="Next follow-up" size="sm" type="datetime-local" value={form.next_follow_up_at} onChange={(e) => setForm((value) => ({ ...value, next_follow_up_at: e.target.value }))} />
      </div>
      <Textarea label="Completion note" rows={2} value={form.note} onChange={(e) => setForm((value) => ({ ...value, note: e.target.value }))} required />
      <div className="flex justify-end gap-2"><Button type="button" size="sm" variant="outlined" onClick={onDone}>Cancel</Button><Button type="submit" size="sm" loading={mutation.isPending}>Complete</Button></div>
    </form>
  )
}

function TimelineItem({ item }) {
  const config = {
    interaction: { label: item.interaction_type, detail: item.note, color: 'bg-blue-500' },
    status: { label: `${item.from_status || 'New'} → ${item.to_status}`, detail: item.note || `Changed by ${item.changed_by_name || 'system'}`, color: 'bg-amber-500' },
    visit: { label: `Site visit: ${item.status}`, detail: item.property_title || `Property #${item.property}`, color: 'bg-[#496B5A]' },
  }[item.kind]
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center"><span className={cn('mt-1 h-2.5 w-2.5 rounded-full', config.color)} /><span className="h-full w-px bg-[#DDE5E3]" /></div>
      <div className="min-w-0 flex-1 pb-5">
        <div className="flex items-start justify-between gap-2"><p className="text-xs font-semibold capitalize text-[#263238]">{config.label?.replaceAll('_', ' ')}</p><span className="shrink-0 text-[10px] text-[#8b969d]">{item.date ? new Date(item.date).toLocaleString() : ''}</span></div>
        {config.detail && <p className="mt-1 text-xs leading-relaxed text-[#637079]">{config.detail}</p>}
      </div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────
function StatusBadge({ status }) {
  const info = STATUS_MAP[status]
  return (
    <Badge variant={info?.badge ?? 'neutral'} dot size="sm">
      {info?.label ?? status}
    </Badge>
  )
}

function EmptyTab({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <div className="h-12 w-12 rounded-xl bg-[#eef3f0] flex items-center justify-center">
        <Icon size={22} className="text-[#496B5A]" />
      </div>
      <p className="text-sm text-[#637079]">{text}</p>
    </div>
  )
}
